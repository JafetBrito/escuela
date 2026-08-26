import { useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AppTopBar from '../shared/AppTopBar'
import MascotCompanion from '../mascot/MascotCompanion'
import courses from '../../data/courses.json'
import { MAIN_CATEGORIES } from '../../data/categoryTaxonomy'
import { useI18n } from '../../i18n'

// Punto de entrada único para "escuelas" — antes Escuelas (categorías
// generales), Academia de Idiomas y Academia de Ciberseguridad vivían
// repartidas (una pestaña del Dashboard + dos links sueltos en el header).
// El alumno pidió juntarlas en una sola pestaña "Academias" y sacarlas del
// Dashboard — esta página es esa pestaña; las dos academias con lógica
// propia siguen siendo sus propias páginas (/academia-idiomas,
// /escuela/ciberseguridad), aquí solo son la puerta de entrada.
export default function AcademiasPage() {
  const { t } = useI18n()
  const navigate = useNavigate()

  const withCounts = useMemo(() => MAIN_CATEGORIES.map((m) => {
    const subcategories = m.subcategories.map((s) => ({
      ...s,
      count: courses.filter((c) => s.schoolCategories.includes(c.category ?? 'Otros')).length,
    }))
    return { ...m, subcategories, count: subcategories.reduce((n, s) => n + s.count, 0) }
  }), [])

  return (
    <div className="flex min-h-screen flex-col bg-background text-text">
      <AppTopBar />
      <main className="flex-1 px-4 py-8 md:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-8 shadow-lg">
            <h1 className="text-3xl font-extrabold text-white drop-shadow-sm">🏫 Academias</h1>
            <p className="mt-1 text-sm font-medium text-white/85">Todas las escuelas de Oliver Academy, en un solo lugar.</p>
          </div>

          {/* Academias con casa propia */}
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Link
              to="/academia-ia"
              className="flex items-center gap-3 rounded-2xl border border-border bg-gradient-to-br from-lime-600/20 to-emerald-500/10 p-5 transition hover:border-emerald-500/40"
            >
              <span className="text-4xl">🧠</span>
              <div>
                <p className="font-extrabold text-text">{t('nav.items.academiaIA')}</p>
                <p className="text-xs text-text-muted">Herramientas de IA y Prompt Engineering, por niveles</p>
              </div>
            </Link>
            <Link
              to="/academia-idiomas"
              className="flex items-center gap-3 rounded-2xl border border-border bg-gradient-to-br from-sky-600/20 to-blue-500/10 p-5 transition hover:border-sky-500/40"
            >
              <span className="text-4xl">🌍</span>
              <div>
                <p className="font-extrabold text-text">{t('nav.items.academiaIdiomas')}</p>
                <p className="text-xs text-text-muted">Aprende cualquier idioma desde el tuyo</p>
              </div>
            </Link>
            <Link
              to="/escuela/ciberseguridad"
              className="flex items-center gap-3 rounded-2xl border border-border bg-gradient-to-br from-slate-700/40 to-teal-600/10 p-5 transition hover:border-teal-500/40"
            >
              <span className="text-4xl">🔐</span>
              <div>
                <p className="font-extrabold text-text">{t('nav.items.academiaCiberseguridad')}</p>
                <p className="text-xs text-text-muted">Ethical hacking, criptografía y más</p>
              </div>
            </Link>
            <Link
              to="/academia-china"
              className="flex items-center gap-3 rounded-2xl border border-border bg-gradient-to-br from-red-600/20 to-amber-500/10 p-5 transition hover:border-red-500/40"
            >
              <span className="text-4xl">🐉</span>
              <div>
                <p className="font-extrabold text-text">{t('nav.items.academiaChina')}</p>
                <p className="text-xs text-text-muted">Mandarín, caracteres y cultura china</p>
              </div>
            </Link>
          </div>

          {/* Escuelas por categoría — antes la pestaña "Escuelas" del Dashboard */}
          <h2 className="mb-3 mt-8 text-xs font-black uppercase tracking-widest text-text-muted/60">
            {t('dashboard.schoolsTitle')}
          </h2>
          <div className="space-y-4">
            {withCounts.map((m) => (
              <div key={m.id} className="overflow-hidden rounded-2xl border border-border bg-surface">
                <button
                  type="button"
                  onClick={() => navigate(`/escuela-categoria/${m.id}`)}
                  className={`flex w-full items-center justify-between px-5 py-4 text-left bg-gradient-to-r ${m.gradient} transition hover:opacity-95`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-3xl drop-shadow-sm">{m.icon}</span>
                    <div>
                      <p className="text-base font-extrabold text-background drop-shadow-sm">{m.title}</p>
                      <p className="text-xs font-medium text-background/70">
                        {m.count} {m.count === 1 ? t('dashboard.courseSingular') : t('dashboard.coursePlural')} · {m.subcategories.length} subcategorías
                      </p>
                    </div>
                  </div>
                  <span className="text-background/70 text-lg">→</span>
                </button>
                <div className="flex flex-wrap gap-2 p-4">
                  {m.subcategories.map((s) => (
                    <Link
                      key={s.name}
                      to={`/escuela-categoria/${m.id}`}
                      className="rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-text-muted transition hover:border-primary hover:text-primary"
                    >
                      {s.name} <span className="opacity-60">· {s.count}</span>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
      <MascotCompanion />
    </div>
  )
}
