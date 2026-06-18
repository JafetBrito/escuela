/**
 * VrCueva — La Cueva de Platón
 *
 * Flujo:
 *   Stage 0 — Intro: Jafet Brito narra la alegoría, introduce las sombras.
 *   Stage 1 — Prisionero: El alumno "vive" como prisionero.
 *              Habilidades: No Cuestionar Nada, Seguir la Corriente.
 *   Stage 2 — Liberación: El alumno sale de la cueva.
 *              Habilidad: Despertar a los Demás (libera prisioneros NPCs).
 *   Stage 3 — Completo: Todos liberados, misión cumplida.
 */
import { Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useNavigate } from 'react-router-dom'
import { getMascotById } from '../../data/mascotRegistry'
import { sendNpcMessage } from '../../services/chat/npcTransport'
import { useSettingsStore, getModelProvider } from '../../stores/useSettingsStore'
import { useVrSettingsStore } from '../../stores/useVrSettingsStore'
import { useLevelStore } from '../../stores/useLevelStore'
import MascotMesh from '../mascot/MascotMesh'
import MascotCompanion from '../mascot/MascotCompanion'

// ── Jafet NPC config ──────────────────────────────────────────────────────────
const JAFET_MASCOT_ID = 10   // mage_elder.glb
const JAFET_AI_PROMPT = `Eres Jafet Brito, profesor de filosofía de Oliver School.
Eres apasionado, cercano y muy didáctico. Guías al estudiante a través de la Alegoría
de la Cueva de Platón de manera interactiva. Hablas en español, usas analogías modernas
y haces preguntas reflexivas al estudiante. Nunca salgas del personaje. Sé entusiasta
pero profundo — como un buen profesor que también es amigo.`

// ── Cave missions ─────────────────────────────────────────────────────────────
const CAVE_MISSIONS = [
  {
    id: 'meet_jafet',
    title: 'Habla con Jafet Brito',
    icon: '🎓',
    desc: 'Inicia el diálogo con tu guía filosófico',
    xp: 20,
    stage: 0,
  },
  {
    id: 'use_no_cuestionar',
    title: 'No Cuestiones',
    icon: '🔒',
    desc: 'Usa "No Cuestionar Nada" — vive como prisionero',
    xp: 30,
    stage: 1,
  },
  {
    id: 'use_seguir_corriente',
    title: 'Sigue la Corriente',
    icon: '🌊',
    desc: 'Usa "Seguir la Corriente" — acepta las sombras',
    xp: 30,
    stage: 1,
  },
  {
    id: 'exit_cave',
    title: 'Sal de la Cueva',
    icon: '🌅',
    desc: 'Encuentra la salida y ve la luz por primera vez',
    xp: 50,
    stage: 1,
  },
  {
    id: 'free_prisoners',
    title: 'Despierta a los Demás',
    icon: '☀️',
    desc: 'Libera a los 3 prisioneros con tu nueva habilidad',
    xp: 100,
    stage: 2,
  },
]

// ── Jafet's scripted dialogue per stage ──────────────────────────────────────
const JAFET_LINES = {
  intro: [
    '¡Bienvenido, estudiante! 🏛️ Soy Jafet Brito, tu guía en este mundo.',
    'Has llegado a la Cueva de Platón — una de las alegorías más poderosas de toda la filosofía.',
    'Imagina que llevas toda tu vida aquí, encadenado, mirando solo sombras en la pared...',
    'Esas sombras son todo lo que conoces. Para ti, ESO es la realidad. Pero... ¿es real?',
    'Por ahora, adopta el rol de un prisionero. Usa tus habilidades y vive la experiencia. 🔒',
  ],
  stage1: [
    '¡Bien hecho! Sientes el peso de las cadenas... la comodidad de no cuestionar. ⛓️',
    'Así vivimos muchos: aceptando las sombras sin preguntarnos qué las proyecta.',
    'Pero algo en ti se resiste... ¿Puedes ver la salida al fondo? 🌅',
    'Cuando estés listo, acércate a la luz. Dar ese paso es lo más difícil.',
  ],
  stage2: [
    '¡Lo lograste! Has visto la LUZ por primera vez. ☀️ ¿Cómo se siente?',
    'Platón preguntaba: el que ve la verdad, ¿tiene la obligación de regresar y ayudar a los demás?',
    'Eso es el dilema del filósofo. Y tú ahora tienes una habilidad especial...',
    'Usa "Despertar a los Demás" en cada prisionero. No será fácil — nadie quiere soltar sus sombras. 🔓',
  ],
  complete: [
    '¡INCREÍBLE! 🎉 Has completado la Alegoría de la Cueva.',
    'Recuerda: el conocimiento no es un privilegio para guardar, sino una luz para compartir.',
    '¿Qué sombras en TU vida cotidiana podrían ser ilusiones? Esa es la tarea del filósofo.',
    'Has ganado la habilidad permanente de "Despertar a los Demás". Úsala sabiamente. ✨',
  ],
}

