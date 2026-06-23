import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Html, useGLTF } from '@react-three/drei'
import { Physics, RigidBody, CapsuleCollider, CuboidCollider, useRapier } from '@react-three/rapier'
import * as THREE from 'three'
import { useNavigate } from 'react-router-dom'
import AppTopBar from '../shared/AppTopBar'
import PageVideoModal from '../shared/PageVideoModal'
import MascotMesh from '../mascot/MascotMesh'
import MascotCompanion from '../mascot/MascotCompanion'
import { useMascotStore } from '../../stores/useMascotStore'
import { getMascotById } from '../../data/mascotRegistry'
import { getSkinById } from '../../data/skinsRegistry'
import { getVrNpcById, OLIVER_NPC, EINSTEIN_NPC, JAFET_NPC } from '../../data/vrNpcRegistry'
import { getGlobalMissionById } from '../../data/globalMissionsRegistry'
import { useGlobalMissionsStore } from '../../stores/useGlobalMissionsStore'
import { useMissionState } from '../../stores/useMissionState'
import { useMascotCompanionStore } from '../../stores/useMascotCompanionStore'
import { useWorldChatStore } from '../../stores/useWorldChatStore'
import { useSettingsStore, getModelProvider } from '../../stores/useSettingsStore'
import { sendNpcMessage } from '../../services/chat/npcTransport'
import { useVrPresenceStore } from '../../stores/useVrPresenceStore'
import { useFriendsStore } from '../../stores/useFriendsStore'
import { useVrSettingsStore } from '../../stores/useVrSettingsStore'
import { useVrCharacterStore } from '../../stores/useVrCharacterStore'
import { useAuthStore } from '../../stores/useAuthStore'
import { useLevelStore, levelForXp } from '../../stores/useLevelStore'
import { useTerminalRewardsStore } from '../../stores/useTerminalRewardsStore'
import { useVoiceStore } from '../../stores/useVoiceStore'
import GmConsole from '../shared/GmConsole'
import { useVrMultiplayer, isVrRealtimeAvailable } from './useVrMultiplayer'
import { formatCurrency } from '../../utils/currency'
import { useGameStore, PLAYER_CLASSES, OLIVER_CLASSES, PLAYER_AVATARS } from '../../stores/useGameStore'
import { SKILL_REGISTRY } from '../../data/skillRegistry'
import { useItemEffectsStore } from '../../stores/useItemEffectsStore'
import { useShopStore } from '../../stores/useShopStore'
import VrLoadingScreen from './VrLoadingScreen'
import VrMascotOnboarding from './VrMascotOnboarding'
import BattleScreen from '../battle/BattleScreen'
import { useCombatStore } from '../../stores/useCombatStore'
import VrHud from './VrHud'
import DailyRewardsBoard from './DailyRewardsBoard'
import BagsPanel from './BagsPanel'
import CharacterPanel from './CharacterPanel'
import PatchNotesModal from '../shared/PatchNotesModal'
import { useDailyRewardsStore } from '../../stores/useDailyRewardsStore'
import { useCampusGround, GROUND_RADIUS, NPC_BUILDING_OFFSET, CAMPUS_DORMS, NPC_PAVILION_EXEMPT } from './worlds/useCampusGround'
import { useRoomGround, ROOM_SIZE, ROOM_HEIGHT } from './worlds/useRoomGround'
import { useAnfiteatroGround, ANFI_H, ANFI_HW, ANFI_HD, ANFI_STAGE_Z, ANFI_STAGE_NPC_POS, ANFI_SPAWN, ANFI_EXIT_PORTAL } from './worlds/useAnfiteatroGround'
import { useWorldTreeGround, WT_CLASS_NODES } from './worlds/useWorldTreeGround'
import SceneEffects from '../shared/SceneEffects'
import DayNightCycle from './DayNightCycle'
import {
  PLAYER_SCALE,
  PLAYER_HEIGHT,
  MODEL_HALF_HEIGHT,
  TURN_SPEED,
  CHAT_BUBBLE_DURATION,
  MAX_STACKED_BUBBLES,
  isTypingTarget,
  useMovementKeys,
  useIsTouchDevice,
  VirtualJoystick,
  MobileButtons,
  useCameraControls,
  CameraSettingsMenu,
  FlashlightSpot,
  PlayerAvatarBody,
  Player,
  colorFromId,
  useChatBubbles,
  BubbleStack,
} from './engine'

// While we're designing/testing the world's NPCs and missions, swap the real
// city model for a simple flat test ground with a few placeholder walls.
// Flip this back to `false` to return to /fondo_azteca.glb.
const USE_TEST_SCENERY = true

// Experiment: use the real imported /campus.glb model as the Campus's
// ground instead of the procedural TestWorld — overrides USE_TEST_SCENERY
// above when true. NPCs/video screen/portals are untouched either way,
// since they're rendered as siblings of whichever ground component runs.
const USE_CAMPUS_GLB = true

const SIMPLE_MODE = false

// Scale for NPC models — increased so they stand out clearly in the campus.
const NPC_SCALE = 0.26
const WANDER_CAT_SCALE = 0.1
const WANDER_CAT_SPEED = 1.1

// NPCs further than this from the player are drawn as a cheap colored
// marker instead of their full GLTF model (and skip the floating name tag).
// With 13 NPCs around the campus, loading every GLTF + Html overlay at once
// is what overwhelms weaker/integrated GPUs (WebGL "Context Lost" -> the VR
// world goes black). Only the handful of NPCs near the player ever need to
// look like their real mascot.
const NPC_DETAIL_RADIUS = 11

// Warm "ruinas al atardecer" palette applied to any untextured surface of the
// scenery, so a flat-grey export still reads as a colorful scene.
const SCENERY_PALETTE = ['#c2703d', '#e8c477', '#9b5a3a', '#7d8597', '#3f9e7a', '#caa46c']

// NPC landmark building geometry constants.
const BUILDING_SIZE = 3.2

// Major academic buildings — used by WorldMap minimap markers.
const CAMPUS_ACADEMIC = [
  { pos: [0, 0, -62],   color: '#d4c4a0', w: 30, d: 18, h: 13, label: '🎭', name: 'Gran Aula' },
  { pos: [-30, 0, -58], color: '#7a5a3a', w: 18, d: 14, h: 11, label: '📚', name: 'Biblioteca' },
  { pos: [30, 0, -58],  color: '#3a5a7a', w: 16, d: 13, h: 10, label: '🔬', name: 'Ciencia + IA' },
  { pos: [56, 0, -8],   color: '#3a5a7a', w: 14, d: 12, h: 9,  label: '💡', name: 'Innovación' },
  { pos: [-64, 0, 0],   color: '#8b6234', w: 20, d: 18, h: 3,  label: '🏪', name: 'Mercado' },
]

// How close the player needs to be to an NPC to interact with them.
const INTERACT_RADIUS = 2.5

// How close the player needs to be to a world portal to interact.
const PORTAL_INTERACT_RADIUS = 2.5

// How long the basic class "golpe" VFX ring stays visible after it fires.
const ATTACK_BURST_MS = 450

const ROOM_EXIT_PORTAL_POSITION = [0, 0, -ROOM_SIZE / 2 + 2]

// ─── Árbol del Mundo spawn / portal ──────────────────────────────────────────
const WT_SPAWN = [0, 0, 18]
const WT_EXIT_PORTAL = [0, 0, 25]

// Patrol loops for the background "wandering cats" that bring the campus
// plaza to life. Each path is a list of [x, y, z] waypoints the cat walks
// between in order, looping back to the start. Kept near the central plaza,
// away from the NPC zones around the edges.
const WANDER_CAT_PATHS = [
  [
    [4, 0, 4],
    [4, 0, -4],
    [-4, 0, -4],
    [-4, 0, 4],
  ],
  [
    [6, 0, 0],
    [0, 0, 6],
    [-6, 0, 0],
    [0, 0, -6],
  ],
]

// World shortcuts that are NOT character movement: M toggles the map, P
// opens the character menu, B opens the inventory, and C toggles the
// world chat input. All ignored while the player is typing in the chat box.
function useWorldShortcuts({ onToggleMap, onOpenCharacter, onOpenInventory, onToggleChat, onAttack, onUseWeapon }) {
  useEffect(() => {
    const handleDown = (e) => {
      if (isTypingTarget(e.target)) {
        if (e.key === 'Escape') onToggleChat(false)
        return
      }
      switch (e.key.toLowerCase()) {
        case 'm':
          e.preventDefault()
          onToggleMap()
          break
        case 'p':
          e.preventDefault()
          onOpenCharacter()
          break
        case 'b':
          e.preventDefault()
          onOpenInventory()
          break
        case 'c':
          // Without this, the same keystroke that opens the chat input also
          // lands inside it once it's focused, prefilling the box with "c".
          e.preventDefault()
          onToggleChat(true)
          break
        case 'g':
          // Every class's basic "golpe" — purely a visible VFX for now (see
          // LocalAttackBurst/RemotePlayerMesh), no damage/target involved.
          // (Not "f": that key is already the flashlight toggle below.)
          e.preventDefault()
          onAttack?.()
          break
        case 'v':
          // "Usar arma" — your equipped weapon's action (see useEquipmentStore
          // + CharacterTree's "🎒 Equipo" section).
          e.preventDefault()
          onUseWeapon?.()
          break
        default:
          break
      }
    }
    window.addEventListener('keydown', handleDown)
    return () => window.removeEventListener('keydown', handleDown)
  }, [onToggleMap, onOpenCharacter, onOpenInventory, onToggleChat, onAttack, onUseWeapon])
}

// Loads the VR background model, scales it to a roomy walkable footprint, and
// tints any untextured surfaces so it doesn't look flat/grey. The cloned
// model is also handed to <Player> so it can raycast against the real
// geometry for ground height and collisions.
function useSceneryModel() {
  const { scene } = useGLTF('/fondo_azteca.glb')

  return useMemo(() => {
    const clone = scene.clone(true)
    const box = new THREE.Box3().setFromObject(clone)
    const size = new THREE.Vector3()
    const center = new THREE.Vector3()
    box.getSize(size)
    box.getCenter(center)

    const maxDimension = Math.max(size.x, size.z) || 1
    const scale = 24 / maxDimension
    clone.scale.setScalar(scale)
    clone.position.set(-center.x * scale, -box.min.y * scale, -center.z * scale)

    let paletteIndex = 0
    clone.traverse((child) => {
      if (!child.isMesh) return

      const material = child.material
      if (material && !material.map) {
        const tinted = material.clone()
        tinted.color = new THREE.Color(SCENERY_PALETTE[paletteIndex % SCENERY_PALETTE.length])
        child.material = tinted
        paletteIndex += 1
      }
    })

    // After the repositioning above, the model's floor sits at y = 0 and its
    // tallest point sits at size.y * scale. Ground rays need to start above
    // that, otherwise they can start "inside" a tall building and miss its
    // roof entirely.
    const groundRayHeight = size.y * scale + 5

    return { model: clone, groundRayHeight }
  }, [scene])
}

// Shared hybrid loader for any plain imported .glb map: scales/recenters it
// so it works with the shared engine's raycasts, regardless of how big or
// small the source asset is. Used by every GLB-imported world (graffiti,
// campus) so the floor/scale fixes only need to live in one place.
function useImportedGlbGround(url) {
  const { scene } = useGLTF(url)

  return useMemo(() => {
    const clone = scene.clone(true)
    const box = new THREE.Box3().setFromObject(clone)
    const size = new THREE.Vector3()
    const center = new THREE.Vector3()
    box.getSize(size)
    box.getCenter(center)

    // Trust the GLB's own scale (glTF convention is meters, same as every
    // procedural world) across a wide sane range — only correct it if it's
    // wildly off, so the player isn't left a giant or a speck next to the
    // imported map.
    const maxDimension = Math.max(size.x, size.z) || 1
    const scale = maxDimension > 4 && maxDimension < 2000 ? 1 : 40 / maxDimension
    clone.scale.setScalar(scale)
    clone.position.set(-center.x * scale, -box.min.y * scale, -center.z * scale)
    clone.updateMatrixWorld(true)

    // box.min.y is the lowest vertex in the WHOLE model — for an interior
    // scene that's just as likely to be a curb or basement prop as the real
    // floor. Raycast straight down through the model's own center instead
    // and use the LOWEST surface hit (the floor) — taking the first/closest
    // hit would grab a roof/ceiling instead, since the ray starts above the
    // whole model.
    const raycaster = new THREE.Raycaster()
    raycaster.set(new THREE.Vector3(0, size.y * scale + 5, 0), new THREE.Vector3(0, -1, 0))
    const hits = raycaster.intersectObject(clone, true)
    if (hits.length > 0) {
      const lowestY = Math.min(...hits.map((h) => h.point.y))
      clone.position.y -= lowestY
    }

    const groundRayHeight = size.y * scale + 5
    return { model: clone, groundRayHeight, footprintX: size.x * scale, footprintZ: size.z * scale }
  }, [scene])
}

function useGraffitiGround() {
  return useImportedGlbGround('/st.glb')
}

function useCampusGlbGround() {
  const result = useImportedGlbGround('/campus.glb')
  if (sessionStorage.getItem('logCampusLandmarks') === '1') {
    sessionStorage.removeItem('logCampusLandmarks')
    const targets = /accueil|entrance|entree|main_entrance/i
    const wp = new THREE.Vector3()
    result.model.traverse((o) => {
      if (targets.test(o.name)) {
        o.getWorldPosition(wp)
        console.log('[landmark]', o.name, wp.x.toFixed(2), wp.y.toFixed(2), wp.z.toFixed(2))
      }
    })
  }
  return result
}

// Ground component for the imported /campus.glb experiment — just the
// model, a footprint-sized physics floor, and the shared Player. NPCs,
// video screen, portals, minimap, etc. are siblings rendered outside
// <WorldGround> (see World()), so swapping this in for TestWorld doesn't
// touch any of them.
function CampusGlbWorld({ mascot, skin, keysRef, cameraRef, playerPositionRef, playerRotationRef, authorName, playerId }) {
  const { model, groundRayHeight } = useCampusGlbGround()

  return (
    <>
      {/* A single flat collider only covers outdoor ground — this model has
          stairs and interiors at other heights, so instead we let Rapier
          build a collider matching the model's own geometry exactly
          ("trimesh" = one collider per mesh, shaped like that mesh). That
          makes every real floor/step in the GLB walkable, not just y = 0. */}
      <RigidBody type="fixed" colliders="trimesh">
        <primitive object={model} />
      </RigidBody>
      <Player
        mascot={mascot}
        skin={skin}
        scenery={model}
        groundRayHeight={groundRayHeight}
        keysRef={keysRef}
        cameraRef={cameraRef}
        playerPositionRef={playerPositionRef}
        playerRotationRef={playerRotationRef}
        authorName={authorName}
        playerId={playerId}
        spawnAt={[0, 0, 0]}
      />
    </>
  )
}

// Test world for the GLB-import experiment: loads /st.glb through the same
// hybrid pipeline as CityWorld, then adds the shared Player and an exit
// portal back to /vr — proving a fully imported map works end-to-end with
// our shared engine. NPC/video screen are deliberately left out until
// walking on the imported floor itself is confirmed working.
function GraffitiWorld({ mascot, skin, keysRef, cameraRef, playerPositionRef, playerRotationRef, authorName, playerId, onNearPortalChange }) {
  const { model, groundRayHeight, footprintX, footprintZ } = useGraffitiGround()

  // Keep every placed object proportional to the model's own footprint
  // instead of fixed coordinates, so it lands inside the map no matter how
  // big or small the imported scene turns out to be.
  const halfX = footprintX / 2
  const halfZ = footprintZ / 2
  const portalPos = [0, 0, halfZ * 0.6]

  return (
    <>
      {/* A flat collider only covers the outer footprint — this is an
          interior (a tunnel/street with walls and a roof), so instead we
          let Rapier build a collider matching the model's own geometry
          exactly ("trimesh"), the same fix as the Campus world. */}
      <RigidBody type="fixed" colliders="trimesh">
        <primitive object={model} />
      </RigidBody>
      <Player
        mascot={mascot}
        skin={skin}
        scenery={model}
        groundRayHeight={groundRayHeight}
        keysRef={keysRef}
        cameraRef={cameraRef}
        playerPositionRef={playerPositionRef}
        playerRotationRef={playerRotationRef}
        authorName={authorName}
        playerId={playerId}
        spawnAt={[0, 0, 0]}
      />
      <Portal
        position={portalPos}
        color="#ff2fb0"
        label="🌀 Volver al Campus"
        playerPositionRef={playerPositionRef}
        onNearbyChange={onNearPortalChange}
      />
    </>
  )
}

// Renders the Anfiteatro world: theater geometry + YouTube screen iframe +
// one center-stage NPC + exit portal back to campus.
function AnfiteatroWorld({ mascot, skin, keysRef, cameraRef, playerPositionRef, playerRotationRef, authorName, playerId, onNearPortalChange }) {
  const { model, groundRayHeight } = useAnfiteatroGround()
  const stageMascot = useMemo(() => getMascotById(9), [])  // director mascot on stage

  return (
    <>
      <primitive object={model} />
      <RigidBody type="fixed" colliders={false} position={[0, -0.5, 0]}>
        <CuboidCollider args={[ANFI_HW, 0.5, ANFI_HD]} />
      </RigidBody>

      {/* YouTube screen via Html overlay — centered on the north back wall */}
      <Html
        position={[0, 12.5, -39.0]}
        transform
        scale={0.052}
        distanceFactor={1}
        occlude={false}
      >
        <div style={{ width: '690px', height: '420px', background: '#000', borderRadius: 4, overflow: 'hidden', boxShadow: '0 0 40px #0044ff88' }}>
          <iframe
            width="690"
            height="420"
            src="https://www.youtube.com/embed/nKSCVzTy69U?autoplay=1&rel=0&modestbranding=1"
            title="Pantalla Anfiteatro"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={{ width: '100%', height: '100%', display: 'block' }}
          />
        </div>
      </Html>

      {/* Marquee sign text */}
      <Html position={[0, ANFI_H - 1.6, ANFI_HD + 1.8 + 0.5]} transform scale={0.06} distanceFactor={1} occlude={false}>
        <div style={{ width: '700px', textAlign: 'center', color: '#1a1020', fontWeight: 'bold', fontSize: '44px', fontFamily: 'serif', letterSpacing: 4, textShadow: '0 0 8px #0008' }}>
          🎭 ANFITEATRO OLIVER 🎭
        </div>
      </Html>

      {/* Stage NPC — slightly bigger to command the stage */}
      <group position={ANFI_STAGE_NPC_POS}>
        <group scale={NPC_SCALE * 1.45} position={[0, NPC_SCALE * 1.45 * MODEL_HALF_HEIGHT, 0]}>
          <MascotMesh mascot={stageMascot} />
        </group>
        <Html position={[0, 0.9, 0]} center distanceFactor={10}>
          <div className="pointer-events-none whitespace-nowrap rounded-full bg-surface/90 px-3 py-1 text-xs font-semibold text-text shadow-lg">
            🎬 Director de Escena
          </div>
        </Html>
      </group>

      <Player
        mascot={mascot}
        skin={skin}
        scenery={model}
        groundRayHeight={groundRayHeight}
        keysRef={keysRef}
        cameraRef={cameraRef}
        playerPositionRef={playerPositionRef}
        playerRotationRef={playerRotationRef}
        authorName={authorName}
        playerId={playerId}
        spawnAt={ANFI_SPAWN}
      />
      <Portal
        position={ANFI_EXIT_PORTAL}
        color="#d946ef"
        label="🌀 Salir al Campus"
        playerPositionRef={playerPositionRef}
        onNearbyChange={onNearPortalChange}
      />
    </>
  )
}


// Renders El Árbol del Mundo: the class selection hub.
function WorldTreeWorld({ mascot, skin, keysRef, cameraRef, playerPositionRef, playerRotationRef, authorName, playerId, onNearPortalChange, onNearClassNodeChange }) {
  const { model, groundRayHeight } = useWorldTreeGround()

  // Animate node spheres bobbing and rune rings rotating each frame
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    model.traverse((child) => {
      if (child.name?.startsWith('wt-node-')) {
        const cid = child.name.replace('wt-node-', '')
        const node = WT_CLASS_NODES[cid]
        if (node) child.position.y = node.pos[1] + Math.sin(t * 1.2 + Object.keys(WT_CLASS_NODES).indexOf(cid)) * 0.3
      }
    })
  })

  // Detect player proximity to class nodes
  useFrame(() => {
    const pos = playerPositionRef?.current
    if (!pos) return
    let nearest = null
    let nearestDist = 4.5
    for (const [cid, node] of Object.entries(WT_CLASS_NODES)) {
      // 3D distance — the Hacker node sits high up the trunk (y=15.5), far
      // above walking height, so an XZ-only check used to mark it "nearest"
      // for anyone standing near the grove's center, blocking every other
      // class card from ever showing.
      const dx = pos.x - node.pos[0]
      const dy = pos.y - node.pos[1]
      const dz = pos.z - node.pos[2]
      const d = Math.sqrt(dx * dx + dy * dy + dz * dz)
      if (d < nearestDist) { nearestDist = d; nearest = cid }
    }
    onNearClassNodeChange?.(nearest)
  })

  return (
    <>
      <primitive object={model} />
      {/* Flat ground collider — without it the Rapier character controller
          never reports "grounded" in this procedural world and the player
          falls forever. */}
      <RigidBody type="fixed" colliders={false} position={[0, -0.5, 0]}>
        <CuboidCollider args={[50, 0.5, 50]} />
      </RigidBody>
      <Player
        mascot={mascot}
        skin={skin}
        scenery={model}
        groundRayHeight={groundRayHeight}
        keysRef={keysRef}
        cameraRef={cameraRef}
        playerPositionRef={playerPositionRef}
        playerRotationRef={playerRotationRef}
        spawnAt={WT_SPAWN}
        authorName={authorName}
        playerId={playerId}
      />
      <Portal
        position={WT_EXIT_PORTAL}
        color="#22c55e"
        label="🌀 Volver al Campus"
        playerPositionRef={playerPositionRef}
        onNearbyChange={onNearPortalChange}
      />
    </>
  )
}

// ── Voice chat (WebRTC peer-to-peer) ─────────────────────────────────────────
// Uses Supabase broadcast as a signaling channel to exchange SDP offers/answers
// and ICE candidates. Audio streams flow directly peer-to-peer via WebRTC —
// Supabase never carries audio data, only the tiny signaling handshake.
//
// Protocol events (all scoped to `event: 'voice:*'`):
//   voice:ring   – broadcast: "I just activated my mic, please send me an offer"
//   voice:offer  – unicast {from, to, sdp}
//   voice:answer – unicast {from, to, sdp}
//   voice:ice    – unicast {from, to, candidate}
//   voice:bye    – broadcast: "I deactivated my mic, close your connection to me"
const STUN = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }, { urls: 'stun:stun1.l.google.com:19302' }] }

function useVoiceChat({ playerId, name, channelRef }) {
  const [micActive, setMicActive] = useState(false)
  const [speaking, setSpeaking] = useState({})
  const [micError, setMicError] = useState(null)
  const localStreamRef = useRef(null)
  const peersRef       = useRef(new Map()) // remoteId -> RTCPeerConnection
  const audioElsRef    = useRef(new Map()) // remoteId -> HTMLAudioElement

  // Build (or reuse) a peer connection to `remoteId`.
  const getOrCreatePeer = useCallback((remoteId) => {
    if (peersRef.current.has(remoteId)) return peersRef.current.get(remoteId)
    const pc = new RTCPeerConnection(STUN)

    // Attach local tracks if mic is already active
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => pc.addTrack(t, localStreamRef.current))
    }

    // Play remote audio as soon as a track arrives
    pc.ontrack = (ev) => {
      const stream = ev.streams[0] || new MediaStream([ev.track])
      let el = audioElsRef.current.get(remoteId)
      if (!el) {
        el = new Audio()
        el.autoplay = true
        audioElsRef.current.set(remoteId, el)
      }
      el.srcObject = stream
      el.play().catch(() => {})
    }

    // Relay ICE candidates through the channel
    pc.onicecandidate = (ev) => {
      if (ev.candidate) {
        channelRef.current?.send({
          type: 'broadcast', event: 'voice:ice',
          payload: { from: playerId, to: remoteId, candidate: ev.candidate },
        })
      }
    }

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'failed' || pc.connectionState === 'closed') {
        peersRef.current.delete(remoteId)
        audioElsRef.current.get(remoteId)?.pause()
        audioElsRef.current.delete(remoteId)
        setSpeaking((p) => { const n = { ...p }; delete n[remoteId]; return n })
      }
    }

    peersRef.current.set(remoteId, pc)
    return pc
  }, [playerId, channelRef])

  const closePeer = useCallback((remoteId) => {
    peersRef.current.get(remoteId)?.close()
    peersRef.current.delete(remoteId)
    const el = audioElsRef.current.get(remoteId)
    if (el) { el.pause(); el.srcObject = null }
    audioElsRef.current.delete(remoteId)
    setSpeaking((p) => { const n = { ...p }; delete n[remoteId]; return n })
  }, [])

  // Signaling listener
  useEffect(() => {
    const ch = channelRef?.current
    if (!ch) return

    const handleMsg = async (msg) => {
      const { event, payload } = msg
      if (!payload) return

      // Someone activated their mic — if we also have mic on, send them an offer
      if (event === 'voice:ring') {
        const { from, name: n } = payload
        if (from === playerId) return
        setSpeaking((p) => ({ ...p, [from]: n }))
        if (!localStreamRef.current) return  // we don't have mic, skip offer
        try {
          const pc = getOrCreatePeer(from)
          const offer = await pc.createOffer()
          await pc.setLocalDescription(offer)
          ch.send({ type: 'broadcast', event: 'voice:offer', payload: { from: playerId, to: from, sdp: offer, name } })
        } catch {}
        return
      }

      // Only process unicast messages addressed to us
      if (payload.to && payload.to !== playerId) return

      if (event === 'voice:offer') {
        const { from, sdp, name: n } = payload
        setSpeaking((p) => ({ ...p, [from]: n }))
        try {
          const pc = getOrCreatePeer(from)
          await pc.setRemoteDescription(sdp)
          const answer = await pc.createAnswer()
          await pc.setLocalDescription(answer)
          ch.send({ type: 'broadcast', event: 'voice:answer', payload: { from: playerId, to: from, sdp: answer } })
        } catch {}
        return
      }

      if (event === 'voice:answer') {
        const { from, sdp } = payload
        try {
          const pc = peersRef.current.get(from)
          if (pc && pc.signalingState !== 'stable') await pc.setRemoteDescription(sdp)
        } catch {}
        return
      }

      if (event === 'voice:ice') {
        const { from, candidate } = payload
        try {
          const pc = peersRef.current.get(from)
          if (pc) await pc.addIceCandidate(candidate)
        } catch {}
        return
      }

      if (event === 'voice:bye') {
        const { from } = payload
        closePeer(from)
      }
    }

    ;['voice:ring', 'voice:offer', 'voice:answer', 'voice:ice', 'voice:bye'].forEach((ev) => {
      ch.on('broadcast', { event: ev }, handleMsg)
    })
  }, [channelRef, playerId, name, getOrCreatePeer, closePeer])

  const toggleMic = useCallback(async () => {
    const ch = channelRef?.current
    if (micActive) {
      localStreamRef.current?.getTracks().forEach((t) => t.stop())
      localStreamRef.current = null
      peersRef.current.forEach((_, id) => closePeer(id))
      peersRef.current.clear()
      setMicActive(false)
      useVrSettingsStore.getState().setMicEnabled(false)
      ch?.send({ type: 'broadcast', event: 'voice:bye', payload: { from: playerId } })
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false })
        localStreamRef.current = stream
        setMicActive(true)
        setMicError(null)
        useVrSettingsStore.getState().setMicEnabled(true)
        // Let everyone online know we have mic — they'll send us offers
        ch?.send({ type: 'broadcast', event: 'voice:ring', payload: { from: playerId, name } })
      } catch (err) {
        setMicError('Sin acceso al micrófono: ' + (err?.message ?? err))
      }
    }
  }, [micActive, playerId, name, channelRef, closePeer])

  useEffect(() => () => {
    localStreamRef.current?.getTracks().forEach((t) => t.stop())
    peersRef.current.forEach((_, id) => closePeer(id))
  }, [closePeer])

  return { micActive, speaking, micError, toggleMic }
}

// Mic toggle button + speaking player list, shown in the VR HUD.
function VoicePanel({ playerId, name, channelRef }) {
  const { micActive, speaking, micError, toggleMic } = useVoiceChat({ playerId, name, channelRef })
  const [open, setOpen] = useState(false)
  const speakingList = Object.values(speaking)

  return (
    <div className="absolute left-4 top-14 z-20 flex flex-col items-start gap-2">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={[
          'rounded-full px-3 py-1.5 text-xs font-semibold shadow-lg backdrop-blur transition-colors',
          micActive
            ? 'bg-green-500/90 text-white animate-pulse'
            : 'bg-surface/90 text-text hover:bg-primary/30',
        ].join(' ')}
      >
        {micActive ? '🎤 Hablando' : '🎙️ Voz'}
      </button>
      {open && (
        <div className="w-56 rounded-xl border border-border bg-surface/95 p-3 text-xs text-text shadow-xl backdrop-blur">
          <p className="mb-2 font-semibold">Chat de voz</p>
          <button
            type="button"
            onClick={toggleMic}
            className={[
              'mb-2 w-full rounded-lg px-3 py-2 font-semibold transition-colors',
              micActive
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-primary text-background hover:bg-primary-hover',
            ].join(' ')}
          >
            {micActive ? '🔴 Desactivar micrófono' : '🎙️ Activar micrófono'}
          </button>
          {micError && <p className="mb-2 text-red-400">{micError}</p>}
          <p className="mb-1 text-text-muted">Hablando ahora:</p>
          {speakingList.length > 0 ? (
            speakingList.map((n) => (
              <p key={n} className="flex items-center gap-1 text-green-400">
                <span className="animate-pulse">🔊</span> {n}
              </p>
            ))
          ) : (
            <p className="text-text-muted italic">Nadie está hablando</p>
          )}
          <p className="mt-2 text-[10px] text-text-muted">
            El audio de voz viaja directamente entre navegadores.
          </p>
        </div>
      )}
    </div>
  )
}

// Shows the inactive companion parked at a fixed world position when the player
// enables "Stay" mode — rendered inside Suspense so MascotMesh can useGLTF.
function StayedCompanion({ mascot, skin, avatarId }) {
  const activeChar = useVrCharacterStore((s) => s.activeChar)
  const stayPosition = useVrCharacterStore((s) => s.stayPosition)
  if (!stayPosition) return null
  const pos = [stayPosition.x, stayPosition.y, stayPosition.z]
  return (
    <group position={pos}>
      <group scale={PLAYER_SCALE * 0.9}>
        {activeChar === 'avatar' ? (
          <MascotMesh mascot={mascot} skin={skin} />
        ) : (
          <PlayerAvatarBody avatarId={avatarId} />
        )}
      </group>
    </group>
  )
}

// Loads the real city model and renders it alongside the player, which needs
// the same model instance to raycast against for ground height/collisions.
function CityWorld({ mascot, skin, keysRef, cameraRef, playerPositionRef, playerRotationRef, authorName, playerId }) {
  const { model, groundRayHeight } = useSceneryModel()

  return (
    <>
      <primitive object={model} />
      <Player
        mascot={mascot}
        skin={skin}
        scenery={model}
        groundRayHeight={groundRayHeight}
        keysRef={keysRef}
        cameraRef={cameraRef}
        playerPositionRef={playerPositionRef}
        playerRotationRef={playerRotationRef}
        authorName={authorName}
        playerId={playerId}
      />
    </>
  )
}

// Falling apple — dynamic physics object that rolls and bounces on the campus.
// Spawned near maple trees; Oliver can push them with the character controller.
function FallingApple({ position }) {
  return (
    <RigidBody type="dynamic" restitution={0.45} friction={0.9} linearDamping={0.4} position={position}>
      <mesh castShadow>
        <sphereGeometry args={[0.14, 8, 8]} />
        <meshStandardMaterial color="#c0392b" roughness={0.6} />
      </mesh>
    </RigidBody>
  )
}

// Desk + monitor prop for the Programador class's terminal ability — only
// visually "usable" (E prompt + interaction) for class===programmer or the
// admin; everyone else just sees a static prop in the plaza.
const COMPUTER_POS = new THREE.Vector3(-6, 0, 8)
const COMPUTER_RADIUS = 2.2

// 3D gift box that bobs in the air. Glows gold when claimable, grey when already
// claimed today. Calls onNearChange(bool) as the player approaches/leaves.
const REWARD_BOX_POS = new THREE.Vector3(6, 1.5, 8)
const REWARD_BOX_RADIUS = 3.5

function DailyRewardBox({ playerPositionRef, onNearChange }) {
  const meshRef = useRef()
  const lightRef = useRef()
  const canClaim = useDailyRewardsStore((s) => s.canClaim)
  const claimable = canClaim()
  const nearRef = useRef(false)

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    if (meshRef.current) {
      meshRef.current.position.y = REWARD_BOX_POS.y + Math.sin(t * 1.6) * 0.18
      meshRef.current.rotation.y = t * 0.5
    }
    if (lightRef.current) {
      lightRef.current.intensity = claimable ? 1.2 + Math.sin(t * 3) * 0.4 : 0
    }
    const pos = playerPositionRef?.current
    if (pos) {
      const flat = new THREE.Vector3(pos.x, REWARD_BOX_POS.y, pos.z)
      const isNear = flat.distanceTo(REWARD_BOX_POS) <= REWARD_BOX_RADIUS
      if (isNear !== nearRef.current) {
        nearRef.current = isNear
        onNearChange?.(isNear)
      }
    }
  })

  const color = claimable ? '#f59e0b' : '#6b7280'
  const emissive = claimable ? '#92400e' : '#000000'

  return (
    <group position={[REWARD_BOX_POS.x, REWARD_BOX_POS.y, REWARD_BOX_POS.z]}>
      <pointLight ref={lightRef} color="#fbbf24" intensity={1.2} distance={8} />
      <group ref={meshRef} position={[0, 0, 0]}>
        {/* Box body */}
        <mesh castShadow>
          <boxGeometry args={[0.55, 0.55, 0.55]} />
          <meshStandardMaterial color={color} emissive={emissive} emissiveIntensity={0.6} roughness={0.3} metalness={0.5} />
        </mesh>
        {/* Ribbon H */}
        <mesh position={[0, 0, 0.28]}>
          <boxGeometry args={[0.56, 0.1, 0.02]} />
          <meshStandardMaterial color={claimable ? '#dc2626' : '#374151'} />
        </mesh>
        {/* Ribbon V */}
        <mesh position={[0, 0, 0.28]}>
          <boxGeometry args={[0.1, 0.56, 0.02]} />
          <meshStandardMaterial color={claimable ? '#dc2626' : '#374151'} />
        </mesh>
        {/* Bow sphere */}
        <mesh position={[0, 0.32, 0.28]}>
          <sphereGeometry args={[0.09, 8, 8]} />
          <meshStandardMaterial color={claimable ? '#ef4444' : '#4b5563'} emissive={claimable ? '#7f1d1d' : '#000'} emissiveIntensity={0.5} />
        </mesh>
        {/* Floating label */}
        <Html center position={[0, 0.65, 0]} style={{ pointerEvents: 'none', userSelect: 'none' }}>
          <div style={{ fontSize: 18, filter: claimable ? 'none' : 'grayscale(1)', opacity: claimable ? 1 : 0.45 }}>
            {claimable ? '🎁' : '✅'}
          </div>
        </Html>
      </group>
    </group>
  )
}

// Desk + glowing monitor — the Programador class's terminal. Visible to
// everyone (it's part of the shared multiplayer scene), but only reports
// "near" so VRPage can gate the E-to-use prompt by class.
function ComputerTerminal({ playerPositionRef, onNearChange }) {
  const screenRef = useRef()
  const nearRef = useRef(false)

  useFrame(({ clock }) => {
    if (screenRef.current) {
      screenRef.current.material.emissiveIntensity = 0.7 + Math.sin(clock.getElapsedTime() * 2.2) * 0.25
    }
    const pos = playerPositionRef?.current
    if (!pos) return
    const flat = new THREE.Vector3(pos.x, COMPUTER_POS.y, pos.z)
    const isNear = flat.distanceTo(COMPUTER_POS) <= COMPUTER_RADIUS
    if (isNear !== nearRef.current) {
      nearRef.current = isNear
      onNearChange?.(isNear)
    }
  })

  return (
    <group position={[COMPUTER_POS.x, COMPUTER_POS.y, COMPUTER_POS.z]}>
      {/* Desk */}
      <mesh position={[0, 0.4, 0]} castShadow>
        <boxGeometry args={[1.1, 0.08, 0.6]} />
        <meshStandardMaterial color="#5b4636" roughness={0.8} />
      </mesh>
      {[[-0.45, -0.25], [0.45, -0.25], [-0.45, 0.25], [0.45, 0.25]].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.18, z]}>
          <boxGeometry args={[0.06, 0.36, 0.06]} />
          <meshStandardMaterial color="#3a2e22" />
        </mesh>
      ))}
      {/* Monitor */}
      <mesh position={[0, 0.75, -0.15]}>
        <boxGeometry args={[0.55, 0.4, 0.04]} />
        <meshStandardMaterial color="#111827" roughness={0.4} />
      </mesh>
      <mesh ref={screenRef} position={[0, 0.75, -0.125]}>
        <planeGeometry args={[0.46, 0.3]} />
        <meshStandardMaterial color="#0a2e1a" emissive="#22c55e" emissiveIntensity={0.7} />
      </mesh>
      <Html center position={[0, 1.15, -0.15]} style={{ pointerEvents: 'none', userSelect: 'none' }}>
        <div style={{ fontSize: 16 }}>🖥️</div>
      </Html>
    </group>
  )
}

// "Find the bug" mini-puzzles for the Programador terminal — a short fixed
// list is plenty since one is picked at random per visit.
const BUG_PUZZLES = [
  {
    code: 'function suma(a, b) {\n  retun a + b\n}',
    options: ['Falta punto y coma', '"retun" mal escrito (debería ser "return")', 'Los parámetros están al revés'],
    answer: 1,
  },
  {
    code: 'for (let i = 0; i <= 10; i++) {\n  arr[i] = i\n}',
    options: ['El bucle se sale del arreglo (off-by-one)', 'Falta declarar "arr"', 'No hay ningún bug'],
    answer: 0,
  },
  {
    code: 'if (user.role = "admin") {\n  giveAccess()\n}',
    options: ['Falta la función giveAccess', 'Usa "=" en vez de "==" (asignación, no comparación)', 'Falta un "else"'],
    answer: 1,
  },
  {
    code: 'const total = items.reduce((a, b) => a + b)',
    options: ['Falta el valor inicial en reduce (falla con lista vacía)', '"reduce" no existe', '"items" debería ser un objeto'],
    answer: 0,
  },
]

// Tiered content for the Programador's computer:
// - 'basic'  → anyone with class===programmer: a find-the-bug puzzle.
// - 'hacker' → programmer who reached level 10 (the same level the rest of
//   the class tree unlocks its Tier-3 ultimate at): a harder-paying version
//   of the same puzzle, themed as breaking encryption.
// - 'admin'  → the real GM console (way more power, admin-only).
function TerminalModal({ tier, onClose }) {
  const [puzzleIdx] = useState(() => Math.floor(Math.random() * BUG_PUZZLES.length))
  const [selected, setSelected] = useState(null)
  const [result, setResult] = useState(null)
  const canClaim = useTerminalRewardsStore((s) => s.canClaim())
  const puzzle = BUG_PUZZLES[puzzleIdx]

  if (tier === 'admin') return <GmConsole open onClose={onClose} />

  const reward = tier === 'hacker' ? { coins: 600, xp: 60 } : { coins: 250, xp: 25 }

  const handleAnswer = (i) => {
    setSelected(i)
    if (i !== puzzle.answer) { setResult('wrong'); return }
    if (!canClaim) { setResult('claimed'); return }
    useTerminalRewardsStore.getState().claim(tier)
    setResult('correct')
  }

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-md rounded-xl border border-primary/40 bg-black/95 font-mono text-sm text-[#39ff14] shadow-2xl">
        <div className="flex items-center justify-between border-b border-primary/30 px-4 py-2">
          <span className="font-semibold">{tier === 'hacker' ? '🕶️ Terminal Hacker' : '🖥️ Terminal del Programador'}</span>
          <button type="button" onClick={onClose} className="text-text-muted hover:text-[#39ff14]">✕</button>
        </div>
        <div className="space-y-3 px-4 py-4">
          <p className="text-[#39ff14]/70">
            {tier === 'hacker'
              ? '// Encriptación detectada. Encuentra la vulnerabilidad para romperla.'
              : '// Depura el siguiente código.'}
          </p>
          <pre className="whitespace-pre-wrap rounded bg-[#001a08] p-3 text-xs text-[#39ff14]">{puzzle.code}</pre>
          <p>¿Cuál es el bug?</p>
          <div className="flex flex-col gap-2">
            {puzzle.options.map((opt, i) => (
              <button
                key={i}
                type="button"
                disabled={result !== null}
                onClick={() => handleAnswer(i)}
                className={`rounded border px-3 py-1.5 text-left text-xs transition-colors ${
                  selected === i
                    ? i === puzzle.answer ? 'border-[#39ff14] bg-[#39ff14]/10' : 'border-red-500 bg-red-500/10'
                    : 'border-[#39ff14]/30 hover:border-[#39ff14]'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
          {result === 'correct' && <p className="text-[#39ff14]">✅ ¡Correcto! +{reward.coins} 🪙 +{reward.xp} XP</p>}
          {result === 'wrong' && <p className="text-red-400">❌ No es eso. Vuelve mañana para otro intento.</p>}
          {result === 'claimed' && <p className="text-yellow-400">⏳ Ya usaste la terminal hoy. Vuelve mañana.</p>}
        </div>
      </div>
    </div>
  )
}

// Same as <CityWorld>, but walking on the procedural test ground instead of
// the real city model (see USE_TEST_SCENERY).
function TestWorld({ mascot, skin, keysRef, cameraRef, playerPositionRef, playerRotationRef, authorName, playerId }) {
  const { model, groundRayHeight } = useCampusGround()

  return (
    <>
      <primitive object={model} />
      {/* Flat ground collider — Rapier CC uses this for landing/jumping */}
      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider args={[200, 0.5, 200]} position={[0, -0.5, 0]} />
      </RigidBody>
      {/* Warm point light for the torch monument */}
      <pointLight position={[-7, 10.5, 0]} color="#ff8800" intensity={4} distance={18} decay={2} />
      {/* Apples near maple trees — dynamic, fall and can be pushed */}
      <FallingApple position={[-7, 3, -6]} />
      <FallingApple position={[-8.5, 4, -7.5]} />
      <FallingApple position={[-6, 3.5, -8]} />
      <FallingApple position={[-9, 2.5, -5]} />
      <FallingApple position={[7, 3, -6]} />
      <FallingApple position={[8, 4, -8]} />
      <Player
        mascot={mascot}
        skin={skin}
        scenery={model}
        groundRayHeight={groundRayHeight}
        keysRef={keysRef}
        cameraRef={cameraRef}
        playerPositionRef={playerPositionRef}
        playerRotationRef={playerRotationRef}
        authorName={authorName}
        playerId={playerId}
      />
    </>
  )
}

// Renders one of our real mascot/mage models as an NPC, with a floating
// name tag above its head. Falls back to a simple colored marker if the NPC
// has no mascotId (shouldn't happen, but keeps things from disappearing
// silently if the registry entry is incomplete).
function VrNpc({ npc, playerPositionRef }) {
  const mascot  = getMascotById(npc.mascotId)
  const facing  = Math.atan2(-npc.position[0], -npc.position[2])
  const npcPos  = useMemo(() => new THREE.Vector3(...npc.position), [npc.position])
  const [near, setNear]     = useState(false)
  const [bubbles, setBubbles] = useState([])
  const bubbleIdRef = useRef(1)
  const accepted = useGlobalMissionsStore((s) => s.accepted)
  const mission  = useMemo(() => getGlobalMissionById(npc.missionId), [npc.missionId])
  const hasQuest = mission && !accepted.includes(mission.id)

  useFrame(() => {
    const pos = playerPositionRef?.current
    if (!pos) return
    const shouldBeNear = pos.distanceTo(npcPos) <= NPC_DETAIL_RADIUS
    if (shouldBeNear !== near) setNear(shouldBeNear)
  })

  const sayDialogue = useCallback(() => {
    const text = npc.dialogue
    if (!text) return
    const id = bubbleIdRef.current++
    setBubbles((cur) => [...cur, { id, text }].slice(-MAX_STACKED_BUBBLES))
    setTimeout(() => setBubbles((cur) => cur.filter((b) => b.id !== id)), CHAT_BUBBLE_DURATION)
    if (!useVrSettingsStore.getState().npcVoice || !window.speechSynthesis) return
    const clean = text.replace(/[\u{1F300}-\u{1FFFF}]/gu, '').replace(/[^\w\s.,!?¿¡]/g, '').trim()
    if (!clean) return
    window.speechSynthesis.cancel()
    const utt = new SpeechSynthesisUtterance(clean)
    utt.lang = 'es-ES'; utt.rate = 0.92; utt.pitch = 1.05
    window.speechSynthesis.speak(utt)
  }, [npc.dialogue])

  return (
    <group position={npc.position} rotation={[0, facing, 0]}
      onClick={(e) => { e.stopPropagation(); sayDialogue() }}>
      {/* Transparent hitbox so click works even before model loads */}
      <mesh position={[0, 0.7, 0]}>
        <cylinderGeometry args={[0.35, 0.35, 1.6, 8]} />
        <meshBasicMaterial transparent opacity={0.01} depthWrite={false} />
      </mesh>
      {near && mascot ? (
        <Suspense
          fallback={
            <mesh position={[0, 0.6, 0]}>
              <cylinderGeometry args={[0.18, 0.24, 1.2, 12]} />
              <meshStandardMaterial color={npc.color} />
            </mesh>
          }
        >
          <group scale={NPC_SCALE} position={[0, NPC_SCALE * MODEL_HALF_HEIGHT, 0]}>
            <MascotMesh mascot={mascot} />
          </group>
        </Suspense>
      ) : (
        <mesh position={[0, 0.6, 0]}>
          <cylinderGeometry args={[0.18, 0.24, 1.2, 12]} />
          <meshStandardMaterial color={npc.color} />
        </mesh>
      )}
      {near && (
        <Html position={[0, 2.1, 0]} center distanceFactor={10}>
          <div className="pointer-events-none flex flex-col items-center gap-0.5">
            {hasQuest && (
              <span className="animate-bounce text-xl leading-none drop-shadow-lg" style={{ color: '#facc15', textShadow: '0 0 8px #f59e0b' }}>❗</span>
            )}
            <div className="whitespace-nowrap rounded-full bg-surface/90 px-3 py-1 text-xs font-semibold text-text shadow-lg">
              {npc.emoji} {npc.name}
            </div>
          </div>
        </Html>
      )}
      <BubbleStack bubbles={bubbles} baseY={NPC_SCALE * 2 + 1.0} color={npc.color} />
    </group>
  )
}

// NPCs only speak when left-clicked — no auto-speech.
function IdleNpc({ config, playerPositionRef }) {
  const mascot      = useMemo(() => getMascotById(config.mascotId), [config.mascotId])
  const [bubbles, setBubbles] = useState([])
  const lineIndexRef = useRef(0)
  const bubbleIdRef  = useRef(1)
  // Ingeniero de IA passive: NPCs tagged topic:'ai' get a glowing highlight
  // visible only to that class — everyone else sees a plain name tag.
  const playerClass = useGameStore((s) => s.player.class)
  const showAiHighlight = config.topic === 'ai' && playerClass === 'ai_engineer'

  const sayOneLine = useCallback(async () => {
    let text
    if (config.aiPrompt) {
      const { minimaxApiKey, deepseekApiKey, chatModel } = useSettingsStore.getState()
      const provider = getModelProvider(chatModel)
      const apiKey = provider === 'deepseek' ? deepseekApiKey : minimaxApiKey
      if (apiKey && !apiKey.startsWith('mx-mock')) {
        try {
          const reply = await sendNpcMessage({
            npcPrompt: config.aiPrompt,
            content: 'Comenta algo breve, espontáneo y en personaje (una sola frase corta).',
          })
          if (reply) text = reply.trim()
        } catch { /* fall through to static lines */ }
      }
    }
    if (!text) {
      text = config.lines[lineIndexRef.current % config.lines.length]
      lineIndexRef.current += 1
    }
    const id = bubbleIdRef.current++
    setBubbles((cur) => [...cur, { id, text }].slice(-MAX_STACKED_BUBBLES))
    setTimeout(() => setBubbles((cur) => cur.filter((b) => b.id !== id)), CHAT_BUBBLE_DURATION)
    if (!useVrSettingsStore.getState().npcVoice || !window.speechSynthesis) return
    const clean = text.replace(/[\u{1F300}-\u{1FFFF}]/gu, '').replace(/[^\w\s.,!?¿¡]/g, '').trim()
    if (!clean) return
    window.speechSynthesis.cancel()
    const utt = new SpeechSynthesisUtterance(clean)
    utt.lang = 'es-ES'; utt.rate = 0.95; utt.pitch = 1.1
    window.speechSynthesis.speak(utt)
  }, [config])

  return (
    <group position={config.position}
      onClick={(e) => { e.stopPropagation(); sayOneLine() }}>
      {/* Transparent hitbox so click works even before model loads */}
      <mesh position={[0, 0.7, 0]}>
        <cylinderGeometry args={[0.35, 0.35, 1.6, 8]} />
        <meshBasicMaterial transparent opacity={0.01} depthWrite={false} />
      </mesh>
      <group scale={NPC_SCALE} position={[0, NPC_SCALE * MODEL_HALF_HEIGHT, 0]}>
        <MascotMesh mascot={mascot} />
      </group>
      {showAiHighlight && (
        <pointLight position={[0, NPC_SCALE * 2 + 0.3, 0]} color="#a855f7" intensity={1.4} distance={4} />
      )}
      <Html position={[0, NPC_SCALE * 2 + 0.6, 0]} center distanceFactor={10}>
        <div
          className={`pointer-events-none whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold shadow-lg ${
            showAiHighlight ? 'bg-purple-500/90 text-white' : 'bg-surface/90 text-text'
          }`}
        >
          {showAiHighlight ? '🧠 ' : ''}{config.emoji} {config.name}
        </div>
      </Html>
      <BubbleStack bubbles={bubbles} baseY={NPC_SCALE * 2 + 1.0} color={config.bubbleColor} />
    </group>
  )
}

// Background "wandering cat" that walks a fixed patrol loop, just to give
// the test ground some life. Purely decorative — no collision, no missions.
function WanderingCat({ path }) {
  const group = useRef()
  const targetIndex = useRef(1)
  const mascot = useMemo(() => getMascotById(8), [])

  useFrame((_, delta) => {
    const node = group.current
    if (!node) return

    const target = path[targetIndex.current]
    const dx = target[0] - node.position.x
    const dz = target[2] - node.position.z
    const dist = Math.hypot(dx, dz)

    if (dist < 0.15) {
      targetIndex.current = (targetIndex.current + 1) % path.length
      return
    }

    const step = Math.min(WANDER_CAT_SPEED * delta, dist)
    node.position.x += (dx / dist) * step
    node.position.z += (dz / dist) * step

    const targetAngle = Math.atan2(dx, dz)
    let angleDiff = targetAngle - node.rotation.y
    angleDiff = Math.atan2(Math.sin(angleDiff), Math.cos(angleDiff))
    node.rotation.y += angleDiff * Math.min(1, TURN_SPEED * delta)
  })

  return (
    <group ref={group} position={path[0]}>
      <group scale={WANDER_CAT_SCALE} position={[0, WANDER_CAT_SCALE * MODEL_HALF_HEIGHT, 0]}>
        <MascotMesh mascot={mascot} />
      </group>
    </group>
  )
}

// One other player sharing this VR session. Its position/rotation come from
// `transformsRef` (a Map of id -> latest broadcast {x,y,z,ry}, updated by
// useVrMultiplayer outside of React), and are lerped toward each frame so
// remote movement looks smooth despite the ~120ms network tick. Metadata
// (name/mascot/skin) comes from useVrPresenceStore and only changes on
// join/rename, so it's safe to read via a normal hook.
// Drives the local player's class-colored "golpe" ring: positions it a step
// in front of the player (using their facing angle) and times the fade off
// `firedAtRef` — a Date.now() timestamp set by the F-key shortcut.
function LocalAttackBurst({ playerPositionRef, playerRotationRef, firedAtRef, color }) {
  const groupRef = useRef()
  const ringRef = useRef()

  useFrame(() => {
    const pos = playerPositionRef?.current
    const ring = ringRef.current
    if (!pos || !groupRef.current || !ring) return
    const age = Date.now() - (firedAtRef.current ?? 0)
    if (age > ATTACK_BURST_MS) { ring.visible = false; return }
    const ry = playerRotationRef?.current ?? 0
    groupRef.current.position.set(pos.x + Math.sin(ry) * 0.7, pos.y + 0.5, pos.z + Math.cos(ry) * 0.7)
    const p = Math.max(0, age) / ATTACK_BURST_MS
    ring.visible = true
    ring.scale.setScalar(0.4 + p * 1.0)
    ring.material.opacity = 0.9 * (1 - p)
  })

  return (
    <group ref={groupRef}>
      <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.25, 0.42, 24]} />
        <meshBasicMaterial color={color} transparent opacity={0} depthWrite={false} />
      </mesh>
    </group>
  )
}

function RemotePlayerMesh({ id, transformsRef, actionsRef, onSelectPlayer }) {
  const group = useRef()
  const attackRingRef = useRef()
  const player = useVrPresenceStore((s) => s.players[id])
  const mascot = getMascotById(player?.mascotId) || getMascotById(8)
  const skin = getSkinById(player?.skinId)

  const bubbles = useChatBubbles(id)

  useFrame((_, delta) => {
    const node = group.current
    const target = transformsRef.current.get(id)
    if (!node || !target) return

    const lerpFactor = Math.min(1, 10 * delta)
    node.position.x += (target.x - node.position.x) * lerpFactor
    node.position.y += (target.y - node.position.y) * lerpFactor
    node.position.z += (target.z - node.position.z) * lerpFactor

    let angleDiff = target.ry - node.rotation.y
    angleDiff = Math.atan2(Math.sin(angleDiff), Math.cos(angleDiff))
    node.rotation.y += angleDiff * lerpFactor

    // Same class-attack VFX as the local player, just driven by the latest
    // 'action' broadcast for this id instead of a local keypress timestamp.
    const action = actionsRef?.current.get(id)
    const ring = attackRingRef.current
    if (ring) {
      const age = action ? Date.now() - action.ts : Infinity
      if (age > ATTACK_BURST_MS) {
        ring.visible = false
      } else {
        const p = Math.max(0, age) / ATTACK_BURST_MS
        ring.visible = true
        ring.scale.setScalar(0.4 + p * 1.0)
        ring.material.color.set(PLAYER_CLASSES[action.classId]?.color ?? '#ffffff')
        ring.material.opacity = 0.9 * (1 - p)
      }
    }
  })

  return (
    <group ref={group}>
      <group scale={PLAYER_SCALE} position={[0, PLAYER_SCALE * MODEL_HALF_HEIGHT, 0]}>
        <PlayerAvatarBody avatarId={player?.avatarId || 'scholar'} />
        <group position={[1.2, 0, 0]} scale={0.65}>
          <MascotMesh mascot={mascot} skin={skin} />
        </group>
      </group>
      <mesh ref={attackRingRef} position={[0, 0.5, 0.7]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.25, 0.42, 24]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
      <Html position={[0, PLAYER_HEIGHT + 0.5, 0]} center distanceFactor={10}>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onSelectPlayer?.({ id, name: player?.name || 'Viajero' })
          }}
          className="cursor-pointer whitespace-nowrap rounded-full bg-surface/90 px-3 py-1 text-xs font-semibold text-text shadow-lg transition-colors hover:bg-primary/30"
        >
          {player?.name || 'Viajero'}
        </button>
      </Html>
      <BubbleStack bubbles={bubbles} baseY={PLAYER_HEIGHT + 1.1} color={colorFromId(id)} />
    </group>
  )
}

// Renders every other player currently in the VR session. The roster (who's
// here) comes from useVrPresenceStore (zustand, low-churn); their live
// transforms come from `transformsRef` (a plain Map, high-churn) so position
// updates don't cause this list to re-render.
function RemotePlayers({ transformsRef, actionsRef, onSelectPlayer }) {
  // `Object.keys(...)` returns a brand-new array on every store read, which
  // makes useSyncExternalStore think the snapshot changed on every render
  // and re-render forever ("Maximum update depth exceeded" / React error
  // #185 — the actual cause of the VR world crashing to a black screen).
  // Select the stable `players` object instead and only recompute the id
  // list (via useMemo) when that object reference actually changes.
  const players = useVrPresenceStore((s) => s.players)
  const playerIds = useMemo(() => Object.keys(players), [players])

  return (
    <>
      {playerIds.map((id) => (
        <RemotePlayerMesh key={id} id={id} transformsRef={transformsRef} actionsRef={actionsRef} onSelectPlayer={onSelectPlayer} />
      ))}
    </>
  )
}

// A glowing torus "portal" ring that detects when the player walks within
// PORTAL_INTERACT_RADIUS and reports it via onNearbyChange, so VRPage can
// show the "press E" prompt outside the canvas and handle the navigation.
// Elaborate arch-style portal: stone gate posts + bar, dual counter-rotating
// rings, animated glowing disc, and a raised base platform. The arch gives the
// portal a physical presence; the spinning rings make it impossible to miss.
function Portal({ position, color, label, playerPositionRef, onNearbyChange }) {
  const portalVec = useRef(new THREE.Vector3(...position))
  const ring1Ref = useRef()
  const ring2Ref = useRef()
  const discRef  = useRef()
  const lastNear = useRef(false)

  useFrame((_, delta) => {
    if (ring1Ref.current) ring1Ref.current.rotation.y += delta * 1.1
    if (ring2Ref.current) ring2Ref.current.rotation.y -= delta * 0.7
    if (discRef.current) {
      discRef.current.material.emissiveIntensity = 0.2 + Math.abs(Math.sin(Date.now() * 0.0018)) * 0.15
    }
    const pos = playerPositionRef?.current
    if (!pos) return
    const near = pos.distanceTo(portalVec.current) <= PORTAL_INTERACT_RADIUS
    if (near !== lastNear.current) {
      lastNear.current = near
      onNearbyChange?.(near)
    }
  })

  return (
    <group position={position}>
      {/* Base platform */}
      <mesh position={[0, 0.12, 0]}>
        <cylinderGeometry args={[1.55, 1.75, 0.24, 24]} />
        <meshStandardMaterial color="#c0a880" />
      </mesh>

      {/* Gate arch posts */}
      {[-1.2, 1.2].map((side, i) => (
        <group key={i}>
          <mesh position={[side, 2.2, 0]}>
            <boxGeometry args={[0.38, 4.2, 0.38]} />
            <meshStandardMaterial color="#c0a880" />
          </mesh>
          <mesh position={[side, 4.45, 0]}>
            <sphereGeometry args={[0.24, 8, 6]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.7} />
          </mesh>
        </group>
      ))}
      {/* Top arch crossbar */}
      <mesh position={[0, 4.5, 0]}>
        <boxGeometry args={[2.95, 0.34, 0.34]} />
        <meshStandardMaterial color="#c0a880" />
      </mesh>

      {/* Outer ring — rotates clockwise */}
      <mesh ref={ring1Ref} position={[0, 2.2, 0]}>
        <torusGeometry args={[1.08, 0.10, 14, 52]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.1} />
      </mesh>
      {/* Inner ring — rotates counter-clockwise */}
      <mesh ref={ring2Ref} position={[0, 2.2, 0]}>
        <torusGeometry args={[0.76, 0.07, 12, 36]} />
        <meshStandardMaterial color="#ffffff" emissive={color} emissiveIntensity={0.8} />
      </mesh>

      {/* Portal disc (animated emissive) */}
      <mesh ref={discRef} position={[0, 2.2, 0]}>
        <circleGeometry args={[0.7, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.22}
          transparent
          opacity={0.45}
          side={THREE.DoubleSide}
        />
      </mesh>

      <Html position={[0, 5.3, 0]} center distanceFactor={14}>
        <div className="pointer-events-none whitespace-nowrap rounded-full bg-surface/90 px-3 py-1 text-xs font-semibold text-text shadow-lg">
          {label}
        </div>
      </Html>
    </group>
  )
}

// Player's private room: same Player + camera as the campus, but on the
// simple enclosed Room ground with no NPCs, no remote players, and an exit
// portal back to /vr (the campus).
function RoomWorld({ mascot, skin, keysRef, cameraRef, playerPositionRef, playerRotationRef, authorName, playerId, onNearPortalChange }) {
  const { model, groundRayHeight } = useRoomGround()
  return (
    <>
      <primitive object={model} />
      <RigidBody type="fixed" colliders={false} position={[0, -0.5, 0]}>
        <CuboidCollider args={[ROOM_SIZE / 2, 0.5, ROOM_SIZE / 2]} />
      </RigidBody>
      <Player
        mascot={mascot}
        skin={skin}
        scenery={model}
        groundRayHeight={groundRayHeight}
        keysRef={keysRef}
        cameraRef={cameraRef}
        playerPositionRef={playerPositionRef}
        playerRotationRef={playerRotationRef}
        authorName={authorName}
        playerId={playerId}
        spawnAt={[0, 0, 3]}
      />
      <Portal
        position={ROOM_EXIT_PORTAL_POSITION}
        color="#7dd3fc"
        label="🌀 Salir al Campus"
        playerPositionRef={playerPositionRef}
        onNearbyChange={onNearPortalChange}
      />
    </>
  )
}

// Watches the distance from the player to every NPC and reports the closest
// one within INTERACT_RADIUS via onNearbyChange. Only Oliver, Einstein and
// Jafet remain in the main Campus world — mission NPCs/portals were removed.
const ALL_NPC_POSITIONS = [
  OLIVER_NPC,
  EINSTEIN_NPC,
  JAFET_NPC,
].map((npc) => ({ id: npc.id, vec: new THREE.Vector3(...npc.position) }))

// Ids that belong to idle (non-mission) NPCs — used to decide which card to show.
const IDLE_NPC_IDS = new Set([OLIVER_NPC.id, EINSTEIN_NPC.id, JAFET_NPC.id])

function NpcProximityTracker({ playerPositionRef, onNearbyChange }) {
  const lastId = useRef(null)

  useFrame(() => {
    const pos = playerPositionRef.current
    if (!pos) return

    let nearestId = null
    let nearestDist = Infinity
    for (const { id, vec } of ALL_NPC_POSITIONS) {
      const dist = pos.distanceTo(vec)
      if (dist < nearestDist) {
        nearestDist = dist
        nearestId = id
      }
    }

    const nearbyId = nearestDist <= INTERACT_RADIUS ? nearestId : null
    if (nearbyId !== lastId.current) {
      lastId.current = nearbyId
      onNearbyChange(nearbyId)
    }
  })

  return null
}

// ── Idle NPC right-click card ─────────────────────────────────────────────────
// Shown when the player right-clicks while standing next to Oliver, Einstein or
// Jafet. Displays a greeting from the NPC and a few action buttons.
const IDLE_NPC_CONFIGS = {
  [OLIVER_NPC.id]:   OLIVER_NPC,
  [EINSTEIN_NPC.id]: EINSTEIN_NPC,
  [JAFET_NPC.id]:    JAFET_NPC,
}

function IdleNpcCard({ npcId, onClose, onChat }) {
  const cfg  = IDLE_NPC_CONFIGS[npcId]
  const navigate = useNavigate()
  const line = useMemo(() => {
    if (!cfg) return ''
    return cfg.lines[Math.floor(Math.random() * cfg.lines.length)]
  }, [cfg])

  useEffect(() => {
    if (!cfg || !line || !window.speechSynthesis) return
    const { npcVoice } = useVrSettingsStore.getState()
    if (!npcVoice) return
    const clean = line.replace(/[\u{1F300}-\u{1FFFF}]/gu, '').replace(/[^\w\s.,!?¿¡]/g, '').trim()
    if (!clean) return
    window.speechSynthesis.cancel()
    const utt = new SpeechSynthesisUtterance(clean)
    utt.lang = 'es-ES'; utt.rate = 0.9; utt.pitch = 1.1
    window.speechSynthesis.speak(utt)
    return () => window.speechSynthesis.cancel()
  }, [cfg, line])

  if (!cfg) return null
  return (
    <div
      className="absolute bottom-24 left-1/2 z-30 w-80 -translate-x-1/2 overflow-hidden rounded-2xl shadow-2xl sm:bottom-20"
      style={{ background: 'linear-gradient(160deg, #1a0f2e 0%, #0f0818 100%)', border: '1px solid rgba(124,58,237,0.45)' }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-2.5"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-3xl"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }}>
          {cfg.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-black truncate" style={{ color: '#fcd34d' }}>{cfg.name}</p>
          <p className="text-[10px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.3)' }}>
            {cfg.shopAction ? 'Mercader · Campus' : 'NPC del Campus'}
          </p>
        </div>
        <button type="button" onClick={onClose}
          className="shrink-0 text-lg leading-none transition"
          style={{ color: 'rgba(255,255,255,0.3)' }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.8)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.3)')}>
          ✕
        </button>
      </div>

      {/* Dialogue */}
      <p className="px-4 py-3 text-sm italic leading-relaxed"
        style={{ color: '#d4b483', borderBottom: '1px solid rgba(245,158,11,0.18)' }}>
        "{line}"
      </p>

      {/* Actions */}
      <div className="flex flex-col gap-2 p-3">
        {cfg.shopAction && (
          <button
            type="button"
            onClick={() => { navigate('/tienda'); onClose() }}
            className="w-full rounded-xl py-2.5 text-sm font-bold transition active:scale-95"
            style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#1a0a00' }}
          >
            🛒 Ver tienda
          </button>
        )}
        <button
          type="button"
          onClick={() => { onChat(); onClose() }}
          className="w-full rounded-xl py-2 text-xs font-bold transition active:scale-95"
          style={{ background: 'rgba(124,58,237,0.18)', border: '1px solid rgba(124,58,237,0.4)', color: '#c4b5fd' }}
        >
          💬 Iniciar chat
        </button>
        <button type="button" onClick={onClose}
          className="w-full rounded-xl py-1.5 text-xs font-semibold transition"
          style={{ color: 'rgba(255,255,255,0.3)' }}>
          Cerrar
        </button>
      </div>
    </div>
  )
}

// ── Giant presentation screen ─────────────────────────────────────────────────
// A large billboard near the Grand Hall north road. Right-clicking it (or
// clicking the on-screen prompt) opens a full-screen video modal.
// The PRESENTATION_VIDEO_URL can be changed in one place below.
const PRESENTATION_VIDEO_URL = 'https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1'

function CampusVideoScreen({ onOpen }) {
  const meshRef  = useRef()
  const glowRef  = useRef()

  useFrame((_, delta) => {
    if (glowRef.current) {
      glowRef.current.material.emissiveIntensity =
        0.35 + Math.abs(Math.sin(Date.now() * 0.0015)) * 0.2
    }
  })

  return (
    // Positioned north of the plaza, in front of the Grand Hall avenue tree-line
    <group position={[0, 0, -28]} rotation={[0, 0, 0]}>
      {/* Frame posts */}
      {[-7.2, 7.2].map((x) => (
        <mesh key={x} position={[x, 4.5, 0]}>
          <cylinderGeometry args={[0.28, 0.35, 9, 8]} />
          <meshStandardMaterial color="#2a2830" />
        </mesh>
      ))}
      {/* Crossbar */}
      <mesh position={[0, 9.2, 0]}>
        <boxGeometry args={[15.2, 0.45, 0.45]} />
        <meshStandardMaterial color="#2a2830" />
      </mesh>
      {/* Screen backing */}
      <mesh position={[0, 5.5, -0.12]}>
        <boxGeometry args={[14.2, 8.2, 0.18]} />
        <meshStandardMaterial color="#0a0a14" />
      </mesh>
      {/* Glowing screen face */}
      <mesh ref={glowRef} position={[0, 5.5, 0]}>
        <planeGeometry args={[13.5, 7.5]} />
        <meshStandardMaterial
          color="#1a1a3a"
          emissive="#2244aa"
          emissiveIntensity={0.45}
        />
      </mesh>
      {/* Clickable Html overlay */}
      <Html position={[0, 5.5, 0.02]} center distanceFactor={18}>
        <div
          className="flex flex-col items-center justify-center gap-2 cursor-pointer"
          style={{ width: '340px', height: '190px' }}
          onClick={onOpen}
          onContextMenu={(e) => { e.preventDefault(); onOpen() }}
        >
          <span className="text-5xl">▶️</span>
          <p className="text-white font-black text-sm drop-shadow">Video de presentación</p>
          <p className="text-white/60 text-[10px]">Clic para ver</p>
        </div>
      </Html>
      {/* Label */}
      <Html position={[0, 10.0, 0]} center distanceFactor={18}>
        <div className="pointer-events-none whitespace-nowrap rounded-full bg-surface/90 px-3 py-1 text-xs font-semibold text-text shadow-lg">
          🎬 Pantalla del Campus
        </div>
      </Html>
    </group>
  )
}

// Full-screen video modal opened from the campus screen or its right-click menu.
function VideoScreenModal({ onClose }) {
  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/85 backdrop-blur-sm"
      onClick={onClose}>
      <div className="relative w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}>
        <button type="button" onClick={onClose}
          className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white text-lg hover:bg-black/80">
          ✕
        </button>
        <div className="aspect-video w-full">
          <iframe
            src={PRESENTATION_VIDEO_URL}
            className="h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title="Video de presentación"
          />
        </div>
      </div>
    </div>
  )
}

// Picks the test ground or the real city model (USE_TEST_SCENERY), then adds
// the player, NPCs, remote players, and the portal to the player's Room.
// When roomMode/anfiteatroMode/worldTreeMode=true, renders the respective world.
function World({
  mascot,
  skin,
  keysRef,
  cameraRef,
  playerPositionRef,
  playerRotationRef,
  remoteTransformsRef,
  remoteActionsRef,
  onNearbyNpcChange,
  onNearPortalChange,
  onNearClassNodeChange,
  onNearDailyRewardChange,
  onNearComputerChange,
  attackFiredAtRef,
  playerClass,
  onOpenVideoScreen,
  authorName,
  playerId,
  onSelectPlayer,
  roomMode,
  anfiteatroMode,
  worldTreeMode,
  graffitiMode,
}) {
  if (graffitiMode) {
    return (
      <GraffitiWorld
        mascot={mascot}
        skin={skin}
        keysRef={keysRef}
        cameraRef={cameraRef}
        playerPositionRef={playerPositionRef}
        playerRotationRef={playerRotationRef}
        authorName={authorName}
        playerId={playerId}
        onNearPortalChange={onNearPortalChange}
      />
    )
  }

  if (worldTreeMode) {
    return (
      <WorldTreeWorld
        mascot={mascot}
        skin={skin}
        keysRef={keysRef}
        cameraRef={cameraRef}
        playerPositionRef={playerPositionRef}
        playerRotationRef={playerRotationRef}
        authorName={authorName}
        playerId={playerId}
        onNearPortalChange={onNearPortalChange}
        onNearClassNodeChange={onNearClassNodeChange}
      />
    )
  }

  if (anfiteatroMode) {
    return (
      <AnfiteatroWorld
        mascot={mascot}
        skin={skin}
        keysRef={keysRef}
        cameraRef={cameraRef}
        playerPositionRef={playerPositionRef}
        playerRotationRef={playerRotationRef}
        authorName={authorName}
        playerId={playerId}
        onNearPortalChange={onNearPortalChange}
      />
    )
  }

  if (roomMode) {
    return (
      <RoomWorld
        mascot={mascot}
        skin={skin}
        keysRef={keysRef}
        cameraRef={cameraRef}
        playerPositionRef={playerPositionRef}
        playerRotationRef={playerRotationRef}
        authorName={authorName}
        playerId={playerId}
        onNearPortalChange={onNearPortalChange}
      />
    )
  }

  const WorldGround = USE_CAMPUS_GLB ? CampusGlbWorld : (USE_TEST_SCENERY ? TestWorld : CityWorld)

  return (
    <>
      <WorldGround
        mascot={mascot}
        skin={skin}
        keysRef={keysRef}
        cameraRef={cameraRef}
        playerPositionRef={playerPositionRef}
        playerRotationRef={playerRotationRef}
        authorName={authorName}
        playerId={playerId}
      />
      <IdleNpc config={OLIVER_NPC}    playerPositionRef={playerPositionRef} />
      <IdleNpc config={EINSTEIN_NPC} playerPositionRef={playerPositionRef} />
      <IdleNpc config={JAFET_NPC}    playerPositionRef={playerPositionRef} />
      <CampusVideoScreen onOpen={onOpenVideoScreen} />
      <DailyRewardBox playerPositionRef={playerPositionRef} onNearChange={onNearDailyRewardChange} />
      <ComputerTerminal playerPositionRef={playerPositionRef} onNearChange={onNearComputerChange} />
      <LocalAttackBurst
        playerPositionRef={playerPositionRef}
        playerRotationRef={playerRotationRef}
        firedAtRef={attackFiredAtRef}
        color={PLAYER_CLASSES[playerClass]?.color ?? '#e5e7eb'}
      />
      <RemotePlayers transformsRef={remoteTransformsRef} actionsRef={remoteActionsRef} onSelectPlayer={onSelectPlayer} />
      <NpcProximityTracker playerPositionRef={playerPositionRef} onNearbyChange={onNearbyNpcChange} />
    </>
  )
}

// WoW-style NPC dialogue card for mission NPCs (right-click / E key).
function NpcMissionCard({ npcId, accepted, claimed, missionState, onAccept, onClaim, onClose, onBattle }) {
  const npc = getVrNpcById(npcId)
  const mission = npc && getGlobalMissionById(npc.missionId)
  if (!npc) return null

  const isAccepted  = mission ? accepted.includes(mission.id) : false
  const isClaimed   = mission ? claimed.includes(mission.id)  : false
  const isCompleted = mission ? mission.check(missionState)   : false

  return (
    <div
      className="absolute bottom-24 left-1/2 z-30 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 overflow-hidden rounded-2xl shadow-2xl sm:bottom-20"
      style={{ background: 'linear-gradient(160deg, #1a0f2e 0%, #0c0814 100%)', border: '1px solid rgba(124,58,237,0.45)' }}
    >
      {/* NPC portrait row */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-3"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl text-4xl"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }}>
          {npc.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-black truncate" style={{ color: '#fcd34d' }}>{npc.name}</p>
          {npc.battle && (
            <span className="rounded px-1.5 py-0.5 text-[10px] font-bold"
              style={{ background: 'rgba(239,68,68,0.2)', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)' }}>
              ⚔️ Nv.{npc.battleStats?.level}
            </span>
          )}
          {!npc.battle && (
            <p className="text-[10px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.3)' }}>NPC Misiones</p>
          )}
        </div>
        <button type="button" onClick={onClose}
          className="shrink-0 text-lg leading-none transition"
          style={{ color: 'rgba(255,255,255,0.3)' }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.8)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.3)')}>
          ✕
        </button>
      </div>

      {/* Dialogue */}
      <p className="px-4 py-3 text-sm italic leading-relaxed"
        style={{ color: '#d4b483', borderBottom: '1px solid rgba(245,158,11,0.18)' }}>
        "{npc.dialogue}"
      </p>

      {/* Mission section */}
      {mission && (
        <div className="p-4">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-widest"
            style={{ color: 'rgba(255,255,255,0.35)' }}>📜 Misiones disponibles</p>
          <div className="rounded-xl p-3"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            {/* Mission title + icon */}
            <div className="flex items-start gap-2.5 mb-2">
              <span className="text-2xl shrink-0">{mission.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-white text-sm">{mission.title}</p>
                {mission.description && (
                  <p className="text-xs leading-relaxed mt-0.5" style={{ color: 'rgba(255,255,255,0.5)' }}>
                    {mission.description}
                  </p>
                )}
              </div>
            </div>
            {/* Rewards row */}
            <div className="flex items-center gap-4 text-xs mt-2 mb-3">
              <span style={{ color: '#fbbf24' }}>🪙 {formatCurrency(mission.reward)}</span>
              {mission.xpReward && <span style={{ color: '#a78bfa' }}>✨ {mission.xpReward} XP</span>}
            </div>
            {/* Action button */}
            {!isAccepted && (
              <button type="button" onClick={() => onAccept(mission.id)}
                className="w-full rounded-lg py-2 text-sm font-bold text-white transition active:scale-95"
                style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}>
                📜 Aceptar misión
              </button>
            )}
            {isAccepted && !isCompleted && (
              <p className="text-center text-xs py-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
                🕓 Misión en progreso…
              </p>
            )}
            {isAccepted && isCompleted && !isClaimed && (
              <button type="button" onClick={() => onClaim(mission.id)}
                className="w-full rounded-lg py-2 text-sm font-bold text-white transition active:scale-95"
                style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
                🎁 Reclamar recompensa
              </button>
            )}
            {isClaimed && (
              <p className="text-center text-xs font-bold py-1" style={{ color: '#4ade80' }}>
                ✅ Misión completada
              </p>
            )}
          </div>
        </div>
      )}

      {/* Battle option */}
      {npc.battle && (
        <div className="px-4 pb-4">
          <button type="button" onClick={() => { onBattle(npc); onClose() }}
            className="w-full rounded-xl py-2 text-sm font-bold transition active:scale-95"
            style={{ border: '1px solid rgba(239,68,68,0.4)', color: '#f87171' }}>
            ⚔️ ¡Desafiar a duelo!
          </button>
        </div>
      )}

      {/* Close without mission */}
      {!mission && !npc.battle && (
        <div className="px-4 pb-4">
          <button type="button" onClick={onClose}
            className="w-full rounded-xl py-2 text-xs font-semibold transition"
            style={{ color: 'rgba(255,255,255,0.3)' }}>
            Cerrar
          </button>
        </div>
      )}
    </div>
  )
}

// Small card shown when the player clicks another player's name tag in the
// world: lets them whisper that player or add/remove them as a friend
// (friends then show up in the Amigos tab of MascotCompanion).
function PlayerMenu({ player, isFriend, onWhisper, onToggleFriend, onClose }) {
  if (!player) return null

  return (
    <div className="absolute bottom-24 left-1/2 w-[calc(100%-2rem)] max-w-xs -translate-x-1/2 rounded-2xl border border-border bg-surface/95 p-4 text-sm text-text shadow-xl backdrop-blur sm:bottom-20">
      <div className="flex items-start justify-between gap-2">
        <p className="font-bold">👤 {player.name}</p>
        <button type="button" onClick={onClose} className="text-text-muted hover:text-text" aria-label="Cerrar">
          ✕
        </button>
      </div>
      <div className="mt-3 flex flex-col gap-2">
        <button
          type="button"
          onClick={onWhisper}
          className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-background transition-colors hover:bg-primary-hover"
        >
          🔒 Susurrar
        </button>
        <button
          type="button"
          onClick={onToggleFriend}
          className="w-full rounded-lg border border-border px-4 py-2 text-sm font-semibold text-text transition-colors hover:border-primary hover:text-primary"
        >
          {isFriend ? '✖️ Quitar amigo' : '➕ Agregar amigo'}
        </button>
      </div>
    </div>
  )
}


// Full-screen transport picker: 4 world cards (2 available, 2 locked future
// destinations). Opened by clicking/pressing E at the campus portal.
const TRANSPORT_WORLDS = [
  { id: 'campus',     emoji: '🏫', name: 'Campus Principal', desc: 'El mundo universitario',     available: true,  path: '/vr' },
  { id: 'room',       emoji: '🏠', name: 'Mi Room',           desc: 'Tu espacio privado',         available: true,  path: '/vr/room' },
  { id: 'anfiteatro', emoji: '🎭', name: 'Anfiteatro',        desc: 'Teatro con pantalla en vivo', available: true,  path: '/vr/anfiteatro' },
  { id: 'ciudad',     emoji: '🌆', name: 'Ciudad',            desc: 'Próximamente…',              available: false, path: null },
]

function TransportMenu({ onNavigate, onClose }) {
  return (
    <div
      className="absolute inset-0 z-40 flex items-center justify-center bg-background/75 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm rounded-2xl border border-border bg-surface p-6 shadow-2xl mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <p className="text-sm font-bold text-text">🌀 Portal de Transporte</p>
          <button
            type="button"
            onClick={onClose}
            className="text-text-muted hover:text-text"
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {TRANSPORT_WORLDS.map((w) => (
            <button
              key={w.id}
              type="button"
              disabled={!w.available}
              onClick={() => w.available && onNavigate(w.path)}
              className={[
                'flex flex-col items-center gap-1.5 rounded-xl border p-4 text-center transition-colors',
                w.available
                  ? 'cursor-pointer border-border bg-background hover:bg-surface-hover'
                  : 'cursor-not-allowed border-border/40 bg-background/40 opacity-50',
              ].join(' ')}
            >
              <span className="text-3xl">{w.emoji}</span>
              <span className="text-xs font-semibold text-text">{w.name}</span>
              <span className="text-xs text-text-muted">{w.desc}</span>
              {!w.available && (
                <span className="mt-0.5 rounded-full bg-border/50 px-2 py-0.5 text-[10px] text-text-muted">🔒 Bloqueado</span>
              )}
            </button>
          ))}
        </div>

        <p className="mt-4 text-center text-xs text-text-muted">
          Pulsa <kbd className="rounded bg-border px-1 py-0.5 font-mono text-[10px]">Esc</kbd> o haz clic fuera para cerrar
        </p>
      </div>
    </div>
  )
}

// Top-down overview of the campus: the plaza, every NPC's zone, and a live
// marker for the player's position. Opened/closed with the M key.
function WorldMap({ open, onClose, playerPositionRef }) {
  const playerMarkerRef = useRef(null)

  useEffect(() => {
    if (!open) return
    let raf
    const update = () => {
      const pos = playerPositionRef.current
      if (pos && playerMarkerRef.current) {
        playerMarkerRef.current.setAttribute('cx', pos.x.toFixed(2))
        playerMarkerRef.current.setAttribute('cy', pos.z.toFixed(2))
      }
      raf = requestAnimationFrame(update)
    }
    raf = requestAnimationFrame(update)
    return () => cancelAnimationFrame(raf)
  }, [open, playerPositionRef])

  if (!open) return null

  return (
    <div
      className="absolute inset-0 z-30 flex items-center justify-center bg-background/80 backdrop-blur-sm"
      onClick={onClose}
      onContextMenu={(e) => e.preventDefault()}
    >
      <div
        className="relative rounded-2xl border border-border bg-surface p-4 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-2 flex items-center justify-between gap-6">
          <p className="text-sm font-bold text-text">🗺️ Mapa del campus</p>
          <button type="button" onClick={onClose} className="text-text-muted hover:text-text" aria-label="Cerrar mapa">
            ✕
          </button>
        </div>
        <svg
          viewBox={`-${GROUND_RADIUS + 5} -${GROUND_RADIUS + 5} ${(GROUND_RADIUS + 5) * 2} ${(GROUND_RADIUS + 5) * 2}`}
          className="h-[66vh] w-[66vh] max-w-[90vw]"
        >
          {/* Summer grass ground */}
          <circle cx="0" cy="0" r={GROUND_RADIUS} fill="#4a8a3a" />
          <circle cx="0" cy="0" r="58" fill="#5ea848" opacity="0.4" />

          {/* Surrounding forest belt, thinned around the functional zones */}
          <circle cx="-90" cy="-60" r="30" fill="#2d6a22" opacity="0.6" />
          <circle cx="90" cy="-60" r="30" fill="#2d6a22" opacity="0.6" />
          <circle cx="-90" cy="60" r="22" fill="#2d6a22" opacity="0.55" />
          <circle cx="90" cy="60" r="22" fill="#2d6a22" opacity="0.55" />

          {/* Ring roads (paved stone) */}
          <circle cx="0" cy="0" r="23.5" fill="none" stroke="#a8a090" strokeWidth="3" opacity="0.8" />
          <circle cx="0" cy="0" r="47" fill="none" stroke="#a0988a" strokeWidth="3.5" opacity="0.75" />
          <circle cx="0" cy="0" r="74" fill="none" stroke="#a0988a" strokeWidth="2.5" opacity="0.7" />
          <circle cx="0" cy="0" r="104" fill="none" stroke="#a0988a" strokeWidth="2" opacity="0.6" />

          {/* Cardinal avenues */}
          {[0, 90, 180, 270].map((deg) => {
            const rad = (deg * Math.PI) / 180
            return (
              <line
                key={deg}
                x1={Math.sin(rad) * 9} y1={Math.cos(rad) * 9}
                x2={Math.sin(rad) * (GROUND_RADIUS - 2)} y2={Math.cos(rad) * (GROUND_RADIUS - 2)}
                stroke="#c8bc9c" strokeWidth="6.5" opacity="0.65"
              />
            )
          })}

          {/* Central plaza (octagonal stone) */}
          <polygon points={
            Array.from({ length: 8 }, (_, i) => {
              const a = (i / 8) * Math.PI * 2
              return `${Math.cos(a) * 9},${Math.sin(a) * 9}`
            }).join(' ')
          } fill="#d0c8b8" />
          {/* Maple leaf monument */}
          <circle cx="-7" cy="0" r="2.0" fill="#d52b1e" opacity="0.9" />
          <text x="-7" y="0.5" fontSize="3.5" textAnchor="middle" dominantBaseline="middle">🍁</text>
          {/* Fountain */}
          <circle cx="7" cy="0" r="2.2" fill="#2888cc" opacity="0.9" />

          {/* Academic buildings */}
          {CAMPUS_ACADEMIC.map(({ pos, color, w, d, name, label }) => {
            const [bx, , bz] = pos
            return (
              <g key={name}>
                <rect x={bx - w / 2} y={bz - d / 2} width={w} height={d} fill={color} opacity="0.82" rx="0.8" />
                <rect x={bx - w / 2} y={bz - d / 2} width={w} height={d} fill="none" stroke="#d52b1e" strokeWidth="0.6" opacity="0.5" rx="0.8" />
                <text x={bx} y={bz + 0.6} fontSize="4.5" textAnchor="middle" dominantBaseline="middle">{label}</text>
                <text x={bx} y={bz + d / 2 + 3.5} fontSize="2.2" textAnchor="middle" fill="#f0ece0" opacity="0.95">{name}</text>
              </g>
            )
          })}

          {/* Dormitory blocks */}
          {CAMPUS_DORMS.map(({ pos, color }, i) => {
            const [bx, , bz] = pos
            return (
              <g key={i}>
                <rect x={bx - 3.5} y={bz - 6} width={7} height={12} fill={color} opacity="0.70" rx="0.4" />
                <rect x={bx - 3.5} y={bz - 6} width={7} height={1.5} fill="#d52b1e" opacity="0.45" rx="0.3" />
              </g>
            )
          })}

          {/* Oliver + Einstein (idle NPCs near plaza) */}
          {[
            { npc: { id: 'oliver', position: [4, 0, 4], emoji: '🐾', color: '#fde68a' }, },
            { npc: { id: 'einstein', position: [-4, 0, -4], emoji: '🧙', color: '#c7d2fe' }, },
          ].map(({ npc }) => {
            const [x, , z] = npc.position
            return (
              <g key={npc.id}>
                <circle cx={x} cy={z} r="1.4" fill={npc.color} opacity="0.9" stroke="#fff" strokeWidth="0.35" />
                <text x={x} y={z - 2.4} fontSize="2.8" textAnchor="middle">{npc.emoji}</text>
              </g>
            )
          })}

          {/* Anfiteatro portal marker — south-east of plaza */}
          <g>
            <rect x="14" y="-10" width="16" height="20" fill="#7c2d8a" opacity="0.8" rx="1" />
            <rect x="14" y="-10" width="16" height="20" fill="none" stroke="#d946ef" strokeWidth="0.6" opacity="0.7" rx="1" />
            <text x="22" y="2" fontSize="5" textAnchor="middle" dominantBaseline="middle">🎭</text>
            <text x="22" y="14" fontSize="2.1" textAnchor="middle" fill="#f5d0fe" opacity="0.95">Anfiteatro</text>
            <circle cx="5" cy="0" r="2.2" fill="#d946ef" opacity="0.85" />
            <text x="5" y="-3.4" fontSize="3" textAnchor="middle">🌀</text>
          </g>

          {/* Perimeter stone fence */}
          <circle cx="0" cy="0" r={GROUND_RADIUS - 0.5} fill="none" stroke="#beb8a8" strokeWidth="1.8" opacity="0.70" strokeDasharray="4 2.5" />

          {/* Stone gate posts with red caps */}
          {[0, Math.PI / 2, Math.PI, Math.PI * 3 / 2].map((a, i) => (
            <g key={i}>
              <circle cx={Math.sin(a) * GROUND_RADIUS} cy={Math.cos(a) * GROUND_RADIUS} r="2.8" fill="#beb8a8" opacity="0.85" />
              <circle cx={Math.sin(a) * GROUND_RADIUS} cy={Math.cos(a) * GROUND_RADIUS} r="1.2" fill="#d52b1e" opacity="0.9" />
              <text x={Math.sin(a) * (GROUND_RADIUS - 6)} y={Math.cos(a) * (GROUND_RADIUS - 6)} fontSize="3.5" textAnchor="middle" dominantBaseline="middle">🍁</text>
            </g>
          ))}

          {/* Player position marker (live) */}
          <circle ref={playerMarkerRef} cx="0" cy="0" r="2.2" fill="#e74c3c" stroke="#fff" strokeWidth="0.55" />
        </svg>
        <p className="mt-2 text-center text-xs text-text-muted">
          Pulsa <strong>M</strong> para cerrar el mapa
        </p>
      </div>
    </div>
  )
}

// Renders one chat line, styled differently for system (WoW-style admin
// MOTD), whispers (sent or received) and regular global messages.
function ChatLine({ message }) {
  if (message.system) {
    return (
      <p className="text-amber-400">
        <span className="font-semibold">🛡️ {message.author}:</span> {message.text}
      </p>
    )
  }
  if (message.whisperFrom) {
    return (
      <p className="italic text-fuchsia-400">
        <span className="font-semibold">🔒 Susurro de {message.whisperFrom}:</span> {message.text}
      </p>
    )
  }
  if (message.whisperTo) {
    return (
      <p className="italic text-fuchsia-400">
        <span className="font-semibold">🔒 Susurro a {message.whisperTo}:</span> {message.text}
      </p>
    )
  }
  return (
    <p className="text-text">
      <span className="font-semibold">{message.author}:</span> {message.text}
    </p>
  )
}

// Local "world chat" the player can type into, independent from the per-NPC
// AI chats. The message log is always visible (Habbo-style global chat);
// C opens the input box, Escape (or sending a message) closes it again.
// Messages broadcast over Realtime via useVrMultiplayer (see onSend).
// Supports whispers via "/w <nombre> <mensaje>".
function MicButton({ onTranscript }) {
  const [listening, setListening] = useState(false)
  const recogRef = useRef(null)
  const hasApi = typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)
  if (!hasApi) return null

  const toggle = () => {
    if (listening) {
      recogRef.current?.stop()
      setListening(false)
      return
    }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    const r = new SR()
    r.lang = 'es-ES'
    r.continuous = false
    r.interimResults = false
    r.onresult = (e) => {
      const t = Array.from(e.results).map(res => res[0].transcript).join(' ')
      onTranscript(t)
    }
    r.onend = () => setListening(false)
    r.onerror = () => setListening(false)
    r.start()
    recogRef.current = r
    setListening(true)
  }

  return (
    <button
      type="button"
      onClick={toggle}
      title={listening ? 'Detener micrófono' : 'Hablar (mic)'}
      className={`rounded-lg px-2 py-1.5 text-base transition-all ${
        listening
          ? 'bg-red-500/20 text-red-400 ring-1 ring-red-400 animate-pulse'
          : 'text-text-muted hover:text-text'
      }`}
    >
      {listening ? '🔴' : '🎤'}
    </button>
  )
}

function WorldChat({ open, onClose, onOpen, authorName, playerId, onSend, prefill }) {
  const messages = useWorldChatStore((s) => s.messages)
  const sendMessage = useWorldChatStore((s) => s.sendMessage)
  const addSystemMessage = useWorldChatStore((s) => s.addSystemMessage)
  const players = useVrPresenceStore((s) => s.players)
  // Same voice-permission gate as <VoicePanel> — admins respect their own
  // mute toggle, granted players just need profiles.voice_enabled.
  const isAdminForVoice = useAuthStore((s) => s.isAdmin())
  const grantedVoice = useAuthStore((s) => s.canUseVoice())
  const myVoiceEnabled = useVoiceStore((s) => s.myVoiceEnabled)
  const canUseVoice = isAdminForVoice ? myVoiceEnabled : grantedVoice
  const isTouch = useIsTouchDevice()
  const [text, setText] = useState('')
  const [tab, setTab] = useState('general')
  const inputRef = useRef(null)
  const lastSeenWhisperIdRef = useRef(null)
  const [hasUnreadWhisper, setHasUnreadWhisper] = useState(false)
  // Start minimized on touch so it doesn't overlap the joystick/controls
  const [minimized, setMinimized] = useState(
    () => typeof window !== 'undefined' && (window.matchMedia?.('(pointer: coarse)').matches || 'ontouchstart' in window),
  )
  const lastReadLenRef = useRef(0)
  const [unreadCount, setUnreadCount] = useState(0)

  // Track unread messages while minimized
  useEffect(() => {
    if (!minimized) {
      lastReadLenRef.current = messages.length
      setUnreadCount(0)
    } else {
      const n = messages.length - lastReadLenRef.current
      if (n > 0) setUnreadCount(n)
    }
  }, [messages.length, minimized])

  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  // Pre-fills "/w <nombre> " when the chat is opened from the "Susurrar"
  // option (selecting a player in the world, or the Amigos tab).
  useEffect(() => {
    if (!prefill) return
    setText(prefill.text)
    setTab('whispers')
    inputRef.current?.focus()
  }, [prefill])

  // General chat (everyone) vs. private whispers (sent/received), shown in
  // separate tabs — WoW-style — so whispers don't get lost in global chat.
  const generalMessages = useMemo(
    () => messages.filter((m) => !m.whisperFrom && !m.whisperTo),
    [messages],
  )
  const whisperMessages = useMemo(
    () => messages.filter((m) => m.whisperFrom || m.whisperTo),
    [messages],
  )

  // Flag the "Susurros" tab with a dot when a new whisper arrives while
  // the player is looking at the general tab.
  useEffect(() => {
    const last = whisperMessages[whisperMessages.length - 1]
    if (!last) return
    if (tab === 'whispers') {
      lastSeenWhisperIdRef.current = last.id
      setHasUnreadWhisper(false)
      return
    }
    if (last.id !== lastSeenWhisperIdRef.current && last.whisperFrom) {
      setHasUnreadWhisper(true)
    }
  }, [whisperMessages, tab])

  const handleSubmit = (e) => {
    e.preventDefault()
    const trimmed = text.trim()
    if (trimmed) {
      // "/w <nombre> <mensaje>" (also "/susurro", "/whisper") sends a
      // whisper instead of a global message — only the named player (and
      // the sender) will see it.
      const whisperMatch = trimmed.match(/^\/(?:w|susurro|whisper)\s+(\S+)\s+([\s\S]+)/i)
      if (whisperMatch) {
        const [, targetName, body] = whisperMatch
        const targetEntry = Object.entries(players).find(
          ([, p]) => (p?.name || '').toLowerCase() === targetName.toLowerCase(),
        )
        if (targetEntry) {
          const [targetId] = targetEntry
          sendMessage(authorName, body, { authorId: playerId, whisperTo: targetName })
          onSend?.(authorName, body, targetId)
          setTab('whispers')
        } else {
          addSystemMessage(`No se encontró a "${targetName}" en el mundo.`)
        }
      } else {
        sendMessage(authorName, trimmed, { authorId: playerId })
        onSend?.(authorName, trimmed)
      }
      setText('')
    }
    onClose()
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      e.preventDefault()
      setText('')
      onClose()
    }
  }

  const visibleMessages = tab === 'whispers' ? whisperMessages : generalMessages

  // Minimized: float as a small pill bubble so touch controls have room
  if (minimized) {
    return (
      <button
        type="button"
        onClick={() => setMinimized(false)}
        className={[
          'absolute z-20 flex items-center gap-2 rounded-full border border-border bg-surface/90 px-3 py-2 text-sm text-text shadow-xl backdrop-blur transition-colors hover:bg-surface',
          isTouch ? 'bottom-[148px] left-5' : 'bottom-20 left-4',
        ].join(' ')}
      >
        <span>💬</span>
        {unreadCount > 0 && (
          <span className="min-w-[18px] rounded-full bg-primary px-1 text-center text-xs font-bold text-background">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
        <span className="text-xs text-text-muted">Chat</span>
        {hasUnreadWhisper && (
          <span className="h-2 w-2 rounded-full bg-fuchsia-400" />
        )}
      </button>
    )
  }

  // Expanded panel — wider + above controls on mobile, fixed left on desktop
  return (
    <div
      className={[
        'absolute z-20 rounded-xl border border-border bg-surface/90 p-3 text-sm shadow-xl backdrop-blur',
        isTouch
          ? 'bottom-[148px] left-4 right-4'
          : 'bottom-20 left-4 w-72 max-w-[calc(100%-2rem)] sm:bottom-24',
      ].join(' ')}
    >
      <div className="mb-2 flex items-center gap-1 text-xs">
        <button
          type="button"
          onClick={() => setTab('general')}
          className={`flex-1 rounded-lg px-2 py-1 font-semibold transition-colors ${
            tab === 'general' ? 'bg-primary text-background' : 'text-text-muted hover:text-text'
          }`}
        >
          General
        </button>
        <button
          type="button"
          onClick={() => setTab('whispers')}
          className={`relative flex-1 rounded-lg px-2 py-1 font-semibold transition-colors ${
            tab === 'whispers' ? 'bg-primary text-background' : 'text-text-muted hover:text-text'
          }`}
        >
          Susurros
          {hasUnreadWhisper && (
            <span className="absolute right-2 top-1 h-2 w-2 rounded-full bg-fuchsia-400" />
          )}
        </button>
        {/* Minimize button */}
        <button
          type="button"
          onClick={() => setMinimized(true)}
          className="ml-1 rounded-lg px-2 py-1 text-base leading-none text-text-muted hover:text-text"
          aria-label="Minimizar chat"
          title="Minimizar chat"
        >
          —
        </button>
      </div>
      <div className="mb-2 flex max-h-40 flex-col gap-1 overflow-y-auto text-xs">
        {visibleMessages.length > 0 ? (
          visibleMessages.slice(-12).map((m) => <ChatLine key={m.id} message={m} />)
        ) : (
          <p className="text-text-muted">
            {tab === 'whispers' ? 'Tus susurros aparecerán aquí.' : 'El chat global aparecerá aquí.'}
          </p>
        )}
      </div>
      {open ? (
        <form onSubmit={handleSubmit} className="flex gap-1">
          <input
            ref={inputRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Mensaje global, o /w nombre mensaje para susurrar…"
            className="flex-1 rounded-lg border border-border bg-background px-2 py-1.5 text-sm text-text outline-none focus:border-primary"
          />
          {canUseVoice && <MicButton onTranscript={(t) => setText(prev => prev ? prev + ' ' + t : t)} />}
          <button
            type="submit"
            className="rounded-lg bg-primary px-3 py-1.5 text-sm font-semibold text-background transition-colors hover:bg-primary-hover"
          >
            Enviar
          </button>
        </form>
      ) : (
        <button
          type="button"
          onClick={onOpen}
          className="w-full rounded-lg border border-dashed border-border px-2 py-1.5 text-left text-xs text-text-muted hover:border-primary hover:text-text"
        >
          {isTouch ? 'Toca aquí para chatear…' : 'Pulsa C o toca aquí para chatear…'}
        </button>
      )}
    </div>
  )
}

// ── Class Preview Card — shown when player nears a class node in WorldTree ─────
function ClassPreviewCard({ classId, step, playerClass, oliverClass, isAdmin, onSelectPlayer, onSelectOliver, onClose }) {
  const cls = PLAYER_CLASSES[classId]
  // The Hacker node is admin-exclusive — for everyone else it's as if the
  // node weren't there at all (no preview, no "Elegir").
  if (!cls || (classId === 'hacker' && !isAdmin)) return null

  const statEntries = Object.entries(cls.stats)
  const maxStat = 5

  // In 'oliver' step, show Oliver companion class options (all 5)
  if (step === 'oliver') {
    return (
      <div className="absolute bottom-20 left-1/2 z-30 w-80 -translate-x-1/2 overflow-hidden rounded-2xl border border-border bg-surface/95 shadow-2xl backdrop-blur sm:w-96">
        <div className="border-b border-border px-4 py-3 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-text-muted">Elige la clase de Oliver</p>
          <p className="mt-0.5 text-sm text-text-muted">Tu clase: <strong style={{ color: cls.color }}>{cls.icon} {cls.name}</strong></p>
        </div>
        <div className="flex flex-col gap-2 p-3">
          {Object.values(OLIVER_CLASSES).map((oc) => (
            <button
              key={oc.id}
              type="button"
              onClick={() => onSelectOliver(oc.id)}
              className="flex items-center gap-3 rounded-xl border border-border p-2.5 text-left transition-colors hover:border-primary hover:bg-primary/5"
              style={{ borderColor: oc.id === OLIVER_CLASSES[Object.keys(OLIVER_CLASSES).find(k => OLIVER_CLASSES[k].pairedWith === classId)]?.id ? `${oc.color}88` : undefined }}
            >
              <span className="text-2xl">{oc.icon}</span>
              <div className="flex-1">
                <p className="text-xs font-bold text-text">{oc.name}</p>
                <p className="mt-0.5 text-[10px] text-text-muted leading-tight">{oc.description}</p>
              </div>
              {oc.pairedWith === classId && (
                <span className="rounded-full bg-primary/20 px-1.5 py-0.5 text-[9px] font-bold text-primary">Sinergia</span>
              )}
            </button>
          ))}
        </div>
      </div>
    )
  }

  // 'player' step
  return (
    <div className="absolute bottom-20 left-1/2 z-30 w-72 -translate-x-1/2 overflow-hidden rounded-2xl border bg-surface/95 shadow-2xl backdrop-blur sm:w-80"
      style={{ borderColor: `${cls.color}66` }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3"
        style={{ background: `linear-gradient(135deg, ${cls.color}22, ${cls.color}08)` }}>
        <span className="text-4xl">{cls.icon}</span>
        <div>
          <p className="text-base font-black text-text">{cls.name}</p>
          <p className="text-xs text-text-muted">{cls.description}</p>
        </div>
        <button type="button" onClick={onClose} className="ml-auto text-text-muted hover:text-text">✕</button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-5 gap-1.5 px-4 py-3">
        {statEntries.map(([stat, val]) => (
          <div key={stat} className="flex flex-col items-center gap-1">
            <div className="flex flex-col-reverse gap-0.5">
              {Array.from({ length: maxStat }).map((_, i) => (
                <div key={i} className="h-2.5 w-3 rounded-sm"
                  style={{ background: i < val ? cls.color : 'rgba(255,255,255,0.08)' }} />
              ))}
            </div>
            <span className="text-[9px] font-bold uppercase text-text-muted">{stat.slice(0, 3)}</span>
          </div>
        ))}
      </div>

      {/* Starting skills */}
      <div className="border-t border-border px-4 py-2">
        <p className="mb-1.5 text-[9px] font-bold uppercase tracking-widest text-text-muted">Habilidades iniciales</p>
        <div className="flex gap-2">
          {cls.startSkills.map((sid) => {
            const skill = SKILL_REGISTRY[sid]
            return skill ? (
              <div key={sid} className="flex items-center gap-1.5 rounded-lg border border-border px-2 py-1.5"
                style={{ borderColor: `${skill.vfxColor}55`, background: `${skill.vfxColor}11` }}>
                <span className="text-lg">{skill.icon}</span>
                <div>
                  <p className="text-[10px] font-bold text-text">{skill.name}</p>
                  <p className="text-[9px] text-text-muted">{skill.description}</p>
                </div>
              </div>
            ) : null
          })}
        </div>
      </div>

      {/* CTA */}
      <div className="px-4 pb-4 pt-2">
        <button
          type="button"
          onClick={() => onSelectPlayer(classId)}
          className="w-full rounded-xl py-2.5 text-sm font-black text-white transition-all hover:scale-105"
          style={{ background: `linear-gradient(135deg, ${cls.color}, ${cls.color}cc)`, boxShadow: `0 4px 16px ${cls.color}44` }}
        >
          Elegir {cls.name}
        </button>
      </div>
    </div>
  )
}

// Character switcher overlay: toggles avatar ↔ mascot and follow/stay mode.
// Needs playerPositionRef to snapshot the position when switching to "stay".
function CharSwitcherHud({ playerPositionRef, hudVisible }) {
  const activeChar = useVrCharacterStore((s) => s.activeChar)
  const companionFollows = useVrCharacterStore((s) => s.companionFollows)
  const toggleChar = useVrCharacterStore((s) => s.toggleChar)
  const setCompanionFollows = useVrCharacterStore((s) => s.setCompanionFollows)
  const setStayPosition = useVrCharacterStore((s) => s.setStayPosition)

  if (!hudVisible) return null

  const handleSwitch = () => {
    toggleChar()
  }

  const handleFollowToggle = () => {
    if (companionFollows) {
      // Switching to Stay — record current player position
      const pos = playerPositionRef?.current
      setStayPosition(pos ?? null)
    } else {
      // Switching to Follow — clear stay position
      setStayPosition(null)
    }
    setCompanionFollows(!companionFollows)
  }

  const charLabel = activeChar === 'avatar' ? '🧑 Avatar' : '🐾 Mascota'
  const companionLabel = activeChar === 'avatar' ? 'Mascota' : 'Avatar'

  return (
    <div className="pointer-events-none absolute bottom-3 left-1/2 z-20 -translate-x-1/2">
      <div className="pointer-events-auto flex items-center gap-2 rounded-full bg-black/65 px-3 py-1.5 shadow-lg backdrop-blur">
        <span className="text-xs font-bold text-white/80">{charLabel}</span>
        <button
          type="button"
          onClick={handleSwitch}
          title="Cambiar personaje (⇄)"
          className="rounded-full bg-white/15 px-2.5 py-0.5 text-sm text-white transition-colors hover:bg-white/30 active:scale-95"
        >
          ⇄
        </button>
        <button
          type="button"
          onClick={handleFollowToggle}
          title={companionFollows ? `${companionLabel} te sigue — clic para dejar quieto` : `${companionLabel} quieto — clic para seguir`}
          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold text-white transition-colors active:scale-95 ${
            companionFollows ? 'bg-emerald-600/50 hover:bg-emerald-600/70' : 'bg-amber-600/50 hover:bg-amber-600/70'
          }`}
        >
          {companionFollows ? `${companionLabel} sigue 🐾` : `${companionLabel} quieto 📌`}
        </button>
      </div>
    </div>
  )
}

// roomMode / anfiteatroMode / worldTreeMode / graffitiMode come from the route.
export default function VRPage({ roomMode = false, anfiteatroMode = false, worldTreeMode = false, graffitiMode = false }) {
  const navigate = useNavigate()
  const keysRef = useMovementKeys()
  const { camera: cameraRef, onPointerDown, onPointerMove, onPointerUp, onWheel } = useCameraControls()
  const selectedMascotId = useMascotStore((s) => s.selectedMascotId)
  const selectedSkinId = useMascotStore((s) => s.selectedSkinId)
  const mascot = getMascotById(selectedMascotId)
  const skin = getSkinById(selectedSkinId)
  const settingsMascotName = useSettingsStore((s) => s.mascotName)
  const profile = useAuthStore((s) => s.profile)
  const session = useAuthStore((s) => s.session)
  const accountName =
    profile?.display_name ||
    session?.user?.user_metadata?.name ||
    session?.user?.user_metadata?.full_name ||
    session?.user?.email?.split('@')[0]
  const chatAuthor = accountName || settingsMascotName || mascot.name

  const playerPositionRef = useRef(null)
  const playerRotationRef = useRef(0)
  const playerId = useRef(crypto.randomUUID()).current
  const motdSentRef = useRef(false)
  const connected = useVrPresenceStore((s) => s.connected)
  const remotePlayerCount = useVrPresenceStore((s) => Object.keys(s.players).length)
  // Room, Anfiteatro, and WorldTree are private — no shared presence channel.
  const isPrivateWorld = roomMode || anfiteatroMode || worldTreeMode || graffitiMode
  const vrAvatarId = useGameStore((s) => s.player.avatarId)
  const { remoteTransformsRef, remoteActionsRef, sendChatMessage, sendAction, kicked, channelRef } = useVrMultiplayer({
    playerId,
    name: chatAuthor,
    mascotId: mascot.id,
    skinId: skin.id,
    avatarId: vrAvatarId,
    accountId: session?.user?.id ?? null,
    positionRef: playerPositionRef,
    rotationRef: playerRotationRef,
    enabled: !isPrivateWorld,
  })
  const [vrReady, setVrReady] = useState(false)
  const [videoScreenOpen, setVideoScreenOpen] = useState(false)
  const [nearClassNodeId, setNearClassNodeId] = useState(null)
  const [classSelectionStep, setClassSelectionStep] = useState('player') // 'player' | 'oliver' | 'done'
  const selectPlayerClass = useGameStore((s) => s.selectPlayerClass)
  const selectOliverClass = useGameStore((s) => s.selectOliverClass)
  const playerClass = useGameStore((s) => s.player.class)
  const oliverClass = useGameStore((s) => s.oliver.class)
  const worldTreeCompleted = useGameStore((s) => s.worldTreeCompleted)
  const startBattle = useCombatStore((s) => s.startBattle)
  const combatActive = useCombatStore((s) => s.active)
  const [nearbyNpcId, setNearbyNpcId] = useState(null)
  const [activeNpcId, setActiveNpcId] = useState(null)
  const [nearPortal, setNearPortal] = useState(false)
  const [nearDailyReward, setNearDailyReward] = useState(false)
  const [nearComputer, setNearComputer] = useState(false)
  const [terminalOpen, setTerminalOpen] = useState(false)
  const attackFiredAtRef = useRef(0)
  const isAdmin = useAuthStore((s) => s.isAdmin())
  const level = useLevelStore((s) => levelForXp(s.xp))
  // Live voice chat (<VoicePanel>) used to be open to everyone — now it's
  // admin-only by default, with the admin's own mute toggle on top, or
  // explicitly granted to a player via profiles.voice_enabled (DevToolsPanel).
  const grantedVoice = useAuthStore((s) => s.canUseVoice())
  const myVoiceEnabled = useVoiceStore((s) => s.myVoiceEnabled)
  const canUseVoice = isAdmin ? myVoiceEnabled : grantedVoice
  const [portalMenuOpen, setPortalMenuOpen] = useState(false)
  const [mapOpen, setMapOpen] = useState(false)
  const [chatOpen, setChatOpen] = useState(false)
  const [hudVisible, setHudVisible] = useState(true)
  const [cameraMenuOpen, setCameraMenuOpen] = useState(false)
  const [dailyRewardsOpen, setDailyRewardsOpen] = useState(false)
  const [bagsOpen, setBagsOpen] = useState(false)
  const [characterPanelOpen, setCharacterPanelOpen] = useState(false)
  // Shown once per VR session entry; closing it auto-opens the daily reward.
  const [showAnnouncements, setShowAnnouncements] = useState(true)
  const [showHint, setShowHint] = useState(() => !localStorage.getItem('vr-hint-seen'))
  const [chatPrefill, setChatPrefill] = useState(null)
  const [selectedPlayer, setSelectedPlayer] = useState(null)
  const friends = useFriendsStore((s) => s.friends)
  const addFriend = useFriendsStore((s) => s.addFriend)
  const removeFriend = useFriendsStore((s) => s.removeFriend)
  const whisperTarget = useWorldChatStore((s) => s.whisperTarget)
  const accepted = useGlobalMissionsStore((s) => s.accepted)
  const claimed = useGlobalMissionsStore((s) => s.claimed)
  const acceptMission = useGlobalMissionsStore((s) => s.acceptMission)
  const claimReward = useGlobalMissionsStore((s) => s.claimReward)
  const missionState = useMissionState()
  const openPanel = useMascotCompanionStore((s) => s.openPanel)
  const flashlightOn = useItemEffectsStore((s) => s.activeItems['linterna'])
  const flashlightPurchased = useShopStore((s) => s.purchased.includes('linterna'))

  // Player TTS — speak every message the local player sends in world chat.
  // Voice pitch/rate differs per active character so avatar and mascota sound distinct.
  const worldMessages = useWorldChatStore((s) => s.messages)
  const lastSpokenMsgRef = useRef(null)
  useEffect(() => {
    if (!worldMessages.length) return
    const last = worldMessages[worldMessages.length - 1]
    if (!last || last.id === lastSpokenMsgRef.current) return
    if (last.authorId !== playerId) return
    if (last.whisperTo) return // don't TTS whispers
    lastSpokenMsgRef.current = last.id
    if (!useVrSettingsStore.getState().npcVoice || !window.speechSynthesis) return
    const clean = last.text.replace(/[\u{1F300}-\u{1FFFF}]/gu, '').replace(/[^\w\s.,!?¿¡]/g, '').trim()
    if (!clean) return
    window.speechSynthesis.cancel()
    const utt = new SpeechSynthesisUtterance(clean)
    const isMascotActive = useVrCharacterStore.getState().activeChar === 'mascot'
    utt.lang = 'es-ES'
    utt.rate = isMascotActive ? 1.15 : 1.0
    utt.pitch = isMascotActive ? 1.45 : 1.0
    window.speechSynthesis.speak(utt)
  }, [worldMessages, playerId])

  useEffect(() => {
    if (nearbyNpcId !== activeNpcId) setActiveNpcId(null)
  }, [nearbyNpcId, activeNpcId])

  useEffect(() => {
    if (motdSentRef.current) return
    motdSentRef.current = true
    const motd = anfiteatroMode
      ? `🎭 Anfiteatro Oliver, ${chatAuthor}. Disfruta el espectáculo. Pulsa E junto al portal para volver al Campus.`
      : roomMode
        ? `Tu Room privada, ${chatAuthor}. Aquí solo apareces tú. Acércate al portal 🌀 y pulsa E para volver al Campus.`
        : `Bienvenido al Campus, ${chatAuthor}. Pulsa C para chatear, P para tu personaje, M para el mapa, o usa /w nombre mensaje para susurrar.`
    useWorldChatStore.getState().addSystemMessage(motd)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Gamepad (Xbox or anything else the browser maps to the standard layout)
  // already drives movement/camera via applyGamepadInput — this just gives
  // visible confirmation it was detected, since pairing a controller is
  // otherwise silent.
  useEffect(() => {
    const announce = (e) => {
      useWorldChatStore.getState().addSystemMessage(`🎮 Mando conectado: ${e.gamepad.id} — ¡listo para jugar!`)
    }
    const announceLost = (e) => {
      useWorldChatStore.getState().addSystemMessage(`🎮 Mando desconectado: ${e.gamepad.id}`)
    }
    window.addEventListener('gamepadconnected', announce)
    window.addEventListener('gamepaddisconnected', announceLost)
    // Some browsers/controllers only ever fire 'gamepadconnected' for pads
    // paired before this listener was added — check once on mount too.
    const already = navigator.getGamepads?.() ?? []
    for (const pad of already) {
      if (pad?.connected) {
        useWorldChatStore.getState().addSystemMessage(`🎮 Mando detectado: ${pad.id} — ¡listo para jugar!`)
        break
      }
    }
    return () => {
      window.removeEventListener('gamepadconnected', announce)
      window.removeEventListener('gamepaddisconnected', announceLost)
    }
  }, [])

  // 'E' near a portal, idle NPC, or daily reward box
  useEffect(() => {
    const handleDown = (e) => {
      if (isTypingTarget(e.target)) return
      if (e.key === 'Escape') { setPortalMenuOpen(false); setActiveNpcId(null); return }
      if (e.key.toLowerCase() === 'f') { useItemEffectsStore.getState().toggleItem('linterna'); return }
      if (e.key.toLowerCase() === 'e') {
        if (nearDailyReward) { setDailyRewardsOpen(true); return }
        if (nearComputer && (playerClass === 'programmer' || isAdmin)) { setTerminalOpen(true); return }
        if (nearbyNpcId) {
          setActiveNpcId((cur) => (cur === nearbyNpcId ? null : nearbyNpcId))
          return
        }
        if (nearPortal) {
          if (isPrivateWorld) navigate('/vr')
          else setPortalMenuOpen(true)
        }
      }
    }
    window.addEventListener('keydown', handleDown)
    return () => window.removeEventListener('keydown', handleDown)
  }, [nearPortal, nearDailyReward, nearComputer, nearbyNpcId, isPrivateWorld, navigate, playerClass, isAdmin])

  useWorldShortcuts({
    onToggleMap: () => setMapOpen((open) => !open),
    onOpenCharacter: () => openPanel('mascota-chat'),
    onOpenInventory: () => openPanel('avatar-personaje'),
    onToggleChat: (value) => setChatOpen((open) => (typeof value === 'boolean' ? value : !open)),
    onAttack: () => {
      attackFiredAtRef.current = Date.now()
      sendAction(playerClass)
    },
    onUseWeapon: () => {
      if (playerClass === 'hacker') {
        setTerminalOpen(true)
      } else {
        useWorldChatStore.getState().addSystemMessage('🔒 Tu arma todavía no tiene una acción asignada (próximamente).')
      }
    },
  })

  // Class is now selected during account creation onboarding — no auto-redirect needed.

  useEffect(() => {
    if (!whisperTarget) return
    setChatPrefill({ text: `/w ${whisperTarget} `, key: Date.now() })
    setChatOpen(true)
    useWorldChatStore.getState().clearWhisperTarget()
  }, [whisperTarget])

  const handleContextMenu = (e) => {
    e.preventDefault()
    if (!nearbyNpcId) return
    setActiveNpcId((current) => (current === nearbyNpcId ? null : nearbyNpcId))
  }

  const openIdleNpcChat = () => {
    setChatPrefill({ text: '', key: Date.now() })
    setChatOpen(true)
  }

  // Auto-dismiss the control hint after 12s, then never show again
  useEffect(() => {
    if (!showHint) return
    const t = setTimeout(() => {
      localStorage.setItem('vr-hint-seen', '1')
      setShowHint(false)
    }, 12000)
    return () => clearTimeout(t)
  }, [showHint])

  // Lighting themes per world mode
  const bgColor = anfiteatroMode ? '#0a0810' : roomMode ? '#3d2a1c' : worldTreeMode ? '#05120a' : graffitiMode ? '#181420' : '#90c8e8'
  const fogArgs = anfiteatroMode ? ['#0a0810', 20, 90] : roomMode ? ['#3d2a1c', 12, 36] : worldTreeMode ? ['#05120a', 35, 100] : graffitiMode ? ['#181420', 18, 60] : ['#d4c8b0', 45, 150]

  return (
    <div className="flex h-dvh flex-col bg-background text-text">
      <AppTopBar />
      {!roomMode && <PageVideoModal pageKey="vr" />}

      <div
        className="relative flex-1"
        style={{ touchAction: 'none' }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
        onWheel={onWheel}
        onContextMenu={handleContextMenu}
      >
        {vrReady && <Canvas
          camera={{ position: [0, 1.6, 3.4], fov: 58 }}
          dpr={[1, 1.5]}
          gl={{ powerPreference: 'high-performance', antialias: true }}
          onCreated={({ gl }) => {
            const canvas = gl.domElement
            canvas.addEventListener('webglcontextlost', (e) => e.preventDefault(), false)
            // Context loss is unrecoverable in Three.js — reload is the only reliable fix
            canvas.addEventListener('webglcontextrestored', () => window.location.reload(), false)
          }}
        >
          <color attach="background" args={[bgColor]} />
          <fog attach="fog" args={fogArgs} />
          <SceneEffects
            bloomIntensity={anfiteatroMode ? 0.5 : roomMode ? 0.4 : worldTreeMode ? 0.35 : graffitiMode ? 0.45 : 0.22}
            vignetteDarkness={0.38}
            multisampling={0}
          />
          {/* Campus: DayNightCycle owns all lighting + streetlamps + sky color */}
          <DayNightCycle campusMode={!anfiteatroMode && !roomMode && !worldTreeMode && !graffitiMode} />
          {flashlightOn && flashlightPurchased && (
            <FlashlightSpot playerPositionRef={playerPositionRef} cameraRef={cameraRef} />
          )}
          {/* Non-campus modes: static lighting (intensity 0 in campus so they don't stack) */}
          <ambientLight
            intensity={anfiteatroMode ? 0.25 : roomMode ? 0.55 : worldTreeMode ? 1.4 : graffitiMode ? 0.5 : 0}
            color={anfiteatroMode ? '#c0a0ff' : roomMode ? '#ffcc88' : worldTreeMode ? '#ccffdd' : graffitiMode ? '#aa88ff' : '#000000'}
          />
          <directionalLight
            position={[20, 30, 10]}
            intensity={anfiteatroMode ? 0.6 : roomMode ? 0.4 : worldTreeMode ? 1.0 : graffitiMode ? 0.5 : 0}
            color={anfiteatroMode ? '#ffffff' : roomMode ? '#ffaa44' : worldTreeMode ? '#ccffe8' : graffitiMode ? '#ffccee' : '#000000'}
          />
          {roomMode && <directionalLight position={[0, 2, -8]} intensity={0.7} color="#ff7722" />}
          {anfiteatroMode && <directionalLight position={[0, ANFI_H - 1, ANFI_STAGE_Z]} intensity={1.2} color="#fff5cc" />}
          {graffitiMode && <pointLight position={[0, 6, -8]} intensity={2.2} color="#ff2fb0" distance={30} />}
          {graffitiMode && <pointLight position={[6, 5, 2]} intensity={1.6} color="#2fdfff" distance={26} />}
          {anfiteatroMode && <pointLight position={[0, ANFI_H * 0.7, 0]} intensity={0.5} color="#9060ff" distance={80} />}
          {worldTreeMode && <hemisphereLight args={['#44ffaa', '#0d2a0a', 1.2]} />}
          {worldTreeMode && <pointLight position={[0, 6, 0]} intensity={6.0} color="#88ffaa" distance={60} decay={1.5} />}
          {worldTreeMode && <pointLight position={[0, 22, 0]} intensity={3.0} color="#44ffaa" distance={80} />}
          {worldTreeMode && <pointLight position={[0, 3, 18]} intensity={2.0} color="#aaffee" distance={35} />}
          {worldTreeMode && <directionalLight position={[0, 8, 20]} intensity={0.8} color="#ccffdd" />}
          <Physics gravity={[0, -20, 0]}>
          <Suspense fallback={null}>
            <World
              mascot={mascot}
              skin={skin}
              keysRef={keysRef}
              cameraRef={cameraRef}
              playerPositionRef={playerPositionRef}
              playerRotationRef={playerRotationRef}
              remoteTransformsRef={remoteTransformsRef}
              remoteActionsRef={remoteActionsRef}
              onNearbyNpcChange={setNearbyNpcId}
              onNearPortalChange={setNearPortal}
              onNearClassNodeChange={setNearClassNodeId}
              onNearDailyRewardChange={setNearDailyReward}
              onNearComputerChange={setNearComputer}
              attackFiredAtRef={attackFiredAtRef}
              playerClass={playerClass}
              onOpenVideoScreen={() => setVideoScreenOpen(true)}
              authorName={chatAuthor}
              playerId={playerId}
              onSelectPlayer={setSelectedPlayer}
              worldTreeMode={worldTreeMode}
              roomMode={roomMode}
              anfiteatroMode={anfiteatroMode}
              graffitiMode={graffitiMode}
            />
            {/* Parked companion mesh when follow mode is off */}
            <StayedCompanion mascot={mascot} skin={skin} avatarId={vrAvatarId} />
          </Suspense>
          </Physics>
        </Canvas>}

        {/* Character switcher — centered above skill bar */}
        <CharSwitcherHud playerPositionRef={playerPositionRef} hudVisible={hudVisible} />

        {/* NPC proximity prompt — any NPC type */}
        {nearbyNpcId && !activeNpcId && (
          <button
            type="button"
            onClick={() => setActiveNpcId(nearbyNpcId)}
            className="absolute bottom-40 left-1/2 -translate-x-1/2 cursor-pointer rounded-full bg-surface/95 px-4 py-1.5 text-xs font-semibold text-text shadow-lg backdrop-blur transition-colors hover:bg-surface sm:bottom-36"
          >
            {(IDLE_NPC_CONFIGS[nearbyNpcId] ?? getVrNpcById(nearbyNpcId))?.emoji}{' '}
            Clic derecho o E para hablar con{' '}
            {(IDLE_NPC_CONFIGS[nearbyNpcId] ?? getVrNpcById(nearbyNpcId))?.name}
          </button>
        )}

        {/* Daily reward box prompt */}
        {nearDailyReward && !dailyRewardsOpen && (
          <button
            type="button"
            onClick={() => setDailyRewardsOpen(true)}
            className="absolute bottom-32 left-1/2 -translate-x-1/2 cursor-pointer rounded-full bg-surface/95 px-4 py-1.5 text-xs font-semibold text-text shadow-lg backdrop-blur transition-colors hover:bg-surface sm:bottom-28"
          >
            🎁 Haz clic o pulsa E para reclamar recompensa diaria
          </button>
        )}

        {/* Computer terminal prompt — only for the Programador class (or admin) */}
        {nearComputer && !terminalOpen && (playerClass === 'programmer' || isAdmin) && (
          <button
            type="button"
            onClick={() => setTerminalOpen(true)}
            className="absolute bottom-32 left-1/2 -translate-x-1/2 cursor-pointer rounded-full bg-surface/95 px-4 py-1.5 text-xs font-semibold text-text shadow-lg backdrop-blur transition-colors hover:bg-surface sm:bottom-28"
          >
            🖥️ Pulsa E para usar la terminal
          </button>
        )}

        {/* Portal prompt — clickable button when near a portal */}
        {nearPortal && !portalMenuOpen && (
          <button
            type="button"
            onClick={() => isPrivateWorld ? navigate('/vr') : setPortalMenuOpen(true)}
            className="absolute bottom-24 left-1/2 -translate-x-1/2 cursor-pointer rounded-full bg-surface/95 px-4 py-1.5 text-xs font-semibold text-text shadow-lg backdrop-blur transition-colors hover:bg-surface sm:bottom-20"
          >
            {isPrivateWorld ? '🌀 Haz clic o pulsa E para volver al Campus' : '🌀 Haz clic o pulsa E para abrir el portal'}
          </button>
        )}

        {/* Transport destination picker — opens when clicking/pressing E at campus portal */}
        {portalMenuOpen && !isPrivateWorld && (
          <TransportMenu onNavigate={(path) => navigate(path)} onClose={() => setPortalMenuOpen(false)} />
        )}

        {/* NPC mission card / nearby-NPC hint (campus only) */}
        {!isPrivateWorld && (
          activeNpcId ? (
            IDLE_NPC_IDS.has(activeNpcId) ? (
              <IdleNpcCard
                npcId={activeNpcId}
                onClose={() => setActiveNpcId(null)}
                onChat={openIdleNpcChat}
              />
            ) : (
              <NpcMissionCard
                npcId={activeNpcId}
                onBattle={(npc) => startBattle(npc)}
                accepted={accepted}
                claimed={claimed}
                missionState={missionState}
                onAccept={acceptMission}
                onClaim={claimReward}
                onClose={() => setActiveNpcId(null)}
              />
            )
          ) : null
        )}

        {/* Presentation video screen modal */}
        {videoScreenOpen && <VideoScreenModal onClose={() => setVideoScreenOpen(false)} />}

        {!isPrivateWorld && (
          <WorldMap open={mapOpen} onClose={() => setMapOpen(false)} playerPositionRef={playerPositionRef} />
        )}
        <WorldChat
          open={chatOpen}
          onClose={() => setChatOpen(false)}
          onOpen={() => setChatOpen(true)}
          authorName={chatAuthor}
          playerId={playerId}
          onSend={sendChatMessage}
          prefill={chatPrefill}
        />

        {!isPrivateWorld && selectedPlayer && (
          <PlayerMenu
            player={selectedPlayer}
            isFriend={friends.includes(selectedPlayer.name)}
            onWhisper={() => {
              setChatPrefill({ text: `/w ${selectedPlayer.name} `, key: Date.now() })
              setChatOpen(true)
              setSelectedPlayer(null)
            }}
            onToggleFriend={() => {
              if (friends.includes(selectedPlayer.name)) {
                removeFriend(selectedPlayer.name)
              } else {
                addFriend(selectedPlayer.name)
              }
            }}
            onClose={() => setSelectedPlayer(null)}
          />
        )}

        <CameraSettingsMenu open={cameraMenuOpen} onClose={() => setCameraMenuOpen(false)} />

        {/* Voice chat panel — admin by default, or explicitly granted (see DevToolsPanel "🎙️ Voz") */}
        {canUseVoice && (
          <VoicePanel playerId={playerId} name={chatAuthor} channelRef={channelRef} />
        )}

        {/* Connection status badge — hidden in private worlds or when HUD is off */}
        {hudVisible && !isPrivateWorld && (
          <div className="pointer-events-none absolute right-4 top-4 z-20 rounded-full bg-surface/90 px-3 py-1 text-xs font-semibold text-text shadow-lg backdrop-blur">
            {isVrRealtimeAvailable() ? (
              connected ? (
                <span>🟢 Conectado · {remotePlayerCount} {remotePlayerCount === 1 ? 'jugador' : 'jugadores'} más</span>
              ) : (
                <span>🟡 Conectando…</span>
              )
            ) : (
              <span>⚪ Modo sin conexión</span>
            )}
          </div>
        )}

        {/* World badge */}
        {hudVisible && anfiteatroMode && (
          <div className="pointer-events-none absolute right-4 top-4 z-20 rounded-full bg-surface/90 px-3 py-1 text-xs font-semibold text-text shadow-lg backdrop-blur">
            🎭 Anfiteatro Oliver
          </div>
        )}
        {hudVisible && roomMode && (
          <div className="pointer-events-none absolute right-4 top-4 z-20 rounded-full bg-surface/90 px-3 py-1 text-xs font-semibold text-text shadow-lg backdrop-blur">
            🏠 Mi Room (privada)
          </div>
        )}

        {showHint && (
          <div
            className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 rounded-xl bg-surface/90 px-4 py-2 text-center text-xs text-text shadow-lg backdrop-blur sm:text-sm"
            style={{ maxWidth: '90vw' }}
          >
            <strong>W A S D</strong> o flechas para moverte · <strong>espacio</strong> saltar ·{' '}
            {!isPrivateWorld && <><strong>M</strong> mapa · <strong>P</strong> personaje · <strong>B</strong> inventario · <strong>C</strong> chat · </>}
            <strong>E</strong> hablar/portal · arrastra para mirar · <strong>rueda</strong> zoom 🎮
          </div>
        )}

        {/* VR HUD: player portrait + skill action bar + utility strip */}
        <VrHud
          hidden={worldTreeMode}
          hudVisible={hudVisible}
          setHudVisible={setHudVisible}
          onOpenSettings={() => setCameraMenuOpen(true)}
          onOpenChat={() => setChatOpen(true)}
          onOpenMap={() => setMapOpen(true)}
          onOpenDailyRewards={() => setDailyRewardsOpen(true)}
          onOpenBags={() => setBagsOpen(true)}
          onOpenCharacterPanel={() => setCharacterPanelOpen(true)}
          isPrivateWorld={isPrivateWorld}
        />

        {/* Daily rewards board overlay */}
        {dailyRewardsOpen && (
          <DailyRewardsBoard onClose={() => setDailyRewardsOpen(false)} />
        )}

        {/* WoW-style bags overlay — quick equip/unequip for Avatar + Mascota */}
        {bagsOpen && (
          <BagsPanel onClose={() => setBagsOpen(false)} />
        )}

        {/* Avatar character pane — opened by clicking the HUD portrait card */}
        {characterPanelOpen && (
          <CharacterPanel onClose={() => setCharacterPanelOpen(false)} />
        )}

        {/* Tablón de anuncios al iniciar la aventura — al cerrarlo, abre la recompensa diaria */}
        {showAnnouncements && (
          <PatchNotesModal
            open
            onClose={() => {
              setShowAnnouncements(false)
              setDailyRewardsOpen(true)
            }}
          />
        )}

        {/* Programador terminal — tiered by class/level/admin (see TerminalModal) */}
        {terminalOpen && (
          <TerminalModal
            tier={isAdmin ? 'admin' : level >= 10 ? 'hacker' : 'basic'}
            onClose={() => setTerminalOpen(false)}
          />
        )}

        {/* WorldTree class selection card */}
        {worldTreeMode && nearClassNodeId && classSelectionStep !== 'done' && (
          <ClassPreviewCard
            classId={nearClassNodeId}
            step={classSelectionStep}
            playerClass={playerClass}
            oliverClass={oliverClass}
            isAdmin={isAdmin}
            onSelectPlayer={(id) => {
              selectPlayerClass(id)
              setClassSelectionStep('oliver')
            }}
            onSelectOliver={(id) => {
              selectOliverClass(id)
              setClassSelectionStep('done')
              setTimeout(() => navigate('/vr'), 1800)
            }}
            onClose={() => setNearClassNodeId(null)}
          />
        )}

        {/* WorldTree badge */}
        {hudVisible && worldTreeMode && (
          <div className="pointer-events-none absolute right-4 top-4 z-20 rounded-full bg-surface/90 px-3 py-1 text-xs font-semibold text-text shadow-lg backdrop-blur">
            🌳 Árbol del Mundo
          </div>
        )}

        {/* VR Loading Screen — shown until user presses any key */}
        {!vrReady && (
          <VrLoadingScreen
            onEnter={() => setVrReady(true)}
            worldName={worldTreeMode ? 'Árbol del Mundo' : anfiteatroMode ? 'Anfiteatro' : roomMode ? 'Mi Room' : graffitiMode ? 'Calle Graffiti' : 'Campus VR'}
          />
        )}

        <VirtualJoystick keysRef={keysRef} hidden={chatOpen} />
        <MobileButtons keysRef={keysRef} hidden={chatOpen} onOpenChat={() => setChatOpen(true)} />

        {kicked && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 p-4 text-center">
            <div className="max-w-sm rounded-2xl bg-surface p-6 shadow-2xl">
              <p className="mb-2 text-3xl">🔌</p>
              <p className="mb-2 text-base font-bold text-text">Sesión desconectada</p>
              <p className="mb-4 text-sm text-text-muted">
                Tu cuenta se conectó al Campus desde otra ventana o pestaña. Solo se permite una
                sesión activa por cuenta, así que esta se desconectó.
              </p>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-background transition-colors hover:bg-primary-hover"
              >
                Recargar
              </button>
            </div>
          </div>
        )}
      </div>

      <MascotCompanion hideViewport />

      {/* VR mascot onboarding — shown when user hasn't chosen their companion yet */}
      {!oliverClass && <VrMascotOnboarding />}

      {/* Turn-based battle overlay */}
      <BattleScreen />
    </div>
  )
}
