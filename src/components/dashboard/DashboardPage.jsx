import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import AppTopBar from '../shared/AppTopBar'
import MascotCompanion from '../mascot/MascotCompanion'
import PageVideoModal from '../shared/PageVideoModal'
import PatchNotesModal from '../shared/PatchNotesModal'
import courses from '../../data/courses.json'
import { COURSES_DATA, hasCourseData, getAllCourses } from '../../data/courseRegistry'
import { useProgressStore } from '../../stores/useProgressStore'
import { useAuthStore } from '../../stores/useAuthStore'
import { useLevelStore, levelProgress } from '../../stores/useLevelStore'
import { useAchievementsStore } from '../../stores/useAchievementsStore'
import { getAllAchievements } from '../../data/achievementsRegistry'
import { useCourseContentStore } from '../../stores/useCourseContentStore'
import { useMascotStore } from '../../stores/useMascotStore'
import { MASCOTS } from '../../data/mascotRegistry'
import { useTasksStore } from '../../stores/useTasksStore'
import { CATEGORY_META } from '../../data/categoryMeta'
import { PATCH_NOTES, LATEST_VERSION } from '../../data/patchNotesRegistry'
import { BUILD_INFO, RECENT_COMMITS } from '../../data/buildInfo'
import { useI18n } from '../../i18n'
import { buildRegions } from '../../utils/regions'
import TodayCourseCard from '../shared/TodayCourseCard'
import ProfileSummaryCard from './ProfileSummaryCard'
import TrajectorySummaryCard from './TrajectorySummaryCard'
import BadgesSummaryCard from './BadgesSummaryCard'
import UpcomingDeadlinesCard from './UpcomingDeadlinesCard'
import QuickLinksRow from './QuickLinksRow'

