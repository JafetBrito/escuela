import { Link } from 'react-router-dom'
import AppTopBar from '../shared/AppTopBar'
import MascotCompanion from '../mascot/MascotCompanion'
import { GAMES } from '../../data/gamesRegistry'

export default function GamesPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-text">
      <AppTopBar />

      <main className="flex-1 px-4 py-8 md:px-8">
        <div className="mx-auto flex max-w-4xl flex-col gap-6">
          <div>
            <h1 className="text-2xl font-bold">🎮 Games</h1>
            <p className="mt-1 text-sm text-text-muted">
              Juegos para repasar y ganar monedas mientras te diviertes.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {GAMES.map((game) => {
              const available = Boolean(game.file)
              return (
                <div
                  key={game.id}
                  className={`tech-card relative flex flex-col gap-2 p-5 ${available ? '' : 'opacity-70'}`}
                >
                  <span
                    className={`absolute right-3 top-3 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                      available
                        ? 'border-primary/40 text-primary'
                        : 'border-primary/40 text-primary'
                    }`}
                  >
                    {available ? `+${game.reward} 🪙` : 'Próximamente'}
                  </span>
                  <div className="text-3xl">{game.icon}</div>
                  <h2 className="text-base font-bold text-text">{game.title}</h2>
                  <p className="text-sm text-text-muted">{game.description}</p>
                  {available ? (
                    <Link
                      to={`/games/${game.id}`}
                      className="mt-auto self-start rounded-lg border border-primary/40 px-3 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-primary/10"
                    >
                      Jugar
                    </Link>
                  ) : (
                    <button
                      disabled
                      className="mt-auto self-start rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-text-muted opacity-60"
                    >
                      Jugar
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </main>

      <MascotCompanion />
    </div>
  )
}
