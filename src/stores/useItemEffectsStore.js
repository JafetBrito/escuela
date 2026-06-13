import { create } from 'zustand'

// Tracks on/off state for interactive "Objetos" (Lente de Resumen, Caja del
// TDAH, Reina Nefertiti, Cámara). Other parts of the app react to these flags
// to apply their effects (open a modal, swap the theme, show a button, etc).
export const useItemEffectsStore = create((set) => ({
  activeItems: {},

  toggleItem: (id) =>
    set((state) => ({ activeItems: { ...state.activeItems, [id]: !state.activeItems[id] } })),

  setItemActive: (id, active) =>
    set((state) => ({ activeItems: { ...state.activeItems, [id]: active } })),

  loadActiveItems: (activeItems) => set({ activeItems: activeItems ?? {} }),
}))
