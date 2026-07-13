import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import MascotCompanion from '../mascot/MascotCompanion'
import PageVideoModal from '../shared/PageVideoModal'
import PatchNotesModal from '../shared/PatchNotesModal'
import Logo from '../shared/Logo'
import courses from '../../data/courses.json'
import { COURSES_DATA, hasCourseData } from '../../data/courseRegistry'
import { useProgressStore } from '../../stores/useProgressStore'
import { useAuthStore } from '../../stores/useAuthStore'
import { useLevelStore, levelProgress } from '../../stores/useLevelStore'
import { useCurrencyStore } from '../../stores/useCurrencyStore'
import { CATEGORY_META } from '../../data/categoryMeta'
import { PATCH_NOTES, LATEST_VERSION } from '../../data/patchNotesRegistry'
import { BUILD_INFO, RECENT_COMMITS } from '../../data/buildInfo'
import { useI18n, SUPPORTED_LANGUAGES, LANGUAGE_NAMES } from '../../i18n'
import { useAnnouncementsStore } from '../../stores/useAnnouncementsStore'
import { useTasksStore } from '../../stores/useTasksStore'
import { useAchievementsStore } from '../../stores/useAchievementsStore'
import { useGlobalMissionsStore } from '../../stores/useGlobalMissionsStore'
import { useQuestsStore } from '../../stores/useQuestsStore'

// ── Sidebar nav data ──────────────────────────────────────────────────────────
// Accesos rápidos de la pestaña Inicio (subconjunto de los 4 mundos principales).
const CAMPUS_LINKS = [
  { to: '/vr',    key: 'vr',    label: 'Campus VR',  icon: '🕶️' },
  { to: '/mundo', key: 'mundo', label: 'Mundo 2D',   icon: '📱' },
  { to: '/rol',   key: 'rol',   label: 'Mundo ROL',  icon: '🎲' },
  { to: '/games', key: 'games', label: 'Games',      icon: '🎮' },
]

// Navegación COMPLETA del sidebar, por subcategoría (mismos grupos que el
// AppTopBar). `key` → nav.items.<key> / el header de sección → nav.groups.<key>.
// Ninguna página existente queda fuera.
const NAV_SECTIONS = [
  { key: 'academia', links: [
    { to: '/notas',        key: 'notas',        icon: '📝' },
    { to: '/biblioteca',   key: 'biblioteca',   icon: '📚' },
    { to: '/guias',        key: 'guias',        icon: '📖' },
    { to: '/ia',           key: 'ia',           icon: '🤖' },
    { to: '/herramientas', key: 'herramientas', icon: '🔧' },
    { to: '/anuncios',     key: 'anuncios',     icon: '📋' },
  ]},
  { key: 'progreso', links: [
    { to: '/mascota',   key: 'mascota',  icon: '⚔️' },
    { to: '/arbol',     key: 'arbol',    icon: '🌳' },
    { to: '/misiones',  key: 'misiones', icon: '📜' },
    { to: '/logros',    key: 'logros',   icon: '🏅' },
    { to: '/mis-tareas', key: 'misTareas', icon: '📋' },
  ]},
  { key: 'campus', links: [
    { to: '/vr',            key: 'vr',         icon: '🕶️' },
    { to: '/vr-templo',     key: 'templo',     icon: '🏛️' },
    { to: '/vr/anfiteatro', key: 'anfiteatro', icon: '🎭' },
    { to: '/vr/cueva-platon', key: 'cueva',    icon: '🕯️' },
    { to: '/vr/graffiti',   key: 'graffiti',   icon: '🎨' },
    { to: '/mundo',         key: 'mundo',      icon: '📱' },
    { to: '/rol',           key: 'rol',        icon: '🎲' },
    { to: '/games',         key: 'games',      icon: '🎮' },
    { to: '/arena',         key: 'arena',      icon: '⚔️' },
  ]},
  { key: 'comunidad', links: [
    { to: '/amigos', key: 'amigos', icon: '👥' },
    { to: '/chats',  key: 'chats',  icon: '💬' },
  ]},
]

// Colores por categoría de notificación/anuncio — distingue de un vistazo una
// actualización del servidor de un anuncio de clase, tarea o mensaje.
const NOTIF_CATEGORY_STYLE = {
  actualizacion: 'bg-emerald-500/15 text-emerald-400',
  general:       'bg-blue-500/15 text-blue-400',
  actividad:     'bg-violet-500/15 text-violet-400',
  recordatorio:  'bg-amber-500/15 text-amber-400',
  evento:        'bg-rose-500/15 text-rose-400',
  tarea:         'bg-amber-500/15 text-amber-400',
  mensaje:       'bg-sky-500/15 text-sky-400',
}

