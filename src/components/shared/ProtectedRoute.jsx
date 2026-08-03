import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../../stores/useAuthStore'
import { useGameStore } from '../../stores/useGameStore'
import { useCourseContentStore } from '../../stores/useCourseContentStore'
import { isSupabaseConfigured } from '../../services/supabase/client'
import GlobalItemEffects from './GlobalItemEffects'
import PendingApprovalScreen from './PendingApprovalScreen'

export default function ProtectedRoute({ children, requireTutorial = false, blockAgeProfiles = [] }) {
  const authReady  = useAuthStore((s) => s.authReady)
  const session    = useAuthStore((s) => s.session)
  const isUnlocked = useAuthStore((s) => s.isUnlocked)
  const isAdmin    = useAuthStore((s) => s.isAdmin)
  const ageProfile = useAuthStore((s) => s.profile?.age_profile)
  const accountStatus = useAuthStore((s) => s.profile?.account_status)
  const oliverClass = useGameStore((s) => s.oliver.class)
  const coursesLoaded = useCourseContentStore((s) => s.loaded)

  if (!authReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-text-muted">
        Cargando…
      </div>
    )
  }

  // El contenido de los cursos vive en Supabase (tabla `courses`, ver
  // migration_024.sql) — courseRegistry.js expone getCourseData/
  // hasCourseData/COURSES_DATA como si fueran síncronos (para que los
  // ~20 componentes que ya los usan no tengan que cambiar), lo que solo
  // funciona si el fetch ya resolvió antes de que cualquiera de ellos monte
  // por primera vez. Este gate hace justo eso, igual que el de authReady.
  if (!coursesLoaded) {
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

  // Cuenta pendiente de aprobación (profiles.account_status — hoy solo pasa
  // con cuentas de niños creadas por un padre/tutor, ver migration_022.sql)
  // — bloquea CUALQUIER ruta protegida, va antes que todo lo demás porque no
  // hay ningún lugar de la plataforma al que tenga sentido dejarla entrar.
  if (accountStatus === 'pending' && !adminBypass) {
    return <PendingApprovalScreen />
  }

  // Perfil de edad (profiles.age_profile, asignado por el admin) — bloquea
  // por URL directa lo mismo que ya está escondido del nav en AppTopBar.jsx,
  // para que un alumno no se salte el ocultamiento tecleando la ruta. Va
  // ANTES del chequeo de requireTutorial: si no, a un niño sin oliverClass
  // se lo mandaría a /vr-templo (crear personaje VR) en vez de bloquearlo.
  if (blockAgeProfiles.includes(ageProfile) && !adminBypass) {
    return <Navigate to="/dashboard" replace />
  }

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
