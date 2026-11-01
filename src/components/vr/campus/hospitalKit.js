import * as THREE from 'three'
import { Mesher } from './mesher'
import { KINDS, DEPTS, FH, SLAB } from './hospitalData'
import { tr } from '../../../i18n'

// ─────────────────────────────────────────────────────────────────────────────
// Constructor de CUARTOS del hospital. A diferencia de buildBuilding (un edificio = una caja), aquí cada
// cuarto es una pieza independiente — `room` con {w, d, level, kind, door, ext, ...} — y el edificio es la
// suma de cuartos pegados (el generador scripts/campus/genHospital.mjs los acomoda, el editor los mueve).
// Pieza en metros, origen en el centro de la huella al nivel del suelo; el nivel sube `level * FH`.
// El mobiliario se arma SIEMPRE con la puerta hacia +Z y al final se gira según el lado real de la puerta.
// ─────────────────────────────────────────────────────────────────────────────

const STEEL = '#c3cbd1', WHITE = '#f3f6f7', DARK = '#3b4249', BLUE = '#7fb2d9', WOOD = '#8a6a47'
const BOOKS = ['#8c2f39', '#2f5d8a', '#c79a3b', '#3d7a52', '#6a4a8c', '#b5653a', '#d9d2c0', '#264653']
const SIDES = {
  S: { ry: 0, ang: 0 }, N: { ry: Math.PI, ang: Math.PI }, E: { ry: Math.PI / 2, ang: Math.PI / 2 }, W: { ry: -Math.PI / 2, ang: -Math.PI / 2 },
}

function frame(M, X, Y, Z, ry = 0) {
  const c = Math.cos(ry), s = Math.sin(ry), at = (lx, lz) => [X + lx * c + lz * s, Z - lx * s + lz * c]
  return {
    box: (lx, ly, lz, w, h, d, hex) => { const [x, z] = at(lx, lz); return M.box(x, Y + ly, z, w, h, d, hex, ry) },
    cyl: (lx, ly, lz, r, h, seg, hex, rt) => { const [x, z] = at(lx, lz); return M.cyl(x, Y + ly, z, r, h, seg, hex, rt) },
    ball: (lx, ly, lz, r, hex, sy) => { const [x, z] = at(lx, lz); return M.ball(x, Y + ly, z, r, hex, sy) },
  }
}
function subRect(r, h) {
  const [x0, x1, z0, z1] = r, [a0, a1, b0, b1] = h
  if (a1 <= x0 || a0 >= x1 || b1 <= z0 || b0 >= z1) return [r]
  const out = [], m0 = Math.max(x0, a0), m1 = Math.min(x1, a1)
  if (a0 > x0) out.push([x0, a0, z0, z1])
  if (a1 < x1) out.push([a1, x1, z0, z1])
  if (b0 > z0) out.push([m0, m1, z0, b0])
  if (b1 < z1) out.push([m0, m1, b1, z1])
  return out
}