// ── Prisoner positions inside the cave ───────────────────────────────────────
const PRISONER_POSITIONS = [
  [-3.5, 0, -2],
  [0, 0, -3],
  [3.5, 0, -2],
]

// ── 3D: Fire pit (animated) ───────────────────────────────────────────────────
function FirePit({ position = [0, 0, -12] }) {
  const outerRef = useRef()
  const innerRef = useRef()
  const glowRef  = useRef()

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    if (outerRef.current) {
      outerRef.current.scale.y = 1 + Math.sin(t * 7.3) * 0.18
      outerRef.current.scale.x = 1 + Math.cos(t * 5.1) * 0.12
      outerRef.current.material.emissiveIntensity = 1.6 + Math.sin(t * 9) * 0.5
    }
    if (innerRef.current) {
      innerRef.current.scale.y = 1 + Math.sin(t * 11 + 1) * 0.2
      innerRef.current.material.emissiveIntensity = 2.2 + Math.cos(t * 8) * 0.6
    }
    if (glowRef.current) {
      glowRef.current.material.opacity = 0.18 + Math.sin(t * 4) * 0.07
    }
  })

  return (
    <group position={position}>
      {/* Base stones */}
      {[0, 1, 2, 3, 4].map((i) => {
        const a = (i / 5) * Math.PI * 2
        return (
          <mesh key={i} position={[Math.sin(a) * 0.9, 0.2, Math.cos(a) * 0.9]}>
            <sphereGeometry args={[0.35, 6, 5]} />
            <meshStandardMaterial color="#3a3530" roughness={1} />
          </mesh>
        )
      })}
      {/* Outer flame */}
      <mesh ref={outerRef} position={[0, 0.9, 0]}>
        <coneGeometry args={[0.55, 1.8, 8]} />
        <meshStandardMaterial color="#f97316" emissive="#ea580c" emissiveIntensity={1.8} transparent opacity={0.85} />
      </mesh>
      {/* Inner flame */}
      <mesh ref={innerRef} position={[0, 0.8, 0]}>
        <coneGeometry args={[0.3, 1.4, 7]} />
        <meshStandardMaterial color="#fbbf24" emissive="#fde047" emissiveIntensity={2.4} transparent opacity={0.9} />
      </mesh>
      {/* Glow halo */}
      <mesh ref={glowRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
        <ringGeometry args={[0.6, 3.5, 32]} />
        <meshStandardMaterial color="#f97316" emissive="#f97316" emissiveIntensity={0.8} transparent opacity={0.18} />
      </mesh>
    </group>
  )
}

// ── 3D: Shadow projections on wall ─────────────────────────────────────────
function ShadowProjections() {
  const shadesRef = useRef([])

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    shadesRef.current.forEach((m, i) => {
      if (!m) return
      const wobble = Math.sin(t * 1.2 + i * 2.1) * 0.06
      m.scale.x = 1 + wobble
      m.scale.y = 1 + Math.cos(t * 0.9 + i) * 0.05
      m.material.opacity = 0.35 + Math.abs(Math.sin(t * 0.8 + i)) * 0.2
    })
  })

  // Simple silhouette shapes on back wall
  const shapes = [
    { pos: [-4, 3.5, -14.8], w: 0.9, h: 2.2 },
    { pos: [0,  3.2, -14.8], w: 1.0, h: 2.5 },
    { pos: [4,  3.6, -14.8], w: 0.85, h: 2.1 },
    { pos: [-2, 4.4, -14.8], w: 2.5, h: 0.6 },
    { pos: [2.2, 4.5, -14.8], w: 1.8, h: 0.5 },
  ]

  return (
    <>
      {shapes.map((s, i) => (
        <mesh key={i} ref={(el) => { shadesRef.current[i] = el }} position={s.pos}>
          <planeGeometry args={[s.w, s.h]} />
          <meshBasicMaterial color="#0a0506" transparent opacity={0.4} />
        </mesh>
      ))}
    </>
  )
}

