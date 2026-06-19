import { useState, useEffect, useCallback } from 'react'
import {
  getJanulusLanguages,
  getJanulusLevels,
  getJanulusLevel,
  getSpeechLangJanulus,
} from '../../../data/matrixData'

const ROUNDS = 8
const PTS = [100, 70, 40] // pts by hints used (0, 1, 2+)

// Color system: blue=structure, green=verb, purple=object
const BSTYLE = {
  base:  'border-blue-400/50 bg-blue-500/15 text-blue-100 hover:bg-blue-500/25 active:scale-95',
  verb:  'border-emerald-400/50 bg-emerald-500/15 text-emerald-100 hover:bg-emerald-500/25 active:scale-95',
  vocab: 'border-purple-400/50 bg-purple-500/15 text-purple-100 hover:bg-purple-500/25 active:scale-95',
}
const DOT   = { base: '🔵', verb: '🟢', vocab: '🟣' }
const LABEL = { base: 'Estructura', verb: 'Verbo', vocab: 'Objeto' }

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)] }
function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5) }

function buildRS(ld) {
  const base  = pick(ld.bases)
  const verb  = pick(ld.verbs)
  const vocab = pick(ld.vocab)
  const blocks = shuffle([
    { type: 'base',  ...base  },
    { type: 'verb',  ...verb  },
    { type: 'vocab', ...vocab },
  ])
  return { round: { sentence: `${base.text} ${verb.text} ${vocab.text}`, vocab }, blocks, available: blocks, selected: [] }
}