// ── Equipo médico y mobiliario (todo con la puerta hacia +Z) ────────────────
class Eq {
  constructor(M, C, E, G, F, lights, yf, R) { Object.assign(this, { M, C, E, G, F, lights, yf, R }) }
  f(x, z, ry = 0) { return frame(this.M, x, this.yf, z, ry) }
  block(x, z, w, h, d, ry = 0) { this.C.box(x, this.yf, z, w, h, d, '#fff', ry) }
  bed(x, z, ry = 0, sheet = BLUE) {
    const f = this.f(x, z, ry)
    f.box(0, 0.15, 0, 0.9, 0.25, 2.0, STEEL); f.box(0, 0.4, 0.05, 0.85, 0.18, 1.9, WHITE); f.box(0, 0.58, 0.45, 0.86, 0.07, 1.0, sheet)
    f.box(0, 0.58, -0.78, 0.5, 0.1, 0.3, WHITE); f.box(0, 0.1, -1.03, 0.92, 1.0, 0.08, '#9aa7b0')
    for (const sx of [-1, 1]) { f.box(sx * 0.46, 0.55, 0.1, 0.04, 0.35, 1.3, STEEL); f.cyl(sx * 0.4, 0, 0.85, 0.07, 0.15, 6, DARK); f.cyl(sx * 0.4, 0, -0.85, 0.07, 0.15, 6, DARK) }
    this.block(x, z, 1, 0.9, 2.1, ry)
  }
  monitor(x, z, ry = 0, y = 1.5) {
    const f = this.f(x, z, ry)
    f.cyl(0, 0, 0, 0.18, 0.05, 6, DARK); f.cyl(0, 0, 0, 0.04, y, 5, STEEL); f.box(0, y, 0, 0.55, 0.38, 0.07, DARK)
    const e = frame(this.E, x, this.yf, z, ry)
    e.box(0, y + 0.04, 0.045, 0.47, 0.3, 0.02, '#16384a'); e.box(0, y + 0.19, 0.06, 0.42, 0.03, 0.01, '#33e36f'); e.box(0, y + 0.13, 0.06, 0.3, 0.02, 0.01, '#ff4d5a'); e.box(0, y + 0.08, 0.06, 0.38, 0.02, 0.01, '#4dc3ff')
  }
  ivPole(x, z) { this.M.cyl(x, this.yf, z, 0.2, 0.05, 6, STEEL); this.M.cyl(x, this.yf, z, 0.03, 2.0, 5, STEEL); this.M.box(x, this.yf + 1.55, z, 0.18, 0.3, 0.06, '#e6f6ff'); this.G.box(x, this.yf + 1.55, z, 0.2, 0.32, 0.08, '#bfe9ff') }
  vent(x, z, ry = 0) {
    const f = this.f(x, z, ry)
    f.box(0, 0.1, 0, 0.5, 0.9, 0.5, '#aab4bb'); f.box(0, 1.0, 0, 0.55, 0.4, 0.4, DARK)
    frame(this.E, x, this.yf, z, ry).box(0, 1.05, 0.21, 0.45, 0.3, 0.02, '#4dc3ff'); this.block(x, z, 0.55, 1.4, 0.55, ry)
  }
  desk(x, z, ry = 0, chair = true) {
    const f = this.f(x, z, ry)
    f.box(0, 0.72, 0, 1.4, 0.06, 0.7, '#c9a87c'); f.box(-0.65, 0, 0, 0.06, 0.72, 0.65, '#b08a5c'); f.box(0.65, 0, 0, 0.06, 0.72, 0.65, '#b08a5c')
    f.box(0, 0.78, -0.1, 0.5, 0.32, 0.04, DARK); frame(this.E, x, this.yf, z, ry).box(0, 0.8, -0.075, 0.44, 0.26, 0.01, '#7fd6ff'); f.box(0, 0.78, 0.15, 0.4, 0.02, 0.15, DARK)
    if (chair) { f.box(0, 0.4, 0.75, 0.5, 0.06, 0.5, '#4b5560'); f.box(0, 0.45, 1.0, 0.5, 0.55, 0.06, '#4b5560'); f.cyl(0, 0, 0.75, 0.05, 0.4, 5, STEEL) }
    this.block(x, z, 1.5, 0.9, 0.8, ry)
  }
  counter(x, z, len, ry = 0, hex = '#e8edf0', top = '#7a8b99') {
    const f = this.f(x, z, ry)
    f.box(0, 0, 0, len, 1.05, 0.7, hex); f.box(0, 1.05, 0.05, len + 0.1, 0.07, 0.85, top)
    this.block(x, z, len, 1.1, 0.8, ry)
  }
  chair(x, z, ry = 0, hex = '#4a8fc2') { const f = this.f(x, z, ry); f.box(0, 0.42, 0, 0.45, 0.06, 0.45, hex); f.box(0, 0.45, -0.2, 0.45, 0.45, 0.05, hex); f.box(-0.18, 0, -0.18, 0.05, 0.42, 0.05, STEEL); f.box(0.18, 0, 0.18, 0.05, 0.42, 0.05, STEEL) }
  chairRow(x, z, n, ry = 0, hex) { for (let i = 0; i < n; i++) { const o = (i - (n - 1) / 2) * 0.55, c = Math.cos(ry), s = Math.sin(ry); this.chair(x + o * c, z - o * s, ry, hex) } }
  cabinet(x, z, len, ry = 0, h = 1.9, hex = '#dfe6ea') { const f = this.f(x, z, ry); f.box(0, 0, 0, len, h, 0.5, hex); f.box(0, 0.9, 0.26, len - 0.1, 0.03, 0.02, STEEL); this.block(x, z, len, h, 0.55, ry) }
  curtain(x, z, len, ry = 0, hex = '#bfe3d6') { this.f(x, z, ry).box(0, 0.35, 0, len, 1.85, 0.04, hex) }
  sink(x, z, ry = 0) { const f = this.f(x, z, ry); f.box(0, 0, 0, 0.7, 0.85, 0.5, '#e8edf0'); f.box(0, 0.85, 0, 0.6, 0.06, 0.45, STEEL); f.cyl(0, 0.9, -0.15, 0.025, 0.28, 5, STEEL); this.block(x, z, 0.7, 0.9, 0.5, ry) }
  toilet(x, z, ry = 0) { const f = this.f(x, z, ry); f.box(0, 0, 0, 0.4, 0.4, 0.55, WHITE); f.box(0, 0.4, -0.2, 0.4, 0.4, 0.15, WHITE) }
  wall(x, z, w, h, d, hex, ry = 0, block = true) { this.M.box(x, this.yf, z, w, h, d, hex, ry); if (block) this.block(x, z, w, h, d, ry) }
  panel(x, y, z, w, h, hex, ry = 0) { frame(this.E, x, this.yf, z, ry).box(0, y, 0, w, h, 0.03, hex) } // pantalla/lámpara emisiva
  shelf(x, z, len, ry = 0, h = 2.2) {
    const f = this.f(x, z, ry), R = this.R
    f.box(0, 0, 0, len, h, 0.45, '#8a6a47')
    for (let r = 0; r < Math.floor(h / 0.55); r++) { let u = -len / 2 + 0.1; while (u < len / 2 - 0.2) { const bw = 0.12 + R() * 0.2; f.box(u + bw / 2, 0.15 + r * 0.55, 0.06, bw * 0.9, 0.38, 0.32, BOOKS[Math.floor(R() * 8)]); u += bw } }
    this.block(x, z, len, h, 0.5, ry)
  }
  table(x, z, len, wid, ry = 0, hex = '#c9a87c', h = 0.76) {
    const f = this.f(x, z, ry); f.box(0, h, 0, len, 0.07, wid, hex)
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) f.box(sx * (len / 2 - 0.1), 0, sz * (wid / 2 - 0.1), 0.08, h, 0.08, STEEL)
    this.block(x, z, len, h + 0.1, wid, ry)
  }
  crashCart(x, z, ry = 0) {
    const f = this.f(x, z, ry); f.box(0, 0.12, 0, 0.7, 0.9, 0.55, '#d63b3b'); for (let i = 0; i < 4; i++) f.box(0, 0.2 + i * 0.2, 0.28, 0.6, 0.015, 0.01, '#fff'); f.box(0, 1.02, 0, 0.45, 0.2, 0.35, '#2d3640')
    frame(this.E, x, this.yf, z, ry).box(0, 1.1, 0.18, 0.2, 0.1, 0.02, '#ffcf4a'); this.block(x, z, 0.7, 1.2, 0.55, ry)
  }
  gurney(x, z, ry = 0) { const f = this.f(x, z, ry); f.box(0, 0.4, 0, 0.75, 0.1, 1.9, STEEL); f.box(0, 0.5, 0, 0.7, 0.12, 1.85, '#7fd0b8'); for (const sx of [-1, 1]) for (const sz of [-1, 1]) f.cyl(sx * 0.3, 0, sz * 0.8, 0.08, 0.4, 6, DARK) }
  wheelchair(x, z, ry = 0) { const f = this.f(x, z, ry); f.box(0, 0.45, 0, 0.45, 0.06, 0.45, '#334'); f.box(0, 0.5, -0.22, 0.45, 0.5, 0.05, '#334'); for (const sx of [-1, 1]) f.cyl(sx * 0.3, 0.05, 0.05, 0.28, 0.05, 10, DARK) }
  plant(x, z) { this.M.cyl(x, this.yf, z, 0.28, 0.4, 7, '#b5653a', 0.2); this.M.ball(x, this.yf + 0.85, z, 0.45, '#3f7a45', 1.2) }
  opLight(x, z) { this.M.cyl(x, this.yf + 3.2, z, 0.04, FH - SLAB - 3.2, 4, STEEL); this.M.cyl(x, this.yf + 2.9, z, 0.55, 0.14, 10, '#e9eef1', 0.5); this.E.cyl(x, this.yf + 2.84, z, 0.45, 0.05, 10, '#fffbe6'); this.lights.push([x, this.yf + 2.6, z]) }
  opTable(x, z, ry = 0) { const f = this.f(x, z, ry); f.cyl(0, 0, 0, 0.3, 0.8, 7, STEEL); f.box(0, 0.8, 0, 0.6, 0.1, 2.0, '#d4dce1'); f.box(0, 0.9, 0, 0.55, 0.05, 1.9, '#4aa3a0'); this.block(x, z, 0.8, 1, 2.1, ry) }
  anesthesia(x, z, ry = 0) { const f = this.f(x, z, ry); f.box(0, 0.1, 0, 0.7, 1.0, 0.6, '#cfd8dc'); f.box(0, 1.1, 0, 0.75, 0.5, 0.5, DARK); frame(this.E, x, this.yf, z, ry).box(0, 1.2, 0.26, 0.6, 0.3, 0.02, '#4dc3ff'); f.cyl(0.2, 1.6, 0, 0.04, 0.5, 5, STEEL); this.block(x, z, 0.8, 1.7, 0.7, ry) }
  instr(x, z, ry = 0) { const f = this.f(x, z, ry); f.box(0, 0.8, 0, 1.2, 0.05, 0.7, STEEL); f.box(-0.55, 0, 0, 0.05, 0.8, 0.65, STEEL); f.box(0.55, 0, 0, 0.05, 0.8, 0.65, STEEL); for (let i = 0; i < 6; i++) f.box(-0.45 + i * 0.18, 0.85, (i % 2) * 0.15 - 0.1, 0.03, 0.02, 0.22, '#e8f0f5'); this.block(x, z, 1.2, 0.9, 0.7, ry) }
  mri(x, z, ry = 0) {
    const f = this.f(x, z, ry)
    f.box(0, 0, 0, 2.4, 2.3, 2.0, '#eef2f4'); f.box(0, 0, 1.05, 2.3, 0.1, 0.1, '#d7dde1')
    f.box(-0.8, 0.5, 1.02, 0.18, 1.3, 0.12, '#dfe5e9'); f.box(0.8, 0.5, 1.02, 0.18, 1.3, 0.12, '#dfe5e9'); f.box(0, 1.7, 1.02, 1.8, 0.2, 0.12, '#dfe5e9'); f.box(0, 0.4, 1.02, 1.8, 0.2, 0.12, '#dfe5e9')
    f.box(0, 0.55, 0.9, 1.4, 0.04, 0.04, '#9fe6ff'); frame(this.E, x, this.yf, z, ry).box(0, 1.9, 1.05, 0.5, 0.12, 0.02, '#9fe6ff')
    f.box(0, 0.7, 1.3, 0.55, 0.12, 2.6, '#cfd6da'); f.box(0, 0.82, 1.3, 0.5, 0.04, 2.5, '#5aa0c4'); f.cyl(0, 0, 2.2, 0.25, 0.7, 6, STEEL)
    this.block(x, z, 2.5, 2.4, 3.4, ry)
  }
  ct(x, z, ry = 0) {
    const f = this.f(x, z, ry), g = new THREE.TorusGeometry(0.95, 0.42, 6, 14)
    this.M.add(g, '#eef2f4', x, this.yf + 1.15, z, ry); f.box(0, 0, -0.3, 0.8, 0.25, 0.8, '#cfd6da'); f.box(-1.2, 0, -0.3, 0.4, 2.1, 0.9, '#e3e8eb'); f.box(1.2, 0, -0.3, 0.4, 2.1, 0.9, '#e3e8eb')
    f.box(0, 0.75, 0.9, 0.55, 0.1, 2.6, '#cfd6da'); f.box(0, 0.85, 0.9, 0.5, 0.04, 2.5, '#5aa0c4'); f.cyl(0, 0, 2.0, 0.25, 0.75, 6, STEEL); this.block(x, z, 2.6, 2.3, 3.4, ry)
  }
  xray(x, z, ry = 0) {
    const f = this.f(x, z, ry)
    f.box(0, 0.6, 0, 0.7, 0.12, 2.0, '#cfd6da'); f.box(0, 0.72, 0, 0.65, 0.04, 1.9, '#5aa0c4'); f.cyl(0, 0, 0, 0.25, 0.6, 6, STEEL)
    f.box(0.9, 0, -0.4, 0.14, 3.2, 0.14, STEEL); f.box(0.45, 3.1, -0.4, 1.0, 0.14, 0.14, STEEL); f.box(0, 2.45, -0.3, 0.55, 0.65, 0.5, '#e9eef1'); frame(this.E, x, this.yf, z, ry).box(0, 2.6, -0.04, 0.2, 0.15, 0.02, '#ffd24a')
    f.box(-1.5, 0, -0.7, 0.5, 1.8, 0.12, '#bfc7cc'); this.block(x, z, 1, 1, 2.1, ry)
  }
  us(x, z, ry = 0) { const f = this.f(x, z, ry); f.box(0, 0.1, 0, 0.55, 0.95, 0.7, '#dde3e7'); f.box(0, 1.05, 0, 0.7, 0.45, 0.1, DARK); f.cyl(0.25, 0.95, 0.3, 0.03, 0.2, 4, STEEL); frame(this.E, x, this.yf, z, ry).box(0, 1.1, 0.06, 0.6, 0.34, 0.02, '#9fe6ff'); this.block(x, z, 0.6, 1.5, 0.8, ry) }
  incubator(x, z, ry = 0) {
    const f = this.f(x, z, ry), g = frame(this.G, x, this.yf, z, ry)
    f.box(0, 0, 0, 0.9, 0.8, 0.6, '#dde3e7'); f.box(0, 0.8, 0, 0.82, 0.08, 0.55, '#fde0ee'); g.box(0, 0.88, 0, 0.82, 0.35, 0.55, '#bfe9ff'); f.cyl(0.35, 0, 0.3, 0.08, 0.05, 5, DARK)
    f.ball(0, 0.98, 0, 0.12, '#f5c9a0'); this.block(x, z, 0.9, 1.2, 0.65, ry)
  }
  analyzer(x, z, ry = 0) { const f = this.f(x, z, ry); f.box(0, 0.88, 0, 0.7, 0.55, 0.55, '#e3e8eb'); f.box(0, 1.2, 0.2, 0.3, 0.2, 0.02, DARK); frame(this.E, x, this.yf, z, ry).box(0, 1.22, 0.285, 0.26, 0.16, 0.01, '#7fffd4'); f.box(0.25, 0.9, 0.28, 0.12, 0.08, 0.02, '#e5484d') }
  bench(x, z, len, ry = 0) { this.table(x, z, len, 0.8, ry, '#d8dde0', 0.9); for (let i = 0; i < Math.floor(len / 1.1); i++) this.analyzer(x - len / 2 + 0.7 + i * 1.1, z, 0) }
  fridge(x, z, ry = 0, hex = '#e3e8eb') { const f = this.f(x, z, ry); f.box(0, 0, 0, 0.8, 2.0, 0.7, hex); f.box(0.3, 0.9, 0.36, 0.03, 0.5, 0.03, STEEL); frame(this.E, x, this.yf, z, ry).box(0, 1.7, 0.36, 0.3, 0.08, 0.01, '#7fffd4'); this.block(x, z, 0.8, 2, 0.7, ry) }
  autoclave(x, z, ry = 0) { const f = this.f(x, z, ry); f.box(0, 0, 0, 1.3, 1.9, 1.5, '#c7ced3'); f.cyl(0, 0.35, 0.78, 0.5, 0.1, 12, '#dfe5e9'); f.cyl(0, 0.35, 0.78, 0.12, 0.14, 8, DARK); frame(this.E, x, this.yf, z, ry).box(0.5, 1.6, 0.76, 0.2, 0.14, 0.02, '#ffcf4a'); this.block(x, z, 1.3, 1.9, 1.5, ry) }
  dissect(x, z, ry = 0) { const f = this.f(x, z, ry); f.box(0, 0.8, 0, 0.8, 0.07, 2.1, '#d4dce1'); f.box(0, 0.87, 0, 0.7, 0.02, 2.0, '#aeb9c0'); f.box(-0.3, 0, 0, 0.08, 0.8, 1.9, STEEL); f.box(0.3, 0, 0, 0.08, 0.8, 1.9, STEEL); f.box(0, 0.88, 0, 0.45, 0.2, 1.6, '#cfe6e0'); f.ball(0, 1.12, -0.7, 0.14, '#e9d3b5'); this.block(x, z, 0.9, 1, 2.2, ry) }
  skeleton(x, z, ry = 0) {
    const f = this.f(x, z, ry), b = '#efe8d6'
    f.cyl(0, 0, 0, 0.25, 0.04, 6, DARK); f.cyl(0, 0, 0, 0.03, 1.8, 4, STEEL)
    f.cyl(0, 0.95, 0, 0.04, 0.6, 4, b); for (let i = 0; i < 4; i++) f.ball(0, 1.55 - i * 0.12, 0, 0.17 - i * 0.02, b, 0.4)
    f.ball(0, 1.82, 0, 0.12, b); f.box(0, 0.8, 0, 0.3, 0.14, 0.14, b); f.box(-0.12, 0.2, 0, 0.05, 0.6, 0.05, b); f.box(0.12, 0.2, 0, 0.05, 0.6, 0.05, b); f.box(-0.22, 1.0, 0, 0.04, 0.55, 0.04, b); f.box(0.22, 1.0, 0, 0.04, 0.55, 0.04, b)
    this.block(x, z, 0.5, 2, 0.5, ry)
  }
  manikin(x, z, ry = 0) { this.bed(x, z, ry, '#9fc5e8'); const f = this.f(x, z, ry); f.box(0, 0.7, 0.1, 0.4, 0.2, 0.9, '#f1d3b3'); f.ball(0, 0.85, -0.8, 0.13, '#f1d3b3'); f.box(-0.3, 0.7, 0.1, 0.1, 0.1, 0.8, '#f1d3b3'); f.box(0.3, 0.7, 0.1, 0.1, 0.1, 0.8, '#f1d3b3') }
  genny(x, z, ry = 0) { const f = this.f(x, z, ry); f.box(0, 0, 0, 3.0, 1.8, 1.4, '#f2c230'); f.box(-0.8, 1.8, 0, 0.5, 1.2, 0.5, DARK); f.cyl(0.9, 1.8, 0, 0.15, 1.6, 6, STEEL); f.box(0, 0.9, 0.72, 2.6, 0.5, 0.04, DARK); this.block(x, z, 3.0, 2, 1.4, ry) }
  tank(x, z, r = 0.8, h = 2.6, hex = '#a9b4bb') { this.M.cyl(x, this.yf, z, r, h, 10, hex); this.M.ball(x, this.yf + h, z, r * 0.98, hex, 0.45); this.C.box(x, this.yf, z, r * 2, h, r * 2, '#fff') }
  gasCyl(x, z, hex) { this.M.cyl(x, this.yf, z, 0.14, 1.3, 7, hex); this.M.ball(x, this.yf + 1.3, z, 0.14, hex, 0.8); this.C.box(x, this.yf, z, 0.3, 1.4, 0.3, '#fff') }
  washer(x, z, ry = 0) { const f = this.f(x, z, ry); f.box(0, 0, 0, 1.1, 1.3, 1.0, '#e6ebee'); f.cyl(0, 0.55, 0.52, 0.34, 0.06, 10, DARK); this.block(x, z, 1.1, 1.3, 1.0, ry) }
  stove(x, z, ry = 0) { const f = this.f(x, z, ry); f.box(0, 0, 0, 1.6, 0.95, 0.9, '#c7ced3'); for (let i = 0; i < 4; i++) f.cyl(-0.5 + (i % 2) * 1.0, 0.95, -0.2 + (i >> 1) * 0.4, 0.14, 0.03, 8, '#ff7a2a'); this.block(x, z, 1.6, 1, 0.9, ry) }
  drawers(x, z, len, ry = 0) { const f = this.f(x, z, ry); f.box(0, 0, 0, len, 2.2, 0.8, '#c3cbd1'); for (let i = 0; i < Math.floor(len / 0.8); i++) for (let r = 0; r < 3; r++) { f.box(-len / 2 + 0.4 + i * 0.8, 0.3 + r * 0.7, 0.41, 0.7, 0.6, 0.02, '#d7dde1'); f.box(-len / 2 + 0.4 + i * 0.8, 0.55 + r * 0.7, 0.43, 0.2, 0.04, 0.03, DARK) } this.block(x, z, len, 2.2, 0.8, ry) }
  chairLounge(x, z, ry = 0) { const f = this.f(x, z, ry); f.box(0, 0.3, 0, 0.8, 0.25, 0.9, '#6a5a8c'); f.box(0, 0.5, -0.4, 0.8, 0.7, 0.18, '#6a5a8c'); f.box(-0.45, 0.3, 0, 0.1, 0.4, 0.9, '#6a5a8c'); f.box(0.45, 0.3, 0, 0.1, 0.4, 0.9, '#6a5a8c'); this.block(x, z, 1, 1, 1, ry) }
  statueHeart(x, z) { // Sagrado Corazón
    const M = this.M, y = this.yf
    M.box(x, y, z, 1.6, 0.9, 1.2, '#cfc6b0'); M.cyl(x, y + 0.9, z, 0.5, 1.5, 8, '#f3efe6', 0.34); M.ball(x, y + 2.5, z, 0.24, '#f0d9bd'); M.box(x - 0.55, y + 1.5, z + 0.1, 0.12, 0.8, 0.12, '#f3efe6'); M.box(x + 0.55, y + 1.5, z + 0.1, 0.12, 0.8, 0.12, '#f3efe6')
    this.E.ball(x, y + 1.75, z + 0.32, 0.18, '#ff3b4a'); for (let i = 0; i < 8; i++) { const a = (i / 8) * 6.283; this.E.box(x + Math.cos(a) * 0.9, y + 2.0 + Math.sin(a) * 0.9, z + 0.4, 0.04, 0.3, 0.02, '#ffd98a') }
    this.C.box(x, y, z, 1.6, 2.6, 1.2, '#fff')
  }
  tiers(w, d, rows, rise = 0.32, run = 0.95) { // anfiteatro: gradas caminables hacia el fondo (-z)
    for (let r = 0; r < rows; r++) {
      const z = d / 2 - 4.2 - r * run - run / 2
      this.F.box(0, this.yf, z, w - 0.6, (r + 1) * rise, run, r % 2 ? '#a58a63' : '#b59a73')
      for (let i = 0; i < Math.floor((w - 3) / 0.6); i++) { const x = -(w - 3) / 2 + 0.3 + i * 0.6; this.M.box(x, this.yf + (r + 1) * rise, z - 0.1, 0.45, 0.45, 0.12, '#b53b3b'); this.M.box(x, this.yf + (r + 1) * rise, z + 0.15, 0.45, 0.06, 0.4, '#b53b3b') }
    }
  }
}

