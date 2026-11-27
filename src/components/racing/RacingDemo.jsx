import { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { PerformanceMonitor } from '@react-three/drei'
import { EffectComposer, Bloom, Vignette, ToneMapping, ChromaticAberration } from '@react-three/postprocessing'
import { ToneMappingMode } from 'postprocessing'
import * as THREE from 'three'
import { useI18n } from '../../i18n'
import { WORLD_LIST, RACE, FORKS, POWERS, MAX_TIER, FLY_FROM, levelView, tierSpeed } from './racingData'
import { useRacingContentStore, loadRemoteRacing } from './racingContent'
import { createRace, mulberry } from './raceEngine'
import { frame, centerX, centerZ, pitchAt } from './track'
import { currentTrack } from './trackMath'
import { buildTrack, bannerTexture } from './trackBuild'
import { buildRoute, stationTexture, routePoint, ROUTE_PAL } from './routeBuild'
import { buildVehicle, CHARACTERS } from './vehicles'
import { SkyDome, Particles, Flyers, warpOf } from './RaceFx'
import { CollapseLanes, EnergyBurst, Rivals, Pickups } from './RaceEvents'
import { joinRoom, newCode, netAvailable, applyState } from './racingNet'
import { useAuthStore } from '../../stores/useAuthStore'
import { Mesher } from '../vr/campus/mesher'
import RacingGarage from './RacingGarage'
import RacingMenu from './RacingMenu'
import { useRacingStore, levelUnlocked } from '../../stores/useRacingStore'
import { initAudio, startMusic, stopMusic, setMusicTier, setMusicOn, duck, sfx, loadPrefs, savePrefs } from './racingAudio'
import { speak, stopVoice, setVoiceOn, onDuck, voiceSupported, voiceOn, LINES } from './racingVoice'
import { tt, speechLang, worldText, missionText, tierName, qText, okText, factText, optText, deepText, missionStory } from './racingI18n'

// ─────────────────────────────────────────────────────────────────────────────
// OLIVER RACING: carrera estilo Tux Racer. Eliges un MUNDO (profesión) y tu vehículo en el GARAJE (14 niveles, personalizables); la partida son
// 3 MISIONES con su historia, 12 bifurcaciones y una pista larga con subidas y bajadas. CONTROL MANUAL: aceleras (W / ↑ o el botón), frenas,
// giras y derrapas. Antes de cada bifurcación el vehículo espera a que el locutor lea la pregunta completa. Acertar da turbo y sube un nivel SIN
// detenerte; la trampa baja uno y abre una ventana. En ambos casos puedes "Visitar la ruta de repaso": una pista aparte con la explicación
// detallada por estaciones, y luego vuelves a la carrera. Al empezar cada misión eliges un poder. Los niveles 10+ vuelan. La lógica vive en
// raceEngine.js (sin React).
// ─────────────────────────────────────────────────────────────────────────────
const SOLID = new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 0.9 })
const GLOW = new THREE.MeshBasicMaterial({ vertexColors: true, toneMapped: false })
const T1 = { x: 0, y: 0, z: 0, yaw: 0 }, T2 = { x: 0, y: 0, z: 0, yaw: 0 }, T3 = { x: 0, y: 0, z: 0, yaw: 0 }, R1 = { x: 0, y: 0, z: 0 }, R2 = { x: 0, y: 0, z: 0 }
const V3 = new THREE.Vector3(), COL = new THREE.Color(), HSL = { h: 0, s: 0, l: 0 }
const LETTERS = ['A', 'B', 'C']
const hash = (a, b) => { const s = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return s - Math.floor(s) }
let UID = 0
const uid = () => ++UID // claves únicas para tarjetas, avisos y carreras
const isTouch = () => typeof matchMedia !== 'undefined' && matchMedia('(pointer: coarse)').matches

// Montañas lejanas que siguen a la cámara; su tinte se funde con la niebla de la misión
function Backdrop({ game, world }) {
  const group = useRef(), mat = useRef()
  const geo = useMemo(() => {
    const M = new Mesher()
    for (let i = 0; i < 46; i++) { const a = (i / 46) * Math.PI * 2, r = 540 + hash(i, 1) * 70, h = 70 + hash(i, 2) * 170; M.cone(Math.sin(a) * r, 0, Math.cos(a) * r, 95 + hash(i, 3) * 80, h, 5, i % 3 ? '#ffffff' : '#dddddd', hash(i, 4) * 3) }
    for (let i = 0; i < 30; i++) { const a = (i / 30) * Math.PI * 2 + 0.05, r = 470 + hash(i, 5) * 40; M.cone(Math.sin(a) * r, 0, Math.cos(a) * r, 55 + hash(i, 6) * 45, 30 + hash(i, 7) * 60, 4, '#c4c4c4', hash(i, 8) * 3) }
    return M.build()
  }, [])
  useEffect(() => () => geo.dispose(), [geo])
  useFrame((state) => {
    const c = state.camera, fogHex = game.detour ? ROUTE_PAL.fog : world.missions[game.mission].pal.fog
    frame(game.s, 0, 0, T3)
    group.current.position.set(c.position.x, (game.detour ? 0 : T3.y) - 45, c.position.z)
    mat.current.color.lerp(COL.set(fogHex).multiplyScalar(0.82), 0.05)
  })
  return <group ref={group}><mesh geometry={geo} frustumCulled={false}><meshBasicMaterial ref={mat} vertexColors fog={false} /></mesh></group>
}

// Carteles con las respuestas de la bifurcación actual, colgados del pórtico (uno por carril)
function ForkSigns({ gantry, opts, color }) {
  const textures = useMemo(() => opts.map((t, i) => bannerTexture(LETTERS[i], t, color)), [opts, color])
  useEffect(() => () => textures.forEach((t) => t.dispose()), [textures])
  const w = opts.length === 3 ? 5 : 7.4
  return gantry.lanes.slice(0, opts.length).map((l, i) => (
    <mesh key={i} position={[l.x, l.y, l.z]} rotation={[0, l.yaw, 0]}>
      <planeGeometry args={[w, w / 3.2]} /><meshBasicMaterial map={textures[i]} toneMapped={false} />
    </mesh>
  ))
}

// La ruta de repaso: avenida con una estación (cartel enorme) por cada tramo de la explicación
function RouteWorld({ world, route, backText }) {
  const geo = useMemo(() => buildRoute(world, route.texts.length), [world, route.texts.length])
  const textures = useMemo(() => route.texts.map((t) => stationTexture(t, world.color)), [route.texts, world.color])
  const endTex = useMemo(() => bannerTexture('', backText, world.color), [backText, world.color])
  useEffect(() => () => { geo.solidChunks.forEach((g) => g.dispose()); geo.glowChunks.forEach((g) => g.dispose()) }, [geo])
  useEffect(() => () => { textures.forEach((t) => t.dispose()); endTex.dispose() }, [textures, endTex])
  return (
    <>
      {geo.solidChunks.map((g, i) => <mesh key={`s${i}`} geometry={g} material={SOLID} />)}{geo.glowChunks.map((g, i) => <mesh key={`g${i}`} geometry={g} material={GLOW} />)}
      {geo.boards.map((b, i) => <mesh key={i} position={[b.x, b.y, b.z]}><planeGeometry args={[b.w, b.h]} /><meshBasicMaterial map={textures[i]} toneMapped={false} /></mesh>)}
      <mesh position={[geo.endBoard.x, geo.endBoard.y, geo.endBoard.z]}><planeGeometry args={[geo.endBoard.w, geo.endBoard.h]} /><meshBasicMaterial map={endTex} toneMapped={false} /></mesh>
    </>
  )
}

