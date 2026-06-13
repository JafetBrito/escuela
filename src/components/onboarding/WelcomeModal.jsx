import { useState } from 'react'
import { getCourseData } from '../../data/courseRegistry'
import MascotViewport from '../mascot/MascotViewport'
import { useProgressStore } from '../../stores/useProgressStore'
import { useMascotStore } from '../../stores/useMascotStore'
import { getMascotById } from '../../data/mascotRegistry'

const PLACEMENT_QUESTIONS = [
  {
    id: 'q1',
    prompt: '¿Has usado antes alguna herramienta de IA para resumir o analizar documentos?',
    options: ['Nunca', 'Alguna vez', 'La uso seguido'],
  },
  {
    id: 'q2',
    prompt: '¿Qué tan cómodo te sientes subiendo archivos a herramientas en la nube?',
    options: ['Nada cómodo', 'Algo cómodo', 'Muy cómodo'],
  },
  {
    id: 'q3',
    prompt: '¿Cuál es tu objetivo principal con este curso?',
    options: ['Estudiar / investigar', 'Trabajo o productividad', 'Solo por curiosidad'],
  },
  {
    id: 'q4',
    prompt: '¿Cómo describirías tu nivel general con herramientas digitales?',
    options: ['Principiante', 'Intermedio', 'Avanzado'],
  },
]

