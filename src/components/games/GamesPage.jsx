import { Link } from 'react-router-dom'
import AppTopBar from '../shared/AppTopBar'
import MascotCompanion from '../mascot/MascotCompanion'
import PageVideoModal from '../shared/PageVideoModal'
import { GAMES } from '../../data/gamesRegistry'

const CATEGORY_GRADIENTS = {
  Otros: 'from-cyan-500 to-blue-600',
  Pruebas: 'from-purple-500 to-pink-600',
  Estrategia: 'from-emerald-500 to-teal-600',
}
const DEFAULT_GRADIENT = 'from-primary to-emerald-500'

export default function GamesPage() {
  const categories = [...new Set(GAMES.map((g) => g.category ?? 'Otros'))]
  const isAvailable = (g) => Boolean(g.file) || g.type === 'component'
  const availableCount = GAMES.filter(isAvailable).length

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

          {/* ── Cyber Range Alpha ────────────────────────────────────────── */}
          <div className="relative overflow-hidden rounded-2xl border border-green-500/30 bg-black p-6">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgba(34,197,94,0.12),_transparent_60%)]" />
            <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-6">
              <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl bg-green-500/10 text-4xl border border-green-500/20">
                🕵️
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="text-xl font-black text-white">Oliver Cyber Range</span>
                  <span className="rounded-full border border-green-500/50 bg-green-500/10 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-green-400">
                    ⚡ Alpha
                  </span>
                  <span className="rounded-full border border-red-500/30 bg-red-500/10 px-2 py-0.5 text-[10px] font-semibold text-red-400 uppercase tracking-wide">
                    Solo Hackers
                  </span>
                </div>
                <p className="text-sm text-white/60 leading-relaxed mb-3">
                  Un mundo VR exclusivo inspirado en los escenarios reales que usa el FBI para entrenar
                  ciberseguridad. Trabaja en equipo para defender hospitales, estaciones de energía e
                  infraestructura crítica contra ataques simulados por IA. Red team vs Blue team.
                  Los NPCs adaptan sus tácticas. Los escenarios cambian con cada partida.
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {['Defensa activa', 'Red team / Blue team', 'IA adaptativa', 'Escenarios reales', 'Por equipos'].map((tag) => (
                    <span key={tag} className="rounded-full bg-white/5 border border-white/10 px-2.5 py-1 text-[11px] text-white/50">
                      {tag}
                    </span>
                  ))}
                </div>
                <button
                  disabled
                  className="rounded-xl border border-green-500/30 bg-green-500/5 px-5 py-2 text-sm font-semibold text-green-400/60 cursor-not-allowed"
                >
                  🔒 En desarrollo — Clase Hacker requerida
                </button>
              </div>
            </div>
          </div>

          {/* ── Duelo de Mentes Alpha ────────────────────────────────────── */}
          <div className="relative overflow-hidden rounded-2xl border border-violet-500/30 bg-black p-6">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(139,92,246,0.15),_transparent_60%)]" />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(236,72,153,0.08),_transparent_60%)]" />
            <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-6">
              <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl bg-violet-500/10 text-4xl border border-violet-500/20">
                ⚔️
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="text-xl font-black text-white">Duelo de Mentes</span>
                  <span className="rounded-full border border-violet-500/50 bg-violet-500/10 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-violet-400">
                    ⚡ Alpha
                  </span>
                  <span className="rounded-full border border-violet-500/30 bg-violet-500/10 px-2 py-0.5 text-[10px] font-semibold text-violet-400 uppercase tracking-wide">
                    Dev Alpha
                  </span>
                </div>
                <p className="text-sm text-white/60 leading-relaxed mb-3">
                  Juego de cartas por turnos donde Científicos, Hackers y Matemáticos se enfrentan en batalla.
                  Elige tu deck — Marie Curie vs Aristóteles, Ada Lovelace vs Pitágoras — y cuando juegas una carta,
                  tu personaje aparece en el campo como modelo 3D. Las habilidades son sus contribuciones reales al conocimiento.
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {['Cartas por turnos', 'Modelos 3D en campo', 'Científicos vs Filósofos', 'Sacrificios y niveles', 'Educativo'].map((tag) => (
                    <span key={tag} className="rounded-full bg-white/5 border border-white/10 px-2.5 py-1 text-[11px] text-white/50">
                      {tag}
                    </span>
                  ))}
                </div>
                <Link
                  to="/games/duelo-de-mentes"
                  className="inline-block rounded-xl border border-violet-500/50 bg-violet-500/15 px-5 py-2 text-sm font-semibold text-violet-300 transition-colors hover:bg-violet-500/25"
                >
                  ⚔️ Probar Alpha
                </Link>
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {GAMES.map((game) => {
              const available = isAvailable(game)
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
