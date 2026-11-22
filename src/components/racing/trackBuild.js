import * as THREE from 'three'
import { Mesher } from '../vr/campus/mesher'
import { RACE, trackLength, laneBounds, medianHalf } from './racingData'
import { frame, ribbon } from './track'
import { bumpAt, centerY } from './trackMath'

// Construye la pista de una partida: terreno con lomas, asfalto (partido en 2 o 3 carriles en cada bifurcación) con línea central, muros,
// barreras, pórticos y el escenario de CADA MISIÓN (hospital, jardín, ciudad / servidores, red, núcleo de IA / ágora, caverna, sol), con su
// propia paleta, sus construcciones grandes (hospitales, rascacielos, templos, cristales...) y detalles pequeños. TODO se parte en tramos de
// 300 m para que el motor gráfico descarte lo que está lejos o detrás (antes era una sola malla gigante que se dibujaba entera).
const CHUNK = 300
const hash = (a, b) => { const s = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return s - Math.floor(s) }
const tone = (hex, d) => new THREE.Color(hex).offsetHSL(0, 0, d).getStyle()
const _c = new THREE.Color()

// Parte una malla fusionada SIN índice en pedazos por z (la pista corre hacia -Z), cada uno con su esfera de recorte
export function splitByZ(geo) {
  if (!geo) return []
  const pos = geo.attributes.position, nor = geo.attributes.normal, col = geo.attributes.color, buckets = new Map()
  for (let i = 0; i < pos.count; i += 3) {
    const k = Math.floor(-(pos.getZ(i) + pos.getZ(i + 1) + pos.getZ(i + 2)) / 3 / CHUNK)
    let b = buckets.get(k); if (!b) { b = { p: [], n: [], c: [] }; buckets.set(k, b) }
    for (let j = 0; j < 3; j++) { b.p.push(pos.getX(i + j), pos.getY(i + j), pos.getZ(i + j)); b.n.push(nor.getX(i + j), nor.getY(i + j), nor.getZ(i + j)); b.c.push(col.getX(i + j), col.getY(i + j), col.getZ(i + j)) }
  }
  return [...buckets.values()].map((b) => {
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.Float32BufferAttribute(b.p, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(b.n, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(b.c, 3))
    g.computeBoundingSphere(); return g
  })
}

// Terreno de un lado de la pista entre s0..s1: rejilla con lomas (bumpAt) y color por tono y altura
const TCOLS = [9, 16, 26, 40, 60, 85, 120, 170, 250, 350]
function terrain(s0, s1, side, palAt) {
  const n = Math.max(1, Math.ceil((s1 - s0) / 12)), pos = [], col = [], idx = [], w = TCOLS.length
  for (let i = 0; i <= n; i++) {
    const s = s0 + ((s1 - s0) * i) / n, pal = palAt(s), a = new THREE.Color(pal.ground), b = new THREE.Color(pal.ground2)
    for (let j = 0; j < w; j++) {
      const u = side * TCOLS[j], p = frame(s, u, 0), h = bumpAt(s, u)
      pos.push(p.x, p.y + h - 0.4, p.z)
      _c.copy(a).lerp(b, 0.5 + 0.5 * Math.sin(s / 23 + u * 0.07)).offsetHSL(0, 0, Math.min(0.14, h * 0.012) + (hash(i, j) - 0.5) * 0.03)
      col.push(_c.r, _c.g, _c.b)
    }
    if (i < n) for (let j = 0; j < w - 1; j++) { const k0 = i * w + j, k1 = k0 + 1, k2 = k0 + w, k3 = k2 + 1; if (side > 0) idx.push(k0, k1, k2, k1, k3, k2); else idx.push(k0, k2, k1, k1, k2, k3) }
  }
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); g.setIndex(idx); g.computeVertexNormals(); g.computeBoundingSphere()
  return g
}

// Rayas discontinuas del centro de la pista (un solo conjunto de cuadritos, luego partido en tramos)
function dashes(L, skip) {
  const pos = [], col = [], nor = []
  const quad = (s0, s1, hw) => {
    const a = frame(s0, -hw, 0.07), b = frame(s0, hw, 0.07), c2 = frame(s1, hw, 0.07), d = frame(s1, -hw, 0.07)
    for (const p of [a, c2, b, a, d, c2]) { pos.push(p.x, p.y, p.z); col.push(0.95, 0.95, 0.9); nor.push(0, 1, 0) }
  }
  for (let s = 20; s < L; s += 18) if (!skip(s)) quad(s, s + 7, 0.16)
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3))
  return g
}

