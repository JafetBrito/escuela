import { create } from 'zustand'
import { useGameStore } from './useGameStore'

// Diablo-style leveling: 99 levels, 500 XP per level (linear), one talent
// point awarded per level gained. Level 99 is the cap — XP keeps
// accumulating but level stops climbing.
export const MAX_LEVEL = 99
export const XP_PER_LEVEL = 500

export function levelForXp(xp) {
  return Math.min(MAX_LEVEL, Math.floor(xp / XP_PER_LEVEL) + 1)
}

// Returns { level, xpIntoLevel, xpForNextLevel, isMaxLevel } for progress bars.
export function levelProgress(xp) {
  const level = levelForXp(xp)
  const isMaxLevel = level >= MAX_LEVEL
  const xpIntoLevel = xp - (level - 1) * XP_PER_LEVEL
  return {
    level,
    xpIntoLevel: isMaxLevel ? XP_PER_LEVEL : xpIntoLevel,
    xpForNextLevel: XP_PER_LEVEL,
    isMaxLevel,
  }
}

export const useLevelStore = create((set, get) => ({
  xp: 0,

  // Returns the new level so callers can react to level-ups (e.g. show a toast).
  // Also awards 1 talent point per level gained (Diablo-style), so the
  // award happens exactly once no matter which caller granted the XP.
  addXp: (amount) => {
    const prevLevel = levelForXp(get().xp)
    const xp = Math.max(0, get().xp + amount)
    set({ xp })
    const level = levelForXp(xp)
    const levelsGained = level - prevLevel
    if (levelsGained > 0) {
      useGameStore.getState().earnTalentPoints('player', levelsGained)
    }
    return { level, leveledUp: levelsGained > 0 }
  },

  loadXp: (xp) => set({ xp: xp ?? 0 }),
}))
