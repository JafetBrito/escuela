import { Mesher } from './mesher'
import { tr } from '../../../i18n'

// Piezas de la Oficina (mapa "Oficinas"): pisos, paredes con puerta/vidrio, filas de escritorios con monitores, mesa de
// reuniones, escritorio del gerente y mobiliario (sofás, billar, futbolito, cocina, servidor, recepción...), plantas y letreros.
// Todo SIN TECHO y con paredes bajas (2.6 m) para que la cámara de siempre —tercera persona, inclinada y alejada— la
// muestre desde arriba como un corte de planos. Mismo contrato que las demás piezas: { solid, emissive?, glass?, floors?, collide?, lights?, signs?, bounds }.
// Proporciones "reales" a escala del jugador (1.2 m): escritorio 0.55 m de alto, puerta 1.9 m, pared 2.6 m.
const rng = (seed) => { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296) }
const WALL = '#e4dfd2', TRIM = '#c9c2b0', METAL = '#2f333a', DESK = '#d9cfba', DESK2 = '#b9ae98', WOODD = '#5a3d2a'
const SCREENS = ['#4f9dff', '#58d3a8', '#f2b84b', '#b78cff', '#6fd1ff']
const SHIRTS = ['#3b6ea5', '#a5523b', '#4f8a5b', '#8a5ba5', '#c49a3a', '#5b6f7a'], SKINS = ['#d1a27a', '#b98258', '#e0b48c', '#8d5a3a']

const FLOORS = { carpet: '#8a3b33', gray: '#6d7480', wood: '#b88a5a', tile: '#d8d2c4', stone: '#a39a8c', blue: '#3f5a7a', green: '#3f6b4a', dark: '#2f333a' }

// ── Piso (caminable): rectángulo de `w`×`d` con material; `dy` lo eleva para apilar alfombras sobre el piso ──
export function buildOFloor({ w = 20, d = 20, mat = 'carpet', dy = 0 } = {}) {
  const F = new Mesher()
  F.box(0, -0.18, 0, w, 0.28 + dy, d, FLOORS[mat] || FLOORS.carpet) // la cara de arriba queda a 0.1 + dy
  return { floors: F.build(), bounds: { w, d, h: 0.4 } }
}

// ── Pared recta centrada (a lo largo de X), con hueco de puerta opcional y variante de vidrio ──
// `gap` = centro del hueco respecto al centro de la pared; `gw` = ancho del hueco (0 = sin puerta).
export function buildOWall({ len = 10, h = 2.6, gap = 0, gw = 0, glass = false, hex = WALL } = {}) {
  const M = new Mesher(), G = new Mesher(), C = new Mesher(), th = 0.25
  const segs = gw > 0 ? [[-len / 2, gap - gw / 2], [gap + gw / 2, len / 2]] : [[-len / 2, len / 2]]
  for (const [a, b] of segs) {
    if (b - a < 0.05) continue
    const cx = (a + b) / 2, w = b - a
    if (glass) { M.box(cx, 0.1, 0, w, 0.9, th, hex); G.box(cx, 1.0, 0, w, h - 1.0, th * 0.4, '#9fd3e6'); M.box(cx, h, 0, w, 0.1, th, '#555d68') }
    else { M.box(cx, 0.1, 0, w, h, th, hex); M.box(cx, 0.1, 0, w + 0.02, 0.12, th + 0.04, TRIM) }
    C.box(cx, 0.1, 0, w, h, th * 1.2, '#fff')
  }
  if (glass) for (let x = -len / 2; x <= len / 2 + 0.01; x += 3) if (!(gw > 0 && Math.abs(x - gap) < gw / 2)) M.box(x, 0.1, 0, 0.12, h, th + 0.04, '#555d68')
  if (gw > 0) { M.box(gap, 1.9, 0, gw + 0.1, h - 1.8, th, glass ? '#555d68' : hex); for (const s of [-1, 1]) M.box(gap + s * (gw / 2), 0.1, 0, 0.1, 1.8, th + 0.04, TRIM) }
  return { solid: M.build(), glass: G.build(), collide: C.build(), bounds: { w: len, d: 1, h } }
}

