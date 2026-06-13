import { useItemEffectsStore } from '../../stores/useItemEffectsStore'
import ThemeController from './ThemeController'
import CameraButton from '../mascot/CameraButton'
import FocusBoxModal from '../mascot/FocusBoxModal'

// Renders the visible effects of interactive "Objetos" (Cámara, Caja del
// TDAH, Reina Nefertiti) wherever the user is in the app — not just inside a
// course — so activating them in the mascot's Objetos panel always does
// something.
export default function GlobalItemEffects() {
  const cameraActive = useItemEffectsStore((s) => !!s.activeItems['camara'])
  const focusBoxActive = useItemEffectsStore((s) => !!s.activeItems['caja-tdah'])

  return (
    <>
      <ThemeController />
      {cameraActive && <CameraButton />}
      {focusBoxActive && <FocusBoxModal />}
    </>
  )
}
