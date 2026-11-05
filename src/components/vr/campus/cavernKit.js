import * as THREE from 'three'
import { Mesher } from './mesher'
import { tr } from '../../../i18n'

// Piezas del mapa "La Caverna de Platón": la montaña hueca (túnel + cámara), la pared de sombras, prisioneros
// encadenados, el muro con titiriteros, la hoguera, estalactitas, las cinco formas platónicas y el monumento al Sol.
// Mismo contrato que sanctuaryKit/hospitalKit. Unidades en metros del campus; el frente de la pieza mira a +Z.
// ESCALA: el jugador mide ~1.2 m aquí, así que las figuras humanas miden ~1.2–1.4 m y la cámara es enorme a propósito.
const ROCK_IN = '#4a4037', ROCK_FLOOR = '#5a4e42', ROCK_OUT = '#80766a', ROCK_DARK = '#3b332c', MOSS = '#6f8f4a', IRON = '#3a3a3e', WOOD = '#7a5636'
const rng = (seed) => { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296) }

// Caja por esquinas (x0..x1, y0..y1, z0..z1) en el Mesher dado
const slab = (M, x0, x1, y0, y1, z0, z1, hex) => M.box((x0 + x1) / 2, y0, (z0 + z1) / 2, x1 - x0, y1 - y0, z1 - z0, hex)

// ── La montaña hueca ─────────────────────────────────────────────────────────
// Origen = centro de la boca, a nivel del suelo; la caverna se adentra hacia -Z (el campo queda hacia +Z).
// Túnel: x ±9, z 4…-60, techo a 9 m. Cámara: x ±26, z -60…-135, techo a 17 m. Las paredes son losas gruesas: su cara
// interior es la roca de la cueva y la exterior es la ladera de la montaña (colisionan las dos).
export function buildCavern() {
  const M = new Mesher(), F = new Mesher(), C = new Mesher(), R = rng(11)
  const wall = (x0, x1, y0, y1, z0, z1, hex = '#6a6054') => { slab(M, x0, x1, y0, y1, z0, z1, hex); slab(C, x0, x1, y0, y1, z0, z1, '#fff') }
  // frente (a ambos lados de la boca) y dintel
  wall(-56, -9, -3, 22, -60, 4); wall(9, 56, -3, 22, -60, 4); wall(-9, 9, 9, 22, -60, 4)
  // cámara: laterales, fondo y techo
  wall(-56, -26, -3, 30, -160, -60); wall(26, 56, -3, 30, -160, -60); wall(-26, 26, -3, 30, -160, -135); wall(-26, 26, 17, 30, -135, -60)
  // suelo de roca (caminable) a lo largo del túnel y la cámara
  slab(F, -9, 9, -0.2, 0.12, -62, 6, ROCK_FLOOR); slab(F, -26, 26, -0.2, 0.12, -135, -58, ROCK_FLOOR)
  // acabado exterior: la cara visible de la ladera es más clara y con musgo; escalones de cumbre y rocas sueltas
  slab(M, -56, 56, 22, 23, -60, 4, ROCK_OUT); slab(M, -56, 56, 30, 31, -160, -60, ROCK_OUT)
  for (const [x0, x1, z0, z1, y0, y1, hex] of [[-48, 48, -152, -66, 31, 38, ROCK_OUT], [-34, 34, -140, -82, 38, 45, '#8a7f70'], [-20, 20, -128, -94, 45, 50, '#948977']]) { slab(M, x0, x1, y0, y1, z0, z1, hex); slab(M, x0 + 1, x1 - 1, y1, y1 + 0.8, z0 + 1, z1 - 1, MOSS) }
  slab(M, -50, 50, 23, 24.2, -58, 2, MOSS)
  for (let i = 0; i < 38; i++) { // rocas sueltas alrededor del pie de la montaña (también como relieve del dintel)
    const side = R() < 0.5 ? -1 : 1, onFront = R() < 0.35, x = onFront ? (R() - 0.5) * 100 : side * (56 + R() * 6), z = onFront ? 4 + R() * 3 : -160 + R() * 164
    if (onFront && Math.abs(x) < 14) continue
    M.ball(x, 1 + R() * 3, z, 3 + R() * 5, R() < 0.5 ? ROCK_OUT : '#6f665a', 0.7)
  }
  // marco de la boca: dos pilares de roca y un arco de bloques
  for (const sx of [-1, 1]) { M.ball(sx * 10.5, 3, 5, 5, ROCK_OUT, 1.2); M.ball(sx * 9.5, 9, 4.5, 3.4, '#6f665a', 1) }
  M.ball(0, 10.4, 5, 3.2, ROCK_OUT, 0.8)
  // zócalo de la cámara y relieve en las paredes interiores (bloques salientes irregulares)
  for (let i = 0; i < 26; i++) {
    const side = i % 2 ? 1 : -1, z = -66 - (i / 26) * 66 - R() * 3
    M.box(side * (25 + R() * 0.2), 0, z, 2.2 + R() * 1.5, 2 + R() * 6, 3 + R() * 4, i % 3 ? ROCK_DARK : ROCK_IN)
  }
  return { solid: M.build(), floors: F.build(), collide: C.build(), bounds: { w: 118, d: 168, h: 50 } }
}