// ── Mobiliario por tipo de área (puerta hacia +Z; w = ancho, d = fondo del lienzo ya girado) ──
const grid = (n, w, pad = 1.2) => Array.from({ length: n }, (_, i) => -w / 2 + pad + (w - 2 * pad) * (n === 1 ? 0.5 : i / (n - 1)))
const FUR = {
  reception: (e, w, d) => { e.counter(0, -d / 2 + 3.2, Math.min(10, w - 3), 0); for (const x of [-3, 0, 3]) e.desk(x, -d / 2 + 2.2, Math.PI, false); e.chairRow(0, 1.5, 6, Math.PI); e.panel(0, 2.6, -d / 2 + 0.35, 4, 0.6, '#7fd6ff') },
  office: (e, w, d) => { grid(Math.max(2, Math.floor(w / 4)), w).forEach((x) => { e.desk(x, -d / 2 + 2, 0); }); e.cabinet(w / 2 - 0.5, 0, 3, -Math.PI / 2); e.plant(-w / 2 + 1, d / 2 - 1.3) },
  director: (e, w, d) => { e.desk(0, -d / 2 + 2.4, 0); e.table(0, 1.5, 3, 1.2, 0, '#8a6a47'); e.chairRow(0, 2.8, 4, Math.PI); e.shelf(-w / 2 + 0.4, 0, 5, Math.PI / 2); e.plant(w / 2 - 1, d / 2 - 1.3) },
  security: (e, w, d) => { for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) e.panel(-3 + i * 3, 1.6 + j * 0.75, -d / 2 + 0.4, 2.6, 0.65, i === 1 ? '#7fd6ff' : '#9aff9a'); e.desk(-2, -d / 2 + 3, 0); e.desk(2, -d / 2 + 3, 0) },
  waiting: (e, w, d) => { for (const z of [-d / 4, d / 4 - 1]) e.chairRow(-w / 4, z, Math.min(6, Math.floor(w / 3)), 0); e.chairRow(w / 4, -d / 4, 5, 0); e.table(0, 0, 1.4, 0.7, 0, '#d9c6a2', 0.45); e.plant(w / 2 - 1, -d / 2 + 1) },
  triage: (e, w, d) => { e.desk(-w / 4, -d / 2 + 2, 0); e.bed(w / 4, -d / 2 + 2.2, 0); e.monitor(w / 4 + 1, -d / 2 + 1.5); e.wheelchair(-w / 4, 0.5, 0); e.chairRow(0, 3, 3, Math.PI) },
  resus: (e, w, d) => { for (const x of [-w / 4, w / 4]) { e.bed(x, -d / 2 + 2.6, 0, '#e8c6c6'); e.monitor(x + 1.2, -d / 2 + 1.7); e.vent(x - 1.2, -d / 2 + 1.7); e.opLight(x, -d / 2 + 3.4); e.crashCart(x, 1.8, Math.PI) } },
  trauma: (e, w, d) => FUR.resus(e, w, d),
  erbay: (e, w, d) => { const n = Math.max(2, Math.floor(w / 3.4)); grid(n, w, 1.9).forEach((x) => { e.bed(x, -d / 2 + 2.6, 0); e.monitor(x + 1.0, -d / 2 + 1.7); e.curtain(x + 1.7, -d / 2 + 3.6, 3.6, Math.PI / 2); e.ivPole(x - 0.9, -d / 2 + 1.5) }); e.counter(0, 3.5, w - 4, 0) },
  observ: (e, w, d) => { grid(Math.floor(w / 3), w, 1.8).forEach((x) => { e.bed(x, -d / 2 + 2.6, 0); e.monitor(x + 1.0, -d / 2 + 1.7) }); e.counter(0, 3.5, 6, 0) },
  cast: (e, w, d) => { e.bed(-w / 4, -d / 2 + 2.4, 0, '#f1ead8'); e.table(w / 4, -d / 2 + 2, 1.8, 0.8, 0, '#d8dde0', 0.9); e.cabinet(w / 2 - 0.4, 1, 4, -Math.PI / 2); e.sink(-w / 2 + 1, d / 2 - 1.2, Math.PI) },
  peds_er: (e, w, d) => { grid(Math.max(2, Math.floor(w / 4)), w, 2).forEach((x) => { e.bed(x, -d / 2 + 2.4, 0, '#ffd37a'); e.monitor(x + 1.0, -d / 2 + 1.6) }); e.chairRow(0, 3.5, 4, Math.PI, '#ffb347') },
  decon: (e, w, d) => { for (const x of [-2, 2]) { e.M.box(x, e.yf, -d / 2 + 1.5, 1.4, 2.4, 1.4, '#d0e6ee'); e.G.box(x, e.yf + 0.1, -d / 2 + 2.25, 1.4, 2.2, 0.05, '#bfe9ff'); e.M.cyl(x, e.yf + 2.3, -d / 2 + 1.5, 0.18, 0.06, 8, STEEL) } e.sink(w / 2 - 1, 1, -Math.PI / 2) },
  consult: (e, w, d) => { e.desk(-w / 4, -d / 2 + 2.2, 0); e.chair(-w / 4 + 1.2, -d / 2 + 3.6, Math.PI); e.bed(w / 4, -d / 2 + 2.4, 0, '#cfe0f5'); e.sink(w / 2 - 1.1, d / 2 - 1.5, Math.PI); e.cabinet(-w / 2 + 0.4, 1.5, 3, Math.PI / 2); e.plant(-w / 2 + 1, d / 2 - 1.2) },
  ecg: (e, w, d) => { e.bed(-w / 4, -d / 2 + 2.4, 0, '#cfe0f5'); e.desk(w / 4, -d / 2 + 2.2, 0); e.f(0, 0.5, 0).box(0, 0, 0, 1.0, 0.25, 2.2, '#2f3a44'); e.f(0, 0.5, 0).box(0, 0.25, -0.9, 0.9, 0.9, 0.3, DARK); e.monitor(2.2, 0.2) },
  xray: (e, w, d) => { e.xray(0, -1.2, 0); e.wall(-w / 2 + 2.2, d / 2 - 1.6, 3.2, 2.2, 0.4, '#7f8d94'); e.G.box(-w / 2 + 2.2, e.yf + 0.9, d / 2 - 1.6, 1.4, 1.1, 0.06, '#9fd6c0'); e.desk(-w / 2 + 2.2, d / 2 - 2.6, 0); e.panel(0, 2.3, -d / 2 + 0.4, 0.8, 0.5, '#ff6a6a') },
  ct: (e, w, d) => { e.ct(0, -d / 2 + 4.2, 0); e.wall(-w / 2 + 2.4, d / 2 - 1.8, 3.6, 2.2, 0.4, '#7f8d94'); e.G.box(-w / 2 + 2.4, e.yf + 0.9, d / 2 - 1.8, 1.8, 1.1, 0.06, '#9fd6c0'); e.desk(-w / 2 + 2.4, d / 2 - 2.8, 0); e.panel(0, 2.6, -d / 2 + 0.4, 1.4, 0.2, '#ffd24a') },
  nuclear: (e, w, d) => FUR.ct(e, w, d),
  mri: (e, w, d) => { e.mri(0, -d / 2 + 3.0, 0); e.wall(-w / 2 + 2.4, d / 2 - 1.8, 3.6, 2.2, 0.4, '#7f8d94'); e.G.box(-w / 2 + 2.4, e.yf + 0.9, d / 2 - 1.8, 1.8, 1.1, 0.06, '#9fd6c0'); e.desk(-w / 2 + 2.4, d / 2 - 2.8, 0); e.panel(0, 2.7, d / 2 - 0.45, 2.4, 0.4, '#ff4d5a') },
  us: (e, w, d) => { e.bed(-w / 4, -d / 2 + 2.4, 0, '#cfe0f5'); e.us(-w / 4 + 1.3, -d / 2 + 2.6, -0.3); e.desk(w / 4, -d / 2 + 2.2, 0); e.chairRow(w / 4, 2.5, 3, Math.PI) },
  cath: (e) => { e.opTable(0, -0.5, 0); e.f(0, 0, 0).box(0.9, 0, -2.0, 0.3, 2.6, 0.3, STEEL); e.f(0, 0, 0).box(0.35, 2.6, -2.0, 1.1, 0.25, 0.25, '#e9eef1'); e.monitor(-2.2, -1.2, 0.4, 1.9); e.monitor(-3.0, -1.2, 0.4, 1.9); e.opLight(0, -0.4); e.crashCart(2.8, 1.6, Math.PI) },
  endo: (e, w, d) => { e.bed(-w / 4, -d / 2 + 2.4, 0); e.f(w / 4, -d / 2 + 2, 0).box(0, 0, 0, 0.8, 1.5, 0.6, '#dde3e7'); e.monitor(w / 4, -d / 2 + 2.9, 0, 1.7); e.cabinet(w / 2 - 0.4, 1, 3, -Math.PI / 2) },
  lab: (e, w, d) => { for (const z of [-d / 4, d / 12]) e.bench(0, z, w - 6, 0); e.fridge(-w / 2 + 0.8, d / 2 - 1.5, Math.PI); e.fridge(-w / 2 + 1.8, d / 2 - 1.5, Math.PI); e.desk(w / 2 - 2, d / 2 - 1.6, Math.PI, false); e.cabinet(w / 2 - 0.4, -2, 4, -Math.PI / 2) },
  blood: (e, w, d) => { for (let i = 0; i < 4; i++) e.fridge(-w / 2 + 1 + i * 1.0, -d / 2 + 0.8, 0, '#f0c9cd'); e.bench(w / 6, -d / 6, w / 2, 0); e.bed(w / 4, d / 4, Math.PI / 2, '#f4b4b9'); e.chairLounge(0, d / 4, Math.PI) },
  path: (e, w, d) => { e.bench(0, -d / 4, w - 6, 0); e.table(0, d / 6, 3, 1.1, 0, '#d8dde0', 0.9); e.f(-w / 2 + 1, 0, 0).box(0, 0, -0.7, 0.9, 1.4, 1.2, '#dfe5e9'); e.fridge(w / 2 - 1.2, d / 2 - 1.2, Math.PI) },
  morgue: (e, w, d) => { e.drawers(0, -d / 2 + 0.6, w - 4, 0); e.dissect(-w / 4, 0, 0); e.dissect(w / 4, 0, 0); e.sink(w / 2 - 1.2, d / 2 - 1.2, Math.PI) },
  or: (e, w, d) => { e.opTable(0, -0.6, 0); e.opLight(0, -0.4); e.opLight(0, 1.4); e.anesthesia(0, -2.7, 0); e.monitor(-1.8, -2.4, 0.3, 1.9); e.instr(2.0, -0.2, 0); e.instr(-2.0, 0.8, 0); e.cabinet(w / 2 - 0.4, 0, 4, -Math.PI / 2); e.cabinet(-w / 2 + 0.4, -2, 4, Math.PI / 2); e.panel(-w / 2 + 0.2, 1.7, d / 2 - 2.2, 0.02, 0.5, '#bfe9ff') },
  scrub: (e, w, d) => { for (const x of grid(Math.max(2, Math.floor(w / 3)), w, 1.5)) { e.M.box(x, e.yf, -d / 2 + 0.7, 2.4, 0.9, 0.7, STEEL); e.M.cyl(x - 0.5, e.yf + 0.9, -d / 2 + 0.55, 0.03, 0.35, 5, STEEL); e.M.cyl(x + 0.5, e.yf + 0.9, -d / 2 + 0.55, 0.03, 0.35, 5, STEEL); e.C.box(x, e.yf, -d / 2 + 0.7, 2.4, 1, 0.7, '#fff') } },
  cssd: (e, w, d) => { for (let i = 0; i < 3; i++) e.autoclave(-w / 4 + i * 2.2 - 1.5, -d / 2 + 1.2, 0); e.table(w / 4, -d / 4, 3, 1, 0, '#d8dde0', 0.9); e.table(w / 4, d / 6, 3, 1, 0, '#d8dde0', 0.9); e.cabinet(w / 2 - 0.4, 0, 6, -Math.PI / 2); e.cabinet(-w / 2 + 0.4, 0, 6, Math.PI / 2) },
  pacu: (e, w, d) => { grid(Math.max(3, Math.floor(w / 3.4)), w, 1.8).forEach((x) => { e.bed(x, -d / 2 + 2.6, 0, '#cfe9d6'); e.monitor(x + 1.0, -d / 2 + 1.7); e.curtain(x + 1.7, -d / 2 + 3.6, 3.6, Math.PI / 2, '#d4efdc') }); e.counter(0, 3.6, w / 2, 0) },
  ambsurg: (e, w, d) => FUR.pacu(e, w, d),
  icu: (e, w, d) => { const n = Math.max(2, Math.floor(w / 4)); grid(n, w, 2).forEach((x) => { e.bed(x, -d / 2 + 2.8, 0, '#f4d9c4'); e.monitor(x + 1.2, -d / 2 + 1.7); e.vent(x - 1.3, -d / 2 + 1.8); e.ivPole(x + 0.9, -d / 2 + 3.4); e.f(x, -d / 2 + 0.2, 0).box(0, 2.2, 0, 1.4, 0.15, 0.2, STEEL); e.G.box(x + 1.95, e.yf, -d / 2 + 2.8, 0.06, 2.4, 3.2, '#bfe9ff') }); e.counter(0, 4, Math.min(8, w - 4), 0); e.crashCart(w / 2 - 1, 5.2, Math.PI) },
  ccu: (e, w, d) => FUR.icu(e, w, d),
  nicu: (e, w, d) => { grid(Math.max(3, Math.floor(w / 2.6)), w, 1.4).forEach((x, i) => { e.incubator(x, -d / 2 + 1.6 + (i % 2) * 3.2, 0); e.monitor(x + 0.9, -d / 2 + 1.6 + (i % 2) * 3.2, 0, 1.3) }); e.chairLounge(w / 2 - 1.2, d / 2 - 2, Math.PI); e.sink(-w / 2 + 1, d / 2 - 1, Math.PI); e.counter(0, d / 2 - 2, 5, 0) },
  isolation: (e, w, d) => { e.bed(0, -d / 2 + 2.8, 0, '#f0e0cc'); e.monitor(1.4, -d / 2 + 2, 0); e.vent(-1.4, -d / 2 + 2, 0); e.toilet(w / 2 - 1, -d / 2 + 1, 0); e.sink(w / 2 - 1, -d / 2 + 2.4, -Math.PI / 2); e.wall(0, d / 2 - 2.6, w - 0.6, 2.6, 0.12, '#cfe6ee', 0, false); e.G.box(0, e.yf + 0.4, d / 2 - 2.6, w - 0.6, 2.0, 0.05, '#bfe9ff') },
  ward: (e, w, d) => { for (const x of [-w / 4 - 0.4, w / 4 + 0.4]) { e.bed(x, -d / 2 + 2.4, 0); e.monitor(x + 1.0, -d / 2 + 1.6, 0, 1.3); e.ivPole(x - 0.9, -d / 2 + 1.5) } e.curtain(0, -d / 2 + 2.4, 3.0, Math.PI / 2); e.toilet(w / 2 - 1, d / 2 - 1.4, Math.PI); e.sink(w / 2 - 1, d / 2 - 2.6, -Math.PI / 2); e.cabinet(-w / 2 + 0.4, 2, 2.5, Math.PI / 2, 1.4); e.chair(0, 2.5, Math.PI) },
  single: (e, w, d) => { e.bed(0, -d / 2 + 2.4, 0); e.monitor(1.2, -d / 2 + 1.6, 0, 1.3); e.ivPole(-1.1, -d / 2 + 1.5); e.toilet(w / 2 - 1, d / 2 - 1.4, Math.PI); e.sink(w / 2 - 1, d / 2 - 2.6, -Math.PI / 2); e.chairLounge(-w / 2 + 1.2, d / 2 - 2, Math.PI) },
  nurse: (e, w, d) => { e.counter(0, -d / 2 + 3.5, Math.min(12, w - 3), 0); for (const x of [-3, 0, 3]) { e.desk(x, -d / 2 + 2.3, Math.PI, false); e.panel(x, 1.5, -d / 2 + 2.9, 0.6, 0.35, '#7fd6ff') } e.cabinet(-w / 2 + 0.4, 1, 3, Math.PI / 2); e.cabinet(w / 2 - 0.4, 1, 3, -Math.PI / 2); e.crashCart(w / 2 - 1.2, d / 2 - 1.4, Math.PI) },
  peds_ward: (e, w, d) => { for (const x of [-w / 4 - 0.3, w / 4 + 0.3]) { e.bed(x, -d / 2 + 2.4, 0, '#ffd37a'); e.monitor(x + 1.0, -d / 2 + 1.6, 0, 1.3) } e.M.box(0, e.yf, 1.8, 3, 0.4, 2.4, '#7cc4ff'); e.M.ball(0.3, e.yf + 0.7, 1.8, 0.5, '#ff6b6b', 0.9); e.M.box(-0.9, e.yf + 0.4, 1.5, 0.5, 0.5, 0.5, '#ffd24a'); e.toilet(w / 2 - 1, d / 2 - 1.4, Math.PI) },
  labor: (e, w, d) => { e.bed(0, -d / 2 + 2.6, 0, '#fbd0e4'); e.monitor(1.4, -d / 2 + 1.8, 0, 1.4); e.monitor(-1.4, -d / 2 + 1.8, 0, 1.4); e.incubator(w / 2 - 1.2, 0, Math.PI / 2); e.opLight(0, -d / 2 + 3.2); e.chairLounge(-w / 2 + 1.2, 1.5, Math.PI / 2); e.sink(w / 2 - 1, d / 2 - 1.2, Math.PI) },
  nursery: (e, w, d) => { grid(Math.max(3, Math.floor(w / 1.8)), w, 1).forEach((x, i) => { e.f(x, -d / 2 + 1.5 + (i % 2) * 2.2, 0).box(0, 0.1, 0, 0.7, 0.7, 0.45, '#fff'); e.f(x, -d / 2 + 1.5 + (i % 2) * 2.2, 0).box(0, 0.8, 0, 0.7, 0.2, 0.45, '#ffc9de') }); e.chairLounge(w / 2 - 1.2, d / 2 - 2, Math.PI); e.counter(-w / 4, d / 2 - 2.2, 4, 0) },
  infusion: (e, w, d) => { grid(Math.max(3, Math.floor(w / 2.6)), w, 1.4).forEach((x) => { e.chairLounge(x, -d / 2 + 2.2, 0); e.ivPole(x + 0.9, -d / 2 + 2.0) }); grid(Math.max(3, Math.floor(w / 2.6)), w, 1.4).forEach((x) => { e.chairLounge(x, d / 6, 0); e.ivPole(x + 0.9, d / 6 - 0.2) }); e.counter(0, d / 2 - 1.6, 5, 0) },
  linac: (e, w, d) => { const f = e.f(0, -d / 2 + 4, 0); f.box(0, 0, -1.2, 2.4, 2.6, 1.4, '#eef2f4'); f.box(0, 1.6, 0.2, 0.9, 0.9, 1.6, '#dfe5e9'); f.box(0, 0.7, 1.8, 0.7, 0.12, 2.6, '#cfd6da'); f.box(0, 0.82, 1.8, 0.65, 0.04, 2.5, '#5aa0c4'); e.block(0, -d / 2 + 4, 2.4, 2.8, 4, 0); e.panel(0, 2.6, d / 2 - 0.45, 1.8, 0.4, '#ffd24a'); e.desk(-w / 2 + 2, d / 2 - 1.6, Math.PI, false) },
  dialysis: (e, w, d) => { grid(Math.max(3, Math.floor(w / 2.8)), w, 1.4).forEach((x) => { e.chairLounge(x, -d / 2 + 2.4, 0); e.f(x + 1.0, -d / 2 + 2.2, 0).box(0, 0, 0, 0.5, 1.3, 0.5, '#dde3e7'); e.panel(x + 1.0, 1.0, -d / 2 + 2.2 + 0.26, 0.4, 0.25, '#7fd6ff') }); grid(Math.max(3, Math.floor(w / 2.8)), w, 1.4).forEach((x) => { e.chairLounge(x, d / 6, 0); e.f(x + 1.0, d / 6, 0).box(0, 0, 0, 0.5, 1.3, 0.5, '#dde3e7') }); e.counter(0, d / 2 - 1.6, 5, 0) },
  pharmacy: (e, w, d) => { e.counter(0, d / 2 - 3, w - 4, 0); for (let r = 0; r < 4; r++) e.shelf(-w / 2 + 3 + r * 3.2, -d / 2 + 2.6, 2.8, Math.PI / 2 * 0, 2.4); e.fridge(w / 2 - 1, -d / 2 + 1, 0, '#dff1d0'); e.panel(0, 2.7, d / 2 - 0.4, 3, 0.7, '#9aff9a') },
  aula: (e, w, d) => { e.tiers(w, d, 7); e.M.box(0, e.yf, d / 2 - 1.4, w - 6, 0.25, 2.4, '#8a6a47'); e.panel(0, 1.4, d / 2 - 0.4, Math.min(12, w - 8), 3, '#e6f3ff'); e.desk(w / 4, d / 2 - 2.4, Math.PI, false); e.M.box(-w / 4, e.yf + 0.25, d / 2 - 2.4, 0.9, 1.1, 0.6, '#6d4b30') },
  classroom: (e, w, d) => { const r = Math.max(2, Math.floor((d - 5) / 2.2)), c = Math.max(2, Math.floor((w - 3) / 2.8)); for (let i = 0; i < r; i++) for (const x of grid(c, w, 1.8)) { e.table(x, -d / 2 + 4.5 + i * 2.2, 2.0, 0.7, 0); e.chair(x, -d / 2 + 5.4 + i * 2.2, Math.PI) } e.panel(0, 1.4, d / 2 - 0.4, Math.min(5, w - 3), 1.8, '#e6f3ff'); e.desk(w / 4, d / 2 - 2.2, Math.PI, false) },
  conference: (e, w, d) => { e.table(0, 0, Math.min(8, w - 3), 2.2, 0, '#8a6a47'); for (let i = 0; i < 6; i++) { const x = -3 + i * 1.2; e.chair(x, -1.7, 0); e.chair(x, 1.7, Math.PI) } e.panel(0, 1.4, -d / 2 + 0.4, Math.min(6, w - 3), 1.9, '#e6f3ff') },
  sim: (e, w, d) => { e.manikin(-w / 4, -d / 2 + 3, 0); e.manikin(w / 4, -d / 2 + 3, 0); e.monitor(-w / 4 + 1.3, -d / 2 + 2, 0); e.monitor(w / 4 + 1.3, -d / 2 + 2, 0); e.crashCart(0, -d / 2 + 2.2, 0); e.G.box(0, e.yf + 0.3, d / 2 - 3.2, w - 1, 2.2, 0.05, '#bfe9ff'); e.desk(-w / 4, d / 2 - 1.8, Math.PI, false); e.desk(w / 4, d / 2 - 1.8, Math.PI, false); e.panel(0, 2.4, d / 2 - 3.1, 2, 0.5, '#ff6a6a') },
  anatomy: (e, w, d) => { grid(Math.max(2, Math.floor(w / 3.4)), w, 2).forEach((x) => { e.dissect(x, -d / 6, 0); e.dissect(x, d / 6 + 1, 0) }); e.skeleton(-w / 2 + 1, -d / 2 + 1, 0); e.skeleton(w / 2 - 1, -d / 2 + 1, 0); e.cabinet(0, -d / 2 + 0.4, 5, 0) },
  library: (e, w, d) => { for (let i = 0; i < Math.floor(w / 4); i++) e.shelf(-w / 2 + 2.2 + i * 4, -d / 2 + 0.4, 3.4, 0, 2.6); e.table(-w / 6, 1.5, 4, 1.4, 0, '#8a6a47'); e.table(w / 6, 1.5, 4, 1.4, 0, '#8a6a47'); for (const x of [-w / 6, w / 6]) for (const o of [-1.2, 1.2]) { e.chair(x + o, 0.2, 0); e.chair(x + o, 2.8, Math.PI) } },
  residents: (e, w, d) => { for (let i = 0; i < Math.max(2, Math.floor(w / 3.6)); i++) { const x = -w / 2 + 1.6 + i * 3.6; e.bed(x, -d / 2 + 2.2, 0, '#7a8ca8'); e.f(x, -d / 2 + 2.2, 0).box(0, 1.5, 0, 0.9, 0.12, 1.9, WOOD) } e.table(0, 2, 3, 1.2, 0, '#8a6a47'); e.fridge(w / 2 - 1, d / 2 - 1.2, Math.PI) },
  research: (e, w, d) => FUR.lab(e, w, d),
  telemed: (e, w, d) => { e.desk(-w / 4, 0, 0); e.panel(0, 1.5, -d / 2 + 0.4, 4, 2.2, '#6fb8ff'); e.desk(w / 4, 0, 0); e.chairRow(0, 3, 3, Math.PI) },
  kitchen: (e, w, d) => { for (let i = 0; i < 3; i++) e.stove(-w / 4 + i * 2, -d / 2 + 1.2, 0); e.table(0, 0, w - 4, 1.2, 0, STEEL, 0.9); e.fridge(w / 2 - 1, -d / 2 + 1, 0); e.fridge(w / 2 - 1.9, -d / 2 + 1, 0); e.cabinet(-w / 2 + 0.4, 1, 5, Math.PI / 2); e.M.box(w / 4, e.yf + 0.97, 0, 0.6, 0.4, 0.6, '#9ea8ae') },
  cafeteria: (e, w, d) => { e.counter(0, -d / 2 + 1.4, w - 6, 0, '#f3e3c2', '#8a6a47'); for (const x of grid(Math.floor(w / 4), w, 2)) for (const z of [-1, 2.5, 6]) { e.table(x, z, 1.2, 1.2, 0, '#d8b98a'); e.chair(x - 1, z, Math.PI / 2, '#c0674a'); e.chair(x + 1, z, -Math.PI / 2, '#c0674a') } e.plant(w / 2 - 1, d / 2 - 1.2) },
  laundry: (e, w, d) => { for (let i = 0; i < Math.floor(w / 1.6); i++) e.washer(-w / 2 + 1.2 + i * 1.6, -d / 2 + 1.0, 0); e.table(0, 0, w - 4, 1.4, 0, '#e8eef0', 0.9); for (let i = 0; i < 4; i++) e.M.box(-w / 4 + i * 2.4, e.yf + 0.1, d / 2 - 2, 1.0, 1.0, 0.8, '#7a8ca8'); e.cabinet(w / 2 - 0.4, 0, 5, -Math.PI / 2) },
  supply: (e, w, d) => { for (let r = 0; r < Math.floor(w / 3); r++) { e.shelf(-w / 2 + 2 + r * 3, -d / 4, 2.6, Math.PI / 2, 2.6); e.shelf(-w / 2 + 2 + r * 3, d / 4, 2.6, Math.PI / 2, 2.6) } },
  plant: (e, w, d) => { e.genny(-w / 4, -d / 4, 0); e.genny(w / 4, -d / 4, 0); e.panel(0, 2.2, -d / 2 + 0.4, 5, 1.0, '#ffcf4a'); for (let i = 0; i < 4; i++) e.M.box(-3 + i * 2, e.yf, d / 4, 1.4, 2.4, 0.7, '#6a7480') },
  gases: (e, w, d) => { const cols = ['#2f9e57', '#f2f2f2', '#2f5fb5', '#e8c53c']; for (let i = 0; i < 12; i++) e.gasCyl(-w / 2 + 1.2 + (i % 6) * 0.9, -d / 2 + 1.2 + Math.floor(i / 6) * 0.9, cols[Math.floor(i / 3) % 4]); e.tank(w / 4, -d / 6, 1.1, 3.2, '#cfd6da') },
  boiler: (e, w, d) => { for (let i = 0; i < 3; i++) e.tank(-w / 3 + i * 2.6, -d / 4, 1.0, 2.8, '#aeb7bd'); e.M.box(0, e.yf + 2.6, -d / 4 - 1.2, w - 3, 0.2, 0.2, STEEL); e.M.box(0, e.yf + 2.9, 2, w - 4, 0.3, 0.8, '#7f8d94') },
  waste: (e, w, d) => { const cols = ['#d63b3b', '#f2c230', '#2f5fb5', '#22222a']; for (let i = 0; i < 8; i++) { e.M.cyl(-w / 2 + 1.4 + (i % 4) * 1.4, e.yf, -d / 4 + Math.floor(i / 4) * 1.5, 0.45, 0.9, 8, cols[i % 4]); e.C.box(-w / 2 + 1.4 + (i % 4) * 1.4, e.yf, -d / 4 + Math.floor(i / 4) * 1.5, 0.9, 1, 0.9, '#fff') } },
  chapel: (e, w, d) => { e.statueHeart(0, -d / 2 + 1.8); for (const sx of [-1, 1]) for (let r = 0; r < Math.floor((d - 6) / 1.4); r++) e.f(sx * w / 4, -d / 2 + 5 + r * 1.4, 0).box(0, 0, 0, w / 2 - 2, 0.9, 0.5, '#8a6a47'); for (let i = 0; i < 4; i++) { e.E.box(-w / 2 + 0.2, e.yf + 1.4, -d / 2 + 2 + i * 2.6, 0.05, 2.4, 1.2, ['#d65a5a', '#5a8fd6', '#e0b84c', '#6bbf7a'][i]); e.E.box(w / 2 - 0.2, e.yf + 1.4, -d / 2 + 2 + i * 2.6, 0.05, 2.4, 1.2, ['#6bbf7a', '#e0b84c', '#5a8fd6', '#d65a5a'][i]) } e.lights.push([0, e.yf + 3.2, -d / 2 + 2.6]) },
  lobby: (e, w, d) => { e.counter(-w / 4, -d / 2 + 4, 6, 0); e.counter(w / 4, -d / 2 + 4, 6, 0); e.panel(-w / 4, 2.4, -d / 2 + 0.4, 5, 0.8, '#7fd6ff'); e.panel(w / 4, 2.4, -d / 2 + 0.4, 5, 0.8, '#9aff9a'); for (let i = 0; i < 3; i++) e.chairRow(-w / 4 + i * (w / 4), 1 + (i % 2) * 2, 5, 0); e.plant(-w / 2 + 1.5, d / 2 - 1.5); e.plant(w / 2 - 1.5, d / 2 - 1.5); e.M.box(0, e.yf, -d / 2 + 3, 3, 0.1, 3, '#d7a64a'); e.statueHeart(0, -d / 2 + 1.4) },
  corridor: () => {},
  closet: (e, w, d) => { e.cabinet(0, -d / 2 + 0.5, w - 1, 0, 2.2); e.M.box(0, e.yf, d / 4, w - 1.5, 0.15, 0.5, '#7a8590') },
  stairs: () => {},
  elevator: (e, w, d) => { e.M.box(0, e.yf, -d / 2 + 0.2, w - 0.5, 2.8, 0.08, '#aab4bb'); e.M.box(-w / 2 + 0.45, e.yf + 1.0, -0.2, 0.06, 0.08, d - 1, STEEL); e.M.box(w / 2 - 0.45, e.yf + 1.0, -0.2, 0.06, 0.08, d - 1, STEEL); e.panel(w / 2 - 0.7, 1.3, -d / 2 + 0.28, 0.25, 0.7, '#9fe6ff'); e.panel(0, 2.65, -d / 2 + 0.28, 0.5, 0.2, '#ff7a3c') },
}
FUR.erbay2 = FUR.erbay

