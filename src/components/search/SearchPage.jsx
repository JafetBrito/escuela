import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import AppTopBar from '../shared/AppTopBar'
import MascotCompanion from '../mascot/MascotCompanion'
import { searchAll, SEARCH_TYPES } from '../../data/searchIndex'
import { useMascotCompanionStore } from '../../stores/useMascotCompanionStore'

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [activeTypes, setActiveTypes] = useState([])
  const setChatPrefill = useMascotCompanionStore((s) => s.setChatPrefill)
  const setPanel = useMascotCompanionStore((s) => s.setPanel)
  const setOpen = useMascotCompanionStore((s) => s.setOpen)

  const results = useMemo(
    () => searchAll(query, { types: activeTypes.length ? activeTypes : null }),
    [query, activeTypes]
  )

  const toggleType = (type) => {
    setActiveTypes((prev) => (prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]))
  }

  const askMascot = () => {
    // autoSend=true: el usuario ya escribió y buscó, no tiene sentido
    // hacerlo escribir la misma pregunta otra vez en el chat.
    setChatPrefill(query, true)
    setPanel('mascota-chat')
    setOpen(true)
  }

  const noResults = query.trim() && results.length === 0

  return (
    <div className="flex min-h-screen flex-col bg-background text-text">
      <AppTopBar />

      <main className="flex-1 px-4 py-8 md:px-8">
        <div className="mx-auto max-w-2xl">
          <h1 className="text-2xl font-extrabold text-text">🔍 Buscar en Oliver Academy</h1>
          <p className="mt-1 text-sm text-text-muted">Cursos, clases, juegos, biblioteca, blog, misiones y el segundo cerebro.</p>

          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Escribe para buscar..."
            className="mt-4 w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-text outline-none focus:border-primary"
          />

          {/* Filtros por tipo — chips multi-selección, sin filtro = todo */}
          <div className="mt-3 flex flex-wrap gap-2">
            {SEARCH_TYPES.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => toggleType(type)}
                className={`rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${
                  activeTypes.includes(type)
                    ? 'border-primary bg-primary/15 text-primary'
                    : 'border-border text-text-muted hover:text-text'
                }`}
              >
                {type}
              </button>
            ))}
            {activeTypes.length > 0 && (
              <button
                type="button"
                onClick={() => setActiveTypes([])}
                className="rounded-full px-3 py-1 text-xs font-semibold text-text-muted underline hover:text-text"
              >
                Quitar filtros
              </button>
            )}
          </div>

          <div className="mt-4 flex flex-col gap-2">
            {noResults && (
              <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border py-8 text-center">
                <p className="text-sm text-text-muted">Sin resultados para "{query}".</p>
                <button
                  type="button"
                  onClick={askMascot}
                  className="rounded-xl bg-primary px-4 py-2 text-sm font-bold text-background hover:opacity-90"
                >
                  🐾 Preguntarle a tu mascota
                </button>
              </div>
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
