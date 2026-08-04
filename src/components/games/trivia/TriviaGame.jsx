import { useState, useCallback, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAuthStore } from '../../../stores/useAuthStore'
import { useFriendsStore } from '../../../stores/useFriendsStore'
import { useTriviaStore } from '../../../stores/useTriviaStore'
import { TRIVIA_CATEGORIES } from '../../../data/triviaCategories'
import { supabase } from '../../../services/supabase/client'

// Juego de trivia en línea 1v1 — invita por username (calca
// ChessGame.jsx/useChessStore.js), elige categoría, y juega por turnos un
// banco de preguntas sorteado de trivia_questions. Sin modo vs-IA/local en
// este pase — solo en línea, ya que el objetivo es probar el sistema de
// invitaciones/notificaciones/partidas, no ofrecer variantes de juego.
export default function TriviaGame() {
  const session = useAuthStore((s) => s.session)
  const profile = useAuthStore((s) => s.profile)
  const friends = useFriendsStore((s) => s.friends)
  const [searchParams, setSearchParams] = useSearchParams()

  const searchResults  = useTriviaStore((s) => s.searchResults)
  const searching      = useTriviaStore((s) => s.searching)
  const invitesIn      = useTriviaStore((s) => s.invitesIn)
  const invitesOut     = useTriviaStore((s) => s.invitesOut)
  const myMatches       = useTriviaStore((s) => s.myMatches)
  const activeMatch     = useTriviaStore((s) => s.activeMatch)
  const searchProfiles = useTriviaStore((s) => s.searchProfiles)
  const fetchInvites   = useTriviaStore((s) => s.fetchInvites)
  const fetchMyMatches  = useTriviaStore((s) => s.fetchMyMatches)
  const sendInvite     = useTriviaStore((s) => s.sendInvite)
  const cancelInvite   = useTriviaStore((s) => s.cancelInvite)
  const respondInvite  = useTriviaStore((s) => s.respondInvite)
  const openMatch       = useTriviaStore((s) => s.openMatch)
  const closeMatch      = useTriviaStore((s) => s.closeMatch)
  const answerQuestion  = useTriviaStore((s) => s.answerQuestion)

  // mode: 'lobby' | 'match'
  const [mode, setMode] = useState('lobby')
  const [searchQuery, setSearchQuery] = useState('')
  const [inviteCategory, setInviteCategory] = useState(TRIVIA_CATEGORIES[0])
  const [answerError, setAnswerError] = useState(null)
  const [lastPick, setLastPick] = useState(null)

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
    setLastPick(null)
    setAnswerError(null)
    openMatch(matchId)
    setMode('match')
  }, [openMatch])

  // Deep-link desde la notificación (?invite=<trivia_invite_id>): si la
  // invitación ya tiene match_id (el invitador recibe esto cuando el rival
  // acepta), salta directo a la partida; si no, se queda en el lobby con
  // el invite ya visible en la lista de "recibidas" (nada más que hacer,
  // ya está ahí por el fetch normal).
  useEffect(() => {
    const inviteId = searchParams.get('invite')
    if (!inviteId || !myId) return
    supabase.from('trivia_invites').select('*').eq('id', inviteId).maybeSingle().then(({ data: invite }) => {
      if (invite?.match_id) handleOpenMatch(invite.match_id)
    })
    setSearchParams((p) => { p.delete('invite'); return p }, { replace: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [myId])

  const handleSendInvite = async (toId, toName) => {
    if (!myId) return
    await sendInvite(myId, myName, toId, toName, inviteCategory)
    setSearchQuery('')
  }

  const handleRespond = async (invite, accept) => {
    const { data, error } = await respondInvite(invite, accept)
    if (accept && data) handleOpenMatch(data.id)
    else if (accept && error) setAnswerError(error.message)
  }

  const exitMatch = () => {
    closeMatch()
    setMode('lobby')
    refreshLobby()
  }

  // Espera un momento antes de avanzar de pregunta — si no, el cambio de
  // current_index (optimista, en el propio store) reemplaza la pregunta
  // actual casi instantáneo y nadie alcanza a ver el color de "correcto".
  const handleAnswer = (choiceIndex) => {
    if (!activeMatch || lastPick !== null) return
    if (activeMatch.current_turn !== myId) return
    setLastPick(choiceIndex)
    setTimeout(() => answerQuestion(activeMatch.id, activeMatch, choiceIndex), 900)
  }

  // Cuando llega una actualización nueva de la partida (rival respondió o
  // avanzó de pregunta), se limpia la selección local para la pregunta
  // siguiente.
  useEffect(() => { setLastPick(null) }, [activeMatch?.current_index])

  // ── Lobby ──
  if (mode === 'lobby') {
    return (
      <div className="flex h-full flex-col bg-background text-text">
        <div className="flex items-center justify-between gap-2 border-b border-border bg-surface px-3 py-2">
          <span className="text-sm font-bold">🎯 NZT48</span>
          <button type="button" onClick={refreshLobby} className="rounded-lg border border-border px-2.5 py-1 text-xs font-bold text-text-muted hover:bg-surface-hover">🔄</button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="mx-auto max-w-2xl space-y-4">
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
                        <p className="text-[11px] text-text-muted">{inv.category}</p>
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
                    const oppName = myId === m.player1_id ? m.player2_name : m.player1_name
                    return (
                      <button key={m.id} type="button" onClick={() => handleOpenMatch(m.id)}
                        className="flex w-full items-center justify-between gap-2 rounded-xl bg-surface-hover p-2.5 text-left hover:bg-primary/10">
                        <span className="text-sm font-bold text-text">vs {oppName} · {m.category}</span>
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
                      <span className="text-sm text-text">{inv.to_name} · {inv.category}</span>
                      <button type="button" onClick={() => cancelInvite(inv.id)} className="text-xs text-danger hover:underline">Cancelar</button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="rounded-2xl border border-border bg-surface p-3">
              <p className="mb-2 text-xs font-bold uppercase text-text-muted">Invitar a alguien</p>

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

              <select value={inviteCategory} onChange={(e) => setInviteCategory(e.target.value)}
                className="mt-2 w-full rounded-lg border border-border bg-background px-2 py-1.5 text-xs text-text outline-none focus:border-primary">
                {TRIVIA_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>

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
    return (
      <div className="flex h-full items-center justify-center text-sm text-text-muted">Cargando partida…</div>
    )
  }

  const isOver = activeMatch.status === 'finalizada'
  const myIsPlayer1 = myId === activeMatch.player1_id
  const myName2 = myIsPlayer1 ? activeMatch.player1_name : activeMatch.player2_name
  const oppName = myIsPlayer1 ? activeMatch.player2_name : activeMatch.player1_name
  const myScore = myIsPlayer1 ? activeMatch.player1_score : activeMatch.player2_score
  const oppScore = myIsPlayer1 ? activeMatch.player2_score : activeMatch.player1_score
  const myTurn = activeMatch.current_turn === myId

  const q = !isOver ? activeMatch.questions[activeMatch.current_index] : null

  let resultText = null
  if (isOver) {
    resultText = activeMatch.result === 'empate'
      ? '🤝 Empate'
      : (activeMatch.result === 'player1') === myIsPlayer1
        ? '🏆 ¡Ganaste!'
        : '💔 Perdiste'
  }

  return (
    <div className="flex h-full flex-col bg-background text-text">
      <div className="flex items-center justify-between gap-2 border-b border-border bg-surface px-3 py-2">
        <span className="text-sm font-bold">🎯 {activeMatch.category}</span>
        <button type="button" onClick={exitMatch} className="rounded-lg border border-border px-2.5 py-1 text-xs font-bold text-text-muted hover:bg-surface-hover hover:text-text">← Lobby</button>
      </div>

      <div className="flex flex-1 flex-col items-center overflow-y-auto p-4">
        <div className="w-full max-w-xl">
          <div className="mb-4 flex items-center justify-between rounded-xl border border-border bg-surface px-4 py-2 text-sm font-mono font-bold">
            <span className={myTurn && !isOver ? 'text-primary' : 'text-text-muted'}>{myName2 || 'Tú'} — {myScore}</span>
            <span className="text-text-muted/50">vs</span>
            <span className={!myTurn && !isOver ? 'text-primary' : 'text-text-muted'}>{oppName} — {oppScore}</span>
          </div>

          {isOver ? (
            <div className="rounded-2xl border border-border bg-surface p-8 text-center">
              <p className="mb-2 text-3xl font-black">{resultText}</p>
              <p className="text-sm text-text-muted">{myScore} — {oppScore}</p>
            </div>
          ) : (
            <div className="rounded-2xl border border-border bg-surface p-5">
              <p className="mb-1 text-[11px] font-bold uppercase tracking-widest text-text-muted/60">
                Pregunta {activeMatch.current_index + 1} de {activeMatch.questions.length}
              </p>
              {!myTurn && (
                <p className="mb-3 text-xs font-semibold text-amber-400">⏳ Esperando a {oppName}…</p>
              )}
              {q.image && <img src={q.image} alt="" className="mb-3 max-h-48 w-full rounded-lg object-contain" />}
              <p className="mb-4 text-lg font-bold text-text">{q.question}</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {q.options.map((opt, i) => {
                  const picked = lastPick === i
                  const revealed = lastPick !== null
                  const isCorrect = i === q.correct
                  const style = !revealed
                    ? 'border-border hover:border-primary hover:bg-primary/5'
                    : isCorrect ? 'border-emerald-500 bg-emerald-500/15 text-emerald-400'
                    : picked ? 'border-danger bg-danger/15 text-danger'
                    : 'border-border opacity-50'
                  return (
                    <button key={i} type="button" disabled={!myTurn || revealed}
                      onClick={() => handleAnswer(i)}
                      className={`rounded-xl border px-4 py-3 text-left text-sm font-semibold transition-colors disabled:cursor-not-allowed ${style}`}>
                      {opt}
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
