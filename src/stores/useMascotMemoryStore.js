import { create } from 'zustand'
import { supabase, isSupabaseConfigured } from '../services/supabase/client'
import { useAuthStore } from './useAuthStore'

// Curated long-term facts the student explicitly asks the mascot to
// remember (see mascot_memories in schema.sql) — distinct from the raw
// per-day chat transcripts in useChatHistoryStore. Same owner-only RLS
// pattern as ai_credentials. Surfaced in transports.js's system prompt as
// "# Memoria a largo plazo".
export const useMascotMemoryStore = create((set, get) => ({
  memories: [], // [{ id, content, createdAt }]
  loaded: false,

  async loadMemories() {
    if (!isSupabaseConfigured() || !useAuthStore.getState().user) {
      set({ loaded: true })
      return
    }
    const { data, error } = await supabase
      .from('mascot_memories')
      .select('id, content, created_at')
      .order('created_at', { ascending: true })
    if (error) {
      console.error('[useMascotMemoryStore] load failed:', error)
      set({ loaded: true })
      return
    }
    set({ memories: data.map((r) => ({ id: r.id, content: r.content, createdAt: r.created_at })), loaded: true })
  },

  async addMemory(content) {
    const trimmed = content.trim()
    if (!trimmed) return
    const user = useAuthStore.getState().user
    if (!isSupabaseConfigured() || !user) {
      set((s) => ({ memories: [...s.memories, { id: `local-${Date.now()}`, content: trimmed, createdAt: new Date().toISOString() }] }))
      return
    }
    const { data, error } = await supabase
      .from('mascot_memories')
      .insert({ user_id: user.id, content: trimmed })
      .select('id, content, created_at')
      .single()
    if (error) throw error
    set((s) => ({ memories: [...s.memories, { id: data.id, content: data.content, createdAt: data.created_at }] }))
  },

  async removeMemory(id) {
    set((s) => ({ memories: s.memories.filter((m) => m.id !== id) }))
    if (!id.startsWith('local-') && isSupabaseConfigured()) {
      const { error } = await supabase.from('mascot_memories').delete().eq('id', id)
      if (error) console.error('[useMascotMemoryStore] delete failed:', error)
    }
  },
}))
