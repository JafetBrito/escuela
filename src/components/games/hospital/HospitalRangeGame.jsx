import { useState, useCallback, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAuthStore } from '../../../stores/useAuthStore'
import { useFriendsStore } from '../../../stores/useFriendsStore'
import { useHospitalStore } from '../../../stores/useHospitalStore'
import { supabase } from '../../../services/supabase/client'
import HospitalMapView, { HACK_DELTA, TREAT_DELTA, BLUE_PATCH_DELTA } from './HospitalMapView'

// "Oliver Cyber Range: Hospital" — Hacker vs Doctor 1v1 en tiempo real.
// Quien invita elige su rol (useHospitalStore.sendInvite); ambos comparten
// un solo medidor "Seguridad del Hospital" (0-100) que ve el otro jugador
// en vivo por Realtime. Tras aceptar/abrir la partida, ambos entran directo
// a un mapa 2D compartido (HospitalMapView, mismo motor que Mundo 2D): el
// Hacker camina hasta el Cuarto de Servidores, el Doctor hasta Recepción,
// y ahí se abre su panel de objetivo (terminal / casos de pacientes,
// HospitalPanels.jsx) — cada acierto va por el RPC adjust_hospital_security
// (server-side, atómico) en vez de que el cliente calcule el nuevo valor.

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
  // Práctica solo — partida que vive solo en el cliente (nunca toca
  // hospital_invites/hospital_matches), para que puedas entrar al mapa y
  // probar el juego sin depender de invitar a alguien más. Un "bot" mueve
  // el medidor de seguridad en tu contra cada pocos segundos para que se
  // sienta como una partida real, en vez de dejarte solo sin presión.
  const [soloMatch, setSoloMatch] = useState(null)

  const myId = session?.user?.id
  const myName = profile?.display_name || session?.user?.email || 'Jugador'
  const isSolo = !!soloMatch
  const match = soloMatch ?? activeMatch

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

  // role: 'doctor' | 'hacker_red' | 'hacker_blue' — la práctica solo ahora
  // simula los OTROS DOS roles con bots (no solo uno), para poder probar la
  // dinámica de 3 bandas (Red ataca y bloquea la puerta, Blue parcha y
  // desbloquea, Doctor atiende) sin depender de tener 2 jugadores reales.
  const handleStartSolo = (role) => {
    setAnswerError(null)
    setSoloMatch({
      id: 'solo',
      myRole: role,
      security: 100,
      hacks_completed: 0,
      patients_saved: 0,
      door_locked: false,
      status: 'en_curso',
      result: null,
      ends_at: new Date(Date.now() + 6 * 60_000).toISOString(),
    })
    setNow(Date.now())
    setMode('match')
  }

  const exitMatch = () => { closeMatch(); setSoloMatch(null); setMode('lobby'); refreshLobby() }

  // Reloj visible del tiempo restante. El cierre real de la partida en la
  // base de datos ocurre en el próximo acierto de cualquiera de los dos
  // (adjust_hospital_security revisa ends_at) — mientras tanto, en cuanto
  // el reloj llega a 0 el cliente YA trata la partida como terminada
  // (isOver más abajo), sin necesitar un cron que la cierre sola.
  useEffect(() => {
    if (mode !== 'match' || !match || match.status === 'finalizada') return
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [mode, match?.status])

  // Bots de práctica: en modo solo hay hasta DOS roles simulados a la vez
  // (los que no elegiste) — cada ~4.5s cada bot activo actúa: el Doctor
  // bot cura, el Red Team bot ataca y a veces bloquea la puerta, el Blue
  // Team bot parcha y a veces la desbloquea. Todo lee `prev` dentro del
  // updater (no una variable capturada al armar el efecto) para no
  // quedarse con un estado viejo si el intervalo dispara justo cuando el
  // jugador también actuó.
  useEffect(() => {
    if (mode !== 'match' || !isSolo) return
    const t = setInterval(() => {
      setSoloMatch((prev) => {
        if (!prev || prev.status === 'finalizada' || Date.now() >= new Date(prev.ends_at).getTime()) return prev
        let security = prev.security
        let hacks = prev.hacks_completed
        let saved = prev.patients_saved
        let doorLocked = prev.door_locked
        if (prev.myRole !== 'doctor') { security += TREAT_DELTA; saved += 1 }
        if (prev.myRole !== 'hacker_red') {
          security += HACK_DELTA
          hacks += 1
          if (!doorLocked && Math.random() < 0.4) doorLocked = true
        }
        if (prev.myRole !== 'hacker_blue') {
          security += BLUE_PATCH_DELTA
          saved += 1
          if (doorLocked && Math.random() < 0.5) doorLocked = false
        }
        security = Math.max(0, Math.min(100, security))
        const closesNow = security <= 0
        return {
          ...prev,
          security, hacks_completed: hacks, patients_saved: saved, door_locked: doorLocked,
          status: closesNow ? 'finalizada' : prev.status,
          result: closesNow ? 'hacker' : prev.result,
        }
      })
    }, 4500)
    return () => clearInterval(t)
  }, [mode, isSolo])

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

            <div className="rounded-2xl border-2 border-emerald-500/30 bg-emerald-500/5 p-3">
              <p className="mb-1 text-xs font-black uppercase tracking-widest text-emerald-400">🧪 Practicar solo</p>
              <p className="mb-2 text-[11px] text-text-muted">
                Entra directo al mapa sin invitar a nadie — bots juegan los otros dos bandos. Red Team bloquea la puerta de Recepción, Blue Team la desbloquea, y si está cerrada el Doctor no puede pasar.
              </p>
              <div className="grid grid-cols-3 gap-2">
                <button type="button" onClick={() => handleStartSolo('hacker_red')}
                  className="rounded-xl border-2 border-red-500/60 bg-red-500/10 px-2 py-2 text-xs font-bold text-red-400 hover:bg-red-500/20 sm:text-sm">
                  🔴 Red Team
                </button>
                <button type="button" onClick={() => handleStartSolo('hacker_blue')}
                  className="rounded-xl border-2 border-sky-400/60 bg-sky-400/10 px-2 py-2 text-xs font-bold text-sky-300 hover:bg-sky-400/20 sm:text-sm">
                  🔵 Blue Team
                </button>
                <button type="button" onClick={() => handleStartSolo('doctor')}
                  className="rounded-xl border-2 border-sky-500/60 bg-sky-500/10 px-2 py-2 text-xs font-bold text-sky-400 hover:bg-sky-500/20 sm:text-sm">
                  🩺 Doctor
                </button>
              </div>
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
  if (!match) {
    return <div className="flex h-full items-center justify-center text-sm text-text-muted">Cargando partida…</div>
  }

  const myRole = isSolo ? match.myRole : (myId === match.hacker_id ? 'hacker' : 'doctor')
  const isAttacker = myRole === 'hacker' || myRole === 'hacker_red'
  const oppName = isSolo
    ? (myRole === 'doctor' ? '🔴 Red Team & 🔵 Blue Team (práctica)'
      : myRole === 'hacker_red' ? '🩺 Doctor & 🔵 Blue Team (práctica)'
      : '🩺 Doctor & 🔴 Red Team (práctica)')
    : (myRole === 'hacker' ? match.doctor_name : match.hacker_name)
  const endsAtMs = new Date(match.ends_at).getTime()
  const timeUp = now >= endsAtMs
  const isOver = match.status === 'finalizada' || timeUp
  const result = match.status === 'finalizada' ? match.result : (match.security <= 0 ? 'hacker' : 'doctor')
  const secondsLeft = Math.max(0, Math.round((endsAtMs - now) / 1000))
  const iWon = isAttacker ? result === 'hacker' : result === 'doctor'

  const handleSolve = () => {
    if (isOver) return
    if (isSolo) {
      setSoloMatch((prev) => {
        if (!prev || prev.status === 'finalizada') return prev
        const delta = prev.myRole === 'hacker_red' ? HACK_DELTA : prev.myRole === 'hacker_blue' ? BLUE_PATCH_DELTA : TREAT_DELTA
        const nextSecurity = Math.max(0, Math.min(100, prev.security + delta))
        const closesNow = nextSecurity <= 0
        return {
          ...prev,
          security: nextSecurity,
          hacks_completed: prev.hacks_completed + (prev.myRole === 'hacker_red' ? 1 : 0),
          patients_saved: prev.patients_saved + (prev.myRole !== 'hacker_red' ? 1 : 0),
          status: closesNow ? 'finalizada' : prev.status,
          result: closesNow ? 'hacker' : prev.result,
        }
      })
      return
    }
    submitAction(match.id, myRole === 'hacker' ? HACK_DELTA : TREAT_DELTA, myRole === 'hacker')
  }

  // Puerta de Recepción — solo existe en práctica solo por ahora (el
  // multijugador real sigue siendo Hacker vs Doctor sin Red/Blue Team;
  // llevar esto a partidas en vivo necesita una migración para guardar
  // door_locked en hospital_matches, queda para una fase futura).
  const handleToggleDoor = () => {
    setSoloMatch((prev) => {
      if (!prev) return prev
      if (prev.myRole === 'hacker_red') return { ...prev, door_locked: true }
      if (prev.myRole === 'hacker_blue') return { ...prev, door_locked: false }
      return prev
    })
  }

  return (
    <div className="h-full w-full">
      <HospitalMapView
        activeMatch={match}
        myId={myId}
        myName={myName}
        myRole={myRole}
        oppName={oppName}
        isOver={isOver}
        result={result}
        iWon={iWon}
        secondsLeft={secondsLeft}
        isSolo={isSolo}
        doorLocked={isSolo ? match.door_locked : false}
        onToggleDoor={isSolo && myRole !== 'doctor' ? handleToggleDoor : undefined}
        onSolve={handleSolve}
        onExit={exitMatch}
      />
    </div>
  )
}
