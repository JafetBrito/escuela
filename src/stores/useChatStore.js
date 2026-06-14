import { create } from 'zustand'
import { getTransport } from '../services/chat/transports'
import { useMascotStore } from './useMascotStore'
import { useChatHistoryStore } from './useChatHistoryStore'

export const useChatStore = create((set, get) => ({
  messages: [],
  mode: 'text',
  isSending: false,
  started: false,

  send: async (content, context = {}) => {
    const userMessage = { role: 'user', content }
    const wasStarted = get().started
    const history = wasStarted ? get().messages : []

    set((state) => ({
      messages: wasStarted ? [...state.messages, userMessage] : [userMessage],
      isSending: true,
      started: true,
    }))
    useMascotStore.getState().appendMessage(userMessage)

    const transport = getTransport(get().mode)
    try {
      const reply = await transport.sendMessage({
        mode: get().mode,
        content,
        context: { ...context, history },
      })
      set((state) => ({ messages: [...state.messages, reply], isSending: false }))
      useMascotStore.getState().appendMessage(reply)
    } catch {
      const fallback = { role: 'assistant', content: 'No pude responder ahora mismo.' }
      set((state) => ({
        messages: [...state.messages, fallback],
        isSending: false,
      }))
    }
    useChatHistoryStore.getState().saveToday(get().messages)
  },

  loadMessages: (messages) => set({ messages, started: messages.length > 0 }),
}))
