import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import AppTopBar from '../shared/AppTopBar'
import MascotCompanion from '../mascot/MascotCompanion'
import { searchAll } from '../../data/searchIndex'

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const results = useMemo(() => searchAll(query), [query])

  return (
    <div className="flex min-h-screen flex-col bg-background text-text">
      <AppTopBar />

      <main className="flex-1 px-4 py-8 md:px-8">
        <div className="mx-auto max-w-2xl">
          <h1 className="text-2xl font-extrabold text-text">🔍 Buscar en Oliver Academy</h1>
          <p className="mt-1 text-sm text-text-muted">Cursos, clases, juegos y entradas del segundo cerebro.</p>

          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Escribe para buscar..."
            className="mt-4 w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-text outline-none focus:border-primary"
          />

          <div className="mt-4 flex flex-col gap-2">
            {query.trim() && results.length === 0 && (
              <p className="py-6 text-center text-sm text-text-muted">Sin resultados para "{query}".</p>
            )}
            {results.map((r, i) => (
              <Link
                key={`${r.href}-${i}`}
                to={r.href}
                className="flex items-start gap-3 rounded-xl border border-border bg-surface p-3 transition-colors hover:border-primary/50 hover:bg-surface-hover"
              >
                <span className="text-xl">{r.icon}</span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-text">{r.title}</p>
                  <p className="truncate text-xs text-text-muted">{r.subtitle}</p>
                </div>
                <span className="ml-auto shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary">
                  {r.type}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </main>

      <MascotCompanion />
    </div>
  )
}
