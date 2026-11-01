import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Mesher } from './mesher'
import { CAMPUS_S } from './campusWorld'

// Estudiantes que caminan por el Yard: recast-navigation genera la malla de navegación a partir de la cáscara de
// colisión (el piso del Yard + las paredes de los edificios) y cada estudiante recorre rutas entre puntos al azar.
// Si algo falla (WASM no carga, navmesh vacío) simplemente no aparecen: el campus funciona igual.
const R = { x0: -34, x1: 34, z0: -30, z1: 40 } // unidades de mundo: el Yard y sus alrededores
const TINTS = ['#ff8a80', '#80d8ff', '#ffe082', '#a5d6a7', '#ce93d8', '#ffab91', '#90caf9', '#fff59d']

function studentGeo() {
  const M = new Mesher()
  M.box(-0.22, 0, 0, 0.3, 0.85, 0.3, '#2b3a55'); M.box(0.22, 0, 0, 0.3, 0.85, 0.3, '#2b3a55') // piernas
  M.box(0, 0.85, 0, 0.8, 0.85, 0.42, '#f1f1f1') // torso (se tiñe por instancia)
  M.box(0, 0.95, -0.34, 0.5, 0.6, 0.22, '#6b4a2f') // mochila
  M.ball(0, 2.0, 0, 0.32, '#e8c39e'); M.box(0, 2.18, 0, 0.5, 0.14, 0.5, '#3b2a1e') // cabeza + cabello
  return M.build()
}

export default function Wanderers({ shell, count = 14 }) {
  const mesh = useRef(), agents = useRef([]), ready = useRef(false)
  const geo = useMemo(() => studentGeo(), [])
  const mat = useMemo(() => new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 1 }), [])
  const scratch = useMemo(() => ({ o: new THREE.Object3D(), c: new THREE.Color() }), [])

  useEffect(() => {
    let dead = false
    ;(async () => {
      try {
        const [core, three] = await Promise.all([import('@recast-navigation/core'), import('@recast-navigation/three')])
        await core.init()
        if (dead) return
        shell.updateMatrixWorld(true)
        const inputs = [new THREE.Mesh(new THREE.PlaneGeometry(R.x1 - R.x0, R.z1 - R.z0).rotateX(-Math.PI / 2).translate((R.x0 + R.x1) / 2, 0.01, (R.z0 + R.z1) / 2))]
        const box = new THREE.Box3()
        shell.traverse((o) => { // paredes cercanas al Yard (las no-suelo con geometría propia y acotada)
          if (!o.isMesh || o.userData.isFloor || !o.geometry?.attributes?.position) return
          box.setFromObject(o)
          if (box.max.x - box.min.x < 90 && box.max.x > R.x0 && box.min.x < R.x1 && box.max.z > R.z0 && box.min.z < R.z1) inputs.push(o)
        })
        const { success, navMesh } = three.threeToSoloNavMesh(inputs, { cs: 0.12, ch: 0.06, walkableSlopeAngle: 35, walkableHeight: 8, walkableClimb: 3, walkableRadius: 1 })
        if (!success || dead) return
        const query = new core.NavMeshQuery(navMesh)
        const pick = () => { const r = query.findRandomPoint(); return r.success ? r.randomPoint : null }
        agents.current = Array.from({ length: count }, (_, i) => {
          const p = pick()
          return p ? { p: { x: p.x, y: p.y, z: p.z }, path: [], i: 0, wait: Math.random() * 3, yaw: 0, speed: 0.38 + Math.random() * 0.2, phase: Math.random() * 6, tint: TINTS[i % TINTS.length], query, pick } : null
        }).filter(Boolean)
        ready.current = true
      } catch (e) { console.warn('[Wanderers] sin navmesh:', e?.message) }
    })()
    return () => { dead = true }
  }, [shell, count])

  useFrame((state, dt) => {
    const m = mesh.current
    if (!m || !ready.current) return
    const { o, c } = scratch, d = Math.min(dt, 0.05)
    agents.current.forEach((a, k) => {
      if (a.wait > 0) a.wait -= d
      else if (a.i >= a.path.length) {
        const t = a.pick(), r = t && a.query.computePath(a.p, t)
        if (r?.success && r.path.length > 1) { a.path = r.path; a.i = 1 } else a.wait = 1
      } else {
        const t = a.path[a.i], dx = t.x - a.p.x, dz = t.z - a.p.z, dist = Math.hypot(dx, dz), step = a.speed * d
        if (dist <= step) { a.p = { x: t.x, y: t.y, z: t.z }; a.i++; if (a.i >= a.path.length) { a.path = []; a.i = 0; a.wait = 2 + Math.random() * 5 } }
        else {
          a.p.x += (dx / dist) * step; a.p.z += (dz / dist) * step; a.p.y += (t.y - a.p.y) * Math.min(1, d * 6)
          const ty = Math.atan2(dx, dz); a.yaw += Math.atan2(Math.sin(ty - a.yaw), Math.cos(ty - a.yaw)) * Math.min(1, d * 8)
        }
      }
      const walking = a.wait <= 0 && a.path.length > 0, t7 = state.clock.elapsedTime * 7 + a.phase
      o.position.set(a.p.x, a.p.y + (walking ? Math.abs(Math.sin(t7)) * 0.025 : 0), a.p.z)
      o.rotation.set(0, a.yaw, walking ? Math.sin(t7) * 0.06 : 0)
      o.scale.setScalar(CAMPUS_S * 0.95); o.updateMatrix()
      m.setMatrixAt(k, o.matrix); m.setColorAt(k, c.set(a.tint))
    })
    m.count = agents.current.length
    m.instanceMatrix.needsUpdate = true
    if (m.instanceColor) m.instanceColor.needsUpdate = true
  })
  return <instancedMesh ref={mesh} args={[geo, mat, count]} castShadow frustumCulled={false} />
}
