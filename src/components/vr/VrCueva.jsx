/**
 * VrCueva — La Cueva de Platón (experiencia completa ~20 min)
 * Phases: start → intro_cinematic → world_cinematic → play → complete
 * Stages: 1 El Prisionero · 2 La Duda · 3 El Fuego · 4 La Salida · 5 El Regreso
 */
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { useNavigate } from 'react-router-dom'
import { getMascotById } from '../../data/mascotRegistry'
import { useMascotStore } from '../../stores/useMascotStore'
import { useAuthStore } from '../../stores/useAuthStore'
import MascotCompanion from '../mascot/MascotCompanion'
import courseFilosofia from '../../data/courseFilosofia.json'
import { sendNpcMessage } from '../../services/chat/npcTransport'
import { useSettingsStore } from '../../stores/useSettingsStore'
import { useAiCredentialsStore } from '../../stores/useAiCredentialsStore'
import { useVrSettingsStore } from '../../stores/useVrSettingsStore'
import { useLevelStore } from '../../stores/useLevelStore'
import { useCombatStore } from '../../stores/useCombatStore'
import BattleScreen from '../battle/BattleScreen'
import { MOUSE_SENSITIVITY } from './engine'
import DIALOGUES from './cuevaDialogues.json'
import {
  WORLD_CINEMATIC, CAVE_MISSIONS, STAGE_SKILLS, NPC_CONFIGS,
  JAFET_OUTSIDE_PROMPT, CHECKPOINT_KEY, CAVE_SOUVENIR_ITEM,
  CAVE_ENEMIES, SOMBRA_POSITIONS,
} from './cuevaData'

const FILO_MODULE_2 = courseFilosofia.modules.find(m => m.id === 2)
const VR_CODE = 'CUEVA380AC'

// ── Assign GLB models to prisoners ────────────────────────────────────────────
const PRISONER_MODELS = {
  creyente: { path: '/MODELOS 3D/NPC/mage.glb',          rotY: 0 },
  sonador:  { path: '/MODELOS 3D/MASCOTAS/owl.glb',      rotY: 0 },
  miedoso:  { path: '/MODELOS 3D/NPC/mage_fox.glb',      rotY: 0 },
  // ⚠️ little_alebrije_cat.glb no está en la nueva carpeta MODELOS 3D —
  // esta ruta sigue rota hasta que se agregue el archivo ahí.
  esceptico:{ path: '/little_alebrije_cat.glb', rotY: 0 },
}

// ── TTS helper ────────────────────────────────────────────────────────────────
function speakLine(text, onDone) {
  if (!window.speechSynthesis || !useVrSettingsStore.getState().npcVoice) {
    setTimeout(onDone, Math.max(3500, text.length * 62))
    return () => {}
  }
  const clean = text.replace(/[\u{1F000}-\u{1FFFF}]/gu, '').replace(/[^\w\s.,!?¿¡'"—áéíóúüñÁÉÍÓÚÜÑ]/g, '').trim()
  const utt = new SpeechSynthesisUtterance(clean)
  utt.lang = 'es-ES'; utt.rate = 0.86; utt.pitch = 1.0
  let settled = false
  const safety = setTimeout(() => { if (!settled) { settled = true; window.speechSynthesis.cancel(); onDone() } }, Math.max(7000, clean.length * 78))
  utt.onend = () => { if (!settled) { settled = true; clearTimeout(safety); setTimeout(onDone, 500) } }
  utt.onerror  = () => { if (!settled) { settled = true; clearTimeout(safety); onDone() } }
  window.speechSynthesis.cancel()
  window.speechSynthesis.speak(utt)
  return () => { settled = true; clearTimeout(safety); window.speechSynthesis.cancel() }
}

// ── Cave ambient music (Web Audio API drone) ──────────────────────────────────
function useCaveAmbience(enabled) {
  useEffect(() => {
    if (!enabled) return
    let ctx
    try {
      ctx = new (window.AudioContext || window.webkitAudioContext)()
      const masterGain = ctx.createGain()
      masterGain.gain.value = 0
      masterGain.connect(ctx.destination)
      // Fade in
      masterGain.gain.linearRampToValueAtTime(0.06, ctx.currentTime + 3)

      const makeOsc = (freq, type, gain) => {
        const osc = ctx.createOscillator()
        const g = ctx.createGain()
        const f = ctx.createBiquadFilter()
        osc.frequency.value = freq; osc.type = type
        f.type = 'lowpass'; f.frequency.value = freq * 2.5
        g.gain.value = gain
        osc.connect(f); f.connect(g); g.connect(masterGain)
        osc.start()
        return osc
      }
      const o1 = makeOsc(55, 'sine', 0.7)
      const o2 = makeOsc(110, 'sine', 0.35)
      const o3 = makeOsc(82.5, 'triangle', 0.2)
      // Slow LFO on main drone
      const lfo = ctx.createOscillator()
      const lfoGain = ctx.createGain()
      lfo.frequency.value = 0.08; lfo.type = 'sine'
      lfoGain.gain.value = 4
      lfo.connect(lfoGain); lfoGain.connect(o1.frequency)
      lfo.start()

      return () => {
        masterGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 1.5)
        setTimeout(() => ctx.close(), 2000)
      }
    } catch {}
    return () => { try { ctx?.close() } catch {} }
  }, [enabled])
}

// ─────────────────────────────────────────────────────────────────────────────
// 3-D COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

function FirePit({ position = [0, 0, -12] }) {
  const outer = useRef(); const inner = useRef(); const glow = useRef()
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    if (outer.current) { outer.current.scale.y = 1 + Math.sin(t * 7.3) * 0.18; outer.current.material.emissiveIntensity = 1.6 + Math.sin(t * 9) * 0.5 }
    if (inner.current) { inner.current.scale.y = 1 + Math.sin(t * 11 + 1) * 0.2; inner.current.material.emissiveIntensity = 2.2 + Math.cos(t * 8) * 0.6 }
    if (glow.current) glow.current.material.opacity = 0.22 + Math.sin(t * 4) * 0.08
  })
  return (
    <group position={position}>
      {[0,1,2,3,4].map(i => { const a=(i/5)*Math.PI*2; return <mesh key={i} position={[Math.sin(a)*0.9,0.2,Math.cos(a)*0.9]}><sphereGeometry args={[0.35,6,5]}/><meshStandardMaterial color="#4a4035" roughness={1}/></mesh> })}
      <mesh ref={outer} position={[0,0.9,0]}><coneGeometry args={[0.55,1.8,8]}/><meshStandardMaterial color="#f97316" emissive="#ea580c" emissiveIntensity={1.8} transparent opacity={0.85}/></mesh>
      <mesh ref={inner} position={[0,0.8,0]}><coneGeometry args={[0.3,1.4,7]}/><meshStandardMaterial color="#fbbf24" emissive="#fde047" emissiveIntensity={2.4} transparent opacity={0.9}/></mesh>
      <mesh ref={glow} rotation={[-Math.PI/2,0,0]} position={[0,0.05,0]}><ringGeometry args={[0.6,3.5,32]}/><meshBasicMaterial color="#f97316" transparent opacity={0.22}/></mesh>
    </group>
  )
}

function WallTorch({ position }) {
  const flame = useRef()
  useFrame(({ clock }) => {
    if (!flame.current) return
    const t = clock.getElapsedTime()
    flame.current.scale.y = 1 + Math.sin(t * 8 + position[0]) * 0.22
    flame.current.material.emissiveIntensity = 1.8 + Math.sin(t * 11 + position[2]) * 0.5
  })
  return (
    <group position={position}>
      <mesh rotation={[0.3,0,0]}><cylinderGeometry args={[0.05,0.07,0.5,6]}/><meshStandardMaterial color="#5a3a10" roughness={1}/></mesh>
      <mesh ref={flame} position={[0,0.4,0]}><coneGeometry args={[0.14,0.4,6]}/><meshStandardMaterial color="#f97316" emissive="#f97316" emissiveIntensity={2} transparent opacity={0.9}/></mesh>
    </group>
  )
}

function ShadowProjections() {
  const refs = useRef([])
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    refs.current.forEach((m, i) => {
      if (!m) return
      m.scale.x = 1 + Math.sin(t * 1.2 + i * 2.1) * 0.06
      m.scale.y = 1 + Math.cos(t * 0.9 + i) * 0.05
      m.material.opacity = 0.45 + Math.abs(Math.sin(t * 0.8 + i)) * 0.2
    })
  })
  return (<>
    {[{p:[-4,3.5,-14.8],w:0.9,h:2.2},{p:[0,3.2,-14.8],w:1,h:2.5},{p:[4,3.6,-14.8],w:0.85,h:2.1},{p:[-2,4.4,-14.8],w:2.5,h:0.6},{p:[2.2,4.5,-14.8],w:1.8,h:0.5}].map((s,i) => (
      <mesh key={i} ref={el => { refs.current[i] = el }} position={s.p}>
        <planeGeometry args={[s.w,s.h]}/><meshBasicMaterial color="#050203" transparent opacity={0.5}/>
      </mesh>
    ))}
  </>)
}

