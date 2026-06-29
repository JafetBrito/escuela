import { create } from 'zustand'
import { useCurrencyStore } from './useCurrencyStore'
import { useLevelStore } from './useLevelStore'
import { getQuestById } from '../data/questsRegistry'

// Tracks progress through the chained quests in questsRegistry.js — separate
// from useGlobalMissionsStore (flat, single-condition missions) since a quest
// has an ordered sequence of NPC steps instead of one boolean check.
export const useQuestsStore = create((set, get) => ({
  active: {},     // { [questId]: stepIndex }
  completed: [],  // questIds whose last step was reached
  claimed: [],    // questIds whose final reward was claimed

  acceptQuest: (id) =>
    set((s) => (s.active[id] != null ? {} : { active: { ...s.active, [id]: 0 } })),

  advanceStep: (id) =>
    set((s) => {
      const quest = getQuestById(id)
      if (!quest || s.active[id] == null) return {}
      const next = s.active[id] + 1
      if (next >= quest.steps.length) {
        const { [id]: _removed, ...rest } = s.active
        return {
          active: rest,
          completed: s.completed.includes(id) ? s.completed : [...s.completed, id],
        }
      }
      return { active: { ...s.active, [id]: next } }
    }),

  claimReward: (id) => {
    if (get().claimed.includes(id) || !get().completed.includes(id)) return
    const quest = getQuestById(id)
    if (!quest) return
    if (quest.reward?.coins) useCurrencyStore.getState().earnCoins(quest.reward.coins)
    if (quest.reward?.xp) useLevelStore.getState().addXp(quest.reward.xp)
    set((s) => ({ claimed: [...s.claimed, id] }))
  },

  loadQuests: (data) =>
    set({
      active: data?.active ?? {},
      completed: data?.completed ?? [],
      claimed: data?.claimed ?? [],
    }),
}))
