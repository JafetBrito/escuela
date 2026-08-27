import { Link } from 'react-router-dom'

// Resumen de avance para el Dashboard — a propósito SIN un total fijo tipo
// "3 de 41 materias" (el catálogo de Oliver Academy no es un plan de
// estudios cerrado, así que ese número sería inventado). Solo muestra
// conteos reales y enlaza a /progreso para el detalle por área.
export default function TrajectorySummaryCard({ completedCount, inProgressCount }) {
  const denom = completedCount + inProgressCount
  const pct = denom > 0 ? Math.round((completedCount / denom) * 100) : 0
  return (
    <div className="rounded-2xl border border-border bg-surface p-4">
      <p className="text-xs font-bold uppercase tracking-wide text-text-muted">📊 Mi trayectoria</p>
      {denom > 0 ? (
        <>
          <div className="mt-2 flex items-center gap-4 text-sm">
            <span className="font-bold text-emerald-400">✅ {completedCount} completados</span>
            <span className="font-bold text-primary">📘 {inProgressCount} en progreso</span>
          </div>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-surface-hover">
            <div className="h-full rounded-full bg-emerald-400 transition-all" style={{ width: `${pct}%` }} />
          </div>
        </>
      ) : (
        <p className="mt-2 text-sm text-text-muted">Aún no empiezas ningún curso.</p>
      )}
      <Link to="/progreso" className="mt-3 inline-block text-xs font-semibold text-primary hover:underline">
        Ver mi progreso completo →
      </Link>
    </div>
  )
}
