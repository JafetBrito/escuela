import { create } from 'zustand'
import { getShopItemById } from '../data/shopRegistry'
import { entryOf, normalizeList } from '../data/itemDb/idmap'

// Bolsas por dueño para objetos de Tienda ('player' = Avatar, 'oliver' =
// Mascota — mismas claves que useEquipmentStore/useGameStore). Decide SOLO
// dónde vive cada objeto; useShopStore.purchased sigue siendo el historial
// de "alguna vez lo tuviste" sin cambios (ver plan VR bag system).
export const MAX_BAG_SLOTS = 30

export const useBagStore = create((set, get) => ({
  bags: { player: [], oliver: [] },
  migrated: false,

  spaceLeft: (owner) => MAX_BAG_SLOTS - (get().bags[owner]?.length ?? 0),
  hasItem: (owner, ref) => (get().bags[owner] ?? []).includes(entryOf(ref)),

  // Las bolsas guardan el ENTRY numérico del objeto; aceptan también la clave de siempre.
  addItem: (owner, ref) => {
    const itemId = entryOf(ref), bag = get().bags[owner] ?? []
    if (bag.includes(itemId)) return true
    if (bag.length >= MAX_BAG_SLOTS) return false
    set((s) => ({ bags: { ...s.bags, [owner]: [...bag, itemId] } }))
    return true
  },

  removeItem: (owner, ref) =>
    set((s) => ({ bags: { ...s.bags, [owner]: (s.bags[owner] ?? []).filter((id) => id !== entryOf(ref)) } })),

  loadBags: (bags, migrated) =>
    set({ bags: { player: normalizeList(bags?.player), oliver: normalizeList(bags?.oliver) }, migrated: migrated ?? false }),

  // Backfill de una sola vez: objetos comprados bajo el sistema viejo (sin
  // bolsa) se colocan en la bolsa del Avatar. Gateado por `migrated`, no por
  // "bolsa vacía", para que no se repita si un GM vacía la bolsa después.
  runMigrationIfNeeded: (purchasedItems) => {
    const { migrated, bags } = get()
    if (migrated) return
    const already = new Set([...(bags.player ?? []), ...(bags.oliver ?? [])].map(entryOf))
    const toMigrate = (purchasedItems ?? [])
      .filter((id) => getShopItemById(id) && !already.has(entryOf(id)))
      .map(entryOf)
      .slice(0, MAX_BAG_SLOTS - (bags.player?.length ?? 0))
    set((s) => ({ bags: { ...s.bags, player: [...(s.bags.player ?? []), ...toMigrate] }, migrated: true }))
  },
}))
