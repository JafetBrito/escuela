import { create } from 'zustand'

// Open/closed state + active tab for the floating mascot companion menu
// ("N48"). `panel` is `"${entityId}-${subTabId}"` (e.g. 'avatar-bolsas',
// 'mascota-chat') — lifted out of the component so other parts of the app
// (e.g. the VR world's P/B keyboard shortcuts) can open it on a specific tab.
export const useMascotCompanionStore = create((set) => ({
  open: false,
  panel: 'mascota-chat',
  // Set by the VR world's two separate entry points (mascot paw button vs.
  // "tu clase" portrait) so the menu shows ONLY that entity with no way to
  // switch to the other — outside VR (the learning app's companion) this
  // stays null and the Avatar/Mascota switcher behaves as before.
  lockedEntity: null,
  // Text pre-fill for the mascot chat (set by TextSelectionMenu's "ask mascot" button)
  chatPrefill: null,
  setOpen: (open) => set({ open }),
  setPanel: (panel) => set({ panel }),
  openLocked: (panel, entityId) => set({ open: true, panel, lockedEntity: entityId }),
  setChatPrefill: (text) => set({ chatPrefill: text }),
  clearChatPrefill: () => set({ chatPrefill: null }),
}))
