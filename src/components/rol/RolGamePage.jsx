import { useEffect, useRef, useCallback, useState } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { useBoardGameStore } from '../../stores/useBoardGameStore'
import { useAuthStore } from '../../stores/useAuthStore'
import { useCurrencyStore } from '../../stores/useCurrencyStore'
import { useLevelStore } from '../../stores/useLevelStore'
import { useMascotStore } from '../../stores/useMascotStore'
import { supabase } from '../../services/supabase/client'
import { TILES, TILE_META } from '../../data/boardTiles'
import { getStoryById } from '../../data/rolStoriesRegistry'
import WorldChat from '../vr/WorldChat'
import BoardScene from './BoardScene'

const STEP_MS = 420

function slice(s) {
  return {
    players: s.players,
    currentTurn: s.currentTurn,
    phase: s.phase,
    diceResult: s.diceResult,
    movesLeft: s.movesLeft,
    activeEvent: s.activeEvent,
    winner: s.winner,
    storyId: s.storyId,
  }
}

const DICE = ['', '⚀', '⚁', '⚂', '⚃', '⚄', '⚅']

// ── Story Intro Overlay ───────────────────────────────────────────────────────
function StoryIntro({ story, onDone }) {
  const [lineIdx, setLineIdx] = useState(0)
  const [done, setDone]       = useState(false)

  useEffect(() => {
    if (lineIdx >= story.intro.length) { setTimeout(() => setDone(true), 600); return }
    const t = setTimeout(() => setLineIdx((i) => i + 1), 1400)
    return () => clearTimeout(t)
  }, [lineIdx, story.intro.length])

  if (done) return null

  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/90 backdrop-blur-md">
      <div className="max-w-sm text-center px-6">
        <div className={`mb-4 text-6xl transition-all duration-500 ${lineIdx > 0 ? 'opacity-100' : 'opacity-0'}`}>
          {story.icon}
        </div>
        <h2 className={`mb-6 text-xl font-black text-white bg-gradient-to-r ${story.gradient} bg-clip-text text-transparent`}>
          {story.title}
        </h2>
        <div className="space-y-3 min-h-[8rem]">
          {story.intro.slice(0, lineIdx).map((line, i) => (
            <p key={i} className="text-sm text-white/80 leading-relaxed animate-fade-in">{line}</p>
          ))}
        </div>
        <button
          type="button"
          onClick={onDone}
          className="mt-8 rounded-xl border border-white/20 px-6 py-2 text-sm text-white/50 hover:text-white transition-colors"
        >
          Saltar intro →
        </button>
      </div>
    </div>
  )
}

