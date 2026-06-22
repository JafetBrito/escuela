import { create } from 'zustand'
import { useCurrencyStore } from './useCurrencyStore'
import { useLevelStore } from './useLevelStore'

const toDateStr = (d = new Date()) => d.toISOString().slice(0, 10)

// Daily cooldown for the in-world computer terminal (Programador class).
// One claim per day total — the "hacker" tier just pays out more for the
// same daily slot, same pattern as useDailyRewardsStore.
export const useTerminalRewardsStore = create((set, get) => ({
  lastClaimDate: null,

  canClaim: () => get().lastClaimDate !== toDateStr(),

  // tier: 'basic' | 'hacker' — hacker pays out more. Returns the reward
  // granted, or null if already claimed today.
  claim: (tier = 'basic') => {
    if (get().lastClaimDate === toDateStr()) return null
    const reward = tier === 'hacker' ? { coins: 600, xp: 60 } : { coins: 250, xp: 25 }
    set({ lastClaimDate: toDateStr() })
    useCurrencyStore.getState().earnCoins(reward.coins)
    useLevelStore.getState().addXp(reward.xp)
    return reward
  },

  loadTerminalRewards: ({ lastClaimDate } = {}) => set({ lastClaimDate: lastClaimDate ?? null }),
}))
