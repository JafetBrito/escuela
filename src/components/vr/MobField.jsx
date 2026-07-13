import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import { useMobStore } from '../../stores/useMobStore'
import { getMobType } from '../../data/mobRegistry'

const PROJECTILE_MS = 350

// Bola de energía que viaja del jugador al monstruo cuando usas una
// habilidad a distancia (ver useMobStore.fireEffect / VRPage's handleUseSkill).
// El daño ya se aplicó al instante — esto es puramente el "se ve volar".
function Projectile({ effect }) {
  const meshRef = useRef()
  const startRef = useRef(performance.now())
  const from = useRef(new THREE.Vector3(...effect.from))
  const to = useRef(new THREE.Vector3(...effect.to))

  useFrame(() => {
    const t = Math.min(1, (performance.now() - startRef.current) / PROJECTILE_MS)
    meshRef.current?.position.lerpVectors(from.current, to.current, t)
  })

  return (
    <mesh ref={meshRef} position={effect.from}>
      <sphereGeometry args={[0.18, 12, 12]} />
      <meshStandardMaterial color={effect.color} emissive={effect.color} emissiveIntensity={1.4} />
    </mesh>
  )
}

// Un solo monstruo: geometría simple (sin modelo 3D dedicado, v1) + barra de
// vida y nombre flotantes. Gira lentamente para que no se vea estático.
function MobMesh({ mob }) {
  const meshRef = useRef()
  const type = getMobType(mob.typeId)

  useFrame((_, delta) => {
    if (meshRef.current) meshRef.current.rotation.y += delta * 0.6
  })

  if (!mob.alive) return null

  const pct = Math.max(0, mob.hp / mob.maxHp)

  return (
    <group position={mob.position}>
      <mesh ref={meshRef} position={[0, 0.6, 0]} castShadow>
        <icosahedronGeometry args={[0.5, 0]} />
        <meshStandardMaterial color={type.color} emissive={type.color} emissiveIntensity={0.35} roughness={0.4} />
      </mesh>
      <Html position={[0, 1.5, 0]} center distanceFactor={10}>
        <div className="pointer-events-none flex flex-col items-center gap-1">
          <span className="whitespace-nowrap rounded-full bg-surface/90 px-2 py-0.5 text-[11px] font-bold text-text shadow">
            {type.icon} {type.name}
          </span>
          <span className="h-1.5 w-16 overflow-hidden rounded-full bg-black/40">
            <span className="block h-full rounded-full bg-red-500 transition-all" style={{ width: `${pct * 100}%` }} />
          </span>
        </div>
      </Html>
    </group>
  )
}

// Renderiza los monstruos instanciados del jugador (ver useMobStore.js) y
// revisa periódicamente si alguno debe reaparecer tras su muerte.
export default function MobField() {
  const mobs = useMobStore((s) => s.mobs)
  const effects = useMobStore((s) => s.effects)
  const respawnCheck = useMobStore((s) => s.respawnCheck)
  const sinceCheckRef = useRef(0)

  useFrame((_, delta) => {
    sinceCheckRef.current += delta
    if (sinceCheckRef.current < 1) return
    sinceCheckRef.current = 0
    respawnCheck()
  })

  return (
    <>
      {mobs.map((mob) => <MobMesh key={mob.id} mob={mob} />)}
      {effects.filter((e) => e.ranged).map((e) => <Projectile key={e.id} effect={e} />)}
    </>
  )
}
