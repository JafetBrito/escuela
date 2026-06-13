import { useEffect } from 'react'
import { useItemEffectsStore } from '../../stores/useItemEffectsStore'
import NefertitiOverlay from './NefertitiOverlay'

// Applies the "Reina Nefertiti" desert theme to the whole document while the
// objeto is active, plus a floating emoji overlay/banner.
export default function ThemeController() {
  const nefertitiActive = useItemEffectsStore((s) => !!s.activeItems['reina-nefertiti'])

  useEffect(() => {
    document.documentElement.dataset.theme = nefertitiActive ? 'desert' : ''
    return () => {
      document.documentElement.dataset.theme = ''
    }
  }, [nefertitiActive])

  return <NefertitiOverlay />
}
