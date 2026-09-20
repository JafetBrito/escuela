import { useEffect } from 'react'
import { useAuthStore } from '../../stores/useAuthStore'
import { useAdminThemeStore } from '../../stores/useAdminThemeStore'
import { useThemeStore, THEMES } from '../../stores/useThemeStore'
import NefertitiOverlay from './NefertitiOverlay'

// Aplica el tema elegido por el alumno en Ajustes → Apariencia (Oscuro/Claro/
// Desierto, ver useThemeStore.js). Admin accounts get a "hacker" theme that
// overrides everything else — a visible, DB-driven proof that
// `profiles.role === 'admin'` loaded correctly on this device. The admin can
// turn this passive theme off from DevToolsPanel — it's their own device
// preference, so it's gated by useAdminThemeStore on top of the role check.
//
// El perfil de edad (profiles.age_profile, asignado por el admin — ver
// AdminAgeProfilesPage.jsx) gana sobre TODO lo demás, incluyendo el tema que
// el propio alumno haya elegido: es un control parental/administrativo, no
// una preferencia, así que un niño no puede simplemente volver al tema
// normal desde Ajustes.
export default function ThemeController() {
  const theme = useThemeStore((s) => s.theme)
  const isAdmin = useAuthStore((s) => s.isAdmin)
  const isTeacher = useAuthStore((s) => s.isTeacher)
  const teacherActive = isTeacher?.() ?? false
  const ageProfile = useAuthStore((s) => s.profile?.age_profile)
  const hackerThemeEnabled = useAdminThemeStore((s) => s.enabled)
  const adminActive = (isAdmin?.() ?? false) && hackerThemeEnabled
  const forcedAgeTheme = ageProfile === 'kids' || ageProfile === 'seniors' ? ageProfile : null

  useEffect(() => {
    // Un tema elegido explícitamente gana sobre el tema 'hacker' pasivo de
    // admin — si no, un admin nunca vería cambiar el color al elegir Claro/
    // Desierto en Ajustes. El tema de perfil de edad gana sobre todo lo demás.
    const explicitTheme = THEMES.find((t) => t.id === theme)?.dataTheme
    if (forcedAgeTheme) {
      document.documentElement.dataset.theme = forcedAgeTheme
    } else if (explicitTheme) {
      document.documentElement.dataset.theme = explicitTheme
    } else if (teacherActive) {
      // Los profesores tienen su propio tema por defecto; si eligen otro, la
      // franja/insignia de abajo sigue marcándolos como profesor.
      document.documentElement.dataset.theme = 'teacher'
    } else if (adminActive) {
      document.documentElement.dataset.theme = 'hacker'
    } else {
      document.documentElement.dataset.theme = ''
    }
    return () => {
      document.documentElement.dataset.theme = ''
    }
  }, [adminActive, teacherActive, theme, forcedAgeTheme])

  return (
    <>
      <NefertitiOverlay />
      {teacherActive && (
        <>
          <div className="pointer-events-none fixed inset-x-0 top-0 z-[9998] h-1" style={{ background: 'linear-gradient(90deg, #f59e0b, #a78bfa, #f59e0b)' }} />
          <div className="pointer-events-none fixed left-1/2 top-1 z-[9999] -translate-x-1/2 rounded-b-lg border border-t-0 border-amber-400/60 bg-indigo-950/95 px-3 py-0.5 text-[10px] font-bold tracking-widest text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.4)]">
            🧑‍🏫 MODO PROFESOR
          </div>
        </>
      )}
      {adminActive && (
        <div className="pointer-events-none fixed left-1/2 top-0 z-[9999] -translate-x-1/2 rounded-b-lg border border-t-0 border-[#39ff14]/50 bg-black/90 px-3 py-0.5 font-mono text-[10px] tracking-widest text-[#39ff14] shadow-[0_0_12px_rgba(57,255,20,0.5)]">
          ⚡ ADMIN MODE
        </div>
      )}
    </>
  )
}