// ── 3D: Prisoner NPC (chained figure) ────────────────────────────────────────
function PrisonerMesh({ position, freed, onFree, canFree }) {
  const groupRef = useRef()
  const [hovered, setHovered] = useState(false)

  useFrame(({ clock }) => {
    if (!groupRef.current || freed) return
    groupRef.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.4) * 0.08
  })

  const color = freed ? '#4ade80' : (hovered && canFree) ? '#fde047' : '#9ca3af'

  return (
    <group
      ref={groupRef}
      position={position}
      onClick={() => canFree && !freed && onFree()}
      onPointerOver={() => canFree && !freed && setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {/* Body */}
      <mesh position={[0, 0.65, 0]}>
        <cylinderGeometry args={[0.2, 0.25, 1.1, 8]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
      {/* Head */}
      <mesh position={[0, 1.38, 0]}>
        <sphereGeometry args={[0.22, 10, 8]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
      {/* Chain links (decorative) */}
      {!freed && [-0.3, 0.3].map((x, i) => (
        <mesh key={i} position={[x, 0.4, 0]} rotation={[0, 0, Math.PI / 3 * (i ? 1 : -1)]}>
          <torusGeometry args={[0.1, 0.03, 6, 12]} />
          <meshStandardMaterial color="#6b7280" metalness={0.8} roughness={0.3} />
        </mesh>
      ))}
      {/* "Freed" glow ring */}
      {freed && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
          <ringGeometry args={[0.3, 0.7, 20]} />
          <meshStandardMaterial color="#4ade80" emissive="#4ade80" emissiveIntensity={1.2} transparent opacity={0.5} />
        </mesh>
      )}
      {/* Interaction hint */}
      {canFree && !freed && hovered && (
        <mesh position={[0, 2.0, 0]}>
          <sphereGeometry args={[0.12, 8, 8]} />
          <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={2} />
        </mesh>
      )}
    </group>
  )
}

// ── 3D: Jafet Brito NPC ───────────────────────────────────────────────────────
function JafetNpc3D({ mascot }) {
  const groupRef = useRef()
  useFrame(({ clock }) => {
    if (!groupRef.current) return
    groupRef.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.5) * 0.25
    groupRef.current.position.y = Math.sin(clock.getElapsedTime() * 1.2) * 0.06
  })
  return (
    <group ref={groupRef} position={[3.5, 0, -5]} scale={0.18}>
      <Suspense fallback={null}>
        <MascotMesh mascot={mascot} />
      </Suspense>
    </group>
  )
}

// ── 3D: Cave exit glow (stage 1 visible) ─────────────────────────────────────
function CaveExit({ onEnter, visible }) {
  const glowRef = useRef()
  useFrame(({ clock }) => {
    if (!glowRef.current) return
    glowRef.current.material.opacity = 0.6 + Math.sin(clock.getElapsedTime() * 2) * 0.25
  })
  if (!visible) return null
  return (
    <group position={[-6, 2, -8]}>
      {/* Light cone */}
      <mesh ref={glowRef} rotation={[0, Math.PI / 4, 0]}>
        <coneGeometry args={[1.2, 4.5, 12, 1, true]} />
        <meshBasicMaterial color="#fde68a" transparent opacity={0.65} side={THREE.DoubleSide} />
      </mesh>
      <pointLight color="#fde68a" intensity={4} distance={6} />
      {/* Clickable portal */}
      <mesh
        position={[0, 0, 0]}
        onClick={onEnter}
        onPointerOver={(e) => { e.object.material.emissiveIntensity = 1.5 }}
        onPointerOut={(e) => { e.object.material.emissiveIntensity = 0.6 }}
      >
        <circleGeometry args={[1.1, 16]} />
        <meshStandardMaterial color="#fde68a" emissive="#f59e0b" emissiveIntensity={0.6} />
      </mesh>
    </group>
  )
}

