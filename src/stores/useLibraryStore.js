import { create } from 'zustand'

// Remembers the last reading position (epub.js CFI) per book, so reopening a
// book from the Biblioteca continues where the user left off.
export const useLibraryStore = create((set) => ({
  lastLocations: {},

  setLastLocation: (bookId, cfi) =>
    set((state) => ({ lastLocations: { ...state.lastLocations, [bookId]: cfi } })),

  loadLastLocations: (lastLocations) => set({ lastLocations: lastLocations ?? {} }),
}))
