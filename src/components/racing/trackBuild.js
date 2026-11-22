import * as THREE from 'three'
import { Mesher } from '../vr/campus/mesher'
import { RACE, trackLength, laneBounds, medianHalf } from './racingData'
import { frame, ribbon } from './track'

// Construye la pista de una partida: terreno, asfalto (partido en 2 o 3 carriles en cada bifurcación), muros centrales, barreras,
// pórticos y el escenario de CADA MISIÓN (hospital, jardín, ciudad / servidores, red, núcleo de IA / ágora, caverna, sol), con su
// propia paleta. Devuelve geometrías listas para meter en <mesh> y los carteles fijos (salida, meta, inicio de misión). Los carteles
// con las respuestas son dinámicos (la pregunta se elige al acercarse) y se arman en la escena con `bannerTexture`.
const hash = (a, b) => { const s = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return s - Math.floor(s) }
const tone = (hex, d) => new THREE.Color(hex).offsetHSL(0, 0, d).getStyle()

// ── Escenarios: cada uno coloca UN elemento de decorado en el punto p (junto a la pista) ──
const SCATTER = {
  garden(M, G, p, k) {
    if (k > 0.8) { M.box(p.x, p.y - 0.5, p.z, 0.4, 4.5, 0.4, '#e9e9e9'); G.box(p.x, p.y + 3.6, p.z + 0.25, 2.2, 0.6, 0.1, '#ef4444'); G.box(p.x, p.y + 3.6, p.z + 0.25, 0.6, 2.2, 0.1, '#ef4444') }
    else { M.cyl(p.x, p.y - 0.5, p.z, 0.4, 2, 5, '#6b4b2a', 0.3); M.cone(p.x, p.y + 1.2, p.z, 2.4 + k * 1.2, 5 + k * 3, 6, k > 0.4 ? '#4fa86a' : '#3f8f5a'); M.cone(p.x, p.y + 4.8 + k * 2, p.z, 1.4, 3, 6, '#f4faff') }
  },
  city(M, G, p, k, i) {
    const h = 12 + k * 34, w = 7 + hash(i, 5) * 6
    M.box(p.x, p.y - 0.5, p.z, w, h, w, ['#8b93a1', '#a9b0bd', '#7c8696', '#b9a99a'][i % 4], p.yaw)
    for (let r = 0; r < 4; r++) M.box(p.x, p.y + 2 + r * (h / 4.5), p.z, w + 0.2, 0.5, w + 0.2, '#d9e2ee', p.yaw)
    if (k > 0.7) G.box(p.x, p.y + h * 0.7, p.z, 0.8, 3, 0.8, '#ef4444')
  },
  servers(M, G, p, k) {
    const h = 5 + k * 16; M.box(p.x, p.y - 0.5, p.z, 2.4, h, 2.4, '#141a28'); G.box(p.x, p.y + h * 0.4, p.z + 1.25, 1.6, 0.18, 0.05, k > 0.5 ? '#22c55e' : '#38bdf8'); G.box(p.x, p.y + h * 0.75, p.z + 1.25, 1.6, 0.18, 0.05, '#a855f7')
  },
  matrix(M, G, p, k, i) { // columnas de "lluvia de código" y bloques flotantes
    const h = 8 + k * 30; G.box(p.x, p.y + h / 2, p.z, 0.5, h, 0.5, i % 3 ? '#16a34a' : '#4ade80'); M.box(p.x, p.y - 0.5, p.z, 1.4, 1, 1.4, '#052e16')
    if (k > 0.5) G.box(p.x + 2, p.y + 6 + k * 8, p.z, 1.2, 1.2, 1.2, '#86efac')
  },
  neon(M, G, p, k, i) {
    const h = 6 + k * 18; M.cone(p.x, p.y - 0.5, p.z, 3.4, h, 4, '#1c0f2e', k * 6); G.cone(p.x, p.y - 0.4, p.z, 3.5, h * 1.02, 4, i % 2 ? '#d946ef' : '#22d3ee', k * 6 + 0.78)
  },
  agora(M, G, p, k) {
    if (k > 0.45) { const h = 6 + k * 5; M.cyl(p.x, p.y - 0.5, p.z, 0.9, h, 8, '#f3ecd8', 0.75); M.box(p.x, p.y - 0.5 + h, p.z, 2.4, 0.6, 2.4, '#d9ceb0'); M.box(p.x, p.y - 0.5, p.z, 2.6, 0.5, 2.6, '#d9ceb0') }
    else { M.cyl(p.x, p.y - 0.5, p.z, 0.4, 2.6, 5, '#6b4b2a', 0.3); M.ball(p.x, p.y + 3.2, p.z, 2.2 + k * 1.5, '#7f9a4a', 0.8) }
  },
  cave(M, G, p, k, i) { // estalagmitas y braseros
    const h = 4 + k * 14; M.cone(p.x, p.y - 0.5, p.z, 2.2 + k * 2, h, 5, i % 2 ? '#3b2d22' : '#4a3a2c')
    if (k > 0.82) { M.cyl(p.x + 2, p.y - 0.5, p.z, 0.5, 1.6, 6, '#2b2118', 0.7); G.cone(p.x + 2, p.y + 1.1, p.z, 0.9, 2.6, 5, '#ff9f43') }
  },
  sun(M, G, p, k) {
    const h = 9 + k * 10; M.cyl(p.x, p.y - 0.5, p.z, 0.8, h, 8, '#fff8e1', 0.6); G.ball(p.x, p.y + h, p.z, 1.1, '#ffd24a')
    if (k > 0.6) G.box(p.x + 3, p.y + 0.3, p.z, 0.6, 0.6, 0.6, k > 0.8 ? '#fb7185' : '#fde047')
  },
}

