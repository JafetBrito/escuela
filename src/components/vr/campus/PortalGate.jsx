import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import { useNavigate } from 'react-router-dom'
import * as THREE from 'three'
import { buildPortal } from './campusKit'
import { CAMPUS_S } from './campusWorld'

// Portales del VR. <PortalGate> dibuja uno (para la plaza, que no es un mapa por datos); <PortalWatcher> vigila
// al jugador y viaja al destino cuando camina a través de cualquiera (también los `portal` de los mapas por datos).
const SOLID = new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 0.95 })
const GLOW = new THREE.MeshBasicMaterial({ vertexColors: true, toneMapped: false, side: THREE.DoubleSide })

export function PortalGate({ position, rot = 0, color, label }) {
  const piece = useMemo(() => buildPortal({ color }), [color])
  return (
    <group position={position} rotation={[0, (rot * Math.PI) / 180, 0]} scale={CAMPUS_S}>
      <mesh geometry={piece.solid} material={SOLID} castShadow />
      <mesh geometry={piece.emissive} material={GLOW} />
      <Html center position={[0, 8.2, 0]} style={{ pointerEvents: 'none' }}>
        <div style={{ background: 'rgba(0,0,0,.65)', color: '#fff', padding: '3px 10px', borderRadius: 999, fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap', border: `1px solid ${color}` }}>{label}</div>
      </Html>
    </group>
  )
}

// portals: [{ x, y, z (unidades de mundo), to }]. Cruzar el velo (≈0.9 u del centro) lleva al destino.
export function PortalWatcher({ portals, playerPositionRef }) {
  const navigate = useNavigate(), t0 = useRef(null), fired = useRef(false)
  useFrame((state) => {
    if (fired.current) return
    t0.current ??= state.clock.elapsedTime
    const p = playerPositionRef.current
    if (!p || state.clock.elapsedTime - t0.current < 2.5) return // gracia al aparecer
    for (const q of portals) {
      if (Math.hypot(p.x - q.x, p.z - q.z) < 0.9 && Math.abs(p.y - q.y) < 1.2) { fired.current = true; navigate(q.to); return }
    }
  })
  return null
}
