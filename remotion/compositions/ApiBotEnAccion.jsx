import { LessonComposition, totalFrames, Slide, Box, Body } from '../shared/Lesson.jsx'

// Video "Tu Bot en Acción: uniendo Telegram + tu API (ejemplo con NASA)"
// (course-apis-python-telegram-bot, módulo id 9).
// Duraciones medidas con scripts/measure_wav_frames.mjs.
const CODE_STYLE = { fontFamily: 'monospace', fontSize: 26, color: '#4ade80', backgroundColor: '#001a08', border: '2px solid #16a34a', borderRadius: 14, padding: 18, maxWidth: 1500 }

const SLIDES = [
  { id: 'apid1', audioFile: 'apid1.wav', durationFrames: 518, render: () => (
    <Slide eyebrow="🤖 APIs con Python" title="Tu Bot en Acción">
      <Body>El mismo patrón de principio a fin — aquí con NASA, pero funciona igual para las 3 aventuras.</Body>
    </Slide>
  )},
  { id: 'apid2', audioFile: 'apid2.wav', durationFrames: 409, render: () => (
    <Slide eyebrow="Punto de partida" title="🔑 Tu token de BotFather">
      <Body>Va a vivir al inicio de tu archivo bot.py — la pieza que conecta tu código con Telegram.</Body>
    </Slide>
  )},
  { id: 'apid3', audioFile: 'apid3.wav', durationFrames: 465, render: () => (
    <Slide eyebrow="Paso 1 de 9" title="🏗️ Arma la base">
      <div style={CODE_STYLE}>Application.builder().token(TOKEN).build()</div>
    </Slide>
  )},
  { id: 'apid4', audioFile: 'apid4.wav', durationFrames: 308, render: () => (
    <Slide eyebrow="Paso 2 de 9" title="👋 Comando /start">
      <div style={CODE_STYLE}>async def start(update, context): ...</div>
    </Slide>
  )},
  { id: 'apid5', audioFile: 'apid5.wav', durationFrames: 336, render: () => (
    <Slide eyebrow="Paso 3 de 9" title="✨ Comando /apod — la magia real">
      <div style={CODE_STYLE}>async def apod(update, context): ...</div>
    </Slide>
  )},
  { id: 'apid6', audioFile: 'apid6.wav', durationFrames: 311, render: () => (
    <Slide eyebrow="Paso 4 de 9" title="📡 Consulta a la API">
      <div style={CODE_STYLE}>requests.get(url, params={'{'}"api_key": KEY{'}'})</div>
    </Slide>
  )},
  { id: 'apid7', audioFile: 'apid7.wav', durationFrames: 409, render: () => (
    <Slide eyebrow="Paso 5 de 9" title="✅ Revisa el status_code">
      <Box kind="tip">Si no es 200, avísale al usuario — nunca dejes que tu bot se rompa en silencio.</Box>
    </Slide>
  )},
  { id: 'apid8', audioFile: 'apid8.wav', durationFrames: 363, render: () => (
    <Slide eyebrow="Paso 6 de 9" title="📦 Extrae los datos del JSON">
      <div style={CODE_STYLE}>datos = respuesta.json()</div>
    </Slide>
  )},
  { id: 'apid9', audioFile: 'apid9.wav', durationFrames: 268, render: () => (
    <Slide eyebrow="Paso 7 de 9" title="🖼️ reply_photo, no solo texto">
      <div style={CODE_STYLE}>await update.message.reply_photo(...)</div>
    </Slide>
  )},
  { id: 'apid10', audioFile: 'apid10.wav', durationFrames: 414, render: () => (
    <Slide eyebrow="Paso 8 y 9 de 9" title="🔌 Registra y arranca">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={CODE_STYLE}>app.add_handler(CommandHandler("apod", apod))</div>
        <div style={CODE_STYLE}>app.run_polling()</div>
      </div>
    </Slide>
  )},
  { id: 'apid11', audioFile: 'apid11.wav', durationFrames: 453, render: () => (
    <Slide eyebrow="Pruébalo" title="🎉 /apod en Telegram">
      <Body>La foto astronómica del día, respondida por código que tú escribiste.</Body>
    </Slide>
  )},
  { id: 'apid12', audioFile: 'apid12.wav', durationFrames: 404, render: () => (
    <Slide eyebrow="Si elegiste Clima" title="🌦️ Mismo patrón, otro endpoint">
      <Body>Solo cambia el endpoint y los parámetros: latitud y longitud, en vez de una clave de API.</Body>
    </Slide>
  )},
  { id: 'apid13', audioFile: 'apid13.wav', durationFrames: 339, render: () => (
    <Slide eyebrow="Si elegiste Pokémon" title="🎮 Mismo patrón, otra vez">
      <Body>Cambias el endpoint, y usas el nombre del Pokémon como parte de la URL.</Body>
    </Slide>
  )},
  { id: 'apid14', audioFile: 'apid14.wav', durationFrames: 490, render: () => (
    <Slide eyebrow="Siguiente clase" title="🛡️ El código completo, con manejo de errores">
      <Body>El último paso antes de tener un bot verdaderamente sólido.</Body>
    </Slide>
  )},
]

export function ApiBotEnAccion() {
  return <LessonComposition slides={SLIDES} />
}

export const API_BOT_EN_ACCION_TOTAL_FRAMES = totalFrames(SLIDES)
