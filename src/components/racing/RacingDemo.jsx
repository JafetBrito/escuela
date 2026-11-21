import { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Link } from 'react-router-dom'
import { CLASS_LIST, RACE, buildForks } from './racingData'
import { createRace } from './raceEngine'
import { frame } from './track'
import { buildTrack, bannerTexture } from './trackBuild'
import { buildVehicle } from './vehicles'

// ─────────────────────────────────────────────────────────────────────────────
// OLIVER RACING (demo): carrera cuesta abajo estilo Tux Racer donde el vehículo mejora al responder preguntas de la clase
// elegida. En cada bifurcación la pista se parte en dos carriles con una respuesta cada uno: el correcto sigue, el otro es
// una trampa. Controles: ← → / A D (o los botones en el celular). La lógica vive en raceEngine.js (sin React).
// ─────────────────────────────────────────────────────────────────────────────
const SOLID = new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 0.9 })
const GLOW = new THREE.MeshBasicMaterial({ vertexColors: true, toneMapped: false })
const T1 = { x: 0, y: 0, z: 0, yaw: 0 }, T2 = { x: 0, y: 0, z: 0, yaw: 0 }, T3 = { x: 0, y: 0, z: 0, yaw: 0 }
const V3 = new THREE.Vector3()

function RaceScene({ run, input, onHud, onFinish }) {
  const { cls, forks, game } = run
  const track = useMemo(() => buildTrack(cls, forks), [cls, forks])
  const textures = useMemo(() => track.banners.map((b) => bannerTexture(b.label, b.text, b.color)), [track])
  const [tier, setTier] = useState(0)
  const model = useMemo(() => buildVehicle(cls.tiers[tier].kind, cls.accent, cls.emblem), [cls, tier])
  const vehicle = useRef(), shown = useRef(0), acc = useRef(0), first = useRef(true), sent = useRef(false)

  useEffect(() => () => { textures.forEach((t) => t.dispose()); track.geos.forEach((g) => g.dispose()); track.glowGeos.forEach((g) => g.dispose()); track.solid?.dispose(); track.glow?.dispose() }, [textures, track])
  useEffect(() => () => { model.solid?.dispose(); model.glow?.dispose() }, [model])

  useFrame((state, dtRaw) => {
    const dt = Math.min(dtRaw, 0.05)
    game.step(dt, (input.current.right ? 1 : 0) - (input.current.left ? 1 : 0))
    if (game.tier !== shown.current) { shown.current = game.tier; setTier(game.tier) }

    frame(game.s, game.u, 0, T1)
    const v = vehicle.current
    if (v) {
      const spin = game.crash > 0 ? Math.sin(game.crash * 9) * 0.7 : 0
      v.position.set(T1.x, T1.y + (game.crash > 0 ? Math.abs(Math.sin(game.crash * 12)) * 0.4 : 0), T1.z)
      v.rotation.set(0, T1.yaw - game.uv * 0.03 + spin, -game.uv * 0.025)
    }
    // cámara detrás y arriba, mirando por delante del vehículo; el campo de visión crece con la velocidad
    frame(game.s - 13, game.u * 0.7, 5.4, T2); frame(game.s + 16, game.u * 0.9, 1.5, T3)
    const cam = state.camera
    if (first.current) { cam.position.set(T2.x, T2.y, T2.z); first.current = false } else cam.position.lerp(V3.set(T2.x, T2.y, T2.z), 1 - Math.exp(-7 * dt))
    if (game.crash > 0) cam.position.add(V3.set((Math.random() - 0.5) * 0.5, (Math.random() - 0.5) * 0.4, 0))
    cam.lookAt(T3.x, T3.y, T3.z)
    cam.fov = 62 + game.v * 0.35; cam.updateProjectionMatrix()

    acc.current += dt
    if (acc.current > 0.1) {
      acc.current = 0
      const f = game.question()
      onHud({ speed: game.v, tier: game.tier, correct: game.correct, wrong: game.wrong, s: game.s, L: game.L, q: f, qIdx: game.idx, dist: game.forkDistance(), msg: game.msg, time: game.time, boost: game.boost > 0, crash: game.crash > 0 })
    }
    if (game.finished && game.finishT > 1.6 && !sent.current) { sent.current = true; onFinish({ correct: game.correct, wrong: game.wrong, time: game.time, tier: game.tier }) }
  })

  return (
    <>
      <color attach="background" args={[cls.sky]} />
      <fog attach="fog" args={[cls.fog, 70, 330]} />
      <hemisphereLight args={['#ffffff', cls.ground2, cls.emblem === 'code' ? 0.9 : 1.5]} />
      <directionalLight position={[60, 120, 40]} intensity={cls.emblem === 'code' ? 0.9 : 2.2} color="#fff4dd" />
      {track.geos.map((g, i) => <mesh key={`r${i}`} geometry={g} material={SOLID} />)}
      {track.glowGeos.map((g, i) => <mesh key={`g${i}`} geometry={g} material={GLOW} />)}
      {track.solid && <mesh geometry={track.solid} material={SOLID} />}
      {track.glow && <mesh geometry={track.glow} material={GLOW} />}
      {track.banners.map((b, i) => (
        <mesh key={`b${i}`} position={[b.x, b.y, b.z]} rotation={[0, b.yaw, 0]}>
          <planeGeometry args={[b.w, b.h]} /><meshBasicMaterial map={textures[i]} toneMapped={false} />
        </mesh>
      ))}
      <group ref={vehicle} scale={1.5}>
        {model.solid && <mesh geometry={model.solid} material={SOLID} />}
        {model.glow && <mesh geometry={model.glow} material={GLOW} />}
      </group>
    </>
  )
}

