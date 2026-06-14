import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import AppTopBar from '../shared/AppTopBar'
import { getGameById } from '../../data/gamesRegistry'
import { useGamesStore } from '../../stores/useGamesStore'

export default function GamePlayerPage() {
  const { gameId } = useParams()
  const navigate = useNavigate()
  const game = getGameById(gameId)
  const canClaim = useGamesStore((s) => s.canClaim(gameId))
  const claimReward = useGamesStore((s) => s.claimReward)
  const [claimed, setClaimed] = useState(false)

  if (!game || !game.file) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-background p-6 text-center text-text">
        <p className="text-4xl">🚧</p>
        <p className="text-lg font-bold">Este juego no está disponible todavía.</p>
        <Link to="/games" className="text-sm text-primary hover:underline">
          ← Volver a Games
        </Link>
      </div>
    )
  }

  const handleClaim = () => {
    if (claimReward(game.id, game.reward)) {
      setClaimed(true)
    }
  }

  return (
    <div className="flex h-screen flex-col bg-background text-text">
      <AppTopBar />

      <header className="flex items-center justify-between gap-3 border-b border-border bg-surface px-4 py-2.5">
        <button
          onClick={() => navigate('/games')}
          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-text-muted transition-colors hover:text-text"
        >
          ← Volver a Games
        </button>
        <p className="truncate text-sm font-semibold text-text">
          {game.icon} {game.title}
        </p>
        {game.reward > 0 ? (
          <button
            onClick={handleClaim}
            disabled={!canClaim || claimed}
            className="rounded-lg border border-primary/40 px-3 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-primary/10 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {canClaim && !claimed ? `🪙 Reclamar +${game.reward}` : '✅ Reclamado hoy'}
          </button>
        ) : (
          <span className="w-24" aria-hidden="true" />
        )}
      </header>

      <div className="relative flex-1">
        {game.type === 'external-url' ? (
          <div className="flex h-full flex-col items-center justify-center gap-4 p-6 text-center">
            <p className="text-5xl">{game.icon}</p>
            <p className="max-w-md text-sm text-text-muted">
              Este juego se abre en una pestaña nueva (no se puede mostrar embebido aquí).
              Cuando termines, vuelve a esta pestaña y reclama tu recompensa.
            </p>
            <a
              href={game.file}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-background transition-opacity hover:opacity-90"
            >
              Abrir {game.title} ↗
            </a>
          </div>
        ) : (
          <iframe
            src={game.file}
            title={game.title}
            className="h-full w-full border-0 bg-white"
            allow="fullscreen; gamepad; autoplay"
          />
        )}
      </div>

      {game.reward > 0 && (
        <p className="border-t border-border bg-surface px-4 py-2 text-center text-xs text-text-muted">
          Cuando termines el juego, presiona "Reclamar" para llevarte tu recompensa de hoy.
        </p>
      )}
    </div>
  )
}
