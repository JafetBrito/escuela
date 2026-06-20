import { useState, useRef, useCallback, useEffect, useMemo } from 'react'
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

// ── TTS helpers ───────────────────────────────────────────────────────────────

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

// Read English-language text in en-US voice
function doSpeakEN(text, rate = 0.85) {
  doSpeak(text, 'en', rate)
}

// ── Conversation: coherent story prompts ──────────────────────────────────────

function getOliverPrompt(sentence) {
  const s = sentence.toLowerCase()
  // vocab-first matching (most specific)
  if (s.includes('key') || s.includes('clé') || s.includes('clau'))
    return s.includes('find') || s.includes('trouver') || s.includes('trobar')
      ? "The door ahead is locked tight! We need to get through. What are you going to do?"
      : "We have this locked chest right here. Tell me — what can you do with it?"
  if (s.includes('torch')) return "It's pitch dark in this tunnel. I can't see anything at all! What should we do?"
  if (s.includes('apple') || s.includes('pomme') || s.includes('poma'))
    return "After hours of exploring these tunnels, we're both starving. I see a fruit tree over there! What do you want?"
  if (s.includes('water') || s.includes('eau') || s.includes('aigua'))
    return "We've been walking for so long in the heat. I'm incredibly thirsty. What do we need right now?"
  if (s.includes('candle') || s.includes('bougie') || s.includes('espelma'))
    return "Look — there's a faint flickering light in that dark corner. Tell me, what can you see?"
  if (s.includes('mirror') || s.includes('miroir') || s.includes('mirall'))
    return "Something is reflecting light on that old stone wall over there. What do you see?"
  if (s.includes('bell') || s.includes('cloche') || s.includes('campana'))
    return "Legend says there's a magic bell hidden somewhere in this tower. What are we looking for?"
  if (s.includes('compass') || s.includes('boussole') || s.includes('brúixola'))
    return "We keep going in circles in these tunnels! Do you have any idea how we navigate?"
  if (s.includes('ladder')) return "The treasure is up on that high ledge — but there's no way up! What do we need?"
  if (s.includes('bucket') || s.includes('seau'))
    return "Water is flooding the passage! We need something to bail it out. What do you suggest?"
  if (s.includes('book') || s.includes('livre') || s.includes('llibre'))
    return "We found the castle's secret library! Dusty old tomes everywhere. What do you want to do?"
  if (s.includes('map') || s.includes('mapa'))
    return "We're completely lost in this maze. We have an old parchment... how can it help us?"
  // abstract / L2 vocab
  if (s.includes('language') || s.includes('idioma'))
    return "Learning a new language is our greatest adventure! What's your biggest goal right now?"
  if (s.includes('culture') || s.includes('cultura'))
    return "Every place we visit has its own unique way of life. What do you want to do?"
  if (s.includes('vocabulary') || s.includes('vocabulario'))
    return "Words are the keys to every door in this castle! What do you need to work on?"
  if (s.includes('pronunciation') || s.includes('pronunciación') || s.includes('pronunciation'))
    return "Speaking a language perfectly is its own kind of adventure. What are you working on?"
  if (s.includes('grammar') || s.includes('gramática'))
    return "The rules of language are like a map of the castle — without them you get lost! What's your goal?"
  if (s.includes('tradition') || s.includes('tradición'))
    return "Every culture has its ancient customs and secrets. What do you want to discover?"
  if (s.includes('history') || s.includes('historia'))
    return "The past holds all the secrets of this place! What do you want to do?"
  if (s.includes('skill') || s.includes('habilidad'))
    return "Every day in this adventure makes us stronger. What are you working toward?"
  if (s.includes('discover') || s.includes('explore'))
    return "The world beyond this door is full of wonders. What do you want to do?"
  if (s.includes('remember')) return "Our journey will fill our minds with new knowledge. What do you need to do?"
  if (s.includes('appreciate')) return "This castle is teaching us to see beauty everywhere. What have you learned to do?"
  // verb fallbacks
  if (s.includes('open') || s.includes('ouvrir') || s.includes('obrir'))
    return "There's a massive door blocking our path forward. What can you do?"
  if (s.includes('carry') || s.includes('porter') || s.includes('portar'))
    return "We need to bring supplies for the journey ahead. What are you going to do?"
  if (s.includes('find') || s.includes('trouver') || s.includes('trobar'))
    return "Something important is hidden in this castle. What are you going to do?"
  if (s.includes('use') || s.includes('utiliser') || s.includes('fer servir'))
    return "We have tools at our disposal. What are you going to do with them?"
  if (s.includes('see') || s.includes('voir') || s.includes('veure'))
    return "Something caught your eye in the shadows. Tell me — what do you see?"
  if (s.includes('hold')) return "I need both hands free to pick the lock. Can you help me?"
  return "¡Momento clave en nuestra aventura! Say what you would do next."
}

