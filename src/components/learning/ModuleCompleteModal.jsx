import { useNavigate } from 'react-router-dom'

// Celebration popup shown after completing all MISIONES of a module, with a
// preview of what's coming up in the next class. When there's no next module
// (course finished), shows a bigger "fin de curso" screen with the medal and
// rewards earned.
export default function ModuleCompleteModal({
  completedModule,
  nextModule,
  courseTitle,
  onContinue,
  onClose,
}) {
  const navigate = useNavigate()

  if (!nextModule) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
        <div className="w-full max-w-lg rounded-2xl border border-primary/40 bg-surface p-6 text-center shadow-xl">
          <p className="text-6xl">🏆</p>
          <h2 className="mt-2 text-2xl font-bold text-text">¡Curso completado!</h2>
          <p className="mt-1 text-sm text-text-muted">
            Terminaste "{completedModule.title}" y completaste todas las clases de
            {courseTitle ? ` "${courseTitle}"` : ' este curso'}. ¡Felicidades!
          </p>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-border bg-background p-4 text-left">
              <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
                Medalla obtenida
              </p>
              <p className="mt-1 text-base font-bold text-text">🏅 Curso completado</p>
              <p className="mt-1 text-sm text-text-muted">Revísala en Logros.</p>
            </div>
            <div className="rounded-xl border border-border bg-background p-4 text-left">
              <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
                Recompensa
              </p>
              <p className="mt-1 text-base font-bold text-text">✨ +500 XP de bono</p>
              <p className="mt-1 text-sm text-text-muted">Súmalo a tu nivel y experiencia.</p>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap justify-center gap-2">
            <button
              onClick={onClose}
              className="rounded-lg border border-border px-4 py-2 text-sm text-text-muted hover:text-text"
            >
              Quedarme aquí
            </button>
            <button
              onClick={() => navigate('/logros')}
              className="rounded-lg border border-primary px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/10"
            >
              Ver mis logros
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-background hover:bg-primary-hover"
            >
              Volver al Dashboard
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 text-center">
        <p className="text-5xl">🎉</p>
        <h2 className="mt-2 text-xl font-bold text-text">¡Misiones completadas!</h2>
        <p className="mt-1 text-sm text-text-muted">
          Terminaste "{completedModule.title}". Tu mascota guardó tu progreso.
        </p>

        <div className="mt-4 rounded-xl border border-border bg-background p-4 text-left">
          <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
            Siguiente clase
          </p>
          <p className="mt-1 text-base font-bold text-text">{nextModule.title}</p>
          <p className="mt-1 text-sm text-text-muted">{nextModule.description}</p>
        </div>

        <div className="mt-5 flex justify-center gap-2">
          <button
            onClick={onClose}
            className="rounded-lg border border-border px-4 py-2 text-sm text-text-muted hover:text-text"
          >
            Quedarme aquí
          </button>
          <button
            onClick={onContinue}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-background hover:bg-primary-hover"
          >
            Ir a la siguiente clase →
          </button>
        </div>
      </div>
    </div>
  )
}
