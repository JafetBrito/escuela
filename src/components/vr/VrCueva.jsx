/**
 * VrCueva — La Cueva de Platón (Experiencia completa ~20 min)
 *
 * Phases: 'start' → 'intro_cinematic' → 'world_cinematic' → 'play' → 'complete'
 * Stages (during 'play'): 1 El Prisionero · 2 La Duda · 3 El Fuego · 4 La Salida · 5 El Regreso
 */
import { Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useNavigate } from 'react-router-dom'
import { getMascotById } from '../../data/mascotRegistry'
import { sendNpcMessage } from '../../services/chat/npcTransport'
import { useSettingsStore, getModelProvider } from '../../stores/useSettingsStore'
import { useVrSettingsStore } from '../../stores/useVrSettingsStore'
import { useLevelStore } from '../../stores/useLevelStore'
import MascotMesh from '../mascot/MascotMesh'
import {
  WORLD_CINEMATIC, CAVE_MISSIONS, STAGE_SKILLS, NPC_CONFIGS,
  JAFET_OUTSIDE_PROMPT, CHECKPOINT_KEY, CAVE_SOUVENIR_ITEM,
} from './cuevaData'

// ── Intro cinematic (text-only, ~2 min) ───────────────────────────────────────
const INTRO_LINES = [
  '380 años antes de Cristo, el filósofo griego Platón escribió uno de los pasajes más influyentes de toda la historia del pensamiento humano.',
  'Lo llamó la Alegoría de la Cueva. Una historia que cambiaría para siempre la forma en que los seres humanos entienden lo que es real.',
  'Imagina una caverna profunda bajo la tierra. En su interior viven personas encadenadas desde su nacimiento. No pueden moverse. No pueden girar la cabeza.',
  'Detrás de ellos arde una hoguera. Entre el fuego y los prisioneros, otros seres hacen pasar figuras y objetos, proyectando sombras sobre la pared del fondo.',
  'Para los prisioneros, esas sombras lo son todo. Son los árboles, los animales, las personas. Son el mundo entero. Nunca han visto nada más.',
  'Nunca se preguntan de dónde vienen esas sombras. Nunca cuestionan lo que ven. ¿Por qué habrían de hacerlo? Es todo lo que conocen. Es todo lo que son.',
  '¿Y si nosotros somos esos prisioneros? ¿Y si lo que llamamos realidad es tan solo el reflejo de algo más profundo, algo que aún no hemos tenido el valor de mirar de frente?',
  'Hoy vas a vivir esa pregunta desde adentro. Serás uno de esos prisioneros. Sentirás el peso de las cadenas. Aprenderás a no cuestionar, a seguir la corriente.',
  'Pero en algún momento, algo te llamará desde el fondo de la caverna. Una luz. Y tendrás que decidir si tienes el valor de caminar hacia ella.',
  'Soy Jafet Brito, y seré tu guía en este viaje filosófico. Bienvenido... a La Cueva de Platón.',
]

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
      {[0,1,2,3,4].map(i => { const a = (i/5)*Math.PI*2; return <mesh key={i} position={[Math.sin(a)*0.9, 0.2, Math.cos(a)*0.9]}><sphereGeometry args={[0.35,6,5]}/><meshStandardMaterial color="#4a4035" roughness={1}/></mesh> })}
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

// Custodio (hooded shadow-puppeteer) 3D mesh
function CustodioMesh({ cfg, onClick }) {
  const g = useRef(); const [hov, setHov] = useState(false)
  useFrame(({ clock }) => { if (g.current) g.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.3 + cfg.position[0]) * 0.1 })
  const dark = hov ? '#4a3030' : cfg.color
  return (
    <group ref={g} position={cfg.position} onClick={e => { e.stopPropagation(); onClick(cfg.id) }} onPointerOver={() => setHov(true)} onPointerOut={() => setHov(false)}>
      {/* Robe body */}
      <mesh position={[0,0.9,0]}><cylinderGeometry args={[0.32,0.44,1.8,8]}/><meshStandardMaterial color={dark} roughness={0.95}/></mesh>
      {/* Hood */}
      <mesh position={[0,1.95,0]}><coneGeometry args={[0.29,0.58,8]}/><meshStandardMaterial color={dark} roughness={0.95}/></mesh>
      {/* Eyes */}
      {[-0.09,0.09].map((x,i) => <mesh key={i} position={[x,1.82,0.21]}><sphereGeometry args={[0.04,6,6]}/><meshStandardMaterial color="#f97316" emissive="#f97316" emissiveIntensity={3}/></mesh>)}
      {/* Prop (object they hold to project shadow) */}
      <group position={[0.52,1.0,0.2]} rotation={[0.3,0,-0.3]}>
        <mesh><cylinderGeometry args={[0.04,0.04,0.85,6]}/><meshStandardMaterial color="#5a3a10" roughness={1}/></mesh>
        <mesh position={[0,0.6,0]}><sphereGeometry args={[0.18,8,6]}/><meshStandardMaterial color="#7a5a2a" roughness={0.8}/></mesh>
      </group>
      {hov && <mesh rotation={[-Math.PI/2,0,0]} position={[0,0.01,0]}><ringGeometry args={[0.5,0.68,20]}/><meshBasicMaterial color="#f97316" transparent opacity={0.4}/></mesh>}
    </group>
  )
}

