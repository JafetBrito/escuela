import * as THREE from 'three'
import { Mesher } from './mesher'
import { tr } from '../../../i18n'

// Piezas del Santuario de los Caminos (mapa del tutorial): altares de clase, faro central, fogata, nidos de mascota,
// muñecos de entrenamiento, observatorio, arco de piedra, antorchas, estandartes, rocas y ruinas. Mismo contrato que
// campusKit/hospitalKit: cada pieza devuelve { solid, emissive?, floors?, collide?, lights?, signs?, bounds }.
// Unidades en metros del campus; (x, y, z) = centro de la BASE; el frente de la pieza mira a +Z.
// Escala "heroica": el jugador mide ~1.2 m en estas unidades, así que las piezas son enormes a propósito.
const STONE = '#d8c9a8', STONE2 = '#bfae8a', DARK = '#7d7059', MARBLE = '#f0e8d4', GOLD = '#e9b949', MOSS = '#7a9b4f', WOOD = '#7a5636', WOOD2 = '#5a4030'
const rng = (seed) => { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296) }

// Las clases educativas (mismos ids que PLAYER_CLASSES) con su color y nombre de altar.
export const CLASS_LOOK = {
  programmer: { color: '#22c55e', name: () => tr('Programador', 'Programmer') },
  cyber_strategist: { color: '#3b82f6', name: () => tr('Ciber-Estratega', 'Cyber Strategist') },
  ai_engineer: { color: '#a855f7', name: () => tr('Ingeniero de IA', 'AI Engineer') },
  designer: { color: '#f97316', name: () => tr('Diseñador', 'Designer') },
  philosopher: { color: '#eab308', name: () => tr('Filósofo', 'Philosopher') },
}

// ── utilidades de dibujo plano (emblemas) ────────────────────────────────────
// Barra de `len` × `th` girada `ang` (rad, sobre Z) centrada en (cx, cy, z)
const bar = (M, cx, cy, z, len, th, ang, hex, depth = 0.3) => M.add(new THREE.BoxGeometry(len, th, depth).rotateZ(ang), hex, cx, cy, z)
const link = (M, x1, y1, x2, y2, z, th, hex) => bar(M, (x1 + x2) / 2, (y1 + y2) / 2, z, Math.hypot(x2 - x1, y2 - y1), th, Math.atan2(y2 - y1, x2 - x1), hex, 0.2)
const arc = (M, cx, cy, z, r, a0, a1, n, th, hex) => { for (let i = 0; i < n; i++) { const a = a0 + ((a1 - a0) * (i + 0.5)) / n; bar(M, cx + Math.cos(a) * r, cy + Math.sin(a) * r, z, (r * Math.abs(a1 - a0) / n) * 1.15, th, a + Math.PI / 2, hex, 0.25) } }
const flat = (M, seg, r, cx, cy, z, hex, rotZ = 0) => M.add(new THREE.CylinderGeometry(r, r, 0.25, seg).rotateX(Math.PI / 2).rotateZ(rotZ), hex, cx, cy, z)

// Llama: gota (octaedro alargado) con núcleo claro; (x, y, z) = base, r = ancho, h = alto
const flame = (E, x, y, z, r, h, outer, core) => { E.add(new THREE.OctahedronGeometry(r).scale(1, h / (2 * r), 1), outer, x, y + h / 2, z); E.add(new THREE.OctahedronGeometry(r * 0.55).scale(1, h * 0.7 / (2 * r * 0.55), 1), core, x, y + h * 0.38, z) }

