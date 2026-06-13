import { Link, useLocation } from 'react-router-dom'
import Logo from './Logo'
import LevelBadge from './LevelBadge'

const LINKS = [
  { to: '/dashboard', label: 'Dashboard', icon: '🏠' },
  { to: '/mascota', label: 'Mi mascota', icon: '🐾' },
  { to: '/chats', label: 'Chats', icon: '💬' },
  { to: '/biblioteca', label: 'Biblioteca', icon: '📚' },
  { to: '/tienda', label: 'Tienda', icon: '🛒' },
  { to: '/logros', label: 'Logros', icon: '🏅' },
  { to: '/games', label: 'Games', icon: '🎮' },
  { to: '/ajustes', label: 'Ajustes', icon: '⚙️' },
]

// Persistent navigation bar for the protected app.
// variant="full"   -> dashboard/mascot/profile/etc (default)
// variant="course" -> inside a course: just back-to-dashboard, to avoid
//                      duplicating the mascot menu options.
export default function AppTopBar({ variant = 'full' }) {
  const location = useLocation()

  return (
    <header className="flex items-center justify-between gap-4 border-b border-border bg-surface px-4 py-2.5 md:px-6">
      <Link to="/dashboard" className="shrink-0">
        <Logo />
      </Link>

      {variant === 'course' ? (
        <Link
          to="/dashboard"
          className="flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium text-text-muted transition-colors hover:text-text"
        >
          <span>←</span>
          Volver al Dashboard
        </Link>
      ) : (
        <>
          <nav className="flex items-center gap-1 overflow-x-auto text-sm">
            {LINKS.map((link) => {
              const active = location.pathname === link.to
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 font-medium transition-colors ${
                    active ? 'bg-primary/10 text-primary' : 'text-text-muted hover:text-text'
                  }`}
                >
                  <span>{link.icon}</span>
                  {link.label}
                </Link>
              )
            })}
          </nav>
          <LevelBadge className="shrink-0" />
        </>
      )}
    </header>
  )
}
