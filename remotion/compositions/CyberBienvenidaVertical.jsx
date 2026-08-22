import { LessonComposition, totalFrames } from '../shared/Lesson.jsx'
import { SlideV, BoxV, BodyV } from '../shared/LessonVertical.jsx'

// Misma narración que CyberBienvenida.jsx (mismos archivos de audio),
// formato vertical 1080x1920 para probar cómo se ve un short/reel de este
// curso — pedido explícito del dueño ("videos tanto en vertical como
// horizontal").
const SLIDES = [
  { id: 'cyberw1', audioFile: 'cyberw1.wav', durationFrames: 335, render: () => (
    <SlideV eyebrow="🛡️ Rúbics Digital Solutions" title="Ciberseguridad para Todos">
      <BodyV>"Crear un mundo digital más seguro."</BodyV>
    </SlideV>
  )},
  { id: 'cyberw2', audioFile: 'cyberw2.wav', durationFrames: 201, render: () => (
    <SlideV eyebrow="Dos caminos" title="👩 Emma 🧑 Raúl — compañeros de trabajo" />
  )},
  { id: 'cyberw3', audioFile: 'cyberw3.wav', durationFrames: 528, render: () => (
    <SlideV eyebrow="Emma" title="Aplica cada técnica, una por una">
      <BoxV kind="tip">Contraseñas únicas · verificación en dos pasos activa · desconfía de la urgencia.</BoxV>
    </SlideV>
  )},
  { id: 'cyberw4', audioFile: 'cyberw4.wav', durationFrames: 440, render: () => (
    <SlideV eyebrow="Raúl" title="Piensa distinto">
      <BoxV kind="bad">La misma contraseña en casi todo · pospone la verificación en dos pasos "para después".</BoxV>
    </SlideV>
  )},
  { id: 'cyberw5', audioFile: 'cyberw5.wav', durationFrames: 337, render: () => (
    <SlideV eyebrow="Vas a ver a dónde lleva cada camino" title="💳 Un crédito abierto a su nombre" />
  )},
  { id: 'cyberw6', audioFile: 'cyberw6.wav', durationFrames: 361, render: () => (
    <SlideV eyebrow="Aviso" title="📖 Historia ficticia, técnicas 100% reales">
      <BodyV>Pasan todos los días.</BodyV>
    </SlideV>
  )},
  { id: 'cyberw7', audioFile: 'cyberw7.wav', durationFrames: 314, render: () => (
    <SlideV eyebrow="Vas a aprender" title="🔑 Contraseñas seguras + gestor gratuito" />
  )},
  { id: 'cyberw8', audioFile: 'cyberw8.wav', durationFrames: 453, render: () => (
    <SlideV eyebrow="Vas a aprender" title="🎣 Phishing · 🦠 Malware · 🔒 VPN">
      <BodyV>Herramientas gratuitas reales, paso a paso.</BodyV>
    </SlideV>
  )},
  { id: 'cyberw9', audioFile: 'cyberw9.wav', durationFrames: 350, render: () => (
    <SlideV eyebrow="Empecemos" title="Haz esta semana lo que Raúl siguió posponiendo" />
  )},
]

export function CyberBienvenidaVertical() {
  return <LessonComposition slides={SLIDES} />
}

export const CYBER_BIENVENIDA_VERTICAL_TOTAL_FRAMES = totalFrames(SLIDES)
