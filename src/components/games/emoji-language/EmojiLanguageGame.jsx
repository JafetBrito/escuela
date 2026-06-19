import { useState, useEffect, useRef, useCallback } from 'react'
import { getLanguages, getLevels, getWords, getSpeechLang } from '../../../data/emojiLanguageData'

// ─── Oliver hint bubble ───────────────────────────────────────────────────
function OliverHint({ text, revealWord }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-amber-400/30 bg-amber-500/10 px-4 py-3 backdrop-blur-sm">
      <span className="mt-0.5 text-2xl">🐱</span>
      <div className="flex flex-col gap-1">
        <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400/80">
          Oliver susurra…
        </span>
        {text && <p className="text-sm text-amber-100/90">{text}</p>}
        {revealWord && (
          <div className="flex gap-1.5 pt-1">
            {revealWord.map(({ letter, shown }, i) => (
              <span
                key={i}
                className={`flex h-7 w-7 items-center justify-center rounded-md border text-sm font-bold uppercase transition-all ${
                  shown
                    ? 'border-amber-400/60 bg-amber-500/20 text-amber-200'
                    : 'border-white/10 bg-white/5 text-white/20'
                }`}
              >
                {shown ? letter : '_'}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Score flash ──────────────────────────────────────────────────────────
const POINTS_BY_HINTS = [100, 70, 50, 30]

export default function EmojiLanguageGame() {
  const languages = getLanguages()
  const [lang, setLang] = useState('en')
  const [levelNum, setLevelNum] = useState(1)

  const words = getWords(lang, levelNum)
  const speechLang = getSpeechLang(lang)

  const [idx, setIdx] = useState(0)
  const [input, setInput] = useState('')
  const [hintsUsed, setHintsUsed] = useState(0)
  const [revealedCount, setRevealedCount] = useState(0)
  const [result, setResult] = useState(null) // 'correct' | 'wrong' | null
  const [score, setScore] = useState(0)
  const [scoreFlash, setScoreFlash] = useState(null)
  const [done, setDone] = useState(false)
  const inputRef = useRef(null)

  const current = words[idx]

  // Reset when language/level/word changes
  useEffect(() => {
    setIdx(0); setScore(0); setDone(false)
    resetWord()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang, levelNum])

  function resetWord() {
    setInput(''); setHintsUsed(0); setRevealedCount(0)
    setResult(null); setScoreFlash(null)
    setTimeout(() => inputRef.current?.focus(), 50)
  }

  // Build the reveal array for Oliver's letter display
  const revealWord = current
    ? current.word.split('').map((letter, i) => ({
        letter,
        shown: i === 0 || i < revealedCount, // always show first letter after 1st hint
      }))
    : null

  // ── Speak ──────────────────────────────────────────────────────────────
  const speak = useCallback(() => {
    if (!current || !window.speechSynthesis) return
    window.speechSynthesis.cancel()
    const utt = new SpeechSynthesisUtterance(current.word)
    utt.lang = speechLang
    utt.rate = 0.85
    window.speechSynthesis.speak(utt)
  }, [current, speechLang])

  // ── Hint ───────────────────────────────────────────────────────────────
  function handleHint() {
    if (!current || result) return
    const next = hintsUsed + 1
    setHintsUsed(next)
    // After 1st hint: show description. After that: reveal letters one by one.
    if (next > 1) {
      setRevealedCount((c) => Math.min(c + 1, current.word.length - 1))
    }
  }

  // ── Submit ─────────────────────────────────────────────────────────────
  function handleSubmit(e) {
    e?.preventDefault()
    if (!current || result) return
    const guess = input.trim().toLowerCase()
    if (!guess) return

    if (guess === current.word.toLowerCase()) {
      const pts = POINTS_BY_HINTS[Math.min(hintsUsed, POINTS_BY_HINTS.length - 1)]
      setScore((s) => s + pts)
      setScoreFlash(`+${pts}`)
      setResult('correct')
      setTimeout(advance, 1400)
    } else {
      setResult('wrong')
      setTimeout(() => { setResult(null); setInput('') }, 900)
    }
  }

  // ── Advance ────────────────────────────────────────────────────────────
  function advance() {
    if (idx + 1 >= words.length) {
      setDone(true)
    } else {
      setIdx((i) => i + 1)
      resetWord()
    }
  }

  function skip() {
    if (result === 'correct') return
    advance()
  }

  // ── Restart ────────────────────────────────────────────────────────────
  function restart() {
    setIdx(0); setScore(0); setDone(false); resetWord()
  }

  // ── Done screen ────────────────────────────────────────────────────────
  if (done) {
    const max = words.length * 100
    const pct = Math.round((score / max) * 100)
    const medal = pct >= 90 ? '🥇' : pct >= 60 ? '🥈' : '🥉'
    return (
      <div className="flex h-full flex-col items-center justify-center gap-5 bg-background p-6 text-text">
        <div className="flex flex-col items-center gap-3 rounded-3xl border border-primary/30 bg-surface/80 px-8 py-8 shadow-2xl backdrop-blur-md">
          <span className="text-6xl">{medal}</span>
          <h2 className="text-2xl font-black text-text">¡Nivel completado!</h2>
          <p className="text-text-muted">
            Puntuación: <span className="font-bold text-primary">{score}</span> / {max}
          </p>
          <p className="text-sm text-text-muted">{pct}% de efectividad</p>
          <div className="mt-2 flex gap-3">
            <button
              onClick={restart}
              className="rounded-xl bg-primary px-5 py-2 text-sm font-bold text-background transition-opacity hover:opacity-90"
            >
              ↺ Repetir
            </button>
          </div>
        </div>
        <p className="flex items-center gap-2 text-sm text-text-muted/60">
          🐱 Oliver está orgulloso de ti.
        </p>
      </div>
    )
  }

  if (!current) return null

  const showOliver = hintsUsed > 0
  const levels = getLevels(lang)

  return (
    <div className="flex h-full flex-col items-center justify-start gap-4 overflow-auto bg-background px-4 py-5 text-text">

      {/* ── Selectors ── */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {/* Language */}
        <div className="flex overflow-hidden rounded-lg border border-border text-xs font-semibold">
          {languages.map(({ code, name, flag }) => (
            <button
              key={code}
              type="button"
              onClick={() => { setLang(code); setLevelNum(1) }}
              className={`px-3 py-1.5 transition-colors ${lang === code ? 'bg-primary text-background' : 'text-text-muted hover:text-text'}`}
            >
              {flag} {name}
            </button>
          ))}
        </div>
        {/* Level */}
        {levels.length > 1 && (
          <div className="flex overflow-hidden rounded-lg border border-border text-xs font-semibold">
            {levels.map(({ number, name }) => (
              <button
                key={number}
                type="button"
                onClick={() => setLevelNum(number)}
                className={`px-3 py-1.5 transition-colors ${levelNum === number ? 'bg-primary text-background' : 'text-text-muted hover:text-text'}`}
              >
                Niv.{number} {name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Progress + Score ── */}
      <div className="flex w-full max-w-md items-center justify-between text-xs text-text-muted">
        <span>{idx + 1} / {words.length}</span>
        <div className="relative flex items-center gap-1">
          <span className="font-bold text-primary">{score} pts</span>
          {scoreFlash && (
            <span
              key={scoreFlash + idx}
              className="absolute -top-5 right-0 animate-bounce text-xs font-black text-emerald-400"
            >
              {scoreFlash}
            </span>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full max-w-md overflow-hidden rounded-full bg-surface" style={{ height: 4 }}>
        <div
          className="h-full rounded-full bg-primary transition-all duration-500"
          style={{ width: `${((idx) / words.length) * 100}%` }}
        />
      </div>

      {/* ── Game card ── */}
      <div
        className="relative flex w-full max-w-md flex-col items-center gap-5 rounded-3xl border bg-surface/80 px-6 py-7 shadow-2xl backdrop-blur-md"
        style={{
          borderColor: result === 'correct' ? 'rgba(34,197,94,0.5)'
                     : result === 'wrong'   ? 'rgba(239,68,68,0.4)'
                     : 'rgba(255,255,255,0.08)',
          boxShadow: result === 'correct' ? '0 0 30px rgba(34,197,94,0.15)'
                   : result === 'wrong'   ? '0 0 30px rgba(239,68,68,0.12)'
                   : '0 8px 40px rgba(0,0,0,0.4)',
        }}
      >
        {/* Emoji */}
        <div
          className="flex items-center justify-center rounded-2xl"
          style={{
            fontSize: 88,
            lineHeight: 1,
            filter: 'drop-shadow(0 4px 16px rgba(0,0,0,0.5))',
          }}
        >
          {current.emoji}
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={speak}
            className="flex items-center gap-1.5 rounded-xl border border-border/60 bg-surface px-3 py-1.5 text-xs font-semibold text-text-muted transition-colors hover:border-primary/50 hover:text-primary"
          >
            🔊 Escuchar
          </button>
          <button
            type="button"
            onClick={handleHint}
            disabled={!!result}
            className="flex items-center gap-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-300 transition-colors hover:bg-amber-500/20 disabled:opacity-40"
          >
            💡 Pista {hintsUsed > 0 && `(${hintsUsed})`}
          </button>
        </div>

        {/* Oliver hint */}
        {showOliver && (
          <OliverHint
            text={hintsUsed === 1 ? current.hint : null}
            revealWord={hintsUsed > 1 ? revealWord : null}
          />
        )}

        {/* Input */}
        <form onSubmit={handleSubmit} className="flex w-full gap-2">
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Escribe la palabra…"
            disabled={result === 'correct'}
            autoComplete="off"
            spellCheck={false}
            className={`flex-1 rounded-xl border bg-surface/60 px-4 py-2.5 text-sm font-medium text-text outline-none transition-all placeholder:text-text-muted/40 focus:border-primary/60 focus:ring-1 focus:ring-primary/30 ${
              result === 'correct' ? 'border-emerald-500/50 text-emerald-400'
            : result === 'wrong'   ? 'border-red-500/40 text-red-400 animate-pulse'
            : 'border-border/50'
            }`}
          />
          <button
            type="submit"
            disabled={!input.trim() || result === 'correct'}
            className="rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-background transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            ✓
          </button>
        </form>

        {/* Result label */}
        {result === 'correct' && (
          <p className="text-sm font-bold text-emerald-400">✅ ¡Correcto!</p>
        )}
        {result === 'wrong' && (
          <p className="text-sm font-bold text-red-400">❌ Intenta de nuevo…</p>
        )}

        {/* Skip */}
        {!result && (
          <button
            type="button"
            onClick={skip}
            className="text-xs text-text-muted/40 transition-colors hover:text-text-muted"
          >
            Saltar →
          </button>
        )}
      </div>
    </div>
  )
}
