import { Suspense, useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import AppTopBar from '../shared/AppTopBar'
import PageVideoModal from '../shared/PageVideoModal'
import MascotMesh from '../mascot/MascotMesh'
import MascotCompanion from '../mascot/MascotCompanion'
import { useMascotStore } from '../../stores/useMascotStore'
import { getMascotById } from '../../data/mascotRegistry'
import { getSkinById } from '../../data/skinsRegistry'

const MOVE_SPEED = 4
const TURN_SPEED = 8
// MascotMesh normalizes models to ~2 units tall. The scenery footprint is
// ~24 units wide, so we shrink the player to a human-ish scale that doesn't
// dwarf the structure it's walking around.
const PLAYER_SCALE = 0.12
const PLAYER_HEIGHT = PLAYER_SCALE * 2
// How far ahead of/around the player we check for walls before letting them
// move into something (in world units).
const COLLISION_RADIUS = PLAYER_HEIGHT * 0.6
const WALK_CYCLE_SPEED = 9
const WALK_BOB_HEIGHT = 0.07
const WALK_TILT = 0.06

// Camera orbit (mouse-drag controlled) around the player, zoomable with the
// mouse wheel or a two-finger pinch.
const CAMERA_DISTANCE = 3.4
const CAMERA_HEIGHT = 1.6
const CAMERA_PITCH_MIN = -0.5
const CAMERA_PITCH_MAX = 1.1
const MOUSE_SENSITIVITY = 0.005
const ZOOM_MIN = 1.5
const ZOOM_MAX = 18
const WHEEL_ZOOM_SPEED = 0.0025
const PINCH_ZOOM_SPEED = 0.02

// Jumping.
const GRAVITY = -20
const JUMP_SPEED = 7

// Warm "ruinas al atardecer" palette applied to any untextured surface of the
// scenery, so a flat-grey export still reads as a colorful scene.
const SCENERY_PALETTE = ['#c2703d', '#e8c477', '#9b5a3a', '#7d8597', '#3f9e7a', '#caa46c']

// Movement directions, shared by the keyboard listener and the on-screen
// touch D-pad: both just flip the same keys on/off.
const DIRECTION_KEYS = {
  up: ['w', 'arrowup'],
  down: ['s', 'arrowdown'],
  left: ['a', 'arrowleft'],
  right: ['d', 'arrowright'],
}

// Tracks which movement keys (WASD + arrows) are currently held down, from
// either a physical keyboard or the on-screen touch D-pad.
function useMovementKeys() {
  const keys = useRef({})

  useEffect(() => {
    const handleDown = (e) => {
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

// On-screen D-pad for phones/tablets: holds the same key flags the keyboard
// listener uses, so <Player> doesn't need to know where the input came from.
function TouchControls({ keysRef }) {
  const setKeys = (direction, value) => (e) => {
    e.stopPropagation()
    DIRECTION_KEYS[direction].forEach((key) => {
      keysRef.current[key] = value
    })
  }

  const setJump = (value) => (e) => {
    e.stopPropagation()
    keysRef.current[' '] = value
  }

  const Pad = ({ direction, label, className = '' }) => (
    <button
      type="button"
      onPointerDown={setKeys(direction, true)}
      onPointerUp={setKeys(direction, false)}
      onPointerLeave={setKeys(direction, false)}
      onContextMenu={(e) => e.preventDefault()}
      style={{ touchAction: 'none' }}
      className={`flex h-14 w-14 items-center justify-center rounded-full bg-surface/80 text-2xl text-text shadow-lg backdrop-blur active:bg-primary/30 ${className}`}
      aria-label={direction}
    >
      {label}
    </button>
  )

  return (
    <>
      <div className="pointer-events-none absolute bottom-6 left-1/2 grid -translate-x-1/2 grid-cols-3 grid-rows-2 gap-1 sm:hidden">
        <div className="pointer-events-auto col-start-2">
          <Pad direction="up" label="⬆️" />
        </div>
        <div className="pointer-events-auto col-start-1 row-start-2">
          <Pad direction="left" label="⬅️" />
        </div>
        <div className="pointer-events-auto col-start-2 row-start-2">
          <Pad direction="down" label="⬇️" />
        </div>
        <div className="pointer-events-auto col-start-3 row-start-2">
          <Pad direction="right" label="➡️" />
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-6 right-4 sm:hidden">
        <button
          type="button"
          onPointerDown={setJump(true)}
          onPointerUp={setJump(false)}
          onPointerLeave={setJump(false)}
          onContextMenu={(e) => e.preventDefault()}
          style={{ touchAction: 'none' }}
          className="pointer-events-auto flex h-16 w-16 items-center justify-center rounded-full bg-surface/80 text-2xl text-text shadow-lg backdrop-blur active:bg-primary/30"
          aria-label="jump"
        >
          ⤴️
        </button>
      </div>
    </>
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

// Your mascot, moved with WASD/arrow keys or the touch D-pad. It bobs and
// tilts while walking, can jump, sits on the scenery's real ground height,
// and can't walk through scenery geometry — all via raycasts against the
// shared `scenery` model.
function Player({ mascot, skin, scenery, groundRayHeight, keysRef, cameraRef }) {
  const group = useRef()
  const meshGroup = useRef()
  const { camera } = useThree()
  const cameraTarget = useRef(new THREE.Vector3())
  const walkCycle = useRef(0)
  const velocityY = useRef(0)
  const raycaster = useMemo(() => new THREE.Raycaster(), [])
  const initialized = useRef(false)

  useFrame((_, delta) => {
    if (!group.current) return
    const keys = keysRef.current
    const pos = group.current.position

    // Drop the player onto the real scenery surface the first time we run,
    // instead of starting at the world origin (y = 0).
    if (!initialized.current) {
      pos.y = getGroundY(raycaster, scenery, groundRayHeight, pos.x, pos.z)
      initialized.current = true
    }

    const move = new THREE.Vector3()
    if (keys['w'] || keys['arrowup']) move.z -= 1
    if (keys['s'] || keys['arrowdown']) move.z += 1
    if (keys['a'] || keys['arrowleft']) move.x -= 1
    if (keys['d'] || keys['arrowright']) move.x += 1

    const isMoving = move.lengthSq() > 0

    if (isMoving) {
      move.normalize().multiplyScalar(MOVE_SPEED * delta)

      // Chest-height origin for wall checks, at the player's current spot.
      const chestY = pos.y + PLAYER_HEIGHT * 0.6
      const originX = new THREE.Vector3(pos.x, chestY, pos.z)
      const originZ = new THREE.Vector3(pos.x, chestY, pos.z)

      // Resolve each axis separately so the player can slide along walls
      // instead of getting stuck the moment one axis is blocked.
      if (move.x !== 0) {
        const dir = move.x > 0 ? AXIS_X : AXIS_X.clone().negate()
        if (isBlocked(raycaster, scenery, originX, dir, Math.abs(move.x))) move.x = 0
      }
      if (move.z !== 0) {
        const dir = move.z > 0 ? AXIS_Z : AXIS_Z.clone().negate()
        if (isBlocked(raycaster, scenery, originZ, dir, Math.abs(move.z))) move.z = 0
      }

      if (move.lengthSq() > 0) {
        pos.x += move.x
        pos.z += move.z

        const targetAngle = Math.atan2(move.x, move.z)
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
      if (keys[' '] || keys['spacebar']) {
        velocityY.current = JUMP_SPEED
      }
    }
    velocityY.current += GRAVITY * delta
    pos.y += velocityY.current * delta

    if (meshGroup.current) {
      const bob = isMoving ? Math.abs(Math.sin(walkCycle.current)) * WALK_BOB_HEIGHT : 0
      const tilt = isMoving ? Math.sin(walkCycle.current) * WALK_TILT : 0
      meshGroup.current.position.y = bob
      meshGroup.current.rotation.z = tilt
      meshGroup.current.rotation.x = isMoving ? WALK_TILT * 0.6 : 0
    }

    // Camera orbits around the player based on mouse/touch drag (yaw + pitch)
    // and zooms in/out with the mouse wheel or a two-finger pinch (distance).
    const { yaw, pitch, distance } = cameraRef.current
    const offset = new THREE.Vector3(
      distance * Math.sin(yaw) * Math.cos(pitch),
      CAMERA_HEIGHT + distance * Math.sin(pitch),
      distance * Math.cos(yaw) * Math.cos(pitch),
    )
    cameraTarget.current.copy(group.current.position).add(offset)
    camera.position.lerp(cameraTarget.current, 0.06)
    camera.lookAt(
      group.current.position.x,
      group.current.position.y + 0.6,
      group.current.position.z,
    )
  })

  return (
    <group ref={group}>
      <group ref={meshGroup} scale={PLAYER_SCALE}>
        <MascotMesh mascot={mascot} skin={skin} />
      </group>
    </group>
  )
}

// Loads the scenery once and renders it alongside the player, which needs
// the same model instance to raycast against for ground height/collisions.
function World({ mascot, skin, keysRef, cameraRef }) {
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
      />
    </>
  )
}

const clamp = (value, min, max) => Math.min(max, Math.max(min, value))

// Tracks pointer drag (mouse or touch) to orbit the camera around the player,
// and zoom (mouse wheel, or a two-finger pinch on touch devices).
function useCameraControls() {
  const camera = useRef({ yaw: 0, pitch: 0, distance: CAMERA_DISTANCE })
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
        camera.current.distance = clamp(
          camera.current.distance + delta * PINCH_ZOOM_SPEED,
          ZOOM_MIN,
          ZOOM_MAX,
        )
      }
      pinchDistance.current = dist
      return
    }

    if (!drag.current) return
    const dx = e.clientX - drag.current.x
    const dy = e.clientY - drag.current.y
    drag.current = { x: e.clientX, y: e.clientY }
    camera.current.yaw -= dx * MOUSE_SENSITIVITY
    camera.current.pitch = clamp(
      camera.current.pitch + dy * MOUSE_SENSITIVITY,
      CAMERA_PITCH_MIN,
      CAMERA_PITCH_MAX,
    )
  }
  const onPointerUp = (e) => {
    pointers.current.delete(e.pointerId)
    pinchDistance.current = null
    const remaining = Array.from(pointers.current.values())
    drag.current = remaining.length === 1 ? { x: remaining[0].x, y: remaining[0].y } : null
  }
  const onWheel = (e) => {
    camera.current.distance = clamp(
      camera.current.distance + e.deltaY * WHEEL_ZOOM_SPEED * camera.current.distance,
      ZOOM_MIN,
      ZOOM_MAX,
    )
  }

  return { camera, onPointerDown, onPointerMove, onPointerUp, onWheel }
}

export default function VRPage() {
  const keysRef = useMovementKeys()
  const { camera: cameraRef, onPointerDown, onPointerMove, onPointerUp, onWheel } = useCameraControls()
  const selectedMascotId = useMascotStore((s) => s.selectedMascotId)
  const selectedSkinId = useMascotStore((s) => s.selectedSkinId)
  const mascot = getMascotById(selectedMascotId)
  const skin = getSkinById(selectedSkinId)

  return (
    <div className="flex h-screen flex-col bg-background text-text">
      <AppTopBar />
      <PageVideoModal pageKey="vr" />

      <div
        className="relative flex-1"
        style={{ touchAction: 'none' }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
        onWheel={onWheel}
      >
        <Canvas camera={{ position: [0, 1.6, 3.4], fov: 50 }}>
          <color attach="background" args={['#3b2a1f']} />
          <fog attach="fog" args={['#d98e4a', 12, 42]} />
          <ambientLight intensity={0.9} />
          <directionalLight position={[10, 15, 8]} intensity={1} />
          <Suspense fallback={null}>
            <World mascot={mascot} skin={skin} keysRef={keysRef} cameraRef={cameraRef} />
          </Suspense>
        </Canvas>

        <div className="pointer-events-none absolute bottom-4 left-1/2 hidden -translate-x-1/2 rounded-xl bg-surface/90 px-4 py-2 text-center text-sm text-text shadow-lg backdrop-blur sm:block">
          Muévete con <strong>W A S D</strong> o las flechas, <strong>espacio</strong> para saltar,
          arrastra el ratón para mirar alrededor 🎮
        </div>

        <TouchControls keysRef={keysRef} />
      </div>

      <MascotCompanion />
    </div>
  )
}
