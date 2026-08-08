import { useState, useCallback, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAuthStore } from '../../../stores/useAuthStore'
import { useFriendsStore } from '../../../stores/useFriendsStore'
import { useHospitalStore } from '../../../stores/useHospitalStore'
import { supabase } from '../../../services/supabase/client'
import { createShell } from '../../../lib/bashSimulator'
import { HOSPITAL_HACK_CHALLENGES } from '../../../data/hospitalHackChallenges'
import { HOSPITAL_PATIENT_CASES } from '../../../data/hospitalCases'
import TerminalOutput from '../hacker/TerminalOutput'

// "Oliver Cyber Range: Hospital" — Hacker vs Doctor 1v1 en tiempo real.
// Quien invita elige su rol (useHospitalStore.sendInvite); ambos comparten
// un solo medidor "Seguridad del Hospital" (0-100) que ve el otro jugador
// en vivo por Realtime. El Hacker resuelve mini-retos de terminal (motor
// de hacker-terminal, bashSimulator.js) que le restan seguridad; el
// Doctor resuelve casos de pacientes (opción múltiple) que le suman —
// cada acierto va por el RPC adjust_hospital_security (server-side,
// atómico) en vez de que el cliente calcule el nuevo valor.
const HACK_DELTA = -15
const TREAT_DELTA = 10

function MiniTerminal({ shell, onOutput }) {
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

function HackerPanel({ onSolve, disabled }) {
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
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border-2 border-emerald-900/50">
      <div className="border-b border-emerald-900/40 bg-[#161b22] px-4 py-2.5">
        <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600">🕶️ Objetivo del Hacker</p>
        <h3 className="font-bold text-emerald-400">{challenge.title}</h3>
        <p className="mt-1 text-xs text-gray-400">{challenge.briefing}</p>
        <p className="mt-1 text-[11px] text-yellow-500">💡 {challenge.hint}</p>
      </div>
      <div className="relative min-h-0 flex-1" aria-disabled={disabled}>
        {flash && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-emerald-500/10 backdrop-blur-[1px]">
            <span className="text-3xl font-black text-emerald-400">💥 ¡Vulnerado! -{Math.abs(HACK_DELTA)} seguridad</span>
          </div>
        )}
        <MiniTerminal key={shellKey} shell={shellRef.current} onOutput={handleOutput} />
      </div>
    </div>
  )
}

