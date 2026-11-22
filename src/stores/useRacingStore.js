import { create } from 'zustand'

// Perfil de Oliver Racing, por mundo (medicina, programacion, filosofia): XP, nivel, el vehículo más alto alcanzado (`bestTier`,
// desbloquea ese y todos los anteriores), estadísticas, el vehículo elegido para empezar y la personalización. Se guarda en el snapshot de la
// cuenta (progressSnapshot → `racing`), igual que el descubrimiento de zonas.
const EMPTY = () => ({ xp: 0, bestTier: 0, runs: 0, correct: 0, wrong: 0, bestScore: 0, startTier: 0, levels: {}, custom: { color: null, glow: null, accessory: 'none', char: 'doc' } })
// Estrellas de un nivel según los aciertos de 12: ⭐ 6+, ⭐⭐ 9+, ⭐⭐⭐ 11+. El nivel siguiente se desbloquea con al menos 1 estrella.
export const starsOf = (correct) => (correct >= 11 ? 3 : correct >= 9 ? 2 : correct >= 6 ? 1 : 0)
export const levelUnlocked = (profile, i, levels) => i === 0 || (profile.levels?.[levels[i - 1]?.id]?.stars || 0) >= 1
export const levelOfXp = (xp) => Math.floor(Math.sqrt(xp / 120)) + 1
export const xpForLevel = (lv) => 120 * (lv - 1) * (lv - 1)

export const useRacingStore = create((set, get) => ({
  worlds: {},
  profile: (id) => ({ ...EMPTY(), ...get().worlds[id], custom: { ...EMPTY().custom, ...get().worlds[id]?.custom } }),
  patch: (id, fields) => set((s) => ({ worlds: { ...s.worlds, [id]: { ...EMPTY(), ...s.worlds[id], ...fields } } })),
  setCustom: (id, c) => set((s) => ({ worlds: { ...s.worlds, [id]: { ...EMPTY(), ...s.worlds[id], custom: { ...EMPTY().custom, ...s.worlds[id]?.custom, ...c } } } })),
  // Fin de una carrera: suma XP (aciertos, puntos y terminar), actualiza récords y desbloquea el vehículo más alto que alcanzaste
  finishRun: (id, { correct, wrong, score, maxTier, levelId }) => {
    const cur = get().profile(id), gain = correct * 40 + Math.round(score / 8) + 80
    const next = { xp: cur.xp + gain, runs: cur.runs + 1, correct: cur.correct + correct, wrong: cur.wrong + wrong, bestScore: Math.max(cur.bestScore, score), bestTier: Math.max(cur.bestTier, maxTier) }
    const stars = starsOf(correct), prev = levelId ? cur.levels?.[levelId] : null
    if (levelId) next.levels = { ...cur.levels, [levelId]: { stars: Math.max(prev?.stars || 0, stars), best: Math.max(prev?.best || 0, score), runs: (prev?.runs || 0) + 1 } }
    set((s) => ({ worlds: { ...s.worlds, [id]: { ...cur, ...next } } }))
    return { gain, stars, newStars: stars > (prev?.stars || 0), leveledUp: levelOfXp(next.xp) > levelOfXp(cur.xp), unlocked: next.bestTier > cur.bestTier ? next.bestTier : null, level: levelOfXp(next.xp) }
  },
  loadRacing: (data) => set({ worlds: data && typeof data === 'object' && !Array.isArray(data) ? data : {} }),
}))
