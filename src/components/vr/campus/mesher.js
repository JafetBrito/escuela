import * as THREE from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'

// Constructor de mallas low-poly: acumula cajas/cilindros/conos/techos con color por vértice y al final
// los funde en UNA geometría (un draw call por edificio). Convención: (x, y, z) = centro de la BASE de la
// pieza; `ry` gira alrededor de Y sobre ese punto. Todo en metros del campus (CampusScenery los escala).
const _c = new THREE.Color()
function paint(g, hex) {
  _c.set(hex)
  const n = g.attributes.position.count, a = new Float32Array(n * 3)
  for (let i = 0; i < n; i++) { a[i * 3] = _c.r; a[i * 3 + 1] = _c.g; a[i * 3 + 2] = _c.b }
  g.setAttribute('color', new THREE.BufferAttribute(a, 3))
  return g
}

// Techo a dos aguas (prisma triangular): ancho `w` en X, cumbrera a lo largo de Z (gíralo π/2 para X).
export function prismGeo(w, d, h) {
  const a = w / 2, b = d / 2
  const v = [
    -a, 0, b, a, 0, b, 0, h, b, // frente
    a, 0, -b, -a, 0, -b, 0, h, -b, // fondo
    -a, 0, -b, -a, 0, b, 0, h, b, -a, 0, -b, 0, h, b, 0, h, -b, // faldón -z/-x
    a, 0, b, a, 0, -b, 0, h, -b, a, 0, b, 0, h, -b, 0, h, b, // faldón +x
    -a, 0, -b, a, 0, -b, a, 0, b, -a, 0, -b, a, 0, b, -a, 0, b, // base
  ]
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.Float32BufferAttribute(v, 3))
  g.computeVertexNormals()
  return g
}

export class Mesher {
  constructor() { this.parts = [] }
  add(g, hex, x = 0, y = 0, z = 0, ry = 0) {
    const geo = g.index ? g.toNonIndexed() : g
    if (ry) geo.rotateY(ry)
    geo.translate(x, y, z)
    geo.deleteAttribute('uv')
    this.parts.push(paint(geo, hex))
    return this
  }
  box(x, y, z, w, h, d, hex, ry = 0) { return this.add(new THREE.BoxGeometry(w, h, d).translate(0, h / 2, 0), hex, x, y, z, ry) }
  cyl(x, y, z, r, h, seg, hex, rTop = r) { return this.add(new THREE.CylinderGeometry(rTop, r, h, seg).translate(0, h / 2, 0), hex, x, y, z) }
  cone(x, y, z, r, h, seg, hex, ry = 0) { return this.add(new THREE.ConeGeometry(r, h, seg).translate(0, h / 2, 0), hex, x, y, z, ry) }
  ball(x, y, z, r, hex, sy = 1) { return this.add(new THREE.IcosahedronGeometry(r, 0).scale(1, sy, 1), hex, x, y, z) }
  gable(x, y, z, w, d, h, hex, ry = 0) { return this.add(prismGeo(w, d, h), hex, x, y, z, ry) }
  // caja inclinada (rampas): de (x, y0, z0) a (x, y1, z1), ancho `w`, grosor `t`
  slope(x, y0, z0, y1, z1, w, t, hex) {
    const len = Math.hypot(z1 - z0, y1 - y0), ang = Math.atan2(y1 - y0, z1 - z0)
    const g = new THREE.BoxGeometry(w, t, len).rotateX(-ang)
    return this.add(g, hex, x, (y0 + y1) / 2 - t / 2, (z0 + z1) / 2)
  }
  get empty() { return !this.parts.length }
  build() { return this.parts.length ? mergeGeometries(this.parts) : null }
}

export const addGeo = (list, g) => { if (g) list.push(g) }
