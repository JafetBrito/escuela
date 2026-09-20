import { useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import courses from '../../data/courses.json'
import { dayIndex } from '../../data/themedWeeks'
import { useThemedWeekStore, resolveThemedWeek } from '../../stores/useThemedWeekStore'

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

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
      <div className="px-6 py-5" style={{ background: `linear-gradient(135deg, ${week.color}, ${week.color}99)` }}>
        <p className="text-[11px] font-black uppercase tracking-widest text-white/80">Esta semana en Oliver Academy</p>
        <h2 className="mt-1 text-2xl font-extrabold text-white drop-shadow-sm">{week.icon} {week.title}</h2>
        <p className="mt-1 text-sm font-medium text-white/90">{week.blurb}</p>
      </div>
      <div className="grid gap-4 p-5 lg:grid-cols-2">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-text-muted/70">🎯 Reto de hoy</p>
          <p className="mt-1.5 text-sm text-text">{week.daily[dayIndex()]}</p>
        </div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-text-muted/70">📚 Cursos para esta semana</p>
          <div className="mt-1.5 flex flex-wrap gap-2">
            {featured.length === 0 && <span className="text-xs text-text-muted">Pronto habrá cursos de este tema.</span>}
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
            <Link to="/academias" className="rounded-full px-3 py-1.5 text-xs font-semibold text-primary hover:underline">Ver academias →</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
