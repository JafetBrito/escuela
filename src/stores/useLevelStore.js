import { create } from 'zustand'

// Simple leveling system: 90 levels, 500 XP per level (linear).
// Level 90 is the cap — XP keeps accumulating but level stops climbing.
export const MAX_LEVEL = 90
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
  addXp: (amount) => {
    const prevLevel = levelForXp(get().xp)
    const xp = Math.max(0, get().xp + amount)
    set({ xp })
    return { level: levelForXp(xp), leveledUp: levelForXp(xp) > prevLevel }
  },

  loadXp: (xp) => set({ xp: xp ?? 0 }),
}))
