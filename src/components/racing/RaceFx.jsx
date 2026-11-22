import { useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { frame } from './track'

// Efectos visuales de Oliver Racing: cielo con degradado, sol y nubes; partículas (líneas de velocidad, chispas de derrape / choque / turbo y polvo
// ambiental) y aves o drones que vuelan alrededor. Todo con muy pocas mallas (instanciadas) para no costar rendimiento.
const COL = new THREE.Color(), COL2 = new THREE.Color(), HSL = { h: 0, s: 0, l: 0 }
const P = { x: 0, y: 0, z: 0, yaw: 0 }, Q = { x: 0, y: 0, z: 0, yaw: 0 }
const rnd = (a, b) => a + Math.random() * (b - a)

// ── Cielo: degradado horizonte → cenit (de la paleta de la misión), disco solar y nubes lentas; sigue a la cámara ──
const SKY_VERT = 'varying vec3 vDir; void main(){ vDir = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }'
const SKY_FRAG = `
  varying vec3 vDir; uniform vec3 uTop; uniform vec3 uHor; uniform vec3 uSun; uniform float uSunPow;
  void main(){
    float h = clamp(vDir.y, -0.2, 1.0);
    vec3 col = mix(uHor, uTop, pow(max(h, 0.0), 0.55));
    col = mix(col, uHor * 0.85, smoothstep(0.0, -0.2, vDir.y) );
    float d = max(dot(normalize(vDir), normalize(vec3(0.35, 0.22, -0.9))), 0.0);
    col += uSun * (pow(d, 220.0) * 1.4 + pow(d, 12.0) * 0.28) * uSunPow;
    gl_FragColor = vec4(col, 1.0);
  }`
const SKY_U = { uTop: { value: new THREE.Color('#4a78b8') }, uHor: { value: new THREE.Color('#ffe6b8') }, uSun: { value: new THREE.Color('#fff1c4') }, uSunPow: { value: 1 } }
const CLOUD_GEO = new THREE.IcosahedronGeometry(1, 0)
const CLOUD_MAT = new THREE.MeshBasicMaterial({ color: '#ffffff', fog: false, transparent: true, opacity: 0.85, depthWrite: false })
const CLOUD_DATA = Array.from({ length: 22 }, (_, i) => ({ a: (i / 22) * Math.PI * 2 + (i % 3) * 0.2, r: 430 + (i % 5) * 28, y: 120 + (i % 4) * 34, s: 26 + (i % 6) * 9 }))
export function SkyDome({ game, world }) {
  const mesh = useRef(), clouds = useRef()
  const uni = SKY_U, cloudGeo = CLOUD_GEO, cloudMat = CLOUD_MAT, cloudData = CLOUD_DATA
  useFrame((state, dt) => {
    const pal = game.detour ? null : world.missions[game.mission].pal, k = 1 - Math.exp(-1.4 * Math.min(dt, 0.05))
    mesh.current.position.copy(state.camera.position)
    if (pal) {
      COL.set(pal.sky); const lum = COL.getHSL(HSL).l
      uni.uHor.value.lerp(COL2.set(pal.fog), k); uni.uTop.value.lerp(COL.offsetHSL(0.0, 0.05, lum > 0.5 ? -0.16 : 0.05), k)
      uni.uSunPow.value += (Math.max(0.1, Math.min(1, lum * 1.6)) - uni.uSunPow.value) * k
      cloudMat.color.lerp(COL2.set(pal.fog).lerp(COL.set('#ffffff'), 0.55), k); cloudMat.opacity += ((lum > 0.35 ? 0.85 : 0.06) - cloudMat.opacity) * k
    }
    if (clouds.current) { clouds.current.position.set(state.camera.position.x, 0, state.camera.position.z); clouds.current.rotation.y += dt * 0.004 }
  })
  return (
    <>
      <mesh ref={mesh} renderOrder={-10} frustumCulled={false}>
        <sphereGeometry args={[900, 24, 14]} />
        <shaderMaterial uniforms={uni} vertexShader={SKY_VERT} fragmentShader={SKY_FRAG} side={THREE.BackSide} depthWrite={false} fog={false} />
      </mesh>
      <group ref={clouds}>
        {cloudData.map((c, i) => <mesh key={i} geometry={cloudGeo} material={cloudMat} position={[Math.sin(c.a) * c.r, c.y, Math.cos(c.a) * c.r]} scale={[c.s * 1.8, c.s * 0.32, c.s]} rotation={[0, c.a, 0]} frustumCulled={false} />)}
      </group>
    </>
  )
}

// ── Partículas: 34 líneas de velocidad + 70 chispas + 56 motas de polvo, todo en UNA malla instanciada ──
const N_LINE = 34, N_SPARK = 150, N_MOTE = 56, N = N_LINE + N_SPARK + N_MOTE
const MOTE_COL = { hospital: '#e0f2fe', garden: '#fde68a', city: '#e5e7eb', servers: '#38bdf8', matrix: '#4ade80', neon: '#e879f9', agora: '#fde68a', cave: '#fdba74', sun: '#fff7c2' }
const DUMMY = new THREE.Object3D()
const FXS = { lines: [], sparks: [], motes: [], spawn: 0, t: 0 }
function resetFx() {
  FXS.lines = Array.from({ length: N_LINE }, () => ({ s0: -999, r: 0, a: 0 }))
  FXS.sparks = Array.from({ length: N_SPARK }, () => ({ life: 0, x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0, c: '#fff', sz: 0.2 }))
  FXS.motes = Array.from({ length: N_MOTE }, (_, i) => ({ x: 0, y: -999, z: 0, ph: i * 1.7 })); FXS.spawn = 0; FXS.t = 0
}
// Una chispa suelta (polvo del derrumbe, anillo de energía del turbo…) desde cualquier componente de la escena
// eslint-disable-next-line react-refresh/only-export-components
export function emit(x, y, z, vx, vy, vz, c, sz = 0.3, life = 0.8) {
  const sp = FXS.sparks.find((s) => s.life <= 0); if (!sp) return
  sp.life = life; sp.x = x; sp.y = y; sp.z = z; sp.vx = vx; sp.vy = vy; sp.vz = vz; sp.c = c; sp.sz = sz
}
export function Particles({ game, world }) {
  const ref = useRef()
  const dummy = DUMMY, st = FXS
  useEffect(() => { resetFx(); for (let i = 0; i < N; i++) { dummy.position.set(0, -9999, 0); dummy.scale.setScalar(0); dummy.updateMatrix(); ref.current.setMatrixAt(i, dummy.matrix); ref.current.setColorAt(i, COL.set('#ffffff')) } ref.current.instanceMatrix.needsUpdate = true; ref.current.instanceColor.needsUpdate = true }, [dummy])
  useFrame((_, dt0) => {
    const dt = Math.min(dt0, 0.05), m = ref.current, d = game.detour
    st.t += dt
    frame(game.s, game.u, game.alt, P); frame(game.s - 3, game.u, game.alt, Q)
    const bx = Q.x - P.x, bz = Q.z - P.z, bl = Math.hypot(bx, bz) || 1, deco = world.missions[game.mission].deco
    // líneas de velocidad (solo a partir de ~100 km/h y fuera de la ruta de repaso)
    const lineK = d ? 0 : Math.max(0, Math.min(1, (game.v - 28) / 30))
    for (let i = 0; i < N_LINE; i++) {
      const l = st.lines[i]
      if (l.s0 < game.s - 12) { l.s0 = game.s + rnd(10, 70); l.r = rnd(4.5, 15); l.a = rnd(0, Math.PI * 2) }
      frame(l.s0, game.u * 0.8 + Math.cos(l.a) * l.r, 1.2 + game.alt + Math.sin(l.a) * l.r * 0.55, P)
      dummy.position.set(P.x, P.y, P.z); dummy.rotation.set(0, P.yaw, 0); dummy.scale.set(0.05, 0.05, Math.max(0.3, game.v * 0.06) * lineK); dummy.updateMatrix(); m.setMatrixAt(i, dummy.matrix)
    }
    // chispas: derrape (naranja), turbo (cian) y choque (rojo)
    frame(game.s, game.u, game.alt, P)
    if (!d) {
      const rate = game.drifting ? 90 : game.boost > 0 ? 70 : game.crash > 0 ? 120 : 0
      st.spawn += rate * dt
      while (st.spawn >= 1) {
        st.spawn -= 1
        const sp = st.sparks.find((x) => x.life <= 0); if (!sp) break
        sp.life = rnd(0.35, 0.8); sp.x = P.x + rnd(-0.7, 0.7); sp.y = P.y + 0.3 + rnd(0, 0.5); sp.z = P.z + rnd(-0.5, 0.5)
        const back = Math.min(18, game.v * 0.35)
        sp.vx = (bx / bl) * back + rnd(-4, 4); sp.vz = (bz / bl) * back + rnd(-4, 4); sp.vy = rnd(2, 7)
        sp.c = game.crash > 0 ? '#ff5a3c' : game.drifting ? (Math.random() < 0.5 ? '#ffb347' : '#ffe08a') : '#7df9ff'; sp.sz = rnd(0.12, 0.3)
      }
    }
    for (let i = 0; i < N_SPARK; i++) {
      const sp = st.sparks[i], idx = N_LINE + i
      if (sp.life > 0) { sp.life -= dt; sp.vy -= 14 * dt; sp.x += sp.vx * dt; sp.y += sp.vy * dt; sp.z += sp.vz * dt; dummy.position.set(sp.x, sp.y, sp.z); dummy.rotation.set(0, 0, 0); dummy.scale.setScalar(sp.sz * Math.min(1, sp.life * 3)); m.setColorAt(idx, COL.set(sp.c)) }
      else dummy.scale.setScalar(0)
      dummy.updateMatrix(); m.setMatrixAt(idx, dummy.matrix)
    }
    // motas de polvo o luz flotando alrededor
    COL2.set(MOTE_COL[deco] || '#ffffff')
    for (let i = 0; i < N_MOTE; i++) {
      const o = st.motes[i], idx = N_LINE + N_SPARK + i
      if (Math.hypot(o.x - P.x, o.z - P.z) > 46 || o.y < -500) { o.x = P.x + rnd(-40, 40); o.z = P.z + rnd(-40, 40) - (game.v > 5 ? 20 : 0); o.y = P.y + rnd(0.5, 16) }
      o.y += Math.sin(st.t + o.ph) * 0.01; o.x += Math.cos(st.t * 0.5 + o.ph) * 0.01
      dummy.position.set(o.x, o.y, o.z); dummy.rotation.set(0, 0, 0); dummy.scale.setScalar(d ? 0 : 0.16 + 0.1 * Math.sin(st.t * 2 + o.ph)); dummy.updateMatrix(); m.setMatrixAt(idx, dummy.matrix)
      m.setColorAt(idx, COL2)
    }
    m.instanceMatrix.needsUpdate = true; m.instanceColor.needsUpdate = true
  })
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, N]} frustumCulled={false}>
      <boxGeometry args={[1, 1, 1]} /><meshBasicMaterial toneMapped={false} transparent opacity={0.85} depthWrite={false} />
    </instancedMesh>
  )
}

