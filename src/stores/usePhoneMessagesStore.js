import { create } from 'zustand'
import { supabase } from '../services/supabase/client'

// Mensajes del teléfono "4 Pared" (mundo VR) — mismo patrón de búsqueda por
// username que ajedrez/trivia/hospital (search_profiles, ver
// migration_016.sql), pero sin invitación/estado: un mensaje se manda y ya.
export const usePhoneMessagesStore = create((set) => ({
  searchResults: [],
  searching: false,
  messages: [],

  searchProfiles: async (query) => {
    if (!query.trim()) { set({ searchResults: [] }); return }
    set({ searching: true })
    const { data } = await supabase.rpc('search_profiles', { query: query.trim() })
    set({ searchResults: data ?? [], searching: false })
  },

  fetchMessages: async (myId) => {
    const { data } = await supabase
      .from('phone_messages')
      .select('*')
      .or(`from_id.eq.${myId},to_id.eq.${myId}`)
      .order('created_at', { ascending: false })
      .limit(50)
    set({ messages: data ?? [] })
  },

  sendMessage: async (fromId, fromName, toId, toName, body) => {
    const { data, error } = await supabase
      .from('phone_messages')
      .insert({ from_id: fromId, from_name: fromName, to_id: toId, to_name: toName, body })
      .select()
      .single()
    if (error) return { error }

    set((s) => ({ messages: [data, ...s.messages] }))

    const { error: notifError } = await supabase.from('student_notifications').insert({
      student_id: toId,
      phone_message_id: data.id,
      title: '📱 Nuevo mensaje',
      body: `${fromName}: ${body}`,
    })
    if (notifError) console.error('[usePhoneMessagesStore.sendMessage] notificación no se pudo crear', notifError)

    return { data }
  },
}))
