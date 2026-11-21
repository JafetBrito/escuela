import * as THREE from 'three'
import { Mesher } from '../vr/campus/mesher'
import { RACE, trackLength } from './racingData'
import { frame, ribbon } from './track'

// Construye la pista temática de una carrera: terreno, asfalto (dividido en dos carriles en cada bifurcación), muro central,
// barreras, líneas de borde, puestos de meta/salida, pórticos con las respuestas y el decorado de la clase (árboles y cruces,
// torres de servidores o columnas griegas). Devuelve geometrías listas para meter en <mesh> y la lista de carteles (banners).
const hash = (a, b) => { const s = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return s - Math.floor(s) }
const tone = (hex, d) => new THREE.Color(hex).offsetHSL(0, 0, d).getStyle()

export function buildTrack(cls, forks) {
  const L = trackLength(), half = RACE.roadHalf, med = RACE.median, len = RACE.forkLen
  const M = new Mesher(), G = new Mesher(), geos = [], glowGeos = [], banners = [], p = { x: 0, y: 0, z: 0, yaw: 0 }

  // terreno a ambos lados (dos tonos alternados) y asfalto
  geos.push(ribbon(-80, L + 260, -260, 260, -0.45, (s, i) => (i % 2 ? cls.ground : cls.ground2), 14))
  const road = (s0, s1, u0, u1) => geos.push(ribbon(s0, s1, u0, u1, 0.02, (s, i) => tone(cls.road, i % 2 ? 0.02 : 0), 6))
  let cursor = -40
  for (const f of forks) { road(cursor, f.start, -half, half); road(f.start, f.start + len, -half, -med); road(f.start, f.start + len, med, half); cursor = f.start + len }
  road(cursor, L + 60, -half, half)
  for (const sg of [-1, 1]) glowGeos.push(ribbon(-40, L + 60, sg * (half - 0.45), sg * (half - 0.15), 0.05, () => cls.accent, 6)) // líneas de borde luminosas

  // barreras laterales y muro central de cada bifurcación
  for (let s = -40, i = 0; s < L + 60; s += 3, i++) for (const sg of [-1, 1]) { frame(s, sg * (half + 0.35), 0, p); M.box(p.x, p.y - 0.4, p.z, 0.6, 1.1, 3.2, i % 4 < 2 ? '#f2f2f2' : cls.accent, p.yaw) }
  for (const f of forks) for (let s = f.start, i = 0; s < f.start + len; s += 3, i++) {
    frame(s, 0, 0, p); const nose = s < f.start + 9 ? 0.5 + (s - f.start) / 18 : 1
    M.box(p.x, p.y - 0.3, p.z, 2 * med * nose, 1.7, 3.2, i % 2 ? '#e9e9e9' : '#cfd5da', p.yaw); G.box(p.x, p.y + 1.4, p.z, 0.3, 0.08, 3.0, cls.accent, p.yaw)
  }

  // salida y meta: dos postes y un travesaño
  const arch = (s, label) => {
    for (const sg of [-1, 1]) { frame(s, sg * (half + 0.9), 0, p); M.box(p.x, p.y - 0.4, p.z, 1.2, 9, 1.2, '#2b2f38', p.yaw) }
    frame(s, 0, 0, p); M.box(p.x, p.y + 8.2, p.z, 2 * (half + 1.5), 1.2, 1.2, '#2b2f38', p.yaw); G.box(p.x, p.y + 8.2, p.z + 0.65, 2 * half, 0.5, 0.1, cls.accent, p.yaw)
    banners.push({ x: p.x, y: p.y + 6.3, z: p.z + 0.7, yaw: p.yaw, w: 9, h: 2, text: label, label: '', color: cls.accent })
  }
  arch(14, 'SALIDA'); arch(L - 40, 'META')

  // pórticos de las bifurcaciones: dos carteles (A izquierda, B derecha) con las respuestas
  const lane = (half + med) / 2
  for (const f of forks) {
    const s = f.start - 6
    for (const sg of [-1, 1]) { frame(s, sg * (half + 0.9), 0, p); M.box(p.x, p.y - 0.4, p.z, 1.3, 9.6, 1.3, '#2b2f38', p.yaw) }
    frame(s, 0, 0, p); M.box(p.x, p.y + 9, p.z, 2 * (half + 1.6), 1.1, 1.1, '#2b2f38', p.yaw)
    for (const [sg, lab, side] of [[-1, 'A', 'L'], [1, 'B', 'R']]) {
      frame(s, sg * lane, 0, p)
      banners.push({ x: p.x, y: p.y + 6.6, z: p.z + 0.62, yaw: p.yaw, w: 7.4, h: 2.3, label: lab, text: f.side === side ? f.ok : f.bad, color: cls.accent })
      G.box(p.x, p.y + 8.3, p.z, 6.4, 0.12, 0.2, cls.accent, p.yaw)
    }
  }

  // decorado de la clase a los lados
  for (let s = 0, i = 0; s < L + 120; s += 11, i++) for (const sg of [-1, 1]) {
    const r = hash(s, sg), u = sg * (16 + r * 70)
    frame(s + hash(sg, s) * 8, u, 0, p)
    const k = hash(i, sg * 3)
    if (cls.emblem === 'code') { // torres de servidores con luces
      const h = 5 + k * 16; M.box(p.x, p.y - 0.5, p.z, 2.4, h, 2.4, '#141a28'); G.box(p.x, p.y + h * 0.4, p.z + 1.25, 1.6, 0.18, 0.05, k > 0.5 ? '#22c55e' : '#38bdf8'); G.box(p.x, p.y + h * 0.75, p.z + 1.25, 1.6, 0.18, 0.05, '#a855f7')
    } else if (cls.emblem === 'omega') { // columnas griegas y olivos
      if (k > 0.45) { const h = 6 + k * 5; M.cyl(p.x, p.y - 0.5, p.z, 0.9, h, 8, '#f3ecd8', 0.75); M.box(p.x, p.y - 0.5 + h, p.z, 2.4, 0.6, 2.4, '#d9ceb0'); M.box(p.x, p.y - 0.5, p.z, 2.6, 0.5, 2.6, '#d9ceb0') }
      else { M.cyl(p.x, p.y - 0.5, p.z, 0.4, 2.6, 5, '#6b4b2a', 0.3); M.ball(p.x, p.y + 3.2, p.z, 2.2 + k * 1.5, '#7f9a4a', 0.8) }
    } else { // medicina: pinos y cruces rojas
      if (k > 0.8) { M.box(p.x, p.y - 0.5, p.z, 0.4, 4.5, 0.4, '#e9e9e9'); G.box(p.x, p.y + 3.6, p.z + 0.25, 2.2, 0.6, 0.1, '#ef4444'); G.box(p.x, p.y + 3.6, p.z + 0.25, 0.6, 2.2, 0.1, '#ef4444') }
      else { M.cyl(p.x, p.y - 0.5, p.z, 0.4, 2, 5, '#6b4b2a', 0.3); M.cone(p.x, p.y + 1.2, p.z, 2.4 + k * 1.2, 5 + k * 3, 6, k > 0.4 ? '#4fa86a' : '#3f8f5a'); M.cone(p.x, p.y + 4.8 + k * 2, p.z, 1.4, 3, 6, '#f4faff') }
    }
  }

  return { geos, glowGeos, solid: M.build(), glow: G.build(), banners }
}

// Cartel con una letra (A/B) y el texto de la respuesta partido en líneas
export function bannerTexture(label, text, color) {
  const c = document.createElement('canvas'); c.width = 1024; c.height = 320
  const x = c.getContext('2d')
  x.fillStyle = '#0c111b'; x.fillRect(0, 0, 1024, 320); x.lineWidth = 16; x.strokeStyle = color; x.strokeRect(8, 8, 1008, 304)
  x.textBaseline = 'middle'
  const left = label ? 230 : 40, maxW = label ? 740 : 940
  if (label) { x.fillStyle = color; x.font = 'bold 170px Arial'; x.textAlign = 'center'; x.fillText(label, 120, 165) }
  x.fillStyle = '#ffffff'; x.textAlign = label ? 'left' : 'center'
  let size = 66, lines = []
  for (; size >= 34; size -= 4) {
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
