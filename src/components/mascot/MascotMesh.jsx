import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'

// Subtle idle bob only — no constant spinning. The mascot stays facing
// forward so it reads as a calm, static character rather than a spinning toy.
function useIdleFloat(ref, { speed = 1.2, amplitude = 0.08 } = {}) {
  useFrame(({ clock }) => {
    if (!ref.current) return
    const t = clock.getElapsedTime()
    ref.current.position.y = Math.sin(t * speed) * amplitude
  })
}

const GEOMETRIES = {
  box: <boxGeometry args={[1.2, 1.2, 1.2]} />,
  sphere: <sphereGeometry args={[1, 32, 32]} />,
  cone: <coneGeometry args={[1, 1.6, 32]} />,
  torus: <torusGeometry args={[0.9, 0.35, 16, 32]} />,
  capsule: <capsuleGeometry args={[0.6, 1, 8, 16]} />,
  octahedron: <octahedronGeometry args={[1.1]} />,
  torusKnot: <torusKnotGeometry args={[0.7, 0.25, 100, 16]} />,
}

// Placeholder "3D model" built from primitives until a real GLTF cat is
// available on the server.
function CatMesh({ color }) {
  const ref = useRef()
  useIdleFloat(ref)

  return (
    <group ref={ref}>
      <mesh position={[0, -0.25, 0]}>
        <capsuleGeometry args={[0.55, 0.6, 8, 16]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[0, 0.65, 0]}>
        <sphereGeometry args={[0.45, 32, 32]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[-0.25, 1.05, 0]} rotation={[0, 0, -0.4]}>
        <coneGeometry args={[0.15, 0.32, 16]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[0.25, 1.05, 0]} rotation={[0, 0, 0.4]}>
        <coneGeometry args={[0.15, 0.32, 16]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[0.5, -0.5, -0.15]} rotation={[0, 0, 1]}>
        <capsuleGeometry args={[0.1, 0.6, 8, 16]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[0, 0.6, 0.42]}>
        <sphereGeometry args={[0.18, 16, 16]} />
        <meshStandardMaterial color="#fff7ed" />
      </mesh>
    </group>
  )
}

// Loads a real GLTF/GLB model when the mascot defines `modelPath` (e.g.
// public/models/orange-cat.glb -> modelPath: '/models/orange-cat.glb').
function GltfMesh({ modelPath }) {
  const ref = useRef()
  const { scene } = useGLTF(modelPath)
  useIdleFloat(ref)

  return <primitive ref={ref} object={scene} />
}

export default function MascotMesh({ mascot }) {
  const meshRef = useRef()
  useIdleFloat(meshRef)

  if (mascot.modelPath) {
    return <GltfMesh modelPath={mascot.modelPath} />
  }

  if (mascot.geometry === 'cat') {
    return <CatMesh color={mascot.color} />
  }

  return (
    <mesh ref={meshRef}>
      {GEOMETRIES[mascot.geometry] ?? GEOMETRIES.box}
      <meshStandardMaterial color={mascot.color} />
    </mesh>
  )
}
