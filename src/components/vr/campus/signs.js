import * as THREE from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'

// Letreros del mapa: cientos de carteles (cada puerta del hospital tiene uno) se dibujan en pocas hojas de
// textura ("atlas") y se funden en una malla por hoja → 3-4 draw calls en vez de 300.
// Cada letrero: { text, sub?, color?, x, y, z, ry, w, h } — (x, y, z) = centro-abajo del cartel, ya en metros del mapa.
const CW = 512, CH = 128, COLS = 4, ROWS = 16 // celdas de 512×128 en una hoja de 2048×2048
const PER = COLS * ROWS

function paintCell(g, ox, oy, s) {
  const a = s.w / s.h, sx = 4 / a // la celda es 4:1; si el cartel es más ancho se comprime el texto para que no se vea estirado
  g.save(); g.translate(ox, oy)
  g.fillStyle = s.bg || '#1f3d33'; g.fillRect(0, 0, CW, CH)
  g.fillStyle = s.color || '#e0b84c'; g.fillRect(0, 0, CW, 14); g.fillRect(0, CH - 6, CW, 6)
  g.save(); g.translate(CW / 2, s.sub ? 70 : 68); g.scale(Math.min(1, sx), 1)
  g.fillStyle = s.fg || '#fdfaf0'; g.textAlign = 'center'; g.textBaseline = 'middle'
  let size = s.sub ? 54 : 64
  g.font = `bold ${size}px Arial, sans-serif`
  const maxW = (CW - 40) / Math.min(1, sx)
  while (g.measureText(s.text).width > maxW && size > 22) { size -= 3; g.font = `bold ${size}px Arial, sans-serif` }
  g.fillText(s.text, 0, 0)
  g.restore()
  if (s.sub) { g.save(); g.translate(CW / 2, 108); g.scale(Math.min(1, sx), 1); g.font = '600 28px Arial, sans-serif'; g.fillStyle = 'rgba(255,255,255,0.8)'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(s.sub, 0, 0, (CW - 40) / Math.min(1, sx)); g.restore() }
  g.restore()
}

export function buildSigns(list) {
  const pages = []
  for (let p = 0; p * PER < list.length; p++) {
    const chunk = list.slice(p * PER, (p + 1) * PER), canvas = document.createElement('canvas')
    canvas.width = CW * COLS; canvas.height = CH * ROWS
    const g = canvas.getContext('2d'), geos = []
    chunk.forEach((s, i) => {
      const col = i % COLS, row = Math.floor(i / COLS)
      paintCell(g, col * CW, row * CH, s)
      const geo = new THREE.PlaneGeometry(s.w, s.h)
      const u0 = col / COLS, u1 = (col + 1) / COLS, v1 = 1 - row / ROWS, v0 = 1 - (row + 1) / ROWS
      geo.setAttribute('uv', new THREE.Float32BufferAttribute([u0, v1, u1, v1, u0, v0, u1, v0], 2))
      geo.rotateY(s.ry || 0); geo.translate(s.x, s.y + s.h / 2, s.z)
      geos.push(geo)
    })
    const tex = new THREE.CanvasTexture(canvas)
    tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4; tex.generateMipmaps = true; tex.minFilter = THREE.LinearMipmapLinearFilter
    pages.push({ geo: mergeGeometries(geos), tex })
  }
  return pages
}
