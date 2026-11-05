// Genera el layout INICIAL del Santuario de los Caminos (src/data/santuarioLayout.json): el mapa del tutorial.
// Siete lugares, uno por paso del recorrido (el tutorial real los usa como estaciones): Atrio → Círculo de los Caminos
// (elegir clase) → Nido del Compañero (mascota) → Campo de Pruebas (habilidades) → Observatorio (despertar la IA) →
// Mirador (primera charla) → Puerta al Campus. Después se afina a mano en /vr/editor?map=santuario.
// Uso: node scripts/campus/genSantuario.mjs   (OJO: sobrescribe lo que hayas editado)
import { writeFileSync } from 'node:fs'

let seed = 4242
const R = () => { seed = (seed + 0x6d2b79f5) >>> 0; let t = seed; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296 }
const items = []
let n = 0
const add = (o) => { const it = { id: `${o.type[0]}${++n}`, ...o }; items.push(it); return it }
const deg = (a) => (a * Math.PI) / 180
const ring = (cx, cz, r, count, fn, a0 = 0) => { for (let i = 0; i < count; i++) { const a = deg(a0 + (360 / count) * i); fn(cx + Math.sin(a) * r, cz - Math.cos(a) * r, a0 + (360 / count) * i) } }

// ── Lugares (zonas descubribles; el terreno se aplana bajo cada una) ──────────
const ZONES = [
  { key: 'atrio', name: 'Atrio de Bienvenida', x: 0, z: 140, r: 30, xp: 10, step: 'bienvenida' },
  { key: 'circulo', name: 'Círculo de los Caminos', x: 0, z: 40, r: 52, xp: 25, step: 'clase' },
  { key: 'nido', name: 'Nido del Compañero', x: -95, z: -35, r: 32, xp: 15, step: 'mascota' },
  { key: 'campo', name: 'Campo de Pruebas', x: 95, z: -75, r: 34, xp: 15, step: 'habilidades' },
  { key: 'obs', name: 'Observatorio de las Ideas', x: -30, z: -150, r: 30, xp: 20, step: 'ia', lift: 10 },
  { key: 'mirador', name: 'Mirador del Amanecer', x: 60, z: -195, r: 26, xp: 15, step: 'conversacion' },
  { key: 'puerta', name: 'Puerta al Campus', x: 0, z: -222, r: 22, xp: 30, step: 'campus' },
]
const Z = Object.fromEntries(ZONES.map((z) => [z.key, z]))
for (const z of ZONES) { const { key, ...rest } = z; add({ type: 'zone', ...rest }) }

// ── Caminos de grava que unen los lugares ────────────────────────────────────
const PATHS = [
  [[0, 178], [0, 140], [0, 95], [0, 52]],
  [[-40, 30], [-62, 8], [-82, -12], [-95, -35]],
  [[-95, -35], [-60, -62], [-15, -72], [40, -70], [95, -75]],
  [[95, -75], [80, -110], [35, -135], [-30, -150]],
  [[-30, -150], [10, -172], [60, -195]],
  [[60, -195], [30, -215], [0, -222]],
]
for (const pts of PATHS) add({ type: 'path', pts, w: 7, mat: 'sand' })
const segDist = (px, pz, [ax, az], [bx, bz]) => { const dx = bx - ax, dz = bz - az, t = Math.max(0, Math.min(1, ((px - ax) * dx + (pz - az) * dz) / (dx * dx + dz * dz || 1))); return Math.hypot(px - (ax + t * dx), pz - (az + t * dz)) }
const pathDist = (x, z) => Math.min(...PATHS.flatMap((p) => p.slice(1).map((b, i) => segDist(x, z, p[i], b))))
const zoneDist = (x, z) => Math.min(...ZONES.map((q) => Math.hypot(x - q.x, z - q.z) - q.r))

