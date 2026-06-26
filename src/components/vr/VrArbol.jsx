/**
 * VrArbol — Mundo tutorial del Árbol de Oliver Academy
 *
 * Flujo (ver src/data/tutorialMissions.js):
 *   1. Cinemática de bienvenida (10 diálogos con voz) + revelación del Árbol
 *   2. Primeros pasos: moverte y hablar con Jafet (chat de prueba)
 *   3. Elige la clase de tu Avatar, ahí mismo frente al Árbol
 *   4. Elige tu mascota (abre VrMascotOnboarding)
 *   5. Elige la clase de tu mascota (dentro del mismo modal)
 *   6. Revisa las habilidades iniciales desbloqueadas
 *   7. Configura IA de la mascota (opcional / skip)
 *   8. Primera conversación con la mascota
 *   9. Entra al Campus VR
 */
import { Suspense, useEffect, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Physics } from '@react-three/rapier'
import { useNavigate } from 'react-router-dom'
import { useGameStore, PLAYER_AVATARS, PLAYER_CLASSES, OLIVER_CLASSES } from '../../stores/useGameStore'
import { useTutorialStore } from '../../stores/useTutorialStore'
import { useChatStore } from '../../stores/useChatStore'
import { useMascotStore } from '../../stores/useMascotStore'
import { useAuthStore } from '../../stores/useAuthStore'
import { useVrSettingsStore } from '../../stores/useVrSettingsStore'
import { getMascotById } from '../../data/mascotRegistry'
import { getSkinById } from '../../data/skinsRegistry'
import { SKILL_REGISTRY } from '../../data/skillRegistry'
import { TUTORIAL_MISSIONS } from '../../data/tutorialMissions'
import { sendNpcMessage } from '../../services/chat/npcTransport'
import VrMascotOnboarding from './VrMascotOnboarding'
import MascotMesh from '../mascot/MascotMesh'
import MascotCompanion from '../mascot/MascotCompanion'
import { Player, useCameraControls, useMovementKeys, VirtualJoystick, MobileButtons } from './engine'
import { useArbolGround, ARBOL_JAFET_POS, ARBOL_SPAWN } from './worlds/useArbolGround'

