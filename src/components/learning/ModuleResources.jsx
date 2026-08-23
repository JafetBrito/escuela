import { useState } from 'react'

// Modal con la página del recurso embebida en un <iframe> — antes el enlace
// abría en una pestaña nueva y sacaba al alumno de la app; ahora se queda
// adentro. Algunos sitios (bancos, herramientas de seguridad) bloquean ser
// embebidos con X-Frame-Options/CSP — no hay forma de detectarlo desde JS
// (cross-origin), así que siempre se deja también el link "Abrir en pestaña
// nueva ↗" como salida, por si el iframe queda en blanco.
function ResourcePreviewModal({ resource, onClose }) {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div
        className="flex h-[85vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
          <p className="truncate text-sm font-bold text-text">🔗 {resource.label}</p>
          <div className="flex shrink-0 items-center gap-3">
            <a
              href={resource.url}
              target="_blank"
              rel="noreferrer"
              className="text-xs font-semibold text-primary hover:underline"
            >
              Abrir en pestaña nueva ↗
            </a>
            <button
              type="button"
              onClick={onClose}
              className="flex h-7 w-7 items-center justify-center rounded-full text-text-muted hover:bg-surface-hover hover:text-text"
              aria-label="Cerrar"
            >
              ✕
            </button>
          </div>
        </div>
        <iframe src={resource.url} title={resource.label} className="h-full w-full bg-white" />
      </div>
    </div>
  )
}

export default function ModuleResources({ module, className = '' }) {
  const [openResource, setOpenResource] = useState(null)

  return (
    <div className={`flex flex-col rounded-xl border border-border bg-surface p-4 ${className}`}>
      <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-text-muted">
        Recursos de esta clase
      </p>

      <ul className="flex flex-col gap-2 text-sm">
        {module.resources?.length ? (
          module.resources.map((resource, i) => (
            <li key={i}>
              <button
                type="button"
                onClick={() => setOpenResource(resource)}
                className="text-left text-primary hover:underline"
              >
                {resource.label}
              </button>
            </li>
          ))
        ) : (
          <li className="text-text-muted">Aún no hay recursos para esta clase.</li>
        )}
      </ul>

      {module.missions && (
        <p className="mt-4 text-xs text-text-muted">
          Tus MISIONES de esta clase están en el menú de tu mascota (🎯 Misiones).
        </p>
      )}

      {openResource && (
        <ResourcePreviewModal resource={openResource} onClose={() => setOpenResource(null)} />
      )}
    </div>
  )
}
