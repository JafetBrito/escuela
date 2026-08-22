import { LessonComposition, totalFrames, Slide, Box, Body } from '../shared/Lesson.jsx'

// Video de tema: "Phishing" (course-ciberseguridad-basica, módulo 5).
const SLIDES = [
  { id: 'cyb5_1', audioFile: 'cyb5_1.wav', durationFrames: 278, render: () => (
    <Slide eyebrow="🛡️ Ciberseguridad para Todos" title="🎣 Phishing">
      <Body>Cuando alguien se hace pasar por tu banco, o por una empresa de confianza, para robarte información.</Body>
    </Slide>
  )},
  { id: 'cyb5_2', audioFile: 'cyb5_2.wav', durationFrames: 279, render: () => (
    <Slide eyebrow="Las señales" title="🚨 Urgencia · 👤 Saludo genérico · 🔗 Dominio raro">
      <Box kind="warn">Las tres banderas rojas más comunes.</Box>
    </Slide>
  )},
  { id: 'cyb5_3', audioFile: 'cyb5_3.wav', durationFrames: 203, render: () => (
    <Slide eyebrow="Regla sin excepciones" title="Ningún banco pide tu contraseña por correo">
      <Body>Nunca.</Body>
    </Slide>
  )},
  { id: 'cyb5_4', audioFile: 'cyb5_4.wav', durationFrames: 305, render: () => (
    <Slide eyebrow="Truco seguro" title="No uses el enlace del correo">
      <Box kind="tip">Abre tu navegador aparte, y escribe tú mismo la dirección oficial.</Box>
    </Slide>
  )},
]

export function CyberTema5() {
  return <LessonComposition slides={SLIDES} />
}

export const CYBER_TEMA5_TOTAL_FRAMES = totalFrames(SLIDES)
