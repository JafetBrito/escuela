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
const SOLO_START_LIVES = 3
const TIME_PER_QUESTION = 60

const CATEGORY_ICON = {
  'Ciencia': '🔬',
  'Historia': '🏛️',
  'Geografía': '🌍',
  'Cultura General': '🎭',
  'Tecnología y Programación': '💻',
  'Arte y Música': '🎨',
  'Deportes': '⚽',
  'Matemáticas': '➗',
}

// Estilo "Kahoot/Preguntados": cada posición de respuesta tiene su propio
// color+forma FIJOS (no dependen de si es correcta) — ayuda a ubicar las
// opciones de un vistazo antes de leer, que es justo la sensación de
// "juego" que un formulario plano de pregunta/respuesta no da.
const ANSWER_STYLES = [
  { ring: 'border-rose-500', bg: 'bg-rose-500/10 hover:bg-rose-500/20', badge: 'bg-rose-500', shape: '▲' },
  { ring: 'border-sky-500', bg: 'bg-sky-500/10 hover:bg-sky-500/20', badge: 'bg-sky-500', shape: '◆' },
  { ring: 'border-amber-500', bg: 'bg-amber-500/10 hover:bg-amber-500/20', badge: 'bg-amber-500', shape: '●' },
  { ring: 'border-emerald-500', bg: 'bg-emerald-500/10 hover:bg-emerald-500/20', badge: 'bg-emerald-500', shape: '■' },
]

