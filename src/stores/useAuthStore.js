import { create } from 'zustand'

export const useAuthStore = create((set, get) => ({
  license: null,
  googleUser: null,
  isUnlocked: false,

  unlock: (license) =>
    set({
      license,
      isUnlocked: true,
    }),

  // Called when the user signs in with Google. They get into the app (free
  // course access) without a license; they can buy/upload a key later.
  registerWithGoogle: (googleUser) =>
    set({
      googleUser,
      isUnlocked: true,
    }),

  // Used when restoring a saved account snapshot — doesn't force isUnlocked
  // off if it's already true for another reason.
  loadGoogleUser: (googleUser) =>
    set((state) => ({
      googleUser,
      isUnlocked: state.isUnlocked || !!googleUser,
    })),

  lock: () => set({ license: null, googleUser: null, isUnlocked: false }),

  // 'full' licenses unlock every course; 'single' licenses only unlock the
  // course they were issued for. The demo course is free for any
  // registered/unlocked user, license or not.
  hasAccessToCourse: (courseId) => {
    if (courseId === 'course-demo') return true
    const license = get().license
    if (!license) return false
    return license.type === 'full' || license.courseId === courseId
  },
}))
