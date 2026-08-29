import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Html, useGLTF } from '@react-three/drei'
import { Physics, RigidBody, CapsuleCollider, CuboidCollider, useRapier } from '@react-three/rapier'
import * as THREE from 'three'
import { useNavigate } from 'react-router-dom'
import { useI18n } from '../../i18n'
import AppTopBar from '../shared/AppTopBar'
import PageVideoModal from '../shared/PageVideoModal'
import MascotMesh from '../mascot/MascotMesh'
import MascotCompanion from '../mascot/MascotCompanion'
import { useMascotStore } from '../../stores/useMascotStore'
import { getMascotById } from '../../data/mascotRegistry'
import { getSkinById } from '../../data/skinsRegistry'
import { getVrNpcById, VR_NPCS, OLIVER_NPC, EINSTEIN_NPC, JAFET_NPC } from '../../data/vrNpcRegistry'
import { localizeNpcDialogue } from '../../data/vrNpcTranslations'
import { getGlobalMissionById, evaluateMission } from '../../data/globalMissionsRegistry'
import { localizeMission } from '../../data/globalMissionsTranslations'
import { useGlobalMissionsStore } from '../../stores/useGlobalMissionsStore'
import { useMissionState } from '../../stores/useMissionState'
import { getStartableQuestForNpc, getActiveQuestStepForNpc } from '../../data/questsRegistry'
import { localizeQuest } from '../../data/questsTranslations'
import { useQuestsStore } from '../../stores/useQuestsStore'
import { useMascotCompanionStore } from '../../stores/useMascotCompanionStore'
import { useWorldChatStore } from '../../stores/useWorldChatStore'
import { useSettingsStore } from '../../stores/useSettingsStore'
import { useAiCredentialsStore } from '../../stores/useAiCredentialsStore'
import { sendNpcMessage } from '../../services/chat/npcTransport'
import { useVrPresenceStore } from '../../stores/useVrPresenceStore'
import { useFriendsStore } from '../../stores/useFriendsStore'
import { useVrSettingsStore } from '../../stores/useVrSettingsStore'
import { useVrCharacterStore } from '../../stores/useVrCharacterStore'
import { useAuthStore } from '../../stores/useAuthStore'
import { useDayNightStore } from '../../stores/useDayNightStore'
import { useLevelStore, levelForXp } from '../../stores/useLevelStore'
import { useTerminalRewardsStore } from '../../stores/useTerminalRewardsStore'
import { useVoiceStore } from '../../stores/useVoiceStore'
import GmConsole from '../shared/GmConsole'
import BashTerminalModal from './BashTerminalModal'
import FourthWallPhone from './FourthWallPhone'
import { useVrMultiplayer, isVrRealtimeAvailable } from './useVrMultiplayer'
import MobField from './MobField'
import { useMobStore } from '../../stores/useMobStore'
import { useSpawnedNpcStore } from '../../stores/useSpawnedNpcStore'
import { useEquipmentStore } from '../../stores/useEquipmentStore'
import { EQUIPMENT_REGISTRY, SLOT_META } from '../../data/equipmentRegistry'
import { SHOP_ITEMS, SHOP_CATEGORIES } from '../../data/shopRegistry'
import { runGmCommand, SELF_TARGET } from '../../services/admin/gmCommands'
import { useTargetStore } from '../../stores/useTargetStore'
import LootToast from './LootToast'
import { formatCurrency } from '../../utils/currency'
import { useGameStore, PLAYER_CLASSES, OLIVER_CLASSES, PLAYER_AVATARS } from '../../stores/useGameStore'
import { SKILL_REGISTRY } from '../../data/skillRegistry'
import { useItemEffectsStore } from '../../stores/useItemEffectsStore'
import { useShopStore } from '../../stores/useShopStore'
import VrLoadingScreen from './VrLoadingScreen'
import VrAssetProgress from './VrAssetProgress'
import VrMascotOnboarding from './VrMascotOnboarding'
import BattleScreen from '../battle/BattleScreen'
import { useCombatStore } from '../../stores/useCombatStore'
import VrHud from './VrHud'
import CharSwitcherHud from './CharSwitcherHud'
import WorldChat from './WorldChat'
import DailyRewardsBoard from './DailyRewardsBoard'
import BagsPanel from './BagsPanel'
import PatchNotesModal from '../shared/PatchNotesModal'
import { LATEST_VERSION } from '../../data/patchNotesRegistry'
import { useSeenStore } from '../../stores/useSeenStore'
import { useDailyRewardsStore } from '../../stores/useDailyRewardsStore'
import { useCampusGround, GROUND_RADIUS, NPC_BUILDING_OFFSET, CAMPUS_DORMS, NPC_PAVILION_EXEMPT } from './worlds/useCampusGround'
import { useRoomGround, ROOM_SIZE, ROOM_HEIGHT } from './worlds/useRoomGround'
import { useAnfiteatroGround, ANFI_H, ANFI_HW, ANFI_HD, ANFI_STAGE_Z, ANFI_STAGE_NPC_POS, ANFI_SPAWN, ANFI_EXIT_PORTAL } from './worlds/useAnfiteatroGround'
import { useWorldTreeGround, WT_CLASS_NODES } from './worlds/useWorldTreeGround'
import { useImportedGlbGround } from './worlds/useImportedGlbGround'
import SceneEffects from '../shared/SceneEffects'
import DayNightCycle from './DayNightCycle'
import {
  PLAYER_SCALE,
  PLAYER_HEIGHT,
  AVATAR_RELATIVE_SCALE,
  MASCOT_RELATIVE_SCALE,
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

// CAMPUS_ACADEMIC entries above are the Spanish names used everywhere else
// (position lookups, comments) — this only maps them to an i18n key for the
// WorldMap SVG labels, keeping the array itself as the single source of truth.
const CAMPUS_BUILDING_I18N_KEY = {
  'Gran Aula': 'granAula',
  Biblioteca: 'biblioteca',
  'Ciencia + IA': 'cienciaIa',
  Innovación: 'innovacion',
  Mercado: 'mercado',
}

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
  const { scene } = useGLTF('/MODELOS 3D/VR/fondo_azteca.glb')

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

function useCampusGlbGround() {
  const result = useImportedGlbGround('/MODELOS 3D/VR/campus.glb')
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
        // Right at the Gran Aula's front edge (see CAMPUS_ACADEMIC: centered
        // at [0,0,-62], depth 18 → edge at z=-53) instead of the open plaza,
        // per the explicit request to spawn there.
        spawnAt={[0, 0, -53]}
      />
    </>
  )
}

// Mapa de Pruebas — terreno plano y simple (sin la malla real de campus.glb),
// mismo Player/física/combate/NPCs/monstruos que el campus real. El bug de
// "se traba cerca de los NPCs" viene del colisionador 'trimesh' de
// CampusGlbWorld: calca la geometría EXACTA del modelo importado (escalones,
// columnas de los NPCs, detalle arquitectónico), y eso es notoriamente
// propenso a atascar un character controller de cápsula cuando roza bordes
// finos. Un piso plano con un solo CuboidCollider no tiene ese problema —
// además de ser justo lo pedido: un lugar liviano para probar sin cargar
// toda la escuela.
function TestGroundWorld({ mascot, skin, keysRef, cameraRef, playerPositionRef, playerRotationRef, authorName, playerId }) {
  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial color="#3a6b3a" />
      </mesh>
      <gridHelper args={[200, 40, '#5a8a5a', '#4a7a4a']} position={[0, 0.01, 0]} />
      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider args={[100, 0.5, 100]} position={[0, -0.5, 0]} />
      </RigidBody>
      <Player
        mascot={mascot}
        skin={skin}
        groundRayHeight={20}
        keysRef={keysRef}
        cameraRef={cameraRef}
        playerPositionRef={playerPositionRef}
        playerRotationRef={playerRotationRef}
        authorName={authorName}
        playerId={playerId}
        spawnAt={[0, 0, 10]}
      />
    </>
  )
}

// Renders the Anfiteatro world: theater geometry + YouTube screen iframe +
// one center-stage NPC + exit portal back to campus.
function AnfiteatroWorld({ mascot, skin, keysRef, cameraRef, playerPositionRef, playerRotationRef, authorName, playerId, onNearPortalChange }) {
  const { t } = useI18n()
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
            src="https://www.youtube.com/embed/1y1qrh58MlA?autoplay=1&mute=1&rel=0&modestbranding=1"
            title={t('vr.anfiteatroWorld.screenTitle')}
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
          {t('vr.anfiteatroWorld.marquee')}
        </div>
      </Html>

      {/* Stage NPC — slightly bigger to command the stage */}
      <group position={ANFI_STAGE_NPC_POS}>
        <group scale={NPC_SCALE * 1.45} position={[0, NPC_SCALE * 1.45 * MODEL_HALF_HEIGHT, 0]}>
          <MascotMesh mascot={stageMascot} />
        </group>
        <Html position={[0, 0.9, 0]} center distanceFactor={10}>
          <div className="pointer-events-none whitespace-nowrap rounded-full bg-surface/90 px-3 py-1 text-xs font-semibold text-text shadow-lg">
            {t('vr.anfiteatroWorld.directorLabel')}
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
        label={t('vr.portalLabels.exitToCampus')}
        playerPositionRef={playerPositionRef}
        onNearbyChange={onNearPortalChange}
      />
    </>
  )
}


// Renders El Árbol del Mundo: the class selection hub.
function WorldTreeWorld({ mascot, skin, keysRef, cameraRef, playerPositionRef, playerRotationRef, authorName, playerId, onNearPortalChange, onNearClassNodeChange }) {
  const { t } = useI18n()
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
        label={t('vr.portalLabels.backToCampus')}
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
  const { t } = useI18n()
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
        // Deterministic initiator: only the lexicographically smaller id ever
        // sends an offer. Without this, two people enabling mic around the
        // same time both create+send offers to each other, each peer ends up
        // with signalingState 'have-local-offer', and setRemoteDescription on
        // the incoming offer throws (silently swallowed below) — both sides
        // get stuck never exchanging an answer, so neither hears the other.
        if (playerId > from) return
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
        setMicError(t('vr.voicePanel.micErrorPrefix') + (err?.message ?? err))
      }
    }
  }, [micActive, playerId, name, channelRef, closePeer, t])

  useEffect(() => () => {
    localStreamRef.current?.getTracks().forEach((t) => t.stop())
    peersRef.current.forEach((_, id) => closePeer(id))
  }, [closePeer])

  return { micActive, speaking, micError, toggleMic }
}

// Mic toggle button + speaking player list, shown in the VR HUD.
function VoicePanel({ playerId, name, channelRef }) {
  const { t } = useI18n()
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
        {micActive ? t('vr.voicePanel.toggleOn') : t('vr.voicePanel.toggleOff')}
      </button>
      {open && (
        <div className="w-56 rounded-xl border border-border bg-surface/95 p-3 text-xs text-text shadow-xl backdrop-blur">
          <p className="mb-2 font-semibold">{t('vr.voicePanel.title')}</p>
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
            {micActive ? t('vr.voicePanel.micOn') : t('vr.voicePanel.micOff')}
          </button>
          {micError && <p className="mb-2 text-red-400">{micError}</p>}
          <p className="mb-1 text-text-muted">{t('vr.voicePanel.speakingNow')}</p>
          {speakingList.length > 0 ? (
            speakingList.map((n) => (
              <p key={n} className="flex items-center gap-1 text-green-400">
                <span className="animate-pulse">🔊</span> {n}
              </p>
            ))
          ) : (
            <p className="text-text-muted italic">{t('vr.voicePanel.nobodySpeaking')}</p>
          )}
          <p className="mt-2 text-[10px] text-text-muted">
            {t('vr.voicePanel.hint')}
          </p>
        </div>
      )}
    </div>
  )
}

