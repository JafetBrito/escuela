import { create } from 'zustand'

export function todayKey() {
  return new Date().toISOString().slice(0, 10)
}

// Archives the mascot chat by day, so past conversations can be browsed
// later in Ajustes even after the live chat moves on.
export const useChatHistoryStore = create((set) => ({
  history: {},

  saveToday: (messages) =>
    set((state) => ({
      history: { ...state.history, [todayKey()]: messages },
    })),

  loadHistory: (history) => set({ history: history ?? {} }),
}))
