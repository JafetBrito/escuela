import { useState, useCallback, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAuthStore } from '../../../stores/useAuthStore'
import { useFriendsStore } from '../../../stores/useFriendsStore'
import { useTriviaStore } from '../../../stores/useTriviaStore'
import { TRIVIA_CATEGORIES } from '../../../data/triviaCategories'
import { supabase } from '../../../services/supabase/client'

// Trivia con dos modos:
//  - Online 1v1: invita por username (calca ChessGame.jsx/useChessStore.js),
//    elige categoría, y juega por turnos un banco de preguntas sorteado de
//    trivia_questions vía Realtime.
//  - Solo/offline: sin rival ni invitación. Descarga el banco de la
//    categoría UNA vez (fetchQuestionBank, ya usado por AdminTriviaPage) y
//    lo cachea en localStorage — las partidas siguientes de esa categoría
//    corren 100% en el cliente, sin ningún round-trip a Supabase, así que
//    funcionan sin conexión mientras el caché siga ahí.
const SOLO_CACHE_KEY = (category) => `oliver_trivia_offline_${category}`
const SOLO_QUESTIONS_PER_ROUND = 10

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
  const fetchQuestionBank = useTriviaStore((s) => s.fetchQuestionBank)

  // mode: 'lobby' | 'match' | 'solo'
  const [mode, setMode] = useState('lobby')
  const [searchQuery, setSearchQuery] = useState('')
  const [inviteCategory, setInviteCategory] = useState(TRIVIA_CATEGORIES[0])
  const [soloCategory, setSoloCategory] = useState(TRIVIA_CATEGORIES[0])
  const [answerError, setAnswerError] = useState(null)
  const [lastPick, setLastPick] = useState(null)

  // ── Solo/offline ──
  const [soloLoading, setSoloLoading] = useState(false)
  const [soloError, setSoloError] = useState(null)
  const [soloPool, setSoloPool] = useState(null) // banco completo cacheado de la categoría activa
  const [soloQuestions, setSoloQuestions] = useState([])
  const [soloIndex, setSoloIndex] = useState(0)
  const [soloScore, setSoloScore] = useState(0)
  const [soloPick, setSoloPick] = useState(null)

  const startSoloRound = useCallback((pool) => {
    const shuffled = [...pool]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    setSoloQuestions(shuffled.slice(0, Math.min(SOLO_QUESTIONS_PER_ROUND, shuffled.length)))
    setSoloIndex(0)
    setSoloScore(0)
    setSoloPick(null)
  }, [])

  const handleStartSolo = async (category) => {
    setSoloLoading(true)
    setSoloError(null)
    let pool = null
    try {
      const bank = await fetchQuestionBank(category)
      pool = bank?.questions ?? null
      if (pool?.length) localStorage.setItem(SOLO_CACHE_KEY(category), JSON.stringify(pool))
    } catch {
      // sin conexión — se resuelve abajo con lo que haya en caché
    }
    if (!pool?.length) {
      try { pool = JSON.parse(localStorage.getItem(SOLO_CACHE_KEY(category)) || 'null') } catch { pool = null }
    }
    setSoloLoading(false)
    if (!pool?.length) {
      setSoloError('Sin conexión y sin preguntas guardadas para esta categoría todavía. Conéctate una vez para descargarla y podrás jugarla offline después.')
      return
    }
    setSoloPool(pool)
    startSoloRound(pool)
    setMode('solo')
  }

  const handleSoloAnswer = (choiceIndex) => {
    if (soloPick !== null) return
    setSoloPick(choiceIndex)
    const correct = choiceIndex === soloQuestions[soloIndex].correct
    if (correct) setSoloScore((s) => s + 1)
    setTimeout(() => {
      setSoloIndex((i) => i + 1)
      setSoloPick(null)
    }, 900)
  }

  const exitSolo = () => setMode('lobby')

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

            <div className="rounded-2xl border border-primary/30 bg-primary/5 p-3">
              <p className="mb-1 text-xs font-bold uppercase text-text-muted">🧩 Practicar solo</p>
              <p className="mb-2 text-[11px] text-text-muted">Sin rival, a tu ritmo — la primera vez necesita conexión; después puedes repetir esa categoría sin internet.</p>
              {soloError && (
                <div className="mb-2 rounded-lg border border-danger/40 bg-danger/10 p-2 text-xs text-danger">{soloError}</div>
              )}
              <div className="flex gap-2">
                <select value={soloCategory} onChange={(e) => setSoloCategory(e.target.value)}
                  className="flex-1 rounded-lg border border-border bg-background px-2 py-1.5 text-xs text-text outline-none focus:border-primary">
                  {TRIVIA_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                <button type="button" onClick={() => handleStartSolo(soloCategory)} disabled={soloLoading}
                  className="shrink-0 rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-background disabled:opacity-50">
                  {soloLoading ? 'Cargando…' : 'Jugar solo'}
                </button>
              </div>
            </div>

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

  // ── Solo/offline ──
  if (mode === 'solo') {
    const soloOver = soloIndex >= soloQuestions.length
    const sq = !soloOver ? soloQuestions[soloIndex] : null
    return (
      <div className="flex h-full flex-col bg-background text-text">
        <div className="flex items-center justify-between gap-2 border-b border-border bg-surface px-3 py-2">
          <span className="text-sm font-bold">🧩 {soloCategory} · solo</span>
          <button type="button" onClick={exitSolo} className="rounded-lg border border-border px-2.5 py-1 text-xs font-bold text-text-muted hover:bg-surface-hover hover:text-text">← Lobby</button>
        </div>
        <div className="flex flex-1 flex-col items-center overflow-y-auto p-4">
          <div className="w-full max-w-xl">
            {soloOver ? (
              <div className="rounded-2xl border border-border bg-surface p-8 text-center">
                <p className="mb-2 text-3xl font-black">🏁 {soloScore} / {soloQuestions.length}</p>
                <p className="mb-4 text-sm text-text-muted">
                  {soloScore === soloQuestions.length ? '¡Perfecto!' : soloScore >= soloQuestions.length * 0.6 ? '¡Buen trabajo!' : 'Sigue practicando.'}
                </p>
                <div className="flex justify-center gap-2">
                  <button type="button" onClick={() => startSoloRound(soloPool)} className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-background">Jugar de nuevo</button>
                  <button type="button" onClick={exitSolo} className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-text-muted hover:text-text">Volver al lobby</button>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-border bg-surface p-5">
                <p className="mb-1 text-[11px] font-bold uppercase tracking-widest text-text-muted/60">
                  Pregunta {soloIndex + 1} de {soloQuestions.length} · {soloScore} correctas
                </p>
                {sq.image && <img src={sq.image} alt="" className="mb-3 max-h-48 w-full rounded-lg object-contain" />}
                <p className="mb-4 text-lg font-bold text-text">{sq.question}</p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {sq.options.map((opt, i) => {
                    const picked = soloPick === i
                    const revealed = soloPick !== null
                    const isCorrect = i === sq.correct
                    const style = !revealed
                      ? 'border-border hover:border-primary hover:bg-primary/5'
                      : isCorrect ? 'border-emerald-500 bg-emerald-500/15 text-emerald-400'
                      : picked ? 'border-danger bg-danger/15 text-danger'
                      : 'border-border opacity-50'
                    return (
                      <button key={i} type="button" disabled={revealed}
                        onClick={() => handleSoloAnswer(i)}
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
