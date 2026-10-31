import { useCallback, useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Html, Stars } from '@react-three/drei'
import * as THREE from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { playAchievementSound, playLevelUpSound } from '../../../utils/sound'
import {
  PLAZA_R, PLAZA_Y, WATER_Y, PATHS, GEMS, hash, vnoise, rng, smooth, pathDist, groundHeight, sunDirOf,
} from './plazaWorld'

// ─────────────────────────────────────────────────────────────────────────────
// Escenario de la Plaza de las Academias — low-poly atmosférico con aire griego.
// Se usa tal cual en la demo (/vr/plaza-demo, escala 1) y en el mundo real
// (/vr/plaza, dentro de VRPage, a escala reducida: el jugador mide 0.4 u y camina
// a 5.5 u/s, así que todo el paisaje se encoge con `scale`). 100% procedural.
//
// Qué va dentro de `scale` y qué no: la geometría (terreno, templo, árboles) y las
// luces locales viven en un <group scale>; el cielo, la niebla y el sol van en
// unidades de mundo (se les multiplica `scale` a mano) porque un <group> no
// escala distancias de luz ni de niebla.
// ─────────────────────────────────────────────────────────────────────────────

const MARBLE = '#efe6d4', MARBLE_SH = '#d8cdb6', TERRA = '#c2653d', BLUE = '#2f63a8', GOLD = '#e8c766'

// ── Geometría con color por vértice (la paleta vive en la malla, no en texturas) ──
function paint(g, hex) {
  const c = new THREE.Color(hex), n = g.attributes.position.count, a = new Float32Array(n * 3)
  for (let i = 0; i < n; i++) { a[i * 3] = c.r; a[i * 3 + 1] = c.g; a[i * 3 + 2] = c.b }
  g.setAttribute('color', new THREE.BufferAttribute(a, 3))
  return g
}
// toNonIndexed: mergeGeometries exige que todas sean indexadas o ninguna — devuelve null si no.
const part = (g, hex, x = 0, y = 0, z = 0) => { g.translate(x, y, z); paint(g, hex); return g.index ? g.toNonIndexed() : g }
const boxG = (w, h, d, hex, x, y, z) => part(new THREE.BoxGeometry(w, h, d), hex, x, y, z)
const cylG = (rt, rb, h, seg, hex, x, y, z) => part(new THREE.CylinderGeometry(rt, rb, h, seg), hex, x, y, z)

const cypressGeo = () => mergeGeometries([
  cylG(0.12, 0.18, 0.8, 5, '#4a3426', 0, 0.4, 0),
  part(new THREE.ConeGeometry(0.85, 2.6, 7), '#2f4f35', 0, 1.9, 0),
  part(new THREE.ConeGeometry(0.7, 2.4, 7), '#35603f', 0, 3.4, 0),
  part(new THREE.ConeGeometry(0.5, 2.0, 7), '#3f6a45', 0, 4.8, 0),
])
const oliveGeo = (a, b, c) => mergeGeometries([
  cylG(0.22, 0.34, 1.5, 6, '#6b5a48', 0.1, 0.75, 0),
  part(new THREE.IcosahedronGeometry(1.35, 0).scale(1, 0.75, 1), a, 0, 2.2, 0),
  part(new THREE.IcosahedronGeometry(0.95, 0).scale(1, 0.75, 1), b, 0.9, 2.6, 0.3),
  part(new THREE.IcosahedronGeometry(0.85, 0).scale(1, 0.75, 1), c, -0.8, 2.4, -0.3),
])
const stonePineGeo = () => mergeGeometries([
  cylG(0.18, 0.26, 3.3, 5, '#5a4636', 0, 1.65, 0),
  part(new THREE.IcosahedronGeometry(2.0, 0).scale(1, 0.38, 1), '#4f7a45', 0, 3.7, 0),
  part(new THREE.IcosahedronGeometry(1.3, 0).scale(1, 0.4, 1), '#5c8a4d', 0.3, 4.2, 0.2),
])

