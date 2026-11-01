import * as THREE from 'three'
import { Mesher, prismGeo } from './mesher'
import { rng } from '../lookdev/plazaWorld'
import { HOSPITAL_CATALOG, hospitalPiece } from './hospitalKit'

// ─────────────────────────────────────────────────────────────────────────────
// Kit de piezas del Campus. Cada pieza es una función pura (parámetros → mallas) en METROS, con el
// origen en el centro de su huella sobre el suelo y el FRENTE hacia +Z. Una pieza devuelve:
//   solid    geometría opaca con color por vértice          floors   pisos (se ven Y son isFloor)
//   ramps    pisos invisibles (rampas bajo las escaleras)    glass    vidrios (translúcidos, brillan de noche)
//   roof     techo (se puede ocultar en el editor)           emissive lámparas/ventanas siempre encendidas
//   collide  paredes/columnas que bloquean (invisibles)      lights   [[x,y,z],...] luces interiores
//   signs    letreros [{text,x,y,z,w,h,ry}]                  bounds   {w,d,h} para el selector del editor
// ─────────────────────────────────────────────────────────────────────────────

export const STYLES = {
  brick: { wall: '#a4503b', inner: '#eadfc8', trim: '#f1ead8', roof: '#4b505d', floor: '#8b6b49', plinth: '#b8ad99', dark: '#5a3427', glass: '#9fd0e4' },
  neo: { wall: '#e8dec8', inner: '#f3ecdc', trim: '#fbf7ec', roof: '#6d7a86', floor: '#cdc3ab', plinth: '#d3c8ae', dark: '#8d8268', glass: '#9fd0e4' },
  brut: { wall: '#a09f9a', inner: '#c9c8c1', trim: '#7b7a75', roof: '#77766f', floor: '#76746f', plinth: '#6b6a66', dark: '#4f4e4a', glass: '#76adc0' },
  modern: { wall: '#cbd6db', inner: '#eef3f4', trim: '#5f6d75', roof: '#8e9aa0', floor: '#aab5b9', plinth: '#7d8a90', dark: '#46545c', glass: '#6bb6d4' },
}
const WOOD = '#6d4b30', WOOD_L = '#a77c52', IRON = '#2c2f36', GOLD = '#e0b84c'
const BOOKS = ['#8c2f39', '#2f5d8a', '#c79a3b', '#3d7a52', '#6a4a8c', '#b5653a', '#d9d2c0', '#264653']

// Marco local → mundo para armar muebles rotados (el Mesher gira cada caja sobre su propio centro).
function frame(M, X, Y, Z, ry = 0) {
  const c = Math.cos(ry), s = Math.sin(ry), at = (lx, lz) => [X + lx * c + lz * s, Z - lx * s + lz * c]
  return {
    box: (lx, ly, lz, w, h, d, hex) => { const [x, z] = at(lx, lz); return M.box(x, Y + ly, z, w, h, d, hex, ry) },
    cyl: (lx, ly, lz, r, h, seg, hex, rt) => { const [x, z] = at(lx, lz); return M.cyl(x, Y + ly, z, r, h, seg, hex, rt) },
    ball: (lx, ly, lz, r, hex, sy) => { const [x, z] = at(lx, lz); return M.ball(x, Y + ly, z, r, hex, sy) },
  }
}

// Resta el rectángulo `h` ([x0,x1,z0,z1]) de `r`: hasta 4 rectángulos restantes (para el hueco de las escaleras).
function subRect(r, h) {
  const [x0, x1, z0, z1] = r, [a0, a1, b0, b1] = h
  if (a1 <= x0 || a0 >= x1 || b1 <= z0 || b0 >= z1) return [r]
  const out = []
  if (a0 > x0) out.push([x0, a0, z0, z1])
  if (a1 < x1) out.push([a1, x1, z0, z1])
  const m0 = Math.max(x0, a0), m1 = Math.min(x1, a1)
  if (b0 > z0) out.push([m0, m1, z0, b0])
  if (b1 < z1) out.push([m0, m1, b1, z1])
  return out
}

// ── Muebles ──────────────────────────────────────────────────────────────────
class Furnish {
  constructor(M, C, E, lights) { this.M = M; this.C = C; this.E = E; this.lights = lights }
  block(x, y, z, w, h, d, ry) { this.C.box(x, y, z, w, h, d, '#fff', ry) } // colisión simple del mueble
  desk(x, y, z, ry = 0) {
    const f = frame(this.M, x, y, z, ry)
    f.box(0, 0.72, 0, 1.3, 0.07, 0.7, WOOD_L); f.box(-0.58, 0, 0, 0.07, 0.72, 0.6, WOOD); f.box(0.58, 0, 0, 0.07, 0.72, 0.6, WOOD)
    f.box(0, 0, 0.7, 0.5, 0.45, 0.45, WOOD); f.box(0, 0.45, 0.7, 0.5, 0.06, 0.45, WOOD_L); f.box(0, 0.45, 0.93, 0.5, 0.5, 0.06, WOOD_L)
  }
  table(x, y, z, len, wid, ry = 0, hex = WOOD_L, solid = true) {
    const f = frame(this.M, x, y, z, ry)
    f.box(0, 0.78, 0, len, 0.09, wid, hex)
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) f.box(sx * (len / 2 - 0.15), 0, sz * (wid / 2 - 0.15), 0.12, 0.78, 0.12, WOOD)
    if (solid) this.block(x, y, z, len, 0.9, wid, ry)
  }
  bench(x, y, z, len, ry = 0, hex = WOOD) {
    const f = frame(this.M, x, y, z, ry)
    f.box(0, 0.45, 0, len, 0.08, 0.5, hex); f.box(0, 0.5, -0.27, len, 0.5, 0.07, hex)
    f.box(-len / 2 + 0.12, 0, 0, 0.1, 0.45, 0.5, IRON); f.box(len / 2 - 0.12, 0, 0, 0.1, 0.45, 0.5, IRON)
  }
  chair(x, y, z, ry = 0) {
    const f = frame(this.M, x, y, z, ry)
    f.box(0, 0.45, 0, 0.5, 0.06, 0.5, WOOD_L); f.box(0, 0.5, -0.23, 0.5, 0.5, 0.05, WOOD); f.box(-0.2, 0, -0.2, 0.06, 0.45, 0.06, WOOD); f.box(0.2, 0, 0.2, 0.06, 0.45, 0.06, WOOD)
  }
  shelf(x, y, z, len, ry = 0, h = 3.3, R = Math.random) {
    const f = frame(this.M, x, y, z, ry)
    f.box(0, 0, 0, len, h, 0.45, WOOD)
    const rows = Math.max(3, Math.floor(h / 0.7))
    for (let r = 0; r < rows; r++) {
      let u = -len / 2 + 0.1
      while (u < len / 2 - 0.25) {
        const bw = 0.12 + R() * 0.22
        f.box(u + bw / 2, 0.18 + r * 0.66, 0.06, bw * 0.9, 0.46, 0.34, BOOKS[Math.floor(R() * BOOKS.length)])
        u += bw
      }
    }
    this.block(x, y, z, len, h, 0.5, ry)
  }
  rug(x, y, z, w, d, hex, trim = '#e3c56d') {
    this.M.box(x, y, z, w, 0.03, d, trim); this.M.box(x, y + 0.03, z, w - 0.5, 0.01, d - 0.5, hex)
  }
  board(x, y, z, w, ry = 0) { const f = frame(this.M, x, y, z, ry); f.box(0, 1.1, 0, w + 0.2, 1.4, 0.06, WOOD); f.box(0, 1.2, 0.04, w, 1.2, 0.03, '#27473a') }
  frameArt(x, y, z, ry, w = 1.1, h = 1.5) {
    const col = BOOKS[Math.floor((x * 7 + z * 3 + 80) % BOOKS.length)], f = frame(this.M, x, y, z, ry)
    f.box(0, 0, 0, w + 0.16, h + 0.16, 0.08, GOLD); f.box(0, 0.08, 0.05, w, h, 0.03, col)
  }
  lamp(x, y, z) { this.lights.push([x, y, z]); this.E.box(x, y - 0.05, z, 0.7, 0.18, 0.7, '#ffe2a8'); this.M.box(x, y + 0.13, z, 0.1, 1.4, 0.1, IRON) }
  chandelier(x, y, z, r = 1.1) {
    this.lights.push([x, y - 0.4, z]); this.M.cyl(x, y + 0.2, z, 0.04, 1.6, 4, IRON)
    this.M.add(new THREE.TorusGeometry(r, 0.07, 4, 12).rotateX(Math.PI / 2), GOLD, x, y - 0.05, z)
    for (let i = 0; i < 6; i++) { const a = i / 6 * 6.283; this.E.ball(x + Math.cos(a) * r, y + 0.1, z + Math.sin(a) * r, 0.14, '#ffe6b0') }
  }
  sofa(x, y, z, ry, hex = '#7a3b3b') {
    const f = frame(this.M, x, y, z, ry)
    f.box(0, 0, 0, 2.2, 0.45, 0.9, hex); f.box(0, 0.45, -0.38, 2.2, 0.55, 0.2, hex); f.box(-1.05, 0.45, 0, 0.2, 0.3, 0.9, hex); f.box(1.05, 0.45, 0, 0.2, 0.3, 0.9, hex)
    this.block(x, y, z, 2.3, 0.9, 1, ry)
  }
  bed(x, y, z, ry, hex = '#4f6d9a') {
    const f = frame(this.M, x, y, z, ry)
    f.box(0, 0.25, 0, 0.95, 0.2, 2.0, WOOD); f.box(0, 0.45, 0.05, 0.9, 0.16, 1.85, hex); f.box(0, 0.58, -0.78, 0.7, 0.14, 0.4, '#f1ead8'); f.box(0, 0, -1.0, 0.95, 0.9, 0.08, WOOD)
    this.block(x, y, z, 1, 0.7, 2.1, ry)
  }
  plant(x, y, z) { this.M.cyl(x, y, z, 0.3, 0.45, 7, '#b5653a', 0.22); this.M.ball(x, y + 0.9, z, 0.5, '#3f7a45', 1.2) }
}

