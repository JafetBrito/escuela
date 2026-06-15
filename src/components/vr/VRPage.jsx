import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Html, useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import AppTopBar from '../shared/AppTopBar'
import PageVideoModal from '../shared/PageVideoModal'
import MascotMesh from '../mascot/MascotMesh'
import MascotCompanion from '../mascot/MascotCompanion'
import { useMascotStore } from '../../stores/useMascotStore'
import { getMascotById } from '../../data/mascotRegistry'
import { getSkinById } from '../../data/skinsRegistry'
import { VR_NPCS, getVrNpcById } from '../../data/vrNpcRegistry'
import { getGlobalMissionById } from '../../data/globalMissionsRegistry'
import { useGlobalMissionsStore } from '../../stores/useGlobalMissionsStore'
import { useMissionState } from '../../stores/useMissionState'
import { useMascotCompanionStore } from '../../stores/useMascotCompanionStore'
import { useWorldChatStore } from '../../stores/useWorldChatStore'
import { useSettingsStore } from '../../stores/useSettingsStore'
import { formatCurrency } from '../../utils/currency'

// While we're designing/testing the world's NPCs and missions, swap the real
// city model for a simple flat test ground with a few placeholder walls.
// Flip this back to `false` to return to /fondo_azteca.glb.
const USE_TEST_SCENERY = true

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
// How far ahead of/around the player we check for walls before letting them
// move into something (in world units).
const COLLISION_RADIUS = PLAYER_HEIGHT * 0.6
const WALK_CYCLE_SPEED = 9
const WALK_BOB_HEIGHT = 0.07
const WALK_TILT = 0.06

// Camera orbit (mouse-drag controlled) around the player, zoomable with the
// mouse wheel or a two-finger pinch. Movement is relative to this camera, so
// "forward" always means "away from the camera", like a typical 3rd-person
// game.
const CAMERA_DISTANCE = 4.5
const CAMERA_HEIGHT = 1.6
const CAMERA_PITCH_MIN = -0.5
const CAMERA_PITCH_MAX = 1.1
const MOUSE_SENSITIVITY = 0.005
const ZOOM_MIN = 1.2
const ZOOM_MAX = 55
const WHEEL_ZOOM_SPEED = 0.0065
const PINCH_ZOOM_SPEED = 0.07
// How quickly the camera distance/position glide toward their target values
// (per second, via exponential smoothing). Higher = snappier.
const ZOOM_SMOOTHING = 6
const CAMERA_SMOOTHING = 8

// Scale for NPC models (slightly bigger than the player so they stand out)
// and for the background "wandering cats" that wander the test ground.
const NPC_SCALE = 0.16
const WANDER_CAT_SCALE = 0.1
const WANDER_CAT_SPEED = 1.1

// Jumping.
const GRAVITY = -20
const JUMP_SPEED = 7

// Warm "ruinas al atardecer" palette applied to any untextured surface of the
// scenery, so a flat-grey export still reads as a colorful scene.
const SCENERY_PALETTE = ['#c2703d', '#e8c477', '#9b5a3a', '#7d8597', '#3f9e7a', '#caa46c']

// Radius of the procedural campus ground (test scenery).
const GROUND_RADIUS = 32

// How close the player needs to be to an NPC to interact with them. Right-
// clicking while inside this radius opens their mission card.
const INTERACT_RADIUS = 2.5

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
// shortcuts (M/C/B/Enter) should be ignored while that's happening.
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

// World shortcuts that are NOT character movement: M toggles the map, C
// opens the character menu, B opens the inventory, and Enter toggles the
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
          onToggleMap()
          break
        case 'c':
          onOpenCharacter()
          break
        case 'b':
          onOpenInventory()
          break
        case 'enter':
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

