import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, interpolate } from 'remotion'

// Mismos colores de marca que IntroCrearCuenta.jsx (src/index.css) —
// compartido para que cualquier video de lección se vea consistente.
export const BG = '#0f172a'
export const PRIMARY = '#f97316'
export const TEXT = '#f1f5f9'
export const TEXT_MUTED = '#94a3b8'
export const CARD_BG = '#1e293b'
export const BORDER = '#334155'

export function FadeIn({ children, delay = 0, durationInFrames = 20 }) {
  const frame = useCurrentFrame()
  const opacity = interpolate(frame - delay, [0, durationInFrames], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })
  const translateY = interpolate(frame - delay, [0, durationInFrames], [16, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })
  return <div style={{ opacity, transform: `translateY(${translateY}px)` }}>{children}</div>
}

// Una diapositiva: ceja (contexto del curso), título, y el contenido libre
// que le pases (texto, Box, listas...).
export function Slide({ eyebrow, title, children }) {
  return (
    <AbsoluteFill
      style={{
        backgroundColor: BG,
        fontFamily: 'Arial, sans-serif',
        padding: 90,
        justifyContent: 'center',
      }}
    >
      <FadeIn>
        <div style={{ color: PRIMARY, fontSize: 26, fontWeight: 700, marginBottom: 16 }}>{eyebrow}</div>
        <div style={{ color: TEXT, fontSize: 56, fontWeight: 800, marginBottom: 36, maxWidth: 1500, lineHeight: 1.15 }}>
          {title}
        </div>
      </FadeIn>
      <FadeIn delay={15}>{children}</FadeIn>
    </AbsoluteFill>
  )
}

// Mismo lenguaje visual que las cajas .example/.bad/.tip del contenido real
// de los cursos (ver courseEtica.js y compañía) — para que el video se
// sienta parte del mismo curso, no un estilo aparte.
const BOX_STYLES = {
  example: { border: `2px solid ${PRIMARY}`, backgroundColor: `${PRIMARY}18` },
  bad: { border: '2px solid #ef4444', backgroundColor: '#ef444418' },
  tip: { border: '2px solid #38bdf8', backgroundColor: '#38bdf818' },
  warn: { border: '2px solid #eab308', backgroundColor: '#eab30818' },
}

export function Box({ kind = 'example', children }) {
  return (
    <div
      style={{
        ...BOX_STYLES[kind],
        borderRadius: 16,
        padding: 28,
        fontSize: 30,
        color: TEXT,
        maxWidth: 1500,
        lineHeight: 1.4,
      }}
    >
      {children}
    </div>
  )
}

export function Body({ children }) {
  return <p style={{ fontSize: 32, color: TEXT_MUTED, maxWidth: 1500, lineHeight: 1.5 }}>{children}</p>
}

// Arma la secuencia completa (offsets acumulados + audio) a partir de una
// lista de slides con su propio archivo de audio y duración medida.
// slides: [{ id, audioFile, durationFrames, render: () => JSX }]
export function LessonComposition({ slides }) {
  let cursor = 0
  const positioned = slides.map((s) => {
    const from = cursor
    cursor += s.durationFrames
    return { ...s, from }
  })
  return (
    <>
      {positioned.map((s) => (
        <Sequence key={s.id} from={s.from} durationInFrames={s.durationFrames}>
          <Audio src={staticFile(`audio/${s.audioFile}`)} />
          {s.render()}
        </Sequence>
      ))}
    </>
  )
}

export function totalFrames(slides) {
  return slides.reduce((sum, s) => sum + s.durationFrames, 0)
}
