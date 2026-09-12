import { useEffect, useState } from 'react'
import { useParams, Navigate, Link } from 'react-router-dom'
import AppTopBar from '../shared/AppTopBar'
import MascotCompanion from '../mascot/MascotCompanion'
import { useRoadmapContentStore } from '../../stores/useRoadmapContentStore'
import { useRoadmapProgressStore, EMPTY_ARRAY } from '../../stores/useRoadmapProgressStore'
import { useI18n } from '../../i18n'

const LINK_LABEL_KEY = { course: 'linkCourse', tutorial: 'linkTutorial' }

function linkHref(node) {
  if (node.linkType === 'course') return `/learn/${node.linkId}`
  if (node.linkType === 'tutorial') return `/tutorial/${node.linkId}`
  return null
}

// Recorre el árbol completo (recursivo) para contar avance real — un nodo
// intermedio (con hijos) también cuenta, no solo las hojas.
function flattenIds(nodes) {
  return (nodes ?? []).flatMap((n) => [n.id, ...flattenIds(n.children)])
}

// Nodo del árbol — árbol expandible (como un explorador de archivos), NO
// un diagrama de flujo en lienzo: clic en un nodo con hijos expande/
// colapsa esos hijos indentados debajo (línea de conexión = un simple
// border-l); clic en un nodo sin hijos abre un panel con su introducción +
// links de referencia. El check de "hecho" es un control aparte (stopPropagation)
// para que marcar progreso no dependa de expandir/colapsar.
function RoadmapNode({ node, depth, accent, doneIds, onToggle }) {
  const { t } = useI18n()
  const [open, setOpen] = useState(false)
  const hasChildren = (node.children ?? []).length > 0
  const done = doneIds.includes(node.id)
  const href = linkHref(node)
  const hasDetail = Boolean(node.intro) || (node.resources ?? []).length > 0 || href

  return (
    <div style={{ marginLeft: depth > 0 ? 20 : 0 }} className={depth > 0 ? 'border-l border-border/60 pl-4' : ''}>
      <div className="flex items-center gap-2 py-1.5">
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onToggle(node.id) }}
          aria-label={done ? t('pages.roadmaps.markNotDone') : t('pages.roadmaps.markDone')}
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-black ring-2 transition-all"
          style={{
            background: done ? accent : 'transparent',
            color: done ? '#fff' : 'var(--color-text-muted)',
            borderColor: accent,
          }}
        >
          {done ? '✓' : ''}
        </button>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          disabled={!hasChildren && !hasDetail}
          className="flex min-w-0 flex-1 items-center gap-1.5 rounded-lg px-2 py-1 text-left transition-colors hover:bg-surface-hover disabled:cursor-default"
        >
          {hasChildren && <span className="shrink-0 text-xs text-text-muted">{open ? '▾' : '▸'}</span>}
          <span className="truncate text-sm font-bold text-text">{node.title}</span>
        </button>
      </div>

      {open && !hasChildren && hasDetail && (
        <div className="mb-2 ml-8 rounded-xl border border-border bg-surface p-3">
          {node.intro && <p className="text-xs leading-relaxed text-text-muted">{node.intro}</p>}
          {(node.resources ?? []).length > 0 && (
            <ul className="mt-2 space-y-1">
              {node.resources.map((r, i) => (
                <li key={i}>
                  <a href={r.url} target="_blank" rel="noopener noreferrer"
                    className="text-xs font-semibold hover:underline" style={{ color: accent }}>
                    🔗 {r.label || r.url}
                  </a>
                </li>
              ))}
            </ul>
          )}
          {href && (
            <Link to={href} className="mt-2 inline-block text-xs font-bold hover:underline" style={{ color: accent }}>
              {t(`pages.roadmaps.${LINK_LABEL_KEY[node.linkType]}`)}
            </Link>
          )}
        </div>
      )}

      {open && hasChildren && (
        <div className="mb-1">
          {node.children.map((child) => (
            <RoadmapNode key={child.id} node={child} depth={depth + 1} accent={accent} doneIds={doneIds} onToggle={onToggle} />
          ))}
        </div>
      )}
    </div>
  )
}

export default function RoadmapViewerPage() {
  const { id } = useParams()
  const { t } = useI18n()
  const loaded = useRoadmapContentStore((s) => s.loaded)
  const roadmap = useRoadmapContentStore((s) => s.roadmaps[id])
  const fetchAll = useRoadmapContentStore((s) => s.fetchAll)
  const doneIds = useRoadmapProgressStore((s) => s.done[id] ?? EMPTY_ARRAY)
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
  const allIds = flattenIds(nodes)
  const doneCount = allIds.filter((nid) => doneIds.includes(nid)).length

  return (
    <div className="flex min-h-screen flex-col bg-background text-text">
      <AppTopBar variant="course" backTo="/roadmaps" backLabel={t('pages.roadmaps.backLabel')} />

      <div
        className="relative overflow-hidden border-b border-border px-4 py-10 sm:px-8 sm:py-14"
        style={{ background: `linear-gradient(160deg, ${accent}22 0%, transparent 60%)` }}
      >
        <div className="relative mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
          <span className="flex h-20 w-20 items-center justify-center rounded-2xl text-4xl shadow-lg"
            style={{ background: `${accent}22`, border: `1px solid ${accent}44` }}>
            {roadmap.icon || '🗺️'}
          </span>
          <div>
            <h1 className="text-2xl font-black text-text sm:text-3xl">{roadmap.title}</h1>
            {roadmap.description && <p className="mx-auto mt-2 max-w-xl text-sm text-text-muted">{roadmap.description}</p>}
          </div>
          {allIds.length > 0 && (
            <div className="flex w-full max-w-sm items-center gap-3">
              <div className="h-2.5 flex-1 rounded-full bg-surface-hover">
                <div className="h-2.5 rounded-full transition-all" style={{ width: `${Math.round((doneCount / allIds.length) * 100)}%`, background: accent }} />
              </div>
              <span className="shrink-0 text-xs font-bold text-text-muted">{doneCount}/{allIds.length}</span>
            </div>
          )}
        </div>
      </div>

      <div className="mx-auto w-full max-w-2xl flex-1 px-4 py-8 sm:px-8">
        {nodes.length === 0 ? (
          <p className="text-center text-sm text-text-muted">{t('pages.roadmaps.emptyNodes')}</p>
        ) : (
          nodes.map((node) => (
            <RoadmapNode key={node.id} node={node} depth={0} accent={accent} doneIds={doneIds} onToggle={(nid) => toggleNodeDone(id, nid)} />
          ))
        )}
      </div>

      <MascotCompanion />
    </div>
  )
}
