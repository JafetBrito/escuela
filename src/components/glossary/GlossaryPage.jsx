import { useParams, Link } from 'react-router-dom'
import AppTopBar from '../shared/AppTopBar'
import MascotCompanion from '../mascot/MascotCompanion'
import TextLesson from '../learning/TextLesson'
import { GLOSSARY, getGlossaryEntry } from '../../data/glossaryRegistry'

// El "segundo cerebro" de Oliver Academy: una wiki compartida por todos los
// cursos. /cerebro lista todo, /cerebro/:slug muestra una entrada. Los
// enlaces de curso apuntan aquí con target="_blank" (ver glossaryRegistry.js)
// así el estudiante nunca pierde su progreso de clase al consultar un término.
export default function GlossaryPage() {
  const { slug } = useParams()
  const entry = slug ? getGlossaryEntry(slug) : null

  return (
    <div className="flex min-h-screen flex-col bg-background text-text">
      <AppTopBar />

      <main className="flex-1 px-4 py-8 md:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="overflow-hidden rounded-2xl bg-gradient-to-r from-fuchsia-600 to-indigo-600 px-6 py-8 shadow-lg">
            <h1 className="text-3xl font-extrabold text-white drop-shadow-sm">🧠 Segundo Cerebro</h1>
            <p className="mt-1 text-sm font-medium text-white/85">
              Personajes, lugares y conceptos que aparecen en los cursos, explicados aparte para no saturar la clase.
            </p>
          </div>

          {slug && !entry && (
            <div className="mt-6 rounded-xl border border-border bg-surface p-6 text-center text-text-muted">
              No encontramos "{slug}" en el segundo cerebro todavía.
              <div className="mt-3">
                <Link to="/cerebro" className="text-primary hover:underline">← Ver todas las entradas</Link>
              </div>
            </div>
          )}

          {entry && (
            <div className="mt-6">
              <Link to="/cerebro" className="mb-4 inline-block text-sm text-text-muted hover:text-primary">
                ← Todas las entradas
              </Link>
              <div className="mb-4 flex items-center gap-3">
                <span className="text-3xl">{entry.icon}</span>
                <div>
                  <h2 className="text-xl font-bold text-text">{entry.term}</h2>
                  <span className="text-xs font-semibold uppercase tracking-wide text-text-muted">{entry.category}</span>
                </div>
              </div>
              <TextLesson content={entry.content} />
            </div>
          )}

          {!slug && (
            <div className="mt-6 flex flex-col gap-6">
              {Object.entries(
                GLOSSARY.reduce((byCategory, g) => {
                  (byCategory[g.category] ??= []).push(g)
                  return byCategory
                }, {})
              ).map(([category, entries]) => (
                <div key={category}>
                  <h2 className="mb-2 text-xs font-bold uppercase tracking-widest text-text-muted">{category}</h2>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {entries.map((g) => (
                      <Link
                        key={g.slug}
                        to={`/cerebro/${g.slug}`}
                        className="flex items-start gap-3 rounded-xl border border-border bg-surface p-4 transition-colors hover:border-primary/50 hover:bg-surface-hover"
                      >
                        <span className="text-2xl">{g.icon}</span>
                        <div>
                          <p className="font-semibold text-text">{g.term}</p>
                          <p className="mt-0.5 text-xs text-text-muted">{g.summary}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <MascotCompanion />
    </div>
  )
}