// ── RPG Event Modal ───────────────────────────────────────────────────────────
function EventModal({ event, myTurn, story, onAnswer, onContinue }) {
  if (!event) return null
  const f = story.flavor
  const q = event.question

  const colorMap = { reward: 'purple', trap: 'red', safe: 'green', start: 'amber', question: 'blue', battle: 'orange' }
  const color = colorMap[event.type] ?? 'blue'

  // Non-question events
  if (event.type !== 'question' && event.type !== 'battle') {
    const fl = f[event.type] ?? {}
    const btnColor = { reward: 'purple', trap: 'red', safe: 'green', start: 'amber' }[event.type] ?? 'blue'
    const isSuccess = event.type === 'reward' || event.type === 'safe' || event.type === 'start'
    return (
      <ModalShell color={color}>
        <div className="text-5xl mb-2">{fl.icon ?? '📋'}</div>
        <h2 className={`text-xl font-bold mb-1 text-${color}-300`}>{fl.title}</h2>
        <p className="text-sm text-text-muted mb-4 text-center">{fl.body}</p>
        {myTurn
          ? <BigBtn color={btnColor} onClick={() => onContinue(isSuccess)}>
              {event.type === 'trap' ? 'Continuar...' : '¡Continuar!'}
            </BigBtn>
          : <p className="text-xs text-text-muted">Esperando al jugador...</p>}
      </ModalShell>
    )
  }

  // Question / Battle
  const fl = f[event.type] ?? {}
  return (
    <ModalShell color={color}>
      <div className="text-4xl mb-1">{fl.icon ?? '❓'}</div>
      <p className={`text-xs font-semibold mb-3 text-${color}-400`}>{fl.prefix}</p>
      {q && (
        <>
          <p className="text-sm font-medium text-text mb-4 text-center leading-snug">{q.q}</p>
          {myTurn ? (
            <div className="grid grid-cols-1 gap-2 w-full">
              {q.opts.map((opt, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => onAnswer(i === q.a)}
                  className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text text-left transition-colors hover:border-primary hover:text-primary"
                >
                  <span className="font-bold text-text-muted mr-2">{String.fromCharCode(65 + i)}.</span>
                  {opt}
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
  const borders = {
    blue: 'border-blue-500/40', purple: 'border-purple-500/40',
    red: 'border-red-500/40', green: 'border-green-500/40',
    orange: 'border-orange-500/40', amber: 'border-amber-500/40',
  }
  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className={`flex flex-col items-center rounded-2xl border ${borders[color] ?? borders.blue} bg-surface/95 p-6 shadow-2xl w-80 max-w-[90vw] max-h-[90vh] overflow-y-auto`}>
        {children}
      </div>
    </div>
  )
}

function BigBtn({ onClick, color = 'blue', children }) {
  const cls = {
    blue: 'bg-blue-600 hover:bg-blue-500', green: 'bg-green-600 hover:bg-green-500',
    red: 'bg-red-600 hover:bg-red-500', orange: 'bg-orange-600 hover:bg-orange-500',
    amber: 'bg-amber-600 hover:bg-amber-500', purple: 'bg-purple-600 hover:bg-purple-500',
  }
  return (
    <button type="button" onClick={onClick} className={`mt-2 rounded-xl px-6 py-2.5 font-bold text-white transition-colors ${cls[color] ?? cls.blue}`}>
      {children}
    </button>
  )
}

// ── Game Over ─────────────────────────────────────────────────────────────────
function GameOver({ winner, story, onReplay, navigate }) {
  return (
    <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-black/85 backdrop-blur">
      <div className="rounded-3xl border border-amber-500/40 bg-surface/95 p-10 text-center shadow-2xl max-w-sm mx-4">
        <div className="text-7xl mb-4">🏆</div>
        <h1 className="text-3xl font-black text-amber-300 mb-1">¡{winner.name} ganó!</h1>
        <p className={`text-sm font-semibold mb-1 bg-gradient-to-r ${story.gradient} bg-clip-text text-transparent`}>
          {story.winTitle}
        </p>
        <p className="text-xs text-text-muted mb-1">{story.winText}</p>
        <p className="text-xs text-text-muted mt-2">{winner.coins} monedas · {winner.xp} XP</p>
        <div className="mt-6 flex gap-3 justify-center">
          <button type="button" onClick={onReplay} className="rounded-xl bg-primary px-5 py-2.5 font-bold text-background">Revanche</button>
          <button type="button" onClick={() => navigate('/rol')} className="rounded-xl border border-border px-5 py-2.5 text-sm text-text-muted">Salir</button>
        </div>
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function RolGamePage() {
  const { roomId }       = useParams()
  const navigate         = useNavigate()
  const [searchParams]   = useSearchParams()
  const channelRef       = useRef(null)
  const isBroadcasting   = useRef(false)

  const session    = useAuthStore((s) => s.session)
  const profile    = useAuthStore((s) => s.profile)
  const addCoins   = useCurrencyStore((s) => s.earnCoins)
  const addXp      = useLevelStore((s) => s.addXp)
  const mascotId   = useMascotStore((s) => s.mascot)

  const {
    players, currentTurn, phase, diceResult, movesLeft,
    activeEvent, winner, hostId, storyId,
    setRoom, setStory, addPlayer, removePlayer, startGame,
    rollDice, stepPlayer, resolveEvent, skipTurn,
    syncFromBroadcast, resetGame,
  } = useBoardGameStore()

  const myId   = session?.user?.id
  const myName = profile?.display_name ?? session?.user?.email?.split('@')[0] ?? 'Jugador'
  const me     = players.find((p) => p.id === myId)
  const myIdx  = players.findIndex((p) => p.id === myId)
  const myTurn = myIdx === currentTurn
  const isHost = myId === hostId
  const story  = getStoryById(storyId)

  const [chatOpen, setChatOpen]   = useState(false)
  const [showIntro, setShowIntro] = useState(false)

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

    // Read story from URL (host sets it, guests inherit via broadcast)
    const urlStory = searchParams.get('story')
    if (urlStory) setStory(urlStory)

    const ch = supabase.channel(`rol-room-${roomId}`)

    ch.on('broadcast', { event: 'state' }, ({ payload }) => {
      if (!myTurn) syncFromBroadcast(payload)
    })

    ch.on('presence', { event: 'sync' }, () => {
      const state   = ch.presenceState()
      const present = Object.values(state).flat()
      for (const p of present) {
        if (p.id && p.name) addPlayer({ id: p.id, name: p.name, mascotId: p.mascotId })
      }
    })

    ch.on('presence', { event: 'leave' }, ({ leftPresences }) => {
      for (const p of leftPresences) removePlayer(p.id)
    })

    ch.subscribe((status) => {
      if (status !== 'SUBSCRIBED') return
      const s = useBoardGameStore.getState()
      if (!s.hostId) setRoom(roomId, myId)
      ch.track({ id: myId, name: myName, mascotId })
      addPlayer({ id: myId, name: myName, mascotId })
    })

    channelRef.current = ch
    return () => { ch.unsubscribe(); channelRef.current = null; resetGame() }
  }, [myId, roomId]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Step animation ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'moving' || movesLeft <= 0 || !myTurn) return
    const t = setTimeout(() => { stepPlayer(); broadcast() }, STEP_MS)
    return () => clearTimeout(t)
  }, [phase, movesLeft, myTurn]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Broadcast on phase change ──────────────────────────────────────────────
  useEffect(() => {
    if (myTurn && phase !== 'moving') broadcast()
  }, [phase, activeEvent, winner]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Actions ────────────────────────────────────────────────────────────────
  const handleRoll = () => {
    if (!myTurn || phase !== 'rolling') return
    rollDice(); broadcast()
  }

  const handleAnswer = (correct) => {
    if (!myTurn) return
    if (correct && activeEvent?.type === 'question') { addXp(50);  addCoins(200) }
    if (correct && activeEvent?.type === 'battle')   { addXp(80);  addCoins(400) }
    if (activeEvent?.type === 'reward')               { addXp(30);  addCoins(300) }
    resolveEvent(correct); broadcast()
  }

  const handleStartGame = () => {
    startGame(); broadcast()
    setShowIntro(true)
  }

  const handleReplay = () => {
    resetGame(); addPlayer({ id: myId, name: myName, mascotId }); broadcast()
  }

  const currentPlayer = players[currentTurn]

  return (
    <div className="relative h-screen w-full overflow-hidden" style={{ background: story.boardBg ?? '#050d05' }}>

      {/* ── 3D board ─────────────────────────────────────────────────── */}
      <BoardScene players={players} currentTurn={currentTurn} storyAccent={story.accentColor} />

      {/* ── Story intro cinematic ─────────────────────────────────────── */}
      {showIntro && <StoryIntro story={story} onDone={() => setShowIntro(false)} />}

      {/* ── Top bar ──────────────────────────────────────────────────── */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 rounded-2xl border border-white/10 bg-black/70 px-4 py-2 text-xs text-white backdrop-blur">
        <span className="font-semibold" style={{ color: story.accentColor }}>{story.icon} {story.title}</span>
        <span className="text-white/30">·</span>
        <span className="font-mono text-white/60">{roomId}</span>
        <span className="text-white/30">·</span>
        <span>{players.length} jugador{players.length !== 1 ? 'es' : ''}</span>
        {/* Chat button */}
        <button
          type="button"
          onClick={() => setChatOpen((o) => !o)}
          className="ml-2 rounded-lg bg-white/10 px-2 py-1 text-xs hover:bg-white/20 transition-colors"
          title="Chat"
        >
          💬
        </button>
        <button type="button" onClick={() => navigate('/rol')} className="ml-1 text-white/40 hover:text-white">✕</button>
      </div>

      {/* ── Scoreboard (top-right) ────────────────────────────────────── */}
      <div className="absolute top-16 right-3 z-10 flex flex-col gap-1.5 max-w-[180px]">
        {players.map((p, i) => (
          <div
            key={p.id}
            className={`flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs backdrop-blur transition-all ${
              i === currentTurn ? 'border-white/30 bg-white/15 scale-105' : 'border-white/10 bg-black/50'
            }`}
          >
            <span className="h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ background: p.color }} />
            <span className="font-semibold text-white max-w-[70px] truncate">{p.name}</span>
            <span className="text-amber-300 ml-auto">💰{p.coins}</span>
            <span className="text-purple-300">✨{p.xp}</span>
            {i === currentTurn && <span className="text-[10px] text-white animate-pulse">▶</span>}
          </div>
        ))}
      </div>

      {/* ── Tile legend (bottom-left) ─────────────────────────────────── */}
      <div className="absolute bottom-24 left-3 z-10 hidden sm:flex flex-col gap-1">
        {Object.entries(TILE_META).map(([type, meta]) => (
          <div key={type} className="flex items-center gap-1.5 text-[11px] text-white/50">
            <span className="h-2 w-2 rounded-sm flex-shrink-0" style={{ background: meta.color }} />
            {meta.label} {meta.name}
          </div>
        ))}
      </div>

      {/* ── Turn controls (bottom center) ────────────────────────────── */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10">
        {phase === 'lobby' && isHost && players.length >= 1 && (
          <div className="flex flex-col items-center gap-2">
            <p className="text-xs text-white/50 mb-1">
              Sala lista · código <strong className="text-white font-mono">{roomId}</strong>
            </p>
            <button
              type="button"
              onClick={handleStartGame}
              className={`rounded-2xl px-8 py-3 text-lg font-black text-white shadow-xl transition hover:scale-105 bg-gradient-to-r ${story.gradient}`}
            >
              ¡Iniciar aventura!
            </button>
          </div>
        )}

        {phase === 'lobby' && !isHost && (
          <p className="text-sm text-white/50 rounded-2xl border border-white/10 bg-black/60 px-5 py-3 backdrop-blur">
            Esperando que el anfitrión inicie la partida...
          </p>
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
              <p className="text-lg font-bold text-white">{movesLeft} casilla{movesLeft !== 1 ? 's' : ''}</p>
            </div>
          </div>
        )}
      </div>

      {/* ── Dice flash ───────────────────────────────────────────────── */}
      {diceResult && phase === 'rolling' && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none">
          <span className="text-8xl opacity-80 animate-bounce">{DICE[diceResult]}</span>
        </div>
      )}

      {/* ── Event modal ──────────────────────────────────────────────── */}
      {phase === 'event' && (
        <EventModal
          event={activeEvent}
          myTurn={myTurn}
          story={story}
          onAnswer={handleAnswer}
          onContinue={(ok) => handleAnswer(ok)}
        />
      )}

      {/* ── Game over ────────────────────────────────────────────────── */}
      {phase === 'gameover' && winner && (
        <GameOver winner={winner} story={story} onReplay={handleReplay} navigate={navigate} />
      )}

      {/* ── WorldChat ────────────────────────────────────────────────── */}
      <WorldChat
        open={chatOpen}
        onOpen={() => setChatOpen(true)}
        onClose={() => setChatOpen(false)}
        authorName={myName}
        playerId={myId}
      />
    </div>
  )
}
