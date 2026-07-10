import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { PYTHON_SCENARIOS } from '../../../lib/pythonScenarios'
import { runPython } from '../../../lib/pythonEngine'

function LevelCard({ scenario, completed, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-xl border px-3 py-2.5 text-left transition-all hover:-translate-y-0.5 ${
        active
          ? 'border-blue-500/60 bg-blue-500/10'
          : completed
          ? 'border-blue-800/40 bg-blue-900/10 opacity-70'
          : 'border-border bg-surface hover:border-border/80'
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="truncate text-xs font-bold text-text">{scenario.title}</span>
        <span className={`shrink-0 text-[10px] font-bold ${scenario.difficultyColor}`}>
          {completed ? '✓' : `${scenario.points}pts`}
        </span>
      </div>
      <span className="text-[10px] text-text-muted">{scenario.category}</span>
    </button>
  )
}

export default function PythonTerminalGame() {
  const [activeId,   setActiveId]   = useState(PYTHON_SCENARIOS[0].id)
  const [code,       setCode]       = useState(PYTHON_SCENARIOS[0].starterCode)
  const [output,     setOutput]     = useState([])
  const [errors,     setErrors]     = useState([])
  const [objectives, setObjectives] = useState({})  // { [id]: bool[] }
  const [completed,  setCompleted]  = useState({})  // { [id]: true }
  const [totalPts,   setTotalPts]   = useState(0)
  const [showHint,   setShowHint]   = useState(false)
  const editorRef = useRef(null)

  const scenario = useMemo(() => PYTHON_SCENARIOS.find((s) => s.id === activeId), [activeId])

  useEffect(() => {
    setCode(scenario.starterCode)
    setOutput([])
    setErrors([])
    setShowHint(false)
  }, [activeId]) // eslint-disable-line react-hooks/exhaustive-deps

  const run = useCallback(() => {
    const { output: out, errors: errs } = runPython(code)
    setOutput(out)
    setErrors(errs)

    const results = scenario.checkObjectives(code, out)
    setObjectives((prev) => ({ ...prev, [activeId]: results }))

    if (results.every(Boolean) && !completed[activeId]) {
      setCompleted((prev) => ({ ...prev, [activeId]: true }))
      setTotalPts((p) => p + scenario.points)
    }
  }, [code, scenario, activeId, completed])

  const onKeyDown = useCallback(
    (e) => {
      if (e.key === 'Tab') {
        e.preventDefault()
        const el = e.target
        const start = el.selectionStart
        const end = el.selectionEnd
        setCode(code.slice(0, start) + '    ' + code.slice(end))
        requestAnimationFrame(() => {
          el.selectionStart = el.selectionEnd = start + 4
        })
      } else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault()
        run()
      }
    },
    [code, run],
  )

  const objs = objectives[activeId] ?? scenario.objectives.map(() => false)
  const allDone = objs.every(Boolean)

  return (
    <div className="flex h-full flex-col bg-[#0d1117] text-gray-200 md:flex-row">

      {/* ── Sidebar ─────────────────────────────────────── */}
      <aside className="flex shrink-0 flex-col gap-3 overflow-y-auto border-b border-blue-900/40 bg-[#161b22] p-3 md:w-64 md:border-b-0 md:border-r">

        {/* Score */}
        <div className="rounded-xl border border-blue-500/20 bg-blue-900/20 px-3 py-2 text-center">
          <p className="text-[10px] font-bold uppercase tracking-widest text-blue-600">Puntuación</p>
          <p className="text-2xl font-black text-blue-400">{totalPts}</p>
          <p className="text-[10px] text-blue-700">
            {Object.values(completed).filter(Boolean).length}/{PYTHON_SCENARIOS.length} niveles
          </p>
        </div>

        {/* Level list */}
        <div className="space-y-1.5">
          {PYTHON_SCENARIOS.map((s) => (
            <LevelCard
              key={s.id}
              scenario={s}
              completed={!!completed[s.id]}
              active={s.id === activeId}
              onClick={() => setActiveId(s.id)}
            />
          ))}
        </div>

        <p className="text-center text-[10px] text-blue-900">Tab → 4 espacios · Ctrl+Enter → Ejecutar</p>
      </aside>

      {/* ── Main area ───────────────────────────────────── */}
      <div className="flex min-h-0 flex-1 flex-col">

        {/* Mission header */}
        <div className="border-b border-blue-900/40 bg-[#161b22] px-4 py-3">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600">
                  {scenario.category}
                </span>
                <span className={`text-[10px] font-bold ${scenario.difficultyColor}`}>
                  {scenario.difficulty}
                </span>
                <span className="text-[10px] text-gray-600">{scenario.points} pts</span>
              </div>
              <h2 className="text-sm font-bold text-gray-100">🐍 {scenario.title}</h2>
              <p className="mt-0.5 text-xs text-gray-400">{scenario.briefing}</p>
            </div>
            <button
              onClick={() => setShowHint((h) => !h)}
              className="shrink-0 rounded-lg border border-yellow-500/30 px-3 py-1.5 text-xs font-medium text-yellow-500 hover:bg-yellow-500/10"
            >
              💡 Pista
            </button>
          </div>

          {showHint && (
            <div className="mt-3 rounded-lg border border-yellow-500/20 bg-yellow-900/10 px-3 py-2">
              <pre className="whitespace-pre-wrap font-mono text-xs text-yellow-300/80">{scenario.hint}</pre>
            </div>
          )}

          {/* Objectives */}
          <ul className="mt-3 space-y-1">
            {scenario.objectives.map((obj, i) => (
              <li
                key={i}
                className={`flex items-start gap-2 text-xs ${objs[i] ? 'text-blue-400' : 'text-gray-500'}`}
              >
                <span className="shrink-0">{objs[i] ? '✅' : '⬜'}</span>
                <span className={objs[i] ? 'line-through opacity-60' : ''}>{obj}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Editor */}
        <div className="relative min-h-0 flex-1">
          <span className="pointer-events-none absolute left-2 top-1.5 text-[10px] font-bold uppercase tracking-widest text-blue-900">
            editor.py
          </span>
          <textarea
            ref={editorRef}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onKeyDown={onKeyDown}
            className="h-full w-full resize-none bg-[#0d1117] pb-2 pl-3 pr-3 pt-6 font-mono text-sm text-gray-200 outline-none"
            spellCheck={false}
            autoCapitalize="none"
            autoComplete="off"
            autoCorrect="off"
            placeholder="# Escribe tu código Python aquí..."
          />
        </div>

        {/* Run bar + Output */}
        <div className="border-t border-blue-900/40">
          <div className="flex items-center justify-between bg-[#161b22] px-3 py-1.5">
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-600">salida</span>
            <button
              onClick={run}
              className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-blue-500 active:scale-95"
            >
              ▶ Ejecutar
              <span className="text-[10px] opacity-50">Ctrl+↵</span>
            </button>
          </div>
          <div className="h-32 overflow-y-auto bg-[#0d1117] px-3 py-2 font-mono text-xs">
            {output.length === 0 && errors.length === 0 && (
              <span className="text-gray-700">Presiona ▶ Ejecutar para ver la salida…</span>
            )}
            {output.map((line, i) => (
              <div key={i} className="text-gray-300 leading-5">
                {line === '' ? <br /> : line}
              </div>
            ))}
            {errors.map((err, i) => (
              <div key={i} className="text-red-400 leading-5">{err}</div>
            ))}
            {allDone && (
              <div className="mt-1 font-bold text-blue-400">
                ✅ ¡Nivel completado! +{scenario.points} pts
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
