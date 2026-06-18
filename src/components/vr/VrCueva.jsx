/**
 * VrCueva — La Cueva de Platón
 *
 * Flujo:
 *   phase 'start'     → pantalla de inicio, click para comenzar
 *   phase 'cinematic' → narración de ~2 min, TTS cronometrado (espera onend)
 *   phase 'play'      → mundo interactivo
 *     stage 1 — Prisionero: No Cuestionar + Seguir la Corriente + salida
 *     stage 2 — Liberación: Despertar a los Demás
 *   complete → banner final
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

// ── Jafet NPC config ──────────────────────────────────────────────────────────
const JAFET_MASCOT_ID = 10
const JAFET_AI_PROMPT = `Eres Jafet Brito, profesor de filosofía de Oliver School.
Eres apasionado, cercano y muy didáctico. Guías al estudiante a través de la Alegoría
de la Cueva de Platón de manera interactiva. Hablas en español, usas analogías modernas
y haces preguntas reflexivas al estudiante. Nunca salgas del personaje. Sé entusiasta
pero profundo — como un buen profesor que también es amigo.`

// ── Cinematic narration lines (~2 minutes) ───────────────────────────────────
const INTRO_CINEMATIC = [
  '380 años antes de Cristo, el filósofo griego Platón escribió uno de los pasajes más influyentes de toda la historia del pensamiento humano.',
  'Lo llamó la Alegoría de la Cueva. Una historia que cambiaría para siempre la forma en que los seres humanos entienden lo que es real.',
  'Imagina una caverna profunda bajo la tierra. En su interior viven personas encadenadas desde su nacimiento. No pueden moverse. No pueden girar la cabeza.',
  'Detrás de ellos arde una hoguera. Entre el fuego y los prisioneros, otros seres hacen pasar figuras y objetos, proyectando sombras sobre la pared del fondo.',
  'Para los prisioneros, esas sombras lo son todo. Son los árboles, los animales, las personas. Son el mundo entero. Nunca han visto nada más.',
  'Nunca se preguntan de dónde vienen esas sombras. Nunca cuestionan lo que ven. ¿Por qué habrían de hacerlo? Es todo lo que conocen. Es todo lo que son.',
  '¿Y si nosotros somos esos prisioneros? ¿Y si lo que llamamos realidad es tan solo el reflejo de algo más profundo, algo que aún no hemos tenido el valor de mirar de frente?',
  'Hoy vas a vivir esa pregunta desde adentro. Serás uno de esos prisioneros. Sentirás el peso de las cadenas. Aprenderás a no cuestionar, a seguir la corriente.',
  'Pero en algún momento, algo te llamará desde el fondo de la caverna. Una luz. Y tendrás que decidir si tienes el valor de caminar hacia ella.',
  'Soy Jafet Brito, y seré tu guía en este viaje filosófico. Bienvenido... a La Cueva de Platón.',
]

// ── Cave missions ─────────────────────────────────────────────────────────────
const CAVE_MISSIONS = [
  { id: 'meet_jafet',          title: 'Entra a la Cueva',             icon: '🏛️', desc: 'Comienza la experiencia de la Cueva de Platón', xp: 20,  stage: 0 },
  { id: 'use_no_cuestionar',   title: 'No Cuestiones',                icon: '🔒', desc: 'Usa "No Cuestionar Nada" — vive como prisionero',  xp: 30,  stage: 1 },
  { id: 'use_seguir_corriente',title: 'Sigue la Corriente',           icon: '🌊', desc: 'Usa "Seguir la Corriente" — acepta las sombras',    xp: 30,  stage: 1 },
  { id: 'exit_cave',           title: 'Sal de la Cueva',              icon: '🌅', desc: 'Encuentra la salida y ve la luz por primera vez',   xp: 50,  stage: 1 },
  { id: 'free_prisoners',      title: 'Despierta a los Demás',        icon: '☀️', desc: 'Libera a los 3 prisioneros con tu nueva habilidad', xp: 100, stage: 2 },
]

// ── Jafet dialogue per stage ──────────────────────────────────────────────────
const JAFET_LINES = {
  stage1Entry: [
    'Aquí estás. En la cueva. Encadenado como todos los demás. 🔒',
    'Ves a tus compañeros — llevan aquí toda su vida, mirando estas sombras.',
    'Tienes dos habilidades que definen al prisionero. Úsalas y vive la experiencia por dentro.',
    'Cuando sientas que estás listo... hay una luz al fondo. Búscala. 🌅',
  ],
  stage1Skills: [
    '¡Así es! Sientes el peso de las cadenas... la comodidad de no cuestionar. ⛓️',
    'Así vivimos muchos: aceptando las sombras sin preguntarnos qué las proyecta.',
    'Pero algo en ti se resiste... ¿Puedes ver la salida al fondo? 🌅',
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

// ── Prisoner positions ────────────────────────────────────────────────────────
const PRISONER_POSITIONS = [[-3.5, 0, -2], [0, 0, -3], [3.5, 0, -2]]

// ── 3D: Animated fire pit ─────────────────────────────────────────────────────
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
      glowRef.current.material.opacity = 0.22 + Math.sin(t * 4) * 0.08
    }
  })

  return (
    <group position={position}>
      {[0, 1, 2, 3, 4].map((i) => {
        const a = (i / 5) * Math.PI * 2
        return (
          <mesh key={i} position={[Math.sin(a) * 0.9, 0.2, Math.cos(a) * 0.9]}>
            <sphereGeometry args={[0.35, 6, 5]} />
            <meshStandardMaterial color="#4a4035" roughness={1} />
          </mesh>
        )
      })}
      <mesh ref={outerRef} position={[0, 0.9, 0]}>
        <coneGeometry args={[0.55, 1.8, 8]} />
        <meshStandardMaterial color="#f97316" emissive="#ea580c" emissiveIntensity={1.8} transparent opacity={0.85} />
      </mesh>
      <mesh ref={innerRef} position={[0, 0.8, 0]}>
        <coneGeometry args={[0.3, 1.4, 7]} />
        <meshStandardMaterial color="#fbbf24" emissive="#fde047" emissiveIntensity={2.4} transparent opacity={0.9} />
      </mesh>
      <mesh ref={glowRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
        <ringGeometry args={[0.6, 3.5, 32]} />
        <meshBasicMaterial color="#f97316" transparent opacity={0.22} />
      </mesh>
    </group>
  )
}

// ── 3D: Wall torch ────────────────────────────────────────────────────────────
function WallTorch({ position }) {
  const flameRef = useRef()
  useFrame(({ clock }) => {
    if (!flameRef.current) return
    const t = clock.getElapsedTime()
    flameRef.current.scale.y = 1 + Math.sin(t * 8 + position[0]) * 0.22
    flameRef.current.material.emissiveIntensity = 1.8 + Math.sin(t * 11 + position[2]) * 0.5
  })
  return (
    <group position={position}>
      {/* Torch body */}
      <mesh rotation={[0.3, 0, 0]}>
        <cylinderGeometry args={[0.05, 0.07, 0.5, 6]} />
        <meshStandardMaterial color="#5a3a10" roughness={1} />
      </mesh>
      {/* Flame */}
      <mesh ref={flameRef} position={[0, 0.4, 0]}>
        <coneGeometry args={[0.14, 0.4, 6]} />
        <meshStandardMaterial color="#f97316" emissive="#f97316" emissiveIntensity={2} transparent opacity={0.9} />
      </mesh>
    </group>
  )
}

