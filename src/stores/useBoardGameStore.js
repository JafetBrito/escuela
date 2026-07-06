import { create } from 'zustand'
import { TILE_COUNT, TILES } from '../data/boardTiles'
import { pickStoryQuestion, pickStoryBattle } from '../data/rolStoriesRegistry'

const INITIAL = {
  roomId: null,
  hostId: null,
  storyId: 'senda-programador',
  players: [],          // [{ id, name, color, mascotId, tile, coins, xp, skippedTurns }]
  currentTurn: 0,
  phase: 'lobby',       // lobby | rolling | moving | event | gameover
  diceResult: null,
  movesLeft: 0,
  activeEvent: null,    // { type, question? }
  winner: null,
}

const WIN_COINS = 2000
const WIN_XP    = 500

export const PLAYER_COLORS      = ['#ef4444', '#3b82f6', '#22c55e', '#f59e0b']
export const PLAYER_COLOR_NAMES = ['Rojo', 'Azul', 'Verde', 'Amarillo']

export const useBoardGameStore = create((set, get) => ({
  ...INITIAL,

  setRoom: (roomId, hostId) => set({ roomId, hostId }),
  setStory: (storyId)       => set({ storyId }),

  addPlayer: (player) => set((s) => {
    if (s.players.find((p) => p.id === player.id)) return {}
    const colorIdx = s.players.length % PLAYER_COLORS.length
    return {
      players: [...s.players, {
        id: player.id,
        name: player.name,
        mascotId: player.mascotId ?? 8,
        color: PLAYER_COLORS[colorIdx],
        colorName: PLAYER_COLOR_NAMES[colorIdx],
        tile: 0,
        coins: 100,
        xp: 0,
        skippedTurns: 0,
      }],
    }
  }),

  removePlayer: (id) => set((s) => ({ players: s.players.filter((p) => p.id !== id) })),

  startGame: () => set({ phase: 'rolling', currentTurn: 0 }),

  rollDice: () => {
    const result = Math.floor(Math.random() * 6) + 1
    set({ diceResult: result, phase: 'moving', movesLeft: result })
    return result
  },

  stepPlayer: () => {
    const { players, currentTurn, movesLeft, storyId } = get()
    if (movesLeft <= 0) return

    const player  = players[currentTurn]
    const newTile = (player.tile + 1) % TILE_COUNT
    const updated = players.map((p, i) => i === currentTurn ? { ...p, tile: newTile } : p)
    const remaining = movesLeft - 1

    if (remaining === 0) {
      const tile = TILES[newTile]
      let activeEvent = { type: tile.type }
      if (tile.type === 'question') activeEvent.question = pickStoryQuestion(storyId)
      if (tile.type === 'battle')   activeEvent.question = pickStoryBattle(storyId)
      set({ players: updated, movesLeft: 0, phase: 'event', activeEvent })
    } else {
      set({ players: updated, movesLeft: remaining })
    }
  },

  resolveEvent: (success) => {
    const { players, currentTurn, activeEvent } = get()
    const tile = TILES[players[currentTurn].tile]
    let coinDelta = 0, xpDelta = 0

    if (tile.type === 'question') { if (success) { coinDelta = 200; xpDelta = 50 } }
    else if (tile.type === 'battle') { if (success) { coinDelta = 400; xpDelta = 80 } else coinDelta = -100 }
    else if (tile.type === 'reward') { coinDelta = 300; xpDelta = 30 }
    else if (tile.type === 'trap')   { coinDelta = -150 }

    const updated = players.map((p, i) => {
      if (i !== currentTurn) return p
      return { ...p, coins: Math.max(0, p.coins + coinDelta), xp: p.xp + xpDelta }
    })

    const current = updated[currentTurn]
    if (current.coins >= WIN_COINS || current.xp >= WIN_XP) {
      set({ players: updated, phase: 'gameover', winner: current, activeEvent: null })
      return
    }

    const nextTurn = (currentTurn + 1) % players.length
    set({ players: updated, activeEvent: null, diceResult: null, phase: 'rolling', currentTurn: nextTurn })
  },

  skipTurn: () => {
    const { players, currentTurn } = get()
    set({ currentTurn: (currentTurn + 1) % players.length, phase: 'rolling', diceResult: null, activeEvent: null, movesLeft: 0 })
  },

  syncFromBroadcast: (state) => set(state),
  resetGame: () => set({ ...INITIAL }),
}))
