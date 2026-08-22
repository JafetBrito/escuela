import { LessonComposition, totalFrames, Slide, Box, Body } from '../shared/Lesson.jsx'

// Video de tema: "Cierre" (course-ciberseguridad-basica, módulo 17).
const SLIDES = [
  { id: 'cyb17_1', audioFile: 'cyb17_1.wav', durationFrames: 221, render: () => (
    <Slide eyebrow="🛡️ Ciberseguridad para Todos" title="Así se mantuvo protegida Emma">
      <Body>El mismo ataque, dos finales distintos.</Body>
    </Slide>
  )},
  { id: 'cyb17_2', audioFile: 'cyb17_2.wav', durationFrames: 287, render: () => (
    <Slide eyebrow="Tu checklist de esta semana" title="🔑 Gestor · 🔐 2FA · 🛡️ Antivirus · 📦 Backup" />
  )},
  { id: 'cyb17_3', audioFile: 'cyb17_3.wav', durationFrames: 257, render: () => (
    <Slide eyebrow="Lo más importante" title="Empieza por uno, hoy">
      <Box kind="tip">Y sigue con el siguiente mañana.</Box>
    </Slide>
  )},
  { id: 'cyb17_4', audioFile: 'cyb17_4.wav', durationFrames: 255, render: () => (
    <Slide eyebrow="🛡️ Rúbics Digital Solutions" title='"Crear un mundo digital más seguro"' />
  )},
]

export function CyberTema17() {
  return <LessonComposition slides={SLIDES} />
}

export const CYBER_TEMA17_TOTAL_FRAMES = totalFrames(SLIDES)
