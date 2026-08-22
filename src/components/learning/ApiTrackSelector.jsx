import { useState } from 'react'
import { getCourseTrack, setCourseTrack } from '../../utils/courseTrack'

// Selector de "aventura" reutilizable para cualquier curso futuro que quiera
// ramificarse según una elección del alumno (no solo APIs). Vive inline en
// la clase, como el quiz y GitTerminalSim.
// `module.trackSelector = { title?, intro?, options: [{ id, icon, label, tagline }] }`
// La elección se guarda con setCourseTrack(courseId, id) — cualquier módulo
// posterior con `trackContent` la lee para decidir qué variante mostrar.
export default function ApiTrackSelector({ courseId, module, className = '' }) {
  const sel = module.trackSelector
  const [track, setTrack] = useState(() => getCourseTrack(courseId, sel?.options?.[0]?.id))

  if (!sel) return null

  const choose = (id) => {
    setCourseTrack(courseId, id)
    setTrack(id)
  }

  return (
    <div className={`rounded-2xl border border-border bg-surface p-5 ${className}`}>
      <p className="mb-1 text-xs font-black uppercase tracking-widest text-text-muted">
        🧭 {sel.title ?? 'Elige tu aventura'}
      </p>
      {sel.intro && <p className="mb-4 text-sm text-text-muted">{sel.intro}</p>}

      <div className="grid gap-3 sm:grid-cols-3">
        {sel.options.map((opt) => (
          <button
            key={opt.id}
            type="button"
            onClick={() => choose(opt.id)}
            className={`flex flex-col items-start gap-2 rounded-xl border p-4 text-left transition-all
              ${track === opt.id ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/40'}`}
          >
            <span className="text-3xl">{opt.icon}</span>
            <span className="font-bold text-text">{opt.label}</span>
            <span className="text-xs text-text-muted">{opt.tagline}</span>
            {track === opt.id && <span className="mt-1 text-xs font-bold text-primary">✅ Elegida</span>}
          </button>
        ))}
      </div>

      <p className="mt-4 text-xs text-text-muted">
        Tu elección se guarda en este dispositivo. Todas las clases siguientes que digan
        "según tu API elegida" van a mostrar el ejemplo de{' '}
        <strong>{sel.options.find((o) => o.id === track)?.label}</strong>. Puedes volver aquí
        y cambiarla cuando quieras.
      </p>
    </div>
  )
}
