import { useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useBoardGameStore } from '../../stores/useBoardGameStore'
import { useAuthStore } from '../../stores/useAuthStore'
import { useCurrencyStore } from '../../stores/useCurrencyStore'
import { useLevelStore } from '../../stores/useLevelStore'
import { supabase } from '../../services/supabase/client'
import { TILES, TILE_META } from '../../data/boardTiles'
import BoardScene from './BoardScene'

const STEP_MS = 420

// ── Serialisable slice of state to broadcast ──────────────────────────────────
function slice(s) {
  return {
    players: s.players,
    currentTurn: s.currentTurn,
    phase: s.phase,
    diceResult: s.diceResult,
    movesLeft: s.movesLeft,
    activeEvent: s.activeEvent,
    winner: s.winner,
  }
}

// ── Dice face emoji ───────────────────────────────────────────────────────────
const DICE = ['', '⚀', '⚁', '⚂', '⚃', '⚄', '⚅']

// ── Event modal (question / reward / trap / battle / safe) ────────────────────
function EventModal({ event, myTurn, onAnswer, onContinue }) {
  if (!event) return null
  const q = event.question

  if (event.type === 'reward') {
    return (
      <ModalShell color="purple">
        <div className="text-5xl mb-2">🎁</div>
        <h2 className="text-xl font-bold text-purple-300 mb-1">¡Premio!</h2>
        <p className="text-sm text-text-muted mb-4">+300 monedas · +30 XP</p>
        {myTurn && <BigBtn onClick={() => onContinue(true)}>¡Reclamar!</BigBtn>}
        {!myTurn && <p className="text-xs text-text-muted">Esperando al jugador...</p>}
      </ModalShell>
    )
  }
  if (event.type === 'trap') {
    return (
      <ModalShell color="red">
        <div className="text-5xl mb-2">💀</div>
        <h2 className="text-xl font-bold text-red-300 mb-1">¡Trampa!</h2>
        <p className="text-sm text-text-muted mb-4">−150 monedas</p>
        {myTurn && <BigBtn color="red" onClick={() => onContinue(false)}>Continuar...</BigBtn>}
        {!myTurn && <p className="text-xs text-text-muted">Esperando al jugador...</p>}
      </ModalShell>
    )
  }
  if (event.type === 'safe') {
    return (
      <ModalShell color="green">
        <div className="text-5xl mb-2">⭐</div>
        <h2 className="text-xl font-bold text-green-300 mb-1">¡Zona segura!</h2>
        <p className="text-sm text-text-muted mb-4">Descansas un momento. Nada pasa.</p>
        {myTurn && <BigBtn color="green" onClick={() => onContinue(true)}>Continuar</BigBtn>}
        {!myTurn && <p className="text-xs text-text-muted">Esperando al jugador...</p>}
      </ModalShell>
    )
  }
  if (event.type === 'start') {
    return (
      <ModalShell color="amber">
        <div className="text-5xl mb-2">🏁</div>
        <h2 className="text-xl font-bold text-amber-300 mb-1">¡Punto de inicio!</h2>
        <p className="text-sm text-text-muted mb-4">Pasaste por el inicio.</p>
        {myTurn && <BigBtn color="amber" onClick={() => onContinue(true)}>Continuar</BigBtn>}
        {!myTurn && <p className="text-xs text-text-muted">Esperando al jugador...</p>}
      </ModalShell>
    )
  }

  // question or battle
  const isQ = q != null
  return (
    <ModalShell color={event.type === 'battle' ? 'orange' : 'blue'}>
      <div className="text-4xl mb-2">{event.type === 'battle' ? '⚔️' : '❓'}</div>
      <h2 className={`text-lg font-bold mb-3 ${event.type === 'battle' ? 'text-orange-300' : 'text-blue-300'}`}>
        {event.type === 'battle' ? '¡Batalla de conocimiento!' : '¡Pregunta!'}
      </h2>
      {isQ && (
        <>
          <p className="text-sm font-medium text-text mb-4 text-center">{q.q}</p>
          {myTurn ? (
            <div className="grid grid-cols-1 gap-2 w-full">
              {q.opts.map((opt, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => onAnswer(i === q.a)}
                  className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text text-left transition-colors hover:border-primary hover:text-primary"
                >
                  {String.fromCharCode(65 + i)}. {opt}
                </button>
              ))}
            </div>
          ) : (
            <p className="text-xs text-text-muted">Esperando la respuesta del jugador...</p>
          )}
        </>
      )}
    </ModalShell>
  )
}

