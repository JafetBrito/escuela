import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import MascotMesh from './MascotMesh'
import { useGameStore } from '../../stores/useGameStore'
import { getMascotById } from '../../data/mascotRegistry'
import { getSkinById } from '../../data/skinsRegistry'

// Renders the player's 3D avatar model (stored in mascotRegistry at avatarRegistryId)
// using the same MascotMesh pipeline, always with the default skin.
export default function AvatarViewport({ className = '' }) {
  const avatarRegistryId = useGameStore((s) => s.player.avatarRegistryId)
  const mascot = getMascotById(avatarRegistryId)
  const skin = getSkinById('default')

  return (
    <div className={`relative ${className}`}>
      <Canvas
        camera={{ position: [0, 0.4, 4.2], fov: 38 }}
        gl={{ preserveDrawingBuffer: true }}
      >
        <ambientLight intensity={0.8} />
        <directionalLight position={[3, 3, 3]} intensity={1.4} />
        <directionalLight position={[-3, 1, -2]} intensity={0.5} />
        <directionalLight position={[0, -2, 1]} intensity={0.2} />
        <Suspense fallback={null}>
          <MascotMesh mascot={mascot} skin={skin} />
        </Suspense>
      </Canvas>
    </div>
  )
}
