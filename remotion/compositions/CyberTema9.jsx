import { LessonComposition, totalFrames, Slide, Box, Body } from '../shared/Lesson.jsx'

// Video de tema: "Wi-Fi pública y VPN" (course-ciberseguridad-basica, módulo 9).
const SLIDES = [
  { id: 'cyb9_1', audioFile: 'cyb9_1.wav', durationFrames: 189, render: () => (
    <Slide eyebrow="🛡️ Ciberseguridad para Todos" title="📡 Wi-Fi pública y VPN" />
  )},
  { id: 'cyb9_2', audioFile: 'cyb9_2.wav', durationFrames: 269, render: () => (
    <Slide eyebrow="El riesgo real" title="No sabes quién más está en esa red">
      <Box kind="warn">Ni si el punto de acceso es siquiera legítimo.</Box>
    </Slide>
  )},
  { id: 'cyb9_3', audioFile: 'cyb9_3.wav', durationFrames: 279, render: () => (
    <Slide eyebrow="La solución" title="🔒 Una VPN cifra todo tu tráfico">
      <Body>Incluso en una red comprometida, nadie más puede ver lo que haces.</Body>
    </Slide>
  )},
  { id: 'cyb9_4', audioFile: 'cyb9_4.wav', durationFrames: 327, render: () => (
    <Slide eyebrow="Herramienta real y gratuita" title="ProtonVPN">
      <Box kind="tip">Úsala siempre en un café, aeropuerto, o cualquier red que no sea tuya.</Box>
    </Slide>
  )},
]

export function CyberTema9() {
  return <LessonComposition slides={SLIDES} />
}

export const CYBER_TEMA9_TOTAL_FRAMES = totalFrames(SLIDES)