function RaceScene({ run, input, lang, route, backText, onHud, onEvent, onFinish, onDpr }) {
  const { world, game } = run
  const track = useMemo(() => buildTrack(world, game.forks, game.missionStarts), [world, game])
  const textures = useMemo(() => track.banners.map((b) => bannerTexture(b.label, b.text, b.color)), [track])
  const [tier, setTier] = useState(game.tier)
  const [sign, setSign] = useState(null)
  const model = useMemo(() => buildVehicle(world.tiers[tier].kind, world.color, world.emblem, run.custom), [world, tier, run.custom])
  const vehicle = useRef(), shadow = useRef(), bg = useRef(), fog = useRef(), hemi = useRef(), dir = useRef()
  const sunTarget = useMemo(() => new THREE.Object3D(), [])
  const bloomRef = useRef(), chromaRef = useRef(), vigRef = useRef()
  const netAcc = useRef(0), shown = useRef(game.tier), shownSign = useRef(-1), acc = useRef(0), first = useRef(true), sent = useRef(false), roll = useRef(0), wasDetour = useRef(false)
  const pal0 = world.missions[0].pal

  useEffect(() => () => { textures.forEach((t) => t.dispose()); for (const k of ['geos', 'glowGeos', 'solidChunks', 'glowChunks']) track[k].forEach((g) => g.dispose()); track.forkSegs.forEach((sg) => sg.geo.dispose()) }, [textures, track])
  useEffect(() => () => { model.solid?.dispose(); model.glow?.dispose() }, [model])
  useEffect(() => { if (vehicle.current) vehicle.current.rotation.order = 'YXZ' }, [])

  useFrame((state, dtRaw) => {
    const dt = Math.min(dtRaw, 0.05), inp = input.current, d = game.detour
    game.step(dt, { steer: (inp.right ? 1 : 0) - (inp.left ? 1 : 0), throttle: inp.gas ? 1 : 0, brake: inp.brake ? 1 : 0, drift: inp.drift })
    for (const e of game.drain()) onEvent(e)
    if (game.tier !== shown.current) { shown.current = game.tier; setTier(game.tier); setMusicTier(game.tier) }

    const v = vehicle.current, cam = state.camera
    if (d) { // en la ruta de repaso: avenida recta aparte
      routePoint(d.rs, d.ru, R1)
      roll.current += (0 - roll.current) * Math.min(1, 10 * dt)
      if (v) { v.position.set(R1.x, 0.1, R1.z); v.rotation.set(0, -d.uv * 0.03, -d.uv * 0.025) }
      routePoint(d.rs - 13, d.ru * 0.7, R1); routePoint(d.rs + 16, d.ru * 0.9, R2)
      if (!wasDetour.current) { cam.position.set(R1.x, 5.4, R1.z); wasDetour.current = true } else cam.position.lerp(V3.set(R1.x, 5.4, R1.z), 1 - Math.exp(-7 * dt))
      cam.lookAt(R2.x, 1.5, R2.z); cam.fov = 60 + Math.min(32, d.v * 0.11); cam.updateProjectionMatrix()
      if (shadow.current) shadow.current.visible = false
    } else {
      if (wasDetour.current) { wasDetour.current = false; first.current = true }
      frame(game.s, game.u, 0, T1)
      const alt = game.alt
      if (v) {
        const spin = game.crash > 0 ? Math.sin(game.crash * 9) * 0.7 : 0
        roll.current += ((game.drifting ? Math.sign(game.uv || 1) * 0.42 : 0) - roll.current) * Math.min(1, 10 * dt)
        const bank = alt > 2 ? -game.uv * 0.05 : 0 // los aviones se inclinan al girar
        v.position.set(T1.x, T1.y + alt + (game.crash > 0 ? Math.abs(Math.sin(game.crash * 12)) * 0.4 : 0), T1.z)
        v.rotation.set(pitchAt(game.s), T1.yaw - game.uv * 0.03 + spin - roll.current, -game.uv * 0.025 - roll.current * 0.25 + bank)
      }
      if (shadow.current) { shadow.current.visible = alt > 0.6; shadow.current.position.set(T1.x, T1.y + 0.08, T1.z); shadow.current.scale.setScalar(1 + alt * 0.04) }
      const sp = game.v, back = 13 + Math.min(11, sp * 0.035), ahead = 16 + Math.min(40, sp * 0.1) // a más velocidad, la cámara se aleja y mira más lejos
      frame(game.s - back, game.u * 0.7, 5.4 + alt * 0.7 + Math.min(2, sp * 0.006), T2); frame(game.s + ahead, game.u * 0.9, 1.5 + alt * 0.4, T3)
      if (first.current) { cam.position.set(T2.x, T2.y, T2.z); first.current = false } else cam.position.lerp(V3.set(T2.x, T2.y, T2.z), 1 - Math.exp(-(7 + sp * 0.12) * dt))
      if (game.crash > 0) cam.position.add(V3.set((Math.random() - 0.5) * 0.5, (Math.random() - 0.5) * 0.4, 0))
      cam.lookAt(T3.x, T3.y, T3.z)
      cam.fov = 60 + Math.min(32, game.v * 0.11) + Math.min(1, game.boost) * 13 + alt * 0.6; cam.updateProjectionMatrix()
    }

    if (dir.current && v) { dir.current.position.set(v.position.x + 55, v.position.y + 90, v.position.z + 35); sunTarget.position.copy(v.position); sunTarget.updateMatrixWorld() } // las sombras cubren solo el entorno del vehículo
    // el ambiente (cielo, niebla, luz) se funde hacia el de la misión (o el de la ruta de repaso)
    const pal = d ? ROUTE_PAL : world.missions[game.mission].pal, k = 1 - Math.exp(-1.6 * dt)
    const w = d ? 0 : warpOf(game.v)
    if (bg.current) bg.current.lerp(COL.set(pal.sky).lerp(WARP_BG, w), k)
    if (bloomRef.current) bloomRef.current.intensity = 0.8 + w * 1.4 + Math.min(1, game.boost) * 0.4
    if (vigRef.current) vigRef.current.darkness = 0.55 + w * 0.4
    if (chromaRef.current) chromaRef.current.offset.set(0.0004 + w * 0.0026 + Math.min(1, game.boost) * 0.001, 0.0004 + w * 0.0026)
    if (w > 0.2 && !d) cam.position.add(V3.set((Math.random() - 0.5) * 0.12 * w, (Math.random() - 0.5) * 0.1 * w, 0)) // vibración del vehículo a toda velocidad
    if (fog.current) { fog.current.color.lerp(COL.set(pal.fog).lerp(WARP_FOG, w * 0.8), k); const sv = d ? 60 : game.v; fog.current.near = 70 + sv * 0.5; fog.current.far = 360 + sv * 2.6 } // la lejanía crece con la velocidad
    const lum = COL.set(pal.sky).getHSL(HSL).l
    if (hemi.current) hemi.current.intensity += ((d ? 1.4 : 0.5 + lum * 0.75) - hemi.current.intensity) * k
    if (dir.current) dir.current.intensity += ((d ? 1.2 : 0.45 + lum * 1.5) - dir.current.intensity) * k

    if (run.net) { // en línea: ~8 veces por segundo mando mi posición
      netAcc.current += dt
      if (netAcc.current > 0.12) { netAcc.current = 0; run.net.sendState({ id: run.myId, s: game.s, u: game.u, tier: game.tier, fin: game.finished, t: game.finishTime }) }
    }
    acc.current += dt
    if (acc.current > 0.1) {
      acc.current = 0
      const f = game.question(), cur = game.forks[game.idx]
      const sid = !d && cur && cur.q && cur.revealed && game.s < cur.start + RACE.forkLen + 20 ? cur.id : -1
      if (sid !== shownSign.current) { shownSign.current = sid; setSign(sid >= 0 ? { id: sid, opts: cur.q.opts.map((_, i) => optText(lang, cur.q, i)) } : null) }
      onHud({ speed: d ? d.v : game.v, tier: game.tier, correct: game.correct, wrong: game.wrong, score: game.score, s: game.s, L: game.L, q: f, qIdx: game.idx, dist: game.forkDistance(), msg: game.msg, time: game.time, boost: game.boost > 0, fxOk: game.fxOk, mission: game.mission, holding: d ? d.holding : game.holding, drifting: game.drifting, driftT: game.driftT, results: game.results.slice(), powers: game.powers.slice(), hintFor: game.hintFor, alt: game.alt, vmax: tierSpeed(game.tier) * 1.45, startIn: game.startIn, rank: game.rivals.length ? game.rank() : 0, board: game.rivals.length ? game.board() : null, detour: d ? { si: d.si, n: d.stations.length, holding: d.holding } : null })
    }
    if (game.finished && game.finishT > 1.8 && !sent.current) { sent.current = true; onFinish({ correct: game.correct, wrong: game.wrong, score: game.score, time: game.time, tier: game.tier, maxTier: game.maxTier, rank: game.rivals.length ? game.rank() : 0, total: game.rivals.length + 1 }) }
  })

  return (
    <>
      <color ref={bg} attach="background" args={[pal0.sky]} />
      <fog ref={fog} attach="fog" args={[pal0.fog, 70, 360]} />
      <hemisphereLight ref={hemi} args={['#ffffff', pal0.ground2, 1.2]} />
      <primitive object={sunTarget} />
      <directionalLight ref={dir} target={sunTarget} position={[60, 120, 40]} intensity={1.5} color="#fff4dd" castShadow shadow-mapSize={[1024, 1024]} shadow-camera-left={-46} shadow-camera-right={46} shadow-camera-top={46} shadow-camera-bottom={-46} shadow-camera-near={5} shadow-camera-far={260} shadow-bias={-0.0006} shadow-normalBias={0.08} />
      <SkyDome game={game} world={world} />
      <Backdrop game={game} world={world} />
      <PerformanceMonitor onChange={({ factor }) => onDpr(0.8 + 0.8 * factor)} />
      {track.geos.map((g, i) => <mesh key={`r${i}`} geometry={g} material={SOLID} receiveShadow />)}
      {track.glowGeos.map((g, i) => <mesh key={`g${i}`} geometry={g} material={GLOW} />)}
      {track.solidChunks.map((g, i) => <mesh key={`s${i}`} geometry={g} material={SOLID} castShadow receiveShadow />)}
      {track.glowChunks.map((g, i) => <mesh key={`e${i}`} geometry={g} material={GLOW} />)}
      <CollapseLanes game={game} segs={track.forkSegs} material={SOLID} />
      <EnergyBurst game={game} />
      <Pickups game={game} world={world} />
      {game.rivals.length > 0 && <Rivals game={game} world={world} solid={SOLID} glow={GLOW} />}
      <Particles game={game} world={world} />
      <Flyers game={game} world={world} />
      {track.banners.map((b, i) => (
        <mesh key={`b${i}`} position={[b.x, b.y, b.z]} rotation={[0, b.yaw, 0]}>
          <planeGeometry args={[b.w, b.h]} /><meshBasicMaterial map={textures[i]} toneMapped={false} />
        </mesh>
      ))}
      {sign && <ForkSigns key={sign.id} gantry={track.gantries[sign.id]} opts={sign.opts} color={world.missions[game.mission].pal.accent} />}
      {route && <RouteWorld key={route.id} world={world} route={route} backText={backText} />}
      <mesh ref={shadow} rotation={[-Math.PI / 2, 0, 0]} visible={false} renderOrder={2}><circleGeometry args={[1.8, 20]} /><meshBasicMaterial color="#000" transparent opacity={0.35} depthWrite={false} /></mesh>
      <group ref={vehicle} scale={1.5}>
        {model.solid && <mesh geometry={model.solid} material={SOLID} castShadow />}
        {model.glow && <mesh geometry={model.glow} material={GLOW} />}
      </group>
      <EffectComposer multisampling={0}>
        <Bloom ref={(e) => { bloomRef.current = e }} intensity={0.8} luminanceThreshold={0.7} luminanceSmoothing={0.25} mipmapBlur />
        <ChromaticAberration ref={(e) => { chromaRef.current = e }} offset={CHROMA0} radialModulation modulationOffset={0.3} />
        <Vignette ref={(e) => { vigRef.current = e }} offset={0.3} darkness={0.55} />
        <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
      </EffectComposer>
    </>
  )
}