// ── 3D: Full cave scene ───────────────────────────────────────────────────────
function CaveScene({ stage, freedPrisoners, onFreePrisoner, onExitCave }) {
  const jafetMascot = getMascotById(JAFET_MASCOT_ID)
  const canFree = stage === 2

  return (
    <>
      <color attach="background" args={['#080406']} />
      <fog attach="fog" args={['#080406', 14, 32]} />
      <ambientLight intensity={0.08} color="#331a00" />

      {/* Fire lights */}
      <pointLight position={[0, 2.5, -12]} color="#f97316" intensity={6} distance={22} decay={2} />
      <pointLight position={[0, 1.5, -12]} color="#fbbf24" intensity={3} distance={14} decay={2} />
      {/* Dim ambient glow near spawn */}
      <pointLight position={[0, 3, 0]} color="#4a2800" intensity={1.5} distance={10} decay={2} />

      {/* Ground — stone floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
        <planeGeometry args={[28, 36]} />
        <meshStandardMaterial color="#1c1410" roughness={1} />
      </mesh>

      {/* Cave ceiling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 8, -5]}>
        <planeGeometry args={[28, 36]} />
        <meshStandardMaterial color="#121008" roughness={1} />
      </mesh>

      {/* Left wall */}
      <mesh rotation={[0, Math.PI / 2, 0]} position={[-8, 4, -5]}>
        <planeGeometry args={[36, 9]} />
        <meshStandardMaterial color="#1a1208" roughness={1} />
      </mesh>
      {/* Right wall */}
      <mesh rotation={[0, -Math.PI / 2, 0]} position={[8, 4, -5]}>
        <planeGeometry args={[36, 9]} />
        <meshStandardMaterial color="#1a1208" roughness={1} />
      </mesh>
      {/* Back wall (shadow projection surface) */}
      <mesh position={[0, 4.5, -15]}>
        <planeGeometry args={[20, 12]} />
        <meshStandardMaterial color="#141008" roughness={1} />
      </mesh>

      {/* Stalactites (ceiling details) */}
      {[[-4, 8, -6], [0, 8, -9], [4, 8, -7], [-2, 8, -12], [2.5, 8, -11]].map(([x, y, z], i) => (
        <mesh key={i} position={[x, y - 0.3, z]} rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[0.2 + i * 0.04, 0.8 + i * 0.3, 7]} />
          <meshStandardMaterial color="#1e1610" roughness={1} />
        </mesh>
      ))}

      {/* Rock formations on sides */}
      {[[-7, 0.5, -3], [-7, 0.5, -8], [7, 0.5, -4], [7, 0.5, -9]].map(([x, y, z], i) => (
        <mesh key={i} position={[x, y, z]}>
          <dodecahedronGeometry args={[0.7 + i * 0.15, 0]} />
          <meshStandardMaterial color="#221a10" roughness={1} />
        </mesh>
      ))}

      <FirePit position={[0, 0, -12]} />
      <ShadowProjections />
      <JafetNpc3D mascot={jafetMascot} />

      {/* Prisoner NPCs */}
      {PRISONER_POSITIONS.map((pos, i) => (
        <PrisonerMesh
          key={i}
          position={pos}
          freed={freedPrisoners.includes(i)}
          canFree={canFree}
          onFree={() => onFreePrisoner(i)}
        />
      ))}

      {/* Cave exit light (stage 1 only) */}
      <CaveExit visible={stage === 1} onEnter={onExitCave} />
    </>
  )
}

