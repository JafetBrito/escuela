import { create } from 'zustand'
import { supabase } from '../services/supabase/client'

export const usePodcastsStore = create((set, get) => ({
  podcasts: [],
  loading: false,

  fetchPodcasts: async () => {
    set({ loading: true })
    const { data } = await supabase.from('podcasts').select('*').order('position').order('created_at')
    set({ podcasts: data ?? [], loading: false })
    return data ?? []
  },

  addPodcast: async ({ title, description, youtubeId, createdBy }) => {
    const position = get().podcasts.length
    const { data, error } = await supabase
      .from('podcasts')
      .insert({ title, description: description || null, youtube_id: youtubeId, position, created_by: createdBy })
      .select()
      .single()
    if (!error) set((s) => ({ podcasts: [...s.podcasts, data] }))
    return { data, error }
  },

  deletePodcast: async (id) => {
    const { error } = await supabase.from('podcasts').delete().eq('id', id)
    if (!error) set((s) => ({ podcasts: s.podcasts.filter((p) => p.id !== id) }))
    return { error }
  },
}))
