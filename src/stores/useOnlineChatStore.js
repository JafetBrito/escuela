import { create } from 'zustand'
import { supabase } from '../services/supabase/client'

// Chat global de "Clase Online" — un solo canal para todos, separado del
// resto (no tiene relación con live_classes ni con el Hub de las clases de
// práctica). Mismo patrón de Realtime que ya usa useLiveClassStore.
//
// No hay backend con cron en este proyecto (todo el borrado programado que
// existe en la app pasa por acciones del cliente, ver useLiveClassStore) —
// así que los mensajes viejos se purgan de forma oportunista: cada vez que
// alguien abre el canal, de paso se borran los mensajes de más de un día.
const MAX_MESSAGE_AGE_MS = 24 * 60 * 60 * 1000

export const useOnlineChatStore = create((set, get) => ({
  messages: [],
  loading: false,
  _channel: null,

  connect: async () => {
    if (get()._channel) return
    // Marca síncrona antes de cualquier await — StrictMode invoca el efecto
    // que llama connect() dos veces seguidas en dev; sin esto, la segunda
    // llamada no ve todavía el canal (se crea después del await) y ambas
    // terminan suscribiéndose al mismo canal 'online_chat', lo que Supabase
    // rechaza ("cannot add postgres_changes callbacks... after subscribe()").
    set({ _channel: 'pending' })
    set({ loading: true })
    const cutoff = new Date(Date.now() - MAX_MESSAGE_AGE_MS).toISOString()
    await supabase.from('online_chat_messages').delete().lt('created_at', cutoff)
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
    // Si connect() sigue en su tramo async (StrictMode desmonta y vuelve a
    // montar antes de que termine), no lo interrumpas ni limpies el
    // centinela — si lo hicieras, el guard de arriba se reabriría y la
    // segunda llamada a connect() volvería a crear el mismo canal. Cuando
    // termine de verdad, esta misma función se volverá a llamar en el
    // desmontaje real y sí limpiará el canal ya creado.
    if (ch === 'pending') return
    if (ch) supabase.removeChannel(ch)
    set({ _channel: null })
  },

  sendMessage: async (userId, displayName, message) => {
    if (!message.trim()) return
    await supabase.from('online_chat_messages').insert({ user_id: userId, display_name: displayName, message: message.trim() })
  },
}))
