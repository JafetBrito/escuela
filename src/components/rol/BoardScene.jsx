import { useRef, useMemo, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, useGLTF } from '@react-three/drei'
import { TILES, TILE_POSITIONS } from '../../data/boardTiles'
import { getMascotById } from '../../data/mascotRegistry'

// ── Single board tile ─────────────────────────────────────────────────────────
function Tile({ tile, position, hasPlayer }) {
  const meshRef = useRef()
  useFrame(({ clock }) => {
    if (!hasPlayer || !meshRef.current) return
    meshRef.current.position.y = Math.sin(clock.elapsedTime * 3) * 0.04 + 0.18
  })

  return (
    <group position={position}>
      <mesh position={[0, 0.06, 0]}>
        <boxGeometry args={[1.15, 0.12, 1.15]} />
        <meshStandardMaterial color="#0d1f0d" />
      </mesh>
      <mesh ref={meshRef} position={[0, 0.18, 0]}>
        <boxGeometry args={[1.0, 0.18, 1.0]} />
        <meshStandardMaterial
          color={tile.color}
          emissive={tile.emissive}
          emissiveIntensity={hasPlayer ? 0.55 : 0.15}
          roughness={0.4}
          metalness={0.2}
        />
      </mesh>
      {hasPlayer && (
        <mesh position={[0, 0.28, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.38, 0.46, 16]} />
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.9} transparent opacity={0.6} />
        </mesh>
      )}
    </group>
  )
}

// ── Chess-piece fallback token ────────────────────────────────────────────────
function FallbackToken({ color, isCurrent }) {
  return (
    <group>
      <mesh>
        <cylinderGeometry args={[0.14, 0.17, 0.08, 10]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.35} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.12, 0]}>
        <cylinderGeometry args={[0.06, 0.1, 0.14, 10]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.25} />
      </mesh>
      <mesh position={[0, 0.24, 0]}>
        <sphereGeometry args={[0.12, 10, 10]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} roughness={0.25} metalness={0.3} />
      </mesh>
      {isCurrent && (
        <mesh position={[0, 0.4, 0]}>
          <sphereGeometry args={[0.045, 6, 6]} />
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={2} />
        </mesh>
      )}
    </group>
  )
}

// ── GLB mascot model ──────────────────────────────────────────────────────────
function MascotModel({ modelPath, rotationY = 0, offsetY = 0 }) {
  const { scene } = useGLTF(modelPath)
  const clone = useMemo(() => scene.clone(), [scene])
  return (
    <primitive
      object={clone}
      scale={0.28}
      position={[0, 0.08 + offsetY * 0.28, 0]}
      rotation={[0, rotationY, 0]}
    />
  )
}

// ── Player token (mascot or fallback) ────────────────────────────────────────
const TOKEN_OFFSETS = [
  [-0.22, -0.22], [0.22, -0.22], [-0.22, 0.22], [0.22, 0.22],
]

function PlayerToken({ player, playerIdx, isCurrent }) {
  const groupRef = useRef()
  const pos      = TILE_POSITIONS[player.tile]
  const [ox, oz] = TOKEN_OFFSETS[playerIdx % 4]
  const mascot   = getMascotById(player.mascotId ?? 8)

  useFrame(({ clock }) => {
    if (!groupRef.current) return
    groupRef.current.position.y = isCurrent
      ? Math.sin(clock.elapsedTime * 4) * 0.06 + 0.38
      : 0.38
  })

  return (
    <group ref={groupRef} position={[pos[0] + ox, 0.38, pos[2] + oz]}>
      {/* Colored base disk */}
      <mesh>
        <cylinderGeometry args={[0.17, 0.2, 0.06, 12]} />
        <meshStandardMaterial color={player.color} emissive={player.color} emissiveIntensity={0.5} roughness={0.3} />
      </mesh>

      {mascot.modelPath ? (
        <Suspense fallback={<FallbackToken color={player.color} isCurrent={isCurrent} />}>
          <MascotModel
            modelPath={mascot.modelPath}
            rotationY={mascot.modelRotationY ?? 0}
            offsetY={mascot.modelOffsetY ?? 0}
          />
        </Suspense>
      ) : (
        <FallbackToken color={player.color} isCurrent={isCurrent} />
      )}

      {/* Active player crown */}
      {isCurrent && (
        <mesh position={[0, 0.55, 0]}>
          <sphereGeometry args={[0.045, 6, 6]} />
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={2.5} />
        </mesh>
      )}
    </group>
  )
}

// ── Center deco ───────────────────────────────────────────────────────────────
function CenterDeco({ accentColor }) {
  const ringRef = useRef()
  const accent  = accentColor ?? '#22c55e'
  useFrame(({ clock }) => {
    if (ringRef.current) ringRef.current.rotation.z = clock.elapsedTime * 0.4
  })
  return (
    <group position={[0, 0.05, 0]}>
      <mesh>
        <cylinderGeometry args={[1.8, 1.8, 0.05, 32]} />
        <meshStandardMaterial color="#0a1e0a" />
      </mesh>
      <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.55, 1.75, 32]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.4} transparent opacity={0.7} />
      </mesh>
      <mesh position={[0, 0.02, 0]}>
        <cylinderGeometry args={[0.5, 0.5, 0.03, 16]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.5} />
      </mesh>
    </group>
  )
}

// ── Full scene ────────────────────────────────────────────────────────────────
function Scene({ players, currentTurn, storyAccent }) {
  return (
    <>
      <color attach="background" args={['#050d05']} />
      <fog attach="fog" args={['#050d05', 14, 28]} />

      <ambientLight intensity={0.35} />
      <directionalLight position={[6, 12, 6]} intensity={1.1} castShadow />
      <pointLight position={[0, 4, 0]} intensity={0.6} color={storyAccent ?? '#22c55e'} />
      <pointLight position={[-5, 2, -3]} intensity={0.25} color="#3b82f6" />
      <pointLight position={[5, 2, 3]} intensity={0.25} color="#f97316" />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[18, 14]} />
        <meshStandardMaterial color="#040c04" />
      </mesh>
      <gridHelper args={[18, 18, '#0d1f0d', '#0d1f0d']} position={[0, 0.005, 0]} />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]} scale={[1, 0.7, 1]}>
        <circleGeometry args={[5.6, 40]} />
        <meshStandardMaterial color="#091509" />
      </mesh>

      {TILES.map((tile, i) => (
        <Tile
          key={i}
          tile={tile}
          position={TILE_POSITIONS[i]}
          hasPlayer={players.some((p) => p.tile === i)}
        />
      ))}

      <CenterDeco accentColor={storyAccent} />

      {players.map((player, i) => (
        <PlayerToken
          key={player.id}
          player={player}
          playerIdx={i}
          isCurrent={i === currentTurn}
        />
      ))}

      <OrbitControls
        enableRotate={false}
        enablePan={false}
        enableZoom
        minDistance={9}
        maxDistance={22}
      />
    </>
  )
}

export default function BoardScene({ players, currentTurn, storyAccent }) {
  return (
    <Canvas
      shadows
      camera={{ position: [0, 11, 8.5], fov: 48 }}
      gl={{ antialias: true }}
    >
      <Scene players={players} currentTurn={currentTurn} storyAccent={storyAccent} />
    </Canvas>
  )
}
