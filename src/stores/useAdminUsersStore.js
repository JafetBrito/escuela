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

  fetchStudents: async () => {
    set({ loading: true })
    const { data } = await supabase
      .from('profiles')
      .select('id, email, display_name, role, age_profile, account_status, snapshot')
      .eq('role', 'student')
      .order('display_name')
    set({ students: data ?? [], loading: false })
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
