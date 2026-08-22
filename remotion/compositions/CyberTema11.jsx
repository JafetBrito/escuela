import { LessonComposition, totalFrames, Slide, Box, Body } from '../shared/Lesson.jsx'

// Video de tema: "Copias de seguridad" (course-ciberseguridad-basica, módulo 11).
const SLIDES = [
  { id: 'cyb11_1', audioFile: 'cyb11_1.wav', durationFrames: 161, render: () => (
    <Slide eyebrow="🛡️ Ciberseguridad para Todos" title="📦 Copias de seguridad: la regla 3-2-1" />
  )},
  { id: 'cyb11_2', audioFile: 'cyb11_2.wav', durationFrames: 280, render: () => (
    <Slide eyebrow="La regla" title="3 copias · 2 almacenamientos · 1 fuera de casa">
      <Box kind="tip">Original + 2 copias, en 2 lugares distintos, una fuera de tu casa.</Box>
    </Slide>
  )},
  { id: 'cyb11_3', audioFile: 'cyb11_3.wav', durationFrames: 249, render: () => (
    <Slide eyebrow="Herramientas gratuitas" title="☁️ Google Drive · OneDrive">
      <Body>Varios gigas gratis para tus fotos y documentos.</Body>
    </Slide>
  )},
  { id: 'cyb11_4', audioFile: 'cyb11_4.wav', durationFrames: 290, render: () => (
    <Slide eyebrow="El resultado" title="Si te cifran los archivos, simplemente restauras">
      <Box kind="tip">Sin pagarle nada a nadie.</Box>
    </Slide>
  )},
]

export function CyberTema11() {
  return <LessonComposition slides={SLIDES} />
}

export const CYBER_TEMA11_TOTAL_FRAMES = totalFrames(SLIDES)