// ── Edificios ────────────────────────────────────────────────────────────────
export const BUILDING_DEFAULTS = { w: 24, d: 14, floors: 2, style: 'brick', roof: 'gable', interior: 'hall', tower: 'none', portico: false, door: 3.2, ivy: 0.6, sign: '', seed: 1 }

function cupola(M, x, y, z, S) {
  M.box(x, y, z, 3.6, 1.6, 3.6, S.trim); M.box(x, y + 1.6, z, 4.0, 0.3, 4.0, S.trim)
  for (const [dx, dz, ry] of [[0, 1.82, 0], [0, -1.82, 0], [1.82, 0, 1.5708], [-1.82, 0, 1.5708]]) { // relojes
    M.box(x + dx, y + 0.4, z + dz, 1.2, 0.8 * 1.0, 0.08, '#faf6ea', ry); M.box(x + dx, y + 0.75, z + dz + (dz ? Math.sign(dz) * 0.05 : 0), 0.06, 0.4, 0.04, IRON, ry)
  }
  M.cyl(x, y + 1.9, z, 1.55, 2.4, 8, S.trim)
  for (let i = 0; i < 4; i++) { const a = i * 1.5708 + 0.785; M.box(x + Math.cos(a) * 1.45, y + 2.4, z + Math.sin(a) * 1.45, 0.7, 1.3, 0.3, '#3c3f48', -a + 1.5708) }
  M.cone(x, y + 4.3, z, 1.9, 2.6, 8, '#5f9a86')
  M.cyl(x, y + 6.8, z, 0.07, 1.8, 4, GOLD); M.ball(x, y + 6.5, z, 0.22, GOLD)
}
function steeple(M, x, y, z, S) {
  M.box(x, y, z, 5.2, 6.5, 5.2, S.trim); M.box(x, y + 6.5, z, 5.6, 0.4, 5.6, S.trim)
  for (const [dx, dz, ry] of [[0, 2.62, 0], [0, -2.62, 0], [2.62, 0, 1.5708], [-2.62, 0, 1.5708]]) M.box(x + dx, y + 4.2, z + dz, 1.6, 1.8, 0.08, '#faf6ea', ry)
  M.box(x, y + 6.9, z, 4.2, 4.0, 4.2, S.trim)
  for (const [dx, dz, ry] of [[0, 2.12, 0], [0, -2.12, 0], [2.12, 0, 1.5708], [-2.12, 0, 1.5708]]) M.box(x + dx, y + 7.7, z + dz, 1.5, 2.2, 0.1, '#3c3f48', ry)
  M.add(new THREE.ConeGeometry(2.9, 11, 4).translate(0, 5.5, 0), S.trim, x, y + 10.9, z, 0.785)
  M.cyl(x, y + 21.5, z, 0.08, 2.2, 4, GOLD); M.box(x, y + 22.6, z, 0.9, 0.12, 0.12, GOLD)
}

const BAY = { brick: 4.4, neo: 4.6, brut: 5, modern: 4.2 }
const WIN = { brick: [1.5, 2.3, 0.9], neo: [1.6, 2.8, 0.8], brut: [3.2, 1.3, 1.5], modern: [3.4, 3.0, 0.5] } // w, h, antepecho

