import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Html, useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { useNavigate } from 'react-router-dom'
import AppTopBar from '../shared/AppTopBar'
import PageVideoModal from '../shared/PageVideoModal'
import MascotMesh from '../mascot/MascotMesh'
import MascotCompanion from '../mascot/MascotCompanion'
import { useMascotStore } from '../../stores/useMascotStore'
import { getMascotById } from '../../data/mascotRegistry'
import { getSkinById } from '../../data/skinsRegistry'
import { VR_NPCS, getVrNpcById, OLIVER_NPC, EINSTEIN_NPC } from '../../data/vrNpcRegistry'
import { getGlobalMissionById } from '../../data/globalMissionsRegistry'
import { useGlobalMissionsStore } from '../../stores/useGlobalMissionsStore'
import { useMissionState } from '../../stores/useMissionState'
import { useMascotCompanionStore } from '../../stores/useMascotCompanionStore'
import { useWorldChatStore } from '../../stores/useWorldChatStore'
import { useSettingsStore, getModelProvider } from '../../stores/useSettingsStore'
import { sendNpcMessage } from '../../services/chat/npcTransport'
import { useVrPresenceStore } from '../../stores/useVrPresenceStore'
import { useFriendsStore } from '../../stores/useFriendsStore'
import { useVrSettingsStore } from '../../stores/useVrSettingsStore'
import { useAuthStore } from '../../stores/useAuthStore'
import { useVrMultiplayer, isVrRealtimeAvailable } from './useVrMultiplayer'
import { formatCurrency } from '../../utils/currency'
import { useGameStore, PLAYER_CLASSES, OLIVER_CLASSES, PLAYER_AVATARS } from '../../stores/useGameStore'
import { SKILL_REGISTRY } from '../../data/skillRegistry'
import VrLoadingScreen from './VrLoadingScreen'
import VrHud from './VrHud'

// While we're designing/testing the world's NPCs and missions, swap the real
// city model for a simple flat test ground with a few placeholder walls.
// Flip this back to `false` to return to /fondo_azteca.glb.
const USE_TEST_SCENERY = true

// Temporary "stable core" mode: skips most mission NPCs, wandering cats,
// and the mission UI entirely, leaving just the campus ground, the player,
// multiplayer presence and world chat. Lets us confirm the core
// movement/connection/chat loop works on its own while the NPC/mission
// side is reworked separately. Flip back to `false` once that's done.
const SIMPLE_MODE = true

// While SIMPLE_MODE is on, only these mission NPCs (and their mission UI)
// are rendered, so we can test the mission flow end-to-end without loading
// every NPC's GLTF model.
const ACTIVE_VR_NPC_IDS = ['mago-misiones']
const ACTIVE_VR_NPCS = SIMPLE_MODE
  ? VR_NPCS.filter((npc) => ACTIVE_VR_NPC_IDS.includes(npc.id))
  : VR_NPCS

const MOVE_SPEED = 5.5
const TURN_SPEED = 10
// How quickly the player accelerates/decelerates toward the target walking
// speed (higher = snappier, lower = floatier). This is what turns the old
// "instant teleport to full speed" movement into something that feels solid.
const MOVE_ACCEL = 18
// MascotMesh normalizes models to ~2 units tall. The scenery footprint is
// ~24 units wide, so we shrink the player to a human-ish scale that doesn't
// dwarf the structure it's walking around.
const PLAYER_SCALE = 0.12
const PLAYER_HEIGHT = PLAYER_SCALE * 2
// MascotMesh centers every model on its own bounding box and normalizes it
// to ~2 units tall, so before any outer scale is applied its feet sit at
// y = -1 (half of that 2-unit height) instead of y = 0. Every mascot/NPC
// group below is lifted by `scale * MODEL_HALF_HEIGHT` so feet land exactly
// on the ground ray hit instead of sinking halfway into the floor.
const MODEL_HALF_HEIGHT = 1
// How far ahead of/around the player we check for walls before letting them
// move into something (in world units).
const COLLISION_RADIUS = PLAYER_HEIGHT * 0.6
const WALK_CYCLE_SPEED = 9
const WALK_BOB_HEIGHT = 0.07
const WALK_TILT = 0.06

// How long a Habbo-style speech bubble stays floating above a player's head
// after they send a world chat message, in milliseconds.
const CHAT_BUBBLE_DURATION = 10000

// Max number of speech bubbles stacked above a single head at once — if a
// player (or NPC) says several things within CHAT_BUBBLE_DURATION, the
// newest bubbles stack above the older ones instead of replacing them.
const MAX_STACKED_BUBBLES = 3
// Vertical spacing between stacked bubbles in world units. Generous value
// so stacked lines never visually overlap each other.
const BUBBLE_STACK_SPACING = 1.6

// Camera orbit (mouse-drag controlled) around the player, zoomable with the
// mouse wheel or a two-finger pinch. Movement is relative to this camera, so
// "forward" always means "away from the camera", like a typical 3rd-person
// game.
// Fallback default for useCameraControls's initial distance, before the
// player's saved cameraDistance setting loads from useVrSettingsStore.
const CAMERA_DISTANCE = 6.5
const MOUSE_SENSITIVITY = 0.005
const WHEEL_ZOOM_SPEED = 0.0065
const PINCH_ZOOM_SPEED = 0.07
// How quickly the camera distance/position glide toward their target values
// (per second, via exponential smoothing). Higher = snappier.
const ZOOM_SMOOTHING = 6
const CAMERA_SMOOTHING = 8
// When a building/wall sits between the player and where the camera "wants"
// to be, the camera is pulled in to just in front of it (minus this margin)
// instead of clipping through — otherwise the player's own mascot (and any
// NPCs behind it) end up hidden inside the campus geometry.
const CAMERA_COLLISION_MARGIN = 0.35

// First-person mode ("👁️ 1ra persona" in the camera menu): the camera sits
// at the player's eye height and looks exactly where yaw/pitch point, with
// no orbit distance/collision pull-in. It allows a much wider pitch range
// than the 3rd-person orbit since there's no risk of clipping into the
// player's own model.
const FIRST_PERSON_EYE_HEIGHT = 0.62
const FIRST_PERSON_PITCH_MIN = -1.3
const FIRST_PERSON_PITCH_MAX = 1.3

// First-person allows a much wider up/down look range than the 3rd-person
// orbit camera (see FIRST_PERSON_* constants above). Third-person's range
// comes from useVrSettingsStore so each player can tune how far they can
// look up/down for their own setup.
function getPitchRange(cameraMode) {
  if (cameraMode === 'first') return [FIRST_PERSON_PITCH_MIN, FIRST_PERSON_PITCH_MAX]
  const { pitchMin, pitchMax } = useVrSettingsStore.getState()
  return [pitchMin, pitchMax]
}

// Xbox/standard-gamepad support: left stick moves the same as WASD, right
// stick looks around like a mouse drag, the A button jumps, and the
// shoulder buttons (LB/RB) zoom in/out. Works on PC and consoles alike —
// any browser gamepad exposed via the Gamepad API.
const GAMEPAD_DEADZONE = 0.18
const GAMEPAD_LOOK_SPEED = 2.2
const GAMEPAD_ZOOM_SPEED = 12

// Scale for NPC models (slightly bigger than the player so they stand out)
// and for the background "wandering cats" that wander the test ground.
const NPC_SCALE = 0.16
const WANDER_CAT_SCALE = 0.1
const WANDER_CAT_SPEED = 1.1

// NPCs further than this from the player are drawn as a cheap colored
// marker instead of their full GLTF model (and skip the floating name tag).
// With 13 NPCs around the campus, loading every GLTF + Html overlay at once
// is what overwhelms weaker/integrated GPUs (WebGL "Context Lost" -> the VR
// world goes black). Only the handful of NPCs near the player ever need to
// look like their real mascot.
const NPC_DETAIL_RADIUS = 11

// Jumping.
const GRAVITY = -20
const JUMP_SPEED = 7

// Warm "ruinas al atardecer" palette applied to any untextured surface of the
// scenery, so a flat-grey export still reads as a colorful scene.
const SCENERY_PALETTE = ['#c2703d', '#e8c477', '#9b5a3a', '#7d8597', '#3f9e7a', '#caa46c']

// Radius of the procedural campus ground — large enough to feel like a real
// university campus with multiple zones (inner quad, sports, dorms, outer park).
const GROUND_RADIUS = 90

// NPC landmark building geometry constants.
const NPC_BUILDING_OFFSET = 1.8
const BUILDING_SIZE = 3.2

// Major academic buildings — shared between useTestGround (geometry) and
// WorldMap (minimap markers), so they're module-level constants.
const CAMPUS_ACADEMIC = [
  { pos: [0, 0, -62],  color: '#d4c4a0', w: 30, d: 18, h: 13, label: '🎭', name: 'Gran Salón' },
  { pos: [28, 0, -48], color: '#7a5a3a', w: 18, d: 14, h: 11, label: '📚', name: 'Biblioteca' },
  { pos: [-26, 0, -46],color: '#3a5a7a', w: 16, d: 13, h: 10, label: '🔬', name: 'Ciencias' },
  { pos: [65, 0, 0],   color: '#1a7abf', w: 18, d: 44, h: 1,  label: '🏊', name: 'Piscina' },
]

// Dormitory blocks — 8 buildings in the outer campus ring (summer colours).
const CAMPUS_DORMS = [
  { pos: [40, 0, -70],  color: '#8a7a6a' },
  { pos: [-40, 0, -70], color: '#7a8a6a' },
  { pos: [-58, 0, -38], color: '#6a7a8a' },
  { pos: [-62, 0, 25],  color: '#8a6a7a' },
  { pos: [55, 0, -40],  color: '#7a6a8a' },
  { pos: [58, 0, 36],   color: '#6a8a7a' },
  { pos: [38, 0, 28],   color: '#8a8a6a' },
  { pos: [-38, 0, 28],  color: '#6a8a8a' },
]

// How close the player needs to be to an NPC to interact with them.
const INTERACT_RADIUS = 2.5

// How close the player needs to be to a world portal to interact.
const PORTAL_INTERACT_RADIUS = 2.5

// Campus portal position — northwest of plaza, easy to find from spawn.
const ROOM_PORTAL_POSITION = [-5, 0, -5]

// Portal Nexus — future worlds, locked. Arranged in a semicircle at south end.
const NEXUS_PORTALS = [
  { id: 'nexus-dark',  pos: [-18, 0, 68], color: '#7c3aed', label: '🔮 Mundo Oscuro' },
  { id: 'nexus-water', pos: [18, 0, 68],  color: '#0284c7', label: '🌊 Mundo Acuático' },
  { id: 'nexus-mtn',   pos: [-8, 0, 76],  color: '#059669', label: '🏔️ Montañas' },
  { id: 'nexus-space', pos: [8, 0, 76],   color: '#d97706', label: '🌌 Galaxia' },
  { id: 'nexus-city',  pos: [0, 0, 80],   color: '#dc2626', label: '🏙️ Metrópolis' },
]

// Private Room constants — spacious summer-cottage interior.
const ROOM_SIZE = 28
const ROOM_HEIGHT = 5.5
const ROOM_EXIT_PORTAL_POSITION = [0, 0, -ROOM_SIZE / 2 + 2]

// Anfiteatro — indoor theater with YouTube screen, stage, and audience seats.
const ANFI_W  = 56   // half-width on each side = 28
const ANFI_D  = 80   // total depth (lobby → backstage)
const ANFI_H  = 18   // ceiling height
const ANFI_HW = ANFI_W  / 2   // 28
const ANFI_HD = ANFI_D  / 2   // 40
// Stage platform occupies the north third of the hall; screen is on the back wall.
const ANFI_STAGE_Z = -12    // south edge of stage (z < 0 = north)
const ANFI_SCREEN_Z = -ANFI_HD + 1.5  // against the north back wall
// NPC stands at center stage
const ANFI_STAGE_NPC_POS = [0, 0, ANFI_STAGE_Z - 7]
// Player spawns in middle of audience area, facing stage (north)
const ANFI_SPAWN = [0, 0, ANFI_HD - 12]
// Exit portal in lobby (south end)
const ANFI_EXIT_PORTAL = [0, 0, ANFI_HD - 3]

// ─── Árbol del Mundo constants ───────────────────────────────────────────────
const WT_SPAWN = [0, 0, 18]          // player starts near south edge, facing tree
const WT_EXIT_PORTAL = [0, 0, 25]   // exit portal at south edge
// Class nodes spread in a circle, 12 units from the trunk base
const WT_CLASS_NODES = {
  programmer:       { pos: [0, 2.5, -12],         color: '#22c55e' },
  cyber_strategist: { pos: [11.4, 2.5, -3.7],     color: '#3b82f6' },
  ai_engineer:      { pos: [7.0, 2.5, 9.7],        color: '#a855f7' },
  designer:         { pos: [-7.0, 2.5, 9.7],       color: '#f97316' },
  philosopher:      { pos: [-11.4, 2.5, -3.7],     color: '#eab308' },
}

// Patrol loops for the background "wandering cats" that bring the campus
// plaza to life. Each path is a list of [x, y, z] waypoints the cat walks
// between in order, looping back to the start. Kept near the central plaza,
// away from the NPC zones around the edges.
const WANDER_CAT_PATHS = [
  [
    [4, 0, 4],
    [4, 0, -4],
    [-4, 0, -4],
    [-4, 0, 4],
  ],
  [
    [6, 0, 0],
    [0, 0, 6],
    [-6, 0, 0],
    [0, 0, -6],
  ],
]

// Movement directions, shared by the keyboard listener and the on-screen
// touch D-pad: both just flip the same keys on/off.
const DIRECTION_KEYS = {
  up: ['w', 'arrowup'],
  down: ['s', 'arrowdown'],
  left: ['a', 'arrowleft'],
  right: ['d', 'arrowright'],
}

// True if the event target is a text input/textarea (or contenteditable),
// i.e. the player is typing into the world chat — movement keys and world
// shortcuts (M/P/B/C) should be ignored while that's happening.
function isTypingTarget(target) {
  return !!target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)
}

// Tracks which movement keys (WASD + arrows) are currently held down, from
// either a physical keyboard or the on-screen touch D-pad.
function useMovementKeys() {
  const keys = useRef({})

  useEffect(() => {
    const handleDown = (e) => {
      if (isTypingTarget(e.target)) return
      keys.current[e.key.toLowerCase()] = true
    }
    const handleUp = (e) => {
      keys.current[e.key.toLowerCase()] = false
    }
    window.addEventListener('keydown', handleDown)
    window.addEventListener('keyup', handleUp)
    return () => {
      window.removeEventListener('keydown', handleDown)
      window.removeEventListener('keyup', handleUp)
    }
  }, [])

  return keys
}

// World shortcuts that are NOT character movement: M toggles the map, P
// opens the character menu, B opens the inventory, and C toggles the
// world chat input. All ignored while the player is typing in the chat box.
function useWorldShortcuts({ onToggleMap, onOpenCharacter, onOpenInventory, onToggleChat }) {
  useEffect(() => {
    const handleDown = (e) => {
      if (isTypingTarget(e.target)) {
        if (e.key === 'Escape') onToggleChat(false)
        return
      }
      switch (e.key.toLowerCase()) {
        case 'm':
          e.preventDefault()
          onToggleMap()
          break
        case 'p':
          e.preventDefault()
          onOpenCharacter()
          break
        case 'b':
          e.preventDefault()
          onOpenInventory()
          break
        case 'c':
          // Without this, the same keystroke that opens the chat input also
          // lands inside it once it's focused, prefilling the box with "c".
          e.preventDefault()
          onToggleChat(true)
          break
        default:
          break
      }
    }
    window.addEventListener('keydown', handleDown)
    return () => window.removeEventListener('keydown', handleDown)
  }, [onToggleMap, onOpenCharacter, onOpenInventory, onToggleChat])
}

// True for touch/coarse-pointer devices (phones, tablets, consoles with a
// touchscreen), regardless of viewport width — a `sm:hidden` width check
// alone hides the D-pad on larger phones in landscape or on tablets, which
// is what made movement "not work" on those devices (the controls were
// simply invisible, not broken).
function useIsTouchDevice() {
  const [isTouch, setIsTouch] = useState(
    () =>
      typeof window !== 'undefined' &&
      (window.matchMedia?.('(pointer: coarse)').matches || 'ontouchstart' in window),
  )

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return
    const mq = window.matchMedia('(pointer: coarse)')
    const update = () => setIsTouch(mq.matches || 'ontouchstart' in window)
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  return isTouch
}

// Analog virtual joystick for phones/tablets. A draggable knob inside a fixed
// outer ring translates its (x,y) offset from center into WASD movement flags,
// so Player sees the exact same input as a physical keyboard. Pointer capture
// keeps tracking even when the finger drifts outside the ring.
function VirtualJoystick({ keysRef, hidden }) {
  const isTouch = useIsTouchDevice()
  const outerRef = useRef(null)
  const knobRef  = useRef(null)
  const activeId = useRef(null)
  const DEAD = 0.28 // fraction of radius below which movement is ignored

  const getPos = (e) => {
    const el = outerRef.current
    if (!el) return { nx: 0, ny: 0, px: 0, py: 0 }
    const rect = el.getBoundingClientRect()
    const r    = rect.width / 2
    const dx   = e.clientX - (rect.left + r)
    const dy   = e.clientY - (rect.top  + r)
    const dist = Math.min(Math.hypot(dx, dy), r)
    const ang  = Math.atan2(dy, dx)
    const px   = Math.cos(ang) * dist
    const py   = Math.sin(ang) * dist
    return { nx: px / r, ny: py / r, px, py }
  }

  const applyKeys = (nx, ny) => {
    DIRECTION_KEYS.up.forEach((k)    => { keysRef.current[k] = ny < -DEAD })
    DIRECTION_KEYS.down.forEach((k)  => { keysRef.current[k] = ny >  DEAD })
    DIRECTION_KEYS.left.forEach((k)  => { keysRef.current[k] = nx < -DEAD })
    DIRECTION_KEYS.right.forEach((k) => { keysRef.current[k] = nx >  DEAD })
  }

  const moveKnob = (px, py) => {
    if (knobRef.current)
      knobRef.current.style.transform = `translate(calc(-50% + ${px}px), calc(-50% + ${py}px))`
  }

  const onDown = (e) => {
    if (activeId.current !== null) return
    e.preventDefault()
    try { e.currentTarget.setPointerCapture(e.pointerId) } catch {}
    activeId.current = e.pointerId
    const { nx, ny, px, py } = getPos(e)
    moveKnob(px, py)
    applyKeys(nx, ny)
  }

  const onMove = (e) => {
    if (activeId.current !== e.pointerId) return
    e.preventDefault()
    const { nx, ny, px, py } = getPos(e)
    moveKnob(px, py)
    applyKeys(nx, ny)
  }

  const onUp = (e) => {
    if (activeId.current !== e.pointerId) return
    activeId.current = null
    moveKnob(0, 0)
    applyKeys(0, 0)
  }

  if (!isTouch || hidden) return null

  return (
    <div
      ref={outerRef}
      className="pointer-events-auto absolute bottom-6 left-5 z-20 h-28 w-28 rounded-full border-2 border-white/30 bg-black/30 backdrop-blur-sm"
      style={{ touchAction: 'none' }}
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* dead-zone indicator */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/20" />
      {/* draggable knob */}
      <div
        ref={knobRef}
        className="pointer-events-none absolute left-1/2 top-1/2 h-12 w-12 rounded-full bg-white/70 shadow-xl"
        style={{ transform: 'translate(-50%, -50%)' }}
      />
    </div>
  )
}

// Jump + Chat buttons for mobile, bottom-right corner.
// Hidden when the chat input is open to prevent accidental taps.
function MobileButtons({ keysRef, hidden, onOpenChat }) {
  const isTouch = useIsTouchDevice()
  if (!isTouch || hidden) return null

  const setJump = (v) => (e) => {
    e.preventDefault()
    try {
      if (v) e.currentTarget.setPointerCapture(e.pointerId)
      else   e.currentTarget.releasePointerCapture(e.pointerId)
    } catch {}
    keysRef.current[' '] = v
  }

  return (
    <div className="pointer-events-none absolute bottom-6 right-4 z-20 flex flex-col items-center gap-2">
      <button
        type="button"
        onPointerDown={setJump(true)}
        onPointerUp={setJump(false)}
        onPointerCancel={setJump(false)}
        onContextMenu={(e) => e.preventDefault()}
        style={{ touchAction: 'none' }}
        className="pointer-events-auto flex h-16 w-16 items-center justify-center rounded-full border-2 border-white/30 bg-black/30 text-2xl text-white shadow-xl backdrop-blur-sm active:bg-primary/50"
        aria-label="saltar"
      >
        ↑
      </button>
      <button
        type="button"
        onClick={onOpenChat}
        onContextMenu={(e) => e.preventDefault()}
        className="pointer-events-auto flex h-12 w-12 items-center justify-center rounded-full border border-white/25 bg-black/30 text-xl text-white shadow-lg backdrop-blur-sm active:bg-primary/40"
        aria-label="chat"
      >
        💬
      </button>
    </div>
  )
}

// Loads the VR background model, scales it to a roomy walkable footprint, and
// tints any untextured surfaces so it doesn't look flat/grey. The cloned
// model is also handed to <Player> so it can raycast against the real
// geometry for ground height and collisions.
function useSceneryModel() {
  const { scene } = useGLTF('/fondo_azteca.glb')

  return useMemo(() => {
    const clone = scene.clone(true)
    const box = new THREE.Box3().setFromObject(clone)
    const size = new THREE.Vector3()
    const center = new THREE.Vector3()
    box.getSize(size)
    box.getCenter(center)

    const maxDimension = Math.max(size.x, size.z) || 1
    const scale = 24 / maxDimension
    clone.scale.setScalar(scale)
    clone.position.set(-center.x * scale, -box.min.y * scale, -center.z * scale)

    let paletteIndex = 0
    clone.traverse((child) => {
      if (!child.isMesh) return

      const material = child.material
      if (material && !material.map) {
        const tinted = material.clone()
        tinted.color = new THREE.Color(SCENERY_PALETTE[paletteIndex % SCENERY_PALETTE.length])
        child.material = tinted
        paletteIndex += 1
      }
    })

    // After the repositioning above, the model's floor sits at y = 0 and its
    // tallest point sits at size.y * scale. Ground rays need to start above
    // that, otherwise they can start "inside" a tall building and miss its
    // roof entirely.
    const groundRayHeight = size.y * scale + 5

    return { model: clone, groundRayHeight }
  }, [scene])
}

