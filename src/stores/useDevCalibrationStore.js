import { create } from 'zustand'

// ponytail: throwaway dev tool to dial in PLAYER_AVATARS' modelRotationY
// (useGameStore.js) live, without a redeploy round-trip per guess. Once the
// right angle is confirmed, hardcode it into modelRotationY and delete this
// store + its DevToolsPanel section + the override read in Player.jsx.
export const useDevCalibrationStore = create((set) => ({
  avatarRotationOverride: 0, // radians, added on top of each avatar's modelRotationY
  nudge: (deltaRad) => set((s) => ({ avatarRotationOverride: s.avatarRotationOverride + deltaRad })),
  reset: () => set({ avatarRotationOverride: 0 }),
}))