// Escenarios lineales (muros continuos a ambos lados) para interiores: hospital y caverna
function hospitalWalls(M, G, sA, sB, p) {
  for (let s = sA, i = 0; s < sB; s += 6, i++) for (const sg of [-1, 1]) {
    frame(s, sg * 15, 0, p); M.box(p.x, p.y - 1, p.z, 0.9, 11, 6.3, '#f3f7f9', p.yaw)
    frame(s, sg * 14.45, 0, p); G.box(p.x, p.y + 6.5, p.z, 0.12, 0.3, 5.4, '#bfeaff', p.yaw)
    if (i % 5 === 2) { M.box(p.x, p.y, p.z, 0.3, 3.4, 2.6, '#3a7a96', p.yaw); G.box(p.x, p.y + 4.4, p.z, 0.2, 0.5, 1.6, '#ef4444', p.yaw); G.box(p.x, p.y + 4.4, p.z, 0.2, 1.6, 0.5, '#ef4444', p.yaw) }
    if (i % 5 === 4) { frame(s, sg * 13.2, 0, p); M.box(p.x, p.y, p.z, 1.0, 0.7, 2.2, '#ffffff', p.yaw); M.box(p.x, p.y + 0.7, p.z, 0.9, 0.12, 2.0, '#9fd3ee', p.yaw) } // camilla pegada al muro
  }
}
function caveWalls(M, G, sA, sB, p) {
  for (let s = sA, i = 0; s < sB; s += 6, i++) for (const sg of [-1, 1]) {
    const k = hash(i, sg * 7); frame(s, sg * (14.5 + k * 3), 0, p)
    M.box(p.x, p.y - 1, p.z, 3 + k * 3, 8 + k * 10, 5.4, k > 0.5 ? '#3b2d22' : '#4a3a2c', p.yaw)
    if (i % 8 === 3) { frame(s, sg * 12.8, 0, p); M.cyl(p.x, p.y - 0.4, p.z, 0.5, 1.8, 6, '#2b2118', 0.7); G.cone(p.x, p.y + 1.3, p.z, 1.0, 2.8, 5, '#ff9f43') }
  }
}

