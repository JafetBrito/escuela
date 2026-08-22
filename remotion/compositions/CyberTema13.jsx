import { LessonComposition, totalFrames, Slide, Box, Body } from '../shared/Lesson.jsx'

// Video de tema: "Navegación segura" (course-ciberseguridad-basica, módulo 13).
const SLIDES = [
  { id: 'cyb13_1', audioFile: 'cyb13_1.wav', durationFrames: 185, render: () => (
    <Slide eyebrow="🛡️ Ciberseguridad para Todos" title="🌐 Navegación segura" />
  )},
  { id: 'cyb13_2', audioFile: 'cyb13_2.wav', durationFrames: 276, render: () => (
    <Slide eyebrow="El candado no es todo" title="🔒 HTTPS = conexión cifrada">
      <Box kind="warn">No confirma que el sitio sea de fiar.</Box>
    </Slide>
  )},
  { id: 'cyb13_3', audioFile: 'cyb13_3.wav', durationFrames: 225, render: () => (
    <Slide eyebrow="Descargas seguras" title="Solo desde la fuente oficial">
      <Body>Nunca de sitios de "descarga gratis" de terceros.</Body>
    </Slide>
  )},
  { id: 'cyb13_4', audioFile: 'cyb13_4.wav', durationFrames: 200, render: () => (
    <Slide eyebrow="Antes de dar clic" title="🖱️ Pasa el mouse para ver la URL real" />
  )},
]

export function CyberTema13() {
  return <LessonComposition slides={SLIDES} />
}

export const CYBER_TEMA13_TOTAL_FRAMES = totalFrames(SLIDES)
