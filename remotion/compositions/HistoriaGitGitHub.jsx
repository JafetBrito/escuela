import { LessonComposition, totalFrames, Slide, Box, Body, TEXT } from '../shared/Lesson.jsx'

// Video "La Historia de Git y GitHub" (course-git-github, módulo id 1).
// Duraciones medidas con scripts/measure_wav_frames.mjs a partir de los
// .wav reales generados por scripts/gen-tts-git.ps1 (30fps + ~15 de colchón).
const SLIDES = [
  {
    id: 'githist1',
    audioFile: 'githist1.wav',
    durationFrames: 232,
    render: () => (
      <Slide eyebrow="🐙 Git y GitHub" title="La Historia de Git y GitHub">
        <Body>Todo empezó con un enojo, en el año 2005.</Body>
      </Slide>
    ),
  },
  {
    id: 'githist2',
    audioFile: 'githist2.wav',
    durationFrames: 580,
    render: () => (
      <Slide eyebrow="2005" title="😤 El problema de Linus Torvalds">
        <Box kind="bad">
          BitKeeper (la herramienta que usaba el kernel de Linux) le retiró el acceso gratuito a la comunidad.
        </Box>
      </Slide>
    ),
  },
  {
    id: 'githist3',
    audioFile: 'githist3.wav',
    durationFrames: 727,
    render: () => (
      <Slide eyebrow="10 días después" title="⚡ Nace Git">
        <Body>Linus escribió su propia herramienta desde cero — en apenas diez días.</Body>
        <div style={{ marginTop: 20 }}>
          <Box kind="example">"Git": argot británico. Linus bromeaba que nombraba sus proyectos según él mismo.</Box>
        </div>
      </Slide>
    ),
  },
  {
    id: 'githist4',
    audioFile: 'githist4.wav',
    durationFrames: 524,
    render: () => (
      <Slide eyebrow="Diseño" title="🎯 Tres objetivos claros">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Box kind="tip">⚡ Velocidad extrema</Box>
          <Box kind="tip">🔒 Integridad de los datos</Box>
          <Box kind="tip">🌐 Desarrollo distribuido real</Box>
        </div>
      </Slide>
    ),
  },
  {
    id: 'githist5',
    audioFile: 'githist5.wav',
    durationFrames: 628,
    render: () => (
      <Slide eyebrow="2008" title="🐙 Nace GitHub">
        <Body>Chris Wanstrath, PJ Hyett y Tom Preston-Werner fundan un sitio para alojar repositorios y colaborar en código abierto.</Body>
      </Slide>
    ),
  },
  {
    id: 'githist6',
    audioFile: 'githist6.wav',
    durationFrames: 557,
    render: () => (
      <Slide eyebrow="2018" title="💰 Microsoft compra GitHub">
        <div
          style={{
            fontFamily: 'monospace',
            fontSize: 40,
            color: TEXT,
            backgroundColor: '#1e293b',
            border: '2px solid #334155',
            borderRadius: 14,
            padding: 24,
            maxWidth: 1400,
          }}
        >
          $7,500,000,000 USD
        </div>
      </Slide>
    ),
  },
  {
    id: 'githist7',
    audioFile: 'githist7.wav',
    durationFrames: 647,
    render: () => (
      <Slide eyebrow="Hoy" title="El lenguaje común de todos los programadores">
        <Body>Lo que empezó como la solución de un fin de semana enojado, hoy corre detrás de casi todo el software del mundo.</Body>
      </Slide>
    ),
  },
]

export function HistoriaGitGitHub() {
  return <LessonComposition slides={SLIDES} />
}

export const HISTORIA_GIT_TOTAL_FRAMES = totalFrames(SLIDES)
