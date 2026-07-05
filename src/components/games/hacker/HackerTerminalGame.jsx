import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { createShell } from '../../../lib/bashSimulator'
import { CTF_SCENARIOS } from '../../../lib/ctfScenarios'
import TerminalOutput from './TerminalOutput'

// ── Terminal panel ─────────────────────────────────────────────────────────────
function Terminal({ shell, onOutput }) {
  const [lines,       setLines]       = useState([])
  const [inputValue,  setInputValue]  = useState('')
  const [histIdx,     setHistIdx]     = useState(-1)
  const [histSnap,    setHistSnap]    = useState('')
  const bottomRef = useRef(null)
  const inputRef  = useRef(null)

  // Render the initial prompt once
  useEffect(() => {
    setLines([shell.prompt()])
    inputRef.current?.focus()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [lines])

  const submit = useCallback(() => {
    const raw = inputValue
    const promptLine = shell.prompt() + raw

    const { output, clear } = shell.run(raw)

    if (clear) {
      setLines([shell.prompt()])
    } else {
      setLines((prev) => [...prev, promptLine, ...output, shell.prompt()])
    }

    if (onOutput) onOutput(output, shell.getState(), shell.getFs())
    setInputValue('')
    setHistIdx(-1)
    setHistSnap('')
  }, [inputValue, shell, onOutput])

  const onKeyDown = useCallback((e) => {
    const hist = shell.getState().history
    if (e.key === 'Enter') {
      e.preventDefault()
      submit()
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (hist.length === 0) return
      const newIdx = histIdx === -1 ? hist.length - 1 : Math.max(0, histIdx - 1)
      if (histIdx === -1) setHistSnap(inputValue)
      setHistIdx(newIdx)
      setInputValue(hist[newIdx])
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (histIdx === -1) return
      const newIdx = histIdx + 1
      if (newIdx >= hist.length) {
        setHistIdx(-1)
        setInputValue(histSnap)
      } else {
        setHistIdx(newIdx)
        setInputValue(hist[newIdx])
      }
    } else if (e.key === 'Tab') {
      e.preventDefault()
      // Basic tab completion: commands
      const CMDS = ['ls','cd','cat','echo','grep','find','chmod','sudo','su','base64','strings','file','man','whoami','id','pwd','mkdir','touch','rm','cp','mv','env','export','which','history','clear','help','uname','hostname','date','ps']
      const typed = inputValue.split(' ').pop() ?? ''
      const match = CMDS.find((c) => c.startsWith(typed) && c !== typed)
      if (match && typed) setInputValue(inputValue.slice(0, -typed.length) + match)
    } else if (e.key === 'c' && e.ctrlKey) {
      e.preventDefault()
      setLines((prev) => [...prev, shell.prompt() + inputValue + '^C', shell.prompt()])
      setInputValue('')
    } else if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault()
      setLines([shell.prompt()])
    }
  }, [histIdx, histSnap, inputValue, shell, submit])

  return (
    <div
      className="flex h-full flex-col bg-[#0d1117] font-mono text-[13px] leading-5 text-gray-200"
      onClick={() => inputRef.current?.focus()}
    >
      {/* Output area */}
      <div className="flex-1 overflow-y-auto p-3">
        <TerminalOutput lines={lines.slice(0, -1)} />
        {/* Last line (prompt) + cursor input */}
        <div className="flex items-center">
          <TerminalOutput lines={[lines[lines.length - 1] ?? '']} />
          <input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={onKeyDown}
            className="flex-1 bg-transparent text-gray-200 caret-emerald-400 outline-none"
            spellCheck={false}
            autoCapitalize="none"
            autoComplete="off"
            autoCorrect="off"
          />
        </div>
        <div ref={bottomRef} />
      </div>
    </div>
  )
}

// ── Objective list ─────────────────────────────────────────────────────────────
function ObjectiveList({ objectives }) {
  return (
    <ul className="space-y-1.5">
      {objectives.map((obj) => (
        <li key={obj.id} className={`flex items-start gap-2 text-sm ${obj.done ? 'text-emerald-400' : 'text-gray-400'}`}>
          <span className="mt-0.5 shrink-0">{obj.done ? '✅' : '⬜'}</span>
          <span className={obj.done ? 'line-through opacity-60' : ''}>{obj.label}</span>
        </li>
      ))}
    </ul>
  )
}

