import { useState, useRef, useCallback, useEffect } from 'react'
import { getJanulusLevel, getSpeechLangJanulus } from '../../../data/matrixData'
import VerbAnimation from './VerbAnimation'

const ROUNDS = 8

const C = {
  base:  { filled: 'border-blue-400/50 border-b-blue-600/80 bg-blue-500/15 text-blue-100',    dot: '🔵', label: 'Estructura' },
  verb:  { filled: 'border-emerald-400/50 border-b-emerald-600/80 bg-emerald-500/15 text-emerald-100', dot: '🟢', label: 'Verbo' },
  vocab: { filled: 'border-purple-400/50 border-b-purple-600/80 bg-purple-500/15 text-purple-100',    dot: '🟣', label: 'Objeto' },
}

const SPEEDS = [
  { rate: 0.5,  icon: '🐌', label: '0.5×' },
  { rate: 0.75, icon: '🚶', label: '0.75×' },
  { rate: 1.0,  icon: '🏃', label: '1×' },
]

// ponytail: UI language hardcoded to Spanish — change this constant when platform goes multilingual
const UI_LANG = 'es-ES'

function calcScore(learnMistakes, hintCount) {
  return Math.max(20, 100 - learnMistakes * 10 - hintCount * 15)
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
    learnQueue: [
      { type: 'verb',  text: verb.text,  emoji: verb.emoji,  keyword: verb.text.toLowerCase() },
      { type: 'vocab', text: vocab.text, emoji: vocab.emoji, keyword: (vocab.keyword ?? vocab.text).toLowerCase() },
    ],
    blocks, available: blocks, selected: [],
  }
}

// Speak in target language (English, French, Catalan…)
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

// Speak in UI language (Spanish for Oliver's explanations, etymology, tips)
function doSpeakUI(text, rate = 0.85) {
  const synth = window.speechSynthesis
  if (!synth) return
  synth.cancel()
  const fire = () => {
    const utt  = new SpeechSynthesisUtterance(text)
    utt.lang   = UI_LANG
    utt.rate   = rate
    const all  = synth.getVoices()
    const voice = all.find((v) => v.lang === UI_LANG)
      ?? all.find((v) => v.lang === 'es-MX')
      ?? all.find((v) => v.lang.startsWith('es'))
    if (voice) utt.voice = voice
    synth.speak(utt)
  }
  synth.getVoices().length ? fire() : synth.addEventListener('voiceschanged', fire, { once: true })
}

// ─── Post-level conversation script ──────────────────────────────────────────
const CONV_SCENARIOS = {
  en: {
    intro:   'Usaste estas frases a la perfección. Ahora mira cómo suenan todas juntas en una situación real...',
    setting: '🏰 Oliver y tú exploran un castillo antiguo de noche. La conversación en inglés:',
    outro:   '¿Ves cómo fluye? Con 3 bloques construiste una historia completa. Eso es la Técnica Janulus.\n\nPowell Janulus dominó 42 idiomas así — bloque a bloque. Tú ya empezaste. 🌟',
  },
  fr: {
    intro:   '¡Aprendiste todo esto hoy! Mira cómo fluyen tus frases en una conversación real...',
    setting: '🗼 Oliver et toi vous promenez à Paris au coucher du soleil. La conversación en français:',
    outro:   'Voilà! Ya tienes tu primer francés conversacional. 🥐\n\nJanulus aprendió su francés exactamente así — bloque a bloque. El idioma más romántico del mundo está a tu alcance.',
  },
  ca: {
    intro:   '¡Hoy aprendiste muchísimo! Mira cómo fluyen tus frases en contexto real...',
    setting: '🌹 Oliver i tu visiteu el Barri Gòtic de Barcelona al capvespre. La conversa en català:',
    outro:   'Fantàstic! Ja parles català. 🌹\n\nEl catalán tiene 1,000 años de literatura. Hoy empezaste tu propia historia con él. Bloc a bloc.',
  },
}

function buildConversationScript(sentences, lang) {
  const sc = CONV_SCENARIOS[lang] ?? CONV_SCENARIOS.en
  const pool = sentences.slice(0, 7) // use up to 7 learned sentences
  return [
    { role: 'oliver',    text: sc.intro,   uiLang: true },
    { role: 'narration', text: sc.setting, uiLang: true },
    ...pool.map((text, i) => ({
      role: i % 2 === 0 ? 'oliver' : 'user',
      text,
      uiLang: false,
    })),
    { role: 'oliver', text: sc.outro, uiLang: true },
  ]
}