// ── 3D: Shadow projections on back wall ───────────────────────────────────────
function ShadowProjections() {
  const shadesRef = useRef([])
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    shadesRef.current.forEach((m, i) => {
      if (!m) return
      const wobble = Math.sin(t * 1.2 + i * 2.1) * 0.06
      m.scale.x = 1 + wobble
      m.scale.y = 1 + Math.cos(t * 0.9 + i) * 0.05
      m.material.opacity = 0.45 + Math.abs(Math.sin(t * 0.8 + i)) * 0.2
    })
  })
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
          <meshBasicMaterial color="#0a0506" transparent opacity={0.5} />
        </mesh>
      ))}
    </>
  )
}

// ── 3D: Prisoner NPC ──────────────────────────────────────────────────────────
function PrisonerMesh({ position, freed, onFree, canFree }) {
  const groupRef = useRef()
  const [hovered, setHovered] = useState(false)
  useFrame(({ clock }) => {
    if (!groupRef.current || freed) return
    groupRef.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.4) * 0.08
  })
  const color = freed ? '#4ade80' : (hovered && canFree) ? '#fde047' : '#b8956a'
  return (
    <group
      ref={groupRef}
      position={position}
      onClick={() => canFree && !freed && onFree()}
      onPointerOver={() => canFree && !freed && setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <mesh position={[0, 0.65, 0]}>
        <cylinderGeometry args={[0.2, 0.25, 1.1, 8]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
      <mesh position={[0, 1.38, 0]}>
        <sphereGeometry args={[0.22, 10, 8]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
      {!freed && [-0.3, 0.3].map((x, i) => (
        <mesh key={i} position={[x, 0.4, 0]} rotation={[0, 0, Math.PI / 3 * (i ? 1 : -1)]}>
          <torusGeometry args={[0.1, 0.03, 6, 12]} />
          <meshStandardMaterial color="#8a7a5a" metalness={0.8} roughness={0.3} />
        </mesh>
      ))}
      {freed && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
          <ringGeometry args={[0.3, 0.7, 20]} />
          <meshStandardMaterial color="#4ade80" emissive="#4ade80" emissiveIntensity={1.2} transparent opacity={0.5} />
        </mesh>
      )}
      {canFree && !freed && hovered && (
        <mesh position={[0, 2.0, 0]}>
          <sphereGeometry args={[0.12, 8, 8]} />
          <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={2} />
        </mesh>
      )}
    </group>
  )
}

// ── 3D: Jafet NPC ─────────────────────────────────────────────────────────────
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

// ── 3D: Cave exit portal ──────────────────────────────────────────────────────
function CaveExit({ onEnter, visible }) {
  const glowRef = useRef()
  useFrame(({ clock }) => {
    if (!glowRef.current) return
    glowRef.current.material.opacity = 0.6 + Math.sin(clock.getElapsedTime() * 2) * 0.25
  })
  if (!visible) return null
  return (
    <group position={[-6, 2, -8]}>
      <mesh ref={glowRef} rotation={[0, Math.PI / 4, 0]}>
        <coneGeometry args={[1.2, 4.5, 12, 1, true]} />
        <meshBasicMaterial color="#fde68a" transparent opacity={0.65} side={THREE.DoubleSide} />
      </mesh>
      <pointLight color="#fde68a" intensity={6} distance={8} />
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

// ── 3D: Full cave scene (brighter) ────────────────────────────────────────────
function CaveScene({ stage, freedPrisoners, onFreePrisoner, onExitCave, phase }) {
  const jafetMascot = getMascotById(JAFET_MASCOT_ID)
  const canFree = stage === 2

  // Torch positions on walls
  const torchPositions = [
    [-7.4, 2.8, -3],
    [-7.4, 2.8, -8],
    [7.4, 2.8, -4],
    [7.4, 2.8, -9],
    [0, 2.8, -14.2],
  ]

  return (
    <>
      {/* Brighter background */}
      <color attach="background" args={['#1a0e06']} />
      <fog attach="fog" args={['#1a0e06', 18, 38]} />

      {/* Ambient light — much brighter than before */}
      <ambientLight intensity={0.55} color="#6b3e18" />

      {/* Main fire light (big) */}
      <pointLight position={[0, 2.5, -12]} color="#f97316" intensity={14} distance={36} decay={2} />
      <pointLight position={[0, 1.5, -12]} color="#fbbf24" intensity={6} distance={24} decay={2} />

      {/* Torch lights on walls */}
      <pointLight position={[-7, 3, -3]} color="#f97316" intensity={5} distance={12} decay={2} />
      <pointLight position={[-7, 3, -8]} color="#f97316" intensity={5} distance={12} decay={2} />
      <pointLight position={[7, 3, -4]}  color="#f97316" intensity={5} distance={12} decay={2} />
      <pointLight position={[7, 3, -9]}  color="#f97316" intensity={5} distance={12} decay={2} />

      {/* Fill light near player spawn so they can see themselves */}
      <pointLight position={[0, 4, 2]}  color="#8a5028" intensity={5} distance={16} decay={2} />
      <pointLight position={[0, 3, -6]} color="#7a4518" intensity={4} distance={14} decay={2} />

      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
        <planeGeometry args={[28, 36]} />
        <meshStandardMaterial color="#3a2510" roughness={1} />
      </mesh>

      {/* Ceiling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 8, -5]}>
        <planeGeometry args={[28, 36]} />
        <meshStandardMaterial color="#1e1408" roughness={1} />
      </mesh>

      {/* Left wall */}
      <mesh rotation={[0, Math.PI / 2, 0]} position={[-8, 4, -5]}>
        <planeGeometry args={[36, 9]} />
        <meshStandardMaterial color="#4a2e12" roughness={1} />
      </mesh>

      {/* Right wall */}
      <mesh rotation={[0, -Math.PI / 2, 0]} position={[8, 4, -5]}>
        <planeGeometry args={[36, 9]} />
        <meshStandardMaterial color="#4a2e12" roughness={1} />
      </mesh>

      {/* Back wall */}
      <mesh position={[0, 4.5, -15]}>
        <planeGeometry args={[20, 12]} />
        <meshStandardMaterial color="#3a2210" roughness={1} />
      </mesh>

      {/* Stalactites */}
      {[[-4, 8, -6], [0, 8, -9], [4, 8, -7], [-2, 8, -12], [2.5, 8, -11]].map(([x, y, z], i) => (
        <mesh key={i} position={[x, y - 0.3, z]} rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[0.2 + i * 0.04, 0.8 + i * 0.3, 7]} />
          <meshStandardMaterial color="#3c2a14" roughness={1} />
        </mesh>
      ))}

      {/* Rock formations */}
      {[[-7, 0.5, -3], [-7, 0.5, -8], [7, 0.5, -4], [7, 0.5, -9]].map(([x, y, z], i) => (
        <mesh key={i} position={[x, y, z]}>
          <dodecahedronGeometry args={[0.7 + i * 0.15, 0]} />
          <meshStandardMaterial color="#3e2a12" roughness={1} />
        </mesh>
      ))}

      {/* Wall torches */}
      {torchPositions.map((pos, i) => <WallTorch key={i} position={pos} />)}

      <FirePit position={[0, 0, -12]} />
      <ShadowProjections />

      {/* Only show Jafet NPC during play phase */}
      {phase === 'play' && <JafetNpc3D mascot={jafetMascot} />}

      {PRISONER_POSITIONS.map((pos, i) => (
        <PrisonerMesh
          key={i}
          position={pos}
          freed={freedPrisoners.includes(i)}
          canFree={canFree}
          onFree={() => onFreePrisoner(i)}
        />
      ))}

      <CaveExit visible={stage === 1} onEnter={onExitCave} />
    </>
  )
}

// ── UI: Start screen ──────────────────────────────────────────────────────────
function StartScreen({ onStart, onBack }) {
  return (
    <div
      className="absolute inset-0 z-40 flex flex-col items-center justify-center px-6"
      style={{ background: 'linear-gradient(to bottom, rgba(10,5,3,0.9) 0%, rgba(10,5,3,0.97) 100%)' }}
    >
      <div className="flex max-w-lg flex-col items-center gap-8 text-center">
        {/* Title */}
        <div>
          <p className="mb-3 text-7xl">🏛️</p>
          <h1
            className="text-4xl font-black tracking-tight"
            style={{ color: '#eab308', textShadow: '0 0 50px rgba(234,179,8,0.35)' }}
          >
            La Cueva de Platón
          </h1>
          <p className="mt-2 text-base" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Experiencia filosófica interactiva
          </p>
        </div>

        {/* Description */}
        <div
          className="rounded-2xl px-5 py-4 text-left"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)' }}>
            Estás a punto de vivir la Alegoría de la Cueva de Platón desde adentro.
            Serás un prisionero. Usarás sus habilidades. Y cuando estés listo...
            encontrarás la salida hacia la luz.
          </p>
          <p className="mt-3 text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>
            🎧 Activa el volumen — hay una narración de introducción
          </p>
        </div>

        {/* Start button */}
        <button
          type="button"
          onClick={onStart}
          className="rounded-2xl px-14 py-4 text-xl font-black transition-all hover:scale-105 active:scale-95"
          style={{
            background: 'linear-gradient(135deg, #eab308 0%, #f97316 100%)',
            color: '#0a0600',
            boxShadow: '0 0 50px rgba(234,179,8,0.35)',
          }}
        >
          🏛️ Iniciar Misión
        </button>

        <button
          type="button"
          onClick={onBack}
          className="text-xs transition"
          style={{ color: 'rgba(255,255,255,0.2)' }}
        >
          ← Volver al curso
        </button>
      </div>
    </div>
  )
}

// ── UI: Cinematic overlay (~2 min narration) ──────────────────────────────────
function CinematicOverlay({ onDone }) {
  const [lineIdx, setLineIdx] = useState(0)
  const [lineVisible, setLineVisible] = useState(false)
  const skipRef = useRef(false)

  // Fade in each new line
  useEffect(() => {
    setLineVisible(false)
    const t = setTimeout(() => setLineVisible(true), 100)
    return () => clearTimeout(t)
  }, [lineIdx])

  // TTS + timing: waits for onend before advancing to next line
  useEffect(() => {
    if (skipRef.current) return

    const text = INTRO_CINEMATIC[lineIdx]
    let settled = false

    const advance = () => {
      if (skipRef.current || settled) return
      settled = true
      if (lineIdx >= INTRO_CINEMATIC.length - 1) {
        setTimeout(onDone, 900)
      } else {
        // brief pause between lines
        setTimeout(() => {
          if (!skipRef.current) setLineIdx((p) => p + 1)
        }, 350)
      }
    }

    if (window.speechSynthesis && useVrSettingsStore.getState().npcVoice !== false) {
      // Clean text for TTS (remove emojis)
      const clean = text
        .replace(/[\u{1F000}-\u{1FFFF}]/gu, '')
        .replace(/[^\w\s.,!?¿¡'"—áéíóúüñÁÉÍÓÚÜÑ]/g, '')
        .trim()

      const utt = new SpeechSynthesisUtterance(clean)
      utt.lang = 'es-ES'
      utt.rate = 0.86
      utt.pitch = 1.0
      utt.volume = 1.0

      // Safety timeout: if onend never fires (browser bug), advance anyway
      const safetyMs = Math.max(8000, clean.length * 78)
      const safety = setTimeout(() => {
        window.speechSynthesis.cancel()
        advance()
      }, safetyMs)

      utt.onend = () => {
        clearTimeout(safety)
        setTimeout(advance, 500) // 0.5s pause after speech ends
      }
      utt.onerror = () => {
        clearTimeout(safety)
        advance()
      }

      window.speechSynthesis.cancel()
      window.speechSynthesis.speak(utt)

      return () => {
        clearTimeout(safety)
        settled = true
        window.speechSynthesis.cancel()
      }
    } else {
      // No TTS fallback: estimate from text length
      const ms = Math.max(4500, text.length * 68)
      const t = setTimeout(advance, ms)
      return () => { clearTimeout(t); settled = true }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lineIdx])

  const handleSkip = () => {
    skipRef.current = true
    window.speechSynthesis?.cancel()
    onDone()
  }

  const progress = (lineIdx / (INTRO_CINEMATIC.length - 1)) * 100

  return (
    <div
      className="absolute inset-0 z-50 flex flex-col items-center justify-center"
      style={{ background: 'rgba(4,2,8,0.97)' }}
    >
      {/* Skip button */}
      <button
        type="button"
        onClick={handleSkip}
        className="absolute right-4 top-4 rounded-xl px-4 py-2 text-xs font-bold transition hover:opacity-80"
        style={{
          background: 'rgba(255,255,255,0.06)',
          color: 'rgba(255,255,255,0.4)',
          border: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        Omitir →
      </button>

      {/* Progress bar */}
      <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: 'rgba(255,255,255,0.07)' }}>
        <div
          className="h-full transition-all duration-700"
          style={{ width: `${progress}%`, background: 'linear-gradient(90deg, #eab308, #f97316)' }}
        />
      </div>

      {/* Decorative */}
      <div
        className="absolute inset-x-0 top-1/4 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(234,179,8,0.12), transparent)' }}
      />

      {/* Line text */}
      <div
        className="mx-auto max-w-2xl px-8 text-center"
        style={{
          opacity: lineVisible ? 1 : 0,
          transform: lineVisible ? 'translateY(0)' : 'translateY(10px)',
          transition: 'opacity 0.5s ease, transform 0.5s ease',
        }}
      >
        <p
          className="text-xl font-light leading-relaxed sm:text-2xl"
          style={{
            color: 'rgba(255,255,255,0.92)',
            fontStyle: 'italic',
            textShadow: '0 2px 30px rgba(0,0,0,0.6)',
            lineHeight: 1.7,
          }}
        >
          &ldquo;{INTRO_CINEMATIC[lineIdx]}&rdquo;
        </p>

        {/* Line counter */}
        <p className="mt-6 text-[11px] tracking-widest" style={{ color: 'rgba(255,255,255,0.15)' }}>
          {lineIdx + 1} / {INTRO_CINEMATIC.length}
        </p>
      </div>

      {/* Narrator card */}
      <div
        className="absolute bottom-8 flex items-center gap-3 rounded-2xl px-5 py-3"
        style={{ background: 'rgba(20,10,35,0.9)', border: '1px solid rgba(234,179,8,0.22)' }}
      >
        <div
          className="flex h-10 w-10 items-center justify-center rounded-full text-xl"
          style={{ background: 'rgba(234,179,8,0.12)', border: '1px solid rgba(234,179,8,0.35)' }}
        >
          🎓
        </div>
        <div>
          <p className="text-xs font-black" style={{ color: '#fcd34d' }}>Jafet Brito</p>
          <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.3)' }}>Filósofo y Guía</p>
        </div>
        {/* Speaking indicator */}
        <div className="ml-3 flex items-end gap-0.5 pb-0.5">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="animate-bounce rounded-full"
              style={{
                width: 3,
                height: 3 + i * 2,
                background: '#eab308',
                animationDelay: `${i * 0.12}s`,
                animationDuration: '0.7s',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

// ── UI: Skill bar ─────────────────────────────────────────────────────────────
const STAGE1_SKILLS = [
  { id: 'no_cuestionar',    name: 'No Cuestionar Nada',  icon: '🔒', color: '#8b7355', missionId: 'use_no_cuestionar' },
  { id: 'seguir_corriente', name: 'Seguir la Corriente', icon: '🌊', color: '#5b7a8a', missionId: 'use_seguir_corriente' },
]
const STAGE2_SKILLS = [
  { id: 'despertar_demas',  name: 'Despertar a los Demás', icon: '☀️', color: '#f59e0b', missionId: null },
]

function CaveSkillBar({ stage, done, onUseSkill }) {
  const skills = stage === 1 ? STAGE1_SKILLS : stage === 2 ? STAGE2_SKILLS : []
  if (!skills.length) return null

  return (
    <div className="absolute bottom-6 left-1/2 z-20 -translate-x-1/2 flex flex-col items-center gap-2">
      <p className="text-[9px] font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.3)' }}>
        Habilidades del {stage === 1 ? 'Prisionero' : 'Filósofo'}
      </p>
      <div className="flex gap-4">
        {skills.map((sk) => {
          const isDone = done.includes(sk.missionId)
          return (
            <button
              key={sk.id}
              type="button"
              onClick={() => !isDone && onUseSkill(sk)}
              title={sk.name}
              className="flex flex-col items-center gap-1.5 transition active:scale-90"
            >
              <div
                className="flex h-16 w-16 items-center justify-center rounded-2xl text-3xl shadow-xl"
                style={{
                  background: `radial-gradient(circle at 38% 36%, ${sk.color}44, ${sk.color}18)`,
                  border: `2px solid ${isDone ? 'rgba(74,222,128,0.6)' : sk.color + '99'}`,
                  boxShadow: isDone
                    ? '0 0 14px rgba(74,222,128,0.3)'
                    : `0 0 14px ${sk.color}44`,
                  opacity: isDone ? 0.55 : 1,
                }}
              >
                {isDone ? '✅' : sk.icon}
              </div>
              <span
                className="text-center text-[9px] font-semibold leading-tight"
                style={{ color: 'rgba(255,255,255,0.55)', maxWidth: 64 }}
              >
                {sk.name}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ── UI: Mission panel ─────────────────────────────────────────────────────────
function MissionPanel({ done, stage }) {
  return (
    <div className="absolute left-3 top-16 z-20 w-52 sm:w-60">
      <div
        className="rounded-2xl p-3 backdrop-blur-sm"
        style={{ background: 'rgba(12,6,4,0.88)', border: '1px solid rgba(234,179,8,0.22)' }}
      >
        <p className="mb-2 text-[10px] font-black uppercase tracking-wider" style={{ color: '#eab308' }}>
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
                    ? 'border-primary/20 bg-primary/5 opacity-50'
                    : isActive
                    ? 'border-yellow-500/35 bg-yellow-500/8'
                    : 'border-white/5 opacity-30'
                }`}
              >
                <span className="mt-0.5 shrink-0 text-sm">
                  {isDone ? '✅' : isActive ? m.icon : '🔒'}
                </span>
                <div className="min-w-0 flex-1">
                  <p className={`text-[11px] font-bold leading-snug ${
                    isActive ? 'text-yellow-200' : isDone ? 'text-text-muted line-through' : 'text-white/25'
                  }`}>
                    {m.title}
                  </p>
                  {isActive && (
                    <p className="mt-0.5 text-[9px] leading-snug text-white/35">{m.desc}</p>
                  )}
                </div>
                {isActive && (
                  <span
                    className="shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-black"
                    style={{ background: 'rgba(234,179,8,0.18)', color: '#eab308' }}
                  >
                    +{m.xp}
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

// ── UI: Dialogue box ──────────────────────────────────────────────────────────
function DialogueBox({ messages, onClose, onUserMessage, isLoading }) {
  const [input, setInput] = useState('')
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const speakText = useCallback((text) => {
    if (!useVrSettingsStore.getState().npcVoice || !window.speechSynthesis) return
    const clean = text.replace(/[\u{1F000}-\u{1FFFF}]/gu, '').replace(/[^\w\s.,!?¿¡]/g, '').trim()
    if (!clean) return
    window.speechSynthesis.cancel()
    const utt = new SpeechSynthesisUtterance(clean)
    utt.lang = 'es-ES'; utt.rate = 0.92; utt.pitch = 1.05
    window.speechSynthesis.speak(utt)
  }, [])

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
        className="flex flex-col overflow-hidden rounded-t-3xl shadow-2xl backdrop-blur-sm sm:rounded-3xl"
        style={{
          maxHeight: '55vh',
          minHeight: '200px',
          background: 'linear-gradient(160deg, #1a0f2e 0%, #0c0814 100%)',
          border: '1px solid rgba(234,179,8,0.28)',
        }}
      >
        <div
          className="flex items-center gap-3 px-4 py-3"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}
        >
          <span className="text-2xl">🎓</span>
          <div className="flex-1">
            <p className="text-sm font-black" style={{ color: '#fcd34d' }}>Jafet Brito</p>
            <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.3)' }}>Profesor de Filosofía</p>
          </div>
          <button type="button" onClick={onClose} className="text-xl leading-none transition" style={{ color: 'rgba(255,255,255,0.3)' }}>×</button>
        </div>

        <div className="flex flex-col gap-2 overflow-y-auto p-3">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className="max-w-[85%] rounded-2xl px-3 py-2 text-xs leading-relaxed"
                style={
                  msg.role === 'user'
                    ? { background: 'rgba(234,179,8,0.22)', color: '#fde68a', borderRadius: '16px 16px 4px 16px' }
                    : { background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.8)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px 16px 16px 4px' }
                }
              >
                {msg.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="animate-pulse rounded-2xl px-3 py-2 text-xs" style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.35)' }}>
                Jafet está escribiendo…
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <div className="flex gap-2 p-3" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send()}
            placeholder="Pregúntale a Jafet…"
            className="flex-1 rounded-xl px-3 py-2 text-xs outline-none"
            style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.85)' }}
          />
          <button type="button" onClick={send}
            className="rounded-xl px-3 py-2 text-xs font-black transition"
            style={{ background: 'rgba(234,179,8,0.28)', color: '#fcd34d' }}>
            →
          </button>
        </div>
      </div>
    </div>
  )
}

// ── UI: Skill VFX overlay ─────────────────────────────────────────────────────
function SkillVfx({ skill, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 1600)
    return () => clearTimeout(t)
  }, [onDone])
  return (
    <div className="pointer-events-none absolute inset-0 z-40 flex items-center justify-center">
      <div
        className="animate-ping rounded-full"
        style={{ width: 160, height: 160, background: `radial-gradient(circle, ${skill.color}55, transparent)`, border: `3px solid ${skill.color}` }}
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

  // phase: 'start' → 'cinematic' → 'play'
  const [phase, setPhase] = useState('start')
  const [stage, setStage] = useState(1)
  const [done, setDone] = useState([])
  const [showDialogue, setShowDialogue] = useState(false)
  const [dialogueMessages, setDialogueMessages] = useState([])
  const [isJafetTyping, setIsJafetTyping] = useState(false)
  const [freedPrisoners, setFreedPrisoners] = useState([])
  const [activeVfx, setActiveVfx] = useState(null)
  const [complete, setComplete] = useState(false)
  // Subtitle hint shown briefly after cinematic
  const [subtitle, setSubtitle] = useState(null)

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

  // After cinematic: auto-play stage1 entry lines then give freedom
  function startPlayPhase() {
    setPhase('play')
    setStage(1)
    completeMission('meet_jafet')

    // Show each entry line as a subtitle (not blocking)
    JAFET_LINES.stage1Entry.forEach((line, i) => {
      setTimeout(() => {
        setSubtitle(line)
        // Speak via TTS (non-blocking)
        if (window.speechSynthesis && useVrSettingsStore.getState().npcVoice !== false) {
          const clean = line.replace(/[\u{1F000}-\u{1FFFF}]/gu, '').replace(/[^\w\s.,!?¿¡]/g, '').trim()
          const utt = new SpeechSynthesisUtterance(clean)
          utt.lang = 'es-ES'; utt.rate = 0.9; utt.pitch = 1.05
          window.speechSynthesis.cancel()
          window.speechSynthesis.speak(utt)
        }
      }, i * 5500)
    })
    // Clear subtitle after last line
    setTimeout(() => setSubtitle(null), JAFET_LINES.stage1Entry.length * 5500 + 2000)
  }

  // Stage 1 → 2 when exit_cave done
  useEffect(() => {
    if (done.includes('exit_cave') && stage === 1) {
      setStage(2)
      JAFET_LINES.stage2.forEach((l, i) => {
        setTimeout(() => pushJafet(l), i * 4000)
      })
      setShowDialogue(true)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done])

  // Complete when all prisoners freed
  useEffect(() => {
    if (freedPrisoners.length >= PRISONER_POSITIONS.length && !done.includes('free_prisoners')) {
      completeMission('free_prisoners')
      setComplete(true)
      JAFET_LINES.complete.forEach((l, i) => setTimeout(() => pushJafet(l), i * 4000))
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
        const reply = await sendNpcMessage({ npcPrompt: JAFET_AI_PROMPT, content: text, history: dialogueMessages })
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
    // Show stage 1 lines after using first skill
    if (stage === 1) {
      const usedSkills = done.filter((d) => ['use_no_cuestionar', 'use_seguir_corriente'].includes(d)).length
      if (usedSkills === 0) {
        JAFET_LINES.stage1Skills.forEach((l, i) => setTimeout(() => pushJafet(l), i * 4000))
        setShowDialogue(true)
      }
    }
  }

  function handleExitCave() {
    completeMission('exit_cave')
    if (!showDialogue) {
      setShowDialogue(true)
      JAFET_LINES.stage2.forEach((l, i) => setTimeout(() => pushJafet(l), i * 4000))
    }
  }

  function handleFreePrisoner(index) {
    if (freedPrisoners.includes(index)) return
    setFreedPrisoners((prev) => [...prev, index])
    setActiveVfx(STAGE2_SKILLS[0])
  }

  return (
    <div className="relative h-screen w-screen overflow-hidden" style={{ background: '#1a0e06' }}>

      {/* ── 3D Canvas ── */}
      <Canvas camera={{ position: [0, 2.5, 6], fov: 65 }} className="absolute inset-0">
        <CaveScene
          stage={stage}
          phase={phase}
          freedPrisoners={freedPrisoners}
          onFreePrisoner={handleFreePrisoner}
          onExitCave={handleExitCave}
        />
      </Canvas>

      {/* ── Skill VFX ── */}
      {activeVfx && <SkillVfx skill={activeVfx} onDone={() => setActiveVfx(null)} />}

      {/* ── START SCREEN ── */}
      {phase === 'start' && (
        <StartScreen
          onStart={() => setPhase('cinematic')}
          onBack={() => navigate(-1)}
        />
      )}

      {/* ── CINEMATIC ── */}
      {phase === 'cinematic' && (
        <CinematicOverlay onDone={startPlayPhase} />
      )}

      {/* ── PLAY UI ── */}
      {phase === 'play' && (
        <>
          {/* Top title bar */}
          <div className="pointer-events-none absolute left-0 right-0 top-0 flex justify-center pt-4 z-20">
            <div
              className="rounded-2xl px-5 py-2 backdrop-blur-sm"
              style={{ background: 'rgba(12,6,4,0.82)', border: '1px solid rgba(234,179,8,0.28)' }}
            >
              <p className="text-center text-sm font-black" style={{ color: '#eab308' }}>🏛️ La Cueva de Platón</p>
              <p className="text-center text-[10px]" style={{ color: 'rgba(255,255,255,0.3)' }}>
                {stage === 1 && !complete && 'Etapa 1: El Prisionero — usa tus habilidades y encuentra la salida'}
                {stage === 2 && !complete && `Etapa 2: La Liberación — ${freedPrisoners.length} / ${PRISONER_POSITIONS.length} liberados`}
                {complete && '¡Cueva completada! ✅'}
              </p>
            </div>
          </div>

          {/* Mission panel */}
          <MissionPanel done={done} stage={stage} />

          {/* Skill bar — always visible in play phase */}
          {!complete && (
            <CaveSkillBar stage={stage} done={done} onUseSkill={handleUseSkill} />
          )}

          {/* Subtitle captions (after cinematic intro) */}
          {subtitle && !showDialogue && (
            <div
              className="pointer-events-none absolute bottom-28 left-1/2 z-25 -translate-x-1/2 max-w-md px-5 py-3 rounded-2xl text-center backdrop-blur-sm"
              style={{ background: 'rgba(8,4,2,0.85)', border: '1px solid rgba(234,179,8,0.2)' }}
            >
              <p className="text-xs font-black mb-0.5" style={{ color: '#eab308' }}>🎓 Jafet Brito</p>
              <p className="text-sm leading-snug" style={{ color: 'rgba(255,255,255,0.8)' }}>{subtitle}</p>
            </div>
          )}

          {/* Jafet talk button (only show when no dialogue and no subtitle) */}
          {!showDialogue && !complete && !subtitle && (
            <div className="absolute bottom-28 left-1/2 z-20 -translate-x-1/2">
              <button
                type="button"
                onClick={() => setShowDialogue(true)}
                className="flex items-center gap-2 rounded-2xl px-6 py-3 font-black transition-all active:scale-95"
                style={{
                  background: 'rgba(12,6,4,0.9)',
                  border: '1px solid rgba(234,179,8,0.45)',
                  color: '#eab308',
                }}
              >
                🎓 Hablar con Jafet Brito
              </button>
            </div>
          )}

          {/* Stage 2 prisoner hint */}
          {stage === 2 && !complete && !showDialogue && !subtitle && (
            <div
              className="pointer-events-none absolute bottom-36 left-1/2 z-20 -translate-x-1/2 rounded-full px-4 py-1.5 text-xs font-semibold backdrop-blur-sm"
              style={{ background: 'rgba(12,6,4,0.82)', border: '1px solid rgba(234,179,8,0.28)', color: 'rgba(255,255,255,0.55)' }}
            >
              ☀️ Haz clic en los prisioneros para despertarlos
            </div>
          )}

          {/* Complete banner */}
          {complete && (
            <div
              className="absolute inset-x-0 bottom-0 z-20 flex flex-col items-center gap-4 px-4 pb-8 pt-16"
              style={{ background: 'linear-gradient(to top, rgba(8,4,2,0.97), transparent)' }}
            >
              <div className="text-center">
                <p className="text-5xl">🏛️</p>
                <p className="mt-2 text-2xl font-black" style={{ color: '#eab308' }}>¡La Cueva Completada!</p>
                <p className="mt-1 text-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>
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
                style={{ color: 'rgba(255,255,255,0.3)' }}
              >
                🌍 Ir al Campus VR
              </button>
            </div>
          )}

          {/* Dialogue box */}
          {showDialogue && (
            <DialogueBox
              messages={dialogueMessages}
              onClose={() => setShowDialogue(false)}
              onUserMessage={handleUserMessage}
              isLoading={isJafetTyping}
            />
          )}
        </>
      )}
    </div>
  )
}
