import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { EffectComposer, Bloom, Vignette, ToneMapping, HueSaturation, BrightnessContrast } from '@react-three/postprocessing'
import { BlendFunction, ToneMappingMode } from 'postprocessing'
import * as THREE from 'three'
import { Link, useSearchParams } from 'react-router-dom'
import { tr } from '../../../i18n'
import NpcSpeechPlayer from '../NpcSpeechPlayer'
import NpcDialogueBox from '../NpcDialogueBox'
import { useNpcSpeechStore } from '../../../stores/useNpcSpeechStore'
import PlazaScenery from './PlazaScenery'
import DemoNpcs from './DemoNpcs'
import { talkTo, npcName, npcEmoji } from './demoNpcData'
import { PRESETS, GEMS, WALK_LIMIT, PLAZA_R, groundHeight, clamp, lerp } from './plazaWorld'
import { startAmbience, setAmbiencePreset, setAmbienceMuted, footstep, shutdownAmbience } from './plazaAudio'

// ─────────────────────────────────────────────────────────────────────────────
// LOOK-DEV: "Plaza de las Academias" — banco de pruebas de dirección de arte
// (low-poly atmosférico, aire griego). El escenario vive en PlazaScenery.jsx y es
// EL MISMO que usa el mundo real (/vr/plaza en VRPage): lo que se afine aquí se
// ve allá. Esta página solo agrega lo propio de una demo: caminante libre con
// cámara en primera persona, NPCs de muestra, HUD y presets de hora.
//
// Móvil: SceneEffects.jsx apaga el post-procesado en pantallas angostas (caro),
// así que la escena no depende del bloom: cielo + niebla + flat shading cargan el
// look; el bloom solo lo realza en escritorio.
// ─────────────────────────────────────────────────────────────────────────────

const NO_CHANNEL = { current: { on: () => {} } } // NpcSpeechPlayer espera un canal Realtime; aquí no hay multijugador

// ── Caminante (exploración): WASD + arrastrar para mirar ─────────────────────
function Walker({ start }) {
  const { camera, gl } = useThree()
  const st = useRef({ ...start, keys: new Set(), drag: null, y: null, bob: 0 })
  useEffect(() => {
    const s = st.current, el = gl.domElement
    const kd = (e) => { if (e.target.tagName === 'INPUT') return; s.keys.add(e.code); if (e.code.startsWith('Arrow') || e.code === 'Space') e.preventDefault() }
    const ku = (e) => s.keys.delete(e.code)
    const pd = (e) => { s.drag = { x: e.clientX, y: e.clientY }; el.setPointerCapture?.(e.pointerId) }
    const pm = (e) => {
      if (!s.drag) return
      s.yaw -= (e.clientX - s.drag.x) * 0.0042; s.pitch = clamp(s.pitch - (e.clientY - s.drag.y) * 0.0035, -1.2, 1.2)
      s.drag = { x: e.clientX, y: e.clientY }
    }
    const pu = () => { s.drag = null }
    window.addEventListener('keydown', kd); window.addEventListener('keyup', ku)
    el.addEventListener('pointerdown', pd); el.addEventListener('pointermove', pm); el.addEventListener('pointerup', pu)
    return () => {
      window.removeEventListener('keydown', kd); window.removeEventListener('keyup', ku)
      el.removeEventListener('pointerdown', pd); el.removeEventListener('pointermove', pm); el.removeEventListener('pointerup', pu)
    }
  }, [gl])
  useFrame((_, dt0) => {
    const s = st.current, k = s.keys, dt = Math.min(dt0, 0.05)
    const fwd = (k.has('KeyW') || k.has('ArrowUp') ? 1 : 0) - (k.has('KeyS') || k.has('ArrowDown') ? 1 : 0)
    const str = (k.has('KeyD') ? 1 : 0) - (k.has('KeyA') ? 1 : 0)
    if (k.has('ArrowLeft')) s.yaw += 1.6 * dt
    if (k.has('ArrowRight')) s.yaw -= 1.6 * dt
    const sp = (k.has('ShiftLeft') || k.has('ShiftRight') ? 14 : 7) * dt, sin = Math.sin(s.yaw), cos = Math.cos(s.yaw)
    s.x += (-sin * fwd + cos * str) * sp; s.z += (-cos * fwd - sin * str) * sp
    const r = Math.hypot(s.x, s.z); if (r > WALK_LIMIT) { s.x *= WALK_LIMIT / r; s.z *= WALK_LIMIT / r }
    const moving = fwd !== 0 || str !== 0, prevStep = Math.floor(s.bob / Math.PI)
    s.bob = moving ? s.bob + dt * (k.has('ShiftLeft') || k.has('ShiftRight') ? 13 : 9) : s.bob
    if (moving && Math.floor(s.bob / Math.PI) !== prevStep) footstep(Math.hypot(s.x, s.z) < PLAZA_R)
    const gy = groundHeight(s.x, s.z) + 1.7
    s.y = s.y == null ? gy : lerp(s.y, gy, 1 - Math.exp(-12 * dt))
    camera.position.set(s.x, s.y + (moving ? Math.sin(s.bob) * 0.04 : 0), s.z)
    camera.rotation.set(s.pitch, s.yaw, 0, 'YXZ')
  })
  return null
}