// ── Decorado pequeño y mediano junto a la pista (un elemento por llamada, en el punto p) ──
const SCATTER = {
  garden(M, G, p, k, i) {
    if (k > 0.86) { M.box(p.x, p.y - 0.5, p.z, 0.4, 4.5, 0.4, '#e9e9e9'); G.box(p.x, p.y + 3.6, p.z + 0.25, 2.2, 0.6, 0.1, '#ef4444'); G.box(p.x, p.y + 3.6, p.z + 0.25, 0.6, 2.2, 0.1, '#ef4444') }
    else if (k > 0.7) { M.box(p.x, p.y - 0.3, p.z, 2.6, 0.5, 0.9, '#8a5a34'); M.box(p.x, p.y + 0.4, p.z - 0.4, 2.6, 0.9, 0.2, '#8a5a34'); for (const c of ['#ff8ac2', '#ffd24a', '#ffffff']) M.ball(p.x + (hash(i, 9) - 0.5) * 5, p.y - 0.1, p.z + 2.5, 0.35, c) } // banca con flores
    else { M.cyl(p.x, p.y - 0.5, p.z, 0.4, 2, 5, '#6b4b2a', 0.3); M.cone(p.x, p.y + 1.2, p.z, 2.4 + k * 1.2, 5 + k * 3, 6, k > 0.4 ? '#4fa86a' : '#3f8f5a'); M.cone(p.x, p.y + 4.8 + k * 2, p.z, 1.4, 3, 6, '#f4faff') }
  },
  city(M, G, p, k, i) {
    if (k > 0.8) { M.cyl(p.x, p.y - 0.5, p.z, 0.15, 6, 5, '#2b2f38'); G.ball(p.x, p.y + 5.6, p.z, 0.45, i % 2 ? '#22c55e' : '#ef4444'); return } // semáforo
    const h = 12 + k * 34, w = 7 + hash(i, 5) * 6
    M.box(p.x, p.y - 0.5, p.z, w, h, w, ['#8b93a1', '#a9b0bd', '#7c8696', '#b9a99a'][i % 4], p.yaw)
    for (let r = 0; r < 4; r++) M.box(p.x, p.y + 2 + r * (h / 4.5), p.z, w + 0.2, 0.5, w + 0.2, '#d9e2ee', p.yaw)
    if (k > 0.6) G.box(p.x, p.y + h * 0.7, p.z, 0.8, 3, 0.8, '#ef4444')
  },
  servers(M, G, p, k) {
    const h = 5 + k * 16; M.box(p.x, p.y - 0.5, p.z, 2.4, h, 2.4, '#141a28'); G.box(p.x, p.y + h * 0.4, p.z + 1.25, 1.6, 0.18, 0.05, k > 0.5 ? '#22c55e' : '#38bdf8'); G.box(p.x, p.y + h * 0.75, p.z + 1.25, 1.6, 0.18, 0.05, '#a855f7')
  },
  matrix(M, G, p, k, i) {
    const h = 8 + k * 30; G.box(p.x, p.y + h / 2, p.z, 0.5, h, 0.5, i % 3 ? '#16a34a' : '#4ade80'); M.box(p.x, p.y - 0.5, p.z, 1.4, 1, 1.4, '#052e16')
    if (k > 0.5) G.box(p.x + 2, p.y + 6 + k * 8, p.z, 1.2, 1.2, 1.2, '#86efac')
  },
  neon(M, G, p, k, i) {
    const h = 6 + k * 18; M.cone(p.x, p.y - 0.5, p.z, 3.4, h, 4, '#1c0f2e', k * 6); G.cone(p.x, p.y - 0.4, p.z, 3.5, h * 1.02, 4, i % 2 ? '#d946ef' : '#22d3ee', k * 6 + 0.78)
  },
  agora(M, G, p, k) {
    if (k > 0.5) { const h = 6 + k * 5; M.cyl(p.x, p.y - 0.5, p.z, 0.9, h, 8, '#f3ecd8', 0.75); M.box(p.x, p.y - 0.5 + h, p.z, 2.4, 0.6, 2.4, '#d9ceb0'); M.box(p.x, p.y - 0.5, p.z, 2.6, 0.5, 2.6, '#d9ceb0') }
    else if (k > 0.35) { M.box(p.x, p.y - 0.5, p.z, 1.4, 0.8, 1.4, '#d9ceb0'); M.box(p.x, p.y + 0.3, p.z, 0.9, 2.4, 0.6, '#efe7d2'); M.ball(p.x, p.y + 3.1, p.z, 0.45, '#efe7d2') } // estatua
    else { M.cyl(p.x, p.y - 0.5, p.z, 0.4, 2.6, 5, '#6b4b2a', 0.3); M.ball(p.x, p.y + 3.2, p.z, 2.2 + k * 1.5, '#7f9a4a', 0.8) }
  },
  cave(M, G, p, k, i) {
    const h = 4 + k * 14; M.cone(p.x, p.y - 0.5, p.z, 2.2 + k * 2, h, 5, i % 2 ? '#3b2d22' : '#4a3a2c')
    if (k > 0.82) { M.cyl(p.x + 2, p.y - 0.5, p.z, 0.5, 1.6, 6, '#2b2118', 0.7); G.cone(p.x + 2, p.y + 1.1, p.z, 0.9, 2.6, 5, '#ff9f43') }
    else if (k < 0.2) { G.cone(p.x, p.y - 0.4, p.z, 0.8, 3 + k * 8, 5, i % 2 ? '#38bdf8' : '#e879f9'); G.cone(p.x + 1.1, p.y - 0.4, p.z + 0.6, 0.5, 2, 5, '#a5f3fc') } // cristales
  },
  sun(M, G, p, k) {
    const h = 9 + k * 10; M.cyl(p.x, p.y - 0.5, p.z, 0.8, h, 8, '#fff8e1', 0.6); G.ball(p.x, p.y + h, p.z, 1.1, '#ffd24a')
    if (k > 0.6) G.box(p.x + 3, p.y + 0.3, p.z, 0.6, 0.6, 0.6, k > 0.8 ? '#fb7185' : '#fde047')
  },
}

