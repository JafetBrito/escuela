/**
 * VrArbol — Mundo tutorial de Oliver Academy (ruta /vr-templo). Escenario:
 * Templo egipcio importado (/MODELOS 3D/VR/egyptian_temple.glb). El nombre
 * del archivo/identificadores internos se quedó como "Arbol" a propósito
 * (era un árbol procedural antes) — solo cambió el modelo 3D, no hay que
 * renombrar nada más por esto.
 *
 * DOS NPCs, ROLES FIJOS (ver NPCS más abajo): Jafet narra la bienvenida;
 * desde choose_avatar_class en adelante, Oliver (el mismo gato naranja
 * mascotId 8 que ya existe como NPC idle en el Campus — ver OLIVER_NPC en
 * vrNpcRegistry.js) da el resto de las misiones.
 *
 * MOTOR DE MISIONES DECLARATIVO — cada paso vive ENTERO como un objeto en
 * src/data/tutorialMissions.js: id/xp/título (ya existía) + speaker/dialogue
 * (quién habla y qué dice) + cta (qué botón mostrar y qué hace: abrir un
 * overlay, navegar, soltar un hint, o completar+navegar). Agregar o editar
 * un paso normal es tocar SOLO ese archivo — este archivo solo interpreta la
 * data (getStepDialogue, ActionButton, handleMissionAction, openOverlayId).
 * Lo que NO entra en esa data (el tracker de movimiento+chat de
 * practice_basics, el watcher del chat-store de first_chat, el modal
 * encadenado de test_ability) sigue siendo código a propósito — son
 * mecánicas genuinamente distintas, no haría sentido forzarlas a una forma
 * común. "Por stages" = cada mission.speaker es, en efecto, un stage: cambia
 * quién habla y qué se puede hacer en la escena.
 *
 * FLUJO DE MISIONES (ver src/data/tutorialMissions.js para XP/orden real):
 *   1. meet_jafet        — cinemática de bienvenida (10 líneas con voz) +
 *                          revelación del Templo (con Jafet Y Oliver ya
 *                          visibles en la escena). Se completa solo, al
 *                          terminar la cinemática (no requiere acción).
 *   2. practice_basics   — moverte (MovementTracker) + escribirle algo a
 *                          Jafet en el chat de prueba (DialogueBox). Ambos
 *                          son reales, no temporizadores. Última misión que
 *                          da Jafet — de aquí en adelante habla Oliver.
 *   3. choose_avatar_class — AvatarClassPicker: grid de clases → tarjeta de
 *                          detalle (stats + skills, estilo ClassPreviewCard
 *                          de VRPage.jsx) con un comentario de Oliver sobre
 *                          esa clase (OLIVER_CLASS_LINES).
 *   4. choose_mascot     — abre VrMascotOnboarding.
 *   5. mascot_class      — dentro del mismo modal de VrMascotOnboarding.
 *   6. test_ability      — AbilityRevealCard (lectura de los 2 startSkills
 *                          del Avatar) seguido de SkillTrialPanel (probar
 *                          cada uno de verdad: dispara un SkillBurstVfx en
 *                          el color de la habilidad). No hay sistema de
 *                          combate/cast todavía — esto es lo más real que se
 *                          puede ofrecer sin construir uno.
 *   7. setup_ai          — opcional/saltable, manda a /ajustes.
 *   8. first_chat        — primera conversación con la mascota (vía
 *                          MascotCompanion, fuera de este archivo).
 *   9. enter_campus      — navega a /vr.
 *
 * INTERACCIÓN CON LOS NPCs — mismo patrón que el resto del mundo VR (ver
 * IdleNpc/IdleNpcCard/NpcProximityTracker en VRPage.jsx, que es donde
 * vive el sistema "oficial" que este archivo imita):
 *   - Clic izquierdo en cualquiera de los dos modelos → una frase corta en
 *     un globo (sin abrir nada) — TempleNpc.onSayLine / getAmbientLine(id).
 *     Funciona aunque no sea su turno de dar misiones (línea de relleno).
 *   - Clic derecho (en cualquier punto de la pantalla) / tecla F / botón
 *     flotante inferior, estando cerca del NPC que SÍ es el activeSpeakerId
 *     → abre NpcCard (saludo + botón "Hablar"). Nunca abre la conversación
 *     real por sí solo. Si estás cerca del NPC equivocado, no pasa nada —
 *     hay que caminar hacia el que tiene el ❗.
 *   - Botón "Hablar" de NpcCard → ahí sí abre DialogueBox (la conversación
 *     de verdad, con las acciones de la misión activa).
 *   - ❗ aparece SOLO sobre la cabeza del activeSpeakerId mientras quede
 *     tutorial pendiente, igual que el ❗ de misión en VrNpc.
 *   - showDialogue SOLO se pone en true desde una acción explícita del
 *     jugador (openDialogue) o como continuación de un flujo que el
 *     jugador ya inició (p.ej. después de elegir clase) — nunca se abre
 *     solo al cargar la página o terminar una cinemática.
 *
 * ÍNDICE DEL ARCHIVO (en orden de aparición):
 *   speakLine()            — TTS con safety-timeout (igual que VrCueva.jsx).
 *   runCinematic()          — anima pitch/distance/yaw de la cámara del
 *                            engine entre dos valores; usado en los 2-3
 *                            momentos de cámara dirigida de este archivo.
 *   NPCS                    — Jafet + Oliver: nombre/emoji/posición/mascotId
 *                            /aiPrompt de cada uno.
 *   getStepDialogue()       — speaker+dialogue de un paso (o el terminal
 *                            TUTORIAL_DONE_STEP), leído de tutorialMissions.js.
 *   OLIVER_CLASS_LINES      — comentario de Oliver por cada PLAYER_CLASSES
 *                            id, usado en AvatarClassPicker.
 *   TempleNpc               — modelo 3D compartido por Jafet y Oliver (clic
 *                            =frase, ❗+nombre si `near`). Usa
 *                            MODEL_HALF_HEIGHT para no quedar enterrado —
 *                            cualquier NPC nuevo en un GLB importado
 *                            necesita ese mismo ajuste.
 *   ArbolScene              — luces + el modelo del templo + los 2 TempleNpc.
 *                            OJO: el modelo va envuelto en <RigidBody
 *                            type="fixed" colliders="trimesh"> — sin eso,
 *                            Player.jsx cae para siempre (no hay collider
 *                            real contra qué chocar). Cualquier mundo nuevo
 *                            con useImportedGlbGround necesita lo mismo
 *                            (mismo patrón que Campus/Graffiti en VRPage.jsx).
 *   MovementTracker         — distancia real caminada, para practice_basics.
 *   FallRescueTracker       — mismo rescate por caída que VRPage.jsx
 *                            (Campus), pero sin la animación del gato — solo
 *                            teletransporta de vuelta a ARBOL_SPAWN.
 *   MissionRow              — una fila del panel de misiones (izquierda).
 *   IntroCinematicOverlay   — las 10 líneas iniciales con TTS + botón de
 *                            repetir audio (🔊) por si la voz del navegador
 *                            falla.
 *   RevealTitleCard         — texto flotante durante la fase 'reveal'.
 *   AvatarClassPicker       — grid de PLAYER_CLASSES → tarjeta de detalle con
 *                            comentario de Oliver (oculta 'hacker' salvo
 *                            admin, y sin línea de Oliver para esa clase).
 *   ClassRevealAnnouncer    — flash de "elegiste tu clase" (avatar u oliver).
 *   AbilityRevealCard       — muestra startSkills de ambas clases elegidas.
 *   SkillTrialPanel         — los 2 botones para probar cada startSkill del
 *                            Avatar de verdad (no solo leerla).
 *   SkillBurstVfx           — el anillo de color que dispara SkillTrialPanel,
 *                            mismo lenguaje visual que LocalAttackBurst en
 *                            VRPage.jsx pero sin ángulo de mira (no es combate).
 *   NpcCard                 — el popup de clic-derecho/F (saludo + Hablar),
 *                            para cualquiera de los dos NPCs.
 *   DialogueBox             — la conversación real con el NPC activo (input
 *                            libre + botón de acción de la misión activa).
 *   ActionButton            — botón(es) de acción dentro de DialogueBox,
 *                            específico por missionId.
 *   NpcProximityTracker     — NPC más cercano (jafet/oliver/null) → nearNpcId.
 *   VrArbol (default)       — página principal: estado, efectos, layout.
 */
