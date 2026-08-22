import { LessonComposition, totalFrames, Slide, Box, Body } from '../shared/Lesson.jsx'

// Video de tema: "Actualizaciones de software" (course-ciberseguridad-basica, módulo 10).
const SLIDES = [
  { id: 'cyb10_1', audioFile: 'cyb10_1.wav', durationFrames: 180, render: () => (
    <Slide eyebrow="🛡️ Ciberseguridad para Todos" title="🔄 Actualizaciones de software">
      <Body>La defensa que ignoras sin darte cuenta.</Body>
    </Slide>
  )},
  { id: 'cyb10_2', audioFile: 'cyb10_2.wav', durationFrames: 268, render: () => (
    <Slide eyebrow="El efecto secundario" title="Corregir una falla la hace pública">
      <Box kind="warn">También le avisa a los atacantes exactamente dónde estaba.</Box>
    </Slide>
  )},
  { id: 'cyb10_3', audioFile: 'cyb10_3.wav', durationFrames: 174, render: () => (
    <Slide eyebrow="El riesgo de posponer" title="Sigues expuesto a un problema ya conocido" />
  )},
  { id: 'cyb10_4', audioFile: 'cyb10_4.wav', durationFrames: 317, render: () => (
    <Slide eyebrow="La defensa más simple" title="⚙️ Activa las actualizaciones automáticas">
      <Body>Sistema, navegador, y celular.</Body>
    </Slide>
  )},
]

export function CyberTema10() {
  return <LessonComposition slides={SLIDES} />
}

export const CYBER_TEMA10_TOTAL_FRAMES = totalFrames(SLIDES)
