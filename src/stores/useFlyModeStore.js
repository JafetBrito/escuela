import { create } from 'zustand'

// Vuelo de admin (como .fly en WoW) — se activa con /fly on|off desde la
// Consola GM, que ya es admin-only (ver GmConsole.jsx/TerminalModal). Poder
// de prueba para explorar mapas nuevos, no un ajuste de cuenta: vive solo en
// memoria, nunca se persiste ni se guarda en el snapshot.
export const useFlyModeStore = create((set) => ({
  enabled: false,
  setEnabled: (enabled) => set({ enabled }),
}))
