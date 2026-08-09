import { create } from 'zustand'

// Admin-summoned NPCs for el Mapa de Pruebas (GmConsole's /npcadd) — parallel
// to useMobStore's spawnAt, but for real story NPCs (IdleNpc) instead of
// combat mobs. Client-only, resets on reload, same tradeoff useMobStore
// already made: no need to sync who's testing what.
let nextId = 0

export const useSpawnedNpcStore = create((set) => ({
  npcs: [],

  // Keeps npcConfig.id AS-IS (mission/quest lookups and IDLE_NPC_IDS in
  // VRPage.jsx key off the real registry id) — `_spawnId` is only for the
  // React list key, so summoning the same NPC twice doesn't collide.
  spawnAt: (npcConfig, position) => {
    const spawnId = `spawned-npc-${nextId++}`
    set((s) => ({ npcs: [...s.npcs, { ...npcConfig, position, _spawnId: spawnId }] }))
    return spawnId
  },

  clear: () => set({ npcs: [] }),
}))
