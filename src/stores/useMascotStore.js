import { create } from 'zustand'

export const useMascotStore = create((set) => ({
  selectedMascotId: 8,
  memory: {
    conversationHistory: [],
    personalityFlags: {},
    placementTest: null,
  },

  selectMascot: (id) => set({ selectedMascotId: id }),

  appendMessage: (message) =>
    set((state) => ({
      memory: {
        ...state.memory,
        conversationHistory: [...state.memory.conversationHistory, message],
      },
    })),

  setPlacementTest: (results) =>
    set((state) => ({
      memory: { ...state.memory, placementTest: results },
    })),

  loadMemory: (memory) => set({ memory }),
}))
