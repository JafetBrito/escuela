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

  // VR world routes: the tutorial (/vr-templo) is where mascot + Oliver's
  // class get chosen. Without this, anyone who reaches /vr with no Oliver
  // class (sync failure, old account, etc.) saw a bare picker modal floating
  // in the world instead of being sent back to the place that explains it.
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