// Summer Canadian university campus — green grass, maple trees with red tips,
// neoclassical Grand Hall, swimming pool, dense west forest, Portal Nexus plaza.
// All geometry is THREE.js primitives; InstancedMesh keeps draw calls low.
function useTestGround() {
  return useMemo(() => {
    const group = new THREE.Group()

    // ── Materials ─────────────────────────────────────────────────────────
    const matGrass     = new THREE.MeshStandardMaterial({ color: '#4a8a3a' })
    const matGrassOut  = new THREE.MeshStandardMaterial({ color: '#5ea848' })
    const matGrassFor  = new THREE.MeshStandardMaterial({ color: '#2d6a22' })
    const matPath      = new THREE.MeshStandardMaterial({ color: '#c8bc9c' })
    const matRoad      = new THREE.MeshStandardMaterial({ color: '#a8a090' })
    const matPlaza     = new THREE.MeshStandardMaterial({ color: '#d0c8b8' })
    const matGranite   = new THREE.MeshStandardMaterial({ color: '#beb8a8' })
    const matStone     = new THREE.MeshStandardMaterial({ color: '#909090' })
    const matColumn    = new THREE.MeshStandardMaterial({ color: '#e8e4d8' })
    const matCream     = new THREE.MeshStandardMaterial({ color: '#d4c4a0' })
    const matBrickRed  = new THREE.MeshStandardMaterial({ color: '#9a4a3a' })
    const matBrickBrn  = new THREE.MeshStandardMaterial({ color: '#7a5a3a' })
    const matBrickBlu  = new THREE.MeshStandardMaterial({ color: '#3a5a7a' })
    const matRoof      = new THREE.MeshStandardMaterial({ color: '#7a3830' })
    const matRedCA     = new THREE.MeshStandardMaterial({ color: '#d52b1e' })
    const matGold      = new THREE.MeshStandardMaterial({ color: '#d4a820', emissive: '#b08010', emissiveIntensity: 0.28 })
    const matPoolWater = new THREE.MeshStandardMaterial({ color: '#1a7abf', transparent: true, opacity: 0.88, emissive: '#0a5080', emissiveIntensity: 0.1 })
    const matPoolDeck  = new THREE.MeshStandardMaterial({ color: '#d8d0b8' })
    const matPoolCurb  = new THREE.MeshStandardMaterial({ color: '#e8e2d4' })
    const matPoolLane  = new THREE.MeshStandardMaterial({ color: '#f0ece4' })
    const matGlass     = new THREE.MeshStandardMaterial({ color: '#88c8f8', transparent: true, opacity: 0.55, emissive: '#4488a8', emissiveIntensity: 0.2 })
    const matNexus     = new THREE.MeshStandardMaterial({ color: '#2a2840' })
    const matNexusDk   = new THREE.MeshStandardMaterial({ color: '#181828' })
    const matWood      = new THREE.MeshStandardMaterial({ color: '#8b6234' })
    const matWoodDk    = new THREE.MeshStandardMaterial({ color: '#5a3c20' })
    const matTrunk     = new THREE.MeshStandardMaterial({ color: '#6b4520' })
    const matFolA      = new THREE.MeshStandardMaterial({ color: '#2d6b1a' })
    const matFolB      = new THREE.MeshStandardMaterial({ color: '#3d8a28' })
    const matMapleRed  = new THREE.MeshStandardMaterial({ color: '#c42020' })
    const matPole      = new THREE.MeshStandardMaterial({ color: '#2a2830' })
    const matBulb      = new THREE.MeshStandardMaterial({ color: '#ffe890', emissive: '#ffd050', emissiveIntensity: 1.8 })
    const matFount     = new THREE.MeshStandardMaterial({ color: '#b0a898' })
    const matWater     = new THREE.MeshStandardMaterial({ color: '#2888cc', transparent: true, opacity: 0.75 })

    // ── Path helper ───────────────────────────────────────────────────────
    const addPath = (x1, z1, x2, z2, width, mat = matPath) => {
      const dx = x2 - x1; const dz = z2 - z1
      const len = Math.hypot(dx, dz)
      if (len < 0.01) return
      const g = new THREE.Group()
      g.position.set((x1 + x2) / 2, 0.014, (z1 + z2) / 2)
      g.rotation.y = Math.atan2(-dx, -dz)
      const p = new THREE.Mesh(new THREE.PlaneGeometry(width, len), mat)
      p.rotation.x = -Math.PI / 2
      p.userData.isFloor = true
      g.add(p)
      group.add(g)
    }

    // ── 1. GROUND ─────────────────────────────────────────────────────────
    const ground = new THREE.Mesh(new THREE.CircleGeometry(GROUND_RADIUS, 72), matGrass)
    ground.rotation.x = -Math.PI / 2
    ground.userData.isFloor = true
    group.add(ground)
    // Lighter outer ring (sun-bleached summer grass)
    const outerRing = new THREE.Mesh(new THREE.RingGeometry(58, GROUND_RADIUS, 72), matGrassOut)
    outerRing.rotation.x = -Math.PI / 2
    outerRing.position.y = 0.005
    outerRing.userData.isFloor = true
    group.add(outerRing)
    // Forest floor (west zone)
    const forestFloor = new THREE.Mesh(new THREE.CircleGeometry(36, 48), matGrassFor)
    forestFloor.rotation.x = -Math.PI / 2
    forestFloor.position.set(-60, 0.008, 0)
    forestFloor.userData.isFloor = true
    group.add(forestFloor)

    // ── 2. RING ROADS ─────────────────────────────────────────────────────
    ;[[21, 25], [45, 49], [72, 76]].forEach(([ri, ro]) => {
      const ring = new THREE.Mesh(new THREE.RingGeometry(ri, ro, 64), matRoad)
      ring.rotation.x = -Math.PI / 2
      ring.position.y = 0.012
      ring.userData.isFloor = true
      group.add(ring)
    })

    // ── 3. CARDINAL ROADS + SPOKE PATHS ──────────────────────────────────
    addPath(0, 0, 0, -(GROUND_RADIUS - 5), 7, matRoad)
    addPath(0, 0, 0,  GROUND_RADIUS - 5,   7, matRoad)
    addPath(0, 0,  GROUND_RADIUS - 5, 0,   7, matRoad)
    addPath(0, 0, -(GROUND_RADIUS - 5), 0, 7, matRoad)
    VR_NPCS.forEach((npc) => {
      const [nx, , nz] = npc.position
      const d = Math.hypot(nx, nz)
      addPath(0, 0, nx * 50 / d, nz * 50 / d, 4)
    })
    addPath(0, -22, 0, -74, 9, matPath)   // wide avenue to Grand Hall
    addPath(22, 0, 76, 0, 5, matPath)     // east sports path
    addPath(-22, 0, -80, 0, 4, matPath)   // west forest path

    // ── 4. CENTRAL PLAZA ──────────────────────────────────────────────────
    const plaza = new THREE.Mesh(new THREE.CircleGeometry(11, 8), matPlaza)
    plaza.rotation.x = -Math.PI / 2
    plaza.position.y = 0.018
    plaza.userData.isFloor = true
    group.add(plaza)
    const plazaRing = new THREE.Mesh(new THREE.RingGeometry(9, 11, 8), matGranite)
    plazaRing.rotation.x = -Math.PI / 2
    plazaRing.position.y = 0.022
    group.add(plazaRing)

    // ── 5. MAPLE LEAF MONUMENT ────────────────────────────────────────────
    // 3 granite steps → stone pillar → gold collar →
    // a proper 3-D maple leaf crown (all lobes in the XY plane, tilted 25° toward player)
    ;[[3.8, 0.35, 0.175], [2.6, 0.35, 0.525], [1.7, 0.35, 0.875]].forEach(([r, h, cy]) => {
      const step = new THREE.Mesh(new THREE.CylinderGeometry(r, r + 0.14, h, 12), matGranite)
      step.position.set(-7, cy, 0)
      group.add(step)
    })
    const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.46, 0.60, 7.4, 12), matStone)
    pillar.position.set(-7, 4.85, 0)
    group.add(pillar)
    // Gold collar between pillar and leaf
    const goldCollar = new THREE.Mesh(new THREE.CylinderGeometry(0.74, 0.74, 0.26, 16), matGold)
    goldCollar.position.set(-7, 8.63, 0)
    group.add(goldCollar)
    // Maple leaf group — all geometry in XY plane, tilted 22° forward (south-facing)
    const mapleLG = new THREE.Group()
    mapleLG.position.set(-7, 9.8, 0)
    mapleLG.rotation.x = -Math.PI / 8  // lean toward player
    // Central disc body (CylinderGeometry rotated so flat face points Z/south)
    const leafDisc = new THREE.Mesh(new THREE.CylinderGeometry(0.88, 0.88, 0.20, 14), matRedCA)
    leafDisc.rotation.x = Math.PI / 2
    mapleLG.add(leafDisc)
    // Helper: cone lobe pointing outward from center at `deg` degrees from +Y, in XY plane
    const addLobe = (deg, dist, r, h) => {
      const rad = (deg * Math.PI) / 180
      const lobe = new THREE.Mesh(new THREE.ConeGeometry(r, h, 7), matRedCA)
      lobe.position.set(Math.sin(rad) * dist, Math.cos(rad) * dist, 0)
      lobe.rotation.z = -rad
      mapleLG.add(lobe)
    }
    // 5 upper lobes (classic Canadian maple leaf profile)
    addLobe(0,   1.12, 0.26, 0.82) // top center (tallest)
    addLobe(-28, 1.02, 0.23, 0.72) // upper-left inner
    addLobe( 28, 1.02, 0.23, 0.72) // upper-right inner
    addLobe(-60, 0.98, 0.21, 0.66) // upper-left outer
    addLobe( 60, 0.98, 0.21, 0.66) // upper-right outer
    // 2 wide side lobes
    addLobe(-92, 0.86, 0.20, 0.58)
    addLobe( 92, 0.86, 0.20, 0.58)
    // 2 lower shoulder lobes
    addLobe(-135, 0.68, 0.17, 0.48)
    addLobe( 135, 0.68, 0.17, 0.48)
    // Stem below central body
    const mapleStem = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.10, 0.72, 6), matRedCA)
    mapleStem.position.set(0, -1.28, 0)
    mapleLG.add(mapleStem)
    group.add(mapleLG)

    // ── 6. FOUNTAIN ───────────────────────────────────────────────────────
    const fBase = new THREE.Mesh(new THREE.CylinderGeometry(2.5, 2.8, 0.45, 20), matFount)
    fBase.position.set(7, 0.225, 0)
    group.add(fBase)
    const fPool = new THREE.Mesh(new THREE.CircleGeometry(2.0, 20), matPoolWater)
    fPool.rotation.x = -Math.PI / 2; fPool.position.set(7, 0.46, 0); fPool.userData.isFloor = true
    group.add(fPool)
    const fRing = new THREE.Mesh(new THREE.RingGeometry(2.0, 2.6, 20), matFount)
    fRing.rotation.x = -Math.PI / 2; fRing.position.set(7, 0.47, 0)
    group.add(fRing)
    const fSpire = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.18, 2.2, 8), matFount)
    fSpire.position.set(7, 1.6, 0); group.add(fSpire)
    const fSpray = new THREE.Mesh(new THREE.SphereGeometry(0.4, 8, 6), matWater)
    fSpray.position.set(7, 2.8, 0); fSpray.scale.set(1, 0.5, 1); group.add(fSpray)

    // ── 7. NPC PAVILIONS ──────────────────────────────────────────────────
    VR_NPCS.forEach((npc) => {
      const [nx, , nz] = npc.position
      const bx = nx * NPC_BUILDING_OFFSET, bz = nz * NPC_BUILDING_OFFSET
      const pavBase = new THREE.Mesh(new THREE.CylinderGeometry(2.6, 2.8, 0.4, 6), matGranite)
      pavBase.position.set(bx, 0.2, bz); group.add(pavBase)
      ;[0, Math.PI / 2, Math.PI, Math.PI * 3 / 2].forEach((ca) => {
        const col = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 3.2, 8), matColumn)
        col.position.set(bx + Math.sin(ca) * 1.8, 2.0, bz + Math.cos(ca) * 1.8)
        group.add(col)
      })
      const pavRoof = new THREE.Mesh(new THREE.ConeGeometry(2.4, 2.2, 6), matRoof)
      pavRoof.position.set(bx, 4.3, bz); group.add(pavRoof)
      const roofRing = new THREE.Mesh(new THREE.TorusGeometry(2.0, 0.14, 6, 16), matRedCA)
      roofRing.rotation.x = Math.PI / 2; roofRing.position.set(bx, 3.2, bz); group.add(roofRing)
    })

    // ── 8. GRAND LECTURE HALL (Salón Grande) ──────────────────────────────
    const GX = 0, GZ = -62
    const ghBody = new THREE.Mesh(new THREE.BoxGeometry(30, 13, 18), matCream)
    ghBody.position.set(GX, 6.5, GZ); group.add(ghBody)
    // Side wings
    ;[-17, 17].forEach((ox) => {
      const wing = new THREE.Mesh(new THREE.BoxGeometry(8, 9, 12), matCream)
      wing.position.set(GX + ox, 4.5, GZ + 2); group.add(wing)
      const wr = new THREE.Mesh(new THREE.BoxGeometry(8.5, 1, 12.5), matRoof)
      wr.position.set(GX + ox, 9.5, GZ + 2); group.add(wr)
    })
    // Portico columns
    for (let ci = 0; ci < 6; ci++) {
      const col = new THREE.Mesh(new THREE.CylinderGeometry(0.52, 0.64, 11.5, 12), matColumn)
      col.position.set(GX - 11.5 + ci * 4.6, 5.75, GZ - 7.5); group.add(col)
    }
    const ghPed = new THREE.Mesh(new THREE.BoxGeometry(28, 3.2, 1.2), matColumn)
    ghPed.position.set(GX, 14.3, GZ - 7.5); group.add(ghPed)
    const ghCornice = new THREE.Mesh(new THREE.BoxGeometry(32, 0.8, 20), matRedCA)
    ghCornice.position.set(GX, 13.4, GZ); group.add(ghCornice)
    const ghRoof = new THREE.Mesh(new THREE.BoxGeometry(32, 0.7, 20), matRoof)
    ghRoof.position.set(GX, 14.1, GZ); group.add(ghRoof)
    // Wide steps (3 levels)
    ;[[24, 0.5, GZ - 9.0], [20, 0.5, GZ - 11.0], [16, 0.5, GZ - 13.0]].forEach(([w, h, pz], idx) => {
      const step = new THREE.Mesh(new THREE.BoxGeometry(w, h, 2.0), matColumn)
      step.position.set(GX, h / 2 + idx * h, pz); group.add(step)
    })
    // Windows (two rows on south face)
    ;[4, 8].forEach((wy) => {
      for (let wi = -2; wi <= 2; wi++) {
        const win = new THREE.Mesh(new THREE.PlaneGeometry(2.5, 3.5), matGlass)
        win.position.set(GX + wi * 5.5, wy, GZ - 9.08); group.add(win)
      }
    })
    const ghBanner = new THREE.Mesh(new THREE.BoxGeometry(14, 1.2, 0.25), matRedCA)
    ghBanner.position.set(GX, 12.1, GZ - 7.4); group.add(ghBanner)

    // ── 9. LIBRARY ────────────────────────────────────────────────────────
    const LX = 28, LZ = -48
    const libBody = new THREE.Mesh(new THREE.BoxGeometry(18, 11, 14), matBrickBrn)
    libBody.position.set(LX, 5.5, LZ); group.add(libBody)
    const libRoof = new THREE.Mesh(new THREE.BoxGeometry(19, 1, 15), matRoof)
    libRoof.position.set(LX, 11.5, LZ); group.add(libRoof)
    ;[-2, 2].forEach((cx) => {
      const col = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.48, 9, 10), matColumn)
      col.position.set(LX + cx, 4.5, LZ - 7.05); group.add(col)
    })
    const libPed = new THREE.Mesh(new THREE.BoxGeometry(16, 2.5, 0.8), matColumn)
    libPed.position.set(LX, 12.25, LZ - 7.05); group.add(libPed)
    for (let wi = -3; wi <= 3; wi += 2) {
      const win = new THREE.Mesh(new THREE.PlaneGeometry(2, 3), matGlass)
      win.position.set(LX + wi * 2.5, 5.5, LZ - 7.06); group.add(win)
    }

    // ── 10. SCIENCE / ADMIN BUILDING ──────────────────────────────────────
    const AX = -26, AZ = -46
    const admBody = new THREE.Mesh(new THREE.BoxGeometry(16, 10, 13), matBrickBlu)
    admBody.position.set(AX, 5, AZ); group.add(admBody)
    const admRoof = new THREE.Mesh(new THREE.BoxGeometry(17, 0.9, 14), matRoof)
    admRoof.position.set(AX, 10.45, AZ); group.add(admRoof)
    const admCor = new THREE.Mesh(new THREE.BoxGeometry(17, 0.6, 14), matRedCA)
    admCor.position.set(AX, 10.0, AZ); group.add(admCor)
    for (let wi = -2; wi <= 2; wi++) {
      const win = new THREE.Mesh(new THREE.PlaneGeometry(2, 2.8), matGlass)
      win.position.set(AX + wi * 2.8, 5, AZ - 6.51); group.add(win)
    }

    // ── 11. SWIMMING POOL (east sports zone) ──────────────────────────────
    const PX = 65, PZ = 0
    const poolDeck = new THREE.Mesh(new THREE.PlaneGeometry(36, 58), matPoolDeck)
    poolDeck.rotation.x = -Math.PI / 2; poolDeck.position.set(PX, 0.012, PZ)
    poolDeck.userData.isFloor = true; group.add(poolDeck)
    const poolWater = new THREE.Mesh(new THREE.PlaneGeometry(18, 44), matPoolWater)
    poolWater.rotation.x = -Math.PI / 2; poolWater.position.set(PX, 0.06, PZ - 2)
    poolWater.userData.isFloor = true; group.add(poolWater)
    // Curbs
    ;[[PX, 0.22, PZ - 24.25, 20, 0.45, 0.5], [PX, 0.22, PZ + 20.25, 20, 0.45, 0.5],
      [PX - 9.25, 0.22, PZ - 2, 0.5, 0.45, 44], [PX + 9.25, 0.22, PZ - 2, 0.5, 0.45, 44]
    ].forEach(([x, y, z, w, h, d]) => {
      const curb = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), matPoolCurb)
      curb.position.set(x, y, z); group.add(curb)
    })
    // Lane dividers
    for (let li = -3; li <= 3; li++) {
      const lane = new THREE.Mesh(new THREE.PlaneGeometry(0.18, 44), matPoolLane)
      lane.rotation.x = -Math.PI / 2; lane.position.set(PX + li * 1.15, 0.07, PZ - 2); group.add(lane)
    }
    // Diving platform
    const diveBase = new THREE.Mesh(new THREE.BoxGeometry(2.5, 3.5, 2.5), matPoolDeck)
    diveBase.position.set(PX, 1.75, PZ - 26); group.add(diveBase)
    const diveBoard = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.18, 4.5), matPoolCurb)
    diveBoard.position.set(PX, 3.6, PZ - 25); group.add(diveBoard)
    // Sports building
    const pbBody = new THREE.Mesh(new THREE.BoxGeometry(14, 6.5, 12), matCream)
    pbBody.position.set(PX, 3.25, PZ + 28); group.add(pbBody)
    const pbRoof = new THREE.Mesh(new THREE.BoxGeometry(15, 0.8, 13), matRoof)
    pbRoof.position.set(PX, 6.9, PZ + 28); group.add(pbRoof)
    const pbSign = new THREE.Mesh(new THREE.BoxGeometry(8, 1, 0.2), matRedCA)
    pbSign.position.set(PX, 5.5, PZ + 22.1); group.add(pbSign)
    // Bleachers
    const bleachers = new THREE.Mesh(new THREE.BoxGeometry(18, 2.5, 6), matGranite)
    bleachers.position.set(PX + 15, 1.25, PZ - 2); group.add(bleachers)

    // ── 12. WEST FOREST ZONE ──────────────────────────────────────────────
    const clearPath = new THREE.Mesh(new THREE.CircleGeometry(7, 12), matPath)
    clearPath.rotation.x = -Math.PI / 2; clearPath.position.set(-60, 0.015, 0)
    clearPath.userData.isFloor = true; group.add(clearPath)
    const hBody = new THREE.Mesh(new THREE.BoxGeometry(5, 4, 4), matWood)
    hBody.position.set(-62, 2, 0); group.add(hBody)
    const hRoof = new THREE.Mesh(new THREE.ConeGeometry(4, 3.5, 4), matRoof)
    hRoof.position.set(-62, 5.75, 0); hRoof.rotation.y = Math.PI / 4; group.add(hRoof)

    // ── 13. PORTAL NEXUS (south) ──────────────────────────────────────────
    const nexusPlaza = new THREE.Mesh(new THREE.CircleGeometry(30, 16), matNexus)
    nexusPlaza.rotation.x = -Math.PI / 2; nexusPlaza.position.set(0, 0.014, 70)
    nexusPlaza.userData.isFloor = true; group.add(nexusPlaza)
    const nexusRing = new THREE.Mesh(new THREE.RingGeometry(27, 30.5, 16), matNexusDk)
    nexusRing.rotation.x = -Math.PI / 2; nexusRing.position.set(0, 0.02, 70); group.add(nexusRing)
    ;[-12, 12].forEach((ox) => {
      const gp = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.9, 11, 8), matNexus)
      gp.position.set(ox, 5.5, 46); group.add(gp)
      const gpc = new THREE.Mesh(new THREE.SphereGeometry(1.1, 8, 6), matNexusDk)
      gpc.position.set(ox, 11.55, 46); group.add(gpc)
    })
    const gateArch = new THREE.Mesh(new THREE.BoxGeometry(27, 1.5, 1.2), matNexus)
    gateArch.position.set(0, 11.25, 46); group.add(gateArch)
    const gateSign = new THREE.Mesh(new THREE.BoxGeometry(12, 1.8, 0.4), matNexusDk)
    gateSign.position.set(0, 9.5, 45.7); group.add(gateSign)
    // Side walls of nexus
    ;[-25, 25].forEach((ox) => {
      const sw = new THREE.Mesh(new THREE.BoxGeometry(1.2, 7, 50), matNexus)
      sw.position.set(ox, 3.5, 70); group.add(sw)
    })
    const nexusBack = new THREE.Mesh(new THREE.BoxGeometry(52, 7, 1.2), matNexus)
    nexusBack.position.set(0, 3.5, 95); group.add(nexusBack)

    // ── 14. DORMITORIES ───────────────────────────────────────────────────
    CAMPUS_DORMS.forEach(({ pos, color }) => {
      const [bx, , bz] = pos
      const dorm = new THREE.Mesh(new THREE.BoxGeometry(12, 8.5, 10), new THREE.MeshStandardMaterial({ color }))
      dorm.position.set(bx, 4.25, bz); group.add(dorm)
      const dr = new THREE.Mesh(new THREE.BoxGeometry(13, 1.0, 11), matRoof)
      dr.position.set(bx, 8.75, bz); group.add(dr)
      for (let wr = 0; wr < 2; wr++) {
        for (let wi = -1; wi <= 1; wi++) {
          const win = new THREE.Mesh(new THREE.PlaneGeometry(2, 1.8), matGlass)
          win.position.set(bx + wi * 3.5, 2.5 + wr * 3.5, bz + 5.06); group.add(win)
        }
      }
      const fstrip = new THREE.Mesh(new THREE.BoxGeometry(6, 0.5, 0.1), matRedCA)
      fstrip.position.set(bx, 8.2, bz + 5.08); group.add(fstrip)
    })

    // ── 15. MAPLE TREES (InstancedMesh) ──────────────────────────────────
    const rng = (seed) => { const v = Math.sin(seed * 127.1) * 43758.5453; return v - Math.floor(v) }
    const rawTrees = []
    // Forest zone (dense, west)
    for (let row = 0; row < 7; row++) {
      for (let col = 0; col < 7; col++) {
        const tx = -44 - col * 5.5 + (row % 2) * 2.5
        const tz = -32 + row * 10 + rng(row * 7 + col) * 4 - 2
        if (Math.hypot(tx, tz) > 87) continue
        rawTrees.push({ x: tx, z: tz, s: 0.8 + rng(row * 14 + col) * 0.25 })
      }
    }
    // Grand Hall avenue (flanking north road)
    for (let i = 0; i < 8; i++) {
      const tz = -30 - i * 4.5; if (tz < -62) break
      rawTrees.push({ x: 9, z: tz, s: 0.88 }); rawTrees.push({ x: -9, z: tz, s: 0.88 })
    }
    // Perimeter ring (r=73-79)
    for (let i = 0; i < 40; i++) {
      const angle = (i / 40) * Math.PI * 2
      const tx = Math.sin(angle) * (73 + rng(i * 5.3) * 5)
      const tz = Math.cos(angle) * (73 + rng(i * 7.1) * 5)
      if (tx > 48 && Math.abs(tz) < 40) continue
      if (tz > 44 && Math.abs(tx) < 28) continue
      if (tz < -58 && Math.abs(tx) < 20) continue
      rawTrees.push({ x: tx, z: tz, s: 1.0 + rng(i * 11.3) * 0.2 })
    }
    // Mid-campus scatter
    for (let i = 0; i < 6; i++) {
      const angle = Math.PI / 6 + (i / 6) * Math.PI * 2
      const tx = Math.sin(angle) * 32, tz = Math.cos(angle) * 32
      if (tz < -28 || (tx > 0 && tz < 0)) continue
      rawTrees.push({ x: tx, z: tz, s: 0.85 })
    }
    ;[-20, -12, 12, 20].forEach((tx) => rawTrees.push({ x: tx, z: 42, s: 1.0 }))

    const TREE_COUNT = rawTrees.length
    const trunkGeo  = new THREE.CylinderGeometry(0.22, 0.32, 4.0, 7)
    const fol1Geo   = new THREE.SphereGeometry(2.5, 8, 6)
    const fol2Geo   = new THREE.SphereGeometry(1.8, 7, 5)
    const redTopGeo = new THREE.SphereGeometry(1.0, 6, 4)
    const dummy     = new THREE.Object3D()

    const trunkInst  = new THREE.InstancedMesh(trunkGeo, matTrunk, TREE_COUNT)
    const fol1Inst   = new THREE.InstancedMesh(fol1Geo, matFolA, TREE_COUNT)
    const fol2Inst   = new THREE.InstancedMesh(fol2Geo, matFolB, TREE_COUNT)
    const redTopInst = new THREE.InstancedMesh(redTopGeo, matMapleRed, TREE_COUNT)
    ;[trunkInst, fol1Inst, fol2Inst, redTopInst].forEach((m) => { m.raycast = () => {} })

    rawTrees.forEach(({ x, z, s }, i) => {
      dummy.rotation.y = rng(i * 3.3) * Math.PI * 2
      dummy.scale.setScalar(s)
      dummy.position.set(x, 2.0 * s, z); dummy.updateMatrix(); trunkInst.setMatrixAt(i, dummy.matrix)
      dummy.position.set(x, 4.5 * s, z); dummy.updateMatrix(); fol1Inst.setMatrixAt(i, dummy.matrix)
      dummy.position.set(x, 5.8 * s, z); dummy.updateMatrix(); fol2Inst.setMatrixAt(i, dummy.matrix)
      dummy.scale.setScalar(s * 0.65); dummy.position.set(x, 7.0 * s, z); dummy.updateMatrix(); redTopInst.setMatrixAt(i, dummy.matrix)
    })
    ;[trunkInst, fol1Inst, fol2Inst, redTopInst].forEach((m) => { m.instanceMatrix.needsUpdate = true })
    group.add(trunkInst, fol1Inst, fol2Inst, redTopInst)

    // ── 16. LAMP POSTS (InstancedMesh) ────────────────────────────────────
    const lampPos = []
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2
      lampPos.push([Math.sin(a) * 23.5, Math.cos(a) * 23.5])
    }
    ;[0, Math.PI / 2, Math.PI, Math.PI * 3 / 2].forEach((a) => {
      ;[15, 30, 44, 58].forEach((r) => {
        const perp = a + Math.PI / 2
        lampPos.push(
          [Math.cos(a) * r + Math.cos(perp) * 4.2, Math.sin(a) * r + Math.sin(perp) * 4.2],
          [Math.cos(a) * r - Math.cos(perp) * 4.2, Math.sin(a) * r - Math.sin(perp) * 4.2],
        )
      })
    })
    const poleGeo  = new THREE.CylinderGeometry(0.07, 0.09, 5.5, 8)
    const bulbGeo  = new THREE.SphereGeometry(0.28, 8, 6)
    const poleInst = new THREE.InstancedMesh(poleGeo, matPole, lampPos.length)
    const bulbInst = new THREE.InstancedMesh(bulbGeo, matBulb, lampPos.length)
    lampPos.forEach(([lx, lz], i) => {
      dummy.scale.setScalar(1); dummy.rotation.set(0, 0, 0)
      dummy.position.set(lx, 2.75, lz); dummy.updateMatrix(); poleInst.setMatrixAt(i, dummy.matrix)
      dummy.position.set(lx, 5.65, lz); dummy.updateMatrix(); bulbInst.setMatrixAt(i, dummy.matrix)
    })
    ;[poleInst, bulbInst].forEach((m) => { m.instanceMatrix.needsUpdate = true; m.raycast = () => {} })
    group.add(poleInst, bulbInst)

    // ── 17. PERIMETER: STONE FENCE + GATE POSTS ───────────────────────────
    const FENCE_SEGS = 72
    const arcLen = (2 * Math.PI * GROUND_RADIUS) / FENCE_SEGS * 1.03
    const fenceGeo = new THREE.BoxGeometry(arcLen, 1.8, 0.45)
    const gateSet  = new Set()
    ;[0, 18, 36, 54].forEach((b) => { gateSet.add(b); gateSet.add((b + 1) % FENCE_SEGS) })
    const fenceSegs = Array.from({ length: FENCE_SEGS }, (_, i) => i).filter((i) => !gateSet.has(i))
    const fenceInst = new THREE.InstancedMesh(fenceGeo, matGranite, fenceSegs.length)
    fenceSegs.forEach((idx, i) => {
      const a = (idx / FENCE_SEGS) * Math.PI * 2
      dummy.position.set(Math.sin(a) * GROUND_RADIUS, 0.9, Math.cos(a) * GROUND_RADIUS)
      dummy.rotation.set(0, a, 0); dummy.scale.setScalar(1); dummy.updateMatrix()
      fenceInst.setMatrixAt(i, dummy.matrix)
    })
    fenceInst.instanceMatrix.needsUpdate = true; fenceInst.raycast = () => {}
    group.add(fenceInst)
    // Stone gate posts with red caps
    ;[0, Math.PI / 2, Math.PI, Math.PI * 3 / 2].forEach((a) => {
      const sx = Math.sin(a); const cz = Math.cos(a); const px = Math.cos(a); const pz = -Math.sin(a)
      ;[-5.5, 5.5].forEach((off) => {
        const post = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.62, 5.5, 8), matGranite)
        post.position.set(sx * GROUND_RADIUS + px * off, 2.75, cz * GROUND_RADIUS + pz * off)
        group.add(post)
        const cap = new THREE.Mesh(new THREE.SphereGeometry(0.65, 8, 6), matRedCA)
        cap.position.set(sx * GROUND_RADIUS + px * off, 5.85, cz * GROUND_RADIUS + pz * off)
        group.add(cap)
      })
      const bar = new THREE.Mesh(new THREE.BoxGeometry(13.5, 0.45, 0.45), matGranite)
      bar.position.set(sx * GROUND_RADIUS, 5.7, cz * GROUND_RADIUS); bar.rotation.y = a
      group.add(bar)
    })

    return { model: group, groundRayHeight: 22 }
  }, [])
}

