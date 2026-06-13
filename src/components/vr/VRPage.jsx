import { Suspense, useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import AppTopBar from '../shared/AppTopBar'
import MascotMesh from '../mascot/MascotMesh'
import { useMascotStore } from '../../stores/useMascotStore'
import { getMascotById } from '../../data/mascotRegistry'
import { getSkinById } from '../../data/skinsRegistry'

const MOVE_SPEED = 4
const TURN_SPEED = 10

// Tracks which movement keys (WASD + arrows) are currently held down.
function useMovementKeys() {
  const keys = useRef({})

  useEffect(() => {
    const handleDown = (e) => {
      keys.current[e.key.toLowerCase()] = true
    }
    const handleUp = (e) => {
      keys.current[e.key.toLowerCase()] = false
    }
    window.addEventListener('keydown', handleDown)
    window.addEventListener('keyup', handleUp)
    return () => {
      window.removeEventListener('keydown', handleDown)
      window.removeEventListener('keyup', handleUp)
    }
  }, [])

  return keys
}

// Loads the VR background model and scales it to a roomy, walkable size.
function Scenery() {
  const { scene } = useGLTF('/fondo_azteca.glb')

  const model = useMemo(() => {
    const clone = scene.clone(true)
    const box = new THREE.Box3().setFromObject(clone)
    const size = new THREE.Vector3()
    const center = new THREE.Vector3()
    box.getSize(size)
    box.getCenter(center)

    const maxDimension = Math.max(size.x, size.z) || 1
    const scale = 24 / maxDimension
    clone.scale.setScalar(scale)
    clone.position.set(-center.x * scale, -box.min.y * scale, -center.z * scale)

    return clone
  }, [scene])

  return <primitive object={model} />
}

// Your mascot, moved with WASD/arrow keys. The camera follows behind it.
function Player({ mascot, skin, keysRef }) {
  const group = useRef()
  const { camera } = useThree()
  const cameraTarget = useRef(new THREE.Vector3())

  useFrame((_, delta) => {
    if (!group.current) return
    const keys = keysRef.current

    const move = new THREE.Vector3()
    if (keys['w'] || keys['arrowup']) move.z -= 1
    if (keys['s'] || keys['arrowdown']) move.z += 1
    if (keys['a'] || keys['arrowleft']) move.x -= 1
    if (keys['d'] || keys['arrowright']) move.x += 1

    if (move.lengthSq() > 0) {
      move.normalize().multiplyScalar(MOVE_SPEED * delta)
      group.current.position.add(move)

      const targetAngle = Math.atan2(move.x, move.z)
      let angleDiff = targetAngle - group.current.rotation.y
      angleDiff = Math.atan2(Math.sin(angleDiff), Math.cos(angleDiff))
      group.current.rotation.y += angleDiff * Math.min(1, TURN_SPEED * delta)
    }

    const behind = new THREE.Vector3(0, 2.5, 4.5).applyAxisAngle(
      new THREE.Vector3(0, 1, 0),
      group.current.rotation.y,
    )
    cameraTarget.current.copy(group.current.position).add(behind)
    camera.position.lerp(cameraTarget.current, 0.06)
    camera.lookAt(
      group.current.position.x,
      group.current.position.y + 1,
      group.current.position.z,
    )
  })

  return (
    <group ref={group}>
      <MascotMesh mascot={mascot} skin={skin} />
    </group>
  )
}

export default function VRPage() {
  const keysRef = useMovementKeys()
  const selectedMascotId = useMascotStore((s) => s.selectedMascotId)
  const selectedSkinId = useMascotStore((s) => s.selectedSkinId)
  const mascot = getMascotById(selectedMascotId)
  const skin = getSkinById(selectedSkinId)

  return (
    <div className="flex h-screen flex-col bg-background text-text">
      <AppTopBar />

      <div className="relative flex-1">
        <Canvas camera={{ position: [0, 2.5, 4.5], fov: 50 }} shadows>
          <color attach="background" args={['#0f172a']} />
          <ambientLight intensity={0.7} />
          <directionalLight position={[10, 15, 10]} intensity={1.3} castShadow />
          <Suspense fallback={null}>
            <Scenery />
            <Player mascot={mascot} skin={skin} keysRef={keysRef} />
          </Suspense>
        </Canvas>

        <div className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 rounded-xl bg-surface/90 px-4 py-2 text-center text-sm text-text shadow-lg backdrop-blur">
          Muévete con <strong>W A S D</strong> o las flechas del teclado 🎮
        </div>
      </div>
    </div>
  )
}
