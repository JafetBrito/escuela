import { useState, useRef, useEffect, useCallback } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import Logo from './Logo'
import VersionBadge from './VersionBadge'
import { useAuthStore } from '../../stores/useAuthStore'
import { useMascotStore } from '../../stores/useMascotStore'
import { useI18n, SUPPORTED_LANGUAGES, LANGUAGE_NAMES } from '../../i18n'
import NotificationBell from './NotificationBell'
import RecruiterMode from './RecruiterMode'

// `key` maps each group/item to its translation key in src/i18n/locales
// (nav.groups.<key> / nav.items.<key>). `label` stays as the Spanish fallback
// used if a key is ever missing.
const GROUPS = [
  {
    id: 'academia',
    key: 'academia',
    label: 'Academia',
    icon: '🎓',
    items: [
      { to: '/mis-clases',   key: 'misClases',    label: 'Mis Clases',   icon: '🎓' },
      { to: '/clases-disponibles', key: 'clasesDisponibles', label: 'Clases Disponibles', icon: '🎬' },
      { to: '/clase-online', key: 'claseOnline',  label: 'Clase Online', icon: '📺' },
      { to: '/horario',      key: 'horario',      label: 'Horario',      icon: '🗓️' },
      { to: '/notas',        key: 'notas',        label: 'Notas',        icon: '📝' },
      { to: '/biblioteca',   key: 'biblioteca',   label: 'Librería',     icon: '📚' },
      { to: '/guias',        key: 'guias',        label: 'Guías',        icon: '📖' },
      { to: '/ia',           key: 'ia',           label: 'IA Tools',     icon: '🤖' },
      { to: '/herramientas', key: 'herramientas', label: 'Herramientas', icon: '🔧' },
      { to: '/anuncios',     key: 'anuncios',     label: 'Anuncios',     icon: '📋' },
      { to: '/cerebro',      key: 'cerebro',      label: 'Segundo Cerebro', icon: '🧠' },
      { to: '/podcasts',     key: 'podcasts',     label: 'Podcasts',     icon: '🎙️' },
    ],
  },
  {
    id: 'progreso',
    key: 'progreso',
    label: 'Progreso',
    icon: '🛡️',
    items: [
      { to: '/mis-tareas', key: 'misTareas', label: 'Mis Tareas', icon: '📋' },
      { to: '/proyectos',  key: 'proyectos', label: 'Proyectos',  icon: '📁' },
      { to: '/examenes',   key: 'examenes',  label: 'Exámenes',   icon: '📝' },
      { to: '/logros',    key: 'logros',    label: 'Logros',    icon: '🏅' },
    ],
  },
  {
    id: 'campus',
    key: 'campus',
    label: 'Campus',
    icon: '🌍',
    items: [
      { to: '/vr',    key: 'vr',    label: 'Campus VR', icon: '🕶️', hideFor: ['kids', 'seniors'] },
      { to: '/mundo', key: 'mundo', label: 'Mundo 2D',  icon: '📱', hideFor: ['kids', 'seniors'] },
      { to: '/rol',   key: 'rol',   label: 'Mundo ROL', icon: '🎲', hideFor: ['kids', 'seniors'] },
    ],
  },
  {
    id: 'juegos',
    key: 'juegos',
    label: 'Juegos',
    icon: '🎮',
    items: [
      { to: '/mascota',  key: 'mascota',  label: 'Mi Equipo', icon: '⚔️', hideFor: ['kids', 'seniors'] },
      { to: '/arbol',    key: 'arbol',    label: 'Árbol',     icon: '🌳', hideFor: ['kids', 'seniors'] },
      { to: '/misiones', key: 'misiones', label: 'Misiones',  icon: '📜', hideFor: ['kids', 'seniors'] },
      { to: '/games',    key: 'games',    label: 'Games',     icon: '🎮', hideFor: ['seniors'] },
      { to: '/arena',    key: 'arena',    label: 'Arena',     icon: '⚔️', hideFor: ['kids', 'seniors'] },
      { to: '/tienda',   key: 'tienda',   label: 'Tienda',    icon: '🛒' },
    ],
  },
  {
    id: 'comunidad',
    key: 'comunidad',
    label: 'Comunidad',
    icon: '💬',
    items: [
      { to: '/amigos', key: 'amigos', label: 'Amigos', icon: '👥', hideFor: ['kids'] },
      { to: '/chats',  key: 'chats',  label: 'Chats',  icon: '💬', hideFor: ['kids'] },
    ],
  },
]

