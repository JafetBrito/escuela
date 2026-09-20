import { useEffect, useRef } from 'react'
import { useNotificationsStore } from '../../stores/useNotificationsStore'

// Cuando un amigo ACEPTA una invitación a un juego o mundo que enviaste, te
// llega una notificación con el destino; esto te pregunta si quieres ir ahora
// (así los dos terminan en el mismo lugar). Solo reacciona a las recientes
// (< 2 min) y una sola vez por notificación.
const ALLOWED = /^\/(games\/[a-z0-9-]+|vr|mundo|vr\/sala\/[a-z0-9]{6,12})$/

export default function SocialRedirector() {
  const notifications = useNotificationsStore((s) => s.notifications)
  const handled = useRef(new Set())

  useEffect(() => {
    for (const n of notifications) {
      if (n.social_kind !== 'invite_accepted' || handled.current.has(n.id)) continue
      handled.current.add(n.id)
      const path = n.social_payload?.path
      if (!path || !ALLOWED.test(path) || Date.now() - new Date(n.created_at).getTime() > 120_000) continue
      if (window.confirm(`${n.title}\n${n.body ?? ''}\n\n¿Ir ahora?`)) window.location.assign(path)
    }
  }, [notifications])

  return null
}
