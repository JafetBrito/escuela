// Genera el layout INICIAL de "La Caverna de Platón" (src/data/cavernaLayout.json): el mapa de la misión de Sócrates.
// Campo al sur (ágora, el mundo real con el Sol y las cinco formas platónicas) y la caverna al norte: la boca está en
// (0, 0); túnel hasta z=-60 y cámara hasta z=-135, con la hoguera, el muro de titiriteros, los prisioneros encadenados
// y la pared de sombras. Después se afina a mano en /vr/editor?map=caverna.
// Uso: node scripts/campus/genCaverna.mjs   (OJO: sobrescribe lo que hayas editado)
import { writeFileSync } from 'node:fs'

let seed = 9001
const R = () => { seed = (seed + 0x6d2b79f5) >>> 0; let t = seed; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296 }
const items = []
let n = 0
const add = (o) => { const it = { id: `${o.type[0]}${++n}`, ...o }; items.push(it); return it }
const rnd = (a, b) => a + R() * (b - a)

// ── Lugares (el terreno se aplana bajo cada zona; la primera es solo base de la montaña) ──
const ZONES = [
  { name: '(base de la montaña)', x: 0, z: -70, r: 95, xp: 0, silent: true },
  { name: 'Boca de la Caverna', x: 0, z: 22, r: 28, xp: 10, step: 'entrada' },
  { name: 'Ágora de Atenas', x: 0, z: 100, r: 40, xp: 10, step: 'agora' },
  { name: 'La Caverna', x: 0, z: -95, r: 70, xp: 20, step: 'caverna', dark: 0.9 },
  { name: 'El Fuego y las Sombras', x: 0, z: -84, r: 20, xp: 15, step: 'fuego', flat: false },
  { name: 'Los Prisioneros', x: 0, z: -118, r: 20, xp: 20, step: 'prisioneros', flat: false },
  { name: 'El Mundo Real', x: 0, z: 150, r: 48, xp: 25, step: 'luz' },
]
for (const z of ZONES) add({ type: 'zone', ...z })
const FLAT = ZONES.filter((z) => z.flat !== false)

// ── Camino del campo hasta la boca ───────────────────────────────────────────
const PATHS = [[[0, 186], [0, 150], [0, 100], [0, 22], [0, 2]]]
for (const pts of PATHS) add({ type: 'path', pts, w: 9, mat: 'sand' })
const segDist = (px, pz, [ax, az], [bx, bz]) => { const dx = bx - ax, dz = bz - az, t = Math.max(0, Math.min(1, ((px - ax) * dx + (pz - az) * dz) / (dx * dx + dz * dz || 1))); return Math.hypot(px - (ax + t * dx), pz - (az + t * dz)) }
const pathDist = (x, z) => Math.min(...PATHS.flatMap((p) => p.slice(1).map((b, i) => segDist(x, z, p[i], b))))

// ── La montaña y la caverna ──────────────────────────────────────────────────
add({ type: 'cavern', x: 0, z: 0, rot: 0 })
add({ type: 'pave', x: 0, z: 22, r: 22, mat: 'slate', dy: 0.02 })
for (const z of [-10, -26, -42, -56]) for (const sx of [-1, 1]) add({ type: 'torch', x: sx * 7.4, z })
// la hoguera, el muro de los titiriteros, los prisioneros y la pared de sombras (de la boca hacia el fondo)
add({ type: 'bonfire', x: 0, z: -78, rot: 0 })
add({ type: 'parapet', x: 0, z: -94, rot: 0, len: 44, seed: 2 })
for (const z of [-108, -116, -124]) for (let i = 0; i < 7; i++) add({ type: 'prisoner', x: -18 + i * 6, z, rot: 180, tone: Math.floor(R() * 3) })
add({ type: 'shadowwall', x: 0, z: -134.9, rot: 0, w: 40, h: 10, seed: 3 })
// estalactitas (cuelgan del techo) y estalagmitas (del suelo)
for (let i = 0; i < 46; i++) add({ type: 'stalactite', x: +rnd(-24, 24).toFixed(1), y: 17, z: +rnd(-133, -62).toFixed(1), rot: Math.round(rnd(0, 360)), s: +rnd(0.6, 2.2).toFixed(2) })
for (let i = 0; i < 14; i++) add({ type: 'stalactite', x: +rnd(-8, 8).toFixed(1), y: 9, z: +rnd(-58, -2).toFixed(1), rot: Math.round(rnd(0, 360)), s: +rnd(0.4, 1.1).toFixed(2) })
for (let i = 0; i < 26; i++) { const x = (R() < 0.5 ? -1 : 1) * rnd(16, 24.5); add({ type: 'stalagmite', x: +x.toFixed(1), z: +rnd(-132, -64).toFixed(1), rot: Math.round(rnd(0, 360)), s: +rnd(0.5, 1.6).toFixed(2) }) }
for (let i = 0; i < 8; i++) add({ type: 'stalagmite', x: (i % 2 ? 1 : -1) * +rnd(6.2, 8.4).toFixed(1), z: +rnd(-56, -6).toFixed(1), rot: Math.round(rnd(0, 360)), s: +rnd(0.4, 0.9).toFixed(2) })

