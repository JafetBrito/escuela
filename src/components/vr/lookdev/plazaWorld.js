import * as THREE from 'three'
import { ACADEMIES } from '../../../data/academies'
import { tr } from '../../../i18n'

// Datos y matemática de la Plaza de las Academias — compartidos por la demo
// (PlazaAtmosferica.jsx) y por el mundo real (/vr/plaza, VRPage.jsx). Todo es
// determinista: terreno, caminos, árboles, gemas y el caminante usan las mismas
// funciones, así que lo que ves es exactamente donde pisas.

export const lerp = (a, b, t) => a + (b - a) * t
export const clamp = (x, a, b) => Math.min(b, Math.max(a, x))
export const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t) }
export const hash = (x, z) => { const s = Math.sin(x * 127.1 + z * 311.7) * 43758.5453; return s - Math.floor(s) }
export function vnoise(x, z) {
  const xi = Math.floor(x), zi = Math.floor(z), xf = x - xi, zf = z - zi
  const u = xf * xf * (3 - 2 * xf), v = zf * zf * (3 - 2 * zf)
  const a = hash(xi, zi), b = hash(xi + 1, zi), c = hash(xi, zi + 1), d = hash(xi + 1, zi + 1)
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v
}
export function rng(seed) { // mulberry32
  let a = seed >>> 0
  return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296 }
}

export const ACADEMY_LIST = Object.values(ACADEMIES)
export const PLAZA_R = 19
export const PLAZA_Y = 0.25 // altura de la losa: el terreno ES la plaza adentro del círculo (así el piso que pisas = el que ves)
export const WALK_LIMIT = 150
export const WATER_Y = -2.2

// Un camino por academia, curvo, del borde de la plaza hasta su propileo.
export const PATHS = ACADEMY_LIST.map((ac, i) => {
  const a0 = (i / ACADEMY_LIST.length) * Math.PI * 2 + Math.PI / 4
  const pts = []
  for (let k = 0; k <= 12; k++) {
    const t = k / 12, d = 17 + t * 62, a = a0 + Math.sin(t * 2.6 + i * 1.7) * 0.22
    pts.push([Math.cos(a) * d, Math.sin(a) * d])
  }
  return { ac, pts }
})
// Camino de bienvenida: del spawn a la plaza, despejado para que la primera vista sea el templo.
export const ENTRY = [[0, 52], [-2, 42], [1, 31], [0, 18]]

function segDist(px, pz, [ax, az], [bx, bz]) {
  const dx = bx - ax, dz = bz - az
  const t = clamp(((px - ax) * dx + (pz - az) * dz) / (dx * dx + dz * dz), 0, 1)
  return Math.hypot(px - (ax + dx * t), pz - (az + dz * t))
}
export function pathDist(x, z) {
  let m = 1e9
  for (const { pts } of PATHS) for (let k = 0; k < pts.length - 1; k++) m = Math.min(m, segDist(x, z, pts[k], pts[k + 1]))
  for (let k = 0; k < ENTRY.length - 1; k++) m = Math.min(m, segDist(x, z, ENTRY[k], ENTRY[k + 1]))
  return m
}
export function groundHeight(x, z) {
  const r = Math.hypot(x, z)
  const raw = vnoise(x * 0.02, z * 0.02) * 18 + vnoise(x * 0.06, z * 0.06) * 5 + vnoise(x * 0.15, z * 0.15) * 1.2 - 9 + Math.max(0, r - 85) * 0.2
  const relief = lerp(0.3, 1, smooth(2.5, 9, pathDist(x, z))) // los caminos son más planos
  return lerp(PLAZA_Y, raw * relief, smooth(20, 36, r))        // la plaza es llana
}

