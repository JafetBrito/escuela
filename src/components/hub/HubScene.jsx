import { Suspense, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Sparkles } from '@react-three/drei'
import * as THREE from 'three'
import MascotMesh from '../mascot/MascotMesh'

// Escena 3D ligera del Hub móvil: plataforma con el color de la clase, tu avatar y tu mascota. `focus` decide
// quién va al frente (la mascota en la pestaña Mascota, el avatar en Perfil) y `reaction` ({type, t0, color})
// dispara la animación: comer, caricia, descanso o demostración de habilidad. `mood` (0-100) cambia la postura.
const lerp = (a, b, t) => a + (b - a) * t
const POSE = {
  pet: { mascot: { x: 0, z: 0.6, s: 1.15 }, avatar: { x: 1.5, z: -1.6, s: 0.8 } },
  profile: { mascot: { x: -1.5, z: -0.6, s: 0.62 }, avatar: { x: 0, z: 0.4, s: 1.12 } },
}

function Actor({ mascot, skin, role, focus, reaction, mood, energy }) {
  const root = useRef(), body = useRef(), ring = useRef()
  useFrame((state, dt) => {
    const g = root.current, b = body.current
    if (!g || !b) return
    const k = 1 - Math.exp(-6 * dt), tgt = POSE[focus][role], tt = state.clock.elapsedTime
    g.position.x = lerp(g.position.x, tgt.x, k); g.position.z = lerp(g.position.z, tgt.z, k)
    const base = lerp(g.scale.x, tgt.s * (role === 'mascot' && energy < 20 ? 0.94 : 1), k)
    // postura: ánimo bajo = encorvado y más lento
    const m = mood / 100
    let y = 0, sy = 1, rz = (1 - m) * 0.22, ry = 0, ringS = 0, ringO = 0
    y += Math.sin(tt * (1.2 + m)) * (0.02 + m * 0.04)
    const age = reaction ? (performance.now() - reaction.t0) / 1000 : 99
    const mine = reaction && (role === 'mascot' || reaction.type === 'profile')
    if (mine && age < 3) {
      if (reaction.type === 'feed' && age < 1) sy = 1 + 0.14 * Math.sin(age * 26) * (1 - age)
      if (reaction.type === 'caress' && age < 1.4) { y += Math.abs(Math.sin(age * 9)) * 0.4 * Math.exp(-age * 1.6); rz += Math.sin(age * 14) * 0.12 * (1 - age / 1.4) }
      if (reaction.type === 'rest') { rz = lerp(rz, 1.15, Math.min(1, age * 3)); y -= 0.25 * Math.min(1, age * 3); if (age > 2.4) rz = lerp(rz, 0, Math.min(1, (age - 2.4) * 3)) }
      if (reaction.type === 'skill' && age < 1.4) {
        y += Math.sin(Math.min(1, age / 0.7) * Math.PI) * 1.0
        ry += age < 0.8 ? age * 9 : 0
        ringS = 0.6 + age * 3.4; ringO = Math.max(0, 1 - age / 1.4)
      }
    }
    g.scale.setScalar(base); g.position.y = base // los pies del modelo quedan a -1·escala: esto los apoya en la plataforma
    b.position.y = y; b.scale.y = sy; b.rotation.z = rz; b.rotation.y = ry
    if (ring.current) { ring.current.scale.setScalar(ringS || 0.001); ring.current.material.opacity = ringO; ring.current.visible = ringO > 0.01 }
  })
  return (
    <group ref={root} position={[role === 'mascot' ? 0 : 1.5, 0, 0]}>
      <group ref={body}>
        <MascotMesh mascot={mascot} skin={skin} />
      </group>
      <mesh ref={ring} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.9, 0]} visible={false}>
        <torusGeometry args={[1, 0.05, 8, 40]} />
        <meshBasicMaterial color={reaction?.color || '#ffd24a'} transparent opacity={0} toneMapped={false} />
      </mesh>
    </group>
  )
}

export default function HubScene({ accent = '#a855f7', mascot, avatar, skin, avatarSkin, focus, reaction, needs }) {
  return (
    <Canvas dpr={[1, 1.5]} camera={{ position: [0, 0.9, 6.2], fov: 38 }} gl={{ antialias: true, powerPreference: 'low-power' }}>
      <ambientLight color="#ffecd8" intensity={0.95} />
      <directionalLight position={[3, 4, 3]} color="#ffd9a0" intensity={1.5} />
      <directionalLight position={[-3, 1, -2]} color={accent} intensity={0.55} />
      <Suspense fallback={null}>
        <group position={[0, -0.95, 0]}>
          <mesh position={[0, -0.12, 0]}><cylinderGeometry args={[3.1, 3.3, 0.24, 36]} /><meshStandardMaterial color="#14141f" roughness={0.9} /></mesh>
          <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[2.7, 3.0, 48]} /><meshBasicMaterial color={accent} toneMapped={false} /></mesh>
          <mesh position={[0, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[2.7, 48]} /><meshStandardMaterial color={new THREE.Color(accent).multiplyScalar(0.12)} roughness={1} /></mesh>
          <group>
            <Actor role="mascot" mascot={mascot} skin={skin} focus={focus} reaction={reaction} mood={needs.mood} energy={needs.energy} />
            <Actor role="avatar" mascot={avatar} skin={avatarSkin} focus={focus} reaction={reaction} mood={100} energy={100} />
          </group>
        </group>
        <Sparkles count={26} scale={[7, 4, 5]} size={3} speed={0.3} color={accent} position={[0, 0.6, 0]} />
      </Suspense>
    </Canvas>
  )
}
