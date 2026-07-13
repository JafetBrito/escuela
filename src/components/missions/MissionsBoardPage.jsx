import { useState } from 'react'
import AppTopBar from '../shared/AppTopBar'
import MascotCompanion from '../mascot/MascotCompanion'
import PageVideoModal from '../shared/PageVideoModal'
import NpcViewport from '../mascot/NpcViewport'
import NpcChatPanel from '../shared/NpcChatPanel'
import QuestCard from './QuestCard'
import { GLOBAL_MISSIONS, evaluateMission } from '../../data/globalMissionsRegistry'
import { COURSE_MISSIONS } from '../../data/courseMissionsRegistry'
import { QUESTS } from '../../data/questsRegistry'
import { useGlobalMissionsStore } from '../../stores/useGlobalMissionsStore'
import { useQuestsStore } from '../../stores/useQuestsStore'
import { useProgressStore } from '../../stores/useProgressStore'
import { useMissionState } from '../../stores/useMissionState'
import { formatCurrency } from '../../utils/currency'
import { COURSES_DATA } from '../../data/courseRegistry'
import { useI18n } from '../../i18n'

const MAX_ACTIVE = 25

const MAGE_MASCOT_ID = 9
const MAGE_PROMPT = `Eres el Maestro de Misiones, un sabio mago anciano que entrega misiones en OLIVER ACADEMY. Hablas en español con un tono místico, motivador y solemne, como un mentor de RPG. Animas al estudiante a aceptar y completar misiones. Mantén tus respuestas breves (2-4 frases) y siempre en personaje.`

const CATEGORY_STYLE = {
  Academia:      'border-violet-500/30 bg-violet-500/10 text-violet-400',
  Social:        'border-blue-500/30 bg-blue-500/10 text-blue-400',
  Exploración:   'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
  Personalización:'border-pink-500/30 bg-pink-500/10 text-pink-400',
  Progresión:    'border-amber-500/30 bg-amber-500/10 text-amber-400',
}

function categoryStyle(cat) {
  return CATEGORY_STYLE[cat] ?? 'border-slate-500/30 bg-slate-500/10 text-slate-400'
}

