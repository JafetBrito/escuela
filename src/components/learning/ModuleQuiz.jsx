import { useEffect, useState } from 'react'
import { useProgressStore } from '../../stores/useProgressStore'
import { DEV_UNLOCK_ALL } from '../../config/devUnlock'

export default function ModuleQuiz({ courseId, module, className = '' }) {
  const isCompleted = useProgressStore((s) => s.isMissionDone(courseId, module.id, 'quiz'))
  const completeMission = useProgressStore((s) => s.completeMission)

  const [selected, setSelected] = useState(null)
  const [feedback, setFeedback] = useState(isCompleted ? 'correct' : null)

  useEffect(() => {
    setSelected(null)
    setFeedback(isCompleted ? 'correct' : null)
  }, [module.id, isCompleted])

  if (!module.quiz) return null

  // ponytail: en modo prueba, el quiz se muestra como lectura (pregunta +
  // opciones, la correcta marcada) en vez de un formulario que hay que
  // resolver — no bloquea nada, solo evita el paso interactivo.
  if (DEV_UNLOCK_ALL) {
    return (
      <div className={className}>
        <p className="mb-2 text-sm font-semibold text-text">{module.quiz.question}</p>
        <div className="flex flex-col gap-2">
          {module.quiz.options.map((option, i) => (
            <p
              key={i}
              className={`rounded-lg border px-3 py-2 text-sm ${
                i === module.quiz.correctIndex
                  ? 'border-primary/40 bg-primary/5 text-primary'
                  : 'border-border text-text-muted'
              }`}
            >
              {i === module.quiz.correctIndex ? '✅ ' : ''}{option}
            </p>
          ))}
        </div>
      </div>
    )
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (selected === null) return
    if (selected === module.quiz.correctIndex) {
      setFeedback('correct')
      completeMission(courseId, module.id, 'quiz')
    } else {
      setFeedback('incorrect')
    }
  }

  return (
    <div className={className}>
      <p className="mb-2 text-sm font-semibold text-text">{module.quiz.question}</p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        {module.quiz.options.map((option, i) => (
          <label
            key={i}
            className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors ${
              selected === i
                ? 'border-primary text-text'
                : 'border-border text-text-muted hover:border-primary/40'
            }`}
          >
            <input
              type="radio"
              name={`quiz-${module.id}`}
              className="accent-primary"
              checked={selected === i}
              disabled={feedback === 'correct'}
              onChange={() => setSelected(i)}
            />
            {option}
          </label>
        ))}

        {feedback !== 'correct' && (
          <button
            type="submit"
            className="mt-2 self-start rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-background hover:bg-primary-hover"
          >
            Comprobar respuesta
          </button>
        )}
      </form>

      {feedback === 'incorrect' && (
        <p className="mt-2 text-sm text-danger">Respuesta incorrecta, vuelve a intentarlo.</p>
      )}

      {feedback === 'correct' && (
        <p className="mt-3 text-sm text-primary">¡Correcto! Misión completada.</p>
      )}
    </div>
  )
}
