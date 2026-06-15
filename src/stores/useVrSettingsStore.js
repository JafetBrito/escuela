import { create } from 'zustand'

// VR world camera/control preferences, configurable from the "📷 Cámara"
// menu in the top-right of the VR page. Persisted via progressSnapshot like
// the other small VR stores (useFriendsStore, etc).
export const useVrSettingsStore = create((set) => ({
  cameraMode: 'third', // 'third' | 'first'
  mouseSensitivity: 1,
  invertY: false,

  setCameraMode: (cameraMode) => set({ cameraMode: cameraMode === 'first' ? 'first' : 'third' }),
  setMouseSensitivity: (mouseSensitivity) => set({ mouseSensitivity }),
  setInvertY: (invertY) => set({ invertY }),

  loadVrSettings: (settings) =>
    set({
      cameraMode: settings?.cameraMode === 'first' ? 'first' : 'third',
      mouseSensitivity:
        typeof settings?.mouseSensitivity === 'number' ? settings.mouseSensitivity : 1,
      invertY: !!settings?.invertY,
    }),
}))
