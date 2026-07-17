const STATUS_STYLE = {
  en_progreso: { label: 'En progreso', cls: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
  completado:  { label: 'Completado',  cls: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
}

// Tarjeta de proyecto reutilizada por ProjectsPage (alumno) y
// AdminProjectsPage — mismo componente, `showOwner` agrega el nombre del
// alumno dueño (vista "(todos)" del admin).
export default function ProjectCard({ project, showOwner = false, onClick }) {
  const status = STATUS_STYLE[project.status] ?? STATUS_STYLE.en_progreso
  const isAssigned = project.assigned_by && project.assigned_by !== project.student_id

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col items-start gap-2 rounded-2xl border border-border bg-surface p-4 text-left transition-colors hover:border-primary/50 hover:bg-surface-hover"
    >
      <div className="flex w-full items-start justify-between gap-2">
        <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${status.cls}`}>{status.label}</span>
        {isAssigned && (
          <span className="rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
            🎓 Asignado
          </span>
        )}
      </div>

      {showOwner && project.profiles && (
        <p className="text-xs font-bold text-primary">{project.profiles.display_name || project.profiles.email}</p>
      )}

      <p className="font-bold text-text line-clamp-1">📁 {project.title}</p>
      {project.description && (
        <p className="text-sm text-text-muted line-clamp-2">{project.description}</p>
      )}

      <p className="mt-auto text-[11px] text-text-muted/60">
        Actualizado {new Date(project.updated_at).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}
      </p>
    </button>
  )
}
