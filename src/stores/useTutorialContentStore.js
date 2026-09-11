import { create } from 'zustand'
import { supabase } from '../services/supabase/client'

// Fuente de verdad de los tutoriales — mismo patrón que useCourseContentStore.js
// (tabla public.tutorials, migration_063.sql), pero sin el Proxy de
// compatibilidad de courseRegistry.js: no hay código legado que indexe
// tutoriales, así que el store se consume directo vía el hook.
export const useTutorialContentStore = create((set, get) => ({
  catalog: [],
  tutorials: {}, // { [id]: fila }
  loaded: false,
  loading: false,

  fetchAll: async () => {
    if (get().loaded || get().loading) return get().catalog
    set({ loading: true })
    const { data, error } = await supabase
      .from('tutorials')
      .select('*')
    if (error) {
      console.error('[useTutorialContentStore.fetchAll]', error)
      set({ loaded: true, loading: false })
      return []
    }
    const catalog = data ?? []
    const tutorials = Object.fromEntries(catalog.map((t) => [t.id, t]))
    set({ catalog, tutorials, loaded: true, loading: false })
    return catalog
  },

  // Usado por AdminTutorialsPage — sube el tutorial completo de una sola vez.
  saveTutorial: async (tutorial) => {
    const { data, error } = await supabase
      .from('tutorials')
      .upsert({ ...tutorial, updated_at: new Date().toISOString() }, { onConflict: 'id' })
      .select()
      .single()
    if (!error && data) {
      set((s) => ({
        tutorials: { ...s.tutorials, [data.id]: data },
        catalog: s.catalog.some((t) => t.id === data.id)
          ? s.catalog.map((t) => (t.id === data.id ? data : t))
          : [...s.catalog, data],
      }))
    }
    return { data, error }
  },
}))