// ── Cuarto ───────────────────────────────────────────────────────────────────
export const ROOM_DEFAULTS = { w: 12, d: 14, level: 0, kind: 'office', name: '', door: 'S', ext: '', walls: 'NSEW', hh: 1, top: false, up: false, dpos: 0, extraDoor: '', rail: '' }

export function buildRoom(raw) {
  const p = { ...ROOM_DEFAULTS, ...raw }
  const K = KINDS[p.kind] || KINDS.office, dept = DEPTS[K.dept] || DEPTS.adm
  const { w, d, level, hh } = p, y0 = level * FH, H = FH * hh, yf = y0 + SLAB, yt = y0 + H
  const M = new Mesher(), C = new Mesher(), F = new Mesher(), RMP = new Mesher(), G = new Mesher(), RF = new Mesher(), E = new Mesher()
  const lights = [], signs = []
  const R = (() => { let a = Math.floor((p.w * 31 + p.d * 17 + level * 7 + (p.x || 0) * 3 + (p.z || 0)) * 7919) >>> 0; return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296 } })()
  const isCorr = p.kind === 'corridor', isStairs = p.kind === 'stairs'
  const doors = (p.door + p.extraDoor).split('')
  const dw = K.doorW || (p.kind === 'corridor' ? 0 : 1.6), dwFor = (side) => (side === p.extraDoor ? Math.max(dw, 2.4) : dw)

  // ── piso (con hueco de escalera abajo si hace falta)
  const stairZ0 = d / 2 - 0.3 - 2.6
  let rects = [[-w / 2, w / 2, -d / 2, d / 2]]
  if (isStairs && level > 0 && p.hole !== false) rects = rects.flatMap((r) => subRect(r, [-w / 2 + 0.3, w / 2 - 0.3, -d / 2 + 0.3, stairZ0]))
  const floorHex = isCorr ? K.floor : K.floor
  rects.forEach(([a, b, c, e]) => F.box((a + b) / 2, y0, (c + e) / 2, b - a, SLAB, e - c, floorHex))

  // ── paredes
  const sides = { S: { ry: 0, cx: 0, cz: d / 2, L: w }, N: { ry: Math.PI, cx: 0, cz: -d / 2, L: w }, E: { ry: Math.PI / 2, cx: w / 2, cz: 0, L: d }, W: { ry: -Math.PI / 2, cx: -w / 2, cz: 0, L: d } }
  const put = (s, u, lz) => { const c = Math.cos(s.ry), n = Math.sin(s.ry); return [s.cx + u * c + lz * n, s.cz - u * n + lz * c] }
  const wb = (s, u, y, bw, bh, lz, bt, hex, mesh = M) => { if (bw > 0.01 && bh > 0.01) { const [x, z] = put(s, u, lz); mesh.box(x, y, z, bw, bh, bt, hex, s.ry) } }
  const tint = K.tint, facade = '#eef1f3', T = 0.3
  for (const key of p.walls.split('')) {
    const s = sides[key]
    if (!s) continue
    const ext = p.ext.includes(key), L = s.L, ops = []
    if (doors.includes(key)) ops.push({ u: key === doors[0] ? p.dpos : 0, w: dwFor(key), y0: yf, h: 2.75, door: true })
    if (ext) {
      const big = p.kind === 'lobby' || p.kind === 'cafeteria', n = Math.max(1, Math.floor((L - 2) / (big ? 5 : 4.2))), sp = (L - 2) / n
      for (let i = 0; i < n; i++) {
        const u = -(L - 2) / 2 + sp * (i + 0.5)
        if (ops.some((o) => Math.abs(o.u - u) < o.w / 2 + 1.4)) continue
        ops.push(big ? { u, w: Math.min(sp - 0.6, 3.6), y0: yf + 0.3, h: Math.min(3.6 + (hh - 1) * FH, H - 1), win: true } : { u, w: Math.min(1.9, sp - 0.8), y0: yf + 0.9, h: 1.5, win: true })
      }
    }
    ops.sort((a, b) => a.u - b.u)
    const seg = (u, bw, ya, hh2) => { if (hh2 > 0.01 && bw > 0.01) { wb(s, u, ya, bw, hh2, ext ? -0.04 : -0.15, ext ? 0.08 : 0.3, ext ? facade : tint); if (ext) wb(s, u, ya, bw, hh2, -0.19, 0.22, tint) } }
    let cur = -L / 2
    for (const o of ops) {
      seg((cur + o.u - o.w / 2) / 2, o.u - o.w / 2 - cur, yf, yt - yf)
      seg(o.u, o.w, yf, o.y0 - yf); seg(o.u, o.w, o.y0 + o.h, yt - o.y0 - o.h)
      cur = o.u + o.w / 2
      if (o.win) { const [gx, gz] = put(s, o.u, -0.15); G.box(gx, o.y0, gz, o.w, o.h, 0.05, '#a9d8ea', s.ry); wb(s, o.u, o.y0 - 0.1, o.w + 0.3, 0.1, 0.05, 0.4, '#dfe5e8') }
      if (o.door) {
        wb(s, o.u - o.w / 2 - 0.08, o.y0, 0.16, o.h + 0.12, 0.05, 0.4, dept.color); wb(s, o.u + o.w / 2 + 0.08, o.y0, 0.16, o.h + 0.12, 0.05, 0.4, dept.color); wb(s, o.u, o.y0 + o.h, o.w + 0.32, 0.12, 0.05, 0.4, dept.color)
        const [mx, mz] = put(s, o.u, 1.0); M.box(mx, yf, mz, o.w, 0.03, 1.4, dept.color, s.ry) // tapete de color: guía el camino
      }
    }
    seg((cur + L / 2) / 2, L / 2 - cur, yf, yt - yf)
    // colisión
    const door = ops.find((o) => o.door)
    if (door) {
      const a = door.u - door.w / 2 + L / 2, b = L - a - door.w
      wb(s, -L / 2 + a / 2, y0, a, H, -T / 2, T, '#fff', C); wb(s, L / 2 - b / 2, y0, b, H, -T / 2, T, '#fff', C); wb(s, door.u, yf + door.h, door.w, yt - yf - door.h, -T / 2, T, '#fff', C)
    } else wb(s, 0, y0, L, H, -T / 2, T, '#fff', C)
    // letrero sobre la puerta (hacia el pasillo)
    if (door && !isCorr && !isStairs) {
      const name = p.name || tr(...K.name), [sx, sz] = put(s, door.u, 0.12)
      signs.push({ text: name, sub: tr(...dept.name), color: dept.color, x: sx, y: yf + 2.95, z: sz, w: Math.min(3.6, Math.max(2.2, name.length * 0.17)), h: 0.62, ry: s.ry })
    }
  }

  // ── techo y luces
  E.box(0, yt - 0.12, 0, w, 0.12, d, isCorr ? '#bfc8cc' : '#b9c3c8')
  const strips = Math.max(1, Math.round(Math.max(w, d) / 6)), long = w >= d
  for (let i = 0; i < strips; i++) { const u = -Math.max(w, d) / 2 + (Math.max(w, d) * (i + 0.5)) / strips; E.box(long ? u : 0, yt - 0.14, long ? 0 : u, long ? 1.4 : Math.min(1.4, w - 1), 0.04, long ? Math.min(0.7, d - 1) : 1.4, '#ffffff'); if (i % 2 === 0 || isCorr) lights.push(long ? [u, yt - 0.7, 0] : [0, yt - 0.7, u]) }
  if (p.top) {
    if (!(isStairs && p.up)) F.box(0, yt, 0, w, 0.4, d, '#8d969b')
    for (const [px, pz, pw, pd] of [[0, d / 2 - 0.15, w, 0.3], [0, -d / 2 + 0.15, w, 0.3], [w / 2 - 0.15, 0, 0.3, d], [-w / 2 + 0.15, 0, 0.3, d]]) { M.box(px, yt + 0.4, pz, pw, 1.1, pd, '#cfd6da'); C.box(px, yt + 0.4, pz, pw, 1.1, pd, '#fff') }
  }
  if (!(isStairs && p.up)) C.box(0, yt, 0, w, 0.3, d, '#fff') // el techo bloquea/limita la cámara (no sobre el hueco de la escalera)

  // ── escalera (ida y vuelta) o mobiliario
  if (isStairs) {
    const z0 = stairZ0, run = FH / 2 / 0.5, zN = z0 - run, half = FH / 2, fx = [-w / 4, w / 4], fw = w / 2 - 0.5, n = 9, rise = half / n
    if (p.up) {
      for (let k = 0; k < 2; k++) {
        const up = k === 0, yb = yf + (up ? 0 : half)
        for (let i = 0; i < n; i++) M.box(fx[k], yb, up ? z0 - (i + 0.5) * (run / n) : zN + (i + 0.5) * (run / n), fw, (i + 1) * rise, run / n, i % 2 ? '#aeb4b8' : '#c7ccd0')
        RMP.slope(fx[k], yb + rise / 2, up ? z0 : zN, yb + half + rise / 2, up ? zN : z0, fw, 0.25, '#fff')
        for (const sg of [-1, 1]) M.slope(fx[k] + sg * (fw / 2), yb + 1.0, up ? z0 : zN, yb + half + 1.0, up ? zN : z0, 0.06, 0.06, '#4b5560')
      }
      F.box(0, yf + half - 0.3, (zN - d / 2 + 0.3) / 2, w - 0.6, 0.3, zN + d / 2 - 0.3, '#c7ccd0') // descanso intermedio
    }
    if (p.up && p.top) { // la escalera sigue a la azotea: losa con hueco
      subRect([-w / 2, w / 2, -d / 2, d / 2], [-w / 2 + 0.3, w / 2 - 0.3, -d / 2 + 0.3, stairZ0]).forEach(([a2, b2, c2, e2]) => F.box((a2 + b2) / 2, yt, (c2 + e2) / 2, b2 - a2, 0.4, e2 - c2, '#8d969b'))
    }
    E.box(0, y0 + 2.4, -d / 2 + 0.35, 1.4, 0.35, 0.03, '#9fe6ff')
    signs.push({ text: tr(`Nivel ${level}`, `Level ${level}`), sub: tr(...K.name), color: '#64748b', x: 0, y: yf + 2.2, z: d / 2 - 0.4, w: 1.6, h: 0.4, ry: Math.PI })
  } else if (FUR[p.kind] && !isCorr) {
    const th = SIDES[doors[0] || 'S'].ang, swap = th === Math.PI / 2 || th === -Math.PI / 2, cw = swap ? d : w, cd = swap ? w : d
    const FM = new Mesher(), FC = new Mesher(), FE = new Mesher(), FG = new Mesher(), FF = new Mesher(), fl = []
    const e = new Eq(FM, FC, FE, FG, FF, fl, yf, R)
    FUR[p.kind](e, cw - 0.8, cd - 0.8)
    const rot = (m, tgt) => m.parts.forEach((g) => { g.rotateY(th); tgt.parts.push(g) })
    rot(FM, M); rot(FC, C); rot(FE, E); rot(FG, G); rot(FF, F)
    fl.forEach(([lx, ly, lz]) => { const c = Math.cos(th), s = Math.sin(th); lights.push([lx * c + lz * s, ly, -lx * s + lz * c]) })
    if (p.kind === 'elevator') signs.push({ text: tr(`Nivel ${level}`, `Level ${level}`), sub: '', color: '#64748b', x: 0, y: yf + 2.5, z: 0, w: 1.2, h: 0.35, ry: Math.PI })
  }
  for (const key of (p.rail || '').split('')) { // barandal en el borde abierto (balcón sobre el atrio / vacío)
    const s = sides[key]
    if (!s) continue
    wb(s, 0, yf, s.L, 1.05, -0.08, 0.1, '#b8c2c8'); wb(s, 0, yf, s.L, 1.4, -0.08, 0.1, '#fff', C)
    wb(s, 0, yf + 1.0, s.L, 0.06, -0.08, 0.14, '#4b5560')
  }
  if (isCorr) { // pasillo: zócalo de color + barandal
    const long2 = w >= d
    for (const sg of [-1, 1]) { M.box(long2 ? 0 : sg * (w / 2 - 0.05), yf, long2 ? sg * (d / 2 - 0.05) : 0, long2 ? w : 0.1, 0.35, long2 ? 0.1 : d, '#d3dadd'); M.box(long2 ? 0 : sg * (w / 2 - 0.1), yf + 0.95, long2 ? sg * (d / 2 - 0.1) : 0, long2 ? w : 0.05, 0.06, long2 ? 0.05 : d, '#a8b2b8') }
  }
  return { solid: M.build(), floors: F.build(), ramps: RMP.build(), glass: G.build(), roof: RF.build(), emissive: E.build(), collide: C.build(), lights, signs, bounds: { w, d, h: H + 2 } }
}

