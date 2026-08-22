import { LessonComposition, totalFrames, Slide, Box, Body, TEXT } from '../shared/Lesson.jsx'

// Video "Pitágoras y los Pitagóricos" (course-matematicas-griegas).
const SLIDES = [
  { id: 'pit01', audioFile: 'pit01.wav', durationFrames: 567, render: () => (
    <Slide eyebrow="🏛️ Matemáticas Griegas" title="Pitágoras y los Pitagóricos">
      <Body>Circa 570 a.C. — escuela filosófica, secta religiosa y sociedad secreta, todo a la vez.</Body>
    </Slide>
  )},
  { id: 'pit02', audioFile: 'pit02.wav', durationFrames: 674, render: () => (
    <Slide eyebrow="La cosmovisión" title='"Todo es número"'>
      <Body>Música, astronomía, geometría, hasta el alma — todo explicado por proporciones entre números.</Body>
    </Slide>
  )},
  { id: 'pit03', audioFile: 'pit03.wav', durationFrames: 675, render: () => (
    <Slide eyebrow="Ejemplo real" title="🎵 El universo afinado matemáticamente">
      <Box kind="example">Octava = proporción 2:1 · Quinta = proporción 3:2, en la longitud de una cuerda vibrante.</Box>
    </Slide>
  )},
  { id: 'pit04', audioFile: 'pit04.wav', durationFrames: 598, render: () => (
    <Slide eyebrow="El resultado famoso" title="El Teorema de Pitágoras">
      <div style={{ fontFamily: 'monospace', fontSize: 44, color: TEXT, backgroundColor: '#1e293b', border: '2px solid #334155', borderRadius: 14, padding: 24 }}>
        a² + b² = c²
      </div>
    </Slide>
  )},
  { id: 'pit05', audioFile: 'pit05.wav', durationFrames: 846, render: () => (
    <Slide eyebrow="Lo nuevo de verdad" title="No el resultado — la demostración general">
      <Body>Ya se conocía en Babilonia de forma práctica. Los pitagóricos probaron que es cierto para CUALQUIER triángulo rectángulo.</Body>
    </Slide>
  )},
  { id: 'pit06', audioFile: 'pit06.wav', durationFrames: 471, render: () => (
    <Slide eyebrow="El giro dramático" title="Catetos = 1, ¿y la hipotenusa?">
      <div style={{ fontFamily: 'monospace', fontSize: 40, color: TEXT }}>hipotenusa = √2</div>
    </Slide>
  )},
  { id: 'pit07', audioFile: 'pit07.wav', durationFrames: 760, render: () => (
    <Slide eyebrow="El descubrimiento perturbador" title="√2 no es una fracción">
      <Box kind="bad">Ningún par de números enteros puede expresar √2 exactamente. Nace el número irracional.</Box>
    </Slide>
  )},
  { id: 'pit08', audioFile: 'pit08.wav', durationFrames: 738, render: () => (
    <Slide eyebrow="La crisis" title="Una catástrofe filosófica">
      <Body>Si "todo es número entero o su proporción", ¿cómo puede existir una longitud real que ninguna proporción captura?</Body>
    </Slide>
  )},
  { id: 'pit09', audioFile: 'pit09.wav', durationFrames: 611, render: () => (
    <Slide eyebrow="La leyenda de Hipaso" title="🌊 El secreto que no se pudo guardar">
      <Body>Se dice que Hipaso de Metaponto murió ahogado por revelar el descubrimiento.</Body>
    </Slide>
  )},
  { id: 'pit10', audioFile: 'pit10.wav', durationFrames: 525, render: () => (
    <Slide eyebrow="Reflexión" title="Una demostración perfecta, una conclusión no deseada">
      <Body>La misma lógica que construyeron los llevó exactamente a donde no querían llegar.</Body>
    </Slide>
  )},
  { id: 'pit11', audioFile: 'pit11.wav', durationFrames: 378, render: () => (
    <Slide eyebrow="Un patrón que se repite" title="La lógica no siempre te lleva a donde quieres" />
  )},
  { id: 'pit12', audioFile: 'pit12.wav', durationFrames: 419, render: () => (
    <Slide eyebrow="Historia de la ciencia" title="Seguir la lógica hasta el final">
      <Body>Un patrón que se repite una y otra vez, en matemáticas y en ciencia.</Body>
    </Slide>
  )},
  { id: 'pit13', audioFile: 'pit13.wav', durationFrames: 480, render: () => (
    <Slide eyebrow="Sin resolver del todo" title="Una pregunta central para siglos">
      <Body>Los números irracionales quedaron como uno de los grandes temas de las matemáticas griegas posteriores.</Body>
    </Slide>
  )},
  { id: 'pit14', audioFile: 'pit14.wav', durationFrames: 450, render: () => (
    <Slide eyebrow="Siguiente clase" title="Antes de Euclides: ¿qué es un axioma?">
      <Body>Todo demostración necesita, tarde o temprano, un punto de partida que no se demuestra.</Body>
    </Slide>
  )},
  { id: 'pit15', audioFile: 'pit15.wav', durationFrames: 728, render: () => (
    <Slide eyebrow="Más que matemáticas" title="🌀 Un camino casi espiritual">
      <Box kind="tip">Transmigración de las almas, juramento de silencio — la matemática como comprensión del cosmos.</Box>
    </Slide>
  )},
  { id: 'pit16', audioFile: 'pit16.wav', durationFrames: 617, render: () => (
    <Slide eyebrow="Cierre" title='El eco de la crisis: "irracional"'>
      <Body>El escándalo pasó — pero el nombre se quedó, hasta hoy, para un número que no se puede escribir como fracción.</Body>
    </Slide>
  )},
]

export function PitagorasYPitagoricos() {
  return <LessonComposition slides={SLIDES} />
}

export const PITAGORAS_TOTAL_FRAMES = totalFrames(SLIDES)
