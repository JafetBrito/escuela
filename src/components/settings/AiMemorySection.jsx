import { useState } from 'react'
import { useMascotMemoryStore } from '../../stores/useMascotMemoryStore'

// "Memoria a largo plazo": hechos puntuales que el estudiante pide
// recordar, distintos del historial crudo de chat. Viven en la tabla
// mascot_memories (mismo patrón de RLS que ai_credentials).
export default function AiMemorySection() {
  const memories = useMascotMemoryStore((s) => s.memories)
  const [text, setText] = useState('')
  const [saving, setSaving] = useState(false)

  const handleAdd = async () => {
    if (!text.trim()) return
    setSaving(true)
    try {
      await useMascotMemoryStore.getState().addMemory(text)
      setText('')
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-5">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-text-muted">🧩 Memoria a largo plazo</p>
        <p className="mt-1 text-sm text-text-muted">
          Hechos que quieres que tu mascota recuerde siempre, sin tener que repetirlos en cada
          conversación (ej. "estoy estudiando para un examen de matemáticas el próximo mes").
        </p>
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          placeholder="Algo que tu mascota debería recordar…"
          className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-text outline-none focus:border-primary"
        />
        <button
          type="button"
          onClick={handleAdd}
          disabled={!text.trim() || saving}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-background disabled:opacity-50"
        >
          Guardar
        </button>
      </div>

      {memories.length === 0 ? (
        <p className="text-sm text-text-muted">Sin recuerdos guardados todavía.</p>
      ) : (
        <div className="flex flex-col gap-1.5">
          {memories.map((m) => (
            <div key={m.id} className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2">
              <p className="flex-1 text-sm text-text">{m.content}</p>
              <button
                type="button"
                onClick={() => useMascotMemoryStore.getState().removeMemory(m.id)}
                className="text-xs text-text-muted hover:text-danger"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
