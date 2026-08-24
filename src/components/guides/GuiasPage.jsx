import { useState } from 'react'
import AppTopBar from '../shared/AppTopBar'
import MascotCompanion from '../mascot/MascotCompanion'
import { GUIAS } from '../../data/guiasRegistry'

// Modal que muestra el recurso externo SIN salir de la plataforma (la URL/
// ruta del navegador nunca cambia). Si el sitio permite ser embebido
// (`link.embeddable`, verificado con curl -I contra X-Frame-Options/CSP
// frame-ancestors — ver guiasRegistry.js) se muestra en un <iframe>; si no,
// la mayoría de sitios de documentación oficiales lo bloquean por su propia
// política de seguridad, así que se ofrece igual el botón de pestaña nueva
// en vez de un iframe en blanco.
function GuideViewerModal({ link, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      <div className="flex items-center justify-between gap-3 border-b border-border bg-surface px-4 py-2.5">
        <button
          onClick={onClose}
          className="flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-text-muted transition-colors hover:text-text"
        >
          ← Volver a Guías
        </button>
        <p className="truncate text-sm font-semibold text-text">{link.icon} {link.title}</p>
        <a
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold text-primary hover:underline"
        >
          Abrir en pestaña nueva ↗
        </a>
      </div>

      {link.embeddable ? (
        <iframe src={link.url} title={link.title} className="flex-1 border-0 bg-white" />
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
          <span className="text-4xl">🔒</span>
          <p className="font-bold text-text">Este sitio no permite mostrarse dentro de la plataforma</p>
          <p className="max-w-md text-sm text-text-muted">
            {link.title} bloquea que otras páginas lo muestren embebido (es una política de seguridad del propio sitio, no algo que podamos cambiar). Ábrelo en una pestaña nueva.
          </p>
          <a
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-background hover:bg-primary-hover"
          >
            Abrir {link.title} ↗
          </a>
        </div>
      )}
    </div>
  )
}

export default function GuiasPage() {
  const [active, setActive] = useState(null) // null = show all
  const [viewing, setViewing] = useState(null) // link actualmente abierto en el modal

  const visible = active ? GUIAS.filter((g) => g.id === active) : GUIAS

  return (
    <div className="flex min-h-screen flex-col bg-background text-text">
      <AppTopBar />

      <main className="flex-1 px-4 py-8 md:px-8">
        <div className="mx-auto max-w-6xl">

          {/* Hero */}
          <div className="overflow-hidden rounded-2xl bg-gradient-to-r from-slate-700 via-gray-800 to-slate-900 px-6 py-8 shadow-lg">
            <h1 className="text-3xl font-extrabold text-white drop-shadow-sm">📖 Guías</h1>
            <p className="mt-1 text-sm font-medium text-white/80">
              Documentación oficial y recursos de referencia organizados por tecnología. Tu Zeal/DevDocs personal.
            </p>
            <p className="mt-1 text-xs text-white/50">{GUIAS.length} categorías · {GUIAS.reduce((n, g) => n + g.links.length, 0)} recursos</p>
          </div>

          <div className="mt-6 flex flex-col gap-6 lg:flex-row">

            {/* Sidebar — category filter */}
            <aside className="flex shrink-0 flex-wrap gap-2 lg:w-52 lg:flex-col lg:gap-1.5">
              <button
                onClick={() => setActive(null)}
                className={`rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors ${
                  !active ? 'bg-primary text-background' : 'text-text-muted hover:bg-surface hover:text-text'
                }`}
              >
                Todas las categorías
              </button>
              {GUIAS.map((g) => (
                <button
                  key={g.id}
                  onClick={() => setActive(g.id === active ? null : g.id)}
                  className={`rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors ${
                    active === g.id ? 'bg-primary text-background' : 'text-text-muted hover:bg-surface hover:text-text'
                  }`}
                >
                  {g.icon} {g.title}
                </button>
              ))}
            </aside>

            {/* Grid */}
            <div className="flex-1 space-y-4">
              {visible.map((cat) => (
                <div key={cat.id} className="overflow-hidden rounded-2xl border border-border bg-surface">
                  {/* Category header */}
                  <div className={`flex items-center gap-3 bg-gradient-to-r ${cat.color} px-5 py-3`}>
                    <span className="text-2xl">{cat.icon}</span>
                    <span className="font-bold text-white">{cat.title}</span>
                  </div>

                  {/* Links */}
                  <div className="grid gap-px bg-border sm:grid-cols-2">
                    {cat.links.map((link) => (
                      <button
                        key={link.url}
                        type="button"
                        onClick={() => setViewing(link)}
                        className="group flex items-start gap-3 bg-surface p-4 text-left transition-colors hover:bg-background"
                      >
                        <span className="mt-0.5 text-2xl">{link.icon}</span>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-text group-hover:text-primary">
                            {link.title}
                          </p>
                          <p className="mt-0.5 text-xs leading-relaxed text-text-muted">{link.desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </main>

      {viewing && <GuideViewerModal link={viewing} onClose={() => setViewing(null)} />}

      <MascotCompanion />
    </div>
  )
}
