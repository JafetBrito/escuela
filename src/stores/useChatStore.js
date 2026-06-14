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
  },

  // Starts a fresh conversation (e.g. when moving to a new class). The
  // previous conversation, if any, is archived into Chats history.
  startNewChat: (label) => {
    const { messages } = get()
    if (messages.length > 0) {
      useChatHistoryStore.getState().archiveSession(messages, label)
    }
    useMascotStore.getState().clearConversation()
    set({ messages: [], started: false })
  },

  loadMessages: (messages) => set({ messages, started: messages.length > 0 }),
}))
