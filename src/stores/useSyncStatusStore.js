import { create } from 'zustand'

// Tracks the last cloud-sync attempt so admin tools can show whether
// progress is actually reaching Supabase instead of failing silently.
export const useSyncStatusStore = create((set) => ({
  status: 'idle', // 'idle' | 'saving' | 'saved' | 'error'
  lastSavedAt: null,
  lastError: null,
  setSaving: () => set({ status: 'saving' }),
  setSaved: () => set({ status: 'saved', lastSavedAt: new Date().toISOString(), lastError: null }),
  setError: (message) => set({ status: 'error', lastError: message }),
}))
