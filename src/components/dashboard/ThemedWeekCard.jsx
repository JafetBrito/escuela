import { useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import courses from '../../data/courses.json'
import { dayIndex, efemerideOf } from '../../data/themedWeeks'
import { useThemedWeekStore, resolveThemedWeek } from '../../stores/useThemedWeekStore'
import { tr } from '../../i18n'

// Tarjeta de la semana temática activa: tema, reto de hoy y cursos destacados.
export default function ThemedWeekCard() {
  const navigate = useNavigate()
  const override = useThemedWeekStore((s) => s.override)
  const week = useMemo(() => resolveThemedWeek(override), [override])
  const featured = useMemo(
    () => (week ? courses.filter((c) => week.categories.includes(c.category) && !c.locked).slice(0, 3) : []),
    [week],
  )
  if (!week) return null
  const today = week.days[dayIndex()] ?? {}
  const efem = efemerideOf()

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
      <div className="px-6 py-5" style={{ background: `linear-gradient(135deg, ${week.color}, ${week.color}99)` }}>
        <p className="text-[11px] font-black uppercase tracking-widest text-white/80">{tr('Esta semana en Oliver Academy', 'This week at Oliver Academy')}</p>
        <h2 className="mt-1 text-2xl font-extrabold text-white drop-shadow-sm">{week.icon} {week.title}</h2>
        <p className="mt-1 text-sm font-medium text-white/90">{week.blurb}</p>
      </div>
      <div className="grid gap-4 p-5 lg:grid-cols-2">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-text-muted/70">{tr('🎯 Reto de hoy', '🎯 Today\'s challenge')}</p>
          <p className="mt-1.5 text-sm text-text">{today.question ?? today.task ?? tr('Hoy toca descansar y repasar.', 'Today is for resting and reviewing.')}</p>
          {today.figure && <p className="mt-1.5 text-xs text-text-muted">{tr('🧑‍🏫 Figura del día:', '🧑‍🏫 Figure of the day:')} <span className="font-semibold text-text">{today.figure.name}</span></p>}
          {efem && <p className="mt-1 text-xs text-text-muted">📆 {efem.text}</p>}
          <Link to="/semana" className="mt-3 inline-block rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-background hover:opacity-90">{tr('Abrir el día completo →', 'Open the full day →')}</Link>
        </div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-text-muted/70">{tr('📚 Cursos para esta semana', '📚 Courses for this week')}</p>
          <div className="mt-1.5 flex flex-wrap gap-2">
            {featured.length === 0 && <span className="text-xs text-text-muted">{tr('Pronto habrá cursos de este tema.', 'Courses on this topic are coming soon.')}</span>}
            {featured.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => navigate(`/learn/${c.id}`)}
                className="rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-text transition hover:border-primary hover:text-primary"
              >
                {c.icon} {c.title}
              </button>
            ))}
            <Link to="/academias" className="rounded-full px-3 py-1.5 text-xs font-semibold text-primary hover:underline">{tr('Ver academias →', 'See academies →')}</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