// ─── Shared UI components ────────────────────────────────────────────────────
function SpeedStrip({ rate, setRate, onListen }) {
  return (
    <div className="flex items-center justify-center gap-2 border-b border-border/30 bg-surface/40 px-4 py-1.5">
      <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted/50">Vel.</span>
      {SPEEDS.map((s) => (
        <button key={s.rate} type="button" onClick={() => setRate(s.rate)}
          className={`rounded-lg border px-2 py-1 text-[11px] font-bold transition-all
            ${rate === s.rate
              ? 'border-primary bg-primary/15 text-primary'
              : 'border-border/40 bg-surface text-text-muted hover:border-primary/30'}`}>
          {s.icon} {s.label}
        </button>
      ))}
      {onListen && (
        <button type="button" onClick={onListen}
          className="ml-1 rounded-lg border border-border/40 bg-surface px-2.5 py-1 text-[11px] font-semibold text-text-muted hover:border-primary/30 hover:text-primary">
          🔊
        </button>
      )}
    </div>
  )
}

function TopBar({ onBack, roundIdx, score, flash }) {
  return (
    <div className="flex items-center justify-between gap-2 border-b border-border bg-surface px-4 py-2.5">
      <button type="button" onClick={onBack}
        className="text-xs text-text-muted hover:text-text">← Mapa</button>
      <div className="flex items-center gap-2">
        <div className="h-2 w-24 overflow-hidden rounded-full bg-border/40">
          <div className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: `${(roundIdx / ROUNDS) * 100}%` }} />
        </div>
        <span className="text-xs text-text-muted">{roundIdx + 1}/{ROUNDS}</span>
      </div>
      <div className="relative min-w-[3rem] text-right">
        <span className="text-xs font-bold text-primary">{score} pts</span>
        {flash && (
          <span key={`fl-${roundIdx}`}
            className="absolute -top-4 right-0 animate-bounce text-[10px] font-black text-emerald-400">
            {flash}
          </span>
        )}
      </div>
    </div>
  )
}

function OliverBubble({ text, onRead, className = '' }) {
  return (
    <div className={`flex w-full items-start gap-3 rounded-2xl border border-amber-400/25 bg-amber-400/08 px-4 py-3 ${className}`}>
      <span className="mt-0.5 shrink-0 text-2xl">🐱</span>
      <div className="flex-1">
        <p className="whitespace-pre-line text-sm leading-relaxed text-amber-100/90">{text}</p>
        {onRead && (
          <button type="button" onClick={onRead}
            className="mt-1.5 flex items-center gap-1 text-[11px] text-amber-400/60 hover:text-amber-300">
            🔊 Leer en voz alta
          </button>
        )}
      </div>
    </div>
  )
}