// ── Sidebar ───────────────────────────────────────────────────────────────────
function Sidebar({ tab, setTab, onClose }) {
  const navigate      = useNavigate()
  const { t, lang, setLang } = useI18n()
  const session       = useAuthStore((s) => s.session)
  const profile       = useAuthStore((s) => s.profile)
  const signOut       = useAuthStore((s) => s.signOut)
  const xp            = useLevelStore((s) => s.xp)
  const { level }     = levelProgress(xp)
  const announcements = useAnnouncementsStore((s) => s.announcements)
  const displayName   = profile?.display_name ?? session?.user?.email?.split('@')[0] ?? 'Jugador'
  const [notifsOpen, setNotifsOpen] = useState(false)
  // Acordeón: solo una subcategoría abierta a la vez, para que no se amontone.
  const [openSection, setOpenSection] = useState(null)
  // El selector de idioma vive escondido bajo la mini-card del jugador, igual
  // que en el AppTopBar (dropdown al abrir el botón con el nombre).
  const [profileOpen, setProfileOpen] = useState(false)

  const navTab = (t) => { setTab(t); onClose?.() }
  const go     = (to) => { navigate(to); onClose?.() }

  return (
    <div className="flex h-full flex-col bg-surface border-r border-border overflow-y-auto">
      {/* Logo */}
      <div className="flex items-center gap-1.5 px-4 py-3 border-b border-border">
        <Logo />
        <span aria-hidden="true">🐱</span>
      </div>

      {/* User mini-card — abre el selector de idioma */}
      <button
        type="button"
        onClick={() => setProfileOpen((o) => !o)}
        className="mx-3 mt-2 mb-1 rounded-xl bg-surface-hover px-3 py-2 text-left transition-colors hover:bg-primary/10"
      >
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="text-xs font-bold text-text truncate">{displayName}</p>
            <p className="text-[11px] text-text-muted">{t('dashboard.level')} {level} · {xp} XP</p>
          </div>
          <span className="shrink-0 text-[10px] text-text-muted">{profileOpen ? '▴' : '▾'}</span>
        </div>
      </button>
      {profileOpen && (
        <div className="mx-3 mb-1 flex items-center gap-2 rounded-xl border border-border bg-surface-hover px-3 py-2 text-sm text-text-muted">
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
      )}

      {/* Main tabs */}
      <div className="px-2 pt-2 space-y-0.5">
        {[
          { id: 'inicio',    icon: '🏠' },
          { id: 'escuelas',  icon: '📚' },
          { id: 'progreso',  icon: '📊' },
        ].map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => navTab(item.id)}
            className={`flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              tab === item.id
                ? 'bg-primary/10 text-primary'
                : 'text-text-muted hover:bg-surface-hover hover:text-text'
            }`}
          >
            <span>{item.icon}</span>
            {t(`dashboard.tabs.${item.id}`)}
          </button>
        ))}
      </div>

      {/* Secciones colapsables por subcategoría (acordeón) */}
      <div className="px-2 pt-2 space-y-0.5">
        {NAV_SECTIONS.map((section) => {
          const isOpen = openSection === section.key
          return (
            <div key={section.key}>
              <button
                type="button"
                onClick={() => setOpenSection(isOpen ? null : section.key)}
                className="flex w-full items-center justify-between rounded-lg px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-text-muted/60 transition-colors hover:bg-surface-hover hover:text-text"
              >
                <span>{t(`nav.groups.${section.key}`)}</span>
                <span className="text-[9px] transition-transform" style={{ transform: isOpen ? 'rotate(90deg)' : 'none', display: 'inline-block' }}>▸</span>
              </button>
              {isOpen && (
                <div className="mb-1 space-y-0.5">
                  {section.links.map((l) => (
                    <button key={l.to} type="button" onClick={() => go(l.to)}
                      className="flex w-full items-center gap-2 rounded-lg py-1.5 pl-6 pr-3 text-sm text-text-muted transition-colors hover:bg-surface-hover hover:text-text">
                      <span>{l.icon}</span>{t(`nav.items.${l.key}`)}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )
        })}

        {/* Tienda (standalone, como en el AppTopBar) */}
        <button type="button" onClick={() => go('/tienda')}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-sm text-text-muted transition-colors hover:bg-surface-hover hover:text-text">
          <span>🛒</span>{t('nav.items.tienda')}
        </button>
      </div>

      {/* Notificaciones */}
      {announcements.length > 0 && (
        <div className="px-2 pt-2.5">
          <button
            type="button"
            onClick={() => setNotifsOpen((o) => !o)}
            className="flex w-full items-center justify-between rounded-lg px-3 py-1.5 text-sm text-text-muted transition-colors hover:bg-surface-hover hover:text-text"
          >
            <span className="flex items-center gap-2.5">
              <span>🔔</span>
              <span>{t('dashboard.notifications')}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="rounded-full bg-primary/20 px-1.5 py-0.5 text-[10px] font-bold text-primary">
                {announcements.length}
              </span>
              <span className="text-[10px]">{notifsOpen ? '▴' : '▾'}</span>
            </span>
          </button>
          {notifsOpen && (
            <div className="mx-1 mb-1 rounded-xl border border-border bg-surface-hover p-2 space-y-1.5">
              {announcements.slice(0, 4).map((a) => (
                <div key={a.id} className="flex items-start gap-2 px-1">
                  <span className="shrink-0 text-sm">{a.icon}</span>
                  <div className="min-w-0">
                    <span className={`mb-0.5 inline-block rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide ${NOTIF_CATEGORY_STYLE[a.category] ?? NOTIF_CATEGORY_STYLE.general}`}>
                      {t(`announcements.categories.${a.category}`)}
                    </span>
                    <p className="text-xs font-semibold text-text line-clamp-1">{a.title}</p>
                    {a.body && <p className="text-[11px] text-text-muted line-clamp-1">{a.body}</p>}
                  </div>
                </div>
              ))}
              <button type="button" onClick={() => go('/anuncios')}
                className="w-full pt-0.5 text-center text-[11px] text-primary hover:underline">
                {t('dashboard.seeAll')}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Bottom: settings + logout */}
      <div className="mt-auto px-2 py-2 border-t border-border space-y-0.5">
        <button type="button" onClick={() => go('/ajustes')}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-sm text-text-muted transition-colors hover:bg-surface-hover hover:text-text">
          <span>⚙️</span>{t('nav.profile.settings')}
        </button>
        <button type="button"
          onClick={async () => { await signOut(); navigate('/') }}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-sm text-red-400 transition-colors hover:bg-red-500/10">
          <span>🚪</span>{t('nav.profile.signOut')}
        </button>
      </div>
    </div>
  )
}

// ── Course card (compact) ─────────────────────────────────────────────────────
export function CourseCard({ course, pct, owned, accent, onClick }) {
  const { t } = useI18n()
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={course.locked}
      className={`group flex flex-col rounded-2xl border bg-surface text-left transition-all ${
        course.locked
          ? 'cursor-default border-border opacity-50'
          : 'border-border hover:-translate-y-0.5 hover:border-primary hover:shadow-lg'
      }`}
    >
      {/* Color bar */}
      <div className="h-1.5 w-full rounded-t-2xl" style={{ background: accent }} />
      <div className="flex flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl text-2xl flex-shrink-0"
            style={{ background: `${course.color}22`, border: `1px solid ${course.color}44` }}>
            {course.icon}
          </div>
          {course.locked && <span className="text-[10px] text-text-muted mt-0.5">🔒</span>}
          {!course.locked && !owned && <span className="text-[10px] text-primary mt-0.5 font-semibold">{t('dashboard.freeLabel')}</span>}
          {!course.locked && owned && pct === 100 && <span className="text-[10px] text-primary mt-0.5">🏅</span>}
        </div>
        <div>
          <p className="text-sm font-bold text-text leading-tight line-clamp-2">{course.title}</p>
          <p className="mt-0.5 text-xs text-text-muted line-clamp-2">{course.description}</p>
        </div>
        {pct !== null && owned && (
          <div className="flex items-center gap-2">
            <div className="h-1.5 flex-1 rounded-full bg-surface-hover">
              <div className="h-1.5 rounded-full transition-all" style={{ width: `${pct}%`, background: accent }} />
            </div>
            <span className="text-[10px] text-text-muted">{pct}%</span>
          </div>
        )}
        {!course.locked && (
          <span className="self-start rounded-lg px-3 py-1 text-xs font-semibold text-background transition-colors"
            style={{ background: accent }}>
            {owned ? (pct ? t('dashboard.continuar') : t('dashboard.empezar')) : t('dashboard.probarGratis')}
          </span>
        )}
      </div>
    </button>
  )
}

// ── Tab: Inicio ───────────────────────────────────────────────────────────────
function InicioTab({ profile, license, categories, progressByCourse, hasAccessToCourse, handleSelect, announcements, tasks, patchNotesOpen, setPatchNotesOpen }) {
  const { t }    = useI18n()
  const latest   = PATCH_NOTES[0]
  const xp       = useLevelStore((s) => s.xp)
  const { level, xpIntoLevel, xpForNextLevel } = levelProgress(xp)

  // Solo anuncios de clase en la tarjeta del dashboard — las actualizaciones
  // del servidor (versión/git) tienen su propio tablón arriba.
  const classAnnouncements = announcements.filter((a) => a.category !== 'actualizacion' && !a.synthetic)

  const inProgress = useMemo(() => courses.filter((c) => {
    const p = progressByCourse(c.id)
    return p !== null && p > 0 && p < 100
  }), [progressByCourse])

  const recommended = useMemo(() =>
    courses.filter((c) => !c.locked && (progressByCourse(c.id) === null || progressByCourse(c.id) === 0))
      .slice(0, 3),
  [progressByCourse])

  const displayName = profile?.display_name ?? t('dashboard.defaultStudent')

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-8">

      {/* Greeting */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-text">
            {t('dashboard.greeting', { name: displayName })}{license?.role === 'admin' ? ' 🛡️' : ' 👋'}
          </h1>
          <p className="text-sm text-text-muted mt-0.5">{t('dashboard.greetingSub')}</p>
        </div>
        {/* XP bar */}
        <div className="flex items-center gap-3 rounded-2xl border border-border bg-surface px-4 py-2">
          <div className="text-center">
            <p className="text-xs text-text-muted">{t('dashboard.level')}</p>
            <p className="text-xl font-black text-primary">{level}</p>
          </div>
          <div className="w-28">
            <div className="flex justify-between text-[10px] text-text-muted mb-1">
              <span>{xpIntoLevel} XP</span><span>{xpForNextLevel} XP</span>
            </div>
            <div className="h-2 rounded-full bg-surface-hover">
              <div className="h-2 rounded-full bg-primary transition-all"
                style={{ width: `${(xpIntoLevel / xpForNextLevel) * 100}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Tablón de cambios — se llena solo con los commits de git (buildInfo.js).
          Sin git (algún checkout raro) cae al patch note curado como respaldo. */}
      <div className="rounded-2xl overflow-hidden border border-white/[0.07]"
        style={{ background: 'linear-gradient(135deg,#0f0f1a,#1a1030)' }}>
        <div className="flex items-center justify-between px-4 py-3"
          style={{ background:'linear-gradient(90deg,rgba(124,58,237,0.22),rgba(59,130,246,0.12))', borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-lg">🚀</span>
            <span className="rounded px-1.5 py-0.5 text-[10px] font-black uppercase tracking-widest mr-1"
              style={{ background:'#22c55e22', color:'#22c55e', border:'1px solid #22c55e33' }}>
              {t('dashboard.changesTag')}
            </span>
            <span className="truncate text-sm font-bold text-white">
              {RECENT_COMMITS.length > 0
                ? `Versión #${BUILD_INFO.number} · ${BUILD_INFO.message}`
                : latest.title}
            </span>
          </div>
          <button type="button" onClick={() => setPatchNotesOpen(true)}
            className="shrink-0 rounded-lg border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/60 transition-colors hover:bg-white/10 hover:text-white">
            📋 {t('dashboard.history')}
          </button>
        </div>
        <ul className="grid gap-1.5 p-3 sm:grid-cols-2">
          {RECENT_COMMITS.length > 0
            ? RECENT_COMMITS.slice(0, 6).map((c, i) => (
                <li key={i} className="flex items-start gap-2 rounded-lg px-2.5 py-1.5 text-xs text-white/60"
                  style={{ background:'rgba(255,255,255,0.03)' }}>
                  <span className="shrink-0 font-mono text-[10px] text-white/30">{c.date}</span>
                  <span className="leading-snug">{c.message}</span>
                </li>
              ))
            : latest.changes.slice(0, 4).map((c, i) => (
                <li key={i} className="flex items-start gap-2 rounded-lg px-2.5 py-1.5 text-xs text-white/60"
                  style={{ background:'rgba(255,255,255,0.03)' }}>
                  <span className="shrink-0">{c.icon}</span>
                  <span className="leading-snug">{c.text}</span>
                </li>
              ))}
        </ul>
        <div className="flex items-center justify-between px-4 pb-3">
          <span className="text-[10px] text-white/20">
            {RECENT_COMMITS.length > 0
              ? `#${BUILD_INFO.number}${BUILD_INFO.hash ? ` · ${BUILD_INFO.hash}` : ''}`
              : `v${LATEST_VERSION}`}
          </span>
          <Link to="/vr" className="rounded-lg bg-primary/20 px-3 py-1 text-xs font-semibold text-primary hover:bg-primary/30">
            {t('dashboard.goVR')}
          </Link>
        </div>
      </div>

      {/* Recomendadas para ti */}
      {recommended.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-extrabold text-text">{t('dashboard.recommended')}</h2>
            <Link to="/anuncios" className="text-xs text-primary hover:underline">{t('dashboard.seeAnnouncements')}</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {recommended.map((c) => {
              const meta = CATEGORY_META[c.category] ?? CATEGORY_META.Otros
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => handleSelect(c)}
                  className="group rounded-2xl border border-border bg-surface text-left overflow-hidden transition-all hover:border-primary hover:-translate-y-0.5 hover:shadow-lg"
                >
                  {/* Video thumbnail */}
                  <div className={`relative flex items-center justify-center h-24 bg-gradient-to-br ${meta.gradient}`}>
                    <span className="text-5xl drop-shadow-lg">{c.icon}</span>
                    <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/20 transition-colors">
                      <div className="rounded-full bg-black/40 p-2 opacity-0 group-hover:opacity-100 transition-opacity scale-90 group-hover:scale-100">
                        <span className="text-white text-base leading-none">▶</span>
                      </div>
                    </div>
                    <span className="absolute top-2 right-2 rounded-full bg-black/40 px-2 py-0.5 text-[10px] font-bold text-white/80 backdrop-blur-sm">
                      {t('dashboard.new')}
                    </span>
                  </div>
                  {/* Info */}
                  <div className="p-3">
                    <p className="text-[10px] text-text-muted mb-0.5">{meta.icon} {c.category}</p>
                    <p className="text-sm font-bold text-text leading-tight line-clamp-2">{c.title}</p>
                    <p className="mt-1 text-xs text-text-muted line-clamp-2">{c.description}</p>
                    <span className="mt-2 inline-block text-xs font-semibold text-primary">
                      {t('dashboard.seeCourse')}
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        </section>
      )}

      {/* Continúa aprendiendo */}
      {inProgress.length > 0 && (
        <section>
          <h2 className="text-base font-extrabold text-text mb-3">{t('dashboard.continueLearning')}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {inProgress.map((c) => {
              const meta = CATEGORY_META[c.category] ?? CATEGORY_META.Otros
              return (
                <CourseCard key={c.id} course={c} pct={progressByCourse(c.id)}
                  owned={hasAccessToCourse(c.id)} accent={meta.accent}
                  onClick={() => handleSelect(c)} />
              )
            })}
          </div>
        </section>
      )}

      {inProgress.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border p-8 text-center">
          <p className="text-3xl mb-2">📚</p>
          <p className="text-sm font-semibold text-text mb-1">{t('dashboard.noCoursesTitle')}</p>
          <p className="text-xs text-text-muted mb-4">{t('dashboard.noCoursesSub')}</p>
          <button type="button" className="rounded-xl bg-primary px-5 py-2 text-sm font-bold text-background">
            {t('dashboard.exploreSchools')}
          </button>
        </div>
      )}

      {/* Anuncios de clase + Tareas (las actualizaciones del servidor van arriba) */}
      {(classAnnouncements.length > 0 || tasks.some((task) => task.status === 'pendiente')) && (
        <div className="grid gap-4 sm:grid-cols-2">
          {classAnnouncements.length > 0 && (
            <div className="overflow-hidden rounded-2xl border border-border bg-surface">
              <div className="flex items-center justify-between border-b border-border bg-blue-500/5 px-4 py-3">
                <h3 className="flex items-center gap-2 text-sm font-extrabold text-text">
                  <span>📢</span>{t('dashboard.announcements')}
                </h3>
                <Link to="/anuncios" className="text-xs text-primary hover:underline">{t('dashboard.seeAll')}</Link>
              </div>
              <div className="divide-y divide-border/60">
                {classAnnouncements.slice(0, 3).map((a) => (
                  <div key={a.id} className="flex items-start gap-3 px-4 py-2.5">
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-background text-base">{a.icon}</span>
                    <div className="min-w-0 flex-1">
                      <span className={`mb-0.5 inline-block rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide ${NOTIF_CATEGORY_STYLE[a.category] ?? NOTIF_CATEGORY_STYLE.general}`}>
                        {t(`announcements.categories.${a.category}`)}
                      </span>
                      <p className="text-xs font-semibold text-text line-clamp-1">{a.title}</p>
                      {a.body && <p className="text-[11px] text-text-muted line-clamp-1">{a.body}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {tasks.some((task) => task.status === 'pendiente') && (
            <div className="overflow-hidden rounded-2xl border border-amber-500/30 bg-surface">
              <div className="flex items-center justify-between border-b border-amber-500/20 bg-amber-500/5 px-4 py-3">
                <h3 className="flex items-center gap-2 text-sm font-extrabold text-text">
                  <span>📋</span>{t('dashboard.myTasks')}
                </h3>
                <Link to="/mis-tareas" className="text-xs text-primary hover:underline">{t('dashboard.seeAllF')}</Link>
              </div>
              <div className="divide-y divide-border/60">
                {tasks.filter((task) => task.status === 'pendiente').slice(0, 3).map((task) => (
                  <div key={task.id} className="flex items-start gap-3 px-4 py-2.5">
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-amber-400" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-text line-clamp-1">{task.title}</p>
                      {task.due_date && (
                        <p className="text-[11px] text-text-muted">
                          📅 {new Date(task.due_date + 'T12:00:00').toLocaleDateString('es-MX', { day:'numeric', month:'short' })}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Campus quick access */}
      <section>
        <h2 className="text-base font-extrabold text-text mb-3">🌍 {t('dashboard.sections.campus')}</h2>
        <div className="grid grid-cols-3 gap-3">
          {CAMPUS_LINKS.map((l) => (
            <Link key={l.to} to={l.to}
              className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-surface p-4 text-center transition-colors hover:border-primary hover:bg-surface-hover">
              <span className="text-3xl">{l.icon}</span>
              <span className="text-xs font-semibold text-text">{t(`nav.items.${l.key}`)}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}

// ── Tab: Escuelas ─────────────────────────────────────────────────────────────
// Cada categoría ahora es una tarjeta que lleva a su propia página dedicada
// (/escuela/:slug — ver SchoolPage.jsx) en vez de expandir la lista de cursos
// aquí mismo: el conocimiento se especializa, una sola pantalla con título +
// lista no alcanzaba a mostrar subcategorías ni el chat con el profesor.
function EscuelasTab({ categories }) {
  const { t } = useI18n()
  const navigate = useNavigate()

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-black text-text mb-1">{t('dashboard.schoolsTitle')}</h1>
      <p className="text-sm text-text-muted mb-6">{t('dashboard.schoolsSubtitle')}</p>

      <div className="grid gap-4 sm:grid-cols-2">
        {categories.map(([category, cats]) => {
          const meta = CATEGORY_META[category] ?? CATEGORY_META.Otros
          return (
            <button
              key={category}
              type="button"
              onClick={() => navigate(`/escuela/${meta.slug}`)}
              className={`flex items-center justify-between rounded-2xl px-5 py-4 text-left bg-gradient-to-r ${meta.gradient} transition-transform hover:-translate-y-0.5 hover:opacity-95`}
            >
              <div className="flex items-center gap-3">
                <span className="text-3xl drop-shadow-sm">{meta.icon}</span>
                <div>
                  <p className="text-base font-extrabold text-background drop-shadow-sm">{category}</p>
                  <p className="text-xs font-medium text-background/70">
                    {cats.length} {cats.length === 1 ? t('dashboard.courseSingular') : t('dashboard.coursePlural')}
                  </p>
                </div>
              </div>
              <span className="text-background/70 text-lg">→</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ── Tab: Mi Progreso ──────────────────────────────────────────────────────────
function ProgresoTab({ progressByCourse }) {
  const { t }            = useI18n()
  const xp              = useLevelStore((s) => s.xp)
  const coins           = useCurrencyStore((s) => s.coins)
  const tasks           = useTasksStore((s) => s.tasks)
  const unlocked        = useAchievementsStore((s) => s.unlocked)
  const missionsClaimed = useGlobalMissionsStore((s) => s.claimed)
  const questsCompleted = useQuestsStore((s) => s.completed)
  const { level, xpIntoLevel, xpForNextLevel, isMaxLevel } = levelProgress(xp)

  const completed    = courses.filter((c) => progressByCourse(c.id) === 100).length
  const inProgress   = courses.filter((c) => { const p = progressByCourse(c.id); return p !== null && p > 0 && p < 100 })

  const pending      = tasks.filter((t) => t.status === 'pendiente').length
  const submitted    = tasks.filter((t) => t.status === 'entregada').length
  const graded       = tasks.filter((t) => t.status === 'revisada')
  const avgGrade     = graded.length > 0
    ? Math.round(graded.reduce((acc, t) => acc + (t.grade / t.grade_max) * 100, 0) / graded.length)
    : null

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-10">
      <h1 className="text-2xl font-black text-text">{t('dashboard.progressTitle')}</h1>

      {/* ══ SECCIÓN ACADÉMICA ══════════════════════════════════ */}
      <section className="space-y-4">
        <h2 className="border-b border-border pb-2 text-sm font-bold uppercase tracking-widest text-text-muted">
          {t('dashboard.progress.academicHeader')}
        </h2>

        {/* Cursos en curso */}
        {inProgress.length > 0 && (
          <div className="rounded-2xl border border-border bg-surface p-4 space-y-3">
            <p className="text-sm font-extrabold text-text">{t('dashboard.progress.coursesInProgress')}</p>
            {inProgress.map((c) => {
              const pct  = progressByCourse(c.id)
              const meta = CATEGORY_META[c.category] ?? CATEGORY_META.Otros
              return (
                <div key={c.id} className="flex items-center gap-3">
                  <span className="text-lg shrink-0">{c.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-text truncate">{c.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="h-1.5 flex-1 rounded-full bg-surface-hover">
                        <div className="h-1.5 rounded-full transition-all"
                          style={{ width: `${pct}%`, background: meta.accent }} />
                      </div>
                      <span className="shrink-0 text-[10px] text-text-muted">{pct}%</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Resumen de tareas */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: t('dashboard.progress.pending'),  value: pending,        icon: '⏳', color: '#f59e0b' },
            { label: t('dashboard.progress.submitted'),  value: submitted,      icon: '📤', color: '#3b82f6' },
            { label: t('dashboard.progress.graded'), value: graded.length,  icon: '✅', color: '#22c55e' },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl border border-border bg-surface p-4 text-center">
              <p className="text-2xl mb-1">{s.icon}</p>
              <p className="text-xl font-black text-text">{s.value}</p>
              <p className="text-[11px] text-text-muted mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Tabla de calificaciones */}
        {graded.length > 0 && (
          <div className="rounded-2xl border border-border bg-surface p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-extrabold text-text">{t('dashboard.progress.gradesTitle')}</p>
              {avgGrade !== null && (
                <span className="rounded-lg bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">
                  {t('dashboard.progress.average', { pct: avgGrade })}
                </span>
              )}
            </div>
            <div className="space-y-2.5">
              {graded.map((task) => {
                const pct   = Math.round((task.grade / task.grade_max) * 100)
                const color = pct >= 80 ? '#22c55e' : pct >= 60 ? '#f59e0b' : '#ef4444'
                return (
                  <div key={task.id} className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-text truncate">{task.title}</p>
                      {task.feedback && (
                        <p className="mt-0.5 text-[11px] text-text-muted line-clamp-1">
                          💬 {task.feedback}
                        </p>
                      )}
                    </div>
                    <div className="shrink-0 text-right">
                      <span className="rounded-lg px-2 py-0.5 text-xs font-black"
                        style={{ background: `${color}22`, color }}>
                        {task.grade}/{task.grade_max}
                      </span>
                      <p className="mt-0.5 text-[10px] text-text-muted">{pct}%</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {tasks.length === 0 && (
          <p className="py-4 text-center text-sm text-text-muted">{t('dashboard.progress.noTasks')}</p>
        )}

        <Link to="/mis-tareas"
          className="flex items-center justify-center gap-2 rounded-2xl border border-dashed border-border py-3 text-xs font-semibold text-text-muted transition-colors hover:border-primary hover:text-primary">
          {t('dashboard.progress.seeAllTasks')}
        </Link>
      </section>

      {/* ══ SECCIÓN DEL JUEGO ═════════════════════════════════ */}
      <section className="space-y-4">
        <h2 className="border-b border-border pb-2 text-sm font-bold uppercase tracking-widest text-text-muted">
          {t('dashboard.progress.gameHeader')}
        </h2>

        {/* Level card */}
        <div className="rounded-2xl border border-border bg-surface p-6">
          <div className="flex items-end gap-4">
            <div className="text-center">
              <p className="mb-1 text-xs uppercase tracking-widest text-text-muted">{t('dashboard.level')}</p>
              <p className="text-6xl font-black leading-none text-primary">{level}</p>
            </div>
            <div className="flex-1">
              <div className="mb-1.5 flex justify-between text-xs text-text-muted">
                <span>{xpIntoLevel} XP</span>
                <span>{isMaxLevel ? 'MAX' : `${xpForNextLevel} XP`}</span>
              </div>
              <div className="h-3 rounded-full bg-surface-hover">
                <div className="h-3 rounded-full bg-primary transition-all"
                  style={{ width: `${(xpIntoLevel / xpForNextLevel) * 100}%` }} />
              </div>
              <p className="mt-1.5 text-xs text-text-muted">{t('dashboard.progress.totalXp', { xp })}</p>
            </div>
          </div>
        </div>

        {/* Game stats */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: t('dashboard.progress.coins'),     value: coins.toLocaleString(),                           icon: '💰' },
            { label: t('nav.items.logros'),      value: unlocked.length,                                  icon: '🏅' },
            { label: t('nav.items.misiones'),    value: missionsClaimed.length + questsCompleted.length,  icon: '📜' },
            { label: t('dashboard.progress.completed'), value: completed,                                         icon: '✅' },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl border border-border bg-surface p-4 text-center">
              <p className="mb-1 text-2xl">{s.icon}</p>
              <p className="text-xl font-black text-text">{s.value}</p>
              <p className="mt-0.5 text-[11px] text-text-muted">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Quick links */}
        <div className="space-y-2">
          {[
            { to: '/arbol',    icon: '🌳', label: t('nav.items.arbol'),   desc: t('dashboard.progress.skillTreeDesc') },
            { to: '/logros',   icon: '🏅', label: t('nav.items.logros'), desc: t('dashboard.progress.achievementsDesc') },
            { to: '/misiones', icon: '📜', label: t('nav.items.misiones'), desc: t('dashboard.progress.missionsDesc') },
            { to: '/mascota',  icon: '⚔️', label: t('nav.items.mascota'), desc: t('dashboard.progress.teamDesc') },
          ].map((item) => (
            <Link key={item.to} to={item.to}
              className="flex items-center gap-4 rounded-2xl border border-border bg-surface px-4 py-3 transition-colors hover:border-primary hover:bg-surface-hover">
              <span className="text-2xl">{item.icon}</span>
              <div>
                <p className="text-sm font-semibold text-text">{item.label}</p>
                <p className="text-xs text-text-muted">{item.desc}</p>
              </div>
              <span className="ml-auto text-text-muted">›</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { t }             = useI18n()
  const navigate          = useNavigate()
  const progress          = useProgressStore((s) => s.progress)
  const license           = useAuthStore((s) => s.license)
  const profile           = useAuthStore((s) => s.profile)
  const hasAccessToCourse = useAuthStore((s) => s.hasAccessToCourse)
  const announcements     = useAnnouncementsStore((s) => s.announcements)
  const fetchAnnouncements = useAnnouncementsStore((s) => s.fetch)
  const tasks             = useTasksStore((s) => s.tasks)
  const fetchTasks        = useTasksStore((s) => s.fetchMyTasks)

  const [tab, setTab]               = useState('inicio')
  const [patchNotesOpen, setPatchNotesOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => { fetchAnnouncements(); fetchTasks() }, [fetchAnnouncements, fetchTasks])

  const progressByCourse = (courseId) => {
    if (!hasCourseData(courseId)) return null
    const total = COURSES_DATA[courseId].modules.length
    const done  = (progress[courseId]?.moduleProgress ?? []).filter((p) => p.completed).length
    return Math.round((done / total) * 100)
  }

  const categories = useMemo(() => {
    const groups = new Map()
    for (const c of courses) {
      const key = c.category ?? 'Otros'
      if (!groups.has(key)) groups.set(key, [])
      groups.get(key).push(c)
    }
    return Array.from(groups.entries())
  }, [])

  const handleSelect = (course) => { if (!course.locked) navigate(`/learn/${course.id}`) }

  const tabProps = { categories, progressByCourse, hasAccessToCourse, handleSelect }

  return (
    <div className="flex h-screen overflow-hidden bg-background text-text">
      <PageVideoModal pageKey="dashboard" />
      {patchNotesOpen && <PatchNotesModal open onClose={() => setPatchNotesOpen(false)} />}

      {/* ── Desktop sidebar (always visible ≥ md) ──────────────────── */}
      <aside className="hidden md:flex md:w-56 md:flex-col flex-shrink-0 h-full">
        <Sidebar tab={tab} setTab={setTab} />
      </aside>

      {/* ── Mobile sidebar drawer ──────────────────────────────────── */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="w-56 h-full shadow-2xl">
            <Sidebar tab={tab} setTab={setTab} onClose={() => setSidebarOpen(false)} />
          </div>
          <div className="flex-1 bg-black/50 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* ── Main area ─────────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col min-w-0 h-full overflow-hidden">
        {/* Mobile top bar */}
        <header className="flex items-center gap-3 border-b border-border bg-surface px-4 py-3 md:hidden flex-shrink-0">
          <button type="button" onClick={() => setSidebarOpen(true)}
            className="text-xl text-text-muted">☰</button>
          <div className="flex items-center gap-1.5">
            <Logo />
            <span aria-hidden="true">🐱</span>
          </div>
        </header>

        {/* Scrollable content */}
        <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
          {tab === 'inicio' && (
            <InicioTab
              profile={profile}
              license={license}
              announcements={announcements}
              tasks={tasks}
              patchNotesOpen={patchNotesOpen}
              setPatchNotesOpen={setPatchNotesOpen}
              {...tabProps}
            />
          )}
          {tab === 'escuelas' && <EscuelasTab {...tabProps} />}
          {tab === 'progreso' && <ProgresoTab progressByCourse={progressByCourse} />}
        </main>

        {/* ── Mobile bottom tab bar ──────────────────────────────── */}
        <nav className="flex md:hidden items-center justify-around border-t border-border bg-surface px-2 py-2 flex-shrink-0">
          {[
            { id: 'inicio',   icon: '🏠' },
            { id: 'escuelas', icon: '📚' },
            { id: 'progreso', icon: '📊' },
          ].map((item) => (
            <button key={item.id} type="button" onClick={() => setTab(item.id)}
              className={`flex flex-col items-center gap-0.5 px-4 py-1 rounded-xl transition-colors ${
                tab === item.id ? 'text-primary' : 'text-text-muted'
              }`}>
              <span className="text-xl">{item.icon}</span>
              <span className="text-[10px] font-semibold">{t(`dashboard.tabs.${item.id}`)}</span>
            </button>
          ))}
          <button type="button" onClick={() => setSidebarOpen(true)}
            className="flex flex-col items-center gap-0.5 px-4 py-1 rounded-xl text-text-muted">
            <span className="text-xl">☰</span>
            <span className="text-[10px] font-semibold">{t('dashboard.more')}</span>
          </button>
        </nav>
      </div>

      <MascotCompanion />
    </div>
  )
}
