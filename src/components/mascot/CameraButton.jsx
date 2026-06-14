import { useState } from 'react'
import html2canvas from 'html2canvas-pro'
import { useGalleryStore } from '../../stores/useGalleryStore'
import { useDraggablePopup } from '../../hooks/useDraggablePopup'

// Floating capture button shown while the "Cámara" objeto is active. Renders
// the current page to a canvas and stores it in the gallery so the user can
// label it later in the mascot's Galería tab.
export default function CameraButton() {
  const addShot = useGalleryStore((s) => s.addShot)
  const shotsCount = useGalleryStore((s) => s.shots.length)
  const [capturing, setCapturing] = useState(false)
  const { elRef, style, onPointerDown } = useDraggablePopup('camara')

  const handleCapture = async () => {
    setCapturing(true)
    try {
      const canvas = await html2canvas(document.body, { useCORS: true, logging: false })
      const dataUrl = canvas.toDataURL('image/png')
      addShot({ dataUrl, label: `Captura ${shotsCount + 1}` })
    } catch (err) {
      console.error('No se pudo tomar la captura', err)
    } finally {
      setCapturing(false)
    }
  }

  return (
    <button
      ref={elRef}
      style={{ ...style, touchAction: 'none' }}
      onClick={handleCapture}
      onPointerDown={onPointerDown}
      disabled={capturing}
      className="fixed bottom-4 left-4 z-40 flex h-14 w-14 cursor-grab items-center justify-center rounded-full border-2 border-primary bg-surface text-2xl shadow-lg transition-transform active:cursor-grabbing hover:scale-105 disabled:opacity-60 sm:bottom-6 sm:left-6"
      aria-label="Tomar captura de pantalla"
      title="Tomar captura de pantalla (arrastra para mover)"
    >
      {capturing ? '⏳' : '📸'}
    </button>
  )
}
