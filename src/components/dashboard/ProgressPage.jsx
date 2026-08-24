import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import AppTopBar from '../shared/AppTopBar'
import MascotCompanion from '../mascot/MascotCompanion'
import AchievementsPanel from '../mascot/AchievementsPanel'
import courses from '../../data/courses.json'
import { COURSES_DATA, hasCourseData } from '../../data/courseRegistry'
import { useProgressStore } from '../../stores/useProgressStore'
import { useAuthStore } from '../../stores/useAuthStore'
import { useLevelStore, levelProgress } from '../../stores/useLevelStore'
import { useCurrencyStore } from '../../stores/useCurrencyStore'
import { useTasksStore } from '../../stores/useTasksStore'
import { useMascotStore } from '../../stores/useMascotStore'
import { CATEGORY_META } from '../../data/categoryMeta'
import { buildRegions } from '../../utils/regions'
import { useI18n } from '../../i18n'
import { MASCOTS } from '../../data/mascotRegistry'
import ProgressRing from '../shared/ProgressRing'

function TodayCourseCard({ course, pct, meta }) {
  const totalModules = COURSES_DATA[course.id]?.modules.length ?? 0
  return (
    <Link to={`/learn/${course.id}`}
      className="flex items-center gap-4 rounded-2xl border border-border bg-surface p-4 transition hover:border-primary hover:-translate-y-0.5">
      <ProgressRing pct={pct} accent={meta.accent} />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold text-text line-clamp-1">{course.icon} {course.title}</p>
        <p className="text-xs text-text-muted">{totalModules} clase{totalModules === 1 ? '' : 's'}</p>
      </div>
      <span className="shrink-0 rounded-lg px-3 py-1.5 text-xs font-bold text-background" style={{ background: meta.accent }}>
        {pct > 0 ? 'Continuar' : 'Empezar'}
      </span>
    </Link>
  )
}

function RegionBar({ region }) {
  const pct = region.total > 0 ? Math.round(((region.completed + region.inProgress * 0.5) / region.total) * 100) : 0
  return (
    <div className="flex items-center gap-3">
      <span className="w-32 shrink-0 truncate text-xs font-semibold text-text">{region.icon} {region.title}</span>
      <div className="h-2.5 flex-1 rounded-full bg-surface-hover">
        <div className="h-2.5 rounded-full transition-all" style={{ width: `${pct}%`, background: region.accent }} />
      </div>
      <span className="w-9 shrink-0 text-right text-[11px] tabular-nums text-text-muted">{pct}%</span>
    </div>
  )
}

