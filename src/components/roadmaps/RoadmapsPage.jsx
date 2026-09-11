import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import AppTopBar from '../shared/AppTopBar'
import MascotCompanion from '../mascot/MascotCompanion'
import { useRoadmapContentStore } from '../../stores/useRoadmapContentStore'
import { useI18n } from '../../i18n'

// Catálogo de road maps — calco de TutorialsPage.jsx (grid de tarjetas,
// sin filtros en v1, ver migration_064.sql).
function RoadmapCard({ roadmap }) {
  const { t } = useI18n()
  if (roadmap.locked) {
    return (
      <div className="flex cursor-default flex-col rounded-2xl border border-border bg-surface opacity-50">
        <div className="h-1.5 w-full rounded-t-2xl" style={{ background: roadmap.color || '#94a3b8' }} />
        <div className="flex flex-col gap-2 p-4">
          <div className="flex items-center justify-between gap-2">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl text-2xl"
              style={{ background: `${roadmap.color}22`, border: `1px solid ${roadmap.color}44` }}>
              {roadmap.icon || '🗺️'}
            </span>
            <span className="text-[10px] text-text-muted">🔒 {t('pages.roadmaps.comingSoon')}</span>
          </div>
          <p className="text-sm font-bold text-text leading-tight line-clamp-2">{roadmap.title}</p>
          <p className="mt-0.5 text-xs text-text-muted line-clamp-2">{roadmap.description}</p>
        </div>
      </div>
    )
  }
  return (
    <Link
      to={`/roadmap/${roadmap.id}`}
      className="group flex flex-col rounded-2xl border border-border bg-surface text-left transition-all hover:-translate-y-0.5 hover:border-primary hover:shadow-lg"
    >
      <div className="h-1.5 w-full rounded-t-2xl" style={{ background: roadmap.color || '#7c3aed' }} />
      <div className="flex flex-col gap-2 p-4">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl text-2xl"
          style={{ background: `${roadmap.color}22`, border: `1px solid ${roadmap.color}44` }}>
          {roadmap.icon || '🗺️'}
        </span>
        <div>
          <p className="text-sm font-bold text-text leading-tight line-clamp-2">{roadmap.title}</p>
          <p className="mt-0.5 text-xs text-text-muted line-clamp-2">{roadmap.description}</p>
        </div>
        <span className="self-start rounded-full border border-border px-2 py-0.5 text-[10px] font-semibold text-text-muted">
          {(roadmap.nodes ?? []).length} {t('pages.roadmaps.stepsLabel')}
        </span>
      </div>
    </Link>
  )
}

export default function RoadmapsPage() {
  const { t } = useI18n()
  const catalog = useRoadmapContentStore((s) => s.catalog)
  const loaded = useRoadmapContentStore((s) => s.loaded)
  const fetchAll = useRoadmapContentStore((s) => s.fetchAll)
  useEffect(() => { fetchAll() }, [fetchAll])

  return (
    <div className="flex min-h-screen flex-col bg-background text-text">
      <AppTopBar />
      <main className="flex-1 px-4 py-8 md:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="overflow-hidden rounded-2xl bg-gradient-to-r from-sky-700 via-blue-800 to-indigo-900 px-6 py-8 shadow-lg">
            <h1 className="text-3xl font-extrabold text-white">🗺️ {t('pages.roadmaps.title')}</h1>
            <p className="mt-1 text-sm font-medium text-white/80">{t('pages.roadmaps.subtitle')}</p>
          </div>

          <div className="mt-6">
            {!loaded ? (
              <p className="text-sm text-text-muted">{t('pages.roadmaps.loading')}</p>
            ) : catalog.length === 0 ? (
              <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border py-16 text-center">
                <span className="text-4xl">🗺️</span>
                <p className="font-bold text-text">{t('pages.roadmaps.emptyTitle')}</p>
                <p className="text-sm text-text-muted">{t('pages.roadmaps.emptyBody')}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {catalog.map((r) => <RoadmapCard key={r.id} roadmap={r} />)}
              </div>
            )}
          </div>
        </div>
      </main>
      <MascotCompanion />
    </div>
  )
}
