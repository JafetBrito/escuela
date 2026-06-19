import { useState, useRef, useCallback } from 'react'
import { getJanulusLevel, getSpeechLangJanulus } from '../../../data/matrixData'

const ROUNDS = 8
const PTS    = [100, 70, 40]
const TYPES  = ['base', 'verb', 'vocab']

// Static class strings — Tailwind purges dynamic interpolation
const C = {
  base: {
    filled:      'border-blue-400/50 border-b-blue-600/80 bg-blue-500/15 text-blue-100',
    emptyBorder: 'border-blue-400/25',
    dot: '🔵', label: 'Estructura',
  },
  verb: {
    filled:      'border-emerald-400/50 border-b-emerald-600/80 bg-emerald-500/15 text-emerald-100',
    emptyBorder: 'border-emerald-400/25',
    dot: '🟢', label: 'Verbo',
  },
  vocab: {
    filled:      'border-purple-400/50 border-b-purple-600/80 bg-purple-500/15 text-purple-100',
    emptyBorder: 'border-purple-400/25',
    dot: '🟣', label: 'Objeto',
  },
}

const SPEEDS = [
  { rate: 0.5,  icon: '🐌', label: '0.5×' },
  { rate: 0.75, icon: '🚶', label: '0.75×' },
  { rate: 1.0,  icon: '🏃', label: '1×' },
]

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)] }
function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5) }

