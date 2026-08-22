import { LessonComposition, totalFrames, Slide, Box, Body } from '../shared/Lesson.jsx'

// Video de tema: "Ingeniería social" (course-ciberseguridad-basica, módulo 6).
const SLIDES = [
  { id: 'cyb6_1', audioFile: 'cyb6_1.wav', durationFrames: 193, render: () => (
    <Slide eyebrow="🛡️ Ciberseguridad para Todos" title="🎭 Ingeniería social">
      <Body>Manipular a una persona, no a una computadora.</Body>
    </Slide>
  )},
  { id: 'cyb6_2', audioFile: 'cyb6_2.wav', durationFrames: 294, render: () => (
    <Slide eyebrow="Mismo engaño, canal distinto" title="📞 Vishing · 📱 Smishing">
      <Body>La llamada falsa, y el mensaje de texto falso.</Body>
    </Slide>
  )},
  { id: 'cyb6_3', audioFile: 'cyb6_3.wav', durationFrames: 244, render: () => (
    <Slide eyebrow="Las 3 palancas" title="⏰ Urgencia · 👮 Autoridad · 😨 Miedo">
      <Box kind="warn">Casi todos estos ataques las usan juntas.</Box>
    </Slide>
  )},
  { id: 'cyb6_4', audioFile: 'cyb6_4.wav', durationFrames: 260, render: () => (
    <Slide eyebrow="La defensa" title="Detente, y verifica por otro canal">
      <Body>Antes de actuar.</Body>
    </Slide>
  )},
]

export function CyberTema6() {
  return <LessonComposition slides={SLIDES} />
}

export const CYBER_TEMA6_TOTAL_FRAMES = totalFrames(SLIDES)
