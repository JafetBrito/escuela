import { useState, useCallback, useRef } from 'react'
import { Chessboard } from 'react-chessboard'
import { Chess } from 'chess.js'

// Simple AI: picks the best-scoring move with a shallow evaluation.
// Score = material count (standard piece values). Positive = good for black.
const PIECE_VALUE = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 }

function scoreBoard(chess) {
  let score = 0
  chess.board().forEach((row) =>
    row.forEach((sq) => {
      if (!sq) return
      const v = PIECE_VALUE[sq.type] ?? 0
      score += sq.color === 'b' ? v : -v
    })
  )
  return score
}

function pickAiMove(chess) {
  const moves = chess.moves({ verbose: true })
  if (!moves.length) return null
  // One-ply: pick move that maximises black's score
  let best = null, bestScore = -Infinity
  for (const m of moves) {
    chess.move(m)
    const s = scoreBoard(chess)
    chess.undo()
    if (s > bestScore) { bestScore = s; best = m }
  }
  return best
}

export default function ChessGame() {
  const gameRef = useRef(new Chess())
  const [fen, setFen] = useState(gameRef.current.fen())
  const [status, setStatus] = useState('')
  const [mode, setMode] = useState('vs-ai') // 'vs-ai' | '2p'
  const [lastMove, setLastMove] = useState(null)
  const [thinking, setThinking] = useState(false)

  const refresh = useCallback((game, extra = '') => {
    setFen(game.fen())
    const turn = game.turn() === 'w' ? 'Blancas' : 'Negras'
    if (game.isCheckmate()) setStatus('¡Jaque mate! 🏆 Ganaron ' + (game.turn() === 'w' ? 'Negras' : 'Blancas'))
    else if (game.isDraw()) setStatus('Tablas 🤝')
    else if (game.isCheck()) setStatus(`Jaque — turno de ${turn} ${extra}`)
    else setStatus(`Turno de ${turn} ${extra}`)
  }, [])

  const reset = useCallback(() => {
    const g = new Chess()
    gameRef.current = g
    setLastMove(null)
    setThinking(false)
    refresh(g)
  }, [refresh])

  const onDrop = useCallback((sourceSquare, targetSquare, piece) => {
    const game = gameRef.current
    if (game.isGameOver()) return false
    if (mode === 'vs-ai' && game.turn() !== 'w') return false

    // chess.js v1 throws on illegal moves instead of returning null
    let move
    try { move = game.move({ from: sourceSquare, to: targetSquare, promotion: 'q' }) }
    catch { return false }
    if (!move) return false

    setLastMove({ from: sourceSquare, to: targetSquare })
    refresh(game)

    if (mode === 'vs-ai' && !game.isGameOver()) {
      setThinking(true)
      // Defer so React can render the player's move first
      setTimeout(() => {
        const best = pickAiMove(game)
        if (best) {
          game.move(best)
          setLastMove({ from: best.from, to: best.to })
        }
        refresh(game)
        setThinking(false)
      }, 120)
    }

    return true
  }, [mode, refresh])

  // Highlight last move squares
  const customSquareStyles = lastMove
    ? {
        [lastMove.from]: { backgroundColor: 'rgba(255, 214, 0, 0.35)' },
        [lastMove.to]:   { backgroundColor: 'rgba(255, 214, 0, 0.5)'  },
      }
    : {}

  const game = gameRef.current
  const over = game.isGameOver()

  return (
    <div className="flex h-full flex-col items-center justify-start gap-3 overflow-auto bg-background p-4 text-text">
      {/* Controls */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        <div className="flex overflow-hidden rounded-lg border border-border text-sm font-medium">
          {(['vs-ai', '2p']).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => { setMode(m); reset() }}
              className={`px-4 py-1.5 transition-colors ${
                mode === m ? 'bg-primary text-background' : 'text-text-muted hover:text-text'
              }`}
            >
              {m === 'vs-ai' ? '🤖 vs IA' : '👥 2 jugadores'}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={reset}
          className="rounded-lg border border-border px-4 py-1.5 text-sm font-medium text-text-muted transition-colors hover:text-text"
        >
          ↺ Nueva partida
        </button>
      </div>

      {/* Status */}
      <p className={`text-sm font-semibold ${over ? 'text-primary' : 'text-text-muted'}`}>
        {thinking ? '🤔 La IA está pensando…' : (status || 'Turno de Blancas')}
      </p>

      {/* Board */}
      <div className="w-full max-w-[min(90vw,520px)]">
        <Chessboard
          position={fen}
          onPieceDrop={onDrop}
          customSquareStyles={customSquareStyles}
          boardOrientation="white"
          arePiecesDraggable={!over && !thinking}
          customBoardStyle={{ borderRadius: '8px', boxShadow: '0 4px 24px rgba(0,0,0,0.4)' }}
          customDarkSquareStyle={{ backgroundColor: '#5a7a4a' }}
          customLightSquareStyle={{ backgroundColor: '#e8f0d8' }}
        />
      </div>

      {mode === 'vs-ai' && (
        <p className="text-xs text-text-muted/60">Juegas con las Blancas · la IA toma las Negras</p>
      )}
    </div>
  )
}
