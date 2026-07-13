import { create } from 'zustand'

// Objetivo seleccionado en el mundo VR (estilo WoW: clic en un NPC o monstruo
// para "targetearlo"). Solo guarda una referencia liviana — el marco lee los
// datos en vivo (HP del monstruo, nombre del NPC) desde su store/registro
// correspondiente, así siempre muestra el estado actual, no una foto vieja.
export const useTargetStore = create((set) => ({
  target: null, // { kind: 'npc' | 'mob', id }

  setTarget: (kind, id) => set({ target: { kind, id } }),
  clearTarget: () => set({ target: null }),
}))