// ── Mapa: fila de "regiones" (src/utils/regions.js) con una línea punteada de fondo, estilo mapa
// de aventura. Cada nodo lleva a la página real de esa academia/categoría.
function WorldMapSection({ regions }) {
  const { t } = useI18n()
  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-base font-extrabold text-text">🗺️ {t('dashboard.worldMap')}</h2>
        <Link to="/academias" className="text-xs text-primary hover:underline">{t('dashboard.seeAllF')}</Link>
      </div>
      <div className="relative">
        <div className="pointer-events-none absolute inset-x-1 top-8 -z-10 h-px border-t-2 border-dashed border-border" />
        <div className="flex gap-4 overflow-x-auto px-1 pb-2">
          {regions.map((r) => (
            <Link
              key={r.key}
              to={r.to}
              className="group flex w-24 shrink-0 flex-col items-center gap-1.5 text-center"
            >
              <span
                className={`flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br ${r.gradient} text-2xl shadow-md ring-2 transition-transform group-hover:-translate-y-1 ${
                  r.state === 'current' ? 'ring-primary' : 'ring-background'
                }`}
              >
                {r.icon}
              </span>
              <span className="text-[11px] font-bold leading-tight text-text line-clamp-2">{r.title}</span>
              <span className="text-[10px] text-text-muted">
                {r.state === 'current'
                  ? t('dashboard.quest.regionInProgress')
                  : r.completed > 0 ? `${r.completed}/${r.total} ✓` : t('dashboard.quest.regionCourses', { count: r.total })}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

// Course card (compact) — usado también por MainCategoryPage.jsx y
// SchoolPage.jsx vía `import { CourseCard } from './DashboardPage'`. Vive en
// su propio archivo (CourseCard.jsx); este re-export mantiene ese import
// funcionando sin tocar esos dos archivos.
export { default as CourseCard } from './CourseCard'

// ── Tab: Inicio ───────────────────────────────────────────────────────────────
// Más completo que la ronda anterior (pedido explícito, con referencia de un
// campus virtual universitario), pero sin duplicar /progreso: las tarjetas
// de la columna secundaria son RESÚMENES (números + link a la página
// completa), nunca las secciones enteras de /progreso, /logros o
// /mis-tareas. Tampoco se agregó una barra lateral de navegación — se
// decidió explícitamente mantener el menú superior tal cual, esta columna
// vive dentro del contenido normal de la página, no es una sidebar fija.
// Historial de rondas anteriores en project_dashboard_hero_redesign
// (memoria) — la 3ª ronda lo redujo a casi nada por duplicar /progreso; este
// cambio no revierte esa decisión, agrega resúmenes que antes no existían.
function InicioTab({ profile, license, progressByCourse, profileSummary, trajectory, badges, pendingTasks }) {
  const { t } = useI18n()
  const [patchNotesOpen, setPatchNotesOpen] = useState(false)
  const latest = PATCH_NOTES[0]

  const inProgress = useMemo(() => courses.filter((c) => {
    const p = progressByCourse(c.id)
    return p !== null && p > 0 && p < 100
  }), [progressByCourse])

  const todayCourses = (inProgress.length > 0 ? inProgress : courses.filter((c) => !c.locked)).slice(0, 2)
  const regions = useMemo(() => buildRegions(courses, progressByCourse), [progressByCourse])
  const displayName = profile?.display_name ?? t('dashboard.defaultStudent')
  const vrAllowed = !['kids', 'seniors'].includes(profile?.age_profile)

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      {patchNotesOpen && <PatchNotesModal open force onClose={() => setPatchNotesOpen(false)} />}

      <div>
        <h1 className="text-xl font-black text-text">
          {t('dashboard.greeting', { name: displayName })}{license?.role === 'admin' ? ' 🛡️' : ' 👋'}
        </h1>
        <p className="text-sm text-text-muted mt-0.5">{t('dashboard.greetingSub')}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Columna principal */}
        <div className="min-w-0 space-y-8">
          <section>
            <p className="mb-3 text-sm font-extrabold text-text">{t('dashboard.promo.todayTitle')}</p>
            {todayCourses.length > 0 ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {todayCourses.map((c) => (
                  <TodayCourseCard key={c.id} course={c} pct={progressByCourse(c.id) ?? 0} meta={CATEGORY_META[c.category] ?? CATEGORY_META.Otros} />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-text-muted">
                {t('dashboard.promo.todayEmpty')}
              </div>
            )}
          </section>

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
                <span className="min-w-0 flex-1 truncate text-sm font-bold text-white">
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

          <QuickLinksRow />

          <WorldMapSection regions={regions} />
        </div>

        {/* Columna secundaria — resúmenes con link a la página completa, NO
            una sidebar de navegación (sigue en el flujo normal de la página). */}
        <div className="space-y-4">
          <ProfileSummaryCard {...profileSummary} />
          <TrajectorySummaryCard {...trajectory} />
          <BadgesSummaryCard {...badges} />
          <UpcomingDeadlinesCard pendingTasks={pendingTasks} />
        </div>
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { t } = useI18n()
  const progress = useProgressStore((s) => s.progress)
  const license  = useAuthStore((s) => s.license)
  const profile  = useAuthStore((s) => s.profile)
  const xp = useLevelStore((s) => s.xp)
  const unlocked = useAchievementsStore((s) => s.unlocked)
  const coursesLoaded = useCourseContentStore((s) => s.loaded)
  const selectedMascotId = useMascotStore((s) => s.selectedMascotId)
  const tasks = useTasksStore((s) => s.tasks)
  const fetchMyTasks = useTasksStore((s) => s.fetchMyTasks)

  useEffect(() => { fetchMyTasks() }, [fetchMyTasks])

  const progressByCourse = (courseId) => {
    if (!hasCourseData(courseId)) return null
    const total = COURSES_DATA[courseId].modules.length
    const done  = (progress[courseId]?.moduleProgress ?? []).filter((p) => p.completed).length
    return Math.round((done / total) * 100)
  }

  const completedCount = courses.filter((c) => progressByCourse(c.id) === 100).length
  const inProgressCount = courses.filter((c) => {
    const p = progressByCourse(c.id)
    return p !== null && p > 0 && p < 100
  }).length

  // Recalcula al terminar de cargar el store de cursos — mismo fix que ya
  // aplica AchievementsPanel.jsx: sin esto, si este efecto corre antes de
  // que Supabase responda, las medallas de curso quedan fuera para siempre.
  const allAchievements = useMemo(() => getAllAchievements(getAllCourses()), [coursesLoaded])

  const { level, xpIntoLevel, xpForNextLevel, isMaxLevel } = levelProgress(xp)
  const mascotEmoji = MASCOTS.find((m) => m.id === selectedMascotId)?.icon ?? '👤'
  const pendingTasks = tasks.filter((t) => t.status === 'pendiente')

  const profileSummary = {
    displayName: profile?.display_name ?? t('dashboard.defaultStudent'),
    role: license?.role,
    mascotEmoji,
    level,
    xpIntoLevel,
    xpForNextLevel,
    isMaxLevel,
    licenseType: license?.type,
  }
  const trajectory = { completedCount, inProgressCount }
  const badges = { unlockedCount: unlocked.length, total: allAchievements.length }

  return (
    <div className="flex min-h-screen flex-col bg-background text-text">
      <PageVideoModal pageKey="dashboard" />

      <AppTopBar />

      <main className="flex-1">
        <InicioTab
          profile={profile}
          license={license}
          progressByCourse={progressByCourse}
          profileSummary={profileSummary}
          trajectory={trajectory}
          badges={badges}
          pendingTasks={pendingTasks}
        />
      </main>

      <MascotCompanion />
    </div>
  )
}
