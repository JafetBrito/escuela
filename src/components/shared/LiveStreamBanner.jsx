import { Link } from 'react-router-dom'
import { useVrStreamStore } from '../../stores/useVrStreamStore'

// Aviso de que hay una transmisión en vivo (ver useVrStreamStore). Desaparece
// solo cuando un admin la apaga. `compact`: versión en una línea.
export default function LiveStreamBanner() {
  const live = useVrStreamStore((s) => !!s.embedUrl)
  if (!live) return null

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-red-500/40 bg-gradient-to-r from-red-600 to-rose-600 px-5 py-4 shadow-lg">
      <div className="flex items-center gap-3">
        <span className="h-3 w-3 animate-pulse rounded-full bg-white" />
        <div>
          <p className="text-lg font-black text-white">🔴 Transmisión en vivo</p>
          <p className="text-xs font-medium text-white/85">Se está transmitiendo ahora mismo. Únete desde donde prefieras.</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <a href="/vr" className="rounded-lg bg-white px-4 py-2 text-sm font-black text-red-700 hover:opacity-90">🕶️ Ir al campus</a>
        <Link to="/clase-online" className="rounded-lg bg-white/20 px-4 py-2 text-sm font-bold text-white hover:bg-white/30">📺 Verla aquí</Link>
        <Link to="/clases-disponibles" className="rounded-lg bg-white/20 px-4 py-2 text-sm font-bold text-white hover:bg-white/30">👥 Ver con amigos</Link>
      </div>
    </div>
  )
}
