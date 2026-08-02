import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AppTopBar from '../shared/AppTopBar'
import MascotCompanion from '../mascot/MascotCompanion'
import PageVideoModal from '../shared/PageVideoModal'
import PatchNotesModal from '../shared/PatchNotesModal'
import courses from '../../data/courses.json'
import { COURSES_DATA, hasCourseData } from '../../data/courseRegistry'
import { useProgressStore } from '../../stores/useProgressStore'
import { useAuthStore } from '../../stores/useAuthStore'
import { useGameStore } from '../../stores/useGameStore'
import { useLevelStore, levelProgress } from '../../stores/useLevelStore'
import { useCurrencyStore } from '../../stores/useCurrencyStore'
import { CATEGORY_META } from '../../data/categoryMeta'
import { PATCH_NOTES, LATEST_VERSION } from '../../data/patchNotesRegistry'
import { BUILD_INFO, RECENT_COMMITS } from '../../data/buildInfo'
import { useI18n } from '../../i18n'
import { useTasksStore } from '../../stores/useTasksStore'
import { useAchievementsStore } from '../../stores/useAchievementsStore'
import { getAllAchievements, ACHIEVEMENT_CATEGORIES } from '../../data/achievementsRegistry'
import { useMascotStore } from '../../stores/useMascotStore'
import { formatCurrency } from '../../utils/currency'

