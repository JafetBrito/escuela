import { useRef, useMemo, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { RigidBody, CapsuleCollider, useRapier } from '@react-three/rapier'
import * as THREE from 'three'
import MascotMesh from '../../mascot/MascotMesh'
import { useGameStore, PLAYER_AVATARS } from '../../../stores/useGameStore'
import { useVrSettingsStore } from '../../../stores/useVrSettingsStore'
import { useVrCharacterStore } from '../../../stores/useVrCharacterStore'
import { useChatBubbles, BubbleStack, colorFromId } from './ChatBubbles'
import { applyGamepadInput, getPitchRange } from './camera'
import {
  MOVE_SPEED,
  MOVE_ACCEL,
  PLAYER_SCALE,
  PLAYER_HEIGHT,
  MODEL_HALF_HEIGHT,
  COLLISION_RADIUS,
  WALK_CYCLE_SPEED,
  WALK_BOB_HEIGHT,
  WALK_TILT,
  TURN_SPEED,
  CAMERA_COLLISION_MARGIN,
  CAMERA_SMOOTHING,
  ZOOM_SMOOTHING,
  FIRST_PERSON_EYE_HEIGHT,
  GRAVITY,
  JUMP_SPEED,
  DOWN,
  AXIS_X,
  AXIS_Z,
  clamp,
} from './constants'

// Raycasts straight down from (x, groundRayHeight, z) against the scenery
// model and returns the height of whatever floor mesh (userData.isFloor)
// it hits — the same contract every world's ground hook (`useCampusGround`,
// `useRoomGround`, etc.) already returns a `{ model, groundRayHeight }` for.
export function getGroundY(raycaster, scenery, groundRayHeight, x, z) {
  raycaster.set(new THREE.Vector3(x, groundRayHeight, z), DOWN)
  const hits = raycaster.intersectObject(scenery, true)
  const hit = hits.find((h) => h.object.userData.isFloor)
  return hit ? hit.point.y : 0
}

// Casts a ray from the player's chest in a horizontal direction to check for
// walls/objects in the way. Returns true if movement of `distance` along
// `direction` would walk into something.
export function isBlocked(raycaster, scenery, origin, direction, distance) {
  if (distance <= 0) return false
  raycaster.set(origin, direction)
  const hits = raycaster.intersectObject(scenery, true)
  return hits.length > 0 && hits[0].distance < COLLISION_RADIUS + distance
}

// Humanoid avatar body for the local player and remote players — the real
// hombre.glb/mujer.glb model for the player's chosen PLAYER_AVATARS entry,
// loaded through the same MascotMesh pipeline (auto-centered/scaled to fit,
// feet at y=-1 pre-scale) every mascot/NPC body already uses, so it sits on
// the ground exactly the same way.
export function PlayerAvatarBody({ avatarId }) {
  const avatar = PLAYER_AVATARS.find((a) => a.id === avatarId) || PLAYER_AVATARS[0]
  return <MascotMesh mascot={avatar} />
}

// Your mascot, moved with WASD/arrow keys or the touch D-pad. It bobs and
// tilts while walking, can jump, sits on the scenery's real ground height,
// and can't walk through scenery geometry — all via raycasts against the
// shared `scenery` model. This component knows nothing about which map it's
// in: it only needs `scenery` (a THREE.Object3D with userData.isFloor on
// walkable meshes) and `groundRayHeight`, the same `{model, groundRayHeight}`
// contract every world's ground hook returns.
export function Player({
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
  const bodyRef = useRef()
  const { camera } = useThree()
  const { world } = useRapier()
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
  const activeChar = useVrCharacterStore((s) => s.activeChar)
  const companionFollows = useVrCharacterStore((s) => s.companionFollows)

  const controller = useMemo(() => {
    const c = world.createCharacterController(0.02)
    c.setApplyImpulsesToDynamicBodies(true)
    c.setMaxSlopeClimbAngle(55 * Math.PI / 180)
    c.setMinSlopeSlideAngle(30 * Math.PI / 180)
    c.enableAutostep(0.5, 0.2, true)
    c.enableSnapToGround(0.4)
    return c
  }, [world])

  useEffect(() => () => { try { world.removeCharacterController(controller) } catch {} }, [world, controller])

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

    // Snap to real ground height on first frame, then Rapier takes over.
    if (!initialized.current && bodyRef.current) {
      const sx = spawnAt ? spawnAt[0] : 0
      const sz = spawnAt ? spawnAt[2] : 0
      const sy = getGroundY(raycaster, scenery, groundRayHeight, sx, sz)
      bodyRef.current.setTranslation({ x: sx, y: sy + 0.2, z: sz })
      group.current.position.set(sx, sy, sz)
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

    // Turn + walk-cycle animation (based on input, not on whether movement was resolved)
    if (isMoving) {
      const targetAngle = Math.atan2(velocityXZ.current.x, velocityXZ.current.z)
      let angleDiff = targetAngle - group.current.rotation.y
      angleDiff = Math.atan2(Math.sin(angleDiff), Math.cos(angleDiff))
      group.current.rotation.y += angleDiff * Math.min(1, TURN_SPEED * delta)
      walkCycle.current += delta * WALK_CYCLE_SPEED
    } else {
      walkCycle.current = 0
    }

    // Wall collision via raycasts (fast, works against any scenery geometry).
    if (!noClip) {
      const chestY = pos.y + PLAYER_HEIGHT * 0.6
      if (stepX !== 0) {
        const dir = stepX > 0 ? AXIS_X : AXIS_X.clone().negate()
        if (isBlocked(raycaster, scenery, new THREE.Vector3(pos.x, chestY, pos.z), dir, Math.abs(stepX))) {
          stepX = 0; velocityXZ.current.x = 0
        }
      }
      if (stepZ !== 0) {
        const dir = stepZ > 0 ? AXIS_Z : AXIS_Z.clone().negate()
        if (isBlocked(raycaster, scenery, new THREE.Vector3(pos.x, chestY, pos.z), dir, Math.abs(stepZ))) {
          stepZ = 0; velocityXZ.current.z = 0
        }
      }
    }
    pos.x += stepX
    pos.z += stepZ

    // Gravity + jump via Rapier character controller (only Y axis).
    // The CC detects a flat ground CuboidCollider when one exists; raycasts
    // handle walls above and stand in for gravity in worlds (room, anfi,
    // tree, or any future mission) that don't add one.
    // Guard: body.collider(0) returns undefined during the first Rapier tick
    // before colliders are fully initialized — passing undefined crashes the
    // controller and kills the WebGL context. Fall through to the raycast
    // fallback in that case.
    const body = bodyRef.current
    if (body && body.numColliders() > 0) {
      const t = body.translation()
      // Sync XZ from our raycast-resolved position, apply CC only for Y
      const desiredY = { x: 0, y: velocityY.current * delta, z: 0 }
      controller.computeColliderMovement(body.collider(0), desiredY)
      const mv = controller.computedMovement()
      pos.y = t.y + mv.y
      body.setNextKinematicTranslation({ x: pos.x, y: pos.y, z: pos.z })

      if (controller.computedGrounded()) {
        velocityY.current = 0
        if (keys[' '] || keys['spacebar'] || gamepad?.jump) velocityY.current = JUMP_SPEED
      } else {
        velocityY.current += GRAVITY * delta
      }
      group.current.position.set(pos.x, pos.y, pos.z)
    } else {
      // Fallback for worlds without a Rapier ground collider.
      const groundY = getGroundY(raycaster, scenery, groundRayHeight, pos.x, pos.z)
      if (pos.y <= groundY) {
        pos.y = groundY
        velocityY.current = 0
        if (keys[' '] || keys['spacebar'] || gamepad?.jump) velocityY.current = JUMP_SPEED
      }
      velocityY.current += GRAVITY * delta
      pos.y += velocityY.current * delta
    }

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
      // would be hidden inside the scenery geometry.
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
    <>
      {/* Physics body — invisible capsule collider that the character controller moves */}
      <RigidBody ref={bodyRef} type="kinematicPosition" colliders={false}
        enabledRotations={[false, false, false]}>
        <CapsuleCollider args={[0.08, 0.10]} position={[0, 0.18, 0]} />
      </RigidBody>
      {/* Visual group — camera target + mesh + chat bubbles */}
      <group ref={group}>
        <group ref={meshGroup} scale={PLAYER_SCALE}>
          {activeChar === 'avatar' ? (
            <>
              {/* Avatar is the main character — full size */}
              <PlayerAvatarBody avatarId={avatarId} />
              {companionFollows && (
                <group position={[1.4, 0, 0]} scale={0.55}>
                  <MascotMesh mascot={mascot} skin={skin} />
                </group>
              )}
            </>
          ) : (
            <>
              {/* Mascot is the main character — scaled up, centered */}
              <group scale={1.25}>
                <MascotMesh mascot={mascot} skin={skin} />
              </group>
              {companionFollows && (
                <group position={[1.6, 0, 0]} scale={0.5}>
                  <PlayerAvatarBody avatarId={avatarId} />
                </group>
              )}
            </>
          )}
        </group>
        <BubbleStack bubbles={bubbles} baseY={PLAYER_HEIGHT + 1.1} color={colorFromId(playerId)} />
      </group>
    </>
  )
}