// Filtra los items de un GROUPS por perfil de edad (profiles.age_profile,
// asignado por el admin) — un item con hideFor:['kids'] desaparece para esa
// cuenta, tanto del menú de escritorio como del de móvil (mismo array, dos
// sitios de render). Si un grupo se queda sin items visibles, se omite todo
// el grupo entero (evita un submenú vacío, ej. "Comunidad" para niños).
function visibleGroupsFor(ageProfile) {
  return GROUPS
    .map((g) => ({ ...g, items: g.items.filter((item) => !item.hideFor?.includes(ageProfile)) }))
    .filter((g) => g.items.length > 0)
}

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
  const { t, lang, setLang } = useI18n()
  const visibleGroups = visibleGroupsFor(profile?.age_profile)
  // "Script Kiddies" bajo el logo cuando el admin asignó el perfil de edad
  // "niños" (profiles.age_profile) — puramente decorativo, pedido así por el
  // usuario.
  const logoTagline = profile?.age_profile === 'kids' ? 'Script Kiddies' : null

  const [openMenu, setOpenMenu] = useState(null) // null | group.id | 'profile'
  const [mobileOpen, setMobileOpen] = useState(false)
  // Menú móvil como acordeón — antes mostraba los 5 grupos siempre
  // desplegados (~30 filas de golpe, "demasiados elementos" según feedback
  // del usuario). Ahora solo un grupo puede estar abierto a la vez; al abrir
  // el menú, se auto-expande el grupo de la página donde ya estás.
  const [expandedGroupId, setExpandedGroupId] = useState(null)
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

  // Al abrir el menú móvil, auto-expande el grupo de la página actual (si
  // hay uno) en vez de dejar todo cerrado o todo abierto.
  useEffect(() => {
    if (!mobileOpen) return
    setExpandedGroupId(visibleGroups.find((g) => isGroupActive(g))?.id ?? null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mobileOpen])

  if (variant === 'course') {
    return (
      <>
      <RecruiterMode />
      <header className="flex items-center justify-between gap-2 border-b border-border bg-surface px-3 py-2 md:gap-4 md:px-6 md:py-2.5">
        <div className="flex min-w-0 shrink-0 items-center gap-1.5">
          <Link to="/dashboard" className="flex min-w-0 items-center gap-1">
            <Logo className="text-base sm:text-xl" tagline={logoTagline} />
            <span aria-hidden="true" className="hidden sm:inline">🐱</span>
          </Link>
          <VersionBadge />
        </div>
        <Link
          to="/dashboard"
          className="flex shrink-0 items-center gap-1 whitespace-nowrap rounded-lg px-2 py-1 text-xs font-medium text-text-muted transition-colors hover:text-text sm:px-3 sm:py-1.5 sm:text-sm"
        >
          {t('nav.backToDashboard')}
        </Link>
      </header>
      </>
    )
  }

  return (
    <>
    <RecruiterMode />
    <header
      ref={navRef}
      className="relative flex items-center justify-between gap-2 border-b border-border bg-surface px-4 py-2 md:px-5"
    >
      {/* Logo */}
      <div className="flex shrink-0 items-center gap-2">
        <Link to="/dashboard" onClick={closeAll} className="flex items-center gap-1.5">
          <Logo tagline={logoTagline} />
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

        {/* Academias — Escuelas + Academia de Idiomas + Ciberseguridad, unificadas en un solo link */}
        <Link
          to="/academias"
          onClick={closeAll}
          className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 font-medium transition-colors ${
            location.pathname.startsWith('/academia') || location.pathname.startsWith('/escuela')
              ? 'bg-primary/10 text-primary'
              : 'text-text-muted hover:text-text'
          }`}
        >
          🏫 {t('nav.items.academias')}
        </Link>

        {/* Dropdown groups */}
        {visibleGroups.map((group) => {
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
                {group.icon} {t(`nav.groups.${group.key}`)}
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
                        {t(`nav.items.${item.key}`)}
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}

        {/* Buscar — direct link */}
        <Link
          to="/buscar"
          onClick={closeAll}
          title={t('nav.items.buscar')}
          className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 font-medium transition-colors ${
            location.pathname === '/buscar'
              ? 'bg-primary/10 text-primary'
              : 'text-text-muted hover:text-text'
          }`}
        >
          🔍
        </Link>
      </nav>

      {/* ── Notificaciones (desktop) ─────────────────────────── */}
      <div className="hidden md:block">
        <NotificationBell />
      </div>

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
              ⚙️ {t('nav.profile.settings')}
            </Link>
            <div className="flex items-center gap-2 px-3 py-2 text-sm text-text-muted">
              <span>🌐 {t('nav.profile.language')}</span>
              <select
                value={lang}
                onChange={(e) => setLang(e.target.value)}
                className="ml-auto rounded-md border border-border/60 bg-surface px-1.5 py-0.5 text-xs text-text outline-none focus:border-primary"
              >
                {SUPPORTED_LANGUAGES.map((code) => (
                  <option key={code} value={code}>{LANGUAGE_NAMES[code] ?? code}</option>
                ))}
              </select>
            </div>
            <hr className="my-1 border-border/40" />
            <button
              type="button"
              onClick={handleSignOut}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/10 hover:text-red-300"
            >
              🚪 {t('nav.profile.signOut')}
            </button>
          </div>
        )}
      </div>

      {/* ── Notificaciones (móvil, siempre visible junto al hamburguesa —
          nunca escondidas dentro del menú desplegable) ─────────────────── */}
      <div className="md:hidden">
        <NotificationBell />
      </div>

      {/* ── Mobile hamburger ────────────────────────────────── */}
      <button
        type="button"
        onClick={() => setMobileOpen((o) => !o)}
        aria-label={t('nav.openMenu')}
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

          <Link
            to="/academias"
            onClick={closeAll}
            className={`flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
              location.pathname.startsWith('/academia') || location.pathname.startsWith('/escuela') ? 'bg-primary/10 text-primary' : 'text-text-muted hover:text-text'
            }`}
          >
            🏫 {t('nav.items.academias')}
          </Link>

          {visibleGroups.map((group) => {
            const isExpanded = expandedGroupId === group.id
            const groupActive = isGroupActive(group)
            return (
              <div key={group.id} className="mt-0.5 border-t border-border/30 first:border-t-0 first:mt-1">
                <button
                  type="button"
                  onClick={() => setExpandedGroupId((id) => (id === group.id ? null : group.id))}
                  aria-expanded={isExpanded}
                  className={`flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-sm font-bold transition-colors ${
                    groupActive ? 'text-primary' : 'text-text-muted hover:text-text'
                  }`}
                >
                  <span className="flex items-center gap-2">{group.icon} {t(`nav.groups.${group.key}`)}</span>
                  <span
                    className="text-[10px] transition-transform duration-150"
                    style={{ display: 'inline-block', transform: isExpanded ? 'rotate(180deg)' : 'none' }}
                  >
                    ▾
                  </span>
                </button>
                {isExpanded && (
                  <div className="flex flex-col gap-0.5 pb-1.5">
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
                          {t(`nav.items.${item.key}`)}
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}

          <Link
            to="/buscar"
            onClick={closeAll}
            className={`flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
              location.pathname === '/buscar' ? 'bg-primary/10 text-primary' : 'text-text-muted hover:text-text'
            }`}
          >
            🔍 {t('nav.items.buscar')}
          </Link>

          <hr className="my-1.5 border-border/30" />

          <Link
            to="/ajustes"
            onClick={closeAll}
            className={`flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
              location.pathname === '/ajustes' ? 'bg-primary/10 text-primary' : 'text-text-muted hover:text-text'
            }`}
          >
            ⚙️ {t('nav.profile.settings')}
          </Link>
          <div className="flex items-center gap-2 px-3 py-2.5 text-sm text-text-muted">
            <span>🌐 {t('nav.profile.language')}</span>
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value)}
              className="ml-auto rounded-md border border-border/60 bg-surface px-2 py-1 text-xs text-text outline-none focus:border-primary"
            >
              {SUPPORTED_LANGUAGES.map((code) => (
                <option key={code} value={code}>{LANGUAGE_NAMES[code] ?? code}</option>
              ))}
            </select>
          </div>
          <button
            type="button"
            onClick={handleSignOut}
            className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/10 hover:text-red-300"
          >
            🚪 {t('nav.profile.signOut')}
          </button>
        </nav>
      )}
    </header>
    </>
  )
}