// Sombra de la Ignorancia — combat-triggering enemy mesh (stage 3)
function SombraMesh({ position, index, onClick }) {
  const g = useRef(); const aura = useRef(); const [hov, setHov] = useState(false)
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    if (g.current) g.current.position.y = Math.sin(t * 1.4 + index) * 0.08
    if (aura.current) aura.current.material.opacity = 0.14 + Math.abs(Math.sin(t * 2.1 + index)) * 0.12
  })
  return (
    <group ref={g} position={position}
      onClick={e => { e.stopPropagation(); onClick(index) }}
      onPointerOver={() => setHov(true)} onPointerOut={() => setHov(false)}>
      <mesh position={[0,0.9,0]}><cylinderGeometry args={[0.22,0.3,1.6,8]}/><meshStandardMaterial color="#1a0530" emissive="#2d0f4a" emissiveIntensity={1.5} transparent opacity={0.88} roughness={1}/></mesh>
      <mesh position={[0,1.85,0]}><sphereGeometry args={[0.24,8,7]}/><meshStandardMaterial color="#0a021a" emissive="#3b0f6e" emissiveIntensity={2.5} transparent opacity={0.92}/></mesh>
      {[-0.08,0.08].map((x,i) => <mesh key={i} position={[x,1.9,0.2]}><sphereGeometry args={[0.035,5,5]}/><meshStandardMaterial color="#d946ef" emissive="#d946ef" emissiveIntensity={5}/></mesh>)}
      <mesh ref={aura} position={[0,0.9,0]}><sphereGeometry args={[0.55,10,8]}/><meshStandardMaterial color="#1a0530" emissive="#2d0f4a" emissiveIntensity={0.8} transparent opacity={0.18}/></mesh>
      {hov && <mesh rotation={[-Math.PI/2,0,0]} position={[0,0.01,0]}><ringGeometry args={[0.38,0.55,20]}/><meshBasicMaterial color="#d946ef" transparent opacity={0.4}/></mesh>}
      <pointLight color="#7c3aed" intensity={hov ? 4 : 1.5} distance={3}/>
    </group>
  )
}

// Custodio 3D (hooded shadow-puppeteer)
function CustodioMesh({ cfg, onClick }) {
  const g = useRef(); const [hov, setHov] = useState(false)
  useFrame(({ clock }) => { if (g.current) g.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.3 + cfg.position[0]) * 0.1 })
  const dark = hov ? '#4a3030' : cfg.color
  return (
    <group ref={g} position={cfg.position} onClick={e => { e.stopPropagation(); onClick(cfg.id) }} onPointerOver={() => setHov(true)} onPointerOut={() => setHov(false)}>
      <mesh position={[0,0.9,0]}><cylinderGeometry args={[0.32,0.44,1.8,8]}/><meshStandardMaterial color={dark} roughness={0.95}/></mesh>
      <mesh position={[0,1.95,0]}><coneGeometry args={[0.29,0.58,8]}/><meshStandardMaterial color={dark} roughness={0.95}/></mesh>
      {[-0.09,0.09].map((x,i) => <mesh key={i} position={[x,1.82,0.21]}><sphereGeometry args={[0.04,6,6]}/><meshStandardMaterial color="#f97316" emissive="#f97316" emissiveIntensity={3}/></mesh>)}
      <group position={[0.52,1.0,0.2]} rotation={[0.3,0,-0.3]}>
        <mesh><cylinderGeometry args={[0.04,0.04,0.85,6]}/><meshStandardMaterial color="#5a3a10" roughness={1}/></mesh>
        <mesh position={[0,0.6,0]}><sphereGeometry args={[0.18,8,6]}/><meshStandardMaterial color="#7a5a2a" roughness={0.8}/></mesh>
      </group>
      {hov && <mesh rotation={[-Math.PI/2,0,0]} position={[0,0.01,0]}><ringGeometry args={[0.5,0.68,20]}/><meshBasicMaterial color="#f97316" transparent opacity={0.4}/></mesh>}
    </group>
  )
}

// Loads a GLB model, auto-scaled to ~1.7 units tall
function GlbNpcMesh({ modelPath, rotationY = 0 }) {
  const { scene } = useGLTF(modelPath)
  const model = useMemo(() => {
    const clone = scene.clone(true)
    const box = new THREE.Box3().setFromObject(clone)
    const size = new THREE.Vector3(); const center = new THREE.Vector3()
    box.getSize(size); box.getCenter(center)
    const s = 1.7 / (Math.max(size.x, size.y, size.z) || 1)
    clone.scale.setScalar(s)
    clone.position.set(-center.x * s, -center.y * s, -center.z * s)
    return clone
  }, [scene])
  return <primitive object={model} rotation={[0, rotationY, 0]} />
}

// GLB-based prisoner NPC (with chains and freed state)
function GlbPrisonerNpc({ cfg, freed, canFree, modelPath, modelRotY = 0, onTalk, onFree, isSpecial = false }) {
  const g = useRef(); const [hov, setHov] = useState(false)
  useFrame(({ clock }) => { if (!g.current || freed) return; g.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.4 + cfg.position[0]) * 0.08 })
  return (
    <group ref={g} position={cfg.position}
      onClick={e => { e.stopPropagation(); canFree && !freed ? onFree(cfg.id) : onTalk(cfg.id) }}
      onPointerOver={() => setHov(true)} onPointerOut={() => setHov(false)}>
      <Suspense fallback={<mesh position={[0,0.9,0]}><cylinderGeometry args={[0.2,0.25,1.8,8]}/><meshStandardMaterial color={cfg.color ?? '#b8956a'}/></mesh>}>
        <GlbNpcMesh modelPath={modelPath} rotationY={modelRotY} />
      </Suspense>
      {/* Chains */}
      {!freed && [-0.38, 0.38].map((x,i) => (
        <mesh key={i} position={[x,0.35,0]} rotation={[0,0,Math.PI/3*(i?1:-1)]}>
          <torusGeometry args={[0.12,0.035,6,12]}/><meshStandardMaterial color="#8a7a5a" metalness={0.8} roughness={0.3}/>
        </mesh>
      ))}
      {/* Freed glow */}
      {freed && (<>
        <mesh rotation={[-Math.PI/2,0,0]} position={[0,0.02,0]}><ringGeometry args={[0.3,0.85,20]}/><meshStandardMaterial color="#4ade80" emissive="#4ade80" emissiveIntensity={1.5} transparent opacity={0.55}/></mesh>
        <pointLight color="#4ade80" intensity={4} distance={6}/>
      </>)}
      {/* Special (mascot) pulse */}
      {isSpecial && !freed && <mesh position={[0,0.9,0]}><sphereGeometry args={[0.65,12,10]}/><meshStandardMaterial color="#a78bfa" emissive="#a78bfa" emissiveIntensity={0.4} transparent opacity={0.08}/></mesh>}
      {/* Hover ring */}
      {hov && !freed && <mesh rotation={[-Math.PI/2,0,0]} position={[0,0.01,0]}><ringGeometry args={[0.38,0.55,20]}/><meshBasicMaterial color={isSpecial?'#a78bfa':'#fbbf24'} transparent opacity={0.38}/></mesh>}
    </group>
  )
}

// El Escéptico with growing glow
function EscepticoNpcMesh({ stage, onTalk }) {
  const cfg = NPC_CONFIGS.esceptico
  const g = useRef(); const gl = useRef(); const [hov, setHov] = useState(false)
  const pos = stage >= 3 ? [-1.5, 0, -8] : cfg.position
  useFrame(({ clock }) => {
    if (!g.current) return
    g.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.6) * 0.15
    if (gl.current) gl.current.material.opacity = 0.08 + Math.sin(clock.getElapsedTime() * 2) * 0.06 + Math.min((stage - 1) * 0.12, 0.4)
  })
  return (
    <group ref={g} position={pos} onClick={e => { e.stopPropagation(); onTalk(cfg.id) }} onPointerOver={() => setHov(true)} onPointerOut={() => setHov(false)}>
      <Suspense fallback={<mesh position={[0,0.9,0]}><cylinderGeometry args={[0.2,0.25,1.8,8]}/><meshStandardMaterial color={cfg.color}/></mesh>}>
        <GlbNpcMesh modelPath={PRISONER_MODELS.esceptico.path} rotationY={PRISONER_MODELS.esceptico.rotY}/>
      </Suspense>
      <mesh ref={gl} position={[0,0.9,0]}><sphereGeometry args={[0.7,12,10]}/><meshStandardMaterial color="#fde68a" emissive="#fde68a" emissiveIntensity={0.8} transparent opacity={0.1}/></mesh>
      {stage < 4 && [-0.38,0.38].map((x,i) => <mesh key={i} position={[x,0.35,0]} rotation={[0,0,Math.PI/3*(i?1:-1)]}><torusGeometry args={[0.12,0.035,6,12]}/><meshStandardMaterial color="#8a7a5a" metalness={0.8} roughness={0.3}/></mesh>)}
      {hov && <mesh rotation={[-Math.PI/2,0,0]} position={[0,0.01,0]}><ringGeometry args={[0.38,0.55,20]}/><meshBasicMaterial color="#fde68a" transparent opacity={0.4}/></mesh>}
    </group>
  )
}

// Jafet outside cave — mage elder figure
function JafetOutdoorNpc({ onTalk }) {
  const g = useRef(); const [hov, setHov] = useState(false)
  useFrame(({ clock }) => {
    if (!g.current) return
    g.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.5) * 0.2
    g.current.position.y = Math.sin(clock.getElapsedTime() * 1.1) * 0.06
  })
  return (
    <group ref={g} position={[0, 0, 20]} onClick={e => { e.stopPropagation(); onTalk('jafet') }} onPointerOver={() => setHov(true)} onPointerOut={() => setHov(false)}>
      <Suspense fallback={null}>
        <GlbNpcMesh modelPath="/MODELOS 3D/NPC/mage_elder.glb" rotationY={Math.PI}/>
      </Suspense>
      {hov && <mesh rotation={[-Math.PI/2,0,0]} position={[0,0.02,0]}><ringGeometry args={[0.5,0.9,24]}/><meshBasicMaterial color="#a78bfa" transparent opacity={0.35}/></mesh>}
      <pointLight color="#a78bfa" intensity={hov?5:2} distance={6}/>
    </group>
  )
}

