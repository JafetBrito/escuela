import { useState, useEffect, useRef } from 'react'
import { createShell } from '../../../lib/bashSimulator'
import { HOSPITAL_HACK_CHALLENGES } from '../../../data/hospitalHackChallenges'
import { HOSPITAL_PATIENT_CASES } from '../../../data/hospitalCases'
import TerminalOutput from '../hacker/TerminalOutput'

// Paneles de objetivo compartidos entre HospitalRangeGame.jsx (versión
// pantalla dividida, ya no usada en el modo mapa pero se deja por si se
// necesita un modo rápido sin mapa) y HospitalMapView.jsx (versión mapa:
// se abren al acercarte a tu zona de objetivo). Extraídos a su propio
// archivo para no duplicar esta lógica entre los dos.
export const HACK_DELTA = -15
export const TREAT_DELTA = 10
// Blue Team "parcha" la misma terminal que explota Red Team — mismo reto,
// mismo minijuego, pero resolverlo suma seguridad en vez de restarla.
export const BLUE_PATCH_DELTA = 12

export function MiniTerminal({ shell, onOutput }) {
  const [lines, setLines] = useState([])
  const [inputValue, setInputValue] = useState('')
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    setLines([shell.prompt()])
    inputRef.current?.focus()
  }, [shell])

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [lines])

  const submit = () => {
    const raw = inputValue
    const promptLine = shell.prompt() + raw
    const { output, clear } = shell.run(raw)
    if (clear) setLines([shell.prompt()])
    else setLines((prev) => [...prev, promptLine, ...output, shell.prompt()])
    onOutput?.(output)
    setInputValue('')
  }

  return (
    <div className="flex h-full flex-col bg-[#0d1117] font-mono text-[13px] leading-5 text-gray-200" onClick={() => inputRef.current?.focus()}>
      <div className="flex-1 overflow-y-auto p-3">
        <TerminalOutput lines={lines.slice(0, -1)} />
        <div className="flex items-center">
          <TerminalOutput lines={[lines[lines.length - 1] ?? '']} />
          <input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); submit() } }}
            className="flex-1 bg-transparent text-gray-200 caret-emerald-400 outline-none"
            spellCheck={false} autoCapitalize="none" autoComplete="off" autoCorrect="off"
          />
        </div>
        <div ref={bottomRef} />
      </div>
    </div>
  )
}

// Tema visual por equipo — clases completas y literales (no template
// strings) porque Tailwind escanea el código fuente para generar el CSS;
// una clase armada con interpolación (`border-${x}-900`) no se generaría.
// `team` undefined = el Hacker "de siempre" del multijugador real 1v1
// (verde, sin botón de puerta) — no toca esa experiencia ya probada.
const HACKER_THEME = {
  red: {
    title: '🔴 Objetivo del Red Team', label: 'text-red-600', titleText: 'text-red-400',
    border: 'border-red-900/50', headerBorder: 'border-red-900/40', flashBg: 'bg-red-500/10', flashText: 'text-red-400',
  },
  blue: {
    title: '🔵 Objetivo del Blue Team', label: 'text-sky-600', titleText: 'text-sky-400',
    border: 'border-sky-900/50', headerBorder: 'border-sky-900/40', flashBg: 'bg-sky-500/10', flashText: 'text-sky-400',
  },
  default: {
    title: '🕶️ Objetivo del Hacker', label: 'text-emerald-600', titleText: 'text-emerald-400',
    border: 'border-emerald-900/50', headerBorder: 'border-emerald-900/40', flashBg: 'bg-emerald-500/10', flashText: 'text-emerald-400',
  },
}

