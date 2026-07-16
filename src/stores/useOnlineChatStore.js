import { create } from 'zustand'
import { supabase } from '../services/supabase/client'

// Chat global de "Clase Online" — un solo canal para todos, separado del
// resto (no tiene relación con live_classes ni con el Hub de las clases de
// práctica). Mismo patrón de Realtime que ya usa useLiveClassStore.
export const useOnlineChatStore = create((set, get) => ({
  messages: [],
  loading: false,
  _channel: null,

  connect: async () => {
    if (get()._channel) return
    set({ loading: true })
    const { data } = await supabase
      .from('online_chat_messages')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50)
    set({ messages: (data ?? []).reverse(), loading: false })

    const channel = supabase.channel('online_chat')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'online_chat_messages' },
        (payload) => set((s) => ({ messages: [...s.messages, payload.new].slice(-100) })))
      .subscribe()

    set({ _channel: channel })
  },

  disconnect: () => {
    const ch = get()._channel
    if (ch) supabase.removeChannel(ch)
    set({ _channel: null })
  },

  sendMessage: async (userId, displayName, message) => {
    if (!message.trim()) return
    await supabase.from('online_chat_messages').insert({ user_id: userId, display_name: displayName, message: message.trim() })
  },
}))
