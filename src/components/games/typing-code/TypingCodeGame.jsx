import { useState, useRef, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { TYPING_LEVELS } from '../../../data/typingCodeLevels'
import { getHintsForSnippet } from '../../../data/typingCharHints'
import { useCurrencyStore } from '../../../stores/useCurrencyStore'
import { useLevelStore } from '../../../stores/useLevelStore'

// Mecanografía de código: elige un nivel (lenguaje + dificultad), escribe
// cada snippet carácter por carácter contra un textarea invisible superpuesto
// al texto coloreado. Al terminar el nivel, se "compila" (animación) y de
// verdad SE EJECUTA el código completo del nivel con new Function — los
// snippets vienen de nuestro propio registro (typingCodeLevels.js), nunca de
// input del usuario, así que ejecutar ese código es seguro. Solo existe hasta
// el nivel 5 por ahora — ver typingCodeLevels.js para agregar más.
export default function TypingCodeGame() {
  const [levelId, setLevelId] = useState(null)
  const [phase, setPhase] = useState('playing') // 'playing' | 'compiling' | 'results'
  const [snippetIndex, setSnippetIndex] = useState(0)
  const [typed, setTyped] = useState('')
  const [startedAt, setStartedAt] = useState(null)
  const [results, setResults] = useState([])
  const inputRef = useRef(null)

  const level = levelId ? TYPING_LEVELS.find((l) => l.id === levelId) : null
  const snippet = level?.snippets[snippetIndex] ?? ''
  const hints = useMemo(() => getHintsForSnippet(snippet), [snippet])

  useEffect(() => {
    if (level && phase === 'playing') inputRef.current?.focus()
  }, [level, snippetIndex, phase])

  const handleChange = (e) => {
    const value = e.target.value
    if (value.length > snippet.length) return
    if (!startedAt && value.length > 0) setStartedAt(Date.now())
    setTyped(value)

    if (value.length === snippet.length && value === snippet) {
      const seconds = Math.max(1, (Date.now() - startedAt) / 1000)
      const wpm = Math.round((snippet.length / 5) / (seconds / 60))
      const errors = countErrors(snippet, value)
      const accuracy = Math.round(((snippet.length - errors) / snippet.length) * 100)
      const nextResults = [...results, { wpm, accuracy }]
      setResults(nextResults)

      if (snippetIndex + 1 < level.snippets.length) {
        setSnippetIndex(snippetIndex + 1)
        setTyped('')
        setStartedAt(null)
      } else {
        setPhase('compiling')
      }
    }
  }

  const restart = () => {
    setSnippetIndex(0)
    setTyped('')
    setStartedAt(null)
    setResults([])
    setPhase('playing')
  }

  const backToMenu = () => {
    setLevelId(null)
    restart()
  }

  if (!level) return <LevelSelect onPick={(id) => { setLevelId(id); restart() }} />
  if (phase === 'compiling') return <CompilingScreen level={level} onDone={() => setPhase('results')} />
  if (phase === 'results') return <ResultsScreen level={level} results={results} onRetry={restart} onMenu={backToMenu} />

  return (
    <div className="flex h-full flex-col items-center gap-6 overflow-y-auto bg-background p-6 text-text">
      <div className="w-full max-w-2xl">
        <div className="mb-4 flex items-center justify-between">
          <button onClick={backToMenu} className="text-sm text-text-muted hover:text-primary">← Elegir nivel</button>
          <span className="text-sm font-semibold text-text-muted">
            Snippet {snippetIndex + 1} / {level.snippets.length}
          </span>
        </div>

        <h2 className="mb-1 text-lg font-bold text-text">{level.icon} {level.title}</h2>
        <p className="mb-4 text-xs text-text-muted">{level.description}</p>

        <CodeDisplay snippet={snippet} typed={typed} />

        {hints.length > 0 && <HintsBar hints={hints} />}

        <textarea
          ref={inputRef}
          value={typed}
          onChange={handleChange}
          onPaste={(e) => e.preventDefault()}
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
          className="mt-4 h-24 w-full resize-none rounded-xl border border-border bg-surface p-3 font-mono text-sm text-text outline-none focus:border-primary"
          placeholder="Escribe el código de arriba aquí..."
        />
      </div>
    </div>
  )
}

function countErrors(target, typed) {
  let errors = 0
  for (let i = 0; i < typed.length; i++) {
    if (typed[i] !== target[i]) errors++
  }
  return errors
}

function CodeDisplay({ snippet, typed }) {
  return (
    <pre className="overflow-x-auto rounded-xl border border-border bg-black/60 p-4 font-mono text-sm leading-relaxed">
      {snippet.split('').map((char, i) => {
        let className = 'text-text-muted/50' // pendiente
        if (i < typed.length) {
          className = typed[i] === char ? 'text-emerald-400' : 'bg-red-500/40 text-red-200'
        } else if (i === typed.length) {
          className = 'bg-primary/40 text-text'
        }
        return (
          <span key={i} className={className}>
            {char === '\n' ? '↵\n' : char}
          </span>
        )
      })}
    </pre>
  )
}

function HintsBar({ hints }) {
  return (
    <div className="mt-3 flex flex-wrap gap-2 rounded-xl border border-border bg-surface p-3">
      <span className="mr-1 text-xs font-bold uppercase tracking-wide text-text-muted">💡 Ayuda de símbolos:</span>
      {hints.map((h) => (
        <div
          key={h.char}
          title={h.tip}
          className="flex items-center gap-1.5 rounded-lg border border-border/60 bg-background px-2 py-1 text-xs"
        >
          <span className="rounded bg-primary/15 px-1.5 py-0.5 font-mono font-bold text-primary">{h.char === '\n' ? '↵' : h.char}</span>
          <span className="text-text-muted">{h.name}</span>
          <span className="rounded bg-black/30 px-1.5 py-0.5 font-mono text-[10px] text-emerald-400">{h.alt}</span>
        </div>
      ))}
    </div>
  )
}

function LevelSelect({ onPick }) {
  return (
    <div className="flex h-full flex-col items-center gap-4 overflow-y-auto bg-background p-6 text-text">
      <h1 className="mt-4 text-2xl font-extrabold">⌨️ Mecanografía de Código</h1>
      <p className="max-w-md text-center text-sm text-text-muted">
        Practica escribir código real, rápido y sin errores. Elige un nivel para empezar.
      </p>
      <div className="mt-4 grid w-full max-w-2xl gap-3 sm:grid-cols-2">
        {TYPING_LEVELS.map((l) => (
          <button
            key={l.id}
            onClick={() => onPick(l.id)}
            className="flex flex-col items-start gap-1 rounded-xl border border-border bg-surface p-4 text-left transition-colors hover:border-primary/50 hover:bg-surface-hover"
          >
            <span className="text-2xl">{l.icon}</span>
            <span className="font-semibold text-text">{l.title}</span>
            <span className="text-xs text-text-muted">{l.description}</span>
            <span className="mt-1 text-[10px] font-bold uppercase tracking-wide text-primary">{l.snippets.length} snippets</span>
          </button>
        ))}
        <div className="flex flex-col items-start gap-1 rounded-xl border border-dashed border-border p-4 text-left text-text-muted">
          <span className="text-2xl">🔒</span>
          <span className="font-semibold">Más lenguajes</span>
          <span className="text-xs">Python, Bash y más — próximamente.</span>
        </div>
      </div>
    </div>
  )
}

// Ejecuta el código del nivel completo (los 5 snippets ya escritos por el
// jugador, concatenados en orden) dentro de una función aislada, capturando
// console.log en vez del console real. Los snippets son contenido nuestro
// (typingCodeLevels.js), nunca texto libre del usuario, por eso es seguro.
function formatLogArg(arg) {
  if (arg !== null && typeof arg === 'object') return JSON.stringify(arg)
  return String(arg)
}

function runLevelCode(level) {
  const logs = []
  const fakeConsole = { log: (...args) => logs.push(args.map(formatLogArg).join(' ')) }
  const fullCode = level.snippets.join('\n')
  try {
    // eslint-disable-next-line no-new-func
    const run = new Function('console', fullCode)
    run(fakeConsole)
  } catch (err) {
    logs.push(`⚠️ Error en tiempo de ejecución: ${err.message}`)
  }
  return logs
}

const COMPILE_LINES = (level) => [
  `> compilando ${level.title.toLowerCase().replace(/[^a-z0-9 ]/g, '')}.js`,
  '> analizando sintaxis...',
  '> 0 errores encontrados',
  '> generando bytecode...',
  '> ¡compilado con éxito! ✅',
]

function CompilingScreen({ level, onDone }) {
  const lines = useMemo(() => COMPILE_LINES(level), [level])
  const output = useMemo(() => runLevelCode(level), [level])
  const [shown, setShown] = useState(1)
  const [showOutput, setShowOutput] = useState(false)

  useEffect(() => {
    if (shown < lines.length) {
      const t = setTimeout(() => setShown((s) => s + 1), 450)
      return () => clearTimeout(t)
    }
    const t = setTimeout(() => setShowOutput(true), 500)
    return () => clearTimeout(t)
  }, [shown, lines.length])

  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 bg-background p-6 text-text">
      <div className="w-full max-w-md rounded-xl border border-emerald-900/40 bg-black/80 p-4 font-mono text-sm text-emerald-400">
        {lines.slice(0, shown).map((l, i) => <p key={i}>{l}</p>)}
        {!showOutput && <span className="animate-pulse">▋</span>}
        {showOutput && (
          <>
            <p className="mt-2 border-t border-emerald-900/40 pt-2 text-text-muted"># salida del programa</p>
            {output.length > 0 ? (
              output.map((line, i) => <p key={i} className="text-emerald-300">{line}</p>)
            ) : (
              <p className="text-text-muted">(sin salida en consola)</p>
            )}
          </>
        )}
      </div>
      {showOutput && (
        <button onClick={onDone} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-background hover:opacity-90">
          Ver resultados →
        </button>
      )}
    </div>
  )
}

