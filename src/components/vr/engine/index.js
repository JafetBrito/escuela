// ─── VR engine ───────────────────────────────────────────────────────────
// Movement, camera, and input — independent of any specific map. Every VR
// world (campus, room, anfiteatro, árbol del mundo, and any future mission)
// imports its player/camera/input behavior from here instead of rolling its
// own. A world only needs to provide `{ model, groundRayHeight }` (its
// ground hook's existing contract) and render <Player> + the input helpers.
//
// Updating movement/camera feel here updates every world at once. Adding or
// changing a world's geometry never touches this folder.

export * from './constants'
export * from './input.jsx'
export * from './camera'
export * from './ChatBubbles'
export * from './Player'
export { CameraSettingsMenu } from './CameraSettingsMenu'
export { FlashlightSpot } from './FlashlightSpot'
