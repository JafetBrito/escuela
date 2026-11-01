import { useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

// Hojas de otoño cayendo alrededor del jugador (un solo Points, todo el movimiento en el shader).
const VERT = `
uniform float uTime, uPx; uniform vec3 uPlayer; attribute float aSeed; varying vec3 vCol;
float wrap(float v, float L){ return mod(v + L * 0.5, L) - L * 0.5; }
void main(){
  float s = aSeed;
  vec3 base = vec3(fract(s * 91.7) * 60.0 - 30.0, fract(s * 37.1) * 5.0, fract(s * 53.3) * 60.0 - 30.0);
  float x = uPlayer.x + wrap(base.x - uPlayer.x + sin(uTime * 0.9 + s * 40.0) * 0.5, 60.0);
  float z = uPlayer.z + wrap(base.z - uPlayer.z + cos(uTime * 0.7 + s * 23.0) * 0.5, 60.0);
  float y = 0.1 + mod(base.y - uTime * (0.3 + fract(s * 7.0) * 0.25), 5.0);
  vec4 mv = modelViewMatrix * vec4(x, y, z, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = clamp(16.0 * uPx / max(0.2, -mv.z), 2.0, 14.0 * uPx);
  float k = fract(s * 13.0);
  vCol = k < 0.4 ? vec3(0.9, 0.45, 0.12) : k < 0.75 ? vec3(0.78, 0.2, 0.12) : vec3(0.92, 0.7, 0.2);
}`
const FRAG = 'varying vec3 vCol; void main(){ vec2 p = gl_PointCoord - 0.5; if (abs(p.x) + abs(p.y) > 0.5) discard; gl_FragColor = vec4(vCol, 1.0); }'

export default function Leaves({ followRef, count = 170 }) {
  const { gl } = useThree()
  const mat = useRef()
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry(), seeds = new Float32Array(count)
    for (let i = 0; i < count; i++) seeds[i] = (i * 0.6180339887 + 0.137) % 1 // determinista (sección áurea): reparte las hojas parejo
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(count * 3), 3))
    g.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1))
    return g
  }, [count])
  const uniforms = useMemo(() => ({ uTime: { value: 0 }, uPx: { value: 1 }, uPlayer: { value: new THREE.Vector3() } }), [])
  useFrame((s) => {
    const u = mat.current?.uniforms
    if (!u) return
    u.uTime.value = s.clock.elapsedTime
    u.uPx.value = gl.getPixelRatio()
    const f = followRef.current
    if (f) u.uPlayer.value.copy(f)
  })
  return <points geometry={geo} frustumCulled={false}><shaderMaterial ref={mat} uniforms={uniforms} vertexShader={VERT} fragmentShader={FRAG} /></points>
}
