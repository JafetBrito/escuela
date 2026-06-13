import { create } from 'zustand'

const CHAT_MODELS = [
  { id: 'abab6.5s-chat', label: 'MiniMax abab6.5s-chat (rápido)' },
  { id: 'abab6.5g-chat', label: 'MiniMax abab6.5g-chat (creativo)' },
  { id: 'abab6.5t-chat', label: 'MiniMax abab6.5t-chat (balanceado)' },
]

export { CHAT_MODELS }

export const useSettingsStore = create((set) => ({
  mascotName: '',
  minimaxApiKey: '',
  chatModel: CHAT_MODELS[0].id,

  setMascotName: (mascotName) => set({ mascotName }),
  setMinimaxApiKey: (minimaxApiKey) => set({ minimaxApiKey }),
  setChatModel: (chatModel) => set({ chatModel }),

  loadSettings: (settings) =>
    set({
      mascotName: settings?.mascotName ?? '',
      minimaxApiKey: settings?.minimaxApiKey ?? '',
      chatModel: settings?.chatModel ?? CHAT_MODELS[0].id,
    }),
}))