// Prisoner NPC (chains, frees on stage 5)
function PrisonerNpcMesh({ cfg, freed, canFree, onTalk, onFree }) {
  const g = useRef(); const [hov, setHov] = useState(false)
  useFrame(({ clock }) => { if (!g.current || freed) return; g.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.4 + cfg.position[0]) * 0.08 })
  const col = freed ? '#4ade80' : hov ? '#d4a87a' : cfg.color
  return (
    <group ref={g} position={cfg.position} onClick={e => { e.stopPropagation(); canFree && !freed ? onFree(cfg.id) : onTalk(cfg.id) }} onPointerOver={() => setHov(true)} onPointerOut={() => setHov(false)}>
      <mesh position={[0,0.65,0]}><cylinderGeometry args={[0.2,0.25,1.1,8]}/><meshStandardMaterial color={col} roughness={0.8}/></mesh>
      <mesh position={[0,1.38,0]}><sphereGeometry args={[0.22,10,8]}/><meshStandardMaterial color={col} roughness={0.8}/></mesh>
      {!freed && [-0.3,0.3].map((x,i) => <mesh key={i} position={[x,0.4,0]} rotation={[0,0,Math.PI/3*(i?1:-1)]}><torusGeometry args={[0.1,0.03,6,12]}/><meshStandardMaterial color="#8a7a5a" metalness={0.8} roughness={0.3}/></mesh>)}
      {freed && <mesh rotation={[-Math.PI/2,0,0]} position={[0,0.02,0]}><ringGeometry args={[0.3,0.7,20]}/><meshStandardMaterial color="#4ade80" emissive="#4ade80" emissiveIntensity={1.2} transparent opacity={0.5}/></mesh>}
      {hov && !freed && <mesh rotation={[-Math.PI/2,0,0]} position={[0,0.01,0]}><ringGeometry args={[0.35,0.52,20]}/><meshBasicMaterial color="#fbbf24" transparent opacity={0.35}/></mesh>}
    </group>
  )
}

// El Escéptico — special prisoner with growing glow
function EscepticoNpcMesh({ stage, onTalk }) {
  const cfg = NPC_CONFIGS.esceptico
  const g = useRef(); const gl = useRef(); const [hov, setHov] = useState(false)
  // Moves closer to fire in stage 3+
  const pos = stage >= 3 ? [-1.5, 0, -8] : cfg.position
  useFrame(({ clock }) => {
    if (!g.current) return
    g.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.6) * 0.15
    if (gl.current) gl.current.material.opacity = 0.08 + Math.sin(clock.getElapsedTime() * 2) * 0.06 + Math.min((stage - 1) * 0.12, 0.4)
  })
  return (
    <group ref={g} position={pos} onClick={e => { e.stopPropagation(); onTalk(cfg.id) }} onPointerOver={() => setHov(true)} onPointerOut={() => setHov(false)}>
      <mesh position={[0,0.65,0]}><cylinderGeometry args={[0.2,0.25,1.1,8]}/><meshStandardMaterial color={hov ? '#d4c890' : cfg.color} roughness={0.8}/></mesh>
      <mesh position={[0,1.38,0]}><sphereGeometry args={[0.22,10,8]}/><meshStandardMaterial color={hov ? '#d4c890' : cfg.color} roughness={0.8}/></mesh>
      {/* Glowing aura grows with stage */}
      <mesh ref={gl} position={[0,0.9,0]}><sphereGeometry args={[0.55,12,10]}/><meshStandardMaterial color="#fde68a" emissive="#fde68a" emissiveIntensity={0.8} transparent opacity={0.1}/></mesh>
      {stage < 4 && [-0.3,0.3].map((x,i) => <mesh key={i} position={[x,0.4,0]} rotation={[0,0,Math.PI/3*(i?1:-1)]}><torusGeometry args={[0.1,0.03,6,12]}/><meshStandardMaterial color="#8a7a5a" metalness={0.8} roughness={0.3}/></mesh>)}
      {hov && <mesh rotation={[-Math.PI/2,0,0]} position={[0,0.01,0]}><ringGeometry args={[0.35,0.52,20]}/><meshBasicMaterial color="#fde68a" transparent opacity={0.4}/></mesh>}
    </group>
  )
}

// Jafet outside cave (mascot mesh)
function JafetOutdoorNpc({ onTalk }) {
  const mascot = getMascotById(10)
  const g = useRef()
  useFrame(({ clock }) => {
    if (!g.current) return
    g.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.5) * 0.2
    g.current.position.y = Math.sin(clock.getElapsedTime() * 1.1) * 0.06
  })
  return (
    <group ref={g} position={[0, 0, 20]} scale={0.18} onClick={e => { e.stopPropagation(); onTalk('jafet') }}>
      <Suspense fallback={null}><MascotMesh mascot={mascot} /></Suspense>
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
      <mesh onClick={e => { e.stopPropagation(); onEnter() }} onPointerOver={e => { e.object.material.emissiveIntensity = 1.5 }} onPointerOut={e => { e.object.material.emissiveIntensity = 0.6 }}>
        <circleGeometry args={[1.1,16]}/><meshStandardMaterial color="#fde68a" emissive="#f59e0b" emissiveIntensity={0.6}/>
      </mesh>
    </group>
  )
}

// Cave re-entry portal (stage 5 - back into cave from outside)
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

