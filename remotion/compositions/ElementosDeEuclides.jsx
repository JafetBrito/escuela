import { LessonComposition, totalFrames, Slide, Box, Body } from '../shared/Lesson.jsx'

// Video "Los Elementos de Euclides y los 5 Postulados" (course-matematicas-griegas).
const SLIDES = [
  { id: 'euc01', audioFile: 'euc01.wav', durationFrames: 529, render: () => (
    <Slide eyebrow="🏛️ Matemáticas Griegas" title="Los Elementos de Euclides y los 5 Postulados">
      <Body>Circa 300 a.C. — Euclides de Alejandría, casi con certeza, no descubrió la mayoría de estos resultados.</Body>
    </Slide>
  )},
  { id: 'euc02', audioFile: 'euc02.wav', durationFrames: 565, render: () => (
    <Slide eyebrow="El verdadero logro" title="Organizar todo en un solo sistema lógico">
      <Body>De Tales, los pitagóricos y otros — todo encajado en una sola estructura, desde axiomas mínimos.</Body>
    </Slide>
  )},
  { id: 'euc03', audioFile: 'euc03.wav', durationFrames: 732, render: () => (
    <Slide eyebrow="El libro más influyente" title="📖 Más de 2000 años como libro de texto">
      <Box kind="tip">Probablemente el libro de texto científico de mayor vigencia en toda la historia humana.</Box>
    </Slide>
  )},
  { id: 'euc04', audioFile: 'euc04.wav', durationFrames: 844, render: () => (
    <Slide eyebrow="El problema" title="¿Dónde termina la cadena de demostraciones?">
      <Body>Cada afirmación necesita otra ya demostrada antes. Si nunca se detiene, no hay punto sólido de partida.</Body>
    </Slide>
  )},
  { id: 'euc05', audioFile: 'euc05.wav', durationFrames: 641, render: () => (
    <Slide eyebrow="La solución de Euclides" title="Aceptar un punto de partida indemostrable">
      <Body>Un pequeño conjunto de afirmaciones que se aceptan sin demostrar: los axiomas.</Body>
    </Slide>
  )},
  { id: 'euc06', audioFile: 'euc06.wav', durationFrames: 626, render: () => (
    <Slide eyebrow="La analogía" title="♟️ Las reglas del juego">
      <Box kind="example">Nadie pregunta, dentro del ajedrez, por qué el alfil se mueve en diagonal — es el punto de partida.</Box>
    </Slide>
  )},
  { id: 'euc07', audioFile: 'euc07.wav', durationFrames: 504, render: () => (
    <Slide eyebrow="La estructura del libro" title="Definiciones, nociones comunes, y 5 postulados" />
  )},
  { id: 'euc08', audioFile: 'euc08.wav', durationFrames: 381, render: () => (
    <Slide eyebrow="Postulados 1 y 2" title="📏 Trazar una recta · Extenderla indefinidamente" />
  )},
  { id: 'euc09', audioFile: 'euc09.wav', durationFrames: 342, render: () => (
    <Slide eyebrow="Postulados 3 y 4" title="⭕ Trazar un círculo · Todos los ángulos rectos son iguales" />
  )},
  { id: 'euc10', audioFile: 'euc10.wav', durationFrames: 570, render: () => (
    <Slide eyebrow="Postulado 5 · El de las paralelas" title="El más largo, y el más problemático">
      <Body>Ángulos internos que suman menos de 180° → las líneas se cruzan de ese lado.</Body>
    </Slide>
  )},
  { id: 'euc11', audioFile: 'euc11.wav', durationFrames: 379, render: () => (
    <Slide eyebrow="Una diferencia notable" title="4 postulados cortos, 1 mucho más largo" />
  )},
  { id: 'euc12', audioFile: 'euc12.wav', durationFrames: 615, render: () => (
    <Slide eyebrow="2000 años de sospecha" title="¿Es esto un axioma, o un teorema disfrazado?">
      <Box kind="warn">Todos los intentos de demostrar el 5º postulado a partir de los otros cuatro fracasaron.</Box>
    </Slide>
  )},
  { id: 'euc13', audioFile: 'euc13.wav', durationFrames: 692, render: () => (
    <Slide eyebrow="Versión de Playfair" title="Una sola paralela, por un punto fuera de la línea">
      <Body>Suena obvio. Nadie logró demostrarlo a partir de los otros cuatro postulados.</Body>
    </Slide>
  )},
  { id: 'euc14', audioFile: 'euc14.wav', durationFrames: 506, render: () => (
    <Slide eyebrow="Siglo XIX" title="Gauss, Lobachevski, Bolyai">
      <Body>¿Y si, en vez de demostrarlo, simplemente lo cambiamos?</Body>
    </Slide>
  )},
  { id: 'euc15', audioFile: 'euc15.wav', durationFrames: 532, render: () => (
    <Slide eyebrow="El resultado" title="🌐 Nacen las geometrías no-euclidianas">
      <Body>Cero, o infinitas paralelas — sistemas igual de válidos que el de Euclides.</Body>
    </Slide>
  )},
  { id: 'euc16', audioFile: 'euc16.wav', durationFrames: 676, render: () => (
    <Slide eyebrow="Cierre" title="Una puerta que nadie esperaba, dos milenios después">
      <Body>Desde esos 5 postulados, Euclides demuestra cientos de resultados — incluido el propio teorema de Pitágoras.</Body>
    </Slide>
  )},
  { id: 'euc17', audioFile: 'euc17.wav', durationFrames: 532, render: () => (
    <Slide eyebrow="El estándar que dejó" title="Nada se da por sentado sin declararlo primero">
      <Body>Cada afirmación nueva se apoya solo en lo ya aceptado — sin excepciones.</Body>
    </Slide>
  )},
]

export function ElementosDeEuclides() {
  return <LessonComposition slides={SLIDES} />
}

export const EUCLIDES_TOTAL_FRAMES = totalFrames(SLIDES)
