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

  // Generic purchase for things that live outside SHOP_ITEMS but share the
  // same coins + "purchased" tracking (e.g. Biblioteca books).
  buyGeneric: (id, price) => {
    if (get().purchased.includes(id)) return false

    const ok = useCurrencyStore.getState().spendCoins(price)
    if (!ok) return false

    set((state) => ({ purchased: [...state.purchased, id] }))
    return true
  },

  loadPurchased: (purchased) => set({ purchased: purchased ?? [] }),
}))