// ── Skill bar (cave-exclusive skills) ────────────────────────────────────────
const STAGE1_SKILLS = [
  { id: 'no_cuestionar', name: 'No Cuestionar Nada', icon: '🔒', color: '#6b7280', missionId: 'use_no_cuestionar' },
  { id: 'seguir_corriente', name: 'Seguir la Corriente', icon: '🌊', color: '#4b5563', missionId: 'use_seguir_corriente' },
]
const STAGE2_SKILLS = [
  { id: 'despertar_demas', name: 'Despertar a los Demás', icon: '☀️', color: '#f59e0b', missionId: null },
]

function CaveSkillBar({ stage, done, onUseSkill }) {
  const skills = stage === 1 ? STAGE1_SKILLS : stage === 2 ? STAGE2_SKILLS : []
  if (!skills.length) return null

  return (
    <div className="absolute bottom-20 left-1/2 z-20 flex -translate-x-1/2 gap-3">
      {skills.map((sk) => {
        const isDone = done.includes(sk.missionId)
        return (
          <button
            key={sk.id}
            type="button"
            onClick={() => !isDone && onUseSkill(sk)}
            title={sk.name}
            className="flex flex-col items-center gap-1 transition active:scale-90"
          >
            <div
              className="flex h-14 w-14 items-center justify-center rounded-full text-2xl shadow-lg"
              style={{
                background: `radial-gradient(circle at 38% 36%, ${sk.color}55, ${sk.color}22)`,
                border: `2px solid ${isDone ? 'rgba(74,222,128,0.6)' : sk.color + '88'}`,
                boxShadow: isDone ? '0 0 10px #4ade8055' : `0 0 10px ${sk.color}44`,
                opacity: isDone ? 0.6 : 1,
              }}
            >
              {isDone ? '✅' : sk.icon}
            </div>
            <span className="text-[9px] font-semibold text-white/60 text-center leading-tight max-w-[60px]">
              {sk.name}
            </span>
          </button>
        )
      })}
    </div>
  )
}