export default function JanulusMatrixGame() {
  const langs = getJanulusLanguages()
  const [lang,     setLang]     = useState('en')
  const [levelNum, setLevelNum] = useState(1)

  // rs = { round, blocks, available, selected }
  const [rs,         setRs]         = useState(() => buildRS(getJanulusLevel('en', 1)))
  const [shake,      setShake]      = useState(false)
  const [result,     setResult]     = useState(null)   // 'correct' | 'wrong' | null
  const [showLabels, setShowLabels] = useState(false)
  const [hintsUsed,  setHintsUsed]  = useState(0)
  const [score,      setScore]      = useState(0)
  const [flash,      setFlash]      = useState(null)
  const [done,       setDone]       = useState(false)
  const [roundIdx,   setRoundIdx]   = useState(0)

  const { round, blocks, available, selected } = rs

  // ── Reset on lang/level change ───────────────────────────────────────────
  useEffect(() => {
    const ld = getJanulusLevel(lang, levelNum)
    if (!ld) return
    setRs(buildRS(ld))
    setResult(null); setShowLabels(false); setHintsUsed(0)
    setScore(0); setFlash(null); setDone(false); setRoundIdx(0); setShake(false)
  }, [lang, levelNum])

  // ── Speak ────────────────────────────────────────────────────────────────
  const speak = useCallback(() => {
    if (!window.speechSynthesis) return
    window.speechSynthesis.cancel()
    const utt = new SpeechSynthesisUtterance(round.sentence)
    utt.lang = getSpeechLangJanulus(lang)
    utt.rate = 0.82
    window.speechSynthesis.speak(utt)
  }, [round, lang])

  // ── Hint ─────────────────────────────────────────────────────────────────
  function handleHint() {
    if (result) return
    const n = hintsUsed + 1
    setHintsUsed(n)
    if (n === 1) setShowLabels(true)
    else speak()
  }

  // ── Select block ─────────────────────────────────────────────────────────
  function handleSelect(block) {
    if (result) return
    const newSel   = [...selected, block]
    const newAvail = available.filter((b) => !(b.id === block.id && b.type === block.type))

    if (newSel.length < 3) {
      setRs((p) => ({ ...p, selected: newSel, available: newAvail }))
      return
    }

    const correct = newSel[0].type === 'base' && newSel[1].type === 'verb' && newSel[2].type === 'vocab'
    setRs((p) => ({ ...p, selected: newSel, available: [] }))

    if (correct) {
      const pts = PTS[Math.min(hintsUsed, PTS.length - 1)]
      setScore((s) => s + pts)
      setFlash(`+${pts}`)
      setResult('correct')
      const nextIdx = roundIdx + 1
      const capLang = lang; const capLevel = levelNum
      setTimeout(() => {
        if (nextIdx >= ROUNDS) {
          setDone(true)
        } else {
          setRoundIdx(nextIdx)
          setRs(buildRS(getJanulusLevel(capLang, capLevel)))
          setResult(null); setShowLabels(false); setHintsUsed(0); setFlash(null)
        }
      }, 1400)
    } else {
      setResult('wrong')
      setShake(true)
      const capBlocks = blocks
      setTimeout(() => {
        setShake(false); setResult(null)
        setRs((p) => ({ ...p, selected: [], available: capBlocks }))
      }, 750)
    }
  }

  // ── Deselect (tap selected block to remove) ───────────────────────────────
  function handleDeselect(block) {
    if (result) return
    setRs((p) => ({
      ...p,
      selected: p.selected.filter((b) => !(b.id === block.id && b.type === block.type)),
      available: [...p.available, block],
    }))
  }

  // ── Restart ───────────────────────────────────────────────────────────────
  function restart() {
    const ld = getJanulusLevel(lang, levelNum)
    setRs(buildRS(ld))
    setResult(null); setShowLabels(false); setHintsUsed(0)
    setScore(0); setFlash(null); setDone(false); setRoundIdx(0); setShake(false)
  }

  // ── Done screen ───────────────────────────────────────────────────────────
  if (done) {
    const max = ROUNDS * 100
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
          <button
            onClick={restart}
            className="mt-2 rounded-xl bg-primary px-5 py-2 text-sm font-bold text-background transition-opacity hover:opacity-90"
          >
            ↺ Repetir
          </button>
        </div>
        <p className="text-sm text-text-muted/50">
          🐱 Powell Janulus dominaba 42 idiomas. ¡Tú vas por buen camino!
        </p>
      </div>
    )
  }

  const levels = getJanulusLevels(lang)

  return (
    <div className="flex h-full flex-col items-center gap-4 overflow-auto bg-background px-4 py-5 text-text">

      {/* ── Language + Level selectors ───────────────────────────────────── */}
      <div className="flex flex-wrap justify-center gap-2">
        <div className="flex overflow-hidden rounded-lg border border-border text-xs font-semibold">
          {langs.map(({ code, name, flag }) => (
            <button
              key={code} type="button"
              onClick={() => { setLang(code); setLevelNum(1) }}
              className={`px-3 py-1.5 transition-colors ${lang === code ? 'bg-primary text-background' : 'text-text-muted hover:text-text'}`}
            >
              {flag} {name}
            </button>
          ))}
        </div>
        {levels.length > 1 && (
          <div className="flex overflow-hidden rounded-lg border border-border text-xs font-semibold">
            {levels.map(({ level, name }) => (
              <button
                key={level} type="button"
                onClick={() => setLevelNum(level)}
                className={`px-3 py-1.5 transition-colors ${levelNum === level ? 'bg-primary text-background' : 'text-text-muted hover:text-text'}`}
              >
                Niv.{level} {name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Progress ─────────────────────────────────────────────────────── */}
      <div className="flex w-full max-w-md items-center justify-between text-xs text-text-muted">
        <span>{roundIdx + 1} / {ROUNDS}</span>
        <div className="relative">
          <span className="font-bold text-primary">{score} pts</span>
          {flash && (
            <span key={`${flash}-${roundIdx}`}
              className="absolute -top-5 right-0 animate-bounce text-xs font-black text-emerald-400">
              {flash}
            </span>
          )}
        </div>
      </div>
      <div className="w-full max-w-md overflow-hidden rounded-full bg-surface" style={{ height: 4 }}>
        <div className="h-full rounded-full bg-primary transition-all duration-500"
          style={{ width: `${(roundIdx / ROUNDS) * 100}%` }} />
      </div>

      {/* ── Game card ────────────────────────────────────────────────────── */}
      <div
        className="flex w-full max-w-md flex-col items-center gap-4 rounded-3xl border bg-surface/80 px-6 py-6 shadow-2xl backdrop-blur-md"
        style={{
          borderColor: result === 'correct' ? 'rgba(34,197,94,0.5)'
                     : result === 'wrong'   ? 'rgba(239,68,68,0.4)'
                     : 'rgba(255,255,255,0.08)',
          boxShadow: result === 'correct' ? '0 0 30px rgba(34,197,94,0.12)'
                   : result === 'wrong'   ? '0 0 30px rgba(239,68,68,0.1)'
                   : '0 8px 40px rgba(0,0,0,0.4)',
        }}
      >
        {/* Emoji goal */}
        <div className="flex flex-col items-center gap-1">
          <div style={{ fontSize: 80, lineHeight: 1, filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.5))' }}>
            {round.vocab.emoji}
          </div>
          <span className="text-xs text-text-muted/50">Construye la frase correcta</span>
        </div>

        {/* Matrix guide legend */}
        <div className="flex items-center gap-3 text-[10px]">
          {(['base', 'verb', 'vocab']).map((t, i) => (
            <span key={t} className="flex items-center gap-1">
              {i > 0 && <span className="text-text-muted/30">+</span>}
              <span className={
                t === 'base'  ? 'text-blue-400/70' :
                t === 'verb'  ? 'text-emerald-400/70' :
                               'text-purple-400/70'
              }>{DOT[t]} {LABEL[t]}</span>
            </span>
          ))}
        </div>

        {/* Sentence builder area */}
        <div
          className={`flex min-h-12 w-full flex-wrap items-center justify-center gap-2 rounded-2xl border border-border/20 bg-background/30 p-3 transition-all ${shake ? 'janulus-shake' : ''}`}
        >
          {selected.length === 0 ? (
            <span className="text-xs text-text-muted/30">Selecciona los bloques en orden…</span>
          ) : (
            selected.map((b) => (
              <button
                key={`sel_${b.type}_${b.id}`}
                type="button"
                onClick={() => handleDeselect(b)}
                title="Toca para quitar"
                className={`rounded-xl border px-3 py-1.5 text-sm font-semibold transition-all ${BSTYLE[b.type]}`}
              >
                {b.text}{b.emoji ? ` ${b.emoji}` : ''}
              </button>
            ))
          )}
        </div>

        {/* Available blocks (shuffled) */}
        <div className="flex flex-wrap justify-center gap-2">
          {available.map((b) => (
            <button
              key={`av_${b.type}_${b.id}`}
              type="button"
              onClick={() => handleSelect(b)}
              className={`rounded-xl border px-3 py-1.5 text-sm font-semibold transition-all ${BSTYLE[b.type]}`}
            >
              {showLabels && (
                <span className="mr-1.5 text-[10px] font-normal opacity-50">{LABEL[b.type]}</span>
              )}
              {b.text}{b.emoji ? ` ${b.emoji}` : ''}
            </button>
          ))}
        </div>

        {/* Result feedback */}
        {result === 'correct' && (
          <p className="text-sm font-bold text-emerald-400">
            ✅ ¡Correcto! <span className="font-normal opacity-70">"{round.sentence}"</span>
          </p>
        )}
        {result === 'wrong' && (
          <p className="text-sm font-bold text-red-400">❌ Orden incorrecto — ¡inténtalo de nuevo!</p>
        )}

        {/* Controls */}
        <div className="flex gap-2">
          <button type="button" onClick={speak}
            className="flex items-center gap-1.5 rounded-xl border border-border/60 bg-surface px-3 py-1.5 text-xs font-semibold text-text-muted transition-colors hover:border-primary/40 hover:text-primary">
            🔊 Escuchar
          </button>
          <button type="button" onClick={handleHint} disabled={!!result}
            className="flex items-center gap-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-300 transition-colors hover:bg-amber-500/20 disabled:opacity-40">
            🐱 Pista {hintsUsed > 0 && `(${hintsUsed})`}
          </button>
        </div>

        {/* Oliver hint bubble */}
        {hintsUsed > 0 && (
          <div className="flex w-full items-start gap-3 rounded-2xl border border-amber-400/30 bg-amber-500/10 px-4 py-3">
            <span className="mt-0.5 text-2xl">🐱</span>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400/80">
                Oliver susurra…
              </span>
              <p className="text-sm text-amber-100/90">
                {hintsUsed === 1
                  ? `Los colores revelan el orden: ${DOT.base} Estructura → ${DOT.verb} Verbo → ${DOT.vocab} Objeto.`
                  : 'Pulsa "Escuchar" para oír el ritmo natural de la frase completa.'}
              </p>
            </div>
          </div>
        )}
      </div>

      <p className="text-center text-xs text-text-muted/40">
        Toca un bloque seleccionado para quitarlo · {PTS[0]} pts sin pistas
      </p>
    </div>
  )
}
