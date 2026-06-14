import { create } from 'zustand'
import { useCurrencyStore } from './useCurrencyStore'

function today() {
  return new Date().toISOString().slice(0, 10)
}

// Tracks which games have already paid out their "completion reward" today,
// so a player can't spam-claim coins by reopening the same game.
export const useGamesStore = create((set, get) => ({
  claimedRewards: {},

  canClaim: (gameId) => get().claimedRewards[gameId] !== today(),

  claimReward: (gameId, amount) => {
    if (!get().canClaim(gameId)) return false
    useCurrencyStore.getState().earnCoins(amount)
    set((state) => ({
      claimedRewards: { ...state.claimedRewards, [gameId]: today() },
    }))
    return true
  },

  loadClaimedRewards: (claimedRewards) => set({ claimedRewards: claimedRewards ?? {} }),
}))
