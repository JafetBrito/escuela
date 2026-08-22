import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AppTopBar from '../shared/AppTopBar'
import MascotCompanion from '../mascot/MascotCompanion'
import ProfileHeroCard from './ProfileHeroCard'
import PageVideoModal from '../shared/PageVideoModal'
import PatchNotesModal from '../shared/PatchNotesModal'
import courses from '../../data/courses.json'
import { COURSES_DATA, hasCourseData } from '../../data/courseRegistry'
import { useProgressStore } from '../../stores/useProgressStore'
import { useAuthStore } from '../../stores/useAuthStore'
import { useGameStore } from '../../stores/useGameStore'
import { CATEGORY_META } from '../../data/categoryMeta'
import { PATCH_NOTES, LATEST_VERSION } from '../../data/patchNotesRegistry'
import { BUILD_INFO, RECENT_COMMITS } from '../../data/buildInfo'
import { useI18n } from '../../i18n'
import { useTasksStore } from '../../stores/useTasksStore'
import { useProjectsStore } from '../../stores/useProjectsStore'
import { useExamsStore } from '../../stores/useExamsStore'
import { useQuestsStore } from '../../stores/useQuestsStore'
import { getQuestById } from '../../data/questsRegistry'
import { useNotificationsStore } from '../../stores/useNotificationsStore'
import { buildPendingActions } from '../../utils/pendingActions'
import { useGlobalMissionsStore } from '../../stores/useGlobalMissionsStore'
import { useMissionState } from '../../stores/useMissionState'
import { GLOBAL_MISSIONS, evaluateMission } from '../../data/globalMissionsRegistry'
import { COURSE_MISSIONS } from '../../data/courseMissionsRegistry'
import { useDailyRewardsStore } from '../../stores/useDailyRewardsStore'
import { buildRegions } from '../../utils/regions'

// ── Sidebar nav data ──────────────────────────────────────────────────────────
// Accesos rápidos de la pestaña Inicio (subconjunto de los 4 mundos principales).
const CAMPUS_LINKS = [
  { to: '/vr',    key: 'vr',    label: 'Campus VR',  icon: '🕶️', hideFor: ['kids', 'seniors'] },
  { to: '/mundo', key: 'mundo', label: 'Mundo 2D',   icon: '📱', hideFor: ['kids', 'seniors'] },
  { to: '/rol',   key: 'rol',   label: 'Mundo ROL',  icon: '🎲', hideFor: ['kids', 'seniors'] },
]

// ── Mapa: fila de "regiones" (src/utils/regions.js) con una línea punteada de fondo, estilo mapa
// de aventura. Cada nodo lleva a la página real de esa academia/categoría.
function WorldMapSection({ regions }) {
  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-base font-extrabold text-text">🗺️ Explora el mundo</h2>
        <Link to="/academias" className="text-xs text-primary hover:underline">Ver todas</Link>
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
                {r.state === 'current' ? 'En curso' : r.completed > 0 ? `${r.completed}/${r.total} ✓` : `${r.total} cursos`}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── Quest log: misión principal (el curso más relevante para continuar) +
// misiones secundarias (top 3 de globalMissionsRegistry/courseMissionsRegistry,
// mismo sistema que ya alimenta /misiones) + racha diaria.
function MainQuestCard({ course, pct, meta, onClick }) {
  if (!course) return null
  const started = pct !== null && pct > 0
  return (
    <div className="rounded-2xl border-2 border-primary/40 bg-gradient-to-br from-primary/10 to-transparent p-4">
      <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-primary">📜 Misión principal</p>
      <button type="button" onClick={onClick} className="flex w-full items-center gap-3 text-left">
        <span
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl"
          style={{ background: `${meta.accent}22`, border: `1px solid ${meta.accent}44` }}
        >
          {course.icon}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-text line-clamp-1">{started ? `Continúa: ${course.title}` : `Empieza: ${course.title}`}</p>
          <p className="text-xs text-text-muted line-clamp-2">{course.description}</p>
        </div>
      </button>
      {started && (
        <div className="mt-3 flex items-center gap-2">
          <div className="h-1.5 flex-1 rounded-full bg-surface-hover">
            <div className="h-1.5 rounded-full" style={{ width: `${pct}%`, background: meta.accent }} />
          </div>
          <span className="text-[10px] text-text-muted">{pct}%</span>
        </div>
      )}
      <button
        type="button"
        onClick={onClick}
        className="mt-3 rounded-lg px-3 py-1.5 text-xs font-bold text-background"
        style={{ background: meta.accent }}
      >
        {started ? 'Continuar →' : 'Empezar →'}
      </button>
    </div>
  )
}

function SideQuestRow({ mission, accepted, onAccept, onClaim }) {
  const done = mission._completed
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-surface px-3 py-2.5">
      <span className="text-xl">{mission.icon}</span>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-bold text-text line-clamp-1">{mission.title}</p>
        <p className="text-[11px] text-text-muted line-clamp-1">{mission.description}</p>
      </div>
      <div className="shrink-0">
        {done ? (
          <button type="button" onClick={() => onClaim(mission.id)}
            className="rounded-lg border border-primary bg-primary/15 px-2.5 py-1 text-[10px] font-bold text-primary">
            🎁 Reclamar
          </button>
        ) : accepted ? (
          <span className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-[10px] font-semibold text-amber-400">
            🕓 En curso
          </span>
        ) : (
          <button type="button" onClick={() => onAccept(mission.id)}
            className="rounded-lg bg-primary px-2.5 py-1 text-[10px] font-bold text-background">
            📜 Aceptar
          </button>
        )}
      </div>
    </div>
  )
}

