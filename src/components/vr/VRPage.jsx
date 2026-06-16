import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
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
  { pos: [0, 0, -40], color: '#5b3a29', w: 14, d: 9, h: 7, label: '🎭', name: 'Auditorio' },
  { pos: [40, 0, 0],  color: '#1a3a5c', w: 9, d: 14, h: 8, label: '📚', name: 'Biblioteca' },
  { pos: [0, 0, 40],  color: '#2e5e4e', w: 14, d: 9, h: 6, label: '🍽️', name: 'Cafetería' },
  { pos: [-40, 0, 0], color: '#7a3b00', w: 9, d: 14, h: 6, label: '🎨', name: 'Artes' },
]

// Dormitory blocks — 8 buildings in the mid-outer campus ring.
const CAMPUS_DORMS = [
  { pos: [58, 0, 28],  color: '#7a6a5a' },
  { pos: [-58, 0, 28], color: '#6a7a5a' },
  { pos: [58, 0, -28], color: '#5a6a7a' },
  { pos: [-58, 0, -28],color: '#7a5a6a' },
  { pos: [28, 0, 60],  color: '#6a5a7a' },
  { pos: [-28, 0, 60], color: '#5a7a6a' },
  { pos: [28, 0, -62], color: '#7a7a5a' },
  { pos: [-28, 0, -62],color: '#5a7a7a' },
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

// Private Room constants — larger cabin-style interior space.
const ROOM_SIZE = 22
const ROOM_HEIGHT = 5
const ROOM_EXIT_PORTAL_POSITION = [0, 0, -ROOM_SIZE / 2 + 2]

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

// Canadian northern university campus — snow-covered ground, spruce/pine
// forest perimeter, frozen lake, stone academic buildings with steep A-frame
// roofs, log-trimmed NPC cabins, and a Portal Nexus plaza in the south.
// All geometry is THREE.js primitives; InstancedMesh keeps draw calls low.
function useTestGround() {
  return useMemo(() => {
    const group = new THREE.Group()

    // ── Shared materials ────────────────────────────────────────────────────
    // Snow / winter palette
    const matSnow       = new THREE.MeshStandardMaterial({ color: '#dce8f0' })
    const matSnowDeep   = new THREE.MeshStandardMaterial({ color: '#c8d8e8' })
    const matIcePlaza   = new THREE.MeshStandardMaterial({ color: '#b8cfe0' })
    const matSnowPath   = new THREE.MeshStandardMaterial({ color: '#c0d0dc', roughness: 0.9 })
    const matIceRoad    = new THREE.MeshStandardMaterial({ color: '#a8b8c8', roughness: 0.6 })
    const matFrozenLake = new THREE.MeshStandardMaterial({ color: '#8ab0cc', emissive: '#6090aa', emissiveIntensity: 0.08, roughness: 0.1, metalness: 0.2 })
    const matIceRing    = new THREE.MeshStandardMaterial({ color: '#ffffff', transparent: true, opacity: 0.6 })
    // Wood / stone
    const matLogWall    = new THREE.MeshStandardMaterial({ color: '#6b4a30' })
    const matLogRoof    = new THREE.MeshStandardMaterial({ color: '#3a2818' })
    const matStoneBld   = new THREE.MeshStandardMaterial({ color: '#7a8090' })
    const matStoneRoof  = new THREE.MeshStandardMaterial({ color: '#3a3850' })
    const matSnowCap    = new THREE.MeshStandardMaterial({ color: '#eaf2f8' })
    const matWindowWarm = new THREE.MeshStandardMaterial({ color: '#ffe8a0', emissive: '#ffd060', emissiveIntensity: 0.4 })
    const matStep       = new THREE.MeshStandardMaterial({ color: '#909ab0' })
    const matGatePost   = new THREE.MeshStandardMaterial({ color: '#8a6a50' })
    // Trees
    const matTrunk      = new THREE.MeshStandardMaterial({ color: '#4a3020' })
    const matPineA      = new THREE.MeshStandardMaterial({ color: '#1e4a28' })
    const matPineB      = new THREE.MeshStandardMaterial({ color: '#183820' })
    const matPineSnow   = new THREE.MeshStandardMaterial({ color: '#ddeef8' })
    // Lamps
    const matPole       = new THREE.MeshStandardMaterial({ color: '#1a1a22' })
    const matBulb       = new THREE.MeshStandardMaterial({ color: '#ffe9a8', emissive: '#ffe9a8', emissiveIntensity: 1.6 })
    // Fence wall
    const matFence      = new THREE.MeshStandardMaterial({ color: '#5a4a38' })

    // ── Path helper ─────────────────────────────────────────────────────────
    const addPath = (x1, z1, x2, z2, width, mat = matSnowPath) => {
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

    // ── Snow ground disc ─────────────────────────────────────────────────────
    const ground = new THREE.Mesh(new THREE.CircleGeometry(GROUND_RADIUS, 72), matSnow)
    ground.rotation.x = -Math.PI / 2
    ground.userData.isFloor = true
    group.add(ground)

    // Deeper snow perimeter (r=62 → 90)
    const outerSnow = new THREE.Mesh(new THREE.RingGeometry(62, GROUND_RADIUS, 72), matSnowDeep)
    outerSnow.rotation.x = -Math.PI / 2
    outerSnow.position.y = 0.005
    outerSnow.userData.isFloor = true
    group.add(outerSnow)

    // ── Ring roads (icy compacted paths) ────────────────────────────────────
    ;[[22, 25], [48, 52], [74, 77]].forEach(([ri, ro]) => {
      const ring = new THREE.Mesh(new THREE.RingGeometry(ri, ro, 64), matIceRoad)
      ring.rotation.x = -Math.PI / 2
      ring.position.y = 0.012
      ring.userData.isFloor = true
      group.add(ring)
    })

    // ── Central ice plaza ────────────────────────────────────────────────────
    const plaza = new THREE.Mesh(new THREE.CircleGeometry(9, 8), matIcePlaza)
    plaza.rotation.x = -Math.PI / 2
    plaza.position.y = 0.018
    plaza.userData.isFloor = true
    group.add(plaza)

    // ── Frozen fountain (ice + stone) ────────────────────────────────────────
    const stoneMat = new THREE.MeshStandardMaterial({ color: '#8090a0' })
    const fBase = new THREE.Mesh(new THREE.CylinderGeometry(2.4, 2.6, 0.38, 20), stoneMat)
    fBase.position.set(0, 0.19, 0)
    group.add(fBase)
    // Ice surface inside bowl
    const fIce = new THREE.Mesh(new THREE.CircleGeometry(1.9, 20), matFrozenLake)
    fIce.rotation.x = -Math.PI / 2
    fIce.position.set(0, 0.42, 0)
    fIce.userData.isFloor = true
    group.add(fIce)
    // Stone spire with snow cap
    const fSpire = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.18, 2.0, 8), stoneMat)
    fSpire.position.set(0, 1.38, 0)
    group.add(fSpire)
    const fSnowCap = new THREE.Mesh(new THREE.ConeGeometry(0.4, 0.5, 8), matSnowCap)
    fSnowCap.position.set(0, 2.63, 0)
    group.add(fSnowCap)

    // ── Main paths (snowed-over walkways) ────────────────────────────────────
    addPath(0, 0, 0, -GROUND_RADIUS * 0.88, 7)
    addPath(0, 0, 0,  GROUND_RADIUS * 0.88, 7)
    addPath(0, 0,  GROUND_RADIUS * 0.88, 0, 7)
    addPath(0, 0, -GROUND_RADIUS * 0.88, 0, 7)
    VR_NPCS.forEach((npc) => {
      const [nx, , nz] = npc.position
      const dist = Math.hypot(nx, nz)
      addPath(0, 0, nx * (50 / dist), nz * (50 / dist), 5)
    })

    // ── NPC log cabins ───────────────────────────────────────────────────────
    // Small log-cabin style huts — dark wood walls, steep A-frame roof, warm window
    VR_NPCS.forEach((npc, i) => {
      const [x, , z] = npc.position
      const h = 3.0 + (i % 3) * 0.7
      const bld = new THREE.Mesh(new THREE.BoxGeometry(BUILDING_SIZE + 0.6, h, BUILDING_SIZE + 0.6), matLogWall)
      bld.position.set(x * NPC_BUILDING_OFFSET, h / 2, z * NPC_BUILDING_OFFSET)
      group.add(bld)
      // A-frame roof
      const roof = new THREE.Mesh(new THREE.ConeGeometry(3.2, 2.8, 4), matLogRoof)
      roof.position.set(x * NPC_BUILDING_OFFSET, h + 1.4, z * NPC_BUILDING_OFFSET)
      roof.rotation.y = Math.PI / 4
      group.add(roof)
      // Snow on roof
      const rSnow = new THREE.Mesh(new THREE.ConeGeometry(2.9, 0.6, 4), matSnowCap)
      rSnow.position.set(x * NPC_BUILDING_OFFSET, h + 2.9, z * NPC_BUILDING_OFFSET)
      rSnow.rotation.y = Math.PI / 4
      group.add(rSnow)
      // Warm window glow
      const win = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.7, 0.1), matWindowWarm)
      const stepAngle = Math.atan2(x, z)
      win.position.set(
        x * NPC_BUILDING_OFFSET - Math.sin(stepAngle) * (BUILDING_SIZE / 2 + 0.35),
        h * 0.6,
        z * NPC_BUILDING_OFFSET - Math.cos(stepAngle) * (BUILDING_SIZE / 2 + 0.35),
      )
      group.add(win)
      // Stone steps
      const steps = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.25, 1.0), matStep)
      steps.position.set(
        x * NPC_BUILDING_OFFSET - Math.sin(stepAngle) * (BUILDING_SIZE / 2 + 0.6),
        0.125,
        z * NPC_BUILDING_OFFSET - Math.cos(stepAngle) * (BUILDING_SIZE / 2 + 0.6),
      )
      group.add(steps)
    })

    // ── Major Academic Buildings (stone, steep roofs) ────────────────────────
    CAMPUS_ACADEMIC.forEach(({ pos, color, w, d, h, label }) => {
      const [bx, , bz] = pos
      // Stone body (desaturated version of the original color)
      const bldMat = new THREE.MeshStandardMaterial({ color })
      const bld = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), bldMat)
      bld.position.set(bx, h / 2, bz)
      group.add(bld)
      // Steep dark roof
      const roof = new THREE.Mesh(new THREE.BoxGeometry(w + 0.6, 0.4, d + 0.6), matStoneRoof)
      roof.position.set(bx, h + 0.2, bz)
      group.add(roof)
      // Snow on roof edge
      const rSnow = new THREE.Mesh(new THREE.BoxGeometry(w + 0.8, 0.28, d + 0.8), matSnowCap)
      rSnow.position.set(bx, h + 0.38, bz)
      group.add(rSnow)
      // Warm windows
      const winMat = matWindowWarm
      const win = new THREE.Mesh(new THREE.BoxGeometry(w * 0.6, h * 0.22, 0.12), winMat)
      const ang = Math.atan2(bx, bz)
      win.position.set(
        bx - Math.sin(ang) * (d / 2 + 0.06),
        h * 0.52,
        bz - Math.cos(ang) * (d / 2 + 0.06),
      )
      group.add(win)
      // Steps
      const stepsW = Math.min(w, d) * 0.55
      const steps = new THREE.Mesh(new THREE.BoxGeometry(stepsW, 0.28, 1.8), matStep)
      steps.position.set(bx - Math.sin(ang) * (d / 2 + 1.0), 0.14, bz - Math.cos(ang) * (d / 2 + 1.0))
      group.add(steps)
    })

    // ── Dormitory Blocks (stone with snow caps) ──────────────────────────────
    CAMPUS_DORMS.forEach(({ pos, color }) => {
      const [bx, , bz] = pos
      const dormH = 5.0
      const dorm = new THREE.Mesh(new THREE.BoxGeometry(7, dormH, 12), new THREE.MeshStandardMaterial({ color }))
      dorm.position.set(bx, dormH / 2, bz)
      group.add(dorm)
      const dormRoof = new THREE.Mesh(new THREE.BoxGeometry(7.4, 0.35, 12.4), matStoneRoof)
      dormRoof.position.set(bx, dormH + 0.175, bz)
      group.add(dormRoof)
      const dormSnow = new THREE.Mesh(new THREE.BoxGeometry(7.6, 0.22, 12.6), matSnowCap)
      dormSnow.position.set(bx, dormH + 0.33, bz)
      group.add(dormSnow)
    })

    // ── Frozen Lake (replaces sports field) — east side ──────────────────────
    const lake = new THREE.Mesh(new THREE.CircleGeometry(24, 48), matFrozenLake)
    lake.rotation.x = -Math.PI / 2
    lake.position.set(68, 0.016, 8)
    lake.userData.isFloor = true
    group.add(lake)
    // Ice ring lines (skating rink markings)
    ;[8, 16].forEach((r) => {
      const ring = new THREE.Mesh(new THREE.RingGeometry(r - 0.2, r + 0.2, 40), matIceRing)
      ring.rotation.x = -Math.PI / 2
      ring.position.set(68, 0.022, 8)
      group.add(ring)
    })
    // Snow banks around lake
    for (let i = 0; i < 12; i += 1) {
      const a = (i / 12) * Math.PI * 2
      const sb = new THREE.Mesh(new THREE.BoxGeometry(4, 0.7, 1.5), matSnowDeep)
      sb.position.set(68 + Math.cos(a) * 25.5, 0.35, 8 + Math.sin(a) * 25.5)
      sb.rotation.y = a
      group.add(sb)
    }

    // ── Portal Nexus (south end — future worlds) ─────────────────────────────
    // Stone platform for the nexus
    const nexusPlat = new THREE.Mesh(new THREE.CircleGeometry(26, 32), matIceRoad)
    nexusPlat.rotation.x = -Math.PI / 2
    nexusPlat.position.set(0, 0.016, 72)
    nexusPlat.userData.isFloor = true
    group.add(nexusPlat)
    // Decorative outer ring
    const nexusRing = new THREE.Mesh(new THREE.RingGeometry(24, 26.5, 32), matStep)
    nexusRing.rotation.x = -Math.PI / 2
    nexusRing.position.set(0, 0.02, 72)
    group.add(nexusRing)
    // Stone pillars marking the nexus entrance
    ;[-12, 12].forEach((ox) => {
      const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.6, 5, 8), matStep)
      pillar.position.set(ox, 2.5, 47)
      group.add(pillar)
      const cap = new THREE.Mesh(new THREE.SphereGeometry(0.7, 8, 6), matSnowCap)
      cap.position.set(ox, 5.35, 47)
      group.add(cap)
    })
    // "Portal Nexus" arch spanning the pillars
    const nexusArch = new THREE.Mesh(new THREE.BoxGeometry(27, 0.5, 0.5), matGatePost)
    nexusArch.position.set(0, 5.5, 47)
    group.add(nexusArch)

    // ── Sparse spruce/pine trees (InstancedMesh, 3 tiers: trunk, foliage, snow tip) ─
    const rng = (seed) => { const v = Math.sin(seed * 127.1) * 43758.5453; return v - Math.floor(v) }

    const rawTrees = []
    // Only ~40 trees, placed mainly in outer perimeter (r=50-88)
    for (let i = 0; i < 55; i += 1) {
      const angle = rng(i * 3.7) * Math.PI * 2
      const r = 52 + rng(i * 9.1) * 34
      // Avoid cardinal avenues and the nexus south zone
      const nearCardinal = [0, Math.PI / 2, Math.PI, Math.PI * 3 / 2].some(
        (ca) => Math.abs(((angle % (Math.PI * 2)) - ca + Math.PI * 4) % (Math.PI * 2)) < 0.15,
      )
      const inNexus = angle > Math.PI * 0.35 && angle < Math.PI * 0.65 && r > 58
      if (nearCardinal || inNexus) continue
      rawTrees.push({ x: Math.cos(angle) * r, z: Math.sin(angle) * r, s: 0.7 + rng(i * 11.7) * 0.7 })
    }

    const trunkGeo    = new THREE.CylinderGeometry(0.16, 0.24, 2.6, 7)
    const foliageGeoA = new THREE.ConeGeometry(1.1, 3.8, 7)  // tall narrow spruce
    const foliageGeoB = new THREE.ConeGeometry(0.75, 2.6, 7) // smaller upper cone
    const snowTipGeo  = new THREE.ConeGeometry(0.4, 1.0, 6)
    const dummy = new THREE.Object3D()

    const trunkInst  = new THREE.InstancedMesh(trunkGeo, matTrunk, rawTrees.length)
    const fol1Inst   = new THREE.InstancedMesh(foliageGeoA, matPineA, rawTrees.length)
    const fol2Inst   = new THREE.InstancedMesh(foliageGeoB, matPineB, rawTrees.length)
    const snowTipInst= new THREE.InstancedMesh(snowTipGeo, matPineSnow, rawTrees.length)
    // Disable raycasting on decorative trees
    ;[trunkInst, fol1Inst, fol2Inst, snowTipInst].forEach((m) => { m.raycast = () => {} })

    rawTrees.forEach(({ x, z, s }, i) => {
      dummy.rotation.set(0, 0, 0)
      dummy.scale.setScalar(s)
      dummy.position.set(x, 1.3 * s, z); dummy.updateMatrix()
      trunkInst.setMatrixAt(i, dummy.matrix)
      dummy.position.set(x, 3.2 * s, z); dummy.updateMatrix()
      fol1Inst.setMatrixAt(i, dummy.matrix)
      dummy.position.set(x, 5.0 * s, z); dummy.updateMatrix()
      fol2Inst.setMatrixAt(i, dummy.matrix)
      dummy.position.set(x, 6.5 * s, z); dummy.updateMatrix()
      snowTipInst.setMatrixAt(i, dummy.matrix)
    })
    trunkInst.instanceMatrix.needsUpdate = true
    fol1Inst.instanceMatrix.needsUpdate  = true
    fol2Inst.instanceMatrix.needsUpdate  = true
    snowTipInst.instanceMatrix.needsUpdate= true
    group.add(trunkInst); group.add(fol1Inst); group.add(fol2Inst); group.add(snowTipInst)

    // ── Iron lamp posts (InstancedMesh) ──────────────────────────────────────
    const lampPositions = []
    for (let i = 0; i < 14; i += 1) {
      const a = (i / 14) * Math.PI * 2
      lampPositions.push(new THREE.Vector3(Math.cos(a) * 23.5, 0, Math.sin(a) * 23.5))
    }
    ;[0, Math.PI / 2, Math.PI, Math.PI * 3 / 2].forEach((a) => {
      ;[15, 30, 44, 60].forEach((r) => {
        const perp = a + Math.PI / 2
        lampPositions.push(
          new THREE.Vector3(Math.cos(a) * r + Math.cos(perp) * 4.5, 0, Math.sin(a) * r + Math.sin(perp) * 4.5),
          new THREE.Vector3(Math.cos(a) * r - Math.cos(perp) * 4.5, 0, Math.sin(a) * r - Math.sin(perp) * 4.5),
        )
      })
    })
    const poleGeo  = new THREE.CylinderGeometry(0.07, 0.07, 4.2, 8)
    const bulbGeo  = new THREE.SphereGeometry(0.26, 10, 8)
    const poleInst = new THREE.InstancedMesh(poleGeo, matPole, lampPositions.length)
    const bulbInst = new THREE.InstancedMesh(bulbGeo, matBulb, lampPositions.length)
    lampPositions.forEach((pos, i) => {
      dummy.scale.setScalar(1); dummy.rotation.set(0, 0, 0)
      dummy.position.set(pos.x, 2.1, pos.z); dummy.updateMatrix()
      poleInst.setMatrixAt(i, dummy.matrix)
      dummy.position.set(pos.x, 4.35, pos.z); dummy.updateMatrix()
      bulbInst.setMatrixAt(i, dummy.matrix)
    })
    poleInst.instanceMatrix.needsUpdate = true
    bulbInst.instanceMatrix.needsUpdate = true
    group.add(poleInst); group.add(bulbInst)

    // ── Wooden perimeter fence + log gate posts ──────────────────────────────
    const FENCE_SEGS  = 72
    const fenceArcLen = (2 * Math.PI * GROUND_RADIUS) / FENCE_SEGS * 1.03
    const fenceGeo    = new THREE.BoxGeometry(fenceArcLen, 2.4, 0.5)
    const gateSegs    = new Set()
    ;[0, 18, 36, 54].forEach((b) => { gateSegs.add(b); gateSegs.add((b + 1) % FENCE_SEGS) })
    const fenceIdx    = Array.from({ length: FENCE_SEGS }, (_, i) => i).filter((i) => !gateSegs.has(i))
    const fenceInst   = new THREE.InstancedMesh(fenceGeo, matFence, fenceIdx.length)
    fenceIdx.forEach((idx, i) => {
      const a = (idx / FENCE_SEGS) * Math.PI * 2
      dummy.position.set(Math.sin(a) * GROUND_RADIUS, 1.2, Math.cos(a) * GROUND_RADIUS)
      dummy.rotation.set(0, a, 0); dummy.scale.setScalar(1); dummy.updateMatrix()
      fenceInst.setMatrixAt(i, dummy.matrix)
    })
    fenceInst.instanceMatrix.needsUpdate = true
    group.add(fenceInst)

    // Log gate posts at cardinal entrances
    ;[0, Math.PI / 2, Math.PI, Math.PI * 3 / 2].forEach((a) => {
      const sx = Math.sin(a); const cz = Math.cos(a)
      const px = Math.cos(a); const pz = -Math.sin(a)
      ;[-5.5, 5.5].forEach((off) => {
        const post = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.55, 5.5, 8), matGatePost)
        post.position.set(sx * GROUND_RADIUS + px * off, 2.75, cz * GROUND_RADIUS + pz * off)
        group.add(post)
        const cap = new THREE.Mesh(new THREE.ConeGeometry(0.65, 0.9, 8), matLogRoof)
        cap.position.set(sx * GROUND_RADIUS + px * off, 5.95, cz * GROUND_RADIUS + pz * off)
        group.add(cap)
        const capSnow = new THREE.Mesh(new THREE.ConeGeometry(0.55, 0.4, 8), matSnowCap)
        capSnow.position.set(sx * GROUND_RADIUS + px * off, 6.6, cz * GROUND_RADIUS + pz * off)
        group.add(capSnow)
      })
      const crossbar = new THREE.Mesh(new THREE.BoxGeometry(13.5, 0.4, 0.4), matGatePost)
      crossbar.position.set(sx * GROUND_RADIUS, 5.7, cz * GROUND_RADIUS)
      crossbar.rotation.y = a
      group.add(crossbar)
    })

    return { model: group, groundRayHeight: 22 }
  }, [])
}