export function buildBuilding(raw) {
  const p = { ...BUILDING_DEFAULTS, ...raw }
  const S = STYLES[p.style] || STYLES.brick
  const { w, d, floors, door, interior } = p
  const roofKind = p.roof || (p.style === 'brick' || p.style === 'neo' ? 'gable' : 'flat')
  const fh = p.fh || (interior === 'chapel' || interior === 'dining' ? 6.2 : 4.4)
  const P = p.plinth ?? (p.portico ? 1.7 : 0.35)
  const R = rng(Math.floor(p.seed * 7919) + 13)
  const M = new Mesher(), C = new Mesher(), F = new Mesher(), RMP = new Mesher(), G = new Mesher(), RF = new Mesher(), E = new Mesher()
  const lights = [], signs = [], T = 0.55, H = P + floors * fh
  const Fx = new Furnish(M, C, E, lights)

  // ── paredes: 4 lados con ventanas y la puerta al frente; cada lado se arma en su propio marco local (x a lo largo, z hacia afuera)
  const sides = [
    { key: 'front', ry: 0, cx: 0, cz: d / 2, L: w }, { key: 'back', ry: Math.PI, cx: 0, cz: -d / 2, L: w },
    { key: 'right', ry: Math.PI / 2, cx: w / 2, cz: 0, L: d }, { key: 'left', ry: -Math.PI / 2, cx: -w / 2, cz: 0, L: d },
  ]
  const put = (s, u, lz) => { const c = Math.cos(s.ry), n = Math.sin(s.ry); return [s.cx + u * c + lz * n, s.cz - u * n + lz * c] }
  const wallBox = (s, u, y, bw, bh, lz, bt, hex, mesh = M) => { if (bw > 0.01 && bh > 0.01) { const [x, z] = put(s, u, lz); mesh.box(x, y, z, bw, bh, bt, hex, s.ry) } }
  const layered = (s, u, y, bw, bh) => { wallBox(s, u, y, bw, bh, -0.175, 0.35, S.wall); wallBox(s, u, y, bw, bh, -0.45, 0.2, S.inner) }
  const [ww, wh, sill] = WIN[p.style] || WIN.brick
  const sillTrim = p.style === 'brick' || p.style === 'neo'

  sides.forEach((s) => {
    const L = s.L, n = Math.max(1, Math.round((L - 3) / (BAY[p.style] || 4.4))), sp = (L - 3) / n
    for (let k = 0; k < floors; k++) {
      const yb = k === 0 ? 0 : P + k * fh, yt = P + (k + 1) * fh
      const ops = []
      for (let i = 0; i < n; i++) {
        const u = -(L - 3) / 2 + sp * (i + 0.5)
        if (s.key === 'front' && k === 0 && Math.abs(u) < door / 2 + 1.4) continue
        ops.push({ u, w: Math.min(ww, sp - 0.6), y0: P + k * fh + sill, h: wh, win: true })
      }
      if (s.key === 'front' && k === 0) ops.push({ u: 0, w: door, y0: P, h: 3.7, door: true })
      ops.sort((a, b) => a.u - b.u)
      let cur = -L / 2
      for (const o of ops) {
        layered(s, (cur + o.u - o.w / 2) / 2, yb, o.u - o.w / 2 - cur, yt - yb)
        layered(s, o.u, yb, o.w, o.y0 - yb)
        layered(s, o.u, o.y0 + o.h, o.w, yt - o.y0 - o.h)
        cur = o.u + o.w / 2
        if (o.win) {
          const [gx, gz] = put(s, o.u, -0.3)
          G.box(gx, o.y0, gz, o.w, o.h, 0.06, S.glass, s.ry)
          const fr = sillTrim ? 0.2 : 0.14
          wallBox(s, o.u, o.y0 + o.h, o.w + fr * 2 + 0.1, fr + 0.02, 0.08, 0.3, S.trim); wallBox(s, o.u, o.y0 - fr, o.w + fr * 2, fr, 0.12, 0.34, S.trim)
          wallBox(s, o.u - o.w / 2 - fr / 2, o.y0, fr, o.h, 0.05, 0.2, S.trim); wallBox(s, o.u + o.w / 2 + fr / 2, o.y0, fr, o.h, 0.05, 0.2, S.trim)
          wallBox(s, o.u, o.y0, 0.07, o.h, -0.2, 0.1, S.trim); if (sillTrim) wallBox(s, o.u, o.y0 + o.h * 0.55, o.w, 0.07, -0.2, 0.1, S.trim)
        }
        if (o.door) { // marco de la puerta + dintel + vidrio sobre la puerta
          wallBox(s, o.u - o.w / 2 - 0.2, o.y0, 0.4, o.h + 0.2, 0.1, 0.4, S.trim); wallBox(s, o.u + o.w / 2 + 0.2, o.y0, 0.4, o.h + 0.2, 0.1, 0.4, S.trim)
          wallBox(s, o.u, o.y0 + o.h, o.w + 1.0, 0.4, 0.1, 0.5, S.trim)
          for (const sg of [-1, 1]) wallBox(s, o.u + sg * (o.w / 2 - 0.12), o.y0, 0.1, 3.4, -1.3, 1.5, WOOD) // hojas abiertas contra la pared
        }
      }
      layered(s, (cur + L / 2) / 2, yb, L / 2 - cur, yt - yb)
    }
    // zócalo, cornisa y cintas entre pisos
    wallBox(s, 0, 0, L + 0.3, P + (s.key === 'front' ? 0 : 0.85), 0.075, 0.15, S.plinth)
    wallBox(s, 0, H - 0.45, L + 0.7, 0.45, 0.25, 0.5, S.trim)
    if (p.style === 'brick' || p.style === 'neo') for (let k = 1; k < floors; k++) wallBox(s, 0, P + k * fh - 0.12, L + 0.3, 0.22, 0.1, 0.2, S.trim)
    // colisión: el lado entero (menos el hueco de la puerta)
    if (s.key === 'front') {
      const side = (w - door) / 2
      wallBox(s, -(door + side) / 2, 0, side, H, -T / 2, T, '#fff', C); wallBox(s, (door + side) / 2, 0, side, H, -T / 2, T, '#fff', C)
      wallBox(s, 0, P + 3.7, door, H - P - 3.7, -T / 2, T, '#fff', C)
    } else wallBox(s, 0, 0, L, H, -T / 2, T, '#fff', C)
  })
  // esquinas: pilastras
  if (p.style === 'brick' || p.style === 'neo') for (const sx of [-1, 1]) for (const sz of [-1, 1]) M.box(sx * (w / 2 + 0.02), 0, sz * (d / 2 + 0.02), 0.7, H, 0.7, S.trim)

  // ── ivy (solo ladrillo): parches verdes sobre la fachada
  if (p.ivy > 0) {
    const greens = ['#3e6e3a', '#4d7f3f', '#2f5a35', '#587f3a']
    sides.forEach((s) => {
      const count = Math.round(s.L / 6 * p.ivy * 2)
      for (let i = 0; i < count; i++) {
        const u = (R() - 0.5) * (s.L - 3), pw = 1.6 + R() * 3.2, ph = 1.6 + R() * Math.min(4.5, floors * fh - 1.5), y = P + 0.3 + R() * 1.2
        if (s.key === 'front' && Math.abs(u) < door / 2 + 2.2 && y < P + 4) continue
        wallBox(s, u, y, pw, ph, 0.07, 0.14, greens[Math.floor(R() * greens.length)])
        for (let j = 0; j < 4; j++) wallBox(s, u + (R() - 0.5) * pw, y + R() * ph, 0.5 + R() * 0.5, 0.4 + R() * 0.4, 0.15, 0.2, greens[Math.floor(R() * greens.length)])
      }
    })
  }

  // ── pisos: planta baja sólida; pisos altos con hueco para la escalera
  const iw = w - 1.4, id = d - 1.4, sw = 2.4
  F.box(0, 0, 0, w - 0.3, P, d - 0.3, S.floor)
  if (p.interior === 'chapel' || p.interior === 'hall') F.box(0, P, 0, iw - 0.4, 0.04, 2.8, '#cdb58b') // alfombra/pasillo de piedra
  const stairRun = fh / 0.55
  const stairs = []
  for (let k = 1; k < floors; k++) {
    const left = k % 2 === 1, sx = (left ? -1 : 1) * (iw / 2 - 1.5), z0 = id / 2 - 1.2, z1 = z0 - stairRun
    stairs.push({ k, sx, z0, z1 })
    let rects = [[-iw / 2, iw / 2, -id / 2, id / 2]]
    if (p.interior === 'library' && k >= 1) rects = [[-iw / 2, -iw / 2 + 6, -id / 2, id / 2], [iw / 2 - 6, iw / 2, -id / 2, id / 2], [-iw / 2 + 6, iw / 2 - 6, -id / 2, -id / 2 + 5]] // galería
    const hole = [sx - sw / 2 - 0.05, sx + sw / 2 + 0.05, z1, z0 + 0.4]
    rects.flatMap((r) => subRect(r, hole)).forEach(([x0, x1, a0, a1]) => F.box((x0 + x1) / 2, P + k * fh - 0.35, (a0 + a1) / 2, x1 - x0, 0.35, a1 - a0, S.floor))
    // peldaños visibles + rampa invisible (isFloor) + barandas
    const yb = P + (k - 1) * fh, steps = Math.round(fh / 0.28), rise = fh / steps, sd = stairRun / steps
    for (let i = 0; i < steps; i++) M.box(sx, yb, z0 - (i + 0.5) * sd, sw, (i + 1) * rise, sd, i % 2 ? S.floor : '#9b7a56')
    RMP.slope(sx, yb + rise / 2, z0, yb + fh + rise / 2, z1, sw, 0.25, '#fff')
    for (const sg of [-1, 1]) M.slope(sx + sg * (sw / 2 - 0.04), yb + 1.0, z0, yb + fh + 1.0, z1, 0.08, 0.08, WOOD)
  }
  E.box(0, H - 0.3, 0, w - 0.4, 0.3, d - 0.4, '#a89a84') // cielo raso: sin luz propia quedaba negro (la hemisférica lo alcanza de abajo hacia arriba)

  // frente: escalones hasta el umbral (+ pórtico con columnas)
  const nSteps = Math.max(1, Math.ceil(P / 0.28)), stepD = p.portico ? 0.6 : 0.5, stepW = p.portico ? Math.min(w * 0.7, 26) + 2 : door + 2
  const porchD = p.portico ? 6.5 : 0, chP = H - P - 1.4
  for (let i = 0; i < nSteps; i++) F.box(0, 0, d / 2 + porchD + (nSteps - i - 0.5) * stepD - 0.0, stepW, P * (i + 1) / nSteps, stepD, i % 2 ? S.plinth : S.trim)
  if (p.portico) {
    const span = Math.min(w * 0.7, 26), nc = Math.max(4, Math.round(span / 3.4)), cz = d / 2 + porchD - 0.9, ch = chP
    F.box(0, 0, d / 2 + porchD / 2, span + 1.2, P, porchD, S.trim)
    for (let i = 0; i < nc; i++) {
      const x = -span / 2 + span * i / (nc - 1)
      M.cyl(x, P, cz, 0.62, ch, 10, S.trim, 0.52); M.box(x, P + ch - 0.0, cz, 1.5, 0.3, 1.5, S.trim); M.box(x, P, cz, 1.5, 0.3, 1.5, S.trim)
      C.box(x, 0, cz, 1.2, H, 1.2, '#fff')
    }
    M.box(0, P + ch + 0.3, d / 2 + porchD / 2 - 0.3, span + 2, 1.1, porchD + 0.8, S.trim)
    RF.add(prismGeo(span + 3, porchD + 1.8, 2.9), S.roof, 0, P + ch + 1.4, d / 2 + porchD / 2 - 0.3)
    RF.add(prismGeo(span + 2.2, 0.2, 2.5), S.wall, 0, P + ch + 1.4, d / 2 + porchD + 0.65)
    C.box(0, P + ch, d / 2 + porchD / 2, span + 2, 1.5, porchD, '#fff')
  } else { // marquesina sobre la puerta
    M.box(0, P + 4.3, d / 2 + 0.8, door + 2.4, 0.22, 1.8, S.trim); for (const sg of [-1, 1]) M.box(sg * (door / 2 + 1.0), P, d / 2 + 1.5, 0.22, 4.3, 0.22, S.trim)
  }

  // ── techo
  const spanX = w + 1.4, spanZ = d + 1.4
  if (roofKind === 'gable') {
    const ridge = Math.max(2.6, Math.min(w, d) * 0.3), alongX = w >= d
    RF.add(alongX ? prismGeo(spanZ, spanX, ridge) : prismGeo(spanX, spanZ, ridge), S.roof, 0, H, 0, alongX ? Math.PI / 2 : 0)
    for (const sg of [-1, 1]) M.box(alongX ? sg * w * 0.28 : 0, H + ridge * 0.5, alongX ? 0 : sg * d * 0.28, 1.1, ridge * 0.75, 1.1, S.wall) // chimeneas
    if (p.tower === 'cupola') cupola(RF, 0, H + ridge - 0.8, alongX ? 0 : -d * 0.15, S)
    if (p.tower === 'steeple') steeple(RF, 0, H, d / 2 - 4, S)
    C.box(0, H, 0, w, 0.3, d, '#fff')
  } else if (roofKind === 'hip') {
    const ridge = Math.max(3, Math.min(w, d) * 0.32)
    RF.add(new THREE.ConeGeometry(0.7071, 1, 4).rotateY(Math.PI / 4).translate(0, 0.5, 0).scale(spanX, ridge, spanZ), S.roof, 0, H, 0)
    if (p.tower === 'cupola') cupola(RF, 0, H + ridge - 0.8, 0, S)
    C.box(0, H, 0, w, 0.3, d, '#fff')
  } else {
    RF.box(0, H, 0, w + 0.2, 0.4, d + 0.2, S.roof)
    for (const [bx, bz, bw, bd] of [[0, d / 2, w, 0.4], [0, -d / 2, w, 0.4], [w / 2, 0, 0.4, d], [-w / 2, 0, 0.4, d]]) RF.box(bx, H + 0.4, bz, bw + 0.2, 0.9, bd, S.trim)
    if (p.tower === 'cupola') { RF.cyl(0, H + 0.4, 0, Math.min(w, d) * 0.25, 3.2, 14, S.trim); RF.add(new THREE.SphereGeometry(Math.min(w, d) * 0.25, 14, 8, 0, 6.283, 0, 1.5708).translate(0, 0, 0), '#6aa391', 0, H + 3.6, 0) }
    C.box(0, H, 0, w, 0.3, d, '#fff')
  }

  // ── interior
  const x0 = -iw / 2, x1 = iw / 2, z0 = -id / 2, z1 = id / 2, y0 = P + 0.02
  const inStair = (x, z, lv) => stairs.some((s) => (s.k === lv + 1 || s.k === lv) && Math.abs(x - s.sx) < sw / 2 + 1.2 && z > s.z1 - 1.2 && z < s.z0 + 1.2)
  const wallArt = () => { for (let i = 0; i < Math.floor(w / 9); i++) Fx.frameArt(-iw / 2 + 4 + i * 9, y0 + 1.7, z0 + 0.35, 0) }

  const lightsGrid = (lv, ox = 0) => {
    const nx = Math.max(1, Math.round(iw / 13)), nz = Math.max(1, Math.round(id / 13))
    for (let i = 0; i < nx; i++) for (let j = 0; j < nz; j++) {
      const x = x0 + iw * (i + 0.5) / nx, z = z0 + id * (j + 0.5) / nz
      if (!inStair(x, z, lv)) Fx.lamp(x + ox, P + lv * fh + fh - 1.0, z)
    }
  }
  const furnishLevel = (kind, lv) => {
    const yy = P + lv * fh + 0.02
    if (kind === 'classroom' || kind === 'lab') {
      const rows = Math.max(2, Math.floor((id - 8) / 2.6)), cols = Math.max(2, Math.floor((iw - 8) / 2.4))
      for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
        const x = x0 + 4 + (iw - 8) * (c + 0.5) / cols, z = z0 + 5 + (id - 8) * (r + 0.5) / rows
        if (inStair(x, z, lv)) continue
        if (kind === 'lab') { Fx.table(x, yy, z, 1.8, 0.8, 0, '#d8dde0'); M.box(x, yy + 0.88, z - 0.2, 0.7, 0.45, 0.06, '#27323a'); E.box(x, yy + 0.92, z - 0.17, 0.6, 0.35, 0.03, '#7fe3ff') }
        else { Fx.desk(x, yy, z, 0); Fx.block(x, yy, z, 1.4, 0.9, 1.4, 0) }
      }
      if (lv === 0) { Fx.board(0, yy, z0 + 0.4, Math.min(8, iw * 0.4)); Fx.table(0, yy, z0 + 2.4, 2.4, 1, 0) }
    } else if (kind === 'library') {
      if (lv === 0) {
        for (let r = 0; r < 3; r++) { const z = z0 + 8 + r * 7; Fx.table(0, yy, z, Math.min(18, iw * 0.45), 1.6, 0, '#7a5a3b'); for (let i = -3; i <= 3; i += 2) { Fx.chair(i * 2, yy, z - 1.2, 0); Fx.chair(i * 2, yy, z + 1.2, Math.PI); E.box(i * 2, yy + 0.9, z, 0.35, 0.3, 0.35, '#5fd08f') } }
        for (let i = 0; i < Math.floor((id - 6) / 4); i++) { Fx.shelf(x0 + 0.4, yy, z0 + 3 + i * 4, 3.6, Math.PI / 2, 3.3, R); Fx.shelf(x1 - 0.4, yy, z0 + 3 + i * 4, 3.6, -Math.PI / 2, 3.3, R) }
        for (let i = 0; i < Math.floor(iw / 5) - 1; i++) Fx.shelf(x0 + 3 + i * 5, yy, z0 + 0.4, 4.2, 0, 3.3, R)
        Fx.rug(0, yy, z1 - 5, iw * 0.4, 6, '#7c2d3a')
      } else {
        for (let i = 0; i < Math.floor((id - 6) / 4); i++) { Fx.shelf(x0 + 0.4, yy, z0 + 2 + i * 4, 3.6, Math.PI / 2, 3.3, R); Fx.shelf(x1 - 0.4, yy, z0 + 2 + i * 4, 3.6, -Math.PI / 2, 3.3, R) }
        Fx.shelf(0, yy, z0 + 0.4, Math.min(16, iw * 0.4), 0, 3.3, R)
      }
    } else if (kind === 'dining') {
      if (lv === 0) {
        for (const x of [-iw * 0.22, iw * 0.22]) for (let r = 0; r < Math.floor((id - 6) / 4.4); r++) {
          const z = z0 + 6 + r * 4.4
          Fx.table(x, yy, z, iw * 0.34, 1.2, 0, '#6d4b30'); Fx.bench(x, yy, z - 1.1, iw * 0.34, 0); Fx.bench(x, yy, z + 1.1, iw * 0.34, Math.PI)
        }
        M.box(0, yy, z0 + 2.2, iw * 0.56, 0.7, 4.2, S.floor); Fx.block(0, yy, z0 + 2.2, iw * 0.56, 0.7, 4.2, 0); Fx.table(0, yy + 0.7, z0 + 2.2, iw * 0.5, 2.4, 0, '#7a5a3b', false)
        for (let i = 0; i < 5; i++) Fx.frameArt(-iw / 2 + 4 + i * (iw - 8) / 4, yy + 3.0, z0 + 0.35, 0, 1.6, 2.2)
        for (let i = 0; i < 4; i++) Fx.chandelier((i - 1.5) * iw * 0.22, P + fh - 1.0, 0, 1.4)
      }
    } else if (kind === 'chapel') {
      if (lv === 0) {
        for (const sx of [-1, 1]) for (let r = 0; r < Math.floor((id - 10) / 1.8); r++) { const z = z0 + 8 + r * 1.8; Fx.bench(sx * (iw * 0.22), yy, z, iw * 0.34, 0, '#8a6a47') }
        M.box(0, yy, z0 + 2, 5, 0.6, 3.5, '#d9cfb8'); M.box(0, yy + 0.6, z0 + 1.2, 2.2, 1.0, 1.0, '#efe6d2'); M.box(0, yy, z0 + 0.35, 0.2, 5, 0.12, GOLD); M.box(0, yy + 3.6, z0 + 0.35, 1.1, 0.2, 0.12, GOLD)
        Fx.block(0, yy, z0 + 2, 5, 1.6, 3.5, 0)
        for (let i = 0; i < 3; i++) Fx.chandelier(0, P + fh - 1.0, z0 + 8 + i * 8, 1.4)
        for (const sx of [-1, 1]) for (let i = 0; i < 4; i++) { const col = ['#d65a5a', '#5a8fd6', '#e0b84c', '#6bbf7a'][i]; E.box(sx * (iw / 2 - 0.05), yy + 1.8, z0 + 6 + i * 6, 0.05, 3.4, 1.8, col) }
      }
    } else if (kind === 'dorm') {
      if (lv === 0) {
        Fx.rug(0, yy, 0, iw * 0.4, id * 0.35, '#3d5a80')
        Fx.sofa(-4, yy, 3, 0); Fx.sofa(4, yy, 3, 0, '#4f6d9a'); Fx.sofa(0, yy, -3.5, Math.PI, '#7a3b3b'); Fx.table(0, yy, 0, 2.2, 1.0, 0, '#7a5a3b')
        M.box(0, yy, z0 + 0.5, 4.2, 2.6, 0.8, '#c9bfa8'); E.box(0, yy + 0.3, z0 + 0.95, 2.6, 1.0, 0.1, '#ff9a3c'); Fx.block(0, yy, z0 + 0.5, 4.2, 2.6, 0.8, 0)
        Fx.plant(x0 + 1, yy, z1 - 1); Fx.plant(x1 - 1, yy, z1 - 1); Fx.shelf(x1 - 0.4, yy, 0, 6, -Math.PI / 2, 2.6, R)
      } else {
        const cells = Math.max(2, Math.floor((iw - 4) / 7))
        for (let c = 0; c < cells; c++) for (const sz of [-1, 1]) {
          const x = x0 + 3.5 + c * 7, z = sz * (id / 2 - 2.2)
          if (inStair(x, z, lv)) continue
          Fx.bed(x, yy, z, sz > 0 ? Math.PI : 0, c % 2 ? '#4f6d9a' : '#a64b4b'); Fx.desk(x + 2.2, yy, z - sz * 0.2, sz > 0 ? Math.PI : 0)
        }
      }
    } else if (kind === 'cafe') {
      M.box(0, yy, z0 + 3, iw * 0.55, 1.1, 1.1, WOOD); M.box(0, yy + 1.1, z0 + 3, iw * 0.55 + 0.2, 0.08, 1.3, '#d9cfb8'); Fx.block(0, yy, z0 + 3, iw * 0.55, 1.2, 1.2, 0)
      for (let i = 0; i < Math.floor(iw / 4.5); i++) for (let j = 0; j < 2; j++) { const x = x0 + 3 + i * 4.5, z = 1 + j * 4.5; Fx.table(x, yy, z, 1.2, 1.2, 0, '#c8b28b'); Fx.chair(x - 1, yy, z, Math.PI / 2); Fx.chair(x + 1, yy, z, -Math.PI / 2) }
      for (let i = 0; i < 3; i++) Fx.shelf(x0 + 3 + i * 5, yy, z0 + 0.4, 4, 0, 2.6, R)
    } else { // 'hall': vestíbulo
      if (lv === 0) {
        Fx.rug(0, yy, 0, 5.5, id - 2, '#7c2d3a')
        for (const sx of [-1, 1]) { Fx.bench(sx * (iw / 2 - 1.2), yy, -2, 4, sx > 0 ? -Math.PI / 2 : Math.PI / 2); Fx.plant(sx * (iw / 2 - 1.3), yy, z1 - 1.2); Fx.plant(sx * (iw / 2 - 1.3), yy, z0 + 1.2) }
        wallArt()
        Fx.table(0, yy, z0 + 3.2, 3.2, 1.2, 0, '#7a5a3b')
      } else { for (let i = 0; i < Math.floor(w / 9); i++) Fx.frameArt(-iw / 2 + 4 + i * 9, yy + 1.7, z0 + 0.35, 0); Fx.sofa(6, yy, -2, Math.PI) }
    }
  }
  for (let lv = 0; lv < floors; lv++) {
    furnishLevel(interior === 'library' || interior === 'dining' || interior === 'chapel' ? interior : lv === 0 ? interior : (interior === 'dorm' ? 'dorm' : interior === 'lab' ? 'lab' : 'classroom'), lv)
    if (!(interior === 'dining' || interior === 'chapel') || lv === 0) lightsGrid(lv)
  }

  // letrero sobre la puerta
  if (p.sign) signs.push({ text: p.sign, x: 0, y: p.portico ? P + chP + 0.3 : P + 4.7, z: p.portico ? d / 2 + porchD + 0.16 : d / 2 + 0.22, w: Math.min(10, Math.max(5, p.sign.length * 0.55)), h: 1.1, ry: 0 })

  return {
    solid: M.build(), floors: F.build(), ramps: RMP.build(), glass: G.build(), roof: RF.build(), emissive: E.build(), collide: C.build(),
    lights, signs, bounds: { w: w + 2, d: d + (p.portico ? porchD + 4 : 3), h: H + 8 },
  }
}