function World({ p, start, onCollect, mobile, stylized, onNear }) {
  const { camera } = useThree()
  const playerPos = useMemo(() => ({ current: camera.position }), [camera])
  return (
    <>
      <PlazaScenery p={p} scale={1} followRef={playerPos} onCollect={onCollect} />
      <DemoNpcs stylized={stylized} groundAt={groundHeight} onNear={onNear} />
      <NpcSpeechPlayer channelRef={NO_CHANNEL} playerPositionRef={playerPos} />
      <Walker start={start} />
      {!mobile && (
        <EffectComposer multisampling={4}>
          <Bloom luminanceThreshold={0.85} luminanceSmoothing={0.9} intensity={p.bloom} mipmapBlur blendFunction={BlendFunction.ADD} />
          <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
          <HueSaturation saturation={0.14} />
          <BrightnessContrast contrast={0.07} />
          <Vignette offset={0.4} darkness={0.5} />
        </EffectComposer>
      )}
    </>
  )
}

export default function PlazaAtmosferica() {
  const [qs] = useSearchParams()
  const [preset, setPreset] = useState(PRESETS[qs.get('preset')] ? qs.get('preset') : 'atardecer')
  const [gems, setGems] = useState(0)
  const [stylized, setStylized] = useState(qs.get('estilo') === '1')
  const [soundOn, setSoundOn] = useState(true)
  const [nearId, setNearId] = useState(null)
  const speakingId = useNpcSpeechStore((s) => s.activeNpcId)
  const [mobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < 768)
  const num = (k, d) => (Number.isFinite(parseFloat(qs.get(k))) ? parseFloat(qs.get(k)) : d)
  const start = useMemo(() => ({
    x: num('x', 0), z: num('z', 44), yaw: THREE.MathUtils.degToRad(num('yaw', 0)), pitch: THREE.MathUtils.degToRad(num('pitch', 12)),
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [])
  const p = PRESETS[preset]

  // Sonido: el navegador exige un gesto antes de reproducir audio, así que el ambiente
  // arranca con el primer clic/tecla. Las voces de los NPC usan su propio interruptor (🔊 en el diálogo).
  useEffect(() => {
    if (!soundOn) { setAmbienceMuted(true); return }
    setAmbienceMuted(false)
    const go = () => startAmbience(preset)
    window.addEventListener('pointerdown', go, { once: true }); window.addEventListener('keydown', go, { once: true })
    return () => { window.removeEventListener('pointerdown', go); window.removeEventListener('keydown', go) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [soundOn])
  useEffect(() => { setAmbiencePreset(preset) }, [preset])
  useEffect(() => () => { shutdownAmbience(); window.speechSynthesis?.cancel() }, [])

  // E = hablar con el NPC cercano (mismo sistema de diálogo con voz del mundo real).
  useEffect(() => {
    const kd = (e) => { if (e.code === 'KeyE' && nearId) talkTo(nearId) }
    window.addEventListener('keydown', kd)
    return () => window.removeEventListener('keydown', kd)
  }, [nearId])

  const pill = 'rounded-full border border-white/20 bg-black/45 backdrop-blur-sm'
  return (
    <div className="relative h-screen w-full overflow-hidden bg-black">
      <Canvas shadows dpr={[1, 1.75]} flat={!mobile} camera={{ fov: 62, near: 0.1, far: 1200, position: [start.x, 2, start.z] }}
        gl={{ antialias: true, powerPreference: 'high-performance' }}>
        <Suspense fallback={null}><World p={p} start={start} onCollect={setGems} mobile={mobile} stylized={stylized} onNear={setNearId} /></Suspense>
      </Canvas>

      <div className="pointer-events-none absolute inset-0 select-none">
        <Link to="/dashboard" className="pointer-events-auto absolute left-4 top-4 rounded-full border border-white/25 bg-black/45 px-4 py-2 text-sm font-bold text-white backdrop-blur-sm hover:bg-black/65">
          ← {tr('Salir', 'Exit')}
        </Link>
        <div className="absolute left-1/2 top-4 -translate-x-1/2 rounded-full border border-amber-300/40 bg-black/45 px-5 py-2 text-center backdrop-blur-sm">
          <p className="text-sm font-black text-amber-200">{tr('Plaza de las Academias', 'Academy Plaza')}</p>
          <p className="text-[10px] text-white/55">{tr('Banco de pruebas de arte · versión griega', 'Art test bench · Greek version')}</p>
        </div>
        <div className={`pointer-events-auto absolute right-4 top-4 flex gap-1.5 p-1 ${pill}`}>
          {Object.entries(PRESETS).map(([id, v]) => (
            <button key={id} type="button" onClick={() => setPreset(id)}
              className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${preset === id ? 'bg-amber-300 text-black' : 'text-white/80 hover:bg-white/10'}`}>
              {v.icon} {v.label}
            </button>
          ))}
        </div>
        <div className="pointer-events-auto absolute right-4 top-16 flex gap-1.5">
          <button type="button" onClick={() => setStylized((v) => !v)} className={`${pill} px-3 py-1.5 text-xs font-bold text-white hover:bg-black/65`}>
            {stylized ? tr('🎨 Modelos: estilizados', '🎨 Models: stylized') : tr('🧍 Modelos: originales', '🧍 Models: original')}
          </button>
          <button type="button" onClick={() => setSoundOn((v) => !v)} className={`${pill} px-3 py-1.5 text-xs font-bold text-white hover:bg-black/65`}>
            {soundOn ? '🔊' : '🔇'} {tr('Ambiente', 'Ambience')}
          </button>
        </div>

        {nearId && !speakingId && (
          <button type="button" onClick={() => talkTo(nearId)}
            className="pointer-events-auto absolute bottom-20 left-1/2 -translate-x-1/2 rounded-full border border-amber-300/60 bg-black/60 px-5 py-2 text-sm font-bold text-amber-100 shadow-lg backdrop-blur-sm transition hover:scale-105">
            <kbd className="mr-2 rounded bg-amber-300 px-1.5 py-0.5 text-xs font-black text-black">E</kbd>
            {tr('Hablar con', 'Talk to')} {npcEmoji(nearId)} {npcName(nearId)}
          </button>
        )}

        <div className={`absolute bottom-4 left-1/2 -translate-x-1/2 px-5 py-2 text-sm font-bold text-white ${pill}`}>
          💎 {gems}/{GEMS.length}
        </div>
        <p className="absolute bottom-4 left-4 max-w-[46vw] text-[11px] leading-snug text-white/60">
          {tr('WASD mover · Shift correr · arrastra para mirar · E hablar · sigue las columnas de luz', 'WASD move · Shift run · drag to look · E talk · follow the light pillars')}
        </p>
      </div>

      {/* Caja de diálogo con voz del mundo real, tal cual (no es un mock). Fuera del overlay con pointer-events:none para que sus botones respondan. */}
      <NpcDialogueBox />
    </div>
  )
}
