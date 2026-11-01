import * as THREE from 'three'

// Interiores y emblemas PROPIOS de cada academia (antes todas usaban el mismo laboratorio/aula). Cada función recibe
// un contexto del edificio en construcción (campusKit.buildBuilding): { Fx (mobiliario), yy (piso del nivel), lv, floors,
// fh, iw, id, x0, x1, z0, z1, R (azar), inStair } y dibuja con los mismos meshers (M sólido, E emisivo, C colisión).
const GREENS = ['#39ff8a', '#27d6a0', '#7dff5a', '#2fb8ff']
const FLAGS = [['#d52b1e', '#ffffff', '#d52b1e', 'h'], ['#0055a4', '#ffffff', '#ef4135', 'v'], ['#009246', '#ffffff', '#ce2b37', 'v'], ['#000000', '#dd0000', '#ffce00', 'h'], ['#aa151b', '#f1bf00', '#aa151b', 'h'], ['#ffffff', '#bc002d', '#ffffff', 'h'], ['#006847', '#ffffff', '#ce1126', 'v'], ['#1d7a46', '#ffffff', '#1d7a46', 'h'], ['#ff9933', '#ffffff', '#138808', 'h'], ['#0039a6', '#d52b1e', '#ffffff', 'h']]

function flag(Fx, x, y, z, ry, i) { // poste + bandera de 3 franjas (h = horizontales, v = verticales)
  const [a, b, c, dir] = FLAGS[i % FLAGS.length], M = Fx.M
  M.cyl(x, y, z, 0.06, 4.2, 5, '#c9ccd1'); M.ball(x, y + 4.25, z, 0.1, '#e0b84c')
  const cs = Math.cos(ry), sn = Math.sin(ry), at = (u, v) => [x + u * cs + v * sn, z - u * sn + v * cs]
  ;[a, b, c].forEach((hex, k) => {
    const [fx, fz] = dir === 'h' ? at(0.75, 0) : at(0.25 + k * 0.5, 0)
    if (dir === 'h') M.box(fx, y + 3.7 - k * 0.32, fz, 1.5, 0.32, 0.05, hex, ry)
    else M.box(fx, y + 2.76, fz, 0.5, 0.96, 0.05, hex, ry)
  })
}

function tux(Fx, x, y, z, s = 1, ry = 0) { // pingüino: cuerpo, panza blanca, pico y patas naranjas
  const M = Fx.M, c = Math.cos(ry), n = Math.sin(ry), at = (u, v) => [x + u * c + v * n, z - u * n + v * c]
  M.ball(x, y + 0.9 * s, z, 0.8 * s, '#1c1f26', 1.3)
  const [bx, bz] = at(0, 0.46 * s); M.ball(bx, y + 0.85 * s, bz, 0.58 * s, '#f4f4f0', 1.25)
  M.ball(x, y + 2.15 * s, z, 0.5 * s, '#1c1f26')
  for (const sx of [-1, 1]) { const [ex, ez] = at(sx * 0.2 * s, 0.42 * s); M.ball(ex, y + 2.25 * s, ez, 0.12 * s, '#ffffff'); const [px, pz] = at(sx * 0.2 * s, 0.52 * s); M.ball(px, y + 2.25 * s, pz, 0.05 * s, '#111'); const [fx, fz] = at(sx * 0.3 * s, 0.35 * s); M.box(fx, y, fz, 0.42 * s, 0.1 * s, 0.6 * s, '#f59e0b', ry); const [wx, wz] = at(sx * 0.82 * s, 0); M.box(wx, y + 0.8 * s, wz, 0.14 * s, 0.9 * s, 0.4 * s, '#1c1f26', ry) }
  const [kx, kz] = at(0, 0.58 * s); M.box(kx, y + 2.05 * s, kz, 0.28 * s, 0.1 * s, 0.3 * s, '#f59e0b', ry)
  Fx.C.box(x, y, z, 1.8 * s, 2.7 * s, 1.5 * s, '#fff')
}