// ── Árboles, farolas y mobiliario urbano (se instancian) ─────────────────────
const TREE_COLORS = {
  elm: ['#4f7d3c', '#5f8f46', '#3f6b35'], oak: ['#456f35', '#527d3d', '#3b6030'],
  maple: ['#d9722b', '#c24a2b', '#e0a63c'], gold: ['#e0b13c', '#d99a2b', '#c98a2a'], pine: ['#2f5a3f', '#38684a'],
}
export function buildTree(kind = 'elm', seed = 1) {
  const R = rng(seed * 131 + 7), M = new Mesher(), cols = TREE_COLORS[kind] || TREE_COLORS.elm
  const pick = () => cols[Math.floor(R() * cols.length)]
  if (kind === 'pine') {
    M.cyl(0, 0, 0, 0.3, 2.4, 6, '#5a4636', 0.22)
    ;[[2.6, 3.2, 2.0], [2.1, 3.0, 4.2], [1.5, 2.6, 6.2]].forEach(([r, h, y], i) => M.cone(0, y, 0, r, h, 7, cols[i % cols.length]))
  } else if (kind === 'birch') {
    M.cyl(0, 0, 0, 0.22, 5.2, 6, '#e4e0d4', 0.15); for (let i = 0; i < 4; i++) M.ball((R() - 0.5) * 1.4, 4.4 + R() * 1.6, (R() - 0.5) * 1.4, 1.1 + R() * 0.5, '#9bbf55', 0.85)
  } else {
    const tall = kind === 'elm' ? 4.4 : 3.4, spread = kind === 'oak' ? 2.6 : 2.1
    M.cyl(0, 0, 0, 0.5, tall, 7, '#5a4636', 0.32)
    for (const [dx, dy, dz] of [[0, 0, 0], [0.9, -0.5, 0.4], [-0.8, -0.3, -0.6], [0.2, 0.9, -0.9], [-0.4, 0.7, 0.9]]) M.ball(dx * spread * 0.8, tall + 0.4 + dy * 1.6, dz * spread * 0.8, spread * (0.8 + R() * 0.35), pick(), 0.82)
  }
  return M.build()
}
export function buildLamp() {
  const M = new Mesher(), E = new Mesher()
  M.cyl(0, 0, 0, 0.18, 0.5, 6, IRON, 0.22); M.cyl(0, 0.5, 0, 0.07, 3.4, 5, IRON); M.box(0, 3.9, 0, 0.5, 0.12, 0.5, IRON)
  E.box(0, 3.5, 0, 0.36, 0.5, 0.36, '#ffe2a8'); M.cone(0, 4.0, 0, 0.42, 0.4, 4, IRON, Math.PI / 4)
  return { solid: M.build(), emissive: E.build(), collide: new Mesher().box(0, 0, 0, 0.5, 3, 0.5, '#fff').build() }
}
export function buildBenchProp() { const M = new Mesher(), F = new Furnish(M, new Mesher(), new Mesher(), []); F.bench(0, 0, 0, 1.9, 0, '#6d4b30'); return { solid: M.build() } }
export function buildFlagpole() {
  const M = new Mesher()
  M.cyl(0, 0, 0, 0.14, 11, 6, '#e9e4d6', 0.08); M.ball(0, 11.1, 0, 0.18, GOLD); M.box(0.8, 9.3, 0, 1.6, 1.0, 0.04, '#b22234'); M.box(0.8, 9.55, 0, 0.7, 0.5, 0.05, '#3c3b6e')
  return { solid: M.build(), collide: new Mesher().box(0, 0, 0, 0.4, 3, 0.4, '#fff').build() }
}

