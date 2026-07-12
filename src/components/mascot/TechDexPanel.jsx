import { getTechDex } from '../../data/techDexRegistry'
import { getCourseData } from '../../data/courseRegistry'

// Tech-Dex / "Bestiario de Código". Cambia dinámicamente según el módulo:
//   - Módulo 1 (La Presentación): ficha técnica de la tecnología del curso.
//   - Módulo 2+: el "Movimiento Desbloqueado" (el comando/concepto de esa clase).
// Data-driven vía techDexRegistry.js; si el curso no tiene entrada, arma una
// ficha genérica desde la descripción del curso/módulo.
export default function TechDexPanel({ courseId, module }) {
  const dex = getTechDex(courseId)
  const course = courseId ? getCourseData(courseId) : null
  const isFirst = !module || (module.order ?? 1) <= 1
  const color = dex?.color ?? '#22c55e'

  if (!module && !course) {
    return <p className="text-sm text-text-muted">Selecciona una clase para ver su ficha.</p>
  }

  const name = dex?.name ?? course?.title ?? 'Tecnología'
  const type = dex?.type ?? 'Curso'
  const icon = dex?.icon ?? '📟'
  const move = dex?.moves?.[module?.id]

  return (
    <div className="flex flex-col gap-4 font-mono">
      {/* Cabecera tipo terminal */}
      <div className="rounded-xl border p-3" style={{ borderColor: `${color}44`, background: `${color}0c` }}>
        <div className="flex items-center gap-3">
          <span className="text-3xl">{icon}</span>
          <div className="min-w-0">
            <p className="text-lg font-black" style={{ color }}>{name}</p>
            <p className="text-[11px] uppercase tracking-widest text-text-muted">{type}</p>
          </div>
        </div>
      </div>

      {isFirst ? (
        // ── Ficha técnica (Clase 1) ──
        <>
          {dex?.stats && (
            <div>
              <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-text-muted">Estadísticas base</p>
              <div className="flex flex-col gap-1.5">
                {dex.stats.map((s) => (
                  <div key={s.label} className="flex items-center justify-between rounded-lg border border-border bg-background px-3 py-1.5 text-xs">
                    <span className="text-text-muted">{s.label}</span>
                    <span className="font-bold text-text">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {dex?.weaknesses && (
            <div>
              <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-text-muted">Debilidades</p>
              <div className="flex flex-wrap gap-1.5">
                {dex.weaknesses.map((w) => (
                  <span key={w} className="rounded-full border border-rose-500/30 bg-rose-500/10 px-2.5 py-0.5 text-[11px] text-rose-400">{w}</span>
                ))}
              </div>
            </div>
          )}

          <div>
            <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-text-muted">Descripción</p>
            <p className="rounded-xl border border-border bg-background p-3 text-xs leading-relaxed text-text-muted">
              {dex?.lore ?? course?.description ?? module?.description}
            </p>
          </div>
        </>
      ) : (
        // ── Movimiento desbloqueado (Clase 2+) ──
        <div className="rounded-2xl border-2 p-4 text-center" style={{ borderColor: `${color}66`, background: `${color}10` }}>
          <p className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color }}>✦ Movimiento desbloqueado ✦</p>
          <p className="my-2 text-2xl font-black text-text">{move?.name ?? module.title}</p>
          {move?.command && (
            <code className="inline-block rounded-lg bg-black/70 px-3 py-1.5 text-sm font-bold" style={{ color }}>
              $ {move.command}
            </code>
          )}
          <p className="mt-3 text-xs leading-relaxed text-text-muted">
            {move?.effect ?? module.description}
          </p>
        </div>
      )}
    </div>
  )
}