// Canadian summer cottage suite — honey-oak floors, cream walls with maple-wood
// trim, stone fireplace on south wall, study desk, bookshelf, cozy couch area,
// queen bed with maple-leaf quilt, and a decorative portal arch on the north wall.
// Walls are 1.4 units thick to prevent wall-clipping.
function useRoomGround() {
  return useMemo(() => {
    const group = new THREE.Group()
    const hw = ROOM_SIZE / 2  // 14

    // ── Materials ─────────────────────────────────────────────────────────
    const matFloor   = new THREE.MeshStandardMaterial({ color: '#b8863a' })
    const matFloorDk = new THREE.MeshStandardMaterial({ color: '#9a6c28' })
    const matWall    = new THREE.MeshStandardMaterial({ color: '#f0ece0' })
    const matWains   = new THREE.MeshStandardMaterial({ color: '#8b6234' })
    const matCeiling = new THREE.MeshStandardMaterial({ color: '#f5f2ea', side: THREE.BackSide })
    const matBeam    = new THREE.MeshStandardMaterial({ color: '#7a5228' })
    const matRedCA   = new THREE.MeshStandardMaterial({ color: '#d52b1e' })
    const matWhiteCA = new THREE.MeshStandardMaterial({ color: '#f8f4ec' })
    const matStone   = new THREE.MeshStandardMaterial({ color: '#8a8278' })
    const matFireGlw = new THREE.MeshStandardMaterial({ color: '#ff6a00', emissive: '#ff4400', emissiveIntensity: 0.85 })
    const matGlass   = new THREE.MeshStandardMaterial({ color: '#88d8a0', transparent: true, opacity: 0.45, emissive: '#44a860', emissiveIntensity: 0.12 })
    const matWFrame  = new THREE.MeshStandardMaterial({ color: '#f0ece0' })
    const matShelf   = new THREE.MeshStandardMaterial({ color: '#7a5228' })
    const matBook    = [
      new THREE.MeshStandardMaterial({ color: '#1a3a6a' }),
      new THREE.MeshStandardMaterial({ color: '#6a1a1a' }),
      new THREE.MeshStandardMaterial({ color: '#1a5a2a' }),
      new THREE.MeshStandardMaterial({ color: '#4a3a1a' }),
      new THREE.MeshStandardMaterial({ color: '#5a2a5a' }),
      new THREE.MeshStandardMaterial({ color: '#1a5a5a' }),
    ]
    const matDesk    = new THREE.MeshStandardMaterial({ color: '#9a7a4a' })
    const matMetal   = new THREE.MeshStandardMaterial({ color: '#3a3030' })
    const matMonScr  = new THREE.MeshStandardMaterial({ color: '#2a4a8a', emissive: '#1a3a6a', emissiveIntensity: 0.55 })
    const matLmpBase = new THREE.MeshStandardMaterial({ color: '#3a3030' })
    const matLmpGlow = new THREE.MeshStandardMaterial({ color: '#fff8e0', emissive: '#ffcc50', emissiveIntensity: 1.2 })
    const matRug     = new THREE.MeshStandardMaterial({ color: '#8a3a28' })
    const matRugPat  = new THREE.MeshStandardMaterial({ color: '#d49a28' })
    const matBed     = new THREE.MeshStandardMaterial({ color: '#2a3a5a' })
    const matPillow  = new THREE.MeshStandardMaterial({ color: '#f0eae0' })
    const matCouch   = new THREE.MeshStandardMaterial({ color: '#4a3a28' })
    const matCoffee  = new THREE.MeshStandardMaterial({ color: '#6a4a1a' })
    const matCurtain = new THREE.MeshStandardMaterial({ color: '#c04428', transparent: true, opacity: 0.88 })
    const matWard    = new THREE.MeshStandardMaterial({ color: '#7a5228' })
    const matMirror  = new THREE.MeshStandardMaterial({ color: '#8ac8e8', transparent: true, opacity: 0.5, emissive: '#4088a0', emissiveIntensity: 0.12 })
    const matPlant   = new THREE.MeshStandardMaterial({ color: '#2d6b1a' })
    const matPlantRd = new THREE.MeshStandardMaterial({ color: '#d42020' })
    const matNexus   = new THREE.MeshStandardMaterial({ color: '#2a2840' })

    // ── Floor (honey-oak planks) ───────────────────────────────────────────
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(ROOM_SIZE, ROOM_SIZE), matFloor)
    floor.rotation.x = -Math.PI / 2; floor.userData.isFloor = true; group.add(floor)
    for (let p = -hw + 0.65; p < hw; p += 1.3) {
      const plank = new THREE.Mesh(new THREE.PlaneGeometry(0.7, ROOM_SIZE), matFloorDk)
      plank.rotation.x = -Math.PI / 2; plank.position.set(p, 0.002, 0)
      plank.userData.isFloor = true; group.add(plank)
    }

    // ── Walls (thick cream, with maple wood wainscoting) ──────────────────
    const wallT = 1.4
    const wallDefs = [
      { pos: [0, ROOM_HEIGHT / 2, -hw - wallT / 2], size: [ROOM_SIZE + wallT * 2, ROOM_HEIGHT, wallT] },
      { pos: [0, ROOM_HEIGHT / 2,  hw + wallT / 2], size: [ROOM_SIZE + wallT * 2, ROOM_HEIGHT, wallT] },
      { pos: [-hw - wallT / 2, ROOM_HEIGHT / 2, 0], size: [wallT, ROOM_HEIGHT, ROOM_SIZE] },
      { pos: [ hw + wallT / 2, ROOM_HEIGHT / 2, 0], size: [wallT, ROOM_HEIGHT, ROOM_SIZE] },
    ]
    wallDefs.forEach(({ pos, size }) => {
      const wall = new THREE.Mesh(new THREE.BoxGeometry(...size), matWall)
      wall.position.set(...pos); group.add(wall)
      const wains = new THREE.Mesh(new THREE.BoxGeometry(size[0] + 0.02, 1.0, size[2] + 0.02), matWains)
      wains.position.set(pos[0], 0.5, pos[2]); group.add(wains)
    })

    // ── Ceiling + maple beams ──────────────────────────────────────────────
    const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(ROOM_SIZE, ROOM_SIZE), matCeiling)
    ceiling.rotation.x = Math.PI / 2; ceiling.position.y = ROOM_HEIGHT
    group.add(ceiling)
    for (let bx = -hw + 3.5; bx < hw; bx += 5) {
      const beam = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.3, ROOM_SIZE), matBeam)
      beam.position.set(bx, ROOM_HEIGHT - 0.16, 0); group.add(beam)
    }
    for (let bz = -hw + 4; bz < hw; bz += 8) {
      const cb = new THREE.Mesh(new THREE.BoxGeometry(ROOM_SIZE, 0.2, 0.25), matBeam)
      cb.position.set(0, ROOM_HEIGHT - 0.12, bz); group.add(cb)
    }

    // ── SOUTH WALL — Fireplace (faces north, player spawns near center) ───
    const fpBase = new THREE.Mesh(new THREE.BoxGeometry(4.5, 0.45, 1.5), matStone)
    fpBase.position.set(0, 0.225, hw - 1.2); group.add(fpBase)
    ;[-1.9, 1.9].forEach((ox) => {
      const fp = new THREE.Mesh(new THREE.BoxGeometry(0.7, 3.2, 1.5), matStone)
      fp.position.set(ox, 1.6, hw - 1.2); group.add(fp)
    })
    const fpLintel = new THREE.Mesh(new THREE.BoxGeometry(4.7, 0.5, 1.5), matStone)
    fpLintel.position.set(0, 3.45, hw - 1.2); group.add(fpLintel)
    const fpMantel = new THREE.Mesh(new THREE.BoxGeometry(5.2, 0.35, 0.65), matWard)
    fpMantel.position.set(0, 3.85, hw - 1.0); group.add(fpMantel)
    const fpChim = new THREE.Mesh(new THREE.BoxGeometry(2.0, ROOM_HEIGHT - 3.8, 1.1), matStone)
    fpChim.position.set(0, (ROOM_HEIGHT + 3.8) / 2, hw - 0.9); group.add(fpChim)
    const fpFire = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.9, 0.4), matFireGlw)
    fpFire.position.set(0, 0.9, hw - 0.75); group.add(fpFire)
    ;[-1.8, 1.8].forEach((ox) => {
      const vase = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.12, 0.45, 8), matRedCA)
      vase.position.set(ox, 4.15, hw - 1.05); group.add(vase)
    })
    // Maple-leaf art above fireplace
    const artBase = new THREE.Mesh(new THREE.PlaneGeometry(3.5, 3.5), matWhiteCA)
    artBase.position.set(0, 6.0, hw - 0.72); group.add(artBase)
    const artLeaf = new THREE.Mesh(new THREE.SphereGeometry(0.85, 10, 8), matRedCA)
    artLeaf.position.set(0, 6.0, hw - 0.78); artLeaf.scale.set(1.0, 0.7, 0.18); group.add(artLeaf)

    // ── NORTH WALL — Portal arch + two windows ─────────────────────────────
    // Decorative stone arch surrounds the exit portal
    ;[-2.5, 2.5].forEach((ox) => {
      const archP = new THREE.Mesh(new THREE.BoxGeometry(0.8, 5.5, 0.9), matNexus)
      archP.position.set(ox, 2.75, -hw + 0.85); group.add(archP)
    })
    const archTop = new THREE.Mesh(new THREE.BoxGeometry(6.5, 1.0, 0.9), matNexus)
    archTop.position.set(0, 5.75, -hw + 0.85); group.add(archTop)
    const archCurve = new THREE.Mesh(new THREE.TorusGeometry(2.5, 0.38, 6, 12, Math.PI), matNexus)
    archCurve.position.set(0, 5.5, -hw + 0.85); archCurve.rotation.z = Math.PI; group.add(archCurve)
    // Two windows flanking the arch
    ;[-7, 7].forEach((wx) => {
      const nWin = new THREE.Mesh(new THREE.PlaneGeometry(3.0, 2.8), matGlass)
      nWin.position.set(wx, 3.2, -hw + 0.72); group.add(nWin)
      ;[wx - 1.55, wx + 1.55].forEach((fx) => {
        const fr = new THREE.Mesh(new THREE.BoxGeometry(0.18, 3.1, 0.18), matWFrame)
        fr.position.set(fx, 3.2, -hw + 0.64); group.add(fr)
      })
      ;[wx - 1.7, wx + 1.7].forEach((cx) => {
        const curt = new THREE.Mesh(new THREE.BoxGeometry(0.35, 2.8, 0.12), matCurtain)
        curt.position.set(cx, 3.2, -hw + 0.88); group.add(curt)
      })
    })

    // ── EAST WALL — Desk + two bookshelves + window ────────────────────────
    ;[-4.5, 4.5].forEach((bz) => {
      const shCase = new THREE.Mesh(new THREE.BoxGeometry(0.45, ROOM_HEIGHT - 0.2, 5.5), matShelf)
      shCase.position.set(hw - 0.9, (ROOM_HEIGHT - 0.2) / 2, bz); group.add(shCase)
      for (let sy = 0.9; sy < ROOM_HEIGHT - 1.0; sy += 1.4) {
        const sh = new THREE.Mesh(new THREE.BoxGeometry(0.47, 0.1, 5.5), matShelf)
        sh.position.set(hw - 0.9, sy, bz); group.add(sh)
        let bp = bz - 2.4
        for (let bi = 0; bi < 8; bi++) {
          const bW = 0.28 + (bi % 3) * 0.1
          const book = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.7 + (bi % 2) * 0.12, bW), matBook[bi % 6])
          book.position.set(hw - 0.88, sy + 0.44, bp + bW / 2); group.add(book)
          bp += bW + 0.05
        }
      }
    })
    // Window between bookshelves
    const eWin = new THREE.Mesh(new THREE.PlaneGeometry(3.0, 4.0), matGlass)
    eWin.rotation.y = -Math.PI / 2; eWin.position.set(hw - 0.72, 3.2, -0.5); group.add(eWin)
    ;[-0.5 - 1.9, -0.5 + 1.9].forEach((cz) => {
      const curt = new THREE.Mesh(new THREE.BoxGeometry(0.12, 4.0, 0.4), matCurtain)
      curt.position.set(hw - 0.88, 3.2, cz); group.add(curt)
    })
    // Study desk (north end of east wall)
    const dTop = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.12, 5.5), matDesk)
    dTop.position.set(hw - 2.0, 1.8, -7.5); group.add(dTop)
    ;[-2.2, 2.2].forEach((dz) => {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.8, 0.08), matMetal)
      leg.position.set(hw - 2.0, 0.9, -7.5 + dz); group.add(leg)
    })
    // Monitor
    const monBase = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.12, 0.35), matMetal)
    monBase.position.set(hw - 2.0, 1.93, -7.2); group.add(monBase)
    const monScr = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.5, 2.2), matMetal)
    monScr.position.set(hw - 2.08, 2.82, -7.2); group.add(monScr)
    const monGlow = new THREE.Mesh(new THREE.PlaneGeometry(2.0, 1.3), matMonScr)
    monGlow.rotation.y = Math.PI / 2; monGlow.position.set(hw - 1.99, 2.82, -7.2); group.add(monGlow)
    // Desk lamp
    const dLBase = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.2, 0.12, 8), matLmpBase)
    dLBase.position.set(hw - 2.0, 1.92, -9.5); group.add(dLBase)
    const dLPole = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.9, 6), matLmpBase)
    dLPole.position.set(hw - 2.0, 2.43, -9.5); group.add(dLPole)
    const dLShade = new THREE.Mesh(new THREE.ConeGeometry(0.32, 0.32, 8, 1, true), matLmpBase)
    dLShade.position.set(hw - 2.0, 2.97, -9.5); group.add(dLShade)
    const dLBulb = new THREE.Mesh(new THREE.SphereGeometry(0.1, 6, 4), matLmpGlow)
    dLBulb.position.set(hw - 2.0, 2.97, -9.5); group.add(dLBulb)

    // ── WEST WALL — Bed + Wardrobe + window ───────────────────────────────
    const bedFrame = new THREE.Mesh(new THREE.BoxGeometry(4.5, 0.55, 6.0), matBed)
    bedFrame.position.set(-hw + 3.0, 0.275, -5); group.add(bedFrame)
    const mattress = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.4, 5.7), new THREE.MeshStandardMaterial({ color: '#e8ddd0' }))
    mattress.position.set(-hw + 3.0, 0.75, -5); group.add(mattress)
    const blanket = new THREE.Mesh(new THREE.BoxGeometry(4.1, 0.22, 3.8), matRedCA)
    blanket.position.set(-hw + 3.0, 0.98, -3.8); group.add(blanket)
    const quilPat = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.23, 1.5), matWhiteCA)
    quilPat.position.set(-hw + 3.0, 0.99, -3.8); group.add(quilPat)
    ;[-1.4, 1.4].forEach((ox) => {
      const pil = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.28, 0.85), matPillow)
      pil.position.set(-hw + 3.0 + ox, 1.03, -7.4); group.add(pil)
    })
    const headboard = new THREE.Mesh(new THREE.BoxGeometry(4.6, 1.6, 0.22), matWard)
    headboard.position.set(-hw + 3.0, 1.5, -8.0); group.add(headboard)
    const hbLeaf = new THREE.Mesh(new THREE.SphereGeometry(0.55, 8, 6), matRedCA)
    hbLeaf.position.set(-hw + 3.0, 1.5, -7.89); hbLeaf.scale.set(1.0, 0.7, 0.2); group.add(hbLeaf)
    // Bedside lamp
    const bLBase = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.18, 0.55, 8), matLmpBase)
    bLBase.position.set(-hw + 1.0, 0.92, -7.0); group.add(bLBase)
    const bLShade = new THREE.Mesh(new THREE.ConeGeometry(0.32, 0.3, 8, 1, true), matLmpBase)
    bLShade.position.set(-hw + 1.0, 1.45, -7.0); group.add(bLShade)
    const bLBulb = new THREE.Mesh(new THREE.SphereGeometry(0.11, 6, 4), matLmpGlow)
    bLBulb.position.set(-hw + 1.0, 1.43, -7.0); group.add(bLBulb)
    // Wardrobe (south end of west wall)
    const wCab = new THREE.Mesh(new THREE.BoxGeometry(0.65, ROOM_HEIGHT - 1.0, 5.0), matWard)
    wCab.position.set(-hw + 0.95, (ROOM_HEIGHT - 1.0) / 2, 5.5); group.add(wCab)
    ;[4.1, 6.8].forEach((dz) => {
      const door = new THREE.Mesh(new THREE.BoxGeometry(0.68, ROOM_HEIGHT - 1.5, 2.2), matWall)
      door.position.set(-hw + 1.0, (ROOM_HEIGHT - 1.5) / 2, dz); group.add(door)
    })
    const mirror = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 2.8), matMirror)
    mirror.rotation.y = Math.PI / 2; mirror.position.set(-hw + 1.36, 2.2, 5.5); group.add(mirror)
    // West window (above bed)
    const wWin = new THREE.Mesh(new THREE.PlaneGeometry(3.5, 2.5), matGlass)
    wWin.rotation.y = Math.PI / 2; wWin.position.set(-hw + 0.72, 3.8, -5); group.add(wWin)

    // ── CENTER — Rug + Couch + Coffee table ──────────────────────────────
    const rug = new THREE.Mesh(new THREE.PlaneGeometry(10, 8), matRug)
    rug.rotation.x = -Math.PI / 2; rug.position.set(2, 0.004, 3); rug.userData.isFloor = true; group.add(rug)
    const rugBorder = new THREE.Mesh(new THREE.PlaneGeometry(8.5, 6.5), matRugPat)
    rugBorder.rotation.x = -Math.PI / 2; rugBorder.position.set(2, 0.006, 3); group.add(rugBorder)
    const rugCtr = new THREE.Mesh(new THREE.PlaneGeometry(6.5, 5.0), matRug)
    rugCtr.rotation.x = -Math.PI / 2; rugCtr.position.set(2, 0.008, 3); group.add(rugCtr)
    // Couch (facing south / fireplace)
    const cBase1 = new THREE.Mesh(new THREE.BoxGeometry(6.5, 0.7, 2.2), matCouch)
    cBase1.position.set(1.5, 0.35, 0); group.add(cBase1)
    const cBack1 = new THREE.Mesh(new THREE.BoxGeometry(6.5, 1.2, 0.55), matCouch)
    cBack1.position.set(1.5, 1.05, -1.2); group.add(cBack1)
    ;[-2, 0, 2].forEach((ox) => {
      const cush = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.35, 1.8), matRedCA)
      cush.position.set(1.5 + ox, 0.88, 0); group.add(cush)
    })
    // Coffee table
    const ctTop = new THREE.Mesh(new THREE.BoxGeometry(4.5, 0.14, 2.5), matCoffee)
    ctTop.position.set(2, 0.72, 3.5); group.add(ctTop)
    ;[[-1.5, 2.5], [1.5, 2.5], [-1.5, 4.5], [1.5, 4.5]].forEach(([cx, cz]) => {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.72, 6), matMetal)
      leg.position.set(cx, 0.36, cz); group.add(leg)
    })

    // ── NE CORNER — Decorative maple tree ─────────────────────────────────
    const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.65, 0.75, 10), matStone)
    pot.position.set(hw - 2, 0.375, -hw + 2); group.add(pot)
    const tTrunk = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.18, 1.8, 7), matWard)
    tTrunk.position.set(hw - 2, 1.65, -hw + 2); group.add(tTrunk)
    const tGreen = new THREE.Mesh(new THREE.SphereGeometry(1.2, 8, 6), matPlant)
    tGreen.position.set(hw - 2, 3.2, -hw + 2); group.add(tGreen)
    const tRed = new THREE.Mesh(new THREE.SphereGeometry(0.6, 6, 4), matPlantRd)
    tRed.position.set(hw - 2, 4.15, -hw + 2); group.add(tRed)

    // ── SOUTH WINDOWS + Canadian flag ─────────────────────────────────────
    // Flag mounted on south wall (left of fireplace)
    ;[matRedCA, matWhiteCA, matRedCA].forEach((mat, i) => {
      const seg = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 1.2), mat)
      seg.position.set(-5.0 + i * 1.3, 4.5, hw - 0.72); group.add(seg)
    })
    const fMaple = new THREE.Mesh(new THREE.SphereGeometry(0.3, 8, 6), matRedCA)
    fMaple.position.set(-3.7, 4.5, hw - 0.70); fMaple.scale.set(1.0, 0.7, 0.18); group.add(fMaple)
    const fRod = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 4.5, 6), matMetal)
    fRod.position.set(-6.2, 4.5, hw - 0.7); fRod.rotation.z = Math.PI / 2; group.add(fRod)
    // South windows (flanking fireplace)
    ;[-6, 6].forEach((wx) => {
      const sWin = new THREE.Mesh(new THREE.PlaneGeometry(3.0, 3.5), matGlass)
      sWin.position.set(wx, 3.0, hw - 0.72); group.add(sWin)
      ;[wx - 1.9, wx + 1.9].forEach((cx) => {
        const curt = new THREE.Mesh(new THREE.BoxGeometry(0.35, 3.5, 0.12), matCurtain)
        curt.position.set(cx, 3.0, hw - 0.88); group.add(curt)
      })
    })

    return { model: group, groundRayHeight: ROOM_HEIGHT + 2 }
  }, [])
}

