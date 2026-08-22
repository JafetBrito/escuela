import { useState } from 'react'
import { useProgressStore } from '../../stores/useProgressStore'

// Mini-juego "¿cuál de estos 3 correos NO es phishing?" — vive inline en la
// clase, mismo patrón que ModuleQuiz.jsx/GitTerminalSim.jsx (no un modal).
// `module.phishingGame = { title?, intro?, emails: [{ id, sender, subject,
//   preview, isPhishing, explanation }] }` — exactamente un email con
// `isPhishing: false` (el legítimo), los otros dos con `isPhishing: true`.
export default function PhishingGame({ courseId, module, className = '' }) {
  const game = module.phishingGame
  const isCompleted = useProgressStore((s) => s.isMissionDone(courseId, module.id, 'phishing'))
  const completeMission = useProgressStore((s) => s.completeMission)

  const [selectedId, setSelectedId] = useState(null)
  const [checked, setChecked] = useState(isCompleted)

  if (!game) return null

  const selected = game.emails.find((e) => e.id === selectedId)
  const correctEmail = game.emails.find((e) => !e.isPhishing)
  const isCorrect = checked && selected && !selected.isPhishing

  const handleCheck = () => {
    if (!selectedId) return
    setChecked(true)
    if (selected && !selected.isPhishing) {
      completeMission(courseId, module.id, 'phishing')
    }
  }

  const handleRetry = () => {
    setSelectedId(null)
    setChecked(false)
  }

  return (
    <div className={`rounded-2xl border border-border bg-surface p-4 ${className}`}>
      <p className="mb-1 text-xs font-black uppercase tracking-widest text-text-muted">
        🎣 {game.title ?? 'Detector de Phishing'}
      </p>
      {game.intro && <p className="mb-4 text-sm text-text-muted">{game.intro}</p>}

      <div className="grid gap-3 sm:grid-cols-3">
        {game.emails.map((email) => {
          const isSelected = selectedId === email.id
          const revealBad = checked && email.isPhishing
          const revealGood = checked && !email.isPhishing
          return (
            <button
              key={email.id}
              type="button"
              onClick={() => !checked && setSelectedId(email.id)}
              disabled={checked}
              className={`flex flex-col gap-2 rounded-xl border p-4 text-left transition-all ${
                revealGood
                  ? 'border-emerald-500 bg-emerald-500/10'
                  : revealBad
                    ? 'border-red-500/60 bg-red-500/10'
                    : isSelected
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/40'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="truncate text-xs font-bold text-text">{email.sender}</span>
                {revealGood && <span className="shrink-0 text-sm">✅</span>}
                {revealBad && <span className="shrink-0 text-sm">🎣</span>}
              </div>
              <p className="text-sm font-semibold text-text">{email.subject}</p>
              <p className="text-xs leading-relaxed text-text-muted">{email.preview}</p>
              {checked && (
                <p className={`mt-1 text-[11px] leading-snug ${email.isPhishing ? 'text-red-400' : 'text-emerald-400'}`}>
                  {email.explanation}
                </p>
              )}
            </button>
          )
        })}
      </div>

      <div className="mt-4 flex items-center gap-3">
        {!checked ? (
          <button
            type="button"
            onClick={handleCheck}
            disabled={!selectedId}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-background hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
          >
            Comprobar
          </button>
        ) : isCorrect ? (
          <p className="text-sm font-semibold text-emerald-400">✅ ¡Correcto! Misión completada.</p>
        ) : (
          <>
            <p className="text-sm text-danger">
              Ese sí era phishing — el correo de {correctEmail?.sender} era el legítimo.
            </p>
            <button
              type="button"
              onClick={handleRetry}
              className="shrink-0 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-text-muted hover:text-text"
            >
              Reintentar
            </button>
          </>
        )}
      </div>
    </div>
  )
}
