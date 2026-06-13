import { useEffect } from 'react'
import { useItemEffectsStore } from '../../stores/useItemEffectsStore'
import NefertitiOverlay from './NefertitiOverlay'

// Applies the "Reina Nefertiti" desert theme to the whole document while the
// objeto is active, plus a floating emoji overlay/banner.
export default function ThemeController() {
  const nefertitiActive = useItemEffectsStore((s) => !!s.activeItems['reina-nefertiti'])
  const lightThemeActive = useItemEffectsStore((s) => !!s.activeItems['tema-claro'])

  useEffect(() => {
    if (nefertitiActive) {
      document.documentElement.dataset.theme = 'desert'
    } else if (lightThemeActive) {
      document.documentElement.dataset.theme = 'light'
    } else {
      document.documentElement.dataset.theme = ''
    }
    return () => {
      document.documentElement.dataset.theme = ''
    }
  }, [nefertitiActive, lightThemeActive])

  return <NefertitiOverlay />
}
