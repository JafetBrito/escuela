import { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import * as THREE from 'three'
import { Link } from 'react-router-dom'
import { useI18n } from '../../i18n'
import { WORLD_LIST, RACE, FORKS } from './racingData'
import { createRace } from './raceEngine'
import { frame, centerX, pitchAt } from './track'
import { buildTrack, bannerTexture } from './trackBuild'
import { buildVehicle } from './vehicles'
import { Mesher } from '../vr/campus/mesher'
import { initAudio, startMusic, stopMusic, setMusicTier, setMusicOn, duck, sfx, loadPrefs, savePrefs } from './racingAudio'
import { speak, stopVoice, setVoiceOn, onDuck, voiceSupported, voiceOn, LINES } from './racingVoice'
import { tt, speechLang, worldText, missionText, tierName, qText, okText, factText, optText } from './racingI18n'

// ─────────────────────────────────────────────────────────────────────────────
// OLIVER RACING: carrera estilo Tux Racer. Eliges un MUNDO (profesión); la partida son 3 MISIONES con su escenario y su historia, 12
// bifurcaciones y una pista larga con subidas y bajadas. CONTROL MANUAL: tú aceleras (W / ↑ o el botón), frenas, giras y derrapas; si no
// aceleras te detienes (en el celular hay modo automático). Antes de cada bifurcación el vehículo espera en el pórtico a que el
// locutor termine de leer la pregunta; entonces aparecen las opciones. Acertar da turbo y sube de nivel; la trampa te baja uno. Tras cada
// respuesta se abre una ventana con la explicación y, si fallaste, una ruta de repaso. La lógica vive en raceEngine.js (sin React).
// ─────────────────────────────────────────────────────────────────────────────
const SOLID = new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 0.9 })
const GLOW = new THREE.MeshBasicMaterial({ vertexColors: true, toneMapped: false })
const T1 = { x: 0, y: 0, z: 0, yaw: 0 }, T2 = { x: 0, y: 0, z: 0, yaw: 0 }, T3 = { x: 0, y: 0, z: 0, yaw: 0 }
const V3 = new THREE.Vector3(), COL = new THREE.Color(), HSL = { h: 0, s: 0, l: 0 }
const LETTERS = ['A', 'B', 'C']
const hash = (a, b) => { const s = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return s - Math.floor(s) }
const isTouch = () => typeof matchMedia !== 'undefined' && matchMedia('(pointer: coarse)').matches

// Montañas lejanas que siguen a la cámara (siempre se ven en el horizonte); su tinte se funde con la niebla de la misión
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
    const c = state.camera, pal = world.missions[game.mission].pal
    frame(game.s, 0, 0, T3)
    group.current.position.set(c.position.x, T3.y - 45, c.position.z)
    mat.current.color.lerp(COL.set(pal.fog).multiplyScalar(0.82), 0.05)
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

