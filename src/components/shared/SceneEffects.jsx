import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'

// Shared post-processing pass for all 3D Canvases.
// Keep bloomIntensity low (0.2–0.35) — it's cumulative per frame.
export default function SceneEffects({
  bloomIntensity = 0.3,
  vignetteDarkness = 0.42,
  multisampling = 0,
}) {
  return (
    <EffectComposer multisampling={multisampling}>
      <Bloom
        luminanceThreshold={0.82}
        luminanceSmoothing={0.9}
        intensity={bloomIntensity}
        blendFunction={BlendFunction.ADD}
      />
      <Vignette
        offset={0.45}
        darkness={vignetteDarkness}
        blendFunction={BlendFunction.NORMAL}
      />
    </EffectComposer>
  )
}
