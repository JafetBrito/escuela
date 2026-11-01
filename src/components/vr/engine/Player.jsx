import { useRef, useMemo, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { RigidBody, CapsuleCollider, useRapier } from '@react-three/rapier'
import * as THREE from 'three'
import MascotMesh from '../../mascot/MascotMesh'
import { useGameStore, PLAYER_AVATARS } from '../../../stores/useGameStore'
import { useVrSettingsStore } from '../../../stores/useVrSettingsStore'
import { useFlyModeStore } from '../../../stores/useFlyModeStore'
import { useVrCharacterStore } from '../../../stores/useVrCharacterStore'
import { useDevCalibrationStore } from '../../../stores/useDevCalibrationStore'
import { useChatBubbles, BubbleStack, colorFromId } from './ChatBubbles'
import { applyGamepadInput, getPitchRange } from './camera'
import {
  MOVE_SPEED,
  MOVE_ACCEL,
  SPRINT_MULTIPLIER,
  PLAYER_SCALE,
  PLAYER_HEIGHT,
  AVATAR_RELATIVE_SCALE,
  MASCOT_RELATIVE_SCALE,
  MODEL_HALF_HEIGHT,
  COLLISION_RADIUS,
  WALK_CYCLE_SPEED,
  WALK_BOB_HEIGHT,
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
// Takes the LOWEST isFloor hit, not the first one the ray crosses: procedural
// worlds only ever flag their literal floor meshes as isFloor, so there's
// normally just one hit and this is a no-op change for them. But
// useImportedGlbGround (any plain .glb map) flags every mesh as isFloor —
// for an interior model with a ceiling/dome above the walkable area, the
// first hit going down from above is the ceiling, which used to snap the
// player up there permanently instead of onto the real floor.
//
// `fromY` (solo mundos multinivel, ej. el campus con interiores): el rayo sale de esa altura (los pies +
// un escalón) y gana el piso MÁS ALTO que cruza, así que se puede subir a un segundo piso por una escalera
// sin que el piso de abajo "gane" ni el techo cuente (los techos no son isFloor).
export function getGroundY(raycaster, scenery, groundRayHeight, x, z, fromY) {
  // ponytail: worlds with a flat physics-only floor (no visual scenery mesh,
  // e.g. the Test Map) pass no scenery at all — flat ground is y=0 anyway.
  if (!scenery) return 0
  raycaster.far = Infinity
  raycaster.set(new THREE.Vector3(x, fromY ?? groundRayHeight, z), DOWN)
  const hits = raycaster.intersectObject(scenery, true).filter((h) => h.object.userData.isFloor)
  if (!hits.length) return 0
  return fromY === undefined ? Math.min(...hits.map((h) => h.point.y)) : Math.max(...hits.map((h) => h.point.y))
}

// Casts a ray from the player's chest in a horizontal direction to check for
// walls/objects in the way. Returns true if movement of `distance` along
// `direction` would walk into something.
export function isBlocked(raycaster, scenery, origin, direction, distance) {
  if (distance <= 0 || !scenery) return false
  raycaster.set(origin, direction)
  raycaster.far = COLLISION_RADIUS + distance + 0.01 // sin esto el rayo prueba TODA malla que cruce la línea, por lejos que esté
  const hits = raycaster.intersectObject(scenery, true)
  raycaster.far = Infinity
  return hits.length > 0 && hits[0].distance < COLLISION_RADIUS + distance
}

const STEP_UP = 0.7 // multiLevel: cuánto más alto que los pies puede estar un piso para subirse a él (escalón/rampa)

// Humanoid avatar body for the local player and remote players — the real
// hombre.glb/mujer.glb model for the player's chosen PLAYER_AVATARS entry,
// loaded through the same MascotMesh pipeline (auto-centered/scaled to fit,
// feet at y=-1 pre-scale) every mascot/NPC body already uses, so it sits on
// the ground exactly the same way.
export function PlayerAvatarBody({ avatarId }) {
  const avatar = PLAYER_AVATARS.find((a) => a.id === avatarId) || PLAYER_AVATARS[0]
  // Live calibration override (see DevToolsPanel's 🧭 section + useDevCalibrationStore)
  // — 0 once the right modelRotationY is hardcoded and this whole thing is removed.
  const override = useDevCalibrationStore((s) => s.avatarRotationOverride)
  const avatarWithOverride = override
    ? { ...avatar, modelRotationY: (avatar.modelRotationY ?? 0) + override }
    : avatar
  return <MascotMesh mascot={avatarWithOverride} />
}

// Animación procedural de caminata (los .glb no traen esqueleto ni animaciones, son mallas de una pieza):
// rebote por paso, balanceo lateral (waddle), inclinación al frente según la velocidad y un respiro al
// estar quieto. `baseScale` = escala del grupo; el pie queda en el suelo gracias a MODEL_HALF_HEIGHT.
function animateBody(g, phase, spd, time, baseScale) {
  const moving = spd > 0.02
  const bob = moving ? Math.abs(Math.sin(phase)) * WALK_BOB_HEIGHT * 0.7 * Math.min(1.4, spd) : Math.sin(time * 2) * 0.004
  g.position.y = bob + baseScale * MODEL_HALF_HEIGHT
  g.rotation.z = moving ? Math.sin(phase) * 0.13 * Math.min(1.2, spd) : 0
  g.rotation.x = moving ? 0.1 + 0.07 * Math.min(1.8, spd) : 0
  const sq = moving ? Math.sin(phase * 2) * 0.035 : Math.sin(time * 2) * 0.012
  g.scale.set(baseScale * (1 - sq * 0.5), baseScale * (1 + sq), baseScale * (1 - sq * 0.5))
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
  // Mundos con un modelo importado a otra escala (ej. ClassroomWorld: el
  // salón de clases se ve gigante junto al personaje, "como hormigas") —
  // solo agranda el cuerpo visible, no la cápsula de colisión ni la cámara,
  // así que sigue siendo un cambio acotado/cosmético.
  visualScale = 1,
  // Mundos sin colisionador de suelo en Rapier (ej. el salón de clases): la
  // gravedad se resuelve solo con el raycast al suelo del `scenery`, sin el
  // character controller — que si no encuentra collider debajo cae para siempre.
  raycastGround = false,
  // Luz de relleno que acompaña al personaje, siempre del lado de la cámara: los .glb de avatar tienen
  // texturas oscuras (chaqueta/pantalón casi negros) y a la sombra de un mundo con poca luz ambiente se
  // ven como una silueta. Solo la pide la plaza; el resto de mundos conserva su iluminación.
  fillLight = false,
  // Mundos con pisos a distintas alturas (interiores con escaleras): ver getGroundY(fromY).
  multiLevel = false,
}) {
  const group = useRef()
  const meshGroup = useRef()
  const bodyRef = useRef()
  const { camera } = useThree()
  const { world } = useRapier()
  const cameraTarget = useRef(new THREE.Vector3())
  const walkCycle = useRef(0)
  const compRef = useRef()
  const fillRef = useRef()
  const comp = useRef({ ready: false, phase: 0, yaw: 0, moving: false })
  const velocityY = useRef(0)
  const velocityXZ = useRef(new THREE.Vector3())
  const raycaster = useMemo(() => new THREE.Raycaster(), [])
  const initialized = useRef(false)
  const camCollisionDistance = useRef(Infinity)
  const camCollisionFrame = useRef(0)
  const cameraMode = useVrSettingsStore((s) => s.cameraMode)
  const fov = useVrSettingsStore((s) => s.fov)
  const noClip = useVrSettingsStore((s) => s.noClip)
  const flying = useFlyModeStore((s) => s.enabled)
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

  useFrame((state, delta) => {
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

    // One-shot teleport requested by toggleChar (useVrCharacterStore) — fires
    // when swapping onto a character that has its own remembered parked spot,
    // so the shared physics body actually moves there instead of the new
    // model just appearing at wherever the old one was standing.
    const teleportTo = useVrCharacterStore.getState().teleportTo
    if (teleportTo && bodyRef.current) {
      bodyRef.current.setTranslation({ x: teleportTo.x, y: teleportTo.y + 0.1, z: teleportTo.z })
      pos.set(teleportTo.x, teleportTo.y, teleportTo.z)
      velocityXZ.current.set(0, 0, 0)
      velocityY.current = 0
      useVrCharacterStore.getState().clearTeleportRequest()
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
    const sprinting = isMoving && (!!keys['r'] || !!gamepad?.sprint)
    if (isMoving) {
      const speed = MOVE_SPEED * (sprinting ? SPRINT_MULTIPLIER : 1)
      input.normalize().multiplyScalar(speed * Math.min(1, inputLength))
    }

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
      walkCycle.current += delta * WALK_CYCLE_SPEED * (0.6 + 0.4 * Math.min(1.8, velocityXZ.current.length() / MOVE_SPEED))
    } else {
      walkCycle.current = 0
    }

    // Wall collision via raycasts (fast, works against any scenery geometry).
    // Flying (admin /fly, see useFlyModeStore) also passes through walls —
    // same as WoW's .fly, meant for scouting a map freely.
    if (!noClip && !flying) {
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

    // Vuelo de admin: sin gravedad, sube/baja libre con Espacio/Shift, sin
    // pasar por el character controller de Rapier (que solo sabe moverse en
    // Y por gravedad/salto, no por un input vertical libre).
    const body = bodyRef.current
    if (flying) {
      const FLY_SPEED = MOVE_SPEED * 1.6
      if (keys[' '] || keys['spacebar']) pos.y += FLY_SPEED * delta
      if (keys['shift']) pos.y -= FLY_SPEED * delta
      velocityY.current = 0
      if (body) body.setNextKinematicTranslation({ x: pos.x, y: pos.y, z: pos.z })
      group.current.position.set(pos.x, pos.y, pos.z)
    } else if (!raycastGround && body && body.numColliders() > 0) {
      // Gravity + jump via Rapier character controller (only Y axis).
      // The CC detects a flat ground CuboidCollider when one exists; raycasts
      // handle walls above and stand in for gravity in worlds (room, anfi,
      // tree, or any future mission) that don't add one.
      // Guard: body.collider(0) returns undefined during the first Rapier tick
      // before colliders are fully initialized — passing undefined crashes the
      // controller and kills the WebGL context. Fall through to the raycast
      // fallback in that case.
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
      // Fallback mientras el colisionador Rapier todavía no existe — un
      // trimesh pesado (ej. computer_lab.glb, un salón entero) tarda varios
      // frames en construirse de forma asíncrona, así que este camino SÍ se
      // usa de verdad al entrar a esos mundos, no solo en mundos sin física.
      const groundY = getGroundY(raycaster, scenery, groundRayHeight, pos.x, pos.z, multiLevel ? pos.y + STEP_UP : undefined)
      if (pos.y <= groundY) {
        pos.y = groundY
        velocityY.current = 0
        if (keys[' '] || keys['spacebar'] || gamepad?.jump) velocityY.current = JUMP_SPEED
      }
      velocityY.current += GRAVITY * delta
      pos.y += velocityY.current * delta
      // Sin esto, el body kinematic se queda congelado en su posición
      // inicial (fijada una sola vez al montar) mientras dura este modo.
      // En cuanto el colisionador Rapier terminaba de construirse, el otro
      // branch leía body.translation() —esa posición vieja— y TELETRANSPORTABA
      // al jugador de vuelta ahí de golpe, a menudo en el aire sobre una
      // mesa o fuera del piso real: el bug real detrás de "siempre te caes
      // al vacío al entrar". Mantenerlo sincronizado aquí también evita el salto.
      if (body) body.setNextKinematicTranslation({ x: pos.x, y: pos.y, z: pos.z })
    }

    if (meshGroup.current) {
      const spd = Math.min(1.8, velocityXZ.current.length() / MOVE_SPEED) // 0 quieto · 1 caminando · 1.8 corriendo
      animateBody(meshGroup.current, walkCycle.current, spd, state.clock.elapsedTime, PLAYER_SCALE * visualScale)
    }

    if (fillRef.current) {
      const dx = camera.position.x - pos.x, dz = camera.position.z - pos.z, d = Math.hypot(dx, dz) || 1
      fillRef.current.position.set(pos.x + (dx / d) * 0.8, pos.y + 0.55, pos.z + (dz / d) * 0.8)
    }

    // Compañero: va por su cuenta (no pegado al costado): corre hasta quedar cerca, mira hacia donde
    // va y camina con el mismo balanceo que el jugador. Si se queda muy lejos (teleport) reaparece cerca.
    if (companionFollows && compRef.current) {
      const c = compRef.current, cs = comp.current
      if (!cs.ready || c.position.distanceTo(pos) > 14) { c.position.set(pos.x - 0.8, pos.y, pos.z - 0.8); cs.ready = true }
      const dx = pos.x - c.position.x, dz = pos.z - c.position.z, dist = Math.hypot(dx, dz)
      const STOP = 0.9
      cs.moving = dist > STOP + 0.05
      if (cs.moving) {
        const step = Math.min(MOVE_SPEED * 1.3 * delta, dist - STOP, 0.1 + (dist - STOP) * 6 * delta)
        c.position.x += (dx / dist) * step
        c.position.z += (dz / dist) * step
        cs.phase += delta * WALK_CYCLE_SPEED * 1.1
        const ta = Math.atan2(dx, dz)
        cs.yaw += Math.atan2(Math.sin(ta - cs.yaw), Math.cos(ta - cs.yaw)) * Math.min(1, TURN_SPEED * delta)
      } else {
        cs.phase = 0
        cs.yaw += Math.atan2(Math.sin(group.current.rotation.y - cs.yaw), Math.cos(group.current.rotation.y - cs.yaw)) * Math.min(1, 3 * delta)
      }
      c.rotation.y = cs.yaw
      const gy = getGroundY(raycaster, scenery, groundRayHeight, c.position.x, c.position.z, multiLevel ? c.position.y + STEP_UP : undefined)
      c.position.y += (gy - c.position.y) * Math.min(1, 14 * delta)
      const inner = c.children[0]
      if (inner) animateBody(inner, cs.phase, cs.moving ? 1 : 0, state.clock.elapsedTime + 1.7, c.userData.scale)
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
        Object.assign(raycaster, { far: distance + 1 }) // limita el rayo (no probar mallas lejanas); se restaura abajo
        // Ignore the flat ground/plaza here — they shouldn't pull the camera in
        // when looking down or zooming out, only real obstacles (walls,
        // buildings) should.
        const camHits = raycaster.intersectObject(scenery, true).filter((hit) => !hit.object.userData?.isFloor)
        Object.assign(raycaster, { far: Infinity })
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
      {fillLight && <pointLight ref={fillRef} color="#fff1dc" intensity={1.8} distance={4} decay={2} />}
      {/* Compañero que sigue (mascota si juegas con el avatar, y al revés) — en coordenadas de mundo */}
      {companionFollows && (
        <group ref={compRef} userData={{ scale: PLAYER_SCALE * (activeChar === 'avatar' ? MASCOT_RELATIVE_SCALE : AVATAR_RELATIVE_SCALE) }}>
          <group scale={PLAYER_SCALE * (activeChar === 'avatar' ? MASCOT_RELATIVE_SCALE : AVATAR_RELATIVE_SCALE)}>
            {activeChar === 'avatar' ? <MascotMesh mascot={mascot} skin={skin} /> : <PlayerAvatarBody avatarId={avatarId} />}
          </group>
        </group>
      )}
      {/* Visual group — camera target + mesh + chat bubbles */}
      <group ref={group}>
        {/* Each character keeps its OWN relative scale (AVATAR_RELATIVE_SCALE /
            MASCOT_RELATIVE_SCALE) whether it's the active model or the
            companion trailing alongside — switching which one you're playing
            as never makes either model shrink or grow. */}
        <group ref={meshGroup} scale={PLAYER_SCALE * visualScale}>
          {activeChar === 'avatar' ? (
            <>
              <group scale={AVATAR_RELATIVE_SCALE}>
                <PlayerAvatarBody avatarId={avatarId} />
              </group>
            </>
          ) : (
            <>
              <group scale={MASCOT_RELATIVE_SCALE}>
                <MascotMesh mascot={mascot} skin={skin} />
              </group>
            </>
          )}
        </group>
        <BubbleStack bubbles={bubbles} baseY={PLAYER_HEIGHT + 1.1} color={colorFromId(playerId)} />
      </group>
    </>
  )
}
