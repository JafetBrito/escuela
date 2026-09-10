import { Link } from 'react-router-dom'
import { useI18n } from '../../i18n'

// Donut "total de cursos" (referencia visual enviada por el usuario) — con
// datos 100% reales: completados/en progreso/no iniciados sobre el catálogo
// completo. Dibujado con conic-gradient (nativo, sin librería de charts).
export default function CoursesDonutCard({ completedCount, inProgressCount, totalCount }) {
  const { t } = useI18n()
  const notStarted = Math.max(0, totalCount - completedCount - inProgressCount)
  const pct = (n) => (totalCount > 0 ? (n / totalCount) * 100 : 0)

  const SLICES = [
    { n: completedCount, color: '#34d399', label: t('dashboard.summary.completedSlice') },
    { n: inProgressCount, color: '#7c3aed', label: t('dashboard.summary.inProgressSlice') },
    { n: notStarted, color: 'var(--color-surface-hover)', label: t('dashboard.summary.notStartedSlice') },
  ]
  let acc = 0
  const stops = SLICES.map((s) => {
    const from = acc
    acc += pct(s.n)
    return `${s.color} ${from}% ${acc}%`
  }).join(', ')

  return (
    <div className="rounded-2xl border border-border bg-surface p-4">
      <p className="text-xs font-bold uppercase tracking-wide text-text-muted">{t('dashboard.summary.coursesDonutTitle')}</p>
      <div className="mt-3 flex items-center gap-4">
        <div
          className="relative flex h-24 w-24 shrink-0 items-center justify-center rounded-full"
          style={{ background: totalCount > 0 ? `conic-gradient(${stops})` : 'var(--color-surface-hover)' }}
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-surface text-center">
            <span className="text-lg font-black text-text">{totalCount}</span>
          </div>
        </div>
        <ul className="space-y-1.5 text-xs">
          {SLICES.map((s) => (
            <li key={s.label} className="flex items-center gap-1.5 text-text-muted">
              <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: s.color }} />
              {s.label}: <span className="font-bold text-text">{s.n}</span>
            </li>
          ))}
        </ul>
      </div>
      <Link to="/academias" className="mt-3 inline-block text-xs font-semibold text-primary hover:underline">
        {t('dashboard.summary.seeAllCourses')}
      </Link>
    </div>
  )
}
