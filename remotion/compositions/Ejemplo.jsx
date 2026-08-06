import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from 'remotion'

// Video de prueba: confirma que el pipeline completo (composición -> render
// -> mp4 en videos-output/) funciona. Sirve de plantilla para los próximos:
// copia este archivo, cambia el texto/colores/duración, y regístralo en
// Root.jsx con un id nuevo.
export function Ejemplo() {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  const scale = spring({ frame, fps, config: { damping: 12 } })
  const opacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: 'clamp' })

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#1a1625',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'sans-serif',
      }}
    >
      <div style={{ transform: `scale(${scale})`, opacity, textAlign: 'center' }}>
        <div style={{ fontSize: 100 }}>🐾</div>
        <h1 style={{ color: '#fb923c', fontSize: 80, margin: 0 }}>Oliver Academy</h1>
        <p style={{ color: 'white', fontSize: 36, opacity: 0.8 }}>Video de prueba de Remotion</p>
      </div>
    </AbsoluteFill>
  )
}