// Shows the inactive companion parked at its own remembered world position
// when the player enables "Stay" mode — rendered inside Suspense so
// MascotMesh can useGLTF. Keyed off `parkedPositions[inactiveChar]` (not the
// active character's live position) so avatar and mascot can each be left in
// a different spot instead of sharing one position.
function StayedCompanion({ mascot, skin, avatarId }) {
  const activeChar = useVrCharacterStore((s) => s.activeChar)
  const companionFollows = useVrCharacterStore((s) => s.companionFollows)
  const inactiveChar = activeChar === 'avatar' ? 'mascot' : 'avatar'
  const parkedPos = useVrCharacterStore((s) => s.parkedPositions[inactiveChar])
  if (companionFollows || !parkedPos) return null
  const pos = [parkedPos.x, parkedPos.y, parkedPos.z]
  return (
    <group position={pos}>
      <group scale={PLAYER_SCALE * 0.9}>
        {inactiveChar === 'avatar' ? (
          <PlayerAvatarBody avatarId={avatarId} />
        ) : (
          <MascotMesh mascot={mascot} skin={skin} />
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

// Endless little physics demo for el Mapa de Pruebas: a primitive tree that
// drops a new <FallingApple> on a loop, so gravity/collisions are always
// visibly doing something to test against — not just the one-time static
// apples near the real campus's maple trees. Apples are siblings of the
// group (absolute world positions), not nested inside it: Rapier resolves a
// RigidBody's position in world space, so nesting it under a transformed
// <group> would desync the visual mesh from where it actually collides.
const APPLE_TREE_MAX = 6
const APPLE_DROP_MS = 3000

function AppleTree({ position }) {
  const [apples, setApples] = useState([])
  const nextId = useRef(0)

  const x = position[0]
  const z = position[2]

  useEffect(() => {
    // Deliberately depend on the primitive x/z, not the `position` array
    // itself: VRPage re-renders often (proximity flags, chat, HUD toggles),
    // and each render passes a brand-new `[16, 0, 6]` literal — depending on
    // that array's identity tore this interval down and restarted it before
    // it ever fired again, which is why apples dropped once and then stopped.
    const interval = setInterval(() => {
      const id = nextId.current++
      const pos = [x + (Math.random() - 0.5) * 1.4, 4.2, z + (Math.random() - 0.5) * 1.4]
      setApples((cur) => [...cur.slice(-(APPLE_TREE_MAX - 1)), { id, pos }])
    }, APPLE_DROP_MS)
    return () => clearInterval(interval)
  }, [x, z])

  return (
    <>
      <group position={position}>
        <mesh position={[0, 1.5, 0]} castShadow>
          <cylinderGeometry args={[0.25, 0.35, 3, 8]} />
          <meshStandardMaterial color="#5b4636" roughness={0.9} />
        </mesh>
        <mesh position={[0, 3.6, 0]} castShadow>
          <sphereGeometry args={[1.6, 10, 10]} />
          <meshStandardMaterial color="#2f6b2f" roughness={0.85} />
        </mesh>
      </group>
      {apples.map((apple) => <FallingApple key={apple.id} position={apple.pos} />)}
    </>
  )
}

// Desk + monitor prop for the Programador class's terminal ability — only
// visually "usable" (E prompt + interaction) for class===programmer or the
// admin; everyone else just sees a static prop in the plaza.
const COMPUTER_POS = new THREE.Vector3(-6, 0, 8)
const COMPUTER_RADIUS = 2.2

// Segunda terminal, cerca del spawn del campus principal ([0,0,-53]) — Gran
// Aula ocupa z∈[-71,-53], así que este punto queda hacia la plaza abierta,
// sin chocar con el edificio ni con la terminal original.
const COMPUTER_POS_SPAWN = new THREE.Vector3(4, 0, -46)
const COMPUTER_RADIUS_SPAWN = 2.2

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
function ComputerTerminal({ playerPositionRef, onNearChange, position = COMPUTER_POS, radius = COMPUTER_RADIUS }) {
  const screenRef = useRef()
  const nearRef = useRef(false)

  useFrame(({ clock }) => {
    if (screenRef.current) {
      screenRef.current.material.emissiveIntensity = 0.7 + Math.sin(clock.getElapsedTime() * 2.2) * 0.25
    }
    const pos = playerPositionRef?.current
    if (!pos) return
    const flat = new THREE.Vector3(pos.x, position.y, pos.z)
    const isNear = flat.distanceTo(position) <= radius
    if (isNear !== nearRef.current) {
      nearRef.current = isNear
      onNearChange?.(isNear)
    }
  })

  return (
    <group position={[position.x, position.y, position.z]}>
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

// English version of BUG_PUZZLES, same order/length/`answer` index so
// TerminalModal can pick a puzzle index once and read it from whichever
// array matches the site's language.
const BUG_PUZZLES_EN = [
  {
    code: 'function add(a, b) {\n  retun a + b\n}',
    options: ['Missing semicolon', '"retun" is misspelled (should be "return")', 'The parameters are swapped'],
    answer: 1,
  },
  {
    code: 'for (let i = 0; i <= 10; i++) {\n  arr[i] = i\n}',
    options: ['The loop runs past the array (off-by-one)', '"arr" is never declared', "There's no bug"],
    answer: 0,
  },
  {
    code: 'if (user.role = "admin") {\n  giveAccess()\n}',
    options: ['Missing the giveAccess function', 'Uses "=" instead of "==" (assignment, not comparison)', 'Missing an "else"'],
    answer: 1,
  },
  {
    code: 'const total = items.reduce((a, b) => a + b)',
    options: ['Missing the initial value in reduce (fails on an empty list)', '"reduce" does not exist', '"items" should be an object'],
    answer: 0,
  },
]

// Tiered content for the Programador's computer:
// - 'basic'  → anyone with class===programmer: a find-the-bug puzzle.
// - 'hacker' → programmer who reached level 10 (the same level the rest of
//   the class tree unlocks its Tier-3 ultimate at): a harder-paying version
//   of the same puzzle, themed as breaking encryption.
// - 'admin'  → the real GM console (way more power, admin-only).
function TerminalModal({ tier, onClose, playerPositionRef }) {
  const { t, lang } = useI18n()
  const [puzzleIdx] = useState(() => Math.floor(Math.random() * BUG_PUZZLES.length))
  const [selected, setSelected] = useState(null)
  const [result, setResult] = useState(null)
  const canClaim = useTerminalRewardsStore((s) => s.canClaim())
  const puzzle = (lang === 'en' ? BUG_PUZZLES_EN : BUG_PUZZLES)[puzzleIdx]

  if (tier === 'admin') return <GmConsole open onClose={onClose} playerPositionRef={playerPositionRef} />

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
          <span className="font-semibold">{tier === 'hacker' ? t('vr.terminalPuzzle.titleHacker') : t('vr.terminalPuzzle.titleBasic')}</span>
          <button type="button" onClick={onClose} className="text-text-muted hover:text-[#39ff14]">✕</button>
        </div>
        <div className="space-y-3 px-4 py-4">
          <p className="text-[#39ff14]/70">
            {tier === 'hacker'
              ? t('vr.terminalPuzzle.commentHacker')
              : t('vr.terminalPuzzle.commentBasic')}
          </p>
          <pre className="whitespace-pre-wrap rounded bg-[#001a08] p-3 text-xs text-[#39ff14]">{puzzle.code}</pre>
          <p>{t('vr.terminalPuzzle.question')}</p>
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
          {result === 'correct' && <p className="text-[#39ff14]">{t('vr.terminalPuzzle.correct', { coins: reward.coins, xp: reward.xp })}</p>}
          {result === 'wrong' && <p className="text-red-400">{t('vr.terminalPuzzle.wrong')}</p>}
          {result === 'claimed' && <p className="text-yellow-400">{t('vr.terminalPuzzle.claimed')}</p>}
        </div>
      </div>
    </div>
  )
}

// Admin-only "try every ability" panel for el Mapa de Pruebas — every entry
// in SKILL_REGISTRY (60+, across every class including ones with no real
// hotbar yet) routed through the exact same handleUseSkill() the real hotbar
// calls, so testing an ability here behaves identically to using it live.
function AbilityTesterPanel({ onUseSkill, onClose }) {
  const { t } = useI18n()
  const groups = useMemo(() => {
    const byGroup = {}
    Object.values(SKILL_REGISTRY).forEach((skill) => {
      const key = skill.requiredClass ?? (skill.owner === 'oliver' ? t('vr.abilityTester.groupOliver') : t('vr.abilityTester.groupGeneral'))
      byGroup[key] = byGroup[key] ?? []
      byGroup[key].push(skill)
    })
    return Object.entries(byGroup).sort(([a], [b]) => a.localeCompare(b))
  }, [t])

  return (
    <div className="fixed right-4 top-16 z-[999] flex max-h-[75vh] w-80 flex-col rounded-xl border border-primary/40 bg-black/95 text-xs text-white shadow-2xl">
      <div className="flex items-center justify-between border-b border-primary/30 px-3 py-2">
        <span className="font-semibold">{t('vr.abilityTester.title', { count: Object.keys(SKILL_REGISTRY).length })}</span>
        <button type="button" onClick={onClose} className="text-white/50 hover:text-white">✕</button>
      </div>
      <div className="flex-1 space-y-3 overflow-y-auto px-3 py-3">
        {groups.map(([group, skills]) => (
          <div key={group}>
            <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-white/40">{group}</p>
            <div className="flex flex-wrap gap-1.5">
              {skills.map((skill) => (
                <button
                  key={skill.id}
                  type="button"
                  onClick={() => onUseSkill(skill.id)}
                  title={skill.description}
                  className="flex items-center gap-1 rounded-lg border px-2 py-1 transition-colors hover:brightness-125"
                  style={{ borderColor: `${skill.vfxColor}55`, background: `${skill.vfxColor}15` }}
                >
                  <span>{skill.icon}</span>
                  <span>{skill.name}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Skyrim-style "cofre secreto": todo el equipo (armas/gear, hoy solo emoji —
// modelUrl:null hasta que existan modelos 3D) y todos los objetos de la
// Tienda, en una lista para tomar directamente sin pasar por nivel/clase ni
// monedas. Equipo se pone en el store al toque (equip() no valida nada);
// objetos de Tienda usan el mismo /additem que ya usa la GmConsole.
function ChestPanel({ onClose }) {
  const { t } = useI18n()
  const [tab, setTab] = useState('equipo')
  const [chestOwner, setChestOwner] = useState('avatar')
  const [feedback, setFeedback] = useState('')

  const takeEquipment = (item) => {
    useEquipmentStore.getState().equip(item.owner, item.slot, item.id)
    setFeedback(t('vr.chest.equippedFeedback', {
      name: item.name,
      owner: item.owner === 'oliver' ? t('vr.chest.ownerMascot') : t('vr.chest.ownerAvatar'),
    }))
  }

  const takeShopItem = async (item) => {
    try {
      setFeedback(await runGmCommand(SELF_TARGET, 'additem', [chestOwner, item.id]))
    } catch (err) {
      setFeedback(`❌ ${err.message}`)
    }
  }

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/70 p-4">
      <div className="flex max-h-[80vh] w-full max-w-2xl flex-col rounded-xl border border-amber-500/40 bg-black/95 text-xs text-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-amber-500/30 px-4 py-3">
          <span className="font-semibold text-amber-300">{t('vr.chest.title')}</span>
          <button type="button" onClick={onClose} className="text-white/50 hover:text-white">✕</button>
        </div>
        <div className="flex gap-2 border-b border-amber-500/30 px-4 py-2">
          <button
            type="button"
            onClick={() => setTab('equipo')}
            className={`rounded px-2 py-1 font-semibold ${tab === 'equipo' ? 'bg-amber-500/20 text-amber-300' : 'text-white/50 hover:text-white'}`}
          >
            {t('vr.chest.equipTab', { count: EQUIPMENT_REGISTRY.length })}
          </button>
          <button
            type="button"
            onClick={() => setTab('tienda')}
            className={`rounded px-2 py-1 font-semibold ${tab === 'tienda' ? 'bg-amber-500/20 text-amber-300' : 'text-white/50 hover:text-white'}`}
          >
            {t('vr.chest.shopTab', { count: SHOP_ITEMS.length })}
          </button>
        </div>
        {tab === 'tienda' && (
          <div className="flex gap-2 border-b border-amber-500/20 px-4 py-2">
            {[{ id: 'avatar', label: t('vr.chest.avatarOwner') }, { id: 'mascota', label: t('vr.chest.mascotOwner') }].map((o) => (
              <button
                key={o.id}
                type="button"
                onClick={() => setChestOwner(o.id)}
                className={`rounded px-2 py-1 font-semibold ${chestOwner === o.id ? 'bg-amber-500/20 text-amber-300' : 'text-white/50 hover:text-white'}`}
              >
                {o.label}
              </button>
            ))}
          </div>
        )}
        {feedback && <div className="border-b border-amber-500/20 px-4 py-1.5 text-amber-300">{feedback}</div>}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {tab === 'equipo'
              ? EQUIPMENT_REGISTRY.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => takeEquipment(item)}
                    title={item.description}
                    className="flex flex-col items-start gap-1 rounded-lg border border-white/10 bg-white/5 p-2 text-left transition-colors hover:border-amber-500/50 hover:bg-amber-500/10"
                  >
                    <span className="text-lg">{item.icon}</span>
                    <span className="font-semibold">{item.name}</span>
                    <span className="text-[10px] text-white/40">
                      {item.owner === 'oliver' ? t('vr.chest.ownerMascot') : t('vr.chest.ownerAvatar')} · {SLOT_META[item.slot]?.label}
                    </span>
                  </button>
                ))
              : SHOP_ITEMS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => takeShopItem(item)}
                    title={item.description}
                    className="flex flex-col items-start gap-1 rounded-lg border border-white/10 bg-white/5 p-2 text-left transition-colors hover:border-amber-500/50 hover:bg-amber-500/10"
                  >
                    <span className="text-lg">{item.icon}</span>
                    <span className="font-semibold">{item.name}</span>
                    <span className="text-[10px] text-white/40">{SHOP_CATEGORIES[item.category]?.label ?? item.category}</span>
                  </button>
                ))}
          </div>
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
  const { lang } = useI18n()
  const mascot  = getMascotById(npc.mascotId)
  const facing  = Math.atan2(-npc.position[0], -npc.position[2])
  const npcPos  = useMemo(() => new THREE.Vector3(...npc.position), [npc.position])
  const [near, setNear]     = useState(false)
  const [bubbles, setBubbles] = useState([])
  const bubbleIdRef = useRef(1)
  const accepted = useGlobalMissionsStore((s) => s.accepted)
  const mission  = useMemo(() => getGlobalMissionById(npc.missionId), [npc.missionId])
  const questsActive = useQuestsStore((s) => s.active)
  const questsCompleted = useQuestsStore((s) => s.completed)
  const hasQuest = (mission && !accepted.includes(mission.id)) ||
    (npc.questId && (
      getStartableQuestForNpc(npc.id, questsActive, questsCompleted) ||
      getActiveQuestStepForNpc(npc.id, questsActive)
    ))

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
    utt.lang = lang === 'en' ? 'en-US' : 'es-ES'; utt.rate = 0.92; utt.pitch = 1.05
    window.speechSynthesis.speak(utt)
  }, [npc.dialogue, lang])

  return (
    <group position={npc.position} rotation={[0, facing, 0]}
      onClick={(e) => { e.stopPropagation(); useTargetStore.getState().setTarget('npc', npc.id); sayDialogue() }}>
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
  const { lang } = useI18n()
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
      const { activeCredentialId } = useSettingsStore.getState()
      const hasConnection = useAiCredentialsStore.getState().connections.some((c) => c.id === activeCredentialId)
      if (hasConnection) {
        try {
          const npcPrompt = lang === 'en'
            ? `${config.aiPrompt} Respond in English no matter what language the instructions above are written in.`
            : config.aiPrompt
          const reply = await sendNpcMessage({
            npcPrompt,
            content: lang === 'en'
              ? 'Say something brief, spontaneous and in character (a single short sentence).'
              : 'Comenta algo breve, espontáneo y en personaje (una sola frase corta).',
            lang,
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
    utt.lang = lang === 'en' ? 'en-US' : 'es-ES'; utt.rate = 0.95; utt.pitch = 1.1
    window.speechSynthesis.speak(utt)
  }, [config, lang])

  return (
    <group position={config.position}
      onClick={(e) => { e.stopPropagation(); useTargetStore.getState().setTarget('npc', config.id); sayOneLine() }}>
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
  const { t } = useI18n()
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
    <group
      ref={group}
      onClick={(e) => {
        e.stopPropagation()
        useTargetStore.getState().setTarget('player', id)
        onSelectPlayer?.({ id, name: player?.name || t('vr.hud.target.traveler') })
      }}
    >
      <group scale={PLAYER_SCALE} position={[0, PLAYER_SCALE * MODEL_HALF_HEIGHT, 0]}>
        <group scale={AVATAR_RELATIVE_SCALE}>
          <PlayerAvatarBody avatarId={player?.avatarId || 'hombre'} />
        </group>
        <group position={[1.2, 0, 0]} scale={MASCOT_RELATIVE_SCALE}>
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
            useTargetStore.getState().setTarget('player', id)
            onSelectPlayer?.({ id, name: player?.name || t('vr.hud.target.traveler') })
          }}
          className="cursor-pointer whitespace-nowrap rounded-full bg-surface/90 px-3 py-1 text-xs font-semibold text-text shadow-lg transition-colors hover:bg-primary/30"
        >
          {player?.name || t('vr.hud.target.traveler')}
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
  const { t } = useI18n()
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
        label={t('vr.portalLabels.exitToCampus')}
        playerPositionRef={playerPositionRef}
        onNearbyChange={onNearPortalChange}
      />
    </>
  )
}

// Watches the distance from the player to every NPC and reports the closest
// one within INTERACT_RADIUS via onNearbyChange. Oliver/Einstein/Jafet (idle
// chat NPCs) plus every VR_NPCS entry (flat-mission, battle and quest NPCs,
// reactivated near spawn) are all tracked the same way.
const ALL_NPC_POSITIONS = [
  OLIVER_NPC,
  EINSTEIN_NPC,
  JAFET_NPC,
  ...VR_NPCS,
].map((npc) => ({ id: npc.id, vec: new THREE.Vector3(...npc.position) }))

// Ids that belong to idle (non-mission) NPCs — used to decide which card to show.
const IDLE_NPC_IDS = new Set([OLIVER_NPC.id, EINSTEIN_NPC.id, JAFET_NPC.id])

function NpcProximityTracker({ playerPositionRef, onNearbyChange, npcs = ALL_NPC_POSITIONS }) {
  const lastId = useRef(null)

  useFrame(() => {
    const pos = playerPositionRef.current
    if (!pos) return

    let nearestId = null
    let nearestDist = Infinity
    for (const { id, vec } of npcs) {
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

// Watches for the player falling into the void (an unfinished/holey area of
// a map with no floor below) and fires onFall once per fall — resets itself
// automatically once the rescue teleport lifts the player back above the
// threshold, ready to catch a future fall.
const FALL_RESCUE_Y = -25

function FallRescueTracker({ playerPositionRef, onFall }) {
  const firedRef = useRef(false)

  useFrame(() => {
    const pos = playerPositionRef.current
    if (!pos) return
    if (pos.y < FALL_RESCUE_Y) {
      if (!firedRef.current) {
        firedRef.current = true
        onFall({ x: pos.x, y: pos.y, z: pos.z })
      }
    } else {
      firedRef.current = false
    }
  })

  return null
}

// Oliver (the orange cat, mascot id 8) "swooping in" to rescue a fallen
// player — shown for a few seconds at the spot they fell, regardless of
// which mascot the player actually has equipped.
const ORANGE_CAT_MASCOT = getMascotById(8)

function FallRescueCat({ position }) {
  const ref = useRef()
  useFrame(({ clock }) => {
    if (ref.current) ref.current.position.y = position.y + 1 + Math.sin(clock.elapsedTime * 4) * 0.3
  })
  return (
    <group ref={ref} position={[position.x, position.y + 1, position.z]} scale={0.6}>
      <MascotMesh mascot={ORANGE_CAT_MASCOT} />
    </group>
  )
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
  const { t, lang } = useI18n()
  const cfg  = useMemo(() => localizeNpcDialogue(IDLE_NPC_CONFIGS[npcId], lang), [npcId, lang])
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
    utt.lang = lang === 'en' ? 'en-US' : 'es-ES'; utt.rate = 0.9; utt.pitch = 1.1
    window.speechSynthesis.speak(utt)
    return () => window.speechSynthesis.cancel()
  }, [cfg, line, lang])

  if (!cfg) return null
  return (
    <div
      // Mismo fix de max-h/overflow-y-auto que NpcMissionCard — evita que la
      // tarjeta crezca hasta chocar con el HUD superior en pantallas cortas.
      className="absolute bottom-24 left-1/2 z-30 max-h-[min(70vh,32rem)] w-80 -translate-x-1/2 overflow-y-auto rounded-2xl shadow-2xl sm:bottom-20"
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
            {cfg.shopAction ? t('vr.idleNpcCard.merchantLabel') : t('vr.idleNpcCard.npcLabel')}
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
            {t('vr.idleNpcCard.viewShop')}
          </button>
        )}
        <button
          type="button"
          onClick={() => { onChat(); onClose() }}
          className="w-full rounded-xl py-2 text-xs font-bold transition active:scale-95"
          style={{ background: 'rgba(124,58,237,0.18)', border: '1px solid rgba(124,58,237,0.4)', color: '#c4b5fd' }}
        >
          {t('vr.idleNpcCard.startChat')}
        </button>
        <button type="button" onClick={onClose}
          className="w-full rounded-xl py-1.5 text-xs font-semibold transition"
          style={{ color: 'rgba(255,255,255,0.3)' }}>
          {t('vr.idleNpcCard.close')}
        </button>
      </div>
    </div>
  )
}

// ── Giant presentation screen ─────────────────────────────────────────────────
// A large billboard near the Grand Hall north road. Right-clicking it (or
// clicking the on-screen prompt) opens a full-screen video modal.
// The PRESENTATION_VIDEO_URL can be changed in one place below.
const PRESENTATION_VIDEO_URL = 'https://www.youtube.com/embed/1y1qrh58MlA?autoplay=1'

function CampusVideoScreen({ onOpen }) {
  const { t } = useI18n()
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
          <p className="text-white font-black text-sm drop-shadow">{t('vr.videoScreen.title')}</p>
          <p className="text-white/60 text-[10px]">{t('vr.videoScreen.clickToView')}</p>
        </div>
      </Html>
      {/* Label */}
      <Html position={[0, 10.0, 0]} center distanceFactor={18}>
        <div className="pointer-events-none whitespace-nowrap rounded-full bg-surface/90 px-3 py-1 text-xs font-semibold text-text shadow-lg">
          {t('vr.videoScreen.screenLabel')}
        </div>
      </Html>
    </group>
  )
}

// Full-screen video modal opened from the campus screen or its right-click menu.
function VideoScreenModal({ onClose }) {
  const { t } = useI18n()
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
            title={t('vr.videoScreen.title')}
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
  onNearComputer2Change,
  attackFiredAtRef,
  playerClass,
  onOpenVideoScreen,
  authorName,
  playerId,
  onSelectPlayer,
  roomMode,
  anfiteatroMode,
  worldTreeMode,
  testMode,
}) {
  // Called unconditionally (before any of the per-mode early returns below)
  // so it always runs in the same order across renders of a mounted World
  // instance — testMode itself never flips mid-mount, only across a route
  // change that remounts this component fresh.
  const { lang } = useI18n()
  const spawnedNpcs = useSpawnedNpcStore((s) => s.npcs)

  if (testMode) {
    // ponytail: same NPCs/mobs as the real campus, just lined up on a flat
    // test field so they're easy to walk between while testing — the real
    // registries (vrNpcRegistry, mobRegistry) aren't touched, only the
    // position each is rendered at here.
    const linedNpcs = [OLIVER_NPC, EINSTEIN_NPC, JAFET_NPC, ...VR_NPCS].map((npc, i) => ({
      ...localizeNpcDialogue(npc, lang),
      position: [i * 4 - 12, 0, 0],
    }))
    // NpcProximityTracker's default list (ALL_NPC_POSITIONS) uses each NPC's
    // real campus coordinates — useless here since they're lined up instead,
    // so it needs this world's actual (repositioned) coordinates to ever
    // report "near" and let onAttack's E-prompt/mission card work at all.
    // GmConsole-summoned NPCs (spawnedNpcs) go in too, so they're talkable
    // and not just decoration.
    const linedNpcPositions = [...linedNpcs, ...spawnedNpcs].map((npc) => ({
      id: npc.id, vec: new THREE.Vector3(...npc.position),
    }))
    return (
      <>
        <TestGroundWorld
          mascot={mascot}
          skin={skin}
          keysRef={keysRef}
          cameraRef={cameraRef}
          playerPositionRef={playerPositionRef}
          playerRotationRef={playerRotationRef}
          authorName={authorName}
          playerId={playerId}
        />
        {linedNpcs.map((npc) => <IdleNpc key={npc.id} config={npc} playerPositionRef={playerPositionRef} />)}
        {spawnedNpcs.map((npc) => <IdleNpc key={npc._spawnId} config={npc} playerPositionRef={playerPositionRef} />)}
        <MobField />
        <AppleTree position={[16, 0, 6]} />
        <ComputerTerminal playerPositionRef={playerPositionRef} onNearChange={onNearComputerChange} />
        <NpcProximityTracker playerPositionRef={playerPositionRef} onNearbyChange={onNearbyNpcChange} npcs={linedNpcPositions} />
        <RemotePlayers transformsRef={remoteTransformsRef} actionsRef={remoteActionsRef} onSelectPlayer={onSelectPlayer} />
      </>
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
      <IdleNpc config={localizeNpcDialogue(OLIVER_NPC, lang)}    playerPositionRef={playerPositionRef} />
      <IdleNpc config={localizeNpcDialogue(EINSTEIN_NPC, lang)} playerPositionRef={playerPositionRef} />
      <IdleNpc config={localizeNpcDialogue(JAFET_NPC, lang)}    playerPositionRef={playerPositionRef} />
      {VR_NPCS.map((npc) => <VrNpc key={npc.id} npc={localizeNpcDialogue(npc, lang)} playerPositionRef={playerPositionRef} />)}
      <MobField />
      <CampusVideoScreen onOpen={onOpenVideoScreen} />
      <DailyRewardBox playerPositionRef={playerPositionRef} onNearChange={onNearDailyRewardChange} />
      <ComputerTerminal playerPositionRef={playerPositionRef} onNearChange={onNearComputerChange} />
      <ComputerTerminal
        playerPositionRef={playerPositionRef}
        onNearChange={onNearComputer2Change}
        position={COMPUTER_POS_SPAWN}
        radius={COMPUTER_RADIUS_SPAWN}
      />
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
function NpcMissionCard({
  npcId, accepted, claimed, missionState, onAccept, onClaim, onClose, onBattle,
  questsActive, questsCompleted, onAcceptQuest, onAdvanceQuest, onClaimQuest, onOpenBashTerminal,
}) {
  const { t, lang } = useI18n()
  const rawNpc = getVrNpcById(npcId)
  const npc = rawNpc && localizeNpcDialogue(rawNpc, lang)
  const rawMission = npc && getGlobalMissionById(npc.missionId)
  const mission = rawMission && localizeMission(rawMission, lang)
  if (!npc) return null

  const isAccepted  = mission ? accepted.includes(mission.id) : false
  const isClaimed   = mission ? claimed.includes(mission.id)  : false
  const isCompleted = mission ? evaluateMission(mission, missionState) : false

  // Quest encadenada (ver questsRegistry.js): a diferencia de `mission`
  // (una sola condición), aquí el NPC correcto cambia según el paso actual.
  const rawStartableQuest = npc.questId
    ? getStartableQuestForNpc(npc.id, questsActive, questsCompleted)
    : null
  const startableQuest = rawStartableQuest && localizeQuest(rawStartableQuest, lang)
  const rawActiveStep = npc.questId ? getActiveQuestStepForNpc(npc.id, questsActive) : null
  const activeStep = rawActiveStep && { ...rawActiveStep, quest: localizeQuest(rawActiveStep.quest, lang), step: localizeQuest(rawActiveStep.quest, lang).steps[rawActiveStep.stepIndex] }
  const isLastStep = activeStep && activeStep.stepIndex === activeStep.quest.steps.length - 1
  const stepReady = activeStep?.step.type === 'talk' ||
    (activeStep?.step.type === 'condition' && activeStep.step.check(missionState))
  const handleAdvanceStep = () => {
    onAdvanceQuest(activeStep.quest.id)
    if (isLastStep) onClaimQuest(activeStep.quest.id)
  }

  return (
    <div
      // max-h + overflow-y-auto: sin esto, el contenido (misión larga, quest
      // encadenada) empujaba la altura de la tarjeta hacia arriba sin límite
      // — en una pantalla corta (móvil en horizontal) llegaba a chocar con el
      // HUD de arriba (PortraitHud) en vez de quedarse contenida abajo.
      className="absolute bottom-24 left-1/2 z-30 max-h-[min(70vh,32rem)] w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 overflow-y-auto rounded-2xl shadow-2xl sm:bottom-20"
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
            <p className="text-[10px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.3)' }}>{t('vr.missionCard.npcMissionsLabel')}</p>
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
            style={{ color: 'rgba(255,255,255,0.35)' }}>{t('vr.missionCard.missionsAvailable')}</p>
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
                {t('vr.missionCard.acceptMission')}
              </button>
            )}
            {isAccepted && !isCompleted && (
              <p className="text-center text-xs py-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
                {t('vr.missionCard.missionInProgress')}
              </p>
            )}
            {isAccepted && isCompleted && !isClaimed && (
              <button type="button" onClick={() => onClaim(mission.id)}
                className="w-full rounded-lg py-2 text-sm font-bold text-white transition active:scale-95"
                style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
                {t('vr.missionCard.claimReward')}
              </button>
            )}
            {isClaimed && (
              <p className="text-center text-xs font-bold py-1" style={{ color: '#4ade80' }}>
                {t('vr.missionCard.missionCompleted')}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Quest section (misión encadenada) */}
      {npc.questId && (startableQuest || activeStep) && (
        <div className="p-4">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-widest"
            style={{ color: 'rgba(255,255,255,0.35)' }}>{t('vr.missionCard.chainMission')}</p>
          <div className="rounded-xl p-3"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            {startableQuest ? (
              <>
                <div className="flex items-start gap-2.5 mb-2">
                  <span className="text-2xl shrink-0">{startableQuest.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-white text-sm">{startableQuest.title}</p>
                    <p className="text-xs leading-relaxed mt-0.5" style={{ color: 'rgba(255,255,255,0.5)' }}>
                      {startableQuest.description}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-xs mt-2 mb-3">
                  <span style={{ color: '#fbbf24' }}>🪙 {formatCurrency(startableQuest.reward.coins)}</span>
                  {startableQuest.reward.xp && <span style={{ color: '#a78bfa' }}>✨ {startableQuest.reward.xp} XP</span>}
                </div>
                <button type="button" onClick={() => onAcceptQuest(startableQuest.id)}
                  className="w-full rounded-lg py-2 text-sm font-bold text-white transition active:scale-95"
                  style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}>
                  {t('vr.missionCard.acceptMission')}
                </button>
              </>
            ) : (
              <>
                {activeStep.step.type !== 'terminal' && (
                  <p className="text-xs leading-relaxed mb-3" style={{ color: 'rgba(255,255,255,0.6)' }}>
                    {activeStep.step.prompt}
                  </p>
                )}
                {activeStep.step.type === 'terminal' ? (
                  <button type="button"
                    onClick={() => { onOpenBashTerminal(activeStep); onClose() }}
                    className="w-full rounded-lg py-2 text-sm font-bold text-white transition active:scale-95"
                    style={{ background: 'linear-gradient(135deg, #059669, #047857)' }}>
                    {t('vr.missionCard.openTerminal')}
                  </button>
                ) : stepReady ? (
                  <button type="button" onClick={handleAdvanceStep}
                    className="w-full rounded-lg py-2 text-sm font-bold text-white transition active:scale-95"
                    style={{ background: isLastStep
                      ? 'linear-gradient(135deg, #f59e0b, #d97706)'
                      : 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}>
                    {isLastStep ? t('vr.missionCard.claimReward') : t('vr.missionCard.continueBtn')}
                  </button>
                ) : (
                  <p className="text-center text-xs py-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
                    {t('vr.missionCard.missionInProgress')}
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      )}
      {npc.questId && !startableQuest && !activeStep && (
        <p className="px-4 pb-3 text-xs italic" style={{ color: 'rgba(255,255,255,0.3)' }}>
          {t('vr.missionCard.alreadyDidYourPart')}
        </p>
      )}

      {/* Battle option */}
      {npc.battle && (
        <div className="px-4 pb-4">
          <button type="button" onClick={() => { onBattle(npc); onClose() }}
            className="w-full rounded-xl py-2 text-sm font-bold transition active:scale-95"
            style={{ border: '1px solid rgba(239,68,68,0.4)', color: '#f87171' }}>
            {t('vr.missionCard.challengeDuel')}
          </button>
        </div>
      )}

      {/* Close without mission */}
      {!mission && !npc.battle && !npc.questId && (
        <div className="px-4 pb-4">
          <button type="button" onClick={onClose}
            className="w-full rounded-xl py-2 text-xs font-semibold transition"
            style={{ color: 'rgba(255,255,255,0.3)' }}>
            {t('vr.missionCard.close')}
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
  const { t } = useI18n()
  const [comingSoon, setComingSoon] = useState('')
  if (!player) return null

  return (
    <div className="absolute bottom-24 left-1/2 w-[calc(100%-2rem)] max-w-xs -translate-x-1/2 rounded-2xl border border-border bg-surface/95 p-4 text-sm text-text shadow-xl backdrop-blur sm:bottom-20">
      <div className="flex items-start justify-between gap-2">
        <p className="font-bold">👤 {player.name}</p>
        <button type="button" onClick={onClose} className="text-text-muted hover:text-text" aria-label={t('vr.playerMenu.close')}>
          ✕
        </button>
      </div>
      <div className="mt-3 flex flex-col gap-2">
        <button
          type="button"
          onClick={onWhisper}
          className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-background transition-colors hover:bg-primary-hover"
        >
          {t('vr.playerMenu.whisper')}
        </button>
        <button
          type="button"
          onClick={onToggleFriend}
          className="w-full rounded-lg border border-border px-4 py-2 text-sm font-semibold text-text transition-colors hover:border-primary hover:text-primary"
        >
          {isFriend ? t('vr.playerMenu.removeFriend') : t('vr.playerMenu.addFriend')}
        </button>
        {/* ponytail: seguir/colocar ícono piden pathing y un sistema de marcadores
            propio — placeholders honestos en lo que se justifica construirlos,
            mismo patrón que el botón de Arena. */}
        <button
          type="button"
          onClick={() => setComingSoon(t('vr.playerMenu.inspectComingSoon'))}
          className="w-full rounded-lg border border-border px-4 py-2 text-sm font-semibold text-text transition-colors hover:border-primary hover:text-primary"
        >
          {t('vr.playerMenu.inspect')}
        </button>
        <button
          type="button"
          onClick={() => setComingSoon(t('vr.playerMenu.followComingSoon'))}
          className="w-full rounded-lg border border-border px-4 py-2 text-sm font-semibold text-text transition-colors hover:border-primary hover:text-primary"
        >
          {t('vr.playerMenu.follow')}
        </button>
        <button
          type="button"
          onClick={() => setComingSoon(t('vr.playerMenu.markerComingSoon'))}
          className="w-full rounded-lg border border-border px-4 py-2 text-sm font-semibold text-text transition-colors hover:border-primary hover:text-primary"
        >
          {t('vr.playerMenu.placeMarker')}
        </button>
        {comingSoon && <p className="text-center text-xs text-text-muted">{comingSoon}</p>}
      </div>
    </div>
  )
}

// Friends list popup — opened from the HUD's 👥 button. Used to navigate to
// a separate /amigos page (leaving the VR world entirely); now it's a popup
// like Bolsas/Personaje, with online status derived from useVrPresenceStore.
function FriendsPopup({ friends, players, onWhisper, onRemoveFriend, onClose }) {
  const { t } = useI18n()
  const onlineNames = new Set(Object.values(players).map((p) => p.name))

  return (
    <div
      className="absolute inset-0 z-40 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div className="relative w-full max-w-sm rounded-2xl border border-border bg-surface p-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-3 flex items-center justify-between">
          <p className="text-base font-bold text-text">{t('vr.friendsPopup.title')}</p>
          <button type="button" onClick={onClose} className="text-text-muted hover:text-text" aria-label={t('vr.friendsPopup.close')}>
            ✕
          </button>
        </div>
        {friends.length === 0 ? (
          <p className="py-6 text-center text-xs text-text-muted">
            {t('vr.friendsPopup.empty')}
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {friends.map((name) => {
              const online = onlineNames.has(name)
              return (
                <div key={name} className="flex items-center justify-between gap-2 rounded-xl border border-border px-3 py-2">
                  <div className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${online ? 'bg-green-500' : 'bg-text-muted/40'}`} />
                    <span className="text-sm font-semibold text-text">{name}</span>
                  </div>
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      disabled={!online}
                      onClick={() => onWhisper(name)}
                      className="rounded-lg bg-primary px-2 py-1 text-xs font-semibold text-background transition-colors hover:bg-primary-hover disabled:opacity-30"
                    >
                      {t('vr.friendsPopup.whisper')}
                    </button>
                    <button
                      type="button"
                      onClick={() => onRemoveFriend(name)}
                      className="rounded-lg border border-border px-2 py-1 text-xs text-text-muted hover:text-text"
                      aria-label={t('vr.friendsPopup.removeAria', { name })}
                    >
                      ✖️
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

// Arena's real VR battle world doesn't exist yet — this just confirms intent
// (and doubles as a "next up" teaser) instead of dropping the player into a
// half-built page when they tap ⚔️.
function ArenaConfirmPopup({ onClose }) {
  const { t } = useI18n()
  return (
    <div
      className="absolute inset-0 z-40 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div className="relative w-full max-w-sm rounded-2xl border border-border bg-surface p-5 text-center shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <p className="text-4xl">⚔️</p>
        <p className="mt-2 text-base font-bold text-text">{t('vr.arenaConfirm.question')}</p>
        <p className="mt-1 text-xs text-text-muted">
          {t('vr.arenaConfirm.detail')}
        </p>
        <button
          type="button"
          onClick={onClose}
          className="mt-4 w-full rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-background transition-colors hover:bg-primary-hover"
        >
          {t('vr.arenaConfirm.confirm')}
        </button>
      </div>
    </div>
  )
}


// Full-screen transport picker: 4 world cards (2 available, 2 locked future
// destinations). Opened by clicking/pressing E at the campus portal.
const TRANSPORT_WORLDS = [
  { id: 'campus',     emoji: '🏫', available: true,  path: '/vr' },
  { id: 'room',       emoji: '🏠', available: true,  path: '/vr/room' },
  { id: 'anfiteatro', emoji: '🎭', available: true,  path: '/vr/anfiteatro' },
  { id: 'ciudad',     emoji: '🌆', available: false, path: null },
]

function TransportMenu({ onNavigate, onClose }) {
  const { t } = useI18n()
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
          <p className="text-sm font-bold text-text">{t('vr.transportMenu.title')}</p>
          <button
            type="button"
            onClick={onClose}
            className="text-text-muted hover:text-text"
            aria-label={t('vr.transportMenu.close')}
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
              <span className="text-xs font-semibold text-text">{t(`vr.transportMenu.worlds.${w.id}.name`)}</span>
              <span className="text-xs text-text-muted">{t(`vr.transportMenu.worlds.${w.id}.desc`)}</span>
              {!w.available && (
                <span className="mt-0.5 rounded-full bg-border/50 px-2 py-0.5 text-[10px] text-text-muted">{t('vr.transportMenu.locked')}</span>
              )}
            </button>
          ))}
        </div>

        <p className="mt-4 text-center text-xs text-text-muted">
          {t('vr.transportMenu.hintPrefix')} <kbd className="rounded bg-border px-1 py-0.5 font-mono text-[10px]">Esc</kbd> {t('vr.transportMenu.hintSuffix')}
        </p>
      </div>
    </div>
  )
}

// Top-down overview of the campus: the plaza, every NPC's zone, and a live
// marker for the player's position. Opened/closed with the M key.
// NPCs and points of interest that really exist (and are walkable-to) in the
// live Campus right now — kept in sync by hand with World()'s render list
// below. VR_NPCS (flat-mission, battle and quest NPCs) were reactivated
// near spawn, so they show up here too now.
const MAP_NPCS = [OLIVER_NPC, EINSTEIN_NPC, JAFET_NPC, ...VR_NPCS]

// WoW-style world map: bigger, labeled zones, real NPC pins, and the
// location-based interactables (daily reward chest, hacker terminal, the
// announcements screen) instead of the old bare terrain sketch.
// How far you can zoom into the WorldMap — 1 shows the whole circular
// campus, MAX_MAP_ZOOM crops in close enough to actually read building
// labels/NPC names instead of the tiny full-map view this used to be stuck at.
const MIN_MAP_ZOOM = 1
const MAX_MAP_ZOOM = 8

function WorldMap({ open, onClose, playerPositionRef, playerRotationRef }) {
  const { t } = useI18n()
  const playerMarkerRef = useRef(null)
  const playerArrowRef = useRef(null)
  const svgWrapRef = useRef(null)
  const dragRef = useRef(null)
  const canClaimDaily = useDailyRewardsStore((s) => s.canClaim)
  const dailyClaimable = open ? canClaimDaily() : false
  // Start already zoomed in a bit — the old 1:1 full-campus view was the
  // "no veo nada" complaint, everything was too small to read.
  const [zoom, setZoom] = useState(2.2)
  const [pan, setPan] = useState({ x: 0, z: 0 })

  const baseHalf = GROUND_RADIUS + 5
  const half = baseHalf / zoom
  const clampPan = (p) => ({
    x: Math.min(GROUND_RADIUS, Math.max(-GROUND_RADIUS, p.x)),
    z: Math.min(GROUND_RADIUS, Math.max(-GROUND_RADIUS, p.z)),
  })
  const viewBox = `${pan.x - half} ${pan.z - half} ${half * 2} ${half * 2}`

  const centerOnPlayer = () => {
    const pos = playerPositionRef?.current
    if (pos) setPan(clampPan({ x: pos.x, z: pos.z }))
  }

  // Re-center on the player every time the map opens, so it always starts
  // zoomed in on where you actually are instead of the world origin.
  useEffect(() => {
    if (open) centerOnPlayer()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  useEffect(() => {
    if (!open) return
    let raf
    const update = () => {
      const pos = playerPositionRef.current
      if (pos) {
        if (playerMarkerRef.current) {
          playerMarkerRef.current.setAttribute('cx', pos.x.toFixed(2))
          playerMarkerRef.current.setAttribute('cy', pos.z.toFixed(2))
        }
        if (playerArrowRef.current) {
          const deg = ((playerRotationRef?.current ?? 0) * 180) / Math.PI
          playerArrowRef.current.setAttribute('transform', `translate(${pos.x.toFixed(2)}, ${pos.z.toFixed(2)}) rotate(${deg.toFixed(1)})`)
        }
      }
      raf = requestAnimationFrame(update)
    }
    raf = requestAnimationFrame(update)
    return () => cancelAnimationFrame(raf)
  }, [open, playerPositionRef, playerRotationRef])

  if (!open) return null

  const handleWheel = (e) => {
    e.preventDefault()
    setZoom((z) => Math.min(MAX_MAP_ZOOM, Math.max(MIN_MAP_ZOOM, z * (e.deltaY < 0 ? 1.18 : 1 / 1.18))))
  }
  const handlePointerDown = (e) => {
    e.currentTarget.setPointerCapture?.(e.pointerId)
    dragRef.current = { x: e.clientX, y: e.clientY, panX: pan.x, panZ: pan.z }
  }
  const handlePointerMove = (e) => {
    if (!dragRef.current) return
    const rect = svgWrapRef.current?.getBoundingClientRect()
    if (!rect) return
    const worldPerPixel = (half * 2) / rect.width
    const dx = (e.clientX - dragRef.current.x) * worldPerPixel
    const dy = (e.clientY - dragRef.current.y) * worldPerPixel
    setPan(clampPan({ x: dragRef.current.panX - dx, z: dragRef.current.panZ - dy }))
  }
  const handlePointerUp = (e) => {
    dragRef.current = null
    e.currentTarget.releasePointerCapture?.(e.pointerId)
  }

  return (
    <div
      className="absolute inset-0 z-30 flex items-center justify-center bg-background/80 backdrop-blur-sm"
      onClick={onClose}
      onContextMenu={(e) => e.preventDefault()}
    >
      <div
        className="relative rounded-2xl bg-surface p-4 shadow-2xl"
        style={{ border: '3px solid #c9a227', boxShadow: '0 0 50px rgba(201,162,39,0.3)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-2 flex items-center justify-between gap-6">
          <p className="text-sm font-bold" style={{ color: '#e8c477' }}>{t('vr.worldMap.title')}</p>
          <button type="button" onClick={onClose} className="text-text-muted hover:text-text" aria-label={t('vr.worldMap.closeAria')}>
            ✕
          </button>
        </div>
        {/* Circular viewport — rueda del mouse o pinch para zoom, arrastra para mover */}
        <div
          ref={svgWrapRef}
          className="relative h-[78vh] w-[78vh] max-w-[88vw] overflow-hidden rounded-full"
          style={{ border: '4px solid #c9a227', cursor: dragRef.current ? 'grabbing' : 'grab', touchAction: 'none' }}
          onWheel={handleWheel}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
        <svg
          viewBox={viewBox}
          className="block h-full w-full"
        >
          {/* Summer grass ground */}
          <circle cx="0" cy="0" r={GROUND_RADIUS} fill="#4a8a3a" />
          <circle cx="0" cy="0" r="58" fill="#5ea848" opacity="0.4" />

          {/* Surrounding forest belt, thinned around the functional zones */}
          <circle cx="-90" cy="-60" r="30" fill="#2d6a22" opacity="0.6" />
          <circle cx="90" cy="-60" r="30" fill="#2d6a22" opacity="0.6" />
          <circle cx="-90" cy="60" r="22" fill="#2d6a22" opacity="0.55" />
          <circle cx="90" cy="60" r="22" fill="#2d6a22" opacity="0.55" />
          <text x="-90" y="-60" fontSize="2.4" textAnchor="middle" fill="#dff0d0" opacity="0.8">{t('vr.worldMap.forest')}</text>

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
          <text x="0" y="13" fontSize="2.3" textAnchor="middle" fill="#f0ece0" opacity="0.9">{t('vr.worldMap.plaza')}</text>
          {/* Maple leaf monument */}
          <circle cx="-7" cy="0" r="2.0" fill="#d52b1e" opacity="0.9" />
          <text x="-7" y="0.5" fontSize="3.5" textAnchor="middle" dominantBaseline="middle">🍁</text>
          {/* Fountain */}
          <circle cx="7" cy="0" r="2.2" fill="#2888cc" opacity="0.9" />

          {/* Academic buildings */}
          {CAMPUS_ACADEMIC.map(({ pos, color, w, d, name, label }) => {
            const [bx, , bz] = pos
            const localName = t(`vr.worldMap.buildings.${CAMPUS_BUILDING_I18N_KEY[name]}`)
            return (
              <g key={name}>
                <title>{localName}</title>
                <rect x={bx - w / 2} y={bz - d / 2} width={w} height={d} fill={color} opacity="0.82" rx="0.8" />
                <rect x={bx - w / 2} y={bz - d / 2} width={w} height={d} fill="none" stroke="#d52b1e" strokeWidth="0.6" opacity="0.5" rx="0.8" />
                <text x={bx} y={bz + 0.6} fontSize="4.5" textAnchor="middle" dominantBaseline="middle">{label}</text>
                <text x={bx} y={bz + d / 2 + 3.5} fontSize="2.2" textAnchor="middle" fill="#f0ece0" opacity="0.95">{localName}</text>
              </g>
            )
          })}

          {/* Dormitory blocks */}
          {CAMPUS_DORMS.map(({ pos, color }, i) => {
            const [bx, , bz] = pos
            return (
              <g key={i}>
                <title>{t('vr.worldMap.dorms')}</title>
                <rect x={bx - 3.5} y={bz - 6} width={7} height={12} fill={color} opacity="0.70" rx="0.4" />
                <rect x={bx - 3.5} y={bz - 6} width={7} height={1.5} fill="#d52b1e" opacity="0.45" rx="0.3" />
              </g>
            )
          })}
          <text x="60" y="68" fontSize="2.2" textAnchor="middle" fill="#f0ece0" opacity="0.85">{t('vr.worldMap.dorms')}</text>
          <text x="-60" y="68" fontSize="2.2" textAnchor="middle" fill="#f0ece0" opacity="0.85">{t('vr.worldMap.dorms')}</text>

          {/* NPCs that are really walkable-to in the live Campus */}
          {MAP_NPCS.map((npc) => {
            const [x, , z] = npc.position
            return (
              <g key={npc.id}>
                <title>{npc.name}</title>
                <circle cx={x} cy={z} r="1.6" fill={npc.bubbleColor ?? '#fde68a'} opacity="0.95" stroke="#1a1410" strokeWidth="0.4" />
                <text x={x} y={z - 2.6} fontSize="3" textAnchor="middle">{npc.emoji}</text>
              </g>
            )
          })}

          {/* Daily reward chest — pulses with a quest-style "!" when claimable */}
          <g>
            <title>{dailyClaimable ? t('vr.worldMap.dailyRewardAvailable') : t('vr.worldMap.dailyRewardClaimed')}</title>
            <circle cx={REWARD_BOX_POS.x} cy={REWARD_BOX_POS.z} r="1.6" fill="#fbbf24" opacity={dailyClaimable ? 0.95 : 0.5} stroke="#1a1410" strokeWidth="0.4" />
            <text x={REWARD_BOX_POS.x} y={REWARD_BOX_POS.z + 0.5} fontSize="2.6" textAnchor="middle" dominantBaseline="middle">🎁</text>
            {dailyClaimable && (
              <text x={REWARD_BOX_POS.x} y={REWARD_BOX_POS.z - 3} fontSize="3.4" textAnchor="middle" fill="#facc15" className="animate-bounce" style={{ textShadow: '0 0 6px #f59e0b' }}>❗</text>
            )}
          </g>

          {/* Hacker-class computer terminal */}
          <g>
            <title>{t('vr.worldMap.hackerTerminal')}</title>
            <circle cx={COMPUTER_POS.x} cy={COMPUTER_POS.z} r="1.4" fill="#22c55e" opacity="0.85" stroke="#1a1410" strokeWidth="0.4" />
            <text x={COMPUTER_POS.x} y={COMPUTER_POS.z + 0.5} fontSize="2.4" textAnchor="middle" dominantBaseline="middle">💻</text>
          </g>
          <g>
            <title>{t('vr.worldMap.hackerTerminal')}</title>
            <circle cx={COMPUTER_POS_SPAWN.x} cy={COMPUTER_POS_SPAWN.z} r="1.4" fill="#22c55e" opacity="0.85" stroke="#1a1410" strokeWidth="0.4" />
            <text x={COMPUTER_POS_SPAWN.x} y={COMPUTER_POS_SPAWN.z + 0.5} fontSize="2.4" textAnchor="middle" dominantBaseline="middle">💻</text>
          </g>

          {/* Announcements / video screen, north of the plaza */}
          <g>
            <title>{t('vr.worldMap.announcementsScreen')}</title>
            <circle cx="0" cy="-28" r="1.4" fill="#a78bfa" opacity="0.85" stroke="#1a1410" strokeWidth="0.4" />
            <text x="0" y="-27.5" fontSize="2.4" textAnchor="middle" dominantBaseline="middle">📺</text>
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

          {/* Player position marker (live) + facing arrow */}
          <circle ref={playerMarkerRef} cx="0" cy="0" r="2.2" fill="#e74c3c" stroke="#fff" strokeWidth="0.55" />
          <path ref={playerArrowRef} d="M 0,-4.4 L 1.7,-1 L -1.7,-1 Z" fill="#e74c3c" stroke="#fff" strokeWidth="0.3" />
        </svg>
        </div>
        <div className="pointer-events-none absolute right-6 top-[4.2rem] flex flex-col gap-1.5">
          <button
            type="button"
            onClick={() => setZoom((z) => Math.min(MAX_MAP_ZOOM, z * 1.4))}
            className="pointer-events-auto flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-lg font-bold text-white shadow hover:bg-black/80"
            aria-label={t('vr.worldMap.zoomInAria')}
          >
            +
          </button>
          <button
            type="button"
            onClick={() => setZoom((z) => Math.max(MIN_MAP_ZOOM, z / 1.4))}
            className="pointer-events-auto flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-lg font-bold text-white shadow hover:bg-black/80"
            aria-label={t('vr.worldMap.zoomOutAria')}
          >
            −
          </button>
          <button
            type="button"
            onClick={centerOnPlayer}
            className="pointer-events-auto flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-sm text-white shadow hover:bg-black/80"
            aria-label={t('vr.worldMap.centerAria')}
            title={t('vr.worldMap.centerAria')}
          >
            🎯
          </button>
        </div>
        <div className="mt-2 flex flex-wrap items-center justify-center gap-3 text-[11px] text-text-muted">
          <span>{t('vr.worldMap.legendNpc')}</span>
          <span>{t('vr.worldMap.legendDailyReward')}</span>
          <span>{t('vr.worldMap.legendTerminal')}</span>
          <span>{t('vr.worldMap.legendAnnouncements')}</span>
          <span className="text-[#e74c3c]">{t('vr.worldMap.legendYou')}</span>
        </div>
        <p className="mt-1 text-center text-xs text-text-muted">
          {t('vr.worldMap.footerBefore')} <strong>M</strong> {t('vr.worldMap.footerMid')} <strong>📜 {t('vr.worldMap.missionsWord')}</strong> {t('vr.worldMap.footerAfter')}
        </p>
      </div>
    </div>
  )
}

// ── Class Preview Card — shown when player nears a class node in WorldTree ─────
function ClassPreviewCard({ classId, step, playerClass, oliverClass, isAdmin, onSelectPlayer, onSelectOliver, onClose }) {
  const { t } = useI18n()
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
          <p className="text-xs font-bold uppercase tracking-widest text-text-muted">{t('vr.classPreview.chooseOliverTitle')}</p>
          <p className="mt-0.5 text-sm text-text-muted">{t('vr.classPreview.yourClass')} <strong style={{ color: cls.color }}>{cls.icon} {cls.name}</strong></p>
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
                <span className="rounded-full bg-primary/20 px-1.5 py-0.5 text-[9px] font-bold text-primary">{t('vr.classPreview.synergy')}</span>
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
        <p className="mb-1.5 text-[9px] font-bold uppercase tracking-widest text-text-muted">{t('vr.classPreview.startingSkills')}</p>
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
          {t('vr.classPreview.choose', { name: cls.name })}
        </button>
      </div>
    </div>
  )
}

// CharSwitcherHud (cambio Avatar ↔ Mascota) se movió a ./CharSwitcherHud.jsx
// para compartirlo con el Templo tutorial (VrArbol).

// roomMode / anfiteatroMode / worldTreeMode come from the route.
export default function VRPage({ roomMode = false, anfiteatroMode = false, worldTreeMode = false, testMode = false }) {
  const { t, lang } = useI18n()
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
  const isPrivateWorld = roomMode || anfiteatroMode || worldTreeMode || testMode
  const vrAvatarId = useGameStore((s) => s.player.avatarId)
  // Admin's hour/season/weather (DevToolsPanel) is mirrored to every
  // connected player via VR presence — see useVrMultiplayer's worldState
  // track payload. Selected here as plain primitives (not one object) so
  // the hook's re-track effect can depend on them by value.
  const isAdminForWorldState = useAuthStore((s) => s.isAdmin())
  const dnMode = useDayNightStore((s) => s.mode)
  const dnManualBaseHour = useDayNightStore((s) => s.manualBaseHour)
  const dnManualBaseAtMs = useDayNightStore((s) => s.manualBaseAtMs)
  const dnSeason = useDayNightStore((s) => s.season)
  const dnWeather = useDayNightStore((s) => s.weather)
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
    isAdmin: isAdminForWorldState,
    dnMode,
    dnManualBaseHour,
    dnManualBaseAtMs,
    dnSeason,
    dnWeather,
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
  const [nearComputer2, setNearComputer2] = useState(false)
  const [terminal2Open, setTerminal2Open] = useState(false)
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
  const patchAlreadySeen = useSeenStore.getState().patchVersion === LATEST_VERSION
  // Ya NO se auto-abre al entrar (ni encadenada al cerrar el tablón de
  // anuncios, ni de entrada si el tablón ya se había visto antes) — dos
  // modales de pantalla completa apenas cargar el mundo es justo lo que se
  // reportó como "popups gigantes que tapan todo" en móvil. Sigue siendo
  // alcanzable por su cuenta: el aviso de cercanía (nearDailyReward) o el
  // botón de regalo del HUD.
  const [dailyRewardsOpen, setDailyRewardsOpen] = useState(false)
  const [bagsOpen, setBagsOpen] = useState(false)
  const [friendsOpen, setFriendsOpen] = useState(false)
  const [arenaConfirmOpen, setArenaConfirmOpen] = useState(false)
  const [abilityTesterOpen, setAbilityTesterOpen] = useState(false)
  const [chestOpen, setChestOpen] = useState(false)
  const [phoneOpen, setPhoneOpen] = useState(false)
  // Fall-into-the-void rescue: { x, y, z } of where the player fell, used to
  // show Oliver (orange cat) "arriving" there for a moment. null = no rescue
  // in progress.
  const [rescuePos, setRescuePos] = useState(null)

  // Fired by <FallRescueTracker> when the player drops below the map (an
  // unfinished/holey area with no floor) — teleports them back to the plaza
  // spawn, shows Oliver rescuing them, and announces it in world chat (local
  // + broadcast to everyone, doubling as a live test of global announcements).
  const handleFallRescue = (fallPos) => {
    const text = t('vr.combat.fellIntoVoid', { name: chatAuthor })
    useWorldChatStore.getState().sendMessage('Sistema', text, { authorId: playerId })
    sendChatMessage('Sistema', text)
    // Same spot as the campus spawn point (Gran Aula's front edge) — the old
    // open-plaza coordinate used to land rescued players in a broken/unfinished
    // patch of the map where they'd get stuck again right after being rescued.
    useVrCharacterStore.getState().setTeleportTo({ x: 0, y: 0.2, z: -53 })
    setRescuePos(fallPos)
    setTimeout(() => setRescuePos(null), 3500)
  }
  // Shown once per ACCOUNT (see useSeenStore) on VR entry; closing it auto-opens the daily reward.
  const [showAnnouncements, setShowAnnouncements] = useState(!patchAlreadySeen)
  const [showHint, setShowHint] = useState(() => !localStorage.getItem('vr-hint-seen'))
  const [chatPrefill, setChatPrefill] = useState(null)
  const [selectedPlayer, setSelectedPlayer] = useState(null)
  const friends = useFriendsStore((s) => s.friends)
  const addFriend = useFriendsStore((s) => s.addFriend)
  const removeFriend = useFriendsStore((s) => s.removeFriend)
  const players = useVrPresenceStore((s) => s.players)
  const whisperTarget = useWorldChatStore((s) => s.whisperTarget)
  const accepted = useGlobalMissionsStore((s) => s.accepted)
  const claimed = useGlobalMissionsStore((s) => s.claimed)
  const acceptMission = useGlobalMissionsStore((s) => s.acceptMission)
  const claimReward = useGlobalMissionsStore((s) => s.claimReward)
  const missionState = useMissionState()
  const questsActive = useQuestsStore((s) => s.active)
  const questsCompleted = useQuestsStore((s) => s.completed)
  const acceptQuest = useQuestsStore((s) => s.acceptQuest)
  const advanceQuestStep = useQuestsStore((s) => s.advanceStep)
  const claimQuestReward = useQuestsStore((s) => s.claimReward)
  const [bashTerminalStep, setBashTerminalStep] = useState(null)
  const openLocked = useMascotCompanionStore((s) => s.openLocked)
  const flashlightOn = useItemEffectsStore((s) => s.activeItems['linterna'])
  const flashlightPurchased = useShopStore((s) => s.purchased.includes('linterna'))

  // Chat TTS — speak every world-chat message out loud, the local player's
  // own as well as everyone else's, so chat doubles as a voice substitute
  // (the local player's voice pitch/rate differs by active character;
  // everyone else gets a neutral voice since we don't know their character).
  const worldMessages = useWorldChatStore((s) => s.messages)
  const lastSpokenMsgRef = useRef(null)
  useEffect(() => {
    if (!worldMessages.length) return
    const last = worldMessages[worldMessages.length - 1]
    if (!last || last.id === lastSpokenMsgRef.current) return
    if (last.whisperTo || last.whisperFrom) return // don't TTS private whispers
    lastSpokenMsgRef.current = last.id
    if (!useVrSettingsStore.getState().npcVoice || !window.speechSynthesis) return
    const clean = last.text.replace(/[\u{1F300}-\u{1FFFF}]/gu, '').replace(/[^\w\s.,!?¿¡]/g, '').trim()
    if (!clean) return
    window.speechSynthesis.cancel()
    const utt = new SpeechSynthesisUtterance(clean)
    const isOwnMessage = last.authorId === playerId
    const isMascotActive = isOwnMessage && useVrCharacterStore.getState().activeChar === 'mascot'
    utt.lang = lang === 'en' ? 'en-US' : 'es-ES'
    utt.rate = isMascotActive ? 1.15 : 1.0
    utt.pitch = isMascotActive ? 1.45 : 1.0
    window.speechSynthesis.speak(utt)
  }, [worldMessages, playerId, lang])

  useEffect(() => {
    if (nearbyNpcId !== activeNpcId) setActiveNpcId(null)
  }, [nearbyNpcId, activeNpcId])

  useEffect(() => {
    if (motdSentRef.current) return
    motdSentRef.current = true
    const motd = anfiteatroMode
      ? t('vr.combat.motdAnfiteatro', { name: chatAuthor })
      : roomMode
        ? t('vr.combat.motdRoom', { name: chatAuthor })
        : t('vr.combat.motdCampus', { name: chatAuthor })
    useWorldChatStore.getState().addSystemMessage(motd)
    // The instructions above are local-only (for the joining player). Other
    // already-connected players get a short generic announcement instead —
    // otherwise everyone would hear/see this player's own "how to" text.
    sendChatMessage('Sistema', t('vr.combat.userJoined'))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Gamepad (Xbox or anything else the browser maps to the standard layout)
  // already drives movement/camera via applyGamepadInput — this just gives
  // visible confirmation it was detected, since pairing a controller is
  // otherwise silent.
  useEffect(() => {
    const announce = (e) => {
      useWorldChatStore.getState().addSystemMessage(t('vr.combat.gamepadConnected', { id: e.gamepad.id }))
    }
    const announceLost = (e) => {
      useWorldChatStore.getState().addSystemMessage(t('vr.combat.gamepadDisconnected', { id: e.gamepad.id }))
    }
    window.addEventListener('gamepadconnected', announce)
    window.addEventListener('gamepaddisconnected', announceLost)
    // Some browsers/controllers only ever fire 'gamepadconnected' for pads
    // paired before this listener was added — check once on mount too.
    const already = navigator.getGamepads?.() ?? []
    for (const pad of already) {
      if (pad?.connected) {
        useWorldChatStore.getState().addSystemMessage(t('vr.combat.gamepadDetected', { id: pad.id }))
        break
      }
    }
    return () => {
      window.removeEventListener('gamepadconnected', announce)
      window.removeEventListener('gamepaddisconnected', announceLost)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 'E' near a portal, idle NPC, or daily reward box
  useEffect(() => {
    const handleDown = (e) => {
      if (isTypingTarget(e.target)) return
      if (e.key === 'Escape') { setPortalMenuOpen(false); setActiveNpcId(null); return }
      if (e.key.toLowerCase() === 'f') { useItemEffectsStore.getState().toggleItem('linterna'); return }
      if (e.key.toLowerCase() === 'e') {
        if (nearDailyReward) { setDailyRewardsOpen(true); return }
        if (nearComputer && (playerClass === 'programmer' || playerClass === 'hacker' || isAdmin)) { setTerminalOpen(true); return }
        if (nearComputer2 && (playerClass === 'programmer' || playerClass === 'hacker' || isAdmin)) { setTerminal2Open(true); return }
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
  }, [nearPortal, nearDailyReward, nearComputer, nearComputer2, nearbyNpcId, isPrivateWorld, navigate, playerClass, isAdmin])

  // Muestra en el chat del mundo el resultado de un golpe/habilidad — mismo
  // formato para el "golpe" universal y para cualquier habilidad de la barra.
  // Antes, si no había ningún monstruo en rango, attackNearest devolvía null
  // y esta función no hacía NADA — ni un mensaje — por eso una habilidad
  // usada lejos de un monstruo parecía completamente rota. Ahora siempre
  // avisa por qué no pasó nada.
  const reportAttackResult = useCallback((result, label) => {
    if (!result.ok) {
      if (result.reason === 'no-target') {
        useWorldChatStore.getState().addSystemMessage(t('vr.combat.noTargetNearby', { label }))
      }
      return
    }
    if (result.missed) {
      useWorldChatStore.getState().addSystemMessage(t('vr.combat.missed', { label, mob: result.mobName }))
      return
    }
    const critTag = result.crit ? t('vr.combat.critTag') : ''
    if (result.killed) {
      const itemMsg = result.item ? ` + ${result.item.icon} ${result.item.name}` : ''
      const xpMsg = result.xp > 0 ? ` + ✨${result.xp} XP` : ''
      useWorldChatStore.getState().addSystemMessage(
        t('vr.combat.killed', { mob: result.mobName, crit: critTag, coins: formatCurrency(result.coins), xp: xpMsg, item: itemMsg }),
      )
    } else {
      useWorldChatStore.getState().addSystemMessage(
        t('vr.combat.hit', { label, mob: result.mobName, damage: result.damage, crit: critTag, hp: result.hp, maxHp: result.maxHp }),
      )
    }
  }, [t])

  // Daño base + crítico base de la clase activa, para golpe y habilidades —
  // seguimos sin un sistema real de stats de arma/poder de ataque como el de
  // world-of-claudecraft, así que 'power'/'creativity' (ya en useGameStore)
  // hacen de aproximación. Lo que SÍ es real es cómo se aplica: ver
  // combatFormulas.js (armadura, fallo, crítico, XP portados de su motor).
  const classDamageProfile = useCallback(() => {
    const cls = PLAYER_CLASSES[playerClass]
    return {
      baseDamage: 8 + (cls?.stats?.power ?? 3) * 3,
      baseCrit: 0.05 + (cls?.stats?.creativity ?? 2) * 0.01,
    }
  }, [playerClass])

  // Ejecuta lo que hace cada habilidad de la barra (1-8) al hacer clic — ver
  // SKILL_REGISTRY[id].effect y VrHud's SkillBar/SkillBtn (onUseSkill).
  // 'melee'/'ranged' dañan al monstruo más cercano (con proyectil visual para
  // 'ranged', y con posibilidad real de fallar o de crítico); 'utility'
  // (sanación, escudos, transformaciones) todavía no tiene su propio sistema
  // — el mundo VR aún no permite que un monstruo dañe al jugador, así que
  // solo avisa en el chat por ahora.
  const handleUseSkill = useCallback((skillId) => {
    const skill = SKILL_REGISTRY[skillId]
    const pos = playerPositionRef.current
    if (!skill?.effect || !pos) {
      useWorldChatStore.getState().addSystemMessage(t('vr.combat.usedSkill', { icon: skill?.icon ?? '✨', name: skill?.name ?? skillId }))
      return
    }
    const { kind, power = 1 } = skill.effect
    if (kind === 'utility') {
      useWorldChatStore.getState().addSystemMessage(t('vr.combat.utilitySoon', { icon: skill.icon, name: skill.name }))
      return
    }
    const { baseDamage, baseCrit } = classDamageProfile()
    // Los hechizos a distancia alcanzan mucho más lejos que el golpe cuerpo a
    // cuerpo — si no, "a distancia" no significaba nada en la práctica.
    const range = kind === 'ranged' ? 16 : undefined
    const result = useMobStore.getState().attackNearest(
      pos, level, Math.round(baseDamage * power), baseCrit,
      { color: skill.vfxColor, ranged: kind === 'ranged' }, range,
    )
    reportAttackResult(result, `${skill.icon} ${skill.name}`)
  }, [level, classDamageProfile, reportAttackResult, t])

  useWorldShortcuts({
    onToggleMap: () => setMapOpen((open) => !open),
    onOpenCharacter: () => openLocked('mascota-chat', 'mascota'),
    onOpenInventory: () => openLocked('avatar-personaje', 'avatar'),
    onToggleChat: (value) => setChatOpen((open) => (typeof value === 'boolean' ? value : !open)),
    onAttack: () => {
      attackFiredAtRef.current = Date.now()
      sendAction(playerClass)

      // Combate v1: el "golpe" ahora hace daño real a los Bug de Código
      // instanciados (ver MobField/useMobStore), con fallo/crítico/armadura
      // reales — cada clase pega distinto según su stat de 'power'.
      const pos = playerPositionRef.current
      if (!pos) return
      const { baseDamage, baseCrit } = classDamageProfile()
      const result = useMobStore.getState().attackNearest(pos, level, baseDamage, baseCrit)
      reportAttackResult(result, t('vr.combat.meleeLabel'))
    },
    onUseWeapon: () => {
      if (playerClass === 'hacker') {
        setTerminalOpen(true)
      } else {
        useWorldChatStore.getState().addSystemMessage(t('vr.combat.weaponNotAssigned'))
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
    const hintTimer = setTimeout(() => {
      localStorage.setItem('vr-hint-seen', '1')
      setShowHint(false)
    }, 12000)
    return () => clearTimeout(hintTimer)
  }, [showHint])

  // Lighting themes per world mode
  const bgColor = anfiteatroMode ? '#0a0810' : roomMode ? '#3d2a1c' : worldTreeMode ? '#05120a' : '#90c8e8'
  const fogArgs = anfiteatroMode ? ['#0a0810', 20, 90] : roomMode ? ['#3d2a1c', 12, 36] : worldTreeMode ? ['#05120a', 35, 100] : ['#d4c8b0', 45, 150]

  return (
    <div className="flex h-dvh flex-col bg-background text-text">
      {/* variant="course": la barra completa (menú + marquee) le robaba
          demasiada altura al canvas 3D en móvil, sobre todo en horizontal —
          mismo header compacto de una sola fila que ya usan las clases,
          siempre visible pero mínimo, con un link directo de vuelta al
          Dashboard. */}
      <AppTopBar variant="course" />
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
          // Techo de dpr más bajo en pantallas angostas: en un celular gama
          // media/baja, renderizar a 1.5x la densidad de píxeles reales es
          // caro (más aún con post-procesado activo) — no todos los que
          // entren van a tener un teléfono potente. 1x sigue viéndose nítido
          // en una pantalla física pequeña; el ahorro de GPU es real.
          dpr={typeof window !== 'undefined' && window.innerWidth < 768 ? 1 : [1, 1.5]}
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
            bloomIntensity={anfiteatroMode ? 0.5 : roomMode ? 0.4 : worldTreeMode ? 0.35 : 0.22}
            vignetteDarkness={0.38}
            multisampling={0}
          />
          {/* Campus: DayNightCycle owns all lighting + streetlamps + sky color */}
          <DayNightCycle campusMode={!anfiteatroMode && !roomMode && !worldTreeMode} />
          {flashlightOn && flashlightPurchased && (
            <FlashlightSpot playerPositionRef={playerPositionRef} cameraRef={cameraRef} />
          )}
          {/* Non-campus modes: static lighting (intensity 0 in campus so they don't stack) */}
          <ambientLight
            intensity={anfiteatroMode ? 0.25 : roomMode ? 0.55 : worldTreeMode ? 1.4 : 0}
            color={anfiteatroMode ? '#c0a0ff' : roomMode ? '#ffcc88' : worldTreeMode ? '#ccffdd' : '#000000'}
          />
          <directionalLight
            position={[20, 30, 10]}
            intensity={anfiteatroMode ? 0.6 : roomMode ? 0.4 : worldTreeMode ? 1.0 : 0}
            color={anfiteatroMode ? '#ffffff' : roomMode ? '#ffaa44' : worldTreeMode ? '#ccffe8' : '#000000'}
          />
          {roomMode && <directionalLight position={[0, 2, -8]} intensity={0.7} color="#ff7722" />}
          {anfiteatroMode && <directionalLight position={[0, ANFI_H - 1, ANFI_STAGE_Z]} intensity={1.2} color="#fff5cc" />}
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
              onNearComputer2Change={setNearComputer2}
              attackFiredAtRef={attackFiredAtRef}
              playerClass={playerClass}
              onOpenVideoScreen={() => setVideoScreenOpen(true)}
              authorName={chatAuthor}
              playerId={playerId}
              onSelectPlayer={setSelectedPlayer}
              worldTreeMode={worldTreeMode}
              roomMode={roomMode}
              anfiteatroMode={anfiteatroMode}
              testMode={testMode}
            />
            {/* Parked companion mesh when follow mode is off */}
            <StayedCompanion mascot={mascot} skin={skin} avatarId={vrAvatarId} />
            <FallRescueTracker playerPositionRef={playerPositionRef} onFall={handleFallRescue} />
            {rescuePos && <FallRescueCat position={rescuePos} />}
          </Suspense>
          </Physics>
        </Canvas>}

        {/* GLB asset progress — slim bar while models stream in after Canvas mounts */}
        {vrReady && <VrAssetProgress />}

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
            {t('vr.prompts.talkTo', { name: (IDLE_NPC_CONFIGS[nearbyNpcId] ?? getVrNpcById(nearbyNpcId))?.name })}
          </button>
        )}

        {/* Daily reward box prompt */}
        {nearDailyReward && !dailyRewardsOpen && (
          <button
            type="button"
            onClick={() => setDailyRewardsOpen(true)}
            className="absolute bottom-32 left-1/2 -translate-x-1/2 cursor-pointer rounded-full bg-surface/95 px-4 py-1.5 text-xs font-semibold text-text shadow-lg backdrop-blur transition-colors hover:bg-surface sm:bottom-28"
          >
            {t('vr.prompts.claimDaily')}
          </button>
        )}

        {/* Computer terminal prompt — only for the Programador class (or admin) */}
        {nearComputer && !terminalOpen && (playerClass === 'programmer' || playerClass === 'hacker' || isAdmin) && (
          <button
            type="button"
            onClick={() => setTerminalOpen(true)}
            className="absolute bottom-32 left-1/2 -translate-x-1/2 cursor-pointer rounded-full bg-surface/95 px-4 py-1.5 text-xs font-semibold text-text shadow-lg backdrop-blur transition-colors hover:bg-surface sm:bottom-28"
          >
            {t('vr.prompts.useTerminal')}
          </button>
        )}

        {/* Segunda terminal, cerca del spawn */}
        {nearComputer2 && !terminal2Open && (playerClass === 'programmer' || playerClass === 'hacker' || isAdmin) && (
          <button
            type="button"
            onClick={() => setTerminal2Open(true)}
            className="absolute bottom-32 left-1/2 -translate-x-1/2 cursor-pointer rounded-full bg-surface/95 px-4 py-1.5 text-xs font-semibold text-text shadow-lg backdrop-blur transition-colors hover:bg-surface sm:bottom-28"
          >
            {t('vr.prompts.useTerminal')}
          </button>
        )}

        {/* Portal prompt — clickable button when near a portal */}
        {nearPortal && !portalMenuOpen && (
          <button
            type="button"
            onClick={() => isPrivateWorld ? navigate('/vr') : setPortalMenuOpen(true)}
            className="absolute bottom-24 left-1/2 -translate-x-1/2 cursor-pointer rounded-full bg-surface/95 px-4 py-1.5 text-xs font-semibold text-text shadow-lg backdrop-blur transition-colors hover:bg-surface sm:bottom-20"
          >
            {isPrivateWorld ? t('vr.prompts.returnToCampus') : t('vr.prompts.openPortal')}
          </button>
        )}

        {/* Transport destination picker — opens when clicking/pressing E at campus portal */}
        {portalMenuOpen && !isPrivateWorld && (
          <TransportMenu onNavigate={(path) => navigate(path)} onClose={() => setPortalMenuOpen(false)} />
        )}

        {/* NPC mission card / nearby-NPC hint (campus, and el Mapa de Pruebas
            so admins can test NPC missions there too — the other private
            worlds are 1-player rooms with no real NPCs to show one for) */}
        {(!isPrivateWorld || testMode) && (
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
                questsActive={questsActive}
                questsCompleted={questsCompleted}
                onAcceptQuest={acceptQuest}
                onAdvanceQuest={advanceQuestStep}
                onClaimQuest={claimQuestReward}
                onOpenBashTerminal={setBashTerminalStep}
                onClose={() => setActiveNpcId(null)}
              />
            )
          ) : null
        )}

        {/* Presentation video screen modal */}
        {videoScreenOpen && <VideoScreenModal onClose={() => setVideoScreenOpen(false)} />}

        {!isPrivateWorld && (
          <WorldMap open={mapOpen} onClose={() => setMapOpen(false)} playerPositionRef={playerPositionRef} playerRotationRef={playerRotationRef} />
        )}
        {hudVisible && (
          <WorldChat
            open={chatOpen}
            onClose={() => setChatOpen(false)}
            onOpen={() => setChatOpen(true)}
            authorName={chatAuthor}
            playerId={playerId}
            onSend={sendChatMessage}
            prefill={chatPrefill}
          />
        )}

        {selectedPlayer && (
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
        {canUseVoice && hudVisible && (
          <VoicePanel playerId={playerId} name={chatAuthor} channelRef={channelRef} />
        )}

        {/* Connection status badge — hidden en móvil (below sm): a "right-4
            top-4" choca de frente con el reloj, que vive centrado en
            "top-2" (DayNightClock, VrHud.jsx) — en una pantalla angosta
            ambos textos terminan superpuestos ("a.m." sobre "jugadores
            más"). Mismo criterio que ya usa el minimap (VrMinimap: "hidden
            sm:flex") — es información secundaria, no crítica para jugar. */}
        {hudVisible && !isPrivateWorld && (
          <div className="pointer-events-none absolute right-4 top-4 z-20 hidden rounded-full bg-surface/90 px-3 py-1 text-xs font-semibold text-text shadow-lg backdrop-blur sm:block">
            {isVrRealtimeAvailable() ? (
              connected ? (
                <span>{t('vr.prompts.connected', { count: remotePlayerCount, unit: remotePlayerCount === 1 ? t('vr.prompts.playerSingular') : t('vr.prompts.playerPlural') })}</span>
              ) : (
                <span>{t('vr.prompts.connecting')}</span>
              )
            ) : (
              <span>{t('vr.prompts.offlineMode')}</span>
            )}
          </div>
        )}

        {/* World badge */}
        {hudVisible && anfiteatroMode && (
          <div className="pointer-events-none absolute right-4 top-4 z-20 rounded-full bg-surface/90 px-3 py-1 text-xs font-semibold text-text shadow-lg backdrop-blur">
            {t('vr.prompts.anfiteatroBadge')}
          </div>
        )}
        {hudVisible && roomMode && (
          <div className="pointer-events-none absolute right-4 top-4 z-20 rounded-full bg-surface/90 px-3 py-1 text-xs font-semibold text-text shadow-lg backdrop-blur">
            {t('vr.prompts.roomBadge')}
          </div>
        )}

        {showHint && (
          <div
            className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 rounded-xl bg-surface/90 px-4 py-2 text-center text-xs text-text shadow-lg backdrop-blur sm:text-sm"
            style={{ maxWidth: '90vw' }}
          >
            <strong>{t('vr.hint.moveKeys')}</strong> {t('vr.hint.moveConnector')} · <strong>{t('vr.hint.spaceKey')}</strong> {t('vr.hint.jump')} ·{' '}
            {!isPrivateWorld && <><strong>{t('vr.hint.mapKey')}</strong> {t('vr.hint.map')} · <strong>{t('vr.hint.characterKey')}</strong> {t('vr.hint.character')} · <strong>{t('vr.hint.inventoryKey')}</strong> {t('vr.hint.inventory')} · <strong>{t('vr.hint.chatKey')}</strong> {t('vr.hint.chat')} · </>}
            <strong>{t('vr.hint.interactKey')}</strong> {t('vr.hint.talkPortal')} · {t('vr.hint.look')} · <strong>{t('vr.hint.zoomKey')}</strong> {t('vr.hint.zoom')}
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
          onOpenFriends={() => setFriendsOpen(true)}
          onOpenArenaConfirm={() => setArenaConfirmOpen(true)}
          onOpenCharacterPanel={() => openLocked('avatar-personaje', 'avatar')}
          isPrivateWorld={isPrivateWorld}
          playerPosRef={playerPositionRef}
          onUseSkill={handleUseSkill}
        />
        <LootToast />

        {/* Daily rewards board overlay */}
        {dailyRewardsOpen && (
          <DailyRewardsBoard onClose={() => setDailyRewardsOpen(false)} />
        )}

        {/* WoW-style bags overlay — quick equip/unequip for Avatar + Mascota */}
        {bagsOpen && (
          <BagsPanel onClose={() => setBagsOpen(false)} />
        )}

        {/* Friends list — popup instead of navigating away from the VR world */}
        {friendsOpen && (
          <FriendsPopup
            friends={friends}
            players={players}
            onWhisper={(name) => {
              setChatPrefill({ text: `/w ${name} `, key: Date.now() })
              setChatOpen(true)
              setFriendsOpen(false)
            }}
            onRemoveFriend={removeFriend}
            onClose={() => setFriendsOpen(false)}
          />
        )}

        {/* Arena — not built into the VR world yet, just a heads-up for now */}
        {arenaConfirmOpen && (
          <ArenaConfirmPopup onClose={() => setArenaConfirmOpen(false)} />
        )}

        {/* Tablón de anuncios al iniciar la aventura. Ya NO encadena la
            recompensa diaria justo después de cerrarlo — dos modales de
            pantalla completa seguidos, uno tras otro, apenas se entra al
            mundo, es exactamente lo que se ve como "popups gigantes que
            tapan todo" en móvil. La recompensa diaria se sigue pudiendo
            reclamar con su propio botón/aviso de cercanía, sin forzarla. */}
        {showAnnouncements && (
          <PatchNotesModal
            open
            onClose={() => setShowAnnouncements(false)}
          />
        )}

        {/* Programador terminal — tiered by class/level/admin (see TerminalModal) */}
        {terminalOpen && (
          <TerminalModal
            tier={isAdmin ? 'admin' : level >= 10 ? 'hacker' : 'basic'}
            onClose={() => setTerminalOpen(false)}
            playerPositionRef={playerPositionRef}
          />
        )}
        {terminal2Open && (
          <TerminalModal
            tier={isAdmin ? 'admin' : level >= 10 ? 'hacker' : 'basic'}
            onClose={() => setTerminal2Open(false)}
            playerPositionRef={playerPositionRef}
          />
        )}

        {/* Ability tester — el Mapa de Pruebas only, admin only: try any
            skill from any class/mascot without needing to actually be that
            class first (see AbilityTesterPanel + handleUseSkill above). */}
        {testMode && isAdmin && (
          <button
            type="button"
            onClick={() => setAbilityTesterOpen((v) => !v)}
            className="absolute right-4 top-4 z-20 rounded-full bg-primary/90 px-3 py-1.5 text-xs font-semibold text-background shadow-lg hover:bg-primary"
          >
            {t('vr.buttons.abilityTester')}
          </button>
        )}
        {abilityTesterOpen && (
          <AbilityTesterPanel onUseSkill={handleUseSkill} onClose={() => setAbilityTesterOpen(false)} />
        )}

        {/* Cofre secreto — el Mapa de Pruebas only, admin only: every
            weapon/gear item (EQUIPMENT_REGISTRY) and every Tienda item
            (SHOP_ITEMS), grab any of them straight into your inventory
            without needing the level/class/coins that normally gate them. */}
        {testMode && isAdmin && (
          <button
            type="button"
            onClick={() => setChestOpen((v) => !v)}
            className="absolute right-32 top-4 z-20 rounded-full bg-amber-500/90 px-3 py-1.5 text-xs font-semibold text-background shadow-lg hover:bg-amber-500"
          >
            {t('vr.buttons.chest')}
          </button>
        )}
        {chestOpen && <ChestPanel onClose={() => setChestOpen(false)} />}

        {/* "4 Pared" — teléfono del mundo VR (dashboard/cursos/mensajes
            embebidos, ver FourthWallPhone.jsx). Solo escritorio a propósito:
            el iframe completo dentro del HUD 3D no es usable en pantallas
            táctiles pequeñas. */}
        <button
          type="button"
          onClick={() => setPhoneOpen(true)}
          className="absolute bottom-4 right-4 z-20 hidden items-center gap-1.5 rounded-full bg-surface/90 px-3 py-1.5 text-xs font-semibold text-text shadow-lg backdrop-blur hover:bg-surface md:flex"
        >
          {t('vr.buttons.phone')}
        </button>
        {phoneOpen && <FourthWallPhone onClose={() => setPhoneOpen(false)} />}

        {/* BashMishi's free-text Bash exercise (see questsRegistry.js step.type 'terminal') */}
        {bashTerminalStep && (
          <BashTerminalModal
            checkpoints={bashTerminalStep.step.checkpoints}
            onComplete={() => {
              advanceQuestStep(bashTerminalStep.quest.id)
              setBashTerminalStep(null)
            }}
            onClose={() => setBashTerminalStep(null)}
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
            {t('vr.worldTreeBadge')}
          </div>
        )}

        {/* VR Loading Screen — shown until user presses any key */}
        {!vrReady && (
          <VrLoadingScreen
            onEnter={() => setVrReady(true)}
            worldName={worldTreeMode ? t('vr.worldNames.worldTree') : anfiteatroMode ? t('vr.worldNames.anfiteatro') : roomMode ? t('vr.worldNames.room') : t('vr.worldNames.campus')}
          />
        )}

        <VirtualJoystick keysRef={keysRef} hidden={chatOpen || !hudVisible} />
        <MobileButtons keysRef={keysRef} hidden={chatOpen || !hudVisible} onOpenChat={() => setChatOpen(true)} />

        {kicked && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 p-4 text-center">
            <div className="max-w-sm rounded-2xl bg-surface p-6 shadow-2xl">
              <p className="mb-2 text-3xl">🔌</p>
              <p className="mb-2 text-base font-bold text-text">{t('vr.disconnected.title')}</p>
              <p className="mb-4 text-sm text-text-muted">
                {t('vr.disconnected.detail')}
              </p>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-background transition-colors hover:bg-primary-hover"
              >
                {t('vr.disconnected.reload')}
              </button>
            </div>
          </div>
        )}
      </div>

      {hudVisible && <MascotCompanion hideViewport vrMode />}

      {/* VR mascot onboarding — shown when user hasn't chosen their companion yet. */}
      {!oliverClass && <VrMascotOnboarding />}

      {/* Turn-based battle overlay */}
      <BattleScreen />
    </div>
  )
}