const newSeed = () => Math.floor(Math.random() * 4294967295)
const AI_BOTS = [{ name: 'Rayo', skill: 0.55, color: '#f59e0b' }, { name: 'Turbo', skill: 0.7, color: '#ef4444' }, { name: 'Nube', skill: 0.85, color: '#a78bfa' }]
const CHAR_IDS = CHARACTERS.map((c) => c.id)
const WARP_BG = new THREE.Color('#14052e'), WARP_FOG = new THREE.Color('#5b1a8c'), CHROMA0 = new THREE.Vector2(0.0004, 0.0004)
// Líneas de velocidad en pantalla: rayos que salen del centro y giran, más intensos con la velocidad (y con el turbo)
function SpeedFx({ speed, boost }) {
  const k = Math.max(0, Math.min(1, (speed * 3.6 - 220) / 800)) + (boost ? 0.3 : 0)
  if (k < 0.03) return null
  const mask = 'radial-gradient(circle, transparent 30%, #000 75%)'
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" style={{ opacity: Math.min(1, k) }}>
      <style>{'@keyframes spinlines{from{transform:translate(-50%,-50%) rotate(0deg)}to{transform:translate(-50%,-50%) rotate(7deg)}}'}</style>
      <div className="absolute left-1/2 top-1/2 h-[230%] w-[230%]" style={{ background: 'repeating-conic-gradient(from 0deg, transparent 0deg 3deg, rgba(255,255,255,.4) 3deg 3.5deg, transparent 3.5deg 7deg)', WebkitMaskImage: mask, maskImage: mask, animation: `spinlines ${Math.max(0.25, 1.3 - k).toFixed(2)}s linear infinite` }} />
    </div>
  )
}
const kmh = (v) => Math.round(v * 3.6)
// Velocímetro de arco con aguja: se enciende en ámbar al derrapar y en amarillo con turbo
function Speedo({ speed, boost, drifting, color, vmax }) {
  const need = kmh(vmax || 0), max = need > 1800 ? 3600 : need > 900 ? 1800 : need > 450 ? 900 : 450, v = Math.min(max, kmh(speed)), ang = Math.PI * (1 - v / max) // 180° → 0°
  const pt = (a, r) => `${(100 + Math.cos(a) * r).toFixed(1)},${(100 - Math.sin(a) * r).toFixed(1)}`
  const arc = (a0, a1, r) => `M ${pt(a0, r)} A ${r} ${r} 0 0 1 ${pt(a1, r)}`
  const live = boost ? '#fde047' : drifting ? '#fb923c' : color
  return (
    <svg viewBox="0 0 200 118" className="h-28 w-48 drop-shadow-[0_0_8px_rgba(0,0,0,0.6)]">
      <path d={arc(Math.PI, 0, 86)} fill="none" stroke="#ffffff22" strokeWidth="11" strokeLinecap="round" />
      <path d={arc(Math.PI, ang, 86)} fill="none" stroke={live} strokeWidth="11" strokeLinecap="round" style={{ filter: `drop-shadow(0 0 6px ${live})` }} />
      {[0, 1, 2, 3, 4, 5, 6].map((i) => { const t = (i * max) / 6, a = Math.PI * (1 - t / max); return <g key={t}><line x1={pt(a, 70).split(',')[0]} y1={pt(a, 70).split(',')[1]} x2={pt(a, 76).split(',')[0]} y2={pt(a, 76).split(',')[1]} stroke="#ffffff88" strokeWidth="2" /></g> })}
      <line x1="100" y1="100" x2={pt(ang, 66).split(',')[0]} y2={pt(ang, 66).split(',')[1]} stroke="#fff" strokeWidth="3" strokeLinecap="round" />
      <circle cx="100" cy="100" r="6" fill={live} />
      <text x="100" y="84" textAnchor="middle" fontSize="30" fontWeight="900" fill="#fff" fontFamily="Arial">{kmh(speed)}</text>
      <text x="100" y="114" textAnchor="middle" fontSize="11" fontWeight="700" fill="#ffffffaa" fontFamily="Arial">km/h</text>
    </svg>
  )
}
const fmtTime = (t) => `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}`