function ModalShell({ children, color = 'blue' }) {
  const borders = { blue: 'border-blue-500/40', purple: 'border-purple-500/40', red: 'border-red-500/40', green: 'border-green-500/40', orange: 'border-orange-500/40', amber: 'border-amber-500/40' }
  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className={`flex flex-col items-center rounded-2xl border ${borders[color]} bg-surface/95 p-6 shadow-2xl w-80 max-w-[90vw]`}>
        {children}
      </div>
    </div>
  )
}

function BigBtn({ onClick, color = 'blue', children }) {
  const cls = {
    blue:   'bg-blue-600 hover:bg-blue-500',
    green:  'bg-green-600 hover:bg-green-500',
    red:    'bg-red-600 hover:bg-red-500',
    orange: 'bg-orange-600 hover:bg-orange-500',
    amber:  'bg-amber-600 hover:bg-amber-500',
    purple: 'bg-purple-600 hover:bg-purple-500',
  }
  return (
    <button type="button" onClick={onClick} className={`mt-2 rounded-xl px-6 py-2.5 font-bold text-white transition-colors ${cls[color] ?? cls.blue}`}>
      {children}
    </button>
  )
}

// ── Game over screen ──────────────────────────────────────────────────────────
function GameOver({ winner, onReplay, navigate }) {
  return (
    <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-black/80 backdrop-blur">
      <div className="rounded-3xl border border-amber-500/40 bg-surface/95 p-10 text-center shadow-2xl">
        <div className="text-7xl mb-4">🏆</div>
        <h1 className="text-3xl font-black text-amber-300 mb-2">¡{winner.name} ganó!</h1>
        <p className="text-text-muted mb-1">{winner.coins} monedas · {winner.xp} XP</p>
        <div className="mt-6 flex gap-3 justify-center">
          <button type="button" onClick={onReplay} className="rounded-xl bg-primary px-5 py-2.5 font-bold text-background">Revanche</button>
          <button type="button" onClick={() => navigate('/rol')} className="rounded-xl border border-border px-5 py-2.5 text-sm text-text-muted">Salir</button>
        </div>
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function RolGamePage() {
  const { roomId } = useParams()
  const navigate   = useNavigate()
  const channelRef = useRef(null)
  const isBroadcasting = useRef(false)

  const session  = useAuthStore((s) => s.session)
  const profile  = useAuthStore((s) => s.profile)
  const addCoins = useCurrencyStore((s) => s.earnCoins)
  const addXp    = useLevelStore((s) => s.addXp)

  const {
    players, currentTurn, phase, diceResult, movesLeft,
    activeEvent, winner, hostId,
    setRoom, addPlayer, removePlayer, startGame,
    rollDice, stepPlayer, resolveEvent, skipTurn,
    syncFromBroadcast, resetGame,
  } = useBoardGameStore()

  const myId   = session?.user?.id
  const myName = profile?.display_name ?? session?.user?.email?.split('@')[0] ?? 'Jugador'
  const me     = players.find((p) => p.id === myId)
  const myIdx  = players.findIndex((p) => p.id === myId)
  const myTurn = myIdx === currentTurn
  const isHost = myId === hostId

  // ── Broadcast helper ───────────────────────────────────────────────────────
  const broadcast = useCallback(() => {
    if (!channelRef.current || isBroadcasting.current) return
    isBroadcasting.current = true
    const s = useBoardGameStore.getState()
    channelRef.current.send({ type: 'broadcast', event: 'state', payload: slice(s) })
    setTimeout(() => { isBroadcasting.current = false }, 80)
  }, [])

  // ── Supabase channel ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!myId || !roomId) return

    const ch = supabase.channel(`rol-room-${roomId}`)

    ch.on('broadcast', { event: 'state' }, ({ payload }) => {
      if (!myTurn) syncFromBroadcast(payload)
    })

    ch.on('presence', { event: 'sync' }, () => {
      const state = ch.presenceState()
      const present = Object.values(state).flat()
      // Add any new players we haven't seen
      for (const p of present) {
        if (p.id && p.name) addPlayer({ id: p.id, name: p.name })
      }
    })

    ch.on('presence', { event: 'leave' }, ({ leftPresences }) => {
      for (const p of leftPresences) removePlayer(p.id)
    })

    ch.subscribe((status) => {
      if (status !== 'SUBSCRIBED') return
      // First joiner is host
      const s = useBoardGameStore.getState()
      if (!s.hostId) setRoom(roomId, myId)
      ch.track({ id: myId, name: myName })
      addPlayer({ id: myId, name: myName })
    })

    channelRef.current = ch
    return () => {
      ch.unsubscribe()
      channelRef.current = null
      resetGame()
    }
  }, [myId, roomId]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Step animation: fires every STEP_MS while moving ─────────────────────
  useEffect(() => {
    if (phase !== 'moving' || movesLeft <= 0 || !myTurn) return
    const t = setTimeout(() => {
      stepPlayer()
      broadcast()
    }, STEP_MS)
    return () => clearTimeout(t)
  }, [phase, movesLeft, myTurn]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Broadcast on phase changes while it's my turn ─────────────────────────
  useEffect(() => {
    if (myTurn && phase !== 'moving') broadcast()
  }, [phase, activeEvent, winner]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Actions ────────────────────────────────────────────────────────────────
  const handleRoll = () => {
    if (!myTurn || phase !== 'rolling') return
    rollDice()
    broadcast()
  }

  const handleAnswer = (correct) => {
    if (!myTurn) return
    if (correct && activeEvent?.type === 'question') { addXp(50); addCoins(200) }
    if (correct && activeEvent?.type === 'battle')   { addXp(80); addCoins(400) }
    if (!correct && activeEvent?.type === 'battle')  { /* no local deduction, store handles cap */ }
    if (activeEvent?.type === 'reward') { addXp(30); addCoins(300) }
    resolveEvent(correct)
    broadcast()
  }

  const handleReplay = () => {
    resetGame()
    addPlayer({ id: myId, name: myName })
    broadcast()
  }

  const currentPlayer = players[currentTurn]
  const tile = currentPlayer ? TILES[currentPlayer.tile] : null

  return (
    <div className="relative h-screen w-full overflow-hidden bg-[#050d05]">

      {/* ── 3D board ─────────────────────────────────────────────────────── */}
      <BoardScene players={players} currentTurn={currentTurn} />

      {/* ── Top bar ──────────────────────────────────────────────────────── */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 rounded-2xl border border-white/10 bg-black/70 px-4 py-2 text-xs text-white backdrop-blur">
        <span className="font-semibold text-amber-300">🎲 Mundo ROL</span>
        <span className="text-white/30">·</span>
        <span className="font-mono text-white/60">{roomId}</span>
        <span className="text-white/30">·</span>
        <span>{players.length} jugador{players.length !== 1 ? 'es' : ''}</span>
        <button type="button" onClick={() => navigate('/rol')} className="ml-2 text-white/40 hover:text-white">✕</button>
      </div>

      {/* ── Player scoreboard ─────────────────────────────────────────────── */}
      <div className="absolute top-16 right-3 z-10 flex flex-col gap-1.5">
        {players.map((p, i) => (
          <div
            key={p.id}
            className={`flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs backdrop-blur transition-all ${
              i === currentTurn
                ? 'border-white/30 bg-white/15 scale-105'
                : 'border-white/10 bg-black/50'
            }`}
          >
            <span className="h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ background: p.color }} />
            <span className="font-semibold text-white max-w-[80px] truncate">{p.name}</span>
            <span className="text-amber-300 ml-auto">💰{p.coins}</span>
            <span className="text-purple-300">✨{p.xp}</span>
            {i === currentTurn && <span className="text-[10px] text-white animate-pulse">▶</span>}
          </div>
        ))}
      </div>

      {/* ── Tile legend (bottom-left) ──────────────────────────────────────── */}
      <div className="absolute bottom-24 left-3 z-10 hidden sm:flex flex-col gap-1">
        {Object.entries(TILE_META).map(([type, meta]) => (
          <div key={type} className="flex items-center gap-1.5 text-[11px] text-white/60">
            <span className="h-2 w-2 rounded-sm flex-shrink-0" style={{ background: meta.color }} />
            {meta.label} {meta.name}
          </div>
        ))}
      </div>

      {/* ── Turn controls (bottom center) ─────────────────────────────────── */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10">
        {phase === 'lobby' && isHost && players.length >= 1 && (
          <div className="flex flex-col items-center gap-2">
            <p className="text-xs text-white/50 mb-1">Sala lista · Comparte el código <strong className="text-white font-mono">{roomId}</strong></p>
            <button
              type="button"
              onClick={() => { startGame(); broadcast() }}
              className="rounded-2xl bg-primary px-8 py-3 text-lg font-black text-background shadow-xl transition hover:scale-105"
            >
              ¡Iniciar partida!
            </button>
          </div>
        )}

        {phase === 'lobby' && !isHost && (
          <p className="text-sm text-white/50">Esperando que el anfitrión inicie la partida...</p>
        )}

        {phase === 'rolling' && (
          <div className="flex flex-col items-center gap-2">
            <p className="text-sm font-semibold" style={{ color: currentPlayer?.color ?? '#fff' }}>
              {myTurn ? '🎲 Tu turno — tira el dado' : `Turno de ${currentPlayer?.name}`}
            </p>
            {myTurn && (
              <button
                type="button"
                onClick={handleRoll}
                className="rounded-2xl bg-primary px-8 py-3 text-xl font-black text-background shadow-xl transition hover:scale-105 active:scale-95"
              >
                🎲 Tirar
              </button>
            )}
          </div>
        )}

        {phase === 'moving' && (
          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/70 px-5 py-3 backdrop-blur">
            <span className="text-4xl">{DICE[diceResult] ?? '🎲'}</span>
            <div>
              <p className="text-xs text-white/50">Moviendo...</p>
              <p className="text-lg font-bold text-white">{movesLeft} casillas</p>
            </div>
          </div>
        )}

        {phase === 'gameover' && null /* handled by GameOver overlay */}
      </div>

      {/* ── Dice result flash ──────────────────────────────────────────────── */}
      {diceResult && phase === 'rolling' && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none">
          <span className="text-8xl opacity-80 animate-bounce">{DICE[diceResult]}</span>
        </div>
      )}

      {/* ── Event modal ───────────────────────────────────────────────────── */}
      {phase === 'event' && (
        <EventModal
          event={activeEvent}
          myTurn={myTurn}
          onAnswer={handleAnswer}
          onContinue={(ok) => handleAnswer(ok)}
        />
      )}

      {/* ── Game over ──────────────────────────────────────────────────────── */}
      {phase === 'gameover' && winner && (
        <GameOver winner={winner} onReplay={handleReplay} navigate={navigate} />
      )}
    </div>
  )
}
