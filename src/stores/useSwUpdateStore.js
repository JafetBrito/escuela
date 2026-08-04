import { create } from 'zustand'

// Flipped by main.jsx the instant the service worker detects a newly
// deployed build, right before it force-reloads to apply it — lets
// App.jsx show a brief "updating…" notice instead of the page silently
// yanking itself out from under the user.
export const useSwUpdateStore = create((set) => ({
  updating: false,
  setUpdating: () => set({ updating: true }),
}))