// ── Construcciones grandes (una cada ~230 m, lejos de la pista) ──
const LANDMARK = {
  garden(M, G, p, k) { // hospital de campo con cruz y ventanas luminosas
    const w = 24 + k * 10; M.box(p.x, p.y - 0.5, p.z, w, 12, 16, '#f4f8fa', p.yaw); M.box(p.x, p.y + 11.5, p.z, w + 1, 0.8, 17, '#cfd8dc', p.yaw)
    for (let r = 0; r < 2; r++) for (let c = -2; c <= 2; c++) G.box(p.x + c * 4.5, p.y + 3 + r * 4.5, p.z + 8.1, 2.2, 1.6, 0.1, '#9fd8ff')
    G.box(p.x, p.y + 9.5, p.z + 8.2, 4, 1.1, 0.1, '#ef4444'); G.box(p.x, p.y + 9.5, p.z + 8.2, 1.1, 4, 0.1, '#ef4444')
  },
  city(M, G, p, k, i) { // rascacielos con ventanas
    const w = 12 + k * 8, h = 45 + k * 45; M.box(p.x, p.y - 0.5, p.z, w, h, w, ['#6f7b8c', '#8d99ab', '#a3adbb'][i % 3], p.yaw)
    for (let r = 2; r < h / 4.2 - 1; r++) G.box(p.x, p.y + r * 4.2, p.z + w / 2 + 0.06, w * 0.82, 1.2, 0.08, hash(r, i) > 0.35 ? '#ffd98a' : '#40506a')
    G.box(p.x, p.y + h + 1, p.z, 0.6, 3, 0.6, '#ef4444')
  },
  servers(M, G, p) { // centro de datos
    M.box(p.x, p.y - 0.5, p.z, 34, 11, 18, '#10162a', p.yaw)
    for (let c = -7; c <= 7; c++) G.box(p.x + c * 2.2, p.y + 4, p.z + 9.1, 0.9, 6, 0.08, hash(c, 3) > 0.5 ? '#22c55e' : '#38bdf8')
    M.cyl(p.x + 14, p.y + 10.5, p.z, 0.3, 8, 5, '#2b3350'); G.ball(p.x + 14, p.y + 18.8, p.z, 0.7, '#f43f5e')
  },
  matrix(M, G, p) { // anillos de datos flotantes
    for (let r = 0; r < 3; r++) G.add(new THREE.TorusGeometry(8 - r * 2, 0.35, 5, 18).rotateX(Math.PI / 2 * (r % 2 ? 0.2 : 1)), r % 2 ? '#4ade80' : '#22c55e', p.x, p.y + 18 + r * 5, p.z)
    G.box(p.x, p.y + 13, p.z, 0.6, 18, 0.6, '#86efac')
  },
  neon(M, G, p) { // pirámide con anillo
    M.cone(p.x, p.y - 0.5, p.z, 16, 26, 4, '#150a26', 0.78); G.cone(p.x, p.y - 0.4, p.z, 16.2, 26.3, 4, '#d946ef', 0.78 + 0.001)
    G.add(new THREE.TorusGeometry(11, 0.4, 5, 24).rotateX(Math.PI / 2), '#22d3ee', p.x, p.y + 30, p.z)
  },
  agora(M, G, p) { // templo griego
    M.box(p.x, p.y - 0.5, p.z, 26, 1.4, 14, '#e9e1cd', p.yaw); M.box(p.x, p.y + 0.9, p.z, 24, 0.6, 12.4, '#efe7d2', p.yaw)
    for (let c = -2; c <= 2; c++) for (const z of [-5, 5]) M.cyl(p.x + c * 4.4, p.y + 1.4, p.z + z, 0.85, 9, 8, '#f3ecd8', 0.7)
    M.box(p.x, p.y + 10.4, p.z, 24, 0.9, 12.6, '#d9ceb0', p.yaw); M.gable(p.x, p.y + 11.3, p.z, 25, 13, 3.6, '#e6dcc0', p.yaw)
  },
  cave(M, G, p) { // gran cúmulo de cristales
    for (let c = 0; c < 6; c++) G.cone(p.x + Math.sin(c * 2.1) * 5, p.y - 0.5, p.z + Math.cos(c * 1.7) * 4, 1.6 + (c % 3) * 0.6, 8 + (c % 4) * 4, 5, ['#38bdf8', '#e879f9', '#a5f3fc', '#818cf8'][c % 4], c)
    M.cone(p.x, p.y - 1, p.z, 9, 6, 6, '#3b2d22')
  },
  sun(M, G, p) { // obelisco dorado con un orbe
    M.box(p.x, p.y - 0.5, p.z, 6, 1.6, 6, '#f3e9c6'); M.cone(p.x, p.y + 1, p.z, 2.6, 28, 4, '#fff1b8', Math.PI / 4); G.add(new THREE.OctahedronGeometry(2.2).scale(1, 1.6, 1), '#ffd24a', p.x, p.y + 33, p.z)
    M.box(p.x + 9, p.y - 0.5, p.z, 1.6, 6, 1.6, '#fff8e1'); M.box(p.x - 9, p.y - 0.5, p.z, 1.6, 6, 1.6, '#fff8e1')
  },
}

