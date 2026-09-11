import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import AppTopBar from '../shared/AppTopBar'
import MascotCompanion from '../mascot/MascotCompanion'
import { useTutorialContentStore } from '../../stores/useTutorialContentStore'
import { useI18n } from '../../i18n'

// Catálogo de tutoriales — guías cortas de una sola vista (sin progreso, sin
// XP, ver migration_063.sql). Grid simple, sin barra de filtros: con pocos
// tutoriales al inicio no hace falta (a diferencia de GuiasPage, que sí
// necesitó filtro por volumen de links externos).
function TutorialCard({ tutorial }) {
  const { t } = useI18n()
  if (tutorial.locked) {
    return (
      <div className="flex cursor-default flex-col rounded-2xl border border-border bg-surface opacity-50">
        <div className="h-1.5 w-full rounded-t-2xl" style={{ background: tutorial.color || '#94a3b8' }} />
        <div className="flex flex-col gap-2 p-4">
          <div className="flex items-center justify-between gap-2">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl text-2xl"
              style={{ background: `${tutorial.color}22`, border: `1px solid ${tutorial.color}44` }}>
              {tutorial.icon || '📄'}
            </span>
            <span className="text-[10px] text-text-muted">🔒 {t('pages.tutoriales.comingSoon')}</span>
          </div>
          <p className="text-sm font-bold text-text leading-tight line-clamp-2">{tutorial.title}</p>
          <p className="mt-0.5 text-xs text-text-muted line-clamp-2">{tutorial.description}</p>
        </div>
      </div>
    )
  }
  return (
    <Link
      to={`/tutorial/${tutorial.id}`}
      className="group flex flex-col rounded-2xl border border-border bg-surface text-left transition-all hover:-translate-y-0.5 hover:border-primary hover:shadow-lg"
    >
      <div className="h-1.5 w-full rounded-t-2xl" style={{ background: tutorial.color || '#7c3aed' }} />
      <div className="flex flex-col gap-2 p-4">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl text-2xl"
          style={{ background: `${tutorial.color}22`, border: `1px solid ${tutorial.color}44` }}>
          {tutorial.icon || '📄'}
        </span>
        <div>
          <p className="text-sm font-bold text-text leading-tight line-clamp-2">{tutorial.title}</p>
          <p className="mt-0.5 text-xs text-text-muted line-clamp-2">{tutorial.description}</p>
        </div>
        {tutorial.category && (
          <span className="self-start rounded-full border border-border px-2 py-0.5 text-[10px] font-semibold text-text-muted">
            {tutorial.category}
          </span>
        )}
      </div>
    </Link>
  )
}

export default function TutorialsPage() {
  const { t } = useI18n()
  const catalog = useTutorialContentStore((s) => s.catalog)
  const loaded = useTutorialContentStore((s) => s.loaded)
  const fetchAll = useTutorialContentStore((s) => s.fetchAll)
  useEffect(() => { fetchAll() }, [fetchAll])

  return (
    <div className="flex min-h-screen flex-col bg-background text-text">
      <AppTopBar />
      <main className="flex-1 px-4 py-8 md:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="overflow-hidden rounded-2xl bg-gradient-to-r from-violet-700 via-purple-800 to-indigo-900 px-6 py-8 shadow-lg">
            <h1 className="text-3xl font-extrabold text-white">🧭 {t('pages.tutoriales.title')}</h1>
            <p className="mt-1 text-sm font-medium text-white/80">{t('pages.tutoriales.subtitle')}</p>
          </div>

          <div className="mt-6">
            {!loaded ? (
              <p className="text-sm text-text-muted">{t('pages.tutoriales.loading')}</p>
            ) : catalog.length === 0 ? (
              <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border py-16 text-center">
                <span className="text-4xl">🧭</span>
                <p className="font-bold text-text">{t('pages.tutoriales.emptyTitle')}</p>
                <p className="text-sm text-text-muted">{t('pages.tutoriales.emptyBody')}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {catalog.map((tut) => <TutorialCard key={tut.id} tutorial={tut} />)}
              </div>
            )}
          </div>
        </div>
      </main>
      <MascotCompanion />
    </div>
  )
}