export function buildTrack(world, forks, missionStarts) {
  const L = trackLength(), half = RACE.roadHalf, len = RACE.forkLen
  const M = new Mesher(), G = new Mesher(), geos = [], glowGeos = [], banners = [], p = { x: 0, y: 0, z: 0, yaw: 0 }
  const missionAt = (s) => { let m = 0; while (m + 1 < missionStarts.length && s >= missionStarts[m + 1]) m++; return m }
  const palAt = (s) => world.missions[missionAt(s)].pal

  // terreno y asfalto (cada fila toma la paleta de la misión en que está)
  geos.push(ribbon(-80, L + 260, -260, 260, -0.45, (s, i) => (i % 2 ? palAt(s).ground : palAt(s).ground2), 14))
  const road = (s0, s1, u0, u1) => geos.push(ribbon(s0, s1, u0, u1, 0.02, (s, i) => tone(palAt(s).road, i % 2 ? 0.02 : 0), 6))
  let cursor = -40
  for (const f of forks) {
    road(cursor, f.start, -half, half)
    for (let i = 0; i < f.n; i++) { const lb = laneBounds(f.n, i); road(f.start, f.start + len, lb.from, lb.to) }
    cursor = f.start + len
  }
  road(cursor, L + 60, -half, half)
  for (const sg of [-1, 1]) glowGeos.push(ribbon(-40, L + 60, sg * (half - 0.45), sg * (half - 0.15), 0.05, (s) => palAt(s).accent, 6)) // bordes luminosos

  // barreras laterales y muros centrales (2 o 3 carriles)
  for (let s = -40, i = 0; s < L + 60; s += 6, i++) for (const sg of [-1, 1]) { frame(s, sg * (half + 0.35), 0, p); M.box(p.x, p.y - 0.9, p.z, 0.6, 1.8, 6.4, i % 4 < 2 ? '#f2f2f2' : palAt(s).accent, p.yaw) }
  for (const f of forks) {
    const w = (2 * half) / f.n, mh = medianHalf(f.n)
    for (let k = 1; k < f.n; k++) for (let s = f.start, i = 0; s < f.start + len; s += 6, i++) {
      frame(s, -half + k * w, 0, p); const nose = s < f.start + 9 ? 0.5 + (s - f.start) / 18 : 1
      M.box(p.x, p.y - 0.8, p.z, 2 * mh * nose, 2.4, 6.4, i % 2 ? '#e9e9e9' : '#cfd5da', p.yaw); G.box(p.x, p.y + 1.4, p.z, 0.3, 0.08, 6.0, palAt(s).accent, p.yaw)
    }
  }

  // arcos: salida, meta y el nombre de cada misión nueva
  const arch = (s, label, color) => {
    for (const sg of [-1, 1]) { frame(s, sg * (half + 0.9), 0, p); M.box(p.x, p.y - 0.4, p.z, 1.2, 9, 1.2, '#2b2f38', p.yaw) }
    frame(s, 0, 0, p); M.box(p.x, p.y + 8.2, p.z, 2 * (half + 1.5), 1.2, 1.2, '#2b2f38', p.yaw); G.box(p.x, p.y + 8.2, p.z + 0.65, 2 * half, 0.5, 0.1, color, p.yaw)
    banners.push({ x: p.x, y: p.y + 6.3, z: p.z + 0.7, yaw: p.yaw, w: 10, h: 2, text: label, label: '', color })
  }
  arch(14, 'SALIDA', palAt(14).accent); arch(L - 40, 'META', palAt(L - 40).accent)
  missionStarts.forEach((s, m) => { if (m > 0) arch(s + 60, world.missions[m].name.toUpperCase(), palAt(s + 60).accent) })

  // pórticos de las bifurcaciones (las respuestas se cuelgan dinámicamente en la escena)
  const gantries = []
  for (const f of forks) {
    const s = f.start - 6
    for (const sg of [-1, 1]) { frame(s, sg * (half + 0.9), 0, p); M.box(p.x, p.y - 0.4, p.z, 1.3, 9.6, 1.3, '#2b2f38', p.yaw) }
    frame(s, 0, 0, p); M.box(p.x, p.y + 9, p.z, 2 * (half + 1.6), 1.1, 1.1, '#2b2f38', p.yaw)
    gantries.push({ id: f.id, lanes: Array.from({ length: f.n }, (_, i) => { frame(s, laneBounds(f.n, i).center, 0, p); return { x: p.x, y: p.y + 6.6, z: p.z + 0.62, yaw: p.yaw, glowY: p.y + 8.3 } }) })
  }

  // decorado de cada misión
  world.missions.forEach((mis, m) => {
    const sA = m === 0 ? -40 : missionStarts[m], sB = m === world.missions.length - 1 ? L + 120 : missionStarts[m + 1]
    if (mis.deco === 'hospital') { hospitalWalls(M, G, sA, sB, p); return }
    if (mis.deco === 'cave') caveWalls(M, G, sA, sB, p)
    const draw = SCATTER[mis.deco]
    for (let s = sA, i = 0; s < sB; s += mis.deco === 'cave' ? 26 : 14, i++) for (const sg of [-1, 1]) {
      const r = hash(s, sg), u = sg * ((mis.deco === 'cave' ? 22 : 16) + r * 70)
      frame(s + hash(sg, s) * 8, u, 0, p)
      draw(M, G, p, hash(i, sg * 3), i)
    }
  })

  return { geos, glowGeos, solid: M.build(), glow: G.build(), banners, gantries }
}

// Cartel con una letra (A/B/C) y el texto de la respuesta partido en líneas
export function bannerTexture(label, text, color) {
  const c = document.createElement('canvas'); c.width = 1024; c.height = 320
  const x = c.getContext('2d')
  x.fillStyle = '#0c111b'; x.fillRect(0, 0, 1024, 320); x.lineWidth = 16; x.strokeStyle = color; x.strokeRect(8, 8, 1008, 304)
  x.textBaseline = 'middle'
  const left = label ? 230 : 40, maxW = label ? 740 : 940
  if (label) { x.fillStyle = color; x.font = 'bold 170px Arial'; x.textAlign = 'center'; x.fillText(label, 120, 165) }
  x.fillStyle = '#ffffff'; x.textAlign = label ? 'left' : 'center'
  let size = 66, lines = []
  for (; size >= 30; size -= 4) {
    x.font = `bold ${size}px Arial`; lines = []
    let cur = ''
    for (const w of text.split(' ')) { const t = cur ? `${cur} ${w}` : w; if (x.measureText(t).width > maxW && cur) { lines.push(cur); cur = w } else cur = t }
    lines.push(cur)
    if (lines.length * size * 1.15 < 260) break
  }
  lines.forEach((l, i) => x.fillText(l, label ? left : 512, 160 + (i - (lines.length - 1) / 2) * size * 1.15))
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4
  return t
}
