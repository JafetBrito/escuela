// Genera el layout INICIAL de las "Oficinas Oliver Academy" (src/data/oficinasLayout.json): un espacio de trabajo en
// equipo SIN TECHO y con paredes bajas, para verlo desde arriba con la cámara de tercera persona inclinada y alejada.
// Plano (metros, +Z al sur, entrada por el sur): área de trabajo (4 filas de escritorios) al oeste/centro, sala de
// reuniones y oficina del gerente al noreste, cocina, lounge con billar y futbolito al sureste, recepción y servidor
// al suroeste; afuera, terraza, estacionamiento y arboleda. Después se afina a mano en /vr/editor?map=oficinas.
// Uso: node scripts/campus/genOficinas.mjs   (OJO: sobrescribe lo que hayas editado)
import { writeFileSync } from 'node:fs'

let seed = 31337
const R = () => { seed = (seed + 0x6d2b79f5) >>> 0; let t = seed; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296 }
const rnd = (a, b) => a + R() * (b - a)
const items = []
let n = 0
const add = (o) => { const it = { id: `${o.type[0]}${++n}`, ...o }; items.push(it); return it }

// Pared de (x0,z0) a (x1,z1) con un hueco opcional [centroMundo, ancho]. La pieza va a lo largo de X local; las verticales giran 90°
// (el +X local pasa a -Z del mundo, por eso el hueco se invierte).
function wall(x0, z0, x1, z1, { gap = null, gw = 0, glass = false, h = 2.6 } = {}) {
  const horiz = z0 === z1, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, len = Math.abs(horiz ? x1 - x0 : z1 - z0)
  const gapLocal = gap == null ? 0 : horiz ? gap - cx : -(gap - cz)
  add({ type: 'owall', x: cx, z: cz, rot: horiz ? 0 : 90, len, h, gap: gapLocal, gw, glass })
}
// Letrero sobre una puerta (empotrado en el plano de la pared, legible por ambos lados)
const doorSign = (x, z, vertical, text, color, w = 5) => add({ type: 'osign', x, z, rot: vertical ? 90 : 0, text, w, h: 0.45, color, y: 2.1 })

// ── Zonas descubribles ───────────────────────────────────────────────────────
for (const z of [
  { name: 'Recepción', x: 0, z: 17, r: 18, xp: 5 }, { name: 'Área de trabajo', x: -15, z: -11, r: 30, xp: 10 },
  { name: 'Sala de reuniones', x: 27, z: -18, r: 14, xp: 10 }, { name: 'Oficina del gerente', x: 35, z: -1, r: 9, xp: 5 },
  { name: 'Cocina', x: 20, z: -1, r: 9, xp: 5 }, { name: 'Lounge', x: 25, z: 17, r: 16, xp: 10 },
]) add({ type: 'zone', ...z })

// ── Pisos por zona (la alfombra roja del área de trabajo, madera en el lounge...) ──
add({ type: 'ofloor', x: -15, z: -11, w: 54, d: 34, mat: 'carpet' }); add({ type: 'ofloor', x: -17, z: 17, w: 50, d: 22, mat: 'stone' })
add({ type: 'ofloor', x: -36, z: 21, w: 12, d: 14, mat: 'dark', dy: 0.02 }); add({ type: 'ofloor', x: 27, z: -18, w: 30, d: 20, mat: 'gray' })
add({ type: 'ofloor', x: 35, z: -1, w: 14, d: 14, mat: 'carpet' }); add({ type: 'ofloor', x: 20, z: -1, w: 16, d: 14, mat: 'tile' })
add({ type: 'ofloor', x: 25, z: 17, w: 34, d: 22, mat: 'wood' })
add({ type: 'ofloor', x: 24, z: 14, w: 22, d: 7, mat: 'blue', dy: 0.02 }); add({ type: 'ofloor', x: 35, z: -1, w: 8, d: 6, mat: 'dark', dy: 0.02 })
add({ type: 'ofloor', x: 0, z: 34, w: 100, d: 12, mat: 'stone' }) // terraza de entrada

