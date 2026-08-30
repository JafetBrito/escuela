import { create } from 'zustand'
import { supabase } from '../services/supabase/client'

// Fuente de datos para las 4 páginas de src/components/teacher/ (dashboard,
// bandeja de reflexiones, mi perfil, perfil público). Deliberadamente sin
// más abstracción que esto — son consultas CRUD simples, un action por
// pantalla, nada compartido que amerite normalizar en un shape más elaborado.
export const useTeacherStore = create((set) => ({
  myCourses: [],
  myReflections: [],
  publicProfile: null,
  publicCourses: [],
  loading: false,

  fetchMyCourses: async (teacherId) => {
    set({ loading: true })
    const { data, error } = await supabase
      .from('courses')
      .select('id, title, description, icon, color, category')
      .eq('teacher_id', teacherId)
      .order('title')
    if (error) console.error('[useTeacherStore.fetchMyCourses]', error)
    set({ myCourses: data ?? [], loading: false })
  },

  // Join a `profiles` para el nombre del alumno (mismo patrón que
  // AdminTasksPage.jsx usa para student_tasks: `profiles!student_id(...)`,
  // funciona igual aquí aunque student_id apunte a auth.users y no a
  // profiles directo). El título del curso NO se resuelve con otro join —
  // se resuelve en memoria con getCourseData(course_id) desde
  // courseRegistry.js, ya cargado por App.jsx al arrancar.
  fetchMyReflections: async (teacherId) => {
    set({ loading: true })
    const { data, error } = await supabase
      .from('lesson_reflections')
      .select('*, profiles!student_id(display_name, email)')
      .eq('teacher_id', teacherId)
      .order('created_at', { ascending: false })
    if (error) console.error('[useTeacherStore.fetchMyReflections]', error)
    set({ myReflections: data ?? [], loading: false })
  },

  fetchPublicTeacherProfile: async (teacherId) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, display_name, avatar_url, teacher_bio')
      .eq('id', teacherId)
      .eq('role', 'teacher')
      .maybeSingle()
    if (error) console.error('[useTeacherStore.fetchPublicTeacherProfile]', error)
    set({ publicProfile: data ?? null })
  },

  fetchPublicTeacherCourses: async (teacherId) => {
    const { data, error } = await supabase
      .from('courses')
      .select('id, title, description, icon, color, category')
      .eq('teacher_id', teacherId)
      .order('title')
    if (error) console.error('[useTeacherStore.fetchPublicTeacherCourses]', error)
    set({ publicCourses: data ?? [] })
  },

  // Guarda display_name/avatar_url/teacher_bio — permitido por "profiles:
  // update own" (schema.sql), no hace falta ninguna política nueva.
  updateMyProfile: async (userId, patch) => {
    const { error } = await supabase
      .from('profiles')
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq('id', userId)
    return { error }
  },
}))