// Our own lightweight "campus" ground: a big circular plaza with a paved
// central square, a little landmark "building" behind every mission NPC (so
// each zone of the map reads as a distinct place), and a low wall ringing the
// edge so the player can't wander off into the void. Returns the same shape
// as useSceneryModel so <Player> doesn't care which one it's walking on.
function useTestGround() {
  return useMemo(() => {
    const group = new THREE.Group()

    const ground = new THREE.Mesh(
      new THREE.CircleGeometry(GROUND_RADIUS, 64),
      new THREE.MeshStandardMaterial({ color: '#5a8f5a' }),
    )
    ground.rotation.x = -Math.PI / 2
    group.add(ground)

    const grid = new THREE.GridHelper(GROUND_RADIUS * 2, GROUND_RADIUS, '#3f6e3f', '#4f7f4f')
    grid.position.y = 0.01
    group.add(grid)

    // Paved central plaza, so the spawn point reads as a town square rather
    // than open grass.
    const plaza = new THREE.Mesh(
      new THREE.CircleGeometry(5.5, 32),
      new THREE.MeshStandardMaterial({ color: '#caa46c' }),
    )
    plaza.rotation.x = -Math.PI / 2
    plaza.position.y = 0.02
    group.add(plaza)

    // One landmark "building" behind each NPC, positioned further from the
    // plaza than the NPC itself so the NPC stands in front of its building.
    VR_NPCS.forEach((npc, i) => {
      const [x, , z] = npc.position
      const buildingHeight = 2.6 + (i % 3) * 0.6
      const building = new THREE.Mesh(
        new THREE.BoxGeometry(3.6, buildingHeight, 3.6),
        new THREE.MeshStandardMaterial({ color: npc.color }),
      )
      building.position.set(x * 1.3, buildingHeight / 2, z * 1.3)
      group.add(building)

      // Small roof accent so the buildings don't look like plain boxes.
      const roof = new THREE.Mesh(
        new THREE.ConeGeometry(2.8, 1.4, 4),
        new THREE.MeshStandardMaterial({ color: '#9b5a3a' }),
      )
      roof.position.set(x * 1.3, buildingHeight + 0.7, z * 1.3)
      roof.rotation.y = Math.PI / 4
      group.add(roof)
    })

    // Low ring wall around the edge of the plaza so the player can't wander
    // off the campus into empty space.
    const wallSegments = 24
    for (let i = 0; i < wallSegments; i += 1) {
      const angle = (i / wallSegments) * Math.PI * 2
      const wall = new THREE.Mesh(
        new THREE.BoxGeometry(GROUND_RADIUS * 0.3, 1.4, 0.6),
        new THREE.MeshStandardMaterial({ color: '#7d8597' }),
      )
      wall.position.set(Math.sin(angle) * GROUND_RADIUS, 0.7, Math.cos(angle) * GROUND_RADIUS)
      wall.rotation.y = angle
      group.add(wall)
    }

    return { model: group, groundRayHeight: 14 }
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

// Your mascot, moved with WASD/arrow keys or the touch D-pad. It bobs and
// tilts while walking, can jump, sits on the scenery's real ground height,
// and can't walk through scenery geometry — all via raycasts against the
// shared `scenery` model.
function Player({ mascot, skin, scenery, groundRayHeight, keysRef, cameraRef, playerPositionRef }) {
  const group = useRef()
  const meshGroup = useRef()
  const { camera } = useThree()
  const cameraTarget = useRef(new THREE.Vector3())
  const walkCycle = useRef(0)
  const velocityY = useRef(0)
  const velocityXZ = useRef(new THREE.Vector3())
  const raycaster = useMemo(() => new THREE.Raycaster(), [])
  const initialized = useRef(false)

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

    const isMoving = input.lengthSq() > 0
    if (isMoving) input.normalize().multiplyScalar(MOVE_SPEED)

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
    // The distance itself eases toward its target so zoom changes glide
    // smoothly instead of snapping, and the camera follow uses delta-based
    // smoothing so it feels consistent regardless of frame rate.
    const cam = cameraRef.current
    cam.distance += (cam.targetDistance - cam.distance) * Math.min(1, ZOOM_SMOOTHING * delta)
    const { pitch, distance } = cam
    const offset = new THREE.Vector3(
      distance * Math.sin(yaw) * Math.cos(pitch),
      CAMERA_HEIGHT + distance * Math.sin(pitch),
      distance * Math.cos(yaw) * Math.cos(pitch),
    )
    cameraTarget.current.copy(group.current.position).add(offset)
    camera.position.lerp(cameraTarget.current, 1 - Math.exp(-CAMERA_SMOOTHING * delta))
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

// Loads the real city model and renders it alongside the player, which needs
// the same model instance to raycast against for ground height/collisions.
function CityWorld({ mascot, skin, keysRef, cameraRef, playerPositionRef }) {
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
      />
    </>
  )
}

// Same as <CityWorld>, but walking on the procedural test ground instead of
// the real city model (see USE_TEST_SCENERY).
function TestWorld({ mascot, skin, keysRef, cameraRef, playerPositionRef }) {
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
      />
    </>
  )
}

// Renders one of our real mascot/mage models as an NPC, with a floating
// name tag above its head. Falls back to a simple colored marker if the NPC
// has no mascotId (shouldn't happen, but keeps things from disappearing
// silently if the registry entry is incomplete).
function VrNpc({ npc }) {
  const mascot = getMascotById(npc.mascotId)
  // Face the central plaza, so every NPC looks "inward" toward the player's
  // spawn point instead of all facing the same world direction.
  const facing = Math.atan2(-npc.position[0], -npc.position[2])

  return (
    <group position={npc.position} rotation={[0, facing, 0]}>
      {mascot ? (
        <group scale={NPC_SCALE}>
          <MascotMesh mascot={mascot} />
        </group>
      ) : (
        <mesh position={[0, 0.6, 0]}>
          <cylinderGeometry args={[0.18, 0.24, 1.2, 12]} />
          <meshStandardMaterial color={npc.color} />
        </mesh>
      )}
      <Html position={[0, 2.1, 0]} center distanceFactor={10}>
        <div className="pointer-events-none whitespace-nowrap rounded-full bg-surface/90 px-3 py-1 text-xs font-semibold text-text shadow-lg">
          {npc.emoji} {npc.name}
        </div>
      </Html>
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
      <group scale={WANDER_CAT_SCALE}>
        <MascotMesh mascot={mascot} />
      </group>
    </group>
  )
}

// Watches the distance from the player to every NPC and reports the closest
// one within INTERACT_RADIUS (or null) via `onNearbyChange`, so VRPage can
// show its mission card outside the canvas.
function NpcProximityTracker({ playerPositionRef, onNearbyChange }) {
  const lastId = useRef(null)
  const npcPositions = useMemo(
    () => VR_NPCS.map((npc) => ({ id: npc.id, vec: new THREE.Vector3(...npc.position) })),
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
// the player and the mission NPCs on top.
function World({ mascot, skin, keysRef, cameraRef, playerPositionRef, onNearbyNpcChange }) {
  const WorldGround = USE_TEST_SCENERY ? TestWorld : CityWorld

  return (
    <>
      <WorldGround
        mascot={mascot}
        skin={skin}
        keysRef={keysRef}
        cameraRef={cameraRef}
        playerPositionRef={playerPositionRef}
      />
      {VR_NPCS.map((npc) => (
        <VrNpc key={npc.id} npc={npc} />
      ))}
      {WANDER_CAT_PATHS.map((path, i) => (
        <WanderingCat key={i} path={path} />
      ))}
      <NpcProximityTracker playerPositionRef={playerPositionRef} onNearbyChange={onNearbyNpcChange} />
    </>
  )
}

const clamp = (value, min, max) => Math.min(max, Math.max(min, value))

// Tracks pointer drag (mouse or touch) to orbit the camera around the player,
// and zoom (mouse wheel, or a two-finger pinch on touch devices).
function useCameraControls() {
  const camera = useRef({ yaw: 0, pitch: 0, distance: CAMERA_DISTANCE, targetDistance: CAMERA_DISTANCE })
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
        camera.current.targetDistance = clamp(
          camera.current.targetDistance + delta * PINCH_ZOOM_SPEED,
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
    camera.current.targetDistance = clamp(
      camera.current.targetDistance + e.deltaY * WHEEL_ZOOM_SPEED * camera.current.targetDistance,
      ZOOM_MIN,
      ZOOM_MAX,
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
          viewBox={`-${GROUND_RADIUS + 2} -${GROUND_RADIUS + 2} ${(GROUND_RADIUS + 2) * 2} ${(GROUND_RADIUS + 2) * 2}`}
          className="h-[60vh] w-[60vh] max-w-[90vw]"
        >
          <circle cx="0" cy="0" r={GROUND_RADIUS} fill="#5a8f5a" stroke="#3f6e3f" strokeWidth="0.4" />
          <circle cx="0" cy="0" r="5.5" fill="#caa46c" />
          {VR_NPCS.map((npc) => {
            const [x, , z] = npc.position
            return (
              <g key={npc.id}>
                <rect
                  x={x * 1.3 - 1.8}
                  y={z * 1.3 - 1.8}
                  width="3.6"
                  height="3.6"
                  fill={npc.color}
                  opacity="0.55"
                />
                <circle cx={x} cy={z} r="1.3" fill={npc.color} stroke="#fff" strokeWidth="0.3" />
                <text x={x} y={z - 2.4} fontSize="2.4" textAnchor="middle">
                  {npc.emoji}
                </text>
              </g>
            )
          })}
          <circle ref={playerMarkerRef} cx="0" cy="0" r="1" fill="#e74c3c" stroke="#fff" strokeWidth="0.4" />
        </svg>
        <p className="mt-2 text-center text-xs text-text-muted">
          Pulsa <strong>M</strong> para cerrar el mapa
        </p>
      </div>
    </div>
  )
}

// Local "world chat" the player can type into, independent from the per-NPC
// AI chats. Toggled with Enter, closed with Escape. Messages are local-only
// for now (see useWorldChatStore for the multiplayer note).
function WorldChat({ open, onClose, authorName }) {
  const messages = useWorldChatStore((s) => s.messages)
  const sendMessage = useWorldChatStore((s) => s.sendMessage)
  const [text, setText] = useState('')
  const inputRef = useRef(null)

  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  if (!open && messages.length === 0) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    if (text.trim()) {
      sendMessage(authorName, text)
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

  return (
    <div className="absolute bottom-20 left-4 z-20 w-72 max-w-[calc(100%-2rem)] rounded-xl border border-border bg-surface/90 p-3 text-sm shadow-xl backdrop-blur sm:bottom-24">
      {messages.length > 0 && (
        <div className="mb-2 flex max-h-32 flex-col gap-1 overflow-y-auto text-xs">
          {messages.slice(-8).map((m) => (
            <p key={m.id} className="text-text">
              <span className="font-semibold">{m.author}:</span> {m.text}
            </p>
          ))}
        </div>
      )}
      {open && (
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            ref={inputRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Escribe en el chat global…"
            className="flex-1 rounded-lg border border-border bg-background px-2 py-1.5 text-sm text-text outline-none focus:border-primary"
          />
          <button
            type="submit"
            className="rounded-lg bg-primary px-3 py-1.5 text-sm font-semibold text-background transition-colors hover:bg-primary-hover"
          >
            Enviar
          </button>
        </form>
      )}
    </div>
  )
}

export default function VRPage() {
  const keysRef = useMovementKeys()
  const { camera: cameraRef, onPointerDown, onPointerMove, onPointerUp, onWheel } = useCameraControls()
  const selectedMascotId = useMascotStore((s) => s.selectedMascotId)
  const selectedSkinId = useMascotStore((s) => s.selectedSkinId)
  const mascot = getMascotById(selectedMascotId)
  const skin = getSkinById(selectedSkinId)
  const settingsMascotName = useSettingsStore((s) => s.mascotName)
  const chatAuthor = settingsMascotName || mascot.name

  const playerPositionRef = useRef(null)
  const [nearbyNpcId, setNearbyNpcId] = useState(null)
  const [activeNpcId, setActiveNpcId] = useState(null)
  const [mapOpen, setMapOpen] = useState(false)
  const [chatOpen, setChatOpen] = useState(false)
  const accepted = useGlobalMissionsStore((s) => s.accepted)
  const claimed = useGlobalMissionsStore((s) => s.claimed)
  const acceptMission = useGlobalMissionsStore((s) => s.acceptMission)
  const claimReward = useGlobalMissionsStore((s) => s.claimReward)
  const missionState = useMissionState()
  const openPanel = useMascotCompanionStore((s) => s.openPanel)

  // Closing the mission card when the player walks away from (or changes)
  // the NPC they were talking to — it only stays open while still nearby.
  useEffect(() => {
    if (nearbyNpcId !== activeNpcId) setActiveNpcId(null)
  }, [nearbyNpcId, activeNpcId])

  useWorldShortcuts({
    onToggleMap: () => setMapOpen((open) => !open),
    onOpenCharacter: () => openPanel('chat'),
    onOpenInventory: () => openPanel('items'),
    onToggleChat: (value) => setChatOpen((open) => (typeof value === 'boolean' ? value : !open)),
  })

  const handleContextMenu = (e) => {
    e.preventDefault()
    if (!nearbyNpcId) return
    setActiveNpcId((current) => (current === nearbyNpcId ? null : nearbyNpcId))
  }

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
        onContextMenu={handleContextMenu}
      >
        <Canvas camera={{ position: [0, 1.6, 3.4], fov: 50 }}>
          <color attach="background" args={['#3b2a1f']} />
          <fog attach="fog" args={['#d98e4a', 12, 42]} />
          <ambientLight intensity={0.9} />
          <directionalLight position={[10, 15, 8]} intensity={1} />
          <Suspense fallback={null}>
            <World
              mascot={mascot}
              skin={skin}
              keysRef={keysRef}
              cameraRef={cameraRef}
              playerPositionRef={playerPositionRef}
              onNearbyNpcChange={setNearbyNpcId}
            />
          </Suspense>
        </Canvas>

        {activeNpcId ? (
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
          nearbyNpcId && (
            <div className="pointer-events-none absolute bottom-24 left-1/2 -translate-x-1/2 rounded-full bg-surface/90 px-4 py-1.5 text-xs font-semibold text-text shadow-lg backdrop-blur sm:bottom-20">
              {getVrNpcById(nearbyNpcId)?.emoji} Clic derecho para hablar con {getVrNpcById(nearbyNpcId)?.name}
            </div>
          )
        )}

        <WorldMap open={mapOpen} onClose={() => setMapOpen(false)} playerPositionRef={playerPositionRef} />
        <WorldChat open={chatOpen} onClose={() => setChatOpen(false)} authorName={chatAuthor} />

        <div className="pointer-events-none absolute bottom-4 left-1/2 hidden -translate-x-1/2 rounded-xl bg-surface/90 px-4 py-2 text-center text-sm text-text shadow-lg backdrop-blur sm:block">
          <strong>W A S D</strong> o flechas para moverte, <strong>espacio</strong> para saltar,{' '}
          <strong>M</strong> mapa, <strong>C</strong> personaje, <strong>B</strong> inventario,{' '}
          <strong>Enter</strong> chat global, arrastra el ratón para mirar y <strong>rueda</strong> para
          zoom 🎮
        </div>

        <TouchControls keysRef={keysRef} />
      </div>

      <MascotCompanion />
    </div>
  )
}
