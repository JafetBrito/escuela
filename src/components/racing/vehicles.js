import * as THREE from 'three'
import { Mesher } from '../vr/campus/mesher'

// Vehículos procedurales low-poly (sin .glb): un constructor por "kind". Todos miran a -Z, apoyados en y = 0, y devuelven
// { solid, glow } (glow = partes emisivas: sirenas, llamas, luces). `color` = acento de la clase, `rider` = quien lo maneja.
const WHEEL = '#23262d', WHITE = '#f4f6f8', STEEL = '#aab2bd', WOOD = '#8a5a34'

// Rueda (cilindro acostado sobre el eje X) con eje en (x, r, z)
let WH = WHEEL // color de las ruedas (lo fija buildVehicle)
const wheel = (M, x, z, r, w = 0.22) => M.add(new THREE.CylinderGeometry(r, r, w, 12).rotateZ(Math.PI / 2), WH, x, r, z)
// Conductor sencillo: torso + cabeza; (x, y, z) = base del torso
// Pilotos para elegir (fase 4): piel, camisa (si no, el color de la clase) y un detalle en la cabeza. `hat`: cap | hair | helmet | band | crown | ears
export const CHARACTERS = [
  { id: 'doc', name: 'Ana', skin: '#e2b48c', hat: 'hair', hair: '#3a2415' },
  { id: 'leo', name: 'Leo', skin: '#c68a5b', hat: 'cap', hair: '#1d4ed8' },
  { id: 'maya', name: 'Maya', skin: '#8d5a3b', hat: 'band', hair: '#111827', shirt: '#ec4899' },
  { id: 'kai', name: 'Kai', skin: '#f1c9a5', hat: 'helmet', hair: '#f59e0b' },
  { id: 'nova', name: 'Nova', skin: '#cbd5e1', hat: 'ears', hair: '#22d3ee', shirt: '#334155' },
  { id: 'sage', name: 'Sage', skin: '#a7f3d0', hat: 'crown', hair: '#facc15', shirt: '#7c3aed' },
  { id: 'rex', name: 'Rex', skin: '#d9a066', hat: 'hair', hair: '#b91c1c', shirt: '#0f172a' },
  { id: 'luna', name: 'Luna', skin: '#fde0c8', hat: 'cap', hair: '#a855f7', shirt: '#f8fafc' },
  { id: 'oliver', name: 'Oliver', skin: '#e98a3c', hat: 'cat', hair: '#bf571a', shirt: '#f2a75e' }, // el gato naranja de la escuela
  { id: 'jafet', name: 'Jafet', skin: '#f1c9a5', hat: 'wizard', hair: '#6d28d9', shirt: '#4c1d95' }, // el mago director
]
let CH = CHARACTERS[0] // el piloto del vehículo que se está armando (lo fija buildVehicle)
function rider(M, x, y, z, hex) {
  M.box(x, y, z, 0.5, 0.7, 0.34, CH.shirt || hex); M.ball(x, y + 0.95, z, 0.24, CH.skin)
  const hy = y + 0.95
  if (CH.hat === 'hair') M.box(x, hy + 0.17, z + 0.05, 0.5, 0.2, 0.46, CH.hair)
  else if (CH.hat === 'cap') { M.box(x, hy + 0.2, z, 0.5, 0.14, 0.5, CH.hair); M.box(x, hy + 0.13, z - 0.3, 0.4, 0.05, 0.25, CH.hair) }
  else if (CH.hat === 'helmet') M.ball(x, hy + 0.04, z, 0.3, CH.hair)
  else if (CH.hat === 'band') { M.box(x, hy + 0.08, z, 0.52, 0.1, 0.5, CH.hair); M.box(x, hy + 0.2, z + 0.05, 0.4, 0.14, 0.4, CH.hair) }
  else if (CH.hat === 'crown') for (const k of [-1, 0, 1]) M.box(x + k * 0.15, hy + 0.3, z, 0.08, 0.16, 0.08, CH.hair)
  else if (CH.hat === 'cat') { // Oliver: orejas triangulares, hocico crema, nariz rosa y cola
    for (const k of [-1, 1]) { M.cone(x + k * 0.15, hy + 0.16, z, 0.1, 0.22, 4, CH.skin); M.cone(x + k * 0.15, hy + 0.17, z - 0.02, 0.05, 0.14, 4, '#f0b6a0') }
    M.ball(x, hy - 0.07, z - 0.2, 0.1, '#f6dfb8'); M.ball(x, hy - 0.02, z - 0.28, 0.04, '#e58a8f')
    M.box(x, y + 0.25, z + 0.3, 0.12, 0.12, 0.5, CH.skin); M.box(x, y + 0.5, z + 0.55, 0.12, 0.4, 0.12, CH.hair)
  } else if (CH.hat === 'wizard') { // Jafet: sombrero puntiagudo de mago y barba blanca
    M.box(x, hy + 0.17, z, 0.7, 0.05, 0.7, CH.hair); M.cone(x, hy + 0.2, z, 0.3, 0.7, 6, CH.hair); M.ball(x, hy + 0.92, z, 0.05, '#fde047')
    M.box(x, hy - 0.2, z - 0.15, 0.32, 0.3, 0.12, '#f8fafc'); M.ball(x, hy - 0.33, z - 0.15, 0.1, '#f8fafc')
  } else if (CH.hat === 'ears') for (const k of [-1, 1]) M.box(x + k * 0.22, hy + 0.34, z, 0.08, 0.3, 0.08, CH.hair)
}
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

