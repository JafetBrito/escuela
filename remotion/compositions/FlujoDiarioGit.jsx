import { LessonComposition, totalFrames, Slide, Box, Body, TEXT } from '../shared/Lesson.jsx'

// Video "Tu flujo de trabajo diario con Git" (course-git-github, módulo id 15).
// Duraciones medidas con scripts/measure_wav_frames.mjs.
const SLIDES = [
  {
    id: 'gitflow1',
    audioFile: 'gitflow1.wav',
    durationFrames: 355,
    render: () => (
      <Slide eyebrow="🐙 Git y GitHub" title="Tu Flujo de Trabajo Diario con Git">
        <Body>Ya viste cada comando por separado — ahora júntalos en un solo ciclo.</Body>
      </Slide>
    ),
  },
  {
    id: 'gitflow2',
    audioFile: 'gitflow2.wav',
    durationFrames: 284,
    render: () => (
      <Slide eyebrow="1 de 5" title="⬇️ Actualiza tu copia local">
        <div style={{ fontFamily: 'monospace', fontSize: 34, color: '#4ade80', backgroundColor: '#001a08', border: '2px solid #16a34a', borderRadius: 14, padding: 22 }}>
          git pull
        </div>
      </Slide>
    ),
  },
  {
    id: 'gitflow3',
    audioFile: 'gitflow3.wav',
    durationFrames: 323,
    render: () => (
      <Slide eyebrow="2 de 5" title="🌱 Crea tu rama">
        <div style={{ fontFamily: 'monospace', fontSize: 34, color: '#4ade80', backgroundColor: '#001a08', border: '2px solid #16a34a', borderRadius: 14, padding: 22 }}>
          git switch -c mi-tarea
        </div>
      </Slide>
    ),
  },
  {
    id: 'gitflow4',
    audioFile: 'gitflow4.wav',
    durationFrames: 459,
    render: () => (
      <Slide eyebrow="3 de 5" title="💾 Guarda tu progreso">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ fontFamily: 'monospace', fontSize: 30, color: '#4ade80', backgroundColor: '#001a08', border: '2px solid #16a34a', borderRadius: 14, padding: 18 }}>git add .</div>
          <div style={{ fontFamily: 'monospace', fontSize: 30, color: '#4ade80', backgroundColor: '#001a08', border: '2px solid #16a34a', borderRadius: 14, padding: 18 }}>git commit -m "..."</div>
        </div>
        <div style={{ marginTop: 18 }}>
          <Box kind="tip">Commits pequeños y frecuentes, no uno gigante al final del día.</Box>
        </div>
      </Slide>
    ),
  },
  {
    id: 'gitflow5',
    audioFile: 'gitflow5.wav',
    durationFrames: 298,
    render: () => (
      <Slide eyebrow="4 de 5" title="⬆️ Sube y abre un Pull Request">
        <div style={{ fontFamily: 'monospace', fontSize: 34, color: '#4ade80', backgroundColor: '#001a08', border: '2px solid #16a34a', borderRadius: 14, padding: 22 }}>
          git push
        </div>
      </Slide>
    ),
  },
  {
    id: 'gitflow6',
    audioFile: 'gitflow6.wav',
    durationFrames: 391,
    render: () => (
      <Slide eyebrow="5 de 5 · El ciclo completo" title="🔁 pull → rama → commits → push → PR">
        <div
          style={{
            fontFamily: 'monospace',
            fontSize: 26,
            color: TEXT,
            backgroundColor: '#1e293b',
            border: '2px solid #334155',
            borderRadius: 14,
            padding: 24,
            maxWidth: 1500,
          }}
        >
          pull · switch -c · add · commit · push · Pull Request
        </div>
      </Slide>
    ),
  },
  {
    id: 'gitflow7',
    audioFile: 'gitflow7.wav',
    durationFrames: 395,
    render: () => (
      <Slide eyebrow="Cierre" title="Practica hasta que se sienta automático">
        <Body>En un par de semanas de uso real, vas a dejar de pensar en los comandos — simplemente vas a hablar Git.</Body>
      </Slide>
    ),
  },
]

export function FlujoDiarioGit() {
  return <LessonComposition slides={SLIDES} />
}

export const FLUJO_DIARIO_TOTAL_FRAMES = totalFrames(SLIDES)