// Emblema luminoso de cada clase, dibujado en el plano XY (centro en (0, y)), `s` = escala.
function emblem(E, kind, y, z, hex, s) {
  const L = (x1, y1, x2, y2, th = 0.3) => link(E, x1 * s, y + y1 * s, x2 * s, y + y2 * s, z, th * s, hex)
  if (kind === 'programmer') { // </>
    L(-1, 1, -2, 0); L(-2, 0, -1, -1); L(1, 1, 2, 0); L(2, 0, 1, -1); L(0.5, 1.5, -0.5, -1.5)
  } else if (kind === 'cyber_strategist') { // escudo con cerradura
    L(-1.4, 1.5, 1.4, 1.5); L(-1.4, 1.5, -1.4, -0.3); L(1.4, 1.5, 1.4, -0.3); L(-1.4, -0.3, 0, -1.8); L(1.4, -0.3, 0, -1.8)
    E.ball(0, y + 0.5 * s, z, 0.4 * s, hex); bar(E, 0, y - 0.3 * s, z, 0.25 * s, 0.9 * s, 0, hex, 0.2)
  } else if (kind === 'ai_engineer') { // red neuronal 3-2-1
    const A = [[-1.8, 1.1], [-1.8, 0], [-1.8, -1.1]], B = [[0, 0.6], [0, -0.6]], C = [[1.8, 0]]
    for (const a of A) for (const b of B) L(a[0], a[1], b[0], b[1], 0.14)
    for (const b of B) L(b[0], b[1], C[0][0], C[0][1], 0.14)
    for (const [x, yy] of [...A, ...B, ...C]) E.ball(x * s, y + yy * s, z, 0.34 * s, hex)
  } else if (kind === 'designer') { // círculo + cuadrado + triángulo
    flat(E, 20, 0.85 * s, -1.4 * s, y + 0.6 * s, z, hex); flat(E, 4, 0.85 * s, 1.4 * s, y + 0.6 * s, z, hex, Math.PI / 4); flat(E, 3, 0.95 * s, 0, y - 1.0 * s, z, hex, Math.PI)
  } else { // philosopher: Ω
    arc(E, 0, y + 0.3 * s, z, 1.2 * s, -1.05, 4.19, 14, 0.28 * s, hex)
    bar(E, -1.15 * s, y - 0.72 * s, z, 0.9 * s, 0.26 * s, 0, hex, 0.25); bar(E, 1.15 * s, y - 0.72 * s, z, 0.9 * s, 0.26 * s, 0, hex, 0.25)
  }
}

// ── Altar de clase ───────────────────────────────────────────────────────────
// Tarima circular con aro luminoso del color de la clase, estela con el emblema, dos columnas y dos braseros.
export function buildAltar({ kind = 'programmer', color, name } = {}) {
  const look = CLASS_LOOK[kind] || CLASS_LOOK.programmer, hex = color || look.color
  const M = new Mesher(), E = new Mesher(), F = new Mesher(), C = new Mesher(), lights = [], signs = []
  M.cyl(0, -1.6, 0, 7.9, 1.4, 12, STONE2)
  F.cyl(0, -1.6, 0, 7.2, 2.1, 12, STONE) // tarima caminable (cima a 0.5 m)
  E.cyl(0, 0.5, 0, 5.2, 0.05, 28, hex); M.cyl(0, 0.5, 0, 4.8, 0.1, 28, STONE)
  // estela
  M.box(0, 0.5, -5.2, 6.4, 10.5, 1.0, STONE2); M.box(0, 11.0, -5.2, 7.2, 0.6, 1.5, STONE); M.gable(0, 11.6, -5.2, 7.6, 1.6, 1.4, STONE)
  M.box(0, 2.6, -4.68, 5.4, 8.2, 0.12, DARK)
  emblem(E, kind, 7.0, -4.5, hex, 1.5)
  signs.push({ text: name || look.name(), color: hex, x: 0, y: 1.7, z: -4.58, w: 5.2, h: 1.0, ry: 0 })
  // columnas
  for (const sx of [-1, 1]) {
    const x = sx * 4.6
    M.box(x, 0.5, -4.2, 1.9, 0.4, 1.9, STONE); M.cyl(x, 0.9, -4.2, 0.75, 8.2, 8, MARBLE, 0.62); M.box(x, 9.1, -4.2, 1.9, 0.5, 1.9, STONE)
    E.ball(x, 10.2, -4.2, 0.45, hex, 1.3); C.box(x, 0.5, -4.2, 1.8, 9, 1.8, '#fff')
  }
  C.box(0, 0.5, -5.2, 6.4, 10.5, 1.0, '#fff')
  // braseros
  for (const sx of [-1, 1]) {
    const x = sx * 3.8, z = 2.6
    M.cyl(x, 0.5, z, 0.55, 2.4, 6, DARK, 0.38); M.cyl(x, 2.9, z, 1.15, 0.5, 8, STONE2, 0.9)
    flame(E, x, 3.4, z, 0.85, 2.6, hex, '#fff2b8')
    lights.push([x, 5, z]); C.box(x, 0.5, z, 1.2, 2.6, 1.2, '#fff')
  }
  return { solid: M.build(), emissive: E.build(), floors: F.build(), collide: C.build(), lights, signs, bounds: { w: 17, d: 17, h: 14 } }
}

