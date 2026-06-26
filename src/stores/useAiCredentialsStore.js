import { create } from 'zustand'
import { supabase, isSupabaseConfigured } from '../services/supabase/client'
import { useAuthStore } from './useAuthStore'

// Credentials live in the `ai_credentials` table (see schema.sql), NOT in
// the shared `profiles.snapshot` blob — that table has no admin-read
// policy, so not even an admin can see another user's key. `connections`
// here only ever holds the non-secret columns (id/providerId/baseUrl/model/
// label); the real api_key is fetched fresh, one row at a time, only at the
// moment a chat call is about to fire (see getApiKeyForCall).
//
// Without Supabase configured (offline/demo mode) there's no shared DB to
// leak from, so credentials just live in-memory for the session — same
// trust model as everything else in that mode.
export const useAiCredentialsStore = create((set, get) => ({
  connections: [], // [{ id, providerId, label, baseUrl, model }]
  loaded: false,
  localKeys: {}, // offline-mode fallback only: { [connectionId]: apiKey }

  async loadConnections() {
    if (!isSupabaseConfigured() || !useAuthStore.getState().user) {
      set({ loaded: true })
      return
    }
    const { data, error } = await supabase
      .from('ai_credentials')
      .select('id, provider_id, label, base_url, model')
      .order('created_at', { ascending: true })
    if (error) {
      console.error('[useAiCredentialsStore] load failed:', error)
      set({ loaded: true })
      return
    }
    set({
      connections: data.map((row) => ({
        id: row.id, providerId: row.provider_id, label: row.label,
        baseUrl: row.base_url, model: row.model,
      })),
      loaded: true,
    })
  },

  // Upserts a connection. Returns the connection id.
  async saveCredential({ id, providerId, apiKey, baseUrl, model, label }) {
    const user = useAuthStore.getState().user
    if (!isSupabaseConfigured() || !user) {
      const localId = id ?? `local-${providerId}-${Date.now()}`
      set((s) => ({
        connections: [
          ...s.connections.filter((c) => c.id !== localId),
          { id: localId, providerId, label, baseUrl, model },
        ],
        localKeys: { ...s.localKeys, [localId]: apiKey },
      }))
      return localId
    }

    const row = {
      ...(id ? { id } : {}),
      user_id: user.id,
      provider_id: providerId,
      api_key: apiKey,
      base_url: baseUrl || null,
      model: model || null,
      label: label || null,
      updated_at: new Date().toISOString(),
    }
    const { data, error } = await supabase.from('ai_credentials').upsert(row).select('id').single()
    if (error) throw error
    await get().loadConnections()
    return data.id
  },

  async removeCredential(id) {
    if (id.startsWith('local-')) {
      set((s) => {
        const { [id]: _omit, ...rest } = s.localKeys
        return { connections: s.connections.filter((c) => c.id !== id), localKeys: rest }
      })
      return
    }
    const { error } = await supabase.from('ai_credentials').delete().eq('id', id)
    if (error) throw error
    set((s) => ({ connections: s.connections.filter((c) => c.id !== id) }))
  },

  // Only place in the app that ever holds a raw key in memory — fetched
  // just-in-time, right before the fetch() call to the AI provider, and not
  // stored back into any persisted state.
  async getApiKeyForCall(id) {
    if (id?.startsWith('local-')) return get().localKeys[id] ?? null
    if (!isSupabaseConfigured() || !id) return null
    const { data, error } = await supabase.from('ai_credentials').select('api_key').eq('id', id).single()
    if (error) {
      console.error('[useAiCredentialsStore] key fetch failed:', error)
      return null
    }
    return data?.api_key ?? null
  },

  // For single-instance integrations like Notion, where there's at most one
  // saved connection per provider so callers don't need to track an id.
  async getApiKeyForProvider(providerId) {
    const conn = get().connections.find((c) => c.providerId === providerId)
    if (!conn) return null
    return get().getApiKeyForCall(conn.id)
  },
}))
