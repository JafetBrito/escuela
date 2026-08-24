// Barra de progreso por región (escuela/categoría) — extraída de
// ProgressPage.jsx para reusarla también en el Dashboard.
export default function RegionBar({ region }) {
  const pct = region.total > 0 ? Math.round(((region.completed + region.inProgress * 0.5) / region.total) * 100) : 0
  return (
    <div className="flex items-center gap-3">
      <span className="w-32 shrink-0 truncate text-xs font-semibold text-text">{region.icon} {region.title}</span>
      <div className="h-2.5 flex-1 rounded-full bg-surface-hover">
        <div className="h-2.5 rounded-full transition-all" style={{ width: `${pct}%`, background: region.accent }} />
      </div>
      <span className="w-9 shrink-0 text-right text-[11px] tabular-nums text-text-muted">{pct}%</span>
    </div>
  )
}
