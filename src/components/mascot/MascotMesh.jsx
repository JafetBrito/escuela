import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'

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
// public/orange_cat.glb -> modelPath: '/orange_cat.glb'). The model is
// auto-centered and scaled to fit a ~2-unit-tall viewport regardless of the
// units it was exported with.
function GltfMesh({ modelPath }) {
  const ref = useRef()
  const { scene } = useGLTF(modelPath)
  useIdleFloat(ref)

  const model = useMemo(() => {
    const clone = scene.clone(true)
    const box = new THREE.Box3().setFromObject(clone)
    const size = new THREE.Vector3()
    const center = new THREE.Vector3()
    box.getSize(size)
    box.getCenter(center)

    const maxDimension = Math.max(size.x, size.y, size.z) || 1
    const scale = 2 / maxDimension
    clone.scale.setScalar(scale)
    clone.position.set(-center.x * scale, -center.y * scale, -center.z * scale)

    return clone
  }, [scene])

  return <primitive ref={ref} object={model} />
}

export default function MascotMesh({ mascot, skin }) {
  const meshRef = useRef()
  useIdleFloat(meshRef)

  // "Aspecto" only re-skins the color palette — it never swaps the model.
  const color = skin?.color ?? mascot.color

  if (mascot.modelPath) {
    return <GltfMesh modelPath={mascot.modelPath} />
  }

  if (mascot.geometry === 'cat') {
    return <CatMesh color={color} />
  }

  return (
    <mesh ref={meshRef}>
      {GEOMETRIES[mascot.geometry] ?? GEOMETRIES.box}
      <meshStandardMaterial color={color} />
    </mesh>
  )
}