// ── Vehículos de la segunda mitad de la escalera (kart → nave espacial) ─────────────────────────────────────────────
Object.assign(KINDS, {
  kart(M, G, c) { M.box(0, 0.3, 0, 1.5, 0.3, 2.7, c); M.box(0, 0.55, 0.5, 0.9, 0.4, 0.9, '#222'); for (const sx of [-1, 1]) for (const sz of [-1, 1]) wheel(M, sx * 0.85, sz * 1.0, 0.3, 0.3); M.box(0, 0.45, -1.3, 1.7, 0.2, 0.3, '#e8e8e8'); M.box(0, 0.7, -0.4, 0.5, 0.07, 0.07, STEEL); rider(M, 0, 0.6, 0.5, '#3b6ea5'); G.box(0, 0.12, 0, 1.3, 0.04, 2.2, c) },
  buggy(M, G, c) { M.box(0, 0.5, 0, 1.7, 0.25, 3.2, c); for (const sx of [-1, 1]) { M.box(sx * 0.8, 1.0, 0.3, 0.07, 1.0, 0.07, STEEL); M.box(sx * 0.8, 1.55, -0.3, 0.07, 0.07, 1.2, STEEL); for (const sz of [-1, 1]) wheel(M, sx * 1.05, sz * 1.2, 0.5, 0.4) } M.box(0, 1.5, -0.3, 1.6, 0.07, 0.07, STEEL); M.box(0, 0.75, 0.4, 0.8, 0.3, 0.8, '#222'); rider(M, 0, 0.9, 0.4, '#a5523b'); G.box(0, 0.7, -1.65, 0.9, 0.18, 0.05, '#fff6c0') },
  van(M, G, c) { M.box(0, 0.5, 0.3, 2.0, 1.6, 3.4, WHITE); M.box(0, 0.5, -1.7, 2.0, 1.0, 1.2, WHITE); M.box(0, 1.1, -2.31, 1.8, 0.5, 0.05, '#9fd3ee'); M.box(0, 0.8, 0.3, 2.02, 0.25, 3.4, c); for (const sx of [-1, 1]) for (const sz of [-1, 1]) wheel(M, sx * 1.0, sz * 1.3, 0.5, 0.35); M.box(0, 2.1, 0.3, 1.6, 0.08, 0.1, STEEL); G.box(-0.5, 2.25, -0.2, 0.5, 0.15, 0.3, '#ff3b3b'); G.box(0.5, 2.25, -0.2, 0.5, 0.15, 0.3, '#3b7bff') },
  sports(M, G, c) { M.box(0, 0.3, 0, 1.9, 0.45, 4.2, c); M.box(0, 0.75, 0.3, 1.4, 0.4, 1.8, '#1d2733'); M.box(0, 1.0, 1.9, 1.9, 0.07, 0.5, c); for (const sx of [-1, 1]) { M.box(sx * 0.85, 0.7, 1.9, 0.07, 0.5, 0.4, c); for (const sz of [-1, 1]) wheel(M, sx * 0.98, sz * 1.4, 0.4, 0.32) } G.box(-0.6, 0.45, -2.12, 0.4, 0.12, 0.05, '#fff6c0'); G.box(0.6, 0.45, -2.12, 0.4, 0.12, 0.05, '#fff6c0'); G.box(0, 0.08, 0, 1.5, 0.04, 3.7, '#38bdf8') },
  formula(M, G, c) { M.box(0, 0.35, 0, 0.8, 0.4, 3.6, c); for (const sx of [-1, 1]) { M.box(sx * 0.9, 0.35, 0.3, 0.55, 0.3, 1.8, c); wheel(M, sx * 1.15, -1.3, 0.45, 0.45); wheel(M, sx * 1.15, 1.3, 0.48, 0.5) } M.box(0, 0.4, -2.0, 2.2, 0.08, 0.5, '#e8e8e8'); M.box(0, 1.0, 1.9, 2.0, 0.08, 0.5, '#e8e8e8'); M.ball(0, 0.75, 0.2, 0.28, '#e2b48c'); M.box(0, 0.62, 0.2, 0.4, 0.2, 0.5, '#111'); G.box(0, 0.62, -1.2, 0.35, 0.06, 0.9, '#fff') },
  hovercar(M, G, c) { M.box(0, 0.9, 0, 1.9, 0.45, 4.0, c); M.box(0, 1.3, 0.2, 1.4, 0.4, 1.8, '#1d2733'); M.box(0, 0.7, 0, 2.1, 0.12, 3.4, '#2f353e'); for (const sx of [-1, 1]) for (const sz of [-1, 1]) G.add(new THREE.CylinderGeometry(0.4, 0.3, 0.1, 12), '#38bdf8', sx * 0.9, 0.5, sz * 1.3); G.box(0, 0.4, 0, 1.6, 0.05, 3.2, '#7dd3fc') },
  hoverbike(M, G, c) { M.box(0, 0.8, 0, 0.8, 0.4, 3.0, c); M.box(0, 1.1, -1.2, 0.5, 0.35, 0.8, '#1d2733'); M.box(0, 1.5, -1.0, 1.1, 0.07, 0.07, STEEL); for (const sz of [-1, 1]) G.add(new THREE.CylinderGeometry(0.45, 0.3, 0.1, 12), '#a78bfa', 0, 0.45, sz * 1.1); for (const sx of [-1, 1]) M.box(sx * 0.55, 1.0, 1.2, 0.07, 0.6, 0.7, c); rider(M, 0, 1.0, 0.3, '#3b6ea5'); G.box(0, 0.35, 0, 0.8, 0.05, 2.6, '#c4b5fd') },
  plane(M, G, c) { M.add(new THREE.CylinderGeometry(0.62, 0.5, 5, 10).rotateX(Math.PI / 2), WHITE, 0, 1.0, 0); M.add(new THREE.ConeGeometry(0.62, 1.2, 10).rotateX(-Math.PI / 2), c, 0, 1.0, -3.1); M.box(0, 1.0, -0.3, 7.4, 0.12, 1.5, c); M.box(0, 1.0, 2.1, 2.6, 0.1, 0.8, c); M.box(0, 1.1, 2.3, 0.1, 1.3, 0.9, c); M.ball(0, 1.45, -1.4, 0.42, '#9fd3ee', 0.8); for (const sx of [-1, 1]) { M.add(new THREE.CylinderGeometry(0.3, 0.3, 1.2, 8).rotateX(Math.PI / 2), STEEL, sx * 2.2, 0.8, -0.2); G.add(new THREE.ConeGeometry(0.28, 1.6, 8).rotateX(-Math.PI / 2).rotateY(Math.PI), '#ffb347', sx * 2.2, 0.8, 1.1); G.box(sx * 3.7, 1.0, -0.3, 0.12, 0.14, 0.5, sx > 0 ? '#22c55e' : '#ef4444') } },
  spaceship(M, G, c) { M.add(new THREE.ConeGeometry(0.7, 2.2, 8).rotateX(-Math.PI / 2), WHITE, 0, 0.9, -2.7); M.add(new THREE.CylinderGeometry(0.7, 0.9, 3.4, 8).rotateX(Math.PI / 2), WHITE, 0, 0.9, 0.1); M.ball(0, 1.45, -0.9, 0.5, '#7dd3fc', 0.8); for (const sx of [-1, 1]) { M.box(sx * 1.7, 0.85, 0.9, 2.6, 0.1, 1.8, c, sx * 0.45); M.box(sx * 3.0, 1.05, 1.5, 0.1, 0.8, 0.9, c); G.add(new THREE.ConeGeometry(0.4, 2.4, 8).rotateX(-Math.PI / 2).rotateY(Math.PI), '#7df9ff', sx * 0.7, 0.9, 3.0) } G.add(new THREE.ConeGeometry(0.55, 4, 8).rotateX(-Math.PI / 2).rotateY(Math.PI), '#ffd24a', 0, 0.9, 3.9); G.box(0, 0.9, -3.3, 0.2, 0.2, 0.2, '#ffffff') },
})

