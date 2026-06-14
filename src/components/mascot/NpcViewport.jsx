import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import MascotMesh from './MascotMesh'
import { getMascotById } from '../../data/mascotRegistry'
import { getSkinById } from '../../data/skinsRegistry'

// Lightweight 3D viewport for a fixed mascot model (used for NPCs like the
// "Mago" in Misiones/Tienda), independent from the user's selected mascot.
export default function NpcViewport({ mascotId, className = '' }) {
  const mascot = getMascotById(mascotId)
  const skin = getSkinById('default')

  return (
    <div className={`relative ${className}`}>
      <Canvas camera={{ position: [0, 0.4, 4.2], fov: 38 }}>
        <ambientLight intensity={0.7} />
        <directionalLight position={[3, 3, 3]} intensity={1.2} />
        <directionalLight position={[-3, 1, -2]} intensity={0.4} />
        <Suspense fallback={null}>
          <MascotMesh mascot={mascot} skin={skin} />
        </Suspense>
      </Canvas>
    </div>
  )
}
