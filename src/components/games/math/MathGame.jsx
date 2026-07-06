import { useState, useEffect, useCallback, useRef } from 'react'
import { MATH_LEVELS, calcStars } from '../../../data/mathLevels'
import { useCurrencyStore } from '../../../stores/useCurrencyStore'
import { useLevelStore } from '../../../stores/useLevelStore'

// ── Persistence (localStorage, no new store needed) ───────────────────────────
const LS_KEY = 'math-dungeon-progress'
const loadProgress = () => JSON.parse(localStorage.getItem(LS_KEY) ?? '{}')
const saveProgress = (lvlId, stars) => {
  const p = loadProgress()
  if ((p[lvlId] ?? 0) < stars) localStorage.setItem(LS_KEY, JSON.stringify({ ...p, [lvlId]: stars }))
}
const isUnlocked = (lvlId, progress) => lvlId === 1 || (progress[lvlId - 1] ?? 0) >= 1

// ── Problem generation ────────────────────────────────────────────────────────
function rand(a, b) { return Math.floor(Math.random() * (b - a + 1)) + a }

function generateProblem(level) {
  const op = level.ops[Math.floor(Math.random() * level.ops.length)]
  const { min, max } = level
  let a, b, answer
  if (op === '+') { a = rand(min, max); b = rand(min, max); answer = a + b }
  else if (op === '-') { a = rand(min + 1, max); b = rand(min, a); answer = a - b }
  else if (op === '×') { a = rand(min, max); b = rand(min, max); answer = a * b }
  else { b = rand(min, max); answer = rand(min, max); a = b * answer } // ÷ always exact
  return { text: `${a}  ${op}  ${b}`, answer }
}

function generateOptions(answer) {
  const spread = Math.max(4, Math.floor(answer * 0.35))
  const opts = new Set([answer])
  let tries = 0
  while (opts.size < 4 && tries < 50) {
    const delta = rand(-spread, spread)
    const w = answer + (delta === 0 ? rand(1, spread) : delta)
    if (w >= 0) opts.add(w)
    tries++
  }
  // fallback: just add sequential numbers if we can't fill 4
  let fallback = answer + 1
  while (opts.size < 4) { opts.add(fallback++); }
  return [...opts].sort(() => Math.random() - 0.5)
}

