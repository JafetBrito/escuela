import { create } from 'zustand'
import { supabase } from '../services/supabase/client'

export const useTasksStore = create((set, get) => ({
  // ── Student view ──────────────────────────────────────────────────────────
  tasks: [],
  loading: false,
  error: null,

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

  fetchStudents: async () => {
    const { data } = await supabase
      .from('profiles')
      .select('id, email, display_name, role')
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
