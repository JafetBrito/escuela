import { useState, useEffect } from 'react'

// "Registros" / Códice / Audio-Logs: el guion y notas de la clase para leer y
// escuchar al propio ritmo. Diseño tipo terminal antigua; el botón Play usa
// Text-to-Speech y la interfaz dice que es Oliver (el gato) quien narra las
// notas del sistema para el jugador — justificando el lector de forma orgánica.
export default function CodicePanel({ module }) {
  const [speaking, setSpeaking] = useState(false)
  const text = module?.description ?? ''

  // Detén la narración si el panel se desmonta o cambia de módulo.
  useEffect(() => {
    return () => { try { window.speechSynthesis?.cancel() } catch { /* ignore */ } }
  }, [module?.id])

  const toggleNarration = () => {
    const synth = window.speechSynthesis
    if (!synth) return
    if (speaking) {
      synth.cancel()
      setSpeaking(false)
      return
    }
    synth.cancel()
    // Quita el markdown básico (**, backticks) para que la voz no lo lea.
    const clean = text.replace(/[*`_#]/g, '')
    const u = new SpeechSynthesisUtterance(clean)
    u.lang = 'es-ES'
    u.rate = 0.98
    u.onend = () => setSpeaking(false)
    u.onerror = () => setSpeaking(false)
    setSpeaking(true)
    synth.speak(u)
  }

  if (!module) {
    return <p className="text-sm text-text-muted">Selecciona una clase para leer sus registros.</p>
  }

  return (
    <div className="flex h-full flex-col gap-3">
      {/* Encabezado: Oliver, narrador del sistema */}
      <div className="flex items-center justify-between gap-3 rounded-xl border border-primary/25 bg-primary/5 px-3 py-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-2xl">🐱</span>
          <div className="min-w-0">
            <p className="text-xs font-black text-primary">Registros del Sistema</p>
            <p className="truncate text-[10px] text-text-muted">Oliver narra: {module.title}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={toggleNarration}
          className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
            speaking ? 'bg-rose-600 text-white hover:bg-rose-500' : 'bg-primary text-background hover:bg-primary-hover'
          }`}
        >
          {speaking ? '⏹ Detener' : '▶ Escuchar'}
        </button>
      </div>

      {/* Registro estilo terminal antigua / pergamino digital */}
      <div className="flex-1 overflow-y-auto rounded-xl border border-emerald-500/25 bg-black/80 p-4 font-mono text-sm leading-relaxed text-emerald-300 shadow-inner">
        <p className="mb-2 text-[10px] uppercase tracking-widest text-emerald-500/60">
          &gt; registro cargado — clase {module.order ?? ''}
        </p>
        <p className="whitespace-pre-wrap">{text.replace(/[*`]/g, '')}</p>
        <span className="mt-1 inline-block h-4 w-2 animate-pulse bg-emerald-400 align-middle" />
      </div>
    </div>
  )
}
