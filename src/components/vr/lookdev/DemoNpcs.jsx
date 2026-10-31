import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Html, useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { clone as cloneSkinned } from 'three/examples/jsm/utils/SkeletonUtils.js'
import { getMascotById } from '../../../data/mascotRegistry'
import { useNpcSpeechStore } from '../../../stores/useNpcSpeechStore'
import { DEMO_NPCS, npcName, npcEmoji } from './demoNpcData'

// Material "estilizado": toon de 4 tonos con la misma textura original — el modelo
// no cambia, solo cómo reacciona a la luz, para que case con el mundo low-poly.
const GRADIENT = (() => {
  const t = new THREE.DataTexture(new Uint8Array([70, 140, 205, 255]), 4, 1, THREE.RedFormat)
  t.minFilter = t.magFilter = THREE.NearestFilter; t.needsUpdate = true
  return t
})()
const toon = (m) => new THREE.MeshToonMaterial({
  gradientMap: GRADIENT, color: m.color?.clone() ?? new THREE.Color('#ffffff'), map: m.map ?? null,
  transparent: m.transparent, opacity: m.opacity, side: m.side, alphaTest: m.alphaTest,
})

function buildVariants(scene, size) {
  const make = (stylize) => {
    const c = cloneSkinned(scene)
    c.traverse((o) => {
      if (!o.isMesh) return
      o.castShadow = true; o.receiveShadow = true
      if (stylize) o.material = Array.isArray(o.material) ? o.material.map(toon) : toon(o.material)
    })
    const box = new THREE.Box3().setFromObject(c), sz = box.getSize(new THREE.Vector3())
    const s = size / (Math.max(sz.x, sz.y, sz.z) || 1)
    c.scale.setScalar(s)
    c.position.set(-((box.min.x + box.max.x) / 2) * s, -box.min.y * s, -((box.min.z + box.max.z) / 2) * s) // pies en el suelo
    const g = new THREE.Group(); g.add(c)
    return g
  }
  return { normal: make(false), toon: make(true) }
}

const dists = {} // id -> distancia al jugador (módulo: lo escriben los NPC, lo lee el padre)
const angDiff = (a, b) => Math.atan2(Math.sin(b - a), Math.cos(b - a))

function Npc({ spec, stylized, groundAt }) {
  const mascot = getMascotById(spec.mascotId)
  const { scene } = useGLTF(mascot.modelPath)
  const variants = useMemo(() => buildVariants(scene, spec.size), [scene, spec.size])
  const root = useRef(), body = useRef(), yaw = useRef(0), ang = useRef((spec.mascotId * 2.4) % 6.28)
  const { camera } = useThree()
  const speaking = useNpcSpeechStore((s) => s.activeNpcId === spec.id)

  useFrame((s, dt0) => {
    const dt = Math.min(dt0, 0.05), r = root.current, b = body.current
    if (!r || !b) return
    let [x, z] = spec.pos
    const dx = camera.position.x - r.position.x, dz = camera.position.z - r.position.z, d = Math.hypot(dx, dz)
    dists[spec.id] = d
    const near = d < 14, busy = speaking || d < 6
    let targetYaw = near ? Math.atan2(dx, dz) : 0
    if (spec.wander) { // Oliver pasea en círculo y se detiene cuando alguien se acerca
      if (!busy) ang.current += dt * 0.22
      x += Math.cos(ang.current) * spec.wander; z += Math.sin(ang.current) * spec.wander
      if (!busy) targetYaw = Math.atan2(-Math.sin(ang.current), Math.cos(ang.current))
    }
    r.position.set(x, groundAt(x, z), z)
    yaw.current += angDiff(yaw.current, targetYaw) * (1 - Math.exp(-5 * dt))
    r.rotation.y = yaw.current
    const t = s.clock.elapsedTime
    b.position.y = Math.sin(t * 1.6 + spec.mascotId) * 0.03                 // respira
    b.rotation.x = speaking ? Math.sin(t * 6) * 0.04 : 0                    // asiente al hablar
  })

  return (
    <group ref={root}>
      <group ref={body} rotation={[0, mascot.modelRotationY ?? 0, 0]}>
        <primitive object={stylized ? variants.toon : variants.normal} />
      </group>
      {/* Luz propia del personaje: con el sol bajo y de frente, sin esto quedan en silueta; con una luz global lavaría toda la plaza. */}
      <pointLight position={[0, spec.size * 0.8, 1.6]} color="#ffe0c8" intensity={spec.size * 3.2} distance={5.5} decay={2} />
      <Html position={[0, spec.size + 0.45, 0]} center zIndexRange={[15, 0]} style={{ pointerEvents: 'none' }}>
        <div className="whitespace-nowrap rounded-full border border-white/25 bg-black/50 px-2.5 py-0.5 text-[11px] font-bold text-white backdrop-blur-sm">
          {speaking ? '💬' : npcEmoji(spec.id)} {npcName(spec.id)}
        </div>
      </Html>
    </group>
  )
}

const NEAR_RADIUS = 5
// onNear(id|null): el NPC más cercano dentro del radio de interacción (solo notifica al cambiar).
export default function DemoNpcs({ stylized, groundAt, onNear }) {
  const last = useRef(null)
  useFrame(() => {
    let best = null, bd = NEAR_RADIUS
    for (const n of DEMO_NPCS) if ((dists[n.id] ?? 1e9) < bd) { bd = dists[n.id]; best = n.id }
    if (best !== last.current) { last.current = best; onNear(best) }
  })
  useEffect(() => () => { for (const k of Object.keys(dists)) delete dists[k] }, [])
  return DEMO_NPCS.map((n) => <Npc key={n.id} spec={n} stylized={stylized} groundAt={groundAt} />)
}