// estación de trabajo con pantalla de color (flip = mirando al otro lado)
const ws = (Fx, x, y, z, flip, color) => {
  Fx.desk(x, y, z, flip ? Math.PI : 0)
  Fx.E.box(x - 0.1, y + 0.8, z + (flip ? 0.06 : -0.06), 0.4, 0.24, 0.012, color); Fx.E.box(x + 0.18, y + 0.8, z + (flip ? 0.06 : -0.06), 0.2, 0.24, 0.012, color)
}
const codeWall = (Fx, x, y, z, w, h, R, colors = GREENS) => { // panel de "código": líneas de colores sobre fondo oscuro
  Fx.E.box(x, y, z, w, h, 0.05, '#06140d')
  for (let j = 0; j < Math.floor(h / 0.28) - 1; j++) { let u = -w / 2 + 0.4 + R() * 1.5; const ind = Math.floor(R() * 3) * 0.6; u += ind; while (u < w / 2 - 0.8 && R() > 0.04) { const l = 0.3 + R() * 1.6; Fx.E.box(x + u + l / 2, y + 0.2 + j * 0.28, z + 0.03, l, 0.1, 0.02, colors[Math.floor(R() * colors.length)]); u += l + 0.2 } }
}
const rack = (Fx, x, y, z, ry, R, led = '#39ff8a') => { // rack de servidores con LEDs en la cara que mira hacia `ry`
  const fx = Math.round(Math.sin(ry)), fz = Math.round(Math.cos(ry))
  Fx.M.box(x, y, z, 0.9, 2.3, 0.9, '#1d2229')
  for (let i = 0; i < 9; i++) { const lat = (R() - 0.5) * 0.5; Fx.E.box(x + fx * 0.46 + lat * fz, y + 0.2 + i * 0.24, z + fz * 0.46 - lat * fx, fx ? 0.02 : 0.5, 0.06, fx ? 0.5 : 0.02, R() > 0.25 ? led : '#ff3b3b') }
  Fx.block(x, y, z, 0.9, 2.3, 0.9, 0)
}
const globe = (Fx, x, y, z, r) => { // globo terráqueo: océano + continentes + anillo dorado
  const M = Fx.M
  M.cyl(x, y, z, 0.7, 0.3, 10, '#8a6a47', 0.5); M.cyl(x, y + 0.3, z, 0.12, r * 0.9, 6, '#cfc6b0')
  M.ball(x, y + r + 0.9, z, r, '#2f78c5')
  for (const [ox, oy, oz, s] of [[0.5, 0.4, 0.8, 0.5], [-0.6, 0.2, 0.7, 0.45], [0.1, -0.5, 0.85, 0.4], [-0.3, 0.7, 0.55, 0.35], [0.8, -0.1, 0.5, 0.3]]) M.ball(x + ox * r, y + r + 0.9 + oy * r, z + oz * r, s * r * 0.55, '#4fa656')
  M.add(new THREE.TorusGeometry(r * 1.12, 0.05, 6, 28).rotateX(Math.PI / 2), '#e0b84c', x, y + r + 0.9, z)
  Fx.C.box(x, y, z, r * 2, r * 2 + 1, r * 2, '#fff')
}
const bust = (Fx, x, y, z, hex = '#e8e0cf') => { // busto sobre pedestal
  const M = Fx.M
  M.box(x, y, z, 0.7, 1.1, 0.7, '#cfc6b0'); M.box(x, y + 1.1, z, 0.5, 0.5, 0.35, hex); M.ball(x, y + 1.85, z, 0.27, hex); M.box(x, y + 2.0, z + 0.05, 0.36, 0.14, 0.3, '#d7cfbd')
  Fx.C.box(x, y, z, 0.7, 2.1, 0.7, '#fff')
}
const neuron = (Fx, x, y, z, h, R) => { // núcleo neuronal: columna luminosa, anillos y nodos conectados
  const E = Fx.E, M = Fx.M
  M.cyl(x, y, z, 1.6, 0.5, 12, '#12202c', 1.4); E.cyl(x, y + 0.5, z, 0.3, h, 8, '#7ff3ff')
  for (let i = 0; i < 6; i++) E.add(new THREE.TorusGeometry(1.2 + (i % 3) * 0.45, 0.04, 5, 28).rotateX(Math.PI / 2), i % 2 ? '#ff6bd6' : '#7ff3ff', x, y + 1.2 + i * (h / 6.5), z)
  const nodes = []
  for (let i = 0; i < 26; i++) { const a = i * 2.4, rr = 1.4 + (i % 5) * 0.5, ny = y + 0.9 + (i / 26) * (h - 0.6); nodes.push([x + Math.cos(a) * rr, ny, z + Math.sin(a) * rr]); E.ball(nodes[i][0], ny, nodes[i][2], 0.12 + R() * 0.08, i % 3 ? '#9ff7ff' : '#ff9be8') }
  for (let i = 0; i < nodes.length - 2; i += 2) { const [ax, ay, az] = nodes[i], [bx, by, bz] = nodes[i + 2]; E.box((ax + bx) / 2, Math.min(ay, by), (az + bz) / 2, Math.abs(ax - bx) + 0.04, Math.abs(ay - by) + 0.04, Math.abs(az - bz) + 0.04, '#3a7f96') }
  Fx.C.box(x, y, z, 3.2, 1, 3.2, '#fff'); Fx.lights.push([x, y + 2.4, z])
}

