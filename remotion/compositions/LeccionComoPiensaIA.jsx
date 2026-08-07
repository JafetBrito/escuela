import { LessonComposition, totalFrames, Slide, Box, Body } from '../shared/Lesson.jsx'

// Video-resumen de la clase "Cómo Piensa Realmente una IA" (course-003,
// módulo id 22). Duraciones = duración real del .wav (30fps) + colchón.
const SLIDES = [
  {
    id: 'mente1',
    audioFile: 'mente1.wav',
    durationFrames: 323,
    render: () => (
      <Slide eyebrow="🧠 Ingeniería de Prompts" title="Cómo Piensa Realmente una IA">
        <Body>Antes de seguir con más técnicas, vamos a abrir la caja negra.</Body>
      </Slide>
    ),
  },
  {
    id: 'mente2',
    audioFile: 'mente2.wav',
    durationFrames: 413,
    render: () => (
      <Slide eyebrow="No es una mente" title="Es una función matemática enorme">
        <Body>Recibe texto, hace miles de millones de cálculos, y devuelve texto — sin memoria entre conversaciones.</Body>
      </Slide>
    ),
  },
  {
    id: 'mente3',
    audioFile: 'mente3.wav',
    durationFrames: 353,
    render: () => (
      <Slide eyebrow="La unidad real" title="Tokens, no palabras">
        <Box kind="tip">💡 "prompting" → "prompt" + "ing" — 1 palabra en español ≈ 1.3-1.5 tokens.</Box>
      </Slide>
    ),
  },
  {
    id: 'mente4',
    audioFile: 'mente4.wav',
    durationFrames: 468,
    render: () => (
      <Slide eyebrow="Cómo genera texto" title="Predicción del siguiente token">
        <Body>Calcula la probabilidad de cada token siguiente, elige uno, y vuelve a calcular — token por token.</Body>
      </Slide>
    ),
  },
  {
    id: 'mente5',
    audioFile: 'mente5.wav',
    durationFrames: 390,
    render: () => (
      <Slide eyebrow="El mecanismo clave" title="Atención (Attention)">
        <Body>Revisa TODO tu prompt a la vez y decide qué partes son más relevantes para cada token.</Body>
      </Slide>
    ),
  },
  {
    id: 'mente6',
    audioFile: 'mente6.wav',
    durationFrames: 455,
    render: () => (
      <Slide eyebrow="Cierre" title="No es magia, es estadística a gran escala">
        <Box kind="warn">⚠️ Explica por qué el orden importa, por qué Chain-of-Thought funciona, y por qué a veces alucina.</Box>
      </Slide>
    ),
  },
]

export function LeccionComoPiensaIA() {
  return <LessonComposition slides={SLIDES} />
}

export const LECCION_MENTE_TOTAL_FRAMES = totalFrames(SLIDES)
