import { useState } from 'react'
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
  { to: '/vr', label: 'VR', icon: '🕶️' },
  { to: '/ajustes', label: 'Ajustes', icon: '⚙️' },
]

// Persistent navigation bar for the protected app.
// variant="full"   -> dashboard/mascot/profile/etc (default)
// variant="course" -> inside a course: just back-to-dashboard, to avoid
//                      duplicating the mascot menu options.
export default function AppTopBar({ variant = 'full' }) {
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="relative flex items-center justify-between gap-4 border-b border-border bg-surface px-4 py-2.5 md:px-6">
      <Link to="/dashboard" className="shrink-0" onClick={() => setMenuOpen(false)}>
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
          <nav className="hidden flex-1 items-center gap-1 overflow-x-auto text-sm md:flex">
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

          <div className="flex items-center gap-2 md:hidden">
            <LevelBadge className="shrink-0" />
            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              aria-label="Abrir menú"
              aria-expanded={menuOpen}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-lg text-text-muted transition-colors hover:text-text"
            >
              {menuOpen ? '✕' : '☰'}
            </button>
          </div>

          <LevelBadge className="hidden shrink-0 md:flex" />

          {menuOpen && (
            <nav className="absolute left-0 right-0 top-full z-50 flex flex-col gap-1 border-b border-border bg-surface p-3 shadow-lg md:hidden">
              {LINKS.map((link) => {
                const active = location.pathname === link.to
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setMenuOpen(false)}
                    className={`flex items-center gap-2 rounded-lg px-3 py-2 font-medium transition-colors ${
                      active ? 'bg-primary/10 text-primary' : 'text-text-muted hover:text-text'
                    }`}
                  >
                    <span>{link.icon}</span>
                    {link.label}
                  </Link>
                )
              })}
            </nav>
          )}
        </>
      )}
    </header>
  )
}
