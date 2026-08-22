import { useState } from 'react'
import { useProgressStore } from '../../stores/useProgressStore'

// Simulador de terminal embebido en una clase (no un modal — vive dentro
// del contenido, como el quiz). Mismo look & feel que BashTerminalModal.jsx
// (VR), pero:
//   - `validate` es un STRING de regex + `flags`, no una función — el
//     contenido del curso vive en Supabase como jsonb (courses.modules),
//     y una función no es serializable. new RegExp(pattern, flags) se
//     arma en el navegador, en cada render del checkpoint actual.
//   - Vive inline en la clase, no en un popup — se pensó para cursos, no
//     para un paso de misión de VR.
// `module.terminalSim = { title?, intro?, checkpoints: [{ instruction,
//   placeholder, pattern, flags?, hint, success }] }` — todo el texto ahí
// (instruction/placeholder/hint/success) pasa por el mismo mergeModule de
// courseTranslations.js que ya traduce quiz/exercises, así que agregar un
// idioma nuevo es agregar esas mismas llaves en `course.translations[lang]`.
export default function GitTerminalSim({ courseId, module, className = '' }) {
  const sim = module.terminalSim
  const isCompleted = useProgressStore((s) => s.isMissionDone(courseId, module.id, 'terminal'))
  const completeMission = useProgressStore((s) => s.completeMission)

  const [stepIndex, setStepIndex] = useState(0)
  const [input, setInput] = useState('')
  const [history, setHistory] = useState([])
  const [hint, setHint] = useState(null)

  if (!sim) return null

  if (isCompleted) {
    return (
      <div className={`rounded-xl border border-emerald-500/30 bg-black/90 px-4 py-3 font-mono text-sm text-emerald-400 ${className}`}>
        ✅ Ya completaste el simulador de esta clase.
      </div>
    )
  }

  const checkpoint = sim.checkpoints[stepIndex]
  const isLast = stepIndex === sim.checkpoints.length - 1

  const handleRun = () => {
    if (!input.trim()) return
    let matches
    try {
      matches = new RegExp(checkpoint.pattern, checkpoint.flags ?? 'i').test(input.trim())
    } catch {
      matches = false
    }
    if (!matches) {
      setHint(checkpoint.hint)
      return
    }
    setHistory((cur) => [...cur, { input, success: checkpoint.success }])
    setHint(null)
    setInput('')
    if (isLast) {
      completeMission(courseId, module.id, 'terminal')
    } else {
      setStepIndex((i) => i + 1)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleRun()
    }
  }

  return (
    <div className={`overflow-hidden rounded-xl border border-emerald-500/40 bg-black/95 font-mono text-sm text-emerald-400 shadow-lg ${className}`}>
      <div className="flex items-center justify-between border-b border-emerald-500/30 px-4 py-2">
        <span className="font-semibold">⌨️ {sim.title ?? 'Simulador de terminal'}</span>
        <span className="text-[10px] text-emerald-700">Paso {stepIndex + 1}/{sim.checkpoints.length}</span>
      </div>

      <div className="space-y-3 px-4 py-4">
        {sim.intro && history.length === 0 && (
          <p className="text-emerald-300/70">{sim.intro}</p>
        )}

        {history.map((h, i) => (
          <div key={i} className="space-y-1">
            <p className="text-emerald-400/60">$ {h.input}</p>
            <p className="text-emerald-300">✅ {h.success}</p>
          </div>
        ))}

        <p className="whitespace-pre-line text-emerald-300">{checkpoint.instruction}</p>

        <div className="flex items-center gap-2 rounded border border-emerald-500/30 bg-[#001a08] px-3 py-2">
          <span className="text-emerald-600">$</span>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={checkpoint.placeholder}
            spellCheck={false}
            autoCapitalize="off"
            // text-base, no text-xs: <16px dispara auto-zoom al enfocar en
            // móvil (ver mismo fix en ChatPanel.jsx).
            className="flex-1 bg-transparent text-base text-emerald-400 outline-none placeholder:text-emerald-800"
          />
        </div>

        {hint && <p className="text-amber-400">💡 {hint}</p>}
      </div>

      <div className="border-t border-emerald-500/30 px-4 py-3">
        <button
          type="button"
          onClick={handleRun}
          className="w-full rounded-lg bg-emerald-600 py-2 text-sm font-bold text-black transition active:scale-95 hover:bg-emerald-500"
        >
          ▶ Ejecutar
        </button>
      </div>
    </div>
  )
}
