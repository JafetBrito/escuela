import { LessonComposition, totalFrames, Slide, Box, Body } from '../shared/Lesson.jsx'

// Video "Bienvenida: vas a construir tu propio bot consultor de Telegram"
// (course-apis-python-telegram-bot, módulo id 0).
// Duraciones medidas con scripts/measure_wav_frames.mjs.
const SLIDES = [
  { id: 'apiw1', audioFile: 'apiw1.wav', durationFrames: 782, render: () => (
    <Slide eyebrow="🤖 APIs con Python" title="Crea tu Bot Consultor de Telegram">
      <Body>Vas a aprender a conectar tu código a cualquier fuente de datos abierta de internet — y a construir un bot de Telegram que las consulte por ti.</Body>
    </Slide>
  )},
  { id: 'apiw2', audioFile: 'apiw2.wav', durationFrames: 559, render: () => (
    <Slide eyebrow="El concepto base" title="🍽️ La analogía del mesero">
      <Box kind="example">Tú pides algo del menú, el mesero (la API) lleva tu pedido a la cocina, y te trae la respuesta — sin que tengas que entrar tú mismo.</Box>
    </Slide>
  )},
  { id: 'apiw3', audioFile: 'apiw3.wav', durationFrames: 450, render: () => (
    <Slide eyebrow="Primer código real" title="📡 Tu primera petición con requests">
      <Body>Y cómo proteger tus claves de acceso — una habilidad que todo programador necesita dominar desde el principio.</Body>
    </Slide>
  )},
  { id: 'apiw4', audioFile: 'apiw4.wav', durationFrames: 789, render: () => (
    <Slide eyebrow="Elige tu aventura" title="🚀 NASA · 🌦️ Clima · 🎮 Pokémon">
      <Body>Tú eliges qué API va a consultar tu bot — y el curso se adapta automáticamente a tu elección.</Body>
    </Slide>
  )},
  { id: 'apiw5', audioFile: 'apiw5.wav', durationFrames: 364, render: () => (
    <Slide eyebrow="Tu bot de verdad" title="💬 BotFather + python-telegram-bot">
      <Body>Vas a crear tu bot dentro de Telegram, y a conectarlo con Python.</Body>
    </Slide>
  )},
  { id: 'apiw6', audioFile: 'apiw6.wav', durationFrames: 453, render: () => (
    <Slide eyebrow="Código sólido" title="🛡️ Manejo de errores, como en producción">
      <Body>Para que tu bot nunca se quede colgado ni se rompa por una falla de conexión.</Body>
    </Slide>
  )},
  { id: 'apiw7', audioFile: 'apiw7.wav', durationFrames: 541, render: () => (
    <Slide eyebrow="Listo para empezar" title="Un bot real, hecho por ti, de principio a fin">
      <Body>Solo necesitas conocimientos básicos de Python. Empecemos.</Body>
    </Slide>
  )},
]

export function ApiBienvenida() {
  return <LessonComposition slides={SLIDES} />
}

export const API_BIENVENIDA_TOTAL_FRAMES = totalFrames(SLIDES)
