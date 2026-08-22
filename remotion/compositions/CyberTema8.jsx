import { LessonComposition, totalFrames, Slide, Box, Body } from '../shared/Lesson.jsx'

// Video de tema: "Antivirus y firewall" (course-ciberseguridad-basica, módulo 8).
const SLIDES = [
  { id: 'cyb8_1', audioFile: 'cyb8_1.wav', durationFrames: 187, render: () => (
    <Slide eyebrow="🛡️ Ciberseguridad para Todos" title="🧰 Tu antivirus, y cómo reforzarlo">
      <Body>Gratis.</Body>
    </Slide>
  )},
  { id: 'cyb8_2', audioFile: 'cyb8_2.wav', durationFrames: 258, render: () => (
    <Slide eyebrow="Ya lo tienes" title="🪟 Microsoft Defender">
      <Box kind="tip">Integrado y activo en Windows — un antivirus real, sin costo.</Box>
    </Slide>
  )},
  { id: 'cyb8_3', audioFile: 'cyb8_3.wav', durationFrames: 201, render: () => (
    <Slide eyebrow="Refuerzo gratuito" title="🔎 Malwarebytes">
      <Body>Un escaneo completo cada mes.</Body>
    </Slide>
  )},
  { id: 'cyb8_4', audioFile: 'cyb8_4.wav', durationFrames: 261, render: () => (
    <Slide eyebrow="Advertencia" title="🚫 Nunca dos antivirus a la vez">
      <Box kind="warn">Se interfieren entre sí — te dejan menos protegido, no más.</Box>
    </Slide>
  )},
]

export function CyberTema8() {
  return <LessonComposition slides={SLIDES} />
}

export const CYBER_TEMA8_TOTAL_FRAMES = totalFrames(SLIDES)