function SectionTab({ id, label, icon, active, onClick }) {
  return (
    <button
      type="button"
      onClick={() => onClick(id)}
      className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold transition ${
        active ? 'bg-primary text-background' : 'border border-border text-text-muted hover:text-text'
      }`}
    >
      <span>{icon}</span>{label}
    </button>
  )
}

function DataTable({ columns, children, empty }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border">
      <table className="w-full border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-border bg-surface-hover/60">
            {columns.map((col) => (
              <th key={col} className="px-4 py-2.5 text-[11px] font-bold uppercase tracking-wide text-text-muted">{col}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border bg-surface">{children}</tbody>
      </table>
      {empty && <p className="border-t border-border px-4 py-6 text-center text-sm text-text-muted">{empty}</p>}
    </div>
  )
}

const SECTIONS = [
  { id: 'cursos',         label: 'Cursos',         icon: '📚' },
  { id: 'calificaciones', label: 'Calificaciones', icon: '📝' },
  { id: 'logros',         label: 'Logros',         icon: '🏅' },
]

export default function ProgressPage() {
  const { t }       = useI18n()
  const session     = useAuthStore((s) => s.session)
  const profile     = useAuthStore((s) => s.profile)
  const progress    = useProgressStore((s) => s.progress)
  const xp          = useLevelStore((s) => s.xp)
  const coins       = useCurrencyStore((s) => s.coins)
  const tasks       = useTasksStore((s) => s.tasks)
  const fetchTasks  = useTasksStore((s) => s.fetchMyTasks)
  const selectedMascotId = useMascotStore((s) => s.selectedMascotId)
  const { level, xpIntoLevel, xpForNextLevel, isMaxLevel } = levelProgress(xp)
  const [activeSection, setActiveSection] = useState('cursos')

  useEffect(() => { fetchTasks() }, [fetchTasks])

  const progressByCourse = useCallback((courseId) => {
    if (!hasCourseData(courseId)) return null
    const total = COURSES_DATA[courseId].modules.length
    const done  = (progress[courseId]?.moduleProgress ?? []).filter((p) => p.completed).length
    return Math.round((done / total) * 100)
  }, [progress])

  const displayName = profile?.display_name || session?.user?.email?.split('@')[0] || 'Estudiante'
  const avatarEmoji = MASCOTS.find((m) => m.id === selectedMascotId)?.icon ?? '👤'

  const completedCourses = useMemo(() => courses.filter((c) => progressByCourse(c.id) === 100), [progressByCourse])
  const inProgress       = useMemo(() => courses.filter((c) => { const p = progressByCourse(c.id); return p !== null && p > 0 && p < 100 }), [progressByCourse])
  const enrolledCourses  = [...inProgress, ...completedCourses]
  const todayCourses     = (inProgress.length > 0 ? inProgress : courses.filter((c) => !c.locked)).slice(0, 2)

  const regions = useMemo(() => buildRegions(courses, progressByCourse), [progressByCourse])
  const topRegions = useMemo(
    () => regions.filter((r) => r.total > 0).sort((a, b) => (b.completed + b.inProgress * 0.5) / b.total - (a.completed + a.inProgress * 0.5) / a.total).slice(0, 6),
    [regions]
  )

  const pending   = tasks.filter((tk) => tk.status === 'pendiente').length
  const submitted = tasks.filter((tk) => tk.status === 'entregada').length
  const graded    = tasks.filter((tk) => tk.status === 'revisada')
  const avgGrade  = graded.length > 0
    ? Math.round(graded.reduce((acc, tk) => acc + (tk.grade / tk.grade_max) * 100, 0) / graded.length)
    : null

  return (
    <div className="flex min-h-screen flex-col bg-background text-text">
      <AppTopBar />

      <main className="flex-1">
        <div className="mx-auto max-w-4xl px-4 py-6 space-y-8">

          {/* Saludo */}
          <div>
            <h1 className="text-2xl font-black text-text">Hola, {displayName} 👋</h1>
            <p className="text-sm text-text-muted mt-0.5">Este es tu avance en Oliver Academy.</p>
          </div>

          {/* Tu curso de hoy — anillos circulares en vez de barras, como en
              el resto del panel. */}
          {todayCourses.length > 0 && (
            <section>
              <h2 className="text-base font-extrabold text-text mb-3">🎯 Tu curso de hoy</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {todayCourses.map((c) => (
                  <TodayCourseCard key={c.id} course={c} pct={progressByCourse(c.id) ?? 0} meta={CATEGORY_META[c.category] ?? CATEGORY_META.Otros} />
                ))}
              </div>
            </section>
          )}

          {/* Perfil + XP/monedas */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 border-primary bg-surface-hover text-3xl">
                {avatarEmoji}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-text">{displayName}</p>
                <p className="text-xs text-text-muted">Nivel {level} · {enrolledCourses.length} curso{enrolledCourses.length === 1 ? '' : 's'}</p>
              </div>
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-primary/30 bg-primary/10 p-4">
              <div>
                <p className="text-lg font-black text-primary">{xp.toLocaleString()} XP</p>
                <p className="text-xs text-text-muted">🪙 {coins.toLocaleString()} monedas · {isMaxLevel ? 'nivel máximo' : `${xpForNextLevel - xpIntoLevel} XP para subir`}</p>
              </div>
              <Link to="/tienda" className="shrink-0 rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-background">Gastar →</Link>
            </div>
          </div>

          {/* Accesos rápidos */}
          <div className="grid gap-3 sm:grid-cols-2">
            <Link to="/mascota" className="rounded-2xl border border-violet-500/20 bg-gradient-to-br from-violet-500/15 to-fuchsia-500/5 p-4 transition hover:border-violet-500/40">
              <p className="text-2xl">🐾</p>
              <p className="mt-1 text-sm font-bold text-text">Habla con tu mascota</p>
              <p className="text-xs text-text-muted">Resuelve dudas y gana misiones de chat</p>
            </Link>
            <Link to="/logros" className="rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-500/15 to-orange-500/5 p-4 transition hover:border-amber-500/40">
              <p className="text-2xl">🏅</p>
              <p className="mt-1 text-sm font-bold text-text">Tus logros</p>
              <p className="text-xs text-text-muted">{completedCourses.length} curso{completedCourses.length === 1 ? '' : 's'} completado{completedCourses.length === 1 ? '' : 's'}</p>
            </Link>
          </div>

          {/* Avance por área — mismas "regiones" del Mapa de Aventura del
              Dashboard, mostradas aquí como barras comparables. */}
          {topRegions.length > 0 && (
            <section className="rounded-2xl border border-border bg-surface p-4">
              <h2 className="text-base font-extrabold text-text mb-4">📊 Tu avance por área</h2>
              <div className="space-y-3">
                {topRegions.map((r) => <RegionBar key={r.key} region={r} />)}
              </div>
            </section>
          )}

          {/* Cursos / Calificaciones / Logros */}
          <section className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {SECTIONS.map((s) => (
                <SectionTab key={s.id} {...s} active={activeSection === s.id} onClick={setActiveSection} />
              ))}
            </div>

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

            {activeSection === 'logros' && <AchievementsPanel className="mt-2" />}
          </section>
        </div>
      </main>

      <MascotCompanion />
    </div>
  )
}
