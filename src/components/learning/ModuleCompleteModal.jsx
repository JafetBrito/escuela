// Celebration popup shown after completing all MISIONES of a module, with a
// preview of what's coming up in the next class.
export default function ModuleCompleteModal({ completedModule, nextModule, onContinue, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 text-center">
        <p className="text-5xl">🎉</p>
        <h2 className="mt-2 text-xl font-bold text-text">¡Misiones completadas!</h2>
        <p className="mt-1 text-sm text-text-muted">
          Terminaste "{completedModule.title}". Tu mascota guardó tu progreso.
        </p>

        {nextModule ? (
          <div className="mt-4 rounded-xl border border-border bg-background p-4 text-left">
            <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
              Siguiente clase
            </p>
            <p className="mt-1 text-base font-bold text-text">{nextModule.title}</p>
            <p className="mt-1 text-sm text-text-muted">{nextModule.description}</p>
          </div>
        ) : (
          <div className="mt-4 rounded-xl border border-border bg-background p-4">
            <p className="text-sm text-text-muted">
              ¡Completaste todo el curso! Revisa tu medalla en la sección de Logros de tu mascota.
            </p>
          </div>
        )}

        <div className="mt-5 flex justify-center gap-2">
          {nextModule ? (
            <>
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
            </>
          ) : (
            <button
              onClick={onClose}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-background hover:bg-primary-hover"
            >
              Genial
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
