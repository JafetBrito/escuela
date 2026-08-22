import { LessonComposition, totalFrames, Slide, Box, Body } from '../shared/Lesson.jsx'

// Video de tema: "Gestor de contraseñas" (course-ciberseguridad-basica, módulo 3).
const SLIDES = [
  { id: 'cyb3_1', audioFile: 'cyb3_1.wav', durationFrames: 316, render: () => (
    <Slide eyebrow="🛡️ Ciberseguridad para Todos" title="¿Cómo tener una contraseña distinta en cada cuenta?">
      <Body>Con un gestor de contraseñas.</Body>
    </Slide>
  )},
  { id: 'cyb3_2', audioFile: 'cyb3_2.wav', durationFrames: 263, render: () => (
    <Slide eyebrow="Herramienta real y gratuita" title="🔑 Bitwarden">
      <Box kind="tip">Gratis, de código abierto, en tu computadora, celular y navegador.</Box>
    </Slide>
  )},
  { id: 'cyb3_3', audioFile: 'cyb3_3.wav', durationFrames: 350, render: () => (
    <Slide eyebrow="Cómo funciona" title="Solo memorizas UNA contraseña maestra">
      <Body>Bitwarden genera y recuerda el resto — largas, aleatorias, imposibles de adivinar.</Body>
    </Slide>
  )},
  { id: 'cyb3_4', audioFile: 'cyb3_4.wav', durationFrames: 257, render: () => (
    <Slide eyebrow="Por dónde empezar" title="📧 Correo · 🏦 Banco · 📱 Redes sociales">
      <Body>El resto lo vas agregando poco a poco.</Body>
    </Slide>
  )},
]

export function CyberTema3() {
  return <LessonComposition slides={SLIDES} />
}

export const CYBER_TEMA3_TOTAL_FRAMES = totalFrames(SLIDES)
