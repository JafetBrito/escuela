import { useState } from 'react'
import AppTopBar from '../shared/AppTopBar'
import MascotCompanion from '../mascot/MascotCompanion'
import { IA_CATEGORIES } from '../../data/iaToolsRegistry'

function ToolCard({ tool }) {
  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-surface transition-all hover:-translate-y-0.5 hover:shadow-lg">
      {/* Top */}
      <div className="flex items-start gap-3 p-4">
        <span className="text-3xl">{tool.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-sm font-bold text-text">{tool.name}</span>
            {tool.openSource && (
              <span className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-emerald-400">
                Open Source
              </span>
            )}
          </div>
          <p className="mt-1 text-xs leading-relaxed text-text-muted">{tool.desc}</p>
        </div>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-1 px-4 pb-3">
        {tool.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full bg-background px-2 py-0.5 text-[10px] text-text-muted"
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Action */}
      <div className="mt-auto border-t border-border px-4 py-2.5">
        <a
          href={tool.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-semibold text-primary hover:underline"
        >
          Abrir {tool.name} ↗
        </a>
      </div>
    </div>
  )
}

export default function IaToolsPage() {
  const [filter, setFilter] = useState('all') // 'all' | 'open' | cat.id

  const totalTools = IA_CATEGORIES.reduce((n, c) => n + c.tools.length, 0)
  const openCount = IA_CATEGORIES.reduce((n, c) => n + c.tools.filter((t) => t.openSource).length, 0)

  const visibleCats = IA_CATEGORIES
    .map((cat) => ({
      ...cat,
      tools:
        filter === 'open'
          ? cat.tools.filter((t) => t.openSource)
          : filter === 'all' || filter === cat.id
          ? cat.tools
          : [],
    }))
    .filter((cat) => cat.tools.length > 0)

  return (
    <div className="flex min-h-screen flex-col bg-background text-text">
      <AppTopBar />

      <main className="flex-1 px-4 py-8 md:px-8">
        <div className="mx-auto max-w-6xl">

          {/* Hero */}
          <div className="overflow-hidden rounded-2xl bg-gradient-to-r from-violet-700 via-purple-700 to-indigo-800 px-6 py-8 shadow-lg">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-3xl font-extrabold text-white drop-shadow-sm">🤖 Pokédex de IA</h1>
                <p className="mt-1 text-sm font-medium text-white/80">
                  Todas las herramientas de Inteligencia Artificial que necesitas conocer, organizadas por categoría.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white">
                    🛠️ {totalTools} herramientas
                  </span>
                  <span className="rounded-full bg-emerald-500/30 px-3 py-1 text-xs font-semibold text-emerald-200">
                    ✅ {openCount} Open Source
                  </span>
                  <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white">
                    {IA_CATEGORIES.length} categorías
                  </span>
                </div>
              </div>
              <span className="hidden text-7xl sm:block">🤖</span>
            </div>
          </div>

          {/* Filter bar */}
          <div className="mt-6 flex flex-wrap gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`rounded-full border px-4 py-1.5 text-sm font-semibold transition-colors ${
                filter === 'all'
                  ? 'border-primary bg-primary text-background'
                  : 'border-border text-text-muted hover:border-text-muted hover:text-text'
              }`}
            >
              Todas
            </button>
            <button
              onClick={() => setFilter('open')}
              className={`rounded-full border px-4 py-1.5 text-sm font-semibold transition-colors ${
                filter === 'open'
                  ? 'border-emerald-400 bg-emerald-500/20 text-emerald-300'
                  : 'border-border text-text-muted hover:border-emerald-500/50 hover:text-text'
              }`}
            >
              ✅ Solo Open Source
            </button>
            {IA_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setFilter(filter === cat.id ? 'all' : cat.id)}
                className={`rounded-full border px-4 py-1.5 text-sm font-semibold transition-colors ${
                  filter === cat.id
                    ? 'border-primary bg-primary/20 text-primary'
                    : 'border-border text-text-muted hover:border-primary/40 hover:text-text'
                }`}
              >
                {cat.icon} {cat.title}
              </button>
            ))}
          </div>

          {/* Categories */}
          <div className="mt-6 space-y-8">
            {visibleCats.map((cat) => (
              <section key={cat.id}>
                {/* Category header */}
                <div className={`mb-4 flex items-center gap-3 rounded-xl bg-gradient-to-r ${cat.color} px-4 py-3`}>
                  <span className="text-2xl">{cat.icon}</span>
                  <div>
                    <p className="font-bold text-white">{cat.title}</p>
                    <p className="text-xs text-white/70">{cat.desc}</p>
                  </div>
                </div>
                {/* Tools grid — open source first */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {[...cat.tools]
                    .sort((a, b) => (b.openSource ? 1 : 0) - (a.openSource ? 1 : 0))
                    .map((tool) => (
                      <ToolCard key={tool.name} tool={tool} />
                    ))}
                </div>
              </section>
            ))}
          </div>

        </div>
      </main>

      <MascotCompanion />
    </div>
  )
}
