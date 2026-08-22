import { LessonComposition, totalFrames, Slide, Box, Body, TEXT } from '../shared/Lesson.jsx'

// Video "Arquímedes: π, el Infinito y la Palanca" (course-matematicas-griegas).
const SLIDES = [
  { id: 'arq01', audioFile: 'arq01.wav', durationFrames: 641, render: () => (
    <Slide eyebrow="🏛️ Matemáticas Griegas" title="Arquímedes: π, el Infinito y la Palanca">
      <Body>Circa 287–212 a.C. — para muchos historiadores, el matemático más brillante de la Antigüedad.</Body>
    </Slide>
  )},
  { id: 'arq02', audioFile: 'arq02.wav', durationFrames: 543, render: () => (
    <Slide eyebrow="El personaje" title="Matemáticas puras + ingeniería aplicada">
      <Body>Máquinas de guerra que defendieron Siracusa de Roma durante años.</Body>
    </Slide>
  )},
  { id: 'arq03', audioFile: 'arq03.wav', durationFrames: 593, render: () => (
    <Slide eyebrow="La leyenda" title="👑 La corona del rey Hierón II">
      <Body>¿Era de oro puro? El nivel del agua en la tina subía en proporción al volumen sumergido.</Body>
    </Slide>
  )},
  { id: 'arq04', audioFile: 'arq04.wav', durationFrames: 518, render: () => (
    <Slide eyebrow='"¡Eureka!"' title="Medir el volumen de un objeto irregular">
      <Box kind="tip">Comparar la densidad con la del oro puro — sin dañar la corona.</Box>
    </Slide>
  )},
  { id: 'arq05', audioFile: 'arq05.wav', durationFrames: 559, render: () => (
    <Slide eyebrow="El aporte más profundo" title="El método de exhaución">
      <Body>Calcular áreas y volúmenes curvos aproximándolos con figuras rectas, cada vez más precisas.</Body>
    </Slide>
  )},
  { id: 'arq06', audioFile: 'arq06.wav', durationFrames: 654, render: () => (
    <Slide eyebrow="La técnica" title="🔷 Polígonos de 6, 12, 24, 48, 96 lados">
      <Body>Cada vez más cerca de la forma del círculo — "agotando" la diferencia.</Body>
    </Slide>
  )},
  { id: 'arq07', audioFile: 'arq07.wav', durationFrames: 711, render: () => (
    <Slide eyebrow="El resultado" title="π está entre 3.1408 y 3.1429">
      <div style={{ fontFamily: 'monospace', fontSize: 34, color: TEXT, backgroundColor: '#1e293b', border: '2px solid #334155', borderRadius: 14, padding: 20 }}>
        3.1408 &lt; π &lt; 3.1429
      </div>
    </Slide>
  )},
  { id: 'arq08', audioFile: 'arq08.wav', durationFrames: 535, render: () => (
    <Slide eyebrow="La idea detrás" title="Acercarse sin necesariamente llegar">
      <Body>La misma idea, en esencia, que el concepto moderno de límite.</Body>
    </Slide>
  )},
  { id: 'arq09', audioFile: 'arq09.wav', durationFrames: 401, render: () => (
    <Slide eyebrow="2000 años después" title="Newton y Leibniz — el cálculo, siglo XVII" />
  )},
  { id: 'arq10', audioFile: 'arq10.wav', durationFrames: 637, render: () => (
    <Slide eyebrow="Precursor" title="Sin álgebra moderna, el mismo razonamiento">
      <Body>Acercarse al infinito, siglos antes de tener el lenguaje formal para nombrarlo.</Body>
    </Slide>
  )},
  { id: 'arq11', audioFile: 'arq11.wav', durationFrames: 401, render: () => (
    <Slide eyebrow="Física aplicada" title="⚖️ La ley de la palanca">
      <Body>Peso × distancia al punto de apoyo — no solo el peso.</Body>
    </Slide>
  )},
  { id: 'arq12', audioFile: 'arq12.wav', durationFrames: 392, render: () => (
    <Slide eyebrow="La frase" title='"Dame un punto de apoyo, y moveré el mundo."' />
  )},
  { id: 'arq13', audioFile: 'arq13.wav', durationFrames: 604, render: () => (
    <Slide eyebrow="Ingeniería real" title="🌀 El tornillo de Arquímedes">
      <Body>Todavía usado hoy para elevar agua — más máquinas de guerra que resistieron el asedio romano 2+ años.</Body>
    </Slide>
  )},
  { id: 'arq14', audioFile: 'arq14.wav', durationFrames: 459, render: () => (
    <Slide eyebrow="212 a.C." title="La caída de Siracusa">
      <Body>Un soldado romano lo encontró dibujando figuras geométricas en la arena.</Body>
    </Slide>
  )},
  { id: 'arq15', audioFile: 'arq15.wav', durationFrames: 759, render: () => (
    <Slide eyebrow="Últimas palabras" title='"No molestes mis círculos."'>
      <Body>Con Arquímedes se cierra la época dorada de las matemáticas griegas — pero su método sigue vivo.</Body>
    </Slide>
  )},
  { id: 'arq16', audioFile: 'arq16.wav', durationFrames: 585, render: () => (
    <Slide eyebrow="Otro texto suyo" title="🏖️ El Contador de Arena">
      <Body>Un sistema para nombrar números extremadamente grandes — cuántos granos de arena caben en el universo.</Body>
    </Slide>
  )},
  { id: 'arq17', audioFile: 'arq17.wav', durationFrames: 744, render: () => (
    <Slide eyebrow="Su epitafio" title="🔵 Una esfera inscrita en un cilindro">
      <Box kind="tip">El resultado del que Arquímedes se sentía más orgulloso — pidió que lo grabaran en su tumba.</Box>
    </Slide>
  )},
]

export function Arquimedes() {
  return <LessonComposition slides={SLIDES} />
}

export const ARQUIMEDES_TOTAL_FRAMES = totalFrames(SLIDES)
