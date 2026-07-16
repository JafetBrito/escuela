import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../../stores/useAuthStore'
import { useGameStore } from '../../stores/useGameStore'
import { isSupabaseConfigured } from '../../services/supabase/client'
import GlobalItemEffects from './GlobalItemEffects'

export default function ProtectedRoute({ children, requireTutorial = false }) {
  const authReady  = useAuthStore((s) => s.authReady)
  const session    = useAuthStore((s) => s.session)
  const isUnlocked = useAuthStore((s) => s.isUnlocked)
  const isAdmin    = useAuthStore((s) => s.isAdmin)
  const oliverClass = useGameStore((s) => s.oliver.class)

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

  const adminBypass = isAdmin?.() ?? false

  // Solo las rutas del mundo VR piden mascota+clase de Oliver — el resto de
  // la plataforma (dashboard, cursos, tienda...) solo requiere estar logueado.
  // Antes esto también bloqueaba TODAS las rutas si player.class era null,
  // lo que mandaba a usuarios YA existentes de vuelta a /crear-cuenta.
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
