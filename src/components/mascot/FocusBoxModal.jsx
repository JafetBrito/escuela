import { useState } from 'react'
import { useItemEffectsStore } from '../../stores/useItemEffectsStore'

// Placeholder content — the user will swap these images/texts for their own
// later. Just the slide structure (image + title + text) matters for now.
const SLIDES = [
  {
    image: null,
    title: 'Respira',
    text: 'Tómate 10 segundos para inhalar y exhalar antes de seguir con la clase.',
  },
  {
    image: null,
    title: 'Una sola cosa a la vez',
    text: 'Elige una sola tarea de las misiones de esta clase y dale toda tu atención.',
  },
  {
    image: null,
    title: 'Pequeños pasos',
    text: 'Si te sientes saturado, divide lo que sigue en pasos más pequeños.',
  },
  {
    image: null,
    title: 'Vuelve cuando quieras',
    text: 'Esta caja siempre está disponible en tus objetos. Ábrela cada vez que necesites una pausa.',
  },
]

export default function FocusBoxModal() {
  const toggleItem = useItemEffectsStore((s) => s.toggleItem)
  const [index, setIndex] = useState(0)
  const slide = SLIDES[index]

  const close = () => toggleItem('caja-tdah')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="flex w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-border bg-surface">
        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <p className="text-base font-bold text-text">🧩 Caja del TDAH</p>
          <button onClick={close} className="text-text-muted hover:text-text" aria-label="Cerrar">
            ✕
          </button>
        </div>

        <div className="flex flex-col gap-4 p-6">
          <div className="flex aspect-video w-full items-center justify-center rounded-xl border border-dashed border-border bg-background text-5xl text-text-muted">
            {slide.image ? (
              <img src={slide.image} alt={slide.title} className="h-full w-full rounded-xl object-cover" />
            ) : (
              '🖼️'
            )}
          </div>
          <div>
            <h3 className="text-lg font-bold text-text">{slide.title}</h3>
            <p className="mt-1 text-sm text-text-muted">{slide.text}</p>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-border px-5 py-3">
          <button
            onClick={() => setIndex((i) => Math.max(0, i - 1))}
            disabled={index === 0}
            className="rounded-lg border border-border px-3 py-1.5 text-sm text-text disabled:opacity-40"
          >
            ← Anterior
          </button>
          <div className="flex gap-1.5">
            {SLIDES.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 w-6 rounded-full ${i === index ? 'bg-primary' : 'bg-surface-hover'}`}
              />
            ))}
          </div>
          {index === SLIDES.length - 1 ? (
            <button
              onClick={close}
              className="rounded-lg bg-primary px-3 py-1.5 text-sm font-semibold text-background hover:bg-primary-hover"
            >
              Listo
            </button>
          ) : (
            <button
              onClick={() => setIndex((i) => Math.min(SLIDES.length - 1, i + 1))}
              className="rounded-lg border border-border px-3 py-1.5 text-sm text-text"
            >
              Siguiente →
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
