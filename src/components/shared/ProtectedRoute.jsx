import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../stores/useAuthStore'
import { useGameStore } from '../../stores/useGameStore'
import { isSupabaseConfigured } from '../../services/supabase/client'
import GlobalItemEffects from './GlobalItemEffects'

export default function ProtectedRoute({ children }) {
  const authReady  = useAuthStore((s) => s.authReady)
  const session    = useAuthStore((s) => s.session)
  const isUnlocked = useAuthStore((s) => s.isUnlocked)
  const playerClass = useGameStore((s) => s.player.class)
  const location   = useLocation()

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

  // Account exists but onboarding was never finished (avatar + class not set).
  // Redirect to the registration wizard so the user can complete setup.
  if (!playerClass && location.pathname !== '/crear-cuenta') {
    return <Navigate to="/crear-cuenta" replace />
  }

  return (
    <>
      {children}
      <GlobalItemEffects />
    </>
  )
}
