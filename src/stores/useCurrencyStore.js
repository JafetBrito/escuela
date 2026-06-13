import { create } from 'zustand'

// "Monedas" earned by completing MISIONES, spendable in la Tienda.
// Stored as "cobre" (copper); 10000 cobre = 1 oro. New accounts start with
// 28,000 oro of seed currency.
const STARTING_COINS = 28000 * 10000

export const useCurrencyStore = create((set, get) => ({
  coins: STARTING_COINS,

  earnCoins: (amount) => set((state) => ({ coins: state.coins + amount })),

  spendCoins: (amount) => {
    if (get().coins < amount) return false
    set((state) => ({ coins: state.coins - amount }))
    return true
  },

  loadCoins: (coins) => set({ coins: coins ?? STARTING_COINS }),
}))
