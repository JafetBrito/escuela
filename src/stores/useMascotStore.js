import { create } from 'zustand'

export const useMascotStore = create((set) => ({
  selectedMascotId: 8,
  selectedSkinId: 'default',
  // Mascot models the user can choose from in "Aspecto". The rest live in
  // la Tienda until purchased.
  unlockedMascots: [8],
  memory: {
    conversationHistory: [],
    personalityFlags: {},
    placementTest: null,
    studyPlans: {},
  },

  selectMascot: (id) => set({ selectedMascotId: id }),
  selectSkin: (id) => set({ selectedSkinId: id }),

  unlockMascot: (id) =>
    set((state) =>
      state.unlockedMascots.includes(id)
        ? state
        : { unlockedMascots: [...state.unlockedMascots, id] },
    ),

  loadUnlockedMascots: (unlockedMascots) =>
    set({ unlockedMascots: unlockedMascots?.length ? unlockedMascots : [8] }),

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

  // Saves the AI-generated study plan for a course so the welcome flow never
  // has to generate (or show) it again once completed.
  setStudyPlan: (courseId, plan) =>
    set((state) => ({
      memory: {
        ...state.memory,
        studyPlans: { ...state.memory.studyPlans, [courseId]: plan },
      },
    })),

  // Clears the live conversation transcript — used when starting a fresh
  // chat for a new class, while the previous one stays in Chats history.
  clearConversation: () =>
    set((state) => ({
      memory: { ...state.memory, conversationHistory: [] },
    })),

  loadMemory: (memory) =>
    set({
      memory: {
        conversationHistory: [],
        personalityFlags: {},
        placementTest: null,
        studyPlans: {},
        ...memory,
      },
    }),

  loadSkin: (selectedSkinId) => set({ selectedSkinId: selectedSkinId ?? 'default' }),
}))