export default function WelcomeModal({ courseId }) {
  const courseData = getCourseData(courseId)
  const onboardingCompleted = useProgressStore((s) => s.isOnboardingCompleted(courseId))
  const completeOnboarding = useProgressStore((s) => s.completeOnboarding)
  const setPlacementTest = useMascotStore((s) => s.setPlacementTest)
  const selectedMascotId = useMascotStore((s) => s.selectedMascotId)
  const mascot = getMascotById(selectedMascotId)

  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState({})

  if (onboardingCompleted) return null

  const totalSteps = 3 + PLACEMENT_QUESTIONS.length
  const isQuestionStep = step >= 3
  const currentQuestion = PLACEMENT_QUESTIONS[step - 3]
  const canAdvance = !isQuestionStep || answers[currentQuestion.id] !== undefined
  const isLastStep = step === totalSteps - 1

  const handleNext = () => {
    if (isLastStep) {
      setPlacementTest({ answers, completedAt: new Date().toISOString() })
      completeOnboarding(courseId)
      return
    }
    setStep((s) => s + 1)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="flex h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-border bg-surface">
        <div className="relative flex h-40 shrink-0 items-center justify-center overflow-hidden bg-gradient-to-br from-primary/30 via-background to-surface sm:h-56">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(152,202,63,0.35),transparent_60%)]" />
          {step === 1 ? (
            <div className="h-32 w-32 sm:h-44 sm:w-44">
              <MascotViewport className="h-full w-full" />
            </div>
          ) : (
            <span className="text-6xl sm:text-8xl">
              {step === 0 && '🎉'}
              {step === 2 && '🧪'}
              {isQuestionStep && '📋'}
            </span>
          )}
        </div>

        <div className="flex flex-1 flex-col overflow-y-auto p-6 sm:p-8">
          <div className="mb-5 flex items-center gap-2">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <span
                key={i}
                className={`h-1.5 flex-1 rounded-full ${i <= step ? 'bg-primary' : 'bg-surface-hover'}`}
              />
            ))}
          </div>

          {step === 0 && (
            <div className="flex flex-col gap-4">
              <h2 className="text-3xl font-bold">¡Gracias por tu compra! 🎉</h2>
              <p className="text-text-muted">
                Bienvenido a <span className="text-text">{courseData.title}</span>.{' '}
                {courseData.description}
              </p>
              <div className="rounded-xl border border-border bg-background p-4">
                <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-text-muted">
                  Lo que vas a recorrer
                </p>
                <ul className="grid gap-1 text-sm text-text-muted sm:grid-cols-2">
                  {courseData.modules.map((m) => (
                    <li key={m.id}>
                      {m.order}. {m.title}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="flex flex-col gap-4">
              <h2 className="text-2xl font-bold">
                Conoce a <span className="text-primary">{mascot.name}</span>
              </h2>
              <p className="text-text-muted">
                Te va a acompañar durante todo el curso, recordará tus avances y se adapta a tu
                ritmo de aprendizaje.
              </p>
            </div>
          )}

          {step === 2 && (
            <div className="flex flex-col gap-4">
              <h2 className="text-2xl font-bold">Así funciona el menú de tu mascota</h2>
              <p className="text-text-muted">
                Tócala en la esquina inferior de la pantalla para abrir su menú con cinco
                secciones:
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-border bg-background p-4">
                  <p className="text-lg">💬 Chat</p>
                  <p className="mt-1 text-sm text-text-muted">
                    Pregúntale cualquier duda sobre la clase actual; tiene contexto del módulo y
                    de tus notas.
                  </p>
                </div>
                <div className="rounded-xl border border-border bg-background p-4">
                  <p className="text-lg">🎒 Objetos</p>
                  <p className="mt-1 text-sm text-text-muted">
                    Items de RPG que otorgan poderes dentro de la plataforma. Los que tienen
                    función se pueden activar y desactivar cuando quieras.
                  </p>
                </div>
                <div className="rounded-xl border border-border bg-background p-4">
                  <p className="text-lg">🏆 Logros</p>
                  <p className="mt-1 text-sm text-text-muted">
                    Medallas que se desbloquean al completar cursos enteros.
                  </p>
                </div>
                <div className="rounded-xl border border-border bg-background p-4">
                  <p className="text-lg">📝 Notas</p>
                  <p className="mt-1 text-sm text-text-muted">
                    Tus notas por clase y un inventario general de notas y links propios.
                  </p>
                </div>
                <div className="rounded-xl border border-border bg-background p-4 sm:col-span-2">
                  <p className="text-lg">🖼️ Galería</p>
                  <p className="mt-1 text-sm text-text-muted">
                    Tus capturas de pantalla tomadas con el objeto Cámara, listas para etiquetar.
                  </p>
                </div>
              </div>
              <p className="text-text-muted">
                Debajo del video encontrarás los recursos de cada clase y tus{' '}
                <span className="text-text">MISIONES</span>: tareas que completas hablando con tu
                mascota y usando tus objetos. Al terminarlas, el botón{' '}
                <span className="text-text">"Siguiente clase"</span> te lleva a la próxima clase
                con una celebración.
              </p>
            </div>
          )}

          {isQuestionStep && currentQuestion && (
            <div className="flex flex-col gap-4">
              <h2 className="text-2xl font-bold">Evaluación rápida</h2>
              <p className="text-text-muted">
                Esto ayuda a tu mascota a adaptar sus explicaciones desde la primera clase.
              </p>
              <p className="text-lg font-semibold text-text">{currentQuestion.prompt}</p>
              <div className="flex flex-col gap-2">
                {currentQuestion.options.map((option) => (
                  <label
                    key={option}
                    className={`flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-3 transition-colors ${
                      answers[currentQuestion.id] === option
                        ? 'border-primary text-text'
                        : 'border-border text-text-muted hover:border-primary/40'
                    }`}
                  >
                    <input
                      type="radio"
                      name={currentQuestion.id}
                      className="accent-primary"
                      checked={answers[currentQuestion.id] === option}
                      onChange={() => setAnswers((a) => ({ ...a, [currentQuestion.id]: option }))}
                    />
                    {option}
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 border-t border-border p-4 sm:p-6">
          <button
            onClick={handleNext}
            disabled={!canAdvance}
            className="rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-background hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLastStep ? 'Comenzar curso' : 'Siguiente'}
          </button>
        </div>
      </div>
    </div>
  )
}
