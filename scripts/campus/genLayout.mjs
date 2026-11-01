// Genera el layout INICIAL del campus (src/data/campusLayout.json). Después se afina a mano en /vr/editor.
// Uso: node scripts/campus/genLayout.mjs   (OJO: sobrescribe lo que hayas editado)
import { writeFileSync } from 'node:fs'

let seed = 424242
const R = () => { seed = (seed + 0x6d2b79f5) >>> 0; let t = seed; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296 }
const items = []
let n = 0
const add = (o) => { items.push({ id: `${o.type[0]}${++n}`, ...o }); return o }

// ── edificios ────────────────────────────────────────────────────────────────
const B = (x, z, rot, o) => add({ type: 'building', x, z, rot, ...o })
// El Yard
B(0, -10, 0, { w: 26, d: 14, floors: 2, style: 'neo', roof: 'gable', interior: 'hall', tower: 'cupola', ivy: 0, sign: 'Hall Central', seed: 3 })
B(0, -62, 0, { w: 60, d: 34, floors: 3, style: 'neo', roof: 'hip', interior: 'library', portico: true, door: 4.4, ivy: 0, sign: 'Biblioteca Central', seed: 5 })
B(62, -52, -90, { w: 22, d: 40, floors: 1, style: 'neo', roof: 'gable', interior: 'chapel', tower: 'steeple', ivy: 0, sign: 'Capilla', seed: 7 })
B(-62, -52, 90, { w: 26, d: 44, floors: 1, style: 'brick', roof: 'gable', interior: 'dining', tower: 'cupola', ivy: 0.3, sign: 'Gran Comedor', seed: 9 })
const dormNames = ['Aldea', 'Cedro', 'Roble', 'Olmo', 'Arce', 'Fresno', 'Sauce', 'Nogal']
;[-8, 20, 48, 76].forEach((z, i) => {
  B(-78, z, 90, { w: 24, d: 14, floors: 4, style: 'brick', roof: 'gable', interior: 'dorm', ivy: 0.8, sign: `Residencia ${dormNames[i]}`, seed: 11 + i })
  B(78, z, -90, { w: 24, d: 14, floors: 4, style: 'brick', roof: 'gable', interior: 'dorm', ivy: 0.8, sign: `Residencia ${dormNames[i + 4]}`, seed: 21 + i })
})
B(-42, 30, 90, { w: 22, d: 12, floors: 3, style: 'brick', roof: 'gable', interior: 'classroom', ivy: 0.7, sign: 'Aulas Oeste', seed: 31 })
B(42, 30, -90, { w: 22, d: 12, floors: 3, style: 'brick', roof: 'gable', interior: 'classroom', ivy: 0.7, sign: 'Aulas Este', seed: 32 })
// Plaza de entrada
B(-46, 112, 0, { w: 20, d: 12, floors: 2, style: 'brick', roof: 'gable', interior: 'cafe', ivy: 0.4, sign: 'Café del Patio', seed: 41 })
B(46, 112, 0, { w: 20, d: 12, floors: 2, style: 'brick', roof: 'gable', interior: 'cafe', ivy: 0.4, sign: 'Librería', seed: 42 })
// Al norte: ciencias
B(0, -150, 0, { w: 70, d: 40, floors: 4, style: 'brut', roof: 'flat', interior: 'lab', ivy: 0, sign: 'Centro de Ciencias', door: 4.6, seed: 51 })
// Casas del río (en U, abiertas hacia el río)
const houses = [[-95, 'Casa Eliot', 61], [0, 'Casa Kirkland', 71], [95, 'Casa Winthrop', 81]]
houses.forEach(([x, name, s]) => {
  B(x, 170, 0, { w: 30, d: 14, floors: 4, style: 'brick', roof: 'gable', interior: 'dorm', tower: 'cupola', ivy: 0.7, sign: name, seed: s })
  B(x - 21, 190, 90, { w: 26, d: 12, floors: 3, style: 'brick', roof: 'gable', interior: 'dorm', ivy: 0.7, seed: s + 1 })
  B(x + 21, 190, -90, { w: 26, d: 12, floors: 3, style: 'brick', roof: 'gable', interior: 'dorm', ivy: 0.7, seed: s + 2 })
  add({ type: 'pave', x, z: 192, w: 26, d: 24, mat: 'gravel', rot: 0 })
})
// El puente y Allston
add({ type: 'bridge', x: 47, z: 336, rot: 0, len: 80, w: 8 })
B(47, 480, 180, { w: 44, d: 16, floors: 3, style: 'brick', roof: 'gable', interior: 'classroom', tower: 'cupola', ivy: 0.5, sign: 'Escuela de Negocios', seed: 91 })
B(18, 456, 90, { w: 32, d: 14, floors: 3, style: 'brick', roof: 'gable', interior: 'classroom', ivy: 0.5, seed: 92 })
B(76, 456, -90, { w: 32, d: 14, floors: 3, style: 'brick', roof: 'gable', interior: 'classroom', ivy: 0.5, seed: 93 })
B(-70, 450, 0, { w: 50, d: 24, floors: 4, style: 'modern', roof: 'flat', interior: 'lab', ivy: 0, sign: 'Ingeniería', door: 4.2, seed: 94 })
add({ type: 'stadium', x: 160, z: 540, rot: 180, w: 70, d: 120 })

