import { useItemEffectsStore } from '../../stores/useItemEffectsStore'
import ThemeController from './ThemeController'
import BookModal from './BookModal'
import RadioMiniPlayer from './RadioMiniPlayer'
import CameraButton from '../mascot/CameraButton'
import FocusBoxModal from '../mascot/FocusBoxModal'
import CalculatorWidget from './CalculatorWidget'

// Renders the visible effects of interactive "Objetos" (Cámara, Caja del
// TDAH, Reina Nefertiti, Libro, Cristal de Luz, Radio, Calculadora) wherever
// the user is in the app — not just inside a course — so activating them in
// the mascot's Objetos panel always does something.
export default function GlobalItemEffects() {
  const cameraActive = useItemEffectsStore((s) => !!s.activeItems['camara'])
  const focusBoxActive = useItemEffectsStore((s) => !!s.activeItems['caja-tdah'])
  const bookActive = useItemEffectsStore((s) => !!s.activeItems['libro'])
  const radioActive = useItemEffectsStore((s) => !!s.activeItems['radio'])
  const calcActive = useItemEffectsStore((s) => !!s.activeItems['calculadora'])

  return (
    <>
      <ThemeController />
      {cameraActive && <CameraButton />}
      {focusBoxActive && <FocusBoxModal />}
      {bookActive && <BookModal />}
      {radioActive && <RadioMiniPlayer />}
      {calcActive && <CalculatorWidget />}
    </>
  )
}
