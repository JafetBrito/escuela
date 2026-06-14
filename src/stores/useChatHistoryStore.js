import { create } from 'zustand'

export function todayKey() {
  return new Date().toISOString().slice(0, 10)
}

// history: { [dateKey]: { label, messages, archivedAt }[] }
// Each "class" gets its own archived session when the chat resets, so
// previous conversations stay browsable in the Chats page grouped by day.
export const useChatHistoryStore = create((set) => ({
  history: {},

  archiveSession: (messages, label) =>
    set((state) => {
      if (!messages?.length) return {}
      const key = todayKey()
      const sessions = state.history[key] ?? []
      return {
        history: {
          ...state.history,
          [key]: [
            ...sessions,
            { label: label || 'Conversación', messages, archivedAt: new Date().toISOString() },
          ],
        },
      }
    }),

  loadHistory: (history) => set({ history: history ?? {} }),
}))
