import { create } from 'zustand'
import { supabase, isSupabaseConfigured } from '../services/supabase/client'
import { validateLicense } from '../services/crypto/keyCrypto'
import { applyProgressSnapshot } from '../services/persistence/progressSnapshot'
import { loadLocalSnapshot } from '../services/persistence/localStore'

// Three user roles:
//  - 'admin'            -> profile.role === 'admin', access to everything
//  - alumno sin llave   -> logged in, profile.license is empty
//  - alumno con llave   -> profile.license has { type: 'single' | 'full', courseId, ... }
//
// When Supabase isn't configured (no VITE_SUPABASE_URL/ANON_KEY), the app
// falls back to the old local-only behaviour: `isUnlocked`/`license`/
// `googleUser` set directly via `unlock`/`registerWithGoogle`.
export const useAuthStore = create((set, get) => ({
  // Supabase session state
  session: null,
  user: null,
  profile: null,
  authReady: !isSupabaseConfigured(),

  // Local-mode / legacy fields (also used as a cache of profile.license)
  license: null,
  googleUser: null,
  isUnlocked: false,

  init: async () => {
    if (!supabase) {
      set({ authReady: true })
      return
    }

    const { data } = await supabase.auth.getSession()
    await get()._applySession(data.session)
    set({ authReady: true })

    supabase.auth.onAuthStateChange((_event, session) => {
      get()._applySession(session)
    })
  },

  _applySession: async (session) => {
    if (!session) {
      set({ session: null, user: null, profile: null, license: null, isUnlocked: false })
      return
    }

    set({ session, user: session.user, isUnlocked: true })

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single()

    set({ profile: profile ?? null, license: profile?.license ?? null })

    const local = loadLocalSnapshot()

    // If the cloud snapshot is newer than what's in this browser, restore it
    // so progress/mascot/settings follow the user across devices.
    if (profile?.snapshot?.lastSaved) {
      const cloudIsNewer = !local?.lastSaved || profile.snapshot.lastSaved > local.lastSaved
      if (cloudIsNewer) {
        applyProgressSnapshot(profile.snapshot)
      }
    } else if (profile && local?.userId && local.userId !== session.user.id) {
      // This browser's local storage belongs to a DIFFERENT account that
      // never made it to the cloud — don't let the new account inherit it.
      // If the cloud just has nothing yet (new account, or a sync that
      // hasn't landed), keep what's already loaded instead of wiping it —
      // wiping here used to silently destroy progress every time the cloud
      // write had failed (e.g. a missing `snapshot` column), since a failed
      // write looks identical to "never synced".
      applyProgressSnapshot({})
    }
  },

  refreshProfile: async () => {
    const { user } = get()
    if (!supabase || !user) return
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    set({ profile: profile ?? null, license: profile?.license ?? null })
  },

  signUpWithEmail: async (email, password, displayName) => {
    if (!supabase) throw new Error('Supabase no está configurado todavía.')
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name: displayName } },
    })
    if (error) throw error
    if (data.session) await get()._applySession(data.session)
    return data
  },

  signInWithEmail: async (email, password) => {
    if (!supabase) throw new Error('Supabase no está configurado todavía.')
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    await get()._applySession(data.session)
    return data
  },

  signInWithOAuth: async (provider) => {
    if (!supabase) throw new Error('Supabase no está configurado todavía.')
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/dashboard` },
    })
    if (error) throw error
  },

  signOut: async () => {
    if (supabase) await supabase.auth.signOut()
    set({
      session: null,
      user: null,
      profile: null,
      license: null,
      googleUser: null,
      isUnlocked: false,
    })
  },

  // Validates and stores a license key. If logged in via Supabase, persists
  // it to the user's profile so it follows them across devices.
  redeemLicense: async (license) => {
    if (!validateLicense(license)) {
      throw new Error('Esta llave no es válida o está dañada.')
    }

    set({ license, isUnlocked: true })

    const { profile } = get()
    if (supabase && profile) {
      const { error } = await supabase
        .from('profiles')
        .update({ license, updated_at: new Date().toISOString() })
        .eq('id', profile.id)
      if (error) throw error
      set({ profile: { ...profile, license } })
    }
  },

  updatePassword: async (password) => {
    if (!supabase) throw new Error('Supabase no está configurado todavía.')
    const { error } = await supabase.auth.updateUser({ password })
    if (error) throw error
  },

  // --- Legacy/local-mode helpers (used when Supabase isn't configured) ---

  unlock: (license) => set({ license, isUnlocked: true }),

  registerWithGoogle: (googleUser) => set({ googleUser, isUnlocked: true }),

  loadGoogleUser: (googleUser) =>
    set((state) => ({
      googleUser,
      isUnlocked: state.isUnlocked || !!googleUser,
    })),

  lock: () => {
    if (supabase) supabase.auth.signOut()
    set({
      session: null,
      user: null,
      profile: null,
      license: null,
      googleUser: null,
      isUnlocked: false,
    })
  },

  isAdmin: () => get().profile?.role === 'admin',

  // 'full' licenses unlock every course; 'single' licenses only unlock the
  // course they were issued for. The demo course and admins are always open.
  hasAccessToCourse: (courseId) => {
    if (courseId === 'course-demo') return true
    if (get().profile?.role === 'admin') return true
    const license = get().license
    if (!license) return false
    return license.type === 'full' || license.courseId === courseId
  },
}))
