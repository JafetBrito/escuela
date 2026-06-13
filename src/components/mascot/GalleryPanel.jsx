import { useGalleryStore } from '../../stores/useGalleryStore'

export default function GalleryPanel() {
  const shots = useGalleryStore((s) => s.shots)
  const updateShotLabel = useGalleryStore((s) => s.updateShotLabel)
  const removeShot = useGalleryStore((s) => s.removeShot)

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-text-muted">
        Capturas guardadas con tu objeto Cámara. Etiquétalas para encontrarlas después.
      </p>

      {shots.length === 0 && (
        <p className="text-sm text-text-muted">
          Aún no tienes capturas. Activa la Cámara en tus Objetos y usa el botón flotante 📸 para
          tomar una.
        </p>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        {shots.map((shot) => (
          <div key={shot.id} className="flex flex-col gap-2 rounded-xl border border-border bg-background p-2">
            <img src={shot.dataUrl} alt={shot.label} className="w-full rounded-lg object-cover" />
            <div className="flex items-center gap-2">
              <input
                value={shot.label}
                onChange={(e) => updateShotLabel(shot.id, e.target.value)}
                placeholder="Etiqueta…"
                className="flex-1 rounded-lg border border-border bg-surface px-2 py-1 text-sm text-text outline-none focus:border-primary"
              />
              <button
                onClick={() => removeShot(shot.id)}
                className="shrink-0 text-text-muted hover:text-danger"
                aria-label="Eliminar captura"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-text-muted">
              {new Date(shot.createdAt).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