// ── Piezas únicas (no instanciadas) ──────────────────────────────────────────
export function buildFountain({ r = 5 } = {}) {
  const M = new Mesher(), E = new Mesher(), C = new Mesher()
  M.cyl(0, 0, 0, r, 0.9, 16, '#bdb4a0'); M.cyl(0, 0.9, 0, r - 0.5, 0.15, 16, '#7fc4dd'); M.cyl(0, 0.9, 0, 0.9, 1.6, 8, '#cfc6b0'); M.cyl(0, 2.5, 0, 1.9, 0.25, 12, '#cfc6b0'); M.cyl(0, 2.7, 0, 0.35, 1.6, 6, '#cfc6b0')
  E.ball(0, 4.5, 0, 0.35, '#bfe9ff'); C.box(0, 0, 0, r * 1.7, 1.2, r * 1.7, '#fff')
  return { solid: M.build(), emissive: E.build(), collide: C.build() }
}
export function buildStatue({ s = 1 } = {}) {
  const M = new Mesher(), C = new Mesher()
  M.box(0, 0, 0, 3.2 * s, 1.2 * s, 3.2 * s, '#a69d8a'); M.box(0, 1.2 * s, 0, 2.6 * s, 2.0 * s, 2.6 * s, '#cfc6b0'); M.box(0, 3.2 * s, 0, 3.0 * s, 0.4 * s, 3.0 * s, '#a69d8a')
  const b = '#b08a45', y = 3.6 * s; M.box(-0.3 * s, y, 0, 0.45 * s, 1.4 * s, 0.5 * s, b); M.box(0.3 * s, y, 0, 0.45 * s, 1.4 * s, 0.5 * s, b); M.box(0, y + 1.4 * s, 0, 1.2 * s, 1.5 * s, 0.7 * s, b); M.ball(0, y + 3.2 * s, 0, 0.42 * s, b)
  M.box(-0.85 * s, y + 1.5 * s, 0, 0.3 * s, 1.2 * s, 0.35 * s, b); M.box(0.85 * s, y + 1.5 * s, 0, 0.3 * s, 1.2 * s, 0.35 * s, b)
  C.box(0, 0, 0, 3.2 * s, 4 * s, 3.2 * s, '#fff')
  return { solid: M.build(), collide: C.build() }
}
// Reja de hierro con pilares de ladrillo cada ~7 m: de -len/2 a +len/2 en X.
export function buildFence({ len = 40, hex = '#2c2f36' } = {}) {
  const M = new Mesher(), C = new Mesher(), n = Math.max(1, Math.round(len / 7)), seg = len / n
  M.box(0, 0.9, 0, len, 0.1, 0.1, hex); M.box(0, 2.0, 0, len, 0.1, 0.1, hex)
  for (let i = 0; i <= n; i++) { const x = -len / 2 + i * seg; M.box(x, 0, 0, 0.9, 3.0, 0.9, '#a4503b'); M.box(x, 3.0, 0, 1.1, 0.25, 1.1, '#e8dec8'); M.cone(x, 3.25, 0, 0.45, 0.6, 4, hex, Math.PI / 4) }
  for (let x = -len / 2 + 0.5; x < len / 2; x += 0.32) { M.cyl(x, 0, 0, 0.03, 2.4, 4, hex); M.cone(x, 2.4, 0, 0.06, 0.25, 4, hex) }
  C.box(0, 0, 0, len, 2.6, 0.3, '#fff')
  return { solid: M.build(), collide: C.build() }
}
// Puerta monumental: dos pilares de ladrillo con remates, arco de hierro y letrero. El hueco central queda libre.
export function buildGate({ w = 9, sign = '' } = {}) {
  const M = new Mesher(), C = new Mesher(), signs = []
  for (const sg of [-1, 1]) { const x = sg * (w / 2 + 0.7); M.box(x, 0, 0, 1.6, 5.2, 1.6, '#a4503b'); M.box(x, 5.2, 0, 1.9, 0.35, 1.9, '#e8dec8'); M.cone(x, 5.55, 0, 0.8, 1.5, 4, '#e8dec8', Math.PI / 4); M.ball(x, 7.1, 0, 0.3, GOLD); C.box(x, 0, 0, 1.6, 5.2, 1.6, '#fff') }
  M.box(0, 5.2, 0, w + 1.6, 0.25, 0.3, IRON)
  for (let x = -w / 2 + 0.4; x < w / 2; x += 0.5) M.cyl(x, 4.4, 0, 0.04, 0.9, 4, IRON)
  M.box(0, 6.0, 0, w * 0.6, 0.12, 0.12, IRON)
  if (sign) signs.push({ text: sign, x: 0, y: 5.5, z: 0.2, w: Math.max(4, w * 0.6), h: 0.9, ry: 0 })
  return { solid: M.build(), collide: C.build(), signs, bounds: { w: w + 4, d: 3, h: 8 } }
}
export function buildHedge({ len = 20 } = {}) {
  const M = new Mesher()
  M.box(0, 0, 0, len, 1.3, 1.2, '#3f6b35'); M.box(0, 1.3, 0, len - 0.4, 0.3, 0.9, '#4d7f3f')
  return { solid: M.build(), collide: new Mesher().box(0, 0, 0, len, 1.3, 1.2, '#fff').build() }
}
export function buildBridge({ len = 80, w = 8 } = {}) {
  const M = new Mesher(), F = new Mesher(), C = new Mesher(), n = Math.max(2, Math.round(len / 14)), seg = len / n, y = 0.4
  F.box(0, y - 0.6, 0, w, 0.6, len, '#cfc5b0')
  for (let i = 0; i <= n; i++) { const z = -len / 2 + i * seg; M.box(0, -6, z, w - 1.4, 6.4 + y - 0.6, 2.2, '#b8ad99') }
  for (const sg of [-1, 1]) { M.box(sg * (w / 2 - 0.2), y, 0, 0.4, 1.1, len, '#e8dec8'); C.box(sg * (w / 2 - 0.2), 0, 0, 0.4, 2.6, len, '#fff') }
  for (let i = 0; i <= n; i++) for (const sg of [-1, 1]) { const z = -len / 2 + i * seg; M.box(sg * (w / 2 - 0.2), y + 1.1, z, 0.7, 0.5, 0.7, '#e8dec8'); M.cyl(sg * (w / 2 - 0.2), y + 1.6, z, 0.06, 3.2, 4, IRON); E_ball(M, sg * (w / 2 - 0.2), y + 4.8, z) }
  return { solid: M.build(), floors: F.build(), collide: C.build(), bounds: { w: w + 2, d: len, h: 6 } }
}
const E_ball = (M, x, y, z) => M.ball(x, y, z, 0.25, '#ffe2a8')
// Estadio en herradura: campo + gradas escalonadas por tres lados (se camina sobre ellas).
export function buildStadium({ w = 70, d = 120 } = {}) {
  const M = new Mesher(), F = new Mesher(), C = new Mesher()
  F.box(0, 0, 0, w, 0.4, d, '#4f8a3d'); M.box(0, 0.4, 0, w - 4, 0.04, d - 4, '#5a9a45')
  for (let i = 0; i < 8; i++) { M.box(0, 0.42, -d / 2 + 4 + i * 14, w - 4, 0.05, 0.3, '#f3efe4') }
  const tiers = 12, run = 1.1, rise = 0.55
  for (let i = 0; i < tiers; i++) {
    const out = w / 2 + 1 + i * run, h = (i + 1) * rise
    F.box(-(out + run / 2) + 0, 0, 0, run, h, d + (i + 1) * 2 * run, i % 2 ? '#c9bfa8' : '#d9d0ba'); F.box((out + run / 2), 0, 0, run, h, d + (i + 1) * 2 * run, i % 2 ? '#c9bfa8' : '#d9d0ba')
    F.box(0, 0, -(d / 2 + 1 + i * run + run / 2), w + (i + 1) * 2 * run, h, run, i % 2 ? '#c9bfa8' : '#d9d0ba')
  }
  for (const sg of [-1, 1]) { M.box(sg * (w / 2 - 0.5), 0.4, d / 2 - 0.3, 0.3, 7, 0.3, '#f3efe4'); M.box(sg * (w / 2 - 0.5) + 0, 7.4, d / 2 - 0.3, 5, 0.2, 0.2, '#f3efe4') }
  return { solid: M.build(), floors: F.build(), collide: C.build(), bounds: { w: w + 30, d: d + 30, h: 14 } }
}
export function buildTower({ h = 26 } = {}) {
  const M = new Mesher(), C = new Mesher(), S = STYLES.neo
  M.box(0, 0, 0, 7, h, 7, '#a4503b'); M.box(0, h, 0, 7.6, 0.5, 7.6, S.trim)
  cupola(M, 0, h + 0.5, 0, S); C.box(0, 0, 0, 7, h, 7, '#fff')
  return { solid: M.build(), collide: C.build(), bounds: { w: 8, d: 8, h: h + 9 } }
}
export function buildKiosk() { // quiosco de piedra con techo (merenderito en el patio)
  const M = new Mesher(), C = new Mesher()
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) M.cyl(sx * 2.6, 0, sz * 2.6, 0.22, 3.4, 6, '#e8dec8')
  M.box(0, 0, 0, 6.2, 0.4, 6.2, '#cfc5b0'); M.cone(0, 3.4, 0, 4.8, 2.4, 8, '#5f9a86'); M.ball(0, 5.9, 0, 0.3, GOLD)
  C.box(0, 0, 0, 5, 1, 5, '#fff')
  return { solid: M.build(), collide: C.build() }
}

