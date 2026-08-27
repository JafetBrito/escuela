import { Link } from 'react-router-dom'
import { dueInfo, URGENCY_LABEL } from '../../utils/taskDue'

// Sustituto honesto del "periodo actual con fechas de evaluación" de la
// referencia — este proyecto no tiene una entidad de calendario académico,
// solo due_date por tarea, así que en vez de inventar un periodo mostramos
// la tarea pendiente real más próxima a vencer.
const SHOWN = 2

export default function UpcomingDeadlinesCard({ pendingTasks }) {
  const sorted = [...pendingTasks].sort((a, b) => {
    if (!a.due_date && !b.due_date) return 0
    if (!a.due_date) return 1
    if (!b.due_date) return -1
    return new Date(a.due_date) - new Date(b.due_date)
  })
  const shown = sorted.slice(0, SHOWN)
  const rest = sorted.length - shown.length

  return (
    <div className="rounded-2xl border border-border bg-surface p-4">
      <p className="text-xs font-bold uppercase tracking-wide text-text-muted">📅 Próximas entregas</p>
      {shown.length === 0 ? (
        <p className="mt-2 text-sm text-text-muted">No tienes tareas pendientes. 🎉</p>
      ) : (
        <ul className="mt-2 space-y-2">
          {shown.map((task) => {
            const due = dueInfo(task.due_date, task.status)
            return (
              <li key={task.id} className="min-w-0">
                <p className="truncate text-sm font-semibold text-text">{task.title}</p>
                {due && <p className={`text-xs font-medium ${URGENCY_LABEL[due.urgency]}`}>{due.text}</p>}
              </li>
            )
          })}
        </ul>
      )}
      {rest > 0 && <p className="mt-1.5 text-xs text-text-muted">+{rest} pendientes más</p>}
      <Link to="/mis-tareas" className="mt-3 inline-block text-xs font-semibold text-primary hover:underline">
        Ver todas mis tareas →
      </Link>
    </div>
  )
}