// ── Faro central del Círculo de los Caminos ──────────────────────────────────
export function buildBeacon({ color = '#7fe7ff' } = {}) {
  const M = new Mesher(), E = new Mesher(), F = new Mesher(), C = new Mesher()
  M.cyl(0, -1.6, 0, 9.6, 1.6, 14, STONE2); F.cyl(0, -1.6, 0, 9, 2.6, 14, STONE); F.cyl(0, 1.0, 0, 5.6, 0.8, 12, MARBLE)
  M.cone(0, 1.8, 0, 2.3, 12.5, 4, MARBLE, Math.PI / 4)
  for (let i = 0; i < 4; i++) { const a = (i / 4) * Math.PI * 2 + Math.PI / 4; E.box(Math.sin(a) * 1.1, 2.6, Math.cos(a) * 1.1, 0.2, 7, 0.2, color, a) }
  E.add(new THREE.OctahedronGeometry(1.7).scale(1, 1.8, 1), color, 0, 20, 0)
  for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2; E.add(new THREE.OctahedronGeometry(0.5).scale(1, 1.6, 1), '#ffffff', Math.sin(a) * 4.2, 14 + (i % 2) * 1.6, Math.cos(a) * 4.2) }
  C.cyl(0, 1.8, 0, 2.2, 13, 8, '#fff')
  return { solid: M.build(), emissive: E.build(), floors: F.build(), collide: C.build(), lights: [[0, 19, 0]], bounds: { w: 20, d: 20, h: 24 } }
}

// ── Fogata con asientos ──────────────────────────────────────────────────────
export function buildCampfire() {
  const M = new Mesher(), E = new Mesher(), C = new Mesher()
  for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2; M.box(Math.cos(a) * 0.9, 0, Math.sin(a) * 0.9, 2.6, 0.5, 0.5, i % 2 ? WOOD : WOOD2, -a + 0.4) }
  for (let i = 0; i < 11; i++) { const a = (i / 11) * Math.PI * 2; M.ball(Math.cos(a) * 2.3, 0.2, Math.sin(a) * 2.3, 0.55, i % 2 ? DARK : STONE2, 0.7) }
  flame(E, 0, 0.3, 0, 1.3, 3.6, '#ff8f2a', '#ffe08a'); flame(E, 0.5, 0.2, -0.3, 0.6, 2.0, '#ff7a1c', '#ffe08a')
  for (let i = 0; i < 3; i++) { const a = (i / 3) * Math.PI * 2 + 0.5; M.box(Math.cos(a) * 4.6, 0, Math.sin(a) * 4.6, 3.4, 0.85, 1.0, WOOD, -a + Math.PI / 2) }
  C.box(0, 0, 0, 2.6, 1.5, 2.6, '#fff')
  return { solid: M.build(), emissive: E.build(), collide: C.build(), lights: [[0, 2.4, 0]], bounds: { w: 11, d: 11, h: 4 } }
}

// ── Nido de mascota: musgo, ramas y un huevo luminoso del color de su mascota ───
export function buildNest({ color = '#ff9f43' } = {}) {
  const M = new Mesher(), E = new Mesher()
  M.cyl(0, -0.3, 0, 3.5, 1.0, 9, MOSS, 2.7)
  for (let i = 0; i < 16; i++) { const a = (i / 16) * Math.PI * 2; M.box(Math.cos(a) * 2.6, 0.6, Math.sin(a) * 2.6, 2.0, 0.28, 0.28, i % 3 ? WOOD : WOOD2, -a - Math.PI / 2) }
  M.cyl(0, 0.7, 0, 2.4, 0.3, 9, '#e6d9a8', 2.0)
  E.ball(0, 1.0, 0, 0.95, color, 1.35); E.ball(0, 3.4, 0, 0.18, '#ffffff'); E.ball(0.7, 2.7, 0.3, 0.12, '#ffffff')
  return { solid: M.build(), emissive: E.build(), bounds: { w: 8, d: 8, h: 4 } }
}

