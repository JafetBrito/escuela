import { create } from 'zustand'
import { supabase } from '../services/supabase/client'
import { playNotificationSound } from '../utils/sound'

// Notificaciones privadas por alumno (student_notifications) — usadas para
// tareas calificadas, proyectos asignados y clases en vivo. El shape es
// genérico (title/body + task_id/project_id/class_id) para poder crecer a
// otros eventos sin tocar el bell.
export const useNotificationsStore = create((set, get) => ({
  notifications: [],
  loading: false,
  _channel: null,

  fetchNotifications: async () => {
    set({ loading: true })
    const { data } = await supabase
      .from('student_notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(30)
    set({ notifications: data ?? [], loading: false })
  },

  // Suscripción en vivo por alumno — cuando llega una notificación nueva
  // (ej. el admin inicia una clase) se agrega al instante y suena un ping,
  // sin esperar a que el usuario abra/recargue la campanita.
  subscribeToNotifications: (studentId) => {
    if (!studentId || get()._channel) return
    const channel = supabase
      .channel(`student_notifications:${studentId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'student_notifications', filter: `student_id=eq.${studentId}` },
        (payload) => {
          set((s) => ({ notifications: [payload.new, ...s.notifications] }))
          playNotificationSound()
        })
      .subscribe()
    set({ _channel: channel })
  },

  unsubscribeNotifications: () => {
    const channel = get()._channel
    if (channel) supabase.removeChannel(channel)
    set({ _channel: null })
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

  // Usado por useProjectsStore.createProject cuando un admin asigna un
  // proyecto a un alumno (no cuando el alumno crea el suyo propio).
  notifyProjectAssigned: async (project) => {
    await supabase.from('student_notifications').insert({
      student_id: project.student_id,
      project_id: project.id,
      title: 'Nuevo proyecto asignado',
      body: `"${project.title}"`,
    })
  },
}))
