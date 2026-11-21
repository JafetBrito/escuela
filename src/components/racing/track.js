import * as THREE from 'three'

// Matemática de la pista: una línea central que baja una colina serpenteando (como Tux Racer). El avance se mide por la
// distancia `s` a lo largo de la pista y la posición lateral `u` (+ = derecha). La pista corre hacia -Z.
export const SLOPE = 0.16 // pendiente (m de caída por m recorrido)
export const centerX = (s) => 20 * Math.sin(s / 95) + 9 * Math.sin(s / 41 + 1.3)
const dX = (s) => (20 / 95) * Math.cos(s / 95) + (9 / 41) * Math.cos(s / 41 + 1.3)
export const centerY = (s) => -s * SLOPE
export const yawAt = (s) => -Math.atan(dX(s)) // giro sobre Y: el frente del modelo es -Z

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
