/**
 * VrArbol — Mundo tutorial del Árbol de Oliver Academy
 *
 * Flujo (ver src/data/tutorialMissions.js):
 *   1. Habla con Jafet (scripted + AI opcional)
 *   2. Elige la clase de tu Avatar (viaje de ida y vuelta a /vr/world-tree)
 *   3. Elige tu mascota (abre VrMascotOnboarding)
 *   4. Elige la clase de tu mascota (dentro del mismo modal)
 *   5. Configura IA de la mascota (opcional / skip)
 *   6. Primera conversación con la mascota
 *   7. Entra al Campus VR
 */
import { Suspense, useEffect, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Physics } from '@react-three/rapier'
import * as THREE from 'three'
import { useNavigate } from 'react-router-dom'
import { useGameStore, PLAYER_AVATARS } from '../../stores/useGameStore'
import { useTutorialStore } from '../../stores/useTutorialStore'
import { useChatStore } from '../../stores/useChatStore'
import { useMascotStore } from '../../stores/useMascotStore'
import { getMascotById } from '../../data/mascotRegistry'
import { getSkinById } from '../../data/skinsRegistry'
import { TUTORIAL_MISSIONS } from '../../data/tutorialMissions'
import { sendNpcMessage } from '../../services/chat/npcTransport'
import VrMascotOnboarding from './VrMascotOnboarding'
import MascotMesh from '../mascot/MascotMesh'
import MascotCompanion from '../mascot/MascotCompanion'
import { Player, useCameraControls, useMovementKeys, VirtualJoystick, MobileButtons } from './engine'
import { useArbolGround, ARBOL_JAFET_POS, ARBOL_SPAWN } from './worlds/useArbolGround'