// ── Sillas y personas (ayudantes) ────────────────────────────────────────────
// Silla giratoria en (x, z) mirando hacia `dz` (±1 en Z): el respaldo queda detrás de quien se sienta.
function chair(M, x, z, dz, hex = '#2e3a4a') {
  M.cyl(x, 0.02, z, 0.05, 0.28, 5, '#222'); M.box(x, 0.02, z, 0.5, 0.04, 0.08, '#222'); M.box(x, 0.02, z, 0.08, 0.04, 0.5, '#222')
  M.box(x, 0.3, z, 0.5, 0.08, 0.5, hex); M.box(x, 0.38, z - dz * 0.24, 0.5, 0.6, 0.06, hex)
}
function person(M, x, z, dz, R) {
  const shirt = SHIRTS[Math.floor(R() * SHIRTS.length)], skin = SKINS[Math.floor(R() * SKINS.length)]
  M.box(x, 0.38, z, 0.4, 0.55, 0.26, shirt); M.ball(x, 1.06, z, 0.17, skin)
  for (const sx of [-1, 1]) M.box(x + sx * 0.23, 0.72, z + dz * 0.18, 0.1, 0.1, 0.42, shirt)
}

// ── Fila doble de escritorios (cara a cara, con divisor) con monitor, teclado, silla y, a veces, alguien sentado ──
export function buildDeskRow({ n = 6, occ = 0.6, seed = 1 } = {}) {
  const M = new Mesher(), E = new Mesher(), C = new Mesher(), R = rng(seed * 13 + 7), sx = 2.0, x0 = -((n - 1) * sx) / 2
  for (const side of [-1, 1]) for (let i = 0; i < n; i++) {
    const x = x0 + i * sx, z = side * 0.95, zc = side * 1.85
    M.box(x, 0.5, z, 1.6, 0.06, 0.8, DESK); M.box(x - 0.74, 0, z, 0.06, 0.5, 0.7, DESK2); M.box(x + 0.74, 0, z, 0.06, 0.5, 0.7, DESK2); M.box(x, 0.12, z - side * 0.34, 1.5, 0.38, 0.04, DESK2)
    M.box(x, 0.56, z, 0.1, 0.12, 0.08, METAL); E.box(x, 0.66, z, 0.62, 0.36, 0.04, SCREENS[Math.floor(R() * SCREENS.length)])
    M.box(x + 0.05, 0.56, z + side * 0.22, 0.42, 0.02, 0.14, METAL); M.box(x + 0.5, 0.56, z + side * 0.1, 0.12, 0.1, 0.12, '#cfd3d8') // teclado y taza
    chair(M, x, zc, -side, SHIRTS[Math.floor(R() * SHIRTS.length)])
    if (R() < occ) person(M, x, zc, -side, R)
    C.box(x, 0, z, 1.6, 0.6, 0.85, '#fff')
  }
  const len = n * sx; M.box(0, 0.1, 0, len, 0.8, 0.06, '#6b7a8c'); M.box(0, 0.9, 0, len, 0.05, 0.1, '#4f5b6b')
  return { solid: M.build(), emissive: E.build(), collide: C.build(), bounds: { w: len, d: 5, h: 1.5 } }
}

// ── Mesa de reuniones con sillas alrededor ───────────────────────────────────
export function buildMeetTable({ len = 8, seed = 1 } = {}) {
  const M = new Mesher(), C = new Mesher(), R = rng(seed * 7 + 3), n = Math.max(2, Math.floor(len / 1.3))
  M.box(0, 0.5, 0, len, 0.1, 1.9, '#7b5a3d'); for (const s of [-1, 1]) M.box(s * (len / 2 - 0.7), 0, 0, 0.5, 0.5, 1.3, '#4a3a2c')
  C.box(0, 0, 0, len, 0.62, 1.9, '#fff')
  for (let i = 0; i < n; i++) for (const side of [-1, 1]) { const x = -len / 2 + 0.8 + ((len - 1.6) * i) / Math.max(1, n - 1), z = side * 1.35; chair(M, x, z, -side, '#3a4a60'); if (R() < 0.55) person(M, x, z, -side, R) }
  chair(M, len / 2 + 0.7, 0, 0, '#3a4a60')
  return { solid: M.build(), collide: C.build(), bounds: { w: len + 2, d: 4.4, h: 1.6 } }
}

