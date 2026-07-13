import { useState, useEffect, useCallback, useRef } from 'react'
import { MATH_CATEGORIES, calcStars } from '../../../data/mathLevels'
import { useCurrencyStore } from '../../../stores/useCurrencyStore'
import { useLevelStore } from '../../../stores/useLevelStore'

// ── Persistence (localStorage, no new store needed) ───────────────────────────
const LS_KEY = 'math-dungeon-progress'
const loadProgress = () => JSON.parse(localStorage.getItem(LS_KEY) ?? '{}')
const saveProgress = (lvlId, stars) => {
  const p = loadProgress()
  if ((p[lvlId] ?? 0) < stars) localStorage.setItem(LS_KEY, JSON.stringify({ ...p, [lvlId]: stars }))
}
// El primer nivel de cada categoría siempre está abierto; los siguientes piden
// al menos 1 estrella en el nivel anterior de esa misma categoría.
const isUnlocked = (category, levelIndex, progress) =>
  levelIndex === 0 || (progress[category.levels[levelIndex - 1].id] ?? 0) >= 1

// ── Problem generation ────────────────────────────────────────────────────────
function rand(a, b) { return Math.floor(Math.random() * (b - a + 1)) + a }

const PCT_VALUES = [10, 20, 25, 50, 75]