// Eases the existing third-person orbit camera (the same yaw/pitch/distance
// object <Player> already reads every frame — see engine/camera.js) to a
// tighter, more "directed" framing over `ms`, locking out manual drag input
// for that window via lockedRef. Only used at 2-3 key narrative beats; the
// rest of the time the camera stays fully player-controlled.
function runCinematic(cameraRef, lockedRef, { pitch, distance }, ms = 1800) {
  lockedRef.current = true
  const cam = cameraRef.current
  const start = { pitch: cam.pitch, targetDistance: cam.targetDistance }
  const t0 = performance.now()
  function tick() {
    const t = Math.min(1, (performance.now() - t0) / ms)
    const e = 1 - (1 - t) ** 3
    cam.pitch = start.pitch + (pitch - start.pitch) * e
    cam.targetDistance = start.targetDistance + (distance - start.targetDistance) * e
    if (t < 1) requestAnimationFrame(tick)
    else lockedRef.current = false
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
// both the first time a step starts and when the player returns to it (e.g.
// after the choose_avatar_class round-trip to /vr/world-tree, which fully
// remounts this page). See announce()/openDialogue() below.
const JAFET_DIALOGUE = {
  initial: [
    '¡Bienvenido al Árbol de Oliver Academy! 🌳 Soy Jafet, el guardián de este lugar.',
    'Aquí empieza tu aventura: vas a elegir tu camino, conocer a tu compañero y subir varios niveles antes de entrar al campus.',
    '¿Listo para empezar? ¡Vamos a hacerlo juntos! 🧙‍♂️',
  ],
  choose_avatar_class: [
    '¡Ese es el espíritu! 🌟 Lo primero es lo primero: ¿qué camino quieres seguir?',
    'En el Árbol del Mundo encontrarás las clases disponibles para tu Avatar. Elige la que más te guste — luego tu mascota elegirá una que la complemente.',
  ],
  choose_mascot: [
    '¡Bien elegido! Ese camino te queda perfecto. ⚔️',
    'Ahora necesitas un compañero de viaje. Cada mascota tiene su propio estilo — elige la que sientas más cercana a ti.',
  ],
  mascot_class: [
    '¡Un compañero increíble! 🐾 Pero un compañero sin clase es como un hechicero sin grimorio…',
    'Elige su clase con cuidado: algunas combinan mejor con tu camino que otras, aunque al final la decisión es toda tuya.',
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
      // Local to the tree group (already offset to z=-7), matching the
      // original orbit radius/height around the canopy.
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

        {/* Input */}
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
    meet_jafet:          '✅ ¡Hola Jafet!',
    choose_avatar_class: '🌳 Ir al Árbol del Mundo',
    choose_mascot:       '🐾 Elegir compañero',
    mascot_class:        null,   // handled inside VrMascotOnboarding
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
  const oliverClass      = useGameStore((s) => s.oliver.class)
  const forceSyncToCloud = useGameStore((s) => s.forceSyncToCloud)

  const { done, completeStep, isTutorialComplete } = useTutorialStore()

  const chatMessages = useChatStore((s) => s.messages)
  const skin = getSkinById(useMascotStore((s) => s.selectedSkinId))

  const [showDialogue, setShowDialogue]         = useState(false)
  const [dialogueMessages, setDialogueMessages] = useState([])
  const [isJafetTyping, setIsJafetTyping]       = useState(false)
  const [showMascotOnboarding, setShowMascotOnboarding] = useState(false)
  const [nearJafet, setNearJafet]               = useState(false)
  // Tracks which JAFET_DIALOGUE key was last spoken, so announce() never
  // repeats itself within one mount but still speaks fresh content whenever
  // the active step actually changes (including right after returning from
  // the /vr/world-tree round-trip, which remounts this whole page).
  const lastSpokenRef = useRef('')
  const cinematicLockRef = useRef(false)

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

  // Detect first_chat completion when chat store gets a message
  useEffect(() => {
    if (chatMessages.length > 0 && !done.includes('first_chat')) {
      completeStep('first_chat')
      announce('enter_campus')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatMessages.length, done, completeStep])

  // Sync to cloud the moment the whole tutorial wraps up
  useEffect(() => {
    if (isTutorialComplete()) forceSyncToCloud().catch(() => {})
  }, [done, isTutorialComplete, forceSyncToCloud])

  // Welcome the player back if they return mid-tutorial with the dialogue
  // closed — covers both the choose_avatar_class round-trip (this page fully
  // remounts when navigating to /vr/world-tree and back) and simply leaving
  // and coming back later.
  useEffect(() => {
    if (done.length === 0 || tutorialDone) return
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
      if (e.code === 'KeyF' && nearJafet && !showDialogue && !showMascotOnboarding && !tutorialDone) {
        openDialogue()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nearJafet, showDialogue, showMascotOnboarding, tutorialDone])

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
    // Cinematic camera moment at the two narrative bookends — meeting Jafet
    // for the first time, and his closing farewell.
    if (key === 'initial' || key === 'done') {
      runCinematic(cameraRef, cinematicLockRef, { pitch: 0.25, distance: 2.4 })
    }
  }

  function openDialogue() {
    announce(!done.includes('meet_jafet') ? 'initial' : (activeMission?.id ?? 'done'))
    setShowDialogue(true)
  }

  async function handleUserMessage(text) {
    setDialogueMessages(prev => [...prev, { role: 'user', content: text }])
    setIsJafetTyping(true)
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

    if (missionId === 'meet_jafet') {
      completeStep('meet_jafet')
      announce('choose_avatar_class')
    }

    if (missionId === 'choose_avatar_class') {
      // Standalone world (different route/Canvas) — leave a breadcrumb so
      // WorldTree's class-selection flow knows to send the player back here
      // once they've picked their class, instead of its normal default.
      useTutorialStore.getState().setReturnTo('/vr-arbol')
      navigate('/vr/world-tree')
    }

    if (missionId === 'choose_mascot') {
      setShowMascotOnboarding(true)
      setShowDialogue(false)
    }

    if (missionId === 'setup_ai') {
      navigate('/ajustes')
    }

    if (missionId === 'first_chat') {
      // MascotCompanion handles the chat — we just hint the user
      pushJafet('¡Abre el menú de tu mascota (el botón 🐱 abajo a la derecha) y envíale un mensaje!')
    }

    if (missionId === 'enter_campus') {
      completeStep('enter_campus')
      announce('done')
      setTimeout(() => navigate('/vr'), 2400)
    }
  }

  // VrMascotOnboarding finished → completes both the model+name step and
  // the mascot's class step, since that single modal covers both.
  function handleMascotOnboardingDone() {
    setShowMascotOnboarding(false)
    completeStep('choose_mascot')
    completeStep('mascot_class')
    setShowDialogue(true)
    announce('mascot_class')
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
          </Suspense>
        </Physics>
      </Canvas>

      {/* ── Touch controls ── */}
      {!showDialogue && !showMascotOnboarding && (
        <>
          <VirtualJoystick keysRef={keysRef} />
          <MobileButtons keysRef={keysRef} />
        </>
      )}

      {/* ── Top title ── */}
      <div className="pointer-events-none absolute left-0 right-0 top-0 flex justify-center pt-5">
        <div className="rounded-2xl border border-primary/20 bg-black/60 px-5 py-2 backdrop-blur-sm">
          <p className="text-center text-sm font-black text-primary">🌳 El Árbol de Oliver Academy</p>
          <p className="text-center text-[10px] text-text-muted">Mundo tutorial — completa tus misiones para ir al campus</p>
        </div>
      </div>

      {/* ── Left panel: Tutorial missions ── */}
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

      {/* ── Talk to Jafet prompt — only when close enough to him ── */}
      {nearJafet && !showDialogue && !showMascotOnboarding && !tutorialDone && (
        <div className="absolute bottom-20 left-1/2 z-20 -translate-x-1/2">
          <button type="button" onClick={openDialogue}
            className="flex items-center gap-2 rounded-2xl border border-primary/40 bg-black/80 px-6 py-3 font-black text-primary shadow-lg backdrop-blur-sm animate-pulse hover:bg-primary hover:text-background transition-all">
            <span className="hidden sm:inline">F — </span>🧙‍♂️ Hablar con Jafet
          </button>
        </div>
      )}
      {!nearJafet && !showDialogue && !showMascotOnboarding && !tutorialDone && (
        <div className="pointer-events-none absolute bottom-20 left-1/2 z-20 -translate-x-1/2 rounded-2xl border border-border bg-black/60 px-4 py-2 text-xs text-text-muted backdrop-blur-sm">
          🚶 Camina (WASD) hacia Jafet, bajo el árbol
        </div>
      )}

      {/* ── Tutorial complete banner ── */}
      {tutorialDone && (
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
      {showDialogue && !showMascotOnboarding && (
        <DialogueBox
          messages={dialogueMessages}
          onClose={() => setShowDialogue(false)}
          onUserMessage={handleUserMessage}
          isLoading={isJafetTyping}
          activeMissionId={activeMission?.id}
          onAction={handleMissionAction}
        />
      )}

      {/* ── Mascot onboarding overlay (missions 2+3) ── */}
      {showMascotOnboarding && !oliverClass && (
        <VrMascotOnboarding onDone={handleMascotOnboardingDone} />
      )}

      {/* ── Floating mascot companion (for mission 5: first chat) ── */}
      <MascotCompanion />
    </div>
  )
}
