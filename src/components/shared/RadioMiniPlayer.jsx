import { useEffect, useRef, useState } from 'react'
import { useItemEffectsStore } from '../../stores/useItemEffectsStore'
import { getShopItemById } from '../../data/shopRegistry'
import { useDraggablePopup } from '../../hooks/useDraggablePopup'

// Floating mini-player for the "Radio de OLIVER SCHOOL" objeto. Stays mounted
// and keeps playing across routes (mascota, tienda, dentro de un curso, etc.)
// while the objeto is activated, so the user can keep listening while taking
// classes. Can be collapsed to a small pill or expanded into a mini-player
// with play/pause and a close (deactivate) button.
export default function RadioMiniPlayer() {
  const item = getShopItemById('radio')
  const toggleItem = useItemEffectsStore((s) => s.toggleItem)
  const audioRef = useRef(null)
  const [playing, setPlaying] = useState(true)
  const [expanded, setExpanded] = useState(true)
  const { elRef, style, onPointerDown } = useDraggablePopup('radio')

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    if (playing) {
      audio.play().catch(() => {})
    } else {
      audio.pause()
    }
  }, [playing])

  if (!item) return null

  return (
    <div ref={elRef} className="fixed bottom-4 right-4 z-40 sm:bottom-6 sm:right-6" style={style}>
      <audio ref={audioRef} src={item.audioSrc} loop autoPlay />

      {expanded ? (
        <div className="flex items-center gap-3 rounded-2xl border border-primary/40 bg-surface px-4 py-3 shadow-lg backdrop-blur-sm">
          <button
            onPointerDown={onPointerDown}
            className="flex h-9 w-6 cursor-grab items-center justify-center text-text-muted active:cursor-grabbing"
            style={{ touchAction: 'none' }}
            aria-label="Mover reproductor"
            title="Arrastrar para mover"
          >
            ⠿
          </button>
          <span className="text-2xl">{item.icon}</span>
          <div className="flex flex-col">
            <p className="text-sm font-semibold text-text">{item.name}</p>
            <p className="text-xs text-text-muted">
              {playing ? '▶ Sonando…' : '⏸ Pausado'}
            </p>
          </div>
          <button
            onClick={() => setPlaying((p) => !p)}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-primary text-primary transition-colors hover:bg-primary/10"
            aria-label={playing ? 'Pausar radio' : 'Reproducir radio'}
            title={playing ? 'Pausar' : 'Reproducir'}
          >
            {playing ? '⏸' : '▶'}
          </button>
          <button
            onClick={() => setExpanded(false)}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-text-muted transition-colors hover:border-primary/40 hover:text-text"
            aria-label="Minimizar reproductor"
            title="Minimizar"
          >
            ─
          </button>
          <button
            onClick={() => toggleItem('radio')}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-text-muted transition-colors hover:border-danger hover:text-danger"
            aria-label="Apagar radio"
            title="Apagar radio"
          >
            ✕
          </button>
        </div>
      ) : (
        <button
          onClick={() => setExpanded(true)}
          onPointerDown={onPointerDown}
          style={{ touchAction: 'none' }}
          className="flex h-12 w-12 cursor-grab items-center justify-center rounded-full border-2 border-primary bg-surface text-2xl shadow-lg transition-transform active:cursor-grabbing hover:scale-105"
          aria-label="Abrir reproductor de radio"
          title="Abrir reproductor de radio (arrastra para mover)"
        >
          {item.icon}
        </button>
      )}
    </div>
  )
}
