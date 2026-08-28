import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AppTopBar from '../shared/AppTopBar'
import MascotCompanion from '../mascot/MascotCompanion'
import { useTasksStore } from '../../stores/useTasksStore'
import { taskTypeOf, localizeTaskTypeLabel } from '../../data/taskTypes'
import { dueInfo, classifyTask, URGENCY_LABEL } from '../../utils/taskDue'
import { useI18n } from '../../i18n'
import { localizeCategoryName } from '../../data/categoryTranslations'

// ── Subject config ─────────────────────────────────────────────────────────────
const SUBJECTS = {
  Matemáticas:  { color: '#3b82f6', icon: '📐' },
  Física:       { color: '#f59e0b', icon: '⚡' },
  Historia:     { color: '#f97316', icon: '🏛️' },
  Biología:     { color: '#10b981', icon: '🧬' },
  Química:      { color: '#8b5cf6', icon: '⚗️' },
  Filosofía:    { color: '#eab308', icon: '💭' },
  Psicología:   { color: '#ec4899', icon: '🧠' },
  Programación: { color: '#06b6d4', icon: '💻' },
  Inglés:       { color: '#6366f1', icon: '🌐' },
  Literatura:   { color: '#f43f5e', icon: '📖' },
  Geografía:    { color: '#84cc16', icon: '🌍' },
  Arte:         { color: '#f472b6', icon: '🎨' },
}

const DEFAULT_SUBJECT = { color: '#98ca3f', icon: '📚' }

function subjectOf(name) { return SUBJECTS[name] ?? DEFAULT_SUBJECT }

// ── Grade helpers ──────────────────────────────────────────────────────────────
function letterGrade(pct) {
  if (pct >= 0.95) return 'A+'
  if (pct >= 0.90) return 'A'
  if (pct >= 0.85) return 'A−'
  if (pct >= 0.80) return 'B+'
  if (pct >= 0.75) return 'B'
  if (pct >= 0.70) return 'B−'
  if (pct >= 0.65) return 'C+'
  if (pct >= 0.60) return 'C'
  if (pct >= 0.55) return 'C−'
  if (pct >= 0.50) return 'D'
  return 'F'
}

function gradeColor(pct) {
  if (pct >= 0.85) return '#10b981'
  if (pct >= 0.70) return '#f59e0b'
  if (pct >= 0.50) return '#f97316'
  return '#ef4444'
}

function buildGroups(t) {
  return [
    { key: 'overdue', label: t('pages.tasks.groupOverdue'), cls: 'text-red-400 border-red-500/20' },
    { key: 'urgent',  label: t('pages.tasks.groupUrgent'),  cls: 'text-amber-400 border-amber-500/20' },
    { key: 'week',    label: t('pages.tasks.groupWeek'),    cls: 'text-yellow-400 border-yellow-500/20' },
    { key: 'later',   label: t('pages.tasks.groupLater'),   cls: 'text-text-muted border-border/40' },
    { key: 'done',    label: t('pages.tasks.groupDone'),    cls: 'text-emerald-400 border-emerald-500/20' },
  ]
}

// ── GPA ring ───────────────────────────────────────────────────────────────────
function GpaRing({ value, max = 10 }) {
  const pct  = Math.min(value / max, 1)
  const r    = 28
  const circ = 2 * Math.PI * r
  const dash = circ * pct
  const color = gradeColor(pct)

  return (
    <div className="relative flex items-center justify-center" style={{ width: 80, height: 80 }}>
      <svg width="80" height="80" className="-rotate-90">
        <circle cx="40" cy="40" r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="6" />
        <circle
          cx="40" cy="40" r={r} fill="none"
          stroke={color} strokeWidth="6"
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 0.6s ease' }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-xl font-black text-white leading-none">{value.toFixed(1)}</span>
        <span className="text-[10px] font-bold" style={{ color }}>{letterGrade(pct)}</span>
      </div>
    </div>
  )
}

