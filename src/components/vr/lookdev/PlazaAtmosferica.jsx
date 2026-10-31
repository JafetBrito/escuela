import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Html, Stars } from '@react-three/drei'
import { EffectComposer, Bloom, Vignette, ToneMapping, HueSaturation, BrightnessContrast } from '@react-three/postprocessing'
import { BlendFunction, ToneMappingMode } from 'postprocessing'
import * as THREE from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { Link, useSearchParams } from 'react-router-dom'
import { ACADEMIES } from '../../../data/academies'
import { tr } from '../../../i18n'
import NpcSpeechPlayer from '../NpcSpeechPlayer'
import NpcDialogueBox from '../NpcDialogueBox'
import { playAchievementSound, playLevelUpSound } from '../../../utils/sound'
import { useNpcSpeechStore } from '../../../stores/useNpcSpeechStore'
import DemoNpcs from './DemoNpcs'
import { talkTo, npcName, npcEmoji } from './demoNpcData'
import { startAmbience, setAmbiencePreset, setAmbienceMuted, footstep, shutdownAmbience } from './plazaAudio'

// ─────────────────────────────────────────────────────────────────────────────
// LOOK-DEV: "Plaza de las Academias" — rebanada vertical de dirección de arte.
// Estilo: low-poly atmosférico (Firewatch / Journey). Todo es procedural (sin
// GLB, ~0 KB de assets): lo que vende el estilo es la luz, el cielo y las capas
// de niebla, no los polígonos. Es una escena aparte de VRPage.jsx a propósito:
// aquí se afina el look sin tocar las 4,600 líneas del mundo; cuando guste, el
// terreno/luz/cielo se llevan a la plaza real.
//
// Móvil: SceneEffects.jsx apaga el post-procesado en pantallas angostas (caro),
// así que esta escena no depende del bloom: cielo + niebla + flat shading
// cargan el look; el bloom solo lo realza en escritorio.
// ─────────────────────────────────────────────────────────────────────────────

// ── Paletas por hora del día (todo el look sale de aquí) ─────────────────────
const PRESETS = {
  atardecer: {
    label: tr('Atardecer', 'Sunset'), icon: '🌇',
    skyTop: '#3a2f6b', skyMid: '#c0457a', skyHor: '#ffb27a',
    fog: '#f2a07a', sunCol: '#ffd08a', sunEl: 7, sunAz: 38,
    hemiSky: '#ffb59a', hemiGround: '#3b2f5e', hemiI: 0.95, dirCol: '#ffb36b', dirI: 2.6, fillCol: '#b8c4ff', fillI: 0.3,
    ridgeNear: '#5b3f78', ridgeFar: '#f0a088', bloom: 0.55, glow: 1.6, flies: 1, stars: false,
  },
  amanecer: {
    label: tr('Amanecer', 'Dawn'), icon: '🌅',
    skyTop: '#4a6fa5', skyMid: '#e8a5b5', skyHor: '#ffe2b0',
    fog: '#f6cfae', sunCol: '#ffe0a0', sunEl: 5, sunAz: -42,
    hemiSky: '#cfe0ff', hemiGround: '#6f6a8f', hemiI: 1.05, dirCol: '#ffd9a0', dirI: 2.1, fillCol: '#ffe9d0', fillI: 0.3,
    ridgeNear: '#6a78a8', ridgeFar: '#f2d3bd', bloom: 0.45, glow: 1.0, flies: 0.6, stars: false,
  },
  noche: {
    label: tr('Noche', 'Night'), icon: '🌙',
    skyTop: '#070b24', skyMid: '#16204d', skyHor: '#2d3a78',
    fog: '#18214f', sunCol: '#9db6ff', sunEl: 38, sunAz: -25,
    hemiSky: '#3a4d9a', hemiGround: '#0d0f2b', hemiI: 0.7, dirCol: '#9db6ff', dirI: 0.7, fillCol: '#6a7fd0', fillI: 0.3,
    ridgeNear: '#0d1235', ridgeFar: '#2a3670', bloom: 0.9, glow: 3.2, flies: 1.8, stars: true,
  },
}

// ── Matemática del mundo (determinista: terreno, árboles y caminante comparten) ──
const lerp = (a, b, t) => a + (b - a) * t
const clamp = (x, a, b) => Math.min(b, Math.max(a, x))
const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t) }
const hash = (x, z) => { const s = Math.sin(x * 127.1 + z * 311.7) * 43758.5453; return s - Math.floor(s) }
function vnoise(x, z) {
  const xi = Math.floor(x), zi = Math.floor(z), xf = x - xi, zf = z - zi
  const u = xf * xf * (3 - 2 * xf), v = zf * zf * (3 - 2 * zf)
  const a = hash(xi, zi), b = hash(xi + 1, zi), c = hash(xi, zi + 1), d = hash(xi + 1, zi + 1)
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v
}
function rng(seed) { // mulberry32
  let a = seed >>> 0
  return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296 }
}

// Reloj compartido para el viento de los árboles y las luciérnagas (un solo uniform).
const windU = { value: 0 }

const ACADEMY_LIST = Object.values(ACADEMIES)
const PLAZA_R = 19
const WALK_LIMIT = 150
const WATER_Y = -2.2

