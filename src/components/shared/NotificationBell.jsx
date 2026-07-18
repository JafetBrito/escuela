import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useNotificationsStore } from '../../stores/useNotificationsStore'
import { useAuthStore } from '../../stores/useAuthStore'

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
  const userId = useAuthStore((s) => s.session?.user?.id)
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  const unread = notifications.filter((n) => !n.read_at).length

  useEffect(() => { fetchNotifications() }, [fetchNotifications])

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
  }

  const handleClick = (n) => {
    setOpen(false)
    if (n.chess_invite_id) {
      navigate('/games/mishi-jedrez')
    } else if (n.class_id) {
      navigate(`/mis-clases/${n.class_id}`)
    } else if (n.project_id) {
      navigate(`/proyectos/${n.project_id}`)
    } else if (n.task_id) {
      navigate(`/mis-tareas/${n.task_id}`)
    }
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
        <div className="nav-dropdown absolute right-0 top-full z-50 mt-1.5 w-72 overflow-hidden rounded-xl border border-border/60 bg-surface/95 shadow-2xl backdrop-blur-md">
          <p className="border-b border-border/40 px-3 py-2 text-xs font-bold uppercase tracking-wide text-text-muted">Notificaciones</p>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="px-3 py-6 text-center text-xs text-text-muted">Sin notificaciones todavía.</p>
            ) : (
              notifications.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => handleClick(n)}
                  className={`flex w-full flex-col items-start gap-0.5 px-3 py-2.5 text-left transition-colors hover:bg-primary/5 ${!n.read_at ? 'bg-primary/5' : ''}`}
                >
                  <span className="text-xs font-semibold text-text">{n.title}</span>
                  {n.body && <span className="text-[11px] text-text-muted">{n.body}</span>}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
