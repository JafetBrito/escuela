import { useMemo } from 'react'
import { useParams, useNavigate, Navigate, Link } from 'react-router-dom'
import AppTopBar from '../shared/AppTopBar'
import { getCourseData, hasCourseData } from '../../data/courseRegistry'
import { useProgressStore, EMPTY_ARRAY } from '../../stores/useProgressStore'
import { useAuthStore } from '../../stores/useAuthStore'
import { CATEGORY_META } from '../../data/categoryMeta'
import { useI18n } from '../../i18n'

// Nodo de un módulo en el camino — círculo con número/✓/🔒, alternando
// izquierda/derecha en desktop (estilo "camino de niveles", tipo Duolingo)
// para que se sienta como un mapa de videojuego y no una lista plana.
function ModuleNode({ module: mod, index, state, accent, onClick }) {
  const isDone = state === 'done'
  const isLocked = state === 'locked'
  const align = index % 2 === 0 ? 'sm:self-start sm:ml-0' : 'sm:self-end sm:mr-0'

  return (
    <div className={`flex w-full sm:w-[calc(50%+28px)] ${align}`}>
      <button
        type="button"
        onClick={onClick}
        disabled={isLocked}
        className={`group flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition-all ${
          isLocked
            ? 'cursor-not-allowed border-border/60 bg-surface/40 opacity-60'
            : 'border-border bg-surface hover:-translate-y-0.5 hover:border-primary hover:shadow-lg'
        }`}
      >
        <span
          className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-xl font-black shadow-md ring-2 ${
            isDone
              ? 'ring-primary'
              : isLocked
                ? 'ring-border'
                : 'ring-primary animate-pulse'
          }`}
          style={{
            background: isLocked ? 'var(--color-surface-hover)' : `linear-gradient(135deg, ${accent}, ${accent}99)`,
            color: isLocked ? 'var(--color-text-muted)' : '#fff',
          }}
        >
          {isDone ? '✓' : isLocked ? '🔒' : mod.order + 1}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-text">{mod.title}</p>
          <p className="line-clamp-1 text-xs text-text-muted">{mod.description}</p>
        </div>
        {!isLocked && (
          <span className="shrink-0 text-xs font-bold text-primary opacity-0 transition-opacity group-hover:opacity-100">
            {isDone ? 'Repasar →' : 'Entrar →'}
          </span>
        )}
      </button>
    </div>
  )
}

export default function CourseRoadmapPage() {
  const { courseId } = useParams()
  const navigate = useNavigate()
  const { t, lang } = useI18n()
  const hasAccessToCourse = useAuthStore((s) => s.hasAccessToCourse)
  const moduleProgress = useProgressStore((s) => s.progress[courseId]?.moduleProgress ?? EMPTY_ARRAY)
  const isModuleUnlocked = useProgressStore((s) => s.isModuleUnlocked)

  const courseData = hasCourseData(courseId) ? getCourseData(courseId, lang) : null

  const modulesWithState = useMemo(() => {
    if (!courseData) return []
    return courseData.modules.map((mod) => {
      const done = moduleProgress.some((p) => p.moduleId === mod.id && p.completed)
      const unlocked = isModuleUnlocked(courseId, mod.id)
      return { ...mod, _state: done ? 'done' : unlocked ? 'open' : 'locked' }
    })
  }, [courseData, moduleProgress, isModuleUnlocked, courseId])

  if (!courseData) {
    return <Navigate to="/dashboard" replace />
  }

  const doneCount = modulesWithState.filter((m) => m._state === 'done').length
  const total = modulesWithState.length
  const pct = total > 0 ? Math.round((doneCount / total) * 100) : 0
  const meta = CATEGORY_META[courseData.category] ?? CATEGORY_META.Otros
  const accent = meta.accent ?? courseData.color ?? '#7c3aed'

  // "Continuar donde te quedaste": el primer módulo abierto y no terminado;
  // si ya se terminaron todos, cae al último.
  const nextModule = modulesWithState.find((m) => m._state === 'open') ?? modulesWithState[modulesWithState.length - 1]
  const goToModule = (mod) => {
    if (mod._state === 'locked') return
    navigate(`/learn/${courseId}/clase/${mod.id}`)
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-text">
      <AppTopBar variant="course" />

      {/* Portada del curso — mismo espíritu que ProfileHeroCard: lo más
          importante primero (de qué trata, cuánto llevas, botón grande para
          seguir), antes del mapa de niveles. */}
      <div
        className="border-b border-border px-4 py-8 sm:px-8"
        style={{ background: `linear-gradient(160deg, ${accent}22 0%, transparent 60%)` }}
      >
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 text-center">
          <span
            className="flex h-20 w-20 items-center justify-center rounded-2xl text-4xl shadow-lg"
            style={{ background: `${accent}22`, border: `1px solid ${accent}44` }}
          >
            {courseData.icon}
          </span>
          <div>
            <h1 className="text-2xl font-black text-text sm:text-3xl">{courseData.title}</h1>
            <p className="mx-auto mt-2 max-w-xl text-sm text-text-muted">{courseData.description}</p>
          </div>

          {!hasAccessToCourse(courseId) && (
            <Link
              to="/unlock"
              className="rounded-lg border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/20"
            >
              {t('learning.paywallBanner')}
            </Link>
          )}

          <div className="flex w-full max-w-sm items-center gap-3">
            <div className="h-2.5 flex-1 rounded-full bg-surface-hover">
              <div className="h-2.5 rounded-full transition-all" style={{ width: `${pct}%`, background: accent }} />
            </div>
            <span className="shrink-0 text-xs font-bold text-text-muted">{doneCount}/{total}</span>
          </div>

          <button
            type="button"
            onClick={() => goToModule(nextModule)}
            className="rounded-xl px-6 py-3 text-sm font-black text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
            style={{ background: accent }}
          >
            {doneCount === 0 ? '▶ Empezar el curso' : doneCount === total ? '↺ Repasar el curso' : '▶ Continuar donde te quedaste'}
          </button>
        </div>
      </div>

      {/* El camino de niveles — cada módulo es un nodo, alternando lados en
          desktop para que se sienta como un mapa de aventura en vez de una
          lista. En móvil se apilan en una sola columna (misma idea, sin
          espacio para el zigzag). */}
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 px-4 py-8 sm:px-8">
        {modulesWithState.map((mod, i) => (
          <ModuleNode
            key={mod.id}
            module={mod}
            index={i}
            state={mod._state}
            accent={accent}
            onClick={() => goToModule(mod)}
          />
        ))}
      </div>
    </div>
  )
}
