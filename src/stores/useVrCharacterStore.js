import { create } from 'zustand'

// Tracks which character the player is currently "playing as" in the VR world.
// When activeChar changes, the skill bar, 3D model size, and TTS voice all update.
export const useVrCharacterStore = create((set) => ({
  activeChar: 'avatar',    // 'avatar' | 'mascot'
  companionFollows: true,  // does the inactive character trail behind (true) or stay parked (false)?
  // Per-character world position, only meaningful while parked. Captured the
  // moment a character is left behind (companionFollows -> false, or a swap
  // while already parked) so avatar and mascot can each have their own spot
  // instead of teleporting onto whichever one you're currently moving.
  parkedPositions: { avatar: null, mascot: null },
  // One-shot teleport request consumed by <Player>'s useFrame — set by
  // toggleChar when swapping onto a character that has a remembered parked
  // spot, so the shared physics body actually moves there instead of just
  // swapping which model renders at its current (wrong) position.
  teleportTo: null,

  // `currentPos` (the live shared position, from playerPositionRef) is only
  // needed while parked: the character you're switching AWAY from keeps
  // standing right where you are now, and the one you're switching TO
  // resumes from its own last parked spot (or stays put if it never had one).
  toggleChar: (currentPos) => set((s) => {
    const next = s.activeChar === 'avatar' ? 'mascot' : 'avatar'
    if (s.companionFollows) return { activeChar: next }
    const parkedPositions = currentPos
      ? { ...s.parkedPositions, [s.activeChar]: { x: currentPos.x, y: currentPos.y, z: currentPos.z } }
      : s.parkedPositions
    return { activeChar: next, parkedPositions, teleportTo: parkedPositions[next] ?? null }
  }),
  setActiveChar: (c) => set({ activeChar: c }),
  setCompanionFollows: (v) => set({ companionFollows: v }),
  setParkedPosition: (char, pos) =>
    set((s) => ({ parkedPositions: { ...s.parkedPositions, [char]: pos ? { x: pos.x, y: pos.y, z: pos.z } : null } })),
  clearTeleportRequest: () => set({ teleportTo: null }),
}))
