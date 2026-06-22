import { create } from 'zustand'

// Open/closed state + active tab for the floating mascot companion menu
// ("N48"). `panel` is `"${entityId}-${subTabId}"` (e.g. 'avatar-bolsas',
// 'mascota-chat') — lifted out of the component so other parts of the app
// (e.g. the VR world's P/B keyboard shortcuts) can open it on a specific tab.
export const useMascotCompanionStore = create((set) => ({
  open: false,
  panel: 'avatar-personaje',
  setOpen: (open) => set({ open }),
  toggleOpen: () => set((s) => ({ open: !s.open })),
  setPanel: (panel) => set({ panel }),
  openPanel: (panel) => set({ open: true, panel }),
}))
