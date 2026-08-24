import { create } from 'zustand'
import { getShopItemById } from '../data/shopRegistry'

// Bolsas por dueño para objetos de Tienda ('player' = Avatar, 'oliver' =
// Mascota — mismas claves que useEquipmentStore/useGameStore). Decide SOLO
// dónde vive cada objeto; useShopStore.purchased sigue siendo el historial
// de "alguna vez lo tuviste" sin cambios (ver plan VR bag system).
export const MAX_BAG_SLOTS = 30

export const useBagStore = create((set, get) => ({
  bags: { player: [], oliver: [] },
  migrated: false,

  spaceLeft: (owner) => MAX_BAG_SLOTS - (get().bags[owner]?.length ?? 0),
  hasItem: (owner, itemId) => (get().bags[owner] ?? []).includes(itemId),

  addItem: (owner, itemId) => {
    const bag = get().bags[owner] ?? []
    if (bag.includes(itemId)) return true
    if (bag.length >= MAX_BAG_SLOTS) return false
    set((s) => ({ bags: { ...s.bags, [owner]: [...bag, itemId] } }))
    return true
  },

  removeItem: (owner, itemId) =>
    set((s) => ({ bags: { ...s.bags, [owner]: (s.bags[owner] ?? []).filter((id) => id !== itemId) } })),

  loadBags: (bags, migrated) =>
    set({ bags: { player: bags?.player ?? [], oliver: bags?.oliver ?? [] }, migrated: migrated ?? false }),

  // Backfill de una sola vez: objetos comprados bajo el sistema viejo (sin
  // bolsa) se colocan en la bolsa del Avatar. Gateado por `migrated`, no por
  // "bolsa vacía", para que no se repita si un GM vacía la bolsa después.
  runMigrationIfNeeded: (purchasedItems) => {
    const { migrated, bags } = get()
    if (migrated) return
    const already = new Set([...(bags.player ?? []), ...(bags.oliver ?? [])])
    const toMigrate = (purchasedItems ?? [])
      .filter((id) => getShopItemById(id) && !already.has(id))
      .slice(0, MAX_BAG_SLOTS - (bags.player?.length ?? 0))
    set((s) => ({ bags: { ...s.bags, player: [...(s.bags.player ?? []), ...toMigrate] }, migrated: true }))
  },
}))