// Cave exit portal
function CaveExitPortal({ onEnter, visible }) {
  const gl = useRef()
  useFrame(({ clock }) => { if (gl.current) gl.current.material.opacity = 0.6 + Math.sin(clock.getElapsedTime() * 2) * 0.25 })
  if (!visible) return null
  return (
    <group position={[-5.5, 1.5, -12]}>
      <mesh ref={gl} rotation={[0,Math.PI/4,0]}><coneGeometry args={[1.2,4.5,12,1,true]}/><meshBasicMaterial color="#fde68a" transparent opacity={0.65} side={THREE.DoubleSide}/></mesh>
      <pointLight color="#fde68a" intensity={7} distance={9}/>
      <mesh onClick={e => { e.stopPropagation(); onEnter() }}>
        <circleGeometry args={[1.1,16]}/><meshStandardMaterial color="#fde68a" emissive="#f59e0b" emissiveIntensity={0.6}/>
      </mesh>
    </group>
  )
}

function CaveEntrance({ onEnter }) {
  return (
    <group position={[0,1.5,10]}>
      <pointLight color="#4a2800" intensity={4} distance={8}/>
      <mesh onClick={e => { e.stopPropagation(); onEnter() }}>
        <circleGeometry args={[1.5,16]}/><meshStandardMaterial color="#1a0e06" emissive="#2a1408" emissiveIntensity={0.4}/>
      </mesh>
      <mesh rotation={[-Math.PI/2,0,0]} position={[0,-1,0]}><ringGeometry args={[1.5,2,20]}/><meshBasicMaterial color="#f97316" transparent opacity={0.2}/></mesh>
    </group>
  )
}

// Full cave world — switched between cave interior and outdoor by `isOutside` prop
function CaveScene({ stage, phase, isOutside, freedIds, canFree, defeatedSombras, playerMascot, onTalkNpc, onFreeNpc, onExitCave, onReturnCave, onSombraClick }) {
  const torches = [[-7.4,2.8,-3],[-7.4,2.8,-8],[7.4,2.8,-4],[7.4,2.8,-9],[0,2.8,-14]]

  if (isOutside) return (
    <>
      <color attach="background" args={['#6ba3d6']}/>
      <fog attach="fog" args={['#6ba3d6',30,80]}/>
      <ambientLight intensity={2.2} color="#fff9e6"/>
      <directionalLight position={[15,30,10]} intensity={4} color="#fff9e6"/>
      <pointLight position={[0,10,15]} intensity={8} distance={40} color="#fff5c0"/>
      <mesh position={[25,40,-20]}><sphereGeometry args={[3,16,16]}/><meshStandardMaterial color="#fde047" emissive="#fde047" emissiveIntensity={4}/></mesh>
      <mesh rotation={[-Math.PI/2,0,0]} position={[0,-0.02,18]}><planeGeometry args={[60,50]}/><meshStandardMaterial color="#4a7c2a" roughness={0.9}/></mesh>
      <mesh position={[0,4,9]}><boxGeometry args={[14,10,1]}/><meshStandardMaterial color="#3a2210" roughness={1}/></mesh>
      <JafetOutdoorNpc onTalk={onTalkNpc}/>
      {stage === 5 && <CaveEntrance onEnter={onReturnCave}/>}
    </>
  )

  return (
    <>
      <color attach="background" args={['#1a0e06']}/>
      <fog attach="fog" args={['#1a0e06',18,40]}/>
      <ambientLight intensity={0.55} color="#6b3e18"/>
      <pointLight position={[0,2.5,-12]} color="#f97316" intensity={14} distance={36} decay={2}/>
      <pointLight position={[0,1.5,-12]} color="#fbbf24" intensity={6} distance={24} decay={2}/>
      <pointLight position={[-7,3,-3]} color="#f97316" intensity={5} distance={12} decay={2}/>
      <pointLight position={[-7,3,-8]} color="#f97316" intensity={5} distance={12} decay={2}/>
      <pointLight position={[7,3,-4]}  color="#f97316" intensity={5} distance={12} decay={2}/>
      <pointLight position={[7,3,-9]}  color="#f97316" intensity={5} distance={12} decay={2}/>
      <pointLight position={[0,4,2]}   color="#8a5028" intensity={5} distance={16} decay={2}/>
      <pointLight position={[0,3,-6]}  color="#7a4518" intensity={4} distance={14} decay={2}/>
      <mesh rotation={[-Math.PI/2,0,0]} position={[0,-0.02,0]}><planeGeometry args={[28,36]}/><meshStandardMaterial color="#3a2510" roughness={1}/></mesh>
      <mesh rotation={[Math.PI/2,0,0]} position={[0,8,-5]}><planeGeometry args={[28,36]}/><meshStandardMaterial color="#1e1408" roughness={1}/></mesh>
      <mesh rotation={[0,Math.PI/2,0]} position={[-8,4,-5]}><planeGeometry args={[36,9]}/><meshStandardMaterial color="#4a2e12" roughness={1}/></mesh>
      <mesh rotation={[0,-Math.PI/2,0]} position={[8,4,-5]}><planeGeometry args={[36,9]}/><meshStandardMaterial color="#4a2e12" roughness={1}/></mesh>
      <mesh position={[0,4.5,-15]}><planeGeometry args={[20,12]}/><meshStandardMaterial color="#3a2210" roughness={1}/></mesh>
      {[[-4,8,-6],[0,8,-9],[4,8,-7],[-2,8,-12],[2.5,8,-11]].map(([x,y,z],i) => (
        <mesh key={i} position={[x,y-0.3,z]} rotation={[Math.PI,0,0]}><coneGeometry args={[0.2+i*0.04,0.8+i*0.3,7]}/><meshStandardMaterial color="#3c2a14" roughness={1}/></mesh>
      ))}
      {[[-7,0.5,-3],[-7,0.5,-8],[7,0.5,-4],[7,0.5,-9]].map(([x,y,z],i) => (
        <mesh key={i} position={[x,y,z]}><dodecahedronGeometry args={[0.7+i*0.15,0]}/><meshStandardMaterial color="#3e2a12" roughness={1}/></mesh>
      ))}
      {torches.map((p,i) => <WallTorch key={i} position={p}/>)}
      <FirePit position={[0,0,-12]}/>
      <ShadowProjections/>
      {phase === 'play' && (<>
        {/* 3 main prisoners with GLB models */}
        {['creyente','sonador','miedoso'].map(id => (
          <GlbPrisonerNpc key={id} cfg={NPC_CONFIGS[id]} freed={freedIds.includes(id)}
            canFree={canFree} modelPath={PRISONER_MODELS[id].path} modelRotY={PRISONER_MODELS[id].rotY}
            onTalk={onTalkNpc} onFree={onFreeNpc}/>
        ))}
        {/* Player's mascot as 4th prisoner */}
        {playerMascot && (
          <GlbPrisonerNpc cfg={{ id:'mascota', position:[-2,0,1], color:'#a78bfa' }}
            freed={freedIds.includes('mascota')} canFree={canFree}
            modelPath={playerMascot.modelPath ?? '/MODELOS 3D/MASCOTAS/orange_cat.glb'} modelRotY={playerMascot.modelRotationY ?? 0}
            onTalk={onTalkNpc} onFree={onFreeNpc} isSpecial/>
        )}
        {stage >= 2 && <EscepticoNpcMesh stage={stage} onTalk={onTalkNpc}/>}
        {/* Stage 3: Sombras de la Ignorancia near the fire */}
        {stage === 3 && defeatedSombras < 2 && SOMBRA_POSITIONS.slice(defeatedSombras).map((pos, i) => (
          <SombraMesh key={i} position={pos} index={i} onClick={onSombraClick}/>
        ))}
        <CustodioMesh cfg={NPC_CONFIGS.custodio_mayor} onClick={onTalkNpc}/>
        <CustodioMesh cfg={NPC_CONFIGS.custodio_joven} onClick={onTalkNpc}/>
        <CaveExitPortal visible={stage >= 4} onEnter={onExitCave}/>
      </>)}
    </>
  )
}

