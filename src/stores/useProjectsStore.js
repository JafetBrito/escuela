import { create } from 'zustand'
import { supabase } from '../services/supabase/client'
import { useNotificationsStore } from './useNotificationsStore'

// "Proyectos" — tablero estilo Notion con secciones fijas (notas/checklist/
// recursos, todo en columnas jsonb). Mismo molde que useTasksStore.js, pero
// el dueño tiene control total sobre su propio proyecto (una sola política
// RLS "dueño o admin" en vez del split select/submit/admin de Tareas).
export const useProjectsStore = create((set, get) => ({
  // ── Student view ──────────────────────────────────────────────────────────
  projects: [],
  loading: false,
  error: null,

  fetchMyProjects: async () => {
    set({ loading: true, error: null })
    const { data, error } = await supabase
      .from('student_projects')
      .select('*')
      .order('updated_at', { ascending: false })
    set({ projects: data ?? [], loading: false, error: error?.message ?? null })
  },

  // Trae un proyecto por id sin filtrar por student_id — RLS decide si el
  // usuario (dueño o admin) puede verlo. Usado por ProjectDetailPage tanto
  // para el alumno dueño como para el admin viendo cualquier proyecto.
  fetchProject: async (id) => {
    const { data, error } = await supabase
      .from('student_projects')
      .select('*')
      .eq('id', id)
      .maybeSingle()
    return { data, error }
  },

  createProject: async (payload) => {
    const { data, error } = await supabase
      .from('student_projects')
      .insert(payload)
      .select()
      .single()
    if (!error) {
      set((s) => ({ projects: [data, ...s.projects] }))
      if (payload.assigned_by && payload.assigned_by !== payload.student_id) {
        useNotificationsStore.getState().notifyProjectAssigned(data)
      }
    }
    return { data, error }
  },

  updateProject: async (id, patch) => {
    const { data, error } = await supabase
      .from('student_projects')
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    if (!error) {
      set((s) => ({ projects: s.projects.map((p) => (p.id === id ? data : p)) }))
    }
    return { data, error }
  },

  deleteProject: async (id) => {
    const { error } = await supabase.from('student_projects').delete().eq('id', id)
    if (!error) {
      set((s) => ({ projects: s.projects.filter((p) => p.id !== id) }))
    }
    return { error }
  },

  // ── Admin view ────────────────────────────────────────────────────────────
  // La lista de alumnos se reutiliza de useTasksStore (students/fetchStudents)
  // para no duplicar esa consulta — ver AdminProjectsPage.jsx.
  allProjects: [],
  adminLoading: false,

  fetchAllProjects: async (studentId = null) => {
    set({ adminLoading: true })
    let q = supabase
      .from('student_projects')
      .select('*, profiles!student_id(display_name, email)')
      .order('updated_at', { ascending: false })
    if (studentId) q = q.eq('student_id', studentId)
    const { data } = await q
    set({ allProjects: data ?? [], adminLoading: false })
  },
}))