// ─── Anfiteatro ───────────────────────────────────────────────────────────────
// Indoor theater: lobby → audience seating → raised stage → video screen wall
// Backstage wings extend behind the screen on both sides.
// The YouTube iframe is rendered via <Html> overlay from @react-three/drei.
function useAnfiteatroGround() {
  return useMemo(() => {
    const group = new THREE.Group()
    const hw = ANFI_HW   // 28
    const hd = ANFI_HD   // 40
    const wallT = 1.6

    // ── Materials ─────────────────────────────────────────────────────────
    const matFloor    = new THREE.MeshStandardMaterial({ color: '#2a1e14' })      // dark wood
    const matFloorAud = new THREE.MeshStandardMaterial({ color: '#1e1510' })      // darker audience
    const matStage    = new THREE.MeshStandardMaterial({ color: '#3d2a1a' })      // warm oak stage
    const matWall     = new THREE.MeshStandardMaterial({ color: '#1a1020' })      // deep theatre purple
    const matWallRed  = new THREE.MeshStandardMaterial({ color: '#4a0a0a' })      // dark red wall accents
    const matCeiling  = new THREE.MeshStandardMaterial({ color: '#111018', side: THREE.BackSide })
    const matScreen   = new THREE.MeshStandardMaterial({ color: '#0a0a14', emissive: '#1a1a3a', emissiveIntensity: 0.5 })
    const matBeam     = new THREE.MeshStandardMaterial({ color: '#2d1a0a' })
    const matGold     = new THREE.MeshStandardMaterial({ color: '#b8880e', emissive: '#704400', emissiveIntensity: 0.3 })
    const matSeatBody = new THREE.MeshStandardMaterial({ color: '#6a0a14' })      // deep red seats
    const matSeatBack = new THREE.MeshStandardMaterial({ color: '#820f18' })
    const matSeatLeg  = new THREE.MeshStandardMaterial({ color: '#1a1010' })
    const matCurtain  = new THREE.MeshStandardMaterial({ color: '#7a0020', side: THREE.DoubleSide })
    const matLight    = new THREE.MeshStandardMaterial({ color: '#fff8e0', emissive: '#fff0b0', emissiveIntensity: 2.0 })
    const matPoster   = new THREE.MeshStandardMaterial({ color: '#ffd700' })
    const matLobbyFlr = new THREE.MeshStandardMaterial({ color: '#c8b890' })      // marble lobby
    const matBackstage= new THREE.MeshStandardMaterial({ color: '#181210' })
    const matProp     = new THREE.MeshStandardMaterial({ color: '#554433' })

    // ── Floor ─────────────────────────────────────────────────────────────
    // Lobby (south) — marble
    const lobbyFloor = new THREE.Mesh(new THREE.PlaneGeometry(hw * 2, 16), matLobbyFlr)
    lobbyFloor.rotation.x = -Math.PI / 2; lobbyFloor.position.set(0, 0, hd - 8)
    lobbyFloor.userData.isFloor = true; group.add(lobbyFloor)
    // Audience area
    const audFloor = new THREE.Mesh(new THREE.PlaneGeometry(hw * 2, hd - ANFI_STAGE_Z - 16), matFloorAud)
    audFloor.rotation.x = -Math.PI / 2
    audFloor.position.set(0, 0, (ANFI_STAGE_Z + hd - 16) / 2)
    audFloor.userData.isFloor = true; group.add(audFloor)
    // Stage platform (raised 1.4 m)
    const stagePlatform = new THREE.Mesh(new THREE.BoxGeometry(hw * 2, 1.4, 28), matStage)
    stagePlatform.position.set(0, 0.7, ANFI_STAGE_Z - 14)
    group.add(stagePlatform)
    // Backstage floor (behind screen)
    const bsFloor = new THREE.Mesh(new THREE.PlaneGeometry(hw * 2 - 8, 16), matBackstage)
    bsFloor.rotation.x = -Math.PI / 2; bsFloor.position.set(0, 0, -hd + 8)
    bsFloor.userData.isFloor = true; group.add(bsFloor)

    // ── Walls ─────────────────────────────────────────────────────────────
    const addWall = (x, y, z, w, h, d, mat = matWall) => {
      const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat)
      m.position.set(x, y, z); group.add(m)
    }
    // East wall
    addWall(hw + wallT / 2, ANFI_H / 2, 0, wallT, ANFI_H, ANFI_D + wallT * 2)
    // West wall
    addWall(-hw - wallT / 2, ANFI_H / 2, 0, wallT, ANFI_H, ANFI_D + wallT * 2)
    // North (back/screen) wall — split into sides (screen gap in center)
    const screenW = 36; const screenH = 22
    ;[-1, 1].forEach((side) => {
      const xOff = side * (hw / 2 + screenW / 4)
      addWall(xOff, ANFI_H / 2, -hd - wallT / 2, hw - screenW / 2, ANFI_H, wallT)
    })
    // Above screen panel
    addWall(0, ANFI_H - (ANFI_H - screenH) / 2, -hd - wallT / 2, screenW, ANFI_H - screenH, wallT)
    // Below screen panel (below screen to floor)
    addWall(0, (1.5) / 2, -hd - wallT / 2, screenW, 1.5, wallT)
    // South (lobby) wall — split around entrance doorway (6 wide × 9 tall)
    ;[-1, 1].forEach((side) => {
      const xOff = side * (hw / 2 + 3)
      addWall(xOff, ANFI_H / 2, hd + wallT / 2, hw - 6, ANFI_H, wallT)
    })
    addWall(0, ANFI_H - (ANFI_H - 9) / 2, hd + wallT / 2, 12, ANFI_H - 9, wallT) // above door
    // Red accent trim strips on side walls
    ;[-hw, hw].forEach((x) => {
      for (let z = -30; z <= 30; z += 12) {
        const strip = new THREE.Mesh(new THREE.BoxGeometry(0.18, 5, 0.6), matWallRed)
        strip.position.set(x + (x > 0 ? -0.9 : 0.9), 4.5, z); group.add(strip)
      }
    })

    // ── Ceiling ───────────────────────────────────────────────────────────
    const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(hw * 2, ANFI_D), matCeiling)
    ceiling.rotation.x = Math.PI / 2; ceiling.position.set(0, ANFI_H, 0); group.add(ceiling)
    // Gold ceiling beams across width
    for (let z = -30; z <= 30; z += 10) {
      const beam = new THREE.Mesh(new THREE.BoxGeometry(hw * 2, 0.5, 0.6), matBeam)
      beam.position.set(0, ANFI_H - 0.25, z); group.add(beam)
    }
    // Longitudinal beam down center
    const cenBeam = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.6, ANFI_D), matBeam)
    cenBeam.position.set(0, ANFI_H - 0.3, 0); group.add(cenBeam)
    // Stage proscenium arch
    const archH = 16; const archW = screenW + 4
    ;[-1, 1].forEach((side) => {
      const pillar = new THREE.Mesh(new THREE.BoxGeometry(2.5, archH, wallT + 1), matGold)
      pillar.position.set(side * (archW / 2 + 1.25), archH / 2, ANFI_STAGE_Z)
      group.add(pillar)
    })
    const archTop = new THREE.Mesh(new THREE.BoxGeometry(archW + 7, 2.2, wallT + 1), matGold)
    archTop.position.set(0, archH + 1.1, ANFI_STAGE_Z); group.add(archTop)

    // ── Audience seating — 8 rows of 12 seats ────────────────────────────
    const rowZ0 = ANFI_STAGE_Z - 4  // front row just south of stage
    for (let row = 0; row < 8; row++) {
      const rz = rowZ0 + row * 4.8 + 3
      const rise = row * 0.28       // gentle rake so back rows see over front
      for (let col = -5; col <= 5; col++) {
        const sx = col * 4.2
        // Seat cushion
        const cushion = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.2, 2.2), matSeatBody)
        cushion.position.set(sx, rise + 0.9, rz); group.add(cushion)
        // Seat back
        const back = new THREE.Mesh(new THREE.BoxGeometry(3.2, 2.0, 0.28), matSeatBack)
        back.position.set(sx, rise + 1.9, rz - 1.0); group.add(back)
        // Legs
        ;[-1.2, 1.2].forEach((legX) => {
          const leg = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.85, 0.18), matSeatLeg)
          leg.position.set(sx + legX, rise + 0.42, rz); group.add(leg)
        })
      }
      // Aisle step-light strips along side walls
      const lightL = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.15, 0.5), matLight)
      lightL.position.set(-hw + 0.2, rise + 0.3, rz)
      const lightR = lightL.clone()
      lightR.position.set(hw - 0.2, rise + 0.3, rz)
      group.add(lightL); group.add(lightR)
    }

    // ── Stage-level spotlights (decorative bars on ceiling) ───────────────
    ;[-16, -8, 0, 8, 16].forEach((x) => {
      const bar = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.35, 0.4), matLight)
      bar.position.set(x, ANFI_H - 0.5, ANFI_STAGE_Z + 2); group.add(bar)
    })

    // ── Stage curtains (side wings / bambalinas) ──────────────────────────
    // The curtains separate the stage from the backstage wings on each side.
    ;[-1, 1].forEach((side) => {
      const cx = side * (hw - 4)
      // Main drop curtain (front proscenium)
      const curtFront = new THREE.Mesh(new THREE.PlaneGeometry(6, archH), matCurtain)
      curtFront.position.set(cx, archH / 2, ANFI_STAGE_Z + 0.5)
      curtFront.rotation.y = side * Math.PI / 8; group.add(curtFront)
      // Backstage wing partition wall
      const wing = new THREE.Mesh(new THREE.BoxGeometry(wallT, ANFI_H, 18), matBackstage)
      wing.position.set(side * (screenW / 2 + 1.5), ANFI_H / 2, -hd + 10)
      group.add(wing)
      // Props/equipment boxes in backstage wing
      for (let bz = -hd + 4; bz < -hd + 18; bz += 5) {
        const box = new THREE.Mesh(new THREE.BoxGeometry(4, 2.5, 3.5), matProp)
        box.position.set(side * (hw - 5), 1.25, bz); group.add(box)
      }
    })

    // ── Video screen frame on north wall ─────────────────────────────────
    // The actual YouTube iframe is handled by <Html> in AnfiteatroWorld.
    // This geometry is the physical screen frame + bezel.
    const screenFrame = new THREE.Mesh(new THREE.BoxGeometry(screenW + 1.5, screenH + 1.5, 0.3), matBeam)
    screenFrame.position.set(0, screenH / 2 + 1.5, -hd + 0.2)
    group.add(screenFrame)
    const screenSurf = new THREE.Mesh(new THREE.PlaneGeometry(screenW, screenH), matScreen)
    screenSurf.position.set(0, screenH / 2 + 1.5, -hd + 0.36)
    group.add(screenSurf)

    // ── Exterior announcement posters (on south lobby façade) ─────────────
    const matPosterBg  = new THREE.MeshStandardMaterial({ color: '#1a0822' })
    const matPosterAcc = new THREE.MeshStandardMaterial({ color: '#d4a820', emissive: '#704400', emissiveIntensity: 0.5 })
    ;[-18, -6, 6, 18].forEach((px) => {
      // Poster board
      const board = new THREE.Mesh(new THREE.BoxGeometry(8, 12, 0.25), matPosterBg)
      board.position.set(px, 7, hd + wallT + 0.12); group.add(board)
      // Gold frame
      const frame = new THREE.Mesh(new THREE.BoxGeometry(8.6, 12.6, 0.18), matPosterAcc)
      frame.position.set(px, 7, hd + wallT + 0.05); group.add(frame)
      // Gold decorative star/diamond on poster
      const star = new THREE.Mesh(new THREE.SphereGeometry(1.0, 6, 4), matPosterAcc)
      star.position.set(px, 7, hd + wallT + 0.38); group.add(star)
    })
    // Marquee sign over entrance
    const marquee = new THREE.Mesh(new THREE.BoxGeometry(hw * 2, 3.5, 0.5), matGold)
    marquee.position.set(0, ANFI_H - 1.5, hd + wallT + 0.25); group.add(marquee)
    // Lobby column pillars outside entrance
    ;[-20, -12, 12, 20].forEach((cx) => {
      const col = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.85, ANFI_H, 10), matGold)
      col.position.set(cx, ANFI_H / 2, hd + wallT + 1.5); group.add(col)
    })

    // ── Ceiling accent lights (warm house lighting) ────────────────────────
    for (let z = -20; z <= 20; z += 10) {
      for (let x = -20; x <= 20; x += 10) {
        const spot = new THREE.Mesh(new THREE.SphereGeometry(0.35, 6, 4), matLight)
        spot.position.set(x, ANFI_H - 0.4, z); group.add(spot)
      }
    }

    return { model: group, groundRayHeight: ANFI_H + 4 }
  }, [])
}

// Renders the Anfiteatro world: theater geometry + YouTube screen iframe +
// one center-stage NPC + exit portal back to campus.
function AnfiteatroWorld({ mascot, skin, keysRef, cameraRef, playerPositionRef, playerRotationRef, authorName, playerId, onNearPortalChange }) {
  const { model, groundRayHeight } = useAnfiteatroGround()
  const stageMascot = useMemo(() => getMascotById(9), [])  // director mascot on stage

  return (
    <>
      <primitive object={model} />

      {/* YouTube screen via Html overlay — centered on the north back wall */}
      <Html
        position={[0, 12.5, -39.0]}
        transform
        scale={0.052}
        distanceFactor={1}
        occlude={false}
      >
        <div style={{ width: '690px', height: '420px', background: '#000', borderRadius: 4, overflow: 'hidden', boxShadow: '0 0 40px #0044ff88' }}>
          <iframe
            width="690"
            height="420"
            src="https://www.youtube.com/embed/nKSCVzTy69U?autoplay=1&rel=0&modestbranding=1"
            title="Pantalla Anfiteatro"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={{ width: '100%', height: '100%', display: 'block' }}
          />
        </div>
      </Html>

      {/* Marquee sign text */}
      <Html position={[0, ANFI_H - 1.6, ANFI_HD + 1.8 + 0.5]} transform scale={0.06} distanceFactor={1} occlude={false}>
        <div style={{ width: '700px', textAlign: 'center', color: '#1a1020', fontWeight: 'bold', fontSize: '44px', fontFamily: 'serif', letterSpacing: 4, textShadow: '0 0 8px #0008' }}>
          🎭 ANFITEATRO OLIVER 🎭
        </div>
      </Html>

      {/* Stage NPC — slightly bigger to command the stage */}
      <group position={ANFI_STAGE_NPC_POS}>
        <group scale={NPC_SCALE * 1.45} position={[0, NPC_SCALE * 1.45 * MODEL_HALF_HEIGHT, 0]}>
          <MascotMesh mascot={stageMascot} />
        </group>
        <Html position={[0, 0.9, 0]} center distanceFactor={10}>
          <div className="pointer-events-none whitespace-nowrap rounded-full bg-surface/90 px-3 py-1 text-xs font-semibold text-text shadow-lg">
            🎬 Director de Escena
          </div>
        </Html>
      </group>

      <Player
        mascot={mascot}
        skin={skin}
        scenery={model}
        groundRayHeight={groundRayHeight}
        keysRef={keysRef}
        cameraRef={cameraRef}
        playerPositionRef={playerPositionRef}
        playerRotationRef={playerRotationRef}
        authorName={authorName}
        playerId={playerId}
        spawnAt={ANFI_SPAWN}
      />
      <Portal
        position={ANFI_EXIT_PORTAL}
        color="#d946ef"
        label="🌀 Salir al Campus"
        playerPositionRef={playerPositionRef}
        onNearbyChange={onNearPortalChange}
      />
    </>
  )
}

// ── Árbol del Mundo — geometry ────────────────────────────────────────────────
function useWorldTreeGround() {
  return useMemo(() => {
    const g = new THREE.Group()

    // Ground — dark earth circle (emissive so it's visible without light)
    const ground = new THREE.Mesh(
      new THREE.CircleGeometry(50, 72),
      new THREE.MeshStandardMaterial({ color: '#1a3a0c', roughness: 0.85, emissive: '#0a1e06', emissiveIntensity: 0.4 })
    )
    ground.rotation.x = -Math.PI / 2
    ground.userData.isFloor = true
    g.add(ground)

    // Outer ring path (lighter dirt)
    const ringPath = new THREE.Mesh(
      new THREE.RingGeometry(10, 14, 72),
      new THREE.MeshStandardMaterial({ color: '#2a4a12', roughness: 0.9, emissive: '#142408', emissiveIntensity: 0.3 })
    )
    ringPath.rotation.x = -Math.PI / 2
    ringPath.position.y = 0.01
    g.add(ringPath)

    // ─── Trunk ───────────────────────────────────────────────────────────
    const trunkMat = new THREE.MeshStandardMaterial({ color: '#4a2010', roughness: 0.85, emissive: '#1a0a04', emissiveIntensity: 0.2 })
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 2.4, 16, 14), trunkMat)
    trunk.position.set(0, 8, 0)
    g.add(trunk)

    // Large root buttresses
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2
      const root = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.8, 4, 6), trunkMat)
      root.position.set(Math.sin(a) * 2.5, 1.8, Math.cos(a) * 2.5)
      root.rotation.z = -a * 0.4
      root.rotation.x = 0.4
      g.add(root)
    }

    // ─── Main branches (5, one per class) ────────────────────────────────
    const branchColors = ['#22c55e', '#3b82f6', '#a855f7', '#f97316', '#eab308']
    const classIds = Object.keys(WT_CLASS_NODES)

    classIds.forEach((cid, i) => {
      const node = WT_CLASS_NODES[cid]
      const [nx, , nz] = node.pos
      const dist = Math.sqrt(nx * nx + nz * nz)
      const angle = Math.atan2(nx, nz)
      const branchMat = new THREE.MeshStandardMaterial({ color: '#1e0a02', roughness: 0.85 })

      // Diagonal branch from canopy level to node sphere position
      const length = Math.sqrt(dist * dist + (node.pos[1] + 12) ** 2) * 0.7
      const branch = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.4, length, 6), branchMat)
      const midX = nx * 0.55
      const midY = 13 + node.pos[1] * 0.3
      const midZ = nz * 0.55
      branch.position.set(midX, midY, midZ)
      branch.rotation.z = -angle
      branch.rotation.x = Math.atan2(Math.sqrt(nx * nx + nz * nz), 12) * 0.5
      branch.rotation.y = angle
      g.add(branch)

      // Leaf cluster (simple flat cone) at branch tip
      const leafMat = new THREE.MeshStandardMaterial({
        color: branchColors[i],
        emissive: branchColors[i],
        emissiveIntensity: 0.25,
        transparent: true,
        opacity: 0.7,
        roughness: 0.8,
      })
      const leafCluster = new THREE.Mesh(new THREE.SphereGeometry(1.8, 10, 8), leafMat)
      leafCluster.position.set(nx * 0.9, node.pos[1] + 15, nz * 0.9)
      g.add(leafCluster)

      // Glowing class node sphere
      const nodeMat = new THREE.MeshStandardMaterial({
        color: node.color,
        emissive: node.color,
        emissiveIntensity: 0.9,
        roughness: 0.1,
        metalness: 0.2,
      })
      const nodeSphere = new THREE.Mesh(new THREE.SphereGeometry(1.0, 20, 16), nodeMat)
      nodeSphere.position.set(nx, node.pos[1], nz)
      nodeSphere.name = `wt-node-${cid}`
      g.add(nodeSphere)

      // Hovering rune ring below sphere
      const runeMat = new THREE.MeshStandardMaterial({
        color: node.color,
        emissive: node.color,
        emissiveIntensity: 0.6,
        transparent: true,
        opacity: 0.5,
        roughness: 0.2,
      })
      const rune = new THREE.Mesh(new THREE.TorusGeometry(1.6, 0.08, 8, 40), runeMat)
      rune.position.set(nx, 0.08, nz)
      rune.rotation.x = -Math.PI / 2
      g.add(rune)

      // Point light per node
      const light = new THREE.PointLight(node.color, 1.2, 14)
      light.position.set(nx, node.pos[1] + 1, nz)
      g.add(light)
    })

    // Canopy sphere (top of tree)
    const canopyMat = new THREE.MeshStandardMaterial({
      color: '#0f2a06',
      emissive: '#1a4a0a',
      emissiveIntensity: 0.15,
      roughness: 0.85,
    })
    const canopy = new THREE.Mesh(new THREE.SphereGeometry(5, 14, 10), canopyMat)
    canopy.position.set(0, 18, 0)
    g.add(canopy)

    // Central glow ring at base of trunk
    const glowMat = new THREE.MeshStandardMaterial({
      color: '#ffffff',
      emissive: '#88ffaa',
      emissiveIntensity: 0.8,
      transparent: true,
      opacity: 0.25,
    })
    const glowRing = new THREE.Mesh(new THREE.TorusGeometry(2.6, 0.12, 8, 48), glowMat)
    glowRing.rotation.x = -Math.PI / 2
    glowRing.position.y = 0.05
    g.add(glowRing)

    return { model: g, groundRayHeight: 6 }
  }, [])
}

// Renders El Árbol del Mundo: the class selection hub.
function WorldTreeWorld({ mascot, skin, keysRef, cameraRef, playerPositionRef, playerRotationRef, authorName, playerId, onNearPortalChange, onNearClassNodeChange }) {
  const { model, groundRayHeight } = useWorldTreeGround()

  // Animate node spheres bobbing and rune rings rotating each frame
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    model.traverse((child) => {
      if (child.name?.startsWith('wt-node-')) {
        const cid = child.name.replace('wt-node-', '')
        const node = WT_CLASS_NODES[cid]
        if (node) child.position.y = node.pos[1] + Math.sin(t * 1.2 + Object.keys(WT_CLASS_NODES).indexOf(cid)) * 0.3
      }
    })
  })

  // Detect player proximity to class nodes
  useFrame(() => {
    const pos = playerPositionRef?.current
    if (!pos) return
    let nearest = null
    let nearestDist = 4.5
    for (const [cid, node] of Object.entries(WT_CLASS_NODES)) {
      const dx = pos.x - node.pos[0]
      const dz = pos.z - node.pos[2]
      const d = Math.sqrt(dx * dx + dz * dz)
      if (d < nearestDist) { nearestDist = d; nearest = cid }
    }
    onNearClassNodeChange?.(nearest)
  })

  return (
    <>
      <primitive object={model} />
      <Player
        mascot={mascot}
        skin={skin}
        scenery={model}
        groundRayHeight={groundRayHeight}
        keysRef={keysRef}
        cameraRef={cameraRef}
        playerPositionRef={playerPositionRef}
        playerRotationRef={playerRotationRef}
        spawnAt={WT_SPAWN}
        authorName={authorName}
        playerId={playerId}
      />
      <Portal
        position={WT_EXIT_PORTAL}
        color="#22c55e"
        label="🌀 Volver al Campus"
        playerPositionRef={playerPositionRef}
        onNearbyChange={onNearPortalChange}
      />
    </>
  )
}

// ── Voice chat ────────────────────────────────────────────────────────────────
// Captures local mic and broadcasts mute/active state. The VoicePanel
// component renders a mic toggle button and a list of speaking players.
function useVoiceChat({ playerId, name, channelRef }) {
  const [micActive, setMicActive] = useState(false)
  const [speaking, setSpeaking] = useState({}) // playerId -> name
  const [micError, setMicError] = useState(null)
  const streamRef  = useRef(null)

  // Activate / deactivate mic
  const toggleMic = useCallback(async () => {
    const ch = channelRef?.current
    if (micActive) {
      streamRef.current?.getTracks().forEach((t) => t.stop())
      streamRef.current = null
      setMicActive(false)
      useVrSettingsStore.getState().setMicEnabled(false)
      ch?.send({ type: 'broadcast', event: 'voice', payload: { id: playerId, name, active: false } })
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false })
        streamRef.current = stream
        setMicActive(true)
        setMicError(null)
        useVrSettingsStore.getState().setMicEnabled(true)
        ch?.send({ type: 'broadcast', event: 'voice', payload: { id: playerId, name, active: true } })
      } catch (err) {
        setMicError('Sin acceso al micrófono: ' + (err?.message ?? err))
      }
    }
  }, [micActive, playerId, name, channelRef])

  // Listen for other players' voice state via channel
  useEffect(() => {
    const ch = channelRef?.current
    if (!ch) return
    const handler = (msg) => {
      if (msg.event !== 'voice') return
      const { id, name: n, active } = msg.payload ?? {}
      if (!id) return
      setSpeaking((prev) => {
        if (active) return { ...prev, [id]: n }
        const next = { ...prev }; delete next[id]; return next
      })
    }
    ch.on('broadcast', { event: 'voice' }, handler)
  }, [channelRef])

  // Clean up on unmount
  useEffect(() => () => {
    streamRef.current?.getTracks().forEach((t) => t.stop())
  }, [])

  return { micActive, speaking, micError, toggleMic }
}

