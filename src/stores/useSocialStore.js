import { create } from 'zustand'
import { supabase } from '../services/supabase/client'
import { useCurrencyStore } from './useCurrencyStore'

// Amistades reales entre cuentas (reemplaza la lista de nombres de
// useFriendsStore): solicitudes que se aceptan, regalos y invitaciones que
// también se aceptan, todo por funciones de la base (migration_074) que además
// crean la notificación de la campanita. Las notificaciones accionables se
// resuelven aquí mismo (respond*), tanto desde /amigos como desde la campanita.
const call = async (fn, args) => {
  if (!supabase) return { ok: false, message: 'Sin conexión.' }
  const { data, error } = await supabase.rpc(fn, args)
  if (error) return { ok: false, message: error.message?.includes('function') ? '¿Ya corriste migration_074.sql?' : 'No se pudo completar. Intenta de nuevo.' }
  return data ?? { ok: true }
}

// "Nombre#1234" → { name, tag } (el nombre puede llevar espacios)
export function parseTagged(text) {
  const m = (text ?? '').trim().match(/^(.+)#(\d{4})$/)
  return m ? { name: m[1].trim(), tag: m[2] } : null
}

export const useSocialStore = create((set, get) => ({
  friends: [], incoming: [], outgoing: [], challenges: [],
  loaded: false,

  load: async () => {
    if (!supabase) return
    const { data } = await supabase.rpc('friends_overview')
    if (data) set({ friends: data.friends, incoming: data.incoming, outgoing: data.outgoing, challenges: data.challenges, loaded: true })
  },

  sendRequest: async (text) => {
    const parsed = parseTagged(text)
    if (!parsed) return { ok: false, message: 'Escríbelo como Nombre#1234 (con su etiqueta de 4 números).' }
    const r = await call('friend_request_send', { p_name: parsed.name, p_tag: parsed.tag })
    get().load()
    return r
  },

  respondRequest: async (id, accept) => { const r = await call('friend_request_respond', { p_id: id, p_accept: accept }); get().load(); return r },

  removeFriend: async (otherId) => { await supabase.rpc('friend_remove', { p_other: otherId }); get().load() },

  sendGift: (friendId) => call('gift_send', { p_friend: friendId }),

  // Al aceptar, las monedas se suman en ESTE cliente (así el autoguardado del progreso no las pisa).
  respondGift: async (id, accept) => {
    const r = await call('gift_respond', { p_id: id, p_accept: accept })
    if (r.ok && r.amount > 0) useCurrencyStore.getState().earnCoins(Number(r.amount))
    return r
  },

  sendInvite: (friendId, kind, title, payload = {}) => call('invite_send', { p_friend: friendId, p_kind: kind, p_title: title, p_payload: payload }),

  respondInvite: async (id, accept) => { const r = await call('invite_respond', { p_id: id, p_accept: accept }); get().load(); return r },

  completeInvite: async (id) => { const r = await call('invite_complete', { p_id: id }); get().load(); return r },
}))