function buildTerrain(torre) {
  const SIZE = 440, SEG = 160, cell = SIZE / SEG
  const g = new THREE.PlaneGeometry(SIZE, SIZE, SEG, SEG)
  g.rotateX(-Math.PI / 2)
  const pos = g.attributes.position, col = new Float32Array(pos.count * 3), c = new THREE.Color()
  const grassA = new THREE.Color(torre ? '#7d8f45' : '#a9a45a'), grassB = new THREE.Color(torre ? '#3f6b4a' : '#6f7f45'), meadow = new THREE.Color(torre ? '#b4a64f' : '#c9b765')
  const rock = new THREE.Color(torre ? '#7a6a82' : '#c9bda5'), sand = new THREE.Color(torre ? '#d6b58a' : '#e6cf9f')
  const stone = new THREE.Color(torre ? '#cdb89a' : '#e4d8c0'), dirt = new THREE.Color(torre ? '#c79a6b' : '#cfa77a')
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

// Suelo para el raycast del Player: misma altura que el terreno visible, malla más gruesa (barata de lanzarle rayos).
function buildGroundProxy() {
  const g = new THREE.PlaneGeometry(440, 440, 110, 110)
  g.rotateX(-Math.PI / 2)
  const pos = g.attributes.position
  for (let i = 0; i < pos.count; i++) pos.setY(i, groundHeight(pos.getX(i), pos.getZ(i)))
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

// Bosque griego en manchas: cipreses, olivos, pino piñonero y rocas de caliza.
function scatter() {
  const R = rng(1337), b = { cypress: [], olive: [], oliveGold: [], stonePine: [], rocks: [] }
  for (let gx = -175; gx <= 175; gx += 5.2) for (let gz = -175; gz <= 175; gz += 5.2) {
    const x = gx + (R() - 0.5) * 4.6, z = gz + (R() - 0.5) * 4.6, r = Math.hypot(x, z)
    if (r < 25 || r > 190) continue
    const h = groundHeight(x, z)
    if (h < WATER_Y + 0.6 || pathDist(x, z) < 8) continue
    const forest = vnoise(x * 0.045 + 10, z * 0.045 - 4)
    const s = 0.9 + R() * 0.9
    if (R() < 0.05) { b.rocks.push({ x, y: h, z, s: 0.6 + R() * 1.8, ry: R() * 6.28 }); continue }
    if (!(forest > 0.5 ? R() < 0.62 : R() < 0.05)) continue
    const k = R()
    b[k < 0.3 ? 'cypress' : k < 0.62 ? 'olive' : k < 0.82 ? 'oliveGold' : 'stonePine'].push({ x, y: h, z, s: s * (forest > 0.5 ? 1.1 : 0.9), ry: R() * 6.28 })
  }
  return b
}

// ── Cielo, relieve lejano y suelo ────────────────────────────────────────────
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

function Terrain({ torre }) {
  const geo = useMemo(() => buildTerrain(torre), [torre])
  return (
    <>
      <mesh geometry={geo} receiveShadow><meshStandardMaterial vertexColors flatShading roughness={1} /></mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, WATER_Y, 0]}>
        <planeGeometry args={[440, 440]} />
        <meshStandardMaterial color="#1f9fc4" roughness={0.3} metalness={0.1} transparent opacity={0.85} />
      </mesh>
    </>
  )
}

// ── Árboles y rocas (instanciados, con viento) ───────────────────────────────
const windU = { value: 0 } // reloj compartido: viento de los árboles y luciérnagas
function Clock() { useFrame((s) => { windU.value = s.clock.elapsedTime }); return null }

function Instances({ items, geometry, wind = true }) {
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
  return <instancedMesh ref={ref} args={[geometry, material, items.length]} castShadow receiveShadow frustumCulled={false} />
}