// ── Ágora de Atenas: donde empieza y termina la historia ─────────────────────
add({ type: 'pave', x: 0, z: 100, r: 31, mat: 'slate', dy: 0.02 }); add({ type: 'pave', x: 0, z: 100, r: 24, mat: 'sand', dy: 0.04 })
add({ type: 'fountain', x: 0, z: 100, r: 5 })
for (const [x, z, rot, r, seed2] of [[-34, 86, 120, 14, 2], [34, 86, 240, 14, 5], [0, 70, 180, 18, 7]]) add({ type: 'ruin', x, z, rot, n: 6, r, seed: seed2 })
for (const [x, z, rot] of [[-14, 112, 20], [14, 112, -20], [-22, 98, 70], [22, 98, -70]]) add({ type: 'statue', x, z, rot, s: 1.1 })
for (const [x, z, rot] of [[-8, 90, 0], [8, 90, 0], [-8, 111, 180], [8, 111, 180]]) add({ type: 'bench', x, z, rot })

// ── El mundo real: las cinco formas perfectas ante el Sol ─────────────────────
add({ type: 'pave', x: 0, z: 150, r: 38, mat: 'sand', dy: 0.02 })
add({ type: 'sunstone', x: 0, z: 172, rot: 180 })
;[['cube', -36, 154], ['tetra', -18, 144], ['octa', 0, 140], ['dodeca', 18, 144], ['icosa', 36, 154]].forEach(([kind, x, z]) => add({ type: 'form', x, z, rot: 180, kind }))
add({ type: 'pave', x: 48, z: 120, r: 11, mat: 'water', dy: 0.03 }); add({ type: 'pave', x: -52, z: 128, r: 8, mat: 'water', dy: 0.03 })
add({ type: 'arch', x: 0, z: 190, rot: 0, w: 10, h: 14, sign: 'Camino a la Plaza', color: '#ffb347' })
add({ type: 'portal', x: 0, z: 190, rot: 0, to: '/vr/plaza', label: 'Plaza de las Academias', color: '#ffb347', w: 5, h: 9 })

// ── Naturaleza: bosque verde por todo el campo (nada sobre la montaña ni sobre los lugares) ──
const inMassif = (x, z) => Math.abs(x) < 66 && z > -168 && z < 14
const nearZone = (x, z) => FLAT.some((q) => q.step && q.name !== 'La Caverna' && Math.hypot(x - q.x, z - q.z) < q.r * 0.8)
const KINDS = ['oak', 'oak', 'elm', 'elm', 'pine', 'birch', 'gold']
let trees = 0
for (let tries = 0; tries < 8000 && trees < 420; tries++) {
  const x = rnd(-138, 138), z = rnd(-245, 188)
  if (inMassif(x, z) || pathDist(x, z) < 11 || nearZone(x, z) || (Math.abs(x) < 50 && z > 14 && R() > 0.18)) continue
  add({ type: 'tree', x: +x.toFixed(1), z: +z.toFixed(1), kind: KINDS[Math.floor(R() * KINDS.length)], s: +rnd(0.8, 1.6).toFixed(2) }); trees++
}
let rocks = 0
for (let tries = 0; tries < 3000 && rocks < 60; tries++) {
  const x = rnd(-138, 138), z = rnd(-245, 188)
  if (inMassif(x, z) || pathDist(x, z) < 8) continue
  add({ type: 'rock', x: +x.toFixed(1), z: +z.toFixed(1), rot: Math.round(rnd(0, 360)), seed: 1 + Math.floor(R() * 4), s: +rnd(0.6, 1.5).toFixed(2) }); rocks++
}

const out = { version: 1, map: 'caverna', terrain: 'sanctuary', rise: 0, autumn: 0.05, preset: 'dia', sunAz: 165, ambient: 0.25, lamp: 4.2, spawn: [0, 112], items }
writeFileSync(new URL('../../src/data/cavernaLayout.json', import.meta.url), JSON.stringify(out).replace(/\{"id"/g, '\n{"id"'))
console.log(`cavernaLayout.json: ${items.length} piezas (${trees} árboles, ${rocks} rocas)`)
