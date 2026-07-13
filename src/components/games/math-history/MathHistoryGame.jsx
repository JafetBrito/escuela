import { useState, useEffect } from 'react'
import {
  MATH_ERAS,
  EGYPT_FRACTIONS,
  generateEgyptianNumeralProblem,
  EGYPT_NUMERALS,
} from '../../../data/mathHistoryRegistry'
import { useCurrencyStore } from '../../../stores/useCurrencyStore'
import { useLevelStore } from '../../../stores/useLevelStore'

// ── Persistence (localStorage, mismo patrón que math-dungeon-progress) ────────
const LS_KEY = 'math-history-progress'
const loadProgress = () => JSON.parse(localStorage.getItem(LS_KEY) ?? '{}')
const saveMissionDone = (eraId, missionId) => {
  const p = loadProgress()
  const era = p[eraId] ?? {}
  if (!era[missionId]) localStorage.setItem(LS_KEY, JSON.stringify({ ...p, [eraId]: { ...era, [missionId]: true } }))
}

// ── TTS — lee el texto en voz alta al entrar a una sección (pedido explícito:
// el juego debe "enseñar", no solo mostrar texto). Mismo patrón simple que ya
// usa EmojiLanguageGame.jsx; se cancela solo al desmontar/cambiar de texto.
function speak(text) {
  if (!window.speechSynthesis) return () => {}
  window.speechSynthesis.cancel()
  const utt = new SpeechSynthesisUtterance(text)
  utt.lang = 'es-ES'
  utt.rate = 0.95
  window.speechSynthesis.speak(utt)
  return () => window.speechSynthesis.cancel()
}

// ── Lector de "diapositivas" de texto — reusado por la intro de una era y por
// la lección de cada misión: mismo formato (ícono + título + párrafos), cada
// uno leído en voz alta al mostrarse.
function SlideReader({ icon, title, slides, ctaLabel, onDone }) {
  const [i, setI] = useState(0)
  const last = i === slides.length - 1

  useEffect(() => {
    const stop = speak(slides[i])
    return stop
  }, [i, slides])

  return (
    <div className="flex flex-col items-center gap-6 p-6 w-full max-w-md mx-auto text-center">
      <span className="text-6xl">{icon}</span>
      <h2 className="text-xl font-black text-text">{title}</h2>
      <p className="text-sm text-text leading-relaxed min-h-[6rem]">{slides[i]}</p>
      <div className="flex gap-1.5">
        {slides.map((_, idx) => (
          <span key={idx} className={`h-1.5 w-1.5 rounded-full ${idx === i ? 'bg-primary' : 'bg-white/15'}`} />
        ))}
      </div>
      <button
        type="button"
        onClick={() => (last ? onDone() : setI((n) => n + 1))}
        className="w-full rounded-xl bg-primary py-3 font-bold text-background"
      >
        {last ? ctaLabel : 'Siguiente →'}
      </button>
    </div>
  )
}

