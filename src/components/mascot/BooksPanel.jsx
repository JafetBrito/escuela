import { useShopStore } from '../../stores/useShopStore'
import { useLibraryStore } from '../../stores/useLibraryStore'
import { LIBRARY_BOOKS, isBookPurchasable } from '../../data/libraryRegistry'

// Lets the user open any unlocked book in the global reader popup from
// wherever they are, without going through the Biblioteca page.
export default function BooksPanel() {
  const purchased = useShopStore((s) => s.purchased)
  const openBook = useLibraryStore((s) => s.openBook)

  // Only show books the user can actually open: not "coming soon" and, if
  // they have a price, already purchased.
  const availableBooks = LIBRARY_BOOKS.filter((book) => {
    if (!book.file) return false
    const purchasable = isBookPurchasable(book)
    const owned = purchased.includes(book.id)
    return !purchasable || owned
  })

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-text-muted">
        Tus libros de la Biblioteca. Ábrelos en este mismo pop-up desde cualquier parte de la
        plataforma. Los que aún no has comprado aparecen en la Biblioteca.
      </p>

      {availableBooks.length === 0 && (
        <p className="rounded-xl border border-dashed border-border p-4 text-center text-sm text-text-muted">
          Todavía no tienes libros disponibles. Visita la Biblioteca para conseguir algunos.
        </p>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        {availableBooks.map((book) => {
          return (
            <div
              key={book.id}
              className="group relative flex gap-3 overflow-hidden rounded-xl border-2 border-border bg-background p-3"
            >
              <div
                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg text-3xl"
                style={{ backgroundColor: `${book.color}22`, border: `1px solid ${book.color}` }}
              >
                {book.icon}
              </div>
              <div className="flex flex-1 flex-col gap-1 overflow-hidden">
                <p className="truncate font-bold text-text">{book.title}</p>
                <p className="truncate text-xs text-text-muted">{book.author}</p>
                <button
                  onClick={() => openBook(book.id)}
                  className="mt-1 self-start rounded-lg bg-primary px-3 py-1 text-xs font-semibold text-background transition-colors hover:bg-primary-hover"
                >
                  📖 Leer
                </button>
              </div>

              {/* Hover description, same idea as the Biblioteca cards */}
              <div className="pointer-events-none absolute inset-0 flex items-center bg-surface/95 p-3 text-xs text-text-muted opacity-0 transition-opacity group-hover:opacity-100">
                {book.description}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
