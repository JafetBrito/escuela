import { useEffect } from 'react'
import { useItemEffectsStore } from '../../stores/useItemEffectsStore'
import { useAuthStore } from '../../stores/useAuthStore'
import NefertitiOverlay from './NefertitiOverlay'

// Applies the "Reina Nefertiti" desert theme to the whole document while the
// objeto is active, plus a floating emoji overlay/banner. Admin accounts get
// a "hacker" theme that overrides everything else — a visible, DB-driven
// proof that `profiles.role === 'admin'` loaded correctly on this device.
export default function ThemeController() {
  const nefertitiActive = useItemEffectsStore((s) => !!s.activeItems['reina-nefertiti'])
  const lightThemeActive = useItemEffectsStore((s) => !!s.activeItems['tema-claro'])
  const isAdmin = useAuthStore((s) => s.isAdmin)
  const adminActive = isAdmin?.() ?? false

  useEffect(() => {
    if (adminActive) {
      document.documentElement.dataset.theme = 'hacker'
    } else if (nefertitiActive) {
      document.documentElement.dataset.theme = 'desert'
    } else if (lightThemeActive) {
      document.documentElement.dataset.theme = 'light'
    } else {
      document.documentElement.dataset.theme = ''
    }
    return () => {
      document.documentElement.dataset.theme = ''
    }
  }, [adminActive, nefertitiActive, lightThemeActive])

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
