import { useState } from 'react'

// Simple image slideshow for the video slot — used by lessons that ship a
// few reference images instead of (or alongside) a video, e.g. screenshots
// illustrating a concept like "alucinaciones".
export default function ModuleSlideshow({ images = [], className = '', aspectClassName = 'aspect-video' }) {
  const [index, setIndex] = useState(0)

  if (!images.length) {
    return (
      <div className={`flex aspect-video flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-surface text-center ${className}`}>
        <span className="text-3xl">🖼️</span>
        <p className="text-sm font-semibold text-text-muted">Próximamente: las imágenes de esta clase</p>
      </div>
    )
  }

  const slide = images[index]
  const src = typeof slide === 'string' ? slide : slide.src
  const caption = typeof slide === 'string' ? null : slide.caption

  const go = (delta) => setIndex((i) => (i + delta + images.length) % images.length)

  return (
    <div className={`relative overflow-hidden rounded-xl border border-border bg-black ${className}`}>
      <div className={`w-full ${aspectClassName}`}>
        <img src={src} alt={caption ?? `Diapositiva ${index + 1}`} className="h-full w-full object-contain" />
      </div>

      {images.length > 1 && (
        <>
          <button
            onClick={() => go(-1)}
            aria-label="Anterior"
            className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 px-3 py-2 text-lg text-white hover:bg-black/70"
          >
            ‹
          </button>
          <button
            onClick={() => go(1)}
            aria-label="Siguiente"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 px-3 py-2 text-lg text-white hover:bg-black/70"
          >
            ›
          </button>
          <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1.5">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                aria-label={`Ir a diapositiva ${i + 1}`}
                className="h-2 w-2 rounded-full"
                style={{ background: i === index ? 'white' : 'rgba(255,255,255,0.4)' }}
              />
            ))}
          </div>
        </>
      )}

      {caption && (
        <p className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-4 pb-7 pt-6 text-center text-sm text-white/90">
          {caption}
        </p>
      )}
    </div>
  )
}