// ── Mapa cronológico ───────────────────────────────────────────────────────────
function EraMap({ progress, onSelect }) {
  return (
    <div className="flex flex-col items-center gap-6 p-6 w-full max-w-2xl mx-auto">
      <div className="text-center">
        <div className="text-5xl mb-2">🗺️</div>
        <h1 className="text-2xl font-black text-text">Historia de las Matemáticas</h1>
        <p className="text-sm text-text-muted mt-1">Viaja por el tiempo y descubre cómo cada civilización inventó las matemáticas</p>
      </div>

      <div className="flex flex-col gap-3 w-full">
        {MATH_ERAS.map((era) => {
          const done = era.unlocked && era.missions?.every((m) => progress[era.id]?.[m.id])
          return (
            <button
              key={era.id}
              type="button"
              disabled={!era.unlocked}
              onClick={() => onSelect(era)}
              className={`relative flex items-center gap-4 rounded-2xl border p-4 text-left transition-all ${
                era.unlocked
                  ? 'hover:-translate-y-0.5 hover:shadow-lg active:scale-95 cursor-pointer'
                  : 'opacity-40 cursor-not-allowed'
              }`}
              style={{ borderColor: era.unlocked ? era.color + '55' : undefined, background: era.unlocked ? era.bg : '#0d0d0d' }}
            >
              <span className="text-4xl shrink-0">{era.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-text">{era.name}</p>
                <p className="text-xs text-text-muted">{era.years}</p>
              </div>
              {!era.unlocked && <span className="text-xs font-semibold text-text-muted">🔒 Próximamente</span>}
              {done && <span className="text-xs font-semibold text-amber-400">✅ Completado</span>}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ── Lista de misiones de una era ───────────────────────────────────────────────
function MissionList({ era, progress, onSelectMission, onBack }) {
  return (
    <div className="flex flex-col items-center gap-5 p-6 w-full max-w-md mx-auto">
      <div className="text-center">
        <span className="text-5xl">{era.icon}</span>
        <h2 className="text-lg font-black text-text mt-2">{era.name}</h2>
      </div>
      <div className="flex flex-col gap-3 w-full">
        {era.missions.map((m) => {
          const done = !!progress[era.id]?.[m.id]
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => onSelectMission(m)}
              className="flex items-center gap-3 rounded-xl border border-border bg-surface p-4 text-left transition-all hover:-translate-y-0.5 hover:shadow-lg active:scale-95"
            >
              <span className="text-2xl">{m.icon}</span>
              <div className="flex-1">
                <p className="text-sm font-bold text-text">{m.title}</p>
                <p className="text-xs text-text-muted">{m.description}</p>
              </div>
              {done && <span className="text-lg">✅</span>}
            </button>
          )
        })}
      </div>
      <button type="button" onClick={onBack} className="text-xs text-text-muted hover:text-text py-1">
        ← Volver al mapa
      </button>
    </div>
  )
}

const ROUNDS = 6

// ── Misión: Numerales Jeroglíficos ────────────────────────────────────────────
function NumeralsMission({ onFinish }) {
  const [round, setRound] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [problem, setProblem] = useState(() => generateEgyptianNumeralProblem(0))
  const [feedback, setFeedback] = useState(null)
  const [locked, setLocked] = useState(false)

  const handleAnswer = (opt) => {
    if (locked) return
    const ok = opt === problem.answer
    setFeedback(ok ? 'correct' : 'wrong')
    setLocked(true)
    if (ok) setCorrectCount((c) => c + 1)
    setTimeout(() => {
      const next = round + 1
      if (next >= ROUNDS) { onFinish(ok ? correctCount + 1 : correctCount); return }
      setRound(next)
      setProblem(generateEgyptianNumeralProblem(next))
      setFeedback(null)
      setLocked(false)
    }, 700)
  }

  return (
    <div className="flex flex-col items-center gap-5 p-6 w-full max-w-md mx-auto">
      <p className="text-xs text-text-muted">Ronda {round + 1}/{ROUNDS} · Aciertos: {correctCount}</p>
      <p className="text-sm text-text text-center">¿Qué número representan estos símbolos egipcios?</p>
      <div
        className={`flex flex-wrap justify-center gap-1 rounded-2xl border border-border p-6 text-4xl leading-none transition-colors ${
          feedback === 'correct' ? 'bg-green-900/30' : feedback === 'wrong' ? 'bg-red-900/30' : 'bg-surface'
        }`}
      >
        {problem.symbols.map((s, i) => <span key={i}>{s}</span>)}
      </div>
      <div className="grid grid-cols-2 gap-3 w-full">
        {problem.options.map((opt) => (
          <button
            key={opt}
            type="button"
            disabled={locked}
            onClick={() => handleAnswer(opt)}
            className={`rounded-2xl border py-4 text-xl font-black transition-all active:scale-95 ${
              locked
                ? opt === problem.answer
                  ? 'border-green-500 bg-green-500/20 text-green-300'
                  : 'border-white/5 bg-white/5 text-white/30'
                : 'border-border bg-surface text-text hover:border-primary hover:bg-primary/10 hover:text-primary'
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap justify-center gap-3 text-[11px] text-text-muted">
        {EGYPT_NUMERALS.map((s) => (
          <span key={s.value}>{s.symbol} = {s.value} ({s.name})</span>
        ))}
      </div>
    </div>
  )
}

// ── Misión: Fracciones del Ojo de Horus ───────────────────────────────────────
function FractionsMission({ onFinish }) {
  const [round, setRound] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [order] = useState(() => [...EGYPT_FRACTIONS].sort(() => Math.random() - 0.5).slice(0, ROUNDS))
  const [feedback, setFeedback] = useState(null)
  const [locked, setLocked] = useState(false)
  const current = order[round]

  const handleAnswer = (opt) => {
    if (locked) return
    const ok = opt === current.correct
    setFeedback(ok ? 'correct' : 'wrong')
    setLocked(true)
    if (ok) setCorrectCount((c) => c + 1)
    setTimeout(() => {
      const next = round + 1
      if (next >= order.length) { onFinish(ok ? correctCount + 1 : correctCount); return }
      setRound(next)
      setFeedback(null)
      setLocked(false)
    }, 700)
  }

  return (
    <div className="flex flex-col items-center gap-5 p-6 w-full max-w-md mx-auto">
      <p className="text-xs text-text-muted">Ronda {round + 1}/{order.length} · Aciertos: {correctCount}</p>
      <p className="text-sm text-text text-center">
        Recuerda: los egipcios solo escribían fracciones con numerador 1 (1/2, 1/3, 1/4…).<br />
        ¿Cómo escribirían <span className="font-black text-text">{current.fraction}</span>?
      </p>
      <div className="flex flex-col gap-2 w-full">
        {current.options.map((opt) => (
          <button
            key={opt}
            type="button"
            disabled={locked}
            onClick={() => handleAnswer(opt)}
            className={`rounded-xl border py-3 text-base font-bold transition-all active:scale-95 ${
              locked
                ? opt === current.correct
                  ? 'border-green-500 bg-green-500/20 text-green-300'
                  : 'border-white/5 bg-white/5 text-white/30'
                : 'border-border bg-surface text-text hover:border-primary hover:bg-primary/10 hover:text-primary'
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  )
}

// ── Resultado de misión ────────────────────────────────────────────────────────
function MissionResult({ mission, correctCount, onContinue }) {
  const pct = Math.round((correctCount / ROUNDS) * 100)
  return (
    <div className="flex flex-col items-center gap-5 p-6 w-full max-w-sm mx-auto text-center">
      <span className="text-6xl">{pct >= 80 ? '🏆' : pct >= 50 ? '👍' : '📖'}</span>
      <h2 className="text-lg font-black text-text">{mission.title} completada</h2>
      <p className="text-text-muted text-sm">{correctCount}/{ROUNDS} correctas</p>
      <button type="button" onClick={onContinue} className="w-full rounded-xl bg-primary py-3 font-bold text-background">
        Continuar →
      </button>
    </div>
  )
}

// ── Resultado de era completa (recompensa) ────────────────────────────────────
function EraResult({ era, onBack }) {
  const earnCoins = useCurrencyStore((s) => s.earnCoins)
  const addXp = useLevelStore((s) => s.addXp)

  useEffect(() => {
    earnCoins(era.reward.coins)
    addXp(era.reward.xp)
  }, []) // eslint-disable-line

  return (
    <div className="flex flex-col items-center gap-5 p-6 w-full max-w-sm mx-auto text-center">
      <span className="text-6xl">🎉</span>
      <h2 className="text-xl font-black text-text">¡Dominaste la matemática de {era.name}!</h2>
      <div className="flex gap-4 text-sm font-bold">
        <span className="text-amber-400">🪙 +{era.reward.coins}</span>
        <span className="text-sky-300">+{era.reward.xp} XP</span>
      </div>
      <button type="button" onClick={onBack} className="w-full rounded-xl border border-border py-3 text-sm font-semibold text-text-muted hover:text-text">
        ← Volver al mapa
      </button>
    </div>
  )
}

// ── Root ────────────────────────────────────────────────────────────────────────
export default function MathHistoryGame() {
  const [progress, setProgress] = useState(loadProgress)
  const [era, setEra] = useState(null)
  const [phase, setPhase] = useState('map') // map | intro | missions | lesson | playing | mission-result | era-result
  const [mission, setMission] = useState(null)
  const [lastCorrect, setLastCorrect] = useState(0)

  useEffect(() => () => window.speechSynthesis?.cancel(), [])

  const backToMap = () => { setEra(null); setPhase('map'); setProgress(loadProgress()) }

  const finishMission = (correctCount) => {
    saveMissionDone(era.id, mission.id)
    setLastCorrect(correctCount)
    setPhase('mission-result')
  }

  const afterMissionResult = () => {
    const p = loadProgress()
    const allDone = era.missions.every((m) => p[era.id]?.[m.id])
    setProgress(p)
    setPhase(allDone ? 'era-result' : 'missions')
  }

  return (
    <div className="flex min-h-full flex-col items-center justify-start bg-background py-4 overflow-y-auto">
      {phase === 'map' && (
        <EraMap
          progress={progress}
          onSelect={(e) => { setEra(e); setPhase(e.intro ? 'intro' : 'missions') }}
        />
      )}
      {phase === 'intro' && era && (
        <SlideReader
          icon={era.icon}
          title={era.name}
          slides={era.intro}
          ctaLabel="¡Comenzar misiones! →"
          onDone={() => setPhase('missions')}
        />
      )}
      {phase === 'missions' && era && (
        <MissionList
          era={era}
          progress={progress}
          onBack={backToMap}
          onSelectMission={(m) => { setMission(m); setPhase(m.lesson ? 'lesson' : 'playing') }}
        />
      )}
      {phase === 'lesson' && mission && (
        <SlideReader
          icon={mission.icon}
          title={mission.title}
          slides={mission.lesson}
          ctaLabel="Practicar →"
          onDone={() => setPhase('playing')}
        />
      )}
      {phase === 'playing' && mission?.id === 'numerales' && <NumeralsMission onFinish={finishMission} />}
      {phase === 'playing' && mission?.id === 'fracciones' && <FractionsMission onFinish={finishMission} />}
      {phase === 'mission-result' && mission && (
        <MissionResult mission={mission} correctCount={lastCorrect} onContinue={afterMissionResult} />
      )}
      {phase === 'era-result' && era && <EraResult era={era} onBack={backToMap} />}
    </div>
  )
}