// Minimapa: la pista vista desde arriba con las bifurcaciones (verde = acertada, roja = fallada) y tu posición
function Minimap({ game, hud, color }) {
  const L = game.L, K = 60, tid = currentTrack()
  // la pista curva se encaja en el cuadro: x centrada y escalada si se sale, y = distancia recorrida hacia delante
  const map = useMemo(() => {
    let lo = Infinity, hi = -Infinity
    for (let s = 0; s <= L; s += 90) { const x = centerX(s); lo = Math.min(lo, x); hi = Math.max(hi, x) }
    const kx = Math.min(1.2, 78 / Math.max(1, hi - lo)), mid = (lo + hi) / 2
    const pt = (s) => ({ x: (centerX(s) - mid) * kx, y: -centerZ(s) / K })
    const pts = []; for (let s = 0; s <= L; s += 90) { const p = pt(s); pts.push(`${p.x.toFixed(1)},${p.y.toFixed(1)}`) }
    return { pt, path: pts.join(' ') }
  }, [L, tid]) // eslint-disable-line react-hooks/exhaustive-deps -- tid = qué pista está cargada
  const path = map.path, me = map.pt(hud?.s ?? 0)
  return (
    <svg viewBox={`-45 -4 90 ${L / K + 8}`} preserveAspectRatio="none" className="h-44 w-14 rounded-lg bg-black/45 p-1 backdrop-blur">
      <polyline points={path} fill="none" stroke="#ffffff55" strokeWidth="3" strokeLinejoin="round" />
      <polyline points={path} fill="none" stroke={color} strokeWidth="1.2" strokeDasharray="0.1 4" strokeLinecap="round" />
      {game.forks.map((f) => <circle key={f.id} cx={map.pt(f.start).x} cy={map.pt(f.start).y} r="3.4" fill={hud?.results?.[f.id] === true ? '#22c55e' : hud?.results?.[f.id] === false ? '#ef4444' : '#ffffffaa'} />)}
      <circle cx={me.x} cy={me.y} r="5" fill={color} stroke="#fff" strokeWidth="1.6" />
    </svg>
  )
}

