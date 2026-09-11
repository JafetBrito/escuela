import { create } from 'zustand'
import { supabase } from '../services/supabase/client'

// Fuente de verdad de los road maps — mismo patrón que
// useTutorialContentStore.js (tabla public.roadmaps, migration_064.sql).
export const useRoadmapContentStore = create((set, get) => ({
  catalog: [],
  roadmaps: {}, // { [id]: fila }
  loaded: false,
  loading: false,

  fetchAll: async () => {
    if (get().loaded || get().loading) return get().catalog
    set({ loading: true })
    const { data, error } = await supabase
      .from('roadmaps')
      .select('*')
    if (error) {
      console.error('[useRoadmapContentStore.fetchAll]', error)
      set({ loaded: true, loading: false })
      return []
    }
    const catalog = data ?? []
    const roadmaps = Object.fromEntries(catalog.map((r) => [r.id, r]))
    set({ catalog, roadmaps, loaded: true, loading: false })
    return catalog
  },

  // Usado por AdminRoadmapsPage — sube el road map completo de una sola vez.
  saveRoadmap: async (roadmap) => {
    const { data, error } = await supabase
      .from('roadmaps')
      .upsert({ ...roadmap, updated_at: new Date().toISOString() }, { onConflict: 'id' })
      .select()
      .single()
    if (!error && data) {
      set((s) => ({
        roadmaps: { ...s.roadmaps, [data.id]: data },
        catalog: s.catalog.some((r) => r.id === data.id)
          ? s.catalog.map((r) => (r.id === data.id ? data : r))
          : [...s.catalog, data],
      }))
    }
    return { data, error }
  },
}))
