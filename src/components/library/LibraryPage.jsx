import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import AppTopBar from '../shared/AppTopBar'
import MascotCompanion from '../mascot/MascotCompanion'
import { LIBRARY_BOOKS } from '../../data/libraryRegistry'
import { CATEGORY_META, getCategoryMeta } from '../../data/categoryMeta'

const CATEGORY_ORDER = Object.keys(CATEGORY_META)

export default function LibraryPage() {
  const navigate = useNavigate()

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
          <div>
            <h1 className="text-2xl font-bold">📚 Biblioteca</h1>
            <p className="mt-1 text-sm text-text-muted">
              Libros y guías en formato epub, organizados por las mismas categorías del
              Dashboard. Léelos directamente desde el navegador.
            </p>
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

                <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {books.map((book) => {
                    const available = !!book.file
                    return (
                      <button
                        key={book.id}
                        onClick={() => available && navigate(`/biblioteca/${book.id}`)}
                        disabled={!available}
                        className={`flex flex-col gap-3 rounded-2xl border p-5 text-left transition-all ${
                          available
                            ? 'border-border bg-surface hover:-translate-y-0.5 hover:border-primary hover:shadow-xl'
                            : 'cursor-default border-border bg-surface opacity-60'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div
                            className="flex h-14 w-14 items-center justify-center rounded-xl text-3xl"
                            style={{ backgroundColor: `${book.color}22`, border: `1px solid ${book.color}` }}
                          >
                            {book.icon}
                          </div>
                          {!available && (
                            <span className="rounded-full border border-border px-2.5 py-1 text-xs text-text-muted">
                              🔒 Próximamente
                            </span>
                          )}
                        </div>

                        <div>
                          <h3 className="text-lg font-bold text-text">{book.title}</h3>
                          <p className="text-xs text-text-muted">{book.author}</p>
                          <p className="mt-1 text-sm text-text-muted">{book.description}</p>
                        </div>

                        {available && (
                          <span
                            className="self-start rounded-lg px-4 py-2 text-sm font-semibold text-background"
                            style={{ backgroundColor: meta.accent }}
                          >
                            📖 Leer
                          </span>
                        )}
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
