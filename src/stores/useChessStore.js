import { create } from 'zustand'
import { Chess } from 'chess.js'
import { supabase } from '../services/supabase/client'
import { randomStartFen } from '../utils/chess960'

const STANDARD_START = new Chess().fen()

// Ajedrez en línea: invitar por username (búsqueda vía la función
// search_profiles, ver migration_016.sql — nunca se lee la tabla profiles
// directo para esto), aceptar arma la partida con colores al azar, y un
// único canal de Realtime por partida sincroniza el tablero entre los dos
// navegadores — mismo patrón que useLiveClassStore.openClass.
export const useChessStore = create((set, get) => ({
  searchResults: [],
  searching: false,
  invitesIn: [],
  invitesOut: [],
  myGames: [],
  activeGame: null,
  _channel: null,

  searchProfiles: async (query) => {
    if (!query.trim()) { set({ searchResults: [] }); return }
    set({ searching: true })
    const { data } = await supabase.rpc('search_profiles', { query: query.trim() })
    set({ searchResults: data ?? [], searching: false })
  },

  fetchInvites: async (myId) => {
    const [{ data: inData }, { data: outData }] = await Promise.all([
      supabase.from('chess_invites').select('*').eq('to_id', myId).eq('status', 'pendiente').order('created_at', { ascending: false }),
      supabase.from('chess_invites').select('*').eq('from_id', myId).eq('status', 'pendiente').order('created_at', { ascending: false }),
    ])
    set({ invitesIn: inData ?? [], invitesOut: outData ?? [] })
  },

  fetchMyGames: async (myId) => {
    const { data } = await supabase
      .from('chess_games')
      .select('*')
      .eq('status', 'en_curso')
      .or(`white_id.eq.${myId},black_id.eq.${myId}`)
      .order('updated_at', { ascending: false })
    set({ myGames: data ?? [] })
  },

  sendInvite: async (fromId, fromName, toId, toName, variant, clockMinutes) => {
    const { data, error } = await supabase.from('chess_invites').insert({
      from_id: fromId, from_name: fromName, to_id: toId, to_name: toName,
      variant, clock_minutes: clockMinutes,
    }).select().single()
    if (!error) {
      set((s) => ({ invitesOut: [data, ...s.invitesOut] }))
      const { error: notifError } = await supabase.from('student_notifications').insert({
        student_id: toId,
        chess_invite_id: data.id,
        title: '♟️ Te invitó a jugar ajedrez',
        body: fromName,
      })
      if (notifError) console.error('[useChessStore.sendInvite] notificación no se pudo crear', notifError)
    }
    return { data, error }
  },

  cancelInvite: async (inviteId) => {
    await supabase.from('chess_invites').update({ status: 'cancelada' }).eq('id', inviteId)
    set((s) => ({ invitesOut: s.invitesOut.filter((i) => i.id !== inviteId) }))
  },

  respondInvite: async (invite, accept) => {
    if (!accept) {
      await supabase.from('chess_invites').update({ status: 'rechazada' }).eq('id', invite.id)
      set((s) => ({ invitesIn: s.invitesIn.filter((i) => i.id !== invite.id) }))
      return { error: null }
    }

    const startFen = invite.variant === 'random' ? randomStartFen() : STANDARD_START
    const fromIsWhite = Math.random() < 0.5
    const whiteId = fromIsWhite ? invite.from_id : invite.to_id
    const whiteName = fromIsWhite ? invite.from_name : invite.to_name
    const blackId = fromIsWhite ? invite.to_id : invite.from_id
    const blackName = fromIsWhite ? invite.to_name : invite.from_name
    const ms = invite.clock_minutes > 0 ? invite.clock_minutes * 60_000 : 0

    const { data: game, error } = await supabase.from('chess_games').insert({
      white_id: whiteId, white_name: whiteName,
      black_id: blackId, black_name: blackName,
      variant: invite.variant, fen: startFen, clock_minutes: invite.clock_minutes,
      white_ms: ms, black_ms: ms,
    }).select().single()
    if (!error) {
      await supabase.from('chess_invites').update({ status: 'aceptada', game_id: game.id }).eq('id', invite.id)
      set((s) => ({ invitesIn: s.invitesIn.filter((i) => i.id !== invite.id), myGames: [game, ...s.myGames] }))
      const { error: notifError } = await supabase.from('student_notifications').insert({
        student_id: invite.from_id,
        chess_invite_id: invite.id,
        title: '♟️ Aceptó tu invitación',
        body: invite.to_name,
      })
      if (notifError) console.error('[useChessStore.respondInvite] notificación no se pudo crear', notifError)
    }
    return { data: game, error }
  },

  openGame: (gameId) => {
    get().closeGame()
    supabase.from('chess_games').select('*').eq('id', gameId).single()
      .then(({ data }) => set({ activeGame: data ?? null }))

    const channel = supabase.channel(`chess_game:${gameId}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'chess_games', filter: `id=eq.${gameId}` },
        (payload) => set({ activeGame: payload.new }))
      .subscribe()
    set({ _channel: channel })
  },

  closeGame: () => {
    const ch = get()._channel
    if (ch) supabase.removeChannel(ch)
    set({ activeGame: null, _channel: null })
  },

  makeMove: async (gameId, patch) => {
    const { error } = await supabase.from('chess_games').update({ ...patch, updated_at: new Date().toISOString() }).eq('id', gameId)
    if (!error) set((s) => ({ activeGame: s.activeGame ? { ...s.activeGame, ...patch } : s.activeGame }))
    return { error }
  },

  resign: async (gameId, resigningColor) => {
    const result = resigningColor === 'w' ? 'black' : 'white'
    return get().makeMove(gameId, { status: 'finalizada', result, end_reason: 'resign' })
  },

  // Guardado con `.eq('status','en_curso')` — si ambos clientes detectan el
  // timeout casi al mismo tiempo, el segundo update simplemente no afecta
  // ninguna fila (ya no está 'en_curso'), sin duplicar ni pisar el resultado.
  claimTimeout: async (gameId, loserColor) => {
    const result = loserColor === 'w' ? 'black' : 'white'
    const { error } = await supabase.from('chess_games')
      .update({ status: 'finalizada', result, end_reason: 'timeout', updated_at: new Date().toISOString() })
      .eq('id', gameId).eq('status', 'en_curso')
    return { error }
  },
}))
