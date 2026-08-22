import { AbsoluteFill } from 'remotion'
import { FadeIn, BG, PRIMARY, TEXT, TEXT_MUTED } from './Lesson.jsx'

// Variante vertical (1080x1920) de Slide/Box/Body — mismos colores/API que
// Lesson.jsx (reexporta LessonComposition/totalFrames de ahí, no los
// duplica), solo con tipografía y anchos recalibrados para un canvas angosto
// y alto en vez de 1920x1080. Usado por cualquier video que se publique
// también como short/reel vertical (ver ApiBienvenida vs su par horizontal).
const BOX_STYLES_V = {
  example: { border: `2px solid ${PRIMARY}`, backgroundColor: `${PRIMARY}18` },
  bad: { border: '2px solid #ef4444', backgroundColor: '#ef444418' },
  tip: { border: '2px solid #38bdf8', backgroundColor: '#38bdf818' },
  warn: { border: '2px solid #eab308', backgroundColor: '#eab30818' },
}

export function SlideV({ eyebrow, title, children }) {
  return (
    <AbsoluteFill
      style={{
        backgroundColor: BG,
        fontFamily: 'Arial, sans-serif',
        padding: 64,
        justifyContent: 'center',
      }}
    >
      <FadeIn>
        <div style={{ color: PRIMARY, fontSize: 30, fontWeight: 700, marginBottom: 20 }}>{eyebrow}</div>
        <div style={{ color: TEXT, fontSize: 58, fontWeight: 800, marginBottom: 40, lineHeight: 1.15 }}>
          {title}
        </div>
      </FadeIn>
      <FadeIn delay={15}>{children}</FadeIn>
    </AbsoluteFill>
  )
}

export function BoxV({ kind = 'example', children }) {
  return (
    <div
      style={{
        ...BOX_STYLES_V[kind],
        borderRadius: 18,
        padding: 32,
        fontSize: 34,
        color: TEXT,
        lineHeight: 1.4,
      }}
    >
      {children}
    </div>
  )
}

export function BodyV({ children }) {
  return <p style={{ fontSize: 36, color: TEXT_MUTED, lineHeight: 1.5 }}>{children}</p>
}
