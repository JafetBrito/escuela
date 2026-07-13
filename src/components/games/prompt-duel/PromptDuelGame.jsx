import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { PROMPT_DUEL_ROUNDS } from '../../../data/promptDuelRounds'
import { useCurrencyStore } from '../../../stores/useCurrencyStore'
import { useLevelStore } from '../../../stores/useLevelStore'

// Duelo de Prompts: en cada ronda se muestran dos prompts para el mismo
// escenario, el jugador elige cuál funcionaría mejor con una IA real y
// recibe una explicación inmediata. Práctica ligera de ingeniería de
// prompts — pensado como complemento del curso "Ingeniería de Prompts".
export default function PromptDuelGame() {
  const [phase, setPhase] = useState('intro') // 'intro' | 'playing' | 'results'
  const [roundIndex, setRoundIndex] = useState(0)
  const [picked, setPicked] = useState(null) // índice elegido en la ronda actual
  const [score, setScore] = useState(0)

  const round = PROMPT_DUEL_ROUNDS[roundIndex]

  const handlePick = (index) => {
    if (picked !== null) return
    setPicked(index)
    if (index === round.betterIndex) setScore((s) => s + 1)
  }

  const next = () => {
    if (roundIndex + 1 < PROMPT_DUEL_ROUNDS.length) {
      setRoundIndex(roundIndex + 1)
      setPicked(null)
    } else {
      setPhase('results')
    }
  }

  const restart = () => {
    setRoundIndex(0)
    setPicked(null)
    setScore(0)
    setPhase('playing')
  }

  if (phase === 'intro') {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 bg-background p-6 text-center text-text">
        <p className="text-5xl">⚔️</p>
        <h1 className="text-2xl font-extrabold">Duelo de Prompts</h1>
        <p className="max-w-md text-sm text-text-muted">
          {PROMPT_DUEL_ROUNDS.length} escenarios reales. Dos prompts, un mismo objetivo. Elige el que de verdad funcionaría mejor con una IA.
        </p>
        <button onClick={restart} className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-background hover:opacity-90">
          Empezar duelo
        </button>
      </div>
    )
  }

  if (phase === 'results') return <ResultsScreen score={score} total={PROMPT_DUEL_ROUNDS.length} onRetry={restart} />

  return (
    <div className="flex h-full flex-col items-center gap-6 overflow-y-auto bg-background p-6 text-text">
      <div className="w-full max-w-2xl">
        <div className="mb-4 flex items-center justify-between text-sm text-text-muted">
          <span>Ronda {roundIndex + 1} / {PROMPT_DUEL_ROUNDS.length}</span>
          <span>Aciertos: {score}</span>
        </div>

        <p className="mb-4 rounded-xl border border-border bg-surface p-4 text-sm font-semibold text-text">
          🎬 {round.scenario}
        </p>

        <div className="grid gap-3 sm:grid-cols-2">
          <PromptCard
            label="Prompt A"
            text={round.promptA}
            picked={picked}
            isBetter={round.betterIndex === 0}
            onClick={() => handlePick(0)}
          />
          <PromptCard
            label="Prompt B"
            text={round.promptB}
            picked={picked}
            isBetter={round.betterIndex === 1}
            onClick={() => handlePick(1)}
          />
        </div>

        {picked !== null && (
          <div className="mt-4 rounded-xl border border-primary/30 bg-primary/5 p-4 text-sm">
            <p className="mb-1 font-bold text-primary">
              {picked === round.betterIndex ? '✅ ¡Correcto!' : '❌ No era ese — el mejor era el otro.'}
            </p>
            <p className="text-text-muted">{round.explanation}</p>
            <button
              onClick={next}
              className="mt-3 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-background hover:opacity-90"
            >
              {roundIndex + 1 < PROMPT_DUEL_ROUNDS.length ? 'Siguiente ronda →' : 'Ver resultados →'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function PromptCard({ label, text, picked, isBetter, onClick }) {
  const revealed = picked !== null
  let border = 'border-border'
  if (revealed && isBetter) border = 'border-emerald-500'
  if (revealed && !isBetter) border = 'border-red-500/50'

  return (
    <button
      onClick={onClick}
      disabled={revealed}
      className={`rounded-xl border-2 ${border} bg-surface p-4 text-left transition-colors ${!revealed ? 'hover:border-primary/50 hover:bg-surface-hover' : ''}`}
    >
      <p className="mb-2 text-xs font-bold uppercase tracking-wide text-text-muted">
        {label} {revealed && isBetter ? '🏆' : ''}
      </p>
      <p className="whitespace-pre-wrap font-mono text-xs leading-relaxed text-text">{text}</p>
    </button>
  )
}

function ResultsScreen({ score, total, onRetry }) {
  const reward = useMemo(() => {
    const coins = score * 40
    const xp = score * 12
    useCurrencyStore.getState().earnCoins(coins)
    useLevelStore.getState().addXp(xp)
    return { coins, xp }
  }, [])

  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 bg-background p-6 text-center text-text">
      <p className="text-5xl">⚔️🏆</p>
      <h2 className="text-2xl font-extrabold">¡Duelo terminado!</h2>
      <p className="text-3xl font-extrabold text-primary">{score} / {total}</p>
      <p className="text-sm text-text-muted">prompts identificados correctamente</p>
      <p className="mt-2 text-sm text-text-muted">
        Ganaste <strong className="text-text">🪙 {reward.coins}</strong> y <strong className="text-text">✨ {reward.xp} XP</strong>
      </p>
      <div className="mt-4 flex gap-3">
        <button onClick={onRetry} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-background hover:opacity-90">
          Reintentar
        </button>
        <Link to="/games" className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-text hover:bg-surface-hover">
          Volver a Games
        </Link>
      </div>
    </div>
  )
}
