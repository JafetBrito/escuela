import { create } from 'zustand'
import { getTransport } from '../services/chat/transports'
import { useMascotStore } from './useMascotStore'

// Pre-populated example conversation so new users see how the mascot chat
// works before they send their first message.
const EXAMPLE_MESSAGES = [
  {
    role: 'assistant',
    content:
      '¡Hola! Soy tu compañero de aprendizaje para este curso de NotebookLM. Puedo explicarte cualquier clase, ayudarte con los retos y guardar tus notas y links en tu inventario. ¿En qué te ayudo?',
  },
  {
    role: 'user',
    content: '¿Qué es Audio Overview?',
  },
  {
    role: 'assistant',
    content:
      'Es una función de NotebookLM que convierte tus fuentes en una conversación tipo podcast entre dos voces, generada automáticamente a partir de tus documentos. Lo vemos a fondo en el módulo "Audio Overview: tu propio podcast".',
  },
]

export const useChatStore = create((set, get) => ({
  messages: EXAMPLE_MESSAGES,
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

  loadMessages: (messages) => set({ messages, started: messages.length > 0 }),
}))
