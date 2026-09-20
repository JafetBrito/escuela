import { create } from 'zustand'
import { useCurrencyStore } from './useCurrencyStore'
import { useLevelStore } from './useLevelStore'

// Respuestas del alumno a la pregunta/tarea del día de la semana temática.
// Vive en el snapshot unificado del perfil (ver progressSnapshot.js/autoSave.js),
// no en localStorage suelto: { 'YYYY-MM-DD': { themeId, answer, taskDone, at } }.
// El primer envío de cada día da una recompensa pequeña; editar después no repite.
const REWARD = { xp: 20, coins: 10 }
const MAX_LEN = 1500

export const useThemedAnswersStore = create((set, get) => ({
  entries: {},

  // Devuelve la recompensa si fue el primer envío del día, o null.
  submitAnswer: (key, themeId, answer) => {
    const text = answer.trim().slice(0, MAX_LEN)
    if (!text) return null
    const prev = get().entries[key]
    set((s) => ({ entries: { ...s.entries, [key]: { ...prev, themeId, answer: text, at: new Date().toISOString() } } }))
    if (prev?.answer) return null
    useLevelStore.getState().addXp(REWARD.xp)
    useCurrencyStore.getState().earnCoins(REWARD.coins)
    return { ...REWARD }
  },

  toggleTask: (key, themeId) => set((s) => {
    const prev = s.entries[key]
    return { entries: { ...s.entries, [key]: { ...prev, themeId, taskDone: !prev?.taskDone } } }
  }),

  // Called by progressSnapshot.applyProgressSnapshot
  loadEntries: (entries) => set({ entries: entries && typeof entries === 'object' ? entries : {} }),
}))
