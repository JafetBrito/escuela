import { create } from 'zustand'
import { supabase } from '../services/supabase/client'

// Fuente ÚNICA de "lista de alumnos" para todo el panel admin — antes
// useTasksStore.js, useLiveClassStore.js y este mismo store cada uno hacía
// su propia consulta a profiles con columnas ligeramente distintas; ahora
// todos importan students/fetchStudents de aquí (ver AdminTasksPage.jsx,
// AdminProjectsPage.jsx, AdminLiveClassesPage.jsx).
export const useAdminUsersStore = create((set) => ({
  students: [],
  teachers: [],
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

  // Directorio de profesores para AdminTeachersPage — mismo shape que
  // fetchStudents, solo cambia el filtro de role.
  fetchTeachers: async () => {
    set({ loading: true, error: null })
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, display_name, role, avatar_url, teacher_bio')
      .eq('role', 'teacher')
      .order('display_name')
    if (error) console.error('[useAdminUsersStore.fetchTeachers]', error)
    set({ teachers: data ?? [], loading: false, error: error?.message ?? null })
  },

  // No hay flujo de invitación por correo — un profesor se promueve a partir
  // de una cuenta que ya existe (alguien que ya se registró como alumno).
  // Busca por email exacto para que el admin pueda confirmar "es esta
  // persona" antes de promoverla.
  findProfileByEmail: async (email) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, display_name, role')
      .eq('email', email.trim())
      .maybeSingle()
    return { data, error }
  },

  promoteToTeacher: async (userId) => {
    const { error } = await supabase.from('profiles').update({ role: 'teacher' }).eq('id', userId)
    return { error }
  },

  // Vuelve a dejar la cuenta como alumno normal — por si el admin se
  // equivocó de persona al promover.
  demoteToStudent: async (userId) => {
    const { error } = await supabase.from('profiles').update({ role: 'student' }).eq('id', userId)
    if (!error) {
      set((s) => ({ teachers: s.teachers.filter((t) => t.id !== userId) }))
    }
    return { error }
  },
}))
