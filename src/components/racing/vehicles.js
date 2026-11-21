import * as THREE from 'three'
import { Mesher } from '../vr/campus/mesher'

// Vehículos procedurales low-poly (sin .glb): un constructor por "kind". Todos miran a -Z, apoyados en y = 0, y devuelven
// { solid, glow } (glow = partes emisivas: sirenas, llamas, luces). `color` = acento de la clase, `rider` = quien lo maneja.
const WHEEL = '#23262d', WHITE = '#f4f6f8', STEEL = '#aab2bd', WOOD = '#8a5a34'

// Rueda (cilindro acostado sobre el eje X) con eje en (x, r, z)
const wheel = (M, x, z, r, w = 0.22) => M.add(new THREE.CylinderGeometry(r, r, w, 12).rotateZ(Math.PI / 2), WHEEL, x, r, z)
// Conductor sencillo: torso + cabeza; (x, y, z) = base del torso
function rider(M, x, y, z, hex) { M.box(x, y, z, 0.5, 0.7, 0.34, hex); M.ball(x, y + 0.95, z, 0.24, '#e2b48c') }
// Emblema de la clase en el techo/capó: cruz, </> o omega (barras emisivas)
function emblem(G, kind, x, y, z, s, hex) {
  if (kind === 'cross') { G.box(x, y, z, 0.7 * s, 0.05, 0.22 * s, hex); G.box(x, y, z, 0.22 * s, 0.05, 0.7 * s, hex) }
  else if (kind === 'code') { G.box(x - 0.28 * s, y, z, 0.1 * s, 0.05, 0.4 * s, hex); G.box(x + 0.28 * s, y, z, 0.1 * s, 0.05, 0.4 * s, hex); G.box(x, y, z, 0.08 * s, 0.05, 0.5 * s, hex) }
  else { G.box(x, y, z, 0.5 * s, 0.05, 0.1 * s, hex); G.add(new THREE.TorusGeometry(0.22 * s, 0.05 * s, 4, 10, Math.PI * 1.6).rotateX(-Math.PI / 2), hex, x, y, z) }
}

