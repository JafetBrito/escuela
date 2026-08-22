import { LessonComposition, totalFrames, Slide, Box } from '../shared/Lesson.jsx'

// Video de tema: "Privacidad en redes sociales" (course-ciberseguridad-basica, módulo 12).
const SLIDES = [
  { id: 'cyb12_1', audioFile: 'cyb12_1.wav', durationFrames: 164, render: () => (
    <Slide eyebrow="🛡️ Ciberseguridad para Todos" title="📱 Privacidad en redes sociales" />
  )},
  { id: 'cyb12_2', audioFile: 'cyb12_2.wav', durationFrames: 312, render: () => (
    <Slide eyebrow="Lo que publicas es munición" title="🎂 Cumpleaños · 🐾 Mascota · 🏢 Trabajo">
      <Box kind="warn">Ayuda a un atacante a construir un ataque más creíble.</Box>
    </Slide>
  )},
  { id: 'cyb12_3', audioFile: 'cyb12_3.wav', durationFrames: 165, render: () => (
    <Slide eyebrow="Ajustes recomendados" title="🔒 Perfil privado + lista de amigos limitada" />
  )},
  { id: 'cyb12_4', audioFile: 'cyb12_4.wav', durationFrames: 239, render: () => (
    <Slide eyebrow="No es dejar las redes sociales" title="Es decidir a propósito qué compartes" />
  )},
]

export function CyberTema12() {
  return <LessonComposition slides={SLIDES} />
}

export const CYBER_TEMA12_TOTAL_FRAMES = totalFrames(SLIDES)