// ── Paletas por hora del día (todo el look sale de aquí) ─────────────────────
// Luz del Egeo: azul profundo arriba, rosa y oro en el horizonte.
export const PRESETS_GRIEGO = {
  amanecer: {
    label: tr('Amanecer', 'Dawn'), icon: '🌅',
    skyTop: '#4a78b8', skyMid: '#f0b3b8', skyHor: '#ffe6b8',
    fog: '#f6cfae', sunCol: '#ffe0a0', sunEl: 5, sunAz: -42,
    hemiSky: '#cfe0ff', hemiGround: '#6f6a8f', hemiI: 1.05, dirCol: '#ffd9a0', dirI: 2.1,
    ridgeNear: '#6a78a8', ridgeFar: '#f2d3bd', bloom: 0.45, glow: 1.0, flies: 0.6, stars: false,
  },
  dia: {
    label: tr('Día', 'Day'), icon: '☀️',
    skyTop: '#2f7fd6', skyMid: '#6fb4ee', skyHor: '#d9eeff',
    fog: '#d6e8f5', sunCol: '#fff2cf', sunEl: 52, sunAz: 20,
    hemiSky: '#bfe0ff', hemiGround: '#8a8f6a', hemiI: 1.15, dirCol: '#fff1d6', dirI: 3.0,
    ridgeNear: '#5f86b8', ridgeFar: '#d0e4f4', bloom: 0.2, glow: 0.5, flies: 0.15, stars: false,
  },
  atardecer: {
    label: tr('Atardecer', 'Sunset'), icon: '🌇',
    skyTop: '#27408f', skyMid: '#d96b8e', skyHor: '#ffc58a',
    fog: '#f4b690', sunCol: '#ffd49a', sunEl: 7, sunAz: 38,
    hemiSky: '#ffb59a', hemiGround: '#3b2f5e', hemiI: 0.95, dirCol: '#ffb36b', dirI: 2.6,
    ridgeNear: '#4a4a86', ridgeFar: '#f0a088', bloom: 0.55, glow: 1.6, flies: 1, stars: false,
  },
  noche: {
    label: tr('Noche', 'Night'), icon: '🌙',
    skyTop: '#070b24', skyMid: '#16204d', skyHor: '#2d3a78',
    fog: '#18214f', sunCol: '#9db6ff', sunEl: 38, sunAz: -25,
    hemiSky: '#3a4d9a', hemiGround: '#0d0f2b', hemiI: 0.7, dirCol: '#9db6ff', dirI: 0.7,
    ridgeNear: '#0d1235', ridgeFar: '#2a3670', bloom: 0.9, glow: 3.2, flies: 1.8, stars: true,
  },
}
// Paletas de la primera versión (la "torre faro"): atardecer violeta/rosa, noche azul índigo.
export const PRESETS = {
  atardecer: {
    label: tr('Atardecer', 'Sunset'), icon: '🌇',
    skyTop: '#3a2f6b', skyMid: '#c0457a', skyHor: '#ffb27a',
    fog: '#f2a07a', sunCol: '#ffd08a', sunEl: 7, sunAz: 38,
    hemiSky: '#ffb59a', hemiGround: '#3b2f5e', hemiI: 0.95, dirCol: '#ffb36b', dirI: 2.6,
    ridgeNear: '#5b3f78', ridgeFar: '#f0a088', bloom: 0.55, glow: 1.6, flies: 1, stars: false,
  },
  amanecer: {
    label: tr('Amanecer', 'Dawn'), icon: '🌅',
    skyTop: '#4a6fa5', skyMid: '#e8a5b5', skyHor: '#ffe2b0',
    fog: '#f6cfae', sunCol: '#ffe0a0', sunEl: 5, sunAz: -42,
    hemiSky: '#cfe0ff', hemiGround: '#6f6a8f', hemiI: 1.05, dirCol: '#ffd9a0', dirI: 2.1,
    ridgeNear: '#6a78a8', ridgeFar: '#f2d3bd', bloom: 0.45, glow: 1.0, flies: 0.6, stars: false,
  },
  // "Mañana dorada": mismo lenguaje que el atardecer (horizonte durazno, sol cálido y bajo que da sombras
  // largas, niebla tibia) pero con cielo azul turquesa — no el azul/blanco lavado de antes.
  dia: {
    label: tr('Día', 'Day'), icon: '☀️',
    skyTop: '#3f86d6', skyMid: '#8fc4ee', skyHor: '#ffdcae',
    fog: '#f0d3b0', sunCol: '#fff0c4', sunEl: 26, sunAz: 38,
    hemiSky: '#cfe3ff', hemiGround: '#7d6a4a', hemiI: 0.95, dirCol: '#ffd9a0', dirI: 3.1,
    ridgeNear: '#5f7fb4', ridgeFar: '#f2d2b0', bloom: 0.42, glow: 0.7, flies: 0.2, stars: false,
  },
  noche: PRESETS_GRIEGO.noche,
}
export function presetForHour(h) {
  if (h < 5 || h >= 20.5) return 'noche'
  if (h < 8) return 'amanecer'
  if (h < 17) return 'dia'
  return 'atardecer'
}
export const sunDirOf = (p) => {
  const el = THREE.MathUtils.degToRad(p.sunEl), az = THREE.MathUtils.degToRad(p.sunAz)
  return new THREE.Vector3(Math.sin(az) * Math.cos(el), Math.sin(el), -Math.cos(az) * Math.cos(el))
}

// Gemas: el "ganchito" de explorar — siguen los caminos y se asoman a los lados.
export const GEMS = (() => {
  const out = [], R = rng(99)
  PATHS.forEach(({ ac, pts }) => [0.22, 0.42, 0.62, 0.82].forEach((t, j) => {
    const k = Math.floor(t * 12), [x, z] = pts[k], side = (j % 2 ? 1 : -1) * (2 + R() * 1.6)
    out.push({ x: x + side, z: z + side * 0.4, color: ac.accent })
  }))
  for (let i = 0; i < 4; i++) { const a = R() * 6.28, d = 45 + R() * 50; out.push({ x: Math.cos(a) * d, z: Math.sin(a) * d, color: '#ffd978' }) }
  return out.map((g) => ({ ...g, y: groundHeight(g.x, g.z) + 1.2 }))
})()
