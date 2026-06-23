import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import MascotMesh from './MascotMesh'
import SceneEffects from '../shared/SceneEffects'
import { useGameStore, PLAYER_AVATARS } from '../../stores/useGameStore'
import { getSkinById } from '../../data/skinsRegistry'

// Renders the player's real 3D avatar model (hombre.glb/mujer.glb, picked
// at account creation) using the same MascotMesh pipeline, always with the
// default skin.
export default function AvatarViewport({ className = '' }) {
  const avatarId = useGameStore((s) => s.player.avatarId)
  const mascot = PLAYER_AVATARS.find((a) => a.id === avatarId) ?? PLAYER_AVATARS[0]
  const skin = getSkinById('default')

  return (
    <div className={`relative ${className}`}>
      <Canvas
        camera={{ position: [0, 0.4, 4.2], fov: 38 }}
        gl={{ preserveDrawingBuffer: true }}
      >
        <ambientLight color="#ffecd8" intensity={0.95} />
        <directionalLight position={[3, 3, 3]} color="#ffd9a0" intensity={1.4} />
        <directionalLight position={[-3, 1, -2]} color="#a0c4ff" intensity={0.28} />
        <directionalLight position={[0, -2, 1]} intensity={0.15} />
        <Suspense fallback={null}>
          <MascotMesh mascot={mascot} skin={skin} />
        </Suspense>
        <SceneEffects />
      </Canvas>
    </div>
  )
}