function RaceScene({ run, input, lang, onHud, onEvent, onFinish }) {
  const { world, game } = run
  const track = useMemo(() => buildTrack(world, game.forks, game.missionStarts), [world, game])
  const textures = useMemo(() => track.banners.map((b) => bannerTexture(b.label, b.text, b.color)), [track])
  const [tier, setTier] = useState(0)
  const [sign, setSign] = useState(null)
  const model = useMemo(() => buildVehicle(world.tiers[tier].kind, world.color, world.emblem), [world, tier])
  const vehicle = useRef(), bg = useRef(), fog = useRef(), hemi = useRef(), dir = useRef()
  const shown = useRef(0), shownSign = useRef(-1), acc = useRef(0), first = useRef(true), sent = useRef(false), roll = useRef(0)
  const pal0 = world.missions[0].pal

  useEffect(() => () => { textures.forEach((t) => t.dispose()); track.geos.forEach((g) => g.dispose()); track.glowGeos.forEach((g) => g.dispose()); track.solid?.dispose(); track.glow?.dispose() }, [textures, track])
  useEffect(() => () => { model.solid?.dispose(); model.glow?.dispose() }, [model])
  useEffect(() => { if (vehicle.current) vehicle.current.rotation.order = 'YXZ' }, [])

  useFrame((state, dtRaw) => {
    const dt = Math.min(dtRaw, 0.05), inp = input.current
    game.step(dt, { steer: (inp.right ? 1 : 0) - (inp.left ? 1 : 0), throttle: inp.gas ? 1 : 0, brake: inp.brake ? 1 : 0, drift: inp.drift })
    for (const e of game.drain()) onEvent(e)
    if (game.tier !== shown.current) { shown.current = game.tier; setTier(game.tier); setMusicTier(game.tier) }

    frame(game.s, game.u, 0, T1)
    const v = vehicle.current
    if (v) {
      const spin = game.crash > 0 ? Math.sin(game.crash * 9) * 0.7 : 0
      roll.current += ((game.drifting ? Math.sign(game.uv || 1) * 0.42 : 0) - roll.current) * Math.min(1, 10 * dt) // al derrapar el vehículo se cruza
      v.position.set(T1.x, T1.y + (game.crash > 0 ? Math.abs(Math.sin(game.crash * 12)) * 0.4 : 0), T1.z)
      v.rotation.set(pitchAt(game.s), T1.yaw - game.uv * 0.03 + spin - roll.current, -game.uv * 0.025 - roll.current * 0.25)
    }
    // cámara detrás y arriba; el campo de visión crece con la velocidad y los turbos
    frame(game.s - 13, game.u * 0.7, 5.4, T2); frame(game.s + 16, game.u * 0.9, 1.5, T3)
    const cam = state.camera
    if (first.current) { cam.position.set(T2.x, T2.y, T2.z); first.current = false } else cam.position.lerp(V3.set(T2.x, T2.y, T2.z), 1 - Math.exp(-7 * dt))
    if (game.crash > 0) cam.position.add(V3.set((Math.random() - 0.5) * 0.5, (Math.random() - 0.5) * 0.4, 0))
    cam.lookAt(T3.x, T3.y, T3.z)
    cam.fov = 60 + game.v * 0.38 + (game.boost > 0 ? 7 : 0); cam.updateProjectionMatrix()

    // el ambiente (cielo, niebla, luz) se funde hacia el de la misión en curso
    const pal = world.missions[game.mission].pal, k = 1 - Math.exp(-1.6 * dt)
    if (bg.current) bg.current.lerp(COL.set(pal.sky), k)
    if (fog.current) fog.current.color.lerp(COL.set(pal.fog), k)
    const lum = COL.set(pal.sky).getHSL(HSL).l
    if (hemi.current) hemi.current.intensity += (0.7 + lum * 1.1 - hemi.current.intensity) * k
    if (dir.current) dir.current.intensity += (0.5 + lum * 2 - dir.current.intensity) * k

    acc.current += dt
    if (acc.current > 0.1) {
      acc.current = 0
      const f = game.question(), cur = game.forks[game.idx]
      const sid = cur && cur.q && cur.revealed && game.s < cur.start + RACE.forkLen + 20 ? cur.id : -1 // los carteles aparecen cuando ya se leyó la pregunta
      if (sid !== shownSign.current) { shownSign.current = sid; setSign(sid >= 0 ? { id: sid, opts: cur.q.opts.map((_, i) => optText(lang, cur.q, i)) } : null) }
      onHud({ speed: game.v, tier: game.tier, correct: game.correct, wrong: game.wrong, score: game.score, s: game.s, L: game.L, q: f, qIdx: game.idx, dist: game.forkDistance(), msg: game.msg, time: game.time, boost: game.boost > 0, mission: game.mission, holding: game.holding, drifting: game.drifting, driftT: game.driftT, results: game.results.slice() })
    }
    if (game.finished && game.finishT > 1.8 && !sent.current) { sent.current = true; onFinish({ correct: game.correct, wrong: game.wrong, score: game.score, time: game.time, tier: game.tier }) }
  })

  return (
    <>
      <color ref={bg} attach="background" args={[pal0.sky]} />
      <fog ref={fog} attach="fog" args={[pal0.fog, 70, 360]} />
      <hemisphereLight ref={hemi} args={['#ffffff', pal0.ground2, 1.2]} />
      <directionalLight ref={dir} position={[60, 120, 40]} intensity={1.5} color="#fff4dd" />
      <Backdrop game={game} world={world} />
      {track.geos.map((g, i) => <mesh key={`r${i}`} geometry={g} material={SOLID} />)}
      {track.glowGeos.map((g, i) => <mesh key={`g${i}`} geometry={g} material={GLOW} />)}
      {track.solid && <mesh geometry={track.solid} material={SOLID} />}
      {track.glow && <mesh geometry={track.glow} material={GLOW} />}
      {track.banners.map((b, i) => (
        <mesh key={`b${i}`} position={[b.x, b.y, b.z]} rotation={[0, b.yaw, 0]}>
          <planeGeometry args={[b.w, b.h]} /><meshBasicMaterial map={textures[i]} toneMapped={false} />
        </mesh>
      ))}
      {sign && <ForkSigns key={sign.id} gantry={track.gantries[sign.id]} opts={sign.opts} color={world.missions[game.mission].pal.accent} />}
      <group ref={vehicle} scale={1.5}>
        {model.solid && <mesh geometry={model.solid} material={SOLID} />}
        {model.glow && <mesh geometry={model.glow} material={GLOW} />}
      </group>
      <EffectComposer multisampling={0}><Bloom intensity={0.75} luminanceThreshold={0.72} luminanceSmoothing={0.25} mipmapBlur /></EffectComposer>
    </>
  )
}

