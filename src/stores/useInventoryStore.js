import { create } from 'zustand'

// User-curated notes/links. This is part of the mascot's persistent
// "inventory" — it gets sent to the chat as context so the mascot can
// reference and help organize it.
export const useInventoryStore = create((set) => ({
  items: [],

  addItem: (item) =>
    set((state) => ({
      items: [
        ...state.items,
        { id: crypto.randomUUID(), createdAt: new Date().toISOString(), ...item },
      ],
    })),

  removeItem: (id) =>
    set((state) => ({ items: state.items.filter((i) => i.id !== id) })),

  updateItem: (id, changes) =>
    set((state) => ({
      items: state.items.map((i) => (i.id === id ? { ...i, ...changes } : i)),
    })),

  loadItems: (items) => set({ items: items ?? [] }),
}))
