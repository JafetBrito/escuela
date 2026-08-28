import { useState } from 'react'
import { Link } from 'react-router-dom'
import AppTopBar from '../shared/AppTopBar'
import MascotCompanion from '../mascot/MascotCompanion'
import PageVideoModal from '../shared/PageVideoModal'
import { GAMES } from '../../data/gamesRegistry'
import { useI18n } from '../../i18n'
import { useAuthStore } from '../../stores/useAuthStore'
import { localizeGameCard, GAME_CATEGORY_DESCRIPTION_EN, GAME_CATEGORY_DEFAULT_DESCRIPTION_EN } from '../../data/gamesCatalogTranslations'
import { localizeCategoryName } from '../../data/categoryTranslations'

// Antes esto solo pintaba una etiqueta de color sobre cada tarjeta — ahora
// es la puerta de entrada real: primero eliges categoría, luego ves sus
// juegos. Cualquier categoría nueva que aparezca en gamesRegistry.js sin
// entrada aquí cae en DEFAULT_CATEGORY_META, no rompe nada.
const CATEGORY_META = {
  Pruebas: { icon: '🧠', gradient: 'from-purple-500 to-pink-600', description: 'Trivia, idiomas y retos de conocimiento' },
  Estrategia: { icon: '♟️', gradient: 'from-emerald-500 to-teal-600', description: 'Ajedrez y batallas de cartas por turnos' },
  Simuladores: { icon: '🖥️', gradient: 'from-blue-600 to-indigo-700', description: 'Terminales reales y escenarios de ciberseguridad' },
  Matemáticas: { icon: '🧮', gradient: 'from-orange-500 to-red-600', description: 'Combate numérico y viajes por la historia' },
  Música: { icon: '🎹', gradient: 'from-pink-500 to-rose-600', description: 'Notas, ritmo y oído musical' },
  Historia: { icon: '🏺', gradient: 'from-amber-500 to-yellow-600', description: 'Personajes y eventos que marcaron el mundo' },
  Ciencias: { icon: '🧬', gradient: 'from-teal-500 to-cyan-600', description: 'El cuerpo humano y la naturaleza en 3D' },
  'Inteligencia Artificial': { icon: '🤖', gradient: 'from-violet-500 to-fuchsia-600', description: 'Practica prompts y piensa como una IA' },
  Programación: { icon: '⌨️', gradient: 'from-slate-500 to-blue-700', description: 'Escribe código real contra el reloj' },
}
const DEFAULT_CATEGORY_META = { icon: '🎲', gradient: 'from-primary to-emerald-500', description: 'Más juegos por descubrir' }

function localizedCategoryMeta(name, lang) {
  const meta = CATEGORY_META[name] ?? DEFAULT_CATEGORY_META
  if (lang !== 'en') return meta
  const description = GAME_CATEGORY_DESCRIPTION_EN[name] ?? GAME_CATEGORY_DEFAULT_DESCRIPTION_EN
  return { ...meta, description }
}

function FeaturedAlphaBanner({ to, icon, title, badge, badgeColor, description, tags, borderColor, glowColor, buttonLabel }) {
  return (
    <div className={`relative overflow-hidden rounded-2xl border ${borderColor} bg-black p-6`}>
      {/* Tailwind no puede generar un arbitrary-value armado con interpolación
          en runtime (bg-[...${x}...]) — el color del glow va por style. */}
      <div className="pointer-events-none absolute inset-0" style={{ background: `radial-gradient(ellipse at top left, ${glowColor}, transparent 60%)` }} />
      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-6">
        <div className={`flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl ${badgeColor.bg} text-4xl border ${badgeColor.border}`}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="text-xl font-black text-white">{title}</span>
            <span className={`rounded-full border ${badgeColor.border} ${badgeColor.bg} px-2 py-0.5 text-[10px] font-black uppercase tracking-widest ${badgeColor.text}`}>
              ⚡ Alpha
            </span>
            <span className={`rounded-full border ${badgeColor.border} ${badgeColor.bg} px-2 py-0.5 text-[10px] font-semibold ${badgeColor.text} uppercase tracking-wide`}>
              {badge}
            </span>
          </div>
          <p className="text-sm text-white/60 leading-relaxed mb-3">{description}</p>
          <div className="flex flex-wrap gap-2 mb-4">
            {tags.map((tag) => (
              <span key={tag} className="rounded-full bg-white/5 border border-white/10 px-2.5 py-1 text-[11px] text-white/50">
                {tag}
              </span>
            ))}
          </div>
          <Link to={to} className={`inline-block rounded-xl border ${badgeColor.border} ${badgeColor.bg} px-5 py-2 text-sm font-semibold ${badgeColor.text} transition-colors hover:brightness-125`}>
            {buttonLabel}
          </Link>
        </div>
      </div>
    </div>
  )
}

