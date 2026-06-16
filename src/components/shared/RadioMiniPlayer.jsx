import { useEffect, useRef, useState } from 'react'
import { useItemEffectsStore } from '../../stores/useItemEffectsStore'
import { getShopItemById } from '../../data/shopRegistry'
import { useDraggablePopup } from '../../hooks/useDraggablePopup'

export default function RadioMiniPlayer() {
  const item = getShopItemById('radio')
  const toggleItem = useItemEffectsStore((s) => s.toggleItem)
  const audioRef = useRef(null)
  
  const [playing, setPlaying] = useState(true)
  const [expanded, setExpanded] = useState(true)
  
  // NUEVO: Estado para saber qué canción de la lista está sonando (empezamos en la 0)
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0)

  const { elRef, style, onPointerDown } = useDraggablePopup('radio')

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    if (playing) {
      audio.play().catch(() => {})
    } else {
      audio.pause()
    }
  }, [playing, currentTrackIndex]) // Agregamos currentTrackIndex a las dependencias

  if (!item || !item.playlist || item.playlist.length === 0) return null

  // NUEVO: Función que se ejecuta cuando una canción termina
  const handleTrackEnded = () => {
    // Pasamos a la siguiente canción. Si es la última, volvemos a la primera (índice 0)
    setCurrentTrackIndex((prevIndex) => (prevIndex + 1) % item.playlist.length)
  }

  // NUEVO: Función opcional para saltar de canción manualmente
  const handleNextTrack = () => {
    setCurrentTrackIndex((prevIndex) => (prevIndex + 1) % item.playlist.length)
    setPlaying(true)
  }

  return (
    <>
      {/* Estilos inyectados directamente para no romper nada en tu proyecto */}
      <style>{`
        @keyframes spectrumBarWave {
          0%, 100% { transform: scaleY(0.4); opacity: 0.8; }
          50% { transform: scaleY(1); opacity: 1; }
        }
        .spectrum-bar {
          display: inline-block;
          width: 4px;
          height: 18px;
          border-radius: 2px;
          transform-origin: bottom;
          animation: spectrumBarWave 0.9s ease-in-out infinite;
        }
        .spectrum-bar:nth-child(1) { animation-delay: 0.0s; background-color: #00f7ff; }
        .spectrum-bar:nth-child(2) { animation-delay: 0.15s; background-color: #3bff30; }
        .spectrum-bar:nth-child(3) { animation-delay: 0.3s; background-color: #ffef00; }
        .spectrum-bar:nth-child(4) { animation-delay: 0.1s; background-color: #ff00ff; }
        .spectrum-bar:nth-child(5) { animation-delay: 0.25s; background-color: #ff00ff; }

        @keyframes miniEyeBounce {
          0%, 100% { transform: scaleY(0.6) translateY(0px); opacity: 0.6; }
          50% { transform: scaleY(1) translateY(1.5px); opacity: 1; }
        }
        .mini-cat-eye {
          display: inline-block;
          width: 3.5px;
          height: 12px;
          border-radius: 2px;
          transform-origin: bottom;
          animation: miniEyeBounce 0.7s ease-in-out infinite;
        }
        .mini-cat-eye:nth-child(1) { animation-delay: 0.0s; background-color: #00f7ff; }
        .mini-cat-eye:nth-child(2) { animation-delay: 0.2s; background-color: #3bff30; }

        /* Efecto neón para la silueta del gato */
        .cat-neon-bg {
          filter: drop-shadow(0 0 7px rgba(0, 247, 255, 0.7)) drop-shadow(0 0 16px rgba(59, 255, 48, 0.5));
        }
      `}</style>

      <div ref={elRef} className="fixed bottom-4 right-4 z-40 sm:bottom-6 sm:right-6" style={style}>
        {/* CAMBIOS AQUÍ:
          1. src ahora apunta al índice actual de la playlist
          2. Quitamos "loop" para que la canción sí termine
          3. Agregamos onEnded={handleTrackEnded}
        */}
        <audio 
          ref={audioRef} 
          src={item.playlist[currentTrackIndex]} 
          onEnded={handleTrackEnded} 
          autoPlay 
        />

        {expanded ? (
          /* NUEVO: Contenedor 'relative' para posicionar el gato detrás del reproductor */
          <div className="relative flex justify-center items-center">
            
            {/* EL GATO (Fondo) - SVG con borde degradado y relleno oscuro para fusionarse con la interfaz. Escalado y nítido. */}
            <div className="absolute bottom-[2px] left-1/2 -translate-x-1/2 w-[160px] h-[190px] pointer-events-none -z-10 cat-neon-bg opacity-90 transition-opacity">
              <svg viewBox="0 0 24 24" fill="#1e1e2f" stroke="url(#catGrad)" strokeWidth="0.6" strokeLinejoin="round" strokeLinecap="round" className="w-full h-full">
                <defs>
                  <linearGradient id="catGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#00f7ff" />
                    <stop offset="50%" stopColor="#3bff30" />
                    <stop offset="100%" stopColor="#ff00ff" />
                  </linearGradient>
                </defs>
                {/* Silueta de gato limpio, simétrico y elegante */}
                <path d="M12 5c.67 0 1.35.09 2 .26 1.78-2 5.03-2.84 6.42-2.26 1.4.58-.42 7-.42 7 .57 1.07 1 2.24 1 3.44C21 17.9 16.97 21 12 21s-9-3-9-7.56c0-1.25.5-2.4 1.1-3.44 0 0-1.89-6.42-.5-7 1.1-.43 4.4 1.1 6.1 2.51-.55-.17-1.12-.26-1.7-.26Z" />
              </svg>
            </div>

            {/* CONTROLES DEL REPRODUCTOR (Frente) - Añadido 'relative z-10' para asegurar que quede por encima */}
            <div className="relative z-10 flex items-center gap-3 rounded-2xl border border-primary/40 bg-surface px-4 py-3 shadow-lg backdrop-blur-sm">
              <button
                onPointerDown={onPointerDown}
                className="flex h-9 w-6 cursor-grab items-center justify-center text-text-muted active:cursor-grabbing"
                style={{ touchAction: 'none' }}
                aria-label="Mover reproductor"
                title="Arrastrar para mover"
              >
                ⠿
              </button>
              
              {/* Contenedor del icono con ojos que rebotan. Ajustado para ser sutil. */}
              <div className="relative flex items-center gap-1.5">
                <span className="text-2xl">{item.icon}</span>
                {playing && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none gap-2 scale-50 -translate-y-[1.5px]">
                    <span className="mini-cat-eye"></span>
                    <span className="mini-cat-eye"></span>
                  </div>
                )}
              </div>

              <div className="flex flex-col min-w-[120px]">
                <p className="text-sm font-semibold text-text">{item.name}</p>
                
                {/* Contenedor del texto de estado y el analizador de espectro de barras de colores nítidas */}
                <div className="flex items-center gap-2 h-4 mt-0.5">
                  <p className="text-xs text-text-muted leading-none">
                    {playing ? `▶ Pista ${currentTrackIndex + 1}` : '⏸ Pausado'}
                  </p>
                  {/* Analizador de espectro animado de barras de colores nítidas (solo aparece si está sonando) */}
                  {playing && (
                    <div className="flex items-end gap-[1.5px] h-full">
                      <span className="spectrum-bar"></span>
                      <span className="spectrum-bar"></span>
                      <span className="spectrum-bar"></span>
                      <span className="spectrum-bar"></span>
                      <span className="spectrum-bar"></span>
                    </div>
                  )}
                </div>
              </div>
              
              <button
                onClick={() => setPlaying((p) => !p)}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-primary text-primary transition-colors hover:bg-primary/10"
                aria-label={playing ? 'Pausar radio' : 'Reproducir radio'}
                title={playing ? 'Pausar' : 'Reproducir'}
              >
                {playing ? '⏸' : '▶'}
              </button>

              {/* NUEVO: Botón para saltar a la siguiente canción (opcional, pero útil) */}
              <button
                onClick={handleNextTrack}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-primary text-primary transition-colors hover:bg-primary/10"
                title="Siguiente canción"
              >
                ⏭
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
    </>
  )
}