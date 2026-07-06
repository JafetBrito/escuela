import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { TILES, TILE_POSITIONS } from '../../data/boardTiles'

// ── Single board tile ─────────────────────────────────────────────────────────
function Tile({ tile, position, hasPlayer }) {
  const meshRef = useRef()
  useFrame(({ clock }) => {
    if (!hasPlayer || !meshRef.current) return
    meshRef.current.position.y = Math.sin(clock.elapsedTime * 3) * 0.04 + 0.18
  })

  return (
    <group position={position}>
      {/* Base pad */}
      <mesh position={[0, 0.06, 0]}>
        <boxGeometry args={[1.15, 0.12, 1.15]} />
        <meshStandardMaterial color="#0d1f0d" />
      </mesh>
      {/* Tile block */}
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
      {/* Top glow ring when occupied */}
      {hasPlayer && (
        <mesh position={[0, 0.28, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.38, 0.46, 16]} />
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.9} transparent opacity={0.6} />
        </mesh>
      )}
    </group>
  )
}

// ── Player token (chess-piece style) ─────────────────────────────────────────
const TOKEN_OFFSETS = [
  [-0.22, -0.22], [0.22, -0.22], [-0.22, 0.22], [0.22, 0.22],
]

function PlayerToken({ color, tileIdx, playerIdx, isCurrent }) {
  const groupRef = useRef()
  const pos = TILE_POSITIONS[tileIdx]
  const [ox, oz] = TOKEN_OFFSETS[playerIdx % 4]

  useFrame(({ clock }) => {
    if (!groupRef.current) return
    groupRef.current.position.y = isCurrent
      ? Math.sin(clock.elapsedTime * 4) * 0.06 + 0.38
      : 0.38
  })

  return (
    <group ref={groupRef} position={[pos[0] + ox, 0.38, pos[2] + oz]}>
      {/* Base disk */}
      <mesh>
        <cylinderGeometry args={[0.14, 0.17, 0.08, 10]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.35} roughness={0.3} />
      </mesh>
      {/* Neck */}
      <mesh position={[0, 0.12, 0]}>
        <cylinderGeometry args={[0.06, 0.1, 0.14, 10]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.25} />
      </mesh>
      {/* Head */}
      <mesh position={[0, 0.24, 0]}>
        <sphereGeometry args={[0.12, 10, 10]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} roughness={0.25} metalness={0.3} />
      </mesh>
      {/* Crown star for active player */}
      {isCurrent && (
        <mesh position={[0, 0.4, 0]}>
          <sphereGeometry args={[0.045, 6, 6]} />
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={2} />
        </mesh>
      )}
    </group>
  )
}

// ── Center deco ───────────────────────────────────────────────────────────────
function CenterDeco() {
  const ringRef = useRef()
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
        <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={0.4} transparent opacity={0.7} />
      </mesh>
      {/* Inner glow */}
      <mesh position={[0, 0.02, 0]}>
        <cylinderGeometry args={[0.5, 0.5, 0.03, 16]} />
        <meshStandardMaterial color="#98ca3f" emissive="#98ca3f" emissiveIntensity={0.5} />
      </mesh>
    </group>
  )
}

// ── Full scene ────────────────────────────────────────────────────────────────
function Scene({ players, currentTurn }) {
  return (
    <>
      <color attach="background" args={['#050d05']} />
      <fog attach="fog" args={['#050d05', 14, 28]} />

      <ambientLight intensity={0.35} />
      <directionalLight position={[6, 12, 6]} intensity={1.1} castShadow />
      <pointLight position={[0, 4, 0]} intensity={0.6} color="#22c55e" />
      <pointLight position={[-5, 2, -3]} intensity={0.25} color="#3b82f6" />
      <pointLight position={[5, 2, 3]} intensity={0.25} color="#f97316" />

      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[18, 14]} />
        <meshStandardMaterial color="#040c04" />
      </mesh>
      <gridHelper args={[18, 18, '#0d1f0d', '#0d1f0d']} position={[0, 0.005, 0]} />

      {/* Board base (circle covers the oval tile layout) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]} scale={[1, 0.7, 1]}>
        <circleGeometry args={[5.6, 40]} />
        <meshStandardMaterial color="#091509" />
      </mesh>

      {/* Tiles */}
      {TILES.map((tile, i) => (
        <Tile
          key={i}
          tile={tile}
          position={TILE_POSITIONS[i]}
          hasPlayer={players.some((p) => p.tile === i)}
        />
      ))}

      {/* Center decoration */}
      <CenterDeco />

      {/* Player tokens */}
      {players.map((player, i) => (
        <PlayerToken
          key={player.id}
          color={player.color}
          tileIdx={player.tile}
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

export default function BoardScene({ players, currentTurn }) {
  return (
    <Canvas
      shadows
      camera={{ position: [0, 11, 8.5], fov: 48 }}
      gl={{ antialias: true }}
    >
      <Scene players={players} currentTurn={currentTurn} />
    </Canvas>
  )
}
