import { create } from 'zustand'
import { supabase } from '../services/supabase/client'

// Notificaciones privadas por alumno (student_notifications) — hoy solo se
// usan para avisar que una tarea fue calificada, pero el shape es genérico
// (title/body/task_id) para poder reutilizarse en el futuro.
export const useNotificationsStore = create((set, get) => ({
  notifications: [],
  loading: false,

  fetchNotifications: async () => {
    set({ loading: true })
    const { data } = await supabase
      .from('student_notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(30)
    set({ notifications: data ?? [], loading: false })
  },

  markAllRead: async () => {
    const unreadIds = get().notifications.filter((n) => !n.read_at).map((n) => n.id)
    if (unreadIds.length === 0) return
    const now = new Date().toISOString()
    set((s) => ({ notifications: s.notifications.map((n) => ({ ...n, read_at: n.read_at ?? now })) }))
    await supabase.from('student_notifications').update({ read_at: now }).in('id', unreadIds)
  },

  // Usado por el admin al calificar una tarea — notifica al alumno dueño.
  notifyTaskGraded: async (task, grade, gradeMax) => {
    await supabase.from('student_notifications').insert({
      student_id: task.student_id,
      task_id: task.id,
      title: 'Calificaron tu tarea',
      body: `"${task.title}" · ${grade}/${gradeMax}`,
    })
  },
}))
