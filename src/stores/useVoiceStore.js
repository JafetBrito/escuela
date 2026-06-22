import { create } from 'zustand'

// The admin's personal mic mute switch — separate from profiles.voice_enabled
// (which is how the admin grants voice to OTHER players). Admins always
// pass the permission check; this just lets them silence their own mic icon.
export const useVoiceStore = create((set) => ({
  myVoiceEnabled: true,
  toggleMyVoice: () => set((s) => ({ myVoiceEnabled: !s.myVoiceEnabled })),
  loadVoice: ({ myVoiceEnabled } = {}) => set({ myVoiceEnabled: myVoiceEnabled ?? true }),
}))
