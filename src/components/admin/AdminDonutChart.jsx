// Donut genérico — mismo truco conic-gradient nativo que ya usa
// CoursesDonutCard.jsx (dashboard de alumno), generalizado para que los
// paneles de admin no reimplementen el mismo CSS dos veces más.
export default function AdminDonutChart({ title, slices, centerLabel }) {
  const total = slices.reduce((sum, s) => sum + s.value, 0)
  const pct = (n) => (total > 0 ? (n / total) * 100 : 0)
  let acc = 0
  const stops = slices.map((s) => {
    const from = acc
    acc += pct(s.value)
    return `${s.color} ${from}% ${acc}%`
  }).join(', ')

  return (
    <div className="rounded-2xl border border-border bg-surface p-4">
      <p className="text-xs font-bold uppercase tracking-wide text-text-muted">{title}</p>
      <div className="mt-3 flex items-center gap-4">
        <div
          className="relative flex h-24 w-24 shrink-0 items-center justify-center rounded-full"
          style={{ background: total > 0 ? `conic-gradient(${stops})` : 'var(--color-surface-hover)' }}
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-surface text-center">
            <span className="text-lg font-black text-text">{centerLabel ?? total}</span>
          </div>
        </div>
        <ul className="space-y-1.5 text-xs">
          {slices.map((s) => (
            <li key={s.label} className="flex items-center gap-1.5 text-text-muted">
              <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: s.color }} />
              {s.label}: <span className="font-bold text-text">{s.value}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