// Un camino por academia, curvo, del borde de la plaza hasta su portal.
const PATHS = ACADEMY_LIST.map((ac, i) => {
  const a0 = (i / ACADEMY_LIST.length) * Math.PI * 2 + Math.PI / 4
  const pts = []
  for (let k = 0; k <= 12; k++) {
    const t = k / 12, d = 17 + t * 62, a = a0 + Math.sin(t * 2.6 + i * 1.7) * 0.22
    pts.push([Math.cos(a) * d, Math.sin(a) * d])
  }
  return { ac, pts }
})

function segDist(px, pz, [ax, az], [bx, bz]) {
  const dx = bx - ax, dz = bz - az
  const t = clamp(((px - ax) * dx + (pz - az) * dz) / (dx * dx + dz * dz), 0, 1)
  return Math.hypot(px - (ax + dx * t), pz - (az + dz * t))
}
// Camino de bienvenida: del spawn a la plaza, despejado (sin árboles) para que la primera vista sea la torre.
const ENTRY = [[0, 52], [-2, 42], [1, 31], [0, 18]]
function pathDist(x, z) {
  let m = 1e9
  for (const { pts } of PATHS) for (let k = 0; k < pts.length - 1; k++) m = Math.min(m, segDist(x, z, pts[k], pts[k + 1]))
  for (let k = 0; k < ENTRY.length - 1; k++) m = Math.min(m, segDist(x, z, ENTRY[k], ENTRY[k + 1]))
  return m
}
function groundHeight(x, z) {
  const r = Math.hypot(x, z)
  const raw = vnoise(x * 0.02, z * 0.02) * 18 + vnoise(x * 0.06, z * 0.06) * 5 + vnoise(x * 0.15, z * 0.15) * 1.2 - 9 + Math.max(0, r - 85) * 0.2
  const relief = lerp(0.3, 1, smooth(2.5, 9, pathDist(x, z))) // los caminos son más planos
  return lerp(0, raw * relief, smooth(20, 36, r))              // la plaza es llana
}

// ── Geometría con color por vértice (la paleta vive en la malla, no en texturas) ──
function paint(g, hex) {
  const c = new THREE.Color(hex), n = g.attributes.position.count, a = new Float32Array(n * 3)
  for (let i = 0; i < n; i++) { a[i * 3] = c.r; a[i * 3 + 1] = c.g; a[i * 3 + 2] = c.b }
  g.setAttribute('color', new THREE.BufferAttribute(a, 3))
  return g
}
// toNonIndexed: mergeGeometries exige que todas sean indexadas o ninguna (el icosaedro no lo es) — devuelve null si no.
const part = (g, hex, x = 0, y = 0, z = 0) => { g.translate(x, y, z); paint(g, hex); return g.index ? g.toNonIndexed() : g }
const pineGeo = (low, high) => mergeGeometries([
  part(new THREE.CylinderGeometry(0.18, 0.26, 1.2, 5), '#4a3426', 0, 0.6),
  part(new THREE.ConeGeometry(1.5, 2.4, 6), low, 0, 2.0),
  part(new THREE.ConeGeometry(1.15, 2.0, 6), low, 0, 3.2),
  part(new THREE.ConeGeometry(0.75, 1.7, 6), high, 0, 4.3),
])
const roundGeo = (low, high) => mergeGeometries([
  part(new THREE.CylinderGeometry(0.2, 0.3, 1.6, 5), '#4a3426', 0, 0.8),
  part(new THREE.IcosahedronGeometry(1.5, 0), low, 0, 2.7),
  part(new THREE.IcosahedronGeometry(1.0, 0), high, 0.55, 3.35, 0.2),
])

function buildTerrain() {
  const SIZE = 440, SEG = 160, cell = SIZE / SEG
  const g = new THREE.PlaneGeometry(SIZE, SIZE, SEG, SEG)
  g.rotateX(-Math.PI / 2)
  const pos = g.attributes.position, col = new Float32Array(pos.count * 3), c = new THREE.Color()
  const grassA = new THREE.Color('#7d8f45'), grassB = new THREE.Color('#3f6b4a'), meadow = new THREE.Color('#b4a64f')
  const rock = new THREE.Color('#7a6a82'), sand = new THREE.Color('#d6b58a'), stone = new THREE.Color('#cdb89a'), dirt = new THREE.Color('#c79a6b')
  for (let i = 0; i < pos.count; i++) {
    // Trama irregular: sin esto el low-poly se ve como una rejilla de cuadros.
    const x = pos.getX(i) + (hash(i, 3) - 0.5) * cell * 0.7, z = pos.getZ(i) + (hash(i, 7) - 0.5) * cell * 0.7
    const h = groundHeight(x, z), r = Math.hypot(x, z), pd = pathDist(x, z)
    pos.setXYZ(i, x, h, z)
    const t = vnoise(x * 0.08, z * 0.08)
    c.copy(grassA).lerp(grassB, t).lerp(meadow, smooth(0.55, 0.8, vnoise(x * 0.04 + 9, z * 0.04)) * 0.7)
    c.lerp(rock, smooth(11, 22, h)).lerp(sand, smooth(-0.6, -2.2, h) * 0.9)
    c.lerp(stone, smooth(PLAZA_R + 3, PLAZA_R - 1, r)).lerp(dirt, smooth(3.4, 1.7, pd) * smooth(PLAZA_R - 2, PLAZA_R + 2, r))
    col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b
  }
  g.setAttribute('color', new THREE.BufferAttribute(col, 3))
  g.computeVertexNormals()
  return g
}