function Forest() {
  const b = useMemo(() => scatter(), [])
  const g = useMemo(() => ({
    cypress: cypressGeo(), olive: oliveGeo('#8fa26b', '#a7b884', '#7f9660'), oliveGold: oliveGeo('#b3a860', '#c9bf78', '#9c9552'),
    stonePine: stonePineGeo(), rocks: paint(new THREE.DodecahedronGeometry(1, 0), '#cfc6b0'),
  }), [])
  return (
    <>
      {['cypress', 'olive', 'oliveGold', 'stonePine'].map((k) => <Instances key={k} items={b[k]} geometry={g[k]} />)}
      <Instances items={b.rocks} geometry={g.rocks} wind={false} />
    </>
  )
}

// ── Templo dórico (punto focal) ──────────────────────────────────────────────
// Un solo geometry con color por vértice: ~16 columnas + escalones + frontón + cella en 1 draw call.
const COLUMNS = (() => {
  const out = []
  for (const x of [-10, -6, -2, 2, 6, 10]) for (const z of [-6, 6]) out.push([x, z])
  for (const x of [-10, 10]) for (const z of [-2, 2]) out.push([x, z])
  return out
})()
const TOP = PLAZA_Y + 1.5 // altura del estilóbato (3 escalones de 0.5)

function buildTemple() {
  const P = []
  P.push(boxG(27, 0.5, 17, MARBLE_SH, 0, PLAZA_Y + 0.25, 0), boxG(25.6, 0.5, 15.8, MARBLE, 0, PLAZA_Y + 0.75, 0), boxG(24.2, 0.5, 14.6, MARBLE_SH, 0, PLAZA_Y + 1.25, 0))
  // cella (el recinto interior, abierto al frente)
  P.push(boxG(14.6, 7.4, 0.7, '#e6dcc4', 0, TOP + 3.7, -3.7), boxG(0.7, 7.4, 7.4, '#e6dcc4', -7, TOP + 3.7, 0), boxG(0.7, 7.4, 7.4, '#e6dcc4', 7, TOP + 3.7, 0))
  for (const [x, z] of COLUMNS) {
    P.push(cylG(0.5, 0.64, 6.6, 10, MARBLE, x, TOP + 3.3, z))        // fuste (10 caras = estrías en flat shading)
    P.push(cylG(0.78, 0.5, 0.35, 10, MARBLE_SH, x, TOP + 6.78, z))   // equino
    P.push(boxG(1.7, 0.35, 1.7, MARBLE, x, TOP + 7.12, z))           // ábaco
  }
  const topCol = TOP + 7.3
  P.push(boxG(22.2, 0.9, 13.2, MARBLE, 0, topCol + 0.45, 0))            // arquitrabe
  P.push(boxG(22.4, 0.9, 13.4, '#e6dcc4', 0, topCol + 1.35, 0))         // friso
  P.push(boxG(23.6, 0.35, 14.6, MARBLE_SH, 0, topCol + 2.0, 0))         // cornisa
  for (const x of [-10, -6, -2, 2, 6, 10]) for (const z of [-6.75, 6.75]) P.push(boxG(1.3, 0.6, 0.12, BLUE, x, topCol + 1.35, z)) // metopas azules
  // frontón/techo a dos aguas (prisma triangular) + tímpano azul con sol dorado
  const tri = (w, h) => { const s = new THREE.Shape(); s.moveTo(-w / 2, 0); s.lineTo(w / 2, 0); s.lineTo(0, h); s.closePath(); return s }
  const roofY = topCol + 2.18
  const roof = new THREE.ExtrudeGeometry(tri(23.4, 3.5), { depth: 14.4, bevelEnabled: false }); roof.translate(0, roofY, -7.2)
  P.push(paint(roof, TERRA))
  for (const sz of [1, -1]) {
    const t = new THREE.ExtrudeGeometry(tri(19.6, 2.7), { depth: 0.12, bevelEnabled: false }); t.translate(0, roofY + 0.25, sz > 0 ? 7.2 : -7.32)
    P.push(paint(t, BLUE))
    P.push(cylG(0.65, 0.65, 0.14, 12, GOLD, 0, roofY + 1.45, sz * 7.38).rotateX(Math.PI / 2))
  }
  P.push(part(new THREE.ConeGeometry(0.45, 1.1, 6), GOLD, 0, roofY + 3.5 + 0.4, 0)) // acroteria
  return mergeGeometries(P.map((g) => (g.index ? g.toNonIndexed() : g)))
}

