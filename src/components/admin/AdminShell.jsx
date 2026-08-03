import { NavLink } from 'react-router-dom'
import AppTopBar from '../shared/AppTopBar'

// Riel lateral del panel admin unificado — hoy solo envuelve las páginas
// NUEVAS (/admin, /admin/alumnos/:id, /admin/comandos). Las 6 páginas admin
// ya existentes (Tareas/Proyectos/Clases/Exámenes/Podcasts/Setup) siguen con
// su propio <AppTopBar/> tal cual, solo enlazadas desde aquí — envolverlas
// también en este riel es el "siguiente paso natural" para otra pasada, no
// se hace ahora para no arriesgar 6 páginas ya funcionando.
const SECTIONS = [
  { to: '/admin', icon: '🏠', label: 'Resumen', end: true },
  { to: '/admin/cursos', icon: '📚', label: 'Cursos' },
  { to: '/admin/tareas', icon: '📋', label: 'Tareas' },
  { to: '/admin/proyectos', icon: '📁', label: 'Proyectos' },
  { to: '/admin/clases', icon: '🎓', label: 'Clases en vivo' },
  { to: '/admin/examenes', icon: '📝', label: 'Exámenes' },
  { to: '/admin/trivia', icon: '🎯', label: 'Trivia' },
  { to: '/admin/podcasts', icon: '🎙️', label: 'Podcasts' },
  { to: '/admin/comandos', icon: '🕹️', label: 'Comandos' },
  { to: '/admin-setup', icon: '⚙️', label: 'Configuración' },
]

export default function AdminShell({ children }) {
  return (
    <div className="flex min-h-screen flex-col bg-background text-text">
      <AppTopBar />
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-6 md:flex-row md:px-8">
        <nav className="flex shrink-0 gap-1.5 overflow-x-auto md:w-52 md:flex-col md:overflow-visible">
          {SECTIONS.map((s) => (
            <NavLink
              key={s.to}
              to={s.to}
              end={s.end}
              className={({ isActive }) =>
                `flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-semibold transition-colors ${
                  isActive ? 'bg-primary text-background' : 'text-text-muted hover:bg-surface'
                }`
              }
            >
              <span>{s.icon}</span> {s.label}
            </NavLink>
          ))}
        </nav>
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  )
}
