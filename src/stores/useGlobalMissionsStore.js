import { create } from 'zustand'
import { useCurrencyStore } from './useCurrencyStore'
import { useLevelStore } from './useLevelStore'
import { getGlobalMissionById } from '../data/globalMissionsRegistry'
import { getCourseMissionById } from '../data/courseMissionsRegistry'

function lookupMission(id) {
  return getGlobalMissionById(id) ?? getCourseMissionById(id)
}

export const useGlobalMissionsStore = create((set, get) => ({
  accepted: [],
  claimed: [],

  acceptMission: (id) =>
    set((state) =>
      state.accepted.includes(id) ? {} : { accepted: [...state.accepted, id] },
    ),

  claimReward: (id) => {
    if (get().claimed.includes(id)) return
    const mission = lookupMission(id)
    if (!mission) return

    if (mission.reward) useCurrencyStore.getState().earnCoins(mission.reward)
    if (mission.xpReward) useLevelStore.getState().addXp(mission.xpReward)

    set((state) => ({ claimed: [...state.claimed, id] }))
  },

  loadGlobalMissions: ({ accepted, claimed } = {}) =>
    set({ accepted: accepted ?? [], claimed: claimed ?? [] }),
}))