// WASD + drag-to-look (same mechanism as Campus/Room/Anfiteatro, via the
// shared VR engine) + touch first-person controller.
function FirstPersonController({ lockedRef, teleportRef, touchMoveRef, touchYawRef, onMove }) {
  const { camera, gl } = useThree()
  const keys = useRef({})
  const yaw = useRef(0)
  const initialized = useRef(false)

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true
      camera.position.set(0, 2, 4)
      camera.rotation.set(0, 0, 0, 'YXZ')
    }
  }, [camera])

  useEffect(() => {
    const down = e => { keys.current[e.code] = true }
    const up   = e => { keys.current[e.code] = false }
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up) }
  }, [])

  // Drag-to-look: cursor stays visible, only captures yaw while the mouse
  // button is held — no requestPointerLock, so the mouse never gets "eaten".
  useEffect(() => {
    const el = gl.domElement
    let dragging = false
    let lastX = 0
    const onDown = e => { if (lockedRef.current) return; dragging = true; lastX = e.clientX }
    const onMove = e => {
      if (!dragging || lockedRef.current) return
      const dx = e.clientX - lastX
      lastX = e.clientX
      yaw.current -= dx * MOUSE_SENSITIVITY * useVrSettingsStore.getState().mouseSensitivity
    }
    const onUp = () => { dragging = false }
    el.addEventListener('pointerdown', onDown)
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    return () => {
      el.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }
  }, [gl, lockedRef])

  useFrame((_, delta) => {
    if (teleportRef.current) {
      camera.position.set(...teleportRef.current)
      yaw.current = 0
      teleportRef.current = null
    }
    if (lockedRef.current) return
    // Apply touch yaw delta
    if (touchYawRef?.current) {
      yaw.current -= touchYawRef.current
      touchYawRef.current = 0
    }
    const speed = 5.5 * delta
    const euler = new THREE.Euler(0, yaw.current, 0, 'YXZ')
    const fwd   = new THREE.Vector3(0, 0, -1).applyEuler(euler)
    const right = new THREE.Vector3(1, 0, 0).applyEuler(euler)
    const p = camera.position
    if (keys.current['KeyW'] || keys.current['ArrowUp'])   p.addScaledVector(fwd, speed)
    if (keys.current['KeyS'] || keys.current['ArrowDown']) p.addScaledVector(fwd, -speed)
    if (keys.current['KeyA'])                              p.addScaledVector(right, -speed)
    if (keys.current['KeyD'])                              p.addScaledVector(right, speed)
    if (keys.current['ArrowLeft'])  yaw.current += 1.8 * delta
    if (keys.current['ArrowRight']) yaw.current -= 1.8 * delta
    // Touch joystick movement
    const tm = touchMoveRef?.current
    if (tm && (tm.x !== 0 || tm.z !== 0)) {
      p.addScaledVector(fwd, -tm.z * speed * 1.5)
      p.addScaledVector(right, tm.x * speed * 1.5)
    }
    p.x = Math.max(-7, Math.min(7, p.x))
    p.z = Math.max(-14, Math.min(25, p.z))
    p.y = 2.0
    camera.rotation.set(0, yaw.current, 0, 'YXZ')
    onMove([p.x, p.y, p.z])
  })
  return null
}

// Cinematic camera rig (animates through keyframes)
function CinematicRig({ active, keyframes, onSubtitle, onDone }) {
  const { camera } = useThree()
  const idxRef = useRef(0); const progRef = useRef(0)
  const notified = useRef(false); const finished = useRef(false)
  const initPos = useRef(null)

  useEffect(() => {
    if (active) { idxRef.current = 0; progRef.current = 0; notified.current = false; finished.current = false; initPos.current = camera.position.clone() }
  }, [active, camera])

  useFrame((_, delta) => {
    if (!active || finished.current || idxRef.current >= keyframes.length) return
    const frame = keyframes[idxRef.current]
    if (!notified.current) { notified.current = true; onSubtitle(frame.text) }
    progRef.current += delta / (frame.duration / 1000)
    const t = Math.min(progRef.current, 1)
    const e = t < 0.5 ? 2*t*t : -1+(4-2*t)*t
    const prev = idxRef.current > 0 ? new THREE.Vector3(...keyframes[idxRef.current-1].cameraPos) : (initPos.current ?? new THREE.Vector3(0,2.5,5))
    const next = new THREE.Vector3(...frame.cameraPos)
    camera.position.lerpVectors(prev, next, e)
    camera.lookAt(new THREE.Vector3(...frame.lookAt))
    if (progRef.current >= 1) {
      idxRef.current++; progRef.current = 0; notified.current = false
      if (idxRef.current >= keyframes.length) { finished.current = true; onDone() }
    }
  })
  return null
}

// Proximity detector — which NPC is nearest
function ProximityDetector({ stage, onNearby }) {
  const { camera } = useThree()
  const prevRef = useRef(null)
  const ALL_NPC_IDS = ['creyente','sonador','miedoso','mascota','custodio_mayor','custodio_joven', ...(stage >= 2 ? ['esceptico'] : []), ...(stage >= 4 ? ['jafet'] : [])]
  const POSITIONS = { creyente:[-5.5,0,-2], sonador:[0,0,-5], miedoso:[5.5,0,-2], mascota:[-2,0,1], custodio_mayor:[-3,0,-11], custodio_joven:[3,0,-11], esceptico:[3,0,1], jafet:[0,2,20] }

  useFrame(() => {
    let closest = null; let closestDist = 3.8
    for (const id of ALL_NPC_IDS) {
      const pos = id === 'esceptico' ? (stage >= 3 ? [-1.5,0,-8] : (POSITIONS[id] ?? [0,0,0])) : (POSITIONS[id] ?? [0,0,0])
      const dx = camera.position.x - pos[0]; const dz = camera.position.z - pos[2]
      const dist = Math.sqrt(dx*dx + dz*dz)
      if (dist < closestDist) { closestDist = dist; closest = id }
    }
    if (closest !== prevRef.current) { prevRef.current = closest; onNearby(closest) }
  })
  return null
}

// ─────────────────────────────────────────────────────────────────────────────
// UI COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

const FILO_EMOJIS = ['🏛️','📜','🧠','💡','🔍','🦉','⚗️','🎭','⚖️','🌍','🔥','⛓️','✨','🌙','🤔','🗝️','🌀','🪬','🐚','🕯️']

function StartScreen({ onStart, onBack }) {
  return (
    <div className="absolute inset-0 z-40 flex flex-col items-center justify-center px-6 overflow-hidden" style={{ background:'linear-gradient(to bottom,rgba(10,5,3,0.92),rgba(10,5,3,0.98))' }}>
      {/* Floating philosophy emojis */}
      <style>{`@keyframes floatPhi{0%{transform:translateY(0) rotate(-5deg);opacity:.18}50%{opacity:.28}100%{transform:translateY(-100px) rotate(8deg);opacity:0}}`}</style>
      {FILO_EMOJIS.map((e,i) => (
        <div key={i} className="pointer-events-none absolute select-none text-2xl" style={{ left:`${(i*4.8+3)%93}%`, bottom:`${(i*7.3+5)%70}%`, animation:`floatPhi ${4+(i%4)}s ${(i*0.55)%5}s linear infinite` }}>{e}</div>
      ))}
      <div className="relative flex max-w-lg flex-col items-center gap-8 text-center z-10">
        <div><p className="mb-3 text-7xl">🏛️</p><h1 className="text-4xl font-black tracking-tight" style={{ color:'#eab308', textShadow:'0 0 50px rgba(234,179,8,0.35)' }}>La Cueva de Platón</h1><p className="mt-2 text-base" style={{ color:'rgba(255,255,255,0.4)' }}>Experiencia filosófica interactiva · ~20 min</p></div>
        <div className="rounded-2xl px-5 py-4 text-left w-full" style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)' }}>
          <p className="text-sm leading-relaxed" style={{ color:'rgba(255,255,255,0.6)' }}>Vivirás la Alegoría de la Cueva de Platón desde adentro. <strong style={{color:'rgba(255,255,255,0.8)'}}>WASD + ratón</strong> en escritorio · <strong style={{color:'rgba(255,255,255,0.8)'}}>joystick táctil</strong> en móvil. Habla con los prisioneros y libera a tu mascota — tendrán que ayudarse el uno al otro.</p>
          <p className="mt-2 text-xs" style={{ color:'rgba(255,255,255,0.22)' }}>🎧 Activa el volumen · Progreso guardado automáticamente</p>
        </div>
        <button type="button" onClick={onStart} className="rounded-2xl px-14 py-4 text-xl font-black transition-all hover:scale-105 active:scale-95" style={{ background:'linear-gradient(135deg,#eab308,#f97316)', color:'#0a0600', boxShadow:'0 0 50px rgba(234,179,8,0.35)' }}>🏛️ Iniciar Misión</button>
        <button type="button" onClick={onBack} className="text-xs transition" style={{ color:'rgba(255,255,255,0.2)' }}>← Volver al curso</button>
      </div>
    </div>
  )
}

function IntroCinematicOverlay({ onDone }) {
  const [idx, setIdx] = useState(0)
  const [vis, setVis] = useState(false)
  const [ready, setReady] = useState(false) // user can click next once TTS started
  const skipRef = useRef(false)
  const LINES = DIALOGUES.introLines

  useEffect(() => { setVis(false); setReady(false); const t = setTimeout(() => setVis(true), 100); return () => clearTimeout(t) }, [idx])

  // Start TTS — no auto-advance; user clicks Siguiente
  useEffect(() => {
    if (skipRef.current) return
    const cancel = speakLine(LINES[idx], () => { if (!skipRef.current) setReady(true) })
    // Allow next button after 1.5s regardless (safety for no-audio)
    const t = setTimeout(() => setReady(true), 1500)
    return () => { cancel(); clearTimeout(t) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx])

  const goNext = () => {
    window.speechSynthesis?.cancel()
    if (idx >= LINES.length - 1) { skipRef.current = true; onDone() }
    else { setIdx(p => p + 1) }
  }

  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center" style={{ background:'rgba(4,2,8,0.97)' }}>
      <button type="button" onClick={() => { skipRef.current = true; window.speechSynthesis?.cancel(); onDone() }} className="absolute right-4 top-4 rounded-xl px-4 py-2 text-xs font-bold" style={{ background:'rgba(255,255,255,0.06)', color:'rgba(255,255,255,0.4)', border:'1px solid rgba(255,255,255,0.1)' }}>Omitir →</button>
      <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background:'rgba(255,255,255,0.07)' }}>
        <div className="h-full transition-all duration-700" style={{ width:`${(idx/(LINES.length-1))*100}%`, background:'linear-gradient(90deg,#eab308,#f97316)' }}/>
      </div>
      <div className="mx-auto max-w-2xl px-8 text-center" style={{ opacity:vis?1:0, transform:vis?'translateY(0)':'translateY(10px)', transition:'opacity 0.5s,transform 0.5s' }}>
        <p className="text-xl font-light leading-relaxed sm:text-2xl" style={{ color:'rgba(255,255,255,0.92)', fontStyle:'italic', lineHeight:1.75 }}>&ldquo;{LINES[idx]}&rdquo;</p>
        <p className="mt-6 text-[11px] tracking-widest" style={{ color:'rgba(255,255,255,0.15)' }}>{idx+1} / {LINES.length}</p>
      </div>
      <div className="absolute bottom-8 flex items-center gap-4 rounded-2xl px-5 py-3" style={{ background:'rgba(20,10,35,0.9)', border:'1px solid rgba(234,179,8,0.22)' }}>
        <div className="flex h-10 w-10 items-center justify-center rounded-full text-xl" style={{ background:'rgba(234,179,8,0.12)', border:'1px solid rgba(234,179,8,0.35)' }}>🎓</div>
        <div><p className="text-xs font-black" style={{ color:'#fcd34d' }}>Jafet Brito</p><p className="text-[10px]" style={{ color:'rgba(255,255,255,0.3)' }}>Filósofo y Guía</p></div>
        <button type="button" onClick={goNext} disabled={!ready} className="ml-2 rounded-xl px-4 py-2 text-xs font-black transition-all disabled:opacity-30" style={{ background:'rgba(234,179,8,0.28)', color:'#fcd34d', border:'1px solid rgba(234,179,8,0.4)' }}>
          {idx >= LINES.length - 1 ? 'Entrar →' : 'Siguiente →'}
        </button>
      </div>
    </div>
  )
}