// ── Mobiliario suelto, según `kind` ──────────────────────────────────────────
// Pared: whiteboard, screen · Oficina: printer, cooler, shelf, server, reception, mdesk · Cocina: fridge, counter, island, coffee ·
// Lounge: sofa, pool, foos, tv, bean. `len` = largo (m) donde aplique, `color` = tela/pieza principal.
export function buildProp({ kind = 'printer', len = 4, color = '#6b7c93', seed = 1 } = {}) {
  const M = new Mesher(), E = new Mesher(), C = new Mesher(), R = rng(seed * 19 + 1), lights = []
  const col = (w, h, d, y = 0) => C.box(0, y, 0, w, h, d, '#fff')
  switch (kind) {
    case 'whiteboard': M.box(0, 0.9, 0, len, 1.4, 0.06, '#f4f4f0'); M.box(0, 0.86, -0.01, len + 0.1, 1.48, 0.04, '#9aa0a8'); for (let i = 0; i < 6; i++) E.box(-len / 2 + 0.5 + R() * (len - 1.6), 1.1 + R() * 0.9, 0.04, 0.5 + R() * 0.8, 0.05, 0.01, SCREENS[i % 5]); break
    case 'screen': M.box(0, 0.9, 0, len, 1.5, 0.1, '#15181d'); E.box(0, 0.98, 0.06, len - 0.2, 1.3, 0.02, '#1f3a5f'); for (let i = 0; i < 5; i++) E.box(-len / 2 + 0.6 + i * ((len - 1.2) / 4), 1.1, 0.075, 0.32, 0.5 + R() * 0.5, 0.01, SCREENS[i % 5]); break
    case 'printer': M.box(0, 0, 0, 1.0, 0.8, 0.8, '#d4d7dc'); M.box(0, 0.8, 0, 1.05, 0.12, 0.85, '#aab0b8'); E.box(0.3, 0.6, 0.41, 0.2, 0.08, 0.01, '#58d3a8'); col(1, 0.95, 0.8); break
    case 'cooler': M.box(0, 0, 0, 0.5, 0.9, 0.5, '#e8ecf0'); M.cyl(0, 0.9, 0, 0.2, 0.45, 8, '#8fd0ff'); col(0.5, 1.4, 0.5); break
    case 'shelf': M.box(0, 0, 0, len, 2.2, 0.45, '#8a6a47'); for (let r = 0; r < 4; r++) for (let x = -len / 2 + 0.15; x < len / 2 - 0.2; x += 0.16 + R() * 0.12) M.box(x, 0.12 + r * 0.52, 0.02, 0.1 + R() * 0.08, 0.36 + R() * 0.1, 0.3, ['#a5523b', '#3b6ea5', '#4f8a5b', '#c49a3a', '#8a5ba5'][Math.floor(R() * 5)]); col(len, 2.2, 0.45); break
    case 'server': M.box(0, 0, 0, 1.2, 2.2, 1.0, '#23272e'); for (let i = 0; i < 6; i++) { M.box(0, 0.25 + i * 0.33, 0.51, 1.1, 0.28, 0.02, '#2f353e'); E.box(-0.45, 0.35 + i * 0.33, 0.52, 0.05, 0.05, 0.01, i % 2 ? '#58d3a8' : '#4f9dff') } col(1.2, 2.2, 1); break
    case 'reception': M.box(0, 0, 0, len, 1.0, 1.1, '#e8e1d0'); M.box(0, 1.0, 0, len + 0.1, 0.08, 1.2, '#7b5a3d'); E.box(0, 0.55, 0.56, len - 0.4, 0.25, 0.02, '#4f9dff'); M.box(len * 0.25, 1.08, -0.1, 0.5, 0.34, 0.06, '#15181d'); col(len, 1.1, 1.2); break
    case 'mdesk': M.box(0, 0.5, 0, 2.8, 0.1, 1.3, WOODD); for (const s of [-1, 1]) M.box(s * 1.25, 0, 0, 0.12, 0.5, 1.2, '#3b2a1e'); M.box(0, 0.6, -0.3, 0.1, 0.12, 0.08, METAL); E.box(0, 0.7, -0.3, 0.7, 0.4, 0.04, '#4f9dff'); chair(M, 0, -1.3, 1, '#6b2f2a'); M.cyl(0.9, 0.6, 0.3, 0.1, 0.35, 6, '#d9b04a', 0.18); lights.push([0.9, 1.2, 0.3]); C.box(0, 0, 0, 2.8, 0.62, 1.3, '#fff'); break
    case 'fridge': M.box(0, 0, 0, 0.9, 1.8, 0.8, '#e6e9ee'); M.box(0.35, 0.8, 0.41, 0.05, 0.6, 0.04, '#9aa0a8'); M.box(0, 1.1, 0.405, 0.9, 0.02, 0.01, '#9aa0a8'); col(0.9, 1.8, 0.8); break
    case 'counter': M.box(0, 0, 0, len, 0.8, 0.7, '#e8e1d0'); M.box(0, 0.8, 0, len + 0.05, 0.06, 0.76, '#4a4f58'); M.box(0, 1.5, -0.2, len, 0.6, 0.35, '#e8e1d0'); M.box(len * 0.2, 0.86, 0.1, 0.5, 0.06, 0.35, '#c9ced6'); col(len, 0.9, 0.7); break
    case 'island': M.box(0, 0, 0, len, 0.85, 1.3, '#d8d2c4'); M.box(0, 0.85, 0, len + 0.06, 0.06, 1.36, '#4a4f58'); for (let i = 0; i < Math.floor(len / 1.1); i++) M.cyl(-len / 2 + 0.6 + i * 1.1, 0, 1.2, 0.2, 0.55, 6, '#3a4a60', 0.18); col(len, 0.9, 1.3); break
    case 'coffee': M.box(0, 0, 0, 0.9, 0.7, 0.6, '#8a6a47'); M.box(0, 0.7, 0, 0.5, 0.5, 0.4, '#2f333a'); E.box(0.1, 0.95, 0.21, 0.12, 0.08, 0.01, '#f2b84b'); col(0.9, 0.7, 0.6); break
    case 'sofa': M.box(0, 0, 0, len, 0.35, 0.95, color); M.box(0, 0.35, -0.38, len, 0.55, 0.22, color); for (const s of [-1, 1]) M.box(s * (len / 2 - 0.11), 0.2, 0, 0.22, 0.5, 0.95, color); M.box(0, 0.35, 0.05, len - 0.5, 0.12, 0.7, color); col(len, 0.9, 0.95); break
    case 'pool': M.box(0, 0.4, 0, 3.2, 0.12, 1.8, '#2f6b3a'); M.box(0, 0.28, 0, 3.5, 0.14, 2.1, WOODD); for (const sx of [-1, 1]) for (const sz of [-1, 1]) M.box(sx * 1.4, 0, sz * 0.75, 0.22, 0.4, 0.22, '#3b2a1e')
      for (const [bx, bz, c] of [[0.6, 0, '#e53935'], [0.78, 0.1, '#ffd24a'], [0.78, -0.1, '#4f9dff'], [0.96, 0, '#222'], [-0.8, 0, '#fff']]) M.ball(bx, 0.62, bz, 0.07, c)
      M.box(0, 1.9, 0, 2.6, 0.12, 0.5, '#2f333a'); E.box(0, 1.84, 0, 2.4, 0.04, 0.4, '#fff1b0'); lights.push([0, 1.6, 0]); col(3.5, 0.55, 2.1); break
    case 'foos': M.box(0, 0.3, 0, 1.6, 0.14, 0.9, '#2f6b3a'); M.box(0, 0.2, 0, 1.7, 0.4, 1.0, '#b23a30'); for (const sx of [-0.5, -0.1, 0.3, 0.6]) M.box(sx, 0.62, 0, 0.04, 0.04, 1.2, '#cfd3d8'); for (const sz of [-1, 1]) { M.box(sz * 0.9, 0, -0.4, 0.1, 0.34, 0.1, '#3b2a1e'); M.box(sz * 0.9, 0, 0.4, 0.1, 0.34, 0.1, '#3b2a1e') } col(1.7, 0.7, 1.2); break
    case 'tv': M.box(0, 0.4, 0, len, 0.1, 0.5, '#3b2a1e'); M.box(0, 0, 0, len - 0.4, 0.4, 0.5, '#4a3a2c'); M.box(0, 0.5, 0, len * 0.7, 1.1, 0.08, '#15181d'); E.box(0, 0.56, 0.05, len * 0.7 - 0.12, 0.98, 0.02, '#2b4f8a'); col(len, 0.5, 0.5); break
    case 'bean': M.ball(0, 0.35, 0, 0.55, color, 0.7); break
    default: M.box(0, 0, 0, 1, 1, 1, '#999')
  }
  return { solid: M.build(), emissive: E.build(), collide: C.build(), lights, bounds: { w: Math.max(len, 1.4), d: 2, h: 2.4 } }
}

