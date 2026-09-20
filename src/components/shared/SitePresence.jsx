import { useEffect } from 'react'
import { useAuthStore } from '../../stores/useAuthStore'
import { startSitePresence } from '../../stores/useSitePresenceStore'

// Anuncia a la cuenta actual en la presencia del sitio (ver useSitePresenceStore).
// No se anuncian las cuentas de niños.
export default function SitePresence() {
  const userId = useAuthStore((s) => s.session?.user?.id)
  const email = useAuthStore((s) => s.session?.user?.email)
  const displayName = useAuthStore((s) => s.profile?.display_name)
  const avatarUrl = useAuthStore((s) => s.profile?.avatar_url)
  const googlePicture = useAuthStore((s) => s.googleUser?.picture)
  const ageProfile = useAuthStore((s) => s.profile?.age_profile)

  useEffect(() => {
    if (!userId || ageProfile === 'kids') return
    return startSitePresence({ userId, name: displayName || email?.split('@')[0] || 'Estudiante', avatar: avatarUrl || googlePicture })
  }, [userId, email, displayName, avatarUrl, googlePicture, ageProfile])

  return null
}
