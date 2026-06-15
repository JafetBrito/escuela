import { create } from 'zustand'

const MAX_MESSAGES = 50

// Local "world chat" log for the VR world. This is intentionally independent
// from the per-NPC AI chats (useNpcChatStore) — it's just a shared-looking
// text log the player can type into. Multiplayer (syncing messages between
// real users over Supabase Realtime) is a separate future phase; for now
// every message is local-only ("tú" as the author).
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
}))
