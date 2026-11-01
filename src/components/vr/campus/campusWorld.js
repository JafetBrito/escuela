import * as THREE from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { hash, vnoise, smooth, lerp } from '../lookdev/plazaWorld'

// Datos y matemática del Campus (todo en METROS; CampusScenery lo escala a unidades del motor).
// El terreno es determinista y plano en la meseta jugable (los edificios necesitan suelo llano): cerros
// al norte/este/oeste, el río al sur y una segunda meseta al otro lado (Allston).
export const CAMPUS_S = 0.33 // unidades de mundo por metro: el jugador mide 0.4 u ≈ 1.2 m de campus
export const WATER_Y = -2.6
export const BOUNDS = { x: 235, zMin: -255, zMax: 640 }
export const RIVER = { z0: 298, z1: 374 }

// 'river' = campus (río al sur y segunda meseta); 'flat' = meseta llana sin río (hospital). Lo fija cada mapa (data.terrain).
let MODE = 'river'
export const setTerrainMode = (m) => { MODE = m === 'flat' ? 'flat' : 'river' }

export function heightAt(x, z) {
  const edge = Math.max(0, Math.abs(x) - BOUNDS.x, BOUNDS.zMin - z, z - BOUNDS.zMax) // más allá del borde: sube como muralla
  let h = edge * 0.9 + edge * edge * 0.02
  h += (vnoise(x * 0.018, z * 0.018) - 0.5) * 7 * smooth(160, 235, Math.abs(x)) // lomas suaves en las orillas
  const bank = MODE === 'river' ? smooth(RIVER.z0, RIVER.z0 + 22, z) * (1 - smooth(RIVER.z1 - 22, RIVER.z1, z)) : 0
  return lerp(h, -4.6 + (vnoise(x * 0.04, z * 0.04) - 0.5) * 0.8, bank)
}

const C = {
  grassA: new THREE.Color('#79934a'), grassB: new THREE.Color('#5f8a45'), lawn: new THREE.Color('#8fae55'),
  autumn: new THREE.Color('#c0a043'), dirt: new THREE.Color('#b99468'), sand: new THREE.Color('#d6bc8c'), rock: new THREE.Color('#7e7a78'),
}
const SEG_X = 118, SEG_Z = 150, SIZE_X = 700, SIZE_Z = 900, Z0 = -270 // malla del terreno: cubre x∈±350, z∈[-270, 630]

// Terreno visible: vértices con color (pasto, otoño, arena junto al río, roca en los cerros) y trama irregular.
export function buildTerrain() {
  const g = new THREE.PlaneGeometry(SIZE_X, SIZE_Z, SEG_X, SEG_Z)
  g.rotateX(-Math.PI / 2)
  g.translate(0, 0, Z0 + SIZE_Z / 2)
  const pos = g.attributes.position, col = new Float32Array(pos.count * 3), c = new THREE.Color()
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i) + (hash(i, 3) - 0.5) * 3.2, z = pos.getZ(i) + (hash(i, 7) - 0.5) * 3.2
    const h = heightAt(x, z)
    pos.setXYZ(i, x, h, z)
    c.copy(C.grassA).lerp(C.grassB, vnoise(x * 0.05, z * 0.05)).lerp(C.autumn, smooth(0.6, 0.85, vnoise(x * 0.03 + 7, z * 0.03)) * 0.5)
    c.lerp(C.lawn, MODE === 'river' ? smooth(95, 70, Math.hypot(x, z - 10)) * 0.55 : smooth(160, 90, Math.hypot(x, z + 20)) * 0.6) // el Yard / los jardines del hospital, más verdes y cuidados
    c.lerp(C.rock, smooth(4, 14, h)).lerp(C.sand, smooth(-0.3, -2.4, h) * 0.95)
    col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b
  }
  g.setAttribute('color', new THREE.BufferAttribute(col, 3))
  g.computeVertexNormals()
  return g
}

// Mismo terreno, malla más gruesa (barata de lanzarle rayos).
export function buildGroundProxy() {
  const g = new THREE.PlaneGeometry(SIZE_X, SIZE_Z, 90, 120)
  g.rotateX(-Math.PI / 2)
  g.translate(0, 0, Z0 + SIZE_Z / 2)
  const pos = g.attributes.position
  for (let i = 0; i < pos.count; i++) pos.setY(i, heightAt(pos.getX(i), pos.getZ(i)))
  return g
}

// ── Caminos y pavimentos (calcomanías planas sobre la meseta) ────────────────
export const PAVE_COLORS = { gravel: '#d9c7a4', brick: '#a88468', stone: '#cfc5b0', asphalt: '#6c6d73', plank: '#8a6a47', grass: '#6fae4f', court: '#b85c3a', track: '#a0452e', water: '#3fa7c9' }
const col3 = (hex) => new THREE.Color(hex)
function paintFlat(g, hex) {
  const c = col3(hex), n = g.attributes.position.count, a = new Float32Array(n * 3)
  for (let i = 0; i < n; i++) { a[i * 3] = c.r; a[i * 3 + 1] = c.g; a[i * 3 + 2] = c.b }
  g.setAttribute('color', new THREE.BufferAttribute(a, 3))
  const o = g.index ? g.toNonIndexed() : g
  o.deleteAttribute('uv')
  if (!o.attributes.normal) o.computeVertexNormals()
  return o
}

// Una cinta de `w` metros siguiendo la polilínea `pts` [[x,z],...] + un disco en cada vértice para redondear las uniones.
export function pathGeo(pts, w, mat = 'gravel') {
  const parts = [], y = 0.07, half = w / 2
  for (let i = 0; i < pts.length - 1; i++) {
    const [ax, az] = pts[i], [bx, bz] = pts[i + 1], len = Math.hypot(bx - ax, bz - az)
    if (len < 0.01) continue
    const nx = -(bz - az) / len * half, nz = (bx - ax) / len * half
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.Float32BufferAttribute([
      ax + nx, y, az + nz, bx + nx, y, bz + nz, bx - nx, y, bz - nz,
      ax + nx, y, az + nz, bx - nx, y, bz - nz, ax - nx, y, az - nz,
    ], 3))
    parts.push(paintFlat(g, PAVE_COLORS[mat] || PAVE_COLORS.gravel))
  }
  pts.forEach(([x, z]) => parts.push(paintFlat(new THREE.CircleGeometry(half, 14).rotateX(-Math.PI / 2).translate(x, y, z), PAVE_COLORS[mat] || PAVE_COLORS.gravel)))
  return parts.length ? mergeGeometries(parts) : null
}
// Rectángulo (w×d, girado ry) o círculo (r) de pavimento.
export function paveGeo(it) {
  const y = 0.065 + (it.dy || 0) // dy: sube un pavimento sobre otro (cancha sobre pista) sin que parpadeen
  const g = it.r
    ? new THREE.CircleGeometry(it.r, 28).rotateX(-Math.PI / 2)
    : new THREE.PlaneGeometry(it.w, it.d).rotateX(-Math.PI / 2).rotateY(it.ry || 0)
  g.translate(it.x, y, it.z)
  return paintFlat(g, PAVE_COLORS[it.mat] || PAVE_COLORS.stone)
}

// Altura donde se apoya una pieza (suelo del terreno salvo que el layout fije `y`) y puntos de NPC (en unidades de mundo).
export const itemY = (it) => it.y ?? heightAt(it.x, it.z)
export const npcPoints = (data) => data.items.filter((i) => i.type === 'npc').map((i) => [i.x * CAMPUS_S, itemY(i) * CAMPUS_S, i.z * CAMPUS_S])