import { Suspense, useEffect, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import { Physics, RigidBody } from '@react-three/rapier'
import { useNavigate } from 'react-router-dom'
import { useGameStore, PLAYER_CLASSES, OLIVER_CLASSES } from '../../stores/useGameStore'
import { useTutorialStore } from '../../stores/useTutorialStore'
import { useChatStore } from '../../stores/useChatStore'
import { useMascotStore } from '../../stores/useMascotStore'
import { useAuthStore } from '../../stores/useAuthStore'
import { useVrSettingsStore } from '../../stores/useVrSettingsStore'
import { getMascotById } from '../../data/mascotRegistry'
import { useVrCharacterStore } from '../../stores/useVrCharacterStore'
import { getSkinById } from '../../data/skinsRegistry'
import { SKILL_REGISTRY } from '../../data/skillRegistry'
import { TUTORIAL_MISSIONS, TUTORIAL_DONE_STEP, getTutorialMission } from '../../data/tutorialMissions'
import { sendNpcMessage } from '../../services/chat/npcTransport'
import VrMascotOnboarding from './VrMascotOnboarding'
import MascotMesh from '../mascot/MascotMesh'
import MascotCompanion from '../mascot/MascotCompanion'
import { Player, useCameraControls, useMovementKeys, VirtualJoystick, MobileButtons, BubbleStack, MODEL_HALF_HEIGHT } from './engine'
import { useImportedGlbGround } from './worlds/useImportedGlbGround'

// Where each NPC stands and where the player spawns — small offsets near
// the world's center, which is where useImportedGlbGround() recenters
// whatever GLB is loaded, regardless of that model's native scale. Jafet and
// Oliver stand on opposite sides so both are visible together during the
// welcome stage, and so walking from one to the other (as the active
// speaker changes — see each mission's `speaker` in tutorialMissions.js) is
// a deliberate, visible move.
const ARBOL_JAFET_POS = [2.5, 0, -4]
const ARBOL_OLIVER_POS = [-2.5, 0, -4]
const ARBOL_SPAWN = [0, 0, 4]
const NPC_INTERACT_RADIUS = 3.5

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
  '¡Bienvenido, estudiante! 🏛️ Soy Jafet, guardián de este Templo de Oliver Academy. Hoy empieza algo importante.',
  'Oliver Academy no es una escuela común: aquí cada clase, cada compañero y cada decisión se vive dentro de un mundo entero.',
  'Este Templo existe para una sola cosa: prepararte antes de que cruces al Campus, donde todo lo que aprendas aquí se pone en práctica.',
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

// ── NPCs ───────────────────────────────────────────────────────────────────
// Jafet narrates the welcome (meet_jafet/practice_basics); from
// choose_avatar_class onward Oliver takes over as the mission-giver — see
// each step's `speaker` field in tutorialMissions.js, which drives both the
// dialogue header and which NPC's ❗ is currently lit.
const NPCS = {
  jafet: {
    id: 'jafet',
    name: 'Jafet',
    emoji: '🧙‍♂️',
    color: '#98ca3f',
    role: 'Guardián del Templo',
    position: ARBOL_JAFET_POS,
    mascotId: 10,   // mage_elder.glb
    aiPrompt: `Eres Jafet, el guardián del Templo de Oliver Academy. Eres sabio, cercano y con buen humor.
Guías a los nuevos estudiantes a través del tutorial de bienvenida.
Hablas en español, eres entusiasta del aprendizaje y del mundo mágico de Oliver Academy.
Nunca salgas del personaje. Usa emojis ocasionalmente para ser expresivo.`,
  },
  oliver: {
    id: 'oliver',
    name: 'Oliver',
    emoji: '🐱',
    color: '#fb923c',
    role: 'Guía de misiones',
    position: ARBOL_OLIVER_POS,
    mascotId: 8,   // orange_cat.glb — same Oliver as the Campus's idle NPC
    aiPrompt: `Eres Oliver, el gato naranja guía de Oliver Academy. Eres juguetón y bromista
(chistes de gatos y de programación), pero siempre claro sobre qué misión sigue.
Hablas en español. Usa emojis de gato ocasionalmente. Nunca salgas del personaje.`,
  },
}

// Dialogue/speaker per step now lives on each TUTORIAL_MISSIONS entry (see
// tutorialMissions.js) — adding/editing a step's lines no longer touches
// this file. This just looks a step's {speaker, dialogue} up by id, falling
// back to the terminal TUTORIAL_DONE_STEP once every mission is complete.
function getStepDialogue(id) {
  if (!id || id === 'done') return TUTORIAL_DONE_STEP
  return getTutorialMission(id) ?? TUTORIAL_DONE_STEP
}

// ── Oliver's per-class commentary, shown while previewing a class in
// AvatarClassPicker — keyed by PLAYER_CLASSES id. Only the 5 base classes;
// Hacker is admin-only and skips this entirely (see AvatarClassPicker). ────
const OLIVER_CLASS_LINES = {
  programmer: '¿Programador? Buena elección, casi tan rápido como yo cazando una luz láser. ⌨️🐱',
  cyber_strategist: 'Ciber-Estratega, ¿eh? Le gusta vigilar todo desde arriba… como yo en el librero. 🕹️',
  ai_engineer: 'Ingeniero de IA — entrenas modelos, yo entreno a mis humanos para que me den croquetas. 🤖',
  designer: 'Diseñador, todo arte y forma. Yo también soy una obra de arte, por si no lo habías notado. 🎨',
  philosopher: 'Filósofo… le va a sobrar sabiduría para cuando alguien le pregunte "¿por qué un gato hace eso?". 🦉',
}

// ── 3D Scene components ───────────────────────────────────────────────────────

// Every Temple NPC's visible scale — separate from their ground position so
// the MODEL_HALF_HEIGHT lift below can be computed against it. Without that
// lift the model is centered on its ground position, burying roughly the
// bottom half of it in the floor — same convention every other NPC in the
// VR engine uses (see IdleNpc/VrNpc in VRPage.jsx: outer group at ground
// level, inner group lifted by scale * MODEL_HALF_HEIGHT).
const NPC_SCALE = 0.18

// Shared by both Jafet and Oliver — same left-click-for-a-line + proximity
// name tag/exclamation pattern as every other NPC in the app (VRPage.jsx's
// IdleNpc/VrNpc) — see the doc-comment at the top of this file for the full
// list of what's shared vs. bespoke here. `onSayLine` returns the text to
// show in the bubble; `hasQuest` lights the ❗ only on the active speaker.
function TempleNpc({ npc, mascot, near, hasQuest, onSayLine }) {
  const groupRef = useRef()
  const [bubbles, setBubbles] = useState([])
  const bubbleIdRef = useRef(1)

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.3
      groupRef.current.position.y = npc.position[1] + Math.sin(Date.now() * 0.001) * 0.06
    }
  })

  const sayLine = () => {
    const text = onSayLine?.()
    if (!text) return
    const id = bubbleIdRef.current++
    setBubbles((cur) => [...cur, { id, text }].slice(-2))
    setTimeout(() => setBubbles((cur) => cur.filter((b) => b.id !== id)), 4500)
  }

  return (
    <group
      ref={groupRef}
      position={npc.position}
      onClick={(e) => { e.stopPropagation(); sayLine() }}
    >
      <group scale={NPC_SCALE} position={[0, NPC_SCALE * MODEL_HALF_HEIGHT, 0]}>
        <Suspense fallback={null}>
          <MascotMesh mascot={mascot} />
        </Suspense>
      </group>
      {near && (
        <Html position={[0, NPC_SCALE * MODEL_HALF_HEIGHT * 2 + 0.6, 0]} center distanceFactor={10}>
          <div className="pointer-events-none flex flex-col items-center gap-0.5">
            {hasQuest && (
              <span className="animate-bounce text-xl leading-none drop-shadow-lg" style={{ color: '#facc15', textShadow: '0 0 8px #f59e0b' }}>❗</span>
            )}
            <div className="whitespace-nowrap rounded-full bg-surface/90 px-3 py-1 text-xs font-semibold text-text shadow-lg">
              {npc.emoji} {npc.name}
            </div>
          </div>
        </Html>
      )}
      <BubbleStack bubbles={bubbles} baseY={NPC_SCALE * MODEL_HALF_HEIGHT * 2 + 1.0} color={npc.color} />
    </group>
  )
}

