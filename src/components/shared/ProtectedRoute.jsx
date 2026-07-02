import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../stores/useAuthStore'
import { useGameStore } from '../../stores/useGameStore'
import { isSupabaseConfigured } from '../../services/supabase/client'
import GlobalItemEffects from './GlobalItemEffects'

export default function ProtectedRoute({ children, requireTutorial = false }) {
  const authReady  = useAuthStore((s) => s.authReady)
  const session    = useAuthStore((s) => s.session)
  const isUnlocked = useAuthStore((s) => s.isUnlocked)
  const isAdmin    = useAuthStore((s) => s.isAdmin)
  const playerClass = useGameStore((s) => s.player.class)
  const oliverClass = useGameStore((s) => s.oliver.class)
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
  // Admins bypass this check — they can use /admin-setup to configure quickly.
  const adminBypass = isAdmin?.() ?? false
  if (!playerClass && !adminBypass && location.pathname !== '/crear-cuenta') {
    return <Navigate to="/crear-cuenta" replace />
  }

  // VR campus routes require the tutorial to be done first (mascot + Oliver's
  // class chosen). Send new users to the tutorial (/vr-templo).
  if (requireTutorial && !oliverClass && !adminBypass) {
    return <Navigate to="/vr-templo" replace />
  }

  return (
    <>
      {children}
      <GlobalItemEffects />
    </>
  )
}
