import { create } from 'zustand'
import { supabase, isSupabaseConfigured } from '../services/supabase/client'
import { validateLicense } from '../services/crypto/keyCrypto'
import { applyProgressSnapshot } from '../services/persistence/progressSnapshot'
import { loadLocalSnapshot } from '../services/persistence/localStore'
import { DEV_UNLOCK_ALL } from '../config/devUnlock'

// ponytail: localStorage es suficiente para "recordar la sesión de
// reclutador entre recargas" — la fuente de verdad real (si el token sigue
// vivo) es la fila en recruiter_passes, esto solo evita repetir la
// validación en cada F5.
const RECRUITER_STORAGE_KEY = 'oliver_recruiter_pass'

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
    const savedRecruiter = localStorage.getItem(RECRUITER_STORAGE_KEY)
    if (savedRecruiter) {
      try {
        const { token, expiresAt } = JSON.parse(savedRecruiter)
        if (new Date(expiresAt).getTime() > Date.now()) {
          get().enterRecruiterMode(token, expiresAt)
          set({ authReady: true })
          return
        }
      } catch {
        // ignore, se limpia abajo
      }
      localStorage.removeItem(RECRUITER_STORAGE_KEY)
    }

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

  // `isChildSignup` viaja como metadata del signup (options.data) para que
  // el trigger handle_new_user() (ver migration_022.sql) pueda leerlo al
  // insertar la fila de profiles y arrancarla en account_status='pending' —
  // cuentas de niños las crea un padre/tutor, pero las aprueba el admin
  // desde /admin antes de que tengan acceso a la plataforma.
  signUpWithEmail: async (email, password, displayName, { isChildSignup = false } = {}) => {
    if (!supabase) throw new Error('Supabase no está configurado todavía.')
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name: displayName, is_child_signup: isChildSignup } },
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
    localStorage.removeItem(RECRUITER_STORAGE_KEY)
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
    localStorage.removeItem(RECRUITER_STORAGE_KEY)
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

  // Vista de Reclutador: cuenta "todo desbloqueado" sin registro real, para
  // compartir un enlace temporal (ver /reclutador/:token + AdminRecruitersPage
  // + migration_033.sql). Misma idea que enterGhostMode (sesión falsa local,
  // no hay fila real en auth.users) pero SÍ funciona en producción y
  // persiste en localStorage para sobrevivir un F5 hasta que expire.
  // No usa role:'admin' a propósito — así no expone datos reales de otros
  // alumnos en /admin ni acciones destructivas, solo el catálogo/curso.
  enterRecruiterMode: (token, expiresAt) => {
    const id = `recruiter-${token}`
    localStorage.setItem(RECRUITER_STORAGE_KEY, JSON.stringify({ token, expiresAt }))
    set({
      session: { user: { id, email: 'reclutador@jafetbrito.online' } },
      user: { id, email: 'reclutador@jafetbrito.online' },
      profile: {
        id,
        email: 'reclutador@jafetbrito.online',
        display_name: 'Cuenta de Reclutador',
        role: 'student',
        account_status: 'active',
        age_profile: null,
        license: null,
        voice_enabled: false,
        recruiter_view: true,
        recruiter_expires_at: expiresAt,
      },
      license: null,
      isUnlocked: true,
    })
  },

  isRecruiterMode: () => get().profile?.recruiter_view === true,

  // ponytail: acceso fantasma SOLO para revisar la app en local (dev) sin
  // depender de Supabase — no crea una sesión real, así que cualquier
  // pantalla que lea datos reales de Supabase (tareas, proyectos, monedas
  // guardadas...) se ve vacía; el catálogo de cursos y las clases sí
  // funcionan completo porque esos son de lectura pública. Nunca puede
  // activarse en producción: gateado por import.meta.env.DEV en
  // LoginPage.jsx, y ese flag es `false` en cualquier `vite build`. Borrar
  // este bloque + el atajo en LoginPage.jsx cuando ya no haga falta.
  enterGhostMode: () => {
    const id = 'ghost-meow-local'
    set({
      session: { user: { id, email: 'meow@meow.com' } },
      user: { id, email: 'meow@meow.com' },
      profile: {
        id,
        email: 'meow@meow.com',
        display_name: 'Meow (prueba local)',
        role: 'student',
        account_status: 'active',
        age_profile: null,
        license: null,
        voice_enabled: false,
      },
      license: null,
      isUnlocked: true,
    })
  },

  isAdmin: () => get().profile?.role === 'admin',

  // Profesor: cuenta restringida, promovida por un admin desde
  // /admin/profesores (ver useAdminUsersStore.promoteToTeacher) — nunca por
  // signup directo. Ve sus propios cursos asignados y su bandeja de
  // reflexiones (ver src/components/teacher/).
  isTeacher: () => get().profile?.role === 'teacher',

  // Live voice (mic dictation in VR chat): admins always have it; everyone
  // else needs it explicitly granted via the admin's "Voz" panel, which
  // writes profiles.voice_enabled for that player (see gmCommands.setVoicePermission).
  canUseVoice: () => get().profile?.role === 'admin' || !!get().profile?.voice_enabled,

  // 'full' licenses unlock every course; 'single' licenses only unlock the
  // course they were issued for. The demo course and admins are always open.
  hasAccessToCourse: (courseId) => {
    if (DEV_UNLOCK_ALL) return true
    if (get().profile?.recruiter_view) return true
    if (courseId === 'course-demo' || courseId === 'course-claude-mayores') return true
    if (get().profile?.role === 'admin') return true
    const license = get().license
    if (!license) return false
    return license.type === 'full' || license.courseId === courseId
  },
}))
