import { create } from 'zustand'

const MAX_MESSAGES = 50

// Local "world chat" log for the VR world. This is intentionally independent
// from the per-NPC AI chats (useNpcChatStore) — it's just a shared-looking
// text log the player can type into. `sendMessage` is for the local
// player's own messages (also broadcast to other players by
// useVrMultiplayer); `receiveMessage` appends messages that arrived from
// other players over Supabase Realtime, without re-broadcasting them.
//
// Messages can be global (everyone sees them, Habbo-style) or whispers
// (`whisperTo`/`whisperFrom` set) which are only ever added to the sender's
// and the target's own logs. `addSystemMessage` is for local-only
// WoW-style "MOTD" notices from the "Sistema" admin account.
export const useWorldChatStore = create((set) => ({
  messages: [],

  // Bridge for opening the world chat pre-filled with "/w <name> " from
  // outside the VR canvas (e.g. the "Susurrar" button in the Amigos tab of
  // MascotCompanion, which lives in a different part of the tree). VRPage
  // watches this and clears it once handled.
  whisperTarget: null,
  requestWhisper: (name) => set({ whisperTarget: name }),
  clearWhisperTarget: () => set({ whisperTarget: null }),

  sendMessage: (author, text, opts = {}) => {
    const trimmed = text.trim()
    if (!trimmed) return
    set((state) => ({
      messages: [
        ...state.messages,
        {
          id: crypto.randomUUID(),
          author,
          text: trimmed,
          ts: Date.now(),
          whisperTo: opts.whisperTo ?? null,
        },
      ].slice(-MAX_MESSAGES),
    }))
  },

  receiveMessage: (author, text, opts = {}) => {
    const trimmed = text.trim()
    if (!trimmed) return
    set((state) => ({
      messages: [
        ...state.messages,
        {
          id: crypto.randomUUID(),
          author,
          text: trimmed,
          ts: Date.now(),
          whisperFrom: opts.whisperFrom ?? null,
        },
      ].slice(-MAX_MESSAGES),
    }))
  },

  addSystemMessage: (text) => {
    set((state) => ({
      messages: [
        ...state.messages,
        { id: crypto.randomUUID(), author: 'Sistema', text, ts: Date.now(), system: true },
      ].slice(-MAX_MESSAGES),
    }))
  },
}))