// ── Planta (instanciada): maceta con hojas ───────────────────────────────────
export function buildPlant({ kind = 'tall' } = {}) {
  const M = new Mesher()
  M.cyl(0, 0, 0, 0.32, 0.5, 7, '#d9cfba', 0.26)
  if (kind === 'bush') for (let i = 0; i < 5; i++) { const a = (i / 5) * Math.PI * 2; M.ball(Math.cos(a) * 0.22, 0.75, Math.sin(a) * 0.22, 0.3, i % 2 ? '#4f8a3c' : '#5f9a46', 0.9) }
  else { M.cyl(0, 0.5, 0, 0.05, 0.9, 5, '#6b4b2a'); for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2; M.ball(Math.cos(a) * 0.3, 1.1 + (i % 3) * 0.3, Math.sin(a) * 0.3, 0.3, i % 2 ? '#3f7a3a' : '#4f8a3c', 0.8) } }
  return { solid: M.build(), collide: new Mesher().box(0, 0, 0, 0.6, 1, 0.6, '#fff').build() }
}

// ── Letrero de ambiente (se lee desde arriba y de frente) ───────────────────
export function buildOSign({ text = 'Letrero', w = 6, h = 0.9, color = '#4f9dff', y = 2.2 } = {}) {
  return { solid: null, signs: [{ text, color, x: 0, y, z: 0.14, w, h, ry: 0 }, { text, color, x: 0, y, z: -0.14, w, h, ry: Math.PI }], bounds: { w, d: 0.2, h: y + h } }
}

