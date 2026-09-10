import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useLiveClassStore } from '../../stores/useLiveClassStore'
import { useI18n } from '../../i18n'

// "Calendario" de la referencia — sustituto honesto: en vez de un calendario
// genérico (esta app no tiene una entidad de calendario académico separada),
// muestra las próximas clases en vivo reales (live_classes, mismo store que
// /horario y /mis-clases). RLS ya filtra qué clases ve cada alumno.
const SHOWN = 2

export default function UpcomingClassesCard() {
  const { t } = useI18n()
  const classes = useLiveClassStore((s) => s.classes)
  const fetchClasses = useLiveClassStore((s) => s.fetchClasses)
  useEffect(() => { fetchClasses() }, [fetchClasses])

  const upcoming = classes
    .filter((c) => c.status === 'en_vivo' || (c.status === 'programada' && new Date(c.scheduled_at) >= new Date()))
    .sort((a, b) => new Date(a.scheduled_at) - new Date(b.scheduled_at))
  const shown = upcoming.slice(0, SHOWN)
  const rest = upcoming.length - shown.length

  return (
    <div className="rounded-2xl border border-border bg-surface p-4">
      <p className="text-xs font-bold uppercase tracking-wide text-text-muted">{t('dashboard.summary.upcomingClasses')}</p>
      {shown.length === 0 ? (
        <p className="mt-2 text-sm text-text-muted">{t('dashboard.summary.noUpcomingClasses')}</p>
      ) : (
        <ul className="mt-2 space-y-2">
          {shown.map((c) => (
            <li key={c.id} className="min-w-0">
              <p className="truncate text-sm font-semibold text-text">
                {c.status === 'en_vivo' ? '🔴 ' : '🗓️ '}{c.title}
              </p>
              <p className="text-xs text-text-muted">
                {c.status === 'en_vivo'
                  ? t('dashboard.summary.liveNow')
                  : new Date(c.scheduled_at).toLocaleString('es-MX', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
              </p>
            </li>
          ))}
        </ul>
      )}
      {rest > 0 && <p className="mt-1.5 text-xs text-text-muted">{t('dashboard.summary.morePending', { n: rest })}</p>}
      <Link to="/horario" className="mt-3 inline-block text-xs font-semibold text-primary hover:underline">
        {t('dashboard.summary.seeFullSchedule')}
      </Link>
    </div>
  )
}