const KINDS = {
  stretcher(M, G, c) { M.box(0, 0.75, 0, 1.0, 0.16, 2.3, WHITE); M.box(0, 0.9, -0.7, 0.8, 0.12, 0.45, '#cfe8ff'); for (const sx of [-1, 1]) for (const sz of [-1, 1]) { M.box(sx * 0.42, 0.3, sz * 0.9, 0.06, 0.48, 0.06, STEEL); wheel(M, sx * 0.42, sz * 0.9, 0.18, 0.14) } rider(M, 0, 0.95, 0.15, c) },
  wheelchair(M, G, c) { M.box(0, 0.6, 0, 0.8, 0.1, 0.8, '#2d3a4a'); M.box(0, 0.7, 0.4, 0.8, 0.9, 0.08, '#2d3a4a'); for (const sx of [-1, 1]) { wheel(M, sx * 0.5, 0.2, 0.5, 0.1); wheel(M, sx * 0.35, -0.55, 0.18, 0.1) } rider(M, 0, 0.7, 0.05, c) },
  scooter(M, G, c) { M.box(0, 0.35, 0, 0.5, 0.12, 2.0, c); wheel(M, 0, -0.85, 0.3, 0.14); wheel(M, 0, 0.85, 0.3, 0.14); M.box(0, 0.4, -0.85, 0.08, 1.1, 0.08, STEEL); M.box(0, 1.5, -0.85, 0.7, 0.07, 0.07, STEEL); rider(M, 0, 0.5, 0.35, '#3b6ea5') },
  ambulance(M, G, c) { M.box(0, 0.45, 0, 1.9, 1.4, 3.8, WHITE); M.box(0, 1.2, -1.45, 1.8, 0.7, 0.9, '#9fd3ee'); M.box(0, 0.7, 0, 1.92, 0.22, 3.4, c); for (const sx of [-1, 1]) for (const sz of [-1, 1]) wheel(M, sx * 0.95, sz * 1.2, 0.4, 0.3); G.box(-0.45, 1.85, -0.2, 0.4, 0.2, 0.3, '#ff3b3b'); G.box(0.45, 1.85, -0.2, 0.4, 0.2, 0.3, '#3b7bff'); emblem(G, 'cross', 0, 1.86, 0.9, 1, '#ff3b3b') },
  turbo(M, G, c) { M.box(0, 0.35, 0, 1.9, 0.55, 4.2, WHITE); M.box(0, 0.8, 0.3, 1.5, 0.5, 1.8, '#9fd3ee'); M.box(0, 0.5, 0, 1.92, 0.12, 4.0, c); M.box(0, 1.1, 1.9, 1.9, 0.08, 0.5, c); for (const sx of [-1, 1]) { M.box(sx * 0.9, 0.5, 1.9, 0.08, 0.7, 0.4, c); for (const sz of [-1, 1]) wheel(M, sx * 0.95, sz * 1.4, 0.38, 0.3) } G.box(0, 0.12, 0, 1.6, 0.05, 3.6, '#7ff0ff'); G.box(-0.5, 1.0, -2.1, 0.5, 0.1, 0.1, '#ffffff'); G.box(0.5, 1.0, -2.1, 0.5, 0.1, 0.1, '#ffffff'); emblem(G, 'cross', 0, 0.63, -0.7, 0.8, '#ff3b3b') },
  board(M, G, c) { M.box(0, 0.32, 0, 0.9, 0.1, 2.4, c); for (const sz of [-1, 1]) { wheel(M, -0.35, sz * 0.8, 0.2, 0.14); wheel(M, 0.35, sz * 0.8, 0.2, 0.14) } rider(M, 0, 0.45, 0.2, '#0f3d2e'); G.box(0, 0.4, -1.15, 0.5, 0.05, 0.1, c) },
  bike(M, G, c) { M.box(0, 0.5, 0, 0.45, 0.35, 1.9, c); wheel(M, 0, -0.85, 0.42, 0.18); wheel(M, 0, 0.85, 0.42, 0.18); M.box(0, 0.6, -0.8, 0.07, 0.8, 0.07, STEEL); M.box(0, 1.35, -0.8, 0.8, 0.07, 0.07, STEEL); rider(M, 0, 0.75, 0.25, '#14302a'); G.box(0, 0.7, -1.0, 0.25, 0.15, 0.08, '#ffffff') },
  car(M, G, c) { M.box(0, 0.4, 0, 1.9, 0.6, 3.9, c); M.box(0, 0.95, 0.2, 1.5, 0.55, 1.9, '#1d2733'); for (const sx of [-1, 1]) for (const sz of [-1, 1]) wheel(M, sx * 0.98, sz * 1.25, 0.38, 0.28); G.box(-0.6, 0.55, -1.96, 0.4, 0.15, 0.06, '#fff6c0'); G.box(0.6, 0.55, -1.96, 0.4, 0.15, 0.06, '#fff6c0'); emblem(G, 'code', 0, 0.71, -0.8, 1, '#7dffb0') },
  rocket(M, G, c) { M.add(new THREE.CylinderGeometry(0.65, 0.65, 3.4, 10).rotateX(Math.PI / 2), WHITE, 0, 0.95, 0); M.add(new THREE.ConeGeometry(0.65, 1.3, 10).rotateX(-Math.PI / 2), c, 0, 0.95, -2.35); for (const a of [0, 1, 2]) { const ang = (a / 3) * Math.PI * 2; M.box(Math.sin(ang) * 0.75, 0.95 + Math.cos(ang) * 0.75, 1.4, 0.08, 0.6, 0.9, c, 0) } G.add(new THREE.ConeGeometry(0.5, 2.2, 8).rotateX(-Math.PI / 2).rotateY(Math.PI), '#ffb347', 0, 0.95, 2.9); G.add(new THREE.ConeGeometry(0.28, 1.5, 6).rotateX(-Math.PI / 2).rotateY(Math.PI), '#fff3b0', 0, 0.95, 2.6); M.ball(0, 1.45, -0.2, 0.34, '#9fd3ee') },
  cart(M, G, c) { M.box(0, 0.55, 0.1, 1.4, 0.18, 2.0, WOOD); for (const sx of [-1, 1]) { M.box(sx * 0.7, 0.7, 0.1, 0.08, 0.4, 2.0, '#6b4528'); wheel(M, sx * 0.8, 0.5, 0.5, 0.14) } M.box(0, 0.55, -1.4, 0.1, 0.12, 1.2, '#6b4528'); rider(M, 0, 0.7, 0.25, c); G.box(0, 0.7, -2.0, 0.2, 0.15, 0.2, '#ffd36e') },
  chariot(M, G, c) { M.box(0, 0.55, 0.3, 1.5, 0.14, 1.5, '#d6b370'); M.box(0, 0.85, 1.0, 1.5, 0.6, 0.1, '#d6b370'); for (const sx of [-1, 1]) { M.box(sx * 0.75, 0.85, 0.3, 0.08, 0.6, 1.5, '#d6b370'); wheel(M, sx * 0.9, 0.5, 0.52, 0.14) } M.box(0, 0.7, -1.2, 0.12, 0.12, 1.8, WOOD); for (const sx of [-1, 1]) { M.box(sx * 0.45, 0.35, -2.1, 0.55, 0.7, 1.1, '#e8e0d0'); M.ball(sx * 0.45, 1.0, -2.8, 0.3, '#e8e0d0'); G.box(sx * 0.45, 1.3, -2.8, 0.1, 0.18, 0.1, c) } rider(M, 0, 0.7, 0.3, c) },
}

export function buildVehicle(kind, accent, emblemKind) {
  const M = new Mesher(), G = new Mesher();
  (KINDS[kind] || KINDS.car)(M, G, accent)
  if (kind !== 'ambulance' && kind !== 'turbo' && kind !== 'car') emblem(G, emblemKind, 0, 1.05, 0.9, 0.5, accent) // distintivo pequeño en los demás
  return { solid: M.build(), glow: G.build() }
}