// ── TTS helper — same pattern as VrCueva.jsx's speakLine, kept local since
// it's a small, self-contained helper with no shared state worth a module. ──
function speakLine(text, onDone) {
  if (!window.speechSynthesis || !useVrSettingsStore.getState().npcVoice) {
    setTimeout(onDone, Math.max(3500, text.length * 62))
    return () => {}
  }
  const clean = text.replace(/[\u{1F000}-\u{1FFFF}]/gu, '').replace(/[^\w\s.,!?¿¡'"—áéíóúüñÁÉÍÓÚÜÑ]/g, '').trim()
  const utt = new SpeechSynthesisUtterance(clean)
  utt.lang = 'es-ES'; utt.rate = 0.92; utt.pitch = 1.05
  let settled = false
  const safety = setTimeout(() => { if (!settled) { settled = true; window.speechSynthesis.cancel(); onDone() } }, Math.max(7000, clean.length * 78))
  utt.onend = () => { if (!settled) { settled = true; clearTimeout(safety); setTimeout(onDone, 400) } }
  utt.onerror  = () => { if (!settled) { settled = true; clearTimeout(safety); onDone() } }
  window.speechSynthesis.cancel()
  window.speechSynthesis.speak(utt)
  return () => { settled = true; clearTimeout(safety); window.speechSynthesis.cancel() }
}

// ── The 10-line welcome speech, read aloud before the player can move ──────
const ARBOL_INTRO_LINES = [
  '¡Bienvenido, estudiante! 🌳 Soy Jafet, guardián del Árbol de Oliver Academy. Hoy empieza algo importante.',
  'Oliver Academy no es una escuela común: aquí cada clase, cada compañero y cada decisión se vive dentro de un mundo entero.',
  'Este Árbol existe para una sola cosa: prepararte antes de que cruces al Campus, donde todo lo que aprendas aquí se pone en práctica.',
  'Vas a elegir un camino para ti — tu clase — y vas a conocer a un compañero que te acompañará en cada paso: tu mascota.',
  'Tu mascota no es solo decorativa. Piensa, responde y aprende contigo, con su propia personalidad y sus propias habilidades.',
  'No te preocupes por hacerlo "bien" — cada decisión que tomes aquí se puede ajustar más adelante. Esto es para explorar, no para acertar.',
  'Vas a subir de nivel varias veces antes de llegar al Campus. Cada misión que completes te acerca un poco más.',
  'Primero quiero conocerte: vas a caminar por este lugar y a hablarme, para que pruebes el sistema con el que vas a comunicarte aquí dentro.',
  'Después de eso, llegará el momento de elegir tu camino — y el de tu compañero.',
  '¿Listo? Acércate, mira a tu alrededor, y cuando quieras, hablamos. 🧙‍♂️',
]

// Eases the existing third-person orbit camera (the same yaw/pitch/distance
// object <Player> already reads every frame — see engine/camera.js) to a
// tighter, more "directed" framing over `ms`, locking out manual drag input
// for that window via lockedRef. Only used at key narrative beats; the rest
// of the time the camera stays fully player-controlled. `onDone` fires once
// the tween settles (used to chain the reveal cinematic into free play).
function runCinematic(cameraRef, lockedRef, { pitch, distance, yaw }, ms = 1800, onDone) {
  lockedRef.current = true
  const cam = cameraRef.current
  const start = { pitch: cam.pitch, targetDistance: cam.targetDistance, yaw: cam.yaw }
  const t0 = performance.now()
  function tick() {
    const t = Math.min(1, (performance.now() - t0) / ms)
    const e = 1 - (1 - t) ** 3
    cam.pitch = start.pitch + (pitch - start.pitch) * e
    cam.targetDistance = cam.distance = start.targetDistance + (distance - start.targetDistance) * e
    if (yaw != null) cam.yaw = start.yaw + (yaw - start.yaw) * e
    if (t < 1) requestAnimationFrame(tick)
    else { lockedRef.current = false; onDone?.() }
  }
  requestAnimationFrame(tick)
}

// ── NPC Jafet definition ──────────────────────────────────────────────────────
const JAFET = {
  id: 'jafet',
  name: 'Jafet',
  emoji: '🧙‍♂️',
  color: '#98ca3f',
  mascotId: 10,   // mage_elder.glb
  aiPrompt: `Eres Jafet, el guardián del Árbol de Oliver Academy. Eres sabio, cercano y con buen humor.
Guías a los nuevos estudiantes a través del tutorial de bienvenida.
Hablas en español, eres entusiasta del aprendizaje y del mundo mágico de Oliver Academy.
Nunca salgas del personaje. Usa emojis ocasionalmente para ser expresivo.`,
}

// ── Scripted dialogue per tutorial step ──────────────────────────────────────
// Each key holds the lines Jafet says once that step BECOMES the active one
// (not "after finishing the previous one") — that way the same content works
// both the first time a step starts and when the player returns to it.
const JAFET_DIALOGUE = {
  practice_basics: [
    '¡Aquí estás! Antes de nada, quiero que te sueltes un poco. 🚶',
    'Camina por aquí — usa WASD o el joystick — y cuando quieras, cuéntame algo. Así pruebas el sistema con el que vamos a hablar de ahora en adelante.',
    'Ah, y ya que estamos: muy pronto vas a tener que elegir tu camino. Ve pensando qué tipo de estudiante quieres ser. 🤔',
  ],
  choose_avatar_class: [
    '¡Ese es el espíritu! 🌟 Llegó el momento: ¿qué camino quieres seguir?',
    'Elige la clase que más te represente. Tu mascota, más adelante, elegirá una que te complemente.',
  ],
  choose_mascot: [
    '¡Bien elegido! Ese camino te queda perfecto. ⚔️',
    'Ahora necesitas un compañero de viaje. Cada mascota tiene su propio estilo — elige la que sientas más cercana a ti.',
  ],
  mascot_class: [
    '¡Un compañero increíble! 🐾 Pero un compañero sin clase es como un hechicero sin grimorio…',
    'Elige su clase con cuidado: algunas combinan mejor con tu camino que otras, aunque al final la decisión es toda tuya.',
  ],
  test_ability: [
    '¡Ya tienen camino los dos! ✨ Y eso significa que ya tienen sus primeras habilidades.',
    'Échales un vistazo — vale la pena saber con qué cuentas antes de seguir.',
  ],
  setup_ai: [
    '¡Perfecto! Tu compañero ya tiene poderes únicos. 🔮',
    'Ahora viene algo opcional pero muy poderoso: darle una mente de IA real para que piense y responda por sí mismo.',
  ],
  first_chat: [
    '¡Tu compañero está casi listo! 🤖',
    'Ahora pruébalo: abre su menú y dile algo. Una primera conversación siempre se recuerda.',
  ],
  enter_campus: [
    '¡Los escuché conversar! 💬 Ese es un vínculo que solo crece con el tiempo.',
    'Ya completaste todo lo que el Árbol tenía para enseñarte. Solo falta un paso: cruzar hacia Oliver Academy.',
  ],
  done: [
    '¡Has llegado lejos, estudiante! 🎉 El campus de Oliver Academy te espera con nuevas clases, batallas y aventuras.',
    '¡Nos vemos por ahí! 🌍',
  ],
}

// ── 3D Scene components ───────────────────────────────────────────────────────

function JafetNpc({ mascot, onTalk }) {
  const groupRef = useRef()
  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.3
      groupRef.current.position.y = Math.sin(Date.now() * 0.001) * 0.06
    }
  })
  return (
    <group
      ref={groupRef}
      position={ARBOL_JAFET_POS}
      scale={0.18}
      onClick={(e) => { e.stopPropagation(); onTalk() }}
    >
      <Suspense fallback={null}>
        <MascotMesh mascot={mascot} />
      </Suspense>
    </group>
  )
}

// Walks the magic tree's floating orbs in a slow orbit — the tree model
// itself is built once (imperative THREE, via useArbolGround) so its parts
// are animated here by name instead of through React state.
function MagicTreeAnimator({ model }) {
  useFrame(() => {
    for (let i = 0; i < 4; i++) {
      const orb = model.getObjectByName(`arbol-orb-${i}`)
      if (!orb) continue
      const t = Date.now() * 0.001 + i * 1.2
      orb.position.set(Math.sin(t) * 1.2, 3.5 + Math.cos(t * 1.3) * 0.4, Math.cos(t) * 1.2)
    }
    const canopy = model.getObjectByName('arbol-canopy')
    if (canopy) canopy.rotation.y += 0.0015
  })
  return null
}

