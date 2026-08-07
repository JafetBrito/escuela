import { LessonComposition, totalFrames, Slide, Box, Body, TEXT } from '../shared/Lesson.jsx'

// Video-resumen de la clase "Anatomía de un Prompt Perfecto" (course-003,
// módulo id 2). Duraciones en frames = duración real del .wav (30fps) + ~15
// de colchón — medidas con scripts/gen-tts-2.ps1 + el script de duración.
const SLIDES = [
  {
    id: 'anat1',
    audioFile: 'anat1.wav',
    durationFrames: 264,
    render: () => (
      <Slide eyebrow="🧠 Ingeniería de Prompts" title="Anatomía de un Prompt Perfecto">
        <Body>Los 5 elementos que tiene todo prompt poderoso.</Body>
      </Slide>
    ),
  },
  {
    id: 'anat2',
    audioFile: 'anat2.wav',
    durationFrames: 509,
    render: () => (
      <Slide eyebrow="1 de 5" title="🎭 Rol (Persona)">
        <Box kind="example">
          «Eres un oncólogo con 20 años de experiencia explicando diagnósticos a pacientes...»
        </Box>
      </Slide>
    ),
  },
  {
    id: 'anat3',
    audioFile: 'anat3.wav',
    durationFrames: 347,
    render: () => (
      <Slide eyebrow="2 de 5" title="📋 Contexto">
        <Body>La IA no sabe nada de tu situación específica — dale el trasfondo necesario.</Body>
      </Slide>
    ),
  },
  {
    id: 'anat4',
    audioFile: 'anat4.wav',
    durationFrames: 592,
    render: () => (
      <Slide eyebrow="3 y 4 de 5" title="🎯 Tarea + 📏 Formato">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <Box kind="bad">❌ Malo: «Habla sobre marketing»</Box>
          <Box kind="example">✅ Bueno: «Genera 5 ideas de contenido... en formato JSON»</Box>
        </div>
      </Slide>
    ),
  },
  {
    id: 'anat5',
    audioFile: 'anat5.wav',
    durationFrames: 485,
    render: () => (
      <Slide eyebrow="5 de 5 · El framework completo" title="🚧 Restricciones → RCTFS">
        <div
          style={{
            fontFamily: 'monospace',
            fontSize: 26,
            color: TEXT,
            backgroundColor: '#1e293b',
            border: '2px solid #334155',
            borderRadius: 14,
            padding: 24,
            maxWidth: 1400,
          }}
        >
          Rol · Contexto · Tarea · Formato · Sin (restricciones)
        </div>
      </Slide>
    ),
  },
  {
    id: 'anat6',
    audioFile: 'anat6.wav',
    durationFrames: 342,
    render: () => (
      <Slide eyebrow="Cierre" title="Para tareas simples: Tarea + Formato basta">
        <Body>Nos vemos en la siguiente clase 👋</Body>
      </Slide>
    ),
  },
]

export function LeccionAnatomiaPrompt() {
  return <LessonComposition slides={SLIDES} />
}

export const LECCION_ANATOMIA_TOTAL_FRAMES = totalFrames(SLIDES)
