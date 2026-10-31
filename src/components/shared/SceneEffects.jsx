import { EffectComposer, Bloom, Vignette, ToneMapping, HueSaturation, BrightnessContrast } from '@react-three/postprocessing'
import { BlendFunction, ToneMappingMode } from 'postprocessing'

// Shared post-processing pass for all 3D Canvases.
// Keep bloomIntensity low (0.2–0.35) — it's cumulative per frame.
//
// Se salta por completo en pantallas angostas: el post-procesado (Bloom +
// Vignette compositando la pantalla entera, cada frame) es de lo más caro
// que se le puede pedir a la GPU de un celular gama media/baja — no todos
// los que entren al mundo VR van a tener un dispositivo potente. El costo
// visual (menos brillo/viñeta) es mucho más aceptable que un mundo que
// tartamudea o se calienta el teléfono.
export default function SceneEffects({
  bloomIntensity = 0.3,
  vignetteDarkness = 0.42,
  multisampling = 0,
  cinematic = false, // Plaza griega: bloom suave + ACES + saturación/contraste (mismo look que la demo look-dev)
}) {
  if (typeof window !== 'undefined' && window.innerWidth < 768) return null

  if (cinematic) {
    return (
      <EffectComposer multisampling={multisampling}>
        <Bloom mipmapBlur luminanceThreshold={0.85} luminanceSmoothing={0.9} intensity={bloomIntensity} blendFunction={BlendFunction.ADD} />
        <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
        <HueSaturation saturation={0.14} />
        <BrightnessContrast contrast={0.07} />
        <Vignette offset={0.4} darkness={vignetteDarkness} />
      </EffectComposer>
    )
  }

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
