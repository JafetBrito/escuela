import { create } from 'zustand'

// Referencia estable para selectores tipo `s.done[roadmapId] ?? EMPTY_ARRAY`
// — un `?? []` inline crea un array nuevo en cada render, y
// useSyncExternalStore (por dentro de Zustand) lo interpreta como "el store
// cambió" en cada lectura, lo que dispara un loop infinito (React error
// #185). Mismo fix ya usado en useProgressStore.js.
export const EMPTY_ARRAY = []

// Qué nodos de qué road map ha marcado como aprendidos el alumno — un flag
// "de visto" más, mismo criterio que useSeenStore.js: vive en el snapshot
// unificado de profiles (ver progressSnapshot.js/autoSave.js), no en una
// tabla propia. Sin bloqueo/orden estricto (ver migration_064.sql) — un
// nodo se marca/desmarca libremente.
export const useRoadmapProgressStore = create((set) => ({
  done: {}, // { [roadmapId]: [nodeId, ...] }

  toggleNodeDone: (roadmapId, nodeId) => set((s) => {
    const current = s.done[roadmapId] ?? []
    const next = current.includes(nodeId)
      ? current.filter((id) => id !== nodeId)
      : [...current, nodeId]
    return { done: { ...s.done, [roadmapId]: next } }
  }),

  loadRoadmapProgress: (data) => set({ done: data ?? {} }),
}))
