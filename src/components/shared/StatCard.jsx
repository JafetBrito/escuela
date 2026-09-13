// Tarjeta de estadística simple — ícono + número + etiqueta. Mismo patrón
// que ya se repetía escrito a mano en AdminDashboardPage.jsx/
// AdminTasksPage.jsx/DashboardPage.jsx; se extrae aquí para no seguir
// copiándolo cada vez que una página nueva necesita su fila de stats.
export default function StatCard({ icon, value, label, accent }) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-4">
      <p className={`text-2xl font-black ${accent ?? 'text-text'}`}>{icon} {value}</p>
      <p className="text-xs text-text-muted">{label}</p>
    </div>
  )
}
