import { create } from 'zustand'
import { useCurrencyStore } from './useCurrencyStore'
import { useLevelStore } from './useLevelStore'
import { getGlobalMissionById } from '../data/globalMissionsRegistry'

// Tracks which "misiones generales" (catálogo fijo, ver
// globalMissionsRegistry.js) the player has accepted from the NPC in
// /misiones, and which rewards have already been claimed.
export const useGlobalMissionsStore = create((set, get) => ({
  accepted: [],
  claimed: [],

  acceptMission: (id) =>
    set((state) =>
      state.accepted.includes(id) ? {} : { accepted: [...state.accepted, id] },
    ),

  claimReward: (id) => {
    if (get().claimed.includes(id)) return
    const mission = getGlobalMissionById(id)
    if (!mission) return

    if (mission.reward) useCurrencyStore.getState().earnCoins(mission.reward)
    if (mission.xpReward) useLevelStore.getState().addXp(mission.xpReward)

    set((state) => ({ claimed: [...state.claimed, id] }))
  },

  loadGlobalMissions: ({ accepted, claimed } = {}) =>
    set({ accepted: accepted ?? [], claimed: claimed ?? [] }),
}))