// Escenarios lineales para interiores: hospital (muros con puertas, camillas, arcos con cruz) y caverna (paredes de roca con braseros)
function hospitalWalls(M, G, sA, sB, p) {
  for (let s = sA, i = 0; s < sB; s += 6, i++) for (const sg of [-1, 1]) {
    frame(s, sg * 15, 0, p); M.box(p.x, p.y - 1, p.z, 0.9, 11, 6.3, '#f3f7f9', p.yaw)
    frame(s, sg * 14.45, 0, p); G.box(p.x, p.y + 6.5, p.z, 0.12, 0.3, 5.4, '#bfeaff', p.yaw)
    if (i % 5 === 2) { M.box(p.x, p.y, p.z, 0.3, 3.4, 2.6, '#3a7a96', p.yaw); G.box(p.x, p.y + 4.4, p.z, 0.2, 0.5, 1.6, '#ef4444', p.yaw); G.box(p.x, p.y + 4.4, p.z, 0.2, 1.6, 0.5, '#ef4444', p.yaw) }
    if (i % 5 === 4) { frame(s, sg * 13.2, 0, p); M.box(p.x, p.y, p.z, 1.0, 0.7, 2.2, '#ffffff', p.yaw); M.box(p.x, p.y + 0.7, p.z, 0.9, 0.12, 2.0, '#9fd3ee', p.yaw) } // camilla pegada al muro
    if (i % 11 === 6) { frame(s, sg * 12.6, 0, p); M.cyl(p.x, p.y, p.z, 0.08, 2.6, 5, '#aab2bd'); M.box(p.x, p.y + 2.3, p.z, 0.5, 0.05, 0.05, '#aab2bd'); G.ball(p.x, p.y + 2.0, p.z, 0.22, '#9fd8ff') } // soporte de suero
  }
  for (let s = sA + 90; s < sB; s += 150) { // arcos con cruz luminosa sobre el pasillo
    for (const sg of [-1, 1]) { frame(s, sg * 14.2, 0, p); M.box(p.x, p.y - 1, p.z, 1.0, 12, 1.0, '#dfe8ee', p.yaw) }
    frame(s, 0, 0, p); M.box(p.x, p.y + 11, p.z, 30, 0.9, 1.0, '#dfe8ee', p.yaw); G.box(p.x, p.y + 11.1, p.z + 0.55, 24, 0.25, 0.08, '#bfeaff', p.yaw)
    G.box(p.x, p.y + 8.2, p.z + 0.55, 4.4, 1.0, 0.1, '#ef4444', p.yaw); G.box(p.x, p.y + 8.2, p.z + 0.55, 1.0, 4.4, 0.1, '#ef4444', p.yaw)
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
  const inFork = (s) => forks.some((f) => s > f.start - 40 && s < f.start + len + 10)

  // terreno con lomas y asfalto, en tramos de 300 m
  for (let s = -90; s < L + 280; s += CHUNK) { const e = Math.min(s + CHUNK, L + 280); geos.push(terrain(s, e, -1, palAt), terrain(s, e, 1, palAt)) }
  const road = (s0, s1, u0, u1) => { for (let a = s0; a < s1; a += CHUNK) geos.push(ribbon(a, Math.min(a + CHUNK, s1), u0, u1, 0.02, (s, i) => tone(palAt(s).road, i % 2 ? 0.02 : 0), 6)) }
  let cursor = -40
  const forkSegs = []
  for (const f of forks) {
    road(cursor, f.start, -half, half)
    // los carriles de la bifurcación se parten en losas de 20 m: las del carril equivocado se derrumban al pasar (ver RaceEvents.jsx)
    for (let i = 0; i < f.n; i++) {
      const lb = laneBounds(f.n, i)
      for (let a = f.start; a < f.start + len; a += 20) {
        const geo = ribbon(a, a + 20, lb.from, lb.to, 0.02, (s, k) => tone(palAt(s).road, k % 2 ? 0.02 : 0), 5)
        frame(a + 10, lb.center, 0.02, p); geo.translate(-p.x, -p.y, -p.z)
        forkSegs.push({ fork: f.id, lane: i, s: a + 10, i: forkSegs.length, x: p.x, y: p.y, z: p.z, geo })
      }
    }
    cursor = f.start + len
  }
  road(cursor, L + 60, -half, half)
  for (const sg of [-1, 1]) for (let a = -40; a < L + 60; a += CHUNK) glowGeos.push(ribbon(a, Math.min(a + CHUNK, L + 60), sg * (half - 0.45), sg * (half - 0.15), 0.05, (s) => palAt(s).accent, 6)) // bordes luminosos
  const dash = dashes(L, inFork)

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

  // decorado de cada misión: detalles pequeños, construcciones grandes y escenarios lineales
  world.missions.forEach((mis, m) => {
    const sA = m === 0 ? -40 : missionStarts[m], sB = m === world.missions.length - 1 ? L + 120 : missionStarts[m + 1]
    if (mis.deco === 'hospital') { hospitalWalls(M, G, sA, sB, p); return }
    if (mis.deco === 'cave') caveWalls(M, G, sA, sB, p)
    const draw = SCATTER[mis.deco], big = LANDMARK[mis.deco]
    for (let s = sA, i = 0; s < sB; s += mis.deco === 'cave' ? 26 : 12, i++) for (const sg of [-1, 1]) {
      const r = hash(s, sg), u = sg * ((mis.deco === 'cave' ? 22 : 16) + r * 70), sj = s + hash(sg, s) * 8
      frame(sj, u, 0, p); p.y += bumpAt(sj, u)
      draw(M, G, p, hash(i, sg * 3), i)
    }
    if (big) for (let s = sA + 120, i = 0; s < sB; s += 230, i++) for (const sg of [-1, 1]) {
      const u = sg * (52 + hash(i, sg) * 46), sj = s + hash(sg, i) * 60
      frame(sj, u, 0, p); p.y += bumpAt(sj, u); big(M, G, p, hash(i, sg * 5), i)
    }
  })

  return { geos: [...geos, ...splitByZ(dash).map((g) => g)], glowGeos, solidChunks: splitByZ(M.build()), glowChunks: splitByZ(G.build()), dashCount: dash.attributes.position.count / 6, banners, gantries, centerY, forkSegs }
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