// Canadian log cabin — warm interior with wood floor planks, horizontal log
// walls, a stone fireplace, bookshelf, desk, rug, and a frost-edged window.
// Walls are 1.2 units thick to prevent the player from passing through them.
function useRoomGround() {
  return useMemo(() => {
    const group = new THREE.Group()
    const hw = ROOM_SIZE / 2

    // ── Materials ─────────────────────────────────────────────────────────
    const matFloor    = new THREE.MeshStandardMaterial({ color: '#8b6234' })
    const matFloorDk  = new THREE.MeshStandardMaterial({ color: '#7a5428' })
    const matLogWall  = new THREE.MeshStandardMaterial({ color: '#6b4a2a' })
    const matLogBand  = new THREE.MeshStandardMaterial({ color: '#7e5c38' })
    const matCeiling  = new THREE.MeshStandardMaterial({ color: '#9b7848', side: THREE.BackSide })
    const matBeam     = new THREE.MeshStandardMaterial({ color: '#5a3c1e' })
    const matStone    = new THREE.MeshStandardMaterial({ color: '#6a6870' })
    const matFireGlow = new THREE.MeshStandardMaterial({ color: '#ff6a00', emissive: '#ff4400', emissiveIntensity: 0.8 })
    const matRug      = new THREE.MeshStandardMaterial({ color: '#7a2828' })
    const matRugPat   = new THREE.MeshStandardMaterial({ color: '#c0a028' })
    const matShelf    = new THREE.MeshStandardMaterial({ color: '#5a3c20' })
    const matBook     = [
      new THREE.MeshStandardMaterial({ color: '#1a3a6a' }),
      new THREE.MeshStandardMaterial({ color: '#6a1a1a' }),
      new THREE.MeshStandardMaterial({ color: '#1a5a2a' }),
      new THREE.MeshStandardMaterial({ color: '#4a3a1a' }),
    ]
    const matDesk     = new THREE.MeshStandardMaterial({ color: '#6b4a28' })
    const matLampBase = new THREE.MeshStandardMaterial({ color: '#3a3020' })
    const matLampGlow = new THREE.MeshStandardMaterial({ color: '#ffe8a0', emissive: '#ffcc60', emissiveIntensity: 0.9 })
    const matSnowWin  = new THREE.MeshStandardMaterial({ color: '#c8e8f8', emissive: '#88bce0', emissiveIntensity: 0.2, transparent: true, opacity: 0.65 })
    const matBed      = new THREE.MeshStandardMaterial({ color: '#2a4a6a' })
    const matPillow   = new THREE.MeshStandardMaterial({ color: '#e8ddd0' })

    // ── Plank floor (alternating dark/light strips) ───────────────────────
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(ROOM_SIZE, ROOM_SIZE), matFloor)
    floor.rotation.x = -Math.PI / 2
    floor.userData.isFloor = true
    group.add(floor)
    for (let p = -hw + 0.75; p < hw; p += 1.5) {
      const plank = new THREE.Mesh(new THREE.PlaneGeometry(0.9, ROOM_SIZE), matFloorDk)
      plank.rotation.x = -Math.PI / 2
      plank.position.set(p, 0.002, 0)
      plank.userData.isFloor = true
      group.add(plank)
    }

    // ── Thick log walls (1.2 unit thickness prevents wall-clipping) ───────
    const wallThick = 1.2
    const wallDefs = [
      { pos: [0, ROOM_HEIGHT / 2, -hw - wallThick / 2], size: [ROOM_SIZE + wallThick * 2, ROOM_HEIGHT, wallThick] },
      { pos: [0, ROOM_HEIGHT / 2,  hw + wallThick / 2], size: [ROOM_SIZE + wallThick * 2, ROOM_HEIGHT, wallThick] },
      { pos: [-hw - wallThick / 2, ROOM_HEIGHT / 2, 0], size: [wallThick, ROOM_HEIGHT, ROOM_SIZE] },
      { pos: [ hw + wallThick / 2, ROOM_HEIGHT / 2, 0], size: [wallThick, ROOM_HEIGHT, ROOM_SIZE] },
    ]
    wallDefs.forEach(({ pos, size }) => {
      const wall = new THREE.Mesh(new THREE.BoxGeometry(...size), matLogWall)
      wall.position.set(...pos)
      group.add(wall)
    })
    // Horizontal log bands (decorative lines on walls)
    ;[1.0, 2.0, 3.0, 4.0].forEach((y) => {
      wallDefs.forEach(({ pos, size }) => {
        const band = new THREE.Mesh(new THREE.BoxGeometry(size[0] + 0.02, 0.12, size[2] + 0.02), matLogBand)
        band.position.set(pos[0], y, pos[2])
        group.add(band)
      })
    })

    // ── Ceiling with wooden beams ─────────────────────────────────────────
    const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(ROOM_SIZE, ROOM_SIZE), matCeiling)
    ceiling.rotation.x = Math.PI / 2
    ceiling.position.y = ROOM_HEIGHT
    ceiling.userData.isFloor = true
    group.add(ceiling)
    for (let bx = -hw + 3; bx < hw; bx += 5) {
      const beam = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.22, ROOM_SIZE), matBeam)
      beam.position.set(bx, ROOM_HEIGHT - 0.12, 0)
      group.add(beam)
    }

    // ── Stone fireplace (north wall, center) ──────────────────────────────
    const fpBase = new THREE.Mesh(new THREE.BoxGeometry(3.5, 0.4, 1.2), matStone)
    fpBase.position.set(0, 0.2, -hw + 1.0)
    group.add(fpBase)
    const fpLeft  = new THREE.Mesh(new THREE.BoxGeometry(0.6, 2.8, 1.2), matStone)
    const fpRight = new THREE.Mesh(new THREE.BoxGeometry(0.6, 2.8, 1.2), matStone)
    fpLeft.position.set(-1.55,  1.4, -hw + 1.0)
    fpRight.position.set(1.55,  1.4, -hw + 1.0)
    group.add(fpLeft); group.add(fpRight)
    const fpLintel = new THREE.Mesh(new THREE.BoxGeometry(3.7, 0.45, 1.2), matStone)
    fpLintel.position.set(0, 2.9, -hw + 1.0)
    group.add(fpLintel)
    const fpChimney = new THREE.Mesh(new THREE.BoxGeometry(1.8, ROOM_HEIGHT - 3.0, 0.9), matStone)
    fpChimney.position.set(0, (ROOM_HEIGHT + 3.0) / 2, -hw + 0.8)
    group.add(fpChimney)
    // Fire glow
    const fpFire = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.0, 0.4), matFireGlow)
    fpFire.position.set(0, 0.9, -hw + 0.65)
    group.add(fpFire)

    // ── Frosty window (east wall) ─────────────────────────────────────────
    const win = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 1.8), matSnowWin)
    win.rotation.y = -Math.PI / 2
    win.position.set(hw - 0.01, 2.2, -3)
    group.add(win)
    // Window frame
    const wfMat = new THREE.MeshStandardMaterial({ color: '#5a3c20' })
    ;[[-0.55, 0, 0.09], [0.55, 0, 0.09]].forEach(([ox]) => {
      const side = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.9, 0.15), wfMat)
      side.rotation.y = -Math.PI / 2
      side.position.set(hw + 0.05, 2.2, -3 + ox * 2.2)
      group.add(side)
    })

    // ── Rug at center ─────────────────────────────────────────────────────
    const rug = new THREE.Mesh(new THREE.PlaneGeometry(7, 5), matRug)
    rug.rotation.x = -Math.PI / 2
    rug.position.set(0, 0.004, 2)
    rug.userData.isFloor = true
    group.add(rug)
    const rugBorder = new THREE.Mesh(new THREE.PlaneGeometry(6.2, 4.2), matRugPat)
    rugBorder.rotation.x = -Math.PI / 2
    rugBorder.position.set(0, 0.006, 2)
    group.add(rugBorder)

    // ── Bookshelf (west wall) ─────────────────────────────────────────────
    const shelfCase = new THREE.Mesh(new THREE.BoxGeometry(0.4, 3.5, 5.0), matShelf)
    shelfCase.position.set(-hw + 0.8, 1.75, 3)
    group.add(shelfCase)
    ;[0.8, 1.7, 2.6].forEach((sy) => {
      const shelf = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.1, 5.0), matShelf)
      shelf.position.set(-hw + 0.8, sy, 3)
      group.add(shelf)
      // Books on each shelf
      let bx = -2.1
      for (let bi = 0; bi < 7; bi += 1) {
        const bW = 0.28 + (bi % 3) * 0.08
        const book = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.65 + (bi % 2) * 0.1, bW), matBook[bi % 4])
        book.position.set(-hw + 0.82, sy + 0.42, 3 + bx + bW / 2)
        group.add(book)
        bx += bW + 0.04
      }
    })

    // ── Desk + lamp (east wall, north) ───────────────────────────────────
    const deskTop = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.12, 3.0), matDesk)
    deskTop.position.set(hw - 1.0, 1.8, -5)
    group.add(deskTop)
    ;[-1.3, 1.3].forEach((dz) => {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.8, 0.1), matDesk)
      leg.position.set(hw - 1.0, 0.9, -5 + dz)
      group.add(leg)
    })
    // Desk lamp
    const lampPole = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.7, 6), matLampBase)
    lampPole.position.set(hw - 1.0, 2.21, -5 + 1.1)
    group.add(lampPole)
    const lampShade = new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.28, 8, 1, true), matLampBase)
    lampShade.position.set(hw - 1.0, 2.66, -5 + 1.1)
    group.add(lampShade)
    const lampBulb = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 6), matLampGlow)
    lampBulb.position.set(hw - 1.0, 2.65, -5 + 1.1)
    group.add(lampBulb)

    // ── Bed (west wall, south corner) ────────────────────────────────────
    const bedBase = new THREE.Mesh(new THREE.BoxGeometry(3.5, 0.6, 5.0), matBed)
    bedBase.position.set(-hw + 2.35, 0.3, 5.5)
    group.add(bedBase)
    const mattress = new THREE.Mesh(new THREE.BoxGeometry(3.3, 0.35, 4.8), new THREE.MeshStandardMaterial({ color: '#e8d8c8' }))
    mattress.position.set(-hw + 2.35, 0.78, 5.5)
    group.add(mattress)
    const blanket = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.18, 3.5), new THREE.MeshStandardMaterial({ color: '#3a5a3a' }))
    blanket.position.set(-hw + 2.35, 1.0, 6.5)
    group.add(blanket)
    ;[-1.1, 1.1].forEach((ox) => {
      const pillow = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.22, 0.7), matPillow)
      pillow.position.set(-hw + 2.35 + ox, 1.02, 3.2)
      group.add(pillow)
    })
    // Headboard
    const headboard = new THREE.Mesh(new THREE.BoxGeometry(3.5, 1.2, 0.18), matShelf)
    headboard.position.set(-hw + 2.35, 1.2, 3.0)
    group.add(headboard)

    return { model: group, groundRayHeight: ROOM_HEIGHT + 2 }
  }, [])
}

