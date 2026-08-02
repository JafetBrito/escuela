import { create } from 'zustand'
import { supabase } from '../services/supabase/client'
import { useNotificationsStore } from './useNotificationsStore'

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

  // Trae una tarea por id sin filtrar por student_id — RLS decide si el
  // usuario (dueño o admin) puede verla. Usado por TaskDetailPage.
  fetchTask: async (id) => {
    const { data, error } = await supabase
      .from('student_tasks')
      .select('*')
      .eq('id', id)
      .maybeSingle()
    return { data, error }
  },

  // Sube el .md de entrega al bucket público 'task-submissions' (ruta
  // {student_id}/{task_id}/{filename}, ver migration_011.sql) y marca la
  // tarea como entregada en el mismo update. Reemplaza al antiguo submitTask
  // que solo cambiaba el status sin capturar ninguna entrega real.
  submitTaskFile: async (taskId, studentId, file) => {
    const path = `${studentId}/${taskId}/${file.name}`
    const { error: upErr } = await supabase.storage.from('task-submissions').upload(path, file, { upsert: true })
    if (upErr) return { error: upErr }
    const { data: pub } = supabase.storage.from('task-submissions').getPublicUrl(path)

    const { error } = await supabase
      .from('student_tasks')
      .update({
        status: 'entregada',
        submission_url: pub.publicUrl,
        submission_filename: file.name,
        updated_at: new Date().toISOString(),
      })
      .eq('id', taskId)
    if (!error) {
      const patch = { status: 'entregada', submission_url: pub.publicUrl, submission_filename: file.name }
      set((s) => ({
        tasks: s.tasks.map((t) => t.id === taskId ? { ...t, ...patch } : t),
        allTasks: s.allTasks.map((t) => t.id === taskId ? { ...t, ...patch } : t),
      }))
    }
    return { error }
  },

  // ── Preguntas por tarea ───────────────────────────────────────────────────
  taskQuestions: [],

  fetchTaskQuestions: async (taskId) => {
    const { data } = await supabase
      .from('task_questions')
      .select('*')
      .eq('task_id', taskId)
      .order('created_at', { ascending: true })
    set({ taskQuestions: data ?? [] })
  },

  askTaskQuestion: async (taskId, studentId, question) => {
    const { data, error } = await supabase
      .from('task_questions')
      .insert({ task_id: taskId, student_id: studentId, question })
      .select()
      .single()
    if (!error) set((s) => ({ taskQuestions: [...s.taskQuestions, data] }))
    return { error }
  },

  answerTaskQuestion: async (questionId, answer) => {
    const { error } = await supabase
      .from('task_questions')
      .update({ answer, answered: true })
      .eq('id', questionId)
    if (!error) {
      set((s) => ({
        taskQuestions: s.taskQuestions.map((q) => q.id === questionId ? { ...q, answer, answered: true } : q),
      }))
    }
    return { error }
  },

  // ── Admin view ────────────────────────────────────────────────────────────
  // La lista de alumnos vive en useAdminUsersStore.js (fuente única
  // compartida con AdminProjectsPage/AdminLiveClassesPage) — este store ya
  // no tiene su propio students/fetchStudents.
  allTasks: [],
  adminLoading: false,

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

  gradeTask: async (taskId, { grade, grade_max, feedback, xp_reward = 0, gold_reward = 0 }) => {
    const patch = { grade, grade_max, feedback, xp_reward, gold_reward, status: 'revisada', updated_at: new Date().toISOString() }
    const { error } = await supabase
      .from('student_tasks')
      .update(patch)
      .eq('id', taskId)
    if (!error) {
      set((s) => ({
        allTasks: s.allTasks.map((t) => t.id === taskId ? { ...t, ...patch } : t),
        tasks: s.tasks.map((t) => t.id === taskId ? { ...t, ...patch } : t),
      }))
      const task = get().allTasks.find((t) => t.id === taskId)
      if (task) useNotificationsStore.getState().notifyTaskGraded(task, grade, grade_max, xp_reward, gold_reward)
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
