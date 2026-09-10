import { Link } from 'react-router-dom'
import { dueInfo } from '../../utils/taskDue'
import { useI18n } from '../../i18n'

// Fila de ítems con ícono cuadrado + título + meta + flecha — calco visual
// de la lista "Informatic Course / Live Drawing / Contemporary Art" de la
// referencia, con datos reales: tareas pendientes ordenadas por vencimiento
// (esta app no tiene "anuncios" como entidad separada).
const SHOWN = 3
const ICON_BG = ['bg-primary', 'bg-blue-500', 'bg-amber-500']

export default function UpcomingDeadlinesCard({ pendingTasks }) {
  const { t } = useI18n()
  const sorted = [...pendingTasks].sort((a, b) => {
    if (!a.due_date && !b.due_date) return 0
    if (!a.due_date) return 1
    if (!b.due_date) return -1
    return new Date(a.due_date) - new Date(b.due_date)
  })
  const shown = sorted.slice(0, SHOWN)

  return (
    <div className="rounded-2xl border border-border bg-surface p-4">
      <p className="mb-2 text-xs font-bold uppercase tracking-wide text-text-muted">{t('dashboard.summary.upcomingDeadlines')}</p>
      {shown.length === 0 ? (
        <p className="text-sm text-text-muted">{t('dashboard.summary.noPendingTasks')}</p>
      ) : (
        <ul className="space-y-1.5">
          {shown.map((task, i) => {
            const due = dueInfo(task.due_date, task.status, t)
            return (
              <li key={task.id}>
                <Link to="/mis-tareas" className="flex items-center gap-3 rounded-xl px-1.5 py-1.5 transition-colors hover:bg-surface-hover">
                  <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm text-white ${ICON_BG[i % ICON_BG.length]}`}>
                    📋
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-text">{task.title}</p>
                    {due && <p className="truncate text-xs text-text-muted">{due.text}</p>}
                  </div>
                  <span className="shrink-0 text-text-muted">→</span>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
      <Link to="/mis-tareas" className="mt-3 inline-block text-xs font-semibold text-primary hover:underline">
        {t('dashboard.summary.seeAllTasksLink')}
      </Link>
    </div>
  )
}
