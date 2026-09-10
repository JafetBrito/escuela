import { Link } from 'react-router-dom'
import { useI18n } from '../../i18n'

// Lista de barras porcentuales — calco de la lista "In Progress/Completed/
// Inactive/Expired" de la referencia. "Sin empezar" usa `totalCount`
// (cursos disponibles, no bloqueados) como denominador — mismo criterio que
// CoursesDonutCard, nunca el catálogo completo con contenido bloqueado.
export default function TrajectorySummaryCard({ completedCount, inProgressCount, totalCount }) {
  const { t } = useI18n()
  const notStarted = Math.max(0, totalCount - completedCount - inProgressCount)
  const pct = (n) => (totalCount > 0 ? Math.round((n / totalCount) * 100) : 0)

  const ROWS = [
    { n: inProgressCount, key: 'inProgressSlice', bar: 'bg-primary' },
    { n: completedCount, key: 'completedSlice', bar: 'bg-emerald-400' },
    { n: notStarted, key: 'notStartedSlice', bar: 'bg-surface-hover' },
  ]

  return (
    <div className="rounded-2xl border border-border bg-surface p-4">
      <p className="text-xs font-bold uppercase tracking-wide text-text-muted">{t('dashboard.summary.trajectoryTitle')}</p>
      <div className="mt-3 space-y-3">
        {ROWS.map((r) => (
          <div key={r.key}>
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="font-semibold text-text">{t(`dashboard.summary.${r.key}`)}</span>
              <span className="text-text-muted">{pct(r.n)}% · {r.n}</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-surface-hover">
              <div className={`h-full rounded-full ${r.bar} transition-all`} style={{ width: `${pct(r.n)}%` }} />
            </div>
          </div>
        ))}
      </div>
      <Link to="/progreso" className="mt-3 inline-block text-xs font-semibold text-primary hover:underline">
        {t('dashboard.summary.seeFullProgress')}
      </Link>
    </div>
  )
}
