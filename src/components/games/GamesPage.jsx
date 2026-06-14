import { Link } from 'react-router-dom'
import AppTopBar from '../shared/AppTopBar'
import MascotCompanion from '../mascot/MascotCompanion'
import PageVideoModal from '../shared/PageVideoModal'
import { GAMES } from '../../data/gamesRegistry'

const CATEGORY_GRADIENTS = {
  Otros: 'from-cyan-500 to-blue-600',
  Pruebas: 'from-purple-500 to-pink-600',
}
const DEFAULT_GRADIENT = 'from-primary to-emerald-500'

export default function GamesPage() {
  const categories = [...new Set(GAMES.map((g) => g.category ?? 'Otros'))]
  const availableCount = GAMES.filter((g) => g.file).length

  return (
    <div className="flex min-h-screen flex-col bg-background text-text">
      <AppTopBar />
      <PageVideoModal pageKey="games" />

      <main className="flex-1 px-4 py-8 md:px-8">
        <div className="mx-auto flex max-w-5xl flex-col gap-6">
          <div className="overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 px-6 py-8 shadow-lg">
            <h1 className="text-3xl font-extrabold text-white drop-shadow-sm">🎮 Games</h1>
            <p className="mt-1 text-sm font-medium text-white/85">
              Juegos para repasar y ganar monedas mientras te diviertes. ¡Pronto se suman más!
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-full bg-background/20 px-3 py-1 text-xs font-semibold text-white">
                🕹️ {availableCount}/{GAMES.length} disponibles
              </span>
              {categories.map((cat) => (
                <span
                  key={cat}
                  className="rounded-full bg-background/20 px-3 py-1 text-xs font-semibold text-white"
                >
                  {cat}
                </span>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {GAMES.map((game) => {
              const available = Boolean(game.file)
              const gradient = CATEGORY_GRADIENTS[game.category] ?? DEFAULT_GRADIENT

              return (
                <div
                  key={game.id}
                  className={`group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-surface transition-transform ${
                    available ? 'hover:-translate-y-1 hover:shadow-xl' : 'opacity-75'
                  }`}
                >
                  <div className={`flex items-center justify-between bg-gradient-to-r ${gradient} px-4 py-5`}>
                    <span className="text-4xl drop-shadow-sm">{game.icon}</span>
                    <span className="rounded-full bg-background/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
                      {available ? `+${game.reward} 🪙` : 'Próximamente'}
                    </span>
                  </div>

                  <div className="flex flex-1 flex-col gap-2 p-4">
                    <span className="self-start rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
                      {game.category ?? 'Otros'}
                    </span>
                    <h2 className="text-base font-bold text-text">{game.title}</h2>
                    <p className="flex-1 text-sm text-text-muted">{game.description}</p>

                    {available ? (
                      <Link
                        to={`/games/${game.id}`}
                        className="mt-auto self-start rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-background transition-colors hover:bg-primary-hover"
                      >
                        ▶ Jugar
                      </Link>
                    ) : (
                      <button
                        disabled
                        className="mt-auto self-start rounded-lg border border-border px-4 py-2 text-xs font-semibold text-text-muted opacity-60"
                      >
                        🔒 Próximamente
                      </button>
                    )}
                  </div>
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
