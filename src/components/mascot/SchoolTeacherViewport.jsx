import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import MascotMesh from './MascotMesh'
import SceneEffects from '../shared/SceneEffects'
import { getMascotById } from '../../data/mascotRegistry'
import { getSkinById } from '../../data/skinsRegistry'

// Same Canvas/lighting recipe as MascotViewport.jsx, but renders a FIXED
// mascot id (the school's "teacher") instead of the student's own selected
// mascot — every visitor to /escuela/:slug sees the same teacher.
export default function SchoolTeacherViewport({ mascotId, className = '' }) {
  const mascot = getMascotById(mascotId)
  const skin = getSkinById('default')

  return (
    <div className={`relative ${className}`}>
      <Canvas camera={{ position: [0, 0.4, 4.6], fov: 36 }} gl={{ preserveDrawingBuffer: true }}>
        <ambientLight color="#ffecd8" intensity={0.95} />
        <directionalLight position={[3, 3, 3]} color="#ffd9a0" intensity={1.4} />
        <directionalLight position={[-3, 1, -2]} color="#a0c4ff" intensity={0.28} />
        <Suspense fallback={null}>
          <MascotMesh mascot={mascot} skin={skin} />
        </Suspense>
        <SceneEffects />
      </Canvas>
    </div>
  )
}
