import { LessonComposition, totalFrames, Slide, Box, Body } from '../shared/Lesson.jsx'

// Video "Bienvenida: el día que Raúl perdió el control de su cuenta"
// (course-ciberseguridad-basica, módulo id 0). Versión horizontal (1920x1080)
// — ver CyberBienvenidaVertical.jsx para la versión 1080x1920 (mismo audio).
const SLIDES = [
  { id: 'cyberw1', audioFile: 'cyberw1.wav', durationFrames: 335, render: () => (
    <Slide eyebrow="🛡️ Rúbics Digital Solutions" title="Ciberseguridad para Todos">
      <Body>"Crear un mundo digital más seguro."</Body>
    </Slide>
  )},
  { id: 'cyberw2', audioFile: 'cyberw2.wav', durationFrames: 201, render: () => (
    <Slide eyebrow="Dos caminos" title="👩 Emma 🧑 Raúl — compañeros de trabajo" />
  )},
  { id: 'cyberw3', audioFile: 'cyberw3.wav', durationFrames: 528, render: () => (
    <Slide eyebrow="Emma" title="Aplica cada técnica, una por una">
      <Box kind="tip">Contraseñas únicas · verificación en dos pasos activa · desconfía de la urgencia.</Box>
    </Slide>
  )},
  { id: 'cyberw4', audioFile: 'cyberw4.wav', durationFrames: 440, render: () => (
    <Slide eyebrow="Raúl" title="Piensa distinto">
      <Box kind="bad">La misma contraseña en casi todo · pospone la verificación en dos pasos "para después".</Box>
    </Slide>
  )},
  { id: 'cyberw5', audioFile: 'cyberw5.wav', durationFrames: 337, render: () => (
    <Slide eyebrow="Vas a ver a dónde lleva cada camino" title="💳 Un crédito abierto a su nombre" />
  )},
  { id: 'cyberw6', audioFile: 'cyberw6.wav', durationFrames: 361, render: () => (
    <Slide eyebrow="Aviso" title="📖 Historia ficticia, técnicas 100% reales">
      <Body>Pasan todos los días.</Body>
    </Slide>
  )},
  { id: 'cyberw7', audioFile: 'cyberw7.wav', durationFrames: 314, render: () => (
    <Slide eyebrow="Vas a aprender" title="🔑 Contraseñas seguras + gestor gratuito" />
  )},
  { id: 'cyberw8', audioFile: 'cyberw8.wav', durationFrames: 453, render: () => (
    <Slide eyebrow="Vas a aprender" title="🎣 Phishing · 🦠 Malware · 🔒 VPN">
      <Body>Herramientas gratuitas reales, paso a paso.</Body>
    </Slide>
  )},
  { id: 'cyberw9', audioFile: 'cyberw9.wav', durationFrames: 350, render: () => (
    <Slide eyebrow="Empecemos" title="Haz esta semana lo que Raúl siguió posponiendo" />
  )},
]

export function CyberBienvenida() {
  return <LessonComposition slides={SLIDES} />
}

export const CYBER_BIENVENIDA_TOTAL_FRAMES = totalFrames(SLIDES)
