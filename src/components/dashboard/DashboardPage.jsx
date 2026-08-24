import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import AppTopBar from '../shared/AppTopBar'
import MascotCompanion from '../mascot/MascotCompanion'
import PageVideoModal from '../shared/PageVideoModal'
import PatchNotesModal from '../shared/PatchNotesModal'
import courses from '../../data/courses.json'
import { COURSES_DATA, hasCourseData } from '../../data/courseRegistry'
import { useProgressStore } from '../../stores/useProgressStore'
import { useAuthStore } from '../../stores/useAuthStore'
import { CATEGORY_META } from '../../data/categoryMeta'
import { PATCH_NOTES, LATEST_VERSION } from '../../data/patchNotesRegistry'
import { BUILD_INFO, RECENT_COMMITS } from '../../data/buildInfo'
import { useI18n } from '../../i18n'
import { buildRegions } from '../../utils/regions'
import TodayCourseCard from '../shared/TodayCourseCard'

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

// ── Course card (compact) — usado también por MainCategoryPage.jsx y SchoolPage.jsx ──
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
// Deliberadamente chico: solo actualizaciones del sitio + tus cursos. Todo lo
// demás (perfil, XP/monedas, misiones, tareas pendientes, actividad reciente,
// accesos a Campus) ya vive en otra parte de la app (/progreso, /misiones,
// /mis-tareas, /anuncios, el menú Campus del nav) — pedido explícito del
// usuario tras notar que el Dashboard duplicaba /progreso sin aportar nada
// nuevo. Antes esta pestaña era mucho más grande (roster de personaje, quest
// log, tareas pendientes...) — ver project_dashboard_hero_redesign en
// memoria para el historial de ese diseño anterior, ya descartado.
function InicioTab({ profile, license, progressByCourse }) {
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
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-8">
      {patchNotesOpen && <PatchNotesModal open force onClose={() => setPatchNotesOpen(false)} />}

      <div>
        <h1 className="text-xl font-black text-text">
          {t('dashboard.greeting', { name: displayName })}{license?.role === 'admin' ? ' 🛡️' : ' 👋'}
        </h1>
        <p className="text-sm text-text-muted mt-0.5">{t('dashboard.greetingSub')}</p>
      </div>

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

      <WorldMapSection regions={regions} />
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const progress = useProgressStore((s) => s.progress)
  const license  = useAuthStore((s) => s.license)
  const profile  = useAuthStore((s) => s.profile)

  const progressByCourse = (courseId) => {
    if (!hasCourseData(courseId)) return null
    const total = COURSES_DATA[courseId].modules.length
    const done  = (progress[courseId]?.moduleProgress ?? []).filter((p) => p.completed).length
    return Math.round((done / total) * 100)
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-text">
      <PageVideoModal pageKey="dashboard" />

      <AppTopBar />

      <main className="flex-1">
        <InicioTab profile={profile} license={license} progressByCourse={progressByCourse} />
      </main>

      <MascotCompanion />
    </div>
  )
}