function freshRS(ld) {
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

// Proper TTS with voice selection + async voice load fallback
function doSpeak(text, langCode, rate) {
  const synth = window.speechSynthesis
  if (!synth) return
  synth.cancel()
  const fire = () => {
    const utt  = new SpeechSynthesisUtterance(text)
    utt.lang   = getSpeechLangJanulus(langCode)
    utt.rate   = rate
    const all  = synth.getVoices()
    const voice = all.find((v) => v.lang === utt.lang)
               ?? all.find((v) => v.lang.startsWith(langCode.slice(0, 2)))
    if (voice) utt.voice = voice
    synth.speak(utt)
  }
  synth.getVoices().length ? fire() : synth.addEventListener('voiceschanged', fire, { once: true })
}

export default function JanulingoEngine({ lang, levelNum, onDone, onBack }) {
  const ld = getJanulusLevel(lang, levelNum)

  const [rs,         setRs]         = useState(() => freshRS(ld))
  const [shake,      setShake]      = useState(false)
  const [result,     setResult]     = useState(null)
  const [showLabels, setShowLabels] = useState(false)
  const [hintsUsed,  setHintsUsed]  = useState(0)
  const [score,      setScore]      = useState(0)
  const [flash,      setFlash]      = useState(null)
  const [roundIdx,   setRoundIdx]   = useState(0)
  const [rate,       setRate]       = useState(0.75)

  // Ref so timeouts always see the latest score without stale closures
  const scoreRef = useRef(0)

  const { round, blocks, available, selected } = rs

  const speak = useCallback(() => doSpeak(round.sentence, lang, rate), [round, lang, rate])

  function handleHint() {
    if (result) return
    const n = hintsUsed + 1
    setHintsUsed(n)
    if (n === 1) setShowLabels(true)
    else speak()
  }

  function handleSelect(block) {
    if (result) return
    const newSel   = [...selected, block]
    const newAvail = available.filter((b) => !(b.id === block.id && b.type === block.type))

    if (newSel.length < 3) {
      setRs((p) => ({ ...p, selected: newSel, available: newAvail }))
      return
    }

    // All 3 placed — evaluate
    setRs((p) => ({ ...p, selected: newSel, available: [] }))
    const correct = newSel[0].type === 'base' && newSel[1].type === 'verb' && newSel[2].type === 'vocab'

    if (correct) {
      const pts = PTS[Math.min(hintsUsed, PTS.length - 1)]
      scoreRef.current += pts
      setScore(scoreRef.current)
      setFlash(`+${pts}`)
      setResult('correct')
      const nextIdx = roundIdx + 1
      const [cl, cv] = [lang, levelNum]
      setTimeout(() => {
        if (nextIdx >= ROUNDS) {
          onDone(scoreRef.current)
        } else {
          setRoundIdx(nextIdx)
          setRs(freshRS(getJanulusLevel(cl, cv)))
          setResult(null); setShowLabels(false); setHintsUsed(0); setFlash(null)
        }
      }, 1300)
    } else {
      setResult('wrong')
      setShake(true)
      const cap = blocks
      setTimeout(() => {
        setShake(false); setResult(null)
        setRs((p) => ({ ...p, selected: [], available: cap }))
      }, 750)
    }
  }

  function handleDeselect(block) {
    if (result) return
    setRs((p) => ({
      ...p,
      selected:  p.selected.filter((b) => !(b.id === block.id && b.type === block.type)),
      available: [...p.available, block],
    }))
  }

  return (
    <div className="flex h-full flex-col bg-background text-text">

      {/* ── Top bar ── */}
      <div className="flex items-center justify-between border-b border-border bg-surface px-4 py-2.5">
        <button type="button" onClick={onBack}
          className="text-xs text-text-muted transition-colors hover:text-text">
          ← Mapa
        </button>
        <div className="flex items-center gap-2">
          <div className="h-2 w-28 overflow-hidden rounded-full bg-border/40">
            <div className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${(roundIdx / ROUNDS) * 100}%` }} />
          </div>
          <span className="text-xs text-text-muted">{roundIdx + 1}/{ROUNDS}</span>
        </div>
        <div className="relative min-w-[3rem] text-right">
          <span className="text-xs font-bold text-primary">{score} pts</span>
          {flash && (
            <span key={`f-${roundIdx}`}
              className="absolute -top-4 right-0 animate-bounce text-[10px] font-black text-emerald-400">
              {flash}
            </span>
          )}
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="flex flex-1 flex-col items-center gap-4 overflow-auto px-4 py-5">

        {/* Slots (hangman-style) */}
        <div className={`flex w-full max-w-md gap-2 transition-transform ${shake ? 'janulus-shake' : ''}`}>
          {TYPES.map((type, i) => {
            const block = selected[i]
            const c     = C[type]
            return (
              <button
                key={`slot-${i}-${block?.id ?? 'e'}`}
                type="button"
                onClick={() => block && handleDeselect(block)}
                disabled={!block || !!result}
                className={`flex flex-1 min-h-[3rem] items-center justify-center rounded-xl border-2 px-2 py-2 text-sm font-semibold transition-all duration-200
                  ${block
                    ? `cursor-pointer ${c.filled} shadow-sm scale-100`
                    : `border-dashed ${c.emptyBorder} bg-transparent cursor-default scale-95 text-text-muted/25`
                  }`}
              >
                <span className="text-center leading-tight text-xs sm:text-sm">
                  {block
                    ? `${block.text}${block.emoji ? ` ${block.emoji}` : ''}`
                    : (showLabels ? c.label : c.dot)}
                </span>
              </button>
            )
          })}
        </div>

        {/* Result feedback */}
        {result === 'correct' && (
          <p className="text-sm font-bold text-emerald-400">
            ✅ <span className="font-normal opacity-75">"{round.sentence}"</span>
          </p>
        )}
        {result === 'wrong' && (
          <p className="text-sm font-bold text-red-400">❌ Orden incorrecto — inténtalo de nuevo</p>
        )}

        {/* Emoji focus */}
        <div className="flex flex-col items-center gap-1">
          <div style={{ fontSize: 72, lineHeight: 1, filter: 'drop-shadow(0 4px 14px rgba(0,0,0,0.5))' }}>
            {round.vocab.emoji}
          </div>
          <span className="text-[11px] text-text-muted/50">Construye la frase</span>
        </div>

        {/* Speed controls */}
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-text-muted/50">Velocidad:</span>
          {SPEEDS.map((s) => (
            <button key={s.rate} type="button" onClick={() => setRate(s.rate)}
              className={`rounded-lg border px-2.5 py-1 text-[11px] font-bold transition-all
                ${rate === s.rate
                  ? 'border-primary bg-primary/15 text-primary'
                  : 'border-border/50 bg-surface text-text-muted hover:border-primary/30 hover:text-text'
                }`}
            >
              {s.icon} {s.label}
            </button>
          ))}
        </div>

        {/* Available blocks — 3D button style */}
        <div className="flex flex-wrap justify-center gap-2 pt-1">
          {available.map((b) => {
            const c = C[b.type]
            return (
              <button
                key={`av_${b.type}_${b.id}`}
                type="button"
                onClick={() => handleSelect(b)}
                className={`rounded-xl border-2 border-b-4 px-4 py-2.5 text-sm font-bold
                  transition-all active:translate-y-1 active:border-b-2 active:shadow-none
                  ${c.filled}`}
              >
                {showLabels && (
                  <span className="mr-1.5 text-[10px] font-normal opacity-50">{c.label}</span>
                )}
                {b.text}{b.emoji ? ` ${b.emoji}` : ''}
              </button>
            )
          })}
        </div>

        {/* Action row */}
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

        {/* Oliver oracle */}
        {hintsUsed > 0 && (
          <div className="flex w-full max-w-md items-start gap-3 rounded-2xl border border-amber-400/30 bg-amber-500/10 px-4 py-3">
            <span className="mt-0.5 text-2xl">🐱</span>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400/80">
                Oliver susurra…
              </span>
              <p className="text-sm text-amber-100/90">
                {hintsUsed === 1
                  ? `El orden es: ${C.base.dot} Estructura → ${C.verb.dot} Verbo → ${C.vocab.dot} Objeto.`
                  : 'Pulsa "Escuchar" despacio (🐌 0.5×) para captar el ritmo natural.'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
