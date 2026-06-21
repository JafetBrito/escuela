import { useRef, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

const _flashTarget = new THREE.Object3D()

// Spotlight attached to the camera's look direction (yaw/pitch), used by
// dark worlds (the cave, etc.) to light up whatever the player is facing.
export function FlashlightSpot({ playerPositionRef, cameraRef }) {
  const lightRef = useRef()
  const { scene } = useThree()
  useEffect(() => {
    scene.add(_flashTarget)
    return () => scene.remove(_flashTarget)
  }, [scene])
  useFrame(() => {
    if (!lightRef.current || !playerPositionRef.current) return
    const pos = playerPositionRef.current
    const { yaw, pitch } = cameraRef.current
    const ox = pos.x, oy = pos.y + 1.6, oz = pos.z
    lightRef.current.position.set(ox, oy, oz)
    const dx = -Math.sin(yaw) * Math.cos(pitch)
    const dy = -Math.sin(pitch)
    const dz = -Math.cos(yaw) * Math.cos(pitch)
    _flashTarget.position.set(ox + dx * 12, oy + dy * 12, oz + dz * 12)
    _flashTarget.updateMatrixWorld()
    lightRef.current.target = _flashTarget
  })
  return (
    <spotLight
      ref={lightRef}
      color="#fff4cc"
      intensity={12}
      angle={Math.PI / 7}
      penumbra={0.3}
      distance={35}
      decay={2}
    />
  )
}