function Temple({ p }) {
  const geo = useMemo(() => buildTemple(), [])
  const flame = useMemo(() => new THREE.Color('#ffcf7a').multiplyScalar(2.4 * Math.max(0.6, p.glow)), [p.glow])
  return (
    <group>
      <mesh geometry={geo} castShadow receiveShadow><meshStandardMaterial vertexColors flatShading roughness={0.95} /></mesh>
      {/* brasero dentro de la cella: el "corazón" del templo */}
      <mesh position={[0, TOP + 0.45, -1.2]} castShadow><cylinderGeometry args={[0.9, 0.55, 0.9, 8]} /><meshStandardMaterial color="#8c6f5a" flatShading /></mesh>
      <mesh position={[0, TOP + 1.5, -1.2]}><coneGeometry args={[0.55, 1.4, 6]} /><meshBasicMaterial color={flame} toneMapped={false} /></mesh>
      <LightPillar color="#ffd978" height={140} radius={1.3} position={[0, TOP + 7.3 + 6.3, 0]} />
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

// ── Plaza: losa, ribete y cenefa de greca ────────────────────────────────────
// Unidad de greca (u a lo largo del anillo, v hacia afuera): rectángulos [u0, v0, ancho, alto].
const MEANDER_UNIT = [[0, 0, 1.32, 0.16], [0, 0, 0.16, 1.2], [0, 1.04, 1.0, 0.16], [0.84, 0.4, 0.16, 0.8], [0.4, 0.4, 0.6, 0.16], [0.4, 0.4, 0.16, 0.5]]
const MEANDER_N = 84, MEANDER_R0 = 17.0
function Meander() {
  const ref = useRef()
  useEffect(() => {
    const d = new THREE.Object3D(), arc = (2 * Math.PI * (MEANDER_R0 + 0.6)) / MEANDER_N
    let i = 0
    for (let k = 0; k < MEANDER_N; k++) {
      const th = (k / MEANDER_N) * Math.PI * 2, rx = Math.cos(th), rz = Math.sin(th), tx = -Math.sin(th), tz = Math.cos(th)
      for (const [u0, v0, w, h] of MEANDER_UNIT) {
        const u = u0 + w / 2 - 0.66, v = MEANDER_R0 + v0 + h / 2
        d.position.set(rx * v + tx * u * (arc / 1.32), PLAZA_Y + 0.045, rz * v + tz * u * (arc / 1.32))
        d.rotation.set(0, Math.atan2(-Math.cos(th), -Math.sin(th)), 0) // el eje local +x queda a lo largo del anillo
        d.scale.set(w * (arc / 1.32), 0.05, h); d.updateMatrix()
        ref.current.setMatrixAt(i++, d.matrix)
      }
    }
    ref.current.instanceMatrix.needsUpdate = true
  }, [])
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, MEANDER_N * MEANDER_UNIT.length]} receiveShadow frustumCulled={false}>
      <boxGeometry args={[1, 1, 1]} /><meshStandardMaterial color="#1f4e8c" flatShading roughness={0.8} />
    </instancedMesh>
  )
}

