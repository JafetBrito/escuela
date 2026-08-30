import { create } from 'zustand'
import { supabase } from '../services/supabase/client'
import { useNotificationsStore } from './useNotificationsStore'
import { useAuthStore } from './useAuthStore'

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
  // `task` es el objeto completo ya cargado en el componente que llama
  // (TaskDetailPage tiene `task.assigned_by`/`task.title` en su estado local
  // desde fetchTask) — se usa solo para notificar al admin, es opcional.
  submitTaskFile: async (taskId, studentId, file, task) => {
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
    const patch = { status: 'entregada', submission_url: pub.publicUrl, submission_filename: file.name }
    if (!error) {
      set((s) => ({
        tasks: s.tasks.map((t) => t.id === taskId ? { ...t, ...patch } : t),
        allTasks: s.allTasks.map((t) => t.id === taskId ? { ...t, ...patch } : t),
      }))
      if (task?.assigned_by) {
        const studentName = useAuthStore.getState().profile?.display_name
        useNotificationsStore.getState().notifyAdminTaskSubmitted(
          { id: taskId, student_id: studentId, assigned_by: task.assigned_by, title: task.title },
          studentName,
        )
      }
    }
    return { error, patch }
  },

  // Sube una imagen suelta para insertarla dentro del cuerpo de una entrega
  // redactada en el editor (TaskComposeModal) — mismo bucket 'task-submissions'
  // que ya usa submitTaskFile (misma política de storage: alcanza con que el
  // primer segmento de la ruta sea el uid del alumno, no importa cuántos
  // subniveles tenga después), en una subcarpeta 'images/' aparte para no
  // mezclarse con el .md final. Devuelve la URL pública para insertar
  // ![alt](url) en el markdown.
  uploadTaskImage: async (taskId, studentId, file) => {
    const path = `${studentId}/${taskId}/images/${Date.now()}-${file.name}`
    const { error } = await supabase.storage.from('task-submissions').upload(path, file, { upsert: true })
    if (error) return { error }
    const { data: pub } = supabase.storage.from('task-submissions').getPublicUrl(path)
    return { url: pub.publicUrl }
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

  // `task` (opcional, igual que en submitTaskFile) solo se usa para
  // notificar al admin que asignó la tarea.
  askTaskQuestion: async (taskId, studentId, question, task) => {
    const { data, error } = await supabase
      .from('task_questions')
      .insert({ task_id: taskId, student_id: studentId, question })
      .select()
      .single()
    if (!error) {
      set((s) => ({ taskQuestions: [...s.taskQuestions, data] }))
      if (task?.assigned_by) {
        const studentName = useAuthStore.getState().profile?.display_name
        useNotificationsStore.getState().notifyAdminTaskQuestion(
          { id: taskId, student_id: studentId, assigned_by: task.assigned_by, title: task.title },
          studentName,
          question,
        )
      }
    }
    return { error }
  },

  // `task` (opcional) solo se usa para avisarle al alumno que su pregunta
  // tiene respuesta — el insert de notificación aquí ya lo hace un admin
  // (política "notifications: admin creates" existente, sin cambios de RLS).
  answerTaskQuestion: async (questionId, answer, task) => {
    const { error } = await supabase
      .from('task_questions')
      .update({ answer, answered: true })
      .eq('id', questionId)
    if (!error) {
      set((s) => ({
        taskQuestions: s.taskQuestions.map((q) => q.id === questionId ? { ...q, answer, answered: true } : q),
      }))
      if (task) useNotificationsStore.getState().notifyTaskQuestionAnswered(task)
    }
    return { error }
  },

  // ── Admin view ────────────────────────────────────────────────────────────
  // La lista de alumnos vive en useAdminUsersStore.js (fuente única
  // compartida con AdminProjectsPage/AdminLiveClassesPage) — este store ya
  // no tiene su propio students/fetchStudents.
  allTasks: [],
  adminLoading: false,

  // El embed `task_questions(id, answered)` usa el FK task_questions.task_id
  // -> student_tasks.id (migration_011.sql) para que PostgREST lo resuelva
  // solo — así la lista admin (y la Bandeja de revisión) saben sin otra
  // consulta si una tarea tiene preguntas sin responder, vía
  // `task.task_questions.some(q => !q.answered)`.
  fetchAllTasks: async (studentId = null) => {
    set({ adminLoading: true })
    let q = supabase
      .from('student_tasks')
      .select('*, profiles!student_id(display_name, email), task_questions(id, answered)')
      .order('created_at', { ascending: false })
    if (studentId) q = q.eq('student_id', studentId)
    const { data } = await q
    set({ allTasks: data ?? [], adminLoading: false })
  },

  // Conteo liviano para el badge de "Bandeja de revisión" en el riel admin
  // (AdminShell.jsx) — trae solo ids (nunca filas completas) y deduplica en
  // JS, porque una misma tarea puede calificar por los dos motivos a la vez
  // (entregada Y con pregunta sin responder) y no queremos contarla doble.
  // Mismo criterio que la bandeja de AdminTasksPage (ver ese archivo).
  fetchTasksNeedingReviewCount: async () => {
    const [{ data: entregadas }, { data: withQuestions }] = await Promise.all([
      supabase.from('student_tasks').select('id').eq('status', 'entregada'),
      supabase.from('task_questions').select('task_id').eq('answered', false),
    ])
    const ids = new Set([
      ...(entregadas ?? []).map((t) => t.id),
      ...(withQuestions ?? []).map((q) => q.task_id),
    ])
    return ids.size
  },

  createTask: async (payload) => {
    const { data, error } = await supabase
      .from('student_tasks')
      .insert(payload)
      .select()
      .single()
    if (!error) {
      set((s) => ({ allTasks: [data, ...s.allTasks] }))
      if (payload.assigned_by && payload.assigned_by !== payload.student_id) {
        useNotificationsStore.getState().notifyTaskAssigned(data)
      }
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
