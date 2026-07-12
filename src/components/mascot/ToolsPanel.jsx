import { Link } from 'react-router-dom'

// Pestaña TOOLS del menú de mascota (cursos). Herramientas relevantes al curso,
// data-driven por courseId. Para Bash: la terminal de práctica interactiva.
// Fallback: herramientas generales de la plataforma.
const COURSE_TOOLS = {
  'course-bash': [
    { icon: '🖥️', label: 'Terminal de práctica', desc: 'Prueba comandos en un Bash real, sin salir del curso.', to: '/games/bash-terminal' },
  ],
}

const GENERAL_TOOLS = [
  { icon: '🤖', label: 'IA Tools', desc: 'Asistentes y utilidades de inteligencia artificial.', to: '/ia' },
  { icon: '🔧', label: 'Herramientas', desc: 'Caja de herramientas general de la plataforma.', to: '/herramientas' },
]

function ToolCard({ tool }) {
  return (
    <Link
      to={tool.to}
      className="flex items-center gap-3 rounded-xl border border-border bg-background p-3 transition-colors hover:border-primary/40 hover:bg-surface-hover"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-xl">{tool.icon}</span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold text-text">{tool.label}</p>
        <p className="text-[11px] text-text-muted">{tool.desc}</p>
      </div>
      <span className="text-primary">→</span>
    </Link>
  )
}

export default function ToolsPanel({ courseId }) {
  const courseTools = COURSE_TOOLS[courseId] ?? []
  return (
    <div className="flex flex-col gap-4">
      {courseTools.length > 0 && (
        <div>
          <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-text-muted">Herramientas del curso</p>
          <div className="flex flex-col gap-2">
            {courseTools.map((t) => <ToolCard key={t.to} tool={t} />)}
          </div>
        </div>
      )}
      <div>
        <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-text-muted">Generales</p>
        <div className="flex flex-col gap-2">
          {GENERAL_TOOLS.map((t) => <ToolCard key={t.to} tool={t} />)}
        </div>
      </div>
    </div>
  )
}