// Full cave geometry + scene
function CaveScene({ stage, phase, freedIds, canFree, onTalkNpc, onFreeNpc, onExitCave, onReturnCave }) {
  const inOutdoor = stage >= 4
  const torches = [[-7.4,2.8,-3],[-7.4,2.8,-8],[7.4,2.8,-4],[7.4,2.8,-9],[0,2.8,-14]]

  return (
    <>
      {/* ── Outdoor scene (stage 4+) ── */}
      {inOutdoor ? (
        <>
          <color attach="background" args={['#6ba3d6']}/>
          <fog attach="fog" args={['#6ba3d6',30,80]}/>
          <ambientLight intensity={2.2} color="#fff9e6"/>
          <directionalLight position={[15,30,10]} intensity={4} color="#fff9e6"/>
          <pointLight position={[0,10,15]} intensity={8} distance={40} color="#fff5c0"/>
          {/* Sun */}
          <mesh position={[25,40,-20]}><sphereGeometry args={[3,16,16]}/><meshStandardMaterial color="#fde047" emissive="#fde047" emissiveIntensity={4}/></mesh>
          {/* Grass ground */}
          <mesh rotation={[-Math.PI/2,0,0]} position={[0,-0.02,18]}><planeGeometry args={[60,50]}/><meshStandardMaterial color="#4a7c2a" roughness={0.9}/></mesh>
          {/* Cave wall (entry visible from outside) */}
          <mesh position={[0,4,9]}><boxGeometry args={[14,10,1]}/><meshStandardMaterial color="#3a2210" roughness={1}/></mesh>
          <JafetOutdoorNpc onTalk={onTalkNpc}/>
          {stage === 5 && <CaveEntrance onEnter={onReturnCave}/>}
        </>
      ) : (
        <>
          {/* ── Cave interior ── */}
          <color attach="background" args={['#1a0e06']}/>
          <fog attach="fog" args={['#1a0e06',18,40]}/>
          <ambientLight intensity={0.55} color="#6b3e18"/>
          <pointLight position={[0,2.5,-12]} color="#f97316" intensity={14} distance={36} decay={2}/>
          <pointLight position={[0,1.5,-12]} color="#fbbf24" intensity={6} distance={24} decay={2}/>
          <pointLight position={[-7,3,-3]}  color="#f97316" intensity={5} distance={12} decay={2}/>
          <pointLight position={[-7,3,-8]}  color="#f97316" intensity={5} distance={12} decay={2}/>
          <pointLight position={[7,3,-4]}   color="#f97316" intensity={5} distance={12} decay={2}/>
          <pointLight position={[7,3,-9]}   color="#f97316" intensity={5} distance={12} decay={2}/>
          <pointLight position={[0,4,2]}    color="#8a5028" intensity={5} distance={16} decay={2}/>
          <pointLight position={[0,3,-6]}   color="#7a4518" intensity={4} distance={14} decay={2}/>
          {/* Floor */}
          <mesh rotation={[-Math.PI/2,0,0]} position={[0,-0.02,0]}><planeGeometry args={[28,36]}/><meshStandardMaterial color="#3a2510" roughness={1}/></mesh>
          {/* Ceiling */}
          <mesh rotation={[Math.PI/2,0,0]} position={[0,8,-5]}><planeGeometry args={[28,36]}/><meshStandardMaterial color="#1e1408" roughness={1}/></mesh>
          {/* Walls */}
          <mesh rotation={[0,Math.PI/2,0]} position={[-8,4,-5]}><planeGeometry args={[36,9]}/><meshStandardMaterial color="#4a2e12" roughness={1}/></mesh>
          <mesh rotation={[0,-Math.PI/2,0]} position={[8,4,-5]}><planeGeometry args={[36,9]}/><meshStandardMaterial color="#4a2e12" roughness={1}/></mesh>
          <mesh position={[0,4.5,-15]}><planeGeometry args={[20,12]}/><meshStandardMaterial color="#3a2210" roughness={1}/></mesh>
          {/* Stalactites */}
          {[[-4,8,-6],[0,8,-9],[4,8,-7],[-2,8,-12],[2.5,8,-11]].map(([x,y,z],i) => (
            <mesh key={i} position={[x,y-0.3,z]} rotation={[Math.PI,0,0]}><coneGeometry args={[0.2+i*0.04,0.8+i*0.3,7]}/><meshStandardMaterial color="#3c2a14" roughness={1}/></mesh>
          ))}
          {/* Rocks */}
          {[[-7,0.5,-3],[-7,0.5,-8],[7,0.5,-4],[7,0.5,-9]].map(([x,y,z],i) => (
            <mesh key={i} position={[x,y,z]}><dodecahedronGeometry args={[0.7+i*0.15,0]}/><meshStandardMaterial color="#3e2a12" roughness={1}/></mesh>
          ))}
          {torches.map((p,i) => <WallTorch key={i} position={p}/>)}
          <FirePit position={[0,0,-12]}/>
          <ShadowProjections/>
          {/* NPCs */}
          {phase === 'play' && (<>
            {['creyente','sonador','miedoso'].map(id => (
              <PrisonerNpcMesh key={id} cfg={NPC_CONFIGS[id]} freed={freedIds.includes(id)} canFree={canFree} onTalk={onTalkNpc} onFree={onFreeNpc}/>
            ))}
            {stage >= 2 && <EscepticoNpcMesh stage={stage} onTalk={onTalkNpc}/>}
            <CustodioMesh cfg={NPC_CONFIGS.custodio_mayor} onClick={onTalkNpc}/>
            <CustodioMesh cfg={NPC_CONFIGS.custodio_joven} onClick={onTalkNpc}/>
            <CaveExitPortal visible={stage >= 3} onEnter={onExitCave}/>
          </>)}
        </>
      )}
    </>
  )
}

// First-person player controller (WASD + pointer lock mouse look)
function FirstPersonController({ lockedRef, onMove, startPos = [0, 2, 4] }) {
  const { camera, gl } = useThree()
  const keys = useRef({})
  const yaw = useRef(0) // 0 = facing -Z (into cave)
  const pointerLocked = useRef(false)
  const initialized = useRef(false)

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true
      camera.position.set(...startPos)
      camera.rotation.set(0, 0, 0, 'YXZ')
    }
  }, [camera, startPos])

  useEffect(() => {
    const down = e => { keys.current[e.code] = true }
    const up   = e => { keys.current[e.code] = false }
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up) }
  }, [])

  useEffect(() => {
    const onChange = () => { pointerLocked.current = document.pointerLockElement === gl.domElement }
    const onMove   = e => { if (!pointerLocked.current || lockedRef.current) return; yaw.current -= e.movementX * 0.0022 }
    const onClick  = () => { if (!lockedRef.current && document.pointerLockElement !== gl.domElement) gl.domElement.requestPointerLock() }
    document.addEventListener('pointerlockchange', onChange)
    document.addEventListener('mousemove', onMove)
    gl.domElement.addEventListener('click', onClick)
    return () => { document.removeEventListener('pointerlockchange', onChange); document.removeEventListener('mousemove', onMove); gl.domElement.removeEventListener('click', onClick) }
  }, [gl, lockedRef])

  useFrame((_, delta) => {
    if (lockedRef.current) return
    const speed = 5.5 * delta
    const euler = new THREE.Euler(0, yaw.current, 0, 'YXZ')
    const fwd   = new THREE.Vector3(0, 0, -1).applyEuler(euler)
    const right = new THREE.Vector3(1, 0, 0).applyEuler(euler)
    const p = camera.position
    if (keys.current['KeyW'] || keys.current['ArrowUp'])    p.addScaledVector(fwd, speed)
    if (keys.current['KeyS'] || keys.current['ArrowDown'])  p.addScaledVector(fwd, -speed)
    if (keys.current['KeyA'])                               p.addScaledVector(right, -speed)
    if (keys.current['KeyD'])                               p.addScaledVector(right, speed)
    if (keys.current['ArrowLeft'])  yaw.current += 1.8 * delta
    if (keys.current['ArrowRight']) yaw.current -= 1.8 * delta
    p.x = Math.max(-7, Math.min(7, p.x))
    p.z = Math.max(-14, Math.min(25, p.z))
    p.y = 2.0
    camera.rotation.set(0, yaw.current, 0, 'YXZ')
    onMove([p.x, p.y, p.z])
  })

  return null
}

