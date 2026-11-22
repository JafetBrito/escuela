import { supabase, isSupabaseConfigured } from '../../services/supabase/client'

// Carrera en línea sobre Supabase Realtime (sin tablas): un canal por sala `racing:<código>`.
// - Presencia: quién está en la sala (nombre, color, piloto). El anfitrión es el que entró primero.
// - Broadcast `start`: el anfitrión manda semilla, mundo y nivel; todos arrancan con las MISMAS 12 preguntas.
// - Broadcast `state`: cada jugador manda ~8 veces por segundo su posición (s, u, vehículo, si terminó); los demás lo dibujan suavizado.
export const netAvailable = () => isSupabaseConfigured()
export const newCode = () => Array.from({ length: 4 }, () => 'ABCDEFGHJKLMNPQRSTUVWXYZ'[Math.floor(Math.random() * 24)]).join('')

// me = { id, name, color, char }; handlers = { onPlayers(list), onStart(msg), onState(msg) }
export function joinRoom(code, me, handlers) {
  const ch = supabase.channel(`racing:${code}`, { config: { presence: { key: me.id }, broadcast: { self: false } } })
  ch.on('presence', { event: 'sync' }, () => {
    const list = Object.entries(ch.presenceState()).map(([id, p]) => ({ id, ...p[0] }))
    list.sort((a, b) => (a.at - b.at) || (a.id < b.id ? -1 : 1))
    handlers.onPlayers(list)
  })
  ch.on('broadcast', { event: 'start' }, ({ payload }) => handlers.onStart(payload))
  ch.on('broadcast', { event: 'state' }, ({ payload }) => handlers.onState(payload))
  ch.subscribe((status) => { if (status === 'SUBSCRIBED') ch.track({ name: me.name, color: me.color, char: me.char, at: Date.now() }) })
  return {
    sendStart: (msg) => ch.send({ type: 'broadcast', event: 'start', payload: msg }),
    sendState: (msg) => ch.send({ type: 'broadcast', event: 'state', payload: msg }),
    leave: () => supabase.removeChannel(ch),
  }
}

// Aplica un mensaje `state` recibido al rival correspondiente del motor (el que tiene ese id)
export function applyState(game, msg) {
  const r = game.rivals.find((x) => x.id === msg.id)
  if (!r) return
  r.s = msg.s; r.u = msg.u; r.tier = msg.tier; r.finished = !!msg.fin; if (msg.fin && r.finishT == null) r.finishT = msg.t ?? game.time
}
