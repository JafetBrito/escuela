import { LessonComposition, totalFrames, Slide, Box, Body, TEXT } from '../shared/Lesson.jsx'

// Video "El clímax: Raúl cae en la trampa" (course-ciberseguridad-basica,
// módulo id 15). Versión horizontal (1920x1080) — ver CyberClimaxVertical.jsx
// para la versión 1080x1920 (mismo audio).
const SLIDES = [
  { id: 'cyberc1', audioFile: 'cyberc1.wav', durationFrames: 123, render: () => (
    <Slide eyebrow="🛡️ Ciberseguridad para Todos" title="El Clímax: Raúl Cae en la Trampa" />
  )},
  { id: 'cyberc2', audioFile: 'cyberc2.wav', durationFrames: 423, render: () => (
    <Slide eyebrow="Lunes por la mañana" title="📧 «Actividad inusual detectada»">
      <Body>"Verifica tu cuenta en 24 horas o será suspendida."</Body>
    </Slide>
  )},
  { id: 'cyberc3', audioFile: 'cyberc3.wav', durationFrames: 426, render: () => (
    <Slide eyebrow="Se ve profesional" title="Logo correcto, colores correctos">
      <Box kind="bad">Con prisa antes de una junta, Raúl hace clic sin pensarlo dos veces.</Box>
    </Slide>
  )},
  { id: 'cyberc4', audioFile: 'cyberc4.wav', durationFrames: 326, render: () => (
    <Slide eyebrow="Idéntica, pixel por pixel" title="🖥️ La página falsa del banco">
      <Body>Raúl escribe ahí mismo su usuario y su contraseña.</Body>
    </Slide>
  )},
  { id: 'cyberc5', audioFile: 'cyberc5.wav', durationFrames: 426, render: () => (
    <Slide eyebrow="El error de fondo" title="La misma contraseña, en todo">
      <div style={{ fontFamily: 'monospace', fontSize: 30, color: TEXT, backgroundColor: '#1e293b', border: '2px solid #334155', borderRadius: 14, padding: 22 }}>
        Correo · Redes sociales · Trabajo → misma clave
      </div>
    </Slide>
  )},
  { id: 'cyberc6', audioFile: 'cyberc6.wav', durationFrames: 457, render: () => (
    <Slide eyebrow="Sin 2FA que lo detenga" title="💳 Solicitan un crédito a su nombre">
      <Body>Con esos mismos datos, en otra institución.</Body>
    </Slide>
  )},
  { id: 'cyberc7', audioFile: 'cyberc7.wav', durationFrames: 226, render: () => (
    <Slide eyebrow="Semanas después" title="📞 Una llamada de cobranza">
      <Body>Por una deuda que él nunca pidió.</Body>
    </Slide>
  )},
  { id: 'cyberc8', audioFile: 'cyberc8.wav', durationFrames: 522, render: () => (
    <Slide eyebrow="El mismo ataque, contra Emma" title="🛡️ Contraseña única + 2FA activo">
      <Box kind="tip">El intento no llegó a ningún lado.</Box>
    </Slide>
  )},
  { id: 'cyberc9', audioFile: 'cyberc9.wav', durationFrames: 296, render: () => (
    <Slide eyebrow="Emma" title="Ni se enteró de que fue un objetivo">
      <Body>Su rutina de seguridad simplemente funcionó, en silencio.</Body>
    </Slide>
  )},
  { id: 'cyberc10', audioFile: 'cyberc10.wav', durationFrames: 215, render: () => (
    <Slide eyebrow="Siguiente clase" title="¿Qué hacer si esto te pasa a ti?" />
  )},
]

export function CyberClimax() {
  return <LessonComposition slides={SLIDES} />
}

export const CYBER_CLIMAX_TOTAL_FRAMES = totalFrames(SLIDES)
