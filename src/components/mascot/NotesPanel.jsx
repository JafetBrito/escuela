import Inventory from '../inventory/Inventory'
import { useProgressStore, EMPTY_ARRAY } from '../../stores/useProgressStore'

// Renders the per-module quick-notes textarea + inventory when opened from
// inside a course (`module` set), or just the general notes/links inventory
// when opened elsewhere (e.g. from VR, Biblioteca, Games).
export default function NotesPanel({ courseId, module, className = '' }) {
  const moduleProgress = useProgressStore((s) => s.progress[courseId]?.moduleProgress ?? EMPTY_ARRAY)
  const setModuleNote = useProgressStore((s) => s.setModuleNote)
  const currentNote = module ? moduleProgress.find((p) => p.moduleId === module.id)?.notes ?? '' : ''

  return (
    <div className={`flex flex-col gap-5 ${className}`}>
      {module && (
        <>
          <div className="flex flex-col gap-2">
            <p className="text-sm font-semibold text-text">Resumen rápido de esta clase</p>
            <textarea
              value={currentNote}
              onChange={(e) => setModuleNote(courseId, module.id, e.target.value)}
              placeholder={`Escribe tus notas para "${module.title}"…`}
              className="h-28 w-full resize-none rounded-lg border border-border bg-background p-3 text-sm text-text outline-none focus:border-primary"
            />
          </div>

          <div className="h-px bg-border" />
        </>
      )}

      <div className="flex flex-col gap-2">
        <p className="text-sm font-semibold text-text">
          {module ? 'Inventario' : 'Tus notas generales'}
        </p>
        <Inventory {...(module ? { moduleId: module.id, moduleTitle: module.title } : {})} />
      </div>
    </div>
  )
}