const kmh = (v) => Math.round(v * 3.6)
const fmtTime = (t) => `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}`

export default function RacingDemo() {
  const [phase, setPhase] = useState('menu') // menu | race | done
  const [classId, setClassId] = useState('medicina')
  const [run, setRun] = useState(null)
  const [hud, setHud] = useState(null)
  const [result, setResult] = useState(null)
  const input = useRef({ left: false, right: false })

  const start = (cid = classId) => {
    const cls = CLASS_LIST.find((c) => c.id === cid)
    const forks = buildForks(cls)
    setRun({ id: Date.now(), cls, forks, game: createRace(cls, forks) })
    setHud(null); setResult(null); setPhase('race')
  }

  useEffect(() => {
    const map = { ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right' }
    const set = (v) => (e) => { const k = map[e.code]; if (k) { input.current[k] = v; e.preventDefault() } }
    const down = set(true), up = set(false)
    window.addEventListener('keydown', down); window.addEventListener('keyup', up)
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up) }
  }, [])
  const hold = (k) => ({ onPointerDown: (e) => { e.preventDefault(); input.current[k] = true }, onPointerUp: () => { input.current[k] = false }, onPointerLeave: () => { input.current[k] = false }, onPointerCancel: () => { input.current[k] = false } })

  const cls = CLASS_LIST.find((c) => c.id === classId)
  const btn = 'rounded-xl px-4 py-2 text-sm font-bold transition active:scale-95'

  if (phase === 'menu') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0b1020] to-[#1a1033] p-4 text-white sm:p-8">
        <div className="mx-auto max-w-4xl">
          <Link to="/dashboard" className="text-xs opacity-60">← Volver</Link>
          <h1 className="mt-2 text-3xl font-black">🏁 Oliver Racing <span className="text-sm font-semibold text-amber-300">demo</span></h1>
          <p className="mt-1 max-w-2xl text-sm opacity-75">Baja la colina a toda velocidad. En cada bifurcación aparece una pregunta de tu clase: <b>elige el carril con la respuesta correcta</b>. Acierta y tu vehículo mejora (y vuelas); falla y caes en la trampa.</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {CLASS_LIST.map((c) => (
              <button key={c.id} onClick={() => setClassId(c.id)} className={`rounded-2xl border-2 p-4 text-left transition ${classId === c.id ? 'scale-[1.02] bg-white/10' : 'bg-white/5 opacity-80 hover:opacity-100'}`} style={{ borderColor: classId === c.id ? c.color : 'transparent' }}>
                <div className="text-3xl">{c.icon}</div>
                <div className="mt-1 text-lg font-extrabold" style={{ color: c.color }}>{c.name}</div>
                <div className="text-xs opacity-70">{c.tagline}</div>
                <ol className="mt-3 space-y-0.5 text-[11px] opacity-80">{c.tiers.map((t, i) => <li key={t.name}>{i + 1}. {t.name}</li>)}</ol>
              </button>
            ))}
          </div>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button className={`${btn} bg-amber-400 text-black`} onClick={() => start()}>¡A correr con {cls.name}! →</button>
            <span className="text-xs opacity-60">Controles: ← → o A D · en celular, botones en pantalla · {RACE.forks} preguntas por carrera</span>
          </div>
        </div>
      </div>
    )
  }

  const q = hud?.q
  const left = q ? (q.side === 'L' ? q.ok : q.bad) : '', right = q ? (q.side === 'R' ? q.ok : q.bad) : ''
  const tierName = run ? run.cls.tiers[hud?.tier ?? 0].name : ''
  return (
    <div className="fixed inset-0 select-none overflow-hidden bg-black text-white" style={{ touchAction: 'none' }}>
      {run && (
        <Canvas key={run.id} camera={{ fov: 62, near: 0.3, far: 700, position: [0, 6, 14] }} dpr={[1, 1.75]}>
          <RaceScene run={run} input={input} onHud={setHud} onFinish={(r) => { setResult(r); setPhase('done') }} />
        </Canvas>
      )}

      <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between p-3">
        <div className="rounded-xl bg-black/55 px-3 py-2 backdrop-blur">
          <div className="text-sm font-extrabold" style={{ color: run?.cls.color }}>{run?.cls.icon} {run?.cls.name}</div>
          <div className="text-xs opacity-90">{tierName}</div>
          <div className="mt-1 flex gap-1">{[0, 1, 2, 3, 4].map((i) => <span key={i} className="h-1.5 w-5 rounded-full" style={{ background: i <= (hud?.tier ?? 0) ? run?.cls.color : '#ffffff33' }} />)}</div>
        </div>
        <button className="pointer-events-auto rounded-lg bg-black/55 px-3 py-1.5 text-xs" onClick={() => { input.current = { left: false, right: false }; setPhase('menu') }}>✕ Salir</button>
      </div>

      {q && (
        <div className="pointer-events-none absolute inset-x-0 top-20 mx-auto w-[min(92vw,640px)] rounded-2xl border border-white/20 bg-black/65 p-3 text-center backdrop-blur">
          <div className="text-[11px] uppercase tracking-wide opacity-60">Pregunta {Math.min(RACE.forks, (hud?.qIdx ?? 0) + 1)} / {RACE.forks}{hud?.dist > 0 ? ` · bifurcación en ${Math.round(hud.dist)} m` : ' · ¡elige carril!'}</div>
          <div className="mt-0.5 text-lg font-extrabold leading-tight">{q.q}</div>
          <div className="mt-2 grid grid-cols-2 gap-2 text-sm font-bold">
            <div className="rounded-lg px-2 py-1.5" style={{ background: `${run.cls.color}33` }}>◀ A · {left}</div>
            <div className="rounded-lg px-2 py-1.5" style={{ background: `${run.cls.color}33` }}>B · {right} ▶</div>
          </div>
        </div>
      )}

      {hud?.msg && (
        <div className={`pointer-events-none absolute inset-x-0 top-1/3 mx-auto w-fit max-w-[90vw] rounded-2xl px-5 py-3 text-center text-lg font-black shadow-2xl ${hud.msg.kind === 'bad' ? 'bg-red-600' : hud.msg.kind === 'up' ? 'bg-amber-400 text-black' : 'bg-emerald-500'}`}>{hud.msg.text}</div>
      )}

      <div className="pointer-events-none absolute bottom-24 left-3 rounded-xl bg-black/55 px-4 py-2 backdrop-blur sm:bottom-6">
        <div className="text-4xl font-black tabular-nums" style={{ color: hud?.boost ? '#fde047' : '#fff' }}>{kmh(hud?.speed ?? 0)}<span className="ml-1 text-xs font-semibold opacity-60">km/h</span></div>
        <div className="text-[11px] opacity-70">✔ {hud?.correct ?? 0} · ✘ {hud?.wrong ?? 0} · {fmtTime(hud?.time ?? 0)}</div>
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-2 mx-auto h-1.5 w-[min(70vw,520px)] rounded-full bg-white/20 sm:bottom-4">
        <div className="h-full rounded-full" style={{ width: `${Math.min(100, ((hud?.s ?? 0) / (hud?.L ?? 1)) * 100)}%`, background: run?.cls.color }} />
        {run?.forks.map((f, i) => <span key={i} className="absolute top-1/2 h-3 w-0.5 -translate-y-1/2 bg-white/70" style={{ left: `${(f.start / run.game.L) * 100}%` }} />)}
      </div>

      <div className="absolute inset-x-0 bottom-8 flex justify-between px-4 sm:hidden">
        <button className="h-20 w-28 rounded-2xl bg-white/20 text-3xl backdrop-blur active:bg-white/40" {...hold('left')}>◀</button>
        <button className="h-20 w-28 rounded-2xl bg-white/20 text-3xl backdrop-blur active:bg-white/40" {...hold('right')}>▶</button>
      </div>

      {phase === 'done' && result && (
        <div className="absolute inset-0 grid place-items-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-[min(92vw,460px)] rounded-3xl border border-white/20 bg-[#10162a] p-6 text-center">
            <div className="text-5xl">{result.correct >= RACE.forks - 1 ? '🏆' : result.correct >= 3 ? '🎉' : '📚'}</div>
            <div className="mt-1 text-2xl font-black">¡Carrera terminada!</div>
            <div className="mt-3 grid grid-cols-3 gap-2 text-sm">
              <div className="rounded-xl bg-white/10 p-2"><div className="text-2xl font-black text-emerald-400">{result.correct}</div>aciertos</div>
              <div className="rounded-xl bg-white/10 p-2"><div className="text-2xl font-black text-red-400">{result.wrong}</div>trampas</div>
              <div className="rounded-xl bg-white/10 p-2"><div className="text-2xl font-black">{fmtTime(result.time)}</div>tiempo</div>
            </div>
            <div className="mt-3 text-sm opacity-80">Vehículo final: <b style={{ color: run.cls.color }}>{run.cls.tiers[result.tier].name}</b></div>
            <div className="mt-4 flex justify-center gap-2">
              <button className={`${btn} bg-amber-400 text-black`} onClick={() => start(run.cls.id)}>Otra vez</button>
              <button className={`${btn} bg-white/15`} onClick={() => setPhase('menu')}>Cambiar clase</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