// ── Catálogo (lo lee el editor para armar la paleta y los campos de cada pieza) ──
const STYLE_OPTS = ['brick', 'neo', 'brut', 'modern']
const INT_OPTS = ['hall', 'classroom', 'library', 'dining', 'chapel', 'lab', 'dorm', 'cafe']
const num = (k, label, min, max, step = 1) => ({ k, label, kind: 'num', min, max, step })
const sel = (k, label, opts) => ({ k, label, kind: 'sel', opts })
const bool = (k, label) => ({ k, label, kind: 'bool' })
const text = (k, label) => ({ k, label, kind: 'text' })

export const CATALOG = {
  building: {
    label: 'Edificio', group: 'Edificios', defaults: { ...BUILDING_DEFAULTS },
    fields: [num('w', 'Ancho (m)', 8, 80), num('d', 'Fondo (m)', 8, 60), num('floors', 'Pisos', 1, 4), sel('style', 'Estilo', STYLE_OPTS), sel('roof', 'Techo', ['gable', 'hip', 'flat']), sel('interior', 'Interior', INT_OPTS), sel('tower', 'Torre', ['none', 'cupola', 'steeple']), bool('portico', 'Pórtico'), num('ivy', 'Hiedra', 0, 1, 0.1), num('door', 'Puerta (m)', 2, 6, 0.2), text('sign', 'Letrero'), num('seed', 'Semilla', 1, 99)],
  },
  tree: { label: 'Árbol', group: 'Naturaleza', instanced: true, defaults: { kind: 'elm', s: 1 }, fields: [sel('kind', 'Tipo', ['elm', 'oak', 'maple', 'gold', 'pine', 'birch']), num('s', 'Escala', 0.5, 2, 0.1)] },
  lamp: { label: 'Farola', group: 'Mobiliario', instanced: true, defaults: {}, fields: [] },
  bench: { label: 'Banca', group: 'Mobiliario', instanced: true, defaults: {}, fields: [] },
  flagpole: { label: 'Asta bandera', group: 'Mobiliario', instanced: true, defaults: {}, fields: [] },
  hedge: { label: 'Seto', group: 'Naturaleza', defaults: { len: 20 }, fields: [num('len', 'Largo (m)', 4, 80)] },
  fence: { label: 'Reja', group: 'Mobiliario', defaults: { len: 42 }, fields: [num('len', 'Largo (m)', 7, 160)] },
  gate: { label: 'Puerta monumental', group: 'Mobiliario', defaults: { w: 9, sign: '' }, fields: [num('w', 'Ancho (m)', 5, 16), text('sign', 'Letrero')] },
  fountain: { label: 'Fuente', group: 'Mobiliario', defaults: { r: 5 }, fields: [num('r', 'Radio (m)', 3, 10)] },
  statue: { label: 'Estatua', group: 'Mobiliario', defaults: { s: 1 }, fields: [num('s', 'Escala', 0.6, 2, 0.1)] },
  kiosk: { label: 'Quiosco', group: 'Mobiliario', defaults: {}, fields: [] },
  tower: { label: 'Torre del reloj', group: 'Edificios', defaults: { h: 26 }, fields: [num('h', 'Altura (m)', 12, 50)] },
  bridge: { label: 'Puente', group: 'Edificios', defaults: { len: 80, w: 8 }, fields: [num('len', 'Largo (m)', 20, 160), num('w', 'Ancho (m)', 4, 14)] },
  stadium: { label: 'Estadio', group: 'Edificios', defaults: { w: 70, d: 120 }, fields: [num('w', 'Ancho (m)', 40, 100), num('d', 'Largo (m)', 80, 180)] },
  pave: { label: 'Pavimento', group: 'Suelo', defaults: { w: 30, d: 30, mat: 'stone' }, fields: [num('w', 'Ancho (m)', 2, 200), num('d', 'Fondo (m)', 2, 200), num('r', 'Radio (círculo, 0=rect.)', 0, 60), sel('mat', 'Material', ['gravel', 'brick', 'stone', 'asphalt', 'plank'])] },
  npc: { label: 'Punto de NPC', group: 'Juego', defaults: {}, fields: [] },
  glb: { label: 'Modelo .glb', group: 'Mis modelos', defaults: { file: '', s: 1 }, fields: [num('s', 'Escala', 0.05, 40, 0.05)] },
}

