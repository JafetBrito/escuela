import { create } from 'zustand'

// Tracks which character the player is currently "playing as" in the VR world.
// When activeChar changes, the skill bar, 3D model size, and TTS voice all update.
export const useVrCharacterStore = create((set) => ({
  activeChar: 'avatar',    // 'avatar' | 'mascot'
  companionFollows: true,  // does the inactive character trail behind (true) or stay put (false)?
  stayPosition: null,      // { x, y, z } — world position of the parked companion

  toggleChar: () => set((s) => ({ activeChar: s.activeChar === 'avatar' ? 'mascot' : 'avatar' })),
  setActiveChar: (c) => set({ activeChar: c }),
  setCompanionFollows: (v) => set({ companionFollows: v }),
  setStayPosition: (pos) => set({ stayPosition: pos ? { x: pos.x, y: pos.y, z: pos.z } : null }),
}))