// ── Piezas exteriores y rotulación ───────────────────────────────────────────
export function buildSignPost(p) { // letrero colgante para pasillos: {text, sub, color, level, w, h}
  const { w = 3.4, h = 0.85, level = 0 } = p, y = p.y0 ?? level * FH + SLAB + 3.0, M = new Mesher()
  if (!p.flat) for (const sx of [-1, 1]) M.cyl(sx * (w / 2 - 0.2), y + h, 0, 0.03, FH - 3.2 - h + 0.3, 4, '#4b5560')
  M.box(0, y - 0.05, 0, w + 0.1, h + 0.1, 0.12, '#2c3340')
  return { solid: M.build(), signs: [{ text: p.text || 'Letrero', sub: p.sub || '', color: p.color || '#3b82f6', x: 0, y, z: 0.07, w, h, ry: 0 }, { text: p.text || 'Letrero', sub: p.sub || '', color: p.color || '#3b82f6', x: 0, y, z: -0.07, w, h, ry: Math.PI }], bounds: { w, d: 1, h: FH } }
}
export function buildCanopy({ w = 24, d = 10, h = 5 } = {}) {
  const M = new Mesher(), C = new Mesher()
  M.box(0, h, 0, w, 0.5, d, '#e9eef1'); M.box(0, h + 0.5, 0, w + 0.4, 0.2, d + 0.4, '#d63b3b')
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) { M.cyl(sx * (w / 2 - 0.8), 0, sz * (d / 2 - 0.8), 0.3, h, 8, '#cfd6da'); C.box(sx * (w / 2 - 0.8), 0, sz * (d / 2 - 0.8), 0.7, h, 0.7, '#fff') }
  const E = new Mesher(); E.box(0, h - 0.05, 0, w - 1, 0.05, d - 1, '#fffbe6')
  return { solid: M.build(), collide: C.build(), emissive: E.build(), bounds: { w, d, h: h + 1 } }
}
export function buildCar({ color = '#c0392b' } = {}) {
  const M = new Mesher()
  M.box(0, 0.25, 0, 1.8, 0.7, 4.2, color); M.box(0, 0.95, -0.2, 1.6, 0.6, 2.2, '#cfe6ef'); M.box(0, 0.9, -0.2, 1.62, 0.08, 2.0, color)
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) M.cyl(sx * 0.9, 0.35, sz * 1.3, 0.35, 0.2, 8, '#222')
  return { solid: M.build(), collide: new Mesher().box(0, 0, 0, 1.9, 1.4, 4.3, '#fff').build() }
}
export function buildAmbulance() {
  const M = new Mesher(), E = new Mesher()
  M.box(0, 0.4, 0, 2.2, 1.9, 5.4, '#f4f6f7'); M.box(0, 1.5, 2.1, 2.0, 0.9, 1.2, '#9fd0e4'); M.box(0, 0.9, 0, 2.24, 0.25, 5.4, '#d63b3b')
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) M.cyl(sx * 1.0, 0.4, sz * 1.8, 0.42, 0.25, 8, '#222')
  M.box(1.12, 1.5, -0.4, 0.04, 0.9, 0.3, '#d63b3b'); M.box(1.12, 1.5, -0.4, 0.04, 0.3, 0.9, '#d63b3b'); M.box(-1.12, 1.5, -0.4, 0.04, 0.9, 0.3, '#d63b3b'); M.box(-1.12, 1.5, -0.4, 0.04, 0.3, 0.9, '#d63b3b')
  E.box(-0.5, 2.3, 1.7, 0.5, 0.2, 0.3, '#ff3b3b'); E.box(0.5, 2.3, 1.7, 0.5, 0.2, 0.3, '#3b7bff')
  return { solid: M.build(), emissive: E.build(), collide: new Mesher().box(0, 0, 0, 2.3, 2.5, 5.5, '#fff').build(), bounds: { w: 3, d: 6, h: 3 } }
}
export function buildHelipad({ r = 6.5 } = {}) {
  const F = new Mesher(), M = new Mesher(), E = new Mesher()
  F.cyl(0, 0, 0, r, 0.3, 24, '#4a5560'); M.cyl(0, 0.3, 0, r - 0.6, 0.04, 24, '#e8c53c', r - 0.6)
  M.cyl(0, 0.34, 0, r - 1.1, 0.03, 24, '#3a444d'); for (const [x, z, w, d] of [[-r * 0.28, 0, 0.8, r * 0.9], [r * 0.28, 0, 0.8, r * 0.9], [0, 0, r * 0.7, 0.8]]) M.box(x, 0.37, z, w, 0.03, d, '#ffffff')
  for (let i = 0; i < 16; i++) { const a = (i / 16) * 6.283; E.box(Math.cos(a) * (r - 0.3), 0.3, Math.sin(a) * (r - 0.3), 0.3, 0.12, 0.3, '#ffe9a0') }
  return { solid: M.build(), floors: F.build(), emissive: E.build(), bounds: { w: r * 2, d: r * 2, h: 2 } }
}
export function buildEmblem({ s = 1 } = {}) { // Sagrado Corazón: corazón, cruz y llamas
  const M = new Mesher(), E = new Mesher()
  M.box(0, 0, 0, 7 * s, 0.4, 0.5, '#d9d2c0')
  E.ball(-0.9 * s, 3.2 * s, 0, 1.1 * s, '#ff3b4a'); E.ball(0.9 * s, 3.2 * s, 0, 1.1 * s, '#ff3b4a'); E.add(new THREE.ConeGeometry(1.95 * s, 2.6 * s, 6).rotateX(Math.PI).translate(0, 1.5 * s, 0), '#ff3b4a', 0, 0, 0)
  E.box(0, 4.1 * s, 0.1, 0.3 * s, 1.7 * s, 0.3, '#ffe9a0'); E.box(0, 4.9 * s, 0.1, 1.0 * s, 0.3 * s, 0.3, '#ffe9a0')
  for (let i = 0; i < 9; i++) { const a = (i / 8) * Math.PI; E.box(Math.cos(a) * 3.2 * s, 3.2 * s + Math.sin(a) * 3.0 * s, -0.1, 0.18 * s, 0.7 * s, 0.1, '#ffd98a') }
  return { solid: M.build(), emissive: E.build(), bounds: { w: 8 * s, d: 1, h: 8 * s } }
}

