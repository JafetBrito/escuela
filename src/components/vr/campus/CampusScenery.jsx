import { Suspense, useCallback, useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useGLTF, Stars } from '@react-three/drei'
import * as THREE from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { SkyDome, Ridges, Sun, Clock, windU } from '../lookdev/PlazaScenery'
import { hash } from '../lookdev/plazaWorld'
import { CAMPUS_S, WATER_Y, itemY, buildTerrain, buildGroundProxy, pathGeo, paveGeo } from './campusWorld'
import { CATALOG, pieceFor, pieceKey } from './campusKit'
import { glbUrl } from './campusAssets'

// ─────────────────────────────────────────────────────────────────────────────
// Escenario del Campus: dibuja un LAYOUT (lista de piezas colocadas, ver src/data/campusLayout.json) y,
// cuando el mundo real lo pide (`onShell`), arma la "cáscara" invisible contra la que el Player lanza rayos:
// terreno + pisos (isFloor) + paredes. El mismo componente sirve al editor (/vr/editor) con `editor`.
// ─────────────────────────────────────────────────────────────────────────────

const GROUP_SKIP = new Set(['id', 'x', 'y', 'z', 'rot', 's'])
const rad = (d) => ((d || 0) * Math.PI) / 180
const GHOST = new THREE.MeshBasicMaterial({ colorWrite: false, depthWrite: false })
const SOLID = new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 0.95 })
const GLASS = new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, transparent: true, opacity: 0.55, roughness: 0.15, metalness: 0.1, emissive: new THREE.Color('#ffcf8a'), emissiveIntensity: 0, depthWrite: false })
const GLOW = new THREE.MeshBasicMaterial({ vertexColors: true, toneMapped: false })
const DECAL = new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 1, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 })

// ── Letreros (canvas → textura, una por texto) ──────────────────────────────
const signTex = new Map()
function signTexture(text) {
  let t = signTex.get(text)
  if (t) return t
  const c = document.createElement('canvas')
  c.width = 512; c.height = 96
  const g = c.getContext('2d')
  g.fillStyle = '#1f3d33'; g.fillRect(0, 0, 512, 96)
  g.strokeStyle = '#e0b84c'; g.lineWidth = 6; g.strokeRect(5, 5, 502, 86)
  g.fillStyle = '#f6efd8'; g.font = 'bold 44px Georgia, serif'; g.textAlign = 'center'; g.textBaseline = 'middle'
  g.fillText(text, 256, 50, 480)
  t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace
  signTex.set(text, t)
  return t
}
function Sign({ s }) {
  const map = useMemo(() => signTexture(s.text), [s.text])
  return <mesh position={[s.x, s.y + s.h / 2, s.z]}><planeGeometry args={[s.w, s.h]} /><meshBasicMaterial map={map} toneMapped={false} /></mesh>
}

// ── Piezas instanciadas (árboles, farolas...) con viento y tinte por instancia ──
function Inst({ piece, items, wind, onPick }) {
  const ref = useRef(), emRef = useRef()
  const material = useMemo(() => {
    const m = new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 1 })
    if (wind) m.onBeforeCompile = (sh) => {
      sh.uniforms.uTime = windU
      sh.vertexShader = 'uniform float uTime;\n' + sh.vertexShader.replace('#include <begin_vertex>',
        `#include <begin_vertex>
         float sway = sin(uTime * 1.3 + instanceMatrix[3].x * 0.35 + instanceMatrix[3].z * 0.27) * 0.04 * position.y;
         transformed.x += sway; transformed.z += sway * 0.6;`)
    }
    return m
  }, [wind])
  useEffect(() => {
    const d = new THREE.Object3D(), col = new THREE.Color()
    for (const m of [ref.current, emRef.current]) {
      if (!m) continue
      items.forEach((it, i) => {
        d.position.set(it.x, itemY(it) - 0.05, it.z); d.rotation.set(0, rad(it.rot), 0); d.scale.setScalar(it.s || 1); d.updateMatrix()
        m.setMatrixAt(i, d.matrix)
        if (m === ref.current && wind) { const v = 0.85 + hash(it.x, it.z) * 0.3; col.setRGB(v, v * (0.96 + hash(it.z, it.x) * 0.08), v); m.setColorAt(i, col) }
      })
      m.instanceMatrix.needsUpdate = true
      if (m.instanceColor) m.instanceColor.needsUpdate = true
    }
  }, [items, wind])
  const pick = onPick ? (e) => { e.stopPropagation(); onPick(items[e.instanceId]?.id) } : undefined
  return (
    <>
      {piece.solid && <instancedMesh key={items.length} ref={ref} args={[piece.solid, material, items.length]} castShadow receiveShadow frustumCulled={false} onClick={pick} />}
      {piece.emissive && <instancedMesh key={`e${items.length}`} ref={emRef} args={[piece.emissive, GLOW, items.length]} frustumCulled={false} />}
    </>
  )
}

