import { useLibraryStore } from '../../stores/useLibraryStore'
import { getBookById } from '../../data/libraryRegistry'
import BookContent from './BookContent'

// Global popup reader: lets any page open a book (via useLibraryStore.openBook)
// without navigating away. Mounted once in App.jsx.
export default function BookReaderModal() {
  const openBookId = useLibraryStore((s) => s.openBookId)
  const closeBook = useLibraryStore((s) => s.closeBook)

  if (!openBookId) return null
  const book = getBookById(openBookId)
  if (!book) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="flex h-[85vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl">
        <div className="flex items-center justify-between gap-3 border-b border-border bg-surface px-4 py-2.5">
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="text-xl">{book.icon}</span>
            <div className="overflow-hidden">
              <p className="truncate text-sm font-semibold text-text">{book.title}</p>
              <p className="truncate text-xs text-text-muted">{book.author}</p>
            </div>
          </div>
          <button
            onClick={closeBook}
            className="shrink-0 text-text-muted hover:text-text"
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>

        <BookContent book={book} className="flex-1" />
      </div>
    </div>
  )
}