function buildRidge(radius, height, seed) {
  const g = new THREE.CylinderGeometry(radius, radius, 1, 180, 1, true)
  const pos = g.attributes.position
  for (let i = 0; i < pos.count; i++) {
    const ang = Math.atan2(pos.getX(i), pos.getZ(i))
    const n = vnoise(Math.cos(ang) * 3 + seed, Math.sin(ang) * 3 + seed * 2) * 0.7 + vnoise(Math.cos(ang) * 11 + seed, Math.sin(ang) * 11) * 0.3
    pos.setY(i, pos.getY(i) > 0 ? -8 + n * height : -60)
  }
  return g
}

// Colocación de árboles/rocas: bosque en manchas, fuera de la plaza y los caminos.
function scatter() {
  const R = rng(1337), buckets = { pineTeal: [], pineOlive: [], roundAmber: [], roundGreen: [], rocks: [] }
  for (let gx = -175; gx <= 175; gx += 5.2) for (let gz = -175; gz <= 175; gz += 5.2) {
    const x = gx + (R() - 0.5) * 4.6, z = gz + (R() - 0.5) * 4.6, r = Math.hypot(x, z)
    if (r < 25 || r > 190) continue
    const h = groundHeight(x, z)
    if (h < WATER_Y + 0.6 || pathDist(x, z) < 8) continue
    const forest = vnoise(x * 0.045 + 10, z * 0.045 - 4)
    const s = 0.9 + R() * 0.9
    if (R() < 0.05) { buckets.rocks.push({ x, y: h, z, s: 0.6 + R() * 1.8, ry: R() * 6.28 }); continue }
    if (!(forest > 0.5 ? R() < 0.62 : R() < 0.05)) continue
    const k = R()
    buckets[k < 0.34 ? 'pineTeal' : k < 0.6 ? 'pineOlive' : k < 0.82 ? 'roundAmber' : 'roundGreen'].push({ x, y: h, z, s: s * (forest > 0.5 ? 1.1 : 0.9), ry: R() * 6.28 })
  }
  return buckets
}

// ── Piezas de escena ─────────────────────────────────────────────────────────
const SKY_VERT = 'varying vec3 vDir; void main(){ vDir = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }'
const SKY_FRAG = `
varying vec3 vDir;
uniform vec3 uTop, uMid, uHor, uSunDir, uSunCol;
void main(){
  vec3 d = normalize(vDir); float h = d.y;
  vec3 col = mix(uHor, uMid, smoothstep(0.0, 0.28, h));
  col = mix(col, uTop, smoothstep(0.22, 0.85, h));
  float s = max(dot(d, normalize(uSunDir)), 0.0);
  col += uSunCol * (pow(s, 900.0) * 3.0 + pow(s, 40.0) * 0.55 + pow(s, 6.0) * 0.18);
  col = mix(col, uHor, smoothstep(0.0, -0.08, h));
  col += (fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453) - 0.5) / 255.0;
  gl_FragColor = vec4(col, 1.0);
  #include <colorspace_fragment>
}`
const sunDirOf = (p) => {
  const el = THREE.MathUtils.degToRad(p.sunEl), az = THREE.MathUtils.degToRad(p.sunAz)
  return new THREE.Vector3(Math.sin(az) * Math.cos(el), Math.sin(el), -Math.cos(az) * Math.cos(el))
}

function SkyDome({ p }) {
  const ref = useRef(), { camera } = useThree()
  const uniforms = useMemo(() => ({
    uTop: { value: new THREE.Color() }, uMid: { value: new THREE.Color() }, uHor: { value: new THREE.Color() },
    uSunDir: { value: new THREE.Vector3() }, uSunCol: { value: new THREE.Color() },
  }), [])
  useEffect(() => {
    uniforms.uTop.value.set(p.skyTop); uniforms.uMid.value.set(p.skyMid); uniforms.uHor.value.set(p.skyHor)
    uniforms.uSunCol.value.set(p.sunCol); uniforms.uSunDir.value.copy(sunDirOf(p))
  }, [p, uniforms])
  useFrame(() => ref.current?.position.copy(camera.position))
  return (
    <mesh ref={ref} renderOrder={-1} frustumCulled={false}>
      <sphereGeometry args={[600, 32, 16]} />
      <shaderMaterial side={THREE.BackSide} depthWrite={false} fog={false} uniforms={uniforms} vertexShader={SKY_VERT} fragmentShader={SKY_FRAG} />
    </mesh>
  )
}

function Ridges({ p }) {
  const rings = useMemo(() => [
    { g: buildRidge(215, 38, 1), t: 0.0 }, { g: buildRidge(262, 62, 5), t: 0.5 }, { g: buildRidge(320, 92, 9), t: 1.0 },
  ], [])
  const near = useMemo(() => new THREE.Color(p.ridgeNear), [p.ridgeNear])
  const far = useMemo(() => new THREE.Color(p.ridgeFar), [p.ridgeFar])
  return rings.map((r, i) => (
    <mesh key={i} geometry={r.g} frustumCulled={false}>
      <meshBasicMaterial color={near.clone().lerp(far, r.t)} side={THREE.BackSide} fog={false} />
    </mesh>
  ))
}

function Terrain() {
  const geo = useMemo(() => buildTerrain(), [])
  return (
    <>
      <mesh geometry={geo} receiveShadow>
        <meshStandardMaterial vertexColors flatShading roughness={1} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, WATER_Y, 0]}>
        <planeGeometry args={[440, 440]} />
        <meshStandardMaterial color="#2f7f8f" roughness={0.35} metalness={0.1} transparent opacity={0.82} />
      </mesh>
    </>
  )
}