const CONV_SCENARIOS = {
  en: {
    intro:   'You used these phrases perfectly. Now watch how they all come together in a real situation...',
    setting: '🏰 You and Oliver are exploring an ancient castle at night. The lanterns are burning low...',
    outro:   "You see? With just 3 blocks, you told an entire story. That's the Janulus Technique.\n\nPowell Janulus mastered 42 languages exactly like this — block by block. You've already started. 🌟",
  },
  fr: {
    intro:   'Tu as utilisé ces phrases parfaitement! Regarde comment elles coulent dans une situation réelle...',
    setting: '🗼 Oliver et toi vous promenez dans un vieux château au coucher du soleil...',
    outro:   'Voilà! Tu as maintenant ton premier français conversationnel. 🥐\n\nJanulus a appris son français exactement comme ça — bloc à bloc. Le plus beau des idiomes est à ta portée.',
  },
  ca: {
    intro:   'Has fet servir aquestes frases perfectament! Mira com flueixen en una situació real...',
    setting: '🌹 Oliver i tu visiteu el Barri Gòtic de Barcelona de nit. Les llums de gas il·luminen el carrer...',
    outro:   'Fantàstic! Ja parles català. 🌹\n\nEl català té 1,000 anys de literatura. Avui has començat la teva pròpia història. Bloc a bloc.',
  },
}

function buildConversationScript(sentences, lang) {
  const sc = CONV_SCENARIOS[lang] ?? CONV_SCENARIOS.en
  const pool = sentences.slice(0, 7)
  const exchanges = pool.flatMap((sentence) => [
    { role: 'oliver', text: getOliverPrompt(sentence), uiLang: false },
    { role: 'user',   text: sentence, uiLang: false, expected: sentence },
  ])
  return [
    { role: 'oliver',    text: sc.intro,   uiLang: false },
    { role: 'narration', text: sc.setting, uiLang: false },
    ...exchanges,
    { role: 'oliver', text: sc.outro, uiLang: false },
  ]
}

// ── Shared sub-components ──────────────────────────────────────────────────────

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
      <button type="button" onClick={onBack} className="text-xs text-text-muted hover:text-text">← Mapa</button>
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

// ── Active user turn: type OR tap word tiles ──────────────────────────────────

