import { useState, useRef, useCallback, useEffect } from 'react'
import { getJanulusLevel, getSpeechLangJanulus } from '../../../data/matrixData'

const ROUNDS = 8
const TYPES  = ['base', 'verb', 'vocab']

const C = {
  base:  { filled: 'border-blue-400/50 border-b-blue-600/80 bg-blue-500/15 text-blue-100',   emptyBorder: 'border-blue-400/25',   dot: '🔵', label: 'Estructura' },
  verb:  { filled: 'border-emerald-400/50 border-b-emerald-600/80 bg-emerald-500/15 text-emerald-100', emptyBorder: 'border-emerald-400/25', dot: '🟢', label: 'Verbo' },
  vocab: { filled: 'border-purple-400/50 border-b-purple-600/80 bg-purple-500/15 text-purple-100',   emptyBorder: 'border-purple-400/25',  dot: '🟣', label: 'Objeto' },
}

const SPEEDS = [
  { rate: 0.5,  icon: '🐌', label: '0.5×' },
  { rate: 0.75, icon: '🚶', label: '0.75×' },
  { rate: 1.0,  icon: '🏃', label: '1×' },
]

// Score: 100 base - 10 per learn mistake - 20 per build hint, min 20
function calcScore(learnMistakes, buildHints) {
  return Math.max(20, 100 - learnMistakes * 10 - buildHints * 20)
}

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)] }
function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5) }
function norm(s) { return s.trim().toLowerCase().replace(/[''`]/g, "'") }

function freshRS(ld) {
  const base  = pick(ld.bases)
  const verb  = pick(ld.verbs)
  const vocab = pick(ld.vocab)
  const blocks = shuffle([
    { type: 'base',  ...base  },
    { type: 'verb',  ...verb  },
    { type: 'vocab', ...vocab },
  ])
  return {
    round: { sentence: `${base.text} ${verb.text} ${vocab.text}`, base, verb, vocab },
    // Learn queue: verb first (the action), then vocab (the object)
    learnQueue: [
      { type: 'verb',  text: verb.text,  emoji: verb.emoji ?? '💬', keyword: verb.text.toLowerCase() },
      { type: 'vocab', text: vocab.text, emoji: vocab.emoji,         keyword: (vocab.keyword ?? vocab.text).toLowerCase() },
    ],
    blocks, available: blocks, selected: [],
  }
}

function doSpeak(text, langCode, rate) {
  const synth = window.speechSynthesis
  if (!synth) return
  synth.cancel()
  const fire = () => {
    const utt  = new SpeechSynthesisUtterance(text)
    utt.lang   = getSpeechLangJanulus(langCode)
    utt.rate   = rate
    const all  = synth.getVoices()
    const voice = all.find((v) => v.lang === utt.lang) ?? all.find((v) => v.lang.startsWith(langCode.slice(0, 2)))
    if (voice) utt.voice = voice
    synth.speak(utt)
  }
  synth.getVoices().length ? fire() : synth.addEventListener('voiceschanged', fire, { once: true })
}

export default function JanulingoEngine({ lang, levelNum, onDone, onBack }) {
  const ld = getJanulusLevel(lang, levelNum)

  // ── Round state ──────────────────────────────────────────────────────────
  const [rs, setRs] = useState(() => freshRS(ld))
  const { round, learnQueue, blocks, available, selected } = rs

  // ── Game flow ────────────────────────────────────────────────────────────
  const [phase,        setPhase]        = useState('learn')  // 'learn' | 'build'
  const [learnIdx,     setLearnIdx]     = useState(0)
  const [learnInput,   setLearnInput]   = useState('')
  const [learnShake,   setLearnShake]   = useState(false)
  const [learnMistakes, setLearnMistakes] = useState(0)
  const [learnDone,    setLearnDone]    = useState([])       // learned item types

  // ── Build state ──────────────────────────────────────────────────────────
  const [buildMode,  setBuildMode]  = useState('blocks')   // 'blocks' | 'type'
  const [typeAnswer, setTypeAnswer] = useState('')
  const [typeShake,  setTypeShake]  = useState(false)
  const [blockShake, setBlockShake] = useState(false)
  const [buildResult, setBuildResult] = useState(null)     // 'correct' | 'wrong' | null
  const [buildHints, setBuildHints] = useState(0)
  const [showLabels, setShowLabels] = useState(false)

  // ── Score / progress ─────────────────────────────────────────────────────
  const [roundIdx,  setRoundIdx]  = useState(0)
  const [score,     setScore]     = useState(0)
  const [flash,     setFlash]     = useState(null)
  const [rate,      setRate]      = useState(0.75)

  const scoreRef   = useRef(0)
  const learnRef   = useRef(null)
  const typeRef    = useRef(null)

  // Auto-focus learn input when phase starts or item advances
  useEffect(() => {
    if (phase === 'learn') learnRef.current?.focus()
  }, [phase, learnIdx])

  // Auto-focus type input when mode switches
  useEffect(() => {
    if (buildMode === 'type') typeRef.current?.focus()
  }, [buildMode])

  const currentLearnItem = learnQueue[learnIdx]

  const speak = useCallback((text) => {
    doSpeak(text ?? round.sentence, lang, rate)
  }, [round, lang, rate])

  // ── Learn phase ──────────────────────────────────────────────────────────
  function handleLearnSubmit(e) {
    e?.preventDefault()
    const item  = currentLearnItem
    const typed = norm(learnInput)
    const ok    = typed === item.keyword || typed === norm(item.text)

    if (ok) {
      setLearnDone((prev) => [...prev, item.type])
      setLearnInput('')
      if (learnIdx + 1 >= learnQueue.length) {
        setPhase('build')
      } else {
        setLearnIdx((i) => i + 1)
      }
    } else {
      setLearnMistakes((m) => m + 1)
      setLearnShake(true)
      setTimeout(() => { setLearnShake(false); setLearnInput('') }, 600)
    }
  }

  function handleLearnSkip() {
    setLearnMistakes((m) => m + 3) // penalty for skip
    setLearnInput('')
    if (learnIdx + 1 >= learnQueue.length) {
      setPhase('build')
    } else {
      setLearnIdx((i) => i + 1)
    }
  }

  function handleLearnHint() {
    speak(currentLearnItem.text)
  }

  // ── Build phase: type mode ───────────────────────────────────────────────
  function handleTypeSubmit(e) {
    e?.preventDefault()
    if (buildResult) return
    if (norm(typeAnswer) === norm(round.sentence)) {
      handleCorrect()
    } else {
      setBuildResult('wrong')
      setTypeShake(true)
      setTimeout(() => { setBuildResult(null); setTypeShake(false); setTypeAnswer('') }, 700)
    }
  }

  // ── Build phase: blocks mode ─────────────────────────────────────────────
  function handleBlockHint() {
    if (buildResult) return
    const n = buildHints + 1
    setBuildHints(n)
    if (n === 1) setShowLabels(true)
    else speak()
  }

  function handleSelect(block) {
    if (buildResult) return
    const newSel   = [...selected, block]
    const newAvail = available.filter((b) => !(b.id === block.id && b.type === block.type))

    if (newSel.length < 3) {
      setRs((p) => ({ ...p, selected: newSel, available: newAvail }))
      return
    }

    setRs((p) => ({ ...p, selected: newSel, available: [] }))

    if (newSel[0].type === 'base' && newSel[1].type === 'verb' && newSel[2].type === 'vocab') {
      handleCorrect()
    } else {
      setBuildResult('wrong')
      setBlockShake(true)
      const cap = blocks
      setTimeout(() => {
        setBlockShake(false); setBuildResult(null)
        setRs((p) => ({ ...p, selected: [], available: cap }))
      }, 700)
    }
  }

  function handleDeselect(block) {
    if (buildResult) return
    setRs((p) => ({
      ...p,
      selected:  p.selected.filter((b) => !(b.id === block.id && b.type === block.type)),
      available: [...p.available, block],
    }))
  }

  // ── Round completion ─────────────────────────────────────────────────────
  function handleCorrect() {
    const pts = calcScore(learnMistakes, buildHints)
    scoreRef.current += pts
    setScore(scoreRef.current)
    setFlash(`+${pts}`)
    setBuildResult('correct')
    const nextIdx = roundIdx + 1
    const [cl, cv] = [lang, levelNum]
    setTimeout(() => {
      if (nextIdx >= ROUNDS) {
        onDone(scoreRef.current)
      } else {
        setRoundIdx(nextIdx)
        const newRS = freshRS(getJanulusLevel(cl, cv))
        setRs(newRS)
        setPhase('learn'); setLearnIdx(0); setLearnInput(''); setLearnMistakes(0); setLearnDone([])
        setBuildResult(null); setBuildHints(0); setShowLabels(false); setTypeAnswer('')
        setFlash(null)
      }
    }, 1400)
  }

  // ────────────────────────────────────────────────────────────────────────
  // RENDER
  // ────────────────────────────────────────────────────────────────────────

  return (
    <div className="flex h-full flex-col bg-background text-text">

      {/* ── Top bar ── */}
      <div className="flex items-center justify-between border-b border-border bg-surface px-4 py-2.5">
        <button type="button" onClick={onBack}
          className="text-xs text-text-muted transition-colors hover:text-text">← Mapa</button>
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

      {/* ── Content ── */}
      <div className="flex flex-1 flex-col items-center gap-4 overflow-auto px-4 py-5">

        {/* ══ LEARN PHASE ══════════════════════════════════════════════════ */}
        {phase === 'learn' && currentLearnItem && (
          <>
            {/* Context: full sentence template */}
            <div className="flex w-full max-w-md items-center gap-1.5 rounded-xl border border-border/30 bg-surface/60 px-3 py-2 text-xs text-text-muted/60">
              <span className="font-semibold text-primary/60">{round.base.text}</span>
              {learnQueue.map((item, i) => (
                <span key={item.type}
                  className={`rounded px-1.5 py-0.5 font-semibold transition-all
                    ${i < learnIdx ? 'text-emerald-400/70 line-through' : i === learnIdx ? 'text-text font-bold' : 'text-text-muted/30'}`}>
                  {i === learnIdx ? `[${item.emoji} ?]` : i < learnIdx ? `${item.emoji} ${item.keyword}` : '???'}
                </span>
              ))}
            </div>

            {/* Step indicator */}
            <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted/50">
              Aprende · {learnIdx + 1}/{learnQueue.length}
            </p>

            {/* Big emoji card */}
            <div className={`flex w-full max-w-md flex-col items-center gap-3 rounded-3xl border bg-surface/80 px-6 py-7 shadow-2xl backdrop-blur-md transition-all
              ${learnShake ? 'janulus-shake border-red-500/40' : 'border-white/08'}`}>

              <div style={{ fontSize: 80, lineHeight: 1, filter: 'drop-shadow(0 4px 16px rgba(0,0,0,0.5))' }}>
                {currentLearnItem.emoji}
              </div>

              <p className="text-sm text-text-muted">
                {currentLearnItem.type === 'verb' ? '¿Qué acción es esta?' : '¿Cómo se llama este objeto?'}
              </p>

              {/* Learned items strip */}
              {learnDone.length > 0 && (
                <div className="flex gap-2">
                  {learnDone.map((type) => {
                    const item = learnQueue.find((q) => q.type === type)
                    return (
                      <span key={type}
                        className={`rounded-lg border px-2.5 py-1 text-xs font-semibold ${C[type].filled}`}>
                        {item?.emoji} {item?.keyword} ✓
                      </span>
                    )
                  })}
                </div>
              )}

              {/* Input */}
              <form onSubmit={handleLearnSubmit} className="flex w-full gap-2">
                <input
                  ref={learnRef}
                  value={learnInput}
                  onChange={(e) => setLearnInput(e.target.value)}
                  placeholder={`Escribe en ${learnQueue[learnIdx]?.type === 'verb' ? 'el verbo' : 'la palabra'}…`}
                  autoComplete="off"
                  spellCheck={false}
                  className="flex-1 rounded-xl border border-border/50 bg-surface/60 px-4 py-2.5 text-sm font-medium text-text outline-none transition-all placeholder:text-text-muted/40 focus:border-primary/60 focus:ring-1 focus:ring-primary/30"
                />
                <button type="submit" disabled={!learnInput.trim()}
                  className="rounded-xl border-b-4 border-primary/50 bg-primary px-4 py-2.5 text-sm font-bold text-background transition-all active:translate-y-0.5 active:border-b-2 disabled:opacity-40">
                  ✓
                </button>
              </form>

              {learnShake && (
                <p className="text-sm font-bold text-red-400">
                  ❌ "{learnInput}" no es correcto
                </p>
              )}

              {/* Learn controls */}
              <div className="flex gap-2">
                <button type="button" onClick={handleLearnHint}
                  className="flex items-center gap-1.5 rounded-xl border border-border/60 bg-surface px-3 py-1.5 text-xs font-semibold text-text-muted hover:border-primary/40 hover:text-primary">
                  🔊 Escuchar
                </button>
                <button type="button" onClick={handleLearnSkip}
                  className="flex items-center gap-1.5 rounded-xl border border-border/40 px-3 py-1.5 text-xs text-text-muted/50 hover:text-text-muted">
                  Saltar →
                </button>
              </div>
            </div>
          </>
        )}

        {/* ══ BUILD PHASE ══════════════════════════════════════════════════ */}
        {phase === 'build' && (
          <>
            {/* "Recipe card" — full sentence visual reference */}
            <div className="flex w-full max-w-md flex-wrap items-center justify-center gap-1.5 rounded-2xl border border-border/30 bg-surface/60 px-4 py-3">
              <span className={`rounded-lg border px-2.5 py-1 text-xs font-semibold ${C.base.filled}`}>
                {C.base.dot} {round.base.text}
              </span>
              <span className="text-text-muted/30 text-xs">+</span>
              <span className={`rounded-lg border px-2.5 py-1 text-xs font-semibold ${C.verb.filled}`}>
                {round.verb.emoji} {round.verb.text}
              </span>
              <span className="text-text-muted/30 text-xs">+</span>
              <span className={`rounded-lg border px-2.5 py-1 text-xs font-semibold ${C.vocab.filled}`}>
                {round.vocab.emoji} {round.vocab.text}
              </span>
            </div>

            <p className="text-xs font-bold uppercase tracking-widest text-text-muted/50">
              Construye la oración
            </p>

            {/* Mode toggle */}
            <div className="flex overflow-hidden rounded-xl border border-border text-xs font-bold">
              <button type="button" onClick={() => setBuildMode('blocks')}
                className={`flex items-center gap-1.5 px-4 py-2 transition-colors ${buildMode === 'blocks' ? 'bg-primary text-background' : 'text-text-muted hover:text-text'}`}>
                🧩 Bloques
              </button>
              <button type="button" onClick={() => setBuildMode('type')}
                className={`flex items-center gap-1.5 px-4 py-2 transition-colors ${buildMode === 'type' ? 'bg-primary text-background' : 'text-text-muted hover:text-text'}`}>
                ⌨️ Escribir
              </button>
            </div>

            {/* ── TYPE MODE ── */}
            {buildMode === 'type' && (
              <div className="flex w-full max-w-md flex-col gap-3">
                <form onSubmit={handleTypeSubmit}
                  className={`flex gap-2 transition-all ${typeShake ? 'janulus-shake' : ''}`}>
                  <input
                    ref={typeRef}
                    value={typeAnswer}
                    onChange={(e) => setTypeAnswer(e.target.value)}
                    placeholder="Escribe la frase completa…"
                    autoComplete="off"
                    spellCheck={false}
                    disabled={buildResult === 'correct'}
                    className={`flex-1 rounded-xl border bg-surface/60 px-4 py-3 text-sm font-medium text-text outline-none transition-all placeholder:text-text-muted/40 focus:border-primary/60 focus:ring-1 focus:ring-primary/30
                      ${buildResult === 'correct' ? 'border-emerald-500/50 text-emerald-300' : buildResult === 'wrong' ? 'border-red-500/40' : 'border-border/50'}`}
                  />
                  <button type="submit" disabled={!typeAnswer.trim() || buildResult === 'correct'}
                    className="rounded-xl border-b-4 border-primary/50 bg-primary px-4 py-3 text-sm font-bold text-background transition-all active:translate-y-0.5 active:border-b-2 disabled:opacity-40">
                    ✓
                  </button>
                </form>
                {buildResult === 'correct' && (
                  <p className="text-center text-sm font-bold text-emerald-400">✅ ¡Perfecto!</p>
                )}
                {buildResult === 'wrong' && (
                  <p className="text-center text-sm font-bold text-red-400">❌ Inténtalo de nuevo</p>
                )}
                <div className="flex justify-center gap-2">
                  <button type="button" onClick={() => speak()}
                    className="flex items-center gap-1.5 rounded-xl border border-border/60 bg-surface px-3 py-1.5 text-xs font-semibold text-text-muted hover:border-primary/40 hover:text-primary">
                    🔊 Escuchar
                  </button>
                </div>
              </div>
            )}

            {/* ── BLOCKS MODE ── */}
            {buildMode === 'blocks' && (
              <div className="flex w-full max-w-md flex-col items-center gap-4">
                {/* Slots */}
                <div className={`flex w-full gap-2 ${blockShake ? 'janulus-shake' : ''}`}>
                  {TYPES.map((type, i) => {
                    const block = selected[i]
                    const c = C[type]
                    return (
                      <button key={`slot-${i}-${block?.id ?? 'e'}`} type="button"
                        onClick={() => block && handleDeselect(block)}
                        disabled={!block || !!buildResult}
                        className={`flex flex-1 min-h-[3rem] items-center justify-center rounded-xl border-2 px-2 py-2 text-xs font-semibold transition-all duration-200
                          ${block
                            ? `cursor-pointer ${c.filled} shadow-sm`
                            : `border-dashed ${c.emptyBorder} bg-transparent cursor-default text-text-muted/25`
                          }`}>
                        <span className="text-center leading-tight">
                          {block
                            ? `${block.text}${block.emoji ? ` ${block.emoji}` : ''}`
                            : (showLabels ? c.label : c.dot)}
                        </span>
                      </button>
                    )
                  })}
                </div>

                {buildResult === 'correct' && (
                  <p className="text-sm font-bold text-emerald-400">✅ ¡Correcto!</p>
                )}
                {buildResult === 'wrong' && (
                  <p className="text-sm font-bold text-red-400">❌ Orden incorrecto</p>
                )}

                {/* Available blocks */}
                <div className="flex flex-wrap justify-center gap-2">
                  {available.map((b) => {
                    const c = C[b.type]
                    return (
                      <button key={`av_${b.type}_${b.id}`} type="button"
                        onClick={() => handleSelect(b)}
                        className={`rounded-xl border-2 border-b-4 px-4 py-2.5 text-sm font-bold transition-all active:translate-y-1 active:border-b-2 ${c.filled}`}>
                        {showLabels && <span className="mr-1.5 text-[10px] font-normal opacity-50">{c.label}</span>}
                        {b.text}{b.emoji ? ` ${b.emoji}` : ''}
                      </button>
                    )
                  })}
                </div>

                {/* Speed + hint + listen */}
                <div className="flex flex-wrap justify-center gap-2">
                  <div className="flex items-center gap-1">
                    {SPEEDS.map((s) => (
                      <button key={s.rate} type="button" onClick={() => setRate(s.rate)}
                        className={`rounded-lg border px-2 py-1 text-[11px] font-bold transition-all
                          ${rate === s.rate ? 'border-primary bg-primary/15 text-primary' : 'border-border/50 bg-surface text-text-muted hover:border-primary/30'}`}>
                        {s.icon} {s.label}
                      </button>
                    ))}
                  </div>
                  <button type="button" onClick={() => speak()}
                    className="flex items-center gap-1.5 rounded-xl border border-border/60 bg-surface px-3 py-1.5 text-xs font-semibold text-text-muted hover:border-primary/40 hover:text-primary">
                    🔊 Escuchar
                  </button>
                  <button type="button" onClick={handleBlockHint} disabled={!!buildResult}
                    className="flex items-center gap-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-300 hover:bg-amber-500/20 disabled:opacity-40">
                    🐱 Pista {buildHints > 0 && `(${buildHints})`}
                  </button>
                </div>

                {/* Oliver hint */}
                {buildHints > 0 && (
                  <div className="flex w-full items-start gap-3 rounded-2xl border border-amber-400/30 bg-amber-500/10 px-4 py-3">
                    <span className="mt-0.5 text-2xl">🐱</span>
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400/80">Oliver susurra…</span>
                      <p className="text-sm text-amber-100/90">
                        {buildHints === 1
                          ? `Orden: ${C.base.dot} Estructura → ${C.verb.dot} Verbo → ${C.vocab.dot} Objeto.`
                          : 'Escucha la frase despacio (🐌) para captar el ritmo.'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
