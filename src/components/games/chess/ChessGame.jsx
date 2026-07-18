import { useState, useCallback, useRef, useEffect } from 'react'
import { Chessboard } from 'react-chessboard'
import { Chess } from 'chess.js'
import { useAuthStore } from '../../../stores/useAuthStore'
import { useFriendsStore } from '../../../stores/useFriendsStore'
import { useChessStore } from '../../../stores/useChessStore'
import { playChessMoveSound, playChessCaptureSound, playChessCheckSound, playChessCheckmateSound } from '../../../utils/sound'
import { randomStartFen } from '../../../utils/chess960'

// ── AI ────────────────────────────────────────────────────────────────────────
const PIECE_VALUE = { p: 10, n: 30, b: 30, r: 50, q: 90, k: 0 }

function evalBoard(game) {
  let s = 0
  for (const row of game.board())
    for (const pc of row)
      if (pc) s += pc.color === 'b' ? PIECE_VALUE[pc.type] : -PIECE_VALUE[pc.type]
  return s
}

function minimax(game, depth, alpha, beta, isMax) {
  if (depth === 0 || game.isGameOver()) return evalBoard(game)
  const moves = game.moves()
  if (isMax) {
    let best = -Infinity
    for (const m of moves) {
      game.move(m); best = Math.max(best, minimax(game, depth-1, alpha, beta, false)); game.undo()
      alpha = Math.max(alpha, best); if (beta <= alpha) break
    }
    return best
  } else {
    let best = Infinity
    for (const m of moves) {
      game.move(m); best = Math.min(best, minimax(game, depth-1, alpha, beta, true)); game.undo()
      beta = Math.min(beta, best); if (beta <= alpha) break
    }
    return best
  }
}

