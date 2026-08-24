// Envuelve la tarjeta/fila de una clase para que, al pasar el mouse, aparezca
// un popup con más información — pedido para el "camino" de
// CourseRoadmapPage.jsx pero pensado como sistema general (también se usa en
// ModuleList.jsx, el panel deslizable de clases). Puramente CSS
// (group-hover), sin estado ni JS: más simple y sin lidiar con posición de
// portal/z-index dinámico. En móvil no hay hover real, así que el popup
// simplemente no aparece — el tap para entrar sigue funcionando igual.
//
// `side`: 'right' (por defecto, para filas verticales angostas como
// ModuleList) o 'top' (para tarjetas anchas como ModuleNode, donde un popup
// a la derecha se saldría de la pantalla).
export default function ModuleHoverCard({ module: mod, accent = '#7c3aed', side = 'right', className = '', children }) {
  const hasVideo = Boolean(mod.videoId || mod.videoSrc)
  const hasActivity = Boolean(mod.quiz || mod.terminalSim || mod.trackSelector || mod.trackContent || mod.phishingGame)
  const badges = [
    hasVideo && { icon: '🎬', label: 'Video' },
    mod.content && { icon: '📖', label: 'Lección' },
    hasActivity && { icon: '🧩', label: 'Actividad' },
  ].filter(Boolean)

  const positionCls = side === 'top'
    ? 'bottom-full left-1/2 mb-3 -translate-x-1/2'
    : 'left-full top-1/2 ml-3 -translate-y-1/2'

  return (
    <div className={`group/hovercard relative ${className}`}>
      {children}
      <div
        className={`pointer-events-none absolute z-30 w-64 rounded-2xl border bg-surface p-4 opacity-0 shadow-2xl transition-all duration-150 group-hover/hovercard:opacity-100 ${positionCls} ${side === 'top' ? 'translate-y-1 group-hover/hovercard:translate-y-0' : ''}`}
        style={{ borderColor: `${accent}55` }}
      >
        <p className="text-sm font-black text-text">{mod.title}</p>
        {mod.description && (
          <p className="mt-1.5 text-xs leading-relaxed text-text-muted">{mod.description}</p>
        )}
        {badges.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {badges.map((b) => (
              <span
                key={b.label}
                className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold"
                style={{ background: `${accent}1a`, color: accent }}
              >
                {b.icon} {b.label}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