// Mic toggle button + speaking player list, shown in the VR HUD.
function VoicePanel({ playerId, name, channelRef }) {
  const { micActive, speaking, micError, toggleMic } = useVoiceChat({ playerId, name, channelRef })
  const [open, setOpen] = useState(false)
  const speakingList = Object.values(speaking)

  return (
    <div className="absolute left-4 top-14 z-20 flex flex-col items-start gap-2">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={[
          'rounded-full px-3 py-1.5 text-xs font-semibold shadow-lg backdrop-blur transition-colors',
          micActive
            ? 'bg-green-500/90 text-white animate-pulse'
            : 'bg-surface/90 text-text hover:bg-primary/30',
        ].join(' ')}
      >
        {micActive ? '🎤 Hablando' : '🎙️ Voz'}
      </button>
      {open && (
        <div className="w-56 rounded-xl border border-border bg-surface/95 p-3 text-xs text-text shadow-xl backdrop-blur">
          <p className="mb-2 font-semibold">Chat de voz</p>
          <button
            type="button"
            onClick={toggleMic}
            className={[
              'mb-2 w-full rounded-lg px-3 py-2 font-semibold transition-colors',
              micActive
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-primary text-background hover:bg-primary-hover',
            ].join(' ')}
          >
            {micActive ? '🔴 Desactivar micrófono' : '🎙️ Activar micrófono'}
          </button>
          {micError && <p className="mb-2 text-red-400">{micError}</p>}
          <p className="mb-1 text-text-muted">Hablando ahora:</p>
          {speakingList.length > 0 ? (
            speakingList.map((n) => (
              <p key={n} className="flex items-center gap-1 text-green-400">
                <span className="animate-pulse">🔊</span> {n}
              </p>
            ))
          ) : (
            <p className="text-text-muted italic">Nadie está hablando</p>
          )}
          <p className="mt-2 text-[10px] text-text-muted">
            El audio de voz viaja directamente entre navegadores.
          </p>
        </div>
      )}
    </div>
  )
}

// Casts a ray straight down from above the given x/z to find the scenery
// height directly beneath the player. Falls back to y = 0 if nothing is hit
// (e.g. the player walked off the edge of the model). Falls back to y = 0 if nothing is hit
// (e.g. the player walked off the edge of the model).
function getGroundY(raycaster, scenery, groundRayHeight, x, z) {
  raycaster.set(new THREE.Vector3(x, groundRayHeight, z), DOWN)
  const hits = raycaster.intersectObject(scenery, true)
  const hit = hits.find(h => h.object.userData.isFloor)
  return hit ? hit.point.y : 0
}

// Casts a ray from the player's chest in a horizontal direction to check for
// walls/objects in the way. Returns true if movement of `distance` along
// `direction` would walk into something.
function isBlocked(raycaster, scenery, origin, direction, distance) {
  if (distance <= 0) return false
  raycaster.set(origin, direction)
  const hits = raycaster.intersectObject(scenery, true)
  return hits.length > 0 && hits[0].distance < COLLISION_RADIUS + distance
}

const DOWN = new THREE.Vector3(0, -1, 0)
const AXIS_X = new THREE.Vector3(1, 0, 0)
const AXIS_Z = new THREE.Vector3(0, 0, 1)

const clamp = (value, min, max) => Math.min(max, Math.max(min, value))

// Polls the first connected gamepad (Xbox controller or anything else the
// browser maps to the standard layout) and applies its right stick / bumpers
// directly to the camera, returning the left stick as a movement input (or
// null if no gamepad is connected). Called once per frame from <Player>.
function applyGamepadInput(delta, cameraRef) {
  if (typeof navigator === 'undefined' || !navigator.getGamepads) return null
  const pads = navigator.getGamepads()
  if (!pads) return null
  let pad = null
  for (let i = 0; i < pads.length; i += 1) {
    if (pads[i]?.connected) {
      pad = pads[i]
      break
    }
  }
  if (!pad) return null

  const axis = (v) => (Math.abs(v) < GAMEPAD_DEADZONE ? 0 : v)
  let moveX = axis(pad.axes[0] ?? 0)
  let moveY = axis(pad.axes[1] ?? 0)
  const lookX = axis(pad.axes[2] ?? 0)
  const lookY = axis(pad.axes[3] ?? 0)

  // Fall back to the D-pad (buttons 12-15) when the analog stick is centered
  // — some controllers/browsers report the D-pad as buttons rather than a
  // hat axis, so this lets movement work even if the left stick doesn't.
  if (!moveX && !moveY) {
    if (pad.buttons[14]?.pressed) moveX -= 1
    if (pad.buttons[15]?.pressed) moveX += 1
    if (pad.buttons[12]?.pressed) moveY -= 1
    if (pad.buttons[13]?.pressed) moveY += 1
  }

  const cam = cameraRef.current
  if (lookX || lookY) {
    const [pitchMin, pitchMax] = getPitchRange(useVrSettingsStore.getState().cameraMode)
    cam.yaw -= lookX * GAMEPAD_LOOK_SPEED * delta
    cam.pitch = clamp(cam.pitch + lookY * GAMEPAD_LOOK_SPEED * delta, pitchMin, pitchMax)
  }

  // LB zooms in, RB zooms out.
  if (pad.buttons[4]?.pressed || pad.buttons[5]?.pressed) {
    const { zoomMin, zoomMax } = useVrSettingsStore.getState()
    if (pad.buttons[4]?.pressed) {
      cam.targetDistance = clamp(cam.targetDistance - GAMEPAD_ZOOM_SPEED * delta, zoomMin, zoomMax)
    }
    if (pad.buttons[5]?.pressed) {
      cam.targetDistance = clamp(cam.targetDistance + GAMEPAD_ZOOM_SPEED * delta, zoomMin, zoomMax)
    }
  }

  // A button (index 0) jumps, same as space/the touch jump button.
  return { moveX, moveY, jump: pad.buttons[0]?.pressed ?? false }
}

// Deterministically turns a player/connection id into a pastel HSL color, so
// each player's chat bubble has a consistent, distinguishable color.
function colorFromId(id) {
  if (!id) return '#ffffff'
  let hash = 0
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0
  }
  const hue = hash % 360
  return `hsl(${hue}, 85%, 88%)`
}

// Watches the world chat log for the latest message sent by the connection
// identified by `matchId` (the local player's `playerId`, or a remote
// player's presence id) and returns the (up to MAX_STACKED_BUBBLES) most
// recent ones so they can be rendered as floating speech bubbles stacked
// above their head, Habbo-style. Each bubble expires independently after
// CHAT_BUBBLE_DURATION, so several messages sent in quick succession stack
// instead of replacing each other.
// Matching by connection id (instead of display name) avoids bubbles
// appearing above the wrong avatar when two players share a display name.
function useChatBubbles(matchId) {
  const messages = useWorldChatStore((s) => s.messages)
  const [bubbles, setBubbles] = useState([])
  const shownIdRef = useRef(null)

  useEffect(() => {
    const last = messages[messages.length - 1]
    if (
      !last ||
      !matchId ||
      last.system ||
      last.whisperTo ||
      last.whisperFrom ||
      last.authorId !== matchId ||
      last.id === shownIdRef.current
    ) {
      return
    }
    shownIdRef.current = last.id
    setBubbles((current) => [...current, { id: last.id, text: last.text }].slice(-MAX_STACKED_BUBBLES))
    const timer = setTimeout(() => {
      setBubbles((current) => current.filter((b) => b.id !== last.id))
    }, CHAT_BUBBLE_DURATION)
    return () => clearTimeout(timer)
  }, [messages, matchId])

  return bubbles
}

// Renders a stack of speech bubbles above a head, oldest on top and newest
// closest to the head, each offset by BUBBLE_STACK_SPACING.
function BubbleStack({ bubbles, baseY, color }) {
  return bubbles.map((b, i) => (
    <ChatBubble
      key={b.id}
      text={b.text}
      y={baseY + (bubbles.length - 1 - i) * BUBBLE_STACK_SPACING}
      color={color}
    />
  ))
}

// Habbo-style floating speech bubble shown above a player's head for a few
// seconds after they send a world chat message. `color` tints the bubble so
// each player's speech is visually distinct.
function ChatBubble({ text, y, color = '#ffffff' }) {
  return (
    <Html position={[0, y, 0]} center distanceFactor={10} style={{ pointerEvents: 'none' }}>
      <div
        className="max-w-[22rem] whitespace-normal break-words rounded-2xl rounded-bl-sm px-4 py-2 text-center text-[0.75rem] font-semibold leading-relaxed tracking-wide text-gray-900 shadow-xl"
        style={{ backgroundColor: color, minWidth: '7rem' }}
      >
        {text}
      </div>
    </Html>
  )
}