export const ACADEMY_INTERIORS = new Set(['prog', 'cyber', 'philo', 'ai', 'lang', 'linux'])
export const RING_INTERIORS = new Set(['library', 'ai']) // pisos altos en galería alrededor de un vacío central

export function furnishAcademy(kind, c) {
  const { Fx, yy, lv, iw, id, x0, x1, z0, z1, R, inStair } = c
  const cols = (n, w, pad = 2) => Array.from({ length: n }, (_, i) => -w / 2 + pad + ((w - 2 * pad) * (n === 1 ? 0.5 : i / (n - 1))))
  if (kind === 'prog') {
    if (lv === 0) {
      codeWall(Fx, 0, yy + 0.7, z0 + 0.3, iw * 0.7, 3.2, R)
      for (const [i, x] of cols(Math.max(3, Math.floor((iw - 8) / 4.2)), iw - 4, 3).entries()) for (let r = 0; r < 3; r++) { const z = z0 + 5 + r * 3.8; if (!inStair(x, z, lv)) ws(Fx, x, yy, z, false, GREENS[(i + r) % GREENS.length]) }
      Fx.board(x0 + 0.4, yy, -1, 7, Math.PI / 2); Fx.board(x1 - 0.4, yy, -1, 7, -Math.PI / 2)
      Fx.M.box(x1 - 3, yy, z1 - 3, 3.4, 1.1, 0.9, '#2b2f36'); Fx.M.box(x1 - 3, yy + 1.1, z1 - 3, 3.5, 0.08, 1.0, '#e8e2d0'); Fx.M.cyl(x1 - 2.2, yy + 1.18, z1 - 3, 0.2, 0.5, 8, '#b5653a'); Fx.E.box(x1 - 3.6, yy + 1.0, z1 - 2.5, 0.8, 0.2, 0.02, '#ffb347'); Fx.block(x1 - 3, yy, z1 - 3, 3.5, 1.2, 1, 0)
    } else {
      for (const x of cols(Math.max(2, Math.floor(iw / 7)), iw, 4)) for (const sz of [-1, 1]) { if (inStair(x, sz * 3, lv)) continue; ws(Fx, x, yy, sz * 3.4, sz > 0, GREENS[Math.floor(R() * 4)]) }
      for (let i = 0; i < 4; i++) { const x = x0 + 3 + i * 3; Fx.M.ball(x, yy + 0.35, z1 - 2.5, 0.6, ['#e5484d', '#3b82f6', '#eab308', '#22c55e'][i], 0.6) }
      for (let i = 0; i < 3; i++) rack(Fx, x1 - 1 - i, yy, z0 + 1.2, 0, R)
    }
  } else if (kind === 'cyber') {
    if (lv === 0) {
      for (let r = 0; r < 3; r++) for (let i = 0; i < 7; i++) Fx.E.box(-iw * 0.34 + i * (iw * 0.68 / 6), yy + 1.5 + r * 0.95, z0 + 0.3, 2.4, 0.8, 0.03, R() > 0.7 ? '#ffb020' : R() > 0.45 ? '#ff4040' : '#2dd4bf')
      Fx.M.cyl(0, yy, 0, 1.6, 0.9, 14, '#1a1f27', 1.4); Fx.E.cyl(0, yy + 0.9, 0, 1.2, 0.08, 14, '#59e6ff')
      for (let i = 0; i < 7; i++) { const a = i * 0.9; Fx.E.box(Math.cos(a) * 0.8, yy + 1.2 + (i % 3) * 0.25, Math.sin(a) * 0.8, 0.22, 0.4 + (i % 3) * 0.2, 0.22, i % 2 ? '#ff5a5a' : '#59e6ff') }
      Fx.block(0, yy, 0, 3.2, 1.6, 3.2, 0); Fx.lights.push([0, yy + 2.6, 0])
      for (let i = 0; i < 6; i++) { const a = Math.PI * (0.15 + i * 0.14), x = Math.cos(a) * 6.5, z = Math.sin(a) * 4.5 + 2; if (!inStair(x, z, lv)) ws(Fx, x, yy, z, true, '#ff4040') }
      for (let i = 0; i < Math.floor((id - 6) / 1.1); i++) { rack(Fx, x0 + 0.7, yy, z0 + 3 + i * 1.1, Math.PI / 2, R, '#ff3b3b'); rack(Fx, x1 - 0.7, yy, z0 + 3 + i * 1.1, -Math.PI / 2, R, '#2dd4bf') }
      Fx.E.box(0, yy + c.fh - 0.8, z1 - 0.4, 3, 0.18, 0.05, '#ff2a2a')
    } else {
      for (let i = 0; i < 4; i++) { const x = cols(4, iw, 4)[i]; Fx.M.box(x, yy, 0, 3, 0.1, 3, '#151a21'); for (const [cx, cz] of [[-1.5, -1.5], [1.5, -1.5], [-1.5, 1.5], [1.5, 1.5]]) Fx.M.box(x + cx * 0.97, yy, cz * 0.97, 0.08, 2.4, 0.08, '#3a4350'); Fx.table(x, yy, 0, 1.6, 0.8, 0, '#2b323c'); Fx.E.box(x, yy + 0.9, 0.0, 0.5, 0.3, 0.02, '#39ff8a') }
      for (const sz of [-1, 1]) for (let i = 0; i < 4; i++) ws(Fx, cols(4, iw, 3)[i], yy, sz * 6.5, sz > 0, '#ff4040')
    }
  } else if (kind === 'philo') {
    if (lv === 0) {
      for (const sx of [-1, 1]) for (let i = 0; i < Math.floor((id - 6) / 4.4); i++) { const z = z0 + 3.5 + i * 4.4, x = sx * iw * 0.24; Fx.M.cyl(x, yy, z, 0.62, 3.8, 10, '#efe6d4', 0.52); Fx.M.box(x, yy + 3.8, z, 1.4, 0.3, 1.4, '#efe6d4'); Fx.M.box(x, yy, z, 1.4, 0.3, 1.4, '#d8cdb6'); Fx.block(x, yy, z, 1.2, 4, 1.2, 0); if (i % 2 === 0) bust(Fx, sx * (iw * 0.24 + 3), yy, z + 2.2, ['#e8e0cf', '#dcd2bd', '#efe6d4'][i % 3]) }
      Fx.M.box(0, yy, 1, 8, 0.4, 3.2, '#d8cdb6'); Fx.M.box(0, yy + 0.4, 1, 7.4, 0.06, 2.6, '#9a3b3b'); Fx.block(0, yy, 1, 8, 0.5, 3.2, 0)
      for (let i = 0; i < 3; i++) Fx.frameArt(-iw * 0.28 + i * (iw * 0.28), yy + 1.6, z0 + 0.35, 0, 3.4, 2.4)
      for (let i = 0; i < 4; i++) Fx.shelf(x0 + 0.4, yy, z0 + 3 + i * 3.2, 3, Math.PI / 2, 3, R)
      Fx.lights.push([0, yy + c.fh - 1.2, z0 + 4])
    } else {
      for (let i = 0; i < Math.floor(iw / 3.6); i++) Fx.shelf(x0 + 2.2 + i * 3.6, yy, z0 + 0.4, 3.2, 0, 3, R)
      for (const x of cols(Math.max(2, Math.floor(iw / 8)), iw, 5)) { Fx.table(x, yy, 1, 3.2, 1.3, 0, '#7a5a3b'); Fx.chair(x - 0.8, yy, -0.5, 0); Fx.chair(x + 0.8, yy, -0.5, 0); Fx.chair(x - 0.8, yy, 2.5, Math.PI); Fx.chair(x + 0.8, yy, 2.5, Math.PI) }
    }
  } else if (kind === 'ai') {
    if (lv === 0) {
      neuron(Fx, 0, yy, 0, Math.max(3.5, c.floors * c.fh - 1.8), R)
      for (let i = 0; i < Math.floor((id - 5) / 1.1); i++) { rack(Fx, x0 + 0.7, yy, z0 + 2.5 + i * 1.1, Math.PI / 2, R, '#7ff3ff'); rack(Fx, x1 - 0.7, yy, z0 + 2.5 + i * 1.1, -Math.PI / 2, R, '#ff6bd6') }
      for (const x of cols(4, iw * 0.6, 2)) ws(Fx, x, yy, z1 - 3, true, '#7ff3ff')
      // robot guía
      Fx.M.box(-5, yy, 5, 0.9, 1.1, 0.6, '#dfe8ee'); Fx.M.box(-5, yy + 1.1, 5, 0.7, 0.8, 0.5, '#cfd9e0'); Fx.M.ball(-5, yy + 2.15, 5, 0.38, '#eef3f6'); Fx.E.box(-5, yy + 2.1, 5.3, 0.4, 0.1, 0.02, '#7ff3ff'); Fx.M.cyl(-5, yy + 2.5, 5, 0.03, 0.4, 4, '#c9ccd1'); Fx.C.box(-5, yy, 5, 1, 2.6, 0.8, '#fff')
    } else {
      for (let i = 0; i < Math.floor((id - 4) / 3); i++) { const z = z0 + 1.5 + i * 3; if (!inStair(x0 + 3, z, lv)) { ws(Fx, x0 + 2.6, yy, z, false, '#7ff3ff'); ws(Fx, x1 - 2.6, yy, z, false, '#ff6bd6') } }
      Fx.E.box(0, yy + 0.2, z0 + 3, iw * 0.4, 0.06, 0.2, '#7ff3ff')
    }
  } else if (kind === 'lang') {
    if (lv === 0) {
      globe(Fx, 0, yy, 0, 1.7)
      for (let i = 0; i < Math.floor((id - 3) / 3.2); i++) { flag(Fx, x0 + 0.9, yy, z0 + 2 + i * 3.2, Math.PI / 2, i); flag(Fx, x1 - 0.9, yy, z0 + 2 + i * 3.2, -Math.PI / 2, i + 5) }
      for (let i = 0; i < 6; i++) { const a = i / 6 * 6.28, tx = Math.cos(a) * 6.8, tz = Math.sin(a) * 3.8 + 0.5; if (inStair(tx, tz, lv)) continue; Fx.M.cyl(tx, yy, tz, 0.9, 0.78, 12, '#c8a46a', 0.9); Fx.M.cyl(tx, yy, tz, 0.12, 0.78, 6, '#6d4b30'); Fx.block(tx, yy, tz, 1.8, 0.9, 1.8, 0); for (let k = 0; k < 4; k++) Fx.chair(tx + Math.cos(k * 1.57 + 0.7) * 1.35, yy, tz + Math.sin(k * 1.57 + 0.7) * 1.35, -(k * 1.57 + 0.7) + Math.PI / 2) }
      for (let i = 0; i < 4; i++) { const x = cols(4, iw * 0.6, 1)[i]; Fx.M.box(x, yy, z1 - 1.6, 1.8, 2.3, 1.4, '#e8dec8'); Fx.E.box(x, yy + 1.2, z1 - 0.9, 1.2, 0.7, 0.03, '#7fd6ff'); Fx.block(x, yy, z1 - 1.6, 1.8, 2.3, 1.4, 0) }
    } else {
      for (const x of cols(Math.max(2, Math.floor((iw - 6) / 5)), iw, 4)) for (let r = 0; r < 2; r++) { Fx.desk(x, yy, -1.5 + r * 3.6, 0); Fx.chair(x, yy, -0.2 + r * 3.6, Math.PI) }
      Fx.board(0, yy, z0 + 0.4, 7); Fx.frameArt(-iw * 0.3, yy + 1.7, z0 + 0.35, 0, 3.2, 2); Fx.frameArt(iw * 0.3, yy + 1.7, z0 + 0.35, 0, 3.2, 2)
      for (let i = 0; i < 5; i++) flag(Fx, x0 + 3 + i * 3, yy, z1 - 1.2, 0, i + 2)
    }
  } else if (kind === 'linux') {
    if (lv === 0) {
      Fx.M.cyl(0, yy, 0, 2.2, 0.5, 14, '#2b2f36', 2.0); Fx.M.cyl(0, yy + 0.5, 0, 1.6, 0.3, 14, '#e8dec8', 1.5); tux(Fx, 0, yy + 0.8, 0, 1.5, 0)
      Fx.E.box(0, yy + 0.2, 2.1, 2.4, 0.18, 0.02, '#39ff8a')
      for (const [i, x] of cols(Math.max(3, Math.floor((iw - 6) / 4.4)), iw - 2, 3).entries()) for (let r = 0; r < 2; r++) { const z = z0 + 3.5 + r * 4; if (Math.abs(x) < 4 && z > -3) continue; Fx.desk(x, yy, z, 0); Fx.M.box(x, yy + 0.8, z - 0.1, 0.56, 0.44, 0.5, '#d7cfba'); Fx.E.box(x, yy + 0.87, z + 0.17, 0.42, 0.3, 0.015, GREENS[(i + r) % 2 ? 0 : 2]); Fx.E.box(x - 0.1, yy + 0.97, z + 0.178, 0.14, 0.03, 0.012, '#0b3d1f'); Fx.E.box(x + 0.05, yy + 0.9, z + 0.178, 0.22, 0.03, 0.012, '#0b3d1f') }
      for (let i = 0; i < 3; i++) rack(Fx, x1 - 0.8, yy, z0 + 2 + i * 1.2, -Math.PI / 2, R, '#facc15')
      Fx.E.box(x0 + 0.3, yy + 2.2, 0, 0.04, 1.2, 4.6, '#06140d'); Fx.E.box(x0 + 0.33, yy + 2.5, -1.0, 0.02, 0.18, 2.2, '#39ff8a'); Fx.E.box(x0 + 0.33, yy + 2.1, 0.6, 0.02, 0.18, 3.2, '#39ff8a')
    } else {
      for (const sx of [-1, 1]) for (let i = 0; i < 3; i++) Fx.sofa(sx * 5.5, yy, -4 + i * 4, sx > 0 ? -Math.PI / 2 : Math.PI / 2, ['#1f2933', '#2a6f4f', '#f59e0b'][i])
      tux(Fx, 0, yy, -3, 0.8, 0.4); tux(Fx, 1.6, yy, 2.5, 0.55, -0.6)
      for (let i = 0; i < 5; i++) rack(Fx, x0 + 1.2 + i * 1.2, yy, z0 + 1.2, 0, R, '#facc15')
      for (let i = 0; i < 3; i++) Fx.frameArt(x1 - 0.4, yy + 1.7, -3 + i * 3, -Math.PI / 2, 1.6, 1.2)
    }
  }
}

