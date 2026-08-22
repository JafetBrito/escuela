import { LessonComposition, totalFrames, Slide, Box, Body } from '../shared/Lesson.jsx'

// Video "Tales de Mileto y la Primera Demostración" (course-matematicas-griegas).
// Duraciones medidas con scripts/measure_wav_frames.mjs.
const SLIDES = [
  { id: 'tales01', audioFile: 'tales01.wav', durationFrames: 551, render: () => (
    <Slide eyebrow="🏛️ Matemáticas Griegas" title="Tales de Mileto y la Primera Demostración">
      <Body>Circa 624 a.C. — el hombre a quien la tradición le atribuye haber inventado la demostración matemática.</Body>
    </Slide>
  )},
  { id: 'tales02', audioFile: 'tales02.wav', durationFrames: 536, render: () => (
    <Slide eyebrow="Contexto" title="🌊 Mileto, puerta entre mundos">
      <Body>Ciudad jonia con contacto comercial directo con Egipto y Babilonia — de ahí heredó su conocimiento técnico.</Body>
    </Slide>
  )},
  { id: 'tales03', audioFile: 'tales03.wav', durationFrames: 710, render: () => (
    <Slide eyebrow="El punto de partida" title="Fórmulas que funcionaban, sin explicar por qué">
      <Box kind="bad">Egipto y Babilonia: conocimiento probado por la práctica, no demostrado con lógica.</Box>
    </Slide>
  )},
  { id: 'tales04', audioFile: 'tales04.wav', durationFrames: 368, render: () => (
    <Slide eyebrow="La leyenda" title="🏺 El reto de los sacerdotes egipcios">
      <Body>Calcular la altura de la Gran Pirámide — sin subirse a ella.</Body>
    </Slide>
  )},
  { id: 'tales05', audioFile: 'tales05.wav', durationFrames: 518, render: () => (
    <Slide eyebrow="La solución" title="📏 El instante en que sombra = altura">
      <Body>Tales esperó el momento exacto del día para medir la sombra de la pirámide.</Body>
    </Slide>
  )},
  { id: 'tales06', audioFile: 'tales06.wav', durationFrames: 767, render: () => (
    <Slide eyebrow="Por qué funciona" title="☀️ Un ángulo de 45°, para todo por igual">
      <Box kind="example">El mismo ángulo del sol aplica a la pirámide, a Tales, y a cualquier objeto vertical en ese instante.</Box>
    </Slide>
  )},
  { id: 'tales07', audioFile: 'tales07.wav', durationFrames: 668, render: () => (
    <Slide eyebrow="Lo que de verdad importa" title="No el truco — la razón general">
      <Body>Proporcionalidad entre triángulos semejantes: la primera vez que alguien buscó el "por qué" detrás del "cómo".</Body>
    </Slide>
  )},
  { id: 'tales08', audioFile: 'tales08.wav', durationFrames: 348, render: () => (
    <Slide eyebrow="Teorema 1 de 4" title="⭕ Un diámetro divide el círculo en dos partes iguales" />
  )},
  { id: 'tales09', audioFile: 'tales09.wav', durationFrames: 316, render: () => (
    <Slide eyebrow="Teorema 2 de 4" title="🔺 Ángulos base de un triángulo isósceles">
      <Body>Los dos ángulos de la base son siempre iguales entre sí.</Body>
    </Slide>
  )},
  { id: 'tales10', audioFile: 'tales10.wav', durationFrames: 660, render: () => (
    <Slide eyebrow="Teorema 3 de 4 · El Teorema de Tales" title="📐 Ángulo inscrito en un semicírculo = 90°">
      <Box kind="tip">Sin importar dónde coloques el tercer punto sobre el semicírculo, el ángulo siempre es recto.</Box>
    </Slide>
  )},
  { id: 'tales11', audioFile: 'tales11.wav', durationFrames: 499, render: () => (
    <Slide eyebrow="Teorema 4 de 4" title="📊 Proporcionalidad entre paralelas">
      <Body>Rectas paralelas cortadas por transversales crean segmentos proporcionales — la idea detrás de la sombra.</Body>
    </Slide>
  )},
  { id: 'tales12', audioFile: 'tales12.wav', durationFrames: 445, render: () => (
    <Slide eyebrow="Historia vs. leyenda" title="¿Cuánto de esto pasó de verdad?">
      <Body>Generaciones posteriores de griegos necesitaban un "padre fundador" para sus matemáticas.</Body>
    </Slide>
  )},
  { id: 'tales13', audioFile: 'tales13.wav', durationFrames: 572, render: () => (
    <Slide eyebrow="Por qué importa" title='"No basta con que funcione — quiero saber por qué."'>
      <Body>El momento simbólico en que nace la demostración matemática.</Body>
    </Slide>
  )},
  { id: 'tales14', audioFile: 'tales14.wav', durationFrames: 500, render: () => (
    <Slide eyebrow="Cierre" title="La puerta que abrió Tales">
      <Body>Siguiente clase: Pitágoras, y una hermandad que creía que el universo entero estaba hecho de números.</Body>
    </Slide>
  )},
  { id: 'tales15', audioFile: 'tales15.wav', durationFrames: 676, render: () => (
    <Slide eyebrow="También astrónomo" title="🌑 Predijo un eclipse solar (585 a.C.)">
      <Box kind="example">Según Heródoto, ese eclipse detuvo en seco una batalla entre lidios y medos.</Box>
    </Slide>
  )},
  { id: 'tales16', audioFile: 'tales16.wav', durationFrames: 742, render: () => (
    <Slide eyebrow="Legado" title='Aristóteles: "el primero de los filósofos"'>
      <Body>Causas naturales, no mitos — nace la Escuela de Mileto (Anaximandro, Anaximenes).</Body>
    </Slide>
  )},
  { id: 'tales17', audioFile: 'tales17.wav', durationFrames: 603, render: () => (
    <Slide eyebrow="Cierre final" title="Cambió cómo nos preguntamos por qué">
      <Body>No solo las matemáticas — la forma misma de buscar respuestas.</Body>
    </Slide>
  )},
]

export function TalesDeMileto() {
  return <LessonComposition slides={SLIDES} />
}

export const TALES_TOTAL_FRAMES = totalFrames(SLIDES)
