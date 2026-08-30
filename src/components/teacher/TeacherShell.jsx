import { NavLink } from 'react-router-dom'
import AppTopBar from '../shared/AppTopBar'
import { useAuthStore } from '../../stores/useAuthStore'

// Riel del panel de profesor — mismo espíritu que AdminShell.jsx pero mucho
// más chico (3 páginas, no 11): Dashboard/Reflexiones/Mi Perfil. Reutilizado
// por las 3 páginas de profesor que sí requieren sesión de profesor
// (TeacherPublicProfilePage.jsx NO usa este shell — es pública, cualquier
// alumno logueado la ve).
const SECTIONS = [
  { to: '/profesor', icon: '🏠', label: 'Dashboard', end: true },
  { to: '/profesor/reflexiones', icon: '📥', label: 'Reflexiones' },
  { to: '/profesor/perfil', icon: '🧑‍🏫', label: 'Mi Perfil' },
]

export default function TeacherShell({ children }) {
  const isTeacher = useAuthStore((s) => s.isTeacher)

  if (!isTeacher?.()) {
    return (
      <div className="flex min-h-screen flex-col bg-background text-text">
        <AppTopBar />
        <div className="flex flex-1 items-center justify-center">
          <p className="text-text-muted">Acceso restringido a profesores.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-text">
      <AppTopBar />
      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-6 md:flex-row md:px-8">
        <nav className="flex shrink-0 gap-1.5 overflow-x-auto md:w-48 md:flex-col md:overflow-visible">
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
