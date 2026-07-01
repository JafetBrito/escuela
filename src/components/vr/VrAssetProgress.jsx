import { useProgress } from '@react-three/drei'
import { useEffect, useState } from 'react'

// Shows a slim progress bar at the bottom while Three.js loads GLB models.
// Mounted inside VRPage (outside Canvas) once vrReady=true — useProgress from
// drei reads the same Zustand store that useLoader/useGLTF populate, so it
// works without being inside the Canvas.
// Fades out automatically when all assets finish loading.
export default function VrAssetProgress() {
  const { progress, active } = useProgress()
  const [visible, setVisible] = useState(true)
  const [fading, setFading] = useState(false)

  useEffect(() => {
    if (!active && progress >= 100) {
      setFading(true)
      const t = setTimeout(() => setVisible(false), 600)
      return () => clearTimeout(t)
    }
  }, [active, progress])

  if (!visible) return null

  return (
    <div
      className="pointer-events-none absolute inset-x-0 bottom-0 z-[8000] flex flex-col items-center pb-6"
      style={{ opacity: fading ? 0 : 1, transition: 'opacity 0.6s ease' }}
    >
      <p className="mb-1.5 text-[10px] font-semibold text-white/40">
        Cargando modelos… {Math.round(progress)}%
      </p>
      <div className="h-0.5 w-48 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{
            width: `${progress}%`,
            background: 'linear-gradient(90deg, #7c3aed, #a855f7)',
          }}
        />
      </div>
    </div>
  )
}