function GlbItem({ it }) {
  const gltf = useGLTF(glbUrl(it.file))
  const scene = useMemo(() => gltf.scene.clone(true), [gltf])
  return <primitive object={scene} scale={it.s || 1} />
}

// ── Una pieza única (edificio, reja, puente...) ─────────────────────────────
function Item({ it, piece, showRoofs, onPick, selected }) {
  const pick = onPick ? (e) => { e.stopPropagation(); onPick(it.id) } : undefined
  return (
    <group position={[it.x, itemY(it), it.z]} rotation={[0, rad(it.rot), 0]} onClick={pick}>
      {piece && piece.solid && <mesh geometry={piece.solid} material={SOLID} castShadow receiveShadow />}
      {piece && piece.floors && <mesh geometry={piece.floors} material={SOLID} castShadow receiveShadow />}
      {piece && piece.roof && showRoofs && <mesh geometry={piece.roof} material={SOLID} castShadow receiveShadow />}
      {piece && piece.glass && <mesh geometry={piece.glass} material={GLASS} />}
      {piece && piece.emissive && <mesh geometry={piece.emissive} material={GLOW} />}
      {piece && piece.signs && piece.signs.map((s, i) => <Sign key={i} s={s} />)}
      {it.type === 'glb' && glbUrl(it.file) && <Suspense fallback={null}><GlbItem it={it} /></Suspense>}
      {selected && piece?.bounds && (
        <mesh position={[0, piece.bounds.h / 2, 0]}>
          <boxGeometry args={[piece.bounds.w, piece.bounds.h, piece.bounds.d]} />
          <meshBasicMaterial color="#ffd24a" wireframe />
        </mesh>
      )}
    </group>
  )
}

// ── Luces interiores: un banco fijo de 5 luces que se reparte entre las lámparas más cercanas ──
const POOL = 5
function InteriorLights({ lamps, followRef }) {
  const refs = useRef([]), tick = useRef(0), { camera } = useThree()
  useFrame(() => {
    tick.current++
    if (tick.current % 8) return
    const f = followRef?.current || camera.position
    const near = []
    for (const l of lamps) { const dx = l[0] - f.x, dz = l[2] - f.z, dy = l[1] - f.y; const d2 = dx * dx + dz * dz + dy * dy * 0.3; if (d2 < 260) near.push([d2, l]) }
    near.sort((a, b) => a[0] - b[0])
    for (let i = 0; i < POOL; i++) {
      const L = refs.current[i]
      if (!L) continue
      const n = near[i]
      if (n) { L.position.set(n[1][0], n[1][1], n[1][2]); L.intensity = 7 } else L.intensity = 0
    }
  })
  return Array.from({ length: POOL }, (_, i) => <pointLight key={i} ref={(o) => { refs.current[i] = o }} color="#ffd9a0" intensity={0} distance={9} decay={1.6} />)
}

