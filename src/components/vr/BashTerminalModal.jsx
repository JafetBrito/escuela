import { useState } from 'react'

// Free-text terminal exercise opened from a quest step of type 'terminal'
// (see questsRegistry.js). Unlike <TerminalModal> (multiple-choice bug
// puzzles, class-gated), this takes typed Bash and validates it against a
// pattern per checkpoint — BashMishi narrates progress/hints in character.
// Pure pattern-matching, no real shell execution: this is a guided typing
// exercise, not a sandboxed interpreter.
export default function BashTerminalModal({ checkpoints, onComplete, onClose }) {
  const [stepIndex, setStepIndex] = useState(0)
  const [input, setInput] = useState('')
  const [history, setHistory] = useState([])
  const [hint, setHint] = useState(null)

  const checkpoint = checkpoints[stepIndex]
  const isLast = stepIndex === checkpoints.length - 1

  const handleRun = () => {
    if (!input.trim()) return
    if (!checkpoint.validate(input)) {
      setHint(checkpoint.hint)
      return
    }
    setHistory((cur) => [...cur, { input, success: checkpoint.success }])
    setHint(null)
    setInput('')
    if (isLast) {
      onComplete()
    } else {
      setStepIndex((i) => i + 1)
    }
  }

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/70 p-4">
      <div className="flex max-h-[85vh] w-full max-w-lg flex-col rounded-xl border border-emerald-500/40 bg-black/95 font-mono text-sm text-emerald-400 shadow-2xl">
        <div className="flex items-center justify-between border-b border-emerald-500/30 px-4 py-2">
          <span className="font-semibold">🐈‍⬛ Terminal de BashMishi</span>
          <button type="button" onClick={onClose} className="text-text-muted hover:text-emerald-400">✕</button>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
          {history.map((h, i) => (
            <div key={i} className="space-y-1">
              <p className="text-emerald-400/60">$ {h.input}</p>
              <p className="text-emerald-300">🐾 BashMishi: {h.success}</p>
            </div>
          ))}

          <p className="whitespace-pre-line text-emerald-300">
            🐾 BashMishi: {checkpoint.instruction}
          </p>

          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={checkpoint.placeholder}
            rows={checkpoint.placeholder.includes('\n') ? 2 : 1}
            className="w-full resize-none rounded border border-emerald-500/30 bg-[#001a08] px-3 py-2 text-xs text-emerald-400 placeholder:text-emerald-700 focus:border-emerald-500 focus:outline-none"
          />

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
          <p className="mt-2 text-center text-[10px] text-emerald-700">
            Paso {stepIndex + 1} de {checkpoints.length}
          </p>
        </div>
      </div>
    </div>
  )
}
