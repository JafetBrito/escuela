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
  // Text pre-fill for the mascot chat (set by TextSelectionMenu's "ask mascot"
  // button, and by SearchPage's "no results, ask your mascot" button).
  chatPrefill: null,
  // autoSend: true actually sends chatPrefill right away instead of just
  // seeding the input box — used by SearchPage (the user wants the search
  // query sent as-is, not re-typed) but NOT by TextSelectionMenu (default
  // false there, unchanged behavior: selected text just seeds the input).
  chatAutoSend: false,
  setOpen: (open) => set({ open }),
  setPanel: (panel) => set({ panel }),
  openLocked: (panel, entityId) => set({ open: true, panel, lockedEntity: entityId }),
  setChatPrefill: (text, autoSend = false) => set({ chatPrefill: text, chatAutoSend: autoSend }),
  clearChatPrefill: () => set({ chatPrefill: null, chatAutoSend: false }),
}))
