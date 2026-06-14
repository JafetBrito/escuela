import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../../stores/useAuthStore'
import { isSupabaseConfigured } from '../../services/supabase/client'
import GlobalItemEffects from './GlobalItemEffects'

export default function ProtectedRoute({ children }) {
  const authReady = useAuthStore((s) => s.authReady)
  const session = useAuthStore((s) => s.session)
  const isUnlocked = useAuthStore((s) => s.isUnlocked)

  if (!authReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-text-muted">
        Cargando…
      </div>
    )
  }

  const loggedIn = isSupabaseConfigured() ? Boolean(session) : isUnlocked

  if (!loggedIn) {
    return <Navigate to="/login" replace />
  }

  return (
    <>
      {children}
      <GlobalItemEffects />
    </>
  )
}
