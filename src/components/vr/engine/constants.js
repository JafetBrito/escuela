import * as THREE from 'three'

// ─── VR engine constants ────────────────────────────────────────────────────
// Movement/camera/input tuning shared by every VR world (campus, room,
// anfiteatro, árbol del mundo, and any future mission). None of this knows
// about specific map geometry — only how the player moves and how the
// camera follows them. Tune values here and every world picks it up.

export const MOVE_SPEED = 5.5
// Turning used to lag noticeably behind a quick direction change, which read
// as the character "sliding"/struggling to turn — raised alongside MOVE_ACCEL
// for a snappier, less floaty feel overall.
export const TURN_SPEED = 14
// How quickly the player accelerates/decelerates toward the target walking
// speed (higher = snappier, lower = floatier).
export const MOVE_ACCEL = 24
// Hold R to run at this multiple of MOVE_SPEED.
export const SPRINT_MULTIPLIER = 1.8

// MascotMesh normalizes models to ~2 units tall. The scenery footprint is
// ~24 units wide, so we shrink the player to a human-ish scale that doesn't
// dwarf the structure it's walking around.
export const PLAYER_SCALE = 0.2
export const PLAYER_HEIGHT = PLAYER_SCALE * 2
// MascotMesh centers every model on its own bounding box and normalizes it
// to ~2 units tall, so before any outer scale is applied its feet sit at
// y = -1 (half of that 2-unit height) instead of y = 0. Every mascot/NPC
// group is lifted by `scale * MODEL_HALF_HEIGHT` so feet land exactly on
// the ground ray hit instead of sinking halfway into the floor.
export const MODEL_HALF_HEIGHT = 1
// How far ahead of/around the player we check for walls before letting them
// move into something (in world units).
export const COLLISION_RADIUS = PLAYER_HEIGHT * 0.6
export const WALK_CYCLE_SPEED = 9
export const WALK_BOB_HEIGHT = 0.07
export const WALK_TILT = 0.06

// Camera orbit (mouse-drag controlled) around the player, zoomable with the
// mouse wheel or a two-finger pinch. Movement is relative to this camera, so
// "forward" always means "away from the camera", like a typical 3rd-person
// game.
// Fallback default for useCameraControls's initial distance, before the
// player's saved cameraDistance setting loads from useVrSettingsStore.
export const CAMERA_DISTANCE = 6.5
export const MOUSE_SENSITIVITY = 0.005
export const WHEEL_ZOOM_SPEED = 0.0065
export const PINCH_ZOOM_SPEED = 0.07
// How quickly the camera distance/position glide toward their target values
// (per second, via exponential smoothing). Higher = snappier.
export const ZOOM_SMOOTHING = 6
export const CAMERA_SMOOTHING = 8
// When a building/wall sits between the player and where the camera "wants"
// to be, the camera is pulled in to just in front of it (minus this margin)
// instead of clipping through.
export const CAMERA_COLLISION_MARGIN = 0.35

// First-person mode: the camera sits at the player's eye height and looks
// exactly where yaw/pitch point, with no orbit distance/collision pull-in.
// It allows a much wider pitch range than the 3rd-person orbit since there's
// no risk of clipping into the player's own model.
export const FIRST_PERSON_EYE_HEIGHT = 0.62
export const FIRST_PERSON_PITCH_MIN = -1.3
export const FIRST_PERSON_PITCH_MAX = 1.3

// Xbox/standard-gamepad support: left stick moves the same as WASD, right
// stick looks around like a mouse drag, the A button jumps, and the
// shoulder buttons (LB/RB) zoom in/out.
export const GAMEPAD_DEADZONE = 0.18
export const GAMEPAD_LOOK_SPEED = 2.2
export const GAMEPAD_ZOOM_SPEED = 12

// Jumping.
export const GRAVITY = -20
export const JUMP_SPEED = 7

// Movement directions, shared by the keyboard listener and the on-screen
// touch D-pad: both just flip the same keys on/off.
export const DIRECTION_KEYS = {
  up: ['w', 'arrowup'],
  down: ['s', 'arrowdown'],
  left: ['a', 'arrowleft'],
  right: ['d', 'arrowright'],
}

export const clamp = (value, min, max) => Math.min(max, Math.max(min, value))

export const DOWN = new THREE.Vector3(0, -1, 0)
export const AXIS_X = new THREE.Vector3(1, 0, 0)
export const AXIS_Z = new THREE.Vector3(0, 0, 1)
