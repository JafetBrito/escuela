// Some browsers report "supports WebGL" but the OS/GPU stack still refuses
// to actually create a context (seen in console as "THREE.WebGLRenderer:
// A WebGL context could not be created... Sandboxed = yes, GL_VENDOR =
// Disabled" — happens when hardware acceleration is off or the GPU process
// is sandboxed/crashed). Mounting a react-three-fiber <Canvas> in that state
// throws an uncaught error every time. This does the same probe react-
// three-fiber does internally, but synchronously and outside React, so
// callers can skip mounting <Canvas> entirely instead of crashing into it.
export function isWebglAvailable() {
  try {
    const canvas = document.createElement('canvas')
    return !!(canvas.getContext('webgl2') || canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
  } catch {
    return false
  }
}
