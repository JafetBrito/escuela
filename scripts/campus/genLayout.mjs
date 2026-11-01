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
for (const sx of [-1, 1]) { // vallas laterales partidas por una puerta que lleva a los distritos de las academias
  add({ type: 'fence', x: sx * 95, z: -34, rot: 90, len: 104 }); add({ type: 'fence', x: sx * 95, z: 63, rot: 90, len: 66 })
  add({ type: 'gate', x: sx * 95, z: 24, rot: 90, w: 12, sign: sx < 0 ? 'Puerta Oeste · Academias' : 'Puerta Este · Academias' })
}
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


// ── DISTRITOS DE LAS ACADEMIAS (oeste y este del Yard) ──────────────────────
// [nombre, x, z, rot, w, d, pisos, estilo, techo, interior, torre, pórtico, semilla]
const ACADEMIAS = [
  ['Academia de Programación', -170, -10, 90, 40, 22, 3, 'modern', 'flat', 'prog', 'none', false, 101],
  ['Academia de Ciberseguridad', -170, 56, 90, 36, 20, 3, 'brut', 'flat', 'cyber', 'none', false, 102],
  ['Academia de Filosofía', -170, -76, 90, 40, 24, 2, 'neo', 'gable', 'philo', 'none', true, 103],
  ['Academia de IA', 170, -10, -90, 44, 24, 4, 'modern', 'flat', 'ai', 'cupola', false, 104],
  ['Academia de Idiomas', 170, 56, -90, 44, 24, 2, 'neo', 'gable', 'lang', 'none', true, 105],
  ['Academia de Linux', 170, -76, -90, 34, 20, 2, 'brick', 'gable', 'linux', 'cupola', false, 106],
]
for (const [sign, x, z, rot, w, d, floors, style, roof, interior, tower, portico, seed] of ACADEMIAS) {
  B(x, z, rot, { w, d, floors, style, roof, interior, tower, portico, ivy: style === 'brick' ? 0.7 : 0, sign, door: 4, seed })
  const px = x < 0 ? -134 : 134
  add({ type: 'pave', x: px, z, r: 13, mat: 'stone' }); add({ type: 'statue', x: px, z, s: 0.8 })
  add({ type: 'lamp', x: px - 8, z: z + 8 }); add({ type: 'lamp', x: px + 8, z: z - 8 })
}
for (const sx of [-1, 1]) { P([[sx * 95, 24], [sx * 134, 24]], 5, 'gravel'); P([[sx * 134, -76], [sx * 134, 56]], 4, 'gravel') }
P([[-134, 56], [-134, 110], [-100, 128]], 4, 'gravel'); P([[134, 56], [134, 110], [100, 128]], 4, 'gravel')

// ── PUEBLO UNIVERSITARIO (calle comercial al sur de la plaza de entrada) ────
add({ type: 'pave', x: 0, z: 148, w: 270, d: 10, mat: 'asphalt', rot: 0 }); add({ type: 'pave', x: 0, z: 141.5, w: 270, d: 3, mat: 'stone', rot: 0 })
const TIENDAS = ['Panadería', 'Librería Universitaria', 'Papelería', 'Café Central', 'Tienda de música', 'Heladería', 'Café Internet', 'Farmacia', 'Floristería', 'Taller de bicis']
;[-104, -88, -72, -56, -40, 40, 56, 72, 88, 104].forEach((x, i) => B(x, 134, 0, { w: 14, d: 12, floors: 2, style: 'brick', roof: 'gable', interior: 'cafe', ivy: 0.35, sign: TIENDAS[i], door: 3, seed: 120 + i }))
for (let x = -120; x <= 120; x += 30) if (Math.abs(x) > 20) { add({ type: 'lamp', x, z: 144 }); add({ type: 'bench', x: x + 8, z: 143, rot: 0 }) }
add({ type: 'kiosk', x: -60, z: 156 }); add({ type: 'kiosk', x: 60, z: 156 })

