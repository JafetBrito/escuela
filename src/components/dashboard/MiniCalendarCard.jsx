import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useLiveClassStore } from '../../stores/useLiveClassStore'
import { useI18n } from '../../i18n'

// Calendario real (grid del mes) — calco visual de la referencia, con datos
// reales: los días con una live_class programada llevan un punto de color
// (rojo si es hoy/en vivo). Sin modal de detalle (eso ya vive en /horario,
// WeeklyClassCalendar.jsx) — aquí es solo un vistazo rápido + link.
const WEEKDAYS = ['D', 'L', 'M', 'M', 'J', 'V', 'S']

function sameDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

export default function MiniCalendarCard() {
  const { t } = useI18n()
  const classes = useLiveClassStore((s) => s.classes)
  const fetchClasses = useLiveClassStore((s) => s.fetchClasses)
  useEffect(() => { fetchClasses() }, [fetchClasses])

  const today = new Date()
  const monthLabel = today.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' })

  const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
  const startOffset = firstOfMonth.getDay() // 0=domingo
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate()
  const cells = [
    ...Array(startOffset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(today.getFullYear(), today.getMonth(), i + 1)),
  ]

  const classDays = classes.filter((c) => c.status !== 'finalizada').map((c) => new Date(c.scheduled_at))

  return (
    <div className="rounded-2xl border border-border bg-surface p-4">
      <p className="text-xs font-bold uppercase tracking-wide text-text-muted">📆 {monthLabel}</p>
      <div className="mt-3 grid grid-cols-7 gap-1 text-center">
        {WEEKDAYS.map((w, i) => (
          <span key={i} className="text-[10px] font-bold text-text-muted">{w}</span>
        ))}
        {cells.map((day, i) => {
          if (!day) return <span key={i} />
          const isToday = sameDay(day, today)
          const hasClass = classDays.some((d) => sameDay(d, day))
          return (
            <div key={i} className="flex flex-col items-center gap-0.5 py-0.5">
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-semibold ${
                  isToday ? 'bg-primary text-background' : 'text-text'
                }`}
              >
                {day.getDate()}
              </span>
              <span className={`h-1 w-1 rounded-full ${hasClass ? 'bg-red-400' : 'bg-transparent'}`} />
            </div>
          )
        })}
      </div>
      <Link to="/horario" className="mt-3 inline-block text-xs font-semibold text-primary hover:underline">
        {t('dashboard.summary.seeFullSchedule')}
      </Link>
    </div>
  )
}