// Casts a ray straight down from above the given x/z to find the scenery
// height directly beneath the player. Falls back to y = 0 if nothing is hit
// (e.g. the player walked off the edge of the model).
function getGroundY(raycaster, scenery, groundRayHeight, x, z) {
  raycaster.set(new THREE.Vector3(x, groundRayHeight, z), DOWN)
  const hits = raycaster.intersectObject(scenery, true)
  return hits.length > 0 ? hits[0].point.y : 0
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

    // Drop the player onto the real scenery surface the first time we run,
    // instead of starting at the world origin (y = 0).
    if (!initialized.current) {
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
        <MascotMesh mascot={mascot} skin={skin} />
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

    const tick = async () => {
      const text = await nextLine()
      if (cancelled) return
      const id = bubbleIdRef.current++
      setBubbles((current) => [...current, { id, text }].slice(-MAX_STACKED_BUBBLES))
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
        <MascotMesh mascot={mascot} skin={skin} />
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
// When roomMode=true, renders the private Room instead (RoomWorld) with no
// NPCs/multiplayer, just the player and an exit portal back to the campus.
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
  authorName,
  playerId,
  onSelectPlayer,
  roomMode,
}) {
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
        </div>
      )}
    </div>
  )
}

// Full-screen transport picker: 4 world cards (2 available, 2 locked future
// destinations). Opened by clicking/pressing E at the campus portal.
const TRANSPORT_WORLDS = [
  { id: 'campus',  emoji: '🏫', name: 'Campus Principal', desc: 'El mundo universitario', available: true,  path: '/vr' },
  { id: 'room',    emoji: '🏠', name: 'Mi Room',           desc: 'Tu espacio privado',     available: true,  path: '/vr/room' },
  { id: 'lab',     emoji: '🔬', name: 'Laboratorio',       desc: 'Próximamente…',          available: false, path: null },
  { id: 'ciudad',  emoji: '🌆', name: 'Ciudad',            desc: 'Próximamente…',          available: false, path: null },
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
          {/* Snow ground */}
          <circle cx="0" cy="0" r={GROUND_RADIUS} fill="#dce8f0" />
          <circle cx="0" cy="0" r="62" fill="#c8d8e8" opacity="0.5" />

          {/* Frozen lake (east) */}
          <circle cx="68" cy="8" r="24" fill="#8ab0cc" opacity="0.7" />
          <circle cx="68" cy="8" r="8" fill="none" stroke="#ffffff" strokeWidth="0.5" opacity="0.6" />
          <circle cx="68" cy="8" r="16" fill="none" stroke="#ffffff" strokeWidth="0.5" opacity="0.6" />
          <text x="68" y="9" fontSize="5" textAnchor="middle" dominantBaseline="middle">⛸️</text>

          {/* Ring roads (icy) */}
          <circle cx="0" cy="0" r="23.5" fill="none" stroke="#a8b8c8" strokeWidth="3" opacity="0.8" />
          <circle cx="0" cy="0" r="50" fill="none" stroke="#909ab0" strokeWidth="3.5" opacity="0.75" />
          <circle cx="0" cy="0" r="75.5" fill="none" stroke="#909ab0" strokeWidth="2.5" opacity="0.7" />

          {/* Cardinal avenues (snow paths) */}
          {[0, 90, 180, 270].map((deg) => {
            const rad = (deg * Math.PI) / 180
            return (
              <line
                key={deg}
                x1={Math.sin(rad) * 9} y1={Math.cos(rad) * 9}
                x2={Math.sin(rad) * (GROUND_RADIUS - 2)} y2={Math.cos(rad) * (GROUND_RADIUS - 2)}
                stroke="#c0d0dc" strokeWidth="6.5" opacity="0.65"
              />
            )
          })}

          {/* Central ice plaza */}
          <polygon points={
            Array.from({ length: 8 }, (_, i) => {
              const a = (i / 8) * Math.PI * 2
              return `${Math.cos(a) * 9},${Math.sin(a) * 9}`
            }).join(' ')
          } fill="#b8cfe0" />
          <circle cx="0" cy="0" r="5" fill="#8ab0cc" opacity="0.6" />
          {/* Frozen fountain */}
          <circle cx="0" cy="0" r="2.2" fill="#6090aa" opacity="0.9" />

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
                <rect x={bx - w / 2} y={bz - d / 2} width={w} height={d} fill={color} opacity="0.80" rx="0.6" />
                {/* Snow on roof */}
                <rect x={bx - w / 2 - 0.3} y={bz - d / 2 - 0.3} width={w + 0.6} height={d + 0.6} fill="none" stroke="#dce8f0" strokeWidth="0.8" opacity="0.6" rx="0.5" />
                <text x={bx} y={bz + 0.6} fontSize="4.5" textAnchor="middle" dominantBaseline="middle">{label}</text>
                <text x={bx} y={bz + d / 2 + 3.5} fontSize="2.2" textAnchor="middle" fill="#e8f0f8" opacity="0.9">{name}</text>
              </g>
            )
          })}

          {/* Dormitory blocks */}
          {CAMPUS_DORMS.map(({ pos, color }, i) => {
            const [bx, , bz] = pos
            return (
              <g key={i}>
                <rect x={bx - 3.5} y={bz - 6} width={7} height={12} fill={color} opacity="0.65" rx="0.4" />
                <rect x={bx - 3.5} y={bz - 6} width={7} height={1.5} fill="#dce8f0" opacity="0.5" rx="0.3" />
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

          {/* Perimeter wooden fence */}
          <circle cx="0" cy="0" r={GROUND_RADIUS - 0.5} fill="none" stroke="#6b4a30" strokeWidth="1.8" opacity="0.65" strokeDasharray="4 2.5" />

          {/* Log gate posts */}
          {[0, Math.PI / 2, Math.PI, Math.PI * 3 / 2].map((a, i) => (
            <g key={i}>
              <circle cx={Math.sin(a) * GROUND_RADIUS} cy={Math.cos(a) * GROUND_RADIUS} r="2.8" fill="#8a6a50" opacity="0.85" />
              <text x={Math.sin(a) * (GROUND_RADIUS - 6)} y={Math.cos(a) * (GROUND_RADIUS - 6)} fontSize="3.5" textAnchor="middle" dominantBaseline="middle">🏔️</text>
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
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            ref={inputRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Mensaje global, o /w nombre mensaje para susurrar…"
            className="flex-1 rounded-lg border border-border bg-background px-2 py-1.5 text-sm text-text outline-none focus:border-primary"
          />
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

// roomMode=true is passed from the /vr/room route — renders the private Room
// instead of the campus (no NPCs, no remote players, exit portal back to /vr).
export default function VRPage({ roomMode = false }) {
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
  // Room is private — no shared presence channel needed.
  const { remoteTransformsRef, sendChatMessage, kicked } = useVrMultiplayer({
    playerId,
    name: chatAuthor,
    mascotId: mascot.id,
    skinId: skin.id,
    accountId: session?.user?.id ?? null,
    positionRef: playerPositionRef,
    rotationRef: playerRotationRef,
    enabled: !roomMode,
  })
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
    const motd = roomMode
      ? `Tu Room privada, ${chatAuthor}. Aquí solo apareces tú. Acércate al portal 🌀 y pulsa E para volver al Campus.`
      : `Bienvenido al Campus, ${chatAuthor}. Pulsa C para chatear, P para tu personaje, M para el mapa, o usa /w nombre mensaje para susurrar.`
    useWorldChatStore.getState().addSystemMessage(motd)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 'E' near a portal: room mode exits straight to campus; campus mode opens
  // the transport menu so the player can choose their destination. Esc closes.
  useEffect(() => {
    const handleDown = (e) => {
      if (isTypingTarget(e.target)) return
      if (e.key === 'Escape') { setPortalMenuOpen(false); return }
      if (e.key.toLowerCase() === 'e' && nearPortal) {
        if (roomMode) navigate('/vr')
        else setPortalMenuOpen(true)
      }
    }
    window.addEventListener('keydown', handleDown)
    return () => window.removeEventListener('keydown', handleDown)
  }, [nearPortal, roomMode, navigate])

  useWorldShortcuts({
    onToggleMap: () => setMapOpen((open) => !open),
    onOpenCharacter: () => openPanel('chat'),
    onOpenInventory: () => openPanel('items'),
    onToggleChat: (value) => setChatOpen((open) => (typeof value === 'boolean' ? value : !open)),
  })

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

  // Room: warm amber firelight interior. Campus: overcast Canadian winter sky
  // (grey-blue), fog starts at r=38 and fades by r=148 (full campus visible).
  const bgColor = roomMode ? '#3a2a1a' : '#aabdcc'
  const fogArgs = roomMode ? ['#2a1e14', 6, 20] : ['#aabdcc', 38, 148]

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
          {/* Campus: cold overcast northern light. Room: warm firelight fill. */}
          <ambientLight intensity={roomMode ? 0.55 : 0.75} color={roomMode ? '#ffcc88' : '#c8d8f0'} />
          <directionalLight position={[10, 15, 8]} intensity={roomMode ? 0.4 : 0.9} color={roomMode ? '#ffaa44' : '#d0e0f0'} />
          {roomMode && <directionalLight position={[0, 2, -8]} intensity={0.7} color="#ff7722" />}
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
              authorName={chatAuthor}
              playerId={playerId}
              onSelectPlayer={setSelectedPlayer}
              roomMode={roomMode}
            />
          </Suspense>
        </Canvas>

        {/* Portal prompt — clickable button when near a portal */}
        {nearPortal && !portalMenuOpen && (
          <button
            type="button"
            onClick={() => roomMode ? navigate('/vr') : setPortalMenuOpen(true)}
            className="absolute bottom-24 left-1/2 -translate-x-1/2 cursor-pointer rounded-full bg-surface/95 px-4 py-1.5 text-xs font-semibold text-text shadow-lg backdrop-blur transition-colors hover:bg-surface sm:bottom-20"
          >
            {roomMode ? '🌀 Haz clic o pulsa E para volver al Campus' : '🌀 Haz clic o pulsa E para abrir el portal'}
          </button>
        )}

        {/* Transport destination picker — opens when clicking/pressing E at campus portal */}
        {portalMenuOpen && !roomMode && (
          <TransportMenu onNavigate={(path) => navigate(path)} onClose={() => setPortalMenuOpen(false)} />
        )}

        {/* NPC mission card / nearby-NPC hint (campus only) */}
        {!roomMode && (
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

        {!roomMode && (
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

        {!roomMode && selectedPlayer && (
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

        {/* Connection status badge — hidden in Room (no multiplayer) */}
        {!roomMode && (
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

        {/* Room badge */}
        {roomMode && (
          <div className="pointer-events-none absolute right-4 top-4 z-20 rounded-full bg-surface/90 px-3 py-1 text-xs font-semibold text-text shadow-lg backdrop-blur">
            🏠 Mi Room (privada)
          </div>
        )}

        <div className="pointer-events-none absolute bottom-4 left-1/2 hidden -translate-x-1/2 rounded-xl bg-surface/90 px-4 py-2 text-center text-sm text-text shadow-lg backdrop-blur sm:block">
          <strong>W A S D</strong> o flechas para moverte · <strong>espacio</strong> saltar ·{' '}
          {!roomMode && <><strong>M</strong> mapa · <strong>P</strong> personaje · <strong>B</strong> inventario · <strong>C</strong> chat · </>}
          <strong>E</strong> portal · arrastra para mirar · <strong>rueda</strong> zoom 🎮
        </div>

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