// ── 1 · Atrio de Bienvenida ──────────────────────────────────────────────────
add({ type: 'arch', x: 0, z: 168, rot: 0, w: 14, h: 18, sign: 'Santuario de los Caminos', color: '#e9b949' })
add({ type: 'pave', x: 0, z: 140, r: 22, mat: 'slate', dy: 0.02 }); add({ type: 'pave', x: 0, z: 140, r: 9, mat: 'brick', dy: 0.04 })
add({ type: 'campfire', x: 13, z: 140, rot: 0 })
add({ type: 'npc', x: -9, z: 135, who: 'jafet' })
for (const sx of [-1, 1]) { add({ type: 'banner', x: sx * 10, z: 160, rot: 0, color: '#e9b949' }); add({ type: 'banner', x: sx * 17, z: 128, rot: 0, color: '#e08a3a' }) }
for (let z = 158; z >= 100; z -= 13) for (const sx of [-1, 1]) add({ type: 'torch', x: sx * 5.8, z })
add({ type: 'statue', x: -16, z: 146, rot: 30, s: 1.2 })

// ── 2 · Círculo de los Caminos: faro central + 5 altares de clase ───────────
const C = Z.circulo
add({ type: 'pave', x: C.x, z: C.z, r: 47, mat: 'slate', dy: 0.02 }); add({ type: 'pave', x: C.x, z: C.z, r: 41, mat: 'sand', dy: 0.04 })
add({ type: 'pave', x: C.x, z: C.z, r: 17, mat: 'brick', dy: 0.06 }); add({ type: 'pave', x: C.x, z: C.z, r: 12.5, mat: 'slate', dy: 0.08 })
add({ type: 'beacon', x: C.x, z: C.z, rot: 0, color: '#7fe7ff' })
const ALTARS = [['ai_engineer', 0], ['designer', 72], ['philosopher', 144], ['cyber_strategist', -144], ['programmer', -72]] // el hueco queda al sur (entrada)
for (const [kind, a] of ALTARS) add({ type: 'altar', x: C.x + Math.sin(deg(a)) * 30, z: C.z - Math.cos(deg(a)) * 30, rot: -a, kind })
for (const a of [36, 108, -36, -108, 168, -168]) add({ type: 'banner', x: C.x + Math.sin(deg(a)) * 37, z: C.z - Math.cos(deg(a)) * 37, rot: -a, color: '#e9b949' })
ring(C.x, C.z, 45, 18, (x, z) => { if (z < C.z + 40) add({ type: 'torch', x, z }) }, 10)
for (const [x, z, rot, r] of [[-52, -4, 140, 16], [52, -4, 220, 16], [0, -16, 180, 20]]) add({ type: 'ruin', x, z, rot, n: 7, r, seed: 3 + Math.round(x) % 7 })

// ── 3 · Nido del Compañero: arboleda con un nido por mascota ─────────────────
const N = Z.nido
add({ type: 'pave', x: N.x, z: N.z, r: 28, mat: 'grass', dy: 0.02 }); add({ type: 'pave', x: N.x + 20, z: N.z + 10, r: 8, mat: 'water', dy: 0.04 })
add({ type: 'tree', x: N.x, z: N.z, kind: 'gold', s: 2 })
const NEST_COLORS = ['#ff9f43', '#5fb4ff', '#ff8ac2', '#7be07b', '#b58cff']
ring(N.x, N.z, 15, 5, (x, z, a) => add({ type: 'nest', x, z, rot: -a, color: NEST_COLORS[Math.round(a / 72) % 5] }), 20)
ring(N.x, N.z, 24, 8, (x, z) => add({ type: 'torch', x, z }), 22)
for (let i = 0; i < 3; i++) add({ type: 'banner', x: N.x + 26 - i * 3, z: N.z + 18 + i * 3, rot: 40, color: '#7be07b' })

// ── 4 · Campo de Pruebas: muñecos y tableros ─────────────────────────────────
const P = Z.campo
add({ type: 'pave', x: P.x, z: P.z, r: 30, mat: 'sand', dy: 0.02 }); add({ type: 'pave', x: P.x, z: P.z, r: 24, mat: 'brick', dy: 0.04 })
for (let i = 0; i < 5; i++) add({ type: 'dummy', x: P.x - 20 + i * 10, z: P.z + 6, rot: 180, kind: 'dummy' })
for (let i = 0; i < 4; i++) add({ type: 'dummy', x: P.x - 15 + i * 10, z: P.z - 22, rot: 0, kind: 'target' })
ring(P.x, P.z, 31, 10, (x, z) => add({ type: 'torch', x, z }), 8)
for (let i = 0; i < 4; i++) add({ type: 'banner', x: P.x - 26 + (i % 2) * 52, z: P.z - 10 + Math.floor(i / 2) * 26, rot: i % 2 ? -90 : 90, color: '#e0503a' })