const kmh = (v) => Math.round(v * 3.6)
const fmtTime = (t) => `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}`

// Minimapa: la pista vista desde arriba con las bifurcaciones (verde = acertada, roja = fallada) y tu posición
function Minimap({ game, hud, color }) {
  const L = game.L, K = 60
  const path = useMemo(() => { const pts = []; for (let s = 0; s <= L; s += 90) pts.push(`${(centerX(s) * 1.2).toFixed(1)},${(s / K).toFixed(1)}`); return pts.join(' ') }, [L])
  const s = hud?.s ?? 0
  return (
    <svg viewBox={`-45 -4 90 ${L / K + 8}`} preserveAspectRatio="none" className="h-44 w-14 rounded-lg bg-black/45 p-1 backdrop-blur">
      <polyline points={path} fill="none" stroke="#ffffff55" strokeWidth="3" strokeLinejoin="round" />
      <polyline points={path} fill="none" stroke={color} strokeWidth="1.2" strokeDasharray="0.1 4" strokeLinecap="round" />
      {game.forks.map((f) => <circle key={f.id} cx={centerX(f.start) * 1.2} cy={f.start / K} r="3.4" fill={hud?.results?.[f.id] === true ? '#22c55e' : hud?.results?.[f.id] === false ? '#ef4444' : '#ffffffaa'} />)}
      <circle cx={centerX(s) * 1.2} cy={s / K} r="5" fill={color} stroke="#fff" strokeWidth="1.6" />
    </svg>
  )
}

