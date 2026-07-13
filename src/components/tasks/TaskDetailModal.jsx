import { useState } from 'react'
import { useTasksStore } from '../../stores/useTasksStore'
import { taskTypeOf } from '../../data/taskTypes'

const STATUS_META = {
  pendiente: { label: 'Pendiente', cls: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
  entregada: { label: '✓ Entregada', cls: 'bg-blue-500/15 text-blue-400 border-blue-500/30' },
  revisada:  { label: '★ Revisada', cls: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
}

// Modal global de detalle de una tarea/proyecto/examen — se abre desde
// cualquier página (lista del alumno, panel admin, notificación) llamando
// useTasksStore.getState().openTask(id). Sigue el mismo patrón que
// BookReaderModal/PatchNotesModal: un solo componente montado en App.jsx que
// lee su estado "abierto" de un store global en vez de props locales.
export default function TaskDetailModal() {
  const openTaskId = useTasksStore((s) => s.openTaskId)
  const closeTask  = useTasksStore((s) => s.closeTask)
  const tasks      = useTasksStore((s) => s.tasks)
  const allTasks    = useTasksStore((s) => s.allTasks)
  const submitTask  = useTasksStore((s) => s.submitTask)
  const [busy, setBusy] = useState(false)

  if (!openTaskId) return null
  const task = tasks.find((t) => t.id === openTaskId) ?? allTasks.find((t) => t.id === openTaskId)
  if (!task) return null

  const type = taskTypeOf(task.type)
  const status = STATUS_META[task.status] ?? STATUS_META.pendiente
  const hasGrade = task.grade != null

  const handleSubmit = async () => {
    setBusy(true)
    await submitTask(task.id)
    setBusy(false)
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 p-4" onClick={closeTask}>
      <div
        className="w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 px-5 py-4" style={{ background: `${type.color}12`, borderBottom: `1px solid ${type.color}30` }}>
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl text-xl" style={{ background: `${type.color}25` }}>
              {type.icon}
            </span>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide" style={{ color: type.color }}>{type.label}{task.subject ? ` · ${task.subject}` : ''}</p>
              <h2 className="text-base font-extrabold text-text">{task.title}</h2>
            </div>
          </div>
          <button onClick={closeTask} className="shrink-0 rounded-lg px-2 py-1 text-text-muted hover:bg-surface-hover hover:text-text">✕</button>
        </div>

        <div className="max-h-[70vh] space-y-4 overflow-y-auto px-5 py-4">
          <span className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-bold ${status.cls}`}>{status.label}</span>

          {task.description && (
            <div>
              <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-text-muted/60">Instrucciones</p>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-text">{task.description}</p>
            </div>
          )}

          {task.due_date && (
            <p className="text-sm text-text-muted">
              📅 {task.type === 'examen' ? 'Fecha del examen' : 'Fecha límite'}: {new Date(task.due_date + 'T12:00:00').toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })}
              {task.type === 'examen' && task.details?.time ? ` a las ${task.details.time}` : ''}
            </p>
          )}

          {/* Detalles propios del examen */}
          {task.type === 'examen' && (task.details?.duration_minutes || task.details?.modality || task.details?.topics) && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-3 space-y-2">
              <div className="flex flex-wrap gap-4 text-sm text-text">
                {task.details?.duration_minutes && <span>⏱️ <strong>{task.details.duration_minutes} min</strong></span>}
                {task.details?.modality && <span>📍 <strong>{task.details.modality}</strong></span>}
              </div>
              {task.details?.topics && (
                <div>
                  <p className="mb-0.5 text-[10px] font-bold uppercase tracking-widest text-text-muted/60">Temario</p>
                  <p className="text-sm leading-relaxed text-text-muted">{task.details.topics}</p>
                </div>
              )}
            </div>
          )}

          {/* Entregables del proyecto */}
          {task.type === 'proyecto' && task.details?.deliverables?.length > 0 && (
            <div>
              <p className="mb-1.5 text-[10px] font-bold uppercase tracking-widest text-text-muted/60">Entregables</p>
              <ul className="space-y-1.5">
                {task.details.deliverables.map((d, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-text">
                    <span className="text-purple-400">▢</span> {d}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {hasGrade && (
            <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/5 p-3">
              <p className="text-sm font-extrabold text-emerald-400">Calificación: {task.grade}/{task.grade_max ?? 10}</p>
              {task.feedback && <p className="mt-1.5 text-sm leading-relaxed text-text-muted">💬 {task.feedback}</p>}
            </div>
          )}

          {task.status === 'pendiente' && submitTask && (
            <button
              type="button"
              disabled={busy}
              onClick={handleSubmit}
              className="w-full rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-50"
            >
              {busy ? 'Enviando…' : '✅ Marcar como entregada'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