// ── Paredes ──────────────────────────────────────────────────────────────────
wall(-42, -28, 42, -28, { glass: true }); wall(-42, -28, -42, 28, { glass: true }); wall(42, -28, 42, 28, { glass: true })
wall(-42, 28, 42, 28, { gap: 0, gw: 6, glass: true })                     // entrada
wall(12, -28, 12, -8, { gap: -18, gw: 3, glass: true }); wall(12, -8, 42, -8, { gap: 22, gw: 3, glass: true }) // sala de reuniones
wall(12, -8, 12, 6, { gap: -1, gw: 5 }); wall(28, -8, 28, 6, { gap: -1, gw: 3 })  // cocina / gerente
wall(8, 6, 42, 6, { gap: 20, gw: 3 }); wall(8, 6, 8, 28, { gap: 18, gw: 6 })     // lounge
wall(-42, 6, 8, 6, { gap: -17, gw: 14, glass: true })                            // divisor trabajo / recepción
wall(-42, 14, -30, 14); wall(-30, 14, -30, 28, { gap: 21, gw: 3, glass: true })  // servidor
doorSign(22, -8, false, 'SALA DE REUNIONES', '#4f9dff', 6); doorSign(28, -1, true, 'OFICINA DEL GERENTE', '#e9b949', 6)
doorSign(12, -1, true, 'COCINA', '#58d3a8', 3); doorSign(20, 6, false, 'COCINA', '#58d3a8', 3); doorSign(8, 18, true, 'LOUNGE', '#ff8ac2', 3.5)
doorSign(-30, 21, true, 'SERVIDOR', '#b78cff', 3.5); doorSign(-17, 6, false, 'ÁREA DE TRABAJO', '#ff6b5b', 8)
add({ type: 'osign', x: 0, z: 28, rot: 0, text: 'OLIVER ACADEMY · OFICINAS', w: 12, h: 0.9, color: '#ffb347', y: 2.9 })

// ── Área de trabajo: cuatro filas dobles de escritorios ─────────────────────
;[[-34, -18], [-21, -18], [-8, -18], [-34, -4], [-21, -4], [-8, -4]].forEach(([x, z], i) => add({ type: 'deskrow', x, z, rot: 0, n: 5, occ: 0.7, seed: i + 1 }))
add({ type: 'prop', kind: 'whiteboard', x: -34, z: -27.8, rot: 0, len: 4 }); add({ type: 'prop', kind: 'whiteboard', x: -8, z: -27.8, rot: 0, len: 4 })
add({ type: 'prop', kind: 'screen', x: -21, z: -27.8, rot: 0, len: 5 })
add({ type: 'prop', kind: 'printer', x: -40.5, z: -12, rot: 90 }); add({ type: 'prop', kind: 'cooler', x: -40.5, z: -9, rot: 90 }); add({ type: 'prop', kind: 'shelf', x: -41.6, z: -20, rot: 90, len: 6 })
for (const [x, z] of [[-40, -26], [-40, 4], [10, -26], [-27.5, -11], [-14.5, -11], [-1.5, -11], [10, 4.5]]) add({ type: 'plant', x, z, kind: 'tall' })

// ── Sala de reuniones ────────────────────────────────────────────────────────
add({ type: 'meettable', x: 27, z: -17, rot: 0, len: 10, seed: 3 })
add({ type: 'prop', kind: 'screen', x: 27, z: -27.8, rot: 0, len: 6 }); add({ type: 'prop', kind: 'whiteboard', x: 41.8, z: -18, rot: -90, len: 5 })
add({ type: 'plant', x: 14, z: -26, kind: 'bush' }); add({ type: 'plant', x: 40.5, z: -26, kind: 'tall' }); add({ type: 'plant', x: 14, z: -10, kind: 'bush' })

// ── Oficina del gerente ──────────────────────────────────────────────────────
add({ type: 'prop', kind: 'mdesk', x: 36, z: -0.5, rot: 0 }); add({ type: 'prop', kind: 'shelf', x: 41.6, z: -1, rot: -90, len: 8 })
add({ type: 'prop', kind: 'sofa', x: 34, z: 4.4, rot: 180, len: 3.5, color: '#6b2f2a' }); add({ type: 'plant', x: 30, z: -6.5, kind: 'tall' }); add({ type: 'plant', x: 40.5, z: 4.8, kind: 'bush' })
add({ type: 'prop', kind: 'whiteboard', x: 32, z: -7.8, rot: 0, len: 3 })

// ── Cocina ───────────────────────────────────────────────────────────────────
add({ type: 'prop', kind: 'counter', x: 19, z: -7.5, rot: 0, len: 8 }); add({ type: 'prop', kind: 'fridge', x: 13.6, z: -7.3, rot: 0 }); add({ type: 'prop', kind: 'coffee', x: 25.5, z: -7.5, rot: 0 })
add({ type: 'prop', kind: 'island', x: 20, z: -0.5, rot: 0, len: 5 }); add({ type: 'plant', x: 26.5, z: 4.8, kind: 'bush' })