// ── mobiliario / cercas ──────────────────────────────────────────────────────
add({ type: 'gate', x: 0, z: 96, rot: 0, w: 12, sign: 'Campus Oliver' })
add({ type: 'fence', x: -51, z: 95, rot: 0, len: 88 }); add({ type: 'fence', x: 51, z: 95, rot: 0, len: 88 })
add({ type: 'fence', x: -95, z: 5, rot: 90, len: 182 }); add({ type: 'fence', x: 95, z: 5, rot: 90, len: 182 })
add({ type: 'statue', x: 0, z: 6, rot: 0, s: 1 })
add({ type: 'fountain', x: 0, z: 62, r: 6 })
add({ type: 'tower', x: -100, z: 118, h: 26 })
add({ type: 'kiosk', x: 0, z: 22 })
for (const sx of [-1, 1]) { add({ type: 'flagpole', x: sx * 16, z: -33 }); add({ type: 'flagpole', x: sx * 9, z: 104 }) }

// ── caminos y pavimentos ─────────────────────────────────────────────────────
const P = (pts, w = 4, mat = 'gravel') => add({ type: 'path', pts, w, mat })
P([[0, 112], [0, 96], [0, 62], [0, 30]], 6, 'gravel')
P([[0, 30], [-14, 14], [-22, -10], [-14, -30], [-4, -38]], 5, 'gravel'); P([[0, 30], [14, 14], [22, -10], [14, -30], [4, -38]], 5, 'gravel')
P([[-90, 24], [-40, 24], [0, 24], [40, 24], [90, 24]], 4, 'gravel')
P([[-70, -10], [-40, -20], [-22, -10]], 3.5, 'gravel'); P([[70, -10], [40, -20], [22, -10]], 3.5, 'gravel')
P([[0, 112], [0, 124], [30, 140], [47, 160], [47, 296]], 6, 'gravel')
P([[0, 124], [-30, 140], [-47, 160], [-47, 250]], 5, 'gravel')
P([[47, 376], [47, 436]], 6, 'gravel')
P([[36, -40], [36, -95], [20, -122]], 4, 'gravel'); P([[-36, -40], [-36, -95], [-20, -122]], 4, 'gravel')
add({ type: 'pave', x: 0, z: -37, w: 76, d: 14, mat: 'stone', rot: 0 })
add({ type: 'pave', x: 0, z: -118, w: 64, d: 16, mat: 'stone', rot: 0 })
add({ type: 'pave', x: 0, z: 62, r: 13, mat: 'brick' })
add({ type: 'pave', x: 0, z: 118, r: 18, mat: 'brick' })
add({ type: 'pave', x: 0, z: 6, r: 8, mat: 'stone' })
add({ type: 'pave', x: 47, z: 430, w: 26, d: 14, mat: 'stone', rot: 0 })

// ── NPC ──────────────────────────────────────────────────────────────────────
;[[0, 0, 78], [-18, 0, 48], [18, 0, 48], [0, 0, -40], [0, 1.7, -56], [-40, 0.35, 30], [-60, 0.35, -50], [62, 0.35, -52], [-46, 0.35, 112], [47, 0.4, 330], [0, 0.35, -134]]
  .forEach(([x, y, z]) => add({ type: 'npc', x, y, z }))

