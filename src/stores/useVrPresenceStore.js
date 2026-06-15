import { create } from 'zustand'

// Lightweight metadata for the other players currently in the VR world
// (id -> { name, mascotId, skinId }). High-frequency position/rotation
// updates are kept out of this store (see useVrMultiplayer's
// remoteTransformsRef) so they don't trigger a React re-render on every
// network tick — this store only changes on join/leave/rename.
export const useVrPresenceStore = create((set) => ({
  connected: false,
  players: {},

  setConnected: (connected) => set({ connected }),
  setPlayers: (players) => set({ players }),

  upsertPlayer: (id, info) =>
    set((state) => ({ players: { ...state.players, [id]: info } })),

  removePlayer: (id) =>
    set((state) => {
      if (!(id in state.players)) return state
      const players = { ...state.players }
      delete players[id]
      return { players }
    }),

  reset: () => set({ connected: false, players: {} }),
}))
