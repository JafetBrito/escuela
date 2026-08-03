import { create } from 'zustand'
import { supabase } from '../services/supabase/client'
import { playNotificationSound } from '../utils/sound'
import { speak } from '../utils/tts'
import { showSystemNotification } from '../utils/pushNotify'
import { useLevelStore } from './useLevelStore'
import { useCurrencyStore } from './useCurrencyStore'

// Mismo destino que NotificationBell.jsx.handleClick — centralizado aquí
// para que la notificación de sistema (showSystemNotification) abra
// exactamente el mismo enlace que la campanita, incluida la clase en vivo
// si ya está disponible.
function notificationUrl(n) {
  if (n.chess_invite_id) return '/games/mishi-jedrez'
  if (n.class_id) return `/mis-clases/${n.class_id}`
  if (n.project_id) return `/proyectos/${n.project_id}`
  if (n.task_id) return `/mis-tareas/${n.task_id}`
  return null
}

// Le entrega al store local (XP/monedas) la recompensa de una notificación
// no reclamada todavía, y marca reward_claimed_at para que no se repita si
// la notificación se vuelve a cargar (ver fetchNotifications/realtime abajo).
// `.is('reward_claimed_at', null)` en el update evita una doble entrega si
// esto llega a dispararse dos veces casi al mismo tiempo (fetch + realtime).
async function claimReward(n) {
  if ((n.xp_reward ?? 0) <= 0 && (n.gold_reward ?? 0) <= 0) return
  if (n.reward_claimed_at) return
  if (n.xp_reward > 0) useLevelStore.getState().addXp(n.xp_reward)
  if (n.gold_reward > 0) useCurrencyStore.getState().earnCoins(n.gold_reward)
  await supabase.from('student_notifications').update({ reward_claimed_at: new Date().toISOString() }).eq('id', n.id).is('reward_claimed_at', null)
}

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
    // Reclama cualquier recompensa pendiente que haya llegado mientras el
    // alumno no tenía la app abierta (la realtime de abajo solo cubre lo
    // que llega estando conectado).
    ;(data ?? []).forEach(claimReward)
  },

  // Suscripción en vivo por alumno — cuando llega una notificación nueva
  // (ej. el admin asigna/inicia una clase) se agrega al instante, suena un
  // ping Y se lee en voz alta (título + cuerpo), sin esperar a que el
  // usuario abra/recargue la campanita.
  subscribeToNotifications: (studentId) => {
    if (!studentId || get()._channel) return
    const channel = supabase
      .channel(`student_notifications:${studentId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'student_notifications', filter: `student_id=eq.${studentId}` },
        (payload) => {
          set((s) => ({ notifications: [payload.new, ...s.notifications] }))
          playNotificationSound()
          speak([payload.new.title, payload.new.body].filter(Boolean).join('. '))
          showSystemNotification({ title: payload.new.title, body: payload.new.body, url: notificationUrl(payload.new) })
          claimReward(payload.new)
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

  // Borra una notificación puntual (botón × por fila) — requiere la política
  // RLS "notifications: student deletes own" (migración 023).
  deleteNotification: async (id) => {
    set((s) => ({ notifications: s.notifications.filter((n) => n.id !== id) }))
    await supabase.from('student_notifications').delete().eq('id', id)
  },

  // "Borrar todo" del header del bell.
  clearAllNotifications: async () => {
    const ids = get().notifications.map((n) => n.id)
    if (ids.length === 0) return
    set({ notifications: [] })
    await supabase.from('student_notifications').delete().in('id', ids)
  },

  // Usado por el admin al calificar una tarea — notifica al alumno dueño y
  // le entrega la recompensa (si el admin puso XP/monedas) por esta misma vía.
  notifyTaskGraded: async (task, grade, gradeMax, xpReward = 0, goldReward = 0) => {
    await supabase.from('student_notifications').insert({
      student_id: task.student_id,
      task_id: task.id,
      title: 'Calificaron tu tarea',
      body: `"${task.title}" · ${grade}/${gradeMax}`,
      xp_reward: xpReward,
      gold_reward: goldReward,
    })
  },

  // Usado por useLiveClassStore.endClass — entrega la recompensa configurada
  // en la clase a cada alumno de `studentIds` (uno mismo, o todos los que de
  // verdad entraron si la clase era para "todos los alumnos").
  notifyClassFinished: async (cls, studentIds) => {
    await supabase.from('student_notifications').insert(
      studentIds.map((id) => ({
        student_id: id,
        class_id: cls.id,
        title: '🎁 Recompensa de clase',
        body: cls.title,
        xp_reward: cls.xp_reward ?? 0,
        gold_reward: cls.gold_reward ?? 0,
      }))
    )
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

  // Usado por useLiveClassStore.createClass en cuanto se agenda una clase
  // (no hasta que el admin le da "Iniciar") — si es para un alumno
  // específico le llega solo a él, si es "todos los alumnos" (student_id
  // null) le llega a todo el alumnado, igual que ya hace startClass.
  notifyClassAssigned: async (cls) => {
    let targets = []
    if (cls.student_id) {
      targets = [{ id: cls.student_id }]
    } else {
      const { data } = await supabase.from('profiles').select('id').eq('role', 'student')
      targets = data ?? []
    }
    if (!targets.length) return
    await supabase.from('student_notifications').insert(
      targets.map((s) => ({
        student_id: s.id,
        class_id: cls.id,
        title: 'Se te asignó una nueva clase',
        body: cls.title,
      }))
    )
  },
}))