// ── Sidebar nav data ──────────────────────────────────────────────────────────
// Accesos rápidos de la pestaña Inicio (subconjunto de los 4 mundos principales).
const CAMPUS_LINKS = [
  { to: '/vr',    key: 'vr',    label: 'Campus VR',  icon: '🕶️', hideFor: ['kids', 'seniors'] },
  { to: '/mundo', key: 'mundo', label: 'Mundo 2D',   icon: '📱', hideFor: ['kids', 'seniors'] },
  { to: '/rol',   key: 'rol',   label: 'Mundo ROL',  icon: '🎲', hideFor: ['kids', 'seniors'] },
]

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
function InicioTab({ profile, license, categories, progressByCourse, hasAccessToCourse, handleSelect, tasks, patchNotesOpen, setPatchNotesOpen }) {
  const { t }    = useI18n()
  const latest   = PATCH_NOTES[0]
  const xp       = useLevelStore((s) => s.xp)
  const { level, xpIntoLevel, xpForNextLevel } = levelProgress(xp)

  const inProgress = useMemo(() => courses.filter((c) => {
    const p = progressByCourse(c.id)
    return p !== null && p > 0 && p < 100
  }), [progressByCourse])

  const recommended = useMemo(() =>
    courses.filter((c) => !c.locked && (progressByCourse(c.id) === null || progressByCourse(c.id) === 0))
      .slice(0, 3),
  [progressByCourse])

  const displayName = profile?.display_name ?? t('dashboard.defaultStudent')
  const visibleCampusLinks = CAMPUS_LINKS.filter((l) => !l.hideFor?.includes(profile?.age_profile))
  const hasOliver = useGameStore((s) => Boolean(s.oliver.class))
  // Perfil de edad "niños"/"abuelos" (profiles.age_profile) no ve el mundo VR
  // en absoluto — /vr y /vr-templo ya están bloqueados a nivel de ruta
  // (ProtectedRoute blockAgeProfiles), así que tampoco tiene sentido
  // ofrecerle estos dos accesos directos desde el Dashboard.
  const vrAllowed = !['kids', 'seniors'].includes(profile?.age_profile)

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-8">

      {!hasOliver && vrAllowed && (
        <Link to="/vr-templo" className="flex items-center justify-between gap-3 rounded-2xl border border-primary/30 bg-primary/10 px-4 py-3 transition hover:bg-primary/15">
          <div>
            <p className="text-sm font-bold text-text">🐾 ¿Quieres tu mascota y el mundo VR?</p>
            <p className="text-xs text-text-muted">Es opcional — puedes seguir tomando cursos sin esto. Cuando quieras, crea tu personaje aquí.</p>
          </div>
          <span className="shrink-0 rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-background">Crear →</span>
        </Link>
      )}

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
          {vrAllowed && (
            <Link to="/vr" className="rounded-lg bg-primary/20 px-3 py-1 text-xs font-semibold text-primary hover:bg-primary/30">
              {t('dashboard.goVR')}
            </Link>
          )}
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

      {/* Tareas pendientes — anuncios y mensajes viven ahora en /anuncios
          (tablón + buzón), para no repetir el mismo contenido aquí. */}
      {tasks.some((task) => task.status === 'pendiente') && (
        <div className="overflow-hidden rounded-2xl border border-amber-500/30 bg-surface">
          <div className="flex items-center justify-between border-b border-amber-500/20 bg-amber-500/5 px-4 py-3">
            <h3 className="flex items-center gap-2 text-sm font-extrabold text-text">
              <span>📋</span>{t('dashboard.myTasks')}
            </h3>
            <Link to="/mis-tareas" className="text-xs text-primary hover:underline">{t('dashboard.seeAllF')}</Link>
          </div>
          <div className="divide-y divide-border/60">
            {tasks.filter((task) => task.status === 'pendiente').slice(0, 4).map((task) => (
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

      {/* Campus quick access — oculto por perfil de edad (profiles.age_profile,
          asignado por el admin), mismo criterio que el nav de AppTopBar.jsx */}
      {visibleCampusLinks.length > 0 && (
      <section>
        <h2 className="text-base font-extrabold text-text mb-3">🌍 {t('dashboard.sections.campus')}</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {visibleCampusLinks.map((l) => (
            <Link key={l.to} to={l.to}
              className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-surface p-4 text-center transition-colors hover:border-primary hover:bg-surface-hover">
              <span className="text-3xl">{l.icon}</span>
              <span className="text-xs font-semibold text-text">{t(`nav.items.${l.key}`)}</span>
            </Link>
          ))}
        </div>
      </section>
      )}
    </div>
  )
}

const MASCOT_EMOJI_MAP = { orange_cat: '🐱', black_cat: '🐈‍⬛', robot: '🤖', dragon: '🐉', bunny: '🐰', fox: '🦊' }

// Fila label:valor dentro de una tarjeta — como la tabla de datos del
// perfil (Email, DOB, Clase...) de un sistema escolar real.
function InfoRow({ label, value }) {
  return (
    <div className="flex items-center justify-between border-b border-border px-4 py-2.5 last:border-b-0">
      <span className="text-xs font-medium text-text-muted">{label}</span>
      <span className="text-sm font-semibold text-text">{value}</span>
    </div>
  )
}

// Botón de sección sólido y coloreado — igual que la barra de accesos
// (Docs / Exam Reports / Attendance...) del sistema de referencia: color
// plano, ícono + etiqueta, sin transparencias ni degradados.
function SectionTab({ icon, label, color, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{ background: color }}
      className={`flex min-w-[92px] flex-1 flex-col items-center gap-1 rounded-lg px-2 py-2.5 text-white transition-transform ${active ? 'ring-2 ring-white/80' : 'opacity-70 hover:opacity-100'}`}
    >
      <span className="text-lg leading-none">{icon}</span>
      <span className="text-[11px] font-bold leading-none">{label}</span>
    </button>
  )
}

// Tabla de datos simple con encabezado — para cursos, calificaciones y logros.
function DataTable({ columns, children, empty }) {
  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <table className="w-full border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-border bg-surface-hover/60">
            {columns.map((col) => (
              <th key={col} className="px-4 py-2.5 text-[11px] font-bold uppercase tracking-wide text-text-muted">{col}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border bg-surface">
          {children}
        </tbody>
      </table>
      {empty && <p className="border-t border-border px-4 py-6 text-center text-sm text-text-muted">{empty}</p>}
    </div>
  )
}

// Solo avance académico aquí — mascota/árbol/misiones son del mundo VR y
// viven en el grupo de nav "Campus", no en "Mi Progreso".
const SECTIONS = [
  { id: 'cursos',         label: 'Cursos',         icon: '📚', color: '#2563eb' },
  { id: 'calificaciones', label: 'Calificaciones', icon: '📝', color: '#0d9488' },
  { id: 'logros',         label: 'Logros',         icon: '🏅', color: '#7c3aed' },
  { id: 'economia',       label: 'Economía',       icon: '💰', color: '#dc2626' },
]

// ── Tab: Mi Progreso ──────────────────────────────────────────────────────────
function ProgresoTab({ progressByCourse, profile }) {
  const { t }            = useI18n()
  const session          = useAuthStore((s) => s.session)
  const xp               = useLevelStore((s) => s.xp)
  const coins            = useCurrencyStore((s) => s.coins)
  const tasks            = useTasksStore((s) => s.tasks)
  const unlocked         = useAchievementsStore((s) => s.unlocked)
  const mascotId         = useMascotStore((s) => s.mascot)
  const { level, xpIntoLevel, xpForNextLevel, isMaxLevel } = levelProgress(xp)
  const [activeSection, setActiveSection] = useState('cursos')

  const displayName = profile?.display_name || session?.user?.email?.split('@')[0] || 'Estudiante'
  const avatarEmoji = MASCOT_EMOJI_MAP[mascotId] ?? '👤'

  const completedCourses = courses.filter((c) => progressByCourse(c.id) === 100)
  const inProgress       = courses.filter((c) => { const p = progressByCourse(c.id); return p !== null && p > 0 && p < 100 })
  const enrolledCourses  = [...inProgress, ...completedCourses]

  const pending      = tasks.filter((t) => t.status === 'pendiente').length
  const submitted    = tasks.filter((t) => t.status === 'entregada').length
  const graded       = tasks.filter((t) => t.status === 'revisada')
  const avgGrade     = graded.length > 0
    ? Math.round(graded.reduce((acc, t) => acc + (t.grade / t.grade_max) * 100, 0) / graded.length)
    : null

  const achievementCatalog = useMemo(() => getAllAchievements(courses), [])
  const unlockedAchievements = useMemo(
    () => unlocked.map((id) => achievementCatalog.find((a) => a.id === id)).filter(Boolean).reverse(),
    [unlocked, achievementCatalog]
  )
  const categoryLabel = (id) => ACHIEVEMENT_CATEGORIES.find((c) => c.id === id)?.label ?? id

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <h1 className="mb-5 text-2xl font-black text-text">{t('dashboard.progressTitle')}</h1>

      <div className="grid gap-5 lg:grid-cols-[240px_1fr]">
        {/* ══ TARJETA DE PERFIL ══════════════════════════════ */}
        <div className="h-fit rounded-xl border border-border bg-surface">
          <div className="flex flex-col items-center gap-2 border-b border-border p-5">
            <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-primary bg-surface-hover text-4xl">
              {avatarEmoji}
            </div>
            <p className="text-center text-sm font-bold text-text">{displayName}</p>
            <span className="rounded-full bg-primary/15 px-2.5 py-0.5 text-xs font-bold text-primary">Nivel {level}</span>
          </div>
          <div>
            <InfoRow label="XP total" value={xp.toLocaleString()} />
            <InfoRow label="Siguiente nivel" value={isMaxLevel ? 'MAX' : `${xpForNextLevel - xpIntoLevel} XP`} />
            <InfoRow label="Cursos inscritos" value={enrolledCourses.length} />
            <InfoRow label="Promedio" value={avgGrade !== null ? `${avgGrade}%` : '—'} />
            <InfoRow label="Monedas" value={coins.toLocaleString()} />
          </div>
        </div>

        {/* ══ CONTENIDO ══════════════════════════════════════ */}
        <div className="min-w-0 space-y-4">
          <div className="flex flex-wrap gap-2">
            {SECTIONS.map((s) => (
              <SectionTab key={s.id} {...s} active={activeSection === s.id} onClick={() => setActiveSection(s.id)} />
            ))}
          </div>

          {/* Cursos */}
          {activeSection === 'cursos' && (
            <DataTable columns={['Curso', 'Categoría', 'Progreso', 'Estado']} empty={enrolledCourses.length === 0 ? 'Aún no te has inscrito a ningún curso. Explora las escuelas para empezar.' : null}>
              {enrolledCourses.map((c) => {
                const pct  = progressByCourse(c.id)
                const meta = CATEGORY_META[c.category] ?? CATEGORY_META.Otros
                return (
                  <tr key={c.id} className="cursor-default transition-colors hover:bg-surface-hover">
                    <td className="px-4 py-3">
                      <Link to={`/learn/${c.id}`} className="flex items-center gap-2 font-medium text-text hover:text-primary">
                        <span>{c.icon}</span>{c.title}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-text-muted">{c.category}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-24 rounded-full bg-surface-hover">
                          <div className="h-1.5 rounded-full" style={{ width: `${pct}%`, background: meta.accent }} />
                        </div>
                        <span className="text-xs tabular-nums text-text-muted">{pct}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {pct === 100
                        ? <span className="text-xs font-semibold text-emerald-400">Completado</span>
                        : <span className="text-xs font-semibold text-amber-400">En curso</span>}
                    </td>
                  </tr>
                )
              })}
            </DataTable>
          )}

          {/* Calificaciones */}
          {activeSection === 'calificaciones' && (
            <>
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-surface px-4 py-3">
                <div className="flex gap-5 text-xs text-text-muted">
                  <span>⏳ {pending} {t('dashboard.progress.pending').toLowerCase()}</span>
                  <span>📤 {submitted} {t('dashboard.progress.submitted').toLowerCase()}</span>
                  <span>✅ {graded.length} {t('dashboard.progress.graded').toLowerCase()}</span>
                </div>
                {avgGrade !== null && (
                  <span className="text-xs font-bold text-primary">{t('dashboard.progress.average', { pct: avgGrade })}</span>
                )}
              </div>
              <DataTable columns={['Tarea', 'Calificación', '%', 'Comentario']} empty={graded.length === 0 ? t('dashboard.progress.noTasks') : null}>
                {graded.map((task) => {
                  const pct   = Math.round((task.grade / task.grade_max) * 100)
                  const color = pct >= 80 ? 'text-emerald-400' : pct >= 60 ? 'text-amber-400' : 'text-red-400'
                  return (
                    <tr key={task.id}>
                      <td className="px-4 py-3 font-medium text-text">{task.title}</td>
                      <td className={`px-4 py-3 font-semibold tabular-nums ${color}`}>{task.grade}/{task.grade_max}</td>
                      <td className={`px-4 py-3 tabular-nums ${color}`}>{pct}%</td>
                      <td className="px-4 py-3 text-text-muted">{task.feedback || '—'}</td>
                    </tr>
                  )
                })}
              </DataTable>
              <Link to="/mis-tareas"
                className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-border py-3 text-xs font-semibold text-text-muted transition-colors hover:border-primary hover:text-primary">
                {t('dashboard.progress.seeAllTasks')}
              </Link>
            </>
          )}

          {/* Logros */}
          {activeSection === 'logros' && (
            <>
              <DataTable columns={['Logro', 'Categoría']} empty={unlockedAchievements.length === 0 ? 'Aún no desbloqueas ningún logro.' : null}>
                {unlockedAchievements.map((a) => (
                  <tr key={a.id}>
                    <td className="flex items-center gap-2 px-4 py-3 font-medium text-text"><span>{a.icon}</span>{a.name}</td>
                    <td className="px-4 py-3 text-text-muted">{categoryLabel(a.category)}</td>
                  </tr>
                ))}
              </DataTable>
              <Link to="/logros" className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-border py-3 text-xs font-semibold text-text-muted transition-colors hover:border-primary hover:text-primary">
                Ver panel completo de logros →
              </Link>
            </>
          )}

          {/* Economía */}
          {activeSection === 'economia' && (
            <div className="rounded-xl border border-border bg-surface">
              <InfoRow label="Saldo total" value={formatCurrency(coins)} />
              <InfoRow label="Cobre" value={coins.toLocaleString()} />
              <div className="p-4">
                <Link to="/tienda" className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-border py-3 text-xs font-semibold text-text-muted transition-colors hover:border-primary hover:text-primary">
                  Ir a la Tienda →
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
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
  const tasks             = useTasksStore((s) => s.tasks)
  const fetchTasks        = useTasksStore((s) => s.fetchMyTasks)

  const [tab, setTab]               = useState(() => new URLSearchParams(window.location.search).get('tab') || 'inicio')
  const [patchNotesOpen, setPatchNotesOpen] = useState(false)

  useEffect(() => { fetchTasks() }, [fetchTasks])

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
    <div className="flex min-h-screen flex-col bg-background text-text">
      <PageVideoModal pageKey="dashboard" />
      {patchNotesOpen && <PatchNotesModal open onClose={() => setPatchNotesOpen(false)} />}

      <AppTopBar />

      {/* Pestañas Inicio / Mi Progreso — mismo patrón de pill-tabs que
          TasksPage/ProgresoTab, ya no un sidebar propio. Escuelas se movió a
          su propia entrada de navegación ("🏫 Academias" en el header). */}
      <div className="mx-auto w-full max-w-4xl px-4 pt-6">
        <div className="flex gap-1 rounded-xl border border-border bg-surface p-1">
          {[
            { id: 'inicio',   icon: '🏠' },
            { id: 'progreso', icon: '📊' },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-4 py-2 text-sm font-bold transition ${
                tab === item.id ? 'bg-background text-text shadow-sm' : 'text-text-muted hover:text-text'
              }`}
            >
              <span>{item.icon}</span>{t(`dashboard.tabs.${item.id}`)}
            </button>
          ))}
        </div>
      </div>

      <main className="flex-1">
        {tab === 'inicio' && (
          <InicioTab
            profile={profile}
            license={license}
            tasks={tasks}
            patchNotesOpen={patchNotesOpen}
            setPatchNotesOpen={setPatchNotesOpen}
            {...tabProps}
          />
        )}
        {tab === 'progreso' && <ProgresoTab progressByCourse={progressByCourse} profile={profile} />}
      </main>

      <MascotCompanion />
    </div>
  )
}
