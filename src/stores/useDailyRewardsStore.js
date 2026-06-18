import { create } from 'zustand'
import { getTodayReward } from '../data/dailyRewardsRegistry'
import { useCurrencyStore } from './useCurrencyStore'
import { useLevelStore } from './useLevelStore'

const toDateStr = (d = new Date()) => d.toISOString().slice(0, 10)

const yesterdayStr = () => {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return toDateStr(d)
}

export const useDailyRewardsStore = create((set, get) => ({
  lastClaimDate: null, // 'YYYY-MM-DD' or null
  streak: 0,

  canClaim: () => get().lastClaimDate !== toDateStr(),

  // Returns the reward object that was claimed, or null if already claimed today
  claim: () => {
    const state = get()
    const today = toDateStr()
    if (state.lastClaimDate === today) return null

    const isConsecutive = state.lastClaimDate === yesterdayStr()
    const newStreak = isConsecutive ? state.streak + 1 : 1
    const reward = getTodayReward(newStreak)

    set({ lastClaimDate: today, streak: newStreak })

    useCurrencyStore.getState().earnCoins(reward.coins)
    useLevelStore.getState().addXp(reward.xp)

    return { ...reward, streak: newStreak }
  },

  // Called by progressSnapshot.applyProgressSnapshot
  loadDailyRewards: ({ lastClaimDate, streak } = {}) => {
    set({
      lastClaimDate: lastClaimDate ?? null,
      streak: streak ?? 0,
    })
  },
}))