function ArbolScene({ model, jafetMascot, onTalkJafet }) {
  return (
    <>
      <color attach="background" args={['#06060f']} />
      <fog attach="fog" args={['#06060f', 18, 42]} />
      <ambientLight intensity={0.25} color="#334466" />
      <pointLight position={[0, 4, -7]} color="#98ca3f" intensity={8} distance={12} />
      <pointLight position={[2, 2, -2]} color="#6644aa" intensity={3} distance={8} />

      <primitive object={model} />
      <MagicTreeAnimator model={model} />
      <JafetNpc mascot={jafetMascot} onTalk={onTalkJafet} />
    </>
  )
}

// Accumulates distance walked while `active`, firing `onThreshold` once —
// used by the practice_basics mission to detect real movement, not a
// timer-based fake.
function MovementTracker({ playerPositionRef, active, threshold = 5, onThreshold }) {
  const lastPos = useRef(null)
  const traveled = useRef(0)
  const fired = useRef(false)
  useEffect(() => { if (!active) { lastPos.current = null; traveled.current = 0; fired.current = false } }, [active])
  useFrame(() => {
    if (!active || fired.current) return
    const p = playerPositionRef.current
    if (!p) return
    if (lastPos.current) {
      const dx = p.x - lastPos.current[0]; const dz = p.z - lastPos.current[2]
      traveled.current += Math.sqrt(dx * dx + dz * dz)
      if (traveled.current >= threshold) { fired.current = true; onThreshold() }
    }
    lastPos.current = [p.x, p.y, p.z]
  })
  return null
}

// ── Tutorial HUD ──────────────────────────────────────────────────────────────

function MissionRow({ mission, done, active }) {
  return (
    <div className={`flex items-start gap-3 rounded-xl border px-3 py-2.5 transition-all ${
      done   ? 'border-primary/30 bg-primary/5 opacity-60'
      : active ? 'border-primary bg-primary/10'
      : 'border-border bg-surface/40 opacity-50'
    }`}>
      <span className="mt-0.5 shrink-0 text-lg">{done ? '✅' : active ? mission.icon : '🔒'}</span>
      <div className="min-w-0 flex-1">
        <p className={`text-xs font-black leading-snug ${active ? 'text-text' : done ? 'text-text-muted line-through' : 'text-text-muted'}`}>
          {mission.title}
        </p>
        {active && <p className="mt-0.5 text-[10px] text-text-muted leading-snug">{mission.desc}</p>}
      </div>
      {active && <span className="shrink-0 rounded-full bg-primary/20 px-1.5 py-0.5 text-[9px] font-black text-primary">+{mission.xp} XP</span>}
    </div>
  )
}

// ── Intro cinematic — 10 lines, full screen, TTS + "Siguiente" (mirrors
// VrCueva.jsx's IntroCinematicOverlay) ──────────────────────────────────────

function IntroCinematicOverlay({ onDone }) {
  const [idx, setIdx] = useState(0)
  const [vis, setVis] = useState(false)
  const [ready, setReady] = useState(false)
  const skipRef = useRef(false)
  const LINES = ARBOL_INTRO_LINES

  useEffect(() => { setVis(false); setReady(false); const t = setTimeout(() => setVis(true), 100); return () => clearTimeout(t) }, [idx])

  useEffect(() => {
    if (skipRef.current) return
    const cancel = speakLine(LINES[idx], () => { if (!skipRef.current) setReady(true) })
    const t = setTimeout(() => setReady(true), 1500)
    return () => { cancel(); clearTimeout(t) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx])

  const goNext = () => {
    window.speechSynthesis?.cancel()
    if (idx >= LINES.length - 1) { skipRef.current = true; onDone() }
    else { setIdx((p) => p + 1) }
  }

  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center" style={{ background: 'rgba(4,8,4,0.97)' }}>
      <button type="button" onClick={() => { skipRef.current = true; window.speechSynthesis?.cancel(); onDone() }}
        className="absolute right-4 top-4 rounded-xl px-4 py-2 text-xs font-bold" style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.1)' }}>
        Omitir →
      </button>
      <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: 'rgba(255,255,255,0.07)' }}>
        <div className="h-full transition-all duration-700" style={{ width: `${(idx / (LINES.length - 1)) * 100}%`, background: 'linear-gradient(90deg,#98ca3f,#5ad1c8)' }} />
      </div>
      <div className="mx-auto max-w-2xl px-8 text-center" style={{ opacity: vis ? 1 : 0, transform: vis ? 'translateY(0)' : 'translateY(10px)', transition: 'opacity 0.5s,transform 0.5s' }}>
        <p className="text-xl font-light leading-relaxed sm:text-2xl" style={{ color: 'rgba(255,255,255,0.92)', fontStyle: 'italic', lineHeight: 1.75 }}>&ldquo;{LINES[idx]}&rdquo;</p>
        <p className="mt-6 text-[11px] tracking-widest" style={{ color: 'rgba(255,255,255,0.15)' }}>{idx + 1} / {LINES.length}</p>
      </div>
      <div className="absolute bottom-8 flex items-center gap-4 rounded-2xl px-5 py-3" style={{ background: 'rgba(10,20,10,0.9)', border: '1px solid rgba(152,202,63,0.25)' }}>
        <div className="flex h-10 w-10 items-center justify-center rounded-full text-xl" style={{ background: 'rgba(152,202,63,0.12)', border: '1px solid rgba(152,202,63,0.35)' }}>🧙‍♂️</div>
        <div><p className="text-xs font-black" style={{ color: '#bbe87a' }}>Jafet</p><p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.3)' }}>Guardián del Árbol</p></div>
        <button type="button" onClick={goNext} disabled={!ready} className="ml-2 rounded-xl px-4 py-2 text-xs font-black transition-all disabled:opacity-30"
          style={{ background: 'rgba(152,202,63,0.28)', color: '#bbe87a', border: '1px solid rgba(152,202,63,0.4)' }}>
          {idx >= LINES.length - 1 ? 'Entrar →' : 'Siguiente →'}
        </button>
      </div>
    </div>
  )
}

