import { LessonComposition, totalFrames } from '../shared/Lesson.jsx'
import { SlideV, BoxV, BodyV } from '../shared/LessonVertical.jsx'

// Misma narración que CyberClimax.jsx (mismos archivos de audio), formato
// vertical 1080x1920.
const SLIDES = [
  { id: 'cyberc1', audioFile: 'cyberc1.wav', durationFrames: 123, render: () => (
    <SlideV eyebrow="🛡️ Ciberseguridad para Todos" title="El Clímax: Raúl Cae en la Trampa" />
  )},
  { id: 'cyberc2', audioFile: 'cyberc2.wav', durationFrames: 423, render: () => (
    <SlideV eyebrow="Lunes por la mañana" title="📧 «Actividad inusual detectada»">
      <BodyV>"Verifica tu cuenta en 24 horas o será suspendida."</BodyV>
    </SlideV>
  )},
  { id: 'cyberc3', audioFile: 'cyberc3.wav', durationFrames: 426, render: () => (
    <SlideV eyebrow="Se ve profesional" title="Logo correcto, colores correctos">
      <BoxV kind="bad">Con prisa antes de una junta, Raúl hace clic sin pensarlo dos veces.</BoxV>
    </SlideV>
  )},
  { id: 'cyberc4', audioFile: 'cyberc4.wav', durationFrames: 326, render: () => (
    <SlideV eyebrow="Idéntica, pixel por pixel" title="🖥️ La página falsa del banco">
      <BodyV>Raúl escribe ahí mismo su usuario y su contraseña.</BodyV>
    </SlideV>
  )},
  { id: 'cyberc5', audioFile: 'cyberc5.wav', durationFrames: 426, render: () => (
    <SlideV eyebrow="El error de fondo" title="La misma contraseña, en todo">
      <BoxV kind="warn">Correo · Redes sociales · Trabajo → misma clave</BoxV>
    </SlideV>
  )},
  { id: 'cyberc6', audioFile: 'cyberc6.wav', durationFrames: 457, render: () => (
    <SlideV eyebrow="Sin 2FA que lo detenga" title="💳 Solicitan un crédito a su nombre">
      <BodyV>Con esos mismos datos, en otra institución.</BodyV>
    </SlideV>
  )},
  { id: 'cyberc7', audioFile: 'cyberc7.wav', durationFrames: 226, render: () => (
    <SlideV eyebrow="Semanas después" title="📞 Una llamada de cobranza">
      <BodyV>Por una deuda que él nunca pidió.</BodyV>
    </SlideV>
  )},
  { id: 'cyberc8', audioFile: 'cyberc8.wav', durationFrames: 522, render: () => (
    <SlideV eyebrow="El mismo ataque, contra Emma" title="🛡️ Contraseña única + 2FA activo">
      <BoxV kind="tip">El intento no llegó a ningún lado.</BoxV>
    </SlideV>
  )},
  { id: 'cyberc9', audioFile: 'cyberc9.wav', durationFrames: 296, render: () => (
    <SlideV eyebrow="Emma" title="Ni se enteró de que fue un objetivo">
      <BodyV>Su rutina de seguridad simplemente funcionó, en silencio.</BodyV>
    </SlideV>
  )},
  { id: 'cyberc10', audioFile: 'cyberc10.wav', durationFrames: 215, render: () => (
    <SlideV eyebrow="Siguiente clase" title="¿Qué hacer si esto te pasa a ti?" />
  )},
]

export function CyberClimaxVertical() {
  return <LessonComposition slides={SLIDES} />
}

export const CYBER_CLIMAX_VERTICAL_TOTAL_FRAMES = totalFrames(SLIDES)