export function HackerPanel({ team, onSolve, disabled, doorLocked, onToggleDoor }) {
  const theme = HACKER_THEME[team] ?? HACKER_THEME.default
  const [solvedIds, setSolvedIds] = useState([])
  const [challengeId, setChallengeId] = useState(HOSPITAL_HACK_CHALLENGES[0].id)
  const [flash, setFlash] = useState(false)
  const challenge = HOSPITAL_HACK_CHALLENGES.find((c) => c.id === challengeId)

  // shellKey (estado, no el challengeId directo) es lo que fuerza el
  // remount de MiniTerminal — necesario para que lea el shellRef YA
  // actualizado: si el remount dependiera de challengeId directo, React
  // lo dispararía en el mismo render en que challengeId cambia, ANTES de
  // que este efecto alcance a recrear shellRef.current, y la terminal
  // nueva se quedaría con el sistema de archivos del reto anterior. Mismo
  // patrón que ya usa HackerTerminalGame.jsx.
  const shellRef = useRef(null)
  if (!shellRef.current) shellRef.current = createShell(challenge.initialFs, { sudoPassword: challenge.sudoPassword ?? null })
  const [shellKey, setShellKey] = useState(0)

  useEffect(() => {
    shellRef.current = createShell(challenge.initialFs, { sudoPassword: challenge.sudoPassword ?? null })
    setShellKey((k) => k + 1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [challengeId])

  const handleOutput = (output) => {
    if (flash || !challenge.checkFlag(output)) return
    setFlash(true)
    onSolve()
    setTimeout(() => {
      setSolvedIds((prev) => {
        const next = [...prev, challenge.id]
        const pool = HOSPITAL_HACK_CHALLENGES.filter((c) => !next.includes(c.id))
        const remaining = pool.length ? pool : HOSPITAL_HACK_CHALLENGES
        setChallengeId(remaining[Math.floor(Math.random() * remaining.length)].id)
        return pool.length ? next : []
      })
      setFlash(false)
    }, 1100)
  }

  return (
    <div className={`flex h-full flex-col overflow-hidden rounded-2xl border-2 ${theme.border}`}>
      <div className={`border-b ${theme.headerBorder} bg-[#161b22] px-4 py-2.5`}>
        <p className={`text-[10px] font-black uppercase tracking-widest ${theme.label}`}>{theme.title}</p>
        <h3 className={`font-bold ${theme.titleText}`}>{challenge.title}</h3>
        <p className="mt-1 text-xs text-gray-400">{challenge.briefing}</p>
        <p className="mt-1 text-[11px] text-yellow-500">💡 {challenge.hint}</p>
      </div>
      {onToggleDoor && (
        <div className="border-b border-white/10 bg-[#0d1117] px-4 py-2">
          {team === 'blue' ? (
            <button type="button" disabled={!doorLocked} onClick={onToggleDoor}
              className="rounded-lg bg-sky-500 px-3 py-1.5 text-xs font-bold text-background disabled:cursor-not-allowed disabled:opacity-40">
              🔓 Desbloquear puerta de Recepción
            </button>
          ) : (
            <button type="button" disabled={!!doorLocked} onClick={onToggleDoor}
              className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-40">
              🔒 Bloquear puerta de Recepción
            </button>
          )}
          <span className="ml-2 text-[11px] text-text-muted">{doorLocked ? '🔒 Bloqueada' : '🔓 Abierta'}</span>
        </div>
      )}
      <div className="relative min-h-0 flex-1" aria-disabled={disabled}>
        {flash && (
          <div className={`absolute inset-0 z-10 flex items-center justify-center ${theme.flashBg} backdrop-blur-[1px]`}>
            <span className={`text-3xl font-black ${theme.flashText}`}>
              {team === 'blue' ? `🛡️ ¡Parchado! +${BLUE_PATCH_DELTA} seguridad` : `💥 ¡Vulnerado! -${Math.abs(HACK_DELTA)} seguridad`}
            </span>
          </div>
        )}
        <MiniTerminal key={shellKey} shell={shellRef.current} onOutput={handleOutput} />
      </div>
    </div>
  )
}

export function DoctorPanel({ onSolve, disabled }) {
  const [solvedIds, setSolvedIds] = useState([])
  const [caseId, setCaseId] = useState(HOSPITAL_PATIENT_CASES[0].id)
  const [pick, setPick] = useState(null)
  const kase = HOSPITAL_PATIENT_CASES.find((c) => c.id === caseId)

  const handlePick = (i) => {
    if (disabled || pick !== null) return
    setPick(i)
    if (i === kase.correct) onSolve()
    setTimeout(() => {
      setSolvedIds((prev) => {
        const next = [...prev, kase.id]
        const pool = HOSPITAL_PATIENT_CASES.filter((c) => !next.includes(c.id))
        const remaining = pool.length ? pool : HOSPITAL_PATIENT_CASES
        setCaseId(remaining[Math.floor(Math.random() * remaining.length)].id)
        return pool.length ? next : []
      })
      setPick(null)
    }, 1400)
  }

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border-2 border-sky-900/50 bg-surface">
      <div className="border-b border-sky-900/40 bg-sky-950/30 px-4 py-2.5">
        <p className="text-[10px] font-black uppercase tracking-widest text-sky-500">🩺 Paciente del Doctor</p>
      </div>
      <div className="flex-1 overflow-y-auto p-5">
        <p className="mb-4 text-lg font-bold text-text">{kase.patient}</p>
        <div className="grid gap-2.5 sm:grid-cols-2">
          {kase.options.map((opt, i) => {
            const revealed = pick !== null
            const isCorrect = i === kase.correct
            const cls = !revealed
              ? 'border-border hover:border-sky-500 hover:bg-sky-500/5'
              : isCorrect ? 'border-emerald-500 bg-emerald-500/15 text-emerald-300'
              : pick === i ? 'border-danger bg-danger/15 text-danger'
              : 'border-border/60 opacity-40'
            return (
              <button key={i} type="button" disabled={disabled || revealed} onClick={() => handlePick(i)}
                className={`rounded-xl border-2 px-4 py-3 text-left text-sm font-semibold transition-all disabled:cursor-not-allowed ${cls}`}>
                {opt}
              </button>
            )
          })}
        </div>
        {pick !== null && <p className="mt-3 text-xs text-text-muted">{kase.explanation}</p>}
      </div>
    </div>
  )
}

// Lo que ve el Doctor si llega a Recepción y Red Team ya bloqueó la
// puerta — no puede hacer nada más que esperar a que Blue Team la abra
// (la comprobación es en vivo: si se desbloquea mientras esto está en
// pantalla, el padre re-renderiza DoctorPanel solo, sin que el jugador
// tenga que cerrar y volver a entrar).
export function DoorLockedNotice() {
  return (
    <div className="flex h-full flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-red-900/50 bg-surface p-6 text-center">
      <p className="mb-3 text-5xl">🔒</p>
      <p className="text-lg font-bold text-text">La puerta de Recepción está bloqueada</p>
      <p className="mt-2 max-w-xs text-sm text-text-muted">
        Alguien del Red Team la cerró. No puedes atender pacientes hasta que el Blue Team la desbloquee — espera aquí.
      </p>
    </div>
  )
}

export function SecurityBar({ security }) {
  const color = security > 60 ? 'bg-emerald-500' : security > 30 ? 'bg-amber-500' : 'bg-danger'
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs font-bold">
        <span className="text-text-muted">🛡️ Seguridad del Hospital</span>
        <span className={security > 30 ? 'text-text' : 'text-danger'}>{security}%</span>
      </div>
      <div className="h-3 w-full overflow-hidden rounded-full bg-border">
        <div className={`h-full rounded-full transition-all duration-500 ${color}`} style={{ width: `${security}%` }} />
      </div>
    </div>
  )
}
