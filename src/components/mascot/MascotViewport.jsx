import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import MascotMesh from './MascotMesh'
import MascotEmotionOverlay from './MascotEmotionOverlay'
import { useMascotStore } from '../../stores/useMascotStore'
import { useItemEffectsStore } from '../../stores/useItemEffectsStore'
import { getMascotById } from '../../data/mascotRegistry'
import { getSkinById } from '../../data/skinsRegistry'

// Mientras el objeto "Reina Nefertiti" está activo, la mascota toma
// temporalmente la apariencia de este modelo (además del tema dorado).
const NEFERTITI_MASCOT_ID = 10 // Mago Ancestral (mage_elder.glb)

export default function MascotViewport({ className = '', showEmotions = false }) {
  const selectedMascotId = useMascotStore((s) => s.selectedMascotId)
  const selectedSkinId = useMascotStore((s) => s.selectedSkinId)
  const nefertitiActive = useItemEffectsStore((s) => !!s.activeItems['reina-nefertiti'])
  const mascot = getMascotById(nefertitiActive ? NEFERTITI_MASCOT_ID : selectedMascotId)
  const skin = getSkinById(selectedSkinId)

  return (
    <div className={`relative ${className}`}>
      <Canvas camera={{ position: [0, 0.4, 4.2], fov: 38 }} gl={{ preserveDrawingBuffer: true }}>
        <ambientLight intensity={0.7} />
        <directionalLight position={[3, 3, 3]} intensity={1.2} />
        <directionalLight position={[-3, 1, -2]} intensity={0.4} />
        <Suspense fallback={null}>
          <MascotMesh mascot={mascot} skin={skin} />
        </Suspense>
      </Canvas>
      {skin.accessory && (
        <div
          className="pointer-events-none absolute left-1/2 top-3 -translate-x-1/2 text-3xl drop-shadow-lg"
          aria-hidden="true"
        >
          {skin.accessory}
        </div>
      )}
      {showEmotions && <MascotEmotionOverlay />}
    </div>
  )
}
