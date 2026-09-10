import { useI18n } from '../../i18n'

// Sustituto honesto de "Hours spent" (gráfica de barras Lun-Dom) — esta app
// no mide tiempo de sesión, así que en vez de inventar horas se grafica algo
// real con la misma forma visual: % de avance por academia (mismas
// `regions` que ya usa WorldMapSection/ProgressPage), una barra por academia.
export default function CategoryActivityBarCard({ regions }) {
  const { t } = useI18n()
  const shown = regions.slice(0, 7)
  return (
    <div className="rounded-2xl border border-border bg-surface p-4">
      <p className="text-xs font-bold uppercase tracking-wide text-text-muted">{t('dashboard.summary.progressByAcademyTitle')}</p>
      <div className="mt-4 flex h-32 items-end gap-2.5">
        {shown.map((r) => {
          const pct = r.total > 0 ? Math.round(((r.completed + r.inProgress) / r.total) * 100) : 0
          return (
            <div key={r.key} className="flex flex-1 flex-col items-center gap-1.5">
              <div className="relative flex h-24 w-full items-end overflow-hidden rounded-md bg-surface-hover">
                <div
                  className="w-full rounded-md transition-all"
                  style={{ height: `${Math.max(pct, 3)}%`, background: r.accent }}
                  title={`${r.title}: ${pct}%`}
                />
              </div>
              <span className="text-sm leading-none">{r.icon}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
