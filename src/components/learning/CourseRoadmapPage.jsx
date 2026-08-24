import { useMemo } from 'react'
import { useParams, useNavigate, Navigate, Link } from 'react-router-dom'
import AppTopBar from '../shared/AppTopBar'
import { getCourseData, hasCourseData } from '../../data/courseRegistry'
import { useProgressStore, EMPTY_ARRAY } from '../../stores/useProgressStore'
import { useAuthStore } from '../../stores/useAuthStore'
import { CATEGORY_META } from '../../data/categoryMeta'
import { useI18n } from '../../i18n'
import ModuleHoverCard from './ModuleHoverCard'

// Nodo de un módulo en el camino — círculo con número/✓/🔒, alternando
// izquierda/derecha en desktop (estilo "camino de niveles"). El nodo
// "siguiente" (isNext) se marca como "estás aquí" — más grande, con halo y
// una etiqueta flotante — para que el ojo encuentre de inmediato dónde
// seguir sin tener que leer toda la lista.
function ModuleNode({ module: mod, index, state, accent, isNext, onClick }) {
  const isDone = state === 'done'
  const isLocked = state === 'locked'
  const align = index % 2 === 0 ? 'sm:self-start sm:ml-0' : 'sm:self-end sm:mr-0'

  return (
    <div className={`relative flex w-full sm:w-[calc(50%+28px)] ${align}`}>
      <ModuleHoverCard module={mod} accent={accent} side="top" className="w-full">
        <button
          type="button"
          onClick={onClick}
          disabled={isLocked}
          className={`group relative flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition-all ${
            isLocked
              ? 'cursor-not-allowed border-border/60 bg-surface/40 opacity-60'
              : isNext
                ? 'border-transparent bg-surface hover:-translate-y-0.5'
                : 'border-border bg-surface hover:-translate-y-0.5 hover:border-primary hover:shadow-lg'
          }`}
          style={isNext ? { boxShadow: `0 0 0 2px ${accent}, 0 8px 28px -6px ${accent}77` } : undefined}
        >
          {isNext && (
            <span
              className="absolute -top-3 left-4 rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wide text-white shadow-md"
              style={{ background: accent }}
            >
              📍 Estás aquí
            </span>
          )}
          <span
            className={`flex shrink-0 items-center justify-center rounded-full font-black shadow-md ring-2 transition-all ${
              isNext ? 'h-16 w-16 text-2xl' : 'h-14 w-14 text-xl'
            } ${isDone ? 'ring-primary' : isLocked ? 'ring-border' : 'ring-primary'}`}
            style={{
              background: isLocked ? 'var(--color-surface-hover)' : `linear-gradient(135deg, ${accent}, ${accent}99)`,
              color: isLocked ? 'var(--color-text-muted)' : '#fff',
              boxShadow: isNext ? `0 0 24px ${accent}99` : undefined,
            }}
          >
            {isDone ? '✓' : isLocked ? '🔒' : mod.order + 1}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-text">{mod.title}</p>
            <p className="line-clamp-1 text-xs text-text-muted">{mod.description}</p>
          </div>
          {!isLocked && (
            <span className="shrink-0 text-xs font-bold opacity-0 transition-opacity group-hover:opacity-100" style={{ color: accent }}>
              {isDone ? 'Repasar →' : 'Entrar →'}
            </span>
          )}
        </button>
      </ModuleHoverCard>
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
          seguir), antes del mapa de niveles. Antes era un gradiente plano;
          ahora tiene un halo detrás del ícono y un fondo con textura sutil
          para que se sienta menos "lista con encabezado" y más portada. */}
      <div
        className="relative overflow-hidden border-b border-border px-4 py-10 sm:px-8 sm:py-14"
        style={{ background: `linear-gradient(160deg, ${accent}22 0%, transparent 60%)` }}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            backgroundImage: `radial-gradient(${accent}33 1px, transparent 1px)`,
            backgroundSize: '22px 22px',
            maskImage: 'radial-gradient(ellipse 60% 60% at 50% 30%, black, transparent)',
          }}
        />
        <div className="relative mx-auto flex max-w-3xl flex-col items-center gap-4 text-center">
          <div className="relative">
            <span
              className="pointer-events-none absolute -inset-4 rounded-full blur-xl"
              style={{ background: `${accent}55` }}
            />
            <span
              className="relative flex h-20 w-20 items-center justify-center rounded-2xl text-4xl shadow-lg"
              style={{ background: `${accent}22`, border: `1px solid ${accent}44` }}
            >
              {courseData.icon}
            </span>
          </div>
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
          espacio para el zigzag). Una línea vertical de degradado corre por
          detrás de los nodos — el "sendero" — para reforzar la sensación de
          expedición en vez de una lista con viñetas. */}
      <div className="relative mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 px-4 py-8 sm:px-8">
        <div
          className="pointer-events-none absolute bottom-8 left-1/2 top-8 hidden w-px -translate-x-1/2 sm:block"
          style={{ background: `linear-gradient(180deg, transparent, ${accent}55 8%, ${accent}55 92%, transparent)` }}
        />
        {modulesWithState.map((mod, i) => (
          <ModuleNode
            key={mod.id}
            module={mod}
            index={i}
            state={mod._state}
            isNext={mod.id === nextModule?.id}
            accent={accent}
            onClick={() => goToModule(mod)}
          />
        ))}
      </div>
    </div>
  )
}
