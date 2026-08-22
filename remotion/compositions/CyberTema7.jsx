import { LessonComposition, totalFrames, Slide, Box, Body } from '../shared/Lesson.jsx'

// Video de tema: "Malware y ransomware" (course-ciberseguridad-basica, módulo 7).
const SLIDES = [
  { id: 'cyb7_1', audioFile: 'cyb7_1.wav', durationFrames: 261, render: () => (
    <Slide eyebrow="🛡️ Ciberseguridad para Todos" title="🦠 Malware y ransomware">
      <Body>Cualquier programa diseñado para dañarte o espiarte — el más peligroso: el ransomware.</Body>
    </Slide>
  )},
  { id: 'cyb7_2', audioFile: 'cyb7_2.wav', durationFrames: 265, render: () => (
    <Slide eyebrow="El más destructivo" title="🔒 Cifra todos tus archivos">
      <Box kind="bad">Pide un pago para "liberarlos" — pagar no garantiza nada.</Box>
    </Slide>
  )},
  { id: 'cyb7_3', audioFile: 'cyb7_3.wav', durationFrames: 219, render: () => (
    <Slide eyebrow="¿Cómo entra?" title="📎 Adjuntos · 💿 Software pirata · 💾 USB desconocidas" />
  )},
  { id: 'cyb7_4', audioFile: 'cyb7_4.wav', durationFrames: 416, render: () => (
    <Slide eyebrow="Tu mejor defensa real" title="🛡️ Antivirus + copias de seguridad">
      <Box kind="tip">Si te cifran los archivos, simplemente restauras — sin pagarle nada al atacante.</Box>
    </Slide>
  )},
]

export function CyberTema7() {
  return <LessonComposition slides={SLIDES} />
}

export const CYBER_TEMA7_TOTAL_FRAMES = totalFrames(SLIDES)