// ── 5 · Observatorio de las Ideas: en lo alto de una colina ──────────────────
const O = Z.obs
add({ type: 'pave', x: O.x, z: O.z, r: 24, mat: 'slate', dy: 0.02 }); add({ type: 'observatory', x: O.x, z: O.z - 8, rot: 0 })
for (let i = 0; i < 3; i++) add({ type: 'bench', x: O.x - 12 + i * 12, z: O.z + 12, rot: 0 })
ring(O.x, O.z, 25, 9, (x, z) => add({ type: 'torch', x, z }), 20)
for (const sx of [-1, 1]) add({ type: 'banner', x: O.x + sx * 6, z: O.z + 2, rot: 0, color: '#8fb6ff' })

// ── 6 · Mirador del Amanecer ─────────────────────────────────────────────────
const M = Z.mirador
add({ type: 'pave', x: M.x, z: M.z, r: 20, mat: 'slate', dy: 0.02 }); add({ type: 'campfire', x: M.x, z: M.z, rot: 0 })
add({ type: 'npc', x: M.x - 10, z: M.z + 6, who: 'oliver' })
add({ type: 'kiosk', x: M.x + 14, z: M.z - 10, rot: 200 }); add({ type: 'ruin', x: M.x, z: M.z - 22, rot: 180, n: 6, r: 16, seed: 9 })
ring(M.x, M.z, 19, 8, (x, z) => add({ type: 'torch', x, z }), 12)

// ── 7 · Puerta al Campus ─────────────────────────────────────────────────────
const G = Z.puerta
add({ type: 'pave', x: G.x, z: G.z + 4, r: 20, mat: 'slate', dy: 0.02 }); add({ type: 'pave', x: G.x, z: G.z + 4, r: 8, mat: 'brick', dy: 0.04 })
add({ type: 'arch', x: G.x, z: G.z, rot: 0, w: 14, h: 18, sign: 'Puerta al Campus', color: '#ffb347' })
add({ type: 'portal', x: G.x, z: G.z, rot: 0, to: '/vr/plaza', label: 'Plaza de las Academias', color: '#ffb347', w: 7, h: 11 })
for (const sx of [-1, 1]) { add({ type: 'banner', x: sx * 14, z: G.z + 8, rot: 0, color: '#ffb347' }); add({ type: 'torch', x: sx * 11, z: G.z + 14 }) }
for (const sx of [-1, 1]) for (let k = 0; k < 3; k++) add({ type: 'torch', x: sx * 5.8, z: G.z + 40 - k * 12 })

// ── Naturaleza: árboles y rocas por todo el santuario, lejos de caminos y lugares ──
const KINDS = ['gold', 'gold', 'gold', 'maple', 'maple', 'oak', 'pine', 'birch']
let trees = 0
for (let tries = 0; tries < 6000 && trees < 480; tries++) {
  const x = (R() * 2 - 1) * 138, z = -245 + R() * 430, side = Math.abs(x)
  if (pathDist(x, z) < 10 || zoneDist(x, z) < 4 || (side < 40 && R() > 0.25)) continue
  add({ type: 'tree', x: +x.toFixed(1), z: +z.toFixed(1), kind: KINDS[Math.floor(R() * KINDS.length)], s: +(0.8 + R() * 0.8).toFixed(2) }); trees++
}
let rocks = 0
for (let tries = 0; tries < 3000 && rocks < 70; tries++) {
  const x = (R() * 2 - 1) * 138, z = -245 + R() * 430
  if (pathDist(x, z) < 8 || zoneDist(x, z) < 0) continue
  add({ type: 'rock', x: +x.toFixed(1), z: +z.toFixed(1), rot: Math.round(R() * 360), seed: 1 + Math.floor(R() * 4), s: +(0.6 + R() * 1.1).toFixed(2) }); rocks++
}

const out = { version: 1, map: 'santuario', terrain: 'sanctuary', preset: 'amanecer', ambient: 0.22, lamp: 3.2, spawn: [0, 186], items }
writeFileSync(new URL('../../src/data/santuarioLayout.json', import.meta.url), JSON.stringify(out).replace(/\{"id"/g, '\n{"id"'))
console.log(`santuarioLayout.json: ${items.length} piezas (${trees} árboles, ${rocks} rocas)`)