// Cinematic camera rig — animates through keyframes
function CinematicRig({ active, keyframes, onSubtitle, onDone }) {
  const { camera } = useThree()
  const idxRef      = useRef(0)
  const progRef     = useRef(0)
  const notified    = useRef(false)
  const finished    = useRef(false)
  const initPos     = useRef(null)

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

// Proximity detector — detects which NPC is nearest
function ProximityDetector({ stage, freedIds, onNearby }) {
  const { camera } = useThree()
  const prevRef = useRef(null)
  const ALL_NPC_IDS = ['creyente','sonador','miedoso','custodio_mayor','custodio_joven', ...(stage >= 2 ? ['esceptico'] : []), ...(stage >= 4 ? ['jafet'] : [])]

  useFrame(() => {
    let closest = null
    let closestDist = 3.8
    for (const id of ALL_NPC_IDS) {
      const cfg = NPC_CONFIGS[id]
      if (!cfg) continue
      const pos = id === 'esceptico' ? (stage >= 3 ? [-1.5,0,-8] : cfg.position) : id === 'jafet' ? [0,2,20] : cfg.position
      const dx = camera.position.x - pos[0]
      const dz = camera.position.z - pos[2]
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

function StartScreen({ onStart, onBack }) {
  return (
    <div className="absolute inset-0 z-40 flex flex-col items-center justify-center px-6" style={{ background: 'linear-gradient(to bottom, rgba(10,5,3,0.92) 0%, rgba(10,5,3,0.98) 100%)' }}>
      <div className="flex max-w-lg flex-col items-center gap-8 text-center">
        <div>
          <p className="mb-3 text-7xl">🏛️</p>
          <h1 className="text-4xl font-black tracking-tight" style={{ color: '#eab308', textShadow: '0 0 50px rgba(234,179,8,0.35)' }}>La Cueva de Platón</h1>
          <p className="mt-2 text-base" style={{ color: 'rgba(255,255,255,0.4)' }}>Experiencia filosófica interactiva · ~20 minutos</p>
        </div>
        <div className="rounded-2xl px-5 py-4 text-left" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)' }}>Vivirás la Alegoría de la Cueva de Platón desde adentro. Explorarás la cueva libremente con <strong style={{color:'rgba(255,255,255,0.8)'}}>WASD</strong> + <strong style={{color:'rgba(255,255,255,0.8)'}}>ratón</strong>, hablarás con los prisioneros y los Custodios, y tendrás que tomar decisiones.</p>
          <p className="mt-3 text-xs" style={{ color: 'rgba(255,255,255,0.22)' }}>🎧 Activa el volumen · Tu progreso se guarda automáticamente</p>
        </div>
        <button type="button" onClick={onStart} className="rounded-2xl px-14 py-4 text-xl font-black transition-all hover:scale-105 active:scale-95" style={{ background: 'linear-gradient(135deg, #eab308 0%, #f97316 100%)', color: '#0a0600', boxShadow: '0 0 50px rgba(234,179,8,0.35)' }}>🏛️ Iniciar Misión</button>
        <button type="button" onClick={onBack} className="text-xs transition" style={{ color: 'rgba(255,255,255,0.2)' }}>← Volver al curso</button>
      </div>
    </div>
  )
}

// Text-only intro cinematic (10 lines, ~2 min)
function IntroCinematicOverlay({ onDone }) {
  const [idx, setIdx] = useState(0)
  const [vis, setVis] = useState(false)
  const skipRef = useRef(false)

  useEffect(() => { setVis(false); const t = setTimeout(() => setVis(true), 100); return () => clearTimeout(t) }, [idx])

  useEffect(() => {
    if (skipRef.current) return
    const cancel = speakLine(INTRO_LINES[idx], () => {
      if (skipRef.current) return
      if (idx >= INTRO_LINES.length - 1) { setTimeout(onDone, 900) }
      else { setTimeout(() => { if (!skipRef.current) setIdx(p => p + 1) }, 350) }
    })
    return () => { skipRef.current = false; cancel() }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx])

  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center" style={{ background: 'rgba(4,2,8,0.97)' }}>
      <button type="button" onClick={() => { skipRef.current = true; window.speechSynthesis?.cancel(); onDone() }} className="absolute right-4 top-4 rounded-xl px-4 py-2 text-xs font-bold" style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.1)' }}>Omitir →</button>
      <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: 'rgba(255,255,255,0.07)' }}>
        <div className="h-full transition-all duration-700" style={{ width: `${(idx/(INTRO_LINES.length-1))*100}%`, background: 'linear-gradient(90deg,#eab308,#f97316)' }}/>
      </div>
      <div className="mx-auto max-w-2xl px-8 text-center" style={{ opacity: vis?1:0, transform: vis?'translateY(0)':'translateY(10px)', transition: 'opacity 0.5s, transform 0.5s' }}>
        <p className="text-xl font-light leading-relaxed sm:text-2xl" style={{ color: 'rgba(255,255,255,0.92)', fontStyle: 'italic', lineHeight: 1.75 }}>&ldquo;{INTRO_LINES[idx]}&rdquo;</p>
        <p className="mt-6 text-[11px] tracking-widest" style={{ color: 'rgba(255,255,255,0.15)' }}>{idx+1} / {INTRO_LINES.length}</p>
      </div>
      <div className="absolute bottom-8 flex items-center gap-3 rounded-2xl px-5 py-3" style={{ background: 'rgba(20,10,35,0.9)', border: '1px solid rgba(234,179,8,0.22)' }}>
        <div className="flex h-10 w-10 items-center justify-center rounded-full text-xl" style={{ background: 'rgba(234,179,8,0.12)', border: '1px solid rgba(234,179,8,0.35)' }}>🎓</div>
        <div><p className="text-xs font-black" style={{ color: '#fcd34d' }}>Jafet Brito</p><p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.3)' }}>Filósofo y Guía</p></div>
        <div className="ml-3 flex items-end gap-0.5 pb-0.5">{[0,1,2,3].map(i => <div key={i} className="animate-bounce rounded-full" style={{ width:3, height:3+i*2, background:'#eab308', animationDelay:`${i*0.12}s`, animationDuration:'0.7s' }}/>)}</div>
      </div>
    </div>
  )
}

