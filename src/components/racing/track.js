import * as THREE from 'three'
import { centerX, centerY, yawAt } from './trackMath'

export { SLOPE, centerX, centerY, slopeAt, yawAt, pitchAt } from './trackMath'

// Punto del mundo en (s, u) y giro de la pista ahí
export function frame(s, u = 0, lift = 0, out = { x: 0, y: 0, z: 0, yaw: 0 }) {
  const yaw = yawAt(s), c = Math.cos(yaw), sn = Math.sin(yaw)
  out.x = centerX(s) + u * c; out.z = -s - u * sn; out.y = centerY(s) + lift; out.yaw = yaw
  return out
}

const _c = new THREE.Color()
// Cinta (malla) que sigue la pista entre s0..s1 y u0..u1; `color(s, i)` pinta cada tramo; `lift` la sube del suelo.
export function ribbon(s0, s1, u0, u1, lift, color, step = 6) {
  const n = Math.max(1, Math.ceil((s1 - s0) / step)), pos = [], col = [], idx = []
  const p = { x: 0, y: 0, z: 0, yaw: 0 }
  for (let i = 0; i <= n; i++) {
    const s = s0 + ((s1 - s0) * i) / n
    _c.set(color(s, i))
    for (const u of [u0, u1]) { frame(s, u, lift, p); pos.push(p.x, p.y, p.z); col.push(_c.r, _c.g, _c.b) }
    if (i < n) { const a = i * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2) } // cara hacia arriba
  }
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3))
  g.setIndex(idx); g.computeVertexNormals()
  return g
}
