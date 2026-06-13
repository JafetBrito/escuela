export default function ModuleResources({ module, className = '' }) {
  return (
    <div className={`flex flex-col rounded-xl border border-border bg-surface p-4 ${className}`}>
      <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-text-muted">
        Recursos de esta clase
      </p>

      <ul className="flex flex-col gap-2 text-sm">
        {module.resources?.length ? (
          module.resources.map((resource, i) => (
            <li key={i}>
              <a
                href={resource.url}
                target="_blank"
                rel="noreferrer"
                className="text-primary hover:underline"
              >
                {resource.label}
              </a>
            </li>
          ))
        ) : (
          <li className="text-text-muted">Aún no hay recursos para esta clase.</li>
        )}
      </ul>

      <p className="mt-4 text-xs text-text-muted">
        Tus MISIONES de esta clase están en el menú de tu mascota (🎯 Misiones).
      </p>
    </div>
  )
}