function ActiveUserTurn({ line, lang, rateRef, userInput, setUserInput, shake, inputRef, onSubmit }) {
  const tiles = useMemo(() => shuffle(line.expected.split(' ')), [line.expected])

  function appendWord(word) {
    setUserInput((prev) => {
      const cur = prev.trim()
      return cur ? cur + ' ' + word : word
    })
    inputRef.current?.focus()
  }

  return (
    <div className="flex items-end gap-2 flex-row-reverse">
      <span className="shrink-0 text-2xl">👤</span>
      <div className="flex-1 max-w-[82%] space-y-2">
        <form onSubmit={onSubmit} className={`flex gap-2 ${shake ? 'janulus-shake' : ''}`}>
          <input
            ref={inputRef}
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Escribe o toca las palabras…"
            autoComplete="off"
            spellCheck={false}
            className="flex-1 rounded-xl border border-primary/40 bg-surface px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/30"
          />
          <button type="submit" disabled={!userInput.trim()}
            className="rounded-xl border-b-4 border-primary/50 bg-primary px-3 py-2.5 text-sm font-bold text-background disabled:opacity-40 active:translate-y-0.5 active:border-b-2">
            →
          </button>
        </form>

        {/* Word tiles */}
        <div className="flex flex-wrap gap-1.5">
          {tiles.map((word, ti) => (
            <button key={ti} type="button" onClick={() => appendWord(word)}
              className="rounded-lg border border-primary/30 bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary transition-all hover:bg-primary/20 active:scale-95">
              {word}
            </button>
          ))}
          {userInput && (
            <button type="button" onClick={() => setUserInput('')}
              className="rounded-lg border border-border/30 px-2 py-1 text-[10px] text-text-muted/50 hover:text-text-muted">
              ✕
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5 text-[10px] text-text-muted/40">
          <span>Frase:</span>
          <span className="font-mono text-primary/60">{line.expected}</span>
          <button type="button" onClick={() => doSpeak(line.expected, lang, rateRef.current)}
            className="hover:text-primary">🔊</button>
        </div>
      </div>
    </div>
  )
}

// ── Conversation Screen with typing ───────────────────────────────────────────

function ConversationScreen({ sentences, lang, rate, onDone }) {
  const script     = buildConversationScript(sentences, lang)
  const rateRef    = useRef(rate)
  const inputRef   = useRef(null)
  const bottomRef  = useRef(null)

  const [idx,       setIdx]       = useState(0)
  const [userInput, setUserInput] = useState('')
  const [shake,     setShake]     = useState(false)
  const [submitted, setSubmitted] = useState({})  // {lineIdx: typedText}

  useEffect(() => { rateRef.current = rate }, [rate])

  const line   = script[idx]
  const isDone = idx >= script.length

  // Auto-speak oliver + setting lines when they appear
  useEffect(() => {
    if (!line || line.role === 'user') return
    const fn = line.uiLang
      ? () => doSpeakUI(line.text, rateRef.current)
      : () => doSpeak(line.text, lang, rateRef.current)
    const t = setTimeout(fn, 350)
    return () => clearTimeout(t)
  }, [idx]) // eslint-disable-line

  // Auto-advance narration after 2s
  useEffect(() => {
    if (line?.role !== 'narration') return
    const t = setTimeout(() => setIdx((n) => n + 1), 2000)
    return () => clearTimeout(t)
  }, [idx]) // eslint-disable-line

  // Focus input when user's turn arrives
  useEffect(() => {
    if (line?.role === 'user') setTimeout(() => inputRef.current?.focus(), 150)
  }, [idx]) // eslint-disable-line

  // Scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [idx, submitted])

  function advance() { setIdx((n) => n + 1) }

  function handleUserSubmit(e) {
    e?.preventDefault()
    if (!line?.expected) return
    const typed    = norm(userInput)
    const expected = norm(line.expected)
    if (typed === expected) {
      doSpeak(line.expected, lang, rateRef.current)
      setSubmitted((p) => ({ ...p, [idx]: userInput }))
      setUserInput('')
      setTimeout(advance, 700)
    } else {
      setShake(true)
      setTimeout(() => setShake(false), 500)
    }
  }

  const visible = script.slice(0, isDone ? script.length : idx + 1)

  return (
    <div className="flex h-full flex-col bg-background text-text">
      <div className="flex items-center justify-between border-b border-border bg-surface px-4 py-2.5">
        <span className="text-sm font-bold">🗨️ Conversación de práctica</span>
        <span className="text-xs text-text-muted">{Math.min(idx + 1, script.length)}/{script.length}</span>
      </div>

      <div className="flex flex-1 flex-col gap-3 overflow-auto px-4 py-4">
        {visible.map((l, i) => {
          if (l.role === 'narration') {
            return <p key={i} className="w-full text-center text-xs italic text-text-muted/60 py-1">{l.text}</p>
          }

          const isUser          = l.role === 'user'
          const isActiveUserTurn = isUser && i === idx && submitted[i] === undefined
          const isPastUser       = isUser && (submitted[i] !== undefined || i < idx)
          const displayText      = isPastUser ? (submitted[i] ?? l.expected) : l.text

          if (isActiveUserTurn) {
            return (
              <ActiveUserTurn
                key={i}
                line={l}
                lang={lang}
                rateRef={rateRef}
                userInput={userInput}
                setUserInput={setUserInput}
                shake={shake}
                inputRef={inputRef}
                onSubmit={handleUserSubmit}
              />
            )
          }

          return (
            <div key={i} className={`flex items-end gap-2 ${isUser ? 'flex-row-reverse' : ''}`}>
              <span className="shrink-0 text-2xl">{isUser ? '👤' : '🐱'}</span>
              <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                isUser
                  ? 'rounded-br-sm border border-primary/30 bg-primary/20'
                  : 'rounded-bl-sm border border-border/50 bg-surface'
              }`}>
                <p className="text-sm leading-relaxed">{displayText}</p>
                {!isUser && (
                  <button type="button"
                    onClick={() => l.uiLang ? doSpeakUI(l.text, rateRef.current) : doSpeak(l.text, lang, rateRef.current)}
                    className="mt-1 text-[10px] text-text-muted/40 hover:text-primary">🔊</button>
                )}
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      <div className="border-t border-border p-4">
        {isDone ? (
          <button type="button" onClick={onDone}
            className="w-full rounded-xl border-b-4 border-primary/50 bg-primary py-3 text-sm font-bold text-background transition-all active:translate-y-0.5 active:border-b-2">
            Ver mi puntuación 🏆
          </button>
        ) : line?.role === 'oliver' ? (
          <button type="button" onClick={advance}
            className="w-full rounded-xl border border-border/40 bg-surface py-3 text-sm font-semibold text-text-muted transition-colors hover:text-text">
            Siguiente →
          </button>
        ) : null /* narration auto-advances; user line shows own button */}
      </div>
    </div>
  )
}

// ── Main engine ────────────────────────────────────────────────────────────────

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
  const [celebration,   setCelebration]   = useState(null)

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
  const rateRef  = useRef(0.75)
  const learnRef = useRef(null)
  const typeRef  = useRef(null)

  // ── All effects BEFORE any conditional returns (React rules) ────────────────

  // Sync rate → rateRef so auto-speak effects always use the current value
  useEffect(() => { rateRef.current = rate }, [rate])

  useEffect(() => {
    if (phase === 'learn' && !celebration) learnRef.current?.focus()
  }, [phase, learnIdx, celebration])

  useEffect(() => {
    if (buildMode === 'type' && phase === 'build') typeRef.current?.focus()
  }, [buildMode, phase])

  // Auto-speak Oliver intro
  useEffect(() => {
    if (phase !== 'oliverIntro' || !ld?.oliversIntro) return
    const t = setTimeout(() => doSpeakUI(ld.oliversIntro.message, rateRef.current), 900)
    return () => clearTimeout(t)
  }, [phase]) // eslint-disable-line

  // Learn phase: speak WORD first (t=450), then Spanish definition (t=2500)
  useEffect(() => {
    if (phase !== 'learn' || !!celebration) return
    const item = learnQueue[learnIdx]
    if (!item) return
    const d    = item.type === 'verb' ? round.verb : round.vocab
    const t1   = setTimeout(() => doSpeak(item.text, lang, rateRef.current), 450)
    const defEs = d?.definition
    const t2   = defEs ? setTimeout(() => doSpeakUI(defEs, rateRef.current), 2500) : null
    return () => { clearTimeout(t1); if (t2) clearTimeout(t2) }
  }, [learnIdx, phase, celebration]) // eslint-disable-line

  // Build phase: auto-speak the full sentence when entering build
  useEffect(() => {
    if (phase !== 'build') return
    const t = setTimeout(() => doSpeak(round.sentence, lang, rateRef.current), 600)
    return () => clearTimeout(t)
  }, [phase]) // eslint-disable-line

  // On correct answer: only the word itself is auto-spoken (via speak() in handleLearnSubmit).
  // All celebration text (definition, etymology, Oliver tip) is click-to-hear only.

  const currentItem = learnQueue[learnIdx]
  const speak = useCallback((text) => doSpeak(text ?? round.sentence, lang, rate), [round, lang, rate])

  // ── Oliver Intro ─────────────────────────────────────────────────────────────
  if (phase === 'oliverIntro') {
    const { headline, message, technique, funFact } = ld.oliversIntro
    return (
      <div className="flex h-full flex-col bg-background text-text">
        <SpeedStrip rate={rate} setRate={setRate} onListen={() => doSpeakUI(message, rateRef.current)} />
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
            <button type="button" onClick={() => doSpeakUI(message, rateRef.current)}
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

  // ── Conversation screen ───────────────────────────────────────────────────────
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

  // ── Learn helpers ─────────────────────────────────────────────────────────────
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
      speak(currentItem.text) // speak word in target language
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

  // ── Build helpers ─────────────────────────────────────────────────────────────
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

  // ── Learn phase ───────────────────────────────────────────────────────────────
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

          {/* Definition card — Spanish + English, auto-spoken via useEffect */}
          {learnData?.definition && !celebration && (
            <div className="flex w-full max-w-md items-start gap-2 rounded-xl border border-primary/20 bg-primary/06 px-3 py-2.5">
              <span className="mt-0.5 shrink-0 text-sm">📘</span>
              <div className="flex-1 space-y-1.5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-primary/60">Definición</p>

                {/* Spanish */}
                <div className="flex items-start justify-between gap-2">
                  <p className="text-[12px] leading-relaxed text-text/90">🇪🇸 {learnData.definition}</p>
                  <button type="button" onClick={() => doSpeakUI(learnData.definition, rateRef.current)}
                    className="shrink-0 text-[11px] text-text-muted/40 hover:text-primary">🔊</button>
                </div>

                {/* English */}
                {learnData.definitionEn && (
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-[12px] leading-relaxed text-text/70">🇬🇧 {learnData.definitionEn}</p>
                    <button type="button" onClick={() => doSpeakEN(learnData.definitionEn, rateRef.current)}
                      className="shrink-0 text-[11px] text-text-muted/40 hover:text-primary">🔊</button>
                  </div>
                )}

                {/* Examples */}
                {learnData.examples?.length > 0 && (
                  <div className="border-t border-primary/15 pt-2 space-y-1.5">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-primary/50">Ejemplos</p>
                    {learnData.examples.map((ex, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <div className="flex-1">
                          <p className="text-[12px] font-medium text-text/85">"{ex.s}"</p>
                          <p className="text-[11px] text-text-muted/60">{ex.t}</p>
                        </div>
                        <button type="button" onClick={() => doSpeak(ex.s, lang, rateRef.current)}
                          className="shrink-0 text-[11px] text-text-muted/30 hover:text-primary">🔊</button>
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
              <div className="flex-1 space-y-1.5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted/40">Etimología</p>
                <div className="flex items-start justify-between gap-2">
                  <p className="text-[11px] leading-relaxed text-text-muted/80">🇪🇸 {learnData.etymology}</p>
                  <button type="button" onClick={() => doSpeakUI(learnData.etymology, rateRef.current)}
                    className="shrink-0 text-[10px] text-text-muted/40 hover:text-primary">🔊</button>
                </div>
                {learnData.etymologyEn && (
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-[11px] leading-relaxed text-text-muted/60">🇬🇧 {learnData.etymologyEn}</p>
                    <button type="button" onClick={() => doSpeakEN(learnData.etymologyEn, rateRef.current)}
                      className="shrink-0 text-[10px] text-text-muted/40 hover:text-primary">🔊</button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Celebration — word was spoken in handleLearnSubmit; everything else click-to-hear */}
          {celebration && (
            <div className="w-full max-w-md space-y-3">
              <p className="text-center text-sm font-bold text-emerald-400">✅ ¡Correcto!</p>

              {/* Definition + examples recap */}
              {learnData?.definition && (
                <div className="rounded-xl border border-primary/20 bg-primary/06 px-3 py-2.5">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-primary/60">Definición</p>
                  <div className="mt-1 space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-[12px] leading-relaxed text-text/90">🇪🇸 {learnData.definition}</p>
                      <button type="button" onClick={() => doSpeakUI(learnData.definition, rateRef.current)}
                        className="shrink-0 text-[11px] text-text-muted/40 hover:text-primary">🔊</button>
                    </div>
                    {learnData.definitionEn && (
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-[12px] leading-relaxed text-text/70">🇬🇧 {learnData.definitionEn}</p>
                        <button type="button" onClick={() => doSpeakEN(learnData.definitionEn, rateRef.current)}
                          className="shrink-0 text-[11px] text-text-muted/40 hover:text-primary">🔊</button>
                      </div>
                    )}
                    {learnData.examples?.length > 0 && (
                      <div className="border-t border-primary/15 pt-2 space-y-1.5">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-primary/50">Ejemplos</p>
                        {learnData.examples.map((ex, i) => (
                          <div key={i} className="flex items-start gap-2">
                            <div className="flex-1">
                              <p className="text-[12px] font-medium text-text/85">"{ex.s}"</p>
                              <p className="text-[11px] text-text-muted/60">{ex.t}</p>
                            </div>
                            <button type="button" onClick={() => doSpeak(ex.s, lang, rateRef.current)}
                              className="shrink-0 text-[11px] text-text-muted/30 hover:text-primary">🔊</button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Oliver tip — click-to-hear */}
              {celebration.tip && (
                <OliverBubble
                  text={celebration.tip}
                  onRead={() => doSpeakUI(celebration.tip, rateRef.current)}
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

  // ── Build phase ───────────────────────────────────────────────────────────────
  return (
    <div className="flex h-full flex-col bg-background text-text">
      <TopBar onBack={onBack} roundIdx={roundIdx} score={score} flash={flash} />
      <SpeedStrip rate={rate} setRate={setRate} onListen={() => speak()} />

      <div className="flex flex-1 flex-col items-center gap-3 overflow-auto px-4 py-4">

        {/* Visual cards — verb animation + vocab emoji */}
        <div className="flex w-full max-w-md gap-3">
          <div className="flex flex-1 flex-col items-center">
            <VerbAnimation verb={round.verb} size={56} />
            <p className="mt-1.5 text-center text-[11px] font-bold text-emerald-300">{round.verb.text}</p>
          </div>
          <div className="flex flex-1 flex-col items-center justify-center rounded-2xl"
            style={{ background: 'radial-gradient(ellipse at 50% 40%,#1e1e3a,#0d0d20)', minHeight: 110 }}>
            <span style={{ fontSize: 52, lineHeight: 1, filter: 'drop-shadow(0 6px 18px rgba(0,0,0,.7))' }}>
              {round.vocab.emoji}
            </span>
            <p className="mt-1.5 text-center text-[11px] font-bold text-purple-300">{round.vocab.text}</p>
          </div>
        </div>

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
                  : doSpeakUI(`La frase empieza con ${round.base.text}`, rateRef.current)}
              />
            )}
          </div>
        )}
      </div>
    </div>
  )
}