// Catálogo para el editor y pieceFor
export const HOSPITAL_CATALOG = {
  room: { label: 'Cuarto', group: 'Cuartos médicos', defaults: { ...ROOM_DEFAULTS }, fields: [
    { k: 'kind', label: 'Tipo de área', kind: 'sel', opts: Object.keys(KINDS) }, { k: 'name', label: 'Nombre (vacío = el del tipo)', kind: 'text' },
    { k: 'level', label: 'Nivel', kind: 'num', min: 0, max: 5, step: 1 }, { k: 'w', label: 'Ancho (m)', kind: 'num', min: 2, max: 60, step: 1 }, { k: 'd', label: 'Fondo (m)', kind: 'num', min: 2, max: 60, step: 1 },
    { k: 'hh', label: 'Altura (niveles)', kind: 'num', min: 1, max: 3, step: 1 }, { k: 'door', label: 'Puerta (N S E W)', kind: 'text' }, { k: 'dpos', label: 'Desvío de la puerta (m)', kind: 'num', min: -20, max: 20, step: 0.5 },
    { k: 'ext', label: 'Lados con ventana (NSEW)', kind: 'text' }, { k: 'walls', label: 'Paredes (NSEW)', kind: 'text' }, { k: 'top', label: 'Con azotea', kind: 'bool' }, { k: 'up', label: 'Escalera sube', kind: 'bool' },
  ] },
  sign: { label: 'Letrero colgante', group: 'Hospital', defaults: { text: 'Letrero', sub: '', color: '#3b82f6', level: 0, w: 3.4, h: 0.85 }, fields: [
    { k: 'text', label: 'Texto', kind: 'text' }, { k: 'sub', label: 'Subtítulo', kind: 'text' }, { k: 'color', label: 'Color', kind: 'text' }, { k: 'level', label: 'Nivel', kind: 'num', min: 0, max: 5, step: 1 }, { k: 'w', label: 'Ancho', kind: 'num', min: 1, max: 30, step: 0.2 }, { k: 'h', label: 'Alto', kind: 'num', min: 0.3, max: 4, step: 0.1 }, { k: 'y0', label: 'Altura fija (m, vacío = colgante)', kind: 'num', min: 0, max: 30, step: 0.5 },
  ] },
  canopy: { label: 'Marquesina', group: 'Hospital', defaults: { w: 24, d: 10, h: 5 }, fields: [{ k: 'w', label: 'Ancho', kind: 'num', min: 4, max: 60, step: 1 }, { k: 'd', label: 'Fondo', kind: 'num', min: 4, max: 40, step: 1 }, { k: 'h', label: 'Altura', kind: 'num', min: 3, max: 10, step: 0.5 }] },
  car: { label: 'Auto', group: 'Hospital', instanced: true, defaults: { color: '#c0392b' }, fields: [{ k: 'color', label: 'Color', kind: 'text' }] },
  ambulance: { label: 'Ambulancia', group: 'Hospital', defaults: {}, fields: [] },
  helipad: { label: 'Helipuerto', group: 'Hospital', defaults: { r: 6.5 }, fields: [{ k: 'r', label: 'Radio', kind: 'num', min: 3, max: 12, step: 0.5 }] },
  emblem: { label: 'Emblema Sagrado Corazón', group: 'Hospital', defaults: { s: 1 }, fields: [{ k: 's', label: 'Escala', kind: 'num', min: 0.5, max: 4, step: 0.1 }] },
}
export function hospitalPiece(it) {
  switch (it.type) {
    case 'room': return buildRoom(it)
    case 'sign': return buildSignPost(it)
    case 'canopy': return buildCanopy(it)
    case 'car': return buildCar(it)
    case 'ambulance': return buildAmbulance()
    case 'helipad': return buildHelipad(it)
    case 'emblem': return buildEmblem(it)
    default: return undefined
  }
}