// Accesorios de personalización
const ACCESSORIES = {
  flag(M, G, c, glow) { M.cyl(0, 0.2, 1.7, 0.05, 2.4, 5, STEEL); G.box(0.4, 2.2, 1.7, 0.8, 0.5, 0.05, glow || c) },
  antenna(M, G, c, glow) { M.cyl(0.6, 0.3, 1.5, 0.04, 2.0, 5, STEEL); G.ball(0.6, 2.4, 1.5, 0.15, glow || '#ff3b3b') },
  spoiler(M, G, c, glow) { M.box(0, 1.25, 1.35, 1.5, 0.08, 0.45, c); for (const sx of [-1, 1]) M.box(sx * 0.6, 1.0, 1.35, 0.07, 0.45, 0.07, STEEL); G.box(0, 1.29, 1.6, 1.5, 0.04, 0.06, glow || '#ffffff') },
  halo(M, G, c, glow) { G.add(new THREE.TorusGeometry(0.95, 0.05, 6, 28).rotateX(Math.PI / 2), glow || c, 0, 2.7, 0.2) },
  wings(M, G, c, glow) { for (const sx of [-1, 1]) { M.box(sx * 1.2, 0.9, 1.5, 1.2, 0.08, 0.8, c, sx * 0.3); G.box(sx * 1.75, 0.9, 1.5, 0.08, 0.1, 0.8, glow || '#ffffff', sx * 0.3) } },
}
export const ACCESSORY_LIST = ['none', ...Object.keys(ACCESSORIES)]

// custom = { color, glow, accessory, char }: pintura (acento), color de luces y accesorio; sin custom usa el color del mundo
export function buildVehicle(kind, accent, emblemKind, custom = {}) {
  const color = custom.color || accent, glow = custom.glow || null
  CH = CHARACTERS.find((c) => c.id === custom.char) || CHARACTERS[0]
  WH = custom.wheels || WHEEL
  const M = new Mesher(), G = new Mesher();
  (KINDS[kind] || KINDS.car)(M, G, color)
  if (!['ambulance', 'turbo', 'car', 'van', 'sports', 'plane', 'spaceship', 'hovercar'].includes(kind)) emblem(G, emblemKind, 0, 1.05, 0.9, 0.5, color) // distintivo pequeño en los demás
  if (glow) G.box(0, 0.05, 0, 1.5, 0.04, 3.2, glow) // luz bajo el vehículo
  ACCESSORIES[custom.accessory]?.(M, G, color, glow)
  return { solid: M.build(), glow: G.build() }
}
