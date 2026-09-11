import { useEffect } from 'react'
import { useParams, Navigate, Link } from 'react-router-dom'
import AppTopBar from '../shared/AppTopBar'
import MascotCompanion from '../mascot/MascotCompanion'
import { useRoadmapContentStore } from '../../stores/useRoadmapContentStore'
import { useRoadmapProgressStore } from '../../stores/useRoadmapProgressStore'
import { useI18n } from '../../i18n'

const LINK_LABEL_KEY = { course: 'linkCourse', tutorial: 'linkTutorial', external: 'linkExternal' }

function linkHref(node) {
  if (node.linkType === 'course') return `/learn/${node.linkId}`
  if (node.linkType === 'tutorial') return `/tutorial/${node.linkId}`
  if (node.linkType === 'external') return node.linkUrl
  return null
}

// Nodo del camino — calco visual de ModuleNode en CourseRoadmapPage.jsx
// (círculo numerado/✓, zigzag izquierda/derecha, sin estado "locked": un
// road map no tiene orden estricto, cualquier nodo se marca/desmarca
// libremente — ver migration_064.sql).
function RoadmapNode({ node, index, done, accent, onToggle }) {
  const { t } = useI18n()
  const align = index % 2 === 0 ? 'sm:self-start sm:ml-0' : 'sm:self-end sm:mr-0'
  const href = linkHref(node)

  return (
    <div className={`relative flex w-full sm:w-[calc(50%+28px)] ${align}`}>
      <div className="flex w-full items-center gap-4 rounded-2xl border border-border bg-surface p-4 text-left transition-all hover:-translate-y-0.5 hover:border-primary hover:shadow-lg">
        <button
          type="button"
          onClick={() => onToggle(node.id)}
          aria-label={done ? t('pages.roadmaps.markNotDone') : t('pages.roadmaps.markDone')}
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-xl font-black shadow-md ring-2 transition-all"
          style={{
            background: done ? `linear-gradient(135deg, ${accent}, ${accent}99)` : 'var(--color-surface-hover)',
            color: done ? '#fff' : 'var(--color-text-muted)',
            borderColor: accent,
          }}
        >
          {done ? '✓' : index + 1}
        </button>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-text">{node.title}</p>
          {node.description && <p className="line-clamp-2 text-xs text-text-muted">{node.description}</p>}
          {href && (
            node.linkType === 'external' ? (
              <a href={href} target="_blank" rel="noopener noreferrer"
                className="mt-1 inline-block text-xs font-bold hover:underline" style={{ color: accent }}>
                {t(`pages.roadmaps.${LINK_LABEL_KEY[node.linkType]}`)}
              </a>
            ) : (
              <Link to={href} className="mt-1 inline-block text-xs font-bold hover:underline" style={{ color: accent }}>
                {t(`pages.roadmaps.${LINK_LABEL_KEY[node.linkType]}`)}
              </Link>
            )
          )}
        </div>
      </div>
    </div>
  )
}

export default function RoadmapViewerPage() {
  const { id } = useParams()
  const { t } = useI18n()
  const loaded = useRoadmapContentStore((s) => s.loaded)
  const roadmap = useRoadmapContentStore((s) => s.roadmaps[id])
  const fetchAll = useRoadmapContentStore((s) => s.fetchAll)
  const doneIds = useRoadmapProgressStore((s) => s.done[id] ?? [])
  const toggleNodeDone = useRoadmapProgressStore((s) => s.toggleNodeDone)
  useEffect(() => { fetchAll() }, [fetchAll])

  if (!loaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-text-muted">
        {t('pages.roadmaps.loading')}
      </div>
    )
  }

  if (!roadmap || roadmap.locked) {
    return <Navigate to="/roadmaps" replace />
  }

  const accent = roadmap.color || '#7c3aed'
  const nodes = roadmap.nodes ?? []
  const doneCount = nodes.filter((n) => doneIds.includes(n.id)).length
  const pct = nodes.length > 0 ? Math.round((doneCount / nodes.length) * 100) : 0

  return (
    <div className="flex min-h-screen flex-col bg-background text-text">
      <AppTopBar variant="course" backTo="/roadmaps" backLabel={t('pages.roadmaps.backLabel')} />

      <div
        className="relative overflow-hidden border-b border-border px-4 py-10 sm:px-8 sm:py-14"
        style={{ background: `linear-gradient(160deg, ${accent}22 0%, transparent 60%)` }}
      >
        <div className="relative mx-auto flex max-w-3xl flex-col items-center gap-4 text-center">
          <span className="flex h-20 w-20 items-center justify-center rounded-2xl text-4xl shadow-lg"
            style={{ background: `${accent}22`, border: `1px solid ${accent}44` }}>
            {roadmap.icon || '🗺️'}
          </span>
          <div>
            <h1 className="text-2xl font-black text-text sm:text-3xl">{roadmap.title}</h1>
            {roadmap.description && <p className="mx-auto mt-2 max-w-xl text-sm text-text-muted">{roadmap.description}</p>}
          </div>
          {nodes.length > 0 && (
            <div className="flex w-full max-w-sm items-center gap-3">
              <div className="h-2.5 flex-1 rounded-full bg-surface-hover">
                <div className="h-2.5 rounded-full transition-all" style={{ width: `${pct}%`, background: accent }} />
              </div>
              <span className="shrink-0 text-xs font-bold text-text-muted">{doneCount}/{nodes.length}</span>
            </div>
          )}
        </div>
      </div>

      <div className="relative mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 px-4 py-8 sm:px-8">
        {nodes.length === 0 ? (
          <p className="text-center text-sm text-text-muted">{t('pages.roadmaps.emptyNodes')}</p>
        ) : (
          <>
            <div
              className="pointer-events-none absolute bottom-8 left-1/2 top-8 hidden w-px -translate-x-1/2 sm:block"
              style={{ background: `linear-gradient(180deg, transparent, ${accent}55 8%, ${accent}55 92%, transparent)` }}
            />
            {nodes.map((node, i) => (
              <RoadmapNode
                key={node.id}
                node={node}
                index={i}
                done={doneIds.includes(node.id)}
                accent={accent}
                onToggle={(nodeId) => toggleNodeDone(id, nodeId)}
              />
            ))}
          </>
        )}
      </div>

      <MascotCompanion />
    </div>
  )
}