// Fading title card shown over the 3D scene while the reveal cinematic
// camera move plays — purely decorative, the actual camera work happens via
// runCinematic() back in the main component.
function RevealTitleCard() {
  const [vis, setVis] = useState(false)
  useEffect(() => {
    const t1 = setTimeout(() => setVis(true), 150)
    const t2 = setTimeout(() => setVis(false), 2200)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])
  return (
    <div className="pointer-events-none absolute inset-x-0 top-1/3 z-40 flex justify-center px-6"
      style={{ opacity: vis ? 1 : 0, transition: 'opacity 0.8s' }}>
      <p className="text-center text-3xl font-black sm:text-4xl" style={{ color: '#bbe87a', textShadow: '0 0 30px #98ca3f88' }}>
        🌳 El Árbol de Oliver Academy
      </p>
    </div>
  )
}

// ── In-Árbol avatar class picker — replaces the old trip to /vr/world-tree.
// Jafet presents every class right here; the Hacker node stays admin-only,
// same gate as WorldTree's. ──────────────────────────────────────────────────
function AvatarClassPicker({ isAdmin, onSelect, onClose }) {
  const classes = Object.values(PLAYER_CLASSES).filter((c) => c.id !== 'hacker' || isAdmin)
  return (
    <div className="absolute inset-x-0 bottom-0 z-30 flex flex-col gap-2 px-3 pb-4 sm:bottom-4 sm:left-1/2 sm:w-[420px] sm:-translate-x-1/2">
      <div className="rounded-2xl border border-border bg-surface/95 p-3 shadow-2xl backdrop-blur">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-xs font-black uppercase tracking-widest text-primary">Elige tu camino</p>
          <button type="button" onClick={onClose} className="text-text-muted hover:text-text">✕</button>
        </div>
        <div className="flex max-h-[50vh] flex-col gap-2 overflow-y-auto">
          {classes.map((cls) => (
            <button key={cls.id} type="button" onClick={() => onSelect(cls.id)}
              className="flex items-center gap-3 rounded-xl border p-2.5 text-left transition-all hover:scale-[1.01]"
              style={{ borderColor: `${cls.color}55`, background: `${cls.color}0c` }}>
              <span className="text-3xl">{cls.icon}</span>
              <div className="flex-1">
                <p className="text-sm font-black text-text">{cls.name}</p>
                <p className="text-[10px] leading-snug text-text-muted">{cls.description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── "You picked a class" flash — same gold-burst language as
// LevelUpAnnouncer's VR variant, recolored per class, reused for both the
// Avatar's and Oliver's class pick. ──────────────────────────────────────────
function ClassRevealAnnouncer({ cls, ownerLabel, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3600)
    return () => clearTimeout(t)
  }, [onDone])
  if (!cls) return null
  return (
    <div className="pointer-events-none fixed inset-0 z-[210] flex items-center justify-center">
      <div className="absolute inset-0" style={{ background: `radial-gradient(circle, ${cls.color}33 0%, rgba(0,0,0,0) 65%)`, animation: 'arbolclass-flash 0.6s ease-out' }} />
      <div className="flex flex-col items-center gap-3" style={{ animation: 'arbolclass-pop 0.5s cubic-bezier(0.34,1.56,0.64,1)' }}>
        <p className="text-xs font-black uppercase tracking-widest" style={{ color: cls.color }}>{ownerLabel}</p>
        <span className="text-6xl">{cls.icon}</span>
        <p className="text-4xl font-black" style={{ color: '#fff', textShadow: `0 0 30px ${cls.color}` }}>{cls.name}</p>
        <p className="max-w-sm text-center text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>{cls.description}</p>
      </div>
      <style>{`
        @keyframes arbolclass-flash { 0% { opacity: 0; } 30% { opacity: 1; } 100% { opacity: 0.4; } }
        @keyframes arbolclass-pop { 0% { transform: scale(0.6); opacity: 0; } 60% { transform: scale(1.08); opacity: 1; } 100% { transform: scale(1); opacity: 1; } }
      `}</style>
    </div>
  )
}

// ── Ability reveal — shows the starting skills both characters just
// unlocked. No combat/cast system exists anywhere in the app yet, so this is
// a reveal card, not a live test — the honest scope for today. ─────────────
function AbilityRevealCard({ playerClass, oliverClass, onDone }) {
  const pCls = PLAYER_CLASSES[playerClass]
  const oCls = OLIVER_CLASSES[oliverClass]
  const groups = [
    { label: 'Tu Avatar', cls: pCls },
    { label: 'Tu mascota', cls: oCls },
  ]
  return (
    <div className="fixed inset-0 z-[210] flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl border border-border bg-background p-6 shadow-2xl">
        <p className="mb-4 text-center text-lg font-black text-text">✨ Habilidades desbloqueadas</p>
        <div className="flex flex-col gap-4">
          {groups.map(({ label, cls }) => cls && (
            <div key={label}>
              <p className="mb-1.5 text-[10px] font-black uppercase tracking-widest" style={{ color: cls.color }}>{label} · {cls.name}</p>
              <div className="flex flex-col gap-1.5">
                {cls.startSkills.map((sid) => {
                  const skill = SKILL_REGISTRY[sid]
                  if (!skill) return null
                  return (
                    <div key={sid} className="flex items-center gap-2.5 rounded-xl border px-3 py-2" style={{ borderColor: `${skill.vfxColor}55`, background: `${skill.vfxColor}11` }}>
                      <span className="text-2xl">{skill.icon}</span>
                      <div>
                        <p className="text-xs font-black text-text">{skill.name}</p>
                        <p className="text-[10px] text-text-muted">{skill.description}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
        <button type="button" onClick={onDone}
          className="mt-5 w-full rounded-2xl bg-primary py-3 text-sm font-black text-background hover:bg-primary/80">
          ¡Entendido, estoy listo!
        </button>
      </div>
    </div>
  )
}

// ── Dialogue box ──────────────────────────────────────────────────────────────

function DialogueBox({ messages, onClose, onUserMessage, isLoading, activeMissionId, onAction }) {
  const [input, setInput] = useState('')
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = () => {
    if (!input.trim()) return
    onUserMessage(input.trim())
    setInput('')
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 sm:absolute sm:inset-auto sm:bottom-4 sm:right-4 sm:w-80">
      <div className="flex flex-col rounded-t-3xl sm:rounded-3xl border border-border bg-surface/95 shadow-2xl backdrop-blur-sm"
        style={{ maxHeight: '55vh', minHeight: '200px' }}>
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-border px-4 py-3">
          <span className="text-2xl">🧙‍♂️</span>
          <div className="flex-1">
            <p className="text-sm font-black text-text">Jafet</p>
            <p className="text-[10px] text-primary">Guardián del Árbol</p>
          </div>
          <button type="button" onClick={onClose}
            className="text-text-muted hover:text-text text-lg leading-none">×</button>
        </div>

        {/* Messages */}
        <div className="flex flex-col gap-2 overflow-y-auto p-3">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-xs leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-primary text-background rounded-br-sm'
                  : 'bg-background text-text rounded-bl-sm border border-border'
              }`}>
                {msg.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="rounded-2xl rounded-bl-sm bg-background border border-border px-3 py-2">
                <span className="text-text-muted text-xs animate-pulse">Jafet está escribiendo…</span>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Mission action button */}
        {activeMissionId && (
          <div className="border-t border-border px-3 py-2">
            <ActionButton missionId={activeMissionId} onAction={onAction} />
          </div>
        )}

        {/* Input — this is the "exclusive" test chat: free text + AI reply via
            sendNpcMessage, completely separate from the mascot's chat store. */}
        <div className="flex gap-2 border-t border-border p-3">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send()}
            placeholder="Pregúntale algo a Jafet…"
            className="flex-1 rounded-xl border border-border bg-background px-3 py-2 text-xs text-text outline-none focus:border-primary"
          />
          <button type="button" onClick={send}
            className="rounded-xl bg-primary px-3 py-2 text-xs font-black text-background hover:bg-primary/80">
            →
          </button>
        </div>
      </div>
    </div>
  )
}

function ActionButton({ missionId, onAction }) {
  const labels = {
    practice_basics:     null,   // completes automatically (move + send a message)
    choose_avatar_class: '🌳 Elegir mi clase',
    choose_mascot:       '🐾 Elegir compañero',
    mascot_class:        null,   // handled inside VrMascotOnboarding
    test_ability:        '✨ Ver mis habilidades',
    setup_ai:            '⚙️ Ir a Ajustes',
    first_chat:          '💬 Abrir chat',
    enter_campus:        '🏛️ Entrar al Campus',
  }
  const skips = { setup_ai: '⏭️ Saltar por ahora' }

  const label = labels[missionId]
  const skip  = skips[missionId]
  if (!label && !skip) return null

  return (
    <div className="flex gap-2">
      {label && (
        <button type="button" onClick={() => onAction(missionId, 'do')}
          className="flex-1 rounded-xl bg-primary py-2 text-xs font-black text-background hover:bg-primary/80">
          {label}
        </button>
      )}
      {skip && (
        <button type="button" onClick={() => onAction(missionId, 'skip')}
          className="rounded-xl border border-border px-3 py-2 text-xs font-bold text-text-muted hover:bg-surface">
          {skip}
        </button>
      )}
    </div>
  )
}

// Tells the page when the player has walked close enough to Jafet to talk —
// same proximity-prompt pattern as every other VR world's NPCs.
function JafetProximity({ playerPositionRef, onNearChange }) {
  const wasNear = useRef(false)
  useFrame(() => {
    const pos = playerPositionRef.current
    if (!pos) return
    const dx = pos.x - ARBOL_JAFET_POS[0]
    const dz = pos.z - ARBOL_JAFET_POS[2]
    const near = Math.sqrt(dx * dx + dz * dz) < 3.5
    if (near !== wasNear.current) {
      wasNear.current = near
      onNearChange(near)
    }
  })
  return null
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function VrArbol() {
  const navigate = useNavigate()

  const avatarId = useGameStore((s) => s.player.avatarId)
  const playerClassId    = useGameStore((s) => s.player.class)
  const oliverClass      = useGameStore((s) => s.oliver.class)
  const forceSyncToCloud = useGameStore((s) => s.forceSyncToCloud)
  const isAdmin = useAuthStore((s) => s.isAdmin)?.()

  const { done, completeStep, isTutorialComplete } = useTutorialStore()

  const chatMessages = useChatStore((s) => s.messages)
  const skin = getSkinById(useMascotStore((s) => s.selectedSkinId))

  // 'intro' (10-line cinematic) → 'reveal' (camera settles on Jafet) → 'play'.
  // Returning players who already met Jafet skip straight to 'play'.
  const [phase, setPhase] = useState(() => (done.includes('meet_jafet') ? 'play' : 'intro'))
  const [showDialogue, setShowDialogue]         = useState(false)
  const [dialogueMessages, setDialogueMessages] = useState([])
  const [isJafetTyping, setIsJafetTyping]       = useState(false)
  const [showMascotOnboarding, setShowMascotOnboarding] = useState(false)
  const [showClassPicker, setShowClassPicker]   = useState(false)
  const [showAbilityReveal, setShowAbilityReveal] = useState(false)
  const [classReveal, setClassReveal]           = useState(null) // { cls, ownerLabel } | null
  const [nearJafet, setNearJafet]               = useState(false)
  const [talkedFreely, setTalkedFreely]         = useState(false)
  const [movedEnough, setMovedEnough]           = useState(false)
  // Tracks which JAFET_DIALOGUE key was last spoken, so announce() never
  // repeats itself within one mount but still speaks fresh content whenever
  // the active step actually changes.
  const lastSpokenRef = useRef('')
  const cinematicLockRef = useRef(false)
  if (phase !== 'play') cinematicLockRef.current = true

  const avatarModel = PLAYER_AVATARS.find((a) => a.id === avatarId) ?? PLAYER_AVATARS[0]
  const jafetMascot = getMascotById(JAFET.mascotId)

  // Shared VR movement engine — same WASD/drag-look/touch/gamepad system as
  // Campus, Room, Anfiteatro and the Cueva de Platón.
  const { model: groundModel, groundRayHeight } = useArbolGround()
  const keysRef = useMovementKeys()
  const { camera: cameraRef, onPointerDown, onPointerMove, onPointerUp, onWheel } = useCameraControls()
  const playerPositionRef = useRef(null)

  // Detect which mission is currently active (first not done)
  const activeMission = TUTORIAL_MISSIONS.find(m => !done.includes(m.id)) ?? null
  const tutorialDone = activeMission === null

  // Reveal cinematic: wide establishing shot of the tree, then settle on
  // Jafet, then hand control to the player.
  useEffect(() => {
    if (phase !== 'reveal') return
    const cam = cameraRef.current
    cam.distance = cam.targetDistance = 11
    cam.pitch = 0.42
    cam.yaw = 0.05
    runCinematic(cameraRef, cinematicLockRef, { pitch: 0.2, distance: 3.2, yaw: -0.3 }, 2600, () => {
      setPhase('play')
      completeStep('meet_jafet')
      setTimeout(openDialogue, 300)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase])

  // practice_basics completes once the player has moved AND sent at least
  // one free-text message to Jafet — both are real, not timers.
  useEffect(() => {
    if (activeMission?.id === 'practice_basics' && talkedFreely && movedEnough) {
      completeStep('practice_basics')
      announce('choose_avatar_class')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [talkedFreely, movedEnough, activeMission])

  // Detect first_chat completion when chat store gets a message
  useEffect(() => {
    if (chatMessages.length > 0 && !done.includes('first_chat') && activeMission?.id === 'first_chat') {
      completeStep('first_chat')
      announce('enter_campus')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatMessages.length, done, completeStep, activeMission])

  // Sync to cloud the moment the whole tutorial wraps up
  useEffect(() => {
    if (isTutorialComplete()) forceSyncToCloud().catch(() => {})
  }, [done, isTutorialComplete, forceSyncToCloud])

  // Welcome the player back if they return mid-tutorial with the dialogue
  // closed — covers simply leaving and coming back later. Runs once on
  // mount only: a FRESH player has phase='intro' here (done.length===0, so
  // this no-ops) and picks up the conversation itself once the reveal
  // cinematic finishes; this effect is only for a player who already has
  // progress and reloads straight into 'play'.
  useEffect(() => {
    if (phase !== 'play' || done.length === 0 || tutorialDone) return
    const t = setTimeout(() => {
      if (!showDialogue && !showMascotOnboarding) {
        runCinematic(cameraRef, cinematicLockRef, { pitch: 0.22, distance: 2.6 })
        openDialogue()
      }
    }, 900)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // F key talks to Jafet when nearby, same shortcut as every other VR world
  useEffect(() => {
    const handler = (e) => {
      if (e.code === 'KeyF' && nearJafet && phase === 'play' && !showDialogue && !showMascotOnboarding && !tutorialDone) {
        openDialogue()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nearJafet, showDialogue, showMascotOnboarding, tutorialDone, phase])

  // Push Jafet message helper
  function pushJafet(text) {
    setDialogueMessages(prev => [...prev, { role: 'assistant', content: text }])
  }

  // Speaks the lines for `key` unless they were already the last thing said
  // — safe to call redundantly from multiple places (open, action buttons,
  // auto-detected step completions).
  function announce(key) {
    if (!key || key === lastSpokenRef.current) return
    lastSpokenRef.current = key
    const lines = JAFET_DIALOGUE[key] ?? []
    lines.forEach((line, i) => setTimeout(() => pushJafet(line), i * 700))
    if (key === 'done') {
      runCinematic(cameraRef, cinematicLockRef, { pitch: 0.25, distance: 2.4 })
    }
  }

  function openDialogue() {
    announce(activeMission?.id ?? 'done')
    setShowDialogue(true)
  }

  async function handleUserMessage(text) {
    setDialogueMessages(prev => [...prev, { role: 'user', content: text }])
    setIsJafetTyping(true)
    if (activeMission?.id === 'practice_basics') setTalkedFreely(true)
    try {
      const reply = await sendNpcMessage({
        npcPrompt: JAFET.aiPrompt,
        content: text,
        history: dialogueMessages,
      })
      pushJafet(reply)
    } catch {
      pushJafet('Parece que hay interferencia mágica… inténtalo de nuevo. 🌀')
    } finally {
      setIsJafetTyping(false)
    }
  }

  function handleMissionAction(missionId, action) {
    if (action === 'skip') {
      completeStep(missionId)
      const idx = TUTORIAL_MISSIONS.findIndex(m => m.id === missionId)
      announce(TUTORIAL_MISSIONS[idx + 1]?.id)
      return
    }

    if (missionId === 'choose_avatar_class') {
      setShowClassPicker(true)
      setShowDialogue(false)
    }

    if (missionId === 'choose_mascot') {
      setShowMascotOnboarding(true)
      setShowDialogue(false)
    }

    if (missionId === 'test_ability') {
      setShowAbilityReveal(true)
      setShowDialogue(false)
    }

    if (missionId === 'setup_ai') {
      navigate('/ajustes')
    }

    if (missionId === 'first_chat') {
      pushJafet('¡Abre el menú de tu mascota (el botón 🐱 abajo a la derecha) y envíale un mensaje!')
    }

    if (missionId === 'enter_campus') {
      completeStep('enter_campus')
      announce('done')
      setTimeout(() => navigate('/vr'), 2400)
    }
  }

  function handleSelectAvatarClass(classId) {
    useGameStore.getState().selectPlayerClass(classId)
    setShowClassPicker(false)
    completeStep('choose_avatar_class')
    setClassReveal({ cls: PLAYER_CLASSES[classId], ownerLabel: 'Tu Avatar es' })
    setTimeout(() => { setClassReveal(null); setShowDialogue(true); announce('choose_mascot') }, 3700)
  }

  // VrMascotOnboarding finished → completes both the model+name step and
  // the mascot's class step, since that single modal covers both.
  function handleMascotOnboardingDone() {
    setShowMascotOnboarding(false)
    completeStep('choose_mascot')
    completeStep('mascot_class')
    const newOliverClass = useGameStore.getState().oliver.class
    setClassReveal({ cls: OLIVER_CLASSES[newOliverClass], ownerLabel: 'Tu mascota es' })
    setTimeout(() => { setClassReveal(null); setShowDialogue(true); announce('test_ability') }, 3700)
  }

  return (
    <div
      className="relative h-screen w-screen overflow-hidden bg-[#06060f]"
      style={{ touchAction: 'none' }}
      onPointerDown={(e) => { if (!cinematicLockRef.current) onPointerDown(e) }}
      onPointerMove={(e) => { if (!cinematicLockRef.current) onPointerMove(e) }}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp}
      onWheel={(e) => { if (!cinematicLockRef.current) onWheel(e) }}
    >

      {/* ── 3D Canvas ── */}
      <Canvas camera={{ position: [0, 2, 6], fov: 60 }} className="absolute inset-0">
        <Physics gravity={[0, -20, 0]}>
          <Suspense fallback={null}>
            <ArbolScene model={groundModel} jafetMascot={jafetMascot} onTalkJafet={openDialogue} />
            <Player
              mascot={avatarModel}
              skin={skin}
              scenery={groundModel}
              groundRayHeight={groundRayHeight}
              keysRef={keysRef}
              cameraRef={cameraRef}
              playerPositionRef={playerPositionRef}
              spawnAt={ARBOL_SPAWN}
            />
            <JafetProximity playerPositionRef={playerPositionRef} onNearChange={setNearJafet} />
            <MovementTracker
              playerPositionRef={playerPositionRef}
              active={phase === 'play' && activeMission?.id === 'practice_basics'}
              onThreshold={() => setMovedEnough(true)}
            />
          </Suspense>
        </Physics>
      </Canvas>

      {/* ── Reveal title card ── */}
      {phase === 'reveal' && <RevealTitleCard />}

      {/* ── Touch controls ── */}
      {phase === 'play' && !showDialogue && !showMascotOnboarding && !showClassPicker && !showAbilityReveal && (
        <>
          <VirtualJoystick keysRef={keysRef} />
          <MobileButtons keysRef={keysRef} />
        </>
      )}

      {/* ── Top title ── */}
      {phase === 'play' && (
        <div className="pointer-events-none absolute left-0 right-0 top-0 flex justify-center pt-5">
          <div className="rounded-2xl border border-primary/20 bg-black/60 px-5 py-2 backdrop-blur-sm">
            <p className="text-center text-sm font-black text-primary">🌳 El Árbol de Oliver Academy</p>
            <p className="text-center text-[10px] text-text-muted">Mundo tutorial — completa tus misiones para ir al campus</p>
          </div>
        </div>
      )}

      {/* ── Left panel: Tutorial missions ── */}
      {phase === 'play' && (
        <div className="absolute left-3 top-16 z-20 w-60 sm:w-64">
          <div className="rounded-2xl border border-border bg-black/70 p-3 backdrop-blur-sm">
            <p className="mb-2 text-[10px] font-black uppercase tracking-wider text-primary">Tutorial de Jafet</p>
            <div className="flex flex-col gap-1.5">
              {TUTORIAL_MISSIONS.map((m) => (
                <MissionRow
                  key={m.id}
                  mission={m}
                  done={done.includes(m.id)}
                  active={activeMission?.id === m.id}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Talk to Jafet prompt — only when close enough to him ── */}
      {phase === 'play' && nearJafet && !showDialogue && !showMascotOnboarding && !tutorialDone && (
        <div className="absolute bottom-20 left-1/2 z-20 -translate-x-1/2">
          <button type="button" onClick={openDialogue}
            className="flex items-center gap-2 rounded-2xl border border-primary/40 bg-black/80 px-6 py-3 font-black text-primary shadow-lg backdrop-blur-sm animate-pulse hover:bg-primary hover:text-background transition-all">
            <span className="hidden sm:inline">F — </span>🧙‍♂️ Hablar con Jafet
          </button>
        </div>
      )}
      {phase === 'play' && !nearJafet && !showDialogue && !showMascotOnboarding && !tutorialDone && (
        <div className="pointer-events-none absolute bottom-20 left-1/2 z-20 -translate-x-1/2 rounded-2xl border border-border bg-black/60 px-4 py-2 text-xs text-text-muted backdrop-blur-sm">
          🚶 Camina (WASD) hacia Jafet, bajo el árbol
        </div>
      )}

      {/* ── Tutorial complete banner ── */}
      {phase === 'play' && tutorialDone && (
        <div className="absolute inset-x-0 bottom-0 z-20 flex flex-col items-center gap-4 bg-gradient-to-t from-black/90 to-transparent px-4 pb-8 pt-16">
          <div className="text-center">
            <p className="text-4xl">🎉</p>
            <p className="text-xl font-black text-primary">¡Tutorial completado!</p>
            <p className="text-sm text-text-muted">Ya eres parte de Oliver Academy. El campus te espera.</p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/vr')}
            className="rounded-2xl bg-primary px-10 py-4 text-lg font-black text-background shadow-lg transition-all hover:scale-105 hover:bg-primary/80">
            🌍 Ir al Campus VR
          </button>
        </div>
      )}

      {/* ── Dialogue box ── */}
      {phase === 'play' && showDialogue && !showMascotOnboarding && !showClassPicker && !showAbilityReveal && (
        <DialogueBox
          messages={dialogueMessages}
          onClose={() => setShowDialogue(false)}
          onUserMessage={handleUserMessage}
          isLoading={isJafetTyping}
          activeMissionId={activeMission?.id}
          onAction={handleMissionAction}
        />
      )}

      {/* ── Avatar class picker (mission 3) ── */}
      {showClassPicker && (
        <AvatarClassPicker isAdmin={isAdmin} onSelect={handleSelectAvatarClass} onClose={() => setShowClassPicker(false)} />
      )}

      {/* ── Mascot onboarding overlay (missions 4+5) ── */}
      {showMascotOnboarding && !oliverClass && (
        <VrMascotOnboarding onDone={handleMascotOnboardingDone} />
      )}

      {/* ── Ability reveal (mission 6) ── */}
      {showAbilityReveal && (
        <AbilityRevealCard
          playerClass={playerClassId}
          oliverClass={oliverClass}
          onDone={() => { setShowAbilityReveal(false); completeStep('test_ability'); setShowDialogue(true); announce('setup_ai') }}
        />
      )}

      {/* ── Class reveal flash (avatar or mascot) ── */}
      {classReveal && <ClassRevealAnnouncer cls={classReveal.cls} ownerLabel={classReveal.ownerLabel} onDone={() => setClassReveal(null)} />}

      {/* ── Intro cinematic (10 lines, TTS) ── */}
      {phase === 'intro' && (
        <IntroCinematicOverlay onDone={() => setPhase('reveal')} />
      )}

      {/* ── Floating mascot companion — only once a mascot actually exists ── */}
      {oliverClass && <MascotCompanion />}
    </div>
  )
}
