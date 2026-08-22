import { LessonComposition, totalFrames, Slide, Box, Body } from '../shared/Lesson.jsx'

// Video de tema: "Contraseñas seguras" (course-ciberseguridad-basica, módulo 2).
const SLIDES = [
  { id: 'cyb2_1', audioFile: 'cyb2_1.wav', durationFrames: 146, render: () => (
    <Slide eyebrow="🛡️ Ciberseguridad para Todos" title="🔑 Contraseñas seguras" />
  )},
  { id: 'cyb2_2', audioFile: 'cyb2_2.wav', durationFrames: 389, render: () => (
    <Slide eyebrow="El error de Raúl" title="La misma contraseña en todo">
      <Box kind="bad">Credential stuffing: si una cuenta se filtra, esa contraseña se prueba automáticamente en todas las demás.</Box>
    </Slide>
  )},
  { id: 'cyb2_3', audioFile: 'cyb2_3.wav', durationFrames: 371, render: () => (
    <Slide eyebrow="Qué hace fuerte a una contraseña" title="Una frase larga y aleatoria">
      <Body>Entre más larga, exponencialmente más difícil de adivinar — no hacen falta símbolos raros.</Body>
    </Slide>
  )},
  { id: 'cyb2_4', audioFile: 'cyb2_4.wav', durationFrames: 352, render: () => (
    <Slide eyebrow="La regla de oro" title="🚫 Nunca repitas contraseñas">
      <Box kind="tip">Empieza por tu correo — con acceso a él, se resetea casi cualquier otra cuenta tuya.</Box>
    </Slide>
  )},
]

export function CyberTema2() {
  return <LessonComposition slides={SLIDES} />
}

export const CYBER_TEMA2_TOTAL_FRAMES = totalFrames(SLIDES)
