import { create } from 'zustand'

// VR world camera/control preferences, configurable from the "📷 Cámara"
// menu in the top-right of the VR page. Persisted via progressSnapshot like
// the other small VR stores (useFriendsStore, etc).
//
// `cameraDistance`/`cameraHeight`/`zoomMin`/`zoomMax`/`pitchMin`/`pitchMax`
// only apply to third-person mode — every computer/monitor combo "feels"
// different, so letting the player tune these directly fixes the camera for
// their setup instead of us guessing one global default. `fov` applies to
// both modes (wider FOV helps see buildings when zoomed out or up close in
// first person).
export const useVrSettingsStore = create((set) => ({
  cameraMode: 'third', // 'third' | 'first'
  mouseSensitivity: 1,
  invertY: false,

  cameraDistance: 6.5,
  cameraHeight: 2.4,
  zoomMin: 1.2,
  zoomMax: 55,
  pitchMin: -0.6,
  pitchMax: 1.0,
  fov: 58,

  // Traversal / gameplay
  noClip: false,    // pass through walls (emergency unstuck)
  npcVoice: true,   // NPCs speak their lines via Web Speech API
  micEnabled: false, // player microphone active for voice chat

  setCameraMode: (cameraMode) => set({ cameraMode: cameraMode === 'first' ? 'first' : 'third' }),
  setMouseSensitivity: (mouseSensitivity) => set({ mouseSensitivity }),
  setInvertY: (invertY) => set({ invertY }),
  setCameraDistance: (cameraDistance) => set({ cameraDistance }),
  setCameraHeight: (cameraHeight) => set({ cameraHeight }),
  setZoomMin: (zoomMin) => set({ zoomMin }),
  setZoomMax: (zoomMax) => set({ zoomMax }),
  setPitchMin: (pitchMin) => set({ pitchMin }),
  setPitchMax: (pitchMax) => set({ pitchMax }),
  setFov: (fov) => set({ fov }),
  setNoClip: (noClip) => set({ noClip }),
  setNpcVoice: (npcVoice) => set({ npcVoice }),
  setMicEnabled: (micEnabled) => set({ micEnabled }),

  loadVrSettings: (settings) =>
    set({
      cameraMode: settings?.cameraMode === 'first' ? 'first' : 'third',
      mouseSensitivity:
        typeof settings?.mouseSensitivity === 'number' ? settings.mouseSensitivity : 1,
      invertY: !!settings?.invertY,
      cameraDistance: typeof settings?.cameraDistance === 'number' ? settings.cameraDistance : 6.5,
      cameraHeight: typeof settings?.cameraHeight === 'number' ? settings.cameraHeight : 2.4,
      zoomMin: typeof settings?.zoomMin === 'number' ? settings.zoomMin : 1.2,
      zoomMax: typeof settings?.zoomMax === 'number' ? settings.zoomMax : 55,
      pitchMin: typeof settings?.pitchMin === 'number' ? settings.pitchMin : -0.6,
      pitchMax: typeof settings?.pitchMax === 'number' ? settings.pitchMax : 1.0,
      fov: typeof settings?.fov === 'number' ? settings.fov : 58,
      noClip: !!settings?.noClip,
      npcVoice: settings?.npcVoice !== false,
      micEnabled: false, // always off on load — user opts in per session
    }),
}))