function Instances({ items, geometry, wind = true, castShadow = true }) {
  const ref = useRef()
  const material = useMemo(() => {
    const m = new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 1 })
    if (wind) m.onBeforeCompile = (sh) => {
      sh.uniforms.uTime = windU
      sh.vertexShader = 'uniform float uTime;\n' + sh.vertexShader.replace('#include <begin_vertex>',
        `#include <begin_vertex>
         float sway = sin(uTime * 1.3 + instanceMatrix[3].x * 0.35 + instanceMatrix[3].z * 0.27) * 0.045 * position.y;
         transformed.x += sway; transformed.z += sway * 0.6;`)
    }
    return m
  }, [wind])
  useEffect(() => {
    const d = new THREE.Object3D()
    items.forEach((it, i) => {
      d.position.set(it.x, it.y - 0.1, it.z); d.rotation.set(0, it.ry, 0); d.scale.setScalar(it.s); d.updateMatrix()
      ref.current.setMatrixAt(i, d.matrix)
    })
    ref.current.instanceMatrix.needsUpdate = true
  }, [items])
  return <instancedMesh ref={ref} args={[geometry, material, items.length]} castShadow={castShadow} receiveShadow frustumCulled={false} />
}

function Forest() {
  const b = useMemo(() => scatter(), [])
  const g = useMemo(() => ({
    pineTeal: pineGeo('#2f6b5f', '#3f8a6a'), pineOlive: pineGeo('#4f6b2f', '#7a8f3a'),
    roundAmber: roundGeo('#d98a3d', '#e8b04a'), roundGreen: roundGeo('#8a9a3a', '#b0b84a'),
    rocks: paint(new THREE.DodecahedronGeometry(1, 0), '#8a7a8f'),
  }), [])
  return (
    <>
      {['pineTeal', 'pineOlive', 'roundAmber', 'roundGreen'].map((k) => <Instances key={k} items={b[k]} geometry={g[k]} />)}
      <Instances items={b.rocks} geometry={g.rocks} wind={false} />
    </>
  )
}

// ── Torre faro (el punto focal visible desde el spawn) ───────────────────────
const TOWER_S = 0.75
function Tower({ p }) {
  const wins = useRef()
  const winData = useMemo(() => {
    const rows = [{ y: 8, R: 4.21 }, { y: 13, R: 3.9 }, { y: 18, R: 3.58 }, { y: 24, R: 3.27 }, { y: 30.6, R: 2.5 }], out = []
    rows.forEach((row, ri) => { for (let k = 0; k < 8; k++) {
      if (hash(ri, k) > 0.72) continue
      const th = (k + 0.5) * (Math.PI / 4), rad = row.R * 0.924 + 0.03
      out.push({ x: Math.sin(th) * rad, y: row.y, z: Math.cos(th) * rad, ry: th })
    } })
    return out
  }, [])
  useEffect(() => {
    const d = new THREE.Object3D()
    winData.forEach((w, i) => { d.position.set(w.x, w.y, w.z); d.rotation.set(0, w.ry, 0); d.updateMatrix(); wins.current.setMatrixAt(i, d.matrix) })
    wins.current.instanceMatrix.needsUpdate = true
  }, [winData])
  const stone = (c) => <meshStandardMaterial color={c} flatShading roughness={0.95} />
  const warm = useMemo(() => new THREE.Color('#ffcf7a'), [])
  return (
    <group scale={TOWER_S}>
      <mesh position={[0, 2.5, 0]} castShadow receiveShadow><cylinderGeometry args={[5.6, 6.6, 5, 8]} />{stone('#c9b79c')}</mesh>
      <mesh position={[0, 13, 0]} castShadow receiveShadow><cylinderGeometry args={[3.4, 4.4, 16, 8]} />{stone('#d8c7a8')}</mesh>
      <mesh position={[0, 21.5, 0]} castShadow><cylinderGeometry args={[4.3, 4.3, 1, 8]} />{stone('#8c6f5a')}</mesh>
      <mesh position={[0, 25, 0]} castShadow receiveShadow><cylinderGeometry args={[3.0, 3.4, 6, 8]} />{stone('#e0cfae')}</mesh>
      <mesh position={[0, 28.3, 0]} castShadow><cylinderGeometry args={[4.2, 4.2, 0.6, 8]} />{stone('#8c6f5a')}</mesh>
      <mesh position={[0, 30.6, 0]} castShadow><cylinderGeometry args={[2.4, 2.6, 4, 8]} />{stone('#d8c7a8')}</mesh>
      <mesh position={[0, 36, 0]} castShadow><coneGeometry args={[3.6, 6.5, 8]} />{stone('#3d3a7a')}</mesh>
      <mesh position={[0, 41.5, 0]}><cylinderGeometry args={[0.12, 0.2, 5, 6]} />{stone('#e8c766')}</mesh>
      <mesh position={[0, 44.3, 0]}><sphereGeometry args={[0.55, 12, 8]} /><meshBasicMaterial color={new THREE.Color('#ffd978').multiplyScalar(3.2)} toneMapped={false} /></mesh>
      <instancedMesh ref={wins} args={[undefined, undefined, winData.length]} frustumCulled={false}>
        <boxGeometry args={[0.7, 1.15, 0.3]} />
        <meshBasicMaterial color={warm.clone().multiplyScalar(p.glow)} toneMapped={false} />
      </instancedMesh>
      <LightPillar color="#ffd978" height={130} radius={1.4} position={[0, 45, 0]} />
    </group>
  )
}

