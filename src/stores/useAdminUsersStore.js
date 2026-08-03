import { create } from 'zustand'
import { supabase } from '../services/supabase/client'

// Fuente ÚNICA de "lista de alumnos" para todo el panel admin — antes
// useTasksStore.js, useLiveClassStore.js y este mismo store cada uno hacía
// su propia consulta a profiles con columnas ligeramente distintas; ahora
// todos importan students/fetchStudents de aquí (ver AdminTasksPage.jsx,
// AdminProjectsPage.jsx, AdminLiveClassesPage.jsx).
export const useAdminUsersStore = create((set) => ({
  students: [],
  loading: false,
  error: null,

  // Antes solo desestructuraba `data` — si la consulta fallaba (ej. una
  // migración con columnas nuevas en profiles, como age_profile/
  // account_status de migration_021/022, todavía no corrida en Supabase)
  // el error se tragaba en silencio y el panel mostraba "0 alumnos" sin
  // ninguna pista de por qué. Ahora se captura y se expone en `error` para
  // que AdminDashboardPage pueda mostrarlo en vez de una lista vacía muda.
  fetchStudents: async () => {
    set({ loading: true, error: null })
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, display_name, role, age_profile, account_status, snapshot')
      .eq('role', 'student')
      .order('display_name')
    if (error) console.error('[useAdminUsersStore.fetchStudents]', error)
    set({ students: data ?? [], loading: false, error: error?.message ?? null })
  },

  setAgeProfile: async (studentId, ageProfile) => {
    const { error } = await supabase
      .from('profiles')
      .update({ age_profile: ageProfile })
      .eq('id', studentId)
    if (!error) {
      set((s) => ({
        students: s.students.map((st) => (st.id === studentId ? { ...st, age_profile: ageProfile } : st)),
      }))
    }
    return { error }
  },

  // Aprueba una cuenta pendiente (ver migration_022.sql — hoy solo pasa con
  // cuentas de niños creadas por un padre/tutor) y de una vez le asigna el
  // perfil de edad final que elija el admin.
  approveStudent: async (studentId, ageProfile) => {
    const { error } = await supabase
      .from('profiles')
      .update({ account_status: 'active', age_profile: ageProfile })
      .eq('id', studentId)
    if (!error) {
      set((s) => ({
        students: s.students.map((st) =>
          st.id === studentId ? { ...st, account_status: 'active', age_profile: ageProfile } : st
        ),
      }))
    }
    return { error }
  },
}))
