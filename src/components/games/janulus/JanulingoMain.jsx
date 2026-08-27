import { useState } from 'react'
import { useI18n } from '../../../i18n'
import { getJanulusLanguages, getJanulusLangData } from '../../../data/matrixData'
import { strings } from './janulusStrings'
import JanulingoMap    from './JanulingoMap'
import JanulingoEngine from './JanulingoEngine'

const TOTAL_ROUNDS = 8

export default function JanulingoMain() {
  const { lang: uiLang } = useI18n()
  const t = strings(uiLang)
  const langs = getJanulusLanguages(uiLang)
  const onlySpanish = uiLang === 'en'

  const [screen,     setScreen]     = useState('cover')   // cover | lang | history | map | playing | done
  const [lang,       setLang]       = useState(onlySpanish ? 'es' : 'en')
  const [levelNum,   setLevelNum]   = useState(1)
  const [finalScore, setFinalScore] = useState(0)

  const langData = langs.find((l) => l.code === lang) ?? langs[0]

  // ── Cover ──────────────────────────────────────────────────────────────────
  if (screen === 'cover') {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-8 bg-background p-6 text-text">
        <div className="flex flex-col items-center gap-4">
          <span style={{ fontSize: 80, filter: 'drop-shadow(0 6px 20px rgba(0,0,0,0.6))' }}>🧩</span>
          <h1 className="text-5xl font-black tracking-tight text-text">Janulingo</h1>
          <p className="max-w-xs text-center text-sm text-text-muted">
            {t.tagline}{' '}
            {uiLang === 'en'
              ? <>The <span className="font-semibold text-primary">Powell Janulus</span> method — 42 languages mastered.</>
              : <>El método de <span className="font-semibold text-primary">Powell Janulus</span> — 42 idiomas dominados.</>}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setScreen(onlySpanish ? 'map' : 'lang')}
          className="rounded-2xl border-b-4 border-primary/50 bg-primary px-10 py-3.5 text-lg font-black text-background shadow-xl transition-all hover:opacity-95 active:translate-y-1 active:border-b-0"
        >
          {t.jugar}
        </button>

        <p className="text-xs text-text-muted/40">{t.oliverGuia}</p>
      </div>
    )
  }

  // ── Language select ────────────────────────────────────────────────────────
  if (screen === 'lang') {
    return (
      <div className="flex h-full flex-col bg-background p-6 text-text">
        <div className="mb-6 flex items-center gap-3">
          <button type="button" onClick={() => setScreen('cover')}
            className="text-sm text-text-muted transition-colors hover:text-text">
            ←
          </button>
          <h2 className="text-xl font-black">{t.eligeIdioma}</h2>
        </div>

        <div className="flex flex-wrap justify-center gap-4">
          {langs.map(({ code, name, flag }) => (
            <button
              key={code}
              type="button"
              onClick={() => { setLang(code); setScreen(getJanulusLangData(code)?.history ? 'history' : 'map') }}
              className="flex flex-col items-center gap-2 rounded-2xl border-2 border-b-4 border-border/60 border-b-border bg-surface px-8 py-6 text-text transition-all hover:border-primary/50 hover:border-b-primary/50 hover:bg-surface-hover hover:scale-105 active:scale-100 active:border-b-2 active:translate-y-1"
            >
              <span style={{ fontSize: 48 }}>{flag}</span>
              <span className="text-base font-bold">{name}</span>
            </button>
          ))}
        </div>
      </div>
    )
  }

  // ── Language history ───────────────────────────────────────────────────────
  if (screen === 'history') {
    const hist = getJanulusLangData(lang)?.history
    if (!hist) { setScreen('map'); return null }
    return (
      <div className="flex h-full flex-col bg-background text-text">
        <div className="flex items-center border-b border-border bg-surface px-4 py-3">
          <button type="button" onClick={() => setScreen('lang')}
            className="text-sm text-text-muted transition-colors hover:text-text">← Idiomas</button>
          <div className="flex flex-1 items-center justify-center gap-2">
            <span className="text-lg">{langData.flag}</span>
            <span className="font-bold text-sm">{hist.title}</span>
          </div>
          <button type="button" onClick={() => setScreen('map')}
            className="text-sm text-primary transition-colors hover:opacity-80">Niveles →</button>
        </div>

        <div className="flex-1 overflow-auto">
          <div className="border-b border-border/40 bg-surface/50 px-6 py-8 text-center">
            <span style={{ fontSize: 56 }}>{hist.badge}</span>
            <h2 className="mt-3 text-xl font-black">{hist.title}</h2>
            <p className="mt-1 text-xs text-text-muted">{hist.subtitle}</p>
            <p className="mx-auto mt-4 max-w-sm text-sm leading-relaxed text-text-muted/80">{hist.intro}</p>
          </div>

          <div className="divide-y divide-border/30">
            {hist.sections.map((sec) => (
              <div key={sec.title} className="px-6 py-5">
                <div className="mb-2 flex items-center gap-2">
                  <span className="text-xl">{sec.emoji}</span>
                  <h3 className="font-bold">{sec.title}</h3>
                </div>
                <p className="whitespace-pre-line text-sm leading-relaxed text-text-muted">{sec.text}</p>
              </div>
            ))}
          </div>

          {hist.funFacts && (
            <div className="border-t border-border/40 px-6 py-5">
              <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-text-muted/50">Curiosidades</p>
              <ul className="space-y-2">
                {hist.funFacts.map((fact) => (
                  <li key={fact} className="rounded-xl bg-surface/60 px-4 py-3 text-sm leading-relaxed text-text-muted">{fact}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="px-6 pb-8 pt-4 text-center">
            <button
              type="button"
              onClick={() => setScreen('map')}
              className="rounded-2xl border-b-4 border-primary/50 bg-primary px-10 py-3 text-base font-black text-background shadow-lg transition-all hover:opacity-95 active:translate-y-1 active:border-b-0"
            >
              ¡Empezar a aprender! →
            </button>
            <p className="mt-3 text-xs text-text-muted/40">{hist.badge} El idioma más antiguo de Europa te espera</p>
          </div>
        </div>
      </div>
    )
  }

  // ── Level map ──────────────────────────────────────────────────────────────
  if (screen === 'map') {
    return (
      <JanulingoMap
        lang={lang}
        langName={langData.name}
        langFlag={langData.flag}
        onPlay={(level) => { setLevelNum(level); setScreen('playing') }}
        onBack={() => setScreen(onlySpanish ? 'cover' : 'lang')}
        onHistory={getJanulusLangData(lang)?.history ? () => setScreen('history') : undefined}
        uiLang={uiLang}
      />
    )
  }

  // ── Playing ────────────────────────────────────────────────────────────────
  if (screen === 'playing') {
    return (
      <JanulingoEngine
        lang={lang}
        levelNum={levelNum}
        onDone={(score) => { setFinalScore(score); setScreen('done') }}
        onBack={() => setScreen('map')}
        uiLang={uiLang}
      />
    )
  }

  // ── Done ──────────────────────────────────────────────────────────────────
  const max = TOTAL_ROUNDS * 100
  const pct = Math.round((finalScore / max) * 100)
  const medal = pct >= 90 ? '🥇' : pct >= 60 ? '🥈' : '🥉'

  return (
    <div className="flex h-full flex-col items-center justify-center gap-6 bg-background p-6 text-text">
      <div className="flex flex-col items-center gap-3 rounded-3xl border border-primary/30 bg-surface/80 px-10 py-8 shadow-2xl backdrop-blur-md">
        <span style={{ fontSize: 56 }}>{medal}</span>
        <h2 className="text-2xl font-black text-text">{t.nivelCompletado}</h2>
        <p className="text-text-muted">
          {t.puntuacion}{' '}
          <span className="font-bold text-primary">{finalScore}</span> / {max}
        </p>
        <p className="text-sm text-text-muted">{pct}% {t.efectividad}</p>
        <div className="mt-3 flex gap-3">
          <button
            type="button"
            onClick={() => setScreen('map')}
            className="rounded-xl border border-border/60 bg-surface px-5 py-2 text-sm font-bold text-text-muted transition-colors hover:text-text"
          >
            {t.mapa}
          </button>
          <button
            type="button"
            onClick={() => setScreen('playing')}
            className="rounded-xl border-b-4 border-primary/50 bg-primary px-5 py-2 text-sm font-bold text-background transition-all active:translate-y-0.5 active:border-b-2 hover:opacity-90"
          >
            {t.repetir}
          </button>
        </div>
      </div>
      <p className="text-sm text-text-muted/50">
        {t.powellFooter}
      </p>
    </div>
  )
}