function DoctorPanel({ onSolve, disabled }) {
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

function SecurityBar({ security }) {
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

export default function HospitalRangeGame() {
  const session = useAuthStore((s) => s.session)
  const profile = useAuthStore((s) => s.profile)
  const friends = useFriendsStore((s) => s.friends)
  const [searchParams, setSearchParams] = useSearchParams()

  const searchResults = useHospitalStore((s) => s.searchResults)
  const searching = useHospitalStore((s) => s.searching)
  const invitesIn = useHospitalStore((s) => s.invitesIn)
  const invitesOut = useHospitalStore((s) => s.invitesOut)
  const myMatches = useHospitalStore((s) => s.myMatches)
  const activeMatch = useHospitalStore((s) => s.activeMatch)
  const searchProfiles = useHospitalStore((s) => s.searchProfiles)
  const fetchInvites = useHospitalStore((s) => s.fetchInvites)
  const fetchMyMatches = useHospitalStore((s) => s.fetchMyMatches)
  const sendInvite = useHospitalStore((s) => s.sendInvite)
  const cancelInvite = useHospitalStore((s) => s.cancelInvite)
  const respondInvite = useHospitalStore((s) => s.respondInvite)
  const openMatch = useHospitalStore((s) => s.openMatch)
  const closeMatch = useHospitalStore((s) => s.closeMatch)
  const submitAction = useHospitalStore((s) => s.submitAction)

  const [mode, setMode] = useState('lobby')
  const [searchQuery, setSearchQuery] = useState('')
  const [myRoleChoice, setMyRoleChoice] = useState('hacker')
  const [answerError, setAnswerError] = useState(null)
  const [now, setNow] = useState(Date.now())

  const myId = session?.user?.id
  const myName = profile?.display_name || session?.user?.email || 'Jugador'

  const refreshLobby = useCallback(() => {
    if (!myId) return
    fetchInvites(myId)
    fetchMyMatches(myId)
  }, [myId, fetchInvites, fetchMyMatches])

  useEffect(() => { refreshLobby() }, [refreshLobby])
  useEffect(() => { if (mode === 'lobby') refreshLobby() }, [mode, refreshLobby])

  useEffect(() => {
    const id = setTimeout(() => searchProfiles(searchQuery), 300)
    return () => clearTimeout(id)
  }, [searchQuery, searchProfiles])

  const handleOpenMatch = useCallback((matchId) => {
    setAnswerError(null)
    openMatch(matchId)
    setMode('match')
  }, [openMatch])

  // Deep-link desde la notificación (?invite=<hospital_invite_id>) — mismo
  // patrón que TriviaGame.jsx.
  useEffect(() => {
    const inviteId = searchParams.get('invite')
    if (!inviteId || !myId) return
    supabase.from('hospital_invites').select('*').eq('id', inviteId).maybeSingle().then(({ data: invite }) => {
      if (invite?.match_id) handleOpenMatch(invite.match_id)
    })
    setSearchParams((p) => { p.delete('invite'); return p }, { replace: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [myId])

  const handleSendInvite = async (toId, toName) => {
    if (!myId) return
    const { error } = await sendInvite(myId, myName, myRoleChoice, toId, toName)
    if (error) { setAnswerError(`No se pudo enviar la invitación: ${error.message}`); return }
    setSearchQuery('')
  }

  const handleRespond = async (invite, accept) => {
    const { data, error } = await respondInvite(invite, accept)
    if (accept && data) handleOpenMatch(data.id)
    else if (accept && error) setAnswerError(error.message)
  }

  const exitMatch = () => { closeMatch(); setMode('lobby'); refreshLobby() }

  // Reloj visible del tiempo restante. El cierre real de la partida en la
  // base de datos ocurre en el próximo acierto de cualquiera de los dos
  // (adjust_hospital_security revisa ends_at) — mientras tanto, en cuanto
  // el reloj llega a 0 el cliente YA trata la partida como terminada
  // (isOver más abajo), sin necesitar un cron que la cierre sola.
  useEffect(() => {
    if (mode !== 'match' || !activeMatch || activeMatch.status === 'finalizada') return
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [mode, activeMatch?.status])

  // ── Lobby ──
  if (mode === 'lobby') {
    return (
      <div className="flex h-full flex-col bg-background text-text">
        <div className="flex items-center justify-between gap-2 border-b border-border bg-surface px-3 py-2">
          <span className="text-sm font-bold">🏥 Oliver Cyber Range</span>
          <button type="button" onClick={refreshLobby} className="rounded-lg border border-border px-2.5 py-1 text-xs font-bold text-text-muted hover:bg-surface-hover">🔄</button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="mx-auto max-w-2xl space-y-4">
            <div className="rounded-2xl border-2 border-border bg-gradient-to-br from-slate-900 to-slate-800 p-4 text-white">
              <p className="text-xs font-black uppercase tracking-widest text-emerald-400">Misión: Hospital Central</p>
              <p className="mt-1 text-sm text-slate-300">
                Un Hacker intenta vulnerar los sistemas del hospital mientras un Doctor trata pacientes para mantenerlo en pie.
                Invita a alguien, elige tu bando, y que gane el que resista más.
              </p>
            </div>

            {answerError && (
              <div className="rounded-xl border border-danger/40 bg-danger/10 p-3 text-sm text-danger">{answerError}</div>
            )}

            {invitesIn.length > 0 && (
              <div className="rounded-2xl border border-primary/30 bg-primary/5 p-3">
                <p className="mb-2 text-xs font-bold uppercase text-text-muted">Invitaciones recibidas</p>
                <div className="space-y-2">
                  {invitesIn.map((inv) => (
                    <div key={inv.id} className="flex items-center justify-between gap-2 rounded-xl bg-surface p-2.5">
                      <div>
                        <p className="text-sm font-bold text-text">{inv.from_name}</p>
                        <p className="text-[11px] text-text-muted">Tú serás {inv.from_role === 'hacker' ? '🩺 Doctor' : '🕶️ Hacker'}</p>
                      </div>
                      <div className="flex gap-1.5">
                        <button type="button" onClick={() => handleRespond(inv, true)} className="rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-background">Aceptar</button>
                        <button type="button" onClick={() => handleRespond(inv, false)} className="rounded-lg border border-border px-3 py-1.5 text-xs text-text-muted hover:text-text">Rechazar</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {myMatches.length > 0 && (
              <div className="rounded-2xl border border-border bg-surface p-3">
                <p className="mb-2 text-xs font-bold uppercase text-text-muted">Tus partidas en curso</p>
                <div className="space-y-2">
                  {myMatches.map((m) => {
                    const myRole = myId === m.hacker_id ? 'hacker' : 'doctor'
                    const oppName = myRole === 'hacker' ? m.doctor_name : m.hacker_name
                    return (
                      <button key={m.id} type="button" onClick={() => handleOpenMatch(m.id)}
                        className="flex w-full items-center justify-between gap-2 rounded-xl bg-surface-hover p-2.5 text-left hover:bg-primary/10">
                        <span className="text-sm font-bold text-text">
                          {myRole === 'hacker' ? '🕶️' : '🩺'} vs {oppName} · Seguridad {m.security}%
                        </span>
                        <span className="text-xs text-primary">Continuar →</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {invitesOut.length > 0 && (
              <div className="rounded-2xl border border-border bg-surface p-3">
                <p className="mb-2 text-xs font-bold uppercase text-text-muted">Invitaciones enviadas</p>
                <div className="space-y-2">
                  {invitesOut.map((inv) => (
                    <div key={inv.id} className="flex items-center justify-between gap-2 rounded-xl bg-surface-hover p-2.5">
                      <span className="text-sm text-text">{inv.to_name} · tú de {inv.from_role === 'hacker' ? '🕶️ Hacker' : '🩺 Doctor'}</span>
                      <button type="button" onClick={() => cancelInvite(inv.id)} className="text-xs text-danger hover:underline">Cancelar</button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="rounded-2xl border border-border bg-surface p-3">
              <p className="mb-2 text-xs font-bold uppercase text-text-muted">Invitar a alguien</p>

              <p className="mb-1.5 text-[11px] font-semibold text-text-muted">Yo quiero ser:</p>
              <div className="mb-3 grid grid-cols-2 gap-2">
                <button type="button" onClick={() => setMyRoleChoice('hacker')}
                  className={`rounded-xl border-2 px-3 py-2 text-sm font-bold transition-colors ${myRoleChoice === 'hacker' ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400' : 'border-border text-text-muted'}`}>
                  🕶️ Hacker
                </button>
                <button type="button" onClick={() => setMyRoleChoice('doctor')}
                  className={`rounded-xl border-2 px-3 py-2 text-sm font-bold transition-colors ${myRoleChoice === 'doctor' ? 'border-sky-500 bg-sky-500/10 text-sky-400' : 'border-border text-text-muted'}`}>
                  🩺 Doctor
                </button>
              </div>

              {friends.length > 0 && (
                <div className="mb-2 flex flex-wrap gap-1.5">
                  {friends.map((f) => (
                    <button key={f} type="button" onClick={() => setSearchQuery(f)}
                      className="rounded-full border border-border px-2.5 py-1 text-[11px] font-semibold text-text-muted hover:bg-surface-hover">
                      👤 {f}
                    </button>
                  ))}
                </div>
              )}

              <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Busca por nombre o email…"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text outline-none focus:border-primary" />

              <div className="mt-2 space-y-1.5">
                {searching && <p className="text-xs text-text-muted">Buscando…</p>}
                {!searching && searchQuery.trim() && searchResults.length === 0 && (
                  <p className="text-xs text-text-muted">Sin resultados.</p>
                )}
                {searchResults.map((u) => (
                  <div key={u.id} className="flex items-center justify-between gap-2 rounded-lg border border-border/60 px-2.5 py-1.5">
                    <div>
                      <p className="text-sm font-semibold text-text">{u.display_name || 'Sin nombre'}</p>
                      <p className="text-[11px] text-text-muted">{u.email}</p>
                    </div>
                    <button type="button" onClick={() => handleSendInvite(u.id, u.display_name || u.email)}
                      className="rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-background">Invitar</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── Match ──
  if (!activeMatch) {
    return <div className="flex h-full items-center justify-center text-sm text-text-muted">Cargando partida…</div>
  }

  const myRole = myId === activeMatch.hacker_id ? 'hacker' : 'doctor'
  const oppName = myRole === 'hacker' ? activeMatch.doctor_name : activeMatch.hacker_name
  const endsAtMs = new Date(activeMatch.ends_at).getTime()
  const timeUp = now >= endsAtMs
  const isOver = activeMatch.status === 'finalizada' || timeUp
  const result = activeMatch.status === 'finalizada' ? activeMatch.result : (activeMatch.security <= 0 ? 'hacker' : 'doctor')
  const secondsLeft = Math.max(0, Math.round((endsAtMs - now) / 1000))
  const iWon = result === myRole

  const handleSolve = () => {
    if (isOver) return
    submitAction(activeMatch.id, myRole === 'hacker' ? HACK_DELTA : TREAT_DELTA, myRole === 'hacker')
  }

  return (
    <div className="flex h-full flex-col bg-background text-text">
      <div className="flex items-center justify-between gap-2 border-b border-border bg-surface px-3 py-2">
        <span className="text-sm font-bold">🏥 Cyber Range: Hospital</span>
        <button type="button" onClick={exitMatch} className="rounded-lg border border-border px-2.5 py-1 text-xs font-bold text-text-muted hover:bg-surface-hover hover:text-text">← Lobby</button>
      </div>

      <div className="flex flex-1 flex-col overflow-y-auto p-4">
        <div className="mx-auto w-full max-w-4xl">
          <div className="mb-3 rounded-xl border border-border bg-surface p-3">
            <SecurityBar security={activeMatch.security} />
            <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="font-bold text-text">
                Tú: {myRole === 'hacker' ? '🕶️ Hacker' : '🩺 Doctor'} · vs {oppName}
              </span>
              <span className="font-mono font-bold text-text-muted">
                🕒 {isOver ? '00:00' : `${String(Math.floor(secondsLeft / 60)).padStart(2, '0')}:${String(secondsLeft % 60).padStart(2, '0')}`}
                {' · '}💥 {activeMatch.hacks_completed} · 💉 {activeMatch.patients_saved}
              </span>
            </div>
          </div>

          {isOver ? (
            <div className="rounded-3xl border-2 border-border bg-surface p-8 text-center">
              <p className="mb-2 text-5xl">{iWon ? '🏆' : '💔'}</p>
              <p className="mb-1 text-2xl font-black">
                {result === 'hacker' ? '🕶️ El Hacker vulneró el hospital' : '🩺 El Doctor mantuvo el hospital en pie'}
              </p>
              <p className="mb-5 text-sm font-semibold text-text-muted">{iWon ? '¡Ganaste!' : 'Perdiste esta vez.'}</p>
              <button type="button" onClick={exitMatch} className="rounded-xl bg-primary px-5 py-2.5 text-sm font-black text-background">Volver al lobby</button>
            </div>
          ) : (
            <div className="h-[520px]">
              {myRole === 'hacker'
                ? <HackerPanel onSolve={handleSolve} disabled={isOver} />
                : <DoctorPanel onSolve={handleSolve} disabled={isOver} />}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
