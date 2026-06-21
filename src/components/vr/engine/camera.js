import { useRef } from 'react'
import { useVrSettingsStore } from '../../../stores/useVrSettingsStore'
import {
  CAMERA_DISTANCE,
  FIRST_PERSON_PITCH_MIN,
  FIRST_PERSON_PITCH_MAX,
  MOUSE_SENSITIVITY,
  WHEEL_ZOOM_SPEED,
  PINCH_ZOOM_SPEED,
  GAMEPAD_DEADZONE,
  GAMEPAD_LOOK_SPEED,
  GAMEPAD_ZOOM_SPEED,
  clamp,
} from './constants'

// First-person allows a much wider up/down look range than the 3rd-person
// orbit camera. Third-person's range comes from useVrSettingsStore so each
// player can tune how far they can look up/down for their own setup.
export function getPitchRange(cameraMode) {
  if (cameraMode === 'first') return [FIRST_PERSON_PITCH_MIN, FIRST_PERSON_PITCH_MAX]
  const { pitchMin, pitchMax } = useVrSettingsStore.getState()
  return [pitchMin, pitchMax]
}

// Camera orbit (mouse-drag controlled) around the player, zoomable with the
// mouse wheel or a two-finger pinch. <Player> reads `camera.current` every
// frame to position itself; this hook only tracks pointer/wheel input.
export function useCameraControls() {
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

// Polls the first connected gamepad (Xbox controller or anything else the
// browser maps to the standard layout) and applies its right stick / bumpers
// directly to the camera, returning the left stick as a movement input (or
// null if no gamepad is connected). Called once per frame from <Player>.
export function applyGamepadInput(delta, cameraRef) {
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