// ── Muñeco de paja o tablero de puntería ─────────────────────────────────────
export function buildDummy({ kind = 'dummy' } = {}) {
  const M = new Mesher(), C = new Mesher()
  if (kind === 'target') {
    for (const sx of [-1, 1]) M.box(sx * 1.2, 0, -0.5, 0.28, 2.8, 0.28, WOOD2)
    M.box(0, 2.6, -0.55, 2.8, 0.25, 0.3, WOOD2)
    for (const [r, hex, z] of [[1.7, '#e8dcc0', 0.05], [1.3, '#b8402e', 0.12], [0.85, '#e8dcc0', 0.19], [0.4, '#b8402e', 0.26]]) M.add(new THREE.CylinderGeometry(r, r, 0.3, 16).rotateX(Math.PI / 2), hex, 0, 3.6, z - 0.5)
    C.box(0, 0, -0.5, 3.4, 5.4, 1.0, '#fff')
  } else {
    M.cyl(0, 0, 0, 1.1, 0.3, 8, WOOD2); M.cyl(0, 0.3, 0, 0.22, 3.1, 6, WOOD); M.box(0, 2.3, 0, 2.7, 0.3, 0.3, WOOD)
    M.cyl(0, 0.9, 0, 0.85, 2.0, 7, '#d9bf7a', 0.7); M.cyl(0, 1.8, 0, 0.87, 0.28, 7, '#b3402e'); M.ball(0, 3.55, 0, 0.7, '#d9bf7a')
    for (const sx of [-1, 1]) M.ball(sx * 1.45, 2.4, 0, 0.35, '#d9bf7a')
    C.box(0, 0, 0, 1.7, 4.2, 1.7, '#fff')
  }
  return { solid: M.build(), collide: C.build(), bounds: { w: 4, d: 3, h: 6 } }
}

// ── Observatorio: torre de piedra con cúpula azul, ventanas, telescopio y cristal ──
export function buildObservatory() {
  const M = new Mesher(), E = new Mesher(), C = new Mesher()
  M.cyl(0, -1.6, 0, 8.4, 2.2, 12, STONE2); M.cyl(0, 0.5, 0, 6.4, 13, 12, STONE, 5.6)
  for (const y of [3.5, 8, 12.4]) M.cyl(0, y, 0, 6.2 - (y - 3.5) * 0.06, 0.45, 12, STONE2, 6.3 - (y - 3.5) * 0.06)
  M.box(0, 0.5, 5.7, 2.8, 4.0, 0.7, '#5a4630'); M.box(0, 4.5, 5.7, 3.4, 0.4, 0.9, STONE2)
  for (let i = 0; i < 5; i++) { const a = -0.9 + i * 0.45; E.box(Math.sin(a) * 5.6, 6.4 + (i % 2) * 2.4, Math.cos(a) * 5.6, 0.7, 2.0, 0.3, '#ffd98a', a) }
  M.cyl(0, 13.5, 0, 7.6, 0.5, 14, STONE2)
  for (let i = 0; i < 16; i++) { const a = (i / 16) * Math.PI * 2; M.box(Math.sin(a) * 7.3, 14, Math.cos(a) * 7.3, 0.3, 1.1, 0.3, STONE) }
  M.add(new THREE.SphereGeometry(5.6, 14, 7, 0, Math.PI * 2, 0, Math.PI / 2), '#6d86b8', 0, 14, 0)
  E.box(0, 14.6, 5.45, 1.1, 3.6, 0.3, '#bfe9ff')
  M.add(new THREE.CylinderGeometry(0.45, 0.65, 6.5, 8).translate(0, 3.2, 0).rotateX(Math.PI / 2 - 0.65), '#caa24a', 0, 16.6, 3.2)
  E.add(new THREE.OctahedronGeometry(1.5).scale(1, 1.8, 1), '#8fe9ff', 0, 25, 0)
  for (let i = 0; i < 5; i++) { const a = (i / 5) * Math.PI * 2; E.add(new THREE.OctahedronGeometry(0.4).scale(1, 1.5, 1), '#ffffff', Math.sin(a) * 3.4, 22 + (i % 2) * 2, Math.cos(a) * 3.4) }
  C.cyl(0, 0.5, 0, 6.4, 14, 8, '#fff')
  return { solid: M.build(), emissive: E.build(), collide: C.build(), lights: [[0, 24, 0], [0, 3, 7]], bounds: { w: 18, d: 18, h: 28 } }
}

