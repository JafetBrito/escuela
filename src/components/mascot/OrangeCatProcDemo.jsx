import { useEffect, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { createOrangeCatModel } from './orangeCatProc'

// Banco de pruebas del gato procedural (/dev/gato-proc, solo desarrollo). ?view=cara = encuadre como la foto de referencia.
function Cat() {
  const cat = useMemo(() => createOrangeCatModel(), [])
  useFrame((s) => cat.update(s.clock.elapsedTime, 1))
  useEffect(() => () => cat.group.traverse((o) => o.geometry?.dispose()), [cat])
  return <primitive object={cat.group} />
}

export default function OrangeCatProcDemo() {
  const face = new URLSearchParams(location.search).get('view') === 'cara'
  return (
    <div className="fixed inset-0 bg-[#2a1d12]">
      <Canvas camera={{ position: face ? [0, 0.15, 6.2] : [3.6, 0.3, 8.5], fov: face ? 30 : 38 }} shadows>
        <color attach="background" args={['#3a2a18']} />
        <ambientLight intensity={0.9} color="#ffe9cc" />
        <directionalLight position={[2.5, 4, 5]} intensity={2.2} color="#ffd9a0" castShadow />
        <directionalLight position={[-3, 1, -2]} intensity={0.5} color="#9db6ff" />
        <pointLight position={[-2.2, 1.2, 1.6]} intensity={6} color="#ffb347" />
        <Cat />
        <OrbitControls target={[0, face ? 0 : -1.4, 0]} />
      </Canvas>
      <div className="absolute left-3 top-3 rounded bg-black/60 px-3 py-1 text-xs text-white">Oliver procedural · img2threejs · <a className="underline" href="?view=cara">cara</a> · <a className="underline" href="?">completo</a></div>
    </div>
  )
}
