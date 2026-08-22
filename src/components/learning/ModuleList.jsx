import { getCourseData } from '../../data/courseRegistry'
import { useProgressStore, EMPTY_ARRAY } from '../../stores/useProgressStore'
import { useI18n } from '../../i18n'

export default function ModuleList({ courseId, className = '' }) {
  const { t, lang } = useI18n()
  const courseData = getCourseData(courseId, lang)
  const selectedModuleId = useProgressStore((s) => s.getSelectedModuleId(courseId))
  const setSelectedModule = useProgressStore((s) => s.setSelectedModule)
  const moduleProgress = useProgressStore((s) => s.progress[courseId]?.moduleProgress ?? EMPTY_ARRAY)
  const isModuleUnlocked = useProgressStore((s) => s.isModuleUnlocked)

  return (
    <nav className={`min-w-0 rounded-xl border border-border bg-surface p-3 ${className}`}>
      <p className="mb-2 px-2 text-xs font-semibold uppercase text-text-muted">
        {t('learning.modules')}
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
                // min-w-0: sin esto, el <span className="truncate"> de abajo
                // NUNCA trunca de verdad — un hijo de flex por defecto tiene
                // min-width:auto, así que "truncate" (white-space:nowrap +
                // ellipsis) queda sin efecto y el título completo se
                // renderiza en una sola línea. Con títulos de módulo largos
                // (comunes en los cursos nuevos), eso vuelve a este botón
                // más ancho que el celular, y como es hijo del mismo grid de
                // una sola columna en móvil que el contenido de la clase,
                // infla el ancho de TODA la página — el bug real detrás de
                // "los cursos se ven gigantes/cortados en móvil".
                className={`flex w-full min-w-0 items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
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
