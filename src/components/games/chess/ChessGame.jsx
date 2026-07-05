import { useState, useCallback, useRef } from 'react'
import { Chessboard } from 'react-chessboard'
import { Chess } from 'chess.js'

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
  // Shuffle slightly for varied play
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

function statusText(game, thinking) {
  if (game.isCheckmate()) return game.turn() === 'w' ? '🏆 Jaque mate — Negras ganan' : '🏆 Jaque mate — Blancas ganan'
  if (game.isStalemate()) return '🤝 Tablas — Ahogado'
  if (game.isDraw())      return '🤝 Tablas'
  if (thinking)           return '🤖 IA pensando…'
  if (game.isCheck())     return (game.turn() === 'w' ? '⚠️ Jaque — Blancas' : '⚠️ Jaque — Negras')
  return game.turn() === 'w' ? '♙ Turno de Blancas' : '♟️ Turno de Negras'
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function ChessGame() {
  const gameRef   = useRef(new Chess())
  const [fen,       setFen]       = useState(() => gameRef.current.fen())
  const [thinking,  setThinking]  = useState(false)
  const [history,   setHistory]   = useState([])    // SAN strings
  const [lastMove,  setLastMove]  = useState(null)  // { from, to }

  // mode: null = selection screen | 'vs-ai' | '2p'
  // diff: difficulty id for vs-ai
  const [mode, setMode] = useState(null)
  const [diff, setDiff] = useState('easy')

  const selectedDiff = DIFFICULTIES.find((d) => d.id === diff) ?? DIFFICULTIES[0]

  const reset = useCallback((newMode, newDiff) => {
    const g = new Chess()
    gameRef.current = g
    setFen(g.fen())
    setHistory([])
    setLastMove(null)
    setThinking(false)
    if (newMode !== undefined) setMode(newMode)
    if (newDiff !== undefined) setDiff(newDiff)
  }, [])

  const onPieceDrop = useCallback(({ sourceSquare, targetSquare }) => {
    const game = gameRef.current
    if (game.isGameOver() || thinking) return false
    if (mode === 'vs-ai' && game.turn() !== 'w') return false

    let move
    try { move = game.move({ from: sourceSquare, to: targetSquare, promotion: 'q' }) }
    catch { return false }
    if (!move) return false

    setFen(game.fen())
    setLastMove({ from: sourceSquare, to: targetSquare })
    setHistory((h) => [...h, move.san])

    if (mode === 'vs-ai' && !game.isGameOver() && game.turn() === 'b') {
      setThinking(true)
      const captureDiff = selectedDiff.depth
      setTimeout(() => {
        const best = getAiMove(game, captureDiff)
        if (best) {
          try {
            const res = game.move(best)
            setFen(game.fen())
            setLastMove({ from: best.from, to: best.to })
            setHistory((h) => [...h, res.san])
          } catch {}
        }
        setThinking(false)
      }, 200)
    }

    return true
  }, [mode, thinking, selectedDiff])

  const canDragPiece = useCallback(({ piece }) => {
    if (gameRef.current.isGameOver() || thinking) return false
    if (mode === 'vs-ai') return piece?.pieceType?.startsWith?.('w') ?? true
    return true
  }, [mode, thinking])

  const squareStyles = lastMove
    ? {
        [lastMove.from]: { backgroundColor: 'rgba(255,210,0,0.35)' },
        [lastMove.to]:   { backgroundColor: 'rgba(255,210,0,0.55)' },
      }
    : {}

  // ── Mode / difficulty selection ──
  if (!mode) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-8 px-6 py-8">
        <div className="text-center">
          <span className="text-5xl">♟️</span>
          <h2 className="mt-2 text-2xl font-black">Ajedrez</h2>
          <p className="text-sm text-text-muted">Elige cómo quieres jugar</p>
        </div>

        <div className="w-full max-w-xs space-y-6">
          {/* vs AI */}
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-widest text-text-muted/60">vs Inteligencia Artificial</p>
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
            </div>
          </div>

          {/* 2p */}
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-widest text-text-muted/60">2 Jugadores</p>
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
        </div>
      </div>
    )
  }

  // ── Game board ──
  const game = gameRef.current
  const isOver = game.isGameOver()

  const movePairs = []
  for (let i = 0; i < history.length; i += 2)
    movePairs.push([history[i], history[i + 1]])

  return (
    <div className="flex h-full flex-col bg-background text-text">

      {/* Status bar */}
      <div className="flex items-center justify-between gap-2 border-b border-border bg-surface px-3 py-2">
        <span className={`text-sm font-semibold ${isOver ? 'text-primary' : thinking ? 'text-amber-400' : 'text-text'}`}>
          {statusText(game, thinking)}
        </span>
        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={() => reset(mode, diff)}
            className="rounded-lg border border-border px-2.5 py-1 text-xs font-bold text-text-muted hover:bg-surface-hover hover:text-text"
          >
            ↺ Nueva
          </button>
          <button
            type="button"
            onClick={() => setMode(null)}
            className="rounded-lg border border-border px-2.5 py-1 text-xs font-bold text-text-muted hover:bg-surface-hover hover:text-text"
          >
            ⚙ Modo
          </button>
        </div>
      </div>

      {/* Board + history */}
      <div className="flex flex-1 flex-col items-center gap-4 overflow-auto p-4 md:flex-row md:items-start md:justify-center">

        {/* Board */}
        <div className="w-full max-w-[min(90vw,500px)]">
          <Chessboard
            options={{
              position: fen,
              onPieceDrop,
              canDragPiece,
              squareStyles,
              boardOrientation: 'white',
              boardStyle: { borderRadius: '8px', boxShadow: '0 4px 28px rgba(0,0,0,0.5)' },
              darkSquareStyle:  { backgroundColor: '#5a7a4a' },
              lightSquareStyle: { backgroundColor: '#e8f0d8' },
            }}
          />
          {mode === 'vs-ai' && (
            <p className="mt-1.5 text-center text-[10px] text-text-muted/50">
              Juegas con ♙ Blancas · IA ({selectedDiff.label}) juega con ♟️ Negras
            </p>
          )}
        </div>

        {/* Move history */}
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
