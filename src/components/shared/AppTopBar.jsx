import { useState, useRef, useEffect, useCallback } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import Logo from './Logo'
import VersionBadge from './VersionBadge'
import { useAuthStore } from '../../stores/useAuthStore'
import { useMascotStore } from '../../stores/useMascotStore'

const GROUPS = [
  {
    id: 'academia',
    label: 'Academia',
    icon: '🎓',
    items: [
      { to: '/notas',      label: 'Notas',    icon: '📝' },
      { to: '/biblioteca', label: 'Librería', icon: '📚' },
    ],
  },
  {
    id: 'progreso',
    label: 'Progreso',
    icon: '🛡️',
    items: [
      { to: '/mascota',  label: 'Mi Equipo', icon: '⚔️' },
      { to: '/arbol',    label: 'Árbol',     icon: '🌳' },
      { to: '/misiones', label: 'Misiones',  icon: '📜' },
      { to: '/logros',   label: 'Logros',    icon: '🏅' },
    ],
  },
  {
    id: 'campus',
    label: 'Campus',
    icon: '🌍',
    items: [
      { to: '/vr',    label: 'VR',    icon: '🕶️' },
      { to: '/vr/graffiti', label: 'Calle Graffiti', icon: '🎨' },
      { to: '/games', label: 'Games', icon: '🎮' },
      { to: '/arena', label: 'Arena', icon: '⚔️' },
    ],
  },
  {
    id: 'comunidad',
    label: 'Comunidad',
    icon: '💬',
    items: [
      { to: '/amigos', label: 'Amigos', icon: '👥' },
      { to: '/chats',  label: 'Chats',  icon: '💬' },
    ],
  },
]

const MASCOT_EMOJI = { orange_cat: '🐱', black_cat: '🐈‍⬛', robot: '🤖', dragon: '🐉', bunny: '🐰', fox: '🦊' }