// ── Arco monumental (entrada y puerta final): runas doradas y letrero ────────
export function buildArch({ w = 12, h = 18, sign = '', color = GOLD } = {}) {
  const M = new Mesher(), E = new Mesher(), C = new Mesher(), signs = []
  for (const sx of [-1, 1]) {
    const x = sx * (w / 2 + 1.8)
    M.box(x, -1.2, 0, 3.6, 1.6, 3.6, STONE2); M.cyl(x, 0.4, 0, 1.4, h - 0.4, 8, MARBLE, 1.25); M.box(x, h, 0, 3.8, 0.8, 3.8, STONE)
    M.ball(x, h + 1.7, 0, 0.9, color); C.box(x, -1, 0, 3.4, h + 1, 3.4, '#fff')
    for (let k = 0; k < 4; k++) E.box(x, 3 + k * 3.4, 1.3, 0.35, 1.5, 0.12, color)
  }
  M.box(0, h, 0, w + 9, 2.2, 3.8, STONE2); M.box(0, h + 2.2, 0, w + 10, 0.6, 4.4, STONE); M.gable(0, h + 2.8, 0, w + 9, 3.4, 3.2, STONE)
  for (let x = -w / 2 + 1; x < w / 2; x += 1.6) E.box(x, h + 0.2, 1.95, 0.55, 1.1, 0.1, color)
  if (sign) signs.push({ text: sign, color, x: 0, y: h + 2.6, z: 2.1, w: Math.max(7, w * 0.9), h: 1.3, ry: 0 }, { text: sign, color, x: 0, y: h + 2.6, z: -2.1, w: Math.max(7, w * 0.9), h: 1.3, ry: Math.PI })
  return { solid: M.build(), emissive: E.build(), collide: C.build(), signs, lights: [[0, h - 1, 3]], bounds: { w: w + 12, d: 6, h: h + 8 } }
}

// ── Antorcha (instanciada) ───────────────────────────────────────────────────
export function buildTorch() {
  const M = new Mesher(), E = new Mesher()
  M.cyl(0, 0, 0, 0.2, 3.3, 5, WOOD, 0.14); M.cyl(0, 3.3, 0, 0.55, 0.4, 6, DARK, 0.4)
  flame(E, 0, 3.75, 0, 0.42, 1.3, '#ff8f2a', '#ffe08a')
  return { solid: M.build(), emissive: E.build(), collide: new Mesher().box(0, 0, 0, 0.5, 3.3, 0.5, '#fff').build() }
}
// ── Estandarte (instanciado) ─────────────────────────────────────────────────
export function buildBanner({ color = '#e9b949' } = {}) {
  const M = new Mesher()
  M.cyl(0, 0, 0, 0.18, 7.2, 5, WOOD2, 0.12); M.box(0, 6.6, 0, 1.9, 0.18, 0.18, GOLD); M.ball(0, 7.4, 0, 0.22, GOLD)
  M.box(0, 4.1, 0, 1.5, 2.5, 0.07, color); M.add(new THREE.CylinderGeometry(0.75, 0.75, 0.07, 3).rotateX(Math.PI / 2).rotateZ(Math.PI), color, 0, 4.1, 0)
  return { solid: M.build(), collide: new Mesher().box(0, 0, 0, 0.5, 3, 0.5, '#fff').build() }
}
// ── Roca (instanciada) ───────────────────────────────────────────────────────
export function buildRock({ seed = 1 } = {}) {
  const R = rng(seed * 97 + 5), M = new Mesher()
  M.ball(0, -0.2, 0, 1.6 + R() * 0.5, '#8a8473', 0.75); M.ball(1.3, -0.3, 0.5, 0.9 + R() * 0.4, '#9a9482', 0.8); M.ball(-0.9, -0.3, -0.8, 0.7 + R() * 0.3, '#78725f', 0.8)
  return { solid: M.build(), collide: new Mesher().box(0, 0, 0, 2.6, 1.4, 2.6, '#fff').build() }
}
// ── Ruinas: arco de columnas, algunas rotas, con alguna caída ────────────────
export function buildRuin({ n = 7, r = 14, seed = 1 } = {}) {
  const R = rng(seed * 53 + 11), M = new Mesher(), C = new Mesher()
  for (let i = 0; i < n; i++) {
    const a = -Math.PI * 0.55 + (i / Math.max(1, n - 1)) * Math.PI * 1.1, x = Math.sin(a) * r, z = Math.cos(a) * r * 0.55 - r * 0.3, full = R() > 0.45, hh = full ? 8.5 : 3.5 + R() * 3
    M.box(x, 0, z, 2.0, 0.5, 2.0, STONE2); M.cyl(x, 0.5, z, 0.8, hh, 8, '#ddd3ba', 0.7)
    if (full) M.box(x, 0.5 + hh, z, 2.0, 0.5, 2.0, STONE); else M.cone(x, 0.5 + hh, z, 0.7, 0.5 + R() * 0.6, 5, '#cfc3a6', R() * 3)
    C.box(x, 0, z, 1.8, hh + 0.5, 1.8, '#fff')
    if (!full && R() > 0.4) M.add(new THREE.CylinderGeometry(0.7, 0.75, 3.4, 8).rotateZ(Math.PI / 2), '#d3c9ae', x + 2.8, 0.7, z + (R() - 0.5) * 2, R() * 3)
  }
  return { solid: M.build(), collide: C.build(), bounds: { w: r * 2.4, d: r, h: 10 } }
}

