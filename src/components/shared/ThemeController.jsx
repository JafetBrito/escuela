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
export default function ThemeController() {
  const theme = useThemeStore((s) => s.theme)
  const isAdmin = useAuthStore((s) => s.isAdmin)
  const hackerThemeEnabled = useAdminThemeStore((s) => s.enabled)
  const adminActive = (isAdmin?.() ?? false) && hackerThemeEnabled

  useEffect(() => {
    // Un tema elegido explícitamente gana sobre el tema 'hacker' pasivo de
    // admin — si no, un admin nunca vería cambiar el color al elegir Claro/
    // Desierto en Ajustes.
    const explicitTheme = THEMES.find((t) => t.id === theme)?.dataTheme
    if (explicitTheme) {
      document.documentElement.dataset.theme = explicitTheme
    } else if (adminActive) {
      document.documentElement.dataset.theme = 'hacker'
    } else {
      document.documentElement.dataset.theme = ''
    }
    return () => {
      document.documentElement.dataset.theme = ''
    }
  }, [adminActive, theme])

  return (
    <>
      <NefertitiOverlay />
      {adminActive && (
        <div className="pointer-events-none fixed left-1/2 top-0 z-[9999] -translate-x-1/2 rounded-b-lg border border-t-0 border-[#39ff14]/50 bg-black/90 px-3 py-0.5 font-mono text-[10px] tracking-widest text-[#39ff14] shadow-[0_0_12px_rgba(57,255,20,0.5)]">
          ⚡ ADMIN MODE
        </div>
      )}
    </>
  )
}