// ── Level Select ──────────────────────────────────────────────────────────────
function LevelSelect({ progress, onSelect }) {
  return (
    <div className="flex flex-col items-center gap-6 p-6 w-full max-w-lg mx-auto">
      <div className="text-center">
        <div className="text-5xl mb-2">🧮</div>
        <h1 className="text-2xl font-black text-text">Mazmorra Matemática</h1>
        <p className="text-sm text-text-muted mt-1">Derrota a los monstruos resolviendo operaciones</p>
      </div>

      <div className="grid grid-cols-2 gap-3 w-full">
        {MATH_LEVELS.map((level) => {
          const unlocked = isUnlocked(level.id, progress)
          const stars    = progress[level.id] ?? 0
          const { enemy } = level
          return (
            <button
              key={level.id}
              type="button"
              disabled={!unlocked}
              onClick={() => onSelect(level)}
              className={`relative flex flex-col items-center gap-2 rounded-2xl border p-4 text-center transition-all ${
                unlocked
                  ? 'hover:-translate-y-0.5 hover:shadow-lg active:scale-95 cursor-pointer'
                  : 'opacity-40 cursor-not-allowed'
              }`}
              style={{
                borderColor: unlocked ? enemy.color + '55' : undefined,
                background: unlocked ? enemy.bg : '#0d0d0d',
              }}
            >
              {!unlocked && (
                <span className="absolute top-2 right-2 text-lg">🔒</span>
              )}
              <span className="text-4xl">{enemy.emoji}</span>
              <div>
                <p className="text-xs font-semibold text-text-muted">{level.floor}</p>
                <p className="text-sm font-bold text-text leading-tight">{level.title}</p>
              </div>
              <div className="flex gap-0.5 text-sm">
                {[1, 2, 3].map((s) => (
                  <span key={s} className={stars >= s ? 'text-amber-400' : 'text-white/15'}>★</span>
                ))}
              </div>
              <div className="flex gap-1 text-[10px] text-text-muted">
                {level.ops.map((op) => (
                  <span key={op} className="rounded bg-white/10 px-1.5 py-0.5 font-mono font-bold">{op}</span>
                ))}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ── Timer Bar ─────────────────────────────────────────────────────────────────
function TimerBar({ pct }) {
  const color = pct > 0.5 ? '#22c55e' : pct > 0.25 ? '#f59e0b' : '#ef4444'
  return (
    <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
      <div
        className="h-full rounded-full transition-all"
        style={{ width: `${pct * 100}%`, background: color, transition: 'width 0.1s linear, background 0.3s' }}
      />
    </div>
  )
}

// ── Playing Phase ─────────────────────────────────────────────────────────────
function Playing({ level, onFinish }) {
  const total = level.questions
  const [qIdx,    setQIdx]    = useState(0)
  const [correct, setCorrect] = useState(0)
  const [hearts,  setHearts]  = useState(3)
  const [streak,  setStreak]  = useState(0)
  const [timeLeft, setTimeLeft] = useState(level.timeSecs)
  const [feedback, setFeedback] = useState(null) // 'correct' | 'wrong'
  const [problem,  setProblem]  = useState(() => generateProblem(level))
  const [options,  setOptions]  = useState(() => generateOptions(generateProblem(level).answer))
  const [locked,   setLocked]   = useState(false)
  const timerRef = useRef(null)

  // ── new question whenever qIdx changes ──────────────────────────────────────
  useEffect(() => {
    const p = generateProblem(level)
    setProblem(p)
    setOptions(generateOptions(p.answer))
    setTimeLeft(level.timeSecs)
    setLocked(false)
    setFeedback(null)
  }, [qIdx, level])

  // ── countdown ───────────────────────────────────────────────────────────────
  useEffect(() => {
    if (locked) return
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 0.1) {
          clearInterval(timerRef.current)
          handleTimeout()
          return 0
        }
        return t - 0.1
      })
    }, 100)
    return () => clearInterval(timerRef.current)
  }, [qIdx, locked]) // eslint-disable-line

  const advance = useCallback((wasCorrect) => {
    setLocked(true)
    clearInterval(timerRef.current)
    const nextIdx = qIdx + 1
    setTimeout(() => {
      if (nextIdx >= total) {
        onFinish(wasCorrect ? correct + 1 : correct, hearts - (wasCorrect ? 0 : 1))
      } else {
        setQIdx(nextIdx)
        if (!wasCorrect) setHearts((h) => h - 1)
        if (!wasCorrect) setStreak(0)
      }
    }, 500)
  }, [qIdx, correct, hearts, total, onFinish])

  const handleTimeout = useCallback(() => {
    setFeedback('wrong')
    setStreak(0)
    advance(false)
  }, [advance])

  const handleAnswer = (opt) => {
    if (locked) return
    const ok = opt === problem.answer
    setFeedback(ok ? 'correct' : 'wrong')
    if (ok) { setCorrect((c) => c + 1); setStreak((s) => s + 1) }
    else    { setStreak(0) }
    advance(ok)
  }

  const comboMult = streak >= 10 ? 5 : streak >= 5 ? 3 : streak >= 3 ? 2 : 1

  const bgClass = feedback === 'correct' ? 'bg-green-900/40'
               : feedback === 'wrong'   ? 'bg-red-900/40'
               : ''

  return (
    <div
      className={`flex flex-col items-center gap-4 p-5 w-full max-w-md mx-auto transition-colors duration-200 ${bgClass}`}
    >
      {/* HUD */}
      <div className="flex items-center justify-between w-full text-sm">
        <div className="flex gap-1">
          {Array.from({ length: 3 }).map((_, i) => (
            <span key={i} className={i < hearts ? 'text-xl' : 'text-xl opacity-20'}>❤️</span>
          ))}
        </div>
        <div className="text-center">
          <span className="text-xs text-text-muted">{level.floor} · </span>
          <span className="font-bold text-text">{qIdx + 1}/{total}</span>
        </div>
        {comboMult > 1
          ? <span className="rounded-full bg-amber-500/20 border border-amber-500/50 px-2 py-0.5 text-xs font-black text-amber-400">🔥 x{comboMult}</span>
          : <span className="w-14" />
        }
      </div>

      {/* Timer */}
      <TimerBar pct={timeLeft / level.timeSecs} />

      {/* Enemy + question */}
      <div className="flex flex-col items-center gap-3 py-4">
        <span className="text-6xl">{level.enemy.emoji}</span>
        <p className="text-xs font-semibold text-text-muted" style={{ color: level.enemy.color }}>
          {level.enemy.name} te ataca con:
        </p>
        <p className="text-4xl font-black text-text tracking-wide">{problem.text} = ?</p>
      </div>

      {/* Options */}
      <div className="grid grid-cols-2 gap-3 w-full">
        {options.map((opt) => (
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

      {streak >= 3 && (
        <p className="text-xs text-amber-400 font-semibold animate-pulse">
          🔥 ¡Racha de {streak}! Combo x{comboMult}
        </p>
      )}
    </div>
  )
}

// ── Results Phase ─────────────────────────────────────────────────────────────
function Results({ level, correct, heartsLeft, onReplay, onSelect }) {
  const earnCoins = useCurrencyStore((s) => s.earnCoins)
  const addXp     = useLevelStore((s) => s.addXp)
  const stars     = calcStars(level, correct)
  const total     = level.questions
  const coinsEarned = Math.round(level.coins * (correct / total) * (stars === 3 ? 1.5 : 1))

  useEffect(() => {
    if (stars > 0) {
      saveProgress(level.id, stars)
      if (coinsEarned > 0) earnCoins(coinsEarned)
      if (stars > 0) addXp(level.xp * stars)
    }
  }, []) // eslint-disable-line

  const nextLevel = MATH_LEVELS.find((l) => l.id === level.id + 1)

  return (
    <div className="flex flex-col items-center gap-6 p-6 w-full max-w-sm mx-auto text-center">
      <span className="text-6xl">{stars === 3 ? '🏆' : stars === 2 ? '🥈' : stars === 1 ? '🥉' : '💀'}</span>

      <div>
        <h2 className="text-xl font-black text-text mb-1">
          {stars === 3 ? '¡Perfecto!' : stars === 2 ? '¡Bien hecho!' : stars === 1 ? 'Puedes mejorar' : '¡Derrotado!'}
        </h2>
        <p className="text-text-muted text-sm">{level.enemy.name} {stars > 0 ? 'fue derrotado' : 'te venció'}</p>
      </div>

      {/* Stars */}
      <div className="flex gap-2 text-4xl">
        {[1, 2, 3].map((s) => (
          <span key={s} className={stars >= s ? 'text-amber-400' : 'text-white/15'}>★</span>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 w-full">
        <Stat label="Correctas" value={`${correct}/${total}`} />
        <Stat label="❤️ Vidas" value={`${heartsLeft}/3`} />
        <Stat label="🪙 Ganadas" value={`+${coinsEarned}`} color="#fbbf24" />
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-2 w-full">
        <button type="button" onClick={onReplay}
          className="w-full rounded-xl bg-primary py-3 font-bold text-background">
          🔄 Reintentar
        </button>
        {nextLevel && stars > 0 && (
          <button type="button" onClick={() => onSelect(nextLevel)}
            className="w-full rounded-xl border border-border py-3 text-sm font-semibold text-text-muted hover:text-text">
            Siguiente: {nextLevel.enemy.emoji} {nextLevel.title} →
          </button>
        )}
        <button type="button" onClick={() => onSelect(null)}
          className="text-xs text-text-muted hover:text-text py-1">
          ← Elegir nivel
        </button>
      </div>
    </div>
  )
}

function Stat({ label, value, color }) {
  return (
    <div className="flex flex-col items-center rounded-xl border border-border bg-surface p-3 gap-1">
      <span className="text-lg font-black" style={{ color: color ?? 'inherit' }}>{value}</span>
      <span className="text-[10px] text-text-muted">{label}</span>
    </div>
  )
}

// ── Root ──────────────────────────────────────────────────────────────────────
export default function MathGame() {
  const [progress,      setProgress]      = useState(loadProgress)
  const [selectedLevel, setSelectedLevel] = useState(null)
  const [phase,         setPhase]         = useState('select') // 'select' | 'playing' | 'results'
  const [results,       setResults]       = useState(null)

  const handleSelect = (level) => {
    if (!level) { setPhase('select'); setSelectedLevel(null); return }
    setSelectedLevel(level)
    setPhase('playing')
    setResults(null)
  }

  const handleFinish = (correct, heartsLeft) => {
    const stars = calcStars(selectedLevel, correct)
    saveProgress(selectedLevel.id, stars)
    setProgress(loadProgress())
    setResults({ correct, heartsLeft })
    setPhase('results')
  }

  return (
    <div className="flex min-h-full flex-col items-center justify-start bg-background py-4 overflow-y-auto">
      {phase === 'select' && (
        <LevelSelect progress={progress} onSelect={handleSelect} />
      )}
      {phase === 'playing' && selectedLevel && (
        <Playing
          key={selectedLevel.id + '-' + Date.now()}
          level={selectedLevel}
          onFinish={handleFinish}
        />
      )}
      {phase === 'results' && results && (
        <Results
          level={selectedLevel}
          correct={results.correct}
          heartsLeft={results.heartsLeft}
          onReplay={() => handleSelect(selectedLevel)}
          onSelect={handleSelect}
        />
      )}
    </div>
  )
}