// ─── Post-level Conversation Screen ──────────────────────────────────────────
function ConversationScreen({ sentences, lang, rate, onDone }) {
  const script = buildConversationScript(sentences, lang)
  const [lineIdx, setLineIdx] = useState(0)

  // Auto-speak each line when it appears
  useEffect(() => {
    const line = script[lineIdx]
    if (!line) return
    const fn = line.uiLang
      ? () => doSpeakUI(line.text, rate * 0.88)
      : () => doSpeak(line.text, lang, rate)
    const t = setTimeout(fn, 350)
    return () => clearTimeout(t)
  }, [lineIdx]) // eslint-disable-line react-hooks/exhaustive-deps

  const speakLine = (line) =>
    line.uiLang ? doSpeakUI(line.text, rate * 0.88) : doSpeak(line.text, lang, rate)

  const visible = script.slice(0, lineIdx + 1)
  const isLast  = lineIdx >= script.length - 1

  return (
    <div className="flex h-full flex-col bg-background text-text">
      <div className="flex items-center justify-between border-b border-border bg-surface px-4 py-2.5">
        <span className="text-sm font-bold">🗨️ Conversación de práctica</span>
        <span className="text-xs text-text-muted">{Math.min(lineIdx + 1, script.length)}/{script.length}</span>
      </div>

      <div className="flex flex-1 flex-col gap-3 overflow-auto px-4 py-4">
        {visible.map((line, i) => {
          if (line.role === 'narration') {
            return <p key={i} className="w-full text-center text-xs italic text-text-muted/60">{line.text}</p>
          }
          const isUser = line.role === 'user'
          return (
            <div key={i} className={`flex items-end gap-2 ${isUser ? 'flex-row-reverse' : ''}`}>
              <span className="shrink-0 text-2xl">{isUser ? '👤' : '🐱'}</span>
              <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                isUser
                  ? 'rounded-br-sm border border-primary/30 bg-primary/20'
                  : 'rounded-bl-sm border border-border/50 bg-surface'
              }`}>
                <p className="text-sm leading-relaxed">{line.text}</p>
                <button type="button" onClick={() => speakLine(line)}
                  className="mt-1 text-[10px] text-text-muted/40 hover:text-primary">
                  🔊
                </button>
              </div>
            </div>
          )
        })}
      </div>

      <div className="border-t border-border p-4">
        {isLast ? (
          <button type="button" onClick={onDone}
            className="w-full rounded-xl border-b-4 border-primary/50 bg-primary py-3 text-sm font-bold text-background transition-all active:translate-y-0.5 active:border-b-2">
            Ver mi puntuación 🏆
          </button>
        ) : (
          <button type="button" onClick={() => setLineIdx((n) => n + 1)}
            className="w-full rounded-xl border border-border/40 bg-surface py-3 text-sm font-semibold text-text-muted transition-colors hover:text-text">
            Siguiente →
          </button>
        )}
      </div>
    </div>
  )
}

// ────────────────────────────────────────────────────────────────────────────
export default function JanulingoEngine({ lang, levelNum, onDone, onBack }) {
  const ld = getJanulusLevel(lang, levelNum)

  const [rs, setRs] = useState(() => freshRS(ld))
  const { round, learnQueue, blocks, available, selected } = rs

  const hasIntro = !!ld?.oliversIntro
  const [phase,         setPhase]         = useState(hasIntro ? 'oliverIntro' : 'learn')
  const [learnIdx,      setLearnIdx]      = useState(0)
  const [learnInput,    setLearnInput]    = useState('')
  const [learnShake,    setLearnShake]    = useState(false)
  const [learnMistakes, setLearnMistakes] = useState(0)
  const [hintLetters,   setHintLetters]   = useState(0)
  const [celebration,   setCelebration]   = useState(null)  // { tip } — waits for user click

  const [buildMode,   setBuildMode]   = useState('type')
  const [typeAnswer,  setTypeAnswer]  = useState('')
  const [typeShake,   setTypeShake]   = useState(false)
  const [blockShake,  setBlockShake]  = useState(false)
  const [buildResult, setBuildResult] = useState(null)
  const [buildHints,  setBuildHints]  = useState(0)
  const [revealWords, setRevealWords] = useState(0)

  const [roundIdx,         setRoundIdx]         = useState(0)
  const [score,            setScore]            = useState(0)
  const [flash,            setFlash]            = useState(null)
  const [rate,             setRate]             = useState(0.75)
  const [learnedSentences, setLearnedSentences] = useState([])

  const scoreRef = useRef(0)
  const learnRef = useRef(null)
  const typeRef  = useRef(null)

  // ── All effects BEFORE any conditional returns (React rules) ─────────────
  useEffect(() => {
    if (phase === 'learn' && !celebration) learnRef.current?.focus()
  }, [phase, learnIdx, celebration])

  useEffect(() => {
    if (buildMode === 'type' && phase === 'build') typeRef.current?.focus()
  }, [buildMode, phase])

  // Auto-speak Oliver intro message
  useEffect(() => {
    if (phase !== 'oliverIntro' || !ld?.oliversIntro) return
    const t = setTimeout(() => doSpeakUI(ld.oliversIntro.message, 0.88), 900)
    return () => clearTimeout(t)
  }, [phase]) // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-speak definition when learn item changes (etymology is click-to-hear)
  useEffect(() => {
    if (phase !== 'learn' || !!celebration) return
    const item = learnQueue[learnIdx]
    if (!item) return
    const d = item.type === 'verb' ? round.verb : round.vocab
    const text = d?.definition ?? d?.etymology
    if (!text) return
    const t = setTimeout(() => doSpeakUI(text, 0.85), 750)
    return () => clearTimeout(t)
  }, [learnIdx, phase, celebration]) // eslint-disable-line react-hooks/exhaustive-deps

  // On correct answer: only the word itself is spoken (via speak() in handleLearnSubmit).
  // Celebration tip/definition/etymology are all optional — user clicks 🔊 to hear them.

  const currentItem = learnQueue[learnIdx]
  const speak = useCallback((text) => doSpeak(text ?? round.sentence, lang, rate), [round, lang, rate])

  // ── Oliver Intro ──────────────────────────────────────────────────────────
  if (phase === 'oliverIntro') {
    const { headline, message, technique, funFact } = ld.oliversIntro
    return (
      <div className="flex h-full flex-col bg-background text-text">
        <SpeedStrip rate={rate} setRate={setRate} onListen={() => doSpeakUI(message, 0.88)} />
        <div className="flex flex-1 flex-col items-center gap-5 overflow-auto px-4 py-6">
          <span style={{ fontSize: 72, filter: 'drop-shadow(0 6px 20px rgba(0,0,0,.6))' }}>🐱</span>
          <h2 className="text-center text-2xl font-black">{headline}</h2>

          <div className="w-full max-w-md space-y-3 rounded-2xl border border-amber-400/25 bg-amber-400/08 p-5">
            <p className="whitespace-pre-line text-sm leading-relaxed">{message}</p>
            <div className="rounded-xl border border-primary/20 bg-primary/08 p-3">
              <p className="mb-1.5 text-[10px] font-bold uppercase tracking-widest text-primary/70">Técnica Janulus</p>
              <p className="whitespace-pre-line font-mono text-xs text-text-muted">{technique}</p>
            </div>
            <p className="text-xs font-semibold text-amber-400">{funFact}</p>
            <button type="button" onClick={() => doSpeakUI(message, 0.88)}
              className="flex items-center gap-1.5 rounded-lg border border-amber-400/30 px-3 py-1.5 text-[11px] font-semibold text-amber-400/80 hover:text-amber-400">
              🔊 Leer introducción
            </button>
          </div>

          <button type="button" onClick={() => setPhase('learn')}
            className="rounded-2xl border-b-4 border-primary/50 bg-primary px-10 py-3.5 text-lg font-black text-background shadow-xl transition-all hover:opacity-95 active:translate-y-1 active:border-b-2">
            ¡Vamos! →
          </button>
        </div>
      </div>
    )
  }

  // ── Conversation screen ───────────────────────────────────────────────────
  if (phase === 'conversation') {
    return (
      <ConversationScreen
        sentences={learnedSentences}
        lang={lang}
        rate={rate}
        onDone={() => onDone(scoreRef.current)}
      />
    )
  }

  // ── Learn helpers ─────────────────────────────────────────────────────────
  function advanceLearn() {
    setLearnInput(''); setHintLetters(0); setCelebration(null)
    if (learnIdx + 1 >= learnQueue.length) setPhase('build')
    else setLearnIdx((i) => i + 1)
  }

  function handleLearnSubmit(e) {
    e?.preventDefault()
    if (celebration) { advanceLearn(); return }
    const typed = norm(learnInput)
    const ok    = typed === currentItem.keyword || typed === norm(currentItem.text)
    if (ok) {
      const data = currentItem.type === 'verb' ? round.verb : round.vocab
      setCelebration({ tip: data.oliversTip ?? data.etymology ?? null })
      speak(currentItem.text) // speak word in target language as confirmation
    } else {
      setLearnMistakes((m) => m + 1)
      setLearnShake(true)
      setTimeout(() => { setLearnShake(false); setLearnInput('') }, 600)
    }
  }

  function handleLearnHint() {
    const max = currentItem.keyword.length
    if (hintLetters < max) { setHintLetters((h) => h + 1); setLearnMistakes((m) => m + 1) }
    else speak(currentItem.text)
  }

  // ── Build helpers ─────────────────────────────────────────────────────────
  function handleTypeSubmit(e) {
    e?.preventDefault()
    if (buildResult) return
    if (norm(typeAnswer) === norm(round.sentence)) {
      handleCorrect()
    } else {
      setBuildResult('wrong'); setTypeShake(true)
      setTimeout(() => { setBuildResult(null); setTypeShake(false); setTypeAnswer('') }, 700)
    }
  }

  function handleBuildHint() {
    if (buildResult) return
    const n = buildHints + 1
    setBuildHints(n)
    if (n === 1) speak()
    else setRevealWords((r) => Math.min(r + 1, round.sentence.split(' ').length))
  }

  function handleSelect(block) {
    if (buildResult) return
    const newSel   = [...selected, block]
    const newAvail = available.filter((b) => !(b.id === block.id && b.type === block.type))
    if (newSel.length < 3) { setRs((p) => ({ ...p, selected: newSel, available: newAvail })); return }
    setRs((p) => ({ ...p, selected: newSel, available: [] }))
    if (newSel[0].type === 'base' && newSel[1].type === 'verb' && newSel[2].type === 'vocab') {
      handleCorrect()
    } else {
      setBuildResult('wrong'); setBlockShake(true)
      const cap = blocks
      setTimeout(() => { setBlockShake(false); setBuildResult(null); setRs((p) => ({ ...p, selected: [], available: cap })) }, 700)
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

  function handleCorrect() {
    const pts = calcScore(learnMistakes, buildHints)
    scoreRef.current += pts
    setScore(scoreRef.current)
    setFlash(`+${pts}`)
    setBuildResult('correct')
    setLearnedSentences((prev) => [...prev, round.sentence])
    const nextIdx = roundIdx + 1
    const [cl, cv] = [lang, levelNum]
    setTimeout(() => {
      if (nextIdx >= ROUNDS) { setPhase('conversation'); return }
      setRoundIdx(nextIdx)
      const newRS = freshRS(getJanulusLevel(cl, cv))
      setRs(newRS)
      setPhase('learn')
      setLearnIdx(0); setLearnInput(''); setLearnMistakes(0); setHintLetters(0); setCelebration(null)
      setBuildResult(null); setBuildHints(0); setRevealWords(0); setTypeAnswer(''); setFlash(null)
    }, 1200)
  }

  const hintDisplay      = currentItem
    ? currentItem.keyword.split('').map((ch, i) => (i < hintLetters ? ch : '·')).join(' ')
    : ''
  const sentenceWords    = round.sentence.split(' ')
  const revealedSentence = revealWords > 0
    ? sentenceWords.slice(0, revealWords).join(' ') + (revealWords < sentenceWords.length ? ' …' : '')
    : null

  // ── Learn phase ───────────────────────────────────────────────────────────
  if (phase === 'learn') {
    const isVerb    = currentItem?.type === 'verb'
    const learnData = isVerb ? round.verb : round.vocab

    return (
      <div className="flex h-full flex-col bg-background text-text">
        <TopBar onBack={onBack} roundIdx={roundIdx} score={score} flash={flash} />
        <SpeedStrip rate={rate} setRate={setRate} onListen={() => speak(currentItem?.text)} />

        <div className="flex flex-1 flex-col items-center gap-3 overflow-auto px-4 py-4">

          {/* Sentence context strip */}
          <div className="flex w-full max-w-md flex-wrap items-center gap-1.5 rounded-xl border border-border/25 bg-surface/40 px-3 py-2 text-xs">
            <span className={`rounded px-1.5 py-0.5 font-semibold ${C.base.filled}`}>{round.base.text}</span>
            {learnQueue.map((item, i) => (
              <span key={item.type}
                className={`rounded px-1.5 py-0.5 font-semibold transition-all
                  ${i < learnIdx
                    ? 'text-emerald-400/80 line-through'
                    : i === learnIdx && !celebration
                      ? 'animate-pulse border border-white/20 bg-white/10 text-white'
                      : i === learnIdx
                        ? C[item.type].filled
                        : 'text-text-muted/30'}`}>
                {i < learnIdx
                  ? `${learnQueue[i].emoji} ${learnQueue[i].keyword} ✓`
                  : i === learnIdx
                    ? `${item.emoji} ${celebration ? item.keyword : '?'}`
                    : '???'}
              </span>
            ))}
          </div>

          <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted/50">
            {isVerb ? 'Acción (verbo)' : 'Objeto'} · {learnIdx + 1}/{learnQueue.length}
          </p>

          {/* Animated visual */}
          <div className="w-full max-w-md">
            {isVerb
              ? <VerbAnimation verb={round.verb} size={80} />
              : (
                <div className="flex w-full items-center justify-center rounded-2xl"
                  style={{ background: 'radial-gradient(ellipse at 50% 40%,#1e1e3a,#0d0d20)', minHeight: 160 }}>
                  <span style={{ fontSize: 80, lineHeight: 1, filter: 'drop-shadow(0 8px 24px rgba(0,0,0,.7))' }}>
                    {round.vocab.emoji}
                  </span>
                </div>
              )
            }
          </div>

          <p className="text-center text-sm text-text-muted">
            {isVerb ? '¿Cómo se llama esta acción?' : '¿Cómo se llama este objeto?'}
          </p>

          {/* Definition + Examples — auto-spoken, prominent */}
          {learnData?.definition && !celebration && (
            <div className="flex w-full max-w-md items-start gap-2 rounded-xl border border-primary/20 bg-primary/06 px-3 py-2.5">
              <span className="mt-0.5 shrink-0 text-sm">📘</span>
              <div className="flex-1">
                <p className="text-[10px] font-bold uppercase tracking-widest text-primary/60">Definición</p>
                <p className="mt-0.5 text-[12px] leading-relaxed text-text/90">{learnData.definition}</p>
                <button type="button" onClick={() => doSpeakUI(learnData.definition, 0.85)}
                  className="mt-1 flex items-center gap-1 text-[10px] text-text-muted/40 hover:text-primary">
                  🔊 Escuchar
                </button>

                {learnData.examples?.length > 0 && (
                  <div className="mt-2.5 space-y-1.5 border-t border-primary/15 pt-2">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-primary/50">Ejemplos</p>
                    {learnData.examples.map((ex, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <div className="flex-1">
                          <p className="text-[12px] font-medium text-text/85">"{ex.s}"</p>
                          <p className="text-[11px] text-text-muted/60">{ex.t}</p>
                        </div>
                        <button type="button"
                          onClick={() => doSpeak(ex.s, lang, rate)}
                          className="mt-0.5 shrink-0 text-[11px] text-text-muted/30 hover:text-primary">
                          🔊
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Etymology — click-to-hear */}
          {learnData?.etymology && !celebration && (
            <div className="flex w-full max-w-md items-start gap-2 rounded-xl border border-border/20 bg-surface/50 px-3 py-2.5">
              <span className="mt-0.5 shrink-0 text-sm">📖</span>
              <div className="flex-1">
                <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted/40">Etimología</p>
                <p className="mt-0.5 text-[11px] leading-relaxed text-text-muted/80">{learnData.etymology}</p>
                <button type="button" onClick={() => doSpeakUI(learnData.etymology, 0.85)}
                  className="mt-1 flex items-center gap-1 text-[10px] text-text-muted/40 hover:text-primary">
                  🔊 Escuchar
                </button>
              </div>
            </div>
          )}

          {/* Celebration — word was auto-spoken in handleLearnSubmit; everything else is click-to-hear */}
          {celebration && (
            <div className="w-full max-w-md space-y-3">
              <p className="text-center text-sm font-bold text-emerald-400">✅ ¡Correcto!</p>

              {/* Definition recap with examples */}
              {learnData?.definition && (
                <div className="rounded-xl border border-primary/20 bg-primary/06 px-3 py-2.5 text-[12px]">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-primary/60">Definición</p>
                  <p className="mt-0.5 leading-relaxed text-text/90">{learnData.definition}</p>
                  <button type="button" onClick={() => doSpeakUI(learnData.definition, 0.85)}
                    className="mt-1 flex items-center gap-1 text-[10px] text-text-muted/40 hover:text-primary">
                    🔊 Escuchar
                  </button>
                  {learnData.examples?.length > 0 && (
                    <div className="mt-2 space-y-1.5 border-t border-primary/15 pt-2">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-primary/50">Ejemplos</p>
                      {learnData.examples.map((ex, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <div className="flex-1">
                            <p className="font-medium text-text/85">"{ex.s}"</p>
                            <p className="text-[11px] text-text-muted/60">{ex.t}</p>
                          </div>
                          <button type="button"
                            onClick={() => doSpeak(ex.s, lang, rate)}
                            className="mt-0.5 shrink-0 text-[11px] text-text-muted/30 hover:text-primary">
                            🔊
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Oliver tip — click-to-hear only */}
              {celebration.tip && (
                <OliverBubble
                  text={celebration.tip}
                  onRead={() => doSpeakUI(celebration.tip, 0.88)}
                />
              )}

              <div className="flex justify-center">
                <button type="button" onClick={advanceLearn}
                  className="rounded-xl border-b-4 border-primary/50 bg-primary px-6 py-2.5 text-sm font-bold text-background active:translate-y-0.5 active:border-b-2">
                  Continuar →
                </button>
              </div>
            </div>
          )}

          {/* Input */}
          {!celebration && (
            <>
              <form onSubmit={handleLearnSubmit}
                className={`flex w-full max-w-md gap-2 ${learnShake ? 'janulus-shake' : ''}`}>
                <input
                  ref={learnRef}
                  value={learnInput}
                  onChange={(e) => setLearnInput(e.target.value)}
                  placeholder="Escribe la palabra…"
                  autoComplete="off"
                  spellCheck={false}
                  className="flex-1 rounded-xl border border-border/50 bg-surface/60 px-4 py-2.5 text-sm font-medium text-text outline-none placeholder:text-text-muted/40 focus:border-primary/60 focus:ring-1 focus:ring-primary/30"
                />
                <button type="submit" disabled={!learnInput.trim()}
                  className="rounded-xl border-b-4 border-primary/50 bg-primary px-4 py-2.5 text-sm font-bold text-background transition-all active:translate-y-0.5 active:border-b-2 disabled:opacity-40">
                  ✓
                </button>
              </form>

              {learnShake && <p className="text-sm font-bold text-red-400">❌ Inténtalo de nuevo</p>}

              {hintLetters > 0 && (
                <p className="font-mono text-lg tracking-[0.3em] text-primary">{hintDisplay}</p>
              )}

              <div className="flex gap-2">
                <button type="button" onClick={handleLearnHint}
                  className="flex items-center gap-1.5 rounded-xl border border-amber-400/30 bg-amber-400/10 px-3 py-1.5 text-xs font-semibold text-amber-300 hover:bg-amber-400/20">
                  💡 {hintLetters === 0 ? 'Pista' : hintLetters < (currentItem?.keyword.length ?? 99) ? 'Más' : '🔊 Escuchar'}
                </button>
                <button type="button" onClick={() => { setLearnMistakes((m) => m + 5); advanceLearn() }}
                  className="rounded-xl border border-border/25 px-3 py-1.5 text-xs text-text-muted/50 hover:text-text-muted">
                  Saltar →
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    )
  }

  // ── Build phase ───────────────────────────────────────────────────────────
  return (
    <div className="flex h-full flex-col bg-background text-text">
      <TopBar onBack={onBack} roundIdx={roundIdx} score={score} flash={flash} />
      <SpeedStrip rate={rate} setRate={setRate} onListen={() => speak()} />

      <div className="flex flex-1 flex-col items-center gap-3 overflow-auto px-4 py-4">

        {/* Recipe strip */}
        <div className="flex w-full max-w-md flex-wrap items-center justify-center gap-1.5 rounded-2xl border border-border/30 bg-surface/60 px-4 py-3">
          <span className={`rounded-lg border px-2.5 py-1 text-xs font-semibold ${C.base.filled}`}>
            {C.base.dot} {round.base.text}
          </span>
          <span className="text-[10px] text-text-muted/30">+</span>
          <span className={`rounded-lg border px-2.5 py-1 text-xs font-semibold ${C.verb.filled}`}>
            {round.verb.emoji} {round.verb.text}
          </span>
          <span className="text-[10px] text-text-muted/30">+</span>
          <span className={`rounded-lg border px-2.5 py-1 text-xs font-semibold ${C.vocab.filled}`}>
            {round.vocab.emoji} {round.vocab.text}
          </span>
        </div>

        <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted/50">
          Construye la oración completa
        </p>

        {/* Mode toggle */}
        <div className="flex overflow-hidden rounded-xl border border-border text-xs font-bold">
          {[['type','✍️ Escribir'], ['blocks','🧩 Bloques']].map(([m, label]) => (
            <button key={m} type="button" onClick={() => setBuildMode(m)}
              className={`flex items-center gap-1.5 px-4 py-2 transition-colors
                ${buildMode === m ? 'bg-primary text-background' : 'text-text-muted hover:text-text'}`}>
              {label}
            </button>
          ))}
        </div>

        {/* ── TYPE MODE ── */}
        {buildMode === 'type' && (
          <div className="flex w-full max-w-md flex-col gap-3">
            <form onSubmit={handleTypeSubmit}
              className={`flex gap-2 ${typeShake ? 'janulus-shake' : ''}`}>
              <input
                ref={typeRef}
                value={typeAnswer}
                onChange={(e) => setTypeAnswer(e.target.value)}
                placeholder="Escribe la frase completa…"
                autoComplete="off"
                spellCheck={false}
                disabled={buildResult === 'correct'}
                className={`flex-1 rounded-xl border bg-surface/60 px-4 py-3 text-sm font-medium text-text outline-none placeholder:text-text-muted/40 focus:ring-1 focus:ring-primary/30
                  ${buildResult === 'correct' ? 'border-emerald-500/50 text-emerald-300'
                    : buildResult === 'wrong'  ? 'border-red-500/40'
                    : 'border-border/50 focus:border-primary/60'}`}
              />
              <button type="submit" disabled={!typeAnswer.trim() || buildResult === 'correct'}
                className="rounded-xl border-b-4 border-primary/50 bg-primary px-4 py-3 text-sm font-bold text-background transition-all active:translate-y-0.5 active:border-b-2 disabled:opacity-40">
                ✓
              </button>
            </form>

            {buildResult === 'correct' && <p className="text-center text-sm font-bold text-emerald-400">✅ ¡Perfecto!</p>}
            {buildResult === 'wrong'   && <p className="text-center text-sm font-bold text-red-400">❌ Inténtalo de nuevo</p>}

            <div className="flex justify-center">
              <button type="button" onClick={handleBuildHint} disabled={!!buildResult}
                className="flex items-center gap-1.5 rounded-xl border border-amber-400/30 bg-amber-400/10 px-3 py-1.5 text-xs font-semibold text-amber-300 hover:bg-amber-400/20 disabled:opacity-40">
                💡 {buildHints === 0 ? 'Pista (escuchar)' : 'Revelar palabra'}
              </button>
            </div>
            {revealedSentence && (
              <p className="text-center font-mono text-sm tracking-wide text-primary">{revealedSentence}</p>
            )}
          </div>
        )}

        {/* ── BLOCKS MODE ── */}
        {buildMode === 'blocks' && (
          <div className="flex w-full max-w-md flex-col items-center gap-4">
            <div className={`flex w-full gap-2 ${blockShake ? 'janulus-shake' : ''}`}>
              {(['base','verb','vocab']).map((type, i) => {
                const block = selected[i]
                const c = C[type]
                return (
                  <button key={`slot-${i}`} type="button"
                    onClick={() => block && handleDeselect(block)}
                    disabled={!block || !!buildResult}
                    className={`flex min-h-[3.5rem] flex-1 flex-col items-center justify-center gap-0.5 rounded-xl border-2 px-2 py-2 text-xs font-semibold transition-all
                      ${block ? `cursor-pointer ${c.filled} shadow-sm` : 'cursor-default border-dashed border-white/10 bg-transparent'}`}>
                    {block
                      ? <><span className="text-base">{block.emoji ?? ''}</span><span className="text-center text-[11px] leading-tight">{block.text}</span></>
                      : <><span className="text-base">{c.dot}</span><span className="text-[10px] text-text-muted/40">{c.label}</span></>
                    }
                  </button>
                )
              })}
            </div>

            <p className="text-[10px] text-text-muted/40">
              Orden: {C.base.dot} Estructura → {C.verb.dot} Verbo → {C.vocab.dot} Objeto
            </p>

            {buildResult === 'correct' && <p className="text-sm font-bold text-emerald-400">✅ ¡Correcto!</p>}
            {buildResult === 'wrong'   && <p className="text-sm font-bold text-red-400">❌ Orden incorrecto</p>}

            <div className="flex flex-wrap justify-center gap-2">
              {available.map((b) => {
                const c = C[b.type]
                return (
                  <button key={`av_${b.type}_${b.id}`} type="button" onClick={() => handleSelect(b)}
                    className={`rounded-xl border-2 border-b-4 px-4 py-2.5 text-sm font-bold transition-all active:translate-y-1 active:border-b-2 ${c.filled}`}>
                    {b.emoji ? `${b.emoji} ` : ''}{b.text}
                  </button>
                )
              })}
            </div>

            <button type="button" onClick={handleBuildHint} disabled={!!buildResult}
              className="flex items-center gap-1.5 rounded-xl border border-amber-400/30 bg-amber-400/10 px-3 py-1.5 text-xs font-semibold text-amber-300 hover:bg-amber-400/20 disabled:opacity-40">
              🐱 Pista {buildHints > 0 && `(${buildHints})`}
            </button>

            {buildHints > 0 && (
              <OliverBubble
                text={buildHints === 1
                  ? 'Escucha la frase despacio. 🔊 El oído reconoce el orden antes que la mente.'
                  : `La frase empieza con "${round.base.text}"… ¿qué va después?`}
                onRead={() => buildHints === 1
                  ? speak()
                  : doSpeakUI(`La frase empieza con ${round.base.text}`, 0.88)}
              />
            )}
          </div>
        )}
      </div>
    </div>
  )
}
