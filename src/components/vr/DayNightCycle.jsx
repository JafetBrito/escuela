import { useRef, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { Billboard, Stars, Clouds, Cloud } from '@react-three/drei'
import { useDayNightStore } from '../../stores/useDayNightStore'

// How far the sun/moon/stars/clouds sit from the camera — anchoring them to
// the camera (not world space) makes them read as "infinitely far away" no
// matter where the player walks, the same trick a real skybox uses.
const SKY_RADIUS = 300

// Draws a moon with cat ears + a simple cat face onto a canvas, once, and
// reuses it as a texture — same technique as the building signs in
// useCampusGround.js (makeSignTexture), just aimed at the night sky instead
// of a wall.
function useCatMoonTexture() {
  return useMemo(() => {
    const size = 256
    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext('2d')
    const cx = size / 2, cy = size / 2 + 8, r = size * 0.32

    ctx.fillStyle = '#f5f0e0'
    ;[-1, 1].forEach((side) => {
      ctx.beginPath()
      ctx.moveTo(cx + side * r * 0.55, cy - r * 0.65)
      ctx.lineTo(cx + side * r * 0.95, cy - r * 1.5)
      ctx.lineTo(cx + side * r * 0.25, cy - r * 0.85)
      ctx.closePath()
      ctx.fill()
    })

    ctx.beginPath()
    ctx.arc(cx, cy, r, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = 'rgba(200,195,170,0.5)'
    ;[[-0.3, -0.2, 0.12], [0.25, 0.05, 0.09], [-0.1, 0.32, 0.07]].forEach(([dx, dy, dr]) => {
      ctx.beginPath()
      ctx.arc(cx + dx * r, cy + dy * r, dr * r, 0, Math.PI * 2)
      ctx.fill()
    })

    ctx.fillStyle = '#222'
    ;[-1, 1].forEach((side) => {
      ctx.beginPath()
      ctx.ellipse(cx + side * r * 0.32, cy - r * 0.05, r * 0.07, r * 0.1, 0, 0, Math.PI * 2)
      ctx.fill()
    })
    ctx.beginPath()
    ctx.moveTo(cx, cy + r * 0.12)
    ctx.lineTo(cx - r * 0.06, cy + r * 0.2)
    ctx.lineTo(cx + r * 0.06, cy + r * 0.2)
    ctx.closePath()
    ctx.fill()
    ctx.strokeStyle = '#222'
    ctx.lineWidth = r * 0.04
    ctx.beginPath()
    ctx.moveTo(cx, cy + r * 0.3)
    ctx.quadraticCurveTo(cx - r * 0.18, cy + r * 0.4, cx - r * 0.32, cy + r * 0.28)
    ctx.moveTo(cx, cy + r * 0.3)
    ctx.quadraticCurveTo(cx + r * 0.18, cy + r * 0.4, cx + r * 0.32, cy + r * 0.28)
    ctx.stroke()
    ;[-1, 1].forEach((side) => {
      for (let i = -1; i <= 1; i++) {
        ctx.beginPath()
        ctx.moveTo(cx + side * r * 0.25, cy + r * 0.22 + i * r * 0.08)
        ctx.lineTo(cx + side * r * 0.75, cy + r * 0.15 + i * r * 0.12)
        ctx.stroke()
      }
    })

    const texture = new THREE.CanvasTexture(canvas)
    texture.colorSpace = THREE.SRGBColorSpace
    return texture
  }, [])
}

// Sky keyframes: [hour, bgHex, fogHex, ambientHex, ambientInt, sunInt, sunHex]
const KEYS = [
  [0,  '#040812', '#070e20', '#131a30', 0.12, 0.04, '#4455aa'],
  [5,  '#1a1035', '#221540', '#3a2a60', 0.22, 0.08, '#8855cc'],
  [6,  '#e87040', '#cc5a30', '#ffa060', 0.55, 0.45, '#ffcc88'],
  [8,  '#90c8e8', '#c0d4e8', '#ffecd8', 0.80, 0.85, '#fffae0'],
  [12, '#5ba3d4', '#b0c8df', '#ffecd8', 0.85, 1.10, '#ffdd88'],
  [17, '#e88040', '#d06030', '#ff9050', 0.62, 0.68, '#ff9955'],
  [19, '#1a1040', '#15103a', '#2a2060', 0.28, 0.22, '#8877cc'],
  [22, '#040812', '#070e20', '#131a30', 0.12, 0.04, '#4455aa'],
  [24, '#040812', '#070e20', '#131a30', 0.12, 0.04, '#4455aa'],
]

// 8 strategic streetlamp clusters — one per zone (inner ring + cardinal paths).
// The campus has 44 individual lamp posts; these 8 point lights cover them cheaply.
const LAMP_CLUSTERS = [
  [0, 5.65, -23.5], [23.5, 5.65, 0], [0, 5.65, 23.5], [-23.5, 5.65, 0],
  [0, 5.65, -44],   [44, 5.65, 0],  [-44, 5.65, 0],   [0, 5.65, 44],
]

const _c1 = new THREE.Color()
const _c2 = new THREE.Color()
const _scratch = new THREE.Color()

function lerpColor(hex1, hex2, t, out) {
  _c1.set(hex1); _c2.set(hex2)
  out.copy(_c1).lerp(_c2, t)
}

function keyAt(t) {
  for (let i = 0; i < KEYS.length - 1; i++) {
    if (t >= KEYS[i][0] && t < KEYS[i + 1][0]) {
      return [(t - KEYS[i][0]) / (KEYS[i + 1][0] - KEYS[i][0]), i]
    }
  }
  return [0, 0]
}

// How bright the streetlamps are at a given time of day (0 = off, 1 = full).
// Fade in between 17:00–19:00 (dusk) and fade out 06:00–08:00 (dawn).
function lampFade(t) {
  if (t >= 19 || t < 6) return 1
  if (t < 8) return 1 - (t - 6) / 2   // morning fade-out
  if (t >= 17) return (t - 17) / 2     // evening fade-in
  return 0
}

// This component lives inside the <Canvas>. It advances the time-of-day clock
// every frame and, when campusMode is true, drives all scene lighting directly
// (background, fog, ambient, sun, streetlamps) without triggering React re-renders.
export default function DayNightCycle({ campusMode }) {
  const ambRef  = useRef()
  const sunRef  = useRef()
  const sunSpriteRef  = useRef()
  const moonSpriteRef = useRef()
  const starsRef = useRef()
  const cloudsRef = useRef()
  const lampRefs = useRef(LAMP_CLUSTERS.map(() => null))
  const bgColor  = useRef(new THREE.Color())
  const { scene, camera } = useThree()
  const moonTexture = useCatMoonTexture()

  useFrame((_, delta) => {
    useDayNightStore.getState().tick(delta)
    if (!campusMode) return

    const t = useDayNightStore.getState().timeOfDay
    const [frac, ki] = keyAt(t)
    const k0 = KEYS[ki], k1 = KEYS[ki + 1]

    // Background color — direct mutation beats a React re-render per frame
    lerpColor(k0[1], k1[1], frac, bgColor.current)
    scene.background = bgColor.current

    // Fog color (near/far stays fixed; only tint changes)
    if (scene.fog) lerpColor(k0[2], k1[2], frac, scene.fog.color)

    // Ambient light
    if (ambRef.current) {
      lerpColor(k0[3], k1[3], frac, _scratch)
      ambRef.current.color.copy(_scratch)
      ambRef.current.intensity = k0[4] + (k1[4] - k0[4]) * frac
    }

    // Directional sun — orbits east→west over 24 hrs
    if (sunRef.current) {
      const angle = (t / 24) * Math.PI * 2 - Math.PI / 2
      sunRef.current.position.set(
        Math.cos(angle) * 60,
        Math.max(2, Math.sin(angle) * 50 + 8),
        -15,
      )
      lerpColor(k0[6], k1[6], frac, _scratch)
      sunRef.current.color.copy(_scratch)
      sunRef.current.intensity = k0[5] + (k1[5] - k0[5]) * frac
    }

    // Streetlamps
    const lf = lampFade(t) * 2.6
    lampRefs.current.forEach((r) => { if (r) r.intensity = lf })

    // Visible sun/moon/stars/clouds — anchored to the camera's XZ position
    // (not world space) so they read as infinitely far away no matter where
    // the player walks across a map this size. Same orbit angle as the
    // directional light above; the moon sits opposite the sun.
    const angle = (t / 24) * Math.PI * 2 - Math.PI / 2
    const sx = Math.cos(angle), sy = Math.sin(angle)
    if (sunSpriteRef.current) {
      sunSpriteRef.current.position.set(
        camera.position.x + sx * SKY_RADIUS,
        camera.position.y + sy * SKY_RADIUS,
        camera.position.z - SKY_RADIUS * 0.4,
      )
      sunSpriteRef.current.visible = sy > -0.15
    }
    if (moonSpriteRef.current) {
      moonSpriteRef.current.position.set(
        camera.position.x - sx * SKY_RADIUS,
        camera.position.y - sy * SKY_RADIUS,
        camera.position.z - SKY_RADIUS * 0.4,
      )
      moonSpriteRef.current.visible = sy < 0.15
    }
    if (starsRef.current) {
      starsRef.current.position.set(camera.position.x, camera.position.y, camera.position.z)
      starsRef.current.visible = sy < 0.1
    }
    if (cloudsRef.current) {
      cloudsRef.current.position.set(camera.position.x, 0, camera.position.z)
    }
  })

  if (!campusMode) return null

  return (
    <>
      <ambientLight ref={ambRef} />
      <directionalLight ref={sunRef} position={[30, 40, -15]} />
      {LAMP_CLUSTERS.map(([x, y, z], i) => (
        <pointLight
          key={i}
          ref={(el) => { lampRefs.current[i] = el }}
          position={[x, y, z]}
          color="#ffdd88"
          intensity={0}
          distance={22}
          decay={2}
        />
      ))}

      <group ref={sunSpriteRef}>
        <Billboard>
          <mesh>
            <circleGeometry args={[24, 24]} />
            <meshBasicMaterial color="#ffd97a" transparent opacity={0.25} depthWrite={false} />
          </mesh>
          <mesh>
            <circleGeometry args={[14, 24]} />
            <meshBasicMaterial color="#fff3c0" transparent opacity={0.95} depthWrite={false} />
          </mesh>
        </Billboard>
      </group>

      <group ref={moonSpriteRef}>
        <Billboard>
          <mesh>
            <planeGeometry args={[20, 20]} />
            <meshBasicMaterial map={moonTexture} transparent depthWrite={false} />
          </mesh>
        </Billboard>
      </group>

      <group ref={starsRef}>
        <Stars radius={250} depth={60} count={3000} factor={4} saturation={0} fade speed={0.5} />
      </group>

      <group ref={cloudsRef}>
        <Clouds material={THREE.MeshBasicMaterial} limit={20}>
          <Cloud seed={1} segments={20} bounds={[80, 6, 80]} volume={20} position={[40, 50, -30]} opacity={0.45} />
          <Cloud seed={2} segments={16} bounds={[70, 5, 70]} volume={16} position={[-60, 46, 20]} opacity={0.4} />
          <Cloud seed={3} segments={18} bounds={[60, 5, 60]} volume={14} position={[10, 54, 70]} opacity={0.35} />
        </Clouds>
      </group>
    </>
  )
}
