import { useMemo } from 'react'
import AppTopBar from '../shared/AppTopBar'
import MascotCompanion from '../mascot/MascotCompanion'
import CurrencyBadge from '../shared/CurrencyBadge'
import { LIBRARY_BOOKS, isBookPurchasable } from '../../data/libraryRegistry'
import { CATEGORY_META, getCategoryMeta } from '../../data/categoryMeta'
import { useShopStore } from '../../stores/useShopStore'
import { useCurrencyStore } from '../../stores/useCurrencyStore'
import { useLibraryStore } from '../../stores/useLibraryStore'
import { formatCurrency } from '../../utils/currency'

const CATEGORY_ORDER = Object.keys(CATEGORY_META)

export default function LibraryPage() {
  const purchased = useShopStore((s) => s.purchased)
  const buyGeneric = useShopStore((s) => s.buyGeneric)
  const coins = useCurrencyStore((s) => s.coins)
  const openBook = useLibraryStore((s) => s.openBook)

  const categories = useMemo(() => {
    const groups = new Map()
    for (const book of LIBRARY_BOOKS) {
      const key = book.category ?? 'Otros'
      if (!groups.has(key)) groups.set(key, [])
      groups.get(key).push(book)
    }
    return Array.from(groups.entries()).sort(
      (a, b) => CATEGORY_ORDER.indexOf(a[0]) - CATEGORY_ORDER.indexOf(b[0]),
    )
  }, [])

  return (
    <div className="flex min-h-screen flex-col bg-background text-text">
      <AppTopBar />

      <main className="flex-1 px-4 py-8 md:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold">📚 Biblioteca</h1>
              <p className="mt-1 text-sm text-text-muted">
                Libros organizados por categoría. Pasa el cursor sobre cada libro para ver su
                descripción. Algunos están sellados hasta que los compras con tus monedas — los
                demás se abren en una ventana emergente, sin salir de esta página.
              </p>
            </div>
            <CurrencyBadge amount={coins} />
          </div>

          {categories.map(([category, books]) => {
            const meta = getCategoryMeta(category)
            return (
              <section key={category} className="mt-10">
                <div
                  className={`flex items-center gap-4 rounded-2xl bg-gradient-to-r ${meta.gradient} px-5 py-4 shadow-lg`}
                >
                  <span className="text-4xl drop-shadow-sm">{meta.icon}</span>
                  <div>
                    <h2 className="text-xl font-extrabold tracking-tight text-background drop-shadow-sm">
                      {category}
                    </h2>
                    <p className="text-sm font-medium text-background/80">
                      {books.length} {books.length === 1 ? 'libro' : 'libros'}
                    </p>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                  {books.map((book) => {
                    const purchasable = isBookPurchasable(book)
                    const owned = purchased.includes(book.id)
                    const locked = purchasable && !owned
                    const comingSoon = !book.file

                    const handleClick = () => {
                      if (comingSoon || locked) return
                      openBook(book.id)
                    }

                    const handleBuy = (e) => {
                      e.stopPropagation()
                      buyGeneric(book.id, book.price)
                    }

                    return (
                      <button
                        key={book.id}
                        onClick={handleClick}
                        disabled={comingSoon}
                        title={book.title}
                        className={`group relative flex aspect-[3/4] flex-col overflow-hidden rounded-2xl border border-black/10 text-left shadow-md transition-transform ${
                          comingSoon ? 'cursor-default opacity-60' : 'hover:-translate-y-1.5 hover:shadow-xl'
                        }`}
                        style={{ background: `linear-gradient(160deg, ${book.color}, ${book.color}aa)` }}
                      >
                        <div className="flex flex-1 items-center justify-center text-5xl drop-shadow-md sm:text-6xl">
                          {book.icon}
                        </div>

                        {/* Always-visible title/author strip */}
                        <div className="relative z-10 bg-black/45 px-2.5 py-2 backdrop-blur-sm">
                          <p className="line-clamp-2 text-xs font-bold leading-tight text-white">
                            {book.title}
                          </p>
                          <p className="mt-0.5 truncate text-[10px] text-white/70">{book.author}</p>
                        </div>

                        {comingSoon && (
                          <span className="absolute right-2 top-2 z-20 rounded-full bg-background/80 px-2 py-0.5 text-[10px] font-semibold text-text-muted">
                            🔒 Próximamente
                          </span>
                        )}

                        {locked && (
                          <span className="absolute right-2 top-2 z-20 rounded-full bg-background/80 px-2 py-0.5 text-[10px] font-semibold text-text-muted">
                            🔒 {formatCurrency(book.price)}
                          </span>
                        )}

                        {!comingSoon && !locked && (
                          <span className="absolute right-2 top-2 z-20 rounded-full bg-background/80 px-2 py-1 text-[11px] font-semibold text-text opacity-0 transition-opacity group-hover:opacity-100">
                            📖 Leer
                          </span>
                        )}

                        {/* Hover overlay: description + contextual action */}
                        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-2 bg-black/80 p-3 text-center opacity-0 backdrop-blur-[1px] transition-opacity group-hover:opacity-100">
                          <p className="text-[11px] leading-snug text-white/90">{book.description}</p>

                          {locked && (
                            <span
                              onClick={handleBuy}
                              role="button"
                              className={`rounded-lg px-3 py-1 text-xs font-semibold transition-colors ${
                                coins >= book.price
                                  ? 'bg-primary text-background hover:bg-primary-hover'
                                  : 'cursor-not-allowed bg-surface-hover text-text-muted'
                              }`}
                            >
                              {coins >= book.price ? `Comprar · ${formatCurrency(book.price)}` : 'Sin monedas'}
                            </span>
                          )}

                          {!comingSoon && !locked && (
                            <span className="rounded-lg bg-primary px-3 py-1 text-xs font-semibold text-background">
                              📖 Leer
                            </span>
                          )}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </section>
            )
          })}
        </div>
      </main>

      <MascotCompanion />
    </div>
  )
}
