import { create } from 'zustand'
import { useCurrencyStore } from './useCurrencyStore'
import { getShopItemById } from '../data/shopRegistry'

// Cosmetic items purchased with coins. `buyItem` returns false if the item
// is already owned or the user doesn't have enough coins.
export const useShopStore = create((set, get) => ({
  purchased: [],

  isOwned: (itemId) => get().purchased.includes(itemId),

  buyItem: (itemId) => {
    if (get().purchased.includes(itemId)) return false
    const item = getShopItemById(itemId)
    if (!item) return false

    const ok = useCurrencyStore.getState().spendCoins(item.price)
    if (!ok) return false

    set((state) => ({ purchased: [...state.purchased, itemId] }))
    return true
  },

  loadPurchased: (purchased) => set({ purchased: purchased ?? [] }),
}))
