import { create } from 'zustand'

// Open/closed state + active tab for the floating mascot companion menu.
// Lifted out of the component so other parts of the app (e.g. the VR world's
// C/B keyboard shortcuts) can open it on a specific tab.
export const useMascotCompanionStore = create((set) => ({
  open: false,
  panel: 'chat',
  setOpen: (open) => set({ open }),
  toggleOpen: () => set((s) => ({ open: !s.open })),
  setPanel: (panel) => set({ panel }),
  openPanel: (panel) => set({ open: true, panel }),
}))