// ── Task card ──────────────────────────────────────────────────────────────────
function TaskCard({ task, onOpen }) {
  const { t, lang } = useI18n()
  const [feedbackOpen, setFeedbackOpen] = useState(false)

  const subj    = subjectOf(task.subject)
  const type    = taskTypeOf(task.type)
  const due     = dueInfo(task.due_date, task.status, t)
  const hasGrade = task.grade != null
  const gradePct = hasGrade ? task.grade / (task.grade_max ?? 10) : null

  return (
    <div
      onClick={() => onOpen?.(task.id)}
      className="relative overflow-hidden rounded-2xl border border-border bg-surface transition-all hover:border-border/80 cursor-pointer"
      style={{ borderLeft: `4px solid ${subj.color}` }}
    >
      {/* ── Card body ─────────────────────────────────────── */}
      <div className="p-4">

        {/* Top row: type + subject + status + grade */}
        <div className="flex flex-wrap items-center gap-2">
          <span
            className="flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold"
            style={{ backgroundColor: `${type.color}18`, color: type.color, border: `1px solid ${type.color}30` }}
          >
            {type.icon} {localizeTaskTypeLabel(task.type, lang)}
          </span>
          <span
            className="flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold"
            style={{ backgroundColor: `${subj.color}18`, color: subj.color, border: `1px solid ${subj.color}30` }}
          >
            {subj.icon} {localizeCategoryName(task.subject ?? 'General', lang)}
          </span>

          {/* Status badge */}
          {task.status === 'pendiente' && due?.urgency === 'overdue' && (
            <span className="rounded-full border border-red-500/40 bg-red-500/10 px-2.5 py-0.5 text-[11px] font-bold text-red-400">
              {t('pages.tasks.statusOverdue')}
            </span>
          )}
          {task.status === 'pendiente' && due?.urgency !== 'overdue' && (
            <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-bold text-amber-400">
              {t('pages.tasks.statusPending')}
            </span>
          )}
          {task.status === 'entregada' && (
            <span className="rounded-full border border-blue-500/30 bg-blue-500/10 px-2.5 py-0.5 text-[11px] font-bold text-blue-400">
              {t('pages.tasks.statusDelivered')}
            </span>
          )}
          {task.status === 'revisada' && (
            <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-bold text-emerald-400">
              {t('pages.tasks.statusReviewed')}
            </span>
          )}

          {/* Grade pill */}
          {hasGrade && (
            <span
              className="ml-auto rounded-full px-3 py-0.5 text-sm font-extrabold"
              style={{ color: gradeColor(gradePct), backgroundColor: `${gradeColor(gradePct)}15`, border: `1px solid ${gradeColor(gradePct)}30` }}
            >
              {task.grade}/{task.grade_max ?? 10} · {letterGrade(gradePct)}
            </span>
          )}
        </div>

        {/* Title & description */}
        <h3 className="mt-2.5 text-base font-bold text-text">{task.title}</h3>
        {task.description && (
          <p className="mt-1 text-sm leading-relaxed text-text-muted line-clamp-2">{task.description}</p>
        )}

        {/* Detalle rápido por tipo */}
        {task.type === 'examen' && (task.details?.time || task.details?.duration_minutes || task.details?.modality) && (
          <p className="mt-1.5 flex flex-wrap gap-3 text-xs font-semibold text-red-400/90">
            {task.details?.time && <span>🕐 {task.details.time}</span>}
            {task.details?.duration_minutes && <span>⏱️ {task.details.duration_minutes} min</span>}
            {task.details?.modality && <span>📍 {task.details.modality}</span>}
          </p>
        )}
        {task.type === 'proyecto' && task.details?.deliverables?.length > 0 && (
          <p className="mt-1.5 text-xs font-semibold text-purple-400/90">
            {task.details.deliverables.length === 1
              ? t('pages.tasks.deliverableCountOne')
              : t('pages.tasks.deliverableCountMany', { n: task.details.deliverables.length })}
          </p>
        )}

        {/* Grade bar (when graded) */}
        {hasGrade && (
          <div className="mt-3 flex items-center gap-3">
            <div className="h-1.5 flex-1 rounded-full bg-surface-hover">
              <div
                className="h-1.5 rounded-full transition-all"
                style={{ width: `${gradePct * 100}%`, backgroundColor: gradeColor(gradePct) }}
              />
            </div>
            <span className="shrink-0 text-xs font-bold text-text-muted">{Math.round(gradePct * 100)}%</span>
          </div>
        )}

        {/* Bottom row: due date + action */}
        <div className="mt-3 flex items-center justify-between gap-3">
          {due ? (
            <p className={`flex items-center gap-1.5 text-xs font-medium ${URGENCY_LABEL[due.urgency]}`}>
              <span>📅</span>
              {due.text}
            </p>
          ) : <span />}

          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            {task.status === 'revisada' && task.feedback && (
              <button
                type="button"
                onClick={() => setFeedbackOpen((v) => !v)}
                className="rounded-lg border border-primary/30 px-3 py-1.5 text-xs font-semibold text-primary transition hover:bg-primary/10"
              >
                💬 {feedbackOpen ? t('pages.tasks.hideComments') : t('pages.tasks.viewComments')}
              </button>
            )}
            {task.status === 'pendiente' && (
              <span className="rounded-lg px-3 py-1.5 text-xs font-bold text-background transition"
                style={{ backgroundColor: subj.color }}>
                {t('pages.tasks.openToSubmit')}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Feedback section */}
      {feedbackOpen && task.feedback && (
        <div className="border-t border-border/50 bg-surface-hover px-4 py-3">
          <p className="mb-1 text-[10px] font-extrabold uppercase tracking-widest" style={{ color: subj.color }}>
            {t('pages.tasks.teacherComments')}
          </p>
          <p className="text-sm leading-relaxed text-text">{task.feedback}</p>
        </div>
      )}
    </div>
  )
}

// ── Grades view ────────────────────────────────────────────────────────────────
function GradesView({ tasks }) {
  const { t, lang } = useI18n()
  const graded = tasks.filter((tk) => tk.grade != null)

  // Group by subject
  const bySubject = {}
  for (const tk of graded) {
    const key = tk.subject ?? 'General'
    if (!bySubject[key]) bySubject[key] = []
    bySubject[key].push(tk)
  }

  const subjects = Object.entries(bySubject).map(([subj, ts]) => {
    const avg = ts.reduce((s, t) => s + t.grade / (t.grade_max ?? 10), 0) / ts.length
    return { subj, tasks: ts, avg, cfg: subjectOf(subj) }
  }).sort((a, b) => b.avg - a.avg)

  const overallAvg = graded.length
    ? graded.reduce((s, t) => s + t.grade / (t.grade_max ?? 10), 0) / graded.length
    : null

  if (graded.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-border bg-surface py-20 text-center">
        <span className="text-5xl">📊</span>
        <div>
          <p className="font-bold text-text">{t('pages.tasks.noGradesYet')}</p>
          <p className="mt-1 text-sm text-text-muted">{t('pages.tasks.gradesNoneHint')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Overall summary card */}
      <div
        className="rounded-2xl p-5"
        style={{ background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1030 100%)', border: '1px solid rgba(255,255,255,0.07)' }}
      >
        <div className="flex flex-wrap items-center gap-6">
          <GpaRing value={overallAvg * 10} />
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-white/30">{t('pages.tasks.overallAverage')}</p>
            <p className="text-3xl font-extrabold text-white">{(overallAvg * 10).toFixed(2)}<span className="text-lg text-white/40">/10</span></p>
            <p className="mt-0.5 text-sm font-bold" style={{ color: gradeColor(overallAvg) }}>
              {letterGrade(overallAvg)} — {graded.length === 1 ? t('pages.tasks.gradedTaskOne') : t('pages.tasks.gradedTaskMany', { n: graded.length })}
            </p>
          </div>
        </div>
      </div>

      {/* Per-subject breakdown */}
      <div className="space-y-4">
        {subjects.map(({ subj, tasks: ts, avg, cfg }) => (
          <div key={subj} className="overflow-hidden rounded-2xl border border-border bg-surface" style={{ borderLeft: `4px solid ${cfg.color}` }}>
            {/* Subject header */}
            <div className="flex items-center justify-between px-4 py-3" style={{ background: `${cfg.color}08` }}>
              <div className="flex items-center gap-2">
                <span className="text-lg">{cfg.icon}</span>
                <span className="font-bold text-text">{localizeCategoryName(subj, lang)}</span>
                <span className="text-xs text-text-muted">— {ts.length === 1 ? t('pages.tasks.taskCountOne') : t('pages.tasks.taskCountMany', { n: ts.length })}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-lg font-extrabold" style={{ color: gradeColor(avg) }}>
                    {(avg * 10).toFixed(1)}<span className="text-xs text-text-muted">/10</span>
                  </p>
                  <p className="text-[10px] font-bold" style={{ color: gradeColor(avg) }}>{letterGrade(avg)}</p>
                </div>
                <div className="h-10 w-10 flex items-center justify-center rounded-full text-xs font-extrabold"
                  style={{ backgroundColor: `${cfg.color}20`, color: cfg.color, border: `2px solid ${cfg.color}40` }}>
                  {Math.round(avg * 100)}%
                </div>
              </div>
            </div>

            {/* Grade bar */}
            <div className="h-1 w-full bg-surface-hover">
              <div className="h-1 transition-all" style={{ width: `${avg * 100}%`, backgroundColor: gradeColor(avg) }} />
            </div>

            {/* Individual tasks */}
            <div className="divide-y divide-border/40">
              {ts.sort((a, b) => new Date(b.created_at ?? 0) - new Date(a.created_at ?? 0)).map((tk) => {
                const tPct = tk.grade / (tk.grade_max ?? 10)
                return (
                  <div key={tk.id} className="flex items-center gap-3 px-4 py-2.5">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-text">{tk.title}</p>
                      {tk.due_date && (
                        <p className="text-[11px] text-text-muted">
                          {new Date(tk.due_date + 'T12:00:00').toLocaleDateString(t('pages.tasks.dateLocale'), { day:'numeric', month:'short', year:'numeric' })}
                        </p>
                      )}
                    </div>
                    {tk.feedback && (
                      <span className="shrink-0 rounded-full border border-primary/20 px-2 py-0.5 text-[10px] text-primary" title={tk.feedback}>💬</span>
                    )}
                    <div className="shrink-0 text-right">
                      <p className="text-sm font-extrabold" style={{ color: gradeColor(tPct) }}>
                        {tk.grade}/{tk.grade_max ?? 10}
                      </p>
                      <p className="text-[10px] font-bold" style={{ color: gradeColor(tPct) }}>{letterGrade(tPct)}</p>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Feedback callouts */}
            {ts.some((t) => t.feedback) && (
              <div className="space-y-2 border-t border-border/40 bg-surface-hover px-4 py-3">
                {ts.filter((t) => t.feedback).map((t) => (
                  <div key={t.id}>
                    <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: cfg.color }}>{t.title}</p>
                    <p className="mt-0.5 text-xs leading-relaxed text-text-muted">"{t.feedback}"</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Main page ──────────────────────────────────────────────────────────────────
export default function TasksPage() {
  const { t, lang }   = useI18n()
  const navigate      = useNavigate()
  const tasks        = useTasksStore((s) => s.tasks)
  const loading      = useTasksStore((s) => s.loading)
  const fetchMyTasks = useTasksStore((s) => s.fetchMyTasks)
  const openTask     = (id) => navigate(`/mis-tareas/${id}`)

  const [activeSubject, setActiveSubject] = useState('all')
  const [activeTab,     setActiveTab]     = useState('tasks')

  useEffect(() => { fetchMyTasks() }, [fetchMyTasks])

  // ── Derived stats ────────────────────────────────────────────────────────────
  const graded  = tasks.filter((t) => t.grade != null)
  const avgPct  = graded.length ? graded.reduce((s, t) => s + t.grade / (t.grade_max ?? 10), 0) / graded.length : null
  const avgVal  = avgPct != null ? (avgPct * 10) : null

  const pending   = tasks.filter((t) => t.status === 'pendiente').length
  const delivered = tasks.filter((t) => t.status === 'entregada').length
  const reviewed  = tasks.filter((t) => t.status === 'revisada').length
  const total     = tasks.length
  const completionPct = total ? Math.round(((delivered + reviewed) / total) * 100) : 0

  // ── Subject sidebar ──────────────────────────────────────────────────────────
  const subjects = [...new Set(tasks.map((t) => t.subject).filter(Boolean))].sort()

  // ── Filtered + grouped tasks ─────────────────────────────────────────────────
  const filtered = activeSubject === 'all' ? tasks : tasks.filter((t) => t.subject === activeSubject)

  // "done" (entregada/revisada) vive en su propia pestaña "Completadas" —
  // no se mezcla con las tareas activas para que quede claro qué falta hacer.
  const grouped = buildGroups(t)
    .filter((g) => g.key !== 'done')
    .map((g) => ({
      ...g,
      tasks: filtered
        .filter((t) => classifyTask(t) === g.key)
        .sort((a, b) => {
          if (!a.due_date && !b.due_date) return 0
          if (!a.due_date) return 1
          if (!b.due_date) return -1
          return new Date(a.due_date) - new Date(b.due_date)
        }),
    })).filter((g) => g.tasks.length > 0)

  // Entregadas y en espera de revisión — es el mismo estado ("entregada")
  // que el profesor ve como "por revisar", solo cambia quién lo nombra.
  const submittedTasks = filtered
    .filter((t) => t.status === 'entregada')
    .sort((a, b) => new Date(b.updated_at ?? b.created_at ?? 0) - new Date(a.updated_at ?? a.created_at ?? 0))

  return (
    <div className="flex min-h-screen flex-col bg-background text-text">
      <AppTopBar />

      <main className="flex-1 px-4 py-6 md:px-8">
        <div className="mx-auto max-w-6xl">

          {/* ── Hero stats ──────────────────────────────────────────── */}
          <div
            className="overflow-hidden rounded-2xl p-6 shadow-xl"
            style={{ background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1030 50%, #0f1a24 100%)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            <div className="flex flex-wrap items-center gap-6">

              {/* GPA ring */}
              {avgVal != null ? (
                <GpaRing value={avgVal} />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-white/10">
                  <span className="text-2xl text-white/20">—</span>
                </div>
              )}

              {/* Text stats */}
              <div className="flex-1">
                <h1 className="text-2xl font-extrabold text-white">{t('pages.tasks.title')}</h1>
                <p className="mt-0.5 text-sm text-white/50">
                  {avgVal != null ? t('pages.tasks.avgGeneral', { avg: avgVal.toFixed(1), letter: letterGrade(avgPct) }) : t('pages.tasks.noGradesYet')}
                </p>

                {/* Completion bar */}
                <div className="mt-3 flex items-center gap-3">
                  <div className="h-2 flex-1 rounded-full bg-white/10">
                    <div
                      className="h-2 rounded-full bg-emerald-400 transition-all"
                      style={{ width: `${completionPct}%` }}
                    />
                  </div>
                  <span className="shrink-0 text-xs font-bold text-white/50">{t('pages.tasks.completedPct', { pct: completionPct })}</span>
                </div>
              </div>

              {/* Pill counters */}
              <div className="flex gap-3">
                <div className="flex flex-col items-center rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-2.5">
                  <span className="text-xl font-extrabold text-amber-400">{pending}</span>
                  <span className="text-[10px] font-semibold text-amber-500/70">{t('pages.tasks.pending')}</span>
                </div>
                <div className="flex flex-col items-center rounded-xl border border-blue-500/20 bg-blue-500/10 px-4 py-2.5">
                  <span className="text-xl font-extrabold text-blue-400">{delivered}</span>
                  <span className="text-[10px] font-semibold text-blue-500/70">{t('pages.tasks.delivered')}</span>
                </div>
                <div className="flex flex-col items-center rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-2.5">
                  <span className="text-xl font-extrabold text-emerald-400">{reviewed}</span>
                  <span className="text-[10px] font-semibold text-emerald-500/70">{t('pages.tasks.reviewed')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── Tabs ─────────────────────────────────────────────────── */}
          <div className="mt-6 flex gap-1 rounded-xl border border-border bg-surface p-1">
            {[
              { key: 'tasks',     label: t('pages.tasks.tabTasks'),     badge: pending > 0 ? pending : null },
              { key: 'submitted', label: t('pages.tasks.tabSubmitted'), badge: delivered > 0 ? delivered : null },
              { key: 'grades',    label: t('pages.tasks.tabGrades'),    badge: reviewed > 0 ? reviewed : null },
            ].map(({ key, label, badge }) => (
              <button
                key={key}
                type="button"
                onClick={() => setActiveTab(key)}
                className={`relative flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-bold transition ${
                  activeTab === key ? 'bg-background text-text shadow-sm' : 'text-text-muted hover:text-text'
                }`}
              >
                {label}
                {badge && (
                  <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-extrabold ${
                    activeTab === key ? 'bg-primary/20 text-primary' : 'bg-surface-hover text-text-muted'
                  }`}>
                    {badge}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* ── Body: sidebar + content ───────────────────────────────── */}
          <div className="mt-4 flex gap-6">

            {/* Sidebar: subject filter (tasks/submitted tabs) */}
            {(activeTab === 'tasks' || activeTab === 'submitted') && (
              <aside className="hidden w-52 shrink-0 md:block">
                <div className="sticky top-4 rounded-2xl border border-border bg-surface p-3">
                  <p className="mb-2 px-2 text-[10px] font-extrabold uppercase tracking-widest text-text-muted/60">
                    {t('pages.tasks.subjectsLabel')}
                  </p>

                  <button
                    type="button"
                    onClick={() => setActiveSubject('all')}
                    className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm font-semibold transition ${
                      activeSubject === 'all' ? 'bg-primary/10 text-primary' : 'text-text-muted hover:text-text'
                    }`}
                  >
                    <span>{t('pages.tasks.allSubjects')}</span>
                    <span className="rounded-full bg-surface-hover px-2 py-0.5 text-xs">{tasks.length}</span>
                  </button>

                  {subjects.map((subj) => {
                    const cfg = subjectOf(subj)
                    const cnt = tasks.filter((tk) => tk.subject === subj).length
                    const active = activeSubject === subj
                    return (
                      <button
                        key={subj}
                        type="button"
                        onClick={() => setActiveSubject(subj)}
                        className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm font-semibold transition ${
                          active ? 'text-white' : 'text-text-muted hover:text-text'
                        }`}
                        style={active ? { backgroundColor: `${cfg.color}20`, color: cfg.color } : {}}
                      >
                        <span>{cfg.icon} {localizeCategoryName(subj, lang)}</span>
                        <span
                          className="rounded-full px-2 py-0.5 text-xs"
                          style={active ? { backgroundColor: `${cfg.color}30`, color: cfg.color } : { backgroundColor: 'var(--color-surface-hover)' }}
                        >
                          {cnt}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </aside>
            )}

            {/* Main content area */}
            <div className="min-w-0 flex-1">

              {/* ── Tasks tab ─────────────────────────────── */}
              {activeTab === 'tasks' && (
                loading ? (
                  <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
                    <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
                    <p className="text-sm text-text-muted">{t('pages.tasks.loadingTasks')}</p>
                  </div>
                ) : grouped.length === 0 ? (
                  <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-border bg-surface py-20 text-center">
                    <span className="text-5xl">🎉</span>
                    <div>
                      <p className="font-bold text-text">{t('pages.tasks.allCaughtUpTitle')}</p>
                      <p className="mt-1 text-sm text-text-muted">{t('pages.tasks.allCaughtUpHint')}</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-8">
                    {grouped.map((group) => (
                      <section key={group.key}>
                        <div className={`mb-3 flex items-center gap-3 border-b pb-2 ${group.cls}`}>
                          <h2 className="text-sm font-extrabold">{group.label}</h2>
                          <span className="text-xs font-bold opacity-60">
                            {group.tasks.length === 1 ? t('pages.tasks.taskCountOne') : t('pages.tasks.taskCountMany', { n: group.tasks.length })}
                          </span>
                        </div>
                        <div className="space-y-3">
                          {group.tasks.map((task) => (
                            <TaskCard key={task.id} task={task} onOpen={openTask} />
                          ))}
                        </div>
                      </section>
                    ))}
                  </div>
                )
              )}

              {/* ── Submitted tab (enviada / por revisión) ── */}
              {activeTab === 'submitted' && (
                loading ? (
                  <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
                    <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
                    <p className="text-sm text-text-muted">{t('pages.tasks.loadingGeneric')}</p>
                  </div>
                ) : submittedTasks.length === 0 ? (
                  <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-border bg-surface py-20 text-center">
                    <span className="text-5xl">📭</span>
                    <div>
                      <p className="font-bold text-text">{t('pages.tasks.nothingPendingReview')}</p>
                      <p className="mt-1 text-sm text-text-muted">{t('pages.tasks.nothingPendingReviewHint')}</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {submittedTasks.map((task) => (
                      <TaskCard key={task.id} task={task} onOpen={openTask} />
                    ))}
                  </div>
                )
              )}

              {/* ── Grades tab (calificadas) ─────────────── */}
              {activeTab === 'grades' && (
                loading ? (
                  <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
                    <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
                    <p className="text-sm text-text-muted">{t('pages.tasks.loadingGrades')}</p>
                  </div>
                ) : (
                  <GradesView tasks={tasks} />
                )
              )}
            </div>
          </div>
        </div>
      </main>

      <MascotCompanion />
    </div>
  )
}