// ── Mission list panel ────────────────────────────────────────────────────────
function MissionPanel({ done, stage }) {
  return (
    <div className="absolute left-3 top-16 z-20 w-56 sm:w-64">
      <div
        className="rounded-2xl p-3 backdrop-blur-sm"
        style={{ background: 'rgba(8,4,6,0.85)', border: '1px solid rgba(234,179,8,0.25)' }}
      >
        <p className="mb-2 text-[10px] font-black uppercase tracking-wider"
          style={{ color: '#eab308' }}>
          🏛️ La Cueva de Platón
        </p>
        <div className="flex flex-col gap-1.5">
          {CAVE_MISSIONS.map((m) => {
            const isDone = done.includes(m.id)
            const isActive = !isDone && m.stage <= stage
            return (
              <div
                key={m.id}
                className={`flex items-start gap-2 rounded-xl border px-2.5 py-2 transition-all ${
                  isDone
                    ? 'border-primary/20 bg-primary/5 opacity-55'
                    : isActive
                    ? 'border-yellow-500/40 bg-yellow-500/10'
                    : 'border-white/5 bg-white/3 opacity-40'
                }`}
              >
                <span className="mt-0.5 shrink-0 text-base">{isDone ? '✅' : isActive ? m.icon : '🔒'}</span>
                <div className="min-w-0 flex-1">
                  <p className={`text-[11px] font-bold leading-snug ${
                    isActive ? 'text-yellow-200' : isDone ? 'text-text-muted line-through' : 'text-white/30'
                  }`}>
                    {m.title}
                  </p>
                  {isActive && (
                    <p className="mt-0.5 text-[9px] leading-snug text-white/40">{m.desc}</p>
                  )}
                </div>
                {isActive && (
                  <span
                    className="shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-black"
                    style={{ background: 'rgba(234,179,8,0.2)', color: '#eab308' }}
                  >
                    +{m.xp} XP
                  </span>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ── Dialogue box ──────────────────────────────────────────────────────────────
function DialogueBox({ messages, onClose, onUserMessage, isLoading }) {
  const [input, setInput] = useState('')
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const speakText = useCallback((text) => {
    if (!useVrSettingsStore.getState().npcVoice || !window.speechSynthesis) return
    const clean = text.replace(/[\u{1F300}-\u{1FFFF}]/gu, '').replace(/[^\w\s.,!?¿¡]/g, '').trim()
    if (!clean) return
    window.speechSynthesis.cancel()
    const utt = new SpeechSynthesisUtterance(clean)
    utt.lang = 'es-ES'; utt.rate = 0.92; utt.pitch = 1.05
    window.speechSynthesis.speak(utt)
  }, [])

  // Speak new NPC messages
  useEffect(() => {
    const last = messages[messages.length - 1]
    if (last?.role === 'assistant') speakText(last.content)
  }, [messages, speakText])

  const send = () => {
    if (!input.trim()) return
    onUserMessage(input.trim())
    setInput('')
  }

  return (
    <div className="absolute inset-x-0 bottom-0 z-30 sm:absolute sm:inset-auto sm:bottom-4 sm:right-4 sm:w-80">
      <div
        className="flex flex-col rounded-t-3xl sm:rounded-3xl shadow-2xl backdrop-blur-sm overflow-hidden"
        style={{
          maxHeight: '55vh',
          minHeight: '200px',
          background: 'linear-gradient(160deg, #1a0f2e 0%, #0c0814 100%)',
          border: '1px solid rgba(234,179,8,0.3)',
        }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <span className="text-2xl">🎓</span>
          <div className="flex-1">
            <p className="text-sm font-black" style={{ color: '#fcd34d' }}>Jafet Brito</p>
            <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.35)' }}>Profesor de Filosofía</p>
          </div>
          <button type="button" onClick={onClose}
            className="text-lg leading-none transition"
            style={{ color: 'rgba(255,255,255,0.35)' }}>×</button>
        </div>

        {/* Messages */}
        <div className="flex flex-col gap-2 overflow-y-auto p-3">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className="max-w-[85%] rounded-2xl px-3 py-2 text-xs leading-relaxed"
                style={
                  msg.role === 'user'
                    ? { background: 'rgba(234,179,8,0.25)', color: '#fde68a', borderRadius: '16px 16px 4px 16px' }
                    : { background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.8)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px 16px 16px 4px' }
                }
              >
                {msg.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="rounded-2xl px-3 py-2 text-xs animate-pulse"
                style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.4)' }}>
                Jafet está escribiendo…
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="flex gap-2 p-3"
          style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send()}
            placeholder="Pregúntale a Jafet…"
            className="flex-1 rounded-xl px-3 py-2 text-xs outline-none"
            style={{
              background: 'rgba(255,255,255,0.07)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: 'rgba(255,255,255,0.85)',
            }}
          />
          <button type="button" onClick={send}
            className="rounded-xl px-3 py-2 text-xs font-black transition"
            style={{ background: 'rgba(234,179,8,0.3)', color: '#fcd34d' }}>
            →
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Skill use VFX overlay ─────────────────────────────────────────────────────
function SkillVfx({ skill, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 1600)
    return () => clearTimeout(t)
  }, [onDone])

  return (
    <div className="pointer-events-none absolute inset-0 z-40 flex items-center justify-center">
      <div
        className="animate-ping rounded-full"
        style={{
          width: 160,
          height: 160,
          background: `radial-gradient(circle, ${skill.color}55, transparent)`,
          border: `3px solid ${skill.color}`,
        }}
      />
      <div className="absolute flex flex-col items-center gap-2">
        <span style={{ fontSize: 48 }}>{skill.icon}</span>
        <p className="font-black text-white drop-shadow-lg" style={{ fontSize: 16 }}>{skill.name}</p>
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function VrCueva() {
  const navigate = useNavigate()
  const addXp = useLevelStore((s) => s.addXp)

  const [stage, setStage] = useState(0)
  const [done, setDone] = useState([])
  const [showDialogue, setShowDialogue] = useState(false)
  const [dialogueMessages, setDialogueMessages] = useState([])
  const [isJafetTyping, setIsJafetTyping] = useState(false)
  const [freedPrisoners, setFreedPrisoners] = useState([])
  const [activeVfx, setActiveVfx] = useState(null)
  const [complete, setComplete] = useState(false)

  const jafetMascot = getMascotById(JAFET_MASCOT_ID)
  void jafetMascot // used inside Canvas

  function completeMission(id) {
    if (done.includes(id)) return
    setDone((prev) => {
      const next = [...prev, id]
      const mission = CAVE_MISSIONS.find((m) => m.id === id)
      if (mission) addXp(mission.xp)
      return next
    })
  }

  function pushJafet(text) {
    setDialogueMessages((prev) => [...prev, { role: 'assistant', content: text }])
  }

  function openDialogue() {
    if (dialogueMessages.length === 0) {
      JAFET_LINES.intro.forEach((line, i) => {
        setTimeout(() => pushJafet(line), i * 800)
      })
    }
    setShowDialogue(true)
    completeMission('meet_jafet')
  }

  // After intro lines finish → advance to stage 1
  useEffect(() => {
    if (!done.includes('meet_jafet') || stage !== 0) return
    const t = setTimeout(() => setStage(1), JAFET_LINES.intro.length * 800 + 600)
    return () => clearTimeout(t)
  }, [done, stage])

  // Stage 1 → 2 when exit_cave done
  useEffect(() => {
    if (done.includes('exit_cave') && stage === 1) {
      setStage(2)
      const lines = JAFET_LINES.stage2
      if (showDialogue) {
        lines.forEach((l, i) => setTimeout(() => pushJafet(l), 500 + i * 800))
      }
    }
  }, [done, stage, showDialogue])

  // Complete when all prisoners freed
  useEffect(() => {
    if (freedPrisoners.length >= PRISONER_POSITIONS.length && !done.includes('free_prisoners')) {
      completeMission('free_prisoners')
      setComplete(true)
      const lines = JAFET_LINES.complete
      lines.forEach((l, i) => setTimeout(() => pushJafet(l), i * 900))
      setShowDialogue(true)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [freedPrisoners])

  async function handleUserMessage(text) {
    setDialogueMessages((prev) => [...prev, { role: 'user', content: text }])
    setIsJafetTyping(true)
    try {
      const { minimaxApiKey, deepseekApiKey, chatModel } = useSettingsStore.getState()
      const provider = getModelProvider(chatModel)
      const apiKey = provider === 'deepseek' ? deepseekApiKey : minimaxApiKey
      if (apiKey && !apiKey.startsWith('mx-mock')) {
        const reply = await sendNpcMessage({
          npcPrompt: JAFET_AI_PROMPT,
          content: text,
          history: dialogueMessages,
        })
        pushJafet(reply)
      } else {
        pushJafet('Reflexiona sobre esa pregunta... la filosofía no siempre da respuestas inmediatas. 🤔')
      }
    } catch {
      pushJafet('Parece que hay interferencia en la caverna... inténtalo de nuevo. 🏛️')
    } finally {
      setIsJafetTyping(false)
    }
  }

  function handleUseSkill(sk) {
    setActiveVfx(sk)
    completeMission(sk.missionId)
    // Stage 1 progress dialogue
    if (stage === 1 && done.filter((d) => ['use_no_cuestionar', 'use_seguir_corriente'].includes(d)).length === 1) {
      setTimeout(() => {
        if (!showDialogue) return
        JAFET_LINES.stage1.slice(0, 2).forEach((l, i) => setTimeout(() => pushJafet(l), i * 800))
      }, 500)
    }
  }

  function handleExitCave() {
    completeMission('exit_cave')
    if (showDialogue) {
      JAFET_LINES.stage1.slice(2).forEach((l, i) => setTimeout(() => pushJafet(l), 200 + i * 800))
    } else {
      setShowDialogue(true)
      JAFET_LINES.stage2.forEach((l, i) => setTimeout(() => pushJafet(l), 300 + i * 800))
    }
  }

  function handleFreePrisoner(index) {
    if (freedPrisoners.includes(index)) return
    setFreedPrisoners((prev) => [...prev, index])
    setActiveVfx(STAGE2_SKILLS[0])
  }

  return (
    <div className="relative h-screen w-screen overflow-hidden" style={{ background: '#080406' }}>

      {/* ── 3D Canvas ── */}
      <Canvas camera={{ position: [0, 2.5, 6], fov: 65 }} className="absolute inset-0">
        <CaveScene
          stage={stage}
          freedPrisoners={freedPrisoners}
          onFreePrisoner={handleFreePrisoner}
          onExitCave={handleExitCave}
        />
      </Canvas>

      {/* ── Skill VFX overlay ── */}
      {activeVfx && <SkillVfx skill={activeVfx} onDone={() => setActiveVfx(null)} />}

      {/* ── Top title ── */}
      <div className="pointer-events-none absolute left-0 right-0 top-0 flex justify-center pt-4">
        <div
          className="rounded-2xl px-5 py-2 backdrop-blur-sm"
          style={{ background: 'rgba(8,4,6,0.75)', border: '1px solid rgba(234,179,8,0.3)' }}
        >
          <p className="text-center text-sm font-black" style={{ color: '#eab308' }}>🏛️ La Cueva de Platón</p>
          <p className="text-center text-[10px]" style={{ color: 'rgba(255,255,255,0.3)' }}>
            {stage === 0 && 'Habla con Jafet para comenzar'}
            {stage === 1 && 'Etapa 1: El Prisionero — usa tus habilidades y encuentra la salida'}
            {stage === 2 && `Etapa 2: La Liberación — prisioneros liberados: ${freedPrisoners.length} / ${PRISONER_POSITIONS.length}`}
            {complete && 'Cueva completada ✅'}
          </p>
        </div>
      </div>

      {/* ── Mission panel ── */}
      <MissionPanel done={done} stage={stage} />

      {/* ── Cave skills ── */}
      {!showDialogue && !complete && (
        <CaveSkillBar stage={stage} done={done} onUseSkill={handleUseSkill} />
      )}

      {/* ── Talk to Jafet button ── */}
      {!showDialogue && (
        <div className="absolute bottom-20 left-1/2 z-20 -translate-x-1/2">
          <button
            type="button"
            onClick={openDialogue}
            className="flex items-center gap-2 rounded-2xl px-6 py-3 font-black transition-all active:scale-95"
            style={{
              background: 'rgba(8,4,6,0.88)',
              border: '1px solid rgba(234,179,8,0.5)',
              color: '#eab308',
            }}
          >
            🎓 Hablar con Jafet Brito
          </button>
        </div>
      )}

      {/* ── Prisoner hint (stage 2) ── */}
      {stage === 2 && !complete && !showDialogue && (
        <div
          className="pointer-events-none absolute bottom-36 left-1/2 -translate-x-1/2 rounded-full px-4 py-1.5 text-xs font-semibold backdrop-blur-sm"
          style={{ background: 'rgba(8,4,6,0.8)', border: '1px solid rgba(234,179,8,0.3)', color: 'rgba(255,255,255,0.6)' }}
        >
          ☀️ Haz clic en los prisioneros para despertarlos
        </div>
      )}

      {/* ── Complete banner ── */}
      {complete && (
        <div
          className="absolute inset-x-0 bottom-0 z-20 flex flex-col items-center gap-4 px-4 pb-8 pt-16"
          style={{ background: 'linear-gradient(to top, rgba(8,4,6,0.95), transparent)' }}
        >
          <div className="text-center">
            <p className="text-5xl">🏛️</p>
            <p className="text-xl font-black" style={{ color: '#eab308' }}>¡La Cueva Completada!</p>
            <p className="mt-1 text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
              Has vivido la alegoría de Platón desde adentro.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="rounded-2xl px-10 py-4 text-lg font-black transition-all hover:scale-105"
            style={{ background: 'linear-gradient(135deg, #eab308, #f97316)', color: '#0a0600' }}
          >
            📚 Volver al curso
          </button>
          <button
            type="button"
            onClick={() => navigate('/vr')}
            className="rounded-xl px-6 py-2 text-sm font-semibold transition"
            style={{ color: 'rgba(255,255,255,0.4)' }}
          >
            🌍 Ir al Campus VR
          </button>
        </div>
      )}

      {/* ── Dialogue box ── */}
      {showDialogue && (
        <DialogueBox
          messages={dialogueMessages}
          onClose={() => setShowDialogue(false)}
          onUserMessage={handleUserMessage}
          isLoading={isJafetTyping}
        />
      )}

      {/* ── Floating mascot companion ── */}
      <MascotCompanion />
    </div>
  )
}