export default function RacingDemo() {
  const { lang } = useI18n()
  const T = (k) => tt(lang, k)
  const [phase, setPhase] = useState('menu') // menu | garage | race | done
  const [worldId, setWorldId] = useState('medicina')
  const [run, setRun] = useState(null)
  const [hud, setHud] = useState(null)
  const [result, setResult] = useState(null)
  const [card, setCard] = useState(null) // tarjeta de misión (historia)
  const [toast, setToast] = useState(null) // acierto: aviso SIN pausar, con botón para visitar la ruta
  const [pop, setPop] = useState(null) // trampa: ventana que pausa la partida
  const [pick, setPick] = useState(null) // elección de poder al empezar una misión
  const [route, setRoute] = useState(null) // ruta de repaso activa: { id, texts }
  const [levelIdx, setLevelIdx] = useState(0)
  const [mode, setMode] = useState('race') // race | free | ai | online
  const [trackId, setTrackId] = useState('classic') // forma de la pista (trackMath.TRACKS)
  const [room, setRoom] = useState(null) // en línea: { code, players }
  const [codeIn, setCodeIn] = useState('')
  const [garageFree, setGarageFree] = useState(false)
  const [myId] = useState(() => `p${Math.random().toString(36).slice(2, 10)}`)
  const authProfile = useAuthStore((s) => s.profile)
  const netRef = useRef(null), startRef = useRef(null)
  const [narr, setNarr] = useState(-1) // estación de la ruta que el narrador está contando
  const [prefs, setPrefs] = useState(loadPrefs)
  const [auto, setAuto] = useState(isTouch)
  const [dpr, setDpr] = useState(1.25) // resolución adaptativa: baja sola si la fluidez cae (PerformanceMonitor)
  const input = useRef({ left: false, right: false, gas: false, brake: false, drift: false })
  const runRef = useRef(null)
  const routeRef = useRef(null), routeQ = useRef([]), routeSpeaking = useRef(false), routeSkip = useRef(null) // narración de la ruta de repaso
  const racingWorlds = useRacingStore((s) => s.worlds)
  useRacingContentStore((s) => s.version) // se actualiza cuando llega o se edita el contenido (niveles, preguntas)
  useEffect(() => { loadRemoteRacing() }, [])

  const stopAll = () => { stopMusic(); stopVoice() }
  const start = (wid = worldId, startTier = null, li = levelIdx, opts = {}) => {
    const world = levelView(WORLD_LIST.find((w) => w.id === wid), li), pr = useRacingStore.getState().profile(wid)
    const tier = startTier ?? Math.min(pr.startTier, pr.bestTier)
    initAudio(); setMusicOn(prefs.music); setVoiceOn(prefs.voice); onDuck(duck)
    const m = opts.mode || 'race', seed = opts.seed ?? newSeed()
    const ro = { auto, startTier: tier, track: opts.track || trackId }
    if (m === 'free') ro.free = true
    else if (m === 'ai') Object.assign(ro, { rng: mulberry(seed), fixed: true, countdown: 3, bots: AI_BOTS.map((b, i) => ({ ...b, char: CHAR_IDS[(i * 2 + seed) % CHAR_IDS.length] })) })
    else if (m === 'online') Object.assign(ro, { rng: mulberry(seed), fixed: true, countdown: 3, rivals: (opts.players || []).filter((p) => p.id !== myId) })
    const next = { id: uid(), mode: m, world, game: createRace(world, ro), net: m === 'online' ? netRef.current : null, myId: myId, name: pr.custom.name || '', custom: { color: pr.custom.color, glow: pr.custom.glow, accessory: pr.custom.accessory, char: pr.custom.char, wheels: pr.custom.wheels } }
    next.game.trail = pr.custom.trail
    runRef.current = next
    startMusic(world.music); setMusicTier(tier)
    setRun(next); setHud(null); setResult(null); setCard(null); setToast(null); setPop(null); setPick(null); setRoute(null); setNarr(-1); setPhase('race')
  }
  useEffect(() => { startRef.current = start }) // el mensaje `start` de la sala llama siempre a la versión más reciente
  const leaveRoom = () => { netRef.current?.leave(); netRef.current = null; setRoom(null) }
  const enterRoom = (code) => {
    leaveRoom()
    const pr = useRacingStore.getState().profile(worldId), me = { id: myId, name: pr.custom.name || authProfile?.display_name || 'Piloto', color: pr.custom.color || WORLD_LIST.find((w) => w.id === worldId).color, char: pr.custom.char }
    netRef.current = joinRoom(code, me, {
      onPlayers: (players) => setRoom({ code, players }),
      onStart: (m) => startRef.current(m.worldId, null, m.level, { mode: 'online', seed: m.seed, players: m.players, track: m.track }),
      onState: (m) => { const g = runRef.current?.game; if (g && runRef.current.net) applyState(g, m) },
    })
    setRoom({ code, players: [] })
  }
  const startOnline = () => {
    const players = (room?.players || []).map(({ id, name, color, char }) => ({ id, name, color, char })), seed = newSeed()
    netRef.current.sendStart({ seed, worldId, level: levelIdx, players, track: trackId })
    start(worldId, null, levelIdx, { mode: 'online', seed, players, track: trackId })
  }
  useEffect(() => () => { netRef.current?.leave() }, [])
  const exit = () => { stopAll(); input.current = { left: false, right: false, gas: false, brake: false, drift: false }; setPop(null); setPick(null); setRoute(null); routeQ.current = []; routeSpeaking.current = false; setPhase('menu') }
  const selectWorld = (id) => { setWorldId(id); setLevelIdx(0) }
  const toggle = (k) => {
    const n = { ...prefs, [k]: !prefs[k] }
    setPrefs(n); savePrefs(n)
    if (k === 'music') setMusicOn(n.music); else if (k === 'voice') setVoiceOn(n.voice); else if (k === 'story' && !n.story) setCard(null)
  }
  const toggleAuto = () => { const v = !auto; setAuto(v); if (runRef.current) runRef.current.game.auto = v }
  const closePop = () => { if (runRef.current) runRef.current.game.paused = false; stopVoice(); setPop(null) }
  const choosePower = (key) => { runRef.current?.game.addPower(key); setPick(null) }
  // Ir a la ruta de repaso (desde la ventana de la trampa o desde el aviso de acierto)
  const openRoute = (q) => {
    const game = runRef.current?.game
    if (!game) return
    game.resume(); setPop(null); setToast(null); stopVoice()
    game.startDetour(q)
  }
  const endRoute = () => { runRef.current?.game.endDetour() }
  // La ruta NO detiene el vehículo: el narrador cuenta las estaciones EN ORDEN (cola) a medida que te acercas; al terminar cada una avisa al motor
  const nextStation = (game, sl) => {
    const idx = routeQ.current.shift()
    if (idx == null) { routeSpeaking.current = false; return }
    routeSpeaking.current = true; setNarr(idx)
    const t = routeRef.current?.texts?.[idx]
    if (!t) { game.revealStation(idx); nextStation(game, sl); return }
    let fired = false
    const done = () => { if (fired) return; fired = true; routeSkip.current = null; game.revealStation(idx); nextStation(game, sl) }
    routeSkip.current = done
    const spoke = voiceOn() && speak(`${t.title}. ${t.text}`, { lang: sl, onEnd: done })
    setTimeout(done, spoke ? 150000 : t.text.split(' ').length * 330 + 3000)
  }
  const skipNarration = () => { stopVoice(); routeSkip.current?.() }

  // Textos de las estaciones de la ruta de repaso, en el idioma actual
  const stationTexts = (q, stations) => stations.map((k) => {
    if (k === 'answer') return { img: q.img, title: T('routeAnswer'), text: `${qText(lang, q)} ${okText(lang, q)}.` }
    if (k.startsWith('deep')) return { img: q.img, title: T('routeExplain'), text: deepText(lang, q, Number(k.slice(4))) }
    if (k === 'others') return { img: '🤔', title: T('routeOthers'), text: `${T('othersText')}: ${q.opts.map((_, i) => optText(lang, q, i)).filter((_, i) => i !== q.correct).join('; ')}. ${T('notCorrect')}.` }
    return { img: '💡', title: T('routeRemember'), text: factText(lang, q) }
  })

  // Eventos del motor → voz, efectos, tarjetas y ventanas
  const onEvent = (e) => {
    const { world, game } = runRef.current, sl = speechLang(lang)
    if (e.type === 'mission') {
      if (game.free) return // modo libre: sin misiones ni preguntas
      const m = world.missions[e.index], name = missionText(lang, m, 'name'), intro = missionText(lang, m, 'intro')
      setCard({ key: `m${e.index}`, img: m.img, title: `${T('mission')} ${e.index + 1} / ${RACE.missions} · ${name}`, text: intro, ttl: 6 })
      speak(`${T('mission')} ${e.index + 1}. ${name}. ${intro}`, { now: true, lang: sl })
    } else if (e.type === 'powerChoice') {
      setPick(e.options); sfx('up')
    } else if (e.type === 'ask') {
      // se lee la pregunta COMPLETA y solo entonces se revelan las opciones (el vehículo espera en el pórtico)
      const f = e.fork, text = `${T('question')} ${f.id + 1}. ${qText(lang, f.q)}`
      const reveal = () => game.reveal(f.id)
      setCard((c) => (c && String(c.key).startsWith('s') ? null : c)) // si estaba la historia en pantalla, se quita
      const spoke = voiceOn() && speak(text, { now: true, lang: sl, onEnd: reveal }) // `now`: corta la historia y lee la pregunta ya
      setTimeout(reveal, spoke ? 40000 : text.split(' ').length * 330 + 2500)
    } else if (e.type === 'jump' || e.type === 'driftboost' || e.type === 'power') {
      sfx('jump')
    } else if (e.type === 'answer') {
      const up = e.tier > e.fromTier, down = e.tier < e.fromTier
      sfx(e.ok ? (up ? 'up' : 'ok') : (down ? 'down' : 'bad'))
      const tierLine = up ? ` ${T('tierUp')}: ${tierName(lang, world, e.tier)}.` : down ? ` ${T('tierDown')}: ${tierName(lang, world, e.tier)}.` : ''
      const line = LINES[lang]?.[e.ok ? 'ok' : 'bad']?.() ?? LINES.es[e.ok ? 'ok' : 'bad']()
      if (e.ok || e.shielded || game.rivals.length) {
        // SIN pausar: el vehículo sigue; aviso con el dato y el botón de la ruta
        setToast({ key: `t${uid()}`, ok: e.ok, shielded: e.shielded, q: e.q, tier: e.tier, up })
        speak(`${e.shielded ? T('shieldUsed') : line} ${e.ok ? '' : `${T('answerWas')}: ${okText(lang, e.q)}.`} ${factText(lang, e.q)}${tierLine}`, { now: true, lang: sl })
      } else {
        game.paused = true
        setPop({ key: `p${uid()}`, q: e.q, tier: e.tier, down })
        speak(`${line} ${T('answerWas')}: ${okText(lang, e.q)}. ${factText(lang, e.q)}${tierLine}`, { now: true, lang: sl })
      }
    } else if (e.type === 'detour') {
      const q = game.detour.q, texts = stationTexts(q, e.stations)
      routeRef.current = { id: e.id, texts }; routeQ.current = []; routeSpeaking.current = false; setNarr(-1)
      setRoute({ id: e.id, texts })
      speak(T('routeIntro'), { now: true, lang: sl })
    } else if (e.type === 'station') {
      routeQ.current.push(e.index)
      if (!routeSpeaking.current) nextStation(game, sl)
    } else if (e.type === 'detourEnd') {
      routeQ.current = []; routeSpeaking.current = false; routeSkip.current = null; routeRef.current = null; setNarr(-1)
      stopVoice(); setRoute(null)
    } else if (e.type === 'story') {
      const m = world.missions[e.mission], text = missionStory(lang, m, e.beat)
      if (text && prefs.story && !game.rivals.length) { setCard({ key: `s${uid()}`, img: m.img, title: `📖 ${T('story')} · ${missionText(lang, m, 'name')} (${e.beat + 1}/4)`, text, ttl: 10 }); speak(text, { lang: sl }) } // sin historia contra rivales ni si la apagaste
    } else if (e.type === 'finish') {
      sfx('finish')
    }
  }
  useEffect(() => {
    if (!card) return undefined
    const t = setTimeout(() => setCard(null), card.ttl * 1000)
    return () => clearTimeout(t)
  }, [card])
  useEffect(() => {
    if (!toast) return undefined
    const t = setTimeout(() => setToast(null), 9000)
    return () => clearTimeout(t)
  }, [toast])
  useEffect(() => () => { stopMusic(); stopVoice() }, [])

  useEffect(() => {
    const map = { ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right', ArrowUp: 'gas', KeyW: 'gas', ArrowDown: 'brake', KeyS: 'brake', Space: 'drift', ShiftLeft: 'drift', ShiftRight: 'drift' }
    const set = (v) => (e) => {
      const k = map[e.code]
      if (k) { input.current[k] = v; e.preventDefault() }
      else if (v && /^(Digit|Numpad)[1-3]$/.test(e.code)) runRef.current?.game.jump(Number(e.code.slice(-1)) - 1) // 1/2/3 = saltar a esa respuesta
      else if (v && ['KeyQ', 'KeyE', 'KeyR'].includes(e.code)) runRef.current?.game.usePower(['KeyQ', 'KeyE', 'KeyR'].indexOf(e.code)) // Q / E / R = usar poder
    }
    const down = set(true), up = set(false)
    window.addEventListener('keydown', down); window.addEventListener('keyup', up)
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up) }
  }, [])
  const hold = (k) => ({ onPointerDown: (e) => { e.preventDefault(); input.current[k] = true }, onPointerUp: () => { input.current[k] = false }, onPointerLeave: () => { input.current[k] = false }, onPointerCancel: () => { input.current[k] = false } })

  const wsel = WORLD_LIST.find((c) => c.id === worldId)
  const btn = 'rounded-xl px-4 py-2 text-sm font-bold transition active:scale-95'
  const toggles = (
    <div className="flex gap-1.5">
      <button className="pointer-events-auto rounded-lg bg-black/55 px-2.5 py-1.5 text-sm" title={T('music')} onClick={() => toggle('music')}>{prefs.music ? '🎵' : '🔇'}</button>
      {voiceSupported() && <button className="pointer-events-auto rounded-lg bg-black/55 px-2.5 py-1.5 text-sm" title={T('voice')} onClick={() => toggle('voice')}>{prefs.voice ? '🗣️' : '🤐'}</button>}
      <button className="pointer-events-auto rounded-lg bg-black/55 px-2.5 py-1.5 text-sm" title={T('story')} onClick={() => toggle('story')}>{prefs.story ? '📖' : '🚫'}</button>
      <button className="pointer-events-auto rounded-lg bg-black/55 px-2.5 py-1.5 text-xs font-bold" onClick={toggleAuto}>{auto ? `🤖 ${T('auto')}` : `🕹️ ${T('manual')}`}</button>
    </div>
  )

  if (phase === 'garage') return <RacingGarage world={wsel} lang={lang} unlockAll={garageFree} onBack={() => { setGarageFree(false); setPhase('menu') }} onStart={(t) => { const f = garageFree; setGarageFree(false); start(worldId, t, levelIdx, { mode: f ? 'free' : mode === 'online' ? 'race' : mode }) }} />

  if (phase === 'menu') {
    const c = {
      lang, worldId, wsel, levelIdx, mode, trackId, room, codeIn, myId, racingWorlds, btn, toggles,
      selectWorld, setLevelIdx, setMode, setTrackId, setCodeIn, netAvailable: netAvailable(),
      createRoom: () => enterRoom(newCode()), enterRoom, leaveRoom, startOnline,
      play: () => (mode === 'free' ? (setGarageFree(true), setPhase('garage')) : start(worldId, null, levelIdx, { mode })),
      openGarage: () => { setGarageFree(mode === 'free'); setPhase('garage') },
    }
    return <RacingMenu c={c} />
  }

  const q = hud?.q, game = run?.game
  const world = run?.world
  const mission = world ? world.missions[hud?.mission ?? 0] : null
  const inRoute = !!hud?.detour
  const canJump = !inRoute && q && q.revealed && !q.jumped && (hud?.dist ?? 0) > -RACE.forkLen + 34
  const msg = hud?.msg
  const msgText = !msg ? '' : msg.kind === 'up' ? `⭐ ${T('tierUp')}: ${tierName(lang, world, msg.tier)}` : msg.kind === 'ok' ? `✔ ${T('correct')}` : msg.kind === 'shield' ? `🛡️ ${T('shieldUsed')}` : msg.kind === 'bad' ? (msg.tier != null ? `✘ ${T('tierDown')}: ${tierName(lang, world, msg.tier)}` : '✘') : msg.kind === 'box' ? `🎁 ${T(`box_${msg.tier}`)}` : `🏁 ${T('done')}`
  const noGas = !auto && !(hud?.startIn > 0) && (hud?.speed ?? 0) < 1 && !hud?.holding && !pop && !pick && phase === 'race'
  const baseWorld = world ? WORLD_LIST.find((w) => w.id === world.id) : null
  const nextLevelOk = !!(result && baseWorld && baseWorld.levels[world.levelIndex + 1] && levelUnlocked(useRacingStore.getState().profile(world.id), world.levelIndex + 1, baseWorld.levels))
  const stTexts = route?.texts, st = inRoute && stTexts ? stTexts[Math.min(narr >= 0 ? narr : hud.detour.si, stTexts.length - 1)] : null
  return (
    <div className="fixed inset-0 select-none overflow-hidden bg-black text-white" style={{ touchAction: 'none' }}>
      {run && (
        <Canvas key={run.id} shadows camera={{ fov: 62, near: 0.3, far: 1300, position: [0, 6, 14] }} dpr={dpr} gl={{ antialias: true, powerPreference: 'high-performance' }}>
          <RaceScene run={run} input={input} lang={lang} route={route} backText={T('backRace')} onDpr={setDpr} onHud={setHud} onEvent={onEvent}
            onFinish={(r) => { const gain = run.mode === 'free' ? { free: true, stars: 0, gain: 0 } : useRacingStore.getState().finishRun(run.world.id, { ...r, levelId: run.world.levelId }); setResult({ ...r, ...gain }); setPhase('done'); stopMusic() }} />
        </Canvas>
      )}

      <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between p-3">
        <div className="rounded-xl bg-black/55 px-3 py-2 backdrop-blur">
          <div className="text-sm font-extrabold" style={{ color: world?.color }}>{world?.icon} {worldText(lang, world, 'name')} · <span className="font-semibold opacity-80">{T('mission')} {(hud?.mission ?? 0) + 1}/{RACE.missions}</span></div>
          <div className="text-xs opacity-90">{mission?.img} {missionText(lang, mission, 'name')} · {tierName(lang, world, hud?.tier ?? 0)}{(hud?.tier ?? 0) >= FLY_FROM ? ' ✈️' : ''}</div>
          <div className="mt-1 flex gap-0.5">{Array.from({ length: MAX_TIER + 1 }, (_, i) => <span key={i} className="h-1.5 w-2 rounded-full" style={{ background: i <= (hud?.tier ?? 0) ? world?.color : '#ffffff33' }} />)}</div>
        </div>
        <div className="flex gap-1.5">
          {toggles}
          <button className="pointer-events-auto rounded-lg bg-black/55 px-3 py-1.5 text-xs" onClick={exit}>{T('exit')}</button>
        </div>
      </div>

      {game && !inRoute && <div className="pointer-events-none absolute right-3 top-16 hidden sm:block"><Minimap game={game} hud={hud} color={world.color} /></div>}

      {inRoute && (
        <div className="absolute inset-x-0 top-16 mx-auto w-[min(94vw,720px)] rounded-2xl border-2 bg-black/75 p-3 backdrop-blur" style={{ borderColor: world.color }}>
          <div className="flex items-center justify-between gap-2">
            <div className="text-[11px] font-bold uppercase tracking-wide" style={{ color: world.color }}>📘 {T('routeFull')} · {T('station')} {Math.min((narr >= 0 ? narr : hud.detour.si) + 1, hud.detour.n)} / {hud.detour.n}</div>
            <div className="flex gap-1.5">
              {narr >= 0 && <button className="pointer-events-auto rounded-lg bg-white/15 px-2.5 py-1 text-xs font-bold" onClick={skipNarration}>{T('skipNarr')}</button>}
              <button className="pointer-events-auto rounded-lg bg-amber-400 px-2.5 py-1 text-xs font-black text-black" onClick={endRoute}>{T('backRace')} ▶</button>
            </div>
          </div>
          {st && <div className="mt-2 flex gap-3"><div className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-white/10 text-4xl">{st.img}</div><div className="min-w-0"><div className="text-sm font-extrabold">{st.title}</div><div className="mt-0.5 text-sm leading-snug opacity-95">{st.text}</div></div></div>}
          <div className="mt-1.5 text-[11px] font-semibold text-amber-300">{hud.detour.holding ? `🔊 ${T('routeHold')}` : `🗣️ ${T('routeCruise')}`}</div>
        </div>
      )}

      {q && !inRoute && (
        <div className="pointer-events-none absolute inset-x-0 top-20 mx-auto w-[min(94vw,700px)] rounded-2xl border border-white/20 bg-black/70 p-3 text-center backdrop-blur">
          <div className="text-[11px] uppercase tracking-wide opacity-60">{T('question')} {(hud?.qIdx ?? 0) + 1} / {FORKS}{hud?.dist > 0 ? ` · ${T('forkIn')} ${Math.round(hud.dist)} m` : ` · ${T('locked')}`}</div>
          <div className="mt-0.5 text-lg font-extrabold leading-tight">{qText(lang, q.q)}</div>
          {q.revealed ? (
            <>
              <div className={`mt-2 grid gap-2 text-sm font-bold ${q.n === 3 ? 'grid-cols-3' : 'grid-cols-2'}`}>
                {q.q.opts.map((_, i) => {
                  const hinted = hud?.hintFor === q.id && q.q.correct === i
                  return (
                    <button key={i} disabled={!canJump} onClick={() => game.jump(i)}
                      className={`pointer-events-auto rounded-lg px-2 py-2 text-left transition ${canJump ? 'hover:brightness-125 active:scale-95' : 'opacity-60'}`}
                      style={{ background: hinted ? '#16a34a88' : `${world.color}${canJump ? '44' : '22'}`, outline: hinted ? '2px solid #4ade80' : q.jumped ? 'none' : `1px solid ${world.color}66` }}>
                      <span className="mr-1 font-black" style={{ color: world.color }}>{LETTERS[i]}</span>{optText(lang, q.q, i)}{hinted && ' 💡'}
                      {canJump && <span className="ml-1 text-[10px] opacity-50">⚡{i + 1}</span>}
                    </button>
                  )
                })}
              </div>
              <div className="mt-1.5 text-[11px] opacity-60">{q.jumped ? `⚡ ${T('jumpUsed')}` : canJump ? `⚡ ${T('jumpHint')}` : ''}</div>
            </>
          ) : <div className="mt-2 flex items-center justify-center gap-3 text-sm font-semibold text-amber-300"><span className="animate-pulse">🔊 {T('listening')}</span><button className="pointer-events-auto rounded-lg bg-white/20 px-3 py-1 text-xs font-bold text-white" onClick={() => { stopVoice(); runRef.current?.game.reveal(q.id) }}>{T('skipNarr')}</button></div>}
        </div>
      )}

      {msgText && !pop && !inRoute && <div className={`pointer-events-none absolute inset-x-0 top-[44%] mx-auto w-fit max-w-[90vw] rounded-2xl px-5 py-3 text-center text-lg font-black shadow-2xl ${msg.kind === 'bad' ? 'bg-red-600' : msg.kind === 'ok' || msg.kind === 'shield' ? 'bg-emerald-500' : 'bg-amber-400 text-black'}`}>{msgText}</div>}
      {hud?.startIn > 0 && <div className="pointer-events-none absolute inset-x-0 top-[24%] text-center text-8xl font-black text-white" style={{ textShadow: '0 0 30px #000' }}>{Math.ceil(hud.startIn)}</div>}
      {hud?.board && (
        <div className="pointer-events-none absolute left-3 top-24 w-44 rounded-xl bg-black/55 p-2 text-xs backdrop-blur">
          <div className="mb-1 text-[10px] font-bold uppercase tracking-wider opacity-60">{T('ranking')}</div>
          {hud.board.map((b, i) => (
            <div key={b.id} className={`flex items-center gap-1.5 py-0.5 ${b.me ? 'font-black text-amber-300' : ''}`}>
              <span className="w-4 text-right opacity-70">{i + 1}</span>
              <span className="h-2 w-2 rounded-full" style={{ background: b.me ? '#fbbf24' : b.color }} />
              <span className="min-w-0 flex-1 truncate">{b.me ? (run?.name || T('you')) : b.name}</span>
              {b.finished && <span>🏁</span>}
            </div>
          ))}
        </div>
      )}
      {!inRoute && <SpeedFx speed={hud?.speed ?? 0} boost={hud?.boost} />}
      {!inRoute && hud?.fxOk > 0 && (
        <div key={hud.fxOk} className="pointer-events-none absolute inset-0" style={{ animation: 'boostflash 0.9s ease-out forwards' }}>
          <style>{'@keyframes boostflash{0%{opacity:0;transform:scale(.6)}15%{opacity:1;transform:scale(1.05)}100%{opacity:0;transform:scale(1.3) translateY(-30px)}}'}</style>
          <div className="absolute inset-0" style={{ background: 'radial-gradient(circle, transparent 45%, rgba(253,224,71,.28) 100%)' }} />
          <div className="absolute inset-x-0 top-[28%] text-center text-5xl font-black italic tracking-wider text-yellow-300" style={{ textShadow: '0 0 18px #facc15, 0 0 40px #f59e0b' }}>⚡ BOOST!</div>
        </div>
      )}
      {noGas && !inRoute && <div className="pointer-events-none absolute inset-x-0 top-[54%] mx-auto w-fit max-w-[90vw] animate-pulse rounded-xl bg-black/70 px-4 py-2 text-center text-sm font-bold text-amber-300">{T('stopHint')}</div>}

      {card && !inRoute && (
        <div key={card.key} onClick={() => { setCard(null); stopVoice() }} className="absolute inset-x-0 top-1/3 mx-auto flex w-[min(92vw,520px)] cursor-pointer gap-3 rounded-2xl border bg-black/75 p-3 shadow-2xl backdrop-blur" style={{ borderColor: world?.color }}>
          <div className="grid h-16 w-16 shrink-0 place-items-center rounded-xl bg-white/10 text-5xl">{card.img}</div>
          <div className="min-w-0"><div className="text-sm font-extrabold leading-tight" style={{ color: world?.color }}>{card.title}</div><div className="mt-0.5 text-xs leading-snug opacity-90">{card.text}</div></div>
        </div>
      )}

      {toast && !pop && !inRoute && (
        <div key={toast.key} className="absolute bottom-40 right-3 w-[min(88vw,380px)] rounded-2xl border-2 bg-black/80 p-3 shadow-2xl backdrop-blur sm:bottom-28" style={{ borderColor: toast.ok ? '#22c55e' : '#f59e0b' }}>
          <div className="flex gap-3">
            <div className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-white/10 text-4xl">{toast.q.img}</div>
            <div className="min-w-0">
              <div className={`text-sm font-black ${toast.ok ? 'text-emerald-400' : 'text-amber-300'}`}>{toast.shielded ? `🛡️ ${T('shieldUsed')}` : `✔ ${T('correct')}`}</div>
              <div className="mt-0.5 text-xs leading-snug opacity-90">{factText(lang, toast.q)}</div>
            </div>
          </div>
          {!game?.rivals.length && <button className="mt-2 w-full rounded-lg bg-white/15 px-3 py-1.5 text-xs font-bold hover:bg-white/25" onClick={() => openRoute(toast.q)}>📘 {T('visitRoute')}</button>}
        </div>
      )}

      <div className="pointer-events-none absolute inset-x-0 bottom-10 mx-auto flex w-fit flex-col items-center rounded-2xl bg-black/45 px-4 pb-1.5 pt-1 backdrop-blur sm:bottom-7">
        <Speedo vmax={hud?.vmax} speed={hud?.speed ?? 0} boost={hud?.boost} drifting={hud?.drifting} color={world?.color || '#22d3ee'} />
        <div className="-mt-1 text-[11px] opacity-80">✔ {hud?.correct ?? 0} · ✘ {hud?.wrong ?? 0} · ⭐ {hud?.score ?? 0} · {fmtTime(hud?.time ?? 0)}</div>
        {hud?.drifting && <div className="mt-0.5 h-1 w-full rounded bg-white/20"><div className="h-full rounded bg-orange-400" style={{ width: `${Math.min(100, (hud.driftT / 2) * 100)}%` }} /></div>}
      </div>
      {!inRoute && <div className="pointer-events-none absolute inset-x-0 bottom-2 mx-auto h-1.5 w-[min(70vw,520px)] rounded-full bg-white/20 sm:bottom-3">
        <div className="h-full rounded-full" style={{ width: `${Math.min(100, ((hud?.s ?? 0) / (hud?.L ?? 1)) * 100)}%`, background: world?.color }} />
        {game?.forks.map((f, i) => <span key={i} className="absolute top-1/2 h-3 w-0.5 -translate-y-1/2 bg-white/70" style={{ left: `${(f.start / game.L) * 100}%` }} />)}
        {game?.missionStarts.slice(1).map((s, i) => <span key={i} className="absolute top-1/2 h-4 w-1 -translate-y-1/2 rounded bg-amber-300" style={{ left: `${(s / game.L) * 100}%` }} />)}
      </div>}

      {!inRoute && (hud?.powers?.length > 0) && (
        <div className="absolute bottom-28 left-3 flex gap-1.5 sm:bottom-24">
          {hud.powers.map((k, i) => (
            <button key={`${k}${i}`} onClick={() => game.usePower(i)} title={T(`pwd_${k}`)} className={`flex h-14 w-14 flex-col items-center justify-center rounded-xl border bg-black/65 text-2xl backdrop-blur ${POWERS[k].passive ? 'border-sky-400/60' : 'border-amber-300/70 active:scale-95'}`}>
              {POWERS[k].icon}<span className="text-[9px] font-bold opacity-70">{POWERS[k].passive ? 'auto' : ['Q', 'E', 'R'][i]}</span>
            </button>
          ))}
        </div>
      )}

      <div className="absolute bottom-6 left-3 flex gap-2 sm:hidden">
        <button className="h-16 w-16 rounded-2xl bg-white/20 text-2xl backdrop-blur active:bg-white/40" {...hold('left')}>◀</button>
        <button className="h-16 w-16 rounded-2xl bg-white/20 text-2xl backdrop-blur active:bg-white/40" {...hold('right')}>▶</button>
      </div>
      <div className="absolute bottom-5 right-3 flex items-end gap-2">
        <button className="h-14 w-16 rounded-2xl bg-white/15 text-[11px] font-black backdrop-blur active:bg-white/35" {...hold('brake')}>🛑<br />{T('brake')}</button>
        <button className="h-14 w-20 rounded-2xl bg-orange-500/50 text-[11px] font-black backdrop-blur active:bg-orange-400/80" {...hold('drift')}>🌀<br />{T('drift')}</button>
        {!auto && <button className="h-20 w-24 rounded-2xl bg-emerald-500/60 text-sm font-black backdrop-blur active:bg-emerald-400/90" {...hold('gas')}>▲<br />{T('gas')}</button>}
      </div>

      {pick && (
        <div className="absolute inset-0 z-20 grid place-items-center bg-black/60 p-3 backdrop-blur-sm">
          <div className="w-[min(94vw,640px)] rounded-3xl border-2 bg-[#10162a] p-5 text-center shadow-2xl" style={{ borderColor: world.color }}>
            <div className="text-lg font-black">{T('choosePower')}</div>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              {pick.map((k) => (
                <button key={k} onClick={() => choosePower(k)} className="rounded-2xl border border-white/20 bg-white/5 p-4 transition hover:scale-105 hover:bg-white/10">
                  <div className="text-5xl">{POWERS[k].icon}</div>
                  <div className="mt-1 font-black" style={{ color: world.color }}>{T(`pw_${k}`)}</div>
                  <div className="mt-1 text-xs opacity-80">{T(`pwd_${k}`)}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {pop && (
        <div className="absolute inset-0 z-20 grid place-items-center bg-black/55 p-3 backdrop-blur-sm">
          <div className="w-[min(94vw,560px)] rounded-3xl border-2 border-red-500 bg-[#10162a] p-5 shadow-2xl">
            <div className="flex items-start gap-4">
              <div className="grid h-20 w-20 shrink-0 place-items-center rounded-2xl bg-white/10 text-6xl">{pop.q.img}</div>
              <div className="min-w-0"><div className="text-xl font-black text-red-400">✘ {T('answerWas')}:</div><div className="mt-0.5 text-sm font-bold leading-snug">{okText(lang, pop.q)}</div></div>
            </div>
            <div className="mt-3 rounded-xl bg-white/5 p-3 text-sm leading-snug"><div className="mb-0.5 text-[11px] font-bold uppercase tracking-wide opacity-60">💡 {T('fact')}</div>{factText(lang, pop.q)}</div>
            {pop.down && <div className="mt-2 text-sm font-bold text-red-300">⬇️ {T('tierDown')}: {tierName(lang, world, pop.tier)}</div>}
            <div className="mt-4 flex flex-wrap justify-end gap-2">
              <button className={`${btn} bg-white/15`} onClick={() => openRoute(pop.q)}>📘 {T('visitRoute')}</button>
              <button className={`${btn} bg-amber-400 text-black`} onClick={closePop}>{T('cont')} ▶</button>
            </div>
          </div>
        </div>
      )}

      {phase === 'done' && result && (
        <div className="absolute inset-0 z-30 grid place-items-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-[min(92vw,480px)] rounded-3xl border border-white/20 bg-[#10162a] p-6 text-center">
            <div className="text-5xl">{result.correct >= FORKS - 2 ? '🏆' : result.correct >= FORKS / 2 ? '🎉' : '📚'}</div>
            <div className="mt-1 text-2xl font-black">{T('done')}</div>
            <div className="mt-3 grid grid-cols-4 gap-2 text-sm">
              <div className="rounded-xl bg-white/10 p-2"><div className="text-2xl font-black text-emerald-400">{result.correct}</div>{T('hits')}</div>
              <div className="rounded-xl bg-white/10 p-2"><div className="text-2xl font-black text-red-400">{result.wrong}</div>{T('traps')}</div>
              <div className="rounded-xl bg-white/10 p-2"><div className="text-2xl font-black text-amber-300">{result.score}</div>{T('points')}</div>
              <div className="rounded-xl bg-white/10 p-2"><div className="text-2xl font-black">{fmtTime(result.time)}</div>{T('time')}</div>
            </div>
            {result.total > 1 && <div className="mt-3 text-3xl font-black text-amber-300">{['🥇', '🥈', '🥉'][result.rank - 1] || '🏁'} {T('yourPlace')}: {result.rank} / {result.total}</div>}
            <div className="mt-3 text-sm opacity-80">{T('finalVehicle')}: <b style={{ color: world.color }}>{tierName(lang, world, result.tier)}</b></div>
            {!result.free && <div className="mt-2 space-y-0.5 text-sm font-bold">
              <div className="text-lg text-amber-300">{'⭐'.repeat(result.stars)}{'☆'.repeat(3 - result.stars)}</div>
              <div className="text-sky-300">+{result.gain} {T('xpGain')} · {T('level')} {result.level}</div>
              {result.leveledUp && <div className="text-amber-300">⭐ {T('levelUp')}</div>}
              {result.unlocked != null && <div className="text-emerald-300">🏎️ {T('newVehicle')}: {tierName(lang, world, result.unlocked)}</div>}
            </div>}
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {nextLevelOk && !result.free && <button className={`${btn} bg-emerald-400 text-black`} onClick={() => start(world.id, null, world.levelIndex + 1)}>{T('nextLevel')} ▶</button>}
              <button className={`${btn} bg-amber-400 text-black`} onClick={() => (run.mode === 'online' ? exit() : start(world.id, null, world.levelIndex, { mode: run.mode }))}>{T('again')}</button>
              <button className={`${btn} bg-white/15`} onClick={() => { stopAll(); setWorldId(world.id); setPhase('garage') }}>🔧 {T('garage')}</button>
              <button className={`${btn} bg-white/15`} onClick={exit}>{T('changeWorld')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