function Plaza() {
  return (
    <group>
      <mesh position={[0, PLAZA_Y + 0.02, 0]} receiveShadow><cylinderGeometry args={[PLAZA_R, PLAZA_R, 0.04, 64]} /><meshStandardMaterial color="#e4d8c0" flatShading roughness={1} /></mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, PLAZA_Y + 0.06, 0]}><torusGeometry args={[PLAZA_R + 0.2, 0.42, 5, 64]} /><meshStandardMaterial color="#c9b89a" flatShading roughness={1} /></mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, PLAZA_Y + 0.05, 0]}><ringGeometry args={[16.2, 16.5, 64]} /><meshStandardMaterial color={GOLD} flatShading roughness={0.6} /></mesh>
      <Meander />
    </group>
  )
}

// ── Banderas, propileos, ánforas y ruinas ────────────────────────────────────
function Banner({ color, position, phase }) {
  const ref = useRef()
  useFrame((s) => { if (ref.current) ref.current.rotation.y = Math.sin(s.clock.elapsedTime * 1.6 + phase) * 0.18 })
  return (
    <group position={position}>
      <mesh position={[0, 3.2, 0]} castShadow><cylinderGeometry args={[0.09, 0.12, 6.4, 6]} /><meshStandardMaterial color="#8c6f5a" flatShading /></mesh>
      <mesh position={[0, 6.3, 0]}><sphereGeometry args={[0.2, 8, 6]} /><meshStandardMaterial color={GOLD} flatShading /></mesh>
      <group ref={ref} position={[0, 5.6, 0]}>
        <mesh position={[0.62, -1.15, 0]}><planeGeometry args={[1.1, 2.5]} /><meshStandardMaterial color={color} side={THREE.DoubleSide} flatShading emissive={color} emissiveIntensity={0.25} /></mesh>
        <mesh position={[0.62, -2.45, 0]}><planeGeometry args={[1.1, 0.12]} /><meshStandardMaterial color={GOLD} side={THREE.DoubleSide} flatShading /></mesh>
      </group>
    </group>
  )
}

const gateGeo = (() => { let g = null; return () => (g ??= mergeGeometries([
  cylG(0.4, 0.5, 6, 10, MARBLE, -3.2, 3, 0), cylG(0.4, 0.5, 6, 10, MARBLE, 3.2, 3, 0),
  cylG(0.62, 0.4, 0.3, 10, MARBLE_SH, -3.2, 6.15, 0), cylG(0.62, 0.4, 0.3, 10, MARBLE_SH, 3.2, 6.15, 0),
  boxG(1.4, 0.3, 1.4, MARBLE, -3.2, 6.45, 0), boxG(1.4, 0.3, 1.4, MARBLE, 3.2, 6.45, 0),
  boxG(8.6, 0.8, 1.5, MARBLE, 0, 7.0, 0),
  (() => { const s = new THREE.Shape(); s.moveTo(-4.4, 0); s.lineTo(4.4, 0); s.lineTo(0, 1.7); s.closePath(); const e = new THREE.ExtrudeGeometry(s, { depth: 1.5, bevelEnabled: false }); e.translate(0, 7.4, -0.75); return paint(e, TERRA) })(),
  boxG(1.5, 0.5, 1.5, MARBLE_SH, -3.2, 0.25, 0), boxG(1.5, 0.5, 1.5, MARBLE_SH, 3.2, 0.25, 0),
].map((g) => (g.index ? g.toNonIndexed() : g)))) })()

const amphoraGeo = (() => { let g = null; return () => (g ??= paint(new THREE.LatheGeometry([[0.001, 0], [0.28, 0], [0.36, 0.25], [0.42, 0.6], [0.3, 0.95], [0.18, 1.05], [0.2, 1.25], [0.3, 1.3]].map(([x, y]) => new THREE.Vector2(x, y)), 8), '#b9572f')) })()

