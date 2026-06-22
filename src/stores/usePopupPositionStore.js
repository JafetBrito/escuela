import { create } from 'zustand'

// Remembers where the user dragged floating popups (Radio mini-player,
// botón de Cámara) and how big they sized them, so they reopen the same
// way. `positions[id]` is `{ x, y, scale }` — `x`/`y` in pixels from the
// top-left corner (absent = default CSS position), `scale` a 0.6-1.6
// multiplier (absent = 1, default size). Sized from Ajustes, since not
// every phone screen fits the same default size.
export const usePopupPositionStore = create((set) => ({
  positions: {},

  setPosition: (id, pos) =>
    set((state) => ({ positions: { ...state.positions, [id]: { ...state.positions[id], ...pos } } })),

  setScale: (id, scale) =>
    set((state) => ({ positions: { ...state.positions, [id]: { ...state.positions[id], scale } } })),

  resetAll: () => set({ positions: {} }),

  loadPositions: (positions) => set({ positions: positions ?? {} }),
}))