// ── Escena ───────────────────────────────────────────────────────────────────
export default function CampusScenery({ data, p, followRef, onShell, editor = false, showRoofs = true, selectedId, onPick }) {
  const items = data.items
  const shellRef = useCallback((o) => { if (o) { o.updateMatrixWorld(true); onShell?.(o) } }, [onShell])

  const terrain = useMemo(() => buildTerrain(), [])
  const decals = useMemo(() => {
    const gs = []
    for (const it of items) {
      if (it.type === 'path' && it.pts?.length > 1) gs.push(pathGeo(it.pts, it.w || 4, it.mat))
      else if (it.type === 'pave') gs.push(paveGeo(it))
    }
    const ok = gs.filter(Boolean)
    return ok.length ? mergeGeometries(ok) : null
  }, [items])

  // piezas únicas y grupos de instanciadas
  const { singles, groups } = useMemo(() => {
    const singles = [], groups = new Map()
    for (const it of items) {
      const cat = CATALOG[it.type]
      if (!cat) continue
      if (cat.instanced) {
        const withSeed = it.type === 'tree' ? { ...it, seed: 1 + Math.floor(hash(it.x * 3.1, it.z * 1.7) * 3) } : it
        const piece = pieceFor(withSeed)
        const k = pieceKey(withSeed, GROUP_SKIP)
        if (!groups.has(k)) groups.set(k, { piece, items: [], wind: it.type === 'tree' })
        groups.get(k).items.push(it)
      } else if (it.type !== 'path' && it.type !== 'pave' && it.type !== 'npc') singles.push({ it, piece: pieceFor(it) })
    }
    return { singles, groups: [...groups.values()] }
  }, [items])

  const lamps = useMemo(() => {
    const out = []
    for (const { it, piece } of singles) {
      if (!piece?.lights?.length) continue
      const c = Math.cos(rad(it.rot)), s = Math.sin(rad(it.rot)), y0 = itemY(it)
      for (const [lx, ly, lz] of piece.lights) out.push([(it.x + lx * c + lz * s) * CAMPUS_S, (y0 + ly) * CAMPUS_S, (it.z - lx * s + lz * c) * CAMPUS_S])
    }
    return out
  }, [singles])

  // cáscara de colisión (solo mundo real)
  const shell = useMemo(() => {
    if (!onShell) return null
    const proxy = buildGroundProxy()
    const props = []
    for (const g of groups) {
      if (!g.piece.collide) continue
      for (const it of g.items) {
        const m = new THREE.Matrix4().compose(new THREE.Vector3(it.x, itemY(it), it.z), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, rad(it.rot), 0)), new THREE.Vector3().setScalar(it.s || 1))
        const cg = g.piece.collide.clone().applyMatrix4(m)
        cg.deleteAttribute('color'); cg.deleteAttribute('normal')
        props.push(cg)
      }
    }
    return { proxy, props: props.length ? mergeGeometries(props) : null }
  }, [groups, onShell])

  return (
    <>
      <Clock />
      <fog attach="fog" args={editor ? [p.fog, 250, 900] : [p.fog, 30, 150]} />
      <SkyDome p={p} />
      {p.stars && <Stars radius={320} depth={60} count={2500} factor={6} fade />}
      <group position={[0, 0, 60]}><Ridges p={p} /></group>
      <hemisphereLight args={[p.hemiSky, p.hemiGround, p.hemiI]} />
      <Sun p={p} scale={0.55} followRef={followRef} />

      <group scale={CAMPUS_S}>
        <mesh geometry={terrain} receiveShadow><meshStandardMaterial vertexColors flatShading roughness={1} /></mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, WATER_Y, 300]}>
          <planeGeometry args={[1400, 1800]} />
          <meshStandardMaterial color="#2a9bbd" roughness={0.25} metalness={0.1} transparent opacity={0.88} />
        </mesh>
        {decals && <mesh geometry={decals} material={DECAL} receiveShadow />}
        {groups.map((g, i) => <Inst key={i} piece={g.piece} items={g.items} wind={g.wind} onPick={onPick} />)}
        {singles.map(({ it, piece }) => <Item key={it.id} it={it} piece={piece} showRoofs={showRoofs} onPick={onPick} selected={it.id === selectedId} />)}
        {editor && items.filter((i) => i.type === 'npc').map((i) => (
          <group key={i.id} position={[i.x, itemY(i), i.z]} onClick={onPick ? (e) => { e.stopPropagation(); onPick(i.id) } : undefined}>
            <mesh position={[0, 1.2, 0]}><coneGeometry args={[0.7, 2.4, 6]} /><meshBasicMaterial color={i.id === selectedId ? '#ffd24a' : '#ff5ea8'} /></mesh>
          </group>
        ))}
      </group>
      <InteriorLights lamps={lamps} followRef={followRef} />

      {shell && (
        <group scale={CAMPUS_S} ref={shellRef}>
          <mesh geometry={shell.proxy} material={GHOST} userData={{ isFloor: true }} />
          {shell.props && <mesh geometry={shell.props} material={GHOST} />}
          {singles.map(({ it, piece }) => piece && (
            <group key={it.id} position={[it.x, itemY(it), it.z]} rotation={[0, rad(it.rot), 0]}>
              {piece.collide && <mesh geometry={piece.collide} material={GHOST} />}
              {piece.floors && <mesh geometry={piece.floors} material={GHOST} userData={{ isFloor: true }} />}
              {piece.ramps && <mesh geometry={piece.ramps} material={GHOST} userData={{ isFloor: true }} />}
            </group>
          ))}
        </group>
      )}
    </>
  )
}
