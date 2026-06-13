import { create } from 'zustand'

// Screenshots captured with the "Cámara" objeto. Each shot can be labeled by
// the user and is shown in the mascot's Galería tab.
export const useGalleryStore = create((set) => ({
  shots: [],

  addShot: (shot) =>
    set((state) => ({
      shots: [
        { id: crypto.randomUUID(), createdAt: new Date().toISOString(), label: '', ...shot },
        ...state.shots,
      ],
    })),

  updateShotLabel: (id, label) =>
    set((state) => ({
      shots: state.shots.map((s) => (s.id === id ? { ...s, label } : s)),
    })),

  removeShot: (id) => set((state) => ({ shots: state.shots.filter((s) => s.id !== id) })),

  loadShots: (shots) => set({ shots: shots ?? [] }),
}))