// NPC dialogue with TTS
function NpcDialogueUI({ npcId, stage, freedIds, playerMascotName, onClose, onAiMessage, aiMessages, aiLoading }) {
  const cfg = npcId === 'mascota'
    ? { name: playerMascotName ?? 'Tu Mascota', type: 'prisoner' }
    : npcId === 'jafet'
    ? { name: 'Jafet Brito', type: 'guia' }
    : NPC_CONFIGS[npcId]

  const isJafet = npcId === 'jafet'
  const [lineIdx, setLineIdx] = useState(0)
  const [aiInput, setAiInput] = useState('')
  const cancelTts = useRef(null)

  const getDialogueKey = () => {
    if (isJafet) return null
    if ((npcId === 'custodio_mayor' || npcId === 'custodio_joven') && stage >= 5) {
      const allFreed = ['creyente','sonador','miedoso','mascota'].every(id => freedIds.includes(id))
      if (allFreed) return 'final'
    }
    if (['creyente','sonador','miedoso','mascota'].includes(npcId) && freedIds.includes(npcId)) return 'freed'
    const d = npcId === 'mascota' ? DIALOGUES.npcs.mascota : NPC_CONFIGS[npcId]?.dialogue
    const stageKey = String(Math.min(stage, Math.max(...Object.keys(d ?? {}).filter(k => !isNaN(Number(k))).map(Number))))
    return stageKey
  }

  const key = getDialogueKey()
  const dialogueSource = npcId === 'mascota' ? DIALOGUES.npcs.mascota : NPC_CONFIGS[npcId]?.dialogue
  const lines = key ? (dialogueSource?.[key] ?? []) : []

  // TTS on each line
  useEffect(() => {
    if (isJafet || !lines[lineIdx]) return
    cancelTts.current?.()
    cancelTts.current = speakLine(lines[lineIdx], () => {})
    return () => { cancelTts.current?.(); window.speechSynthesis?.cancel() }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lineIdx, npcId, key])

  useEffect(() => { setLineIdx(0) }, [npcId])

  const handleNext = () => { if (lineIdx < lines.length - 1) setLineIdx(p => p+1) }
  const sendAi = () => { if (!aiInput.trim()) return; onAiMessage(aiInput.trim()); setAiInput('') }

  const portrait = { creyente:'⛓️', sonador:'🌙', miedoso:'😨', esceptico:'🔍', custodio_mayor:'🧙', custodio_joven:'👁️', jafet:'🎓', mascota:'✨' }[npcId] ?? '❓'

  return (
    <div className="absolute inset-x-0 bottom-0 z-30 sm:absolute sm:inset-auto sm:bottom-4 sm:right-4 sm:w-96">
      <div className="flex flex-col overflow-hidden rounded-t-3xl shadow-2xl sm:rounded-3xl" style={{ maxHeight:'60vh', background:'linear-gradient(160deg,#1a0f2e 0%,#0c0814 100%)', border:'1px solid rgba(234,179,8,0.3)' }}>
        <div className="flex items-center gap-3 px-4 py-3" style={{ borderBottom:'1px solid rgba(255,255,255,0.07)' }}>
          <div className="flex h-11 w-11 items-center justify-center rounded-full text-2xl shrink-0" style={{ background:'rgba(234,179,8,0.12)', border:'1px solid rgba(234,179,8,0.3)' }}>{portrait}</div>
          <div className="flex-1"><p className="text-sm font-black" style={{ color:'#fcd34d' }}>{cfg?.name}</p><p className="text-[10px]" style={{ color:'rgba(255,255,255,0.3)' }}>{isJafet?'Filósofo y Guía':cfg?.type==='custodio'?'Custodio':npcId==='mascota'?'Tu Mascota (Prisionera)':'Prisionero'}</p></div>
          <button type="button" onClick={onClose} className="text-xl leading-none" style={{ color:'rgba(255,255,255,0.3)' }}>×</button>
        </div>
        {isJafet ? (
          <div className="flex flex-col flex-1 overflow-hidden">
            <div className="flex flex-1 flex-col gap-2 overflow-y-auto p-3">
              {aiMessages.length === 0 && <div className="rounded-2xl px-3 py-3 text-xs leading-relaxed" style={{ background:'rgba(255,255,255,0.06)', color:'rgba(255,255,255,0.7)', border:'1px solid rgba(255,255,255,0.07)' }}>Sal de la cueva y ahora puedo hablar contigo sin restricciones. Reflexionemos sobre lo que viviste. ¿Qué fue lo que más te impactó?</div>}
              {aiMessages.map((m,i) => <div key={i} className={`flex ${m.role==='user'?'justify-end':'justify-start'}`}><div className="max-w-[88%] rounded-2xl px-3 py-2 text-xs leading-relaxed" style={m.role==='user'?{background:'rgba(234,179,8,0.22)',color:'#fde68a',borderRadius:'16px 16px 4px 16px'}:{background:'rgba(255,255,255,0.06)',color:'rgba(255,255,255,0.8)',border:'1px solid rgba(255,255,255,0.07)',borderRadius:'16px 16px 16px 4px'}}>{m.content}</div></div>)}
              {aiLoading && <div className="animate-pulse rounded-2xl px-3 py-2 text-xs" style={{ background:'rgba(255,255,255,0.06)', color:'rgba(255,255,255,0.35)' }}>Jafet reflexiona…</div>}
            </div>
            <div className="flex gap-2 p-3" style={{ borderTop:'1px solid rgba(255,255,255,0.07)' }}>
              <input value={aiInput} onChange={e => setAiInput(e.target.value)} onKeyDown={e => e.key==='Enter'&&sendAi()} placeholder="Habla con Jafet…" className="flex-1 rounded-xl px-3 py-2 text-xs outline-none" style={{ background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.1)', color:'rgba(255,255,255,0.85)' }}/>
              <button type="button" onClick={sendAi} className="rounded-xl px-3 py-2 text-xs font-black" style={{ background:'rgba(234,179,8,0.28)', color:'#fcd34d' }}>→</button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4 p-4">
            <p className="text-sm leading-relaxed" style={{ color:'rgba(255,255,255,0.82)', fontStyle:'italic' }}>&ldquo;{lines[lineIdx] ?? '...'}&rdquo;</p>
            <div className="flex items-center justify-between">
              <div className="flex gap-1.5">{lines.map((_,i) => <div key={i} className="rounded-full" style={{ width:6, height:6, background:i===lineIdx?'#eab308':'rgba(255,255,255,0.15)' }}/>)}</div>
              {lineIdx < lines.length - 1
                ? <button type="button" onClick={handleNext} className="rounded-xl px-4 py-2 text-xs font-black" style={{ background:'rgba(234,179,8,0.25)', color:'#fcd34d' }}>Siguiente →</button>
                : <button type="button" onClick={onClose} className="rounded-xl px-4 py-2 text-xs font-black" style={{ background:'rgba(255,255,255,0.08)', color:'rgba(255,255,255,0.5)' }}>Cerrar</button>}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Prisoner-mode HUD overlay (stage 1-3)
function PrisonerModeHud({ stage }) {
  if (stage >= 4) return null
  return (
    <div className="pointer-events-none absolute top-16 right-4 z-20">
      <div className="rounded-2xl px-3 py-2 flex items-center gap-2" style={{ background:'rgba(120,20,20,0.88)', border:'1px solid rgba(239,68,68,0.4)' }}>
        <span className="text-base">⛓️</span>
        <div>
          <p className="text-xs font-black" style={{ color:'#fca5a5' }}>Modo Prisionero</p>
          <p className="text-[9px]" style={{ color:'rgba(255,255,255,0.35)' }}>Habilidades limitadas</p>
        </div>
      </div>
    </div>
  )
}

function MissionPanel({ done, stage }) {
  const stageMissions = CAVE_MISSIONS.filter(m => m.stage <= stage)
  return (
    <div className="absolute left-3 top-16 z-20 w-52">
      <div className="rounded-2xl p-3 backdrop-blur-sm" style={{ background:'rgba(12,6,4,0.88)', border:'1px solid rgba(234,179,8,0.22)' }}>
        <p className="mb-2 text-[10px] font-black uppercase tracking-wider" style={{ color:'#eab308' }}>🏛️ Misiones · Etapa {stage}</p>
        <div className="flex flex-col gap-1.5">
          {stageMissions.map(m => {
            const isDone = done.includes(m.id); const isCurrent = !isDone && m.stage === stage
            return (
              <div key={m.id} className={`flex items-center gap-2 rounded-xl border px-2.5 py-1.5 ${isDone?'border-primary/15 opacity-45':isCurrent?'border-yellow-500/35 bg-yellow-500/6':'border-white/5 opacity-25'}`}>
                <span className="text-sm shrink-0">{isDone?'✅':isCurrent?m.icon:'🔒'}</span>
                <div className="flex-1 min-w-0">
                  <p className={`text-[10px] font-bold leading-snug truncate ${isCurrent?'text-yellow-200':isDone?'text-text-muted line-through':'text-white/25'}`}>{m.title}</p>
                  {isCurrent && <p className="text-[9px] text-white/30 leading-snug">{m.desc}</p>}
                </div>
                {isCurrent && <span className="shrink-0 text-[9px] font-black" style={{ color:'#eab308' }}>+{m.xp}</span>}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function SkillBar({ stage, done, usedLaPregunta, onUse }) {
  const skills = STAGE_SKILLS[stage] ?? []
  if (!skills.length) return null
  return (
    <div className="absolute bottom-6 left-1/2 z-20 -translate-x-1/2 flex flex-col items-center gap-2">
      <p className="text-[9px] font-bold uppercase tracking-widest" style={{ color:'rgba(255,255,255,0.3)' }}>Habilidades · Etapa {stage} · <span className="normal-case">teclas 1/2/3</span></p>
      <div className="flex gap-4">
        {skills.map((sk, i) => {
          const isDone = sk.id === 'la_pregunta' ? usedLaPregunta >= 2 : (sk.missionId && done.includes(sk.missionId))
          return (
            <button key={sk.id} type="button" onClick={() => !isDone && onUse(sk)} title={`${sk.name} [${i+1}]`} className="flex flex-col items-center gap-1.5 transition active:scale-90">
              <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl text-3xl shadow-xl" style={{ background:`radial-gradient(circle at 38% 36%,${sk.color}44,${sk.color}18)`, border:`2px solid ${isDone?'rgba(74,222,128,0.6)':sk.color+'99'}`, boxShadow:isDone?'0 0 14px rgba(74,222,128,0.3)':`0 0 14px ${sk.color}44`, opacity:isDone?0.55:1 }}>
                {isDone?'✅':sk.icon}
                <span className="absolute top-1 left-1.5 text-[9px] font-black" style={{ color:'rgba(255,255,255,0.35)' }}>{i+1}</span>
              </div>
              <span className="text-center text-[9px] font-semibold leading-tight" style={{ color:'rgba(255,255,255,0.55)', maxWidth:64 }}>{sk.name}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function SkillVfx({ skill, onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 1600); return () => clearTimeout(t) }, [onDone])
  return (
    <div className="pointer-events-none absolute inset-0 z-40 flex items-center justify-center">
      <div className="animate-ping rounded-full" style={{ width:160, height:160, background:`radial-gradient(circle,${skill.color}55,transparent)`, border:`3px solid ${skill.color}` }}/>
      <div className="absolute flex flex-col items-center gap-2"><span style={{ fontSize:48 }}>{skill.icon}</span><p className="font-black text-white drop-shadow-lg" style={{ fontSize:16 }}>{skill.name}</p></div>
    </div>
  )
}

function NpcPrompt({ npcId, playerMascotName, onTalk }) {
  const name = npcId === 'mascota' ? (playerMascotName ?? 'Tu Mascota') : npcId === 'jafet' ? 'Jafet Brito' : (NPC_CONFIGS[npcId]?.name ?? '?')
  return (
    <div className="absolute bottom-28 left-1/2 z-20 -translate-x-1/2">
      <button type="button" onClick={onTalk} className="rounded-full px-4 py-2 text-xs font-bold backdrop-blur-sm animate-pulse touch-manipulation" style={{ background:'rgba(12,6,4,0.88)', border:'1px solid rgba(234,179,8,0.45)', color:'#eab308' }}>
        <span className="hidden sm:inline">F — </span>Hablar con {name}
      </button>
    </div>
  )
}

// Admin dev panel: jump between stages for testing
function DevPanel({ stage, isOutside, onSetStage }) {
  const profile = useAuthStore(s => s.profile)
  const user = useAuthStore(s => s.user)
  const isAdmin = profile?.role === 'admin' || user?.email === 'wjafte28@gmail.com'
  const [open, setOpen] = useState(false)
  if (!isAdmin) return null
  return (
    <div className="absolute top-14 right-4 z-50">
      <button type="button" onClick={() => setOpen(o => !o)} className="rounded-xl px-3 py-1.5 text-xs font-black" style={{ background:'rgba(0,0,0,0.85)', border:'1px solid rgba(251,146,60,0.6)', color:'#fb923c' }}>🔧 Dev</button>
      {open && (
        <div className="absolute right-0 top-9 rounded-2xl p-3 flex flex-col gap-1.5 shadow-2xl" style={{ background:'rgba(10,5,2,0.95)', border:'1px solid rgba(251,146,60,0.4)', minWidth:140 }}>
          <p className="text-[10px] font-black mb-1" style={{ color:'#fb923c' }}>STAGE JUMP</p>
          {[1,2,3,4,5].map(s => (
            <button key={s} type="button" onClick={() => { onSetStage(s); setOpen(false) }}
              className="rounded-lg px-3 py-1.5 text-xs font-bold text-left transition"
              style={{ background:stage===s?'rgba(251,146,60,0.3)':'rgba(255,255,255,0.06)', color:stage===s?'#fb923c':'rgba(255,255,255,0.5)', border:`1px solid ${stage===s?'rgba(251,146,60,0.5)':'rgba(255,255,255,0.08)'}` }}>
              {stage===s?'→ ':''}{['','🔗 Prisionero','🤔 La Duda','🔥 El Fuego','🌅 La Salida','↩️ El Regreso'][s]}
            </button>
          ))}
          <p className="text-[9px] mt-1" style={{ color:'rgba(255,165,0,0.4)' }}>{isOutside ? '📍 Exterior' : '📍 Cueva'}</p>
        </div>
      )}
    </div>
  )
}

// Virtual joystick for mobile movement
function VirtualJoystick({ touchMoveRef }) {
  const stickRef = useRef(null)
  const activeTouch = useRef(null)
  const basePos = useRef({ x: 0, y: 0 })

  const handleStart = e => {
    if (activeTouch.current !== null) return
    const t = e.changedTouches[0]
    activeTouch.current = t.identifier
    basePos.current = { x: t.clientX, y: t.clientY }
    if (stickRef.current) stickRef.current.style.transform = 'translate(0,0)'
  }
  const handleMove = e => {
    for (const t of e.changedTouches) {
      if (t.identifier !== activeTouch.current) continue
      const dx = (t.clientX - basePos.current.x) / 40
      const dy = (t.clientY - basePos.current.y) / 40
      const len = Math.sqrt(dx*dx + dy*dy)
      const nx = len > 1 ? dx/len : dx
      const ny = len > 1 ? dy/len : dy
      if (touchMoveRef) touchMoveRef.current = { x: nx, z: ny }
      if (stickRef.current) stickRef.current.style.transform = `translate(${nx*20}px,${ny*20}px)`
    }
  }
  const handleEnd = e => {
    for (const t of e.changedTouches) {
      if (t.identifier !== activeTouch.current) continue
      activeTouch.current = null
      if (touchMoveRef) touchMoveRef.current = { x: 0, z: 0 }
      if (stickRef.current) stickRef.current.style.transform = 'translate(0,0)'
    }
  }

  return (
    <div className="absolute bottom-8 left-6 z-20 sm:hidden touch-none" style={{ width:80, height:80 }}
      onTouchStart={handleStart} onTouchMove={handleMove} onTouchEnd={handleEnd} onTouchCancel={handleEnd}>
      <div className="absolute inset-0 rounded-full" style={{ background:'rgba(255,255,255,0.08)', border:'2px solid rgba(255,255,255,0.2)' }}/>
      <div ref={stickRef} className="absolute rounded-full transition-none" style={{ width:32, height:32, top:'50%', left:'50%', marginTop:-16, marginLeft:-16, background:'rgba(234,179,8,0.45)', border:'2px solid rgba(234,179,8,0.7)', transform:'translate(0,0)' }}/>
    </div>
  )
}

// Touch camera look (right side of screen)
function TouchLook({ touchYawRef, lockedRef, activeNpc }) {
  const lastTouch = useRef(null)
  useEffect(() => {
    const el = document.getElementById('vr-canvas-wrap')
    if (!el) return
    const onStart = e => {
      for (const t of e.changedTouches) {
        if (t.clientX > window.innerWidth / 2) lastTouch.current = { id: t.identifier, x: t.clientX }
      }
    }
    const onMove = e => {
      if (lockedRef?.current || activeNpc) return
      for (const t of e.changedTouches) {
        if (lastTouch.current && t.identifier === lastTouch.current.id) {
          const dx = t.clientX - lastTouch.current.x
          if (touchYawRef) touchYawRef.current += dx * 0.003
          lastTouch.current.x = t.clientX
        }
      }
    }
    const onEnd = e => {
      for (const t of e.changedTouches) {
        if (lastTouch.current?.id === t.identifier) lastTouch.current = null
      }
    }
    el.addEventListener('touchstart', onStart, { passive: true })
    el.addEventListener('touchmove', onMove, { passive: true })
    el.addEventListener('touchend', onEnd, { passive: true })
    return () => { el.removeEventListener('touchstart', onStart); el.removeEventListener('touchmove', onMove); el.removeEventListener('touchend', onEnd) }
  }, [touchYawRef, lockedRef, activeNpc])
  return null
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function VrCueva() {
  const navigate = useNavigate()
  const addXp = useLevelStore(s => s.addXp)
  const selectedMascotId = useMascotStore(s => s.selectedMascotId)
  const playerMascot = getMascotById(selectedMascotId)

  // Touch refs shared between React UI and Canvas controller
  const touchMoveRef = useRef({ x: 0, z: 0 })
  const touchYawRef  = useRef(0)

  // ── Phase + stage ──────────────────────────────────────────────────────────
  const [phase, setPhase] = useState('start')
  const [stage, setStage] = useState(1)
  const [isOutside, setIsOutside] = useState(false) // separate from stage (stage 5 = inside cave)

  // ── Mission + freedom tracking ─────────────────────────────────────────────
  const [done, setDone]       = useState([])
  const [freedIds, setFreedIds] = useState([])
  const [usedLaPregunta, setUsedLaPregunta] = useState(0)
  const [defeatedSombras, setDefeatedSombras] = useState(0)

  // ── Combat wiring ──────────────────────────────────────────────────────────
  const combatPhase  = useCombatStore(s => s.phase)
  const combatActive = useCombatStore(s => s.active)
  const battleCtxRef = useRef(null) // 'sombra' | 'maestro'

  // ── NPC dialogue ───────────────────────────────────────────────────────────
  const [activeNpc, setActiveNpc]   = useState(null)
  const [nearbyNpc, setNearbyNpc]   = useState(null)
  const [aiMessages, setAiMessages] = useState([])
  const [aiLoading, setAiLoading]   = useState(false)

  // ── Cinematics ─────────────────────────────────────────────────────────────
  const [worldSubtitle, setWorldSubtitle] = useState('')
  const cineLocked = useRef(false)
  const teleportRef = useRef(null)

  // ── Misc ───────────────────────────────────────────────────────────────────
  const [activeVfx, setActiveVfx] = useState(null)

  // ── Cave ambience ─────────────────────────────────────────────────────────
  useCaveAmbience(phase === 'play' && !isOutside)

  // ── World cinematic TTS ───────────────────────────────────────────────────
  useEffect(() => {
    if (!worldSubtitle || phase !== 'world_cinematic') return
    const cancel = speakLine(worldSubtitle, () => {})
    return cancel
  }, [worldSubtitle, phase])

  // ── Load checkpoint ───────────────────────────────────────────────────────
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(CHECKPOINT_KEY) ?? 'null')
      if (saved?.stage >= 2) { setPhase('play'); setStage(saved.stage); setDone(saved.done ?? []); setFreedIds(saved.freedIds ?? []) }
    } catch {}
  }, [])

  const saveCheckpoint = useCallback((s, d, f) => {
    if (s >= 2) localStorage.setItem(CHECKPOINT_KEY, JSON.stringify({ stage: s, done: d, freedIds: f }))
  }, [])

  // ── Complete mission ───────────────────────────────────────────────────────
  const completeMission = useCallback((id) => {
    setDone(prev => {
      if (prev.includes(id)) return prev
      const next = [...prev, id]
      const m = CAVE_MISSIONS.find(m => m.id === id)
      if (m) addXp(m.xp)
      return next
    })
  }, [addXp])

  // ── Stage advancement ─────────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'play') return
    const required = CAVE_MISSIONS.filter(m => m.stage === stage && !m.optional).map(m => m.id)
    if (required.length > 0 && required.every(id => done.includes(id)) && stage < 5) {
      const next = stage + 1
      setTimeout(() => { setStage(next); saveCheckpoint(next, done, freedIds) }, 800)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done, phase])

  // ── Combat victory → complete mission ────────────────────────────────────
  useEffect(() => {
    if (combatPhase !== 'victory') return
    if (battleCtxRef.current === 'sombra') {
      setDefeatedSombras(n => {
        const next = n + 1
        if (next >= 2) completeMission('defeat_sombras')
        return next
      })
      battleCtxRef.current = null
    } else if (battleCtxRef.current === 'maestro') {
      completeMission('defeat_maestro')
      battleCtxRef.current = null
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [combatPhase])

  // ── F key + 1/2/3 skill shortcuts ────────────────────────────────────────
  useEffect(() => {
    const handler = e => {
      if (e.code === 'KeyF' && nearbyNpc && !activeNpc && phase === 'play') {
        handleTalkNpc(nearbyNpc)
      }
      if (e.code === 'Escape' && activeNpc) setActiveNpc(null)
      if (phase === 'play' && !activeNpc) {
        const skills = STAGE_SKILLS[stage] ?? []
        if (e.code === 'Digit1' && skills[0]) handleUseSkill(skills[0])
        if (e.code === 'Digit2' && skills[1]) handleUseSkill(skills[1])
        if (e.code === 'Digit3' && skills[2]) handleUseSkill(skills[2])
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nearbyNpc, activeNpc, phase, stage])

  // ── Player movement: proximity auto-missions ──────────────────────────────
  const handlePlayerMove = useCallback(([x,,z]) => {
    if (z < -12.5 && !done.includes('observe_shadows')) completeMission('observe_shadows')
    if (z < -9    && !done.includes('approach_fire') && stage >= 2) completeMission('approach_fire')
    if (z < -7    && !done.includes('reach_fire_esceptico') && stage >= 3) completeMission('reach_fire_esceptico')
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done, stage])

  // ── Exit cave ─────────────────────────────────────────────────────────────
  function handleExitCave() {
    completeMission('exit_cave')
    setStage(4)
    setIsOutside(true)
    teleportRef.current = [0, 2, 12]
    saveCheckpoint(4, [...done, 'exit_cave'], freedIds)
  }

  // ── Return to cave ────────────────────────────────────────────────────────
  function handleReturnCave() {
    completeMission('return_cave')
    setStage(5)
    setIsOutside(false) // ← critical: switches back to cave interior
    teleportRef.current = [0, 2, 3] // teleport to cave interior entrance
    saveCheckpoint(5, [...done, 'return_cave'], freedIds)
  }

  // ── Free prisoner (4 total including mascot) ──────────────────────────────
  function handleFreePrisoner(id) {
    if (freedIds.includes(id)) return
    const next = [...freedIds, id]
    setFreedIds(next)
    const despSk = STAGE_SKILLS[5]?.[0]
    if (despSk) setActiveVfx(despSk)
    // All 4 freed (creyente, sonador, miedoso, mascota)
    if (['creyente','sonador','miedoso','mascota'].every(pid => next.includes(pid))) {
      completeMission('free_all_prisoners')
      completeMission('final_custodio')
      setTimeout(() => { setPhase('complete'); localStorage.removeItem(CHECKPOINT_KEY) }, 1500)
    }
  }

  // ── Use skill ─────────────────────────────────────────────────────────────
  function handleUseSkill(sk) {
    setActiveVfx(sk)
    if (sk.missionId) completeMission(sk.missionId)
    if (sk.id === 'la_pregunta') setUsedLaPregunta(p => p + 1)
    if (sk.id === 'la_pregunta' && usedLaPregunta + 1 >= 2) completeMission('use_la_pregunta')
    // Despertar skill in stage 5: free the nearest unfree prisoner
    if (sk.id === 'despertar' && stage === 5 && nearbyNpc && ['creyente','sonador','miedoso','mascota'].includes(nearbyNpc)) {
      handleFreePrisoner(nearbyNpc)
    }
  }

  // ── Admin dev stage jump ──────────────────────────────────────────────────
  function handleDevSetStage(s) {
    setStage(s)
    setIsOutside(s === 4) // stage 4 starts outside
    if (s === 4) teleportRef.current = [0, 2, 12]
    else if (s === 5) { setIsOutside(false); teleportRef.current = [0, 2, 3] }
    else teleportRef.current = [0, 2, 4]
  }

  // ── Sombra click → battle ─────────────────────────────────────────────────
  function handleSombraClick() {
    if (defeatedSombras >= 2) return
    battleCtxRef.current = 'sombra'
    useCombatStore.getState().startBattle(CAVE_ENEMIES.sombra)
  }

  // ── NPC click from 3D ──────────────────────────────────────────────────────
  function handleTalkNpc(id) {
    if (['creyente','sonador','miedoso','mascota'].includes(id)) { completeMission('talk_prisoner'); setActiveNpc(id) }
    else if (id === 'esceptico') { completeMission('meet_esceptico'); setActiveNpc(id) }
    else if (id === 'custodio_mayor') {
      completeMission('talk_custodio')
      if (stage === 5 && !done.includes('defeat_maestro')) {
        battleCtxRef.current = 'maestro'
        useCombatStore.getState().startBattle(CAVE_ENEMIES.maestro)
      } else {
        setActiveNpc(id)
      }
    }
    else if (id === 'custodio_joven') { completeMission('talk_custodio'); setActiveNpc(id) }
    else if (id === 'jafet') { completeMission('talk_jafet_outside'); setActiveNpc(id) }
  }

  // ── Jafet AI ──────────────────────────────────────────────────────────────
  async function handleAiMessage(text) {
    setAiMessages(p => [...p, { role:'user', content:text }])
    setAiLoading(true)
    try {
      const { activeCredentialId } = useSettingsStore.getState()
      const hasConnection = useAiCredentialsStore.getState().connections.some((c) => c.id === activeCredentialId)
      if (hasConnection) {
        const reply = await sendNpcMessage({ npcPrompt: JAFET_OUTSIDE_PROMPT, content: text, history: aiMessages })
        setAiMessages(p => [...p, { role:'assistant', content:reply }])
      } else {
        setAiMessages(p => [...p, { role:'assistant', content:'La filosofía no da respuestas — te ayuda a hacer mejores preguntas. ¿Qué sombras reconoces en tu propia vida cotidiana? 🤔' }])
      }
    } catch { setAiMessages(p => [...p, { role:'assistant', content:'Hay algo de interferencia filosófica... inténtalo de nuevo. 🏛️' }]) }
    finally { setAiLoading(false) }
  }

  cineLocked.current = phase !== 'play' || !!activeNpc
  const canFree = stage === 5

  return (
    <div id="vr-canvas-wrap" className="relative h-screen w-screen overflow-hidden" style={{ background: isOutside ? '#6ba3d6' : '#1a0e06' }}>
      {/* Touch look handler (right-side drag → yaw) */}
      {phase === 'play' && <TouchLook touchYawRef={touchYawRef} lockedRef={cineLocked} activeNpc={activeNpc}/>}

      {/* ── Canvas ── */}
      <Canvas camera={{ position:[0,2,4], fov:65 }} className="absolute inset-0">
        <CaveScene
          stage={stage} phase={phase} isOutside={isOutside}
          freedIds={freedIds} canFree={canFree}
          defeatedSombras={defeatedSombras}
          playerMascot={playerMascot}
          onTalkNpc={handleTalkNpc} onFreeNpc={handleFreePrisoner}
          onExitCave={handleExitCave} onReturnCave={handleReturnCave}
          onSombraClick={handleSombraClick}
        />
        {phase === 'play' && <>
          <FirstPersonController lockedRef={cineLocked} teleportRef={teleportRef} touchMoveRef={touchMoveRef} touchYawRef={touchYawRef} onMove={handlePlayerMove}/>
          <ProximityDetector stage={stage} onNearby={setNearbyNpc}/>
        </>}
        <CinematicRig active={phase==='world_cinematic'} keyframes={WORLD_CINEMATIC} onSubtitle={setWorldSubtitle} onDone={() => { setPhase('play'); setStage(1) }}/>
      </Canvas>

      {/* ── VFX ── */}
      {activeVfx && <SkillVfx skill={activeVfx} onDone={() => setActiveVfx(null)}/>}

      {/* ── PHASES ── */}
      {phase === 'start' && <StartScreen onStart={() => setPhase('intro_cinematic')} onBack={() => navigate(-1)}/>}
      {phase === 'intro_cinematic' && <IntroCinematicOverlay onDone={() => setPhase('world_cinematic')}/>}
      {phase === 'world_cinematic' && worldSubtitle && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 flex flex-col items-center pb-10">
          <div className="mx-4 max-w-2xl rounded-2xl px-6 py-4 text-center backdrop-blur-sm" style={{ background:'rgba(4,2,8,0.88)', border:'1px solid rgba(234,179,8,0.25)' }}>
            <p className="text-xs font-black mb-1" style={{ color:'#eab308' }}>🎓 Jafet Brito</p>
            <p className="text-sm leading-relaxed italic" style={{ color:'rgba(255,255,255,0.88)' }}>{worldSubtitle}</p>
          </div>
          <button type="button" onClick={() => { window.speechSynthesis?.cancel(); setPhase('play'); setStage(1) }} className="mt-3 rounded-xl px-4 py-1.5 text-xs font-bold" style={{ background:'rgba(255,255,255,0.06)', color:'rgba(255,255,255,0.35)', border:'1px solid rgba(255,255,255,0.1)' }}>Omitir →</button>
        </div>
      )}

      {/* ── PLAY UI ── */}
      {phase === 'play' && (
        <>
          {/* Stage bar */}
          <div className="pointer-events-none absolute left-0 right-0 top-0 flex justify-center pt-4 z-20">
            <div className="rounded-2xl px-5 py-2 backdrop-blur-sm" style={{ background:`rgba(${isOutside?'18,26,40':'12,6,4'},0.85)`, border:'1px solid rgba(234,179,8,0.28)' }}>
              <p className="text-center text-sm font-black" style={{ color:'#eab308' }}>🏛️ La Cueva de Platón</p>
              <p className="text-center text-[10px]" style={{ color:'rgba(255,255,255,0.3)' }}>
                {stage===1&&'Etapa 1: El Prisionero — habla, observa, usa tus habilidades'}
                {stage===2&&'Etapa 2: La Duda — encuentra al Escéptico, usa ❓ 2 veces'}
                {stage===3&&'Etapa 3: El Fuego — acompaña al Escéptico, habla con el Custodio'}
                {stage===4&&`Etapa 4: La Salida — habla con Jafet. Luego decide si vuelves.`}
                {stage===5&&`Etapa 5: El Regreso — libera a todos (${freedIds.length}/4) · incluida tu mascota`}
              </p>
            </div>
          </div>

          <PrisonerModeHud stage={stage}/>
          <MissionPanel done={done} stage={stage}/>
          {!activeNpc && <SkillBar stage={stage} done={done} usedLaPregunta={usedLaPregunta} onUse={handleUseSkill}/>}
          {nearbyNpc && !activeNpc && <NpcPrompt npcId={nearbyNpc} playerMascotName={playerMascot?.name} onTalk={() => handleTalkNpc(nearbyNpc)}/>}
          <div className="pointer-events-none absolute bottom-3 right-4 z-10 text-right">
            <p className="text-[9px]" style={{ color:'rgba(255,255,255,0.2)' }}>WASD mover · Ratón girar · F hablar · 1/2/3 habilidades · ESC cerrar</p>
          </div>
          {/* Dev panel (admin only) */}
          <DevPanel stage={stage} isOutside={isOutside} onSetStage={handleDevSetStage}/>
          {/* Mobile virtual joystick */}
          {!activeNpc && <VirtualJoystick touchMoveRef={touchMoveRef}/>}
          {/* MascotCompanion overlay — full character menu in VR */}
          <MascotCompanion courseId="course-filo-001" module={FILO_MODULE_2}/>
        </>
      )}

      {/* ── Battle screen ── */}
      {combatActive && <BattleScreen/>}

      {/* ── NPC dialogue ── */}
      {activeNpc && (
        <NpcDialogueUI npcId={activeNpc} stage={stage} freedIds={freedIds}
          playerMascotName={playerMascot?.name}
          onClose={() => setActiveNpc(null)}
          onAiMessage={handleAiMessage} aiMessages={aiMessages} aiLoading={aiLoading}/>
      )}

      {/* ── COMPLETION ── */}
      {phase === 'complete' && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center px-6 overflow-y-auto" style={{ background:'linear-gradient(160deg,rgba(4,2,8,0.96),rgba(10,5,2,0.99))' }}>
          <div className="flex max-w-lg flex-col items-center gap-6 text-center py-8">
            <p className="text-7xl">🏛️</p>
            <div><h1 className="text-3xl font-black" style={{ color:'#eab308' }}>¡La Cueva Completada!</h1><p className="mt-2 text-base" style={{ color:'rgba(255,255,255,0.5)' }}>Has vivido la Alegoría de la Cueva y liberaste a todos los prisioneros — incluyendo a tu mascota.</p></div>
            <div className="rounded-2xl px-5 py-4 w-full" style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(234,179,8,0.2)' }}>
              <p className="text-sm font-black mb-3" style={{ color:'rgba(255,255,255,0.5)' }}>RECOMPENSAS OBTENIDAS</p>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3 rounded-xl px-3 py-2" style={{ background:'rgba(234,179,8,0.08)' }}>
                  <span className="text-2xl">🏛️</span><div className="text-left"><p className="text-sm font-black" style={{ color:'#fcd34d' }}>Filósofo Iluminado</p><p className="text-[10px]" style={{ color:'rgba(255,255,255,0.35)' }}>Logro único — en tu perfil</p></div>
                </div>
                <div className="flex items-center gap-3 rounded-xl px-3 py-2" style={{ background:'rgba(255,255,255,0.04)' }}>
                  <span className="text-2xl">{CAVE_SOUVENIR_ITEM.icon}</span><div className="text-left"><p className="text-sm font-black" style={{ color:'rgba(255,255,255,0.8)' }}>{CAVE_SOUVENIR_ITEM.name}</p><p className="text-[10px]" style={{ color:'rgba(255,255,255,0.35)' }}>{CAVE_SOUVENIR_ITEM.description}</p></div>
                </div>
              </div>
            </div>
            {/* Secret VR code — student copies this to unlock the course mission */}
            <div className="rounded-2xl px-5 py-4 w-full" style={{ background:'rgba(234,179,8,0.07)', border:'1px solid rgba(234,179,8,0.35)' }}>
              <p className="text-xs font-black mb-2" style={{ color:'rgba(255,255,255,0.4)' }}>🔑 CÓDIGO SECRETO — cópialo en tu clase</p>
              <p className="text-2xl font-black tracking-[0.25em] select-all" style={{ color:'#fcd34d', letterSpacing:'0.3em' }}>{VR_CODE}</p>
              <p className="text-[10px] mt-1" style={{ color:'rgba(255,255,255,0.25)' }}>Introdúcelo en la misión "Entrar al mundo VR" de la Clase 2 para completarla.</p>
            </div>
            <button type="button" onClick={() => navigate(-1)} className="rounded-2xl px-10 py-4 text-lg font-black transition-all hover:scale-105" style={{ background:'linear-gradient(135deg,#eab308,#f97316)', color:'#0a0600' }}>📚 Volver al curso</button>
            <button type="button" onClick={() => navigate('/vr')} className="text-xs transition" style={{ color:'rgba(255,255,255,0.25)' }}>🌍 Ir al Campus VR</button>
          </div>
        </div>
      )}
    </div>
  )
}
