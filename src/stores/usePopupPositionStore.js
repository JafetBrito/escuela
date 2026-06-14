import { create } from 'zustand'

// Remembers where the user dragged floating popups (Radio mini-player,
// botón de Cámara) so they reopen in the same spot. `positions[id]` is
// `{ x, y }` in pixels from the top-left corner, or absent for the default
// CSS position.
export const usePopupPositionStore = create((set) => ({
  positions: {},

  setPosition: (id, pos) =>
    set((state) => ({ positions: { ...state.positions, [id]: pos } })),

  loadPositions: (positions) => set({ positions: positions ?? {} }),
}))
