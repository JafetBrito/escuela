import { create } from 'zustand'

// Perfil de Oliver Racing, por mundo (medicina, programacion, filosofia): XP, nivel, el vehículo más alto alcanzado (`bestTier`,
// desbloquea ese y todos los anteriores), estadísticas, el vehículo elegido para empezar y la personalización. Se guarda en el snapshot de la
// cuenta (progressSnapshot → `racing`), igual que el descubrimiento de zonas.
const EMPTY = () => ({ xp: 0, bestTier: 0, runs: 0, correct: 0, wrong: 0, bestScore: 0, startTier: 0, custom: { color: null, glow: null, accessory: 'none' } })
export const levelOfXp = (xp) => Math.floor(Math.sqrt(xp / 120)) + 1
export const xpForLevel = (lv) => 120 * (lv - 1) * (lv - 1)

export const useRacingStore = create((set, get) => ({
  worlds: {},
  profile: (id) => ({ ...EMPTY(), ...get().worlds[id], custom: { ...EMPTY().custom, ...get().worlds[id]?.custom } }),
  patch: (id, fields) => set((s) => ({ worlds: { ...s.worlds, [id]: { ...EMPTY(), ...s.worlds[id], ...fields } } })),
  setCustom: (id, c) => set((s) => ({ worlds: { ...s.worlds, [id]: { ...EMPTY(), ...s.worlds[id], custom: { ...EMPTY().custom, ...s.worlds[id]?.custom, ...c } } } })),
  // Fin de una carrera: suma XP (aciertos, puntos y terminar), actualiza récords y desbloquea el vehículo más alto que alcanzaste
  finishRun: (id, { correct, wrong, score, maxTier }) => {
    const cur = get().profile(id), gain = correct * 40 + Math.round(score / 8) + 80
    const next = { xp: cur.xp + gain, runs: cur.runs + 1, correct: cur.correct + correct, wrong: cur.wrong + wrong, bestScore: Math.max(cur.bestScore, score), bestTier: Math.max(cur.bestTier, maxTier) }
    set((s) => ({ worlds: { ...s.worlds, [id]: { ...cur, ...next } } }))
    return { gain, leveledUp: levelOfXp(next.xp) > levelOfXp(cur.xp), unlocked: next.bestTier > cur.bestTier ? next.bestTier : null, level: levelOfXp(next.xp) }
  },
  loadRacing: (data) => set({ worlds: data && typeof data === 'object' && !Array.isArray(data) ? data : {} }),
}))