function generateProblem(level) {
  const op = level.ops[Math.floor(Math.random() * level.ops.length)]
  const { min, max } = level
  let a, b, answer
  if (op === '+') { a = rand(min, max); b = rand(min, max); answer = a + b }
  else if (op === '-') { a = rand(min + 1, max); b = rand(min, a); answer = a - b }
  else if (op === '×') { a = rand(min, max); b = rand(min, max); answer = a * b }
  else if (op === '÷') { b = rand(min, max); answer = rand(min, max); a = b * answer } // always exact
  else if (op === 'frac') {
    // Suma de fracciones con el mismo denominador — sin reducir, para que se
    // vea claramente de dónde sale (reducir sería un segundo tema en sí mismo).
    const d = rand(Math.max(4, min), max)
    const n1 = rand(1, d - 2)
    const n2 = rand(1, d - n1 - 1)
    return { text: `${n1}/${d}  +  ${n2}/${d}`, answer: `${n1 + n2}/${d}`, isFrac: true, fracD: d, fracSum: n1 + n2 }
  } else { // '%'
    const pctValues = level.pctValues ?? PCT_VALUES
    const p = pctValues[rand(0, pctValues.length - 1)]
    const n = rand(1, 10) * 20 // múltiplo de 20: exacto para todos los % que usamos
    return { text: `${p}% de ${n}`, answer: Math.round((p * n) / 100) }
  }
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

function generateFracOptions(problem) {
  const { fracSum: sum, fracD: d } = problem
  const opts = new Set([`${sum}/${d}`])
  for (const delta of [-1, 1, -2, 2]) {
    if (opts.size >= 4) break
    const v = sum + delta
    if (v >= 1 && v < d) opts.add(`${v}/${d}`)
  }
  let dv = d + 1
  while (opts.size < 4) { opts.add(`${sum}/${dv}`); dv++ }
  return [...opts].sort(() => Math.random() - 0.5)
}

// ── Category Select ───────────────────────────────────────────────────────────
function CategorySelect({ progress, onSelect }) {
  return (
    <div className="flex flex-col items-center gap-6 p-6 w-full max-w-lg mx-auto">
      <div className="text-center">
        <div className="text-5xl mb-2">🧮</div>
        <h1 className="text-2xl font-black text-text">Mazmorra Matemática</h1>
        <p className="text-sm text-text-muted mt-1">Elige una categoría y derrota a sus monstruos</p>
      </div>

      <div className="grid grid-cols-2 gap-3 w-full">
        {MATH_CATEGORIES.map((cat) => {
          const totalStars = cat.levels.reduce((s, l) => s + (progress[l.id] ?? 0), 0)
          const maxStars = cat.levels.length * 3
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onSelect(cat)}
              className="relative flex flex-col items-center gap-2 rounded-2xl border p-4 text-center transition-all hover:-translate-y-0.5 hover:shadow-lg active:scale-95 cursor-pointer"
              style={{ borderColor: cat.color + '55', background: cat.bg }}
            >
              <span className="text-4xl">{cat.icon}</span>
              <p className="text-sm font-bold text-text leading-tight">{cat.title}</p>
              <p className="text-[10px] text-text-muted">{cat.levels.length} niveles</p>
              <div className="flex gap-0.5 text-xs">
                {Array.from({ length: maxStars }).map((_, i) => (
                  <span key={i} className={i < totalStars ? 'text-amber-400' : 'text-white/15'}>★</span>
                ))}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ── Level Select ──────────────────────────────────────────────────────────────
function LevelSelect({ category, progress, onSelect, onBack }) {
  return (
    <div className="flex flex-col items-center gap-6 p-6 w-full max-w-lg mx-auto">
      <div className="text-center">
        <span className="text-5xl">{category.icon}</span>
        <h1 className="text-xl font-black text-text mt-2">{category.title}</h1>
      </div>

      <div className="grid grid-cols-2 gap-3 w-full">
        {category.levels.map((level, idx) => {
          const unlocked = isUnlocked(category, idx, progress)
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
              <p className="text-sm font-bold text-text leading-tight">{level.title}</p>
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

      <button type="button" onClick={onBack} className="text-xs text-text-muted hover:text-text py-1">
        ← Elegir categoría
      </button>
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
  const [options,  setOptions]  = useState(() => (problem.isFrac ? generateFracOptions(problem) : generateOptions(problem.answer)))
  const [locked,   setLocked]   = useState(false)
  const timerRef = useRef(null)

  // ── new question whenever qIdx changes ──────────────────────────────────────
  useEffect(() => {
    const p = generateProblem(level)
    setProblem(p)
    setOptions(p.isFrac ? generateFracOptions(p) : generateOptions(p.answer))
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
          <span className="font-bold text-text">{qIdx + 1}/{total}</span>
        </div>
        {comboMult > 1
          ? <span className="rounded-full bg-amber-500/20 border border-amber-500/50 px-2 py-0.5 text-xs font-black text-amber-400">🔥 x{comboMult}</span>
          : <span className="w-14" />
        }
      </div>

      {/* Timer */}
      <TimerBar pct={timeLeft / level.timeSecs} />

      {level.fact && (
        <p className="text-center text-[11px] italic text-text-muted leading-snug">💡 {level.fact}</p>
      )}

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
function Results({ category, level, correct, heartsLeft, onReplay, onSelectLevel, onBackToLevels }) {
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

  const levelIdx = category.levels.findIndex((l) => l.id === level.id)
  const nextLevel = category.levels[levelIdx + 1]

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
          <button type="button" onClick={() => onSelectLevel(nextLevel)}
            className="w-full rounded-xl border border-border py-3 text-sm font-semibold text-text-muted hover:text-text">
            Siguiente: {nextLevel.enemy.emoji} {nextLevel.title} →
          </button>
        )}
        <button type="button" onClick={onBackToLevels}
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
  const [progress,        setProgress]        = useState(loadProgress)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [selectedLevel,   setSelectedLevel]   = useState(null)
  const [phase,           setPhase]           = useState('categories') // categories | levels | playing | results
  const [results,         setResults]         = useState(null)

  const handleSelectCategory = (cat) => { setSelectedCategory(cat); setPhase('levels') }

  const handleSelectLevel = (level) => {
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
      {phase === 'categories' && (
        <CategorySelect progress={progress} onSelect={handleSelectCategory} />
      )}
      {phase === 'levels' && selectedCategory && (
        <LevelSelect
          category={selectedCategory}
          progress={progress}
          onSelect={handleSelectLevel}
          onBack={() => setPhase('categories')}
        />
      )}
      {phase === 'playing' && selectedLevel && (
        <Playing
          key={selectedLevel.id + '-' + Date.now()}
          level={selectedLevel}
          onFinish={handleFinish}
        />
      )}
      {phase === 'results' && results && selectedCategory && selectedLevel && (
        <Results
          category={selectedCategory}
          level={selectedLevel}
          correct={results.correct}
          heartsLeft={results.heartsLeft}
          onReplay={() => handleSelectLevel(selectedLevel)}
          onSelectLevel={handleSelectLevel}
          onBackToLevels={() => setPhase('levels')}
        />
      )}
    </div>
  )
}
