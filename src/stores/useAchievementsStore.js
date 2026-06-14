import { create } from 'zustand'

// Tracks unlocked achievement ids (course medals + static catalog from
// achievementsRegistry.js) and a queue of pending unlock toasts shown by
// AchievementToast.
export const useAchievementsStore = create((set, get) => ({
  unlocked: [],
  toastQueue: [],

  isUnlocked: (id) => get().unlocked.includes(id),

  // Returns true if this was a new unlock (and queues a toast for it).
  unlock: (achievement) => {
    if (get().unlocked.includes(achievement.id)) return false
    set((state) => ({
      unlocked: [...state.unlocked, achievement.id],
      toastQueue: [...state.toastQueue, achievement],
    }))
    return true
  },

  dismissToast: () =>
    set((state) => ({ toastQueue: state.toastQueue.slice(1) })),

  loadUnlocked: (unlocked) => set({ unlocked: unlocked ?? [] }),
}))
