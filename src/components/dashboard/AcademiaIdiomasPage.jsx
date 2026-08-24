import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import AppTopBar from '../shared/AppTopBar'
import { useI18n, LANGUAGE_NAMES } from '../../i18n'
import { getTeachableLanguageGroups } from '../../data/languageAcademyRegistry'
import { getLanguageVisual } from '../../data/languageVisuals'

// Posiciones fijas (no un mapa del mundo, pero evoca uno): banderas
// flotando como una "constelación" sobre el hero, en vez del gradiente liso
// de antes. Coordenadas en % pensadas para verse bien tanto angostas como
// anchas — un puñado de banderas reales de las lenguas más habladas del
// registro, repetidas si hacen falta más puntos que idiomas "mundiales".
const CONSTELLATION = [
  { flag: '🇪🇸', top: '12%', left: '8%', size: 34, delay: 0 },
  { flag: '🇯🇵', top: '68%', left: '6%', size: 28, delay: 0.6 },
  { flag: '🇫🇷', top: '22%', left: '88%', size: 30, delay: 0.3 },
  { flag: '🇨🇳', top: '78%', left: '90%', size: 32, delay: 0.9 },
  { flag: '🇮🇳', top: '10%', left: '48%', size: 26, delay: 1.2 },
  { flag: '🇩🇪', top: '85%', left: '45%', size: 24, delay: 0.4 },
  { flag: '🇮🇹', top: '40%', left: '95%', size: 22, delay: 1.5 },
  { flag: '🪶', top: '45%', left: '3%', size: 26, delay: 0.8 },
]

export default function AcademiaIdiomasPage() {
  const navigate = useNavigate()
  const { t, lang } = useI18n()

  const languageGroups = useMemo(() => getTeachableLanguageGroups(lang, t), [lang, t])
  const totalLanguages = languageGroups.reduce((n, g) => n + g.languages.length, 0)

  return (
    <div className="flex h-screen flex-col bg-background text-text">
      <AppTopBar />
      <div className="flex-1 overflow-y-auto">

        {/* Hero — cielo nocturno con banderas flotando tipo constelación:
            evoca "idiomas de todo el mundo" sin un mapa literal (pedido
            explícito). Antes era un gradiente plano de dos tonos + título. */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[#0b1130] via-[#161c46] to-[#2a1a52] px-6 py-16 sm:py-20">
          <div className="pointer-events-none absolute inset-0 opacity-70">
            {CONSTELLATION.map((s, i) => (
              <span
                key={i}
                className="absolute animate-[float_6s_ease-in-out_infinite] drop-shadow-lg"
                style={{ top: s.top, left: s.left, fontSize: s.size, animationDelay: `${s.delay}s` }}
              >
                {s.flag}
              </span>
            ))}
            {/* estrellas pequeñas de relleno para reforzar el look "cielo/constelación" */}
            {Array.from({ length: 40 }).map((_, i) => (
              <span
                key={`star-${i}`}
                className="absolute rounded-full bg-white"
                style={{
                  top: `${(i * 37) % 100}%`,
                  left: `${(i * 53) % 100}%`,
                  width: i % 5 === 0 ? 3 : 1.5,
                  height: i % 5 === 0 ? 3 : 1.5,
                  opacity: 0.15 + (i % 4) * 0.1,
                }}
              />
            ))}
          </div>

          <div className="relative mx-auto max-w-3xl text-center">
            <p className="text-6xl drop-shadow-lg">🌍</p>
            <h1 className="mt-3 text-3xl font-black text-white drop-shadow-sm sm:text-4xl">{t('languageAcademy.title')}</h1>
            <p className="mx-auto mt-2 max-w-xl text-sm font-medium text-white/80 sm:text-base">
              {t('languageAcademy.subtitle', { l1: LANGUAGE_NAMES[lang] ?? lang })}
            </p>
            <p className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-bold text-white/70 backdrop-blur-sm">
              🗺️ {totalLanguages} idiomas para explorar
            </p>
          </div>
        </div>

        {/* Grid de tarjetas por región, con bandera + emoji cultural + acento
            de color por idioma (LANGUAGE_VISUALS) — antes eran solo botones
            en forma de píldora, todos iguales entre sí. */}
        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
          <p className="mb-6 text-center text-lg font-bold text-text">{t('languageAcademy.pickLanguage')}</p>
          <div className="space-y-8">
            {languageGroups.map((group) => (
              <div key={group.id}>
                <h3 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-text-muted">
                  <span className="text-base">{group.icon}</span> {group.label}
                </h3>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                  {group.languages.map((language) => {
                    const visual = getLanguageVisual(language.l2)
                    return (
                      <button
                        key={language.l2}
                        type="button"
                        onClick={() => navigate(`/academia-idiomas/${language.l2}`)}
                        className="group relative flex flex-col items-center gap-2 overflow-hidden rounded-2xl border bg-surface px-4 py-5 text-center transition-all duration-200 hover:-translate-y-1"
                        style={{ borderColor: `${visual.color}33` }}
                      >
                        <span
                          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                          style={{ background: `radial-gradient(circle at 50% 0%, ${visual.color}22, transparent 70%)` }}
                        />
                        <span className="relative flex items-center gap-1 text-3xl">
                          <span>{visual.flag}</span>
                          {visual.vibe !== visual.flag && <span className="text-xl">{visual.vibe}</span>}
                        </span>
                        <span className="relative text-sm font-bold text-text">{language.name}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
