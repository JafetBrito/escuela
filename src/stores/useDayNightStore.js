import { create } from 'zustand'

// 1 game-minute per real second → full 24hr cycle in 24 real minutes of play.
// Raise speed to see day/night faster (debug); lower for slower immersive cycle.
export const useDayNightStore = create((set, get) => ({
  timeOfDay: 14.0, // start at 2 pm
  speed: 1.0,      // game-minutes per real second

  tick(deltaSec) {
    set((s) => ({ timeOfDay: (s.timeOfDay + deltaSec * s.speed / 60) % 24 }))
  },

  setTimeOfDay: (t) => set({ timeOfDay: ((t % 24) + 24) % 24 }),
  setSpeed: (speed) => set({ speed }),
}))