// ── Lounge: billar, futbolito, sofás, puf y TV ───────────────────────────────
add({ type: 'prop', kind: 'pool', x: 18, z: 14, rot: 0 }); add({ type: 'prop', kind: 'pool', x: 30, z: 14, rot: 0 })
add({ type: 'prop', kind: 'foos', x: 39, z: 10, rot: 90 }); add({ type: 'prop', kind: 'tv', x: 24, z: 27.5, rot: 180, len: 6 })
add({ type: 'prop', kind: 'sofa', x: 24, z: 22, rot: 0, len: 4.5, color: '#3b6ea5' }); add({ type: 'prop', kind: 'sofa', x: 12, z: 24, rot: 90, len: 3.5, color: '#4f8a5b' }); add({ type: 'prop', kind: 'sofa', x: 37, z: 22, rot: -90, len: 3.5, color: '#c49a3a' })
for (const [x, z, c] of [[16, 20, '#ff8ac2'], [32, 20, '#4f9dff'], [35, 26, '#f2b84b']]) add({ type: 'prop', kind: 'bean', x, z, color: c })
add({ type: 'plant', x: 10, z: 9, kind: 'tall' }); add({ type: 'plant', x: 40.5, z: 26.5, kind: 'tall' })

// ── Recepción y servidor ─────────────────────────────────────────────────────
add({ type: 'prop', kind: 'reception', x: 0, z: 15, rot: 0, len: 7 })
add({ type: 'prop', kind: 'sofa', x: -24, z: 24, rot: 0, len: 4, color: '#6b7c93' }); add({ type: 'prop', kind: 'sofa', x: -12, z: 24, rot: 0, len: 4, color: '#6b7c93' })
for (const [x, z] of [[-6, 26], [6, 26], [-40, 8], [-40, 26], [-20, 10]]) add({ type: 'plant', x, z, kind: x % 2 ? 'tall' : 'bush' })
for (let i = 0; i < 4; i++) { add({ type: 'prop', kind: 'server', x: -40 + i * 2.4, z: 15.2, rot: 0 }); add({ type: 'prop', kind: 'server', x: -40 + i * 2.4, z: 26.8, rot: 180 }) }

// ── Exterior: estacionamiento, farolas, portal de regreso y arboleda ─────────
add({ type: 'pave', x: 0, z: 58, w: 110, d: 32, mat: 'asphalt', dy: 0.01 })
const COLORS = ['#c0392b', '#2c3e50', '#f1c40f', '#ecf0f1', '#27ae60', '#8e44ad', '#34495e']
for (const z of [52, 64]) for (let x = -45; x <= 45; x += 9) if (R() > 0.3) add({ type: 'car', x: x + rnd(-0.6, 0.6), z, rot: z === 52 ? 180 : 0, color: COLORS[Math.floor(R() * COLORS.length)] })
for (let x = -40; x <= 40; x += 16) add({ type: 'lamp', x, z: 40 })
add({ type: 'portal', x: -34, z: 38, rot: 0, to: '/vr/plaza', label: 'Plaza de las Academias', color: '#ffb347', w: 4, h: 5.5 })
let trees = 0
for (let tries = 0; tries < 4000 && trees < 140; tries++) {
  const x = rnd(-140, 140), z = rnd(-120, 130)
  if ((Math.abs(x) < 56 && z > -36 && z < 78) || Math.hypot(x, z) < 20) continue
  add({ type: 'tree', x: +x.toFixed(1), z: +z.toFixed(1), kind: ['oak', 'elm', 'maple', 'birch', 'pine'][Math.floor(R() * 5)], s: +rnd(0.8, 1.5).toFixed(2) }); trees++
}
for (const x of [-52, 52]) for (let z = -24; z <= 24; z += 16) add({ type: 'tree', x, z, kind: 'maple', s: 1.1 })

const out = { version: 1, map: 'oficinas', terrain: 'flat', preset: 'dia', camera: { pitch: 0.85, distance: 28 }, ambient: 0.4, lamp: 3.2, spawn: [0, 42], items }
writeFileSync(new URL('../../src/data/oficinasLayout.json', import.meta.url), JSON.stringify(out).replace(/\{"id"/g, '\n{"id"'))
console.log(`oficinasLayout.json: ${items.length} piezas (${trees} árboles)`)
