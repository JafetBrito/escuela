import { useState, useCallback, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAuthStore } from '../../../stores/useAuthStore'
import { useFriendsStore } from '../../../stores/useFriendsStore'
import { useHospitalStore } from '../../../stores/useHospitalStore'
import { supabase } from '../../../services/supabase/client'
import HospitalMapView, { HACK_DELTA, TREAT_DELTA } from './HospitalMapView'

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
    <div className="h-full w-full">
      <HospitalMapView
        activeMatch={activeMatch}
        myId={myId}
        myName={myName}
        myRole={myRole}
        oppName={oppName}
        isOver={isOver}
        result={result}
        iWon={iWon}
        secondsLeft={secondsLeft}
        onSolve={handleSolve}
        onExit={exitMatch}
      />
    </div>
  )
}