// ── Emblemas exteriores (se agregan al techo / frente del edificio) ──────────
export function emblemAcademy(kind, c) {
  const { M, E, C, w, d, H, porchD, door } = c
  const fz = d / 2
  if (kind === 'prog') { // pantalla de código en el techo + antena
    E.box(0, H + 1.0, fz - 0.8, w * 0.62, 2.4, 0.2, '#06140d')
    for (let j = 0; j < 6; j++) { let u = -w * 0.28; while (u < w * 0.26) { const l = 0.8 + (Math.abs(j * 7 + u * 3) % 1.6); E.box(u + l / 2, H + 1.2 + j * 0.34, fz - 0.68, l, 0.14, 0.03, GREENS[(j + Math.floor(Math.abs(u))) % 4]); u += l + 0.35 } }
    M.cyl(w * 0.4, H, -d * 0.2, 0.12, 7, 5, '#c9ccd1'); E.ball(w * 0.4, H + 7.1, -d * 0.2, 0.3, '#ff3b3b')
  } else if (kind === 'cyber') { // escudo luminoso + antena parabólica
    E.box(0, H + 2.2, fz - 0.6, 5.2, 3.2, 0.3, '#ff2a2a'); E.add(new THREE.ConeGeometry(3.7, 1.8, 4).rotateX(Math.PI).rotateY(Math.PI / 4).scale(1, 1, 0.08), '#ff2a2a', 0, H + 1.3, fz - 0.6)
    E.box(0, H + 2.6, fz - 0.42, 1.8, 1.4, 0.1, '#1a0606'); E.box(0, H + 3.9, fz - 0.42, 0.9, 0.8, 0.1, '#1a0606')
    M.cyl(-w * 0.3, H, 0, 0.3, 3, 6, '#3a4350'); M.add(new THREE.SphereGeometry(2.2, 12, 6, 0, 6.283, 0, 1.2).rotateX(-0.7), '#c9ccd1', -w * 0.3, H + 3.5, 0)
  } else if (kind === 'philo') { // lechuza de Atenea dorada sobre el frontón
    const y = H + 2.9 + 0.6, z = fz + porchD / 2
    M.ball(0, y + 0.9, z, 0.85, '#e0b84c', 1.25); M.ball(0, y + 2.1, z, 0.6, '#e0b84c'); M.cone(-0.3, y + 2.6, z, 0.18, 0.4, 4, '#e0b84c'); M.cone(0.3, y + 2.6, z, 0.18, 0.4, 4, '#e0b84c')
    for (const sx of [-1, 1]) { E.ball(sx * 0.24, y + 2.15, z + 0.48, 0.14, '#ffffff'); M.ball(sx * 0.24, y + 2.15, z + 0.58, 0.06, '#222'); M.box(sx * 0.9, y + 0.5, z, 0.2, 1.3, 0.7, '#caa43d') }
    M.box(0, y - 0.6, z, 2.2, 0.6, 1.4, '#d8cdb6'); M.cone(0, y + 1.9, z + 0.55, 0.12, 0.3, 4, '#f59e0b')
  } else if (kind === 'ia') { // halo luminoso con satélites sobre la cúpula
    const r = Math.min(w, d) * 0.3, y = H + 8
    E.add(new THREE.TorusGeometry(r, 0.12, 6, 40).rotateX(Math.PI / 2), '#7ff3ff', 0, y, 0); E.add(new THREE.TorusGeometry(r * 0.7, 0.1, 6, 36).rotateX(Math.PI / 2 + 0.5), '#ff6bd6', 0, y, 0)
    E.ball(0, y, 0, 0.9, '#bff9ff'); for (let i = 0; i < 4; i++) E.ball(Math.cos(i * 1.57) * r, y, Math.sin(i * 1.57) * r, 0.3, '#ff9be8')
    E.box(0, H + 0.5, fz - 0.4, w * 0.5, 0.25, 0.1, '#7ff3ff')
  } else if (kind === 'lang') { // banderas en el alero + globo sobre el frontón
    for (let i = 0; i < 8; i++) { const x = -w / 2 + 2.5 + i * ((w - 5) / 7); M.cyl(x, H - 0.4, fz - 0.3, 0.06, 3.2, 5, '#c9ccd1'); const f = FLAGS[i % FLAGS.length]; f.slice(0, 3).forEach((hex, k) => M.box(x + 0.7, H + 2.4 - k * 0.3, fz - 0.3, 1.4, 0.3, 0.05, hex)) }
    const z = fz + porchD / 2, y = H + 2.9 + 0.5
    M.ball(0, y + 1.1, z, 1.0, '#2f78c5'); M.ball(0.4, y + 1.4, z + 0.7, 0.4, '#4fa656'); M.ball(-0.5, y + 0.8, z + 0.7, 0.3, '#4fa656'); M.add(new THREE.TorusGeometry(1.15, 0.05, 6, 24).rotateX(Math.PI / 2), '#e0b84c', 0, y + 1.1, z)
  } else if (kind === 'linux') { // Tux monumental junto a la puerta
    const x = door / 2 + 4.5, zz = fz + 3.4
    M.box(x, 0, zz, 3.2, 1.0, 3.2, '#cfc6b0'); M.box(x, 1.0, zz, 3.6, 0.25, 3.6, '#a69d8a'); tux({ M, C }, x, 1.25, zz, 1.5, 0)
    E.box(x, 0.4, zz + 1.62, 2.4, 0.22, 0.03, '#39ff8a')
  }
}