// ── Pared de sombras: franja iluminada por el fuego y siluetas oscuras de lo que pasa detrás ──
export function buildShadowWall({ w = 40, h = 10, seed = 3 } = {}) {
  const E = new Mesher(), D = new Mesher(), R = rng(seed * 31 + 5), lights = [[-w * 0.3, 3, 4], [w * 0.3, 3, 4]]
  E.box(0, 2, 0, w, h, 0.1, '#5a4934'); E.box(0, 2, 0.02, w - 2, h - 1.4, 0.1, '#6a563c') // resplandor del fuego sobre la roca
  const shapes = ['man', 'horse', 'jar', 'tree', 'man', 'bird', 'jar', 'horse']
  shapes.forEach((kind, i) => {
    const s = 1.1 + R() * 0.7, x = -w / 2 + 3 + ((w - 6) * i) / (shapes.length - 1), y = 3 + R() * 2.4, z = 0.2
    const b = (cx, cy, bw, bh) => D.box(x + cx * s, y + cy * s, z, bw * s, bh * s, 0.12, '#0b0806')
    if (kind === 'man') { D.ball(x, y + 4.1 * s, z, 0.55 * s, '#0b0806'); b(0, 1.6, 1.3, 2.4); b(-0.35, 0, 0.45, 1.7); b(0.35, 0, 0.45, 1.7); b(-1.1, 2.4, 0.4, 1.4); b(1.1, 2.4, 0.4, 1.4) }
    else if (kind === 'horse') { b(0, 1.4, 3.2, 1.3); b(1.6, 2.2, 0.8, 1.6); b(-1.4, 0, 0.4, 1.5); b(-0.6, 0, 0.4, 1.5); b(0.6, 0, 0.4, 1.5); b(1.3, 0, 0.4, 1.5) }
    else if (kind === 'jar') { D.cyl(x, y, z, 0.9 * s, 2.4 * s, 7, '#0b0806', 0.5 * s); b(0, 2.4, 0.8, 0.5) }
    else if (kind === 'tree') { b(0, 0, 0.5, 2.6); D.ball(x, y + 3.6 * s, z, 1.7 * s, '#0b0806') }
    else { b(0, 1, 1.6, 0.5); b(-0.9, 1.5, 0.9, 0.3); b(0.9, 1.5, 0.9, 0.3) }
  })
  return { solid: D.build(), emissive: E.build(), lights, bounds: { w, d: 1, h: h + 2 } }
}