const PILLAR_VERT = 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }'
const PILLAR_FRAG = `
varying vec2 vUv; uniform vec3 uColor;
void main(){ float a = pow(1.0 - vUv.y, 1.6) * 0.55 * smoothstep(0.0, 0.04, vUv.y); gl_FragColor = vec4(uColor, a); }`
// Columna de luz aditiva: es lo que te dice "ahí hay algo" desde lejos.
function LightPillar({ color, height, radius, position }) {
  const uniforms = useMemo(() => ({ uColor: { value: new THREE.Color(color).multiplyScalar(1.6) } }), [color])
  return (
    <mesh position={[position[0], position[1] + height / 2, position[2]]} frustumCulled={false}>
      <cylinderGeometry args={[radius * 0.5, radius * 2.2, height, 20, 1, true]} />
      <shaderMaterial uniforms={uniforms} vertexShader={PILLAR_VERT} fragmentShader={PILLAR_FRAG}
        transparent depthWrite={false} blending={THREE.AdditiveBlending} side={THREE.DoubleSide} fog={false} />
    </mesh>
  )
}

function Plaza() {
  return (
    <group>
      <mesh position={[0, -0.05, 0]} receiveShadow><cylinderGeometry args={[PLAZA_R + 0.7, PLAZA_R + 0.9, 0.5, 48]} /><meshStandardMaterial color="#9c8466" flatShading roughness={1} /></mesh>
      <mesh position={[0, 0.05, 0]} receiveShadow><cylinderGeometry args={[PLAZA_R, PLAZA_R, 0.4, 48]} /><meshStandardMaterial color="#cdb89a" flatShading roughness={1} /></mesh>
      {[9.5, 15].map((r) => (
        <mesh key={r} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.26, 0]}><ringGeometry args={[r, r + 0.6, 64]} /><meshStandardMaterial color="#a88b6b" roughness={1} /></mesh>
      ))}
    </group>
  )
}

function Flag({ color, position, angle }) {
  const ref = useRef()
  useFrame((s) => { if (ref.current) ref.current.rotation.y = Math.sin(s.clock.elapsedTime * 2 + angle) * 0.25 })
  return (
    <group position={position}>
      <mesh position={[0, 3, 0]} castShadow><cylinderGeometry args={[0.08, 0.1, 6, 5]} /><meshStandardMaterial color="#5a4636" flatShading /></mesh>
      <group ref={ref} position={[0, 5.2, 0]}>
        <mesh position={[1.1, 0, 0]}><planeGeometry args={[2.2, 1.3]} /><meshStandardMaterial color={color} side={THREE.DoubleSide} flatShading emissive={color} emissiveIntensity={0.25} /></mesh>
      </group>
    </group>
  )
}

function Gate({ ac, pts, p }) {
  const [x, z] = pts[pts.length - 1], [px, pz] = pts[pts.length - 2]
  const y = groundHeight(x, z), heading = Math.atan2(x - px, z - pz)
  const orb = useMemo(() => new THREE.Color(ac.accent).multiplyScalar(2.6), [ac.accent])
  return (
    <group position={[x, y, z]} rotation={[0, heading, 0]}>
      {[-3.2, 3.2].map((o) => <mesh key={o} position={[o, 3.6, 0]} castShadow><boxGeometry args={[1, 7.2, 1]} /><meshStandardMaterial color="#cdb89a" flatShading /></mesh>)}
      <mesh position={[0, 7.6, 0]} castShadow><boxGeometry args={[8.2, 1, 1.3]} /><meshStandardMaterial color="#8c6f5a" flatShading /></mesh>
      <mesh position={[0, 9.4, 0]}><octahedronGeometry args={[0.9, 0]} /><meshBasicMaterial color={orb} toneMapped={false} /></mesh>
      <LightPillar color={ac.accent} height={110} radius={0.9} position={[0, 10, 0]} />
      <Html position={[0, 13, 0]} center zIndexRange={[20, 0]} style={{ pointerEvents: 'none' }}>
        <div style={{ borderColor: ac.accent, boxShadow: `0 0 18px ${ac.accent}55` }}
          className="whitespace-nowrap rounded-full border bg-black/55 px-3 py-1 text-xs font-bold text-white backdrop-blur-sm">
          {ac.emoji} {ac.name}
        </div>
      </Html>
      <pointLight position={[0, 9, 0]} color={ac.accent} intensity={p.glow * 40} distance={26} decay={2} />
    </group>
  )
}

// Gemas: el "ganchito" de explorar — sigue los caminos y asómate a los lados.
const GEMS = (() => {
  const out = [], R = rng(99)
  PATHS.forEach(({ ac, pts }) => [0.22, 0.42, 0.62, 0.82].forEach((t, j) => {
    const k = Math.floor(t * 12), [x, z] = pts[k], side = (j % 2 ? 1 : -1) * (2 + R() * 1.6)
    out.push({ x: x + side, z: z + side * 0.4, color: ac.accent })
  }))
  for (let i = 0; i < 4; i++) { const a = R() * 6.28, d = 45 + R() * 50; out.push({ x: Math.cos(a) * d, z: Math.sin(a) * d, color: '#ffd978' }) }
  return out.map((g) => ({ ...g, y: groundHeight(g.x, g.z) + 1.2 }))
})()

