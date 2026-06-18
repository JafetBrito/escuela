/**
 * VrArbol — Mundo tutorial del Árbol de Oliver School
 *
 * Flujo:
 *   1. Habla con Jafet (scripted + AI opcional)
 *   2. Elige tu mascota (abre VrMascotOnboarding)
 *   3. Elige la clase de tu mascota
 *   4. Configura IA de la mascota (opcional / skip)
 *   5. Primera conversación con la mascota
 *   → Ir al Campus VR desbloqueado
 */
import { Suspense, useEffect, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { useNavigate } from 'react-router-dom'
import { useGameStore } from '../../stores/useGameStore'
import { useTutorialStore } from '../../stores/useTutorialStore'
import { useChatStore } from '../../stores/useChatStore'
import { getMascotById } from '../../data/mascotRegistry'
import { TUTORIAL_MISSIONS } from '../../data/tutorialMissions'
import { sendNpcMessage } from '../../services/chat/npcTransport'
import VrMascotOnboarding from './VrMascotOnboarding'
import MascotMesh from '../mascot/MascotMesh'
import MascotCompanion from '../mascot/MascotCompanion'

// ── NPC Jafet definition ──────────────────────────────────────────────────────
const JAFET = {
  id: 'jafet',
  name: 'Jafet',
  emoji: '🧙‍♂️',
  color: '#98ca3f',
  mascotId: 10,   // mage_elder.glb
  aiPrompt: `Eres Jafet, el guardián del Árbol de Oliver School. Eres sabio, cercano y con buen humor.
Guías a los nuevos estudiantes a través del tutorial de bienvenida.
Hablas en español, eres entusiasta del aprendizaje y del mundo mágico de Oliver School.
Nunca salgas del personaje. Usa emojis ocasionalmente para ser expresivo.`,
}

// ── Scripted dialogue per tutorial step ──────────────────────────────────────
const JAFET_DIALOGUE = {
  initial: [
    '¡Bienvenido al Árbol de Oliver School! 🌳 Soy Jafet, tu guía en este mundo mágico.',
    'Aquí comenzará tu aventura. Pero primero, necesito conocerte mejor y presentarte a tu compañero.',
    '¿Estás listo para empezar? ¡Vamos a hacer esto juntos! 🧙‍♂️',
  ],
  meet_jafet: [
    '¡Excelente! Ya nos conocemos. Ese es el primer paso. 🌟',
    'Ahora, lo más importante: elegir a tu compañero de aventuras.',
  ],
  choose_mascot: [
    '¡Un compañero increíble! Cada modelo tiene su propia personalidad y estilo.',
    'Pero un compañero sin clase es como un hechicero sin grimorio...',
  ],
  mascot_class: [
    '¡Perfecto! Tu compañero ahora tiene poderes únicos. ⚔️',
    'Ahora viene algo opcional pero muy poderoso: darle una mente de IA real.',
  ],
  setup_ai: [
    '¡Tu compañero está casi listo! 🤖',
    'El último paso es el más importante: ¡habla con él! Una primera conversación siempre es especial.',
  ],
  first_chat: [
    '¡Lo lograste! Has completado el tutorial del Árbol. 🎉',
    'Ahora eres parte de Oliver School. El campus virtual te espera con nuevas aventuras, clases y batallas.',
    '¡Nos veremos en el campus, estudiante! 🌍',
  ],
}

// ── 3D Scene components ───────────────────────────────────────────────────────

function MagicTree() {
  const trunkRef = useRef()
  const canopyRef = useRef()
  const orbs = useRef([])

  useFrame((_, delta) => {
    if (canopyRef.current) {
      canopyRef.current.rotation.y += delta * 0.08
    }
    orbs.current.forEach((orb, i) => {
      if (!orb) return
      const t = Date.now() * 0.001 + i * 1.2
      orb.position.x = Math.sin(t) * 1.2
      orb.position.y = 3.5 + Math.cos(t * 1.3) * 0.4
      orb.position.z = Math.cos(t) * 1.2
    })
  })

  return (
    <group position={[0, 0, -7]}>
      {/* Trunk */}
      <mesh ref={trunkRef} position={[0, 1, 0]}>
        <cylinderGeometry args={[0.25, 0.4, 2.5, 8]} />
        <meshStandardMaterial color="#3d2b1a" roughness={0.9} />
      </mesh>
      {/* Canopy */}
      <mesh ref={canopyRef} position={[0, 3, 0]}>
        <sphereGeometry args={[2, 12, 12]} />
        <meshStandardMaterial
          color="#1a4a2e"
          emissive="#0d3a20"
          emissiveIntensity={0.4}
          roughness={0.7}
        />
      </mesh>
      {/* Inner glow sphere */}
      <mesh position={[0, 3, 0]}>
        <sphereGeometry args={[1.3, 8, 8]} />
        <meshStandardMaterial
          color="#98ca3f"
          emissive="#98ca3f"
          emissiveIntensity={0.6}
          transparent
          opacity={0.18}
        />
      </mesh>
      {/* Floating orbs */}
      {[0, 1, 2, 3].map((i) => (
        <mesh key={i} ref={(el) => { orbs.current[i] = el }}>
          <sphereGeometry args={[0.1, 6, 6]} />
          <meshStandardMaterial
            color="#98ca3f"
            emissive="#98ca3f"
            emissiveIntensity={2}
          />
        </mesh>
      ))}
      {/* Ground glow ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <ringGeometry args={[1.5, 3, 32]} />
        <meshStandardMaterial color="#98ca3f" emissive="#98ca3f" emissiveIntensity={0.3} transparent opacity={0.25} />
      </mesh>
    </group>
  )
}

function JafetNpc({ mascot }) {
  const groupRef = useRef()
  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.3
      groupRef.current.position.y = Math.sin(Date.now() * 0.001) * 0.06
    }
  })
  return (
    <group ref={groupRef} position={[2.5, 0, -4]} scale={0.18}>
      <Suspense fallback={null}>
        <MascotMesh mascot={mascot} />
      </Suspense>
    </group>
  )
}

function SceneCamera() {
  useFrame(({ camera }) => {
    const t = Date.now() * 0.0003
    camera.position.x = Math.sin(t) * 5.5
    camera.position.z = Math.cos(t) * 5.5 + 1
    camera.lookAt(0, 1.5, -4)
  })
  return null
}

function ArbolScene({ avatarModel }) {
  const jafetMascot = getMascotById(JAFET.mascotId)
  return (
    <>
      <color attach="background" args={['#06060f']} />
      <fog attach="fog" args={['#06060f', 18, 42]} />
      <ambientLight intensity={0.25} color="#334466" />
      <pointLight position={[0, 4, -7]} color="#98ca3f" intensity={8} distance={12} />
      <pointLight position={[2, 2, -2]} color="#6644aa" intensity={3} distance={8} />

      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
        <planeGeometry args={[60, 60]} />
        <meshStandardMaterial color="#0a1a0a" roughness={1} />
      </mesh>

      <MagicTree />
      <JafetNpc mascot={jafetMascot} />

      {/* Player avatar preview (bottom-left of scene) */}
      {avatarModel && (
        <group position={[-2.5, 0, -1.5]} scale={0.14}>
          <Suspense fallback={null}>
            <MascotMesh mascot={avatarModel} />
          </Suspense>
        </group>
      )}

      <SceneCamera />
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
    meet_jafet:    '✅ ¡Hola Jafet!',
    choose_mascot: '🐾 Elegir compañero',
    mascot_class:  null,   // handled inside VrMascotOnboarding
    setup_ai:      '⚙️ Ir a Ajustes',
    first_chat:    '💬 Abrir chat',
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

// ── Main page ─────────────────────────────────────────────────────────────────

export default function VrArbol() {
  const navigate = useNavigate()

  const avatarRegistryId = useGameStore((s) => s.player.avatarRegistryId)
  const oliverClass      = useGameStore((s) => s.oliver.class)
  const forceSyncToCloud = useGameStore((s) => s.forceSyncToCloud)

  const { done, completeStep, isTutorialComplete } = useTutorialStore()

  const chatMessages = useChatStore((s) => s.messages)

  const [showDialogue, setShowDialogue]         = useState(false)
  const [dialogueMessages, setDialogueMessages] = useState([])
  const [isJafetTyping, setIsJafetTyping]       = useState(false)
  const [showMascotOnboarding, setShowMascotOnboarding] = useState(false)
  const [tutorialDone, setTutorialDone]         = useState(false)

  const avatarModel = getMascotById(avatarRegistryId)

  // Detect which mission is currently active (first not done)
  const activeMission = TUTORIAL_MISSIONS.find(m => !done.includes(m.id)) ?? null

  // Detect first_chat completion when chat store gets a message
  useEffect(() => {
    if (chatMessages.length > 0 && !done.includes('first_chat')) {
      completeStep('first_chat')
    }
  }, [chatMessages.length, done, completeStep])

  // Check overall tutorial completion
  useEffect(() => {
    if (isTutorialComplete()) {
      setTutorialDone(true)
      forceSyncToCloud().catch(() => {})
    }
  }, [done, isTutorialComplete, forceSyncToCloud])

  // Push Jafet message helper
  function pushJafet(text) {
    setDialogueMessages(prev => [...prev, { role: 'assistant', content: text }])
  }

  function openDialogue() {
    if (dialogueMessages.length === 0) {
      // First open: play intro lines one by one with 600ms gaps
      const lines = JAFET_DIALOGUE.initial
      lines.forEach((line, i) => {
        setTimeout(() => pushJafet(line), i * 700)
      })
    }
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
      const next = TUTORIAL_MISSIONS[idx + 1]
      if (next) {
        const lines = JAFET_DIALOGUE[next.id] ?? []
        lines.forEach((l, i) => setTimeout(() => pushJafet(l), 500 + i * 700))
      }
      return
    }

    if (missionId === 'meet_jafet') {
      completeStep('meet_jafet')
      const lines = JAFET_DIALOGUE.meet_jafet
      lines.forEach((l, i) => setTimeout(() => pushJafet(l), 400 + i * 700))
      setTimeout(() => pushJafet('¡Haz clic en "🐾 Elegir compañero" cuando estés listo!'), 400 + lines.length * 700 + 300)
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
  }

  // VrMascotOnboarding finished → complete missions 2 and 3
  function handleMascotOnboardingDone() {
    setShowMascotOnboarding(false)
    completeStep('choose_mascot')
    completeStep('mascot_class')
    // Reopen dialogue with next step lines
    const lines = JAFET_DIALOGUE.mascot_class
    setShowDialogue(true)
    lines.forEach((l, i) => setTimeout(() => pushJafet(l), 400 + i * 700))
    const aiLines = JAFET_DIALOGUE.setup_ai
    aiLines.forEach((l, i) => setTimeout(() => pushJafet(l), 400 + (lines.length + i) * 700 + 500))
  }

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-[#06060f]">

      {/* ── 3D Canvas ── */}
      <Canvas camera={{ position: [0, 2, 6], fov: 60 }} className="absolute inset-0">
        <ArbolScene avatarModel={avatarModel} />
      </Canvas>

      {/* ── Top title ── */}
      <div className="pointer-events-none absolute left-0 right-0 top-0 flex justify-center pt-5">
        <div className="rounded-2xl border border-primary/20 bg-black/60 px-5 py-2 backdrop-blur-sm">
          <p className="text-center text-sm font-black text-primary">🌳 El Árbol de Oliver School</p>
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

      {/* ── Talk to Jafet button ── */}
      {!showDialogue && !showMascotOnboarding && !tutorialDone && (
        <div className="absolute bottom-20 left-1/2 z-20 -translate-x-1/2">
          <button type="button" onClick={openDialogue}
            className="flex items-center gap-2 rounded-2xl border border-primary/40 bg-black/80 px-6 py-3 font-black text-primary shadow-lg backdrop-blur-sm hover:bg-primary hover:text-background transition-all">
            🧙‍♂️ Hablar con Jafet
          </button>
        </div>
      )}

      {/* ── Tutorial complete banner ── */}
      {tutorialDone && (
        <div className="absolute inset-x-0 bottom-0 z-20 flex flex-col items-center gap-4 bg-gradient-to-t from-black/90 to-transparent px-4 pb-8 pt-16">
          <div className="text-center">
            <p className="text-4xl">🎉</p>
            <p className="text-xl font-black text-primary">¡Tutorial completado!</p>
            <p className="text-sm text-text-muted">Ya eres parte de Oliver School. El campus te espera.</p>
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