// ── Personas (para prisioneros y titiriteros) ────────────────────────────────
// Prisionero sentado de cara a +Z, con grilletes y cadena a una argolla en el suelo.
export function buildPrisoner({ tone = 0 } = {}) {
  const M = new Mesher(), tunic = ['#7a6a55', '#6b5f50', '#85745c'][tone % 3], skin = ['#d1a27a', '#b98258', '#e0b48c'][tone % 3]
  M.box(0, 0.18, 0, 0.5, 0.6, 0.36, tunic); M.ball(0, 1.0, 0.04, 0.23, skin)
  for (const sx of [-1, 1]) { M.box(sx * 0.14, 0.05, 0.36, 0.16, 0.14, 0.55, tunic); M.box(sx * 0.31, 0.35, 0.12, 0.11, 0.11, 0.42, tunic); M.box(sx * 0.14, 0.02, 0.62, 0.2, 0.06, 0.12, IRON) } // piernas, brazos, grilletes
  M.box(0, 0.03, 0.9, 0.05, 0.04, 0.5, IRON); M.cyl(0, 0, 1.2, 0.13, 0.07, 6, IRON)
  return { solid: M.build(), collide: new Mesher().box(0, 0, 0.1, 0.6, 1.0, 0.6, '#fff').build() }
}

// Muro bajo con camino detrás y titiriteros que levantan figuras (animales, jarras, árboles, estatuas) para que proyecten sombras.
export function buildParapet({ len = 44, seed = 2 } = {}) {
  const M = new Mesher(), C = new Mesher(), R = rng(seed * 17 + 3)
  M.box(0, 0, 0, len, 1.0, 0.8, '#5d5346'); M.box(0, 1.0, 0, len + 0.3, 0.15, 1.0, '#6e6354'); M.box(0, 0, 2.3, len, 0.1, 3.0, '#6a5f50')
  C.box(0, 0, 0, len, 1.2, 0.9, '#fff')
  const kinds = ['horse', 'jar', 'man', 'tree', 'horse', 'jar', 'man']
  kinds.forEach((kind, i) => {
    const x = -len / 2 + 4 + ((len - 8) * i) / (kinds.length - 1), z = 2.0 + R() * 0.8
    M.box(x, 0.1, z, 0.5, 0.9, 0.32, '#5f4f3e'); M.ball(x, 1.25, z, 0.22, '#c99468') // titiritero (cuerpo y cabeza)
    for (const sx of [-1, 1]) M.box(x + sx * 0.3, 0.8, z, 0.11, 0.7, 0.11, '#5f4f3e')
    const y = 1.55, o = '#a8702f' // lo que sostiene en alto
    if (kind === 'horse') { M.box(x, y + 0.5, z - 0.2, 1.5, 0.6, 0.3, o); M.box(x + 0.75, y + 1.0, z - 0.2, 0.35, 0.7, 0.3, o); for (const dx of [-0.6, 0.55]) M.box(x + dx, y, z - 0.2, 0.18, 0.5, 0.18, o) }
    else if (kind === 'jar') { M.cyl(x, y, z - 0.2, 0.45, 1.1, 7, o, 0.25); M.cyl(x, y + 1.1, z - 0.2, 0.28, 0.35, 7, o, 0.2) }
    else if (kind === 'man') { M.box(x, y + 0.2, z - 0.2, 0.55, 0.9, 0.25, o); M.ball(x, y + 1.35, z - 0.2, 0.25, o); M.box(x - 0.45, y + 0.8, z - 0.2, 0.5, 0.12, 0.12, o); M.box(x + 0.45, y + 0.8, z - 0.2, 0.5, 0.12, 0.12, o) }
    else { M.cyl(x, y, z - 0.2, 0.1, 0.8, 5, WOOD, 0.08); M.ball(x, y + 1.3, z - 0.2, 0.7, '#8a8f3c', 0.9) }
  })
  return { solid: M.build(), collide: C.build(), bounds: { w: len, d: 6, h: 4 } }
}