function Gate({ ac, pts, p, scale }) {
  const [x, z] = pts[pts.length - 1], [px, pz] = pts[pts.length - 2]
  const y = groundHeight(x, z), heading = Math.atan2(x - px, z - pz)
  const orb = useMemo(() => new THREE.Color(ac.accent).multiplyScalar(2.6), [ac.accent])
  return (
    <group position={[x, y, z]} rotation={[0, heading, 0]}>
      <mesh geometry={gateGeo()} castShadow receiveShadow><meshStandardMaterial vertexColors flatShading roughness={0.95} /></mesh>
      <mesh position={[0, 8.0, 0.1]}><octahedronGeometry args={[0.7, 0]} /><meshBasicMaterial color={orb} toneMapped={false} /></mesh>
      {[[-5.2, 0.8], [5.4, -0.6]].map(([ax, az], i) => <mesh key={i} geometry={amphoraGeo()} position={[ax, 0, az]} castShadow><meshStandardMaterial vertexColors flatShading roughness={0.9} /></mesh>)}
      <LightPillar color={ac.accent} height={110} radius={0.9} position={[0, 9, 0]} />
      <Html position={[0, 11, 0]} center zIndexRange={[20, 0]} style={{ pointerEvents: 'none' }}>
        <div style={{ borderColor: ac.accent, boxShadow: `0 0 18px ${ac.accent}55` }}
          className="whitespace-nowrap rounded-full border bg-black/55 px-3 py-1 text-xs font-bold text-white backdrop-blur-sm">
          {ac.emoji} {ac.name}
        </div>
      </Html>
      {/* distancia/intensidad escaladas: un <group scale> no escala la caída de una luz */}
      <pointLight position={[0, 7.5, 1.5]} color={ac.accent} intensity={p.glow * 40 * scale * scale} distance={26 * scale} decay={2} />
    </group>
  )
}

// Columnas caídas y fustes rotos: el "sabor" de ruinas que invita a asomarse fuera del camino.
const RUINS = (() => {
  const out = [], R = rng(2024)
  while (out.length < 11) {
    const a = R() * 6.28, d = 30 + R() * 65, x = Math.cos(a) * d, z = Math.sin(a) * d
    if (pathDist(x, z) < 6 || groundHeight(x, z) < WATER_Y + 0.8) continue
    out.push({ x, y: groundHeight(x, z), z, h: 1.5 + R() * 3.6, tilt: (R() - 0.5) * 0.25, ry: R() * 6.28, drum: R() > 0.4 })
  }
  return out
})()
const ruinGeo = (() => { let g = null; return () => (g ??= mergeGeometries([cylG(0.62, 0.7, 1, 10, MARBLE_SH, 0, 0.5, 0)].map((q) => (q.index ? q.toNonIndexed() : q)))) })()
function Ruins() {
  return RUINS.map((r, i) => (
    <group key={i} position={[r.x, r.y - 0.1, r.z]} rotation={[0, r.ry, 0]}>
      <mesh geometry={ruinGeo()} scale={[1, r.h, 1]} rotation={[r.tilt, 0, r.tilt]} castShadow receiveShadow><meshStandardMaterial vertexColors flatShading roughness={0.95} /></mesh>
      {r.drum && <mesh geometry={ruinGeo()} scale={[1, 0.7, 1]} position={[1.6, 0.35, 0.5]} rotation={[0, 0, Math.PI / 2 - 0.1]} castShadow><meshStandardMaterial vertexColors flatShading roughness={0.95} /></mesh>}
    </group>
  ))
}

// ── Gemas y luciérnagas ──────────────────────────────────────────────────────

