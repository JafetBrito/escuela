import { LessonComposition, totalFrames, Slide, Box, Body } from '../shared/Lesson.jsx'

// Video de tema: "Robo de identidad" (course-ciberseguridad-basica, módulo 16).
const SLIDES = [
  { id: 'cyb16_1', audioFile: 'cyb16_1.wav', durationFrames: 142, render: () => (
    <Slide eyebrow="🛡️ Ciberseguridad para Todos" title="🆘 Robo de identidad: ya te hackearon, ¿ahora qué?" />
  )},
  { id: 'cyb16_2', audioFile: 'cyb16_2.wav', durationFrames: 251, render: () => (
    <Slide eyebrow="Paso 1" title="🔑 Cambia la contraseña de inmediato">
      <Box kind="tip">Desde un dispositivo limpio, y activa 2FA si no lo tenías.</Box>
    </Slide>
  )},
  { id: 'cyb16_3', audioFile: 'cyb16_3.wav', durationFrames: 221, render: () => (
    <Slide eyebrow="Paso 2" title="🏦 Contacta a tu banco directamente">
      <Body>Con el número oficial — nunca el que venga en un correo.</Body>
    </Slide>
  )},
  { id: 'cyb16_4', audioFile: 'cyb16_4.wav', durationFrames: 231, render: () => (
    <Slide eyebrow="Herramienta real y gratuita" title="🔍 Have I Been Pwned">
      <Box kind="tip">Te dice si tu correo ya apareció en alguna filtración conocida.</Box>
    </Slide>
  )},
]

export function CyberTema16() {
  return <LessonComposition slides={SLIDES} />
}

export const CYBER_TEMA16_TOTAL_FRAMES = totalFrames(SLIDES)
