import { create } from 'zustand'

export const useMascotStore = create((set) => ({
  selectedMascotId: 8,
  selectedSkinId: 'default',
  memory: {
    conversationHistory: [],
    personalityFlags: {},
    placementTest: null,
  },

  selectMascot: (id) => set({ selectedMascotId: id }),
  selectSkin: (id) => set({ selectedSkinId: id }),

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

  loadSkin: (selectedSkinId) => set({ selectedSkinId: selectedSkinId ?? 'default' }),
}))
