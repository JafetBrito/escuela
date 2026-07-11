import { create } from 'zustand'
import { supabase } from '../services/supabase/client'
import { buildAnnouncement } from '../data/buildInfo'

export const useAnnouncementsStore = create((set) => ({
  announcements: [],
  loading: false,

  fetch: async () => {
    set({ loading: true })
    const { data } = await supabase
      .from('school_announcements')
      .select('*')
      .order('pinned', { ascending: false })
      .order('created_at', { ascending: false })
    // The current build (from the latest git commit) is always the top entry,
    // auto-generated — no manual publishing needed. See buildInfo.js.
    const build = buildAnnouncement()
    set({ announcements: build ? [build, ...(data ?? [])] : (data ?? []), loading: false })
  },

  create: async (payload) => {
    const { data, error } = await supabase
      .from('school_announcements')
      .insert(payload)
      .select()
      .single()
    if (!error) set((s) => ({ announcements: [data, ...s.announcements] }))
    return { data, error }
  },

  delete: async (id) => {
    const { error } = await supabase.from('school_announcements').delete().eq('id', id)
    if (!error) set((s) => ({ announcements: s.announcements.filter((a) => a.id !== id) }))
    return { error }
  },

  togglePin: async (id, pinned) => {
    const { error } = await supabase.from('school_announcements').update({ pinned }).eq('id', id)
    if (!error)
      set((s) => ({
        announcements: s.announcements
          .map((a) => (a.id === id ? { ...a, pinned } : a))
          .sort((a, b) => b.pinned - a.pinned || new Date(b.created_at) - new Date(a.created_at)),
      }))
    return { error }
  },
}))
