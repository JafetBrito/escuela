import { Suspense, useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import { Html, OrbitControls, useGLTF } from '@react-three/drei'
import { useNavigate } from 'react-router-dom'
import { ACADEMIES } from '../../data/academies'
import { useI18n } from '../../i18n'

// Mapa-mundo: una isla flotante que reemplaza el menú plano de "Portal de
// Transporte" (TRANSPORT_WORLDS en VRPage.jsx, que enlaza aquí como parada
// 'mapa') por un lugar real que ver y recorrer con el mouse. No usa
// Physics/el controlador de personaje de VRPage — es una "vista de mesa",
// no un mundo caminable, así que no hace falta esa maquinaria.
// Modelos: Kenney "Nature Kit" (CC0) en public/MODELOS 3D/MAPA MUNDO/ —
// ver LICENSE-kenney-nature-kit.txt en esa carpeta.
const M = (name) => `/MODELOS 3D/MAPA MUNDO/${name}.glb`

// Paradas: la plaza + cada academia con mundo VR propio (ACADEMIES). Una
// academia nueva con entrada en academies.js aparece aquí sola, sin tocar
// este archivo — mismo principio que AcademiasPage.jsx con HAS_OWN_PAGE.
const CORE_STOPS = [
  { id: 'campus', emoji: '🏫', path: '/vr', accent: '#5ef0c0' },
  { id: 'anfiteatro', emoji: '🎭', path: '/vr/anfiteatro', accent: '#7dd3fc' },
  { id: 'room', emoji: '🏠', path: '/vr/room', accent: '#fbbf24' },
]
const STOPS = [
  ...CORE_STOPS,
  ...Object.values(ACADEMIES).map((a) => ({ id: a.id, emoji: a.emoji, path: `/vr/academia/${a.id}`, accent: a.accent, academyName: a.name })),
]

const ISLAND_RADIUS = 9
const RING_RADIUS = 6.5

function Prop({ name, position, rotation = [0, 0, 0], scale = 1 }) {
  const { scene } = useGLTF(M(name))
  const clone = useMemo(() => scene.clone(), [scene])
  return <primitive object={clone} position={position} rotation={rotation} scale={scale} />
}

// Decoración fija (no aleatoria: posiciones elegidas a mano para no tapar
// las paradas ni amontonarse) — árboles, rocas y arbustos del Nature Kit.
const DECOR = [
  ['tree_pineTallA', [3.2, 0, 3.8], 1.1], ['tree_pineRoundC', [-4.5, 0, 2.2], 1],
  ['tree_oak', [5.5, 0, -1.5], 1], ['tree_oak_fall', [-3, 0, -5.2], 1],
  ['tree_palmTall', [1.5, 0, -6.5], 1], ['tree_palmShort', [-6, 0, -1], 1],
  ['tree_detailed', [-1.5, 0, 5.8], 1], ['tree_pineRoundE', [6.2, 0, 2.5], 0.9],
  ['rock_largeA', [4, 0, 0.5], 1], ['rock_largeC', [-4.8, 0, -3], 1],
  ['rock_smallA', [0.5, 0, 3], 1], ['rock_smallC', [-2, 0, -1.8], 1],
  ['stump_round', [2.5, 0, 6.5], 1], ['plant_bush', [-3.5, 0, 4.5], 1],
  ['plant_bushLarge', [3.8, 0, -3.8], 1], ['grass_large', [-1, 0, -3.5], 1],
  ['grass', [1, 0, 1.5], 1], ['grass', [-2, 0, 2.5], 1],
].map(([name, position, scale]) => ({ name, position, scale }))

function Island() {
  return (
    <group>
      {/* Base rocosa + cima de pasto — dos conos apilados, sin modelo: más
          simple y controlable que buscar/ajustar un asset de isla completo. */}
      <mesh position={[0, -1.4, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[ISLAND_RADIUS * 0.55, ISLAND_RADIUS * 0.15, 3.2, 24]} />
        <meshStandardMaterial color="#6b5642" roughness={1} />
      </mesh>
      <mesh position={[0, 0, 0]} receiveShadow>
        <cylinderGeometry args={[ISLAND_RADIUS, ISLAND_RADIUS * 0.55, 1, 32]} />
        <meshStandardMaterial color="#3f7d3a" roughness={0.9} />
      </mesh>
      {DECOR.map((d, i) => <Prop key={i} name={d.name} position={d.position} scale={d.scale} />)}
    </group>
  )
}

function StopMarker({ stop, angle, t }) {
  const navigate = useNavigate()
  const x = Math.sin(angle) * RING_RADIUS
  const z = Math.cos(angle) * RING_RADIUS
  const facing = angle + Math.PI
  const label = stop.academyName ?? t(`vr.transportMenu.worlds.${stop.id}.name`)

  return (
    <group position={[x, 0.5, z]} rotation={[0, facing, 0]}>
      <Prop name="sign" position={[0, -0.5, 0]} rotation={[0, Math.PI, 0]} />
      <mesh position={[0, 1.3, 0]}>
        <sphereGeometry args={[0.22, 16, 16]} />
        <meshStandardMaterial color={stop.accent} emissive={stop.accent} emissiveIntensity={1.4} />
      </mesh>
      <Html center distanceFactor={9} position={[0, 2.05, 0]} occlude>
        <button
          type="button"
          onClick={() => navigate(stop.path)}
          className="flex flex-col items-center gap-0.5 rounded-xl border px-3 py-2 text-center shadow-lg backdrop-blur-sm transition hover:scale-105"
          style={{ borderColor: stop.accent, background: 'rgba(10,14,20,0.85)' }}
        >
          <span className="text-2xl leading-none">{stop.emoji}</span>
          <span className="whitespace-nowrap text-xs font-black text-white">{label}</span>
        </button>
      </Html>
    </group>
  )
}

export default function WorldMapPage() {
  const navigate = useNavigate()
  const { t } = useI18n()

  return (
    <div className="relative h-screen w-full bg-[#05070d]">
      <div className="absolute left-0 top-0 z-10 flex w-full items-center justify-between px-4 py-3">
        <button
          type="button"
          onClick={() => navigate('/vr')}
          className="rounded-full border border-white/20 bg-black/50 px-4 py-2 text-sm font-bold text-white backdrop-blur-sm transition hover:bg-black/70"
        >
          ← {t('vr.atlasMap.back')}
        </button>
        <p className="rounded-full border border-white/20 bg-black/50 px-4 py-2 text-sm font-black text-white backdrop-blur-sm">
          {t('vr.atlasMap.title')}
        </p>
      </div>

      <Canvas shadows camera={{ position: [0, 11, 15], fov: 45 }}>
        <color attach="background" args={['#05070d']} />
        <fog attach="fog" args={['#05070d', 20, 45]} />
        <ambientLight intensity={0.7} />
        <directionalLight position={[8, 14, 6]} intensity={1.4} castShadow />
        <Suspense fallback={null}>
          <Island />
          {STOPS.map((s, i) => (
            <StopMarker key={s.id} stop={s} angle={(i / STOPS.length) * Math.PI * 2} t={t} />
          ))}
        </Suspense>
        <OrbitControls
          target={[0, 0.5, 0]}
          minDistance={9}
          maxDistance={22}
          maxPolarAngle={Math.PI / 2.15}
          autoRotate
          autoRotateSpeed={0.4}
          enablePan={false}
        />
      </Canvas>

      <p className="absolute bottom-3 left-1/2 -translate-x-1/2 text-center text-[11px] text-white/50">
        {t('vr.atlasMap.hint')}
      </p>
    </div>
  )
}