// ── Hoguera grande (la fuente de luz de la alegoría) ─────────────────────────
export function buildBonfire() {
  const M = new Mesher(), E = new Mesher(), C = new Mesher()
  for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2; M.ball(Math.cos(a) * 3.1, 0.2, Math.sin(a) * 3.1, 0.8, i % 2 ? '#5d5346' : '#7a6e5e', 0.7) }
  for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2; M.box(Math.cos(a) * 1.1, 0, Math.sin(a) * 1.1, 3.0, 0.55, 0.55, i % 2 ? WOOD : '#5a4030', -a + 0.5) }
  const fl = (x, z, r, h, o, c) => { E.add(new THREE.OctahedronGeometry(r).scale(1, h / (2 * r), 1), o, x, 0.4 + h / 2, z); E.add(new THREE.OctahedronGeometry(r * 0.55).scale(1, (h * 0.7) / (2 * r * 0.55), 1), c, x, 0.4 + h * 0.38, z) }
  fl(0, 0, 1.7, 6.5, '#ff7a1c', '#ffd45a'); fl(0.9, 0.5, 1.0, 4, '#ff8f2a', '#ffe08a'); fl(-0.8, -0.6, 0.9, 3.6, '#ff6a14', '#ffd45a')
  C.cyl(0, 0, 0, 3.3, 1.6, 8, '#fff')
  return { solid: M.build(), emissive: E.build(), collide: C.build(), lights: [[0, 3.5, 0], [0, 2, 5], [0, 2, -5], [6, 2, 0], [-6, 2, 0]], bounds: { w: 8, d: 8, h: 8 } }
}

// ── Estalactitas / estalagmitas (instanciadas; la estalactita cuelga hacia -Y desde su origen) ──
export function buildStalactite() { const M = new Mesher(); M.add(new THREE.ConeGeometry(1.3, 6, 5).rotateX(Math.PI).translate(0, -3, 0), '#5a4e42'); return { solid: M.build() } }
export function buildStalagmite() { const M = new Mesher(); M.cone(0, 0, 0, 1.2, 4, 5, '#6a5d4f'); M.cone(0.9, 0, 0.5, 0.7, 2.2, 5, '#5a4e42'); return { solid: M.build(), collide: new Mesher().box(0, 0, 0, 1.6, 3, 1.6, '#fff').build() } }

// ── El mundo real, afuera ────────────────────────────────────────────────────
// Las cinco formas perfectas (sólidos platónicos) sobre su pedestal, brillando: lo que de verdad ES, frente a las sombras.
const SOLIDS = { cube: () => new THREE.BoxGeometry(1.7, 1.7, 1.7), tetra: () => new THREE.TetrahedronGeometry(1.5), octa: () => new THREE.OctahedronGeometry(1.4), dodeca: () => new THREE.DodecahedronGeometry(1.35), icosa: () => new THREE.IcosahedronGeometry(1.4) }
export const FORM_NAMES = { cube: () => tr('El Cubo', 'The Cube'), tetra: () => tr('El Tetraedro', 'The Tetrahedron'), octa: () => tr('El Octaedro', 'The Octahedron'), dodeca: () => tr('El Dodecaedro', 'The Dodecahedron'), icosa: () => tr('El Icosaedro', 'The Icosahedron') }
export function buildForm({ kind = 'cube' } = {}) {
  const M = new Mesher(), E = new Mesher(), C = new Mesher(), signs = []
  M.cyl(0, 0, 0, 1.9, 0.5, 8, '#cfc5b0', 1.7); M.cyl(0, 0.5, 0, 1.2, 1.8, 8, '#e8dec8', 1.0); M.cyl(0, 2.3, 0, 1.4, 0.3, 8, '#cfc5b0')
  E.add((SOLIDS[kind] || SOLIDS.cube)().rotateY(0.6), '#ffd770', 0, 4.4, 0)
  C.cyl(0, 0, 0, 1.9, 2.6, 8, '#fff')
  signs.push({ text: (FORM_NAMES[kind] || FORM_NAMES.cube)(), color: '#ffd770', x: 0, y: 1.3, z: 1.25, w: 2.4, h: 0.55, ry: 0 })
  return { solid: M.build(), emissive: E.build(), collide: C.build(), signs, lights: [[0, 5, 0]], bounds: { w: 4, d: 4, h: 7 } }
}

