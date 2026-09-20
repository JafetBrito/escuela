import { useRef, useState } from 'react'
import { useVrStreamStore } from '../../stores/useVrStreamStore'

// Controles de la transmisión en vivo (ver useVrStreamStore). La misma
// transmisión se puede ver en 4 modos, y solo uno a la vez tiene el video
// montado (así nunca se duplica el audio):
//   'screen' → en la pantalla gigante de la plaza (CampusVideoScreen)
//   'mini'   → ventana flotante y movible mientras caminas por el campus
//   'full'   → pantalla completa
//   'hidden' → no la veo (sin video ni audio); el botón "En vivo" la trae de vuelta
const IFRAME_ALLOW = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'

function Btn({ onClick, children, title }) {
  return (
    <button type="button" onClick={onClick} title={title} className="rounded-md bg-black/50 px-2 py-1 text-xs font-bold text-white hover:bg-black/80">
      {children}
    </button>
  )
}

export default function StreamHud() {
  const url = useVrStreamStore((s) => s.embedUrl)
  const mode = useVrStreamStore((s) => s.viewMode)
  const setMode = useVrStreamStore((s) => s.setViewMode)
  const [pos, setPos] = useState({ x: null, y: null }) // null = esquina por defecto
  const dragRef = useRef(null)

  if (!url) return null

  // Arrastrar la mini pantalla desde su barra superior
  const onDown = (e) => {
    const box = e.currentTarget.parentElement.getBoundingClientRect()
    dragRef.current = { dx: e.clientX - box.left, dy: e.clientY - box.top }
    e.currentTarget.setPointerCapture(e.pointerId)
  }
  const onMove = (e) => {
    if (!dragRef.current) return
    setPos({
      x: Math.min(Math.max(0, e.clientX - dragRef.current.dx), window.innerWidth - 120),
      y: Math.min(Math.max(0, e.clientY - dragRef.current.dy), window.innerHeight - 60),
    })
  }
  const onUp = () => { dragRef.current = null }

  if (mode === 'full') {
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90">
        <div className="absolute left-3 top-3 z-10 flex gap-2">
          <Btn onClick={() => setMode('mini')} title="Seguir viéndola en una ventana pequeña">🗕 Mini pantalla</Btn>
          <Btn onClick={() => setMode('screen')} title="Volver a la pantalla del campus">↩ Pantalla del campus</Btn>
          <Btn onClick={() => setMode('hidden')} title="Dejar de verla">✕ Ocultar</Btn>
        </div>
        <div className="aspect-video w-full max-w-[95vw] max-h-[90vh]">
          <iframe src={url} title="Transmisión en vivo" allow={IFRAME_ALLOW} allowFullScreen className="h-full w-full border-0" />
        </div>
      </div>
    )
  }

  if (mode === 'mini') {
    const style = pos.x === null ? { right: 16, bottom: 96 } : { left: pos.x, top: pos.y }
    return (
      <div className="fixed z-[55] w-72 overflow-hidden rounded-xl border border-red-500/60 bg-black shadow-2xl sm:w-96" style={style}>
        <div
          className="flex cursor-move touch-none items-center justify-between gap-2 bg-red-700/90 px-2 py-1"
          onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp}
        >
          <span className="text-[11px] font-black text-white">🔴 EN VIVO</span>
          <div className="flex gap-1" onPointerDown={(e) => e.stopPropagation()}>
            <Btn onClick={() => setMode('full')} title="Pantalla completa">⛶</Btn>
            <Btn onClick={() => setMode('screen')} title="Volver a la pantalla del campus">↩</Btn>
            <Btn onClick={() => setMode('hidden')} title="Ocultar">✕</Btn>
          </div>
        </div>
        <div className="aspect-video w-full">
          <iframe src={url} title="Transmisión en vivo" allow={IFRAME_ALLOW} allowFullScreen className="h-full w-full border-0" />
        </div>
      </div>
    )
  }

  // 'screen' o 'hidden': botón para elegir cómo verla
  return (
    <div className="absolute left-1/2 top-16 z-30 flex -translate-x-1/2 items-center gap-2 rounded-full border border-red-400/60 bg-red-600/90 px-3 py-1.5 text-sm font-black text-white shadow-lg">
      <span className="animate-pulse">🔴 En vivo</span>
      {mode === 'hidden' && <Btn onClick={() => setMode('screen')} title="Verla en la pantalla del campus">Ver en pantalla</Btn>}
      <Btn onClick={() => setMode('mini')} title="Mini pantalla: sigue caminando mientras la ves">🗕 Mini</Btn>
      <Btn onClick={() => setMode('full')} title="Pantalla completa">⛶ Completa</Btn>
    </div>
  )
}
