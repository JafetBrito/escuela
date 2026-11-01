import { create } from 'zustand'
import { useCurrencyStore } from './useCurrencyStore'
import { useMascotStore } from './useMascotStore'
import { getShopItemById } from '../data/shopRegistry'
import { getItem } from '../data/itemDb'
import { entryOf, normalizeList } from '../data/itemDb/idmap'

// Objetos comprados con monedas. `purchased` guarda el ENTRY numérico de cada objeto (base de datos de objetos,
// src/data/itemDb); lo que no es del catálogo (libros de la Biblioteca) conserva su id de texto. Todas las funciones
// aceptan el entry o la clave de siempre ('camara'), y las cuentas guardadas antes se convierten al cargar.
// `buyItem` devuelve false si ya lo tienes o no te alcanzan las monedas; el precio sale de la base (editable por un admin).
export const useShopStore = create((set, get) => ({
  purchased: [],

  isOwned: (ref) => get().purchased.includes(entryOf(ref)),

  buyItem: (ref) => {
    const entry = entryOf(ref)
    if (get().purchased.includes(entry)) return false
    const item = getShopItemById(ref)
    if (!item) return false

    const ok = useCurrencyStore.getState().spendCoins(getItem(entry)?.buyPrice ?? item.price)
    if (!ok) return false

    set((state) => ({ purchased: [...state.purchased, entry] }))
    if (typeof item.mascotId === 'number') {
      useMascotStore.getState().unlockMascot(item.mascotId)
    }
    return true
  },

  // Generic purchase for things that live outside SHOP_ITEMS but share the
  // same coins + "purchased" tracking (e.g. Biblioteca books).
  buyGeneric: (id, price) => {
    const entry = entryOf(id)
    if (get().purchased.includes(entry)) return false

    const ok = useCurrencyStore.getState().spendCoins(price)
    if (!ok) return false

    set((state) => ({ purchased: [...state.purchased, entry] }))
    return true
  },

  loadPurchased: (purchased) => set({ purchased: normalizeList(purchased) }),
}))
