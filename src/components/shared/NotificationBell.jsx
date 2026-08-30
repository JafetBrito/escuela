import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useNotificationsStore } from '../../stores/useNotificationsStore'
import { useAuthStore } from '../../stores/useAuthStore'
import { requestPushPermission } from '../../utils/pushNotify'

// Ícono + acento de color por tipo de evento — misma lógica de
// "a qué corresponde" que ya usa handleClick para navegar.
function notificationMeta(n) {
  if (n.chess_invite_id) return { icon: '♟️', ring: 'bg-indigo-500/15 text-indigo-400' }
  if (n.trivia_invite_id) return { icon: '🎯', ring: 'bg-fuchsia-500/15 text-fuchsia-400' }
  if (n.hospital_invite_id) return { icon: '🏥', ring: 'bg-emerald-500/15 text-emerald-400' }
  if (n.class_id) return { icon: '🎓', ring: 'bg-sky-500/15 text-sky-400' }
  // admin_id presente = fila dirigida al profesor (entrega/pregunta/
  // actualización de un alumno), no al alumno — distinguirla del resto.
  if (n.admin_id && n.task_id) return { icon: '📤', ring: 'bg-rose-500/15 text-rose-400' }
  if (n.admin_id && n.project_id) return { icon: '📁', ring: 'bg-rose-500/15 text-rose-400' }
  if (n.project_id) return { icon: '📁', ring: 'bg-amber-500/15 text-amber-400' }
  if (n.task_id) return { icon: '📋', ring: 'bg-emerald-500/15 text-emerald-400' }
  return { icon: '🔔', ring: 'bg-primary/15 text-primary' }
}

function timeAgo(iso) {
  const diffMin = Math.floor((Date.now() - new Date(iso).getTime()) / 60000)
  if (diffMin < 1) return 'ahora'
  if (diffMin < 60) return `hace ${diffMin} min`
  const hrs = Math.floor(diffMin / 60)
  if (hrs < 24) return `hace ${hrs} h`
  const days = Math.floor(hrs / 24)
  if (days < 7) return `hace ${days} d`
  return new Date(iso).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })
}