// Humanoid avatar body for the local player and remote players.
// Renders using simple Three.js primitives — head/torso/legs — colored by
// the player's chosen avatar from PLAYER_AVATARS. Symmetric around y=0 so it
// slots into the same mesh group as MascotMesh (which is also centered at y=0).
function PlayerAvatarBody({ avatarId }) {
  const avatar = PLAYER_AVATARS.find((a) => a.id === avatarId) || PLAYER_AVATARS[0]
  const color = avatar.color
  return (
    <group>
      {/* Head */}
      <mesh position={[0, 0.72, 0]}>
        <sphereGeometry args={[0.22, 8, 6]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {/* Torso */}
      <mesh position={[0, 0.22, 0]}>
        <cylinderGeometry args={[0.2, 0.22, 0.5, 8]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {/* Hips */}
      <mesh position={[0, -0.07, 0]}>
        <cylinderGeometry args={[0.22, 0.18, 0.15, 8]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {/* Left leg */}
      <mesh position={[-0.12, -0.5, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 0.65, 6]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {/* Right leg */}
      <mesh position={[0.12, -0.5, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 0.65, 6]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </group>
  )
}

// Your mascot, moved with WASD/arrow keys or the touch D-pad. It bobs and
// tilts while walking, can jump, sits on the scenery's real ground height,
// and can't walk through scenery geometry — all via raycasts against the
// shared `scenery` model.
function Player({
  mascot,
  skin,
  scenery,
  groundRayHeight,
  keysRef,
  cameraRef,
  playerPositionRef,
  playerRotationRef,
  authorName,
  playerId,
  spawnAt,
}) {
  const group = useRef()
  const meshGroup = useRef()
  const { camera } = useThree()
  const cameraTarget = useRef(new THREE.Vector3())
  const walkCycle = useRef(0)
  const velocityY = useRef(0)
  const velocityXZ = useRef(new THREE.Vector3())
  const raycaster = useMemo(() => new THREE.Raycaster(), [])
  const initialized = useRef(false)
  const camCollisionDistance = useRef(Infinity)
  const camCollisionFrame = useRef(0)
  const cameraMode = useVrSettingsStore((s) => s.cameraMode)
  const fov = useVrSettingsStore((s) => s.fov)
  const noClip = useVrSettingsStore((s) => s.noClip)
  const avatarId = useGameStore((s) => s.player.avatarId)

  // Applies the player's FOV setting (used by both first- and third-person
  // modes) whenever it changes, instead of the Canvas's hardcoded default.
  useEffect(() => {
    if (camera.fov === fov) return
    camera.fov = fov
    camera.updateProjectionMatrix()
  }, [camera, fov])

  useFrame((_, delta) => {
    if (!group.current) return
    const keys = keysRef.current
    const pos = group.current.position

    // Shares the player's live position with NPC proximity checks (see
    // <NpcProximityTracker>). `pos` is the same Vector3 instance every
    // frame, mutated in place, so this only needs to run once.
    if (playerPositionRef && !playerPositionRef.current) {
      playerPositionRef.current = pos
    }

    // Drop the player onto the real scenery surface the first time we run.
    // If spawnAt is provided (e.g. room mode), teleport x/z first so the
    // player starts inside the room rather than at world origin.
    if (!initialized.current) {
      if (spawnAt) { pos.x = spawnAt[0]; pos.z = spawnAt[2] }
      pos.y = getGroundY(raycaster, scenery, groundRayHeight, pos.x, pos.z)
      initialized.current = true
    }

    // Gamepad (Xbox controller etc.) input: right stick/bumpers are applied
    // straight to the camera inside this helper; the left stick comes back
    // as a movement vector we fold in below alongside WASD/touch.
    const gamepad = applyGamepadInput(delta, cameraRef)

    // Movement is relative to the camera: "forward" is always away from the
    // camera and "right" is always to the player's screen-right, regardless
    // of which way the player model is currently facing. This is what makes
    // WASD feel like a normal 3rd-person game instead of fixed world axes.
    const { yaw } = cameraRef.current
    const forward = new THREE.Vector3(-Math.sin(yaw), 0, -Math.cos(yaw))
    const right = new THREE.Vector3(Math.cos(yaw), 0, -Math.sin(yaw))

    const input = new THREE.Vector3()
    if (keys['w'] || keys['arrowup']) input.add(forward)
    if (keys['s'] || keys['arrowdown']) input.sub(forward)
    if (keys['d'] || keys['arrowright']) input.add(right)
    if (keys['a'] || keys['arrowleft']) input.sub(right)
    if (gamepad) {
      input.addScaledVector(right, gamepad.moveX)
      input.addScaledVector(forward, -gamepad.moveY)
    }

    const inputLength = input.length()
    const isMoving = inputLength > 0.001
    if (isMoving) input.normalize().multiplyScalar(MOVE_SPEED * Math.min(1, inputLength))

    // Smoothly accelerate/decelerate toward the target velocity instead of
    // snapping instantly to full speed (or to a dead stop).
    const accel = 1 - Math.exp(-MOVE_ACCEL * delta)
    velocityXZ.current.lerp(input, accel)

    let stepX = velocityXZ.current.x * delta
    let stepZ = velocityXZ.current.z * delta

    if (stepX !== 0 || stepZ !== 0) {
      // Chest-height origin for wall checks, at the player's current spot.
      const chestY = pos.y + PLAYER_HEIGHT * 0.6
      const originX = new THREE.Vector3(pos.x, chestY, pos.z)
      const originZ = new THREE.Vector3(pos.x, chestY, pos.z)

      // Resolve each axis separately so the player can slide along walls
      // instead of getting stuck the moment one axis is blocked.
      // noClip skips all collision so the player can walk through walls.
      if (!noClip) {
        if (stepX !== 0) {
          const dir = stepX > 0 ? AXIS_X : AXIS_X.clone().negate()
          if (isBlocked(raycaster, scenery, originX, dir, Math.abs(stepX))) {
            stepX = 0
            velocityXZ.current.x = 0
          }
        }
        if (stepZ !== 0) {
          const dir = stepZ > 0 ? AXIS_Z : AXIS_Z.clone().negate()
          if (isBlocked(raycaster, scenery, originZ, dir, Math.abs(stepZ))) {
            stepZ = 0
            velocityXZ.current.z = 0
          }
        }
      }

      if (stepX !== 0 || stepZ !== 0) {
        pos.x += stepX
        pos.z += stepZ

        const targetAngle = Math.atan2(velocityXZ.current.x, velocityXZ.current.z)
        let angleDiff = targetAngle - group.current.rotation.y
        angleDiff = Math.atan2(Math.sin(angleDiff), Math.cos(angleDiff))
        group.current.rotation.y += angleDiff * Math.min(1, TURN_SPEED * delta)

        walkCycle.current += delta * WALK_CYCLE_SPEED
      } else {
        walkCycle.current = 0
      }
    } else {
      walkCycle.current = 0
    }

    // Jump + gravity, relative to the scenery's real ground height beneath
    // the player's (possibly new) x/z position.
    const groundY = getGroundY(raycaster, scenery, groundRayHeight, pos.x, pos.z)
    if (pos.y <= groundY) {
      pos.y = groundY
      velocityY.current = 0
      if (keys[' '] || keys['spacebar'] || gamepad?.jump) {
        velocityY.current = JUMP_SPEED
      }
    }
    velocityY.current += GRAVITY * delta
    pos.y += velocityY.current * delta

    if (meshGroup.current) {
      const bob = isMoving ? Math.abs(Math.sin(walkCycle.current)) * WALK_BOB_HEIGHT : 0
      const tilt = isMoving ? Math.sin(walkCycle.current) * WALK_TILT : 0
      meshGroup.current.position.y = bob + PLAYER_SCALE * MODEL_HALF_HEIGHT
      meshGroup.current.rotation.z = tilt
      meshGroup.current.rotation.x = isMoving ? WALK_TILT * 0.6 : 0
    }

    // Camera orbits around the player based on mouse/touch drag (yaw + pitch)
    // and zooms in/out with the mouse wheel or a two-finger pinch (distance).
    // The distance itself eases toward its target so zoom changes glide
    // smoothly instead of snapping, and the camera follow uses delta-based
    // smoothing so it feels consistent regardless of frame rate.
    const cam = cameraRef.current
    cam.distance += (cam.targetDistance - cam.distance) * Math.min(1, ZOOM_SMOOTHING * delta)
    // Re-clamp every frame (not just on input) so switching camera mode from
    // the "📷 Cámara" menu immediately respects the new mode's pitch range,
    // even without the player touching the mouse again.
    const [pitchMin, pitchMax] = getPitchRange(cameraMode)
    cam.pitch = clamp(cam.pitch, pitchMin, pitchMax)
    const { pitch, distance } = cam
    const { cameraHeight, zoomMin } = useVrSettingsStore.getState()

    if (cameraMode === 'first') {
      // First-person: the camera sits at the player's eye height and looks
      // exactly where yaw/pitch point — no orbit distance, no wall pull-in,
      // and the player's own model is hidden so it doesn't block the view.
      if (meshGroup.current) meshGroup.current.visible = false
      cameraTarget.current.set(pos.x, pos.y + FIRST_PERSON_EYE_HEIGHT, pos.z)
      camera.position.copy(cameraTarget.current)
      const lookDir = new THREE.Vector3(
        -Math.sin(yaw) * Math.cos(pitch),
        -Math.sin(pitch),
        -Math.cos(yaw) * Math.cos(pitch),
      )
      camera.lookAt(
        cameraTarget.current.x + lookDir.x,
        cameraTarget.current.y + lookDir.y,
        cameraTarget.current.z + lookDir.z,
      )
    } else {
      if (meshGroup.current) meshGroup.current.visible = true

      // If a building/wall sits between the player and the desired camera
      // spot, pull the camera in to just short of it instead of letting it
      // clip through — otherwise the player's mascot (and any NPC behind it)
      // would be hidden inside the campus geometry.
      const camDir = new THREE.Vector3(
        Math.sin(yaw) * Math.cos(pitch),
        Math.sin(pitch),
        Math.cos(yaw) * Math.cos(pitch),
      )
      // This raycast walks the entire scenery hierarchy (ground, walls, every
      // NPC building/roof), so it's only re-cast every few frames — the
      // camera-pull-in result barely changes frame-to-frame and the cached
      // value is reused in between to keep the render loop cheap.
      camCollisionFrame.current += 1
      if (camCollisionFrame.current % 3 === 0) {
        const camOrigin = new THREE.Vector3(pos.x, pos.y + PLAYER_HEIGHT * 0.6 + cameraHeight * 0.3, pos.z)
        raycaster.set(camOrigin, camDir)
        // Ignore the flat ground/plaza here — they shouldn't pull the camera in
        // when looking down or zooming out, only real obstacles (walls,
        // buildings) should.
        const camHits = raycaster.intersectObject(scenery, true).filter((hit) => !hit.object.userData?.isFloor)
        camCollisionDistance.current = camHits.length > 0 ? camHits[0].distance : Infinity
      }
      const effectiveDistance =
        camCollisionDistance.current < distance
          ? Math.max(camCollisionDistance.current - CAMERA_COLLISION_MARGIN, zoomMin * 0.5)
          : distance

      const offset = new THREE.Vector3(
        effectiveDistance * Math.sin(yaw) * Math.cos(pitch),
        cameraHeight + effectiveDistance * Math.sin(pitch),
        effectiveDistance * Math.cos(yaw) * Math.cos(pitch),
      )
      cameraTarget.current.copy(group.current.position).add(offset)
      camera.position.lerp(cameraTarget.current, 1 - Math.exp(-CAMERA_SMOOTHING * delta))
      // Looking up (pitch > 0) lifts the look-at target too, so tilting up
      // while zoomed out actually frames building tops instead of just
      // moving the camera further away while still aiming near the player's
      // feet.
      const lookLift = Math.max(0, pitch) * effectiveDistance * 0.6
      camera.lookAt(
        group.current.position.x,
        group.current.position.y + 0.6 + lookLift,
        group.current.position.z,
      )
    }

    // Shares the player's facing direction with the multiplayer broadcast
    // (see useVrMultiplayer), same pattern as playerPositionRef above.
    if (playerRotationRef) {
      playerRotationRef.current = group.current.rotation.y
    }
  })

  const bubbles = useChatBubbles(playerId)

  return (
    <group ref={group}>
      <group ref={meshGroup} scale={PLAYER_SCALE}>
        <PlayerAvatarBody avatarId={avatarId} />
        {/* Mascot companion walks slightly to the side */}
        <group position={[1.2, 0, 0]} scale={0.65}>
          <MascotMesh mascot={mascot} skin={skin} />
        </group>
      </group>
      <BubbleStack bubbles={bubbles} baseY={PLAYER_HEIGHT + 1.1} color={colorFromId(playerId)} />
    </group>
  )
}

// Loads the real city model and renders it alongside the player, which needs
// the same model instance to raycast against for ground height/collisions.
function CityWorld({ mascot, skin, keysRef, cameraRef, playerPositionRef, playerRotationRef, authorName, playerId }) {
  const { model, groundRayHeight } = useSceneryModel()

  return (
    <>
      <primitive object={model} />
      <Player
        mascot={mascot}
        skin={skin}
        scenery={model}
        groundRayHeight={groundRayHeight}
        keysRef={keysRef}
        cameraRef={cameraRef}
        playerPositionRef={playerPositionRef}
        playerRotationRef={playerRotationRef}
        authorName={authorName}
        playerId={playerId}
      />
    </>
  )
}

// Same as <CityWorld>, but walking on the procedural test ground instead of
// the real city model (see USE_TEST_SCENERY).
function TestWorld({ mascot, skin, keysRef, cameraRef, playerPositionRef, playerRotationRef, authorName, playerId }) {
  const { model, groundRayHeight } = useTestGround()

  return (
    <>
      <primitive object={model} />
      <Player
        mascot={mascot}
        skin={skin}
        scenery={model}
        groundRayHeight={groundRayHeight}
        keysRef={keysRef}
        cameraRef={cameraRef}
        playerPositionRef={playerPositionRef}
        playerRotationRef={playerRotationRef}
        authorName={authorName}
        playerId={playerId}
      />
    </>
  )
}

// Renders one of our real mascot/mage models as an NPC, with a floating
// name tag above its head. Falls back to a simple colored marker if the NPC
// has no mascotId (shouldn't happen, but keeps things from disappearing
// silently if the registry entry is incomplete).
function VrNpc({ npc, playerPositionRef }) {
  const mascot = getMascotById(npc.mascotId)
  // Face the central plaza, so every NPC looks "inward" toward the player's
  // spawn point instead of all facing the same world direction.
  const facing = Math.atan2(-npc.position[0], -npc.position[2])
  const npcPos = useMemo(() => new THREE.Vector3(...npc.position), [npc.position])

  // Start far so every NPC spawns as its cheap marker; <Player> writes the
  // real position into playerPositionRef on its first frame, and the check
  // below promotes nearby NPCs to their full model shortly after.
  const [near, setNear] = useState(false)

  useFrame(() => {
    const pos = playerPositionRef?.current
    if (!pos) return
    const shouldBeNear = pos.distanceTo(npcPos) <= NPC_DETAIL_RADIUS
    if (shouldBeNear !== near) setNear(shouldBeNear)
  })

  return (
    <group position={npc.position} rotation={[0, facing, 0]}>
      {near && mascot ? (
        <Suspense
          fallback={
            <mesh position={[0, 0.6, 0]}>
              <cylinderGeometry args={[0.18, 0.24, 1.2, 12]} />
              <meshStandardMaterial color={npc.color} />
            </mesh>
          }
        >
          <group scale={NPC_SCALE} position={[0, NPC_SCALE * MODEL_HALF_HEIGHT, 0]}>
            <MascotMesh mascot={mascot} />
          </group>
        </Suspense>
      ) : (
        <mesh position={[0, 0.6, 0]}>
          <cylinderGeometry args={[0.18, 0.24, 1.2, 12]} />
          <meshStandardMaterial color={npc.color} />
        </mesh>
      )}
      {near && (
        <Html position={[0, 2.1, 0]} center distanceFactor={10}>
          <div className="pointer-events-none whitespace-nowrap rounded-full bg-surface/90 px-3 py-1 text-xs font-semibold text-text shadow-lg">
            {npc.emoji} {npc.name}
          </div>
        </Html>
      )}
    </group>
  )
}

// Generic "always-present" idle NPC (independent of SIMPLE_MODE/missions)
// that stands at `config.position` and periodically says something as a
// floating speech bubble — used for Oliver, Albert Einstein, and any future
// "NPC of the week".
//
// When the account has a real DeepSeek/Minimax API key configured (see
// useSettingsStore), each line is generated live via sendNpcMessage using
// `config.aiPrompt` as the NPC's personality, so it feels "alive". If no key
// is configured, the API call errors, or `config.aiPrompt` is missing, it
// falls back to cycling through `config.lines`.
function IdleNpc({ config }) {
  const mascot = useMemo(() => getMascotById(config.mascotId), [config.mascotId])
  const [bubbles, setBubbles] = useState([])
  const lineIndexRef = useRef(0)
  const bubbleIdRef = useRef(1)

  useEffect(() => {
    let cancelled = false

    const nextLine = async () => {
      if (config.aiPrompt) {
        const { minimaxApiKey, deepseekApiKey, chatModel } = useSettingsStore.getState()
        const provider = getModelProvider(chatModel)
        const apiKey = provider === 'deepseek' ? deepseekApiKey : minimaxApiKey
        if (apiKey && !apiKey.startsWith('mx-mock')) {
          try {
            const reply = await sendNpcMessage({
              npcPrompt: config.aiPrompt,
              content:
                'Comenta algo breve, espontáneo y en personaje para los estudiantes que pasan cerca (una sola frase corta).',
            })
            if (reply) return reply.trim()
          } catch {
            // Fall back to a static line below on any API error.
          }
        }
      }
      const text = config.lines[lineIndexRef.current % config.lines.length]
      lineIndexRef.current += 1
      return text
    }

    const speakText = (text) => {
      if (!useVrSettingsStore.getState().npcVoice) return
      if (!window.speechSynthesis) return
      // Strip emoji for cleaner TTS
      const clean = text.replace(/[\u{1F300}-\u{1FFFF}]/gu, '').replace(/[^\w\s.,!?¿¡]/g, '').trim()
      if (!clean) return
      window.speechSynthesis.cancel()
      const utt = new SpeechSynthesisUtterance(clean)
      utt.lang = 'es-ES'
      utt.rate = 0.95
      utt.pitch = 1.1
      window.speechSynthesis.speak(utt)
    }

    const tick = async () => {
      const text = await nextLine()
      if (cancelled) return
      const id = bubbleIdRef.current++
      setBubbles((current) => [...current, { id, text }].slice(-MAX_STACKED_BUBBLES))
      speakText(text)
      setTimeout(() => {
        if (cancelled) return
        setBubbles((current) => current.filter((b) => b.id !== id))
      }, CHAT_BUBBLE_DURATION)
    }

    tick()
    const interval = setInterval(tick, config.intervalMs)
    return () => {
      cancelled = true
      clearInterval(interval)
      window.speechSynthesis?.cancel()
    }
  }, [config])

  return (
    <group position={config.position}>
      <group scale={NPC_SCALE} position={[0, NPC_SCALE * MODEL_HALF_HEIGHT, 0]}>
        <MascotMesh mascot={mascot} />
      </group>
      <Html position={[0, PLAYER_HEIGHT + 0.5, 0]} center distanceFactor={10}>
        <div className="pointer-events-none whitespace-nowrap rounded-full bg-surface/90 px-3 py-1 text-xs font-semibold text-text shadow-lg">
          {config.emoji} {config.name}
        </div>
      </Html>
      <BubbleStack bubbles={bubbles} baseY={PLAYER_HEIGHT + 1.1} color={config.bubbleColor} />
    </group>
  )
}

// Background "wandering cat" that walks a fixed patrol loop, just to give
// the test ground some life. Purely decorative — no collision, no missions.
function WanderingCat({ path }) {
  const group = useRef()
  const targetIndex = useRef(1)
  const mascot = useMemo(() => getMascotById(8), [])

  useFrame((_, delta) => {
    const node = group.current
    if (!node) return

    const target = path[targetIndex.current]
    const dx = target[0] - node.position.x
    const dz = target[2] - node.position.z
    const dist = Math.hypot(dx, dz)

    if (dist < 0.15) {
      targetIndex.current = (targetIndex.current + 1) % path.length
      return
    }

    const step = Math.min(WANDER_CAT_SPEED * delta, dist)
    node.position.x += (dx / dist) * step
    node.position.z += (dz / dist) * step

    const targetAngle = Math.atan2(dx, dz)
    let angleDiff = targetAngle - node.rotation.y
    angleDiff = Math.atan2(Math.sin(angleDiff), Math.cos(angleDiff))
    node.rotation.y += angleDiff * Math.min(1, TURN_SPEED * delta)
  })

  return (
    <group ref={group} position={path[0]}>
      <group scale={WANDER_CAT_SCALE} position={[0, WANDER_CAT_SCALE * MODEL_HALF_HEIGHT, 0]}>
        <MascotMesh mascot={mascot} />
      </group>
    </group>
  )
}

// One other player sharing this VR session. Its position/rotation come from
// `transformsRef` (a Map of id -> latest broadcast {x,y,z,ry}, updated by
// useVrMultiplayer outside of React), and are lerped toward each frame so
// remote movement looks smooth despite the ~120ms network tick. Metadata
// (name/mascot/skin) comes from useVrPresenceStore and only changes on
// join/rename, so it's safe to read via a normal hook.
function RemotePlayerMesh({ id, transformsRef, onSelectPlayer }) {
  const group = useRef()
  const player = useVrPresenceStore((s) => s.players[id])
  const mascot = getMascotById(player?.mascotId) || getMascotById(8)
  const skin = getSkinById(player?.skinId)

  const bubbles = useChatBubbles(id)

  useFrame((_, delta) => {
    const node = group.current
    const target = transformsRef.current.get(id)
    if (!node || !target) return

    const lerpFactor = Math.min(1, 10 * delta)
    node.position.x += (target.x - node.position.x) * lerpFactor
    node.position.y += (target.y - node.position.y) * lerpFactor
    node.position.z += (target.z - node.position.z) * lerpFactor

    let angleDiff = target.ry - node.rotation.y
    angleDiff = Math.atan2(Math.sin(angleDiff), Math.cos(angleDiff))
    node.rotation.y += angleDiff * lerpFactor
  })

  return (
    <group ref={group}>
      <group scale={PLAYER_SCALE} position={[0, PLAYER_SCALE * MODEL_HALF_HEIGHT, 0]}>
        <PlayerAvatarBody avatarId={player?.avatarId || 'scholar'} />
        <group position={[1.2, 0, 0]} scale={0.65}>
          <MascotMesh mascot={mascot} skin={skin} />
        </group>
      </group>
      <Html position={[0, PLAYER_HEIGHT + 0.5, 0]} center distanceFactor={10}>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onSelectPlayer?.({ id, name: player?.name || 'Viajero' })
          }}
          className="cursor-pointer whitespace-nowrap rounded-full bg-surface/90 px-3 py-1 text-xs font-semibold text-text shadow-lg transition-colors hover:bg-primary/30"
        >
          {player?.name || 'Viajero'}
        </button>
      </Html>
      <BubbleStack bubbles={bubbles} baseY={PLAYER_HEIGHT + 1.1} color={colorFromId(id)} />
    </group>
  )
}

// Renders every other player currently in the VR session. The roster (who's
// here) comes from useVrPresenceStore (zustand, low-churn); their live
// transforms come from `transformsRef` (a plain Map, high-churn) so position
// updates don't cause this list to re-render.
function RemotePlayers({ transformsRef, onSelectPlayer }) {
  // `Object.keys(...)` returns a brand-new array on every store read, which
  // makes useSyncExternalStore think the snapshot changed on every render
  // and re-render forever ("Maximum update depth exceeded" / React error
  // #185 — the actual cause of the VR world crashing to a black screen).
  // Select the stable `players` object instead and only recompute the id
  // list (via useMemo) when that object reference actually changes.
  const players = useVrPresenceStore((s) => s.players)
  const playerIds = useMemo(() => Object.keys(players), [players])

  return (
    <>
      {playerIds.map((id) => (
        <RemotePlayerMesh key={id} id={id} transformsRef={transformsRef} onSelectPlayer={onSelectPlayer} />
      ))}
    </>
  )
}

// A glowing torus "portal" ring that detects when the player walks within
// PORTAL_INTERACT_RADIUS and reports it via onNearbyChange, so VRPage can
// show the "press E" prompt outside the canvas and handle the navigation.
// Elaborate arch-style portal: stone gate posts + bar, dual counter-rotating
// rings, animated glowing disc, and a raised base platform. The arch gives the
// portal a physical presence; the spinning rings make it impossible to miss.
function Portal({ position, color, label, playerPositionRef, onNearbyChange }) {
  const portalVec = useRef(new THREE.Vector3(...position))
  const ring1Ref = useRef()
  const ring2Ref = useRef()
  const discRef  = useRef()
  const lastNear = useRef(false)

  useFrame((_, delta) => {
    if (ring1Ref.current) ring1Ref.current.rotation.y += delta * 1.1
    if (ring2Ref.current) ring2Ref.current.rotation.y -= delta * 0.7
    if (discRef.current) {
      discRef.current.material.emissiveIntensity = 0.2 + Math.abs(Math.sin(Date.now() * 0.0018)) * 0.15
    }
    const pos = playerPositionRef?.current
    if (!pos) return
    const near = pos.distanceTo(portalVec.current) <= PORTAL_INTERACT_RADIUS
    if (near !== lastNear.current) {
      lastNear.current = near
      onNearbyChange?.(near)
    }
  })

  return (
    <group position={position}>
      {/* Base platform */}
      <mesh position={[0, 0.12, 0]}>
        <cylinderGeometry args={[1.55, 1.75, 0.24, 24]} />
        <meshStandardMaterial color="#c0a880" />
      </mesh>

      {/* Gate arch posts */}
      {[-1.2, 1.2].map((side, i) => (
        <group key={i}>
          <mesh position={[side, 2.2, 0]}>
            <boxGeometry args={[0.38, 4.2, 0.38]} />
            <meshStandardMaterial color="#c0a880" />
          </mesh>
          <mesh position={[side, 4.45, 0]}>
            <sphereGeometry args={[0.24, 8, 6]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.7} />
          </mesh>
        </group>
      ))}
      {/* Top arch crossbar */}
      <mesh position={[0, 4.5, 0]}>
        <boxGeometry args={[2.95, 0.34, 0.34]} />
        <meshStandardMaterial color="#c0a880" />
      </mesh>

      {/* Outer ring — rotates clockwise */}
      <mesh ref={ring1Ref} position={[0, 2.2, 0]}>
        <torusGeometry args={[1.08, 0.10, 14, 52]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.1} />
      </mesh>
      {/* Inner ring — rotates counter-clockwise */}
      <mesh ref={ring2Ref} position={[0, 2.2, 0]}>
        <torusGeometry args={[0.76, 0.07, 12, 36]} />
        <meshStandardMaterial color="#ffffff" emissive={color} emissiveIntensity={0.8} />
      </mesh>

      {/* Portal disc (animated emissive) */}
      <mesh ref={discRef} position={[0, 2.2, 0]}>
        <circleGeometry args={[0.7, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.22}
          transparent
          opacity={0.45}
          side={THREE.DoubleSide}
        />
      </mesh>

      <Html position={[0, 5.3, 0]} center distanceFactor={14}>
        <div className="pointer-events-none whitespace-nowrap rounded-full bg-surface/90 px-3 py-1 text-xs font-semibold text-text shadow-lg">
          {label}
        </div>
      </Html>
    </group>
  )
}

// Player's private room: same Player + camera as the campus, but on the
// simple enclosed Room ground with no NPCs, no remote players, and an exit
// portal back to /vr (the campus).
function RoomWorld({ mascot, skin, keysRef, cameraRef, playerPositionRef, playerRotationRef, authorName, playerId, onNearPortalChange }) {
  const { model, groundRayHeight } = useRoomGround()
  return (
    <>
      <primitive object={model} />
      <Player
        mascot={mascot}
        skin={skin}
        scenery={model}
        groundRayHeight={groundRayHeight}
        keysRef={keysRef}
        cameraRef={cameraRef}
        playerPositionRef={playerPositionRef}
        playerRotationRef={playerRotationRef}
        authorName={authorName}
        playerId={playerId}
        spawnAt={[0, 0, 3]}
      />
      <Portal
        position={ROOM_EXIT_PORTAL_POSITION}
        color="#7dd3fc"
        label="🌀 Salir al Campus"
        playerPositionRef={playerPositionRef}
        onNearbyChange={onNearPortalChange}
      />
    </>
  )
}

// Watches the distance from the player to every NPC and reports the closest
// one within INTERACT_RADIUS (or null) via `onNearbyChange`, so VRPage can
// show its mission card outside the canvas.
function NpcProximityTracker({ playerPositionRef, onNearbyChange }) {
  const lastId = useRef(null)
  const npcPositions = useMemo(
    () => ACTIVE_VR_NPCS.map((npc) => ({ id: npc.id, vec: new THREE.Vector3(...npc.position) })),
    [],
  )

  useFrame(() => {
    const pos = playerPositionRef.current
    if (!pos) return

    let nearestId = null
    let nearestDist = Infinity
    for (const { id, vec } of npcPositions) {
      const dist = pos.distanceTo(vec)
      if (dist < nearestDist) {
        nearestDist = dist
        nearestId = id
      }
    }

    const nearbyId = nearestDist <= INTERACT_RADIUS ? nearestId : null
    if (nearbyId !== lastId.current) {
      lastId.current = nearbyId
      onNearbyChange(nearbyId)
    }
  })

  return null
}

// Picks the test ground or the real city model (USE_TEST_SCENERY), then adds
// the player, NPCs, remote players, and the portal to the player's Room.
// When roomMode/anfiteatroMode/worldTreeMode=true, renders the respective world.
function World({
  mascot,
  skin,
  keysRef,
  cameraRef,
  playerPositionRef,
  playerRotationRef,
  remoteTransformsRef,
  onNearbyNpcChange,
  onNearPortalChange,
  onNearClassNodeChange,
  authorName,
  playerId,
  onSelectPlayer,
  roomMode,
  anfiteatroMode,
  worldTreeMode,
}) {
  if (worldTreeMode) {
    return (
      <WorldTreeWorld
        mascot={mascot}
        skin={skin}
        keysRef={keysRef}
        cameraRef={cameraRef}
        playerPositionRef={playerPositionRef}
        playerRotationRef={playerRotationRef}
        authorName={authorName}
        playerId={playerId}
        onNearPortalChange={onNearPortalChange}
        onNearClassNodeChange={onNearClassNodeChange}
      />
    )
  }

  if (anfiteatroMode) {
    return (
      <AnfiteatroWorld
        mascot={mascot}
        skin={skin}
        keysRef={keysRef}
        cameraRef={cameraRef}
        playerPositionRef={playerPositionRef}
        playerRotationRef={playerRotationRef}
        authorName={authorName}
        playerId={playerId}
        onNearPortalChange={onNearPortalChange}
      />
    )
  }

  if (roomMode) {
    return (
      <RoomWorld
        mascot={mascot}
        skin={skin}
        keysRef={keysRef}
        cameraRef={cameraRef}
        playerPositionRef={playerPositionRef}
        playerRotationRef={playerRotationRef}
        authorName={authorName}
        playerId={playerId}
        onNearPortalChange={onNearPortalChange}
      />
    )
  }

  const WorldGround = USE_TEST_SCENERY ? TestWorld : CityWorld

  return (
    <>
      <WorldGround
        mascot={mascot}
        skin={skin}
        keysRef={keysRef}
        cameraRef={cameraRef}
        playerPositionRef={playerPositionRef}
        playerRotationRef={playerRotationRef}
        authorName={authorName}
        playerId={playerId}
      />
      <IdleNpc config={OLIVER_NPC} />
      <IdleNpc config={EINSTEIN_NPC} />
      {ACTIVE_VR_NPCS.map((npc) => (
        <VrNpc key={npc.id} npc={npc} playerPositionRef={playerPositionRef} />
      ))}
      {!SIMPLE_MODE &&
        WANDER_CAT_PATHS.map((path, i) => <WanderingCat key={i} path={path} />)}
      <Portal
        position={ROOM_PORTAL_POSITION}
        color="#a78bfa"
        label="🚪 Mi Room"
        playerPositionRef={playerPositionRef}
        onNearbyChange={onNearPortalChange}
      />
      {/* Portal Nexus — locked future worlds, purely decorative for now */}
      {NEXUS_PORTALS.map((p) => (
        <Portal key={p.id} position={p.pos} color={p.color} label={`🔒 ${p.label}`} />
      ))}
      <RemotePlayers transformsRef={remoteTransformsRef} onSelectPlayer={onSelectPlayer} />
      <NpcProximityTracker playerPositionRef={playerPositionRef} onNearbyChange={onNearbyNpcChange} />
    </>
  )
}

// Tracks pointer drag (mouse or touch) to orbit the camera around the player,
// and zoom (mouse wheel, or a two-finger pinch on touch devices).
function useCameraControls() {
  const initialDistance = useVrSettingsStore.getState().cameraDistance ?? CAMERA_DISTANCE
  const camera = useRef({ yaw: 0, pitch: 0, distance: initialDistance, targetDistance: initialDistance })
  const drag = useRef(null)
  const pointers = useRef(new Map())
  const pinchDistance = useRef(null)

  const onPointerDown = (e) => {
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
    if (pointers.current.size === 1) {
      drag.current = { x: e.clientX, y: e.clientY }
    } else {
      drag.current = null
      pinchDistance.current = null
    }
  }
  const onPointerMove = (e) => {
    if (!pointers.current.has(e.pointerId)) return
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY })

    if (pointers.current.size >= 2) {
      const [a, b] = Array.from(pointers.current.values())
      const dist = Math.hypot(a.x - b.x, a.y - b.y)
      if (pinchDistance.current != null) {
        const delta = pinchDistance.current - dist
        const { zoomMin, zoomMax } = useVrSettingsStore.getState()
        camera.current.targetDistance = clamp(
          camera.current.targetDistance + delta * PINCH_ZOOM_SPEED,
          zoomMin,
          zoomMax,
        )
      }
      pinchDistance.current = dist
      return
    }

    if (!drag.current) return
    const dx = e.clientX - drag.current.x
    const dy = e.clientY - drag.current.y
    drag.current = { x: e.clientX, y: e.clientY }
    const { cameraMode, mouseSensitivity, invertY } = useVrSettingsStore.getState()
    const [pitchMin, pitchMax] = getPitchRange(cameraMode)
    const sensitivity = MOUSE_SENSITIVITY * mouseSensitivity
    camera.current.yaw -= dx * sensitivity
    camera.current.pitch = clamp(
      camera.current.pitch + dy * sensitivity * (invertY ? -1 : 1),
      pitchMin,
      pitchMax,
    )
  }
  const onPointerUp = (e) => {
    pointers.current.delete(e.pointerId)
    pinchDistance.current = null
    const remaining = Array.from(pointers.current.values())
    drag.current = remaining.length === 1 ? { x: remaining[0].x, y: remaining[0].y } : null
  }
  const onWheel = (e) => {
    const { zoomMin, zoomMax } = useVrSettingsStore.getState()
    camera.current.targetDistance = clamp(
      camera.current.targetDistance + e.deltaY * WHEEL_ZOOM_SPEED * camera.current.targetDistance,
      zoomMin,
      zoomMax,
    )
  }

  return { camera, onPointerDown, onPointerMove, onPointerUp, onWheel }
}

// Bottom-center card shown when the player right-clicks a nearby NPC: their
// dialogue plus the mission they're handing out, with the right action
// button depending on accepted/completed/claimed state.
function NpcMissionCard({ npcId, accepted, claimed, missionState, onAccept, onClaim, onClose }) {
  const npc = getVrNpcById(npcId)
  const mission = npc && getGlobalMissionById(npc.missionId)
  if (!npc || !mission) return null

  const isAccepted = accepted.includes(mission.id)
  const isClaimed = claimed.includes(mission.id)
  const isCompleted = mission.check(missionState)

  return (
    <div className="absolute bottom-24 left-1/2 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 rounded-2xl border border-border bg-surface/95 p-4 text-sm text-text shadow-xl backdrop-blur sm:bottom-20">
      <div className="flex items-start justify-between gap-2">
        <p className="font-bold">
          {npc.emoji} {npc.name}
        </p>
        <button type="button" onClick={onClose} className="text-text-muted hover:text-text" aria-label="Cerrar">
          ✕
        </button>
      </div>
      <p className="mt-1 text-text-muted">"{npc.dialogue}"</p>
      <div className="mt-3 flex items-center justify-between gap-2 rounded-xl border border-border bg-background px-3 py-2">
        <p className="flex items-center gap-1.5 font-semibold">
          <span>{mission.icon}</span>
          <span>{mission.title}</span>
        </p>
        <p className="whitespace-nowrap text-xs text-text-muted">🪙 {formatCurrency(mission.reward)}</p>
      </div>

      <div className="mt-3">
        {!isAccepted && (
          <button
            type="button"
            onClick={() => onAccept(mission.id)}
            className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-background transition-colors hover:bg-primary-hover"
          >
            📜 Aceptar misión
          </button>
        )}
        {isAccepted && !isCompleted && (
          <p className="text-center text-xs font-semibold text-text-muted">🕓 En progreso</p>
        )}
        {isAccepted && isCompleted && !isClaimed && (
          <button
            type="button"
            onClick={() => onClaim(mission.id)}
            className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-background transition-colors hover:bg-primary-hover"
          >
            🎁 Reclamar recompensa
          </button>
        )}
        {isClaimed && <p className="text-center text-xs font-semibold text-text-muted">✅ Completada</p>}
      </div>
    </div>
  )
}

// Small card shown when the player clicks another player's name tag in the
// world: lets them whisper that player or add/remove them as a friend
// (friends then show up in the Amigos tab of MascotCompanion).
function PlayerMenu({ player, isFriend, onWhisper, onToggleFriend, onClose }) {
  if (!player) return null

  return (
    <div className="absolute bottom-24 left-1/2 w-[calc(100%-2rem)] max-w-xs -translate-x-1/2 rounded-2xl border border-border bg-surface/95 p-4 text-sm text-text shadow-xl backdrop-blur sm:bottom-20">
      <div className="flex items-start justify-between gap-2">
        <p className="font-bold">👤 {player.name}</p>
        <button type="button" onClick={onClose} className="text-text-muted hover:text-text" aria-label="Cerrar">
          ✕
        </button>
      </div>
      <div className="mt-3 flex flex-col gap-2">
        <button
          type="button"
          onClick={onWhisper}
          className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-background transition-colors hover:bg-primary-hover"
        >
          🔒 Susurrar
        </button>
        <button
          type="button"
          onClick={onToggleFriend}
          className="w-full rounded-lg border border-border px-4 py-2 text-sm font-semibold text-text transition-colors hover:border-primary hover:text-primary"
        >
          {isFriend ? '✖️ Quitar amigo' : '➕ Agregar amigo'}
        </button>
      </div>
    </div>
  )
}

// Camera/control settings menu, opened from the "📷 Cámara" button in the
// top-right of the VR page. Lets the player switch between 3rd/1st person
// and tune mouse sensitivity / vertical inversion — all persisted via
// useVrSettingsStore + progressSnapshot.
function CameraSettingsMenu() {
  const [open, setOpen] = useState(false)
  const cameraMode = useVrSettingsStore((s) => s.cameraMode)
  const setCameraMode = useVrSettingsStore((s) => s.setCameraMode)
  const mouseSensitivity = useVrSettingsStore((s) => s.mouseSensitivity)
  const setMouseSensitivity = useVrSettingsStore((s) => s.setMouseSensitivity)
  const invertY = useVrSettingsStore((s) => s.invertY)
  const setInvertY = useVrSettingsStore((s) => s.setInvertY)
  const cameraDistance = useVrSettingsStore((s) => s.cameraDistance)
  const setCameraDistance = useVrSettingsStore((s) => s.setCameraDistance)
  const cameraHeight = useVrSettingsStore((s) => s.cameraHeight)
  const setCameraHeight = useVrSettingsStore((s) => s.setCameraHeight)
  const zoomMin = useVrSettingsStore((s) => s.zoomMin)
  const setZoomMin = useVrSettingsStore((s) => s.setZoomMin)
  const zoomMax = useVrSettingsStore((s) => s.zoomMax)
  const setZoomMax = useVrSettingsStore((s) => s.setZoomMax)
  const pitchMin = useVrSettingsStore((s) => s.pitchMin)
  const setPitchMin = useVrSettingsStore((s) => s.setPitchMin)
  const pitchMax = useVrSettingsStore((s) => s.pitchMax)
  const setPitchMax = useVrSettingsStore((s) => s.setPitchMax)
  const fov = useVrSettingsStore((s) => s.fov)
  const setFov = useVrSettingsStore((s) => s.setFov)
  const noClip = useVrSettingsStore((s) => s.noClip)
  const setNoClip = useVrSettingsStore((s) => s.setNoClip)
  const npcVoice = useVrSettingsStore((s) => s.npcVoice)
  const setNpcVoice = useVrSettingsStore((s) => s.setNpcVoice)

  return (
    <div className="absolute right-4 top-14 z-20 flex flex-col items-end gap-2">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="rounded-full bg-surface/90 px-3 py-1.5 text-xs font-semibold text-text shadow-lg backdrop-blur transition-colors hover:bg-primary/30"
      >
        📷 Cámara
      </button>
      {open && (
        <div className="w-64 rounded-xl border border-border bg-surface/95 p-3 text-sm text-text shadow-xl backdrop-blur">
          <div className="mb-3 flex items-center justify-between">
            <p className="font-semibold">Cámara y controles</p>
            <button type="button" onClick={() => setOpen(false)} className="text-text-muted hover:text-text" aria-label="Cerrar">
              ✕
            </button>
          </div>

          <p className="mb-1 text-xs font-semibold text-text-muted">Tipo de cámara</p>
          <div className="mb-3 flex gap-2">
            <button
              type="button"
              onClick={() => setCameraMode('third')}
              className={`flex-1 rounded-lg px-2 py-1.5 text-xs font-semibold transition-colors ${
                cameraMode === 'third'
                  ? 'bg-primary text-background'
                  : 'border border-border text-text-muted hover:text-text'
              }`}
            >
              🎥 3ra persona
            </button>
            <button
              type="button"
              onClick={() => setCameraMode('first')}
              className={`flex-1 rounded-lg px-2 py-1.5 text-xs font-semibold transition-colors ${
                cameraMode === 'first'
                  ? 'bg-primary text-background'
                  : 'border border-border text-text-muted hover:text-text'
              }`}
            >
              👁️ 1ra persona
            </button>
          </div>

          <label className="mb-1 block text-xs font-semibold text-text-muted" htmlFor="vr-mouse-sensitivity">
            Sensibilidad del mouse: {mouseSensitivity.toFixed(1)}x
          </label>
          <input
            id="vr-mouse-sensitivity"
            type="range"
            min="0.3"
            max="2.5"
            step="0.1"
            value={mouseSensitivity}
            onChange={(e) => setMouseSensitivity(Number(e.target.value))}
            className="mb-3 w-full accent-primary"
          />

          <label className="flex items-center gap-2 text-xs font-semibold text-text-muted">
            <input
              type="checkbox"
              checked={invertY}
              onChange={(e) => setInvertY(e.target.checked)}
              className="accent-primary"
            />
            Invertir vista vertical
          </label>

          <label className="mb-1 mt-3 block text-xs font-semibold text-text-muted" htmlFor="vr-fov">
            Campo de visión (FOV): {fov}°
          </label>
          <input
            id="vr-fov"
            type="range"
            min="40"
            max="100"
            step="1"
            value={fov}
            onChange={(e) => setFov(Number(e.target.value))}
            className="mb-3 w-full accent-primary"
          />

          {cameraMode === 'third' && (
            <div className="mt-1 border-t border-border pt-3">
              <p className="mb-2 text-xs font-semibold text-text-muted">
                Ajustes de cámara en 3ra persona
              </p>

              <label className="mb-1 block text-xs font-semibold text-text-muted" htmlFor="vr-cam-distance">
                Distancia: {cameraDistance.toFixed(1)}
              </label>
              <input
                id="vr-cam-distance"
                type="range"
                min="2"
                max="15"
                step="0.5"
                value={cameraDistance}
                onChange={(e) => setCameraDistance(Number(e.target.value))}
                className="mb-3 w-full accent-primary"
              />

              <label className="mb-1 block text-xs font-semibold text-text-muted" htmlFor="vr-cam-height">
                Altura: {cameraHeight.toFixed(1)}
              </label>
              <input
                id="vr-cam-height"
                type="range"
                min="0.5"
                max="6"
                step="0.1"
                value={cameraHeight}
                onChange={(e) => setCameraHeight(Number(e.target.value))}
                className="mb-3 w-full accent-primary"
              />

              <label className="mb-1 block text-xs font-semibold text-text-muted" htmlFor="vr-zoom-min">
                Zoom mínimo (más cerca): {zoomMin.toFixed(1)}
              </label>
              <input
                id="vr-zoom-min"
                type="range"
                min="0.5"
                max="5"
                step="0.1"
                value={zoomMin}
                onChange={(e) => setZoomMin(Math.min(Number(e.target.value), zoomMax - 0.5))}
                className="mb-3 w-full accent-primary"
              />

              <label className="mb-1 block text-xs font-semibold text-text-muted" htmlFor="vr-zoom-max">
                Zoom máximo (más lejos): {zoomMax.toFixed(0)}
              </label>
              <input
                id="vr-zoom-max"
                type="range"
                min="10"
                max="80"
                step="1"
                value={zoomMax}
                onChange={(e) => setZoomMax(Math.max(Number(e.target.value), zoomMin + 0.5))}
                className="mb-3 w-full accent-primary"
              />

              <label className="mb-1 block text-xs font-semibold text-text-muted" htmlFor="vr-pitch-min">
                Límite al mirar hacia abajo: {pitchMin.toFixed(2)}
              </label>
              <input
                id="vr-pitch-min"
                type="range"
                min="-1.2"
                max="0"
                step="0.05"
                value={pitchMin}
                onChange={(e) => setPitchMin(Math.min(Number(e.target.value), pitchMax - 0.05))}
                className="mb-3 w-full accent-primary"
              />

              <label className="mb-1 block text-xs font-semibold text-text-muted" htmlFor="vr-pitch-max">
                Límite al mirar hacia arriba: {pitchMax.toFixed(2)}
              </label>
              <input
                id="vr-pitch-max"
                type="range"
                min="0"
                max="1.4"
                step="0.05"
                value={pitchMax}
                onChange={(e) => setPitchMax(Math.max(Number(e.target.value), pitchMin + 0.05))}
                className="mb-3 w-full accent-primary"
              />

              <p className="text-xs text-text-muted">
                💡 Sube "Límite al mirar hacia arriba" y aleja el zoom para ver los techos de los
                edificios. Sube el "Zoom mínimo" si quieres acercarte más a tu personaje.
              </p>
            </div>
          )}

          {cameraMode === 'first' && (
            <p className="mt-3 text-xs text-text-muted">
              👁️ Modo primera persona: arrastra para mirar alrededor, W A S D para moverte.
            </p>
          )}

          <div className="mt-3 border-t border-border pt-3 flex flex-col gap-2">
            <label className="flex items-center gap-2 text-xs font-semibold text-text-muted cursor-pointer">
              <input
                type="checkbox"
                checked={noClip}
                onChange={(e) => setNoClip(e.target.checked)}
                className="accent-primary"
              />
              🚧 Atravesar paredes (noClip)
              {noClip && <span className="ml-auto text-yellow-400">ACTIVO</span>}
            </label>
            <p className="text-[10px] text-text-muted -mt-1">
              Actívalo si tu personaje quedó atrapado. Recuerda desactivarlo después.
            </p>
            <label className="flex items-center gap-2 text-xs font-semibold text-text-muted cursor-pointer">
              <input
                type="checkbox"
                checked={npcVoice}
                onChange={(e) => setNpcVoice(e.target.checked)}
                className="accent-primary"
              />
              🔊 Voz de los NPCs (Text-to-Speech)
            </label>
          </div>
        </div>
      )}
    </div>
  )
}

// Full-screen transport picker: 4 world cards (2 available, 2 locked future
// destinations). Opened by clicking/pressing E at the campus portal.
const TRANSPORT_WORLDS = [
  { id: 'campus',     emoji: '🏫', name: 'Campus Principal', desc: 'El mundo universitario',     available: true,  path: '/vr' },
  { id: 'room',       emoji: '🏠', name: 'Mi Room',           desc: 'Tu espacio privado',         available: true,  path: '/vr/room' },
  { id: 'anfiteatro', emoji: '🎭', name: 'Anfiteatro',        desc: 'Teatro con pantalla en vivo', available: true,  path: '/vr/anfiteatro' },
  { id: 'ciudad',     emoji: '🌆', name: 'Ciudad',            desc: 'Próximamente…',              available: false, path: null },
]

function TransportMenu({ onNavigate, onClose }) {
  return (
    <div
      className="absolute inset-0 z-40 flex items-center justify-center bg-background/75 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm rounded-2xl border border-border bg-surface p-6 shadow-2xl mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <p className="text-sm font-bold text-text">🌀 Portal de Transporte</p>
          <button
            type="button"
            onClick={onClose}
            className="text-text-muted hover:text-text"
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {TRANSPORT_WORLDS.map((w) => (
            <button
              key={w.id}
              type="button"
              disabled={!w.available}
              onClick={() => w.available && onNavigate(w.path)}
              className={[
                'flex flex-col items-center gap-1.5 rounded-xl border p-4 text-center transition-colors',
                w.available
                  ? 'cursor-pointer border-border bg-background hover:bg-surface-hover'
                  : 'cursor-not-allowed border-border/40 bg-background/40 opacity-50',
              ].join(' ')}
            >
              <span className="text-3xl">{w.emoji}</span>
              <span className="text-xs font-semibold text-text">{w.name}</span>
              <span className="text-xs text-text-muted">{w.desc}</span>
              {!w.available && (
                <span className="mt-0.5 rounded-full bg-border/50 px-2 py-0.5 text-[10px] text-text-muted">🔒 Bloqueado</span>
              )}
            </button>
          ))}
        </div>

        <p className="mt-4 text-center text-xs text-text-muted">
          Pulsa <kbd className="rounded bg-border px-1 py-0.5 font-mono text-[10px]">Esc</kbd> o haz clic fuera para cerrar
        </p>
      </div>
    </div>
  )
}

// Top-down overview of the campus: the plaza, every NPC's zone, and a live
// marker for the player's position. Opened/closed with the M key.
function WorldMap({ open, onClose, playerPositionRef }) {
  const playerMarkerRef = useRef(null)

  useEffect(() => {
    if (!open) return
    let raf
    const update = () => {
      const pos = playerPositionRef.current
      if (pos && playerMarkerRef.current) {
        playerMarkerRef.current.setAttribute('cx', pos.x.toFixed(2))
        playerMarkerRef.current.setAttribute('cy', pos.z.toFixed(2))
      }
      raf = requestAnimationFrame(update)
    }
    raf = requestAnimationFrame(update)
    return () => cancelAnimationFrame(raf)
  }, [open, playerPositionRef])

  if (!open) return null

  return (
    <div
      className="absolute inset-0 z-30 flex items-center justify-center bg-background/80 backdrop-blur-sm"
      onClick={onClose}
      onContextMenu={(e) => e.preventDefault()}
    >
      <div
        className="relative rounded-2xl border border-border bg-surface p-4 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-2 flex items-center justify-between gap-6">
          <p className="text-sm font-bold text-text">🗺️ Mapa del campus</p>
          <button type="button" onClick={onClose} className="text-text-muted hover:text-text" aria-label="Cerrar mapa">
            ✕
          </button>
        </div>
        <svg
          viewBox={`-${GROUND_RADIUS + 5} -${GROUND_RADIUS + 5} ${(GROUND_RADIUS + 5) * 2} ${(GROUND_RADIUS + 5) * 2}`}
          className="h-[66vh] w-[66vh] max-w-[90vw]"
        >
          {/* Summer grass ground */}
          <circle cx="0" cy="0" r={GROUND_RADIUS} fill="#4a8a3a" />
          <circle cx="0" cy="0" r="58" fill="#5ea848" opacity="0.4" />

          {/* West forest zone */}
          <circle cx="-60" cy="0" r="36" fill="#2d6a22" opacity="0.75" />
          <text x="-60" y="1" fontSize="5" textAnchor="middle" dominantBaseline="middle">🌲</text>

          {/* Swimming pool (east) */}
          <rect x="56" y="-22" width="18" height="44" fill="#1a7abf" opacity="0.85" rx="1" />
          <rect x="60" y="-20" width="10" height="40" fill="#2888cc" opacity="0.7" rx="0.5" />
          <text x="65" y="1" fontSize="5" textAnchor="middle" dominantBaseline="middle">🏊</text>

          {/* Ring roads (paved stone) */}
          <circle cx="0" cy="0" r="23.5" fill="none" stroke="#a8a090" strokeWidth="3" opacity="0.8" />
          <circle cx="0" cy="0" r="47" fill="none" stroke="#a0988a" strokeWidth="3.5" opacity="0.75" />
          <circle cx="0" cy="0" r="74" fill="none" stroke="#a0988a" strokeWidth="2.5" opacity="0.7" />

          {/* Cardinal avenues */}
          {[0, 90, 180, 270].map((deg) => {
            const rad = (deg * Math.PI) / 180
            return (
              <line
                key={deg}
                x1={Math.sin(rad) * 9} y1={Math.cos(rad) * 9}
                x2={Math.sin(rad) * (GROUND_RADIUS - 2)} y2={Math.cos(rad) * (GROUND_RADIUS - 2)}
                stroke="#c8bc9c" strokeWidth="6.5" opacity="0.65"
              />
            )
          })}

          {/* Central plaza (octagonal stone) */}
          <polygon points={
            Array.from({ length: 8 }, (_, i) => {
              const a = (i / 8) * Math.PI * 2
              return `${Math.cos(a) * 9},${Math.sin(a) * 9}`
            }).join(' ')
          } fill="#d0c8b8" />
          {/* Maple leaf monument */}
          <circle cx="-7" cy="0" r="2.0" fill="#d52b1e" opacity="0.9" />
          <text x="-7" y="0.5" fontSize="3.5" textAnchor="middle" dominantBaseline="middle">🍁</text>
          {/* Fountain */}
          <circle cx="7" cy="0" r="2.2" fill="#2888cc" opacity="0.9" />

          {/* Portal Nexus (south) */}
          <circle cx="0" cy="72" r="26" fill="#181830" opacity="0.55" />
          <circle cx="0" cy="72" r="26" fill="none" stroke="#5040a0" strokeWidth="1.5" opacity="0.8" strokeDasharray="3 2" />
          <text x="0" y="60" fontSize="3" textAnchor="middle" fill="#a090e0" opacity="0.9">PORTAL NEXUS</text>
          {NEXUS_PORTALS.map((p) => {
            const [px, , pz] = p.pos
            return (
              <g key={p.id}>
                <circle cx={px} cy={pz} r="3.2" fill={p.color} opacity="0.75" />
                <text x={px} y={pz - 4.5} fontSize="2.8" textAnchor="middle" opacity="0.9">🔒</text>
              </g>
            )
          })}

          {/* Academic buildings */}
          {CAMPUS_ACADEMIC.map(({ pos, color, w, d, name, label }) => {
            const [bx, , bz] = pos
            return (
              <g key={name}>
                <rect x={bx - w / 2} y={bz - d / 2} width={w} height={d} fill={color} opacity="0.82" rx="0.8" />
                <rect x={bx - w / 2} y={bz - d / 2} width={w} height={d} fill="none" stroke="#d52b1e" strokeWidth="0.6" opacity="0.5" rx="0.8" />
                <text x={bx} y={bz + 0.6} fontSize="4.5" textAnchor="middle" dominantBaseline="middle">{label}</text>
                <text x={bx} y={bz + d / 2 + 3.5} fontSize="2.2" textAnchor="middle" fill="#f0ece0" opacity="0.95">{name}</text>
              </g>
            )
          })}

          {/* Dormitory blocks */}
          {CAMPUS_DORMS.map(({ pos, color }, i) => {
            const [bx, , bz] = pos
            return (
              <g key={i}>
                <rect x={bx - 3.5} y={bz - 6} width={7} height={12} fill={color} opacity="0.70" rx="0.4" />
                <rect x={bx - 3.5} y={bz - 6} width={7} height={1.5} fill="#d52b1e" opacity="0.45" rx="0.3" />
              </g>
            )
          })}

          {/* NPC log cabins */}
          {VR_NPCS.map((npc) => {
            const [x, , z] = npc.position
            return (
              <g key={npc.id}>
                <rect
                  x={x * NPC_BUILDING_OFFSET - BUILDING_SIZE / 2}
                  y={z * NPC_BUILDING_OFFSET - BUILDING_SIZE / 2}
                  width={BUILDING_SIZE + 0.6} height={BUILDING_SIZE + 0.6}
                  fill={npc.color} opacity="0.65" rx="0.3"
                />
                <circle cx={x} cy={z} r="1.6" fill={npc.color} stroke="#fff" strokeWidth="0.4" />
                <text x={x} y={z - 2.8} fontSize="3" textAnchor="middle">{npc.emoji}</text>
              </g>
            )
          })}

          {/* Oliver + Einstein (idle NPCs near plaza) */}
          {[
            { npc: { id: 'oliver', position: [4, 0, 4], emoji: '🐾', color: '#fde68a' }, },
            { npc: { id: 'einstein', position: [-4, 0, -4], emoji: '🧙', color: '#c7d2fe' }, },
          ].map(({ npc }) => {
            const [x, , z] = npc.position
            return (
              <g key={npc.id}>
                <circle cx={x} cy={z} r="1.4" fill={npc.color} opacity="0.9" stroke="#fff" strokeWidth="0.35" />
                <text x={x} y={z - 2.4} fontSize="2.8" textAnchor="middle">{npc.emoji}</text>
              </g>
            )
          })}

          {/* Room portal marker */}
          {(() => {
            const [px, , pz] = ROOM_PORTAL_POSITION
            return (
              <g>
                <circle cx={px} cy={pz} r="2.4" fill="#a78bfa" opacity="0.9" />
                <text x={px} y={pz - 3.6} fontSize="3.2" textAnchor="middle">🌀</text>
                <text x={px} y={pz + 4.2} fontSize="2" textAnchor="middle" fill="#e0d8ff" opacity="0.8">Mi Room</text>
              </g>
            )
          })()}

          {/* Anfiteatro portal marker — south-east of plaza */}
          <g>
            <rect x="14" y="-10" width="16" height="20" fill="#7c2d8a" opacity="0.8" rx="1" />
            <rect x="14" y="-10" width="16" height="20" fill="none" stroke="#d946ef" strokeWidth="0.6" opacity="0.7" rx="1" />
            <text x="22" y="2" fontSize="5" textAnchor="middle" dominantBaseline="middle">🎭</text>
            <text x="22" y="14" fontSize="2.1" textAnchor="middle" fill="#f5d0fe" opacity="0.95">Anfiteatro</text>
            <circle cx="5" cy="0" r="2.2" fill="#d946ef" opacity="0.85" />
            <text x="5" y="-3.4" fontSize="3" textAnchor="middle">🌀</text>
          </g>

          {/* Perimeter stone fence */}
          <circle cx="0" cy="0" r={GROUND_RADIUS - 0.5} fill="none" stroke="#beb8a8" strokeWidth="1.8" opacity="0.70" strokeDasharray="4 2.5" />

          {/* Stone gate posts with red caps */}
          {[0, Math.PI / 2, Math.PI, Math.PI * 3 / 2].map((a, i) => (
            <g key={i}>
              <circle cx={Math.sin(a) * GROUND_RADIUS} cy={Math.cos(a) * GROUND_RADIUS} r="2.8" fill="#beb8a8" opacity="0.85" />
              <circle cx={Math.sin(a) * GROUND_RADIUS} cy={Math.cos(a) * GROUND_RADIUS} r="1.2" fill="#d52b1e" opacity="0.9" />
              <text x={Math.sin(a) * (GROUND_RADIUS - 6)} y={Math.cos(a) * (GROUND_RADIUS - 6)} fontSize="3.5" textAnchor="middle" dominantBaseline="middle">🍁</text>
            </g>
          ))}

          {/* Player position marker (live) */}
          <circle ref={playerMarkerRef} cx="0" cy="0" r="2.2" fill="#e74c3c" stroke="#fff" strokeWidth="0.55" />
        </svg>
        <p className="mt-2 text-center text-xs text-text-muted">
          Pulsa <strong>M</strong> para cerrar el mapa
        </p>
      </div>
    </div>
  )
}

// Renders one chat line, styled differently for system (WoW-style admin
// MOTD), whispers (sent or received) and regular global messages.
function ChatLine({ message }) {
  if (message.system) {
    return (
      <p className="text-amber-400">
        <span className="font-semibold">🛡️ {message.author}:</span> {message.text}
      </p>
    )
  }
  if (message.whisperFrom) {
    return (
      <p className="italic text-fuchsia-400">
        <span className="font-semibold">🔒 Susurro de {message.whisperFrom}:</span> {message.text}
      </p>
    )
  }
  if (message.whisperTo) {
    return (
      <p className="italic text-fuchsia-400">
        <span className="font-semibold">🔒 Susurro a {message.whisperTo}:</span> {message.text}
      </p>
    )
  }
  return (
    <p className="text-text">
      <span className="font-semibold">{message.author}:</span> {message.text}
    </p>
  )
}

// Local "world chat" the player can type into, independent from the per-NPC
// AI chats. The message log is always visible (Habbo-style global chat);
// C opens the input box, Escape (or sending a message) closes it again.
// Messages broadcast over Realtime via useVrMultiplayer (see onSend).
// Supports whispers via "/w <nombre> <mensaje>".
function MicButton({ onTranscript }) {
  const [listening, setListening] = useState(false)
  const recogRef = useRef(null)
  const hasApi = typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)
  if (!hasApi) return null

  const toggle = () => {
    if (listening) {
      recogRef.current?.stop()
      setListening(false)
      return
    }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    const r = new SR()
    r.lang = 'es-ES'
    r.continuous = false
    r.interimResults = false
    r.onresult = (e) => {
      const t = Array.from(e.results).map(res => res[0].transcript).join(' ')
      onTranscript(t)
    }
    r.onend = () => setListening(false)
    r.onerror = () => setListening(false)
    r.start()
    recogRef.current = r
    setListening(true)
  }

  return (
    <button
      type="button"
      onClick={toggle}
      title={listening ? 'Detener micrófono' : 'Hablar (mic)'}
      className={`rounded-lg px-2 py-1.5 text-base transition-all ${
        listening
          ? 'bg-red-500/20 text-red-400 ring-1 ring-red-400 animate-pulse'
          : 'text-text-muted hover:text-text'
      }`}
    >
      {listening ? '🔴' : '🎤'}
    </button>
  )
}

function WorldChat({ open, onClose, onOpen, authorName, playerId, onSend, prefill }) {
  const messages = useWorldChatStore((s) => s.messages)
  const sendMessage = useWorldChatStore((s) => s.sendMessage)
  const addSystemMessage = useWorldChatStore((s) => s.addSystemMessage)
  const players = useVrPresenceStore((s) => s.players)
  const isTouch = useIsTouchDevice()
  const [text, setText] = useState('')
  const [tab, setTab] = useState('general')
  const inputRef = useRef(null)
  const lastSeenWhisperIdRef = useRef(null)
  const [hasUnreadWhisper, setHasUnreadWhisper] = useState(false)
  // Start minimized on touch so it doesn't overlap the joystick/controls
  const [minimized, setMinimized] = useState(
    () => typeof window !== 'undefined' && (window.matchMedia?.('(pointer: coarse)').matches || 'ontouchstart' in window),
  )
  const lastReadLenRef = useRef(0)
  const [unreadCount, setUnreadCount] = useState(0)

  // Track unread messages while minimized
  useEffect(() => {
    if (!minimized) {
      lastReadLenRef.current = messages.length
      setUnreadCount(0)
    } else {
      const n = messages.length - lastReadLenRef.current
      if (n > 0) setUnreadCount(n)
    }
  }, [messages.length, minimized])

  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  // Pre-fills "/w <nombre> " when the chat is opened from the "Susurrar"
  // option (selecting a player in the world, or the Amigos tab).
  useEffect(() => {
    if (!prefill) return
    setText(prefill.text)
    setTab('whispers')
    inputRef.current?.focus()
  }, [prefill])

  // General chat (everyone) vs. private whispers (sent/received), shown in
  // separate tabs — WoW-style — so whispers don't get lost in global chat.
  const generalMessages = useMemo(
    () => messages.filter((m) => !m.whisperFrom && !m.whisperTo),
    [messages],
  )
  const whisperMessages = useMemo(
    () => messages.filter((m) => m.whisperFrom || m.whisperTo),
    [messages],
  )

  // Flag the "Susurros" tab with a dot when a new whisper arrives while
  // the player is looking at the general tab.
  useEffect(() => {
    const last = whisperMessages[whisperMessages.length - 1]
    if (!last) return
    if (tab === 'whispers') {
      lastSeenWhisperIdRef.current = last.id
      setHasUnreadWhisper(false)
      return
    }
    if (last.id !== lastSeenWhisperIdRef.current && last.whisperFrom) {
      setHasUnreadWhisper(true)
    }
  }, [whisperMessages, tab])

  const handleSubmit = (e) => {
    e.preventDefault()
    const trimmed = text.trim()
    if (trimmed) {
      // "/w <nombre> <mensaje>" (also "/susurro", "/whisper") sends a
      // whisper instead of a global message — only the named player (and
      // the sender) will see it.
      const whisperMatch = trimmed.match(/^\/(?:w|susurro|whisper)\s+(\S+)\s+([\s\S]+)/i)
      if (whisperMatch) {
        const [, targetName, body] = whisperMatch
        const targetEntry = Object.entries(players).find(
          ([, p]) => (p?.name || '').toLowerCase() === targetName.toLowerCase(),
        )
        if (targetEntry) {
          const [targetId] = targetEntry
          sendMessage(authorName, body, { authorId: playerId, whisperTo: targetName })
          onSend?.(authorName, body, targetId)
          setTab('whispers')
        } else {
          addSystemMessage(`No se encontró a "${targetName}" en el mundo.`)
        }
      } else {
        sendMessage(authorName, trimmed, { authorId: playerId })
        onSend?.(authorName, trimmed)
      }
      setText('')
    }
    onClose()
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      e.preventDefault()
      setText('')
      onClose()
    }
  }

  const visibleMessages = tab === 'whispers' ? whisperMessages : generalMessages

  // Minimized: float as a small pill bubble so touch controls have room
  if (minimized) {
    return (
      <button
        type="button"
        onClick={() => setMinimized(false)}
        className={[
          'absolute z-20 flex items-center gap-2 rounded-full border border-border bg-surface/90 px-3 py-2 text-sm text-text shadow-xl backdrop-blur transition-colors hover:bg-surface',
          isTouch ? 'bottom-[148px] left-5' : 'bottom-20 left-4',
        ].join(' ')}
      >
        <span>💬</span>
        {unreadCount > 0 && (
          <span className="min-w-[18px] rounded-full bg-primary px-1 text-center text-xs font-bold text-background">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
        <span className="text-xs text-text-muted">Chat</span>
        {hasUnreadWhisper && (
          <span className="h-2 w-2 rounded-full bg-fuchsia-400" />
        )}
      </button>
    )
  }

  // Expanded panel — wider + above controls on mobile, fixed left on desktop
  return (
    <div
      className={[
        'absolute z-20 rounded-xl border border-border bg-surface/90 p-3 text-sm shadow-xl backdrop-blur',
        isTouch
          ? 'bottom-[148px] left-4 right-4'
          : 'bottom-20 left-4 w-72 max-w-[calc(100%-2rem)] sm:bottom-24',
      ].join(' ')}
    >
      <div className="mb-2 flex items-center gap-1 text-xs">
        <button
          type="button"
          onClick={() => setTab('general')}
          className={`flex-1 rounded-lg px-2 py-1 font-semibold transition-colors ${
            tab === 'general' ? 'bg-primary text-background' : 'text-text-muted hover:text-text'
          }`}
        >
          General
        </button>
        <button
          type="button"
          onClick={() => setTab('whispers')}
          className={`relative flex-1 rounded-lg px-2 py-1 font-semibold transition-colors ${
            tab === 'whispers' ? 'bg-primary text-background' : 'text-text-muted hover:text-text'
          }`}
        >
          Susurros
          {hasUnreadWhisper && (
            <span className="absolute right-2 top-1 h-2 w-2 rounded-full bg-fuchsia-400" />
          )}
        </button>
        {/* Minimize button */}
        <button
          type="button"
          onClick={() => setMinimized(true)}
          className="ml-1 rounded-lg px-2 py-1 text-base leading-none text-text-muted hover:text-text"
          aria-label="Minimizar chat"
          title="Minimizar chat"
        >
          —
        </button>
      </div>
      <div className="mb-2 flex max-h-40 flex-col gap-1 overflow-y-auto text-xs">
        {visibleMessages.length > 0 ? (
          visibleMessages.slice(-12).map((m) => <ChatLine key={m.id} message={m} />)
        ) : (
          <p className="text-text-muted">
            {tab === 'whispers' ? 'Tus susurros aparecerán aquí.' : 'El chat global aparecerá aquí.'}
          </p>
        )}
      </div>
      {open ? (
        <form onSubmit={handleSubmit} className="flex gap-1">
          <input
            ref={inputRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Mensaje global, o /w nombre mensaje para susurrar…"
            className="flex-1 rounded-lg border border-border bg-background px-2 py-1.5 text-sm text-text outline-none focus:border-primary"
          />
          <MicButton onTranscript={(t) => setText(prev => prev ? prev + ' ' + t : t)} />
          <button
            type="submit"
            className="rounded-lg bg-primary px-3 py-1.5 text-sm font-semibold text-background transition-colors hover:bg-primary-hover"
          >
            Enviar
          </button>
        </form>
      ) : (
        <button
          type="button"
          onClick={onOpen}
          className="w-full rounded-lg border border-dashed border-border px-2 py-1.5 text-left text-xs text-text-muted hover:border-primary hover:text-text"
        >
          {isTouch ? 'Toca aquí para chatear…' : 'Pulsa C o toca aquí para chatear…'}
        </button>
      )}
    </div>
  )
}

// ── Class Preview Card — shown when player nears a class node in WorldTree ─────
function ClassPreviewCard({ classId, step, playerClass, oliverClass, onSelectPlayer, onSelectOliver, onClose }) {
  const cls = PLAYER_CLASSES[classId]
  if (!cls) return null

  const statEntries = Object.entries(cls.stats)
  const maxStat = 5

  // In 'oliver' step, show Oliver companion class options (all 5)
  if (step === 'oliver') {
    return (
      <div className="absolute bottom-20 left-1/2 z-30 w-80 -translate-x-1/2 overflow-hidden rounded-2xl border border-border bg-surface/95 shadow-2xl backdrop-blur sm:w-96">
        <div className="border-b border-border px-4 py-3 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-text-muted">Elige la clase de Oliver</p>
          <p className="mt-0.5 text-sm text-text-muted">Tu clase: <strong style={{ color: cls.color }}>{cls.icon} {cls.name}</strong></p>
        </div>
        <div className="flex flex-col gap-2 p-3">
          {Object.values(OLIVER_CLASSES).map((oc) => (
            <button
              key={oc.id}
              type="button"
              onClick={() => onSelectOliver(oc.id)}
              className="flex items-center gap-3 rounded-xl border border-border p-2.5 text-left transition-colors hover:border-primary hover:bg-primary/5"
              style={{ borderColor: oc.id === OLIVER_CLASSES[Object.keys(OLIVER_CLASSES).find(k => OLIVER_CLASSES[k].pairedWith === classId)]?.id ? `${oc.color}88` : undefined }}
            >
              <span className="text-2xl">{oc.icon}</span>
              <div className="flex-1">
                <p className="text-xs font-bold text-text">{oc.name}</p>
                <p className="mt-0.5 text-[10px] text-text-muted leading-tight">{oc.description}</p>
              </div>
              {oc.pairedWith === classId && (
                <span className="rounded-full bg-primary/20 px-1.5 py-0.5 text-[9px] font-bold text-primary">Sinergia</span>
              )}
            </button>
          ))}
        </div>
      </div>
    )
  }

  // 'player' step
  return (
    <div className="absolute bottom-20 left-1/2 z-30 w-72 -translate-x-1/2 overflow-hidden rounded-2xl border bg-surface/95 shadow-2xl backdrop-blur sm:w-80"
      style={{ borderColor: `${cls.color}66` }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3"
        style={{ background: `linear-gradient(135deg, ${cls.color}22, ${cls.color}08)` }}>
        <span className="text-4xl">{cls.icon}</span>
        <div>
          <p className="text-base font-black text-text">{cls.name}</p>
          <p className="text-xs text-text-muted">{cls.description}</p>
        </div>
        <button type="button" onClick={onClose} className="ml-auto text-text-muted hover:text-text">✕</button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-5 gap-1.5 px-4 py-3">
        {statEntries.map(([stat, val]) => (
          <div key={stat} className="flex flex-col items-center gap-1">
            <div className="flex flex-col-reverse gap-0.5">
              {Array.from({ length: maxStat }).map((_, i) => (
                <div key={i} className="h-2.5 w-3 rounded-sm"
                  style={{ background: i < val ? cls.color : 'rgba(255,255,255,0.08)' }} />
              ))}
            </div>
            <span className="text-[9px] font-bold uppercase text-text-muted">{stat.slice(0, 3)}</span>
          </div>
        ))}
      </div>

      {/* Starting skills */}
      <div className="border-t border-border px-4 py-2">
        <p className="mb-1.5 text-[9px] font-bold uppercase tracking-widest text-text-muted">Habilidades iniciales</p>
        <div className="flex gap-2">
          {cls.startSkills.map((sid) => {
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

      {/* CTA */}
      <div className="px-4 pb-4 pt-2">
        <button
          type="button"
          onClick={() => onSelectPlayer(classId)}
          className="w-full rounded-xl py-2.5 text-sm font-black text-white transition-all hover:scale-105"
          style={{ background: `linear-gradient(135deg, ${cls.color}, ${cls.color}cc)`, boxShadow: `0 4px 16px ${cls.color}44` }}
        >
          Elegir {cls.name}
        </button>
      </div>
    </div>
  )
}

// roomMode / anfiteatroMode / worldTreeMode come from the route.
export default function VRPage({ roomMode = false, anfiteatroMode = false, worldTreeMode = false }) {
  const navigate = useNavigate()
  const keysRef = useMovementKeys()
  const { camera: cameraRef, onPointerDown, onPointerMove, onPointerUp, onWheel } = useCameraControls()
  const selectedMascotId = useMascotStore((s) => s.selectedMascotId)
  const selectedSkinId = useMascotStore((s) => s.selectedSkinId)
  const mascot = getMascotById(selectedMascotId)
  const skin = getSkinById(selectedSkinId)
  const settingsMascotName = useSettingsStore((s) => s.mascotName)
  const profile = useAuthStore((s) => s.profile)
  const session = useAuthStore((s) => s.session)
  const accountName =
    profile?.display_name ||
    session?.user?.user_metadata?.name ||
    session?.user?.user_metadata?.full_name ||
    session?.user?.email?.split('@')[0]
  const chatAuthor = accountName || settingsMascotName || mascot.name

  const playerPositionRef = useRef(null)
  const playerRotationRef = useRef(0)
  const playerId = useRef(crypto.randomUUID()).current
  const connected = useVrPresenceStore((s) => s.connected)
  const remotePlayerCount = useVrPresenceStore((s) => Object.keys(s.players).length)
  // Room, Anfiteatro, and WorldTree are private — no shared presence channel.
  const isPrivateWorld = roomMode || anfiteatroMode || worldTreeMode
  const vrAvatarId = useGameStore((s) => s.player.avatarId)
  const { remoteTransformsRef, sendChatMessage, kicked, channelRef } = useVrMultiplayer({
    playerId,
    name: chatAuthor,
    mascotId: mascot.id,
    skinId: skin.id,
    avatarId: vrAvatarId,
    accountId: session?.user?.id ?? null,
    positionRef: playerPositionRef,
    rotationRef: playerRotationRef,
    enabled: !isPrivateWorld,
  })
  const [vrReady, setVrReady] = useState(false)
  const [nearClassNodeId, setNearClassNodeId] = useState(null)
  const [classSelectionStep, setClassSelectionStep] = useState('player') // 'player' | 'oliver' | 'done'
  const selectPlayerClass = useGameStore((s) => s.selectPlayerClass)
  const selectOliverClass = useGameStore((s) => s.selectOliverClass)
  const playerClass = useGameStore((s) => s.player.class)
  const oliverClass = useGameStore((s) => s.oliver.class)
  const worldTreeCompleted = useGameStore((s) => s.worldTreeCompleted)
  const [nearbyNpcId, setNearbyNpcId] = useState(null)
  const [activeNpcId, setActiveNpcId] = useState(null)
  const [nearPortal, setNearPortal] = useState(false)
  const [portalMenuOpen, setPortalMenuOpen] = useState(false)
  const [mapOpen, setMapOpen] = useState(false)
  const [chatOpen, setChatOpen] = useState(false)
  const [chatPrefill, setChatPrefill] = useState(null)
  const [selectedPlayer, setSelectedPlayer] = useState(null)
  const friends = useFriendsStore((s) => s.friends)
  const addFriend = useFriendsStore((s) => s.addFriend)
  const removeFriend = useFriendsStore((s) => s.removeFriend)
  const whisperTarget = useWorldChatStore((s) => s.whisperTarget)
  const accepted = useGlobalMissionsStore((s) => s.accepted)
  const claimed = useGlobalMissionsStore((s) => s.claimed)
  const acceptMission = useGlobalMissionsStore((s) => s.acceptMission)
  const claimReward = useGlobalMissionsStore((s) => s.claimReward)
  const missionState = useMissionState()
  const openPanel = useMascotCompanionStore((s) => s.openPanel)

  useEffect(() => {
    if (nearbyNpcId !== activeNpcId) setActiveNpcId(null)
  }, [nearbyNpcId, activeNpcId])

  useEffect(() => {
    const motd = anfiteatroMode
      ? `🎭 Anfiteatro Oliver, ${chatAuthor}. Disfruta el espectáculo. Pulsa E junto al portal para volver al Campus.`
      : roomMode
        ? `Tu Room privada, ${chatAuthor}. Aquí solo apareces tú. Acércate al portal 🌀 y pulsa E para volver al Campus.`
        : `Bienvenido al Campus, ${chatAuthor}. Pulsa C para chatear, P para tu personaje, M para el mapa, o usa /w nombre mensaje para susurrar.`
    useWorldChatStore.getState().addSystemMessage(motd)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 'E' near a portal: private worlds exit to campus; campus opens transport menu.
  useEffect(() => {
    const handleDown = (e) => {
      if (isTypingTarget(e.target)) return
      if (e.key === 'Escape') { setPortalMenuOpen(false); return }
      if (e.key.toLowerCase() === 'e' && nearPortal) {
        if (isPrivateWorld) navigate('/vr')
        else setPortalMenuOpen(true)
      }
    }
    window.addEventListener('keydown', handleDown)
    return () => window.removeEventListener('keydown', handleDown)
  }, [nearPortal, isPrivateWorld, navigate])

  useWorldShortcuts({
    onToggleMap: () => setMapOpen((open) => !open),
    onOpenCharacter: () => openPanel('chat'),
    onOpenInventory: () => openPanel('items'),
    onToggleChat: (value) => setChatOpen((open) => (typeof value === 'boolean' ? value : !open)),
  })

  // Class is now selected during account creation onboarding — no auto-redirect needed.

  useEffect(() => {
    if (!whisperTarget) return
    setChatPrefill({ text: `/w ${whisperTarget} `, key: Date.now() })
    setChatOpen(true)
    useWorldChatStore.getState().clearWhisperTarget()
  }, [whisperTarget])

  const handleContextMenu = (e) => {
    e.preventDefault()
    if (!nearbyNpcId) return
    setActiveNpcId((current) => (current === nearbyNpcId ? null : nearbyNpcId))
  }

  // Lighting themes per world mode
  const bgColor = anfiteatroMode ? '#0a0810' : roomMode ? '#3d2a1c' : worldTreeMode ? '#05120a' : '#87ceeb'
  const fogArgs = anfiteatroMode ? ['#0a0810', 20, 90] : roomMode ? ['#3d2a1c', 12, 36] : worldTreeMode ? ['#05120a', 35, 100] : ['#c8e8f4', 50, 165]

  return (
    <div className="flex h-dvh flex-col bg-background text-text">
      <AppTopBar />
      {!roomMode && <PageVideoModal pageKey="vr" />}

      <div
        className="relative flex-1"
        style={{ touchAction: 'none' }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
        onWheel={onWheel}
        onContextMenu={handleContextMenu}
      >
        <Canvas
          camera={{ position: [0, 1.6, 3.4], fov: 58 }}
          dpr={[1, 1.5]}
          gl={{ powerPreference: 'default', antialias: true }}
          onCreated={({ gl }) => {
            const canvas = gl.domElement
            const handleLost = (e) => e.preventDefault()
            canvas.addEventListener('webglcontextlost', handleLost, false)
          }}
        >
          <color attach="background" args={[bgColor]} />
          <fog attach="fog" args={fogArgs} />
          {/* Lighting: Anfiteatro = moody stage spots, Room = firelight, WorldTree = mystic, Campus = summer sun */}
          <ambientLight
            intensity={anfiteatroMode ? 0.25 : roomMode ? 0.55 : worldTreeMode ? 1.4 : 0.85}
            color={anfiteatroMode ? '#c0a0ff' : roomMode ? '#ffcc88' : worldTreeMode ? '#ccffdd' : '#d8eaf8'}
          />
          <directionalLight
            position={[20, 30, 10]}
            intensity={anfiteatroMode ? 0.6 : roomMode ? 0.4 : worldTreeMode ? 1.0 : 1.1}
            color={anfiteatroMode ? '#ffffff' : roomMode ? '#ffaa44' : worldTreeMode ? '#ccffe8' : '#fff8d8'}
          />
          {roomMode && <directionalLight position={[0, 2, -8]} intensity={0.7} color="#ff7722" />}
          {anfiteatroMode && <directionalLight position={[0, ANFI_H - 1, ANFI_STAGE_Z]} intensity={1.2} color="#fff5cc" />}
          {anfiteatroMode && <pointLight position={[0, ANFI_H * 0.7, 0]} intensity={0.5} color="#9060ff" distance={80} />}
          {worldTreeMode && <hemisphereLight args={['#44ffaa', '#0d2a0a', 1.2]} />}
          {worldTreeMode && <pointLight position={[0, 6, 0]} intensity={6.0} color="#88ffaa" distance={60} decay={1.5} />}
          {worldTreeMode && <pointLight position={[0, 22, 0]} intensity={3.0} color="#44ffaa" distance={80} />}
          {worldTreeMode && <pointLight position={[0, 3, 18]} intensity={2.0} color="#aaffee" distance={35} />}
          {worldTreeMode && <directionalLight position={[0, 8, 20]} intensity={0.8} color="#ccffdd" />}
          <Suspense fallback={null}>
            <World
              mascot={mascot}
              skin={skin}
              keysRef={keysRef}
              cameraRef={cameraRef}
              playerPositionRef={playerPositionRef}
              playerRotationRef={playerRotationRef}
              remoteTransformsRef={remoteTransformsRef}
              onNearbyNpcChange={setNearbyNpcId}
              onNearPortalChange={setNearPortal}
              onNearClassNodeChange={setNearClassNodeId}
              authorName={chatAuthor}
              playerId={playerId}
              onSelectPlayer={setSelectedPlayer}
              worldTreeMode={worldTreeMode}
              roomMode={roomMode}
              anfiteatroMode={anfiteatroMode}
            />
          </Suspense>
        </Canvas>

        {/* Portal prompt — clickable button when near a portal */}
        {nearPortal && !portalMenuOpen && (
          <button
            type="button"
            onClick={() => isPrivateWorld ? navigate('/vr') : setPortalMenuOpen(true)}
            className="absolute bottom-24 left-1/2 -translate-x-1/2 cursor-pointer rounded-full bg-surface/95 px-4 py-1.5 text-xs font-semibold text-text shadow-lg backdrop-blur transition-colors hover:bg-surface sm:bottom-20"
          >
            {isPrivateWorld ? '🌀 Haz clic o pulsa E para volver al Campus' : '🌀 Haz clic o pulsa E para abrir el portal'}
          </button>
        )}

        {/* Transport destination picker — opens when clicking/pressing E at campus portal */}
        {portalMenuOpen && !isPrivateWorld && (
          <TransportMenu onNavigate={(path) => navigate(path)} onClose={() => setPortalMenuOpen(false)} />
        )}

        {/* NPC mission card / nearby-NPC hint (campus only) */}
        {!isPrivateWorld && (
          activeNpcId ? (
            <NpcMissionCard
              npcId={activeNpcId}
              accepted={accepted}
              claimed={claimed}
              missionState={missionState}
              onAccept={acceptMission}
              onClaim={claimReward}
              onClose={() => setActiveNpcId(null)}
            />
          ) : (
            nearbyNpcId && !nearPortal && (
              <div className="pointer-events-none absolute bottom-24 left-1/2 -translate-x-1/2 rounded-full bg-surface/90 px-4 py-1.5 text-xs font-semibold text-text shadow-lg backdrop-blur sm:bottom-20">
                {getVrNpcById(nearbyNpcId)?.emoji} Clic derecho para hablar con {getVrNpcById(nearbyNpcId)?.name}
              </div>
            )
          )
        )}

        {!isPrivateWorld && (
          <WorldMap open={mapOpen} onClose={() => setMapOpen(false)} playerPositionRef={playerPositionRef} />
        )}
        <WorldChat
          open={chatOpen}
          onClose={() => setChatOpen(false)}
          onOpen={() => setChatOpen(true)}
          authorName={chatAuthor}
          playerId={playerId}
          onSend={sendChatMessage}
          prefill={chatPrefill}
        />

        {!isPrivateWorld && selectedPlayer && (
          <PlayerMenu
            player={selectedPlayer}
            isFriend={friends.includes(selectedPlayer.name)}
            onWhisper={() => {
              setChatPrefill({ text: `/w ${selectedPlayer.name} `, key: Date.now() })
              setChatOpen(true)
              setSelectedPlayer(null)
            }}
            onToggleFriend={() => {
              if (friends.includes(selectedPlayer.name)) {
                removeFriend(selectedPlayer.name)
              } else {
                addFriend(selectedPlayer.name)
              }
            }}
            onClose={() => setSelectedPlayer(null)}
          />
        )}

        <CameraSettingsMenu />

        {/* Voice chat panel — always available */}
        <VoicePanel playerId={playerId} name={chatAuthor} channelRef={channelRef} />

        {/* Connection status badge — hidden in private worlds */}
        {!isPrivateWorld && (
          <div className="pointer-events-none absolute right-4 top-4 z-20 rounded-full bg-surface/90 px-3 py-1 text-xs font-semibold text-text shadow-lg backdrop-blur">
            {isVrRealtimeAvailable() ? (
              connected ? (
                <span>🟢 Conectado · {remotePlayerCount} {remotePlayerCount === 1 ? 'jugador' : 'jugadores'} más</span>
              ) : (
                <span>🟡 Conectando…</span>
              )
            ) : (
              <span>⚪ Modo sin conexión</span>
            )}
          </div>
        )}

        {/* World badge */}
        {anfiteatroMode && (
          <div className="pointer-events-none absolute right-4 top-4 z-20 rounded-full bg-surface/90 px-3 py-1 text-xs font-semibold text-text shadow-lg backdrop-blur">
            🎭 Anfiteatro Oliver
          </div>
        )}
        {roomMode && (
          <div className="pointer-events-none absolute right-4 top-4 z-20 rounded-full bg-surface/90 px-3 py-1 text-xs font-semibold text-text shadow-lg backdrop-blur">
            🏠 Mi Room (privada)
          </div>
        )}

        <div className="pointer-events-none absolute bottom-4 left-1/2 hidden -translate-x-1/2 rounded-xl bg-surface/90 px-4 py-2 text-center text-sm text-text shadow-lg backdrop-blur sm:block">
          <strong>W A S D</strong> o flechas para moverte · <strong>espacio</strong> saltar ·{' '}
          {!isPrivateWorld && <><strong>M</strong> mapa · <strong>P</strong> personaje · <strong>B</strong> inventario · <strong>C</strong> chat · </>}
          <strong>E</strong> portal · arrastra para mirar · <strong>rueda</strong> zoom 🎮
        </div>

        {/* VR HUD: player portrait + skill action bar */}
        <VrHud hidden={worldTreeMode} />

        {/* WorldTree class selection card */}
        {worldTreeMode && nearClassNodeId && classSelectionStep !== 'done' && (
          <ClassPreviewCard
            classId={nearClassNodeId}
            step={classSelectionStep}
            playerClass={playerClass}
            oliverClass={oliverClass}
            onSelectPlayer={(id) => {
              selectPlayerClass(id)
              setClassSelectionStep('oliver')
            }}
            onSelectOliver={(id) => {
              selectOliverClass(id)
              setClassSelectionStep('done')
              setTimeout(() => navigate('/vr'), 1800)
            }}
            onClose={() => setNearClassNodeId(null)}
          />
        )}

        {/* WorldTree badge */}
        {worldTreeMode && (
          <div className="pointer-events-none absolute right-4 top-4 z-20 rounded-full bg-surface/90 px-3 py-1 text-xs font-semibold text-text shadow-lg backdrop-blur">
            🌳 Árbol del Mundo
          </div>
        )}

        {/* VR Loading Screen — shown until user presses any key */}
        {!vrReady && (
          <VrLoadingScreen
            onEnter={() => setVrReady(true)}
            worldName={worldTreeMode ? 'Árbol del Mundo' : anfiteatroMode ? 'Anfiteatro' : roomMode ? 'Mi Room' : 'Campus VR'}
          />
        )}

        <VirtualJoystick keysRef={keysRef} hidden={chatOpen} />
        <MobileButtons keysRef={keysRef} hidden={chatOpen} onOpenChat={() => setChatOpen(true)} />

        {kicked && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 p-4 text-center">
            <div className="max-w-sm rounded-2xl bg-surface p-6 shadow-2xl">
              <p className="mb-2 text-3xl">🔌</p>
              <p className="mb-2 text-base font-bold text-text">Sesión desconectada</p>
              <p className="mb-4 text-sm text-text-muted">
                Tu cuenta se conectó al Campus desde otra ventana o pestaña. Solo se permite una
                sesión activa por cuenta, así que esta se desconectó.
              </p>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-background transition-colors hover:bg-primary-hover"
              >
                Recargar
              </button>
            </div>
          </div>
        )}
      </div>

      <MascotCompanion hideViewport />
    </div>
  )
}