// ── vegetación ───────────────────────────────────────────────────────────────
const rects = items.filter((i) => i.type === 'building').map((b) => {
  const sw = Math.abs(b.rot) === 90, hw = (sw ? b.d : b.w) / 2 + (b.portico ? 12 : 6), hd = (sw ? b.w : b.d) / 2 + (b.portico ? 12 : 6)
  return [b.x - hw, b.x + hw, b.z - hd, b.z + hd]
})
const pathSegs = items.filter((i) => i.type === 'path').flatMap((p) => p.pts.slice(0, -1).map((a, k) => [a, p.pts[k + 1], p.w / 2 + 3]))
const segD = (x, z, [ax, az], [bx, bz]) => { const dx = bx - ax, dz = bz - az, t = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / (dx * dx + dz * dz))); return Math.hypot(x - ax - dx * t, z - az - dz * t) }
const free = (x, z) => !rects.some(([a, b, c, d]) => x > a && x < b && z > c && z < d)
  && !pathSegs.some(([p, q, w]) => segD(x, z, p, q) < w)
  && !items.some((i) => i.type === 'pave' && (i.r ? Math.hypot(x - i.x, z - i.z) < i.r + 2 : Math.abs(x - i.x) < i.w / 2 + 2 && Math.abs(z - i.z) < i.d / 2 + 2))
  && !items.some((i) => ['fountain', 'statue', 'kiosk', 'tower', 'gate'].includes(i.type) && Math.hypot(x - i.x, z - i.z) < 9)
  && !items.some((i) => i.type === 'bridge' && Math.abs(x - i.x) < 10 && z > i.z - i.len / 2 - 14 && z < i.z + i.len / 2 + 14)
  && !items.some((i) => i.type === 'stadium' && Math.abs(x - i.x) < i.w / 2 + 40 && Math.abs(z - i.z) < i.d / 2 + 40)
const tree = (x, z, kind) => add({ type: 'tree', x: +x.toFixed(1), z: +z.toFixed(1), rot: Math.round(R() * 360), kind, s: +(0.85 + R() * 0.5).toFixed(2) })
const lawn = (x0, x1, z0, z1, step, kinds, p = 0.8) => { for (let x = x0; x <= x1; x += step) for (let z = z0; z <= z1; z += step) { const px = x + (R() - 0.5) * step * 0.7, pz = z + (R() - 0.5) * step * 0.7; if (R() < p && free(px, pz)) tree(px, pz, kinds[Math.floor(R() * kinds.length)]) } }
// alameda sobre la avenida principal
for (let z = 90; z >= -30; z -= 12) for (const sx of [-1, 1]) if (free(sx * 9, z)) tree(sx * 9, z, z % 24 === 0 ? 'maple' : 'elm')
lawn(-92, 92, -82, 92, 11, ['elm', 'elm', 'oak', 'maple', 'gold'], 0.7)
lawn(-130, 130, 125, 290, 14, ['elm', 'oak', 'maple', 'gold', 'birch'], 0.55)
lawn(-230, 230, 285, 300, 9, ['maple', 'gold', 'maple', 'birch'], 0.7) // orilla norte del río
lawn(-60, 140, 385, 430, 12, ['elm', 'maple', 'oak'], 0.5)
lawn(-120, 230, 384, 620, 22, ['oak', 'pine', 'elm'], 0.4)
lawn(-230, -105, -250, 300, 17, ['pine', 'oak', 'pine', 'elm'], 0.6)
lawn(105, 230, -250, 380, 17, ['pine', 'oak', 'pine', 'elm'], 0.6)
lawn(-105, 105, -250, -180, 14, ['pine', 'oak', 'elm', 'maple'], 0.65)
// farolas y bancas
for (let z = 90; z >= -26; z -= 14) for (const sx of [-1, 1]) add({ type: 'lamp', x: sx * 4.5, z })
for (let z = 138; z <= 290; z += 20) for (const sx of [-1, 1]) add({ type: 'lamp', x: 47 + sx * 4.5, z })
for (let z = 100; z >= -20; z -= 28) add({ type: 'bench', x: 6.5, z, rot: -90 })
for (let z = 90; z >= -20; z -= 28) add({ type: 'bench', x: -6.5, z: z - 14, rot: 90 })
for (const a of [0, 90, 180, 270]) add({ type: 'bench', x: Math.round(Math.sin((a * Math.PI) / 180) * 9), z: 62 + Math.round(Math.cos((a * Math.PI) / 180) * 9), rot: a })
for (const sx of [-1, 1]) { add({ type: 'hedge', x: sx * 26, z: 74, rot: 0, len: 18 }); add({ type: 'hedge', x: sx * 26, z: 50, rot: 0, len: 18 }) }

const data = { version: 1, spawn: [0, 132], items }
writeFileSync(new URL('../../src/data/campusLayout.json', import.meta.url), JSON.stringify(data).replace(/\},\{/g, '},\n{'))
console.log('items:', items.length, 'trees:', items.filter((i) => i.type === 'tree').length)