// ── Catálogo y despacho ──────────────────────────────────────────────────────
const num = (k, label, min, max, step = 1) => ({ k, label, kind: 'num', min, max, step })
const sel = (k, label, opts) => ({ k, label, kind: 'sel', opts })
const text = (k, label) => ({ k, label, kind: 'text' })
const bool = (k, label) => ({ k, label, kind: 'bool' })
export const PROP_KINDS = ['whiteboard', 'screen', 'printer', 'cooler', 'shelf', 'server', 'reception', 'mdesk', 'fridge', 'counter', 'island', 'coffee', 'sofa', 'pool', 'foos', 'tv', 'bean']
export const OFFICE_CATALOG = {
  ofloor: { label: 'Piso de oficina', group: 'Oficina', defaults: { w: 20, d: 20, mat: 'carpet', dy: 0 }, fields: [num('w', 'Ancho (m)', 2, 120), num('d', 'Fondo (m)', 2, 120), sel('mat', 'Material', Object.keys(FLOORS)), num('dy', 'Elevar (m)', 0, 0.2, 0.01)] },
  owall: { label: 'Pared de oficina', group: 'Oficina', defaults: { len: 10, h: 2.6, gap: 0, gw: 0, glass: false }, fields: [num('len', 'Largo (m)', 2, 90), num('h', 'Alto (m)', 1.2, 4, 0.1), num('gap', 'Centro de la puerta (m)', -45, 45, 0.5), num('gw', 'Ancho de la puerta (0 = sin)', 0, 8, 0.5), bool('glass', 'Vidrio')] },
  deskrow: { label: 'Fila de escritorios', group: 'Oficina', defaults: { n: 6, occ: 0.6, seed: 1 }, fields: [num('n', 'Puestos por lado', 2, 10), num('occ', 'Ocupación', 0, 1, 0.1), num('seed', 'Semilla', 1, 99)] },
  meettable: { label: 'Mesa de reuniones', group: 'Oficina', defaults: { len: 8, seed: 1 }, fields: [num('len', 'Largo (m)', 3, 14, 0.5), num('seed', 'Semilla', 1, 99)] },
  prop: { label: 'Mobiliario', group: 'Oficina', defaults: { kind: 'printer', len: 4, color: '#6b7c93' }, fields: [sel('kind', 'Tipo', PROP_KINDS), num('len', 'Largo (m)', 1, 14, 0.5), text('color', 'Color (sofá, puf)')] },
  plant: { label: 'Planta', group: 'Oficina', instanced: true, defaults: { kind: 'tall' }, fields: [sel('kind', 'Tipo', ['tall', 'bush'])] },
  osign: { label: 'Letrero de zona', group: 'Oficina', defaults: { text: 'ZONA', w: 6, h: 0.9, color: '#4f9dff', y: 2.2 }, fields: [text('text', 'Texto'), num('w', 'Ancho', 2, 16, 0.5), num('h', 'Alto', 0.4, 2, 0.1), text('color', 'Color'), num('y', 'Altura', 0.5, 6, 0.1)] },
}
export function officePiece(it) {
  switch (it.type) {
    case 'ofloor': return buildOFloor(it)
    case 'owall': return buildOWall(it)
    case 'deskrow': return buildDeskRow(it)
    case 'meettable': return buildMeetTable(it)
    case 'prop': return buildProp(it)
    case 'plant': return buildPlant(it)
    case 'osign': return buildOSign(it)
    default: return undefined
  }
}
export const OFFICE_LABELS = { work: () => tr('ÁREA DE TRABAJO', 'WORKSPACE'), meet: () => tr('SALA DE REUNIONES', 'MEETING ROOM'), boss: () => tr('OFICINA DEL GERENTE', "MANAGER'S OFFICE"), lounge: () => tr('LOUNGE', 'LOUNGE'), kitchen: () => tr('COCINA', 'KITCHEN') }