// Persistent navigation bar for the protected app.
// variant="full"   -> dashboard/mascot/profile/etc (default)
// variant="course" -> inside a course: just back-to-dashboard
export default function AppTopBar({ variant = 'full' }) {
  const location = useLocation()
  const navigate = useNavigate()
  const session = useAuthStore((s) => s.session)
  const profile = useAuthStore((s) => s.profile)
  const signOut = useAuthStore((s) => s.signOut)
  const mascotId = useMascotStore((s) => s.mascot)

  const [openMenu, setOpenMenu] = useState(null) // null | group.id | 'profile'
  const [mobileOpen, setMobileOpen] = useState(false)
  const closeTimer = useRef(null)
  const navRef = useRef(null)

  const displayName = profile?.display_name || session?.user?.email?.split('@')[0] || 'Usuario'
  const avatarEmoji = MASCOT_EMOJI[mascotId] ?? '👤'

  const open = useCallback((id) => {
    clearTimeout(closeTimer.current)
    setOpenMenu(id)
  }, [])

  const scheduleClose = useCallback(() => {
    closeTimer.current = setTimeout(() => setOpenMenu(null), 160)
  }, [])

  const closeAll = useCallback(() => {
    clearTimeout(closeTimer.current)
    setOpenMenu(null)
    setMobileOpen(false)
  }, [])

  useEffect(() => {
    const handler = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) setOpenMenu(null)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleSignOut = async () => {
    closeAll()
    await signOut()
    navigate('/')
  }

  const isGroupActive = (group) => group.items.some((item) => location.pathname === item.to)

  if (variant === 'course') {
    return (
      <header className="flex items-center justify-between gap-4 border-b border-border bg-surface px-4 py-2.5 md:px-6">
        <div className="flex shrink-0 items-center gap-2">
          <Link to="/dashboard" className="flex items-center gap-1.5">
            <Logo />
            <span aria-hidden="true">🐱</span>
          </Link>
          <VersionBadge />
        </div>
        <Link
          to="/dashboard"
          className="flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium text-text-muted transition-colors hover:text-text"
        >
          ← Volver al Dashboard
        </Link>
      </header>
    )
  }

  return (
    <header
      ref={navRef}
      className="relative flex items-center justify-between gap-2 border-b border-border bg-surface px-4 py-2 md:px-5"
    >
      {/* Logo */}
      <div className="flex shrink-0 items-center gap-2">
        <Link to="/dashboard" onClick={closeAll} className="flex items-center gap-1.5">
          <Logo />
          <span aria-hidden="true">🐱</span>
        </Link>
        <VersionBadge />
      </div>

      {/* ── Desktop nav ─────────────────────────────────────── */}
      <nav className="hidden flex-1 items-center gap-0.5 text-sm md:flex">
        {/* Dashboard — direct link */}
        <Link
          to="/dashboard"
          onClick={closeAll}
          className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 font-medium transition-colors ${
            location.pathname === '/dashboard'
              ? 'bg-primary/10 text-primary'
              : 'text-text-muted hover:text-text'
          }`}
        >
          🏠 Dashboard
        </Link>

        {/* Dropdown groups */}
        {GROUPS.map((group) => {
          const active = isGroupActive(group)
          const isOpen = openMenu === group.id
          return (
            <div
              key={group.id}
              className="relative"
              onMouseEnter={() => open(group.id)}
              onMouseLeave={scheduleClose}
            >
              <button
                type="button"
                onClick={() => (isOpen ? setOpenMenu(null) : open(group.id))}
                className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 font-medium transition-colors ${
                  active || isOpen
                    ? 'bg-primary/10 text-primary'
                    : 'text-text-muted hover:text-text'
                }`}
              >
                {group.icon} {group.label}
                <span
                  className="ml-0.5 text-[10px] transition-transform duration-150"
                  style={{ display: 'inline-block', transform: isOpen ? 'rotate(180deg)' : 'none' }}
                >
                  ▾
                </span>
              </button>

              {isOpen && (
                <div
                  className="nav-dropdown absolute left-0 top-full z-50 mt-1.5 min-w-[11rem] overflow-hidden rounded-xl border border-border/60 bg-surface/95 p-1.5 shadow-2xl backdrop-blur-md"
                  onMouseEnter={() => open(group.id)}
                  onMouseLeave={scheduleClose}
                >
                  {group.items.map((item) => {
                    const itemActive = location.pathname === item.to
                    return (
                      <Link
                        key={item.to}
                        to={item.to}
                        onClick={closeAll}
                        className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                          itemActive
                            ? 'bg-primary/10 text-primary'
                            : 'text-text-muted hover:bg-primary/5 hover:text-text'
                        }`}
                      >
                        <span>{item.icon}</span>
                        {item.label}
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}

        {/* Tienda — direct link */}
        <Link
          to="/tienda"
          onClick={closeAll}
          className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 font-medium transition-colors ${
            location.pathname === '/tienda'
              ? 'bg-primary/10 text-primary'
              : 'text-text-muted hover:text-text'
          }`}
        >
          🛒 Tienda
        </Link>
      </nav>

      {/* ── Profile dropdown (desktop, right side) ──────────── */}
      <div
        className="relative hidden md:block"
        onMouseEnter={() => open('profile')}
        onMouseLeave={scheduleClose}
      >
        <button
          type="button"
          onClick={() => (openMenu === 'profile' ? setOpenMenu(null) : open('profile'))}
          className="flex items-center gap-2 rounded-xl border border-border/50 bg-surface-hover px-3 py-1.5 text-sm font-medium text-text-muted transition-colors hover:border-border hover:text-text"
        >
          <span>{avatarEmoji}</span>
          <span className="max-w-[6rem] truncate">{displayName}</span>
          <span
            className="text-[10px] transition-transform duration-150"
            style={{ display: 'inline-block', transform: openMenu === 'profile' ? 'rotate(180deg)' : 'none' }}
          >
            ▾
          </span>
        </button>

        {openMenu === 'profile' && (
          <div
            className="nav-dropdown absolute right-0 top-full z-50 mt-1.5 min-w-[10rem] overflow-hidden rounded-xl border border-border/60 bg-surface/95 p-1.5 shadow-2xl backdrop-blur-md"
            onMouseEnter={() => open('profile')}
            onMouseLeave={scheduleClose}
          >
            <Link
              to="/ajustes"
              onClick={closeAll}
              className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                location.pathname === '/ajustes'
                  ? 'bg-primary/10 text-primary'
                  : 'text-text-muted hover:bg-primary/5 hover:text-text'
              }`}
            >
              ⚙️ Ajustes
            </Link>
            <hr className="my-1 border-border/40" />
            <button
              type="button"
              onClick={handleSignOut}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/10 hover:text-red-300"
            >
              🚪 Cerrar sesión
            </button>
          </div>
        )}
      </div>

      {/* ── Mobile hamburger ────────────────────────────────── */}
      <button
        type="button"
        onClick={() => setMobileOpen((o) => !o)}
        aria-label="Abrir menú"
        aria-expanded={mobileOpen}
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-lg text-text-muted transition-colors hover:text-text md:hidden"
      >
        {mobileOpen ? '✕' : '☰'}
      </button>

      {/* ── Mobile full menu ────────────────────────────────── */}
      {mobileOpen && (
        <nav className="absolute left-0 right-0 top-full z-50 flex max-h-[80dvh] flex-col gap-0.5 overflow-y-auto border-b border-border bg-surface/98 p-3 shadow-xl backdrop-blur-sm md:hidden">
          <Link
            to="/dashboard"
            onClick={closeAll}
            className={`flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
              location.pathname === '/dashboard' ? 'bg-primary/10 text-primary' : 'text-text-muted hover:text-text'
            }`}
          >
            🏠 Dashboard
          </Link>

          {GROUPS.map((group) => (
            <div key={group.id} className="mt-1">
              <div className="px-3 pb-0.5 pt-1 text-[10px] font-bold uppercase tracking-widest text-text-muted/50">
                {group.icon} {group.label}
              </div>
              {group.items.map((item) => {
                const active = location.pathname === item.to
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={closeAll}
                    className={`flex items-center gap-2 rounded-lg px-5 py-2 text-sm font-medium transition-colors ${
                      active ? 'bg-primary/10 text-primary' : 'text-text-muted hover:text-text'
                    }`}
                  >
                    <span>{item.icon}</span>
                    {item.label}
                  </Link>
                )
              })}
            </div>
          ))}

          <Link
            to="/tienda"
            onClick={closeAll}
            className={`mt-1 flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
              location.pathname === '/tienda' ? 'bg-primary/10 text-primary' : 'text-text-muted hover:text-text'
            }`}
          >
            🛒 Tienda
          </Link>

          <hr className="my-1.5 border-border/30" />

          <Link
            to="/ajustes"
            onClick={closeAll}
            className={`flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
              location.pathname === '/ajustes' ? 'bg-primary/10 text-primary' : 'text-text-muted hover:text-text'
            }`}
          >
            ⚙️ Ajustes
          </Link>
          <button
            type="button"
            onClick={handleSignOut}
            className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/10 hover:text-red-300"
          >
            🚪 Cerrar sesión
          </button>
        </nav>
      )}
    </header>
  )
}
