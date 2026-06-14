import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import AppTopBar from '../shared/AppTopBar'
import MascotCompanion from '../mascot/MascotCompanion'
import CurrencyBadge from '../shared/CurrencyBadge'
import { LIBRARY_BOOKS, isBookPurchasable } from '../../data/libraryRegistry'
import { CATEGORY_META, getCategoryMeta } from '../../data/categoryMeta'
import { useShopStore } from '../../stores/useShopStore'
import { useCurrencyStore } from '../../stores/useCurrencyStore'
import { formatCurrency } from '../../utils/currency'

const CATEGORY_ORDER = Object.keys(CATEGORY_META)

export default function LibraryPage() {
  const navigate = useNavigate()
  const purchased = useShopStore((s) => s.purchased)
  const buyGeneric = useShopStore((s) => s.buyGeneric)
  const coins = useCurrencyStore((s) => s.coins)

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
                Estantes organizados por categoría. Algunos libros están sellados hasta que los
                compras con tus monedas — los demás puedes leerlos directo desde el navegador.
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

                {/* Estante: lomos de libro apoyados sobre una repisa de madera */}
                <div className="relative mt-6 overflow-x-auto pb-6">
                  <div className="flex min-w-max items-end gap-3 px-2 pb-5 pt-4">
                    {books.map((book) => {
                      const purchasable = isBookPurchasable(book)
                      const owned = purchased.includes(book.id)
                      const locked = purchasable && !owned
                      const comingSoon = !book.file

                      const handleClick = () => {
                        if (comingSoon) return
                        if (locked) return
                        navigate(`/biblioteca/${book.id}`)
                      }

                      const handleBuy = (e) => {
                        e.stopPropagation()
                        buyGeneric(book.id, book.price)
                      }

                      return (
                        <button
                          key={book.id}
                          onClick={handleClick}
                          disabled={comingSoon || locked}
                          title={book.title}
                          className={`group relative flex h-56 w-24 shrink-0 flex-col items-center justify-between rounded-t-md border-x border-t pb-3 pt-3 shadow-[0_6px_0_rgba(0,0,0,0.25)] transition-transform ${
                            comingSoon
                              ? 'cursor-default border-border bg-surface opacity-50'
                              : locked
                                ? 'cursor-default border-border bg-surface'
                                : 'border-black/10 hover:-translate-y-1.5 hover:shadow-[0_10px_0_rgba(0,0,0,0.3)]'
                          }`}
                          style={!comingSoon && !locked ? { backgroundColor: book.color } : undefined}
                        >
                          <span className="text-2xl drop-shadow">{book.icon}</span>

                          <span
                            className={`flex-1 [writing-mode:vertical-rl] text-center text-xs font-bold leading-tight ${
                              comingSoon || locked ? 'text-text-muted' : 'text-background'
                            }`}
                          >
                            {book.title}
                          </span>

                          {comingSoon && (
                            <span className="rounded-full border border-border px-2 py-0.5 text-[10px] text-text-muted">
                              🔒 Próximamente
                            </span>
                          )}

                          {locked && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-t-md bg-background/85 p-2 text-center backdrop-blur-sm">
                              <span className="text-2xl">🔒</span>
                              <span className="text-[11px] font-semibold text-text">
                                {formatCurrency(book.price)}
                              </span>
                              <span
                                onClick={handleBuy}
                                role="button"
                                className={`rounded-lg px-2 py-1 text-[11px] font-semibold transition-colors ${
                                  coins >= book.price
                                    ? 'bg-primary text-background hover:bg-primary-hover'
                                    : 'cursor-not-allowed bg-surface-hover text-text-muted'
                                }`}
                              >
                                {coins >= book.price ? 'Comprar' : 'Sin monedas'}
                              </span>
                            </div>
                          )}

                          {!comingSoon && !locked && (
                            <span className="rounded-full bg-background/80 px-2 py-0.5 text-[10px] font-semibold text-text opacity-0 transition-opacity group-hover:opacity-100">
                              📖 Leer
                            </span>
                          )}
                        </button>
                      )
                    })}
                  </div>

                  {/* Repisa de madera */}
                  <div className="h-3 rounded-sm bg-gradient-to-b from-[#9a623a] to-[#6b4423] shadow-md" />
                  <div className="h-2 rounded-b-sm bg-[#4a2f18]" />
                </div>

                <div className="mt-3 flex flex-wrap gap-2 text-xs text-text-muted">
                  {books.map((book) => (
                    <span key={book.id} className="rounded-full border border-border px-2.5 py-1">
                      {book.icon} {book.title} · {book.author}
                    </span>
                  ))}
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
