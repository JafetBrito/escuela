import { useState, lazy, Suspense } from 'react'
import { useParams, useNavigate, Link, Navigate } from 'react-router-dom'
import AppTopBar from '../shared/AppTopBar'
import { getGameById } from '../../data/gamesRegistry'
import { useGamesStore } from '../../stores/useGamesStore'
import { useAuthStore } from '../../stores/useAuthStore'

const COMPONENT_MAP = {
  chess: lazy(() => import('./chess/ChessGame')),
  'emoji-language': lazy(() => import('./emoji-language/EmojiLanguageGame')),
  janulus: lazy(() => import('./janulus/JanulingoMain')),
  memes: lazy(() => import('./memes/MemesGame')),
  'hacker-terminal': lazy(() => import('./hacker/HackerTerminalGame')),
  'cyber-range-hospital': lazy(() => import('./hospital/HospitalRangeGame')),
  'phishing-office': lazy(() => import('./phishing2d/PhishingOfficeGame')),
  'math': lazy(() => import('./math/MathGame')),
  'math-history': lazy(() => import('./math-history/MathHistoryGame')),
  'body-explorer': lazy(() => import('./body-explorer/BodyExplorerGame')),
  'typing-code': lazy(() => import('./typing-code/TypingCodeGame')),
  'prompt-duel': lazy(() => import('./prompt-duel/PromptDuelGame')),
  'bash-terminal': lazy(() => import('./bash/BashTerminalGame')),
  'duelo-mentes': lazy(() => import('./duelo/DueloDeMentesGame')),
  'python-terminal': lazy(() => import('./python/PythonTerminalGame')),
  trivia: lazy(() => import('./trivia/TriviaGame')),
}

export default function GamePlayerPage() {
  const { gameId } = useParams()
  const navigate = useNavigate()
  const game = getGameById(gameId)
  const ageProfile = useAuthStore((s) => s.profile?.age_profile)
  const canClaim = useGamesStore((s) => s.canClaim(gameId))
  const claimReward = useGamesStore((s) => s.claimReward)
  const [claimed, setClaimed] = useState(false)

  const GameComponent = game?.type === 'component' ? COMPONENT_MAP[game.component] : null

  // Protege contra entrar directo por URL a un juego oculto para el perfil
  // de edad de esta cuenta (ej. Ajedrez para niños) — la tarjeta ya no
  // aparece en GamesPage, pero la ruta dinámica no se presta al prop
  // blockAgeProfiles de ProtectedRoute (ese solo bloquea /games entero).
  if (game?.hideFor?.includes(ageProfile)) {
    return <Navigate to="/games" replace />
  }

  if (!game || (!game.file && !GameComponent)) {
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
    // h-dvh, no h-screen (=100vh): en móvil, 100vh cuenta el alto como si la
    // barra de direcciones del navegador no existiera — el layout completo
    // (juego + banner de recompensa) termina calculando más espacio del que
    // realmente se ve, empujando el fondo (el prompt de la terminal, el
    // editor de código, la explicación del quiz) por debajo de lo visible.
    // dvh sí refleja el viewport real; mismo fix ya usado en VRPage.jsx.
    <div className="flex h-dvh flex-col bg-background text-text">
      {/* variant="course": la barra completa (menú + anuncio) le comía
          demasiada altura a los juegos en móvil, igual que se detectó antes
          en VR — mismo header compacto de una fila que ya usan las clases. */}
      <AppTopBar variant="course" />

      <header className="flex items-center justify-between gap-2 border-b border-border bg-surface px-3 py-2 sm:gap-3 sm:px-4 sm:py-2.5">
        <button
          onClick={() => navigate('/games')}
          className="flex shrink-0 items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-medium text-text-muted transition-colors hover:text-text sm:px-3"
        >
          {/* Texto completo solo desde sm — sin esto, "Volver a Games" +
              título + botón de recompensa no cabían en una fila en móvil, y
              el texto se partía en dos líneas, inflando la altura del header. */}
          ← <span className="hidden sm:inline">Volver a Games</span>
        </button>
        <p className="min-w-0 flex-1 truncate text-center text-sm font-semibold text-text sm:text-left">
          {game.icon} {game.title}
        </p>
        {game.reward > 0 ? (
          <button
            onClick={handleClaim}
            disabled={!canClaim || claimed}
            className="shrink-0 rounded-lg border border-primary/40 px-2 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-primary/10 disabled:cursor-not-allowed disabled:opacity-50 sm:px-3"
          >
            <span className="sm:hidden">{canClaim && !claimed ? `🪙 +${game.reward}` : '✅'}</span>
            <span className="hidden sm:inline">{canClaim && !claimed ? `🪙 Reclamar +${game.reward}` : '✅ Reclamado hoy'}</span>
          </button>
        ) : (
          <span className="w-6 shrink-0 sm:w-24" aria-hidden="true" />
        )}
      </header>

      <div className="relative flex-1 overflow-hidden">
        {GameComponent ? (
          <Suspense fallback={<div className="flex h-full items-center justify-center text-text-muted">Cargando…</div>}>
            <GameComponent />
          </Suspense>
        ) : game.type === 'external-url' ? (
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
