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

// ── Cajas de bonus (?) que giran y flotan, plataformas de impulso con flechas y aros de luz que cruzas a toda velocidad ──
const BOX_GEO = new THREE.BoxGeometry(1.9, 1.9, 1.9)
const PAD_GEO = new THREE.BoxGeometry(5.6, 0.14, 7)
const ARROW_GEO = (() => {
  const sh = new THREE.Shape(); sh.moveTo(0, 1.8); sh.lineTo(2.1, -0.2); sh.lineTo(2.1, -1.2); sh.lineTo(0, 0.6); sh.lineTo(-2.1, -1.2); sh.lineTo(-2.1, -0.2); sh.closePath()
  return new THREE.ShapeGeometry(sh).rotateX(-Math.PI / 2) // plana sobre la pista, apuntando hacia delante
})()
const HOOP_GEO = new THREE.TorusGeometry(12, 0.32, 8, 44)
const D3 = new THREE.Object3D(), HC = new THREE.Color()
const REWARD_COL = { boost: '#22d3ee', power: '#a78bfa', shield: '#4ade80', coins: '#fde047', pad: '#fb923c' }

export function Pickups({ game, world }) {
  const boxes = useRef(), frames = useRef(), pads = useRef(), arrows = useRef(), hoops = useRef(), seen = useRef(0)
  const list = useMemo(() => ({ box: game.pickups.filter((p) => p.kind === 'box'), pad: game.pickups.filter((p) => p.kind === 'pad') }), [game])
  const hoopS = useMemo(() => {
    const a = []; for (let s = 700; s < game.L - 300; s += 320) if (!game.forks.some((f) => s > f.start - 120 && s < f.start + 330)) a.push(s)
    return a
  }, [game])
  useFrame(({ clock }) => {
    const t = clock.elapsedTime, S = game.s
    list.box.forEach((p, i) => {
      const on = !p.taken && p.s > S - 30 && p.s < S + 1400
      frame(p.s, p.u, 1.9 + Math.sin(t * 2.4 + i) * 0.35, P)
      D3.position.set(P.x, P.y, P.z); D3.rotation.set(t * 0.9 + i, t * 1.7 + i, 0); D3.scale.setScalar(on ? 1 : 0); D3.updateMatrix()
      boxes.current.setMatrixAt(i, D3.matrix); frames.current.setMatrixAt(i, D3.matrix)
      boxes.current.setColorAt(i, HC.setHSL((t * 0.25 + i * 0.13) % 1, 0.9, 0.58))
    })
    boxes.current.instanceMatrix.needsUpdate = true; frames.current.instanceMatrix.needsUpdate = true; if (boxes.current.instanceColor) boxes.current.instanceColor.needsUpdate = true
    list.pad.forEach((p, i) => {
      const on = !p.taken && p.s > S - 30 && p.s < S + 1400
      frame(p.s, p.u, 0.09, P)
      D3.position.set(P.x, P.y, P.z); D3.rotation.set(pitchAt(p.s), P.yaw, 0); D3.scale.setScalar(on ? 1 : 0); D3.updateMatrix()
      pads.current.setMatrixAt(i, D3.matrix)
      D3.position.y += 0.1 + 0.03 * Math.sin(t * 8 + i); D3.updateMatrix(); arrows.current.setMatrixAt(i, D3.matrix) // la flecha parpadea
    })
    pads.current.instanceMatrix.needsUpdate = true; arrows.current.instanceMatrix.needsUpdate = true
    const pal = world.missions[game.mission].pal
    hoopS.forEach((s, i) => {
      const on = s > S - 20 && s < S + 1100
      frame(s, 0, 4, P)
      D3.position.set(P.x, P.y, P.z); D3.rotation.set(pitchAt(s), P.yaw, t * 0.5 + i); D3.scale.setScalar(on ? 1 : 0); D3.updateMatrix()
      hoops.current.setMatrixAt(i, D3.matrix); hoops.current.setColorAt(i, HC.set(pal.accent).offsetHSL(Math.sin(t * 0.8 + i) * 0.06, 0, 0.05))
    })
    hoops.current.instanceMatrix.needsUpdate = true; if (hoops.current.instanceColor) hoops.current.instanceColor.needsUpdate = true
    if (game.fxBox !== seen.current) { // al recoger: estallido de chispas del color del premio
      seen.current = game.fxBox
      const a = game.boxAt
      if (a) {
        frame(a.s, a.u, 2, P)
        const col = REWARD_COL[a.kind === 'pad' ? 'pad' : 'boost']
        for (let k = 0; k < 26; k++) { const an = (k / 26) * Math.PI * 2; emit(P.x, P.y, P.z, Math.cos(an) * 9, 3 + Math.random() * 5, Math.sin(an) * 9, k % 3 ? col : '#ffffff', 0.3, 0.7) }
      }
    }
  })
  return (
    <>
      <instancedMesh ref={boxes} args={[BOX_GEO, undefined, Math.max(1, list.box.length)]} frustumCulled={false}><meshBasicMaterial toneMapped={false} transparent opacity={0.72} /></instancedMesh>
      <instancedMesh ref={frames} args={[BOX_GEO, undefined, Math.max(1, list.box.length)]} frustumCulled={false}><meshBasicMaterial color="#ffffff" wireframe toneMapped={false} /></instancedMesh>
      <instancedMesh ref={pads} args={[PAD_GEO, undefined, Math.max(1, list.pad.length)]} frustumCulled={false}><meshBasicMaterial color="#7c2d12" /></instancedMesh>
      <instancedMesh ref={arrows} args={[ARROW_GEO, undefined, Math.max(1, list.pad.length)]} frustumCulled={false}><meshBasicMaterial color="#fdba74" toneMapped={false} side={THREE.DoubleSide} /></instancedMesh>
      <instancedMesh ref={hoops} args={[HOOP_GEO, undefined, Math.max(1, hoopS.length)]} frustumCulled={false}><meshBasicMaterial toneMapped={false} /></instancedMesh>
    </>
  )
}
