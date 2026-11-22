// Efectos de la pista que reaccionan a tus respuestas: los carriles equivocados se derrumban y un acierto lanza anillos de energía
import { useEffect, useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Html } from '@react-three/drei'
import { frame, pitchAt } from './track'
import { laneOf, flyAlt } from './racingData'
import { buildVehicle } from './vehicles'
import { emit } from './RaceFx'

const P = { x: 0, y: 0, z: 0, yaw: 0 }
const clamp01 = (x) => Math.max(0, Math.min(1, x))

// Losas de 20 m de cada carril. La losa de un carril incorrecto empieza a temblar, se inclina, cae y se pierde de vista.
export function CollapseLanes({ game, segs, material }) {
  const refs = useRef([]), started = useRef([])
  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    for (let i = 0; i < segs.length; i++) {
      const m = refs.current[i], sg = segs[i], f = game.forks[sg.fork]
      if (!m) continue
      let p = 0
      if (f.q && sg.lane !== f.q.correct && game.s > f.start + 6) {
        const mine = laneOf(f.n, game.u) === sg.lane // la que pisas cae justo detrás de ti; las otras se ven caer desde antes
        p = clamp01((game.s - (sg.s - (mine ? 8 : 34))) / (mine ? 35 : 26))
      }
      if (p <= 0) { if (m.visible && m.position.y !== sg.y) { m.position.set(sg.x, sg.y, sg.z); m.rotation.set(0, 0, 0) } m.visible = true; started.current[i] = false; continue }
      if (!started.current[i]) { // al empezar: nube de polvo y escombros
        started.current[i] = true
        for (let k = 0; k < 4; k++) emit(sg.x + (Math.random() - 0.5) * 6, sg.y + 0.4, sg.z + (Math.random() - 0.5) * 8, (Math.random() - 0.5) * 6, 3 + Math.random() * 4, (Math.random() - 0.5) * 6, k % 2 ? '#a8a29e' : '#d6d3d1', 0.5 + Math.random() * 0.5, 0.9)
      }
      const sh = p < 0.3 ? Math.sin(t * 60 + sg.s) * 0.18 * (1 - p / 0.3) : 0
      m.visible = p < 1
      m.position.set(sg.x + sh, sg.y - 11 * p * p, sg.z)
      m.rotation.set(p * 0.55 * (sg.i % 2 ? 1 : -1), 0, p * 0.45 * (sg.i % 3 ? 1 : -1))
    }
  })
  return segs.map((sg, i) => <mesh key={i} ref={(el) => { refs.current[i] = el }} geometry={sg.geo} position={[sg.x, sg.y, sg.z]} material={material} receiveShadow />)
}

// Cada acierto (`game.fxOk` sube): tres anillos de energía que se expanden desde el vehículo y una corona de chispas
const RING_GEO = new THREE.TorusGeometry(1, 0.07, 6, 36)
export function EnergyBurst({ game }) {
  const rings = useRef([]), seen = useRef(0), ages = useRef([9, 9, 9])
  useFrame((_, dt0) => {
    const dt = Math.min(dt0, 0.05)
    if (game.fxOk !== seen.current) {
      seen.current = game.fxOk; ages.current = [0, -0.12, -0.24]
      frame(game.s, game.u, game.alt + 1, P)
      for (let k = 0; k < 44; k++) {
        const a = (k / 44) * Math.PI * 2, c = Math.cos(P.yaw), sn = Math.sin(P.yaw)
        const rx = Math.cos(a) * 9, ry = Math.sin(a) * 9 // anillo en el plano del frente del vehículo
        emit(P.x, P.y, P.z, rx * c, ry + 2, -rx * sn - 8, k % 2 ? '#fde047' : '#7df9ff', 0.28, 0.8)
      }
    }
    frame(game.s, game.u, game.alt + 1, P)
    for (let k = 0; k < 3; k++) {
      const m = rings.current[k]; if (!m) continue
      ages.current[k] += dt
      const a = ages.current[k], q = a / 0.75
      m.visible = a >= 0 && q < 1
      if (m.visible) {
        m.position.set(P.x, P.y, P.z); m.rotation.set(0, P.yaw, 0); m.scale.setScalar(1.2 + q * 8); m.material.opacity = 0.9 * (1 - q)
      }
    }
  })
  return [0, 1, 2].map((k) => (
    <mesh key={k} ref={(el) => { rings.current[k] = el }} geometry={RING_GEO} visible={false}>
      <meshBasicMaterial color={k % 2 ? '#7df9ff' : '#fde047'} transparent toneMapped={false} depthWrite={false} />
    </mesh>
  ))
}

// Rivales (IA o jugadores en línea): cada uno con su vehículo, que cambia cuando sube o baja de nivel, y su nombre encima
function RivalCar({ r, world, solid, glow }) {
  const ref = useRef(), cur = useRef({ s: 0, u: 0 }), shown = useRef(r.tier)
  const [tier, setTier] = useState(r.tier)
  const model = useMemo(() => buildVehicle(world.tiers[tier].kind, r.color, world.emblem, { char: r.char, accessory: 'none' }), [world, tier, r.color, r.char])
  useEffect(() => () => { model.solid?.dispose(); model.glow?.dispose() }, [model])
  useFrame((_, dt0) => {
    const dt = Math.min(dt0, 0.05), c = cur.current, k = 1 - Math.exp(-10 * dt) // suaviza los mensajes de red
    if (r.tier !== shown.current) { shown.current = r.tier; setTier(r.tier) }
    c.s += (r.s - c.s) * k; c.u += (r.u - c.u) * k
    frame(c.s, c.u, 0, P)
    if (ref.current) { ref.current.position.set(P.x, P.y + flyAlt(r.tier), P.z); ref.current.rotation.set(pitchAt(c.s), P.yaw, 0) }
  })
  return (
    <group ref={ref} scale={1.5}>
      {model.solid && <mesh geometry={model.solid} material={solid} castShadow />}
      {model.glow && <mesh geometry={model.glow} material={glow} />}
      <Html position={[0, 2.6, 0]} center distanceFactor={26} style={{ pointerEvents: 'none' }}>
        <div className="whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-black text-white" style={{ background: `${r.color}cc`, textShadow: '0 1px 2px #000' }}>{r.name}</div>
      </Html>
    </group>
  )
}
export function Rivals({ game, world, solid, glow }) {
  return game.rivals.map((r) => <RivalCar key={r.id} r={r} world={world} solid={solid} glow={glow} />)
}