function ArbolScene({ model, jafetMascot, oliverMascot, nearNpcId, activeSpeakerId, onNpcSayLine }) {
  return (
    <>
      <color attach="background" args={['#2a1c0f']} />
      <fog attach="fog" args={['#3a2716', 20, 55]} />
      <ambientLight intensity={0.55} color="#e8c98a" />
      <directionalLight position={[10, 15, 8]} color="#ffd9a0" intensity={1.4} />
      <pointLight position={[0, 4, -7]} color="#ffa94d" intensity={6} distance={14} />
      <pointLight position={[2, 2, -2]} color="#ffcf7a" intensity={3} distance={10} />

      {/* Without a real physics collider here, Rapier's character controller
          (which Player.jsx switches to as soon as its own capsule collider
          exists) finds no ground at all and the player falls forever — the
          same fix Campus/Graffiti already use for their imported .glb maps.
          "trimesh" shapes the collider to the model's own geometry, so the
          temple's interior floor/stairs/columns are all solid, not just a
          flat plane at y=0. */}
      <RigidBody type="fixed" colliders="trimesh">
        <primitive object={model} />
      </RigidBody>
      <TempleNpc
        npc={NPCS.jafet}
        mascot={jafetMascot}
        near={nearNpcId === 'jafet'}
        hasQuest={activeSpeakerId === 'jafet'}
        onSayLine={() => onNpcSayLine('jafet')}
      />
      <TempleNpc
        npc={NPCS.oliver}
        mascot={oliverMascot}
        near={nearNpcId === 'oliver'}
        hasQuest={activeSpeakerId === 'oliver'}
        onSayLine={() => onNpcSayLine('oliver')}
      />
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

// Same safety net as the main Campus world (VRPage.jsx's FallRescueTracker)
// — catches the player if they ever end up below the floor (e.g. a raycast
// miss against the imported temple mesh) and teleports them back to spawn
// instead of leaving them falling forever.
const FALL_RESCUE_Y = -25

function FallRescueTracker({ playerPositionRef, onFall }) {
  const firedRef = useRef(false)
  useFrame(() => {
    const pos = playerPositionRef.current
    if (!pos) return
    if (pos.y < FALL_RESCUE_Y) {
      if (!firedRef.current) { firedRef.current = true; onFall() }
    } else {
      firedRef.current = false
    }
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

  // Browser TTS occasionally drops an utterance silently — this lets the
  // player retry the current line on demand instead of getting stuck.
  const replay = () => speakLine(LINES[idx], () => {})

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
        <div><p className="text-xs font-black" style={{ color: '#bbe87a' }}>Jafet</p><p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.3)' }}>Guardián del Templo</p></div>
        <button type="button" onClick={replay} title="Repetir audio" className="rounded-xl px-2.5 py-2 text-base"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
          🔊
        </button>
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
        🏛️ El Templo de Oliver Academy
      </p>
    </div>
  )
}

// ── In-Templo avatar class picker — replaces the old trip to /vr/world-tree.
// Two steps: a grid to pick which class to preview, then a detail card (stat
// bars + starting skills, same density as WorldTree's ClassPreviewCard) with
// Oliver's own commentary on that class (OLIVER_CLASS_LINES) — "si voy a
// elegir una, Oliver me diga un poco de cada una". Hacker stays admin-only,
// same gate as WorldTree's, and never gets an Oliver line (see the filter
// below — only the 5 base classes have one). ──────────────────────────────
function AvatarClassPicker({ isAdmin, onSelect, onClose }) {
  const [previewId, setPreviewId] = useState(null)
  const classes = Object.values(PLAYER_CLASSES).filter((c) => c.id !== 'hacker' || isAdmin)
  const preview = previewId && PLAYER_CLASSES[previewId]

  if (preview) {
    const maxStat = 5
    return (
      <div className="absolute inset-x-0 bottom-0 z-30 flex justify-center px-3 pb-4 sm:bottom-4">
        <div className="w-full max-w-sm overflow-hidden rounded-3xl border bg-surface/95 shadow-2xl backdrop-blur"
          style={{ borderColor: `${preview.color}66` }}>
          <div className="flex items-center gap-3 px-4 py-3"
            style={{ background: `linear-gradient(135deg, ${preview.color}22, ${preview.color}08)` }}>
            <span className="text-4xl">{preview.icon}</span>
            <div className="flex-1">
              <p className="text-base font-black text-text">{preview.name}</p>
              <p className="text-xs text-text-muted">{preview.description}</p>
            </div>
            <button type="button" onClick={() => setPreviewId(null)} className="text-text-muted hover:text-text">←</button>
          </div>

          <div className="grid grid-cols-5 gap-1.5 px-4 py-3">
            {Object.entries(preview.stats).map(([stat, val]) => (
              <div key={stat} className="flex flex-col items-center gap-1">
                <div className="flex flex-col-reverse gap-0.5">
                  {Array.from({ length: maxStat }).map((_, i) => (
                    <div key={i} className="h-2.5 w-3 rounded-sm"
                      style={{ background: i < val ? preview.color : 'rgba(255,255,255,0.08)' }} />
                  ))}
                </div>
                <span className="text-[9px] font-bold uppercase text-text-muted">{stat.slice(0, 3)}</span>
              </div>
            ))}
          </div>

          {OLIVER_CLASS_LINES[preview.id] && (
            <div className="mx-4 mb-3 flex items-start gap-2 rounded-xl border border-orange-400/30 bg-orange-400/10 px-3 py-2">
              <span className="text-lg">🐱</span>
              <p className="text-[11px] italic leading-snug text-text-muted">{OLIVER_CLASS_LINES[preview.id]}</p>
            </div>
          )}

          <div className="border-t border-border px-4 py-2">
            <p className="mb-1.5 text-[9px] font-bold uppercase tracking-widest text-text-muted">Habilidades iniciales</p>
            <div className="flex gap-2">
              {preview.startSkills.map((sid) => {
                const skill = SKILL_REGISTRY[sid]
                return skill ? (
                  <div key={sid} className="flex items-center gap-1.5 rounded-lg border border-border px-2 py-1.5"
                    style={{ borderColor: `${skill.vfxColor}55`, background: `${skill.vfxColor}11` }}>
                    <span className="text-lg">{skill.icon}</span>
                    <div>
                      <p className="text-[10px] font-bold text-text">{skill.name}</p>
                      <p className="text-[9px] text-text-muted">{skill.description}</p>
                    </div>
                  </div>
                ) : null
              })}
            </div>
          </div>

          <div className="px-4 pb-4 pt-2">
            <button type="button" onClick={() => onSelect(preview.id)}
              className="w-full rounded-xl py-2.5 text-sm font-black text-white transition-all hover:scale-105"
              style={{ background: `linear-gradient(135deg, ${preview.color}, ${preview.color}cc)` }}>
              Elegir {preview.name}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="absolute inset-x-0 bottom-0 z-30 flex flex-col gap-2 px-3 pb-4 sm:bottom-4 sm:left-1/2 sm:w-[420px] sm:-translate-x-1/2">
      <div className="rounded-2xl border border-border bg-surface/95 p-3 shadow-2xl backdrop-blur">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-xs font-black uppercase tracking-widest text-primary">Elige tu camino</p>
          <button type="button" onClick={onClose} className="text-text-muted hover:text-text">✕</button>
        </div>
        <div className="flex max-h-[50vh] flex-col gap-2 overflow-y-auto">
          {classes.map((cls) => (
            <button key={cls.id} type="button" onClick={() => setPreviewId(cls.id)}
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

// ── Skill trial — follows AbilityRevealCard. Player taps each of their 2
// starting skills at least once (fireSkillVfx + a real ring burst in the 3D
// scene), so test_ability is an actual trial, not just a reveal. Only the
// player's own startSkills, not the mascot's — Oliver's class is chosen in a
// separate modal (VrMascotOnboarding) outside this file's flow. ───────────
function SkillTrialPanel({ skills, tried, onTry }) {
  return (
    <div className="absolute bottom-20 left-1/2 z-30 w-80 -translate-x-1/2 rounded-2xl border border-primary/30 bg-surface/95 p-4 shadow-2xl backdrop-blur-sm">
      <p className="mb-3 text-center text-xs font-black uppercase tracking-widest text-primary">Prueba tus habilidades</p>
      <div className="flex flex-col gap-2">
        {skills.map((skill, i) => (
          <button key={skill.id} type="button" onClick={() => onTry(i, skill)} disabled={tried[i]}
            className="flex items-center gap-3 rounded-xl border p-2.5 text-left transition-all disabled:opacity-50"
            style={{ borderColor: `${skill.vfxColor}55`, background: `${skill.vfxColor}11` }}>
            <span className="text-2xl">{skill.icon}</span>
            <div className="flex-1">
              <p className="text-xs font-black text-text">{skill.name}</p>
              <p className="text-[10px] leading-snug text-text-muted">{skill.description}</p>
            </div>
            <span className="text-base">{tried[i] ? '✅' : '👆'}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

// Renders the ring burst fired by SkillTrialPanel — same expanding-ring
// language as VRPage.jsx's LocalAttackBurst, just simpler (no facing angle,
// this isn't combat) and colored per-skill via skill.vfxColor.
function SkillBurstVfx({ playerPositionRef, burstRef }) {
  const ringRef = useRef()
  useFrame(() => {
    const pos = playerPositionRef.current
    const ring = ringRef.current
    const burst = burstRef.current
    if (!pos || !ring) return
    if (!burst) { ring.visible = false; return }
    const age = Date.now() - burst.ts
    if (age > 900) { ring.visible = false; return }
    ring.visible = true
    ring.position.set(pos.x, pos.y + 0.6, pos.z)
    const p = age / 900
    ring.scale.setScalar(0.5 + p * 1.4)
    ring.material.color.set(burst.color)
    ring.material.opacity = 0.85 * (1 - p)
  })
  return (
    <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]} visible={false}>
      <ringGeometry args={[0.3, 0.5, 24]} />
      <meshBasicMaterial transparent depthWrite={false} />
    </mesh>
  )
}

// ── NPC interaction card — right-click/F-key/prompt-button, same pattern as
// every other NPC's "card before chat" step (see IdleNpcCard in VRPage.jsx).
// Shows one contextual line + a button that opens the real conversation
// (<DialogueBox>); never opens that conversation by itself. Works for
// whichever NPC (Jafet or Oliver) is the current active speaker. ──────────
function NpcCard({ npc, line, onTalk, onClose }) {
  return (
    <div className="absolute bottom-24 left-1/2 z-30 w-80 -translate-x-1/2 overflow-hidden rounded-2xl border border-primary/30 bg-surface/95 shadow-2xl backdrop-blur-sm sm:bottom-20">
      <div className="flex items-center gap-3 border-b border-border px-4 py-3">
        <span className="text-2xl">{npc.emoji}</span>
        <div className="flex-1">
          <p className="text-sm font-black text-text">{npc.name}</p>
          <p className="text-[10px] text-primary">{npc.role}</p>
        </div>
        <button type="button" onClick={onClose} className="text-text-muted hover:text-text text-lg leading-none">×</button>
      </div>
      <p className="px-4 py-3 text-xs italic leading-relaxed text-text-muted">&ldquo;{line}&rdquo;</p>
      <div className="flex flex-col gap-2 p-3 pt-0">
        <button type="button" onClick={onTalk}
          className="w-full rounded-xl bg-primary py-2.5 text-xs font-black text-background hover:bg-primary/80">
          💬 Hablar
        </button>
      </div>
    </div>
  )
}

// ── Dialogue box ──────────────────────────────────────────────────────────────

function DialogueBox({ npc, messages, onClose, onUserMessage, isLoading, activeMissionId, onAction }) {
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
          <span className="text-2xl">{npc.emoji}</span>
          <div className="flex-1">
            <p className="text-sm font-black text-text">{npc.name}</p>
            <p className="text-[10px] text-primary">{npc.role}</p>
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
                <span className="text-text-muted text-xs animate-pulse">{npc.name} está escribiendo…</span>
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
            placeholder={`Pregúntale algo a ${npc.name}…`}
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

// Reads label/skipLabel straight off the mission's own `cta`/`skipLabel`
// fields (tutorialMissions.js) — a new mission's button is just data, not a
// new entry in a map here.
function ActionButton({ missionId, onAction }) {
  const mission = getTutorialMission(missionId)
  const label = mission?.cta?.label
  const skip  = mission?.skippable ? mission.skipLabel : null
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

// Tells the page which NPC (if any) the player is close enough to talk to —
// same nearest-NPC pattern as VRPage.jsx's NpcProximityTracker, just over the
// 2 Temple NPCs instead of the whole Campus roster.
function NpcProximityTracker({ playerPositionRef, onNearChange }) {
  const lastNear = useRef(null)
  useFrame(() => {
    const pos = playerPositionRef.current
    if (!pos) return
    let closestId = null
    let closestDist = NPC_INTERACT_RADIUS
    for (const npc of Object.values(NPCS)) {
      const dx = pos.x - npc.position[0]
      const dz = pos.z - npc.position[2]
      const dist = Math.sqrt(dx * dx + dz * dz)
      if (dist < closestDist) { closestDist = dist; closestId = npc.id }
    }
    if (closestId !== lastNear.current) {
      lastNear.current = closestId
      onNearChange(closestId)
    }
  })
  return null
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function VrArbol() {
  const navigate = useNavigate()

  const playerClassId    = useGameStore((s) => s.player.class)
  const oliverClass      = useGameStore((s) => s.oliver.class)
  const forceSyncToCloud = useGameStore((s) => s.forceSyncToCloud)
  const isAdmin = useAuthStore((s) => s.isAdmin)?.()

  const { done, completeStep, isTutorialComplete } = useTutorialStore()

  const chatMessages = useChatStore((s) => s.messages)
  const skin = getSkinById(useMascotStore((s) => s.selectedSkinId))
  const mascotId = useMascotStore((s) => s.selectedMascotId)
  // No companion mesh renders until a mascot is actually chosen — passing
  // the avatar model here (a past bug) made <Player> render it twice: once
  // as the avatar body, once again as the "mascot" companion beside it.
  const realMascot = oliverClass ? getMascotById(mascotId) : null

  // 'intro' (10-line cinematic) → 'reveal' (camera settles on Jafet) → 'play'.
  // Returning players who already met Jafet skip straight to 'play'.
  const [phase, setPhase] = useState(() => (done.includes('meet_jafet') ? 'play' : 'intro'))
  const [showDialogue, setShowDialogue]         = useState(false)
  // The card (greeting + "Hablar" button) shown by right-click/F-key/the
  // bottom prompt — opening the real conversation always goes through this
  // first, same two-step pattern as every other NPC (see NpcCard above).
  const [showNpcCard, setShowNpcCard]           = useState(false)
  const [dialogueMessages, setDialogueMessages] = useState([])
  const [isNpcTyping, setIsNpcTyping]           = useState(false)
  // Which mission CTA overlay is open, if any — driven by the active
  // mission's `cta.open` (see tutorialMissions.js + OVERLAY_COMPONENTS
  // below). One state var instead of one boolean per overlay; adding a new
  // CTA-triggered overlay is "register it in OVERLAY_COMPONENTS", not "add
  // another showX boolean + another render block".
  const [openOverlayId, setOpenOverlayId]       = useState(null)
  // SkillTrialPanel isn't CTA-driven — it's a chained continuation that
  // AbilityRevealCard's onDone opens, so it stays its own boolean.
  const [showSkillTrial, setShowSkillTrial]     = useState(false)
  const [skillsTried, setSkillsTried]           = useState([false, false])
  const [classReveal, setClassReveal]           = useState(null) // { cls, ownerLabel } | null
  const [nearNpcId, setNearNpcId]               = useState(null) // 'jafet' | 'oliver' | null
  const [talkedFreely, setTalkedFreely]         = useState(false)
  const [movedEnough, setMovedEnough]           = useState(false)
  // Tracks which dialogue key was last spoken, so announce() never repeats
  // itself within one mount but still speaks fresh content whenever the
  // active step actually changes.
  const lastSpokenRef = useRef('')
  const cinematicLockRef = useRef(false)
  if (phase !== 'play') cinematicLockRef.current = true

  const jafetMascot = getMascotById(NPCS.jafet.mascotId)
  const oliverMascot = getMascotById(NPCS.oliver.mascotId)

  // Shared VR movement engine — same WASD/drag-look/touch/gamepad system as
  // Campus, Room, Anfiteatro and la Cueva de Platón.
  const { model: groundModel, groundRayHeight } = useImportedGlbGround('/MODELOS 3D/VR/egyptian_temple.glb')
  const keysRef = useMovementKeys()
  const { camera: cameraRef, onPointerDown, onPointerMove, onPointerUp, onWheel } = useCameraControls()
  const playerPositionRef = useRef(null)
  // VFX trigger for SkillTrialPanel — { color, ts } | null, read every frame
  // by SkillBurstVfx inside the Canvas.
  const skillBurstRef = useRef(null)

  // Detect which mission is currently active (first not done)
  const activeMission = TUTORIAL_MISSIONS.find(m => !done.includes(m.id)) ?? null
  const tutorialDone = activeMission === null
  // Who's currently giving missions — Jafet through practice_basics, Oliver
  // from choose_avatar_class onward (see each step's `speaker` in
  // tutorialMissions.js).
  const activeSpeakerId = getStepDialogue(activeMission?.id)?.speaker ?? 'jafet'
  const playerStartSkills = (PLAYER_CLASSES[playerClassId]?.startSkills ?? [])
    .map((sid) => SKILL_REGISTRY[sid]).filter(Boolean)

  // Reveal cinematic: pulls back to show more of the tree around the
  // player, then settles into the normal close framing. NOTE: this engine's
  // camera always orbits and looks at the PLAYER (see Player.jsx's
  // lookAt) — there's no independent free-camera that can fly to frame an
  // NPC elsewhere in the scene, so this is a reveal-around-the-player, not
  // a cut to Jafet's face. Distances here stay inside the same safe range
  // already used by the other cinematic beats in this file — a much wider
  // distance was tried and broke rendering (the camera-collision pull-in
  // against the tree geometry, plus the look-at height lift formula in
  // Player.jsx, combined to point the camera at empty sky).
  useEffect(() => {
    if (phase !== 'reveal') return
    const cam = cameraRef.current
    cam.distance = cam.targetDistance = 4.2
    cam.pitch = 0.3
    runCinematic(cameraRef, cinematicLockRef, { pitch: 0.22, distance: 2.6 }, 2400, () => {
      setPhase('play')
      completeStep('meet_jafet')
      // Deliberately doesn't auto-open the dialogue — the player walks up
      // and interacts with Jafet themselves (right-click/F/prompt button),
      // same as every other NPC in the app. See NpcCard/openDialogue.
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

  // F key opens the active speaker's card when standing next to THEM
  // specifically — same shortcut + same two-step (card-then-chat)
  // interaction as every other NPC in the app.
  useEffect(() => {
    const handler = (e) => {
      if (e.code === 'KeyF' && nearNpcId === activeSpeakerId && phase === 'play' && !showDialogue && !showNpcCard && !openOverlayId && !tutorialDone) {
        setShowNpcCard(true)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nearNpcId, activeSpeakerId, showDialogue, showNpcCard, openOverlayId, tutorialDone, phase])

  // Push a message from whichever NPC is currently speaking
  function pushNpc(text) {
    setDialogueMessages(prev => [...prev, { role: 'assistant', content: text }])
  }

  // Speaks the lines for `key` unless they were already the last thing said
  // — safe to call redundantly from multiple places (open, action buttons,
  // auto-detected step completions).
  function announce(key) {
    if (!key || key === lastSpokenRef.current) return
    lastSpokenRef.current = key
    const lines = getStepDialogue(key)?.dialogue ?? []
    lines.forEach((line, i) => setTimeout(() => pushNpc(line), i * 700))
    if (key === 'done') {
      runCinematic(cameraRef, cinematicLockRef, { pitch: 0.25, distance: 2.4 })
    }
  }

  function openDialogue() {
    setShowNpcCard(false)
    announce(activeMission?.id ?? 'done')
    setShowDialogue(true)
  }

  // The line an NPC says on a plain left-click (no card, no chat). If it's
  // not currently their turn to speak, they get a small flavor line instead
  // of repeating the active speaker's mission dialogue.
  function getAmbientLine(npcId) {
    const entry = getStepDialogue(activeMission?.id)
    if (entry?.speaker === npcId) return entry.dialogue?.[0] ?? ''
    return npcId === 'oliver' ? '¡Miau! 🐱 Cuando sea mi turno de hablar, te aviso.' : '🧙‍♂️ Ve con Oliver, él te está esperando.'
  }

  function handleFallRescue() {
    useVrCharacterStore.getState().setTeleportTo({ x: ARBOL_SPAWN[0], y: ARBOL_SPAWN[1] + 0.2, z: ARBOL_SPAWN[2] })
  }

  async function handleUserMessage(text) {
    setDialogueMessages(prev => [...prev, { role: 'user', content: text }])
    setIsNpcTyping(true)
    if (activeMission?.id === 'practice_basics') setTalkedFreely(true)
    try {
      const reply = await sendNpcMessage({
        npcPrompt: NPCS[activeSpeakerId].aiPrompt,
        content: text,
        history: dialogueMessages,
      })
      pushNpc(reply)
    } catch {
      pushNpc('Parece que hay interferencia mágica… inténtalo de nuevo. 🌀')
    } finally {
      setIsNpcTyping(false)
    }
  }

  // Triggers a ring burst at the player's position in the active skill's
  // color and marks that slot tried; once both are tried, completes
  // test_ability and hands back to Oliver's next line.
  function handleTrySkill(i, skill) {
    skillBurstRef.current = { color: skill.vfxColor, ts: Date.now() }
    setSkillsTried((prev) => {
      const next = [...prev]
      next[i] = true
      if (next.every(Boolean)) {
        setTimeout(() => {
          setShowSkillTrial(false)
          completeStep('test_ability')
          setShowDialogue(true)
          announce('setup_ai')
        }, 900)
      }
      return next
    })
  }

  // Reads what to do straight off the mission's `cta` (tutorialMissions.js)
  // instead of a hardcoded if-chain per missionId — a new CTA-driven mission
  // just needs the right `cta` shape in the data, not a new branch here.
  function handleMissionAction(missionId, action) {
    if (action === 'skip') {
      completeStep(missionId)
      const idx = TUTORIAL_MISSIONS.findIndex(m => m.id === missionId)
      announce(TUTORIAL_MISSIONS[idx + 1]?.id)
      return
    }

    const cta = getTutorialMission(missionId)?.cta
    if (!cta) return

    if (cta.open) {
      setOpenOverlayId(cta.open)
      setShowDialogue(false)
    } else if (cta.hint) {
      pushNpc(cta.hint)
    } else if (cta.completeFirst) {
      completeStep(missionId)
      announce(cta.announce)
      setTimeout(() => navigate(cta.navigate), cta.delayMs ?? 0)
    } else if (cta.navigate) {
      navigate(cta.navigate)
    }
  }

  function handleSelectAvatarClass(classId) {
    useGameStore.getState().selectPlayerClass(classId)
    setOpenOverlayId(null)
    completeStep('choose_avatar_class')
    setClassReveal({ cls: PLAYER_CLASSES[classId], ownerLabel: 'Tu Avatar es' })
    setTimeout(() => { setClassReveal(null); setShowDialogue(true); announce('choose_mascot') }, 3700)
  }

  // VrMascotOnboarding finished → completes both the model+name step and
  // the mascot's class step, since that single modal covers both.
  function handleMascotOnboardingDone() {
    setOpenOverlayId(null)
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
      onContextMenu={(e) => {
        e.preventDefault()
        if (phase === 'play' && nearNpcId === activeSpeakerId && !showDialogue && !openOverlayId && !tutorialDone) {
          setShowNpcCard((v) => !v)
        }
      }}
    >

      {/* ── 3D Canvas ── */}
      <Canvas camera={{ position: [0, 2, 6], fov: 60 }} className="absolute inset-0">
        <Physics gravity={[0, -20, 0]}>
          <Suspense fallback={null}>
            <ArbolScene
              model={groundModel}
              jafetMascot={jafetMascot}
              oliverMascot={oliverMascot}
              nearNpcId={phase === 'play' ? nearNpcId : null}
              activeSpeakerId={!tutorialDone ? activeSpeakerId : null}
              onNpcSayLine={getAmbientLine}
            />
            <Player
              mascot={realMascot}
              skin={skin}
              scenery={groundModel}
              groundRayHeight={groundRayHeight}
              keysRef={keysRef}
              cameraRef={cameraRef}
              playerPositionRef={playerPositionRef}
              spawnAt={ARBOL_SPAWN}
            />
            <NpcProximityTracker playerPositionRef={playerPositionRef} onNearChange={setNearNpcId} />
            <MovementTracker
              playerPositionRef={playerPositionRef}
              active={phase === 'play' && activeMission?.id === 'practice_basics'}
              onThreshold={() => setMovedEnough(true)}
            />
            <FallRescueTracker playerPositionRef={playerPositionRef} onFall={handleFallRescue} />
            <SkillBurstVfx playerPositionRef={playerPositionRef} burstRef={skillBurstRef} />
          </Suspense>
        </Physics>
      </Canvas>

      {/* ── Reveal title card ── */}
      {phase === 'reveal' && <RevealTitleCard />}

      {/* ── Touch controls ── */}
      {phase === 'play' && !showDialogue && !openOverlayId && !showSkillTrial && (
        <>
          <VirtualJoystick keysRef={keysRef} />
          <MobileButtons keysRef={keysRef} />
        </>
      )}

      {/* ── Top title ── */}
      {phase === 'play' && (
        <div className="pointer-events-none absolute left-0 right-0 top-0 flex justify-center pt-5">
          <div className="rounded-2xl border border-primary/20 bg-black/60 px-5 py-2 backdrop-blur-sm">
            <p className="text-center text-sm font-black text-primary">🏛️ El Templo de Oliver Academy</p>
            <p className="text-center text-[10px] text-text-muted">Mundo tutorial — completa tus misiones para ir al campus</p>
          </div>
        </div>
      )}

      {/* ── Left panel: Tutorial missions ── */}
      {phase === 'play' && (
        <div className="absolute left-3 top-16 z-20 w-60 sm:w-64">
          <div className="rounded-2xl border border-border bg-black/70 p-3 backdrop-blur-sm">
            <p className="mb-2 text-[10px] font-black uppercase tracking-wider text-primary">Tutorial de Oliver Academy</p>
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

      {/* ── Talk to the active speaker prompt — only when close enough to
          THEM specifically (the other NPC isn't who has missions right now).
          Opens the card (not the chat directly) — same as right-click/F. ── */}
      {phase === 'play' && nearNpcId === activeSpeakerId && !showDialogue && !showNpcCard && !openOverlayId && !tutorialDone && (
        <div className="absolute bottom-20 left-1/2 z-20 -translate-x-1/2">
          <button type="button" onClick={() => setShowNpcCard(true)}
            className="flex items-center gap-2 rounded-2xl border border-primary/40 bg-black/80 px-6 py-3 font-black text-primary shadow-lg backdrop-blur-sm animate-pulse hover:bg-primary hover:text-background transition-all">
            <span className="hidden sm:inline">F / Clic derecho — </span>{NPCS[activeSpeakerId].emoji} {NPCS[activeSpeakerId].name}
          </button>
        </div>
      )}
      {phase === 'play' && nearNpcId !== activeSpeakerId && !showDialogue && !openOverlayId && !tutorialDone && (
        <div className="pointer-events-none absolute bottom-20 left-1/2 z-20 -translate-x-1/2 rounded-2xl border border-border bg-black/60 px-4 py-2 text-xs text-text-muted backdrop-blur-sm">
          🚶 Camina (WASD) hacia {NPCS[activeSpeakerId].emoji} {NPCS[activeSpeakerId].name}, dentro del templo
        </div>
      )}

      {/* ── Active speaker's card — right-click/F/prompt-button. Closing it
          does not open the chat; only its "Hablar" button does (see
          openDialogue). ── */}
      {phase === 'play' && showNpcCard && !showDialogue && !openOverlayId && (
        <NpcCard npc={NPCS[activeSpeakerId]} line={getAmbientLine(activeSpeakerId)} onTalk={openDialogue} onClose={() => setShowNpcCard(false)} />
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
      {phase === 'play' && showDialogue && !openOverlayId && (
        <DialogueBox
          npc={NPCS[activeSpeakerId]}
          messages={dialogueMessages}
          onClose={() => setShowDialogue(false)}
          onUserMessage={handleUserMessage}
          isLoading={isNpcTyping}
          activeMissionId={activeMission?.id}
          onAction={handleMissionAction}
        />
      )}

      {/* ── Mission CTA overlays — which one (if any) is driven by
          openOverlayId, set generically from the active mission's cta.open
          (see handleMissionAction). Each still needs its own props, so this
          stays 3 explicit blocks rather than a one-size-fits-all renderer. ── */}
      {openOverlayId === 'classPicker' && (
        <AvatarClassPicker isAdmin={isAdmin} onSelect={handleSelectAvatarClass} onClose={() => setOpenOverlayId(null)} />
      )}

      {openOverlayId === 'mascotOnboarding' && !oliverClass && (
        <VrMascotOnboarding onDone={handleMascotOnboardingDone} />
      )}

      {/* Ability reveal leads into the skill trial below, which is what
          actually completes test_ability. */}
      {openOverlayId === 'abilityReveal' && (
        <AbilityRevealCard
          playerClass={playerClassId}
          oliverClass={oliverClass}
          onDone={() => { setOpenOverlayId(null); setSkillsTried([false, false]); setShowSkillTrial(true) }}
        />
      )}

      {/* ── Skill trial (mission 6, cont.) — try each starting skill once ── */}
      {showSkillTrial && (
        <SkillTrialPanel skills={playerStartSkills} tried={skillsTried} onTry={handleTrySkill} />
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