function MissionCard({ mission, accepted, completed, claimed, onAccept, onClaim, locked }) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border transition-all ${
        claimed
          ? 'border-primary/30 bg-primary/5 opacity-60'
          : completed && accepted
            ? 'border-primary/50 bg-primary/10 shadow-sm shadow-primary/20'
            : accepted
              ? 'border-amber-500/30 bg-amber-500/5'
              : locked
                ? 'border-border/40 bg-surface/50 opacity-60'
                : 'border-border bg-surface hover:border-primary/30 hover:shadow-md'
      }`}
    >
      {/* Status strip */}
      {completed && accepted && !claimed && (
        <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-primary to-emerald-400" />
      )}

      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl ${
            claimed ? 'bg-primary/10' : completed && accepted ? 'bg-primary/15' : 'bg-background'
          }`}>
            {claimed ? '✅' : mission.icon}
          </div>

          {/* Content */}
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <p className={`text-sm font-bold ${claimed ? 'text-primary' : 'text-text'}`}>
                {mission.title}
              </p>
              {mission.category && (
                <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${categoryStyle(mission.category)}`}>
                  {mission.category}
                </span>
              )}
            </div>
            <p className="mb-2 text-xs leading-relaxed text-text-muted">
              {mission.description}
            </p>

            {/* NPC + Rewards row */}
            <div className="flex flex-wrap items-center gap-3 text-xs">
              {mission.npc && (
                <span className="flex items-center gap-1 text-text-muted">
                  <span>{mission.npcIcon ?? '👤'}</span>
                  <span className="font-medium text-text">{mission.npc}</span>
                </span>
              )}
              <span className="flex items-center gap-1 text-amber-400">
                <span>🪙</span>
                <span className="font-semibold">{formatCurrency(mission.reward)}</span>
              </span>
              {mission.xpReward > 0 && (
                <span className="flex items-center gap-1 text-violet-400">
                  <span>⭐</span>
                  <span className="font-semibold">{mission.xpReward} XP</span>
                </span>
              )}
            </div>
          </div>

          {/* Action */}
          <div className="ml-2 shrink-0 self-center">
            {claimed ? (
              <span className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[11px] font-bold text-primary">
                ✅ Hecho
              </span>
            ) : locked ? (
              <span className="rounded-lg border border-border px-3 py-1.5 text-[11px] font-semibold text-text-muted">
                🔒 Límite
              </span>
            ) : !accepted ? (
              <button
                onClick={() => onAccept(mission.id)}
                className="rounded-xl bg-primary px-3 py-1.5 text-[11px] font-bold text-background transition-colors hover:bg-primary-hover"
              >
                📜 Aceptar
              </button>
            ) : completed ? (
              <button
                onClick={() => onClaim(mission.id)}
                className="rounded-xl border border-primary bg-primary/15 px-3 py-1.5 text-[11px] font-bold text-primary transition-colors hover:bg-primary/25"
              >
                🎁 Reclamar
              </button>
            ) : (
              <span className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-[11px] font-semibold text-amber-400">
                🕓 En progreso
              </span>
            )}
          </div>
        </div>

        {/* Progress hint when accepted but not done */}
        {accepted && !completed && !claimed && mission.hint && (
          <p className="mt-2 rounded-lg border border-border bg-background px-3 py-2 text-xs text-text-muted">
            💡 {mission.hint}
          </p>
        )}
      </div>
    </div>
  )
}

function SectionHeader({ icon, title, count, total }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xl">{icon}</span>
      <div>
        <h2 className="text-sm font-black uppercase tracking-widest text-text-muted">{title}</h2>
        {total != null && (
          <p className="text-xs text-text-muted">{count}/{total} completadas</p>
        )}
      </div>
    </div>
  )
}

export default function MissionsBoardPage() {
  const { t } = useI18n()
  const [activeTab, setActiveTab] = useState('disponibles')

  const accepted      = useGlobalMissionsStore((s) => s.accepted)
  const claimed       = useGlobalMissionsStore((s) => s.claimed)
  const acceptMission = useGlobalMissionsStore((s) => s.acceptMission)
  const claimReward   = useGlobalMissionsStore((s) => s.claimReward)
  const missionState  = useMissionState()

  const questsActive    = useQuestsStore((s) => s.active)
  const questsCompleted = useQuestsStore((s) => s.completed)
  const questsClaimed   = useQuestsStore((s) => s.claimed)
  const acceptQuest     = useQuestsStore((s) => s.acceptQuest)
  const claimQuestReward = useQuestsStore((s) => s.claimReward)

  const allProgress = useProgressStore((s) => s.progress)

  // Course missions: only for courses the student has opened
  const enrolledCourseIds = Object.keys(allProgress)
  const courseMissionEntries = enrolledCourseIds.flatMap((courseId) => {
    const missions = COURSE_MISSIONS[courseId] ?? []
    const courseTitle = COURSES_DATA[courseId]?.title ?? courseId
    return missions.map((m) => ({
      ...m,
      _courseId: courseId,
      _courseTitle: courseTitle,
      _completed: evaluateMission(m, missionState),
    }))
  })

  // Global missions evaluated
  const globalEvaluated = GLOBAL_MISSIONS.map((m) => ({
    ...m,
    _completed: evaluateMission(m, missionState),
  }))

  // Total active count (accepted missions not yet claimed)
  const activeCount = accepted.filter((id) => !claimed.includes(id)).length
  const isAtLimit = activeCount >= MAX_ACTIVE

  // Split: available vs completed
  const globalAvail   = globalEvaluated.filter((m) => !claimed.includes(m.id))
  const globalDone    = globalEvaluated.filter((m) => claimed.includes(m.id))
  const courseAvail   = courseMissionEntries.filter((m) => !claimed.includes(m.id))
  const courseDone    = courseMissionEntries.filter((m) => claimed.includes(m.id))
  const questsAvail   = QUESTS.filter((q) => !questsClaimed.includes(q.id))
  const questsDone    = QUESTS.filter((q) => questsClaimed.includes(q.id))

  const totalMissions = globalEvaluated.length + courseMissionEntries.length
  const completedCount = globalDone.length + courseDone.length

  const tabs = [
    { id: 'disponibles', label: 'Disponibles', count: globalAvail.length + courseAvail.length + questsAvail.length },
    { id: 'completadas', label: 'Completadas', count: completedCount + questsDone.length },
  ]

  return (
    <div className="flex min-h-screen flex-col bg-background text-text">
      <AppTopBar />
      <PageVideoModal pageKey="misiones" />

      <main className="flex-1 px-4 py-8 md:px-8">
        <div className="mx-auto flex max-w-3xl flex-col gap-6">

          {/* Hero */}
          <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 px-6 py-8 shadow-xl">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-6">
              <div className="flex flex-col gap-1">
                <h1 className="text-3xl font-extrabold text-white drop-shadow-sm">{t('pages.missions.title')}</h1>
                <p className="max-w-md text-sm font-medium leading-relaxed text-white/85">
                  {t('pages.missions.subtitle')}
                </p>
              </div>
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold text-white">
                📋 {activeCount}/{MAX_ACTIVE} activas
              </span>
              <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold text-white">
                ✅ {completedCount + questsDone.length}/{totalMissions + QUESTS.length} completadas
              </span>
              <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold text-white">
                🎓 {enrolledCourseIds.length} cursos activos
              </span>
            </div>
          </div>

          {/* Límite activo */}
          {isAtLimit && (
            <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-300">
              ⚠️ Has alcanzado el límite de {MAX_ACTIVE} misiones activas. Completa y reclama
              algunas para poder aceptar nuevas.
            </div>
          )}

          {/* NPC chat panel */}
          <div className="flex flex-col gap-4 overflow-hidden rounded-2xl border border-border bg-surface p-4 sm:flex-row sm:items-stretch">
            <NpcViewport
              mascotId={MAGE_MASCOT_ID}
              className="h-28 w-28 shrink-0 overflow-hidden rounded-xl bg-gradient-to-b from-violet-500/10 to-transparent"
            />
            <div className="flex flex-1 flex-col justify-center gap-2">
              <p className="text-xs font-bold uppercase tracking-wide text-violet-500">
                🧙 Maestro de Misiones
              </p>
              <div className="rounded-xl border border-border bg-background px-4 py-3 text-sm text-text">
                ¡Bienvenido al tablón, aventurero! Aquí encontrarás todas las misiones que el
                campus tiene para ofrecerte. Acepta las que te llamen y completa tus objetivos.
                ¡Las recompensas te esperan! 🪙✨
              </div>
              <NpcChatPanel npcId="mago-misiones" npcName="el Maestro de Misiones" npcPrompt={MAGE_PROMPT} />
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 rounded-xl border border-border bg-surface p-1">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-sm font-semibold transition-colors ${
                  activeTab === t.id
                    ? 'bg-primary text-background'
                    : 'text-text-muted hover:text-text'
                }`}
              >
                {t.label}
                <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-black ${
                  activeTab === t.id ? 'bg-white/20 text-white' : 'bg-border text-text-muted'
                }`}>
                  {t.count}
                </span>
              </button>
            ))}
          </div>

          {activeTab === 'disponibles' && (
            <div className="flex flex-col gap-6">

              {/* Misiones de cadena */}
              {questsAvail.length > 0 && (
                <section className="flex flex-col gap-3">
                  <SectionHeader icon="🗺️" title={t('pages.missions.chainSection')} count={questsDone.length} total={QUESTS.length} />
                  {questsAvail.map((quest) => (
                    <QuestCard
                      key={quest.id}
                      quest={quest}
                      stepIndex={questsActive[quest.id]}
                      completed={questsCompleted.includes(quest.id)}
                      claimed={false}
                      missionState={missionState}
                      onAccept={acceptQuest}
                      onClaim={claimQuestReward}
                    />
                  ))}
                </section>
              )}

              {/* Misiones de curso */}
              {courseAvail.length > 0 && (
                <section className="flex flex-col gap-3">
                  <SectionHeader icon="🎓" title={t('pages.missions.courseSection')} count={courseDone.length} total={courseMissionEntries.length} />
                  <p className="text-xs text-text-muted">
                    Estas misiones se activan automáticamente según los cursos que estás tomando.
                  </p>
                  {Object.entries(
                    courseAvail.reduce((acc, m) => {
                      const key = m._courseTitle
                      if (!acc[key]) acc[key] = []
                      acc[key].push(m)
                      return acc
                    }, {})
                  ).map(([courseTitle, missions]) => (
                    <div key={courseTitle} className="flex flex-col gap-2">
                      <p className="text-xs font-semibold text-text-muted">
                        📚 {courseTitle}
                      </p>
                      {missions.map((m) => (
                        <MissionCard
                          key={m.id}
                          mission={m}
                          accepted={accepted.includes(m.id)}
                          completed={m._completed}
                          claimed={false}
                          locked={!accepted.includes(m.id) && isAtLimit}
                          onAccept={acceptMission}
                          onClaim={claimReward}
                        />
                      ))}
                    </div>
                  ))}
                </section>
              )}

              {/* Misiones globales */}
              <section className="flex flex-col gap-3">
                <SectionHeader icon="🌍" title={t('pages.missions.worldSection')} count={globalDone.length} total={globalEvaluated.length} />
                {globalAvail.length === 0 ? (
                  <p className="rounded-xl border border-border bg-surface px-4 py-6 text-center text-sm text-text-muted">
                    ¡Completaste todas las misiones del mundo disponibles! 🏆
                  </p>
                ) : (
                  globalAvail.map((m) => (
                    <MissionCard
                      key={m.id}
                      mission={m}
                      accepted={accepted.includes(m.id)}
                      completed={m._completed}
                      claimed={false}
                      locked={!accepted.includes(m.id) && isAtLimit}
                      onAccept={acceptMission}
                      onClaim={claimReward}
                    />
                  ))
                )}
              </section>
            </div>
          )}

          {activeTab === 'completadas' && (
            <div className="flex flex-col gap-6">
              {questsDone.length === 0 && globalDone.length === 0 && courseDone.length === 0 ? (
                <p className="rounded-xl border border-border bg-surface px-4 py-10 text-center text-sm text-text-muted">
                  Todavía no has completado ninguna misión. ¡Empieza aceptando algunas! 🗺️
                </p>
              ) : (
                <>
                  {questsDone.length > 0 && (
                    <section className="flex flex-col gap-3">
                      <SectionHeader icon="🗺️" title={t('pages.missions.chainsDone')} />
                      {questsDone.map((quest) => (
                        <QuestCard key={quest.id} quest={quest} stepIndex={0} completed claimed />
                      ))}
                    </section>
                  )}
                  {(globalDone.length > 0 || courseDone.length > 0) && (
                    <section className="flex flex-col gap-3">
                      <SectionHeader icon="✅" title="Misiones reclamadas" />
                      {courseDone.map((m) => (
                        <MissionCard key={m.id} mission={m} accepted completed claimed />
                      ))}
                      {globalDone.map((m) => (
                        <MissionCard key={m.id} mission={m} accepted completed claimed />
                      ))}
                    </section>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </main>

      <MascotCompanion />
    </div>
  )
}