function Gems({ onCollect }) {
  const refs = useRef([]), got = useRef(new Set()), { camera } = useThree()
  useFrame((s) => {
    GEMS.forEach((g, i) => {
      const m = refs.current[i]
      if (!m || got.current.has(i)) return
      m.rotation.y = s.clock.elapsedTime * 1.4 + i
      m.position.y = g.y + Math.sin(s.clock.elapsedTime * 2 + i) * 0.25
      if (camera.position.distanceTo(m.position) < 2.1) {
        got.current.add(i); m.visible = false; onCollect(got.current.size)
        if (got.current.size === GEMS.length) playLevelUpSound(); else playAchievementSound()
      }
    })
  })
  return GEMS.map((g, i) => (
    <mesh key={i} ref={(el) => { refs.current[i] = el }} position={[g.x, g.y, g.z]} frustumCulled={false}>
      <octahedronGeometry args={[0.38, 0]} />
      <meshBasicMaterial color={new THREE.Color(g.color).multiplyScalar(2.4)} toneMapped={false} />
    </mesh>
  ))
}

const FLY_VERT = `
uniform float uTime, uPx; attribute float aPhase; varying float vA;
void main(){
  vec3 p = position;
  p.y += sin(uTime * 0.6 + aPhase * 6.2831) * 0.7; p.x += sin(uTime * 0.4 + aPhase * 17.0) * 0.9; p.z += cos(uTime * 0.5 + aPhase * 11.0) * 0.9;
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = clamp(2.2 * uPx * (60.0 / -mv.z), 1.0, 22.0 * uPx);
  vA = 0.5 + 0.5 * sin(uTime * (1.5 + aPhase * 2.0) + aPhase * 40.0);
}`
const FLY_FRAG = `
uniform vec3 uColor; uniform float uI; varying float vA;
void main(){ float d = length(gl_PointCoord - 0.5) * 2.0; float a = smoothstep(1.0, 0.0, d); gl_FragColor = vec4(uColor * uI, a * a * vA); }`
function Fireflies({ p }) {
  const { gl } = useThree()
  const geo = useMemo(() => {
    const R = rng(7), N = 260, pos = new Float32Array(N * 3), ph = new Float32Array(N)
    for (let i = 0; i < N; i++) {
      const x = (R() - 0.5) * 150, z = (R() - 0.5) * 150
      pos.set([x, groundHeight(x, z) + 0.6 + R() * 5, z], i * 3); ph[i] = R()
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('aPhase', new THREE.BufferAttribute(ph, 1))
    return g
  }, [])
  const uniforms = useMemo(() => ({ uTime: windU, uPx: { value: 1 }, uColor: { value: new THREE.Color('#ffe08a') }, uI: { value: 1 } }), [])
  const mat = useRef()
  useFrame(() => { const u = mat.current?.uniforms; if (u) { u.uPx.value = gl.getPixelRatio(); u.uI.value = p.flies * 1.4 } })
  return (
    <points geometry={geo} frustumCulled={false}>
      <shaderMaterial ref={mat} uniforms={uniforms} vertexShader={FLY_VERT} fragmentShader={FLY_FRAG} transparent depthWrite={false} blending={THREE.AdditiveBlending} fog={false} />
    </points>
  )
}

// ── Caminante (exploración): WASD + arrastrar para mirar ─────────────────────
function Walker({ start }) {
  const { camera, gl } = useThree()
  const st = useRef({ ...start, keys: new Set(), drag: null, y: null, bob: 0 })
  useEffect(() => {
    const s = st.current, el = gl.domElement
    const kd = (e) => { if (e.target.tagName === 'INPUT') return; s.keys.add(e.code); if (e.code.startsWith('Arrow') || e.code === 'Space') e.preventDefault() }
    const ku = (e) => s.keys.delete(e.code)
    const pd = (e) => { s.drag = { x: e.clientX, y: e.clientY }; el.setPointerCapture?.(e.pointerId) }
    const pm = (e) => {
      if (!s.drag) return
      s.yaw -= (e.clientX - s.drag.x) * 0.0042; s.pitch = clamp(s.pitch - (e.clientY - s.drag.y) * 0.0035, -1.2, 1.2)
      s.drag = { x: e.clientX, y: e.clientY }
    }
    const pu = () => { s.drag = null }
    window.addEventListener('keydown', kd); window.addEventListener('keyup', ku)
    el.addEventListener('pointerdown', pd); el.addEventListener('pointermove', pm); el.addEventListener('pointerup', pu)
    return () => {
      window.removeEventListener('keydown', kd); window.removeEventListener('keyup', ku)
      el.removeEventListener('pointerdown', pd); el.removeEventListener('pointermove', pm); el.removeEventListener('pointerup', pu)
    }
  }, [gl])
  useFrame((_, dt0) => {
    const s = st.current, k = s.keys, dt = Math.min(dt0, 0.05)
    const fwd = (k.has('KeyW') || k.has('ArrowUp') ? 1 : 0) - (k.has('KeyS') || k.has('ArrowDown') ? 1 : 0)
    const str = (k.has('KeyD') ? 1 : 0) - (k.has('KeyA') ? 1 : 0)
    if (k.has('ArrowLeft')) s.yaw += 1.6 * dt
    if (k.has('ArrowRight')) s.yaw -= 1.6 * dt
    const sp = (k.has('ShiftLeft') || k.has('ShiftRight') ? 14 : 7) * dt, sin = Math.sin(s.yaw), cos = Math.cos(s.yaw)
    s.x += (-sin * fwd + cos * str) * sp; s.z += (-cos * fwd - sin * str) * sp
    const r = Math.hypot(s.x, s.z); if (r > WALK_LIMIT) { s.x *= WALK_LIMIT / r; s.z *= WALK_LIMIT / r }
    const moving = fwd !== 0 || str !== 0, prevStep = Math.floor(s.bob / Math.PI)
    s.bob = moving ? s.bob + dt * (k.has('ShiftLeft') || k.has('ShiftRight') ? 13 : 9) : s.bob
    if (moving && Math.floor(s.bob / Math.PI) !== prevStep) footstep(Math.hypot(s.x, s.z) < PLAZA_R)
    const gy = groundHeight(s.x, s.z) + 1.7
    s.y = s.y == null ? gy : lerp(s.y, gy, 1 - Math.exp(-12 * dt))
    camera.position.set(s.x, s.y + (moving ? Math.sin(s.bob) * 0.04 : 0), s.z)
    camera.rotation.set(s.pitch, s.yaw, 0, 'YXZ')
  })
  return null
}

// El sol/luna sigue al caminante para que la sombra siempre se vea nítida cerca de él.
function Sun({ p }) {
  const light = useRef(), { camera } = useThree()
  const target = useMemo(() => new THREE.Object3D(), [])
  const dir = useMemo(() => sunDirOf(p), [p])
  useFrame(() => {
    if (!light.current) return
    target.position.set(camera.position.x, 0, camera.position.z); target.updateMatrixWorld()
    light.current.position.copy(target.position).addScaledVector(dir, 90)
  })
  return (
    <>
      <primitive object={target} />
      <directionalLight ref={light} target={target} color={p.dirCol} intensity={p.dirI} castShadow
        shadow-mapSize={[2048, 2048]} shadow-camera-left={-55} shadow-camera-right={55} shadow-camera-top={55} shadow-camera-bottom={-55}
        shadow-camera-near={1} shadow-camera-far={220} shadow-bias={-0.0004} shadow-normalBias={0.06} />
    </>
  )
}

// Luz de relleno que sigue a la cámara (sin sombras): con el sol bajo y de frente los personajes
// quedarían en silueta negra; esto los mantiene legibles sin quitarle drama al atardecer.
const _fwd = new THREE.Vector3()
function FillLight({ p }) {
  const light = useRef(), { camera } = useThree()
  const target = useMemo(() => new THREE.Object3D(), [])
  useFrame(() => {
    if (!light.current) return
    camera.getWorldDirection(_fwd)
    target.position.copy(camera.position).addScaledVector(_fwd, 10); target.updateMatrixWorld()
    light.current.position.copy(camera.position)
  })
  return (<><primitive object={target} /><directionalLight ref={light} target={target} color={p.fillCol} intensity={p.fillI} /></>)
}

function Clock() { useFrame((s) => { windU.value = s.clock.elapsedTime }); return null }

// Altura donde pisa un NPC: la losa de la plaza queda a 0.25, fuera de ella es el terreno.
const standY = (x, z) => (Math.hypot(x, z) < PLAZA_R ? 0.26 : groundHeight(x, z))
const NO_CHANNEL = { current: { on: () => {} } } // NpcSpeechPlayer espera un canal Realtime; aquí no hay multijugador

function World({ p, start, onCollect, mobile, stylized, onNear }) {
  const { camera } = useThree()
  const playerPos = useMemo(() => ({ current: camera.position }), [camera])
  return (
    <>
      <Clock />
      <fog attach="fog" args={[p.fog, 45, 190]} />
      <SkyDome p={p} />
      {p.stars && <Stars radius={320} depth={60} count={2500} factor={6} fade />}
      <hemisphereLight args={[p.hemiSky, p.hemiGround, p.hemiI]} />
      <Sun p={p} />
      <FillLight p={p} />
      <Ridges p={p} />
      <Terrain />
      <Plaza />
      <Tower p={p} />
      <Forest />
      {PATHS.map(({ ac, pts }, i) => {
        const [fx, fz] = pts[0]
        return <Flag key={ac.id} color={ac.accent} angle={i} position={[fx * 0.92, groundHeight(fx, fz), fz * 0.92]} />
      })}
      {PATHS.map(({ ac, pts }) => <Gate key={ac.id} ac={ac} pts={pts} p={p} />)}
      <Gems onCollect={onCollect} />
      <DemoNpcs stylized={stylized} groundAt={standY} onNear={onNear} />
      <NpcSpeechPlayer channelRef={NO_CHANNEL} playerPositionRef={playerPos} />
      <Fireflies p={p} />
      <Walker start={start} />
      {!mobile && (
        <EffectComposer multisampling={4}>
          <Bloom luminanceThreshold={0.85} luminanceSmoothing={0.9} intensity={p.bloom} mipmapBlur blendFunction={BlendFunction.ADD} />
          <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
          <HueSaturation saturation={0.14} />
          <BrightnessContrast contrast={0.07} />
          <Vignette offset={0.4} darkness={0.5} />
        </EffectComposer>
      )}
    </>
  )
}

export default function PlazaAtmosferica() {
  const [qs] = useSearchParams()
  const [preset, setPreset] = useState(PRESETS[qs.get('preset')] ? qs.get('preset') : 'atardecer')
  const [gems, setGems] = useState(0)
  const [stylized, setStylized] = useState(qs.get('estilo') === '1')
  const [soundOn, setSoundOn] = useState(true)
  const [nearId, setNearId] = useState(null)
  const speakingId = useNpcSpeechStore((s) => s.activeNpcId)
  const [mobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < 768)
  const num = (k, d) => (Number.isFinite(parseFloat(qs.get(k))) ? parseFloat(qs.get(k)) : d)
  const start = useMemo(() => ({
    x: num('x', 0), z: num('z', 40), yaw: THREE.MathUtils.degToRad(num('yaw', 0)), pitch: THREE.MathUtils.degToRad(num('pitch', 17)),
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [])
  const p = PRESETS[preset]

  // Sonido: el navegador exige un gesto antes de reproducir audio, así que el ambiente
  // arranca con el primer clic/tecla. Las voces de los NPC usan su propio interruptor (🔊 en el diálogo).
  useEffect(() => {
    if (!soundOn) { setAmbienceMuted(true); return }
    setAmbienceMuted(false)
    const go = () => startAmbience(preset)
    window.addEventListener('pointerdown', go, { once: true }); window.addEventListener('keydown', go, { once: true })
    return () => { window.removeEventListener('pointerdown', go); window.removeEventListener('keydown', go) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [soundOn])
  useEffect(() => { setAmbiencePreset(preset) }, [preset])
  useEffect(() => () => { shutdownAmbience(); window.speechSynthesis?.cancel() }, [])

  // E = hablar con el NPC cercano (mismo sistema de diálogo con voz del mundo real).
  useEffect(() => {
    const kd = (e) => { if (e.code === 'KeyE' && nearId) talkTo(nearId) }
    window.addEventListener('keydown', kd)
    return () => window.removeEventListener('keydown', kd)
  }, [nearId])

  const pill = 'rounded-full border border-white/20 bg-black/45 backdrop-blur-sm'
  return (
    <div className="relative h-screen w-full overflow-hidden bg-black">
      <Canvas shadows dpr={[1, 1.75]} flat={!mobile} camera={{ fov: 62, near: 0.1, far: 1200, position: [start.x, 2, start.z] }}
        gl={{ antialias: true, powerPreference: 'high-performance' }}>
        <Suspense fallback={null}><World p={p} start={start} onCollect={setGems} mobile={mobile} stylized={stylized} onNear={setNearId} /></Suspense>
      </Canvas>

      <div className="pointer-events-none absolute inset-0 select-none">
        <Link to="/dashboard" className="pointer-events-auto absolute left-4 top-4 rounded-full border border-white/25 bg-black/45 px-4 py-2 text-sm font-bold text-white backdrop-blur-sm hover:bg-black/65">
          ← {tr('Salir', 'Exit')}
        </Link>
        <div className="absolute left-1/2 top-4 -translate-x-1/2 rounded-full border border-amber-300/40 bg-black/45 px-5 py-2 text-center backdrop-blur-sm">
          <p className="text-sm font-black text-amber-200">{tr('Plaza de las Academias', 'Academy Plaza')}</p>
          <p className="text-[10px] text-white/55">{tr('Boceto de dirección de arte', 'Art direction sketch')}</p>
        </div>
        <div className={`pointer-events-auto absolute right-4 top-4 flex gap-1.5 p-1 ${pill}`}>
          {Object.entries(PRESETS).map(([id, v]) => (
            <button key={id} type="button" onClick={() => setPreset(id)}
              className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${preset === id ? 'bg-amber-300 text-black' : 'text-white/80 hover:bg-white/10'}`}>
              {v.icon} {v.label}
            </button>
          ))}
        </div>
        <div className="pointer-events-auto absolute right-4 top-16 flex gap-1.5">
          <button type="button" onClick={() => setStylized((v) => !v)} className={`${pill} px-3 py-1.5 text-xs font-bold text-white hover:bg-black/65`}>
            {stylized ? tr('🎨 Modelos: estilizados', '🎨 Models: stylized') : tr('🧍 Modelos: originales', '🧍 Models: original')}
          </button>
          <button type="button" onClick={() => setSoundOn((v) => !v)} className={`${pill} px-3 py-1.5 text-xs font-bold text-white hover:bg-black/65`}>
            {soundOn ? '🔊' : '🔇'} {tr('Ambiente', 'Ambience')}
          </button>
        </div>

        {nearId && !speakingId && (
          <button type="button" onClick={() => talkTo(nearId)}
            className="pointer-events-auto absolute bottom-20 left-1/2 -translate-x-1/2 rounded-full border border-amber-300/60 bg-black/60 px-5 py-2 text-sm font-bold text-amber-100 shadow-lg backdrop-blur-sm transition hover:scale-105">
            <kbd className="mr-2 rounded bg-amber-300 px-1.5 py-0.5 text-xs font-black text-black">E</kbd>
            {tr('Hablar con', 'Talk to')} {npcEmoji(nearId)} {npcName(nearId)}
          </button>
        )}

        <div className={`absolute bottom-4 left-1/2 -translate-x-1/2 px-5 py-2 text-sm font-bold text-white ${pill}`}>
          💎 {gems}/{GEMS.length}
        </div>
        <p className="absolute bottom-4 left-4 max-w-[46vw] text-[11px] leading-snug text-white/60">
          {tr('WASD mover · Shift correr · arrastra para mirar · E hablar · sigue las columnas de luz', 'WASD move · Shift run · drag to look · E talk · follow the light pillars')}
        </p>
      </div>

      {/* Caja de diálogo con voz del mundo real, tal cual (no es un mock). Fuera del overlay con pointer-events:none para que sus botones respondan. */}
      <NpcDialogueBox />
    </div>
  )
}
