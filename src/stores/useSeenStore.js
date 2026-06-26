import { create } from 'zustand'

// One-time popups (patch notes, welcome video) gated per ACCOUNT via the
// normal progressSnapshot sync — not localStorage, which resets on cache
// clear and made these reappear on every visit.
export const useSeenStore = create((set) => ({
  patchVersion: null,
  welcomeVideo: false,
  setPatchVersion: (v) => set({ patchVersion: v }),
  setWelcomeVideo: () => set({ welcomeVideo: true }),
  loadSeen: (data) => set({ patchVersion: data?.patchVersion ?? null, welcomeVideo: !!data?.welcomeVideo }),
}))
