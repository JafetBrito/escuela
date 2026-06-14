import { Suspense, useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import AppTopBar from '../shared/AppTopBar'
import MascotMesh from '../mascot/MascotMesh'
import MascotCompanion from '../mascot/MascotCompanion'
import { useMascotStore } from '../../stores/useMascotStore'
import { getMascotById } from '../../data/mascotRegistry'
import { getSkinById } from '../../data/skinsRegistry'

const MOVE_SPEED = 4
const TURN_SPEED = 8
// MascotMesh normalizes models to ~2 units tall. The scenery footprint is
// ~24 units wide, so we shrink the player to a human-ish scale that doesn't
// dwarf the structure it's walking around.
const PLAYER_SCALE = 0.45
const WALK_CYCLE_SPEED = 9
const WALK_BOB_HEIGHT = 0.07
const WALK_TILT = 0.06

// Warm "ruinas al atardecer" palette applied to any untextured surface of the
// scenery, so a flat-grey export still reads as a colorful scene.
const SCENERY_PALETTE = ['#c2703d', '#e8c477', '#9b5a3a', '#7d8597', '#3f9e7a', '#caa46c']

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

// Loads the VR background model, scales it to a roomy walkable footprint, and
// tints any untextured surfaces so it doesn't look flat/grey.
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

    let paletteIndex = 0
    clone.traverse((child) => {
      if (!child.isMesh) return
      child.castShadow = true
      child.receiveShadow = true

      const material = child.material
      if (material && !material.map) {
        const tinted = material.clone()
        tinted.color = new THREE.Color(SCENERY_PALETTE[paletteIndex % SCENERY_PALETTE.length])
        child.material = tinted
        paletteIndex += 1
      }
    })

    return clone
  }, [scene])

  return <primitive object={model} />
}

// Your mascot, moved with WASD/arrow keys. It bobs and tilts while walking,
// and the camera follows behind it.
function Player({ mascot, skin, keysRef }) {
  const group = useRef()
  const meshGroup = useRef()
  const { camera } = useThree()
  const cameraTarget = useRef(new THREE.Vector3())
  const walkCycle = useRef(0)

  useFrame((_, delta) => {
    if (!group.current) return
    const keys = keysRef.current

    const move = new THREE.Vector3()
    if (keys['w'] || keys['arrowup']) move.z -= 1
    if (keys['s'] || keys['arrowdown']) move.z += 1
    if (keys['a'] || keys['arrowleft']) move.x -= 1
    if (keys['d'] || keys['arrowright']) move.x += 1

    const isMoving = move.lengthSq() > 0

    if (isMoving) {
      move.normalize().multiplyScalar(MOVE_SPEED * delta)
      group.current.position.add(move)

      const targetAngle = Math.atan2(move.x, move.z)
      let angleDiff = targetAngle - group.current.rotation.y
      angleDiff = Math.atan2(Math.sin(angleDiff), Math.cos(angleDiff))
      group.current.rotation.y += angleDiff * Math.min(1, TURN_SPEED * delta)

      walkCycle.current += delta * WALK_CYCLE_SPEED
    } else {
      walkCycle.current = 0
    }

    if (meshGroup.current) {
      const bob = isMoving ? Math.abs(Math.sin(walkCycle.current)) * WALK_BOB_HEIGHT : 0
      const tilt = isMoving ? Math.sin(walkCycle.current) * WALK_TILT : 0
      meshGroup.current.position.y = bob
      meshGroup.current.rotation.z = tilt
      meshGroup.current.rotation.x = isMoving ? WALK_TILT * 0.6 : 0
    }

    const behind = new THREE.Vector3(0, 1.6, 3.4).applyAxisAngle(
      new THREE.Vector3(0, 1, 0),
      group.current.rotation.y,
    )
    cameraTarget.current.copy(group.current.position).add(behind)
    camera.position.lerp(cameraTarget.current, 0.06)
    camera.lookAt(
      group.current.position.x,
      group.current.position.y + 0.6,
      group.current.position.z,
    )
  })

  return (
    <group ref={group}>
      <group ref={meshGroup} scale={PLAYER_SCALE}>
        <MascotMesh mascot={mascot} skin={skin} />
      </group>
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
        <Canvas camera={{ position: [0, 1.6, 3.4], fov: 50 }} shadows>
          <color attach="background" args={['#3b2a1f']} />
          <fog attach="fog" args={['#d98e4a', 12, 42]} />
          <ambientLight intensity={0.55} color="#c9b8ff" />
          <directionalLight position={[10, 15, 8]} intensity={1.4} color="#ffd9a0" castShadow />
          <directionalLight position={[-8, 6, -10]} intensity={0.5} color="#5a7fd9" />
          <Suspense fallback={null}>
            <Scenery />
            <Player mascot={mascot} skin={skin} keysRef={keysRef} />
          </Suspense>
        </Canvas>

        <div className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 rounded-xl bg-surface/90 px-4 py-2 text-center text-sm text-text shadow-lg backdrop-blur">
          Muévete con <strong>W A S D</strong> o las flechas del teclado 🎮
        </div>
      </div>

      <MascotCompanion />
    </div>
  )
}