function GameCard({ game: rawGame, lang, t }) {
  const game = localizeGameCard(rawGame, lang)
  const available = Boolean(game.file) || game.type === 'component'
  return (
    <div
      className={`group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-surface transition-transform ${
        available ? 'hover:-translate-y-1 hover:shadow-xl' : 'opacity-75'
      }`}
    >
      <div className={`flex items-center justify-between bg-gradient-to-r ${(CATEGORY_META[game.category] ?? DEFAULT_CATEGORY_META).gradient} px-4 py-5`}>
        <span className="text-4xl drop-shadow-sm">{game.icon}</span>
        <span className="rounded-full bg-background/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
          {available ? `+${game.reward} 🪙` : t('pages.games.soon')}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <h2 className="text-base font-bold text-text">{game.title}</h2>
        <p className="flex-1 text-sm text-text-muted">{game.description}</p>

        {available ? (
          <Link
            to={`/games/${game.id}`}
            className="mt-auto self-start rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-background transition-colors hover:bg-primary-hover"
          >
            {t('pages.games.play')}
          </Link>
        ) : (
          <button
            disabled
            className="mt-auto self-start rounded-lg border border-border px-4 py-2 text-xs font-semibold text-text-muted opacity-60"
          >
            {t('languageAcademy.soon')}
          </button>
        )}
      </div>
    </div>
  )
}

