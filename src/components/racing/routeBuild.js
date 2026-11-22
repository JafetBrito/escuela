import * as THREE from 'three'
import { Mesher } from '../vr/campus/mesher'
import { ROUTE, routeLength, stationPos } from './racingData'

// La RUTA DE REPASO: una avenida recta y tranquila, aparte de la pista (a ROUTE.x0 metros de distancia), con una ESTACIÓN por cada tramo
// de la explicación: un cartel enorme con una imagen y el texto, entre dos columnas. El vehículo se detiene antes de cada estación
// mientras el locutor la cuenta, y al final hay un arco para volver a la carrera. El motor la maneja (`startDetour`); aquí solo se dibuja.
export const ROUTE_PAL = { sky: '#10163a', fog: '#171f4a', ground: '#141b40', ground2: '#1a2350', road: '#2b3566' }

// Punto de la ruta: x = x0 + lateral, z = -avance, y = 0
export const routePoint = (rs, ru = 0, out = { x: 0, y: 0, z: 0 }) => { out.x = ROUTE.x0 + ru; out.y = 0; out.z = -rs; return out }

export function buildRoute(world, n) {
  const M = new Mesher(), G = new Mesher(), len = routeLength(n), x0 = ROUTE.x0, color = world.color
  M.box(x0, -0.6, -len / 2, 1200, 0.5, len + 600, ROUTE_PAL.ground) // suelo
  M.box(x0, -0.1, -len / 2, 16, 0.2, len + 80, ROUTE_PAL.road) // camino
  for (let r = -20; r < len + 30; r += 6) { M.box(x0 - 8.4, 0, -r, 0.6, 0.9, 5.2, r % 12 ? '#e9e9e9' : color); M.box(x0 + 8.4, 0, -r, 0.6, 0.9, 5.2, r % 12 ? '#e9e9e9' : color) } // barreras
  for (const sg of [-1, 1]) G.box(x0 + sg * 7.6, 0.12, -len / 2, 0.3, 0.06, len + 60, color) // luces de borde
  // faroles a los lados
  for (let r = 30; r < len; r += 40) for (const sg of [-1, 1]) { M.cyl(x0 + sg * 13, 0, -r, 0.4, 7, 6, '#2b2f38', 0.25); G.ball(x0 + sg * 13, 7.4, -r, 0.7, color) }
  const boards = []
  for (let i = 0; i < n; i++) {
    const z = -stationPos(i)
    for (const sg of [-1, 1]) { M.cyl(x0 + sg * 10.5, 0, z, 0.9, 12, 8, '#e8e3d6', 0.75); M.box(x0 + sg * 10.5, 12, z, 2.4, 0.6, 2.4, '#cfc8b4') } // columnas
    M.box(x0, 12, z, 23, 0.7, 1.4, '#cfc8b4')
    G.box(x0, 0.02, z + 14, 15, 0.06, 0.5, color) // marca en el piso justo antes de cada cartel
    boards.push({ x: x0, y: 6.4, z: z + 0.2, w: 13, h: 6.6 })
  }
  const ze = -(len - 24)
  for (const sg of [-1, 1]) M.box(x0 + sg * 9.5, 0, ze, 1.4, 11, 1.4, '#2b2f38')
  M.box(x0, 11, ze, 21, 1.2, 1.4, '#2b2f38'); G.box(x0, 11, ze + 0.75, 19, 0.5, 0.1, color)
  return { solid: M.build(), glow: G.build(), boards, endBoard: { x: x0, y: 8.3, z: ze + 0.8, w: 14, h: 2.4 } }
}

// Cartel de una estación: imagen (emoji) grande a la izquierda, título y texto partido en líneas
export function stationTexture({ img, title, text }, color) {
  const c = document.createElement('canvas'); c.width = 1024; c.height = 520
  const x = c.getContext('2d')
  x.fillStyle = '#0c1226'; x.fillRect(0, 0, 1024, 520); x.lineWidth = 14; x.strokeStyle = color; x.strokeRect(8, 8, 1008, 504)
  x.textBaseline = 'middle'; x.textAlign = 'center'; x.font = '190px "Segoe UI Emoji","Apple Color Emoji","Noto Color Emoji",sans-serif'; x.fillStyle = '#fff'
  x.fillText(img || '💡', 150, 150)
  x.textAlign = 'left'; x.fillStyle = color; x.font = 'bold 54px Arial'
  x.fillText(title, 290, 120, 690)
  x.fillStyle = '#ffffff'; x.textBaseline = 'top'
  let size = 40, lines = []
  for (; size >= 24; size -= 2) {
    x.font = `${size}px Arial`; lines = []
    let cur = ''
    for (const w of (text || '').split(' ')) { const t = cur ? `${cur} ${w}` : w; if (x.measureText(t).width > 940 && cur) { lines.push(cur); cur = w } else cur = t }
    lines.push(cur)
    if (lines.length * size * 1.28 < 280) break
  }
  lines.forEach((l, i) => x.fillText(l, 42, 235 + i * size * 1.28))
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4
  return t
}