// El Sol (el Bien): aro de piedra con un disco dorado y rayos, sobre una plataforma escalonada.
export function buildSunstone() {
  const M = new Mesher(), E = new Mesher(), C = new Mesher(), signs = []
  M.cyl(0, -1, 0, 9, 1.6, 12, '#cfc5b0', 8.4); M.cyl(0, 0.6, 0, 7, 0.8, 12, '#e8dec8', 6.5)
  for (const sx of [-1, 1]) { M.box(sx * 6.6, 1.4, 0, 2.0, 15, 2.0, '#e8dec8'); M.box(sx * 6.6, 16.4, 0, 2.5, 0.8, 2.5, '#cfc5b0'); C.box(sx * 6.6, 1.4, 0, 2.0, 15, 2.0, '#fff') }
  M.box(0, 17.2, 0, 15.4, 1.4, 2.4, '#cfc5b0')
  E.add(new THREE.CylinderGeometry(4.6, 4.6, 0.8, 24).rotateX(Math.PI / 2), '#ffd24a', 0, 9.6, 0)
  E.add(new THREE.CylinderGeometry(3.2, 3.2, 1.0, 20).rotateX(Math.PI / 2), '#fff1b0', 0, 9.6, 0)
  for (let i = 0; i < 16; i++) { const a = (i / 16) * Math.PI * 2; E.add(new THREE.BoxGeometry(0.5, i % 2 ? 2.2 : 3.4, 0.4).translate(0, 4.6 + (i % 2 ? 1.1 : 1.7), 0).rotateZ(a), '#ffd24a', 0, 9.6, 0) }
  signs.push({ text: tr('El Sol: la idea del Bien', 'The Sun: the Idea of the Good'), color: '#ffd24a', x: 0, y: 1.1, z: 6.7, w: 9, h: 1.1, ry: 0 })
  return { solid: M.build(), emissive: E.build(), collide: C.build(), signs, lights: [[0, 10, 4], [0, 4, 7]], bounds: { w: 20, d: 20, h: 21 } }
}

// ── Catálogo y despacho ──────────────────────────────────────────────────────
const num = (k, label, min, max, step = 1) => ({ k, label, kind: 'num', min, max, step })
const sel = (k, label, opts) => ({ k, label, kind: 'sel', opts })
export const CAVERN_CATALOG = {
  cavern: { label: 'Caverna (montaña hueca)', group: 'Caverna', defaults: {}, fields: [] },
  shadowwall: { label: 'Pared de sombras', group: 'Caverna', defaults: { w: 40, h: 10, seed: 3 }, fields: [num('w', 'Ancho (m)', 10, 44), num('h', 'Alto (m)', 5, 14), num('seed', 'Semilla', 1, 99)] },
  prisoner: { label: 'Prisionero encadenado', group: 'Caverna', instanced: true, defaults: { tone: 0 }, fields: [num('tone', 'Tono', 0, 2)] },
  parapet: { label: 'Muro con titiriteros', group: 'Caverna', defaults: { len: 44, seed: 2 }, fields: [num('len', 'Largo (m)', 20, 50), num('seed', 'Semilla', 1, 99)] },
  bonfire: { label: 'Hoguera grande', group: 'Caverna', defaults: {}, fields: [] },
  stalactite: { label: 'Estalactita', group: 'Caverna', instanced: true, defaults: { s: 1 }, fields: [num('s', 'Escala', 0.4, 3, 0.1)] },
  stalagmite: { label: 'Estalagmita', group: 'Caverna', instanced: true, defaults: { s: 1 }, fields: [num('s', 'Escala', 0.4, 3, 0.1)] },
  form: { label: 'Forma platónica', group: 'Caverna', defaults: { kind: 'cube' }, fields: [sel('kind', 'Sólido', Object.keys(SOLIDS))] },
  sunstone: { label: 'Monumento al Sol', group: 'Caverna', defaults: {}, fields: [] },
}
export function cavernPiece(it) {
  switch (it.type) {
    case 'cavern': return buildCavern()
    case 'shadowwall': return buildShadowWall(it)
    case 'prisoner': return buildPrisoner(it)
    case 'parapet': return buildParapet(it)
    case 'bonfire': return buildBonfire()
    case 'stalactite': return buildStalactite()
    case 'stalagmite': return buildStalagmite()
    case 'form': return buildForm(it)
    case 'sunstone': return buildSunstone()
    default: return undefined
  }
}
