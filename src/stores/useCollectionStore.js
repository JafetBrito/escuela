import { create } from 'zustand'

// Collectible "objetos" earned by completing misiones (RPG-style rewards,
// separate from the interactive Objetos in itemsRegistry). Each item is
// granted once, identified by its id.
export const useCollectionStore = create((set) => ({
  items: [],

  addItem: (item) =>
    set((state) => {
      if (!item?.id || state.items.some((i) => i.id === item.id)) return {}
      return { items: [...state.items, { ...item, earnedAt: new Date().toISOString() }] }
    }),

  loadItems: (items) => set({ items: items ?? [] }),
}))
