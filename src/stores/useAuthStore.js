import { create } from 'zustand'

export const useAuthStore = create((set, get) => ({
  license: null,
  isUnlocked: false,

  unlock: (license) =>
    set({
      license,
      isUnlocked: true,
    }),

  lock: () => set({ license: null, isUnlocked: false }),

  // 'full' licenses unlock every course; 'single' licenses only unlock the
  // course they were issued for.
  hasAccessToCourse: (courseId) => {
    const license = get().license
    if (!license) return false
    return license.type === 'full' || license.courseId === courseId
  },
}))
