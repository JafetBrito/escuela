import { create } from 'zustand'

// "Monedas" earned by completing MISIONES, spendable in the Tienda.
export const useCurrencyStore = create((set, get) => ({
  coins: 0,

  earnCoins: (amount) => set((state) => ({ coins: state.coins + amount })),

  spendCoins: (amount) => {
    if (get().coins < amount) return false
    set((state) => ({ coins: state.coins - amount }))
    return true
  },

  loadCoins: (coins) => set({ coins: coins ?? 0 }),
}))
