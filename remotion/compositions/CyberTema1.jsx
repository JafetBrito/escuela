import { LessonComposition, totalFrames, Slide, Box, Body } from '../shared/Lesson.jsx'

// Video de tema: "¿Por qué importa la ciberseguridad?" (course-ciberseguridad-basica, módulo 1).
const SLIDES = [
  { id: 'cyb1_1', audioFile: 'cyb1_1.wav', durationFrames: 356, render: () => (
    <Slide eyebrow="🛡️ Ciberseguridad para Todos" title="¿Por qué importa la ciberseguridad?">
      <Body>La mayoría de los ataques no buscan a alguien importante — te buscan a ti, junto con un millón de personas más.</Body>
    </Slide>
  )},
  { id: 'cyb1_2', audioFile: 'cyb1_2.wav', durationFrames: 290, render: () => (
    <Slide eyebrow="La matemática del atacante" title="📧 Un millón de correos, casi gratis">
      <Box kind="bad">Si solo 1 de cada 1000 personas cae, ya le valió la pena.</Box>
    </Slide>
  )},
  { id: 'cyb1_3', audioFile: 'cyb1_3.wav', durationFrames: 241, render: () => (
    <Slide eyebrow="El mito de 'a mí no me va a pasar'" title="No hace falta ser un objetivo especial">
      <Body>Basta con estar descuidado en el momento equivocado.</Body>
    </Slide>
  )},
  { id: 'cyb1_4', audioFile: 'cyb1_4.wav', durationFrames: 284, render: () => (
    <Slide eyebrow="Lo que viene" title="👩 Emma 🧑 Raúl — técnicas y herramientas reales">
      <Body>Todo gratuito, todo aplicable hoy mismo.</Body>
    </Slide>
  )},
]

export function CyberTema1() {
  return <LessonComposition slides={SLIDES} />
}

export const CYBER_TEMA1_TOTAL_FRAMES = totalFrames(SLIDES)