// ── Catálogo (editor) y despacho ─────────────────────────────────────────────
const num = (k, label, min, max, step = 1) => ({ k, label, kind: 'num', min, max, step })
const sel = (k, label, opts) => ({ k, label, kind: 'sel', opts })
const text = (k, label) => ({ k, label, kind: 'text' })
export const SANCTUARY_CATALOG = {
  altar: { label: 'Altar de clase', group: 'Santuario', defaults: { kind: 'programmer' }, fields: [sel('kind', 'Clase', Object.keys(CLASS_LOOK)), text('name', 'Nombre (vacío = el de la clase)'), text('color', 'Color (vacío = el de la clase)')] },
  beacon: { label: 'Faro del Círculo', group: 'Santuario', defaults: { color: '#7fe7ff' }, fields: [text('color', 'Color')] },
  campfire: { label: 'Fogata con asientos', group: 'Santuario', defaults: {}, fields: [] },
  nest: { label: 'Nido de mascota', group: 'Santuario', defaults: { color: '#ff9f43' }, fields: [text('color', 'Color del huevo')] },
  dummy: { label: 'Muñeco / tablero', group: 'Santuario', defaults: { kind: 'dummy' }, fields: [sel('kind', 'Tipo', ['dummy', 'target'])] },
  observatory: { label: 'Observatorio', group: 'Santuario', defaults: {}, fields: [] },
  arch: { label: 'Arco monumental', group: 'Santuario', defaults: { w: 12, h: 18, sign: 'Arco' }, fields: [num('w', 'Ancho útil (m)', 6, 24), num('h', 'Altura (m)', 10, 30), text('sign', 'Letrero'), text('color', 'Color')] },
  torch: { label: 'Antorcha', group: 'Santuario', instanced: true, defaults: {}, fields: [] },
  banner: { label: 'Estandarte', group: 'Santuario', instanced: true, defaults: { color: '#e9b949' }, fields: [text('color', 'Color')] },
  rock: { label: 'Roca', group: 'Naturaleza', instanced: true, defaults: { seed: 1, s: 1 }, fields: [num('seed', 'Variante', 1, 9), num('s', 'Escala', 0.5, 3, 0.1)] },
  ruin: { label: 'Ruinas', group: 'Santuario', defaults: { n: 7, r: 14, seed: 1 }, fields: [num('n', 'Columnas', 3, 12), num('r', 'Radio (m)', 8, 30), num('seed', 'Semilla', 1, 99)] },
}
export function sanctuaryPiece(it) {
  switch (it.type) {
    case 'altar': return buildAltar(it)
    case 'beacon': return buildBeacon(it)
    case 'campfire': return buildCampfire()
    case 'nest': return buildNest(it)
    case 'dummy': return buildDummy(it)
    case 'observatory': return buildObservatory()
    case 'arch': return buildArch(it)
    case 'torch': return buildTorch()
    case 'banner': return buildBanner(it)
    case 'rock': return buildRock(it)
    case 'ruin': return buildRuin(it)
    default: return undefined
  }
}
