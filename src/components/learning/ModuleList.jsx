import { getCourseData } from '../../data/courseRegistry'
import { useProgressStore, EMPTY_ARRAY } from '../../stores/useProgressStore'

export default function ModuleList({ courseId, className = '' }) {
  const courseData = getCourseData(courseId)
  const selectedModuleId = useProgressStore((s) => s.getSelectedModuleId(courseId))
  const setSelectedModule = useProgressStore((s) => s.setSelectedModule)
  const moduleProgress = useProgressStore((s) => s.progress[courseId]?.moduleProgress ?? EMPTY_ARRAY)
  const isModuleUnlocked = useProgressStore((s) => s.isModuleUnlocked)

  return (
    <nav className={`rounded-xl border border-border bg-surface p-3 ${className}`}>
      <p className="mb-2 px-2 text-xs font-semibold uppercase text-text-muted">
        Módulos
      </p>
      <ul className="flex max-h-[420px] flex-col gap-1 overflow-y-auto">
        {courseData.modules.map((mod) => {
          const isActive = mod.id === selectedModuleId
          const isDone = moduleProgress.some(
            (p) => p.moduleId === mod.id && p.completed,
          )
          const unlocked = isModuleUnlocked(courseId, mod.id)
          return (
            <li key={mod.id}>
              <button
                onClick={() => setSelectedModule(courseId, mod.id)}
                disabled={!unlocked}
                className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : unlocked
                      ? 'text-text-muted hover:bg-surface-hover hover:text-text'
                      : 'cursor-not-allowed text-text-muted/40'
                }`}
              >
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-border text-[10px]">
                  {isDone ? '✓' : unlocked ? mod.order : '🔒'}
                </span>
                <span className="truncate">{mod.title}</span>
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