// ═════════════ Variante "torre faro" (la primera versión, la del demo original) ═════════════
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
function scatterTorre() {
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
function ForestTorre() {
  const b = useMemo(() => scatterTorre(), [])
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
function PlazaTorre() {
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
function FlagTorre({ color, position, angle }) {
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
function GateTorre({ ac, pts, p, scale }) {
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
      <pointLight position={[0, 9, 0]} color={ac.accent} intensity={p.glow * 40 * scale * scale} distance={26 * scale} decay={2} />
    </group>
  )
}

const _w = new THREE.Vector3()
function Gems({ onCollect, followRef, scale }) {
  const refs = useRef([]), got = useRef(new Set())
  useFrame((s) => {
    const who = followRef?.current
    GEMS.forEach((g, i) => {
      const m = refs.current[i]
      if (!m || got.current.has(i)) return
      m.rotation.y = s.clock.elapsedTime * 1.4 + i
      m.position.y = g.y + Math.sin(s.clock.elapsedTime * 2 + i) * 0.25
      if (who && m.getWorldPosition(_w).distanceTo(who) < 2.1 * scale) {
        got.current.add(i); m.visible = false; onCollect?.(got.current.size, GEMS.length)
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
uniform float uTime, uPx, uK; attribute float aPhase; varying float vA;
void main(){
  vec3 p = position;
  p.y += sin(uTime * 0.6 + aPhase * 6.2831) * 0.7; p.x += sin(uTime * 0.4 + aPhase * 17.0) * 0.9; p.z += cos(uTime * 0.5 + aPhase * 11.0) * 0.9;
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = clamp(2.2 * uPx * (uK / -mv.z), 1.0, 22.0 * uPx);
  vA = 0.5 + 0.5 * sin(uTime * (1.5 + aPhase * 2.0) + aPhase * 40.0);
}`
const FLY_FRAG = `
uniform vec3 uColor; uniform float uI; varying float vA;
void main(){ float d = length(gl_PointCoord - 0.5) * 2.0; float a = smoothstep(1.0, 0.0, d); gl_FragColor = vec4(uColor * uI, a * a * vA); }`
function Fireflies({ p, scale }) {
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
  const uniforms = useMemo(() => ({ uTime: windU, uPx: { value: 1 }, uK: { value: 60 }, uColor: { value: new THREE.Color('#ffe08a') }, uI: { value: 1 } }), [])
  const mat = useRef()
  useFrame(() => { const u = mat.current?.uniforms; if (u) { u.uPx.value = gl.getPixelRatio(); u.uK.value = 60 * scale; u.uI.value = p.flies * 1.4 } })
  return (
    <points geometry={geo} frustumCulled={false}>
      <shaderMaterial ref={mat} uniforms={uniforms} vertexShader={FLY_VERT} fragmentShader={FLY_FRAG} transparent depthWrite={false} blending={THREE.AdditiveBlending} fog={false} />
    </points>
  )
}

// El sol/luna sigue a quien camina para que la sombra se vea nítida cerca de él.
function Sun({ p, scale, followRef }) {
  const light = useRef()
  const target = useMemo(() => new THREE.Object3D(), [])
  const dir = useMemo(() => sunDirOf(p), [p])
  useFrame(() => {
    if (!light.current) return
    const f = followRef?.current
    target.position.set(f ? f.x : 0, 0, f ? f.z : 0); target.updateMatrixWorld()
    light.current.position.copy(target.position).addScaledVector(dir, 90 * scale)
  })
  const e = 55 * scale
  return (
    <>
      <primitive object={target} />
      <directionalLight ref={light} target={target} color={p.dirCol} intensity={p.dirI} castShadow
        shadow-mapSize={[2048, 2048]} shadow-camera-left={-e} shadow-camera-right={e} shadow-camera-top={e} shadow-camera-bottom={-e}
        shadow-camera-near={1 * scale} shadow-camera-far={220 * scale} shadow-bias={-0.0004} shadow-normalBias={0.06 * scale} />
    </>
  )
}

// ── Cáscara de colisión (invisible): solo la usa el Player de VRPage ─────────
// El Player resuelve el suelo y las paredes con raycasts contra un `scenery`; los
// meshes con userData.isFloor son suelo, el resto bloquea (y aleja la cámara).
// Material con colorWrite=false: se dibuja "nada" pero el raycast lo ve.
const GHOST = new THREE.MeshBasicMaterial({ colorWrite: false, depthWrite: false })
function CollisionShell({ shellRef, torre }) {
  const floor = useMemo(() => buildGroundProxy(), [])
  const gates = PATHS.map(({ pts }) => {
    const [x, z] = pts[pts.length - 1], [px, pz] = pts[pts.length - 2], h = Math.atan2(x - px, z - pz), y = groundHeight(x, z)
    return [-3.2, 3.2].map((o) => [x + o * Math.cos(h), y, z - o * Math.sin(h)])
  }).flat()
  return (
    <group ref={shellRef}>
      <mesh geometry={floor} material={GHOST} userData={{ isFloor: true }} />
      {torre ? (
        <mesh material={GHOST} position={[0, 15, 0]}><cylinderGeometry args={[4.6, 4.9, 30, 10]} /></mesh>
      ) : (
        <>
          <mesh material={GHOST} position={[0, PLAZA_Y + 0.75, 0]}><boxGeometry args={[27, 1.5, 17]} /></mesh>
          <mesh material={GHOST} position={[0, TOP + 3.7, -0.35]}><boxGeometry args={[14.6, 7.4, 7.4]} /></mesh>
          {COLUMNS.map(([x, z], i) => <mesh key={i} material={GHOST} position={[x, TOP + 4, z]}><cylinderGeometry args={[0.7, 0.7, 8, 8]} /></mesh>)}
        </>
      )}
      {gates.map(([x, y, z], i) => <mesh key={i} material={GHOST} position={[x, y + 3.5, z]}><boxGeometry args={[1.2, 7, 1.2]} /></mesh>)}
    </group>
  )
}

// ── Escena completa ──────────────────────────────────────────────────────────
// p: preset (PRESETS[...]); scale: factor del paisaje; followRef: ref a un Vector3 mundo
// (la cámara en la demo, playerPositionRef en el mundo real); onShell: recibe el objeto
// contra el que el Player lanza rayos (solo el mundo real lo pide).
export default function PlazaScenery({ p, scale = 1, followRef, onShell, onCollect, look = 'torre' }) {
  const torre = look !== 'griego' // 'torre' = la primera versión; 'griego' = la variante con templo dórico
  const shellRef = useCallback((o) => { if (o) { o.updateMatrixWorld(true); onShell?.(o) } }, [onShell])
  return (
    <>
      <Clock />
      <fog attach="fog" args={[p.fog, 45 * scale, 190 * scale]} />
      <SkyDome p={p} />
      {p.stars && <Stars radius={320} depth={60} count={2500} factor={6} fade />}
      <hemisphereLight args={[p.hemiSky, p.hemiGround, p.hemiI]} />
      <Sun p={p} scale={scale} followRef={followRef} />
      <group scale={scale}>
        <Ridges p={p} />
        <Terrain torre={torre} />
        {torre ? <PlazaTorre /> : <Plaza />}
        {torre ? <Tower p={p} /> : <Temple p={p} />}
        {torre ? <ForestTorre /> : <Forest />}
        {!torre && <Ruins />}
        {PATHS.map(({ ac, pts }, i) => {
          const [fx, fz] = pts[0], pos = [fx * 0.92, groundHeight(fx, fz), fz * 0.92]
          return torre ? <FlagTorre key={ac.id} color={ac.accent} angle={i} position={pos} /> : <Banner key={ac.id} color={ac.accent} phase={i} position={pos} />
        })}
        {PATHS.map(({ ac, pts }) => torre
          ? <GateTorre key={ac.id} ac={ac} pts={pts} p={p} scale={scale} />
          : <Gate key={ac.id} ac={ac} pts={pts} p={p} scale={scale} />)}
        <Gems onCollect={onCollect} followRef={followRef} scale={scale} />
        <Fireflies p={p} scale={scale} />
      </group>
      {onShell && <group scale={scale}><CollisionShell shellRef={shellRef} torre={torre} /></group>}
    </>
  )
}
