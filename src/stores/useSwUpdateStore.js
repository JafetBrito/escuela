import { create } from 'zustand'

// Flipped by main.jsx the instant the service worker detects a newly
// deployed build, right before it force-reloads to apply it — lets
// App.jsx show a popup instead of the page silently yanking itself out
// from under the user. `updateFn` is the vite-plugin-pwa `updateSW`
// callback (registered once in main.jsx) — stored here so the popup's
// "Actualizar ahora" button can trigger it immediately instead of waiting
// out the automatic delay.
export const useSwUpdateStore = create((set) => ({
  updating: false,
  updateFn: null,
  setUpdating: () => set({ updating: true }),
  setUpdateFn: (fn) => set({ updateFn: fn }),
}))
