import { create } from 'zustand'

// Remembers the last reading position (epub.js CFI) per book, so reopening a
// book from the Biblioteca continues where the user left off.
export const useLibraryStore = create((set, get) => ({
  lastLocations: {},

  // Currently open book in the global reader popup (BookReaderModal), or
  // null if closed. Letting any page open this via the store means books
  // can be read from the Biblioteca, the mascot's "Libros" panel, etc.
  openBookId: null,

  // Ids of books the user has opened at least once, used by the
  // "Ratón de biblioteca" global mission.
  openedBooks: [],

  setLastLocation: (bookId, cfi) =>
    set((state) => ({ lastLocations: { ...state.lastLocations, [bookId]: cfi } })),

  loadLastLocations: (lastLocations) => set({ lastLocations: lastLocations ?? {} }),

  openBook: (bookId) =>
    set((state) => ({
      openBookId: bookId,
      openedBooks: state.openedBooks.includes(bookId)
        ? state.openedBooks
        : [...state.openedBooks, bookId],
    })),
  closeBook: () => set({ openBookId: null }),

  loadOpenedBooks: (openedBooks) => set({ openedBooks: openedBooks ?? [] }),
}))
