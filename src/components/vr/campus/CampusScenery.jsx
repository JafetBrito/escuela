import { Suspense, useCallback, useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useGLTF, Stars } from '@react-three/drei'
import * as THREE from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { SkyDome, Ridges, Sun, Clock, windU } from '../lookdev/PlazaScenery'
import { hash } from '../lookdev/plazaWorld'
import { CAMPUS_S, WATER_Y, itemY, buildTerrain, buildGroundProxy, pathGeo, paveGeo, setTerrainMode } from './campusWorld'
import { CATALOG, pieceFor, pieceKey } from './campusKit'
import { glbUrl } from './campusAssets'
import { buildSigns } from './signs'

// ─────────────────────────────────────────────────────────────────────────────
// Escenario de un MAPA por datos (campus, hospital...): dibuja un LAYOUT (lista de piezas colocadas) y,
// cuando el mundo real lo pide (`onShell`), arma la "cáscara" invisible contra la que el Player lanza rayos:
// terreno + pisos (isFloor) + paredes. Fuera del editor, las piezas se FUNDEN por zonas de 70 m (una malla
// por zona y material): un hospital de 300 cuartos son ~100 draw calls en vez de miles. El editor (`editor`)
// conserva una malla por pieza para poder seleccionarlas.
// ─────────────────────────────────────────────────────────────────────────────

const GROUP_SKIP = new Set(['id', 'x', 'y', 'z', 'rot', 's'])
const CHUNK = 70
const rad = (d) => ((d || 0) * Math.PI) / 180
const GHOST = new THREE.MeshBasicMaterial({ colorWrite: false, depthWrite: false })
const SOLID = new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 0.95 })
const GLASS = new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, transparent: true, opacity: 0.55, roughness: 0.15, metalness: 0.1, emissive: new THREE.Color('#ffcf8a'), emissiveIntensity: 0, depthWrite: false })
const GLOW = new THREE.MeshBasicMaterial({ vertexColors: true, toneMapped: false })
const DECAL = new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 1, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 })

// Funde las partes `parts` de todas las piezas por zona: devuelve una geometría por zona (con la posición/giro de cada pieza ya aplicados).
function bake(singles, parts) {
  const buckets = new Map(), m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), one = new THREE.Vector3(1, 1, 1), pos = new THREE.Vector3()
  for (const { it, piece } of singles) {
    if (!piece) continue
    m.compose(pos.set(it.x, itemY(it), it.z), q.setFromEuler(e.set(0, rad(it.rot), 0)), one)
    const key = `${Math.floor(it.x / CHUNK)},${Math.floor(it.z / CHUNK)}`
    for (const name of parts) {
      const g = piece[name]
      if (!g) continue
      if (!buckets.has(key)) buckets.set(key, [])
      buckets.get(key).push(g.clone().applyMatrix4(m))
    }
  }
  return [...buckets.values()].map((arr) => mergeGeometries(arr)).filter(Boolean)
}

// ── Piezas instanciadas (árboles, farolas, autos...) con viento y tinte por instancia ──
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

// ── Una pieza (editor: una malla por pieza para poder seleccionarla; juego: solo los .glb) ──
function Item({ it, piece, showRoofs, onPick, selected, glbOnly }) {
  const pick = onPick ? (e) => { e.stopPropagation(); onPick(it.id) } : undefined
  return (
    <group position={[it.x, itemY(it), it.z]} rotation={[0, rad(it.rot), 0]} onClick={pick}>
      {!glbOnly && piece && piece.solid && <mesh geometry={piece.solid} material={SOLID} castShadow receiveShadow />}
      {!glbOnly && piece && piece.floors && <mesh geometry={piece.floors} material={SOLID} castShadow receiveShadow />}
      {!glbOnly && piece && piece.roof && showRoofs && <mesh geometry={piece.roof} material={SOLID} castShadow receiveShadow />}
      {!glbOnly && piece && piece.glass && <mesh geometry={piece.glass} material={GLASS} />}
      {!glbOnly && piece && piece.emissive && <mesh geometry={piece.emissive} material={GLOW} />}
      {it.type === 'glb' && glbUrl(it.file) && <Suspense fallback={null}><GlbItem it={it} /></Suspense>}
      {selected && piece?.bounds && (
        <mesh position={[0, (it.level || 0) * 4.4 + piece.bounds.h / 2, 0]}>
          <boxGeometry args={[piece.bounds.w, piece.bounds.h, piece.bounds.d]} />
          <meshBasicMaterial color="#ffd24a" wireframe />
        </mesh>
      )}
    </group>
  )
}

// ── Luces interiores: un banco fijo de luces que se reparte entre las lámparas más cercanas ──
const POOL = 6
function InteriorLights({ lamps, followRef, power = 7 }) {
  const refs = useRef([]), tick = useRef(0), { camera } = useThree()
  useFrame(() => {
    tick.current++
    if (tick.current % 8) return
    const f = followRef?.current || camera.position
    const near = []
    for (const l of lamps) { const dx = l[0] - f.x, dz = l[2] - f.z, dy = l[1] - f.y; const d2 = dx * dx + dz * dz + dy * dy * 0.5; if (d2 < 220) near.push([d2, l]) }
    near.sort((a, b) => a[0] - b[0])
    for (let i = 0; i < POOL; i++) {
      const L = refs.current[i], n = near[i]
      if (!L) continue
      if (n) { L.position.set(n[1][0], n[1][1], n[1][2]); L.intensity = power } else L.intensity = 0
    }
  })
  return Array.from({ length: POOL }, (_, i) => <pointLight key={i} ref={(o) => { refs.current[i] = o }} color="#ffe6bf" intensity={0} distance={9} decay={1.6} />)
}

