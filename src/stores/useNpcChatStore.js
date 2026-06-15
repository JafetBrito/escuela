import { create } from 'zustand'
import { sendNpcMessage } from '../services/chat/npcTransport'

// Per-NPC chat history for the in-character assistants (Zafir en la
// Tienda, el Maestro de Misiones). Kept separate from the mascot's own
// chat/memory — these are short-lived, in-character conversations.
export const useNpcChatStore = create((set, get) => ({
  messagesByNpc: {},
  sendingByNpc: {},

  send: async (npcId, npcPrompt, content) => {
    const history = get().messagesByNpc[npcId] ?? []
    const userMessage = { role: 'user', content }

    set((state) => ({
      messagesByNpc: { ...state.messagesByNpc, [npcId]: [...history, userMessage] },
      sendingByNpc: { ...state.sendingByNpc, [npcId]: true },
    }))

    try {
      const reply = await sendNpcMessage({ npcPrompt, content, history })
      set((state) => ({
        messagesByNpc: {
          ...state.messagesByNpc,
          [npcId]: [...state.messagesByNpc[npcId], { role: 'assistant', content: reply }],
        },
        sendingByNpc: { ...state.sendingByNpc, [npcId]: false },
      }))
    } catch {
      set((state) => ({
        messagesByNpc: {
          ...state.messagesByNpc,
          [npcId]: [
            ...state.messagesByNpc[npcId],
            { role: 'assistant', content: 'No pude responder ahora mismo.' },
          ],
        },
        sendingByNpc: { ...state.sendingByNpc, [npcId]: false },
      }))
    }
  },
}))