// NPC dialogue popup
function NpcDialogueUI({ npcId, stage, freedIds, onClose, onAiMessage, aiMessages, aiLoading }) {
  const cfg = NPC_CONFIGS[npcId]
  const [lineIdx, setLineIdx] = useState(0)
  const [aiInput, setAiInput] = useState('')

  const isJafet = npcId === 'jafet'

  // Pick correct dialogue key
  const getDialogueKey = () => {
    if (isJafet) return null
    if (npcId === 'custodio_mayor' && stage >= 5) {
      // check if all freed for final dialogue
      const allFreed = ['creyente','sonador','miedoso'].every(id => freedIds.includes(id))
      if (allFreed) return 'final'
    }
    if (npcId === 'custodio_joven' && stage >= 5) {
      const allFreed = ['creyente','sonador','miedoso'].every(id => freedIds.includes(id))
      if (allFreed) return 'final'
    }
    if (['creyente','sonador','miedoso'].includes(npcId) && freedIds.includes(npcId)) return 'freed'
    return String(Math.min(stage, Math.max(...Object.keys(cfg.dialogue ?? {}).map(Number))))
  }

  const key = getDialogueKey()
  const lines = cfg?.dialogue?.[key] ?? []

  useEffect(() => { setLineIdx(0) }, [npcId])

  const handleNext = () => { if (lineIdx < lines.length - 1) setLineIdx(p => p+1) }
  const sendAi = () => { if (!aiInput.trim()) return; onAiMessage(aiInput.trim()); setAiInput('') }

  const portrait = { creyente:'⛓️', sonador:'🌙', miedoso:'😨', esceptico:'🔍', custodio_mayor:'🧙', custodio_joven:'👁️', jafet:'🎓' }[npcId] ?? '❓'

  return (
    <div className="absolute inset-x-0 bottom-0 z-30 sm:absolute sm:inset-auto sm:bottom-4 sm:right-4 sm:w-96">
      <div className="flex flex-col overflow-hidden rounded-t-3xl shadow-2xl sm:rounded-3xl" style={{ maxHeight:'60vh', background:'linear-gradient(160deg,#1a0f2e 0%,#0c0814 100%)', border:'1px solid rgba(234,179,8,0.3)' }}>
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3" style={{ borderBottom:'1px solid rgba(255,255,255,0.07)' }}>
          <div className="flex h-11 w-11 items-center justify-center rounded-full text-2xl shrink-0" style={{ background:'rgba(234,179,8,0.12)', border:'1px solid rgba(234,179,8,0.3)' }}>{portrait}</div>
          <div className="flex-1">
            <p className="text-sm font-black" style={{ color:'#fcd34d' }}>{cfg?.name ?? 'Desconocido'}</p>
            <p className="text-[10px]" style={{ color:'rgba(255,255,255,0.3)' }}>{isJafet ? 'Filósofo y Guía — Fuera de la Cueva' : cfg?.type === 'custodio' ? 'Custodio' : 'Prisionero'}</p>
          </div>
          <button type="button" onClick={onClose} className="text-xl leading-none" style={{ color:'rgba(255,255,255,0.3)' }}>×</button>
        </div>

        {/* Content */}
        {isJafet ? (
          /* Jafet = real AI chat */
          <div className="flex flex-col flex-1 overflow-hidden">
            <div className="flex flex-1 flex-col gap-2 overflow-y-auto p-3">
              {aiMessages.length === 0 && <div className="rounded-2xl px-3 py-3 text-xs leading-relaxed" style={{ background:'rgba(255,255,255,0.06)', color:'rgba(255,255,255,0.7)', border:'1px solid rgba(255,255,255,0.07)' }}>
                Sal de la cueva y ahora puedo hablar contigo sin restricciones. Reflexionemos sobre lo que viviste. ¿Qué fue lo que más te impactó de la experiencia?
              </div>}
              {aiMessages.map((m,i) => <div key={i} className={`flex ${m.role==='user'?'justify-end':'justify-start'}`}><div className="max-w-[88%] rounded-2xl px-3 py-2 text-xs leading-relaxed" style={m.role==='user'?{background:'rgba(234,179,8,0.22)',color:'#fde68a',borderRadius:'16px 16px 4px 16px'}:{background:'rgba(255,255,255,0.06)',color:'rgba(255,255,255,0.8)',border:'1px solid rgba(255,255,255,0.07)',borderRadius:'16px 16px 16px 4px'}}>{m.content}</div></div>)}
              {aiLoading && <div className="flex justify-start"><div className="animate-pulse rounded-2xl px-3 py-2 text-xs" style={{ background:'rgba(255,255,255,0.06)', color:'rgba(255,255,255,0.35)' }}>Jafet está reflexionando…</div></div>}
            </div>
            <div className="flex gap-2 p-3" style={{ borderTop:'1px solid rgba(255,255,255,0.07)' }}>
              <input value={aiInput} onChange={e => setAiInput(e.target.value)} onKeyDown={e => e.key==='Enter'&&sendAi()} placeholder="Habla con Jafet sobre la experiencia…" className="flex-1 rounded-xl px-3 py-2 text-xs outline-none" style={{ background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.1)', color:'rgba(255,255,255,0.85)' }}/>
              <button type="button" onClick={sendAi} className="rounded-xl px-3 py-2 text-xs font-black" style={{ background:'rgba(234,179,8,0.28)', color:'#fcd34d' }}>→</button>
            </div>
          </div>
        ) : (
          /* Scripted NPC dialogue */
          <div className="flex flex-col gap-4 p-4">
            <p className="text-sm leading-relaxed" style={{ color:'rgba(255,255,255,0.82)', fontStyle:'italic' }}>&ldquo;{lines[lineIdx] ?? '...'}&rdquo;</p>
            <div className="flex items-center justify-between">
              <div className="flex gap-1.5">
                {lines.map((_,i) => <div key={i} className="rounded-full" style={{ width:6, height:6, background: i===lineIdx?'#eab308':'rgba(255,255,255,0.15)' }}/>)}
              </div>
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

function MissionPanel({ done, stage }) {
  const stageMissions = CAVE_MISSIONS.filter(m => m.stage <= stage)
  return (
    <div className="absolute left-3 top-16 z-20 w-52">
      <div className="rounded-2xl p-3 backdrop-blur-sm" style={{ background:'rgba(12,6,4,0.88)', border:'1px solid rgba(234,179,8,0.22)' }}>
        <p className="mb-2 text-[10px] font-black uppercase tracking-wider" style={{ color:'#eab308' }}>🏛️ Misiones · Etapa {stage}</p>
        <div className="flex flex-col gap-1.5">
          {stageMissions.map(m => {
            const isDone = done.includes(m.id)
            const isCurrent = !isDone && m.stage === stage
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
      <p className="text-[9px] font-bold uppercase tracking-widest" style={{ color:'rgba(255,255,255,0.3)' }}>Habilidades · Etapa {stage}</p>
      <div className="flex gap-4">
        {skills.map(sk => {
          const isDone = sk.missionId && (sk.id==='la_pregunta' ? usedLaPregunta >= 2 : done.includes(sk.missionId))
          return (
            <button key={sk.id} type="button" onClick={() => !isDone && onUse(sk)} title={sk.name} className="flex flex-col items-center gap-1.5 transition active:scale-90">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl text-3xl shadow-xl" style={{ background:`radial-gradient(circle at 38% 36%,${sk.color}44,${sk.color}18)`, border:`2px solid ${isDone?'rgba(74,222,128,0.6)':sk.color+'99'}`, boxShadow:isDone?'0 0 14px rgba(74,222,128,0.3)':`0 0 14px ${sk.color}44`, opacity:isDone?0.55:1 }}>
                {isDone?'✅':sk.icon}
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

function NpcPrompt({ npcId, onTalk }) {
  const cfg = NPC_CONFIGS[npcId] ?? { name: 'Jafet Brito' }
  return (
    <div className="absolute bottom-28 left-1/2 z-20 -translate-x-1/2 pointer-events-none">
      <div className="rounded-full px-4 py-2 text-xs font-bold backdrop-blur-sm animate-pulse" style={{ background:'rgba(12,6,4,0.88)', border:'1px solid rgba(234,179,8,0.45)', color:'#eab308' }}>
        F — Hablar con {cfg.name}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function VrCueva() {
  const navigate = useNavigate()
  const addXp = useLevelStore(s => s.addXp)

  // ── Phase + stage ──────────────────────────────────────────────────────────
  const [phase, setPhase] = useState('start') // start|intro_cinematic|world_cinematic|play|complete
  const [stage, setStage] = useState(1)

  // ── Mission + freedom tracking ─────────────────────────────────────────────
  const [done, setDone]           = useState([])
  const [freedIds, setFreedIds]   = useState([])
  const [usedLaPregunta, setUsedLaPregunta] = useState(0)

  // ── NPC dialogue ───────────────────────────────────────────────────────────
  const [activeNpc, setActiveNpc]   = useState(null) // npcId string
  const [nearbyNpc, setNearbyNpc]   = useState(null)
  const [aiMessages, setAiMessages] = useState([])
  const [aiLoading, setAiLoading]   = useState(false)

  // ── Cinematics ─────────────────────────────────────────────────────────────
  const [worldSubtitle, setWorldSubtitle] = useState('')
  const cineLocked = useRef(false)

  // ── World cinematic subtitle TTS ──────────────────────────────────────────
  useEffect(() => {
    if (!worldSubtitle || phase !== 'world_cinematic') return
    const cancel = speakLine(worldSubtitle, () => {})
    return cancel
  }, [worldSubtitle, phase])

  // ── Misc ───────────────────────────────────────────────────────────────────
  const [activeVfx, setActiveVfx] = useState(null)

  // ── Checkpoint ────────────────────────────────────────────────────────────
  useEffect(() => {
    // Load checkpoint on mount
    try {
      const saved = JSON.parse(localStorage.getItem(CHECKPOINT_KEY) ?? 'null')
      if (saved?.stage >= 2) {
        setPhase('play')
        setStage(saved.stage)
        setDone(saved.done ?? [])
        setFreedIds(saved.freedIds ?? [])
      }
    } catch {}
  }, [])

  const saveCheckpoint = useCallback((s, d, f) => {
    if (s >= 2) localStorage.setItem(CHECKPOINT_KEY, JSON.stringify({ stage: s, done: d, freedIds: f }))
  }, [])

  // ── Complete mission helper ────────────────────────────────────────────────
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
    const stageRequired = CAVE_MISSIONS.filter(m => m.stage === stage).map(m => m.id)
    if (stageRequired.length > 0 && stageRequired.every(id => done.includes(id))) {
      if (stage < 5) {
        const next = stage + 1
        setTimeout(() => {
          setStage(next)
          saveCheckpoint(next, done, freedIds)
        }, 800)
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done, phase])

  // ── F key: talk to nearby NPC ─────────────────────────────────────────────
  useEffect(() => {
    const handler = e => {
      if (e.code === 'KeyF' && nearbyNpc && !activeNpc && phase === 'play') {
        setActiveNpc(nearbyNpc)
        completeMission('talk_prisoner') // generic for any prisoner
        if (nearbyNpc === 'esceptico') completeMission('meet_esceptico')
        if (nearbyNpc === 'custodio_mayor' || nearbyNpc === 'custodio_joven') completeMission('talk_custodio')
        if (nearbyNpc === 'jafet') completeMission('talk_jafet_outside')
      }
      if (e.code === 'Escape' && activeNpc) setActiveNpc(null)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [nearbyNpc, activeNpc, phase, completeMission])

  // ── Player position: proximity auto-missions ──────────────────────────────
  const handlePlayerMove = useCallback(([x, , z]) => {
    // observe_shadows: near back wall
    if (z < -12.5 && z > -14.5 && !done.includes('observe_shadows')) completeMission('observe_shadows')
    // approach_fire: near fire
    if (z < -9 && !done.includes('approach_fire') && stage >= 2) completeMission('approach_fire')
    // reach_fire_esceptico
    if (z < -7 && !done.includes('reach_fire_esceptico') && stage >= 3) completeMission('reach_fire_esceptico')
    // return_cave (stage 5, re-entering from outside via walking)
    if (z < 9 && z > 0 && stage === 5 && !done.includes('return_cave')) completeMission('return_cave')
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done, stage])

  // ── Exit cave ─────────────────────────────────────────────────────────────
  function handleExitCave() {
    completeMission('exit_cave')
    setStage(4)
    saveCheckpoint(4, [...done, 'exit_cave'], freedIds)
    // Unlock despertar
  }

  // ── Return to cave ────────────────────────────────────────────────────────
  function handleReturnCave() {
    completeMission('return_cave')
    setStage(5)
    saveCheckpoint(5, [...done, 'return_cave'], freedIds)
  }

  // ── Free prisoner ─────────────────────────────────────────────────────────
  function handleFreePrisoner(id) {
    if (freedIds.includes(id)) return
    const next = [...freedIds, id]
    setFreedIds(next)
    setActiveVfx(STAGE_SKILLS[5][0]) // despertar VFX
    if (next.length >= 3) {
      completeMission('free_all_prisoners')
      completeMission('final_custodio')
      setTimeout(() => { setPhase('complete'); localStorage.removeItem(CHECKPOINT_KEY) }, 1200)
    }
  }

  // ── Use skill ─────────────────────────────────────────────────────────────
  function handleUseSkill(sk) {
    setActiveVfx(sk)
    if (sk.missionId) completeMission(sk.missionId)
    if (sk.id === 'la_pregunta') setUsedLaPregunta(p => p + 1)
    if (sk.id === 'la_pregunta' && usedLaPregunta + 1 >= 2) completeMission('use_la_pregunta')
  }

  // ── NPC click (from 3D mesh) ──────────────────────────────────────────────
  function handleTalkNpc(id) {
    setActiveNpc(id)
    if (id !== 'jafet') {
      if (['creyente','sonador','miedoso'].includes(id)) completeMission('talk_prisoner')
      if (id === 'esceptico') completeMission('meet_esceptico')
      if (id === 'custodio_mayor' || id === 'custodio_joven') completeMission('talk_custodio')
    } else {
      completeMission('talk_jafet_outside')
    }
  }

  // ── Jafet AI message ──────────────────────────────────────────────────────
  async function handleAiMessage(text) {
    setAiMessages(p => [...p, { role:'user', content:text }])
    setAiLoading(true)
    try {
      const { minimaxApiKey, deepseekApiKey, chatModel } = useSettingsStore.getState()
      const provider = getModelProvider(chatModel)
      const apiKey = provider === 'deepseek' ? deepseekApiKey : minimaxApiKey
      if (apiKey && !apiKey.startsWith('mx-mock')) {
        const reply = await sendNpcMessage({ npcPrompt: JAFET_OUTSIDE_PROMPT, content: text, history: aiMessages })
        setAiMessages(p => [...p, { role:'assistant', content:reply }])
      } else {
        setAiMessages(p => [...p, { role:'assistant', content:'Reflexiona sobre lo que viviste. La filosofía no da respuestas — te ayuda a hacer mejores preguntas. ¿Qué sombras reconoces en tu propia vida? 🤔' }])
      }
    } catch { setAiMessages(p => [...p, { role:'assistant', content:'Hay algo de interferencia filosófica... inténtalo de nuevo. 🏛️' }]) }
    finally { setAiLoading(false) }
  }

  // ── Cinematic lock ref ────────────────────────────────────────────────────
  cineLocked.current = phase !== 'play' || !!activeNpc

  const canFree = stage === 5

  return (
    <div className="relative h-screen w-screen overflow-hidden" style={{ background: stage >= 4 ? '#6ba3d6' : '#1a0e06' }}>

      {/* ── Canvas ── */}
      <Canvas camera={{ position:[0,2,4], fov:65 }} className="absolute inset-0">
        <CaveScene
          stage={stage} phase={phase} freedIds={freedIds} canFree={canFree}
          onTalkNpc={handleTalkNpc} onFreeNpc={handleFreePrisoner}
          onExitCave={handleExitCave} onReturnCave={handleReturnCave}
        />
        {phase === 'play' && <>
          <FirstPersonController lockedRef={cineLocked} onMove={handlePlayerMove}/>
          <ProximityDetector stage={stage} freedIds={freedIds} onNearby={setNearbyNpc}/>
        </>}
        <CinematicRig active={phase==='world_cinematic'} keyframes={WORLD_CINEMATIC} onSubtitle={setWorldSubtitle}
          onDone={() => { setPhase('play'); setStage(1); completeMission('meet_jafet' /* reuse as "entered cave" */); }}/>
      </Canvas>

      {/* ── Skill VFX ── */}
      {activeVfx && <SkillVfx skill={activeVfx} onDone={() => setActiveVfx(null)}/>}

      {/* ── PHASES ── */}
      {phase === 'start' && <StartScreen onStart={() => setPhase('intro_cinematic')} onBack={() => navigate(-1)}/>}
      {phase === 'intro_cinematic' && <IntroCinematicOverlay onDone={() => setPhase('world_cinematic')}/>}

      {/* World cinematic subtitle bar */}
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
          {/* Top stage bar */}
          <div className="pointer-events-none absolute left-0 right-0 top-0 flex justify-center pt-4 z-20">
            <div className="rounded-2xl px-5 py-2 backdrop-blur-sm" style={{ background:`rgba(${stage>=4?'18,26,40':'12,6,4'},0.85)`, border:'1px solid rgba(234,179,8,0.28)' }}>
              <p className="text-center text-sm font-black" style={{ color:'#eab308' }}>🏛️ La Cueva de Platón</p>
              <p className="text-center text-[10px]" style={{ color:'rgba(255,255,255,0.3)' }}>
                {stage===1 && 'Etapa 1: El Prisionero — explora, habla con los demás, usa tus habilidades'}
                {stage===2 && 'Etapa 2: La Duda — busca al Escéptico, usa ❓ La Gran Pregunta'}
                {stage===3 && 'Etapa 3: El Fuego — acompaña al Escéptico hacia el fuego'}
                {stage===4 && 'Etapa 4: La Salida — habla con Jafet. Luego decides si vuelves.'}
                {stage===5 && `Etapa 5: El Regreso — libera a los prisioneros (${freedIds.length}/3)`}
              </p>
            </div>
          </div>

          <MissionPanel done={done} stage={stage}/>
          {!activeNpc && <SkillBar stage={stage} done={done} usedLaPregunta={usedLaPregunta} onUse={handleUseSkill}/>}
          {nearbyNpc && !activeNpc && <NpcPrompt npcId={nearbyNpc} onTalk={() => handleTalkNpc(nearbyNpc)}/>}

          {/* Controls hint */}
          <div className="pointer-events-none absolute bottom-3 right-4 z-10 text-right">
            <p className="text-[9px]" style={{ color:'rgba(255,255,255,0.2)' }}>WASD mover · Ratón girar · F hablar · ESC cerrar</p>
          </div>
        </>
      )}

      {/* NPC dialogue */}
      {activeNpc && (
        <NpcDialogueUI npcId={activeNpc} stage={stage} freedIds={freedIds} onClose={() => setActiveNpc(null)}
          onAiMessage={handleAiMessage} aiMessages={aiMessages} aiLoading={aiLoading}/>
      )}

      {/* ── COMPLETION ── */}
      {phase === 'complete' && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center px-6" style={{ background:'linear-gradient(160deg,rgba(4,2,8,0.96) 0%,rgba(10,5,2,0.99) 100%)' }}>
          <div className="flex max-w-lg flex-col items-center gap-6 text-center">
            <p className="text-7xl">🏛️</p>
            <div>
              <h1 className="text-3xl font-black" style={{ color:'#eab308' }}>¡La Cueva Completada!</h1>
              <p className="mt-2 text-base" style={{ color:'rgba(255,255,255,0.5)' }}>Has vivido la Alegoría de la Cueva de Platón desde adentro y liberado a todos los prisioneros.</p>
            </div>
            <div className="rounded-2xl px-5 py-4 w-full" style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(234,179,8,0.2)' }}>
              <p className="text-sm font-black mb-3" style={{ color:'rgba(255,255,255,0.5)' }}>RECOMPENSAS OBTENIDAS</p>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3 rounded-xl px-3 py-2" style={{ background:'rgba(234,179,8,0.08)' }}>
                  <span className="text-2xl">🏛️</span>
                  <div className="text-left"><p className="text-sm font-black" style={{ color:'#fcd34d' }}>Filósofo Iluminado</p><p className="text-[10px]" style={{ color:'rgba(255,255,255,0.35)' }}>Logro único — disponible en tu perfil</p></div>
                </div>
                <div className="flex items-center gap-3 rounded-xl px-3 py-2" style={{ background:'rgba(255,255,255,0.04)' }}>
                  <span className="text-2xl">{CAVE_SOUVENIR_ITEM.icon}</span>
                  <div className="text-left"><p className="text-sm font-black" style={{ color:'rgba(255,255,255,0.8)' }}>{CAVE_SOUVENIR_ITEM.name}</p><p className="text-[10px]" style={{ color:'rgba(255,255,255,0.35)' }}>{CAVE_SOUVENIR_ITEM.description}</p></div>
                </div>
              </div>
            </div>
            <button type="button" onClick={() => navigate(-1)} className="rounded-2xl px-10 py-4 text-lg font-black transition-all hover:scale-105" style={{ background:'linear-gradient(135deg,#eab308,#f97316)', color:'#0a0600' }}>📚 Volver al curso</button>
            <button type="button" onClick={() => navigate('/vr')} className="text-xs transition" style={{ color:'rgba(255,255,255,0.25)' }}>🌍 Ir al Campus VR</button>
          </div>
        </div>
      )}
    </div>
  )
}