export default function RacingDemo() {
  const { lang } = useI18n()
  const T = (k) => tt(lang, k)
  const [phase, setPhase] = useState('menu') // menu | race | done
  const [worldId, setWorldId] = useState('medicina')
  const [run, setRun] = useState(null)
  const [hud, setHud] = useState(null)
  const [result, setResult] = useState(null)
  const [card, setCard] = useState(null) // tarjeta de misión (historia)
  const [pop, setPop] = useState(null) // ventana de información tras responder (modo 'result' o 'review')
  const [prefs, setPrefs] = useState(loadPrefs)
  const [auto, setAuto] = useState(isTouch)
  const input = useRef({ left: false, right: false, gas: false, brake: false, drift: false })
  const runRef = useRef(null)

  const stopAll = () => { stopMusic(); stopVoice() }
  const start = (wid = worldId) => {
    const world = WORLD_LIST.find((w) => w.id === wid)
    initAudio(); setMusicOn(prefs.music); setVoiceOn(prefs.voice); onDuck(duck)
    const next = { id: Date.now(), world, game: createRace(world, { auto }) }
    runRef.current = next
    startMusic(world.music)
    setRun(next); setHud(null); setResult(null); setCard(null); setPop(null); setPhase('race')
  }
  const exit = () => { stopAll(); input.current = { left: false, right: false, gas: false, brake: false, drift: false }; setPop(null); setPhase('menu') }
  const toggle = (k) => {
    const n = { ...prefs, [k]: !prefs[k] }
    setPrefs(n); savePrefs(n)
    if (k === 'music') setMusicOn(n.music); else setVoiceOn(n.voice)
  }
  const toggleAuto = () => { const v = !auto; setAuto(v); if (runRef.current) runRef.current.game.auto = v }
  const closePop = () => { if (runRef.current) runRef.current.game.paused = false; stopVoice(); setPop(null) }
  const openReview = () => {
    if (!pop) return
    const { q } = pop
    setPop({ ...pop, mode: 'review' })
    speak(`${T('reviewTitle')}. ${T('answerWas')}: ${okText(lang, q)}. ${factText(lang, q)}. ${T('thinkFirst')}`, { now: true, lang: speechLang(lang) })
  }

  // Eventos del motor → voz, efectos, tarjetas y ventanas
  const onEvent = (e) => {
    const { world, game } = runRef.current, sl = speechLang(lang)
    if (e.type === 'mission') {
      const m = world.missions[e.index], name = missionText(lang, m, 'name'), intro = missionText(lang, m, 'intro')
      setCard({ key: `m${e.index}`, img: m.img, title: `${T('mission')} ${e.index + 1} / ${RACE.missions} · ${name}`, text: intro, ttl: 12 })
      speak(`${T('mission')} ${e.index + 1}. ${name}. ${intro}`, { now: true, lang: sl })
    } else if (e.type === 'ask') {
      // se lee la pregunta COMPLETA y solo entonces se revelan las opciones (el vehículo espera en el pórtico)
      const f = e.fork, text = `${T('question')} ${f.id + 1}. ${qText(lang, f.q)}`
      const reveal = () => game.reveal(f.id)
      const spoke = voiceOn() && speak(text, { lang: sl, onEnd: reveal })
      setTimeout(reveal, spoke ? 40000 : text.split(' ').length * 330 + 2500)
    } else if (e.type === 'jump') {
      sfx('jump')
    } else if (e.type === 'driftboost') {
      sfx('jump')
    } else if (e.type === 'answer') {
      const up = e.tier > e.fromTier, down = e.tier < e.fromTier
      sfx(e.ok ? (up ? 'up' : 'ok') : (down ? 'down' : 'bad'))
      game.paused = true // la partida espera hasta que cierres la ventana
      setPop({ key: `p${Date.now()}`, mode: 'result', ok: e.ok, q: e.q, tier: e.tier, up, down })
      const tierLine = up ? ` ${T('tierUp')}: ${tierName(lang, world, e.tier)}.` : down ? ` ${T('tierDown')}: ${tierName(lang, world, e.tier)}.` : ''
      speak(`${LINES[lang]?.[e.ok ? 'ok' : 'bad']?.() ?? LINES.es[e.ok ? 'ok' : 'bad']()} ${e.ok ? '' : `${T('answerWas')}: ${okText(lang, e.q)}.`} ${factText(lang, e.q)}${tierLine}`, { now: true, lang: sl })
    } else if (e.type === 'finish') {
      sfx('finish')
    }
  }
  useEffect(() => {
    if (!card) return undefined
    const t = setTimeout(() => setCard(null), card.ttl * 1000)
    return () => clearTimeout(t)
  }, [card])
  useEffect(() => () => { stopMusic(); stopVoice() }, [])

  useEffect(() => {
    const map = { ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right', ArrowUp: 'gas', KeyW: 'gas', ArrowDown: 'brake', KeyS: 'brake', Space: 'drift', ShiftLeft: 'drift', ShiftRight: 'drift' }
    const set = (v) => (e) => {
      const k = map[e.code]
      if (k) { input.current[k] = v; e.preventDefault() }
      else if (v && /^(Digit|Numpad)[1-3]$/.test(e.code)) runRef.current?.game.jump(Number(e.code.slice(-1)) - 1) // 1/2/3 = saltar a esa respuesta
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
      <button className="pointer-events-auto rounded-lg bg-black/55 px-2.5 py-1.5 text-xs font-bold" onClick={toggleAuto}>{auto ? `🤖 ${T('auto')}` : `🕹️ ${T('manual')}`}</button>
    </div>
  )

  if (phase === 'menu') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0b1020] to-[#1a1033] p-4 text-white sm:p-8">
        <div className="mx-auto max-w-4xl">
          <Link to="/dashboard" className="text-xs opacity-60">{T('back')}</Link>
          <h1 className="mt-2 text-3xl font-black">🏁 Oliver Racing <span className="text-sm font-semibold text-amber-300">{T('demo')}</span></h1>
          <p className="mt-1 max-w-2xl text-sm opacity-75">{T('pick')}</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {WORLD_LIST.map((c) => (
              <button key={c.id} onClick={() => setWorldId(c.id)} className={`rounded-2xl border-2 p-4 text-left transition ${worldId === c.id ? 'scale-[1.02] bg-white/10' : 'bg-white/5 opacity-80 hover:opacity-100'}`} style={{ borderColor: worldId === c.id ? c.color : 'transparent' }}>
                <div className="text-3xl">{c.icon}</div>
                <div className="mt-1 text-lg font-extrabold" style={{ color: c.color }}>{worldText(lang, c, 'name')}</div>
                <div className="text-xs opacity-70">{worldText(lang, c, 'tagline')}</div>
                <ol className="mt-3 space-y-0.5 text-[11px] opacity-80">{c.missions.map((m, i) => <li key={m.name}>{m.img} {T('mission')} {i + 1}: {missionText(lang, m, 'name')}</li>)}</ol>
                <div className="mt-2 text-[10px] opacity-50">{c.questions.length} {T('questionsN')} · 5 {T('vehicles')}</div>
              </button>
            ))}
          </div>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button className={`${btn} bg-amber-400 text-black`} onClick={() => start()}>{T('go')} {worldText(lang, wsel, 'name')} →</button>
            {toggles}
          </div>
          <p className="mt-3 max-w-2xl text-xs opacity-60">{T('controls')}</p>
        </div>
      </div>
    )
  }

  const q = hud?.q, game = run?.game
  const world = run?.world
  const mission = world ? world.missions[hud?.mission ?? 0] : null
  const canJump = q && q.revealed && !q.jumped && (hud?.dist ?? 0) > -RACE.forkLen + 34
  const msg = hud?.msg
  const msgText = !msg ? '' : msg.kind === 'up' ? `⭐ ${T('tierUp')}: ${tierName(lang, world, msg.tier)}` : msg.kind === 'ok' ? `✔ ${T('correct')}` : msg.kind === 'bad' ? (msg.tier != null ? `✘ ${T('tierDown')}: ${tierName(lang, world, msg.tier)}` : '✘') : `🏁 ${T('done')}`
  const noGas = !auto && (hud?.speed ?? 0) < 1 && !hud?.holding && !pop && phase === 'race'
  return (
    <div className="fixed inset-0 select-none overflow-hidden bg-black text-white" style={{ touchAction: 'none' }}>
      {run && (
        <Canvas key={run.id} camera={{ fov: 62, near: 0.3, far: 900, position: [0, 6, 14] }} dpr={[1, 1.75]}>
          <RaceScene run={run} input={input} lang={lang} onHud={setHud} onEvent={onEvent} onFinish={(r) => { setResult(r); setPhase('done'); stopMusic() }} />
        </Canvas>
      )}

      <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between p-3">
        <div className="rounded-xl bg-black/55 px-3 py-2 backdrop-blur">
          <div className="text-sm font-extrabold" style={{ color: world?.color }}>{world?.icon} {worldText(lang, world, 'name')} · <span className="font-semibold opacity-80">{T('mission')} {(hud?.mission ?? 0) + 1}/{RACE.missions}</span></div>
          <div className="text-xs opacity-90">{mission?.img} {missionText(lang, mission, 'name')} · {tierName(lang, world, hud?.tier ?? 0)}</div>
          <div className="mt-1 flex gap-1">{[0, 1, 2, 3, 4].map((i) => <span key={i} className="h-1.5 w-5 rounded-full" style={{ background: i <= (hud?.tier ?? 0) ? world?.color : '#ffffff33' }} />)}</div>
        </div>
        <div className="flex gap-1.5">
          {toggles}
          <button className="pointer-events-auto rounded-lg bg-black/55 px-3 py-1.5 text-xs" onClick={exit}>{T('exit')}</button>
        </div>
      </div>

      {game && <div className="pointer-events-none absolute right-3 top-16 hidden sm:block"><Minimap game={game} hud={hud} color={world.color} /></div>}

      {q && (
        <div className="pointer-events-none absolute inset-x-0 top-20 mx-auto w-[min(94vw,700px)] rounded-2xl border border-white/20 bg-black/70 p-3 text-center backdrop-blur">
          <div className="text-[11px] uppercase tracking-wide opacity-60">{T('question')} {(hud?.qIdx ?? 0) + 1} / {FORKS}{hud?.dist > 0 ? ` · ${T('forkIn')} ${Math.round(hud.dist)} m` : ` · ${T('locked')}`}</div>
          <div className="mt-0.5 text-lg font-extrabold leading-tight">{qText(lang, q.q)}</div>
          {q.revealed ? (
            <>
              <div className={`mt-2 grid gap-2 text-sm font-bold ${q.n === 3 ? 'grid-cols-3' : 'grid-cols-2'}`}>
                {q.q.opts.map((_, i) => (
                  <button key={i} disabled={!canJump} onClick={() => game.jump(i)}
                    className={`pointer-events-auto rounded-lg px-2 py-2 text-left transition ${canJump ? 'hover:brightness-125 active:scale-95' : 'opacity-60'}`}
                    style={{ background: `${world.color}${canJump ? '44' : '22'}`, outline: q.jumped ? 'none' : `1px solid ${world.color}66` }}>
                    <span className="mr-1 font-black" style={{ color: world.color }}>{LETTERS[i]}</span>{optText(lang, q.q, i)}
                    {canJump && <span className="ml-1 text-[10px] opacity-50">⚡{i + 1}</span>}
                  </button>
                ))}
              </div>
              <div className="mt-1.5 text-[11px] opacity-60">{q.jumped ? `⚡ ${T('jumpUsed')}` : canJump ? `⚡ ${T('jumpHint')}` : ''}</div>
            </>
          ) : <div className="mt-2 animate-pulse text-sm font-semibold text-amber-300">🔊 {T('listening')}</div>}
        </div>
      )}

      {msgText && !pop && <div className={`pointer-events-none absolute inset-x-0 top-[42%] mx-auto w-fit max-w-[90vw] rounded-2xl px-5 py-3 text-center text-lg font-black shadow-2xl ${msg.kind === 'bad' ? 'bg-red-600' : msg.kind === 'ok' ? 'bg-emerald-500' : 'bg-amber-400 text-black'}`}>{msgText}</div>}
      {noGas && <div className="pointer-events-none absolute inset-x-0 top-[52%] mx-auto w-fit max-w-[90vw] animate-pulse rounded-xl bg-black/70 px-4 py-2 text-center text-sm font-bold text-amber-300">{T('stopHint')}</div>}

      {card && (
        <div key={card.key} className="pointer-events-none absolute inset-x-0 top-1/3 mx-auto flex w-[min(92vw,520px)] gap-3 rounded-2xl border bg-black/75 p-3 shadow-2xl backdrop-blur" style={{ borderColor: world?.color }}>
          <div className="grid h-16 w-16 shrink-0 place-items-center rounded-xl bg-white/10 text-5xl">{card.img}</div>
          <div className="min-w-0"><div className="text-sm font-extrabold leading-tight" style={{ color: world?.color }}>{card.title}</div><div className="mt-0.5 text-xs leading-snug opacity-90">{card.text}</div></div>
        </div>
      )}

      <div className="pointer-events-none absolute inset-x-0 bottom-12 mx-auto w-fit rounded-xl bg-black/55 px-4 py-2 text-center backdrop-blur sm:bottom-9">
        <div className="text-4xl font-black tabular-nums" style={{ color: hud?.boost ? '#fde047' : hud?.drifting ? '#fb923c' : '#fff' }}>{kmh(hud?.speed ?? 0)}<span className="ml-1 text-xs font-semibold opacity-60">{T('speed')}</span></div>
        <div className="text-[11px] opacity-70">✔ {hud?.correct ?? 0} · ✘ {hud?.wrong ?? 0} · ⭐ {hud?.score ?? 0} · {fmtTime(hud?.time ?? 0)}</div>
        {hud?.drifting && <div className="mt-0.5 h-1 w-full rounded bg-white/20"><div className="h-full rounded bg-orange-400" style={{ width: `${Math.min(100, (hud.driftT / 2) * 100)}%` }} /></div>}
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-2 mx-auto h-1.5 w-[min(70vw,520px)] rounded-full bg-white/20 sm:bottom-3">
        <div className="h-full rounded-full" style={{ width: `${Math.min(100, ((hud?.s ?? 0) / (hud?.L ?? 1)) * 100)}%`, background: world?.color }} />
        {game?.forks.map((f, i) => <span key={i} className="absolute top-1/2 h-3 w-0.5 -translate-y-1/2 bg-white/70" style={{ left: `${(f.start / game.L) * 100}%` }} />)}
        {game?.missionStarts.slice(1).map((s, i) => <span key={i} className="absolute top-1/2 h-4 w-1 -translate-y-1/2 rounded bg-amber-300" style={{ left: `${(s / game.L) * 100}%` }} />)}
      </div>

      <div className="absolute bottom-6 left-3 flex gap-2 sm:hidden">
        <button className="h-16 w-16 rounded-2xl bg-white/20 text-2xl backdrop-blur active:bg-white/40" {...hold('left')}>◀</button>
        <button className="h-16 w-16 rounded-2xl bg-white/20 text-2xl backdrop-blur active:bg-white/40" {...hold('right')}>▶</button>
      </div>
      <div className="absolute bottom-5 right-3 flex items-end gap-2">
        <button className="h-14 w-16 rounded-2xl bg-white/15 text-[11px] font-black backdrop-blur active:bg-white/35" {...hold('brake')}>🛑<br />{T('brake')}</button>
        <button className="h-14 w-20 rounded-2xl bg-orange-500/50 text-[11px] font-black backdrop-blur active:bg-orange-400/80" {...hold('drift')}>🌀<br />{T('drift')}</button>
        {!auto && <button className="h-20 w-24 rounded-2xl bg-emerald-500/60 text-sm font-black backdrop-blur active:bg-emerald-400/90" {...hold('gas')}>▲<br />{T('gas')}</button>}
      </div>

      {pop && (
        <div className="absolute inset-0 z-20 grid place-items-center bg-black/55 p-3 backdrop-blur-sm">
          <div className="w-[min(94vw,560px)] rounded-3xl border-2 bg-[#10162a] p-5 shadow-2xl" style={{ borderColor: pop.mode === 'review' ? world.color : pop.ok ? '#22c55e' : '#ef4444' }}>
            <div className="flex items-start gap-4">
              <div className="grid h-20 w-20 shrink-0 place-items-center rounded-2xl bg-white/10 text-6xl">{pop.q.img}</div>
              <div className="min-w-0">
                {pop.mode === 'review'
                  ? <div className="text-lg font-black" style={{ color: world.color }}>📘 {T('reviewTitle')}</div>
                  : <div className={`text-xl font-black ${pop.ok ? 'text-emerald-400' : 'text-red-400'}`}>{pop.ok ? `✔ ${T('correct')}` : `✘ ${T('answerWas')}:`}</div>}
                <div className="mt-0.5 text-sm font-bold leading-snug">{pop.mode === 'review' || !pop.ok ? okText(lang, pop.q) : qText(lang, pop.q)}</div>
              </div>
            </div>
            {pop.mode === 'review' && <div className="mt-3 rounded-xl bg-white/5 p-3 text-sm italic opacity-90">«{qText(lang, pop.q)}»</div>}
            <div className="mt-3 rounded-xl bg-white/5 p-3 text-sm leading-snug"><div className="mb-0.5 text-[11px] font-bold uppercase tracking-wide opacity-60">💡 {T('fact')}</div>{factText(lang, pop.q)}</div>
            {(pop.up || pop.down) && <div className={`mt-2 text-sm font-bold ${pop.up ? 'text-amber-300' : 'text-red-300'}`}>{pop.up ? `⭐ ${T('tierUp')}: ` : `⬇️ ${T('tierDown')}: `}{tierName(lang, world, pop.tier)}</div>}
            <div className="mt-4 flex flex-wrap justify-end gap-2">
              {!pop.ok && pop.mode === 'result' && <button className={`${btn} bg-white/15`} onClick={openReview}>📘 {T('review')}</button>}
              <button className={`${btn} bg-amber-400 text-black`} onClick={closePop}>{pop.mode === 'review' ? T('backTrack') : T('cont')} ▶</button>
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
            <div className="mt-3 text-sm opacity-80">{T('finalVehicle')}: <b style={{ color: world.color }}>{tierName(lang, world, result.tier)}</b></div>
            <div className="mt-4 flex justify-center gap-2">
              <button className={`${btn} bg-amber-400 text-black`} onClick={() => start(world.id)}>{T('again')}</button>
              <button className={`${btn} bg-white/15`} onClick={exit}>{T('changeWorld')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