function DailyQuestRow() {
  const canClaim = useDailyRewardsStore((s) => s.canClaim())
  const streak = useDailyRewardsStore((s) => s.streak)
  const claim = useDailyRewardsStore((s) => s.claim)
  return (
    <div className="flex items-center gap-3 rounded-xl border border-amber-500/30 bg-amber-500/5 px-3 py-2.5">
      <span className="text-xl">🔥</span>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-bold text-text">Racha diaria</p>
        <p className="text-[11px] text-text-muted">
          {streak > 0 ? `${streak} día${streak === 1 ? '' : 's'} seguidos` : 'Reclama hoy para empezar tu racha'}
        </p>
      </div>
      {canClaim ? (
        <button type="button" onClick={claim}
          className="shrink-0 rounded-lg bg-amber-500 px-2.5 py-1 text-[10px] font-bold text-background">
          🎁 Reclamar
        </button>
      ) : (
        <span className="shrink-0 rounded-lg border border-border px-2.5 py-1 text-[10px] font-semibold text-text-muted">✓ Hoy</span>
      )}
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
function InicioTab({ profile, license, categories, progressByCourse, hasAccessToCourse, handleSelect, tasks, projects, pendingExams, patchNotesOpen, setPatchNotesOpen }) {
  const { t }    = useI18n()
  const latest   = PATCH_NOTES[0]

  const inProgress = useMemo(() => courses.filter((c) => {
    const p = progressByCourse(c.id)
    return p !== null && p > 0 && p < 100
  }), [progressByCourse])

  const recommended = useMemo(() =>
    courses.filter((c) => !c.locked && (progressByCourse(c.id) === null || progressByCourse(c.id) === 0))
      .slice(0, 3),
  [progressByCourse])

  const regions = useMemo(() => buildRegions(courses, progressByCourse), [progressByCourse])
  const focusCourse = inProgress[0] ?? recommended[0] ?? null

  // Misiones secundarias del quest log: mismo cálculo que MissionsBoardPage
  // (globales + de curso, evaluadas con useMissionState), solo que aquí
  // mostramos únicamente las 3 más relevantes para no duplicar /misiones.
  const allProgress = useProgressStore((s) => s.progress)
  const missionState = useMissionState()
  const missionsAccepted = useGlobalMissionsStore((s) => s.accepted)
  const missionsClaimed = useGlobalMissionsStore((s) => s.claimed)
  const acceptMission = useGlobalMissionsStore((s) => s.acceptMission)
  const claimMissionReward = useGlobalMissionsStore((s) => s.claimReward)

  const topSideQuests = useMemo(() => {
    const courseMissions = Object.keys(allProgress).flatMap((courseId) =>
      (COURSE_MISSIONS[courseId] ?? []).map((m) => ({ ...m, _completed: evaluateMission(m, missionState) }))
    )
    const globalMissions = GLOBAL_MISSIONS.map((m) => ({ ...m, _completed: evaluateMission(m, missionState) }))
    const rank = (m) => (missionsAccepted.includes(m.id) && m._completed ? 0 : missionsAccepted.includes(m.id) ? 1 : 2)
    return [...courseMissions, ...globalMissions]
      .filter((m) => !missionsClaimed.includes(m.id))
      .sort((a, b) => rank(a) - rank(b))
      .slice(0, 3)
  }, [allProgress, missionState, missionsAccepted, missionsClaimed])

  const displayName = profile?.display_name ?? t('dashboard.defaultStudent')
  const visibleCampusLinks = CAMPUS_LINKS.filter((l) => !l.hideFor?.includes(profile?.age_profile))
  // Perfil de edad "niños"/"abuelos" (profiles.age_profile) no ve el mundo VR
  // en absoluto — /vr y /vr-templo ya están bloqueados a nivel de ruta
  // (ProtectedRoute blockAgeProfiles), así que tampoco tiene sentido
  // ofrecerle estos dos accesos directos desde el Dashboard.
  const vrAllowed = !['kids', 'seniors'].includes(profile?.age_profile)

  const playerTP = useGameStore((s) => s.player.talentPoints)
  const oliverTP = useGameStore((s) => s.oliver.talentPoints)
  const totalTP = (playerTP ?? 0) + (oliverTP ?? 0)

  const pendingActions = useMemo(
    () => buildPendingActions({ tasks, projects, exams: pendingExams, hasAccessToCourse, courses }),
    [tasks, projects, pendingExams, hasAccessToCourse]
  )

  const activeQuestMap = useQuestsStore((s) => s.active)
  const activeQuests = useMemo(
    () => Object.entries(activeQuestMap).map(([id, step]) => ({ quest: getQuestById(id), step })).filter((q) => q.quest),
    [activeQuestMap]
  )

  const notifications = useNotificationsStore((s) => s.notifications)
  const recentActivity = notifications.slice(0, 5)

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-8">

      {/* Foto + nivel + nombre + mascota — lo primero que se ve, pedido
          explícito tras revisar el Dashboard en móvil ("muestra lo más
          importante primero"). Reemplaza el saludo de texto plano + la
          tarjeta de XP que vivían más abajo. */}
      <ProfileHeroCard vrAllowed={vrAllowed} />

      <div>
        <h1 className="text-xl font-black text-text">
          {t('dashboard.greeting', { name: displayName })}{license?.role === 'admin' ? ' 🛡️' : ' 👋'}
        </h1>
        <p className="text-sm text-text-muted mt-0.5">{t('dashboard.greetingSub')}</p>
      </div>

      {vrAllowed && totalTP > 0 && (
        <Link to="/arbol" className="flex items-center justify-between gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 transition hover:bg-amber-500/15">
          <div>
            <p className="text-sm font-bold text-text">🌳 Tienes {totalTP} punto{totalTP === 1 ? '' : 's'} de talento sin gastar</p>
            <p className="text-xs text-text-muted">Úsalos en el Árbol para desbloquear habilidades.</p>
          </div>
          <span className="shrink-0 rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-bold text-background">Ir al Árbol →</span>
        </Link>
      )}

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

      {/* Mapa de aventura + quest log — reemplaza los antiguos bloques
          "Recomendadas para ti" / "Continúa aprendiendo" (listas de cursos
          sin jerarquía) por un solo hub: el mapa navega a las mismas
          academias/categorías de siempre, y el quest log es el mismo
          sistema de misiones globales/de curso que ya alimenta /misiones,
          solo que ahora visible y accionable sin salir del Inicio. */}
      <WorldMapSection regions={regions} />

      <section>
        <div className="grid gap-3 sm:grid-cols-2">
          <MainQuestCard
            course={focusCourse}
            pct={focusCourse ? progressByCourse(focusCourse.id) : null}
            meta={focusCourse ? (CATEGORY_META[focusCourse.category] ?? CATEGORY_META.Otros) : null}
            onClick={() => focusCourse && handleSelect(focusCourse)}
          />
          <div className="flex flex-col gap-2">
            <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">⚔️ Misiones secundarias</p>
            {topSideQuests.map((m) => (
              <SideQuestRow
                key={m.id}
                mission={m}
                accepted={missionsAccepted.includes(m.id)}
                onAccept={acceptMission}
                onClaim={claimMissionReward}
              />
            ))}
            <DailyQuestRow />
            <Link to="/misiones" className="text-center text-xs text-primary hover:underline">Ver tablón de misiones →</Link>
          </div>
        </div>
      </section>

      {!focusCourse && topSideQuests.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border p-8 text-center">
          <p className="text-3xl mb-2">📚</p>
          <p className="text-sm font-semibold text-text mb-1">{t('dashboard.noCoursesTitle')}</p>
          <p className="text-xs text-text-muted mb-4">{t('dashboard.noCoursesSub')}</p>
          <button type="button" className="rounded-xl bg-primary px-5 py-2 text-sm font-bold text-background">
            {t('dashboard.exploreSchools')}
          </button>
        </div>
      )}

      {/* Pendientes unificados — tareas + proyectos + exámenes en una sola
          lista (buildPendingActions, src/utils/pendingActions.js), en vez
          de solo tareas. Anuncios y mensajes viven en /anuncios (tablón +
          buzón), para no repetir el mismo contenido aquí. */}
      {pendingActions.length > 0 && (
        <div className="overflow-hidden rounded-2xl border border-amber-500/30 bg-surface">
          <div className="flex items-center justify-between border-b border-amber-500/20 bg-amber-500/5 px-4 py-3">
            <h3 className="flex items-center gap-2 text-sm font-extrabold text-text">
              <span>✅</span>{t('dashboard.myTasks')}
            </h3>
            <Link to="/mis-tareas" className="text-xs text-primary hover:underline">{t('dashboard.seeAllF')}</Link>
          </div>
          <div className="divide-y divide-border/60">
            {pendingActions.slice(0, 5).map((action) => (
              <Link key={action.id} to={action.href} className="flex items-start gap-3 px-4 py-2.5 hover:bg-surface-hover">
                <span className="mt-0.5 shrink-0 text-sm">{action.icon}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-text line-clamp-1">{action.title}</p>
                  <p className="text-[11px] text-text-muted">
                    {action.subtitle ?? { task: 'Tarea', project: 'Proyecto', exam: 'Examen' }[action.kind]}
                    {action.dueDate && ` · 📅 ${new Date(action.dueDate + 'T12:00:00').toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}`}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Misiones activas — invisibles en el dashboard hasta ahora, solo
          se veían entrando manualmente a /misiones. */}
      {vrAllowed && activeQuests.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-extrabold text-text">📜 Misiones activas</h2>
            <Link to="/misiones" className="text-xs text-primary hover:underline">Ver todas</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {activeQuests.map(({ quest, step }) => (
              <Link key={quest.id} to="/misiones"
                className="flex items-start gap-3 rounded-2xl border border-border bg-surface p-3 hover:border-primary">
                <span className="text-xl">{quest.icon}</span>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-text line-clamp-1">{quest.title}</p>
                  <p className="text-xs text-text-muted">Paso {step + 1}/{quest.steps.length}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Actividad reciente — reusa las notificaciones que NotificationBell
          ya carga (fetchNotifications/subscribeToNotifications se llaman
          desde AppTopBar, sin fetch propio aquí). No incluye recompensas de
          misiones ni de graduación de examen: esas otorgan XP/oro directo
          (useQuestsStore.claimReward, grantGraduationRewards en
          useExamsStore.js) sin insertar una fila en student_notifications. */}
      {recentActivity.length > 0 && (
        <section>
          <h2 className="text-base font-extrabold text-text mb-3">🔔 Actividad reciente</h2>
          <div className="divide-y divide-border rounded-2xl border border-border bg-surface">
            {recentActivity.map((n) => (
              <div key={n.id} className="flex items-start justify-between gap-3 px-4 py-2.5">
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-text line-clamp-1">{n.title}</p>
                  {n.body && <p className="text-[11px] text-text-muted line-clamp-1">{n.body}</p>}
                </div>
                {(n.xp_reward > 0 || n.gold_reward > 0) && (
                  <span className="shrink-0 text-[11px] font-bold text-primary">
                    {n.xp_reward > 0 && `+${n.xp_reward} XP`}{n.xp_reward > 0 && n.gold_reward > 0 ? ' · ' : ''}{n.gold_reward > 0 && `+${n.gold_reward} 🪙`}
                  </span>
                )}
              </div>
            ))}
          </div>
        </section>
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

// ── Page ──────────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const navigate          = useNavigate()
  const progress          = useProgressStore((s) => s.progress)
  const license           = useAuthStore((s) => s.license)
  const profile           = useAuthStore((s) => s.profile)
  const hasAccessToCourse = useAuthStore((s) => s.hasAccessToCourse)
  const tasks             = useTasksStore((s) => s.tasks)
  const fetchTasks        = useTasksStore((s) => s.fetchMyTasks)
  const projects          = useProjectsStore((s) => s.projects)
  const fetchProjects     = useProjectsStore((s) => s.fetchMyProjects)
  const pendingExams      = useExamsStore((s) => s.pendingExams)
  const fetchPendingExams = useExamsStore((s) => s.fetchPendingExams)
  const session           = useAuthStore((s) => s.session)

  const [patchNotesOpen, setPatchNotesOpen] = useState(false)

  useEffect(() => { fetchTasks(); fetchProjects() }, [fetchTasks, fetchProjects])
  useEffect(() => { if (session?.user?.id) fetchPendingExams(session.user.id) }, [session?.user?.id, fetchPendingExams])

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
      {patchNotesOpen && <PatchNotesModal open force onClose={() => setPatchNotesOpen(false)} />}

      <AppTopBar />

      {/* "Mi Progreso" ahora vive en su propia ruta (/progreso, ver
          ProgressPage.jsx) en vez de ser una pestaña aquí — Inicio es la
          única vista de esta página. */}
      <main className="flex-1">
        <InicioTab
          profile={profile}
          license={license}
          tasks={tasks}
          projects={projects}
          pendingExams={pendingExams}
          patchNotesOpen={patchNotesOpen}
          setPatchNotesOpen={setPatchNotesOpen}
          {...tabProps}
        />
      </main>

      <MascotCompanion />
    </div>
  )
}
