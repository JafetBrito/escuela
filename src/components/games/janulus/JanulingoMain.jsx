import { useState } from 'react'
import { getJanulusLanguages } from '../../../data/matrixData'
import JanulingoMap    from './JanulingoMap'
import JanulingoEngine from './JanulingoEngine'

const TOTAL_ROUNDS = 8

export default function JanulingoMain() {
  const langs = getJanulusLanguages()

  const [screen,     setScreen]     = useState('cover')   // cover | lang | map | playing | done
  const [lang,       setLang]       = useState('en')
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
            Aprende idiomas ensamblando bloques de frases completas.
            El método de <span className="font-semibold text-primary">Powell Janulus</span> — 42 idiomas dominados.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setScreen('lang')}
          className="rounded-2xl border-b-4 border-primary/50 bg-primary px-10 py-3.5 text-lg font-black text-background shadow-xl transition-all hover:opacity-95 active:translate-y-1 active:border-b-0"
        >
          Jugar →
        </button>

        <p className="text-xs text-text-muted/40">🐱 Oliver te guiará con pistas</p>
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
          <h2 className="text-xl font-black">Elige tu idioma</h2>
        </div>

        <div className="flex flex-wrap justify-center gap-4">
          {langs.map(({ code, name, flag }) => (
            <button
              key={code}
              type="button"
              onClick={() => { setLang(code); setScreen('map') }}
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

  // ── Level map ──────────────────────────────────────────────────────────────
  if (screen === 'map') {
    return (
      <JanulingoMap
        lang={lang}
        langName={langData.name}
        langFlag={langData.flag}
        onPlay={(level) => { setLevelNum(level); setScreen('playing') }}
        onBack={() => setScreen('lang')}
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
        <h2 className="text-2xl font-black text-text">¡Nivel completado!</h2>
        <p className="text-text-muted">
          Puntuación:{' '}
          <span className="font-bold text-primary">{finalScore}</span> / {max}
        </p>
        <p className="text-sm text-text-muted">{pct}% de efectividad</p>
        <div className="mt-3 flex gap-3">
          <button
            type="button"
            onClick={() => setScreen('map')}
            className="rounded-xl border border-border/60 bg-surface px-5 py-2 text-sm font-bold text-text-muted transition-colors hover:text-text"
          >
            ← Mapa
          </button>
          <button
            type="button"
            onClick={() => setScreen('playing')}
            className="rounded-xl border-b-4 border-primary/50 bg-primary px-5 py-2 text-sm font-bold text-background transition-all active:translate-y-0.5 active:border-b-2 hover:opacity-90"
          >
            ↺ Repetir
          </button>
        </div>
      </div>
      <p className="text-sm text-text-muted/50">
        🐱 Powell Janulus dominaba 42 idiomas. ¡Tú vas por buen camino!
      </p>
    </div>
  )
}
