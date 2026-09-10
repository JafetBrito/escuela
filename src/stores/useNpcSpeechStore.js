import { create } from 'zustand'

// Solo para que IdleNpc sepa "no interrumpas, este NPC está dando su
// discurso programado" y no dispare su propio speechSynthesis.cancel() con
// una línea suelta encima (ver NpcSpeechPlayer.jsx).
export const useNpcSpeechStore = create((set) => ({
  activeNpcId: null,
  setActive: (npcId) => set({ activeNpcId: npcId }),
  clear: () => set({ activeNpcId: null }),
}))
