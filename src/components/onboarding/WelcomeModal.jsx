import { useEffect, useState } from 'react'
import { getCourseData } from '../../data/courseRegistry'
import MascotViewport from '../mascot/MascotViewport'
import { useProgressStore } from '../../stores/useProgressStore'
import { useMascotStore } from '../../stores/useMascotStore'
import { useAuthStore } from '../../stores/useAuthStore'
import { useSettingsStore } from '../../stores/useSettingsStore'
import { getMascotById } from '../../data/mascotRegistry'
import { getTransport } from '../../services/chat/transports'

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
  const setStudyPlan = useMascotStore((s) => s.setStudyPlan)
  const selectedMascotId = useMascotStore((s) => s.selectedMascotId)
  const mascot = getMascotById(selectedMascotId)
  const license = useAuthStore((s) => s.license)
  const minimaxApiKey = useSettingsStore((s) => s.minimaxApiKey)
  const deepseekApiKey = useSettingsStore((s) => s.deepseekApiKey)
  const chatModel = useSettingsStore((s) => s.chatModel)
  const aiTone = useSettingsStore((s) => s.aiTone)
  const aiVerbosity = useSettingsStore((s) => s.aiVerbosity)
  const temperature = useSettingsStore((s) => s.temperature)
  const maxTokens = useSettingsStore((s) => s.maxTokens)
  const customInstructions = useSettingsStore((s) => s.customInstructions)
  const settingsMascotName = useSettingsStore((s) => s.mascotName)

  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState({})
  const [planStatus, setPlanStatus] = useState('idle') // idle | loading | done
  const [plan, setPlan] = useState('')

  // Courses with a `welcome` block (topic intro + requirements) skip the
  // "how the mascot menu works" explainer — that's covered by the demo
  // course — and instead end with an AI-generated study plan.
  const hasWelcome = !!courseData.welcome
  const placementQuestions = courseData.welcome?.placementQuestions ?? PLACEMENT_QUESTIONS

  const totalSteps = hasWelcome
    ? 1 + placementQuestions.length + 1
    : 3 + placementQuestions.length
  const questionStartStep = hasWelcome ? 1 : 3
  const isQuestionStep =
    step >= questionStartStep && step < questionStartStep + placementQuestions.length
  const currentQuestion = placementQuestions[step - questionStartStep]
  const isPlanStep = hasWelcome && step === totalSteps - 1
  const isLastStep = step === totalSteps - 1

  useEffect(() => {
    if (!isPlanStep || planStatus !== 'idle') return

    setPlanStatus('loading')

    const answersText = placementQuestions.map(
      (q) => `- ${q.prompt} → ${answers[q.id] ?? 'sin respuesta'}`,
    ).join('\n')
    const moduleList = courseData.modules.map((m) => `${m.order}. ${m.title}`).join('\n')
    const content = `Soy un estudiante nuevo en "${courseData.title}". Estas son mis respuestas a la evaluación rápida:\n${answersText}\n\nEl curso tiene estas clases:\n${moduleList}\n\nCon base en mis respuestas, dame un plan de estudio breve, motivador y personalizado (máximo 120 palabras, en español, en formato de lista) indicando en qué debo poner más atención y cómo aprovechar mejor cada clase.`

    getTransport('text')
      .sendMessage({
        mode: 'text',
        content,
        context: {
          minimaxApiKey: minimaxApiKey || license?.minimaxApiKey,
          deepseekApiKey,
          model: chatModel,
          mascotName: settingsMascotName || mascot.name,
          aiTone,
          aiVerbosity,
          temperature,
          maxTokens,
          customInstructions,
          course: { title: courseData.title, instructions: courseData.aiInstructions },
          history: [],
        },
      })
      .then((reply) => {
        setPlan(reply.content)
        setPlanStatus('done')
      })
      .catch(() => {
        setPlan(
          'No pudimos generar tu plan en este momento, pero puedes pedírselo a tu mascota desde el Chat cuando quieras: solo dile "dame mi plan de estudio para este curso".',
        )
        setPlanStatus('done')
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlanStep])

  if (onboardingCompleted) return null

  const canAdvance = isPlanStep
    ? planStatus === 'done'
    : !isQuestionStep || answers[currentQuestion?.id] !== undefined

  const handleNext = () => {
    if (isLastStep) {
      setPlacementTest({ answers, completedAt: new Date().toISOString() })
      if (hasWelcome) setStudyPlan(courseId, plan)
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
          {!hasWelcome && step === 1 ? (
            <div className="h-32 w-32 sm:h-44 sm:w-44">
              <MascotViewport className="h-full w-full" />
            </div>
          ) : (
            <span className="text-6xl sm:text-8xl">
              {step === 0 && '🎉'}
              {!hasWelcome && step === 2 && '🧪'}
              {isQuestionStep && '📋'}
              {isPlanStep && '🧠'}
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

          {step === 0 && hasWelcome && (
            <div className="flex flex-col gap-4">
              <h2 className="text-3xl font-bold">Bienvenido al curso 🎉</h2>
              <p className="text-text-muted">
                <span className="text-text">{courseData.title}</span>. {courseData.welcome.topicIntro}
              </p>
              {courseData.welcome.requirements?.length > 0 && (
                <div className="rounded-xl border border-border bg-background p-4">
                  <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-text-muted">
                    Requisitos para este curso
                  </p>
                  <ul className="flex flex-col gap-1 text-sm text-text-muted">
                    {courseData.welcome.requirements.map((req, i) => (
                      <li key={i}>✓ {req}</li>
                    ))}
                  </ul>
                </div>
              )}
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
              <p className="text-text-muted">
                Antes de empezar, responde una breve evaluación para que tu mascota arme un plan
                de estudio a tu medida.
              </p>
            </div>
          )}

          {step === 0 && !hasWelcome && (
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

          {!hasWelcome && step === 1 && (
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

          {!hasWelcome && step === 2 && (
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
                Esto ayuda a tu mascota a adaptar sus explicaciones y armar tu plan de estudio.
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

          {isPlanStep && (
            <div className="flex flex-col gap-4">
              <h2 className="text-2xl font-bold">Tu plan de estudio personalizado</h2>
              {planStatus === 'loading' && (
                <p className="text-text-muted">
                  Tu mascota está revisando tus respuestas y armando tu plan… 🧠✨
                </p>
              )}
              {planStatus === 'done' && (
                <div className="whitespace-pre-line rounded-xl border border-border bg-background p-4 text-sm text-text">
                  {plan}
                </div>
              )}
              <p className="text-xs text-text-muted">
                Este plan se guarda en la memoria de tu mascota para este curso — no se te
                volverá a pedir esta evaluación.
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 border-t border-border p-4 sm:p-6">
          <button
            onClick={handleNext}
            disabled={!canAdvance}
            className="rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-background hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLastStep
              ? isPlanStep && planStatus !== 'done'
                ? 'Generando plan…'
                : 'Comenzar curso'
              : 'Siguiente'}
          </button>
        </div>
      </div>
    </div>
  )
}