// ── Aves, palomas, drones o murciélagos según el escenario: vuelan en círculos adelante de ti ──
const N_FLY = 12
const FLY_GEO = new THREE.ConeGeometry(0.5, 1.4, 3).rotateX(Math.PI / 2).scale(1.9, 0.22, 1)
const FLY = { garden: ['#ffffff', 1], sun: ['#fffbea', 1.2], agora: ['#f5f5f4', 1], city: ['#e5e7eb', 0.9], servers: ['#38bdf8', 0.7], matrix: ['#4ade80', 0.7], neon: ['#e879f9', 0.8], cave: ['#292524', 0.9] }
export function Flyers({ game, world }) {
  const ref = useRef()
  const dummy = DUMMY, geo = FLY_GEO
  useFrame((state) => {
    const t = state.clock.elapsedTime, deco = world.missions[game.mission].deco, f = FLY[deco], m = ref.current
    for (let i = 0; i < N_FLY; i++) {
      if (!f || game.detour) { dummy.scale.setScalar(0) } else {
        const s = game.s + 70 + 55 * Math.sin(t * 0.35 + i * 1.3), u = 26 * Math.sin(t * 0.23 + i * 2.1), y = 20 + (i % 4) * 5 + 4 * Math.sin(t * 0.8 + i)
        frame(s, u, y, P)
        dummy.position.set(P.x, P.y, P.z); dummy.rotation.set(0, P.yaw + Math.PI + 0.9 * Math.cos(t * 0.23 + i * 2.1), 0.5 * Math.sin(t * 7 + i * 3))
        dummy.scale.set(f[1], f[1] * (0.7 + 0.6 * Math.abs(Math.sin(t * 6 + i))), f[1])
        m.setColorAt(i, COL.set(f[0]))
      }
      dummy.updateMatrix(); m.setMatrixAt(i, dummy.matrix)
    }
    m.instanceMatrix.needsUpdate = true; if (m.instanceColor) m.instanceColor.needsUpdate = true
  })
  return <instancedMesh ref={ref} args={[geo, undefined, N_FLY]} frustumCulled={false}><meshBasicMaterial toneMapped={false} /></instancedMesh>
}