// ── Level card ─────────────────────────────────────────────────────────────────
function LevelCard({ scenario, completed, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-xl border px-3 py-2.5 text-left transition-all hover:-translate-y-0.5 ${
        active
          ? 'border-emerald-500/60 bg-emerald-500/10'
          : completed
          ? 'border-emerald-800/40 bg-emerald-900/10 opacity-70'
          : 'border-border bg-surface hover:border-border/80'
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="truncate text-xs font-bold text-text">{scenario.title}</span>
        <span className={`shrink-0 text-[10px] font-bold ${scenario.difficultyColor}`}>
          {completed ? '✓' : scenario.points + 'pts'}
        </span>
      </div>
      <span className="text-[10px] text-text-muted">{scenario.category}</span>
    </button>
  )
}

// ── Main game ──────────────────────────────────────────────────────────────────
export default function HackerTerminalGame() {
  const [activeId,   setActiveId]   = useState(CTF_SCENARIOS[0].id)
  const [completed,  setCompleted]  = useState({})   // { [id]: true }
  const [objectives, setObjectives] = useState({})   // { [id]: obj[] }
  const [showHint,   setShowHint]   = useState(false)
  const [won,        setWon]        = useState(false)
  const [totalPts,   setTotalPts]   = useState(0)

  const scenario = useMemo(() => CTF_SCENARIOS.find((s) => s.id === activeId), [activeId])

  // Recreate shell when scenario changes
  const shellRef = useRef(null)
  const [shellKey, setShellKey] = useState(0) // forces Terminal remount

  useEffect(() => {
    shellRef.current = createShell(scenario.initialFs, {
      passwords:    scenario.passwords    ?? {},
      sudoPassword: scenario.sudoPassword ?? null,
    })
    setObjectives((prev) => ({
      ...prev,
      [scenario.id]: prev[scenario.id] ?? scenario.objectives.map((o) => ({ ...o })),
    }))
    setShowHint(false)
    setWon(completed[scenario.id] ?? false)
    setShellKey((k) => k + 1)
  }, [activeId]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleOutput = useCallback((output, state, fs) => {
    if (!scenario || completed[scenario.id]) return

    // Check flag
    if (scenario.checkFlag(output)) {
      setCompleted((prev) => {
        if (prev[scenario.id]) return prev
        setTotalPts((p) => p + scenario.points)
        return { ...prev, [scenario.id]: true }
      })
      setWon(true)
    }

    // Update objectives heuristically
    setObjectives((prev) => {
      const cur = prev[scenario.id] ?? scenario.objectives.map((o) => ({ ...o }))
      const joined = output.join('\n').toLowerCase()
      const cmd    = (state.history?.[state.history.length - 1] ?? '').toLowerCase()

      const updated = cur.map((obj) => {
        if (obj.done) return obj
        // Per-scenario heuristics
        if (obj.id === 'find-welcome'   && cmd.includes('cat') && cmd.includes('bienvenida')) return { ...obj, done: true }
        if (obj.id === 'find-flag'      && joined.includes('flag{'))                           return { ...obj, done: true }
        if (obj.id === 'find-hidden'    && (cmd.includes('ls -a') || cmd.includes('ls -la'))) return { ...obj, done: true }
        if (obj.id === 'read-secret'    && cmd.includes('.secret'))                            return { ...obj, done: true }
        if (obj.id === 'read-transmission' && cmd.includes('transmision'))                     return { ...obj, done: true }
        if (obj.id === 'decode-base64'  && cmd.startsWith('base64'))                           return { ...obj, done: true }
        if (obj.id === 'find-locked'    && (cmd.startsWith('ls') || cmd.startsWith('find')))   return { ...obj, done: true }
        if (obj.id === 'chmod-file'     && cmd.startsWith('chmod'))                            return { ...obj, done: true }
        if (obj.id === 'read-flag'      && joined.includes('flag{'))                           return { ...obj, done: true }
        if (obj.id === 'read-passwd'    && cmd.includes('passwd'))                             return { ...obj, done: true }
        if (obj.id === 'find-password'  && joined.includes('0l1v3r') )                        return { ...obj, done: true }
        if (obj.id === 'switch-root'    && state.user === 'root')                              return { ...obj, done: true }
        if (obj.id === 'find-fragments' && cmd.includes('grep') && cmd.includes('parte_'))    return { ...obj, done: true }
        if (obj.id === 'reconstruct'    && joined.includes('parte_4'))                         return { ...obj, done: true }
        return obj
      })
      return { ...prev, [scenario.id]: updated }
    })
  }, [scenario, completed])

  if (!scenario) return null

  const objs = objectives[scenario.id] ?? scenario.objectives.map((o) => ({ ...o }))

  return (
    <div className="flex h-full flex-col bg-[#0d1117] text-gray-200 md:flex-row">

      {/* ── Sidebar ─────────────────────────────────────── */}
      <aside className="flex shrink-0 flex-col gap-3 overflow-y-auto border-b border-emerald-900/40 bg-[#161b22] p-3 md:w-64 md:border-b-0 md:border-r">

        {/* Score */}
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-900/20 px-3 py-2 text-center">
          <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-600">Puntuación</p>
          <p className="text-2xl font-black text-emerald-400">{totalPts}</p>
          <p className="text-[10px] text-emerald-700">{Object.values(completed).filter(Boolean).length}/{CTF_SCENARIOS.length} niveles</p>
        </div>

        {/* Level list */}
        <div className="space-y-1.5">
          {CTF_SCENARIOS.map((s) => (
            <LevelCard
              key={s.id}
              scenario={s}
              completed={!!completed[s.id]}
              active={s.id === activeId}
              onClick={() => setActiveId(s.id)}
            />
          ))}
        </div>
      </aside>

      {/* ── Main area ───────────────────────────────────── */}
      <div className="flex min-h-0 flex-1 flex-col">

        {/* Mission header */}
        <div className="border-b border-emerald-900/40 bg-[#161b22] px-4 py-3">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600">
                  {scenario.category}
                </span>
                <span className={`text-[10px] font-bold ${scenario.difficultyColor}`}>
                  {scenario.difficulty}
                </span>
              </div>
              <h2 className="font-bold text-emerald-400">{scenario.title}</h2>
            </div>
            {!won && (
              <button
                type="button"
                onClick={() => setShowHint((v) => !v)}
                className="rounded-lg border border-yellow-500/30 bg-yellow-900/20 px-2.5 py-1 text-xs text-yellow-400 transition hover:bg-yellow-900/40"
              >
                💡 {showHint ? 'Ocultar pista' : 'Ver pista'}
              </button>
            )}
          </div>

          {showHint && !won && (
            <p className="mt-2 rounded-lg border border-yellow-500/20 bg-yellow-900/10 px-3 py-2 text-xs text-yellow-300">
              {scenario.hint}
            </p>
          )}
        </div>

        {/* Split: briefing+objectives / terminal */}
        <div className="flex min-h-0 flex-1 flex-col md:flex-row">

          {/* Briefing + objectives */}
          <div className="flex shrink-0 flex-col gap-3 overflow-y-auto border-b border-emerald-900/40 bg-[#0d1117] p-4 md:w-56 md:border-b-0 md:border-r">
            <div>
              <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-gray-500">Briefing</p>
              <p className="whitespace-pre-line text-xs leading-relaxed text-gray-400">
                {scenario.briefing}
              </p>
            </div>
            <div>
              <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-gray-500">Objetivos</p>
              <ObjectiveList objectives={objs} />
            </div>
          </div>

          {/* Terminal */}
          <div className="relative min-h-0 flex-1">
            {won && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 bg-black/80 backdrop-blur-sm">
                <span className="text-6xl">🏆</span>
                <p className="text-2xl font-black text-emerald-400">¡Nivel completado!</p>
                <p className="text-sm text-emerald-600">+{scenario.points} pts</p>
                {activeId !== CTF_SCENARIOS[CTF_SCENARIOS.length - 1].id && (
                  <button
                    type="button"
                    onClick={() => {
                      const next = CTF_SCENARIOS[CTF_SCENARIOS.findIndex((s) => s.id === activeId) + 1]
                      if (next) setActiveId(next.id)
                    }}
                    className="rounded-xl border border-emerald-500/40 bg-emerald-900/30 px-5 py-2 text-sm font-bold text-emerald-400 transition hover:bg-emerald-900/60"
                  >
                    Siguiente nivel →
                  </button>
                )}
                {activeId === CTF_SCENARIOS[CTF_SCENARIOS.length - 1].id && (
                  <p className="text-sm text-emerald-600">¡Completaste todos los niveles! Puntuación final: {totalPts}</p>
                )}
              </div>
            )}
            <Terminal key={shellKey} shell={shellRef.current} onOutput={handleOutput} />
          </div>
        </div>
      </div>
    </div>
  )
}
