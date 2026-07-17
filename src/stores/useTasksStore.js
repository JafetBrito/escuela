import { create } from 'zustand'
import { supabase } from '../services/supabase/client'
import { useNotificationsStore } from './useNotificationsStore'

export const useTasksStore = create((set, get) => ({
  // ── Student view ──────────────────────────────────────────────────────────
  tasks: [],
  loading: false,
  error: null,

  // Id de la tarea abierta en TaskDetailModal (null = cerrado). Store global
  // en vez de estado local para poder abrirla desde cualquier página (p. ej.
  // desde una notificación).
  openTaskId: null,
  openTask: (id) => set({ openTaskId: id }),
  closeTask: () => set({ openTaskId: null }),

  fetchMyTasks: async () => {
    set({ loading: true, error: null })
    const { data, error } = await supabase
      .from('student_tasks')
      .select('*')
      .order('created_at', { ascending: false })
    set({ tasks: data ?? [], loading: false, error: error?.message ?? null })
  },

  submitTask: async (taskId) => {
    const { error } = await supabase
      .from('student_tasks')
      .update({ status: 'entregada', updated_at: new Date().toISOString() })
      .eq('id', taskId)
    if (!error) {
      set((s) => ({
        tasks: s.tasks.map((t) => t.id === taskId ? { ...t, status: 'entregada' } : t),
      }))
    }
    return { error }
  },

  // ── Admin view ────────────────────────────────────────────────────────────
  students: [],
  allTasks: [],
  adminLoading: false,

  // `snapshot` se incluye para que el admin pueda ver, por alumno, en qué
  // cursos tiene progreso (ver StudentCoursesPanel.jsx) — no existe una tabla
  // de inscripción separada, el progreso vive en profiles.snapshot.progress.
  fetchStudents: async () => {
    const { data } = await supabase
      .from('profiles')
      .select('id, email, display_name, role, snapshot')
      .eq('role', 'student')
      .order('display_name')
    set({ students: data ?? [] })
  },

  fetchAllTasks: async (studentId = null) => {
    set({ adminLoading: true })
    let q = supabase
      .from('student_tasks')
      .select('*, profiles!student_id(display_name, email)')
      .order('created_at', { ascending: false })
    if (studentId) q = q.eq('student_id', studentId)
    const { data } = await q
    set({ allTasks: data ?? [], adminLoading: false })
  },

  createTask: async (payload) => {
    const { data, error } = await supabase
      .from('student_tasks')
      .insert(payload)
      .select()
      .single()
    if (!error) {
      set((s) => ({ allTasks: [data, ...s.allTasks] }))
    }
    return { data, error }
  },

  gradeTask: async (taskId, { grade, grade_max, feedback }) => {
    const { error } = await supabase
      .from('student_tasks')
      .update({ grade, grade_max, feedback, status: 'revisada', updated_at: new Date().toISOString() })
      .eq('id', taskId)
    if (!error) {
      set((s) => ({
        allTasks: s.allTasks.map((t) =>
          t.id === taskId ? { ...t, grade, grade_max, feedback, status: 'revisada' } : t
        ),
        tasks: s.tasks.map((t) =>
          t.id === taskId ? { ...t, grade, grade_max, feedback, status: 'revisada' } : t
        ),
      }))
      const task = get().allTasks.find((t) => t.id === taskId)
      if (task) useNotificationsStore.getState().notifyTaskGraded(task, grade, grade_max)
    }
    return { error }
  },

  deleteTask: async (taskId) => {
    const { error } = await supabase.from('student_tasks').delete().eq('id', taskId)
    if (!error) {
      set((s) => ({
        allTasks: s.allTasks.filter((t) => t.id !== taskId),
        tasks: s.tasks.filter((t) => t.id !== taskId),
      }))
    }
    return { error }
  },
}))