// ── COMPLEJO DEPORTIVO (este, junto a las casas del río) ────────────────────
B(175, 125, -90, { w: 50, d: 28, floors: 2, style: 'modern', roof: 'flat', interior: 'hall', ivy: 0, sign: 'Gimnasio Universitario', door: 4, seed: 140 })
add({ type: 'pave', x: 170, z: 205, w: 90, d: 130, mat: 'track', rot: 0 }); add({ type: 'pave', x: 170, z: 205, w: 72, d: 112, mat: 'grass', rot: 0, dy: 0.02 })
add({ type: 'pave', x: 170, z: 205, w: 3, d: 112, mat: 'stone', rot: 0, dy: 0.03 }); add({ type: 'pave', x: 170, z: 205, r: 9, mat: 'stone', dy: 0.03 })
add({ type: 'pave', x: 218, z: 135, w: 20, d: 32, mat: 'court', rot: 0 }); add({ type: 'pave', x: 218, z: 175, w: 20, d: 32, mat: 'court', rot: 0 })
add({ type: 'pave', x: 205, z: 285, w: 50, d: 30, mat: 'plank', rot: 0 }); add({ type: 'pave', x: 205, z: 285, w: 40, d: 20, mat: 'water', rot: 0, dy: 0.02 })
P([[122, 128], [150, 128], [170, 150]], 5, 'gravel')

// ── LAGO Y PARQUE (suroeste) ────────────────────────────────────────────────
add({ type: 'pave', x: -175, z: 205, r: 42, mat: 'gravel' }); add({ type: 'pave', x: -175, z: 205, r: 36, mat: 'water', dy: 0.02 })
add({ type: 'pave', x: -140, z: 205, w: 18, d: 4, mat: 'plank', rot: 0, dy: 0.04 })
for (const [bx, bz, br] of [[-175, 160, 0], [-135, 230, 90], [-215, 190, -90], [-175, 250, 180]]) add({ type: 'bench', x: bx, z: bz, rot: br })
P([[-100, 140], [-130, 170], [-135, 205]], 4, 'gravel')

// ── NORTE: museo, auditorio y torre del reloj ───────────────────────────────
B(-110, -150, 0, { w: 40, d: 26, floors: 2, style: 'neo', roof: 'gable', interior: 'hall', portico: true, ivy: 0, sign: 'Museo de Ciencias', door: 4, seed: 150 })
B(110, -150, 0, { w: 36, d: 26, floors: 2, style: 'neo', roof: 'gable', interior: 'classroom', tower: 'cupola', ivy: 0, sign: 'Auditorio', door: 4, seed: 151 })
add({ type: 'tower', x: 60, z: -200, h: 28 })
P([[-20, -118], [-70, -125], [-110, -128]], 4, 'gravel'); P([[20, -118], [70, -125], [110, -128]], 4, 'gravel')

// ── ZONAS DESCUBRIBLES (cada edificio con letrero + áreas): dan XP la primera vez ──
for (const b of items.filter((i) => i.type === 'building' && i.sign)) add({ type: 'zone', x: b.x, z: b.z, name: b.sign, r: Math.max(b.w, b.d) / 2 + 9, xp: 25 })
for (const [name, x, z, r, xp] of [['El Yard', 0, 20, 55, 40], ['Pueblo Universitario', 0, 148, 70, 40], ['Complejo Deportivo', 170, 205, 70, 40], ['Lago del Parque', -175, 205, 48, 40], ['Distrito de las Academias · Oeste', -150, -10, 75, 50], ['Distrito de las Academias · Este', 150, -10, 75, 50], ['Río Charles', 47, 336, 36, 40], ['Allston', 47, 450, 70, 50], ['Estadio', 160, 540, 55, 40]]) add({ type: 'zone', x, z, name, r, xp })

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

add({ type: 'portal', x: -14, z: 122, rot: 0, to: '/vr/plaza', label: 'Plaza de las Academias', color: '#ffb347' })
const data = { version: 1, spawn: [0, 132], items }
writeFileSync(new URL('../../src/data/campusLayout.json', import.meta.url), JSON.stringify(data).replace(/\},\{/g, '},\n{'))
console.log('items:', items.length, 'trees:', items.filter((i) => i.type === 'tree').length)