function ResultsScreen({ level, results, onRetry, onMenu }) {
  const avgWpm = useMemo(() => Math.round(results.reduce((s, r) => s + r.wpm, 0) / results.length), [results])
  const avgAccuracy = useMemo(() => Math.round(results.reduce((s, r) => s + r.accuracy, 0) / results.length), [results])

  // ponytail: recompensa calculada una sola vez al montar (cálculo puro, sin
  // dependencias externas) — evita un useEffect solo para esto.
  const reward = useMemo(() => {
    const coins = Math.round(avgWpm * 3 + avgAccuracy * 2)
    const xp = Math.round(avgAccuracy * 0.8)
    useCurrencyStore.getState().earnCoins(coins)
    useLevelStore.getState().addXp(xp)
    return { coins, xp }
  }, [])

  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 bg-background p-6 text-center text-text">
      <p className="text-5xl">⌨️✅</p>
      <h2 className="text-2xl font-extrabold">¡Nivel completado!</h2>
      <p className="text-sm text-text-muted">{level.icon} {level.title}</p>

      <div className="mt-2 flex gap-6">
        <div>
          <p className="text-3xl font-extrabold text-primary">{avgWpm}</p>
          <p className="text-xs text-text-muted">PPM promedio</p>
        </div>
        <div>
          <p className="text-3xl font-extrabold text-primary">{avgAccuracy}%</p>
          <p className="text-xs text-text-muted">Precisión promedio</p>
        </div>
      </div>

      <p className="mt-2 text-sm text-text-muted">
        Ganaste <strong className="text-text">🪙 {reward.coins}</strong> y <strong className="text-text">✨ {reward.xp} XP</strong>
      </p>

      <div className="mt-4 flex gap-3">
        <button onClick={onRetry} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-background hover:opacity-90">
          Reintentar
        </button>
        <button onClick={onMenu} className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-text hover:bg-surface-hover">
          Elegir otro nivel
        </button>
        <Link to="/games" className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-text hover:bg-surface-hover">
          Volver a Games
        </Link>
      </div>
    </div>
  )
}
