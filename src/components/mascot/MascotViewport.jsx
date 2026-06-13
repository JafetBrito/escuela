import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import MascotMesh from './MascotMesh'
import MascotEmotionOverlay from './MascotEmotionOverlay'
import { useMascotStore } from '../../stores/useMascotStore'
import { getMascotById } from '../../data/mascotRegistry'

export default function MascotViewport({ className = '', showEmotions = false }) {
  const selectedMascotId = useMascotStore((s) => s.selectedMascotId)
  const mascot = getMascotById(selectedMascotId)

  return (
    <div className={`relative ${className}`}>
      <Canvas camera={{ position: [0, 0, 3.5], fov: 45 }} gl={{ preserveDrawingBuffer: true }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[3, 3, 3]} intensity={1.2} />
        <Suspense fallback={null}>
          <MascotMesh mascot={mascot} />
        </Suspense>
      </Canvas>
      {showEmotions && <MascotEmotionOverlay />}
    </div>
  )
}
