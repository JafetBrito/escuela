import { create } from 'zustand'

const MAX_MESSAGES = 50

// Local "world chat" log for the VR world. This is intentionally independent
// from the per-NPC AI chats (useNpcChatStore) — it's just a shared-looking
// text log the player can type into. `sendMessage` is for the local
// player's own messages (also broadcast to other players by
// useVrMultiplayer); `receiveMessage` appends messages that arrived from
// other players over Supabase Realtime, without re-broadcasting them.
export const useWorldChatStore = create((set) => ({
  messages: [],

  sendMessage: (author, text) => {
    const trimmed = text.trim()
    if (!trimmed) return
    set((state) => ({
      messages: [...state.messages, { id: crypto.randomUUID(), author, text: trimmed, ts: Date.now() }].slice(
        -MAX_MESSAGES,
      ),
    }))
  },

  receiveMessage: (author, text) => {
    const trimmed = text.trim()
    if (!trimmed) return
    set((state) => ({
      messages: [...state.messages, { id: crypto.randomUUID(), author, text: trimmed, ts: Date.now() }].slice(
        -MAX_MESSAGES,
      ),
    }))
  },
}))