function getAiMove(game, depth) {
  const moves = game.moves({ verbose: true })
  if (!moves.length) return null
  if (depth === 0) return moves[Math.floor(Math.random() * moves.length)]
  moves.sort(() => Math.random() - 0.5)
  let best = moves[0], bestScore = -Infinity
  for (const m of moves) {
    game.move(m)
    const s = minimax(game, depth - 1, -Infinity, Infinity, false)
    game.undo()
    if (s > bestScore) { bestScore = s; best = m }
  }
  return best
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const DIFFICULTIES = [
  { id: 'easy',   label: 'Fácil',    icon: '😊', sub: 'Mueve al azar',         depth: 0, color: 'border-green-500/50  bg-green-500/10  text-green-400' },
  { id: 'medium', label: 'Medio',    icon: '🤔', sub: 'Anticipa 1 jugada',      depth: 1, color: 'border-yellow-500/50 bg-yellow-500/10 text-yellow-400' },
  { id: 'hard',   label: 'Difícil',  icon: '💀', sub: 'Anticipa 2 jugadas',     depth: 2, color: 'border-red-500/50    bg-red-500/10    text-red-400' },
]

const VARIANTS = [
  { id: 'standard', label: 'Estándar' },
  { id: 'random',   label: 'Posición aleatoria (sin enroque)' },
]

const CLOCK_PRESETS = [0, 3, 5, 10, 15]

const THEMES = [
  { id: 'clasico', label: 'Clásico', light: '#e8f0d8', dark: '#5a7a4a' },
  { id: 'madera',  label: 'Madera',  light: '#f0d9b5', dark: '#b58863' },
  { id: 'azul',    label: 'Azul',    light: '#e8edf9', dark: '#5b7fb5' },
  { id: 'morado',  label: 'Morado',  light: '#ede4f5', dark: '#8b5fbf' },
  { id: 'naranja', label: 'Naranja', light: '#fdf1e2', dark: '#d97e3d' },
  { id: 'oscuro',  label: 'Oscuro',  light: '#4a4a52', dark: '#26262c' },
]
const THEME_KEY = 'chess-theme'
function loadTheme() {
  try { return THEMES.find((t) => t.id === localStorage.getItem(THEME_KEY)) ?? THEMES[0] } catch { return THEMES[0] }
}
function saveTheme(id) {
  try { localStorage.setItem(THEME_KEY, id) } catch { /* best-effort */ }
}

function soundForSan(san) {
  if (!san) return
  if (san.endsWith('#')) playChessCheckmateSound()
  else if (san.includes('+')) playChessCheckSound()
  else if (san.includes('x')) playChessCaptureSound()
  else playChessMoveSound()
}

function fmtClock(ms) {
  const total = Math.max(0, Math.ceil(ms / 1000))
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

function statusText(game, { thinking, timeoutLoser, remoteResult } = {}) {
  if (remoteResult) return remoteResult
  if (timeoutLoser) return `⏱️ Se acabó el tiempo — ${timeoutLoser === 'w' ? 'Negras' : 'Blancas'} ganan`
  if (game.isCheckmate()) return game.turn() === 'w' ? '🏆 Jaque mate — Negras ganan' : '🏆 Jaque mate — Blancas ganan'
  if (game.isStalemate()) return '🤝 Tablas — Ahogado'
  if (game.isDraw())      return '🤝 Tablas'
  if (thinking)           return '🤖 IA pensando…'
  if (game.isCheck())     return (game.turn() === 'w' ? '⚠️ Jaque — Blancas' : '⚠️ Jaque — Negras')
  return game.turn() === 'w' ? '♙ Turno de Blancas' : '♟️ Turno de Negras'
}

// ── Theme picker (compartido entre selección y partida) ──────────────────────
function ThemePicker({ theme, onPick }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="relative">
      <button type="button" onClick={() => setOpen((v) => !v)}
        className="rounded-lg border border-border px-2.5 py-1 text-xs font-bold text-text-muted hover:bg-surface-hover hover:text-text">
        🎨 Tema
      </button>
      {open && (
        <div className="absolute right-0 top-full z-20 mt-1.5 flex gap-1.5 rounded-xl border border-border bg-surface p-2 shadow-xl">
          {THEMES.map((t) => (
            <button key={t.id} type="button" title={t.label}
              onClick={() => { onPick(t.id); setOpen(false) }}
              className={`h-8 w-8 overflow-hidden rounded-md border-2 ${theme.id === t.id ? 'border-primary' : 'border-transparent'}`}
              style={{ background: `linear-gradient(135deg, ${t.light} 50%, ${t.dark} 50%)` }}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ── Tablero (compartido por los 3 modos de juego) ─────────────────────────────
function BoardView({ fen, onPieceDrop, onSquareClick, canDragPiece, squareStyles, orientation, theme }) {
  return (
    <Chessboard
      options={{
        position: fen,
        onPieceDrop,
        onSquareClick,
        canDragPiece,
        squareStyles,
        boardOrientation: orientation,
        boardStyle: { borderRadius: '8px', boxShadow: '0 4px 28px rgba(0,0,0,0.5)' },
        darkSquareStyle:  { backgroundColor: theme.dark },
        lightSquareStyle: { backgroundColor: theme.light },
      }}
    />
  )
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function ChessGame() {
  const session = useAuthStore((s) => s.session)
  const profile = useAuthStore((s) => s.profile)
  const friends = useFriendsStore((s) => s.friends)

  const searchResults  = useChessStore((s) => s.searchResults)
  const searching      = useChessStore((s) => s.searching)
  const invitesIn      = useChessStore((s) => s.invitesIn)
  const invitesOut     = useChessStore((s) => s.invitesOut)
  const myGames        = useChessStore((s) => s.myGames)
  const activeGame     = useChessStore((s) => s.activeGame)
  const searchProfiles = useChessStore((s) => s.searchProfiles)
  const fetchInvites   = useChessStore((s) => s.fetchInvites)
  const fetchMyGames   = useChessStore((s) => s.fetchMyGames)
  const sendInvite     = useChessStore((s) => s.sendInvite)
  const cancelInvite   = useChessStore((s) => s.cancelInvite)
  const respondInvite  = useChessStore((s) => s.respondInvite)
  const openGame       = useChessStore((s) => s.openGame)
  const closeGame      = useChessStore((s) => s.closeGame)
  const makeMove       = useChessStore((s) => s.makeMove)
  const resign         = useChessStore((s) => s.resign)
  const claimTimeout   = useChessStore((s) => s.claimTimeout)

  const gameRef   = useRef(new Chess())
  const [fen,       setFen]       = useState(() => gameRef.current.fen())
  const [thinking,  setThinking]  = useState(false)
  const [history,   setHistory]   = useState([])
  const [lastMove,  setLastMove]  = useState(null)
  const [selectedSquare, setSelectedSquare] = useState(null)
  const [boardFlipped, setBoardFlipped] = useState(false)
  const [theme, setTheme] = useState(loadTheme)

  // mode: null (selección) | 'vs-ai' | '2p' | 'online-lobby' | 'online-game'
  const [mode, setMode] = useState(null)
  const [diff, setDiff] = useState('easy')
  const [draftVariant, setDraftVariant] = useState('standard')
  const [draftClock, setDraftClock] = useState(0)

  // Reloj local (vs-ai / 2p — sin servidor, cada segundo se le resta al que
  // tiene el turno; si llega a 0 pierde por tiempo).
  const [clockMs, setClockMs] = useState({ w: 0, b: 0 })
  const [timeoutLoser, setTimeoutLoser] = useState(null)

  // Ajedrez en línea
  const [onlineGameId, setOnlineGameId] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [inviteVariant, setInviteVariant] = useState('standard')
  const [inviteClock, setInviteClock] = useState(10)
  const [now, setNow] = useState(Date.now())

  const selectedDiff = DIFFICULTIES.find((d) => d.id === diff) ?? DIFFICULTIES[0]

  const handleTheme = (id) => { const t = THEMES.find((x) => x.id === id) ?? THEMES[0]; setTheme(t); saveTheme(t.id) }

  // Refresca invitaciones/partidas al entrar al lobby (sin canal realtime
  // propio para la lista — el detalle de una partida sí es en vivo).
  const refreshLobby = useCallback(() => {
    if (!session?.user?.id) return
    fetchInvites(session.user.id)
    fetchMyGames(session.user.id)
  }, [session?.user?.id, fetchInvites, fetchMyGames])

  useEffect(() => { refreshLobby() }, [refreshLobby])
  useEffect(() => { if (mode === 'online-lobby') refreshLobby() }, [mode, refreshLobby])

  useEffect(() => {
    const id = setTimeout(() => searchProfiles(searchQuery), 300)
    return () => clearTimeout(id)
  }, [searchQuery, searchProfiles])

  const reset = useCallback((newMode, newDiff) => {
    gameRef.current = new Chess(draftVariant === 'random' ? randomStartFen() : undefined)
    setFen(gameRef.current.fen())
    setHistory([])
    setLastMove(null)
    setThinking(false)
    setSelectedSquare(null)
    setTimeoutLoser(null)
    const ms = draftClock > 0 ? draftClock * 60_000 : 0
    setClockMs({ w: ms, b: ms })
    if (newMode !== undefined) setMode(newMode)
    if (newDiff !== undefined) setDiff(newDiff)
  }, [draftVariant, draftClock])

  // El reloj local solo corre para vs-ai/2p — el de una partida en línea se
  // calcula a partir de la fila del servidor (ver bloque online más abajo).
  useEffect(() => {
    if (mode !== 'vs-ai' && mode !== '2p') return
    if (draftClock <= 0 || timeoutLoser || gameRef.current.isGameOver()) return
    const id = setInterval(() => {
      setClockMs((c) => {
        const turn = gameRef.current.turn()
        const nextVal = Math.max(0, c[turn] - 1000)
        if (nextVal <= 0) setTimeoutLoser(turn)
        return { ...c, [turn]: nextVal }
      })
    }, 1000)
    return () => clearInterval(id)
  }, [mode, draftClock, timeoutLoser, fen])

  // ── Movimiento local (vs-ai / 2p) ──
  const applyLocalMove = useCallback((from, to) => {
    const game = gameRef.current
    if (game.isGameOver() || thinking || timeoutLoser) return false
    if (mode === 'vs-ai' && game.turn() !== 'w') return false

    let move
    try { move = game.move({ from, to, promotion: 'q' }) } catch { return false }
    if (!move) return false

    soundForSan(move.san)
    setFen(game.fen())
    setLastMove({ from, to })
    setHistory((h) => [...h, move.san])
    setSelectedSquare(null)

    if (mode === 'vs-ai' && !game.isGameOver() && game.turn() === 'b') {
      setThinking(true)
      const captureDiff = selectedDiff.depth
      setTimeout(() => {
        const best = getAiMove(game, captureDiff)
        if (best) {
          try {
            const res = game.move(best)
            soundForSan(res.san)
            setFen(game.fen())
            setLastMove({ from: best.from, to: best.to })
            setHistory((h) => [...h, res.san])
          } catch { /* ai move invalid — no-op */ }
        }
        setThinking(false)
      }, 200)
    }
    return true
  }, [mode, thinking, timeoutLoser, selectedDiff])

  // ── Movimiento en línea (sincronizado vía Supabase Realtime) ──
  const myColor = activeGame && session?.user?.id === activeGame.white_id ? 'w'
    : activeGame && session?.user?.id === activeGame.black_id ? 'b' : null

  const applyOnlineMove = useCallback((from, to) => {
    if (!activeGame || activeGame.status !== 'en_curso') return false
    const game = gameRef.current
    if (game.turn() !== myColor) return false

    let move
    try { move = game.move({ from, to, promotion: 'q' }) } catch { return false }
    if (!move) return false

    soundForSan(move.san)
    setFen(game.fen())
    setLastMove({ from, to })
    setSelectedSquare(null)

    const elapsed = Date.now() - new Date(activeGame.turn_started_at).getTime()
    const remaining = activeGame.clock_minutes > 0
      ? Math.max(0, (myColor === 'w' ? activeGame.white_ms : activeGame.black_ms) - elapsed)
      : 0

    const patch = {
      fen: game.fen(),
      history: [...(activeGame.history ?? []), move.san],
      turn_started_at: new Date().toISOString(),
      [myColor === 'w' ? 'white_ms' : 'black_ms']: remaining,
    }
    if (game.isGameOver()) {
      patch.status = 'finalizada'
      patch.end_reason = game.isCheckmate() ? 'checkmate' : game.isStalemate() ? 'stalemate' : 'draw'
      patch.result = game.isCheckmate() ? (myColor === 'w' ? 'white' : 'black') : 'draw'
    }
    makeMove(activeGame.id, patch)
    return true
  }, [activeGame, myColor, makeMove])

  const attemptMove = useCallback((from, to) => {
    if (mode === 'online-game') return applyOnlineMove(from, to)
    return applyLocalMove(from, to)
  }, [mode, applyOnlineMove, applyLocalMove])

  // Mantiene el motor local en sincronía con la fila del servidor — cuando
  // llega una jugada propia o del rival vía Realtime, se recarga el FEN y se
  // reproduce el sonido correspondiente a la última jugada nueva.
  const appliedLenRef = useRef(0)
  useEffect(() => {
    if (mode !== 'online-game' || !activeGame) return
    gameRef.current.load(activeGame.fen)
    setFen(activeGame.fen)
    const hist = activeGame.history ?? []
    if (hist.length > appliedLenRef.current) soundForSan(hist[hist.length - 1])
    appliedLenRef.current = hist.length
  }, [mode, activeGame])

  // Tick de reloj (solo visual, se calcula desde la fila del servidor) +
  // detección de tiempo agotado.
  useEffect(() => {
    if (mode !== 'online-game' || !activeGame || activeGame.status !== 'en_curso' || activeGame.clock_minutes <= 0) return
    const id = setInterval(() => setNow(Date.now()), 250)
    return () => clearInterval(id)
  }, [mode, activeGame?.id, activeGame?.status, activeGame?.clock_minutes])

  useEffect(() => {
    if (mode !== 'online-game' || !activeGame || activeGame.status !== 'en_curso' || activeGame.clock_minutes <= 0) return
    const turn = gameRef.current.turn()
    const elapsed = now - new Date(activeGame.turn_started_at).getTime()
    const effective = (turn === 'w' ? activeGame.white_ms : activeGame.black_ms) - elapsed
    if (effective <= 0) claimTimeout(activeGame.id, turn)
  }, [now, mode, activeGame, claimTimeout])

  const canDragPiece = useCallback(({ piece }) => {
    if (mode === 'online-game') {
      if (!activeGame || activeGame.status !== 'en_curso') return false
      return piece?.pieceType?.startsWith?.(myColor) ?? false
    }
    if (gameRef.current.isGameOver() || thinking || timeoutLoser) return false
    if (mode === 'vs-ai') return piece?.pieceType?.startsWith?.('w') ?? true
    return true
  }, [mode, thinking, timeoutLoser, activeGame, myColor])

  // Click para mover: primer click selecciona (si es pieza propia con
  // jugadas legales), segundo click sobre una casilla destino legal ejecuta
  // la jugada — mismo camino que arrastrar, vía attemptMove.
  const legalTargets = selectedSquare
    ? gameRef.current.moves({ square: selectedSquare, verbose: true }).map((m) => m.to)
    : []

  const handleSquareClick = useCallback(({ square, piece }) => {
    if (selectedSquare && legalTargets.includes(square)) {
      attemptMove(selectedSquare, square)
      return
    }
    if (piece && canDragPiece({ piece })) {
      setSelectedSquare(square)
    } else {
      setSelectedSquare(null)
    }
  }, [selectedSquare, legalTargets, attemptMove, canDragPiece])

  const squareStyles = {
    ...(lastMove ? {
      [lastMove.from]: { backgroundColor: 'rgba(255,210,0,0.35)' },
      [lastMove.to]:   { backgroundColor: 'rgba(255,210,0,0.55)' },
    } : {}),
    ...(selectedSquare ? { [selectedSquare]: { backgroundColor: 'rgba(56,189,248,0.45)' } } : {}),
    ...Object.fromEntries(legalTargets.map((sq) => {
      const hasPiece = !!gameRef.current.get(sq)
      return [sq, hasPiece
        ? { boxShadow: 'inset 0 0 0 4px rgba(220,38,38,0.55)' }
        : { background: 'radial-gradient(circle, rgba(0,0,0,0.35) 19%, transparent 20%)' }]
    })),
  }

  // ── Online: acciones ──
  const myName = profile?.display_name || session?.user?.email || 'Jugador'

  const handleSendInvite = async (toId, toName) => {
    if (!session?.user?.id) return
    await sendInvite(session.user.id, myName, toId, toName, inviteVariant, inviteClock)
    setSearchQuery('')
  }

  const handleRespond = async (invite, accept) => {
    const { data } = await respondInvite(invite, accept)
    if (accept && data) {
      appliedLenRef.current = 0
      setOnlineGameId(data.id)
      openGame(data.id)
      setMode('online-game')
    }
  }

  const handleOpenGame = (gameId) => {
    appliedLenRef.current = 0
    setOnlineGameId(gameId)
    openGame(gameId)
    setMode('online-game')
  }

  const exitOnlineGame = () => {
    closeGame()
    setOnlineGameId(null)
    setMode('online-lobby')
    refreshLobby()
  }

  // ── Mode / difficulty selection ──
  if (!mode) {
    return (
      <div className="flex flex-1 justify-center overflow-y-auto px-6 py-10">
        <div className="w-full max-w-4xl">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-4xl">♟️</span>
              <div>
                <h2 className="text-2xl font-black leading-tight">Ajedrez</h2>
                <p className="text-sm text-text-muted">Elige cómo quieres jugar</p>
              </div>
            </div>
            <ThemePicker theme={theme} onPick={handleTheme} />
          </div>

          {/* Opciones compartidas por vs-IA y 2 jugadores */}
          <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-border/60 bg-surface/60 p-4 sm:flex-row sm:items-center sm:gap-8">
            <div>
              <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-text-muted/60">Variante</p>
              <div className="flex gap-1.5">
                {VARIANTS.map((v) => (
                  <button key={v.id} type="button" onClick={() => setDraftVariant(v.id)}
                    className={`rounded-lg border px-3 py-1.5 text-[11px] font-bold whitespace-nowrap ${draftVariant === v.id ? 'border-primary bg-primary/15 text-primary' : 'border-border text-text-muted hover:bg-surface-hover'}`}>
                    {v.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="h-px w-full bg-border/60 sm:h-10 sm:w-px" />
            <div>
              <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-text-muted/60">Reloj</p>
              <div className="flex flex-wrap gap-1.5">
                {CLOCK_PRESETS.map((m) => (
                  <button key={m} type="button" onClick={() => setDraftClock(m)}
                    className={`rounded-lg border px-3 py-1.5 text-[11px] font-bold whitespace-nowrap ${draftClock === m ? 'border-primary bg-primary/15 text-primary' : 'border-border text-text-muted hover:bg-surface-hover'}`}>
                    {m === 0 ? 'Sin límite' : `${m} min`}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {/* vs AI */}
            <div className="rounded-2xl border border-border/60 bg-surface/40 p-4">
              <p className="mb-3 text-xs font-bold uppercase tracking-widest text-text-muted/60">vs Inteligencia Artificial</p>
              <div className="space-y-2">
                {DIFFICULTIES.map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => reset('vs-ai', d.id)}
                    className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all hover:-translate-y-0.5 hover:shadow-lg ${d.color}`}
                  >
                    <span className="text-2xl">{d.icon}</span>
                    <div>
                      <p className="font-bold">{d.label}</p>
                      <p className="text-xs opacity-70">{d.sub}</p>
                    </div>
                  </button>
                ))}
                <button type="button" disabled
                  className="flex w-full items-center gap-3 rounded-xl border border-border/40 bg-surface px-4 py-3 text-left opacity-50">
                  <span className="text-2xl">🤖</span>
                  <div>
                    <p className="font-bold text-text">Tu propia IA</p>
                    <p className="text-xs text-text-muted">Usa la IA configurada en tus Ajustes — Próximamente</p>
                  </div>
                </button>
              </div>
            </div>

            {/* 2p */}
            <div className="rounded-2xl border border-border/60 bg-surface/40 p-4">
              <p className="mb-3 text-xs font-bold uppercase tracking-widest text-text-muted/60">2 Jugadores</p>
              <button
                type="button"
                onClick={() => reset('2p')}
                className="flex w-full items-center gap-3 rounded-xl border border-primary/40 bg-primary/10 px-4 py-3 text-left text-primary transition-all hover:-translate-y-0.5 hover:shadow-lg"
              >
                <span className="text-2xl">👥</span>
                <div>
                  <p className="font-bold">2 Jugadores</p>
                  <p className="text-xs opacity-70">Misma pantalla, por turnos</p>
                </div>
              </button>
            </div>

            {/* Online */}
            <div className="rounded-2xl border border-border/60 bg-surface/40 p-4">
              <p className="mb-3 text-xs font-bold uppercase tracking-widest text-text-muted/60">En línea</p>
              <button
                type="button"
                onClick={() => setMode('online-lobby')}
                className="flex w-full items-center gap-3 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-left text-emerald-400 transition-all hover:-translate-y-0.5 hover:shadow-lg"
              >
                <span className="text-2xl">🌐</span>
                <div>
                  <p className="font-bold">Jugar en línea</p>
                  <p className="text-xs opacity-70">
                    Invita a alguien por username{invitesIn.length + myGames.length > 0 ? ` · ${invitesIn.length + myGames.length} pendiente(s)` : ''}
                  </p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── Online lobby ──
  if (mode === 'online-lobby') {
    return (
      <div className="flex h-full flex-col bg-background text-text">
        <div className="flex items-center justify-between gap-2 border-b border-border bg-surface px-3 py-2">
          <button type="button" onClick={() => setMode(null)} className="text-sm font-bold text-text-muted hover:text-text">← Volver</button>
          <span className="text-sm font-bold">🌐 Ajedrez en línea</span>
          <button type="button" onClick={refreshLobby} className="rounded-lg border border-border px-2.5 py-1 text-xs font-bold text-text-muted hover:bg-surface-hover">🔄</button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
        <div className="mx-auto max-w-2xl space-y-4">
          {invitesIn.length > 0 && (
            <div className="rounded-2xl border border-primary/30 bg-primary/5 p-3">
              <p className="mb-2 text-xs font-bold uppercase text-text-muted">Invitaciones recibidas</p>
              <div className="space-y-2">
                {invitesIn.map((inv) => (
                  <div key={inv.id} className="flex items-center justify-between gap-2 rounded-xl bg-surface p-2.5">
                    <div>
                      <p className="text-sm font-bold text-text">{inv.from_name}</p>
                      <p className="text-[11px] text-text-muted">{VARIANTS.find((v) => v.id === inv.variant)?.label} · {inv.clock_minutes === 0 ? 'Sin límite' : `${inv.clock_minutes} min`}</p>
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

          {myGames.length > 0 && (
            <div className="rounded-2xl border border-border bg-surface p-3">
              <p className="mb-2 text-xs font-bold uppercase text-text-muted">Tus partidas en curso</p>
              <div className="space-y-2">
                {myGames.map((g) => {
                  const oppName = session.user.id === g.white_id ? g.black_name : g.white_name
                  return (
                    <button key={g.id} type="button" onClick={() => handleOpenGame(g.id)}
                      className="flex w-full items-center justify-between gap-2 rounded-xl bg-surface-hover p-2.5 text-left hover:bg-primary/10">
                      <span className="text-sm font-bold text-text">vs {oppName}</span>
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
                    <span className="text-sm text-text">{inv.to_name}</span>
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

            <div className="mt-2 flex gap-2">
              <select value={inviteVariant} onChange={(e) => setInviteVariant(e.target.value)}
                className="flex-1 rounded-lg border border-border bg-background px-2 py-1.5 text-xs text-text outline-none focus:border-primary">
                {VARIANTS.map((v) => <option key={v.id} value={v.id}>{v.label}</option>)}
              </select>
              <select value={inviteClock} onChange={(e) => setInviteClock(Number(e.target.value))}
                className="w-28 rounded-lg border border-border bg-background px-2 py-1.5 text-xs text-text outline-none focus:border-primary">
                {CLOCK_PRESETS.map((m) => <option key={m} value={m}>{m === 0 ? 'Sin límite' : `${m} min`}</option>)}
              </select>
            </div>

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

  // ── Game board (vs-ai / 2p / online) ──
  const game = gameRef.current
  const isOver = mode === 'online-game' ? activeGame?.status === 'finalizada' : game.isGameOver()

  const displayHistory = mode === 'online-game' ? (activeGame?.history ?? []) : history
  const movePairs = []
  for (let i = 0; i < displayHistory.length; i += 2)
    movePairs.push([displayHistory[i], displayHistory[i + 1]])

  let remoteResultText = null
  if (mode === 'online-game' && activeGame?.status === 'finalizada') {
    const reasonLabel = { checkmate: 'jaque mate', stalemate: 'ahogado', draw: 'tablas', resign: 'abandono', timeout: 'tiempo agotado' }[activeGame.end_reason] || activeGame.end_reason
    remoteResultText = activeGame.result === 'draw'
      ? `🤝 Tablas (${reasonLabel})`
      : `🏆 Ganan ${activeGame.result === 'white' ? 'Blancas' : 'Negras'} (${reasonLabel})`
  }

  const onlineElapsed = mode === 'online-game' && activeGame ? now - new Date(activeGame.turn_started_at).getTime() : 0
  const onlineTurn = mode === 'online-game' ? game.turn() : null
  const displayWhiteMs = mode === 'online-game' && activeGame
    ? (onlineTurn === 'w' && activeGame.status === 'en_curso' ? Math.max(0, activeGame.white_ms - onlineElapsed) : activeGame.white_ms)
    : clockMs.w
  const displayBlackMs = mode === 'online-game' && activeGame
    ? (onlineTurn === 'b' && activeGame.status === 'en_curso' ? Math.max(0, activeGame.black_ms - onlineElapsed) : activeGame.black_ms)
    : clockMs.b

  const showClock = mode === 'online-game' ? (activeGame?.clock_minutes > 0) : draftClock > 0

  const baseOrientation = mode === 'online-game' && myColor === 'b' ? 'black' : 'white'
  const orientation = boardFlipped ? (baseOrientation === 'white' ? 'black' : 'white') : baseOrientation

  return (
    <div className="flex h-full flex-col bg-background text-text">

      {/* Status bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-surface px-3 py-2">
        <span className={`text-sm font-semibold ${isOver ? 'text-primary' : thinking ? 'text-amber-400' : 'text-text'}`}>
          {mode === 'online-game' ? (remoteResultText || statusText(game, {})) : statusText(game, { thinking, timeoutLoser })}
        </span>
        <div className="flex gap-1.5">
          <ThemePicker theme={theme} onPick={handleTheme} />
          <button type="button" onClick={() => setBoardFlipped((v) => !v)}
            className="rounded-lg border border-border px-2.5 py-1 text-xs font-bold text-text-muted hover:bg-surface-hover hover:text-text">
            🔄 Voltear
          </button>
          {mode === 'online-game' ? (
            <>
              {activeGame?.status === 'en_curso' && (
                <button type="button" onClick={() => resign(activeGame.id, myColor)}
                  className="rounded-lg border border-danger/40 px-2.5 py-1 text-xs font-bold text-danger hover:bg-danger/10">
                  🏳️ Rendirse
                </button>
              )}
              <button type="button" onClick={exitOnlineGame}
                className="rounded-lg border border-border px-2.5 py-1 text-xs font-bold text-text-muted hover:bg-surface-hover hover:text-text">
                ← Lobby
              </button>
            </>
          ) : (
            <>
              <button type="button" onClick={() => reset(mode, diff)}
                className="rounded-lg border border-border px-2.5 py-1 text-xs font-bold text-text-muted hover:bg-surface-hover hover:text-text">
                ↺ Nueva
              </button>
              <button type="button" onClick={() => setMode(null)}
                className="rounded-lg border border-border px-2.5 py-1 text-xs font-bold text-text-muted hover:bg-surface-hover hover:text-text">
                ⚙ Modo
              </button>
            </>
          )}
        </div>
      </div>

      {/* Board + history */}
      <div className="flex flex-1 flex-col items-center gap-4 overflow-auto p-4 md:flex-row md:items-start md:justify-center">

        <div className="w-full max-w-[min(90vw,500px)]">
          {showClock && (
            <div className="mb-2 flex justify-between text-sm font-mono font-bold">
              <span className={`rounded-lg px-2.5 py-1 ${(mode === 'online-game' ? onlineTurn : game.turn()) === 'b' ? 'bg-primary/15 text-primary' : 'text-text-muted'}`}>
                ⚫ {mode === 'online-game' ? (activeGame?.black_name ?? 'Negras') : 'Negras'} {fmtClock(displayBlackMs)}
              </span>
              <span className={`rounded-lg px-2.5 py-1 ${(mode === 'online-game' ? onlineTurn : game.turn()) === 'w' ? 'bg-primary/15 text-primary' : 'text-text-muted'}`}>
                ⚪ {mode === 'online-game' ? (activeGame?.white_name ?? 'Blancas') : 'Blancas'} {fmtClock(displayWhiteMs)}
              </span>
            </div>
          )}

          <BoardView
            fen={fen}
            onPieceDrop={({ sourceSquare, targetSquare }) => attemptMove(sourceSquare, targetSquare)}
            onSquareClick={handleSquareClick}
            canDragPiece={canDragPiece}
            squareStyles={squareStyles}
            orientation={orientation}
            theme={theme}
          />
          {mode === 'vs-ai' && (
            <p className="mt-1.5 text-center text-[10px] text-text-muted/50">
              Juegas con ♙ Blancas · IA ({selectedDiff.label}) juega con ♟️ Negras
            </p>
          )}
        </div>

        {movePairs.length > 0 && (
          <div className="w-full shrink-0 rounded-xl border border-border bg-surface p-3 md:w-40">
            <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-text-muted/50">
              Movimientos
            </p>
            <div className="flex max-h-56 flex-col gap-0.5 overflow-y-auto font-mono text-xs">
              {movePairs.map(([w, b], i) => (
                <div key={i} className="flex gap-1.5">
                  <span className="w-5 shrink-0 text-text-muted/40">{i + 1}.</span>
                  <span className="w-12 text-text">{w}</span>
                  {b && <span className="text-text-muted">{b}</span>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