export default function GamesPage() {
  const { t, lang } = useI18n()
  const ageProfile = useAuthStore((s) => s.profile?.age_profile)
  const [activeCategory, setActiveCategory] = useState(null)

  const games = GAMES.filter((g) => !g.hideFor?.includes(ageProfile))
  const isAvailable = (g) => Boolean(g.file) || g.type === 'component'
  const availableCount = games.filter(isAvailable).length

  const categories = [...new Set(games.map((g) => g.category ?? 'Otros'))].map((name) => {
    const gamesInCategory = games.filter((g) => (g.category ?? 'Otros') === name)
    return {
      name,
      games: gamesInCategory,
      availableCount: gamesInCategory.filter(isAvailable).length,
      meta: localizedCategoryMeta(name, lang),
    }
  })

  const selected = categories.find((c) => c.name === activeCategory) ?? null

  return (
    <div className="flex min-h-screen flex-col bg-background text-text">
      <AppTopBar />
      <PageVideoModal pageKey="games" />

      <main className="flex-1 px-4 py-8 md:px-8">
        <div className="mx-auto flex max-w-5xl flex-col gap-6">
          <div className="overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 px-6 py-8 shadow-lg">
            <h1 className="text-3xl font-extrabold text-white drop-shadow-sm">{t('pages.games.title')}</h1>
            <p className="mt-1 text-sm font-medium text-white/85">
              {t('pages.games.subtitle')}
            </p>
            <span className="mt-4 inline-block rounded-full bg-background/20 px-3 py-1 text-xs font-semibold text-white">
              🕹️ {t('pages.games.availableInCategories', { available: availableCount, total: games.length, count: categories.length })}
            </span>
          </div>

          <FeaturedAlphaBanner
            to="/games/cyber-range-hospital"
            icon="🕵️"
            title="Oliver Cyber Range"
            badge="Hacker vs Doctor"
            badgeColor={{ bg: 'bg-green-500/10', border: 'border-green-500/50', text: 'text-green-400' }}
            borderColor="border-green-500/30"
            glowColor="rgba(34,197,94,0.12)"
            description={lang === 'en'
              ? "Inspired by the scenarios the FBI uses to train cybersecurity teams — invite someone and pick a side: a Hacker breaches Central Hospital's systems live while a Doctor treats patients to keep it running. One shared security meter, every move on one side weighs on the other in real time."
              : "Inspirado en los escenarios que usa el FBI para entrenar ciberseguridad — invita a alguien y elige bando: un Hacker vulnera en vivo los sistemas del Hospital Central mientras un Doctor trata pacientes para mantenerlo en pie. Un solo medidor de seguridad compartido, cada acierto de un lado le pesa al otro en tiempo real."}
            tags={lang === 'en'
              ? ['Real time', 'Asymmetric roles', 'Real Linux terminal', 'Patient cases', '1 vs 1']
              : ['Tiempo real', 'Roles asimétricos', 'Terminal Linux real', 'Casos de pacientes', '1 vs 1']}
            buttonLabel={lang === 'en' ? '🏥 Enter the Cyber Range' : '🏥 Entrar al Cyber Range'}
          />

          <FeaturedAlphaBanner
            to="/games/duelo-de-mentes"
            icon="⚔️"
            title={lang === 'en' ? 'Duel of Minds' : 'Duelo de Mentes'}
            badge="Dev Alpha"
            badgeColor={{ bg: 'bg-violet-500/10', border: 'border-violet-500/50', text: 'text-violet-400' }}
            borderColor="border-violet-500/30"
            glowColor="rgba(139,92,246,0.15)"
            description={lang === 'en'
              ? 'A turn-based card game where historical Scientists, Hackers, and Mathematicians clash in battle. Pick your deck — Marie Curie vs. Aristotle, Ada Lovelace vs. Pythagoras — and when you play a card, your character appears on the field as a 3D model. Their abilities are their real contributions to knowledge.'
              : 'Juego de cartas por turnos donde Científicos, Hackers y Matemáticos se enfrentan en batalla. Elige tu deck — Marie Curie vs Aristóteles, Ada Lovelace vs Pitágoras — y cuando juegas una carta, tu personaje aparece en el campo como modelo 3D. Las habilidades son sus contribuciones reales al conocimiento.'}
            tags={lang === 'en'
              ? ['Turn-based cards', '3D models on field', 'Scientists vs Philosophers', 'Sacrifices & levels', 'Educational']
              : ['Cartas por turnos', 'Modelos 3D en campo', 'Científicos vs Filósofos', 'Sacrificios y niveles', 'Educativo']}
            buttonLabel={lang === 'en' ? '⚔️ Try the Alpha' : '⚔️ Probar Alpha'}
          />

          {!selected ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {categories.map((cat) => (
                <button
                  key={cat.name}
                  type="button"
                  onClick={() => setActiveCategory(cat.name)}
                  className="group relative flex flex-col items-start overflow-hidden rounded-2xl border border-border bg-surface p-5 text-left transition-all hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${cat.meta.gradient} opacity-10 transition-opacity group-hover:opacity-20`} />
                  <div className="relative flex w-full items-center justify-between">
                    <span className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${cat.meta.gradient} text-3xl shadow-md`}>
                      {cat.meta.icon}
                    </span>
                    <span className="rounded-full border border-border bg-background/60 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-text-muted">
                      {cat.availableCount}/{cat.games.length} {t('pages.games.gamesCount')}
                    </span>
                  </div>
                  <h2 className="relative mt-4 text-lg font-bold text-text">{localizeCategoryName(cat.name, lang)}</h2>
                  <p className="relative mt-1 text-sm text-text-muted">{cat.meta.description}</p>
                  <span className="relative mt-4 text-xs font-semibold text-primary opacity-0 transition-opacity group-hover:opacity-100">
                    {t('pages.games.seeGames')}
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => setActiveCategory(null)}
                  className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-text-muted hover:bg-surface-hover hover:text-text"
                >
                  {t('pages.games.allCategories')}
                </button>
                <span className={`flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br ${selected.meta.gradient} text-lg`}>
                  {selected.meta.icon}
                </span>
                <h2 className="text-xl font-bold text-text">{localizeCategoryName(selected.name, lang)}</h2>
                <span className="text-sm text-text-muted">{selected.meta.description}</span>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {selected.games.map((game) => <GameCard key={game.id} game={game} lang={lang} t={t} />)}
              </div>
            </div>
          )}
        </div>
      </main>

      <MascotCompanion />
    </div>
  )
}
