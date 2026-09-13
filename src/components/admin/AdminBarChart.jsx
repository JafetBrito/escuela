// Barras genéricas — mismo patrón flex/height% que ya usa
// CategoryActivityBarCard.jsx (dashboard de alumno), generalizado para los
// paneles de admin.
export default function AdminBarChart({ title, bars, accent = '#7c3aed' }) {
  const max = Math.max(1, ...bars.map((b) => b.value))
  return (
    <div className="rounded-2xl border border-border bg-surface p-4">
      <p className="text-xs font-bold uppercase tracking-wide text-text-muted">{title}</p>
      {bars.length === 0 ? (
        <p className="mt-4 text-xs text-text-muted">Sin datos todavía.</p>
      ) : (
        <div className="mt-4 flex h-32 items-end gap-2.5">
          {bars.map((b) => {
            const pct = Math.round((b.value / max) * 100)
            return (
              <div key={b.label} className="flex flex-1 flex-col items-center gap-1.5">
                <div className="relative flex h-24 w-full items-end overflow-hidden rounded-md bg-surface-hover">
                  <div
                    className="w-full rounded-md transition-all"
                    style={{ height: `${Math.max(pct, 3)}%`, background: accent }}
                    title={`${b.label}: ${b.value}`}
                  />
                </div>
                <span className="max-w-full truncate text-[10px] font-semibold text-text-muted">{b.label}</span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