Object.assign(CATALOG, HOSPITAL_CATALOG)

const cache = new Map()
const POS = new Set(['id', 'x', 'y', 'z', 'rot'])
// Clave de la geometría de una pieza: sus parámetros sin la posición/giro (misma forma = misma malla compartida).
export const pieceKey = (it, skip = POS) => JSON.stringify(Object.fromEntries(Object.entries(it).filter(([k]) => !skip.has(k))))
export function pieceFor(it) {
  const key = pieceKey(it)
  let v = cache.get(key)
  if (v) return v
  switch (it.type) {
    case 'building': v = buildBuilding(it); break
    case 'tree': v = { solid: buildTree(it.kind, it.seed || 1), collide: new Mesher().box(0, 0, 0, 0.9, 3, 0.9, '#fff').build() }; break
    case 'lamp': v = buildLamp(); break
    case 'bench': v = buildBenchProp(); break
    case 'flagpole': v = buildFlagpole(); break
    case 'hedge': v = buildHedge(it); break
    case 'fence': v = buildFence(it); break
    case 'gate': v = buildGate(it); break
    case 'fountain': v = buildFountain(it); break
    case 'statue': v = buildStatue(it); break
    case 'kiosk': v = buildKiosk(); break
    case 'tower': v = buildTower(it); break
    case 'bridge': v = buildBridge(it); break
    case 'stadium': v = buildStadium(it); break
    default: v = hospitalPiece(it) ?? null
  }
  cache.set(key, v)
  return v
}
export const clearPieceCache = () => cache.clear()
