import { LessonComposition, totalFrames, Slide, Box } from '../shared/Lesson.jsx'

// Video de tema: "Seguridad en el trabajo" (course-ciberseguridad-basica, módulo 14).
const SLIDES = [
  { id: 'cyb14_1', audioFile: 'cyb14_1.wav', durationFrames: 174, render: () => (
    <Slide eyebrow="🛡️ Ciberseguridad para Todos" title="🏢 Seguridad en el trabajo">
      <Box kind="tip">Tu responsabilidad no termina en casa.</Box>
    </Slide>
  )},
  { id: 'cyb14_2', audioFile: 'cyb14_2.wav', durationFrames: 193, render: () => (
    <Slide eyebrow="Regla #1" title="🚫 Nunca conectes una USB desconocida" />
  )},
  { id: 'cyb14_3', audioFile: 'cyb14_3.wav', durationFrames: 175, render: () => (
    <Slide eyebrow="Regla #2" title="🔒 Bloquea tu pantalla al alejarte">
      <Box kind="warn">Aunque sea "solo un momento".</Box>
    </Slide>
  )},
  { id: 'cyb14_4', audioFile: 'cyb14_4.wav', durationFrames: 277, render: () => (
    <Slide eyebrow="Regla #3" title="📢 Reporta cualquier correo sospechoso">
      <Box kind="tip">Así avisan a todo el equipo antes de que alguien más caiga.</Box>
    </Slide>
  )},
]

export function CyberTema14() {
  return <LessonComposition slides={SLIDES} />
}

export const CYBER_TEMA14_TOTAL_FRAMES = totalFrames(SLIDES)