// `levelView` (solo editor): { mode: 'all' | 'upTo' | 'only', n } → qué niveles del hospital se dibujan.
const levelOk = (it, lv) => !lv || lv.mode === 'all' || it.level == null || (lv.mode === 'only' ? it.level === lv.n : it.level <= lv.n)

export default function CampusScenery({ data, p, followRef, onShell, editor = false, showRoofs = true, selectedId, onPick, levelView }) {
  setTerrainMode(data.terrain)
  const items = useMemo(() => data.items.filter((it) => levelOk(it, levelView)), [data.items, levelView])
  const shellRef = useCallback((o) => { if (o) { o.updateMatrixWorld(true); onShell?.(o) } }, [onShell])
  const river = data.terrain !== 'flat'

  // eslint-disable-next-line react-hooks/exhaustive-deps -- buildTerrain lee el modo de terreno global (setTerrainMode)
  const terrain = useMemo(() => buildTerrain(), [data.terrain])
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
        const piece = pieceFor(withSeed), k = pieceKey(withSeed, GROUP_SKIP)
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

  // letreros: todos a un atlas
  const signPages = useMemo(() => {
    const list = []
    for (const { it, piece } of singles) {
      if (!piece?.signs) continue
      const c = Math.cos(rad(it.rot)), s = Math.sin(rad(it.rot)), y0 = itemY(it)
      for (const g of piece.signs) list.push({ ...g, x: it.x + g.x * c + g.z * s, z: it.z - g.x * s + g.z * c, y: y0 + g.y, ry: (g.ry || 0) + rad(it.rot) })
    }
    return buildSigns(list)
  }, [singles])

  // fuera del editor: mallas fundidas por zona
  const baked = useMemo(() => {
    if (editor) return null
    return {
      solid: bake(singles, ['solid', 'floors', 'roof']), glass: bake(singles, ['glass']), glow: bake(singles, ['emissive']),
      glb: singles.filter((s) => s.it.type === 'glb'),
    }
  }, [singles, editor])

  // cáscara de colisión (solo mundo real)
  const shell = useMemo(() => {
    if (!onShell) return null
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
    const strip = (gs) => gs.map((g) => { g.deleteAttribute('color'); g.deleteAttribute('normal'); return g })
    return { proxy: buildGroundProxy(), props: props.length ? mergeGeometries(props) : null, walls: strip(bake(singles, ['collide'])), floors: strip(bake(singles, ['floors', 'ramps'])) }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- buildGroundProxy lee el modo de terreno global
  }, [groups, singles, onShell, data.terrain])

  return (
    <>
      <Clock />
      <fog attach="fog" args={editor ? [p.fog, 250, 900] : [p.fog, 30, 150]} />
      <SkyDome p={p} />
      {p.stars && <Stars radius={320} depth={60} count={2500} factor={6} fade />}
      <group position={[0, 0, 60]}><Ridges p={p} /></group>
      <hemisphereLight args={[p.hemiSky, p.hemiGround, p.hemiI]} />
      {data.ambient > 0 && <ambientLight intensity={data.ambient} color="#fff6ea" />}
      <Sun p={p} scale={0.55} followRef={followRef} />

      <group scale={CAMPUS_S}>
        <mesh geometry={terrain} receiveShadow><meshStandardMaterial vertexColors flatShading roughness={1} /></mesh>
        {river && (
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, WATER_Y, 300]}>
            <planeGeometry args={[1400, 1800]} />
            <meshStandardMaterial color="#2a9bbd" roughness={0.25} metalness={0.1} transparent opacity={0.88} />
          </mesh>
        )}
        {decals && <mesh geometry={decals} material={DECAL} receiveShadow />}
        {groups.map((g, i) => <Inst key={i} piece={g.piece} items={g.items} wind={g.wind} onPick={onPick} />)}
        {baked ? (
          <>
            {baked.solid.map((g, i) => <mesh key={`s${i}`} geometry={g} material={SOLID} castShadow receiveShadow />)}
            {baked.glass.map((g, i) => <mesh key={`g${i}`} geometry={g} material={GLASS} />)}
            {baked.glow.map((g, i) => <mesh key={`e${i}`} geometry={g} material={GLOW} />)}
            {baked.glb.map(({ it, piece }) => <Item key={it.id} it={it} piece={piece} glbOnly />)}
          </>
        ) : singles.map(({ it, piece }) => <Item key={it.id} it={it} piece={piece} showRoofs={showRoofs} onPick={onPick} selected={it.id === selectedId} />)}
        {signPages.map((pg, i) => <mesh key={`sg${i}`} geometry={pg.geo}><meshBasicMaterial map={pg.tex} toneMapped={false} /></mesh>)}
        {editor && items.filter((i) => i.type === 'npc').map((i) => (
          <group key={i.id} position={[i.x, itemY(i), i.z]} onClick={onPick ? (e) => { e.stopPropagation(); onPick(i.id) } : undefined}>
            <mesh position={[0, 1.2, 0]}><coneGeometry args={[0.7, 2.4, 6]} /><meshBasicMaterial color={i.id === selectedId ? '#ffd24a' : '#ff5ea8'} /></mesh>
          </group>
        ))}
      </group>
      <InteriorLights lamps={lamps} followRef={followRef} power={data.lamp ?? 7} />

      {shell && (
        <group scale={CAMPUS_S} ref={shellRef}>
          <mesh geometry={shell.proxy} material={GHOST} userData={{ isFloor: true }} />
          {shell.props && <mesh geometry={shell.props} material={GHOST} />}
          {shell.walls.map((g, i) => <mesh key={`w${i}`} geometry={g} material={GHOST} />)}
          {shell.floors.map((g, i) => <mesh key={`f${i}`} geometry={g} material={GHOST} userData={{ isFloor: true }} />)}
        </group>
      )}
    </>
  )
}