// Campanita de notificaciones del alumno — avisa cuando el profesor califica
// una tarea, asigna un proyecto, o inicia una clase en vivo. Se suscribe en
// vivo (subscribeToNotifications) para que suene un ping y aparezca al
// instante, sin esperar a que el usuario recargue o abra la campanita.
export default function NotificationBell() {
  const notifications = useNotificationsStore((s) => s.notifications)
  const fetchNotifications = useNotificationsStore((s) => s.fetchNotifications)
  const subscribeToNotifications = useNotificationsStore((s) => s.subscribeToNotifications)
  const unsubscribeNotifications = useNotificationsStore((s) => s.unsubscribeNotifications)
  const markAllRead = useNotificationsStore((s) => s.markAllRead)
  const deleteNotification = useNotificationsStore((s) => s.deleteNotification)
  const clearAllNotifications = useNotificationsStore((s) => s.clearAllNotifications)
  const userId = useAuthStore((s) => s.session?.user?.id)
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  const unread = notifications.filter((n) => !n.read_at).length

  useEffect(() => { if (userId) fetchNotifications(userId) }, [fetchNotifications, userId])

  useEffect(() => {
    if (!userId) return
    subscribeToNotifications(userId)
    return () => unsubscribeNotifications()
  }, [userId, subscribeToNotifications, unsubscribeNotifications])

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleToggle = () => {
    setOpen((v) => !v)
    if (!open && unread > 0) markAllRead()
    // Pedir permiso de notificaciones del sistema justo aquí (un clic real
    // del usuario) — algunos navegadores bloquean la solicitud si se dispara
    // sola al cargar la página sin ningún gesto de por medio.
    if (!open) requestPushPermission()
  }

  const handleClick = (n) => {
    setOpen(false)
    if (n.chess_invite_id) {
      navigate('/games/mishi-jedrez')
    } else if (n.trivia_invite_id) {
      navigate(`/games/quiz-rapido?invite=${n.trivia_invite_id}`)
    } else if (n.hospital_invite_id) {
      navigate(`/games/cyber-range-hospital?invite=${n.hospital_invite_id}`)
    } else if (n.class_id) {
      navigate(`/mis-clases/${n.class_id}`)
    } else if (n.admin_id && n.task_id) {
      navigate(`/mis-tareas/${n.task_id}`)
    } else if (n.admin_id && n.project_id) {
      navigate(`/proyectos/${n.project_id}`)
    } else if (n.project_id) {
      navigate(`/proyectos/${n.project_id}`)
    } else if (n.task_id) {
      navigate(`/mis-tareas/${n.task_id}`)
    }
  }

  const handleDelete = (e, id) => {
    e.stopPropagation()
    deleteNotification(id)
  }

  const handleClearAll = () => {
    if (!window.confirm('¿Borrar todas las notificaciones? Esta acción no se puede deshacer.')) return
    clearAllNotifications()
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={handleToggle}
        className="relative flex h-9 w-9 items-center justify-center rounded-lg text-lg text-text-muted transition-colors hover:text-text"
        aria-label="Notificaciones"
      >
        🔔
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        // En móvil, anclarlo "right-0" respecto a la campanita y calcular el
        // ancho como una fracción del viewport es frágil — la campanita no
        // vive en el borde real de la pantalla (hay hamburguesa + padding de
        // por medio), así que cualquier cálculo en vw termina desbordando
        // por UN lado o el otro según cuánto se acerque la estimación.
        // Más simple y a prueba de esto: en móvil es un panel fijo con
        // márgenes simétricos al viewport real (nunca al botón); en
        // escritorio (sm+) sigue siendo el dropdown anclado de siempre.
        <div className="nav-dropdown fixed inset-x-3 top-14 z-50 overflow-hidden rounded-2xl border border-border/60 bg-surface/95 shadow-2xl backdrop-blur-md sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:mt-1.5 sm:w-80">
          <div className="flex items-center justify-between gap-2 border-b border-border/40 px-3.5 py-2.5">
            <p className="text-xs font-bold uppercase tracking-wide text-text-muted">
              Notificaciones {notifications.length > 0 && <span className="text-text-muted/60">· {notifications.length}</span>}
            </p>
            {notifications.length > 0 && (
              <button
                type="button"
                onClick={handleClearAll}
                className="text-[11px] font-semibold text-text-muted transition-colors hover:text-danger"
              >
                Borrar todo
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
                <span className="text-3xl opacity-60">🔕</span>
                <p className="text-xs text-text-muted">No tienes notificaciones todavía.</p>
              </div>
            ) : (
              notifications.map((n) => {
                const { icon, ring } = notificationMeta(n)
                const hasReward = (n.xp_reward > 0 || n.gold_reward > 0)
                return (
                  <div
                    key={n.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => handleClick(n)}
                    className={`group flex w-full items-start gap-2.5 border-b border-border/20 px-3.5 py-3 text-left transition-colors last:border-b-0 hover:bg-primary/5 ${!n.read_at ? 'bg-primary/5' : ''}`}
                  >
                    <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm ${ring}`}>
                      {icon}
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs font-semibold leading-snug text-text">{n.title}</span>
                        {!n.read_at && <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />}
                      </div>
                      {n.body && <p className="mt-0.5 text-[11px] leading-snug text-text-muted line-clamp-2">{n.body}</p>}
                      <div className="mt-1 flex items-center gap-2">
                        <span className="text-[10px] text-text-muted/70">{timeAgo(n.created_at)}</span>
                        {hasReward && (
                          <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold text-primary">
                            {n.xp_reward > 0 && `+${n.xp_reward} XP`}
                            {n.xp_reward > 0 && n.gold_reward > 0 && ' · '}
                            {n.gold_reward > 0 && `+${n.gold_reward} 🪙`}
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => handleDelete(e, n.id)}
                      aria-label="Borrar notificación"
                      className="shrink-0 rounded-lg px-1.5 py-1 text-xs text-text-muted/50 opacity-0 transition-opacity hover:text-danger group-hover:opacity-100 focus:opacity-100"
                    >
                      ✕
                    </button>
                  </div>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}