function ProgressDots({ total, current }) {
  return (
    <div className="flex gap-1 px-5 pt-2">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${i < current ? 'bg-primary' : i === current ? 'bg-primary/50' : 'bg-border'}`} />
      ))}
    </div>
  )
}

// Tarjeta de pregunta compartida entre el modo solo y el 1v1 online — misma
// pinta de juego (icono de categoría, cronómetro, opciones con color+forma
// fija) en los dos, en vez de reinventar el layout dos veces.
function TriviaQuestionCard({ category, questionNumber, totalQuestions, timeLeft, question, image, options, pick, correctIndex, onAnswer, disabled, waitingLabel }) {
  const revealed = pick !== null
  return (
    <div className="overflow-hidden rounded-3xl border-2 border-border bg-surface shadow-lg">
      <div className="flex items-center justify-between gap-3 bg-gradient-to-r from-primary/15 to-transparent px-5 py-3">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl">{CATEGORY_ICON[category] ?? '🎯'}</span>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">{category}</p>
            <p className="text-xs font-bold text-text">Pregunta {questionNumber} de {totalQuestions}</p>
          </div>
        </div>
        {timeLeft != null && (
          <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-4 text-sm font-black transition-colors ${timeLeft <= 10 ? 'animate-pulse border-danger text-danger' : 'border-primary text-primary'}`}>
            {timeLeft}
          </div>
        )}
      </div>
      <ProgressDots total={totalQuestions} current={questionNumber - 1} />
      <div className="px-5 pb-5 pt-3">
        {waitingLabel && <p className="mb-2 text-xs font-semibold text-amber-400">⏳ {waitingLabel}</p>}
        {image && <img src={image} alt="" className="mb-3 max-h-48 w-full rounded-xl object-contain" />}
        <p className="mb-4 text-xl font-black leading-snug text-text">{question}</p>
        <div className="grid gap-2.5 sm:grid-cols-2">
          {options.map((opt, i) => {
            const s = ANSWER_STYLES[i % ANSWER_STYLES.length]
            const isPicked = pick === i
            const isCorrect = i === correctIndex
            const cls = !revealed
              ? `${s.ring} ${s.bg}`
              : isCorrect ? 'scale-[1.02] border-emerald-500 bg-emerald-500/20 text-emerald-300'
              : isPicked ? 'border-danger bg-danger/20 text-danger'
              : 'border-border/60 opacity-40'
            const badgeCls = !revealed ? s.badge : isCorrect ? 'bg-emerald-500' : isPicked ? 'bg-danger' : 'bg-border'
            return (
              <button key={i} type="button" disabled={disabled || revealed} onClick={() => onAnswer(i)}
                className={`flex items-center gap-2.5 rounded-2xl border-2 px-4 py-3.5 text-left text-sm font-bold transition-all disabled:cursor-not-allowed ${cls}`}>
                <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs text-white ${badgeCls}`}>{s.shape}</span>
                {opt}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

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
  const [soloLives, setSoloLives] = useState(SOLO_START_LIVES)
  const [soloTimeLeft, setSoloTimeLeft] = useState(TIME_PER_QUESTION)

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
    setSoloLives(SOLO_START_LIVES)
    setSoloTimeLeft(TIME_PER_QUESTION)
  }, [])

  const handleStartSolo = async (category) => {
    setSoloLoading(true)
    setSoloError(null)
    let pool = null
    let fetchFailed = false
    try {
      const bank = await fetchQuestionBank(category)
      pool = bank?.questions?.length ? bank.questions : null
      if (pool) localStorage.setItem(SOLO_CACHE_KEY(category), JSON.stringify(pool))
    } catch {
      fetchFailed = true // de verdad no hubo respuesta del servidor (sin internet, timeout, etc.)
    }
    if (!pool) {
      try { pool = JSON.parse(localStorage.getItem(SOLO_CACHE_KEY(category)) || 'null') } catch { pool = null }
    }
    setSoloLoading(false)
    if (!pool?.length) {
      // Dos causas muy distintas — antes se mostraba el mismo mensaje para
      // ambas y confundía: "sin conexión" cuando en realidad SÍ había
      // internet, solo que el servidor no tenía preguntas para esa
      // categoría todavía (nadie corrió la migración/el admin no las cargó).
      setSoloError(
        fetchFailed
          ? 'Sin conexión y sin preguntas guardadas para esta categoría todavía. Conéctate una vez para descargarla y podrás jugarla offline después.'
          : 'Esta categoría todavía no tiene preguntas cargadas en el servidor — pídele a un admin que las agregue desde /admin/trivia.'
      )
      return
    }
    setSoloPool(pool)
    startSoloRound(pool)
    setMode('solo')
  }

  // choiceIndex -1 = se acabó el tiempo sin responder — cuenta como fallo,
  // igual que en un juego de verdad, en vez de pausar esperando por siempre.
  const handleSoloAnswer = (choiceIndex) => {
    if (soloPick !== null) return
    setSoloPick(choiceIndex)
    const correct = choiceIndex === soloQuestions[soloIndex].correct
    if (correct) setSoloScore((s) => s + 1)
    else setSoloLives((l) => Math.max(0, l - 1))
    setTimeout(() => {
      setSoloIndex((i) => i + 1)
      setSoloPick(null)
    }, 900)
  }

  const exitSolo = () => setMode('lobby')

  // Cronómetro del modo solo: se reinicia en cada pregunta nueva, y si
  // llega a 0 sin que el jugador haya elegido, se autoenvía como fallo.
  useEffect(() => { setSoloTimeLeft(TIME_PER_QUESTION) }, [soloIndex])
  useEffect(() => {
    if (mode !== 'solo' || soloPick !== null) return
    if (soloIndex >= soloQuestions.length || soloLives <= 0) return
    if (soloTimeLeft <= 0) { handleSoloAnswer(-1); return }
    const t = setTimeout(() => setSoloTimeLeft((s) => s - 1), 1000)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, soloTimeLeft, soloPick, soloIndex, soloLives])

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

  // Cronómetro del 1v1: cada jugador solo corre SU PROPIO reloj en su
  // propio turno (nada que sincronizar por Realtime) — si se acaba el
  // tiempo sin responder, se autoenvía -1 (siempre cuenta como fallo) por
  // el mismo camino que una respuesta normal.
  const [matchTimeLeft, setMatchTimeLeft] = useState(TIME_PER_QUESTION)
  useEffect(() => { setMatchTimeLeft(TIME_PER_QUESTION) }, [activeMatch?.current_index])
  useEffect(() => {
    if (!activeMatch || activeMatch.status === 'finalizada') return
    if (activeMatch.current_turn !== myId || lastPick !== null) return
    if (matchTimeLeft <= 0) { handleAnswer(-1); return }
    const t = setTimeout(() => setMatchTimeLeft((s) => s - 1), 1000)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeMatch, myId, lastPick, matchTimeLeft])

  // ── Lobby ──
  if (mode === 'lobby') {
    return (
      <div className="flex h-full flex-col bg-background text-text">
        <div className="flex items-center justify-between gap-2 border-b border-border bg-surface px-3 py-2">
          <span className="text-sm font-bold">🎯 NZT48</span>
          <button type="button" onClick={refreshLobby} className="rounded-lg border border-border px-2.5 py-1 text-xs font-bold text-text-muted hover:bg-surface-hover">🔄</button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="mx-auto max-w-3xl space-y-4">
            {answerError && (
              <div className="rounded-xl border border-danger/40 bg-danger/10 p-3 text-sm text-danger">{answerError}</div>
            )}

            {/* Los dos modos, uno junto al otro — elige cómo quieres jugar */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col rounded-2xl border-2 border-primary/30 bg-primary/5 p-4">
                <p className="text-lg font-black text-text">🧩 Un jugador</p>
                <p className="mb-3 flex-1 text-xs text-text-muted">Sin rival, a tu ritmo. La primera vez necesita conexión; después puedes repetir esa categoría sin internet.</p>
                {soloError && (
                  <div className="mb-2 rounded-lg border border-danger/40 bg-danger/10 p-2 text-xs text-danger">{soloError}</div>
                )}
                <select value={soloCategory} onChange={(e) => setSoloCategory(e.target.value)}
                  className="mb-2 w-full rounded-lg border border-border bg-background px-2 py-1.5 text-xs text-text outline-none focus:border-primary">
                  {TRIVIA_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                <button type="button" onClick={() => handleStartSolo(soloCategory)} disabled={soloLoading}
                  className="w-full rounded-lg bg-primary px-3 py-2 text-sm font-bold text-background disabled:opacity-50">
                  {soloLoading ? 'Cargando…' : 'Jugar solo →'}
                </button>
              </div>

              <div className="flex flex-col rounded-2xl border-2 border-border bg-surface p-4">
                <p className="text-lg font-black text-text">🎮 Multijugador</p>
                <p className="mb-3 text-xs text-text-muted">Invita a alguien por username — la partida empieza en cuanto acepte.</p>

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

            {/* Estado de tus partidas/invitaciones — visible debajo de los dos modos */}
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
          </div>
        </div>
      </div>
    )
  }

  // ── Solo/offline ──
  if (mode === 'solo') {
    const soloDead = soloLives <= 0
    const soloOver = soloDead || soloIndex >= soloQuestions.length
    const sq = !soloOver ? soloQuestions[soloIndex] : null
    return (
      <div className="flex h-full flex-col bg-background text-text">
        <div className="flex items-center justify-between gap-2 border-b border-border bg-surface px-3 py-2">
          <span className="text-sm font-bold">{CATEGORY_ICON[soloCategory] ?? '🧩'} {soloCategory} · solo</span>
          <button type="button" onClick={exitSolo} className="rounded-lg border border-border px-2.5 py-1 text-xs font-bold text-text-muted hover:bg-surface-hover hover:text-text">← Lobby</button>
        </div>
        <div className="flex flex-1 flex-col items-center overflow-y-auto p-4">
          <div className="w-full max-w-xl">
            {!soloOver && (
              <div className="mb-3 flex items-center justify-between rounded-xl border border-border bg-surface px-4 py-2">
                <div className="flex gap-1 text-lg" title={`${soloLives} vidas`}>
                  {Array.from({ length: SOLO_START_LIVES }).map((_, i) => (
                    <span key={i}>{i < soloLives ? '❤️' : '🖤'}</span>
                  ))}
                </div>
                <p className="text-sm font-black text-primary">⭐ {soloScore}</p>
              </div>
            )}

            {soloOver ? (
              <div className="rounded-3xl border-2 border-border bg-surface p-8 text-center">
                <p className="mb-2 text-5xl">{soloDead ? '💀' : soloScore === soloQuestions.length ? '🏆' : '🏁'}</p>
                <p className="mb-1 text-3xl font-black">{soloScore} / {soloQuestions.length}</p>
                <p className="mb-5 text-sm font-semibold text-text-muted">
                  {soloDead ? '¡Se acabaron tus vidas!' : soloScore === soloQuestions.length ? '¡Perfecto!' : soloScore >= soloQuestions.length * 0.6 ? '¡Buen trabajo!' : 'Sigue practicando.'}
                </p>
                <div className="flex justify-center gap-2">
                  <button type="button" onClick={() => startSoloRound(soloPool)} className="rounded-xl bg-primary px-5 py-2.5 text-sm font-black text-background">🔁 Jugar de nuevo</button>
                  <button type="button" onClick={exitSolo} className="rounded-xl border border-border px-5 py-2.5 text-sm font-bold text-text-muted hover:text-text">Volver al lobby</button>
                </div>
              </div>
            ) : (
              <TriviaQuestionCard
                category={soloCategory}
                questionNumber={soloIndex + 1}
                totalQuestions={soloQuestions.length}
                timeLeft={soloTimeLeft}
                question={sq.question}
                image={sq.image}
                options={sq.options}
                pick={soloPick}
                correctIndex={sq.correct}
                onAnswer={handleSoloAnswer}
                disabled={false}
              />
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
        <span className="text-sm font-bold">{CATEGORY_ICON[activeMatch.category] ?? '🎯'} {activeMatch.category}</span>
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
            <div className="rounded-3xl border-2 border-border bg-surface p-8 text-center">
              <p className="mb-2 text-5xl">{activeMatch.result === 'empate' ? '🤝' : (activeMatch.result === 'player1') === myIsPlayer1 ? '🏆' : '💔'}</p>
              <p className="mb-1 text-3xl font-black">{resultText}</p>
              <p className="text-sm font-semibold text-text-muted">{myScore} — {oppScore}</p>
              <button type="button" onClick={exitMatch} className="mt-5 rounded-xl bg-primary px-5 py-2.5 text-sm font-black text-background">Volver al lobby</button>
            </div>
          ) : (
            <TriviaQuestionCard
              category={activeMatch.category}
              questionNumber={activeMatch.current_index + 1}
              totalQuestions={activeMatch.questions.length}
              timeLeft={myTurn ? matchTimeLeft : null}
              question={q.question}
              image={q.image}
              options={q.options}
              pick={lastPick}
              correctIndex={q.correct}
              onAnswer={handleAnswer}
              disabled={!myTurn}
              waitingLabel={!myTurn ? `Esperando a ${oppName}…` : null}
            />
          )}
        </div>
      </div>
    </div>
  )
}
