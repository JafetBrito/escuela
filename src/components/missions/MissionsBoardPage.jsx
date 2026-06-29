import AppTopBar from '../shared/AppTopBar'
import MascotCompanion from '../mascot/MascotCompanion'
import PageVideoModal from '../shared/PageVideoModal'
import NpcViewport from '../mascot/NpcViewport'
import NpcChatPanel from '../shared/NpcChatPanel'
import GlobalMissionCard from './GlobalMissionCard'
import QuestCard from './QuestCard'
import { GLOBAL_MISSIONS } from '../../data/globalMissionsRegistry'
import { QUESTS } from '../../data/questsRegistry'
import { useGlobalMissionsStore } from '../../stores/useGlobalMissionsStore'
import { useQuestsStore } from '../../stores/useQuestsStore'
import { useMissionState } from '../../stores/useMissionState'

const MAGE_MASCOT_ID = 9

const MAGE_PROMPT = `Eres el Maestro de Misiones, un sabio mago anciano que entrega misiones en OLIVER SCHOOL. Hablas en español con un tono místico, motivador y un poco solemne, como un mentor de RPG. Animas al estudiante a aceptar y completar misiones generales (hablar con su mascota, completar clases, usar objetos, comprar en la tienda, leer libros, cambiar su apariencia) para ganar monedas y experiencia. No inventes recompensas exactas si no las tienes; invita al estudiante a revisar el tablón de misiones. Mantén tus respuestas breves (2-4 frases) y siempre en personaje.`

export default function MissionsBoardPage() {
  const accepted = useGlobalMissionsStore((s) => s.accepted)
  const claimed = useGlobalMissionsStore((s) => s.claimed)
  const acceptMission = useGlobalMissionsStore((s) => s.acceptMission)
  const claimReward = useGlobalMissionsStore((s) => s.claimReward)
  const missionState = useMissionState()
  const questsActive = useQuestsStore((s) => s.active)
  const questsCompleted = useQuestsStore((s) => s.completed)
  const questsClaimed = useQuestsStore((s) => s.claimed)
  const acceptQuest = useQuestsStore((s) => s.acceptQuest)
  const claimQuestReward = useQuestsStore((s) => s.claimReward)

  const completedCount = GLOBAL_MISSIONS.filter((m) => m.check(missionState)).length
  const claimedCount = claimed.length

  return (
    <div className="flex min-h-screen flex-col bg-background text-text">
      <AppTopBar />
      <PageVideoModal pageKey="misiones" />

      <main className="flex-1 px-4 py-8 md:px-8">
        <div className="mx-auto flex max-w-3xl flex-col gap-6">
          <div className="overflow-hidden rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-6 py-8 shadow-lg">
            <h1 className="text-3xl font-extrabold text-white drop-shadow-sm">📜 Misiones</h1>
            <p className="mt-1 text-sm font-medium text-white/85">
              Acepta misiones generales y cúmplelas explorando la plataforma. Su progreso
              también aparece en el menú de tu mascota.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-full bg-background/20 px-3 py-1 text-xs font-semibold text-white">
                📋 {accepted.length} aceptadas
              </span>
              <span className="rounded-full bg-background/20 px-3 py-1 text-xs font-semibold text-white">
                ✅ {completedCount}/{GLOBAL_MISSIONS.length} completadas
              </span>
              <span className="rounded-full bg-background/20 px-3 py-1 text-xs font-semibold text-white">
                🎁 {claimedCount} recompensas reclamadas
              </span>
            </div>
          </div>

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
                ¡Bienvenido, aventurero! Estas son las misiones disponibles hoy. Acéptalas y
                cúmplelas para ganar monedas y experiencia, o pregúntame lo que quieras. 🪙✨
              </div>
              <NpcChatPanel npcId="mago-misiones" npcName="el Maestro de Misiones" npcPrompt={MAGE_PROMPT} />
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <p className="text-sm font-semibold uppercase tracking-wide text-text-muted">
              🗺️ Misiones de cadena
            </p>
            {QUESTS.filter((quest) => !questsClaimed.includes(quest.id)).map((quest) => (
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
          </div>

          <div className="flex flex-col gap-3">
            {GLOBAL_MISSIONS.filter((mission) => !claimed.includes(mission.id)).map((mission) => {
              const isAccepted = accepted.includes(mission.id)
              const isCompleted = mission.check(missionState)
              return (
                <GlobalMissionCard
                  key={mission.id}
                  mission={mission}
                  accepted={isAccepted}
                  completed={isCompleted}
                  claimed={false}
                  onAccept={acceptMission}
                  onClaim={claimReward}
                />
              )
            })}
          </div>

          {(claimed.length > 0 || questsClaimed.length > 0) && (
            <div className="flex flex-col gap-3">
              <p className="text-sm font-semibold uppercase tracking-wide text-text-muted">
                ✅ Misiones realizadas
              </p>
              <div className="flex flex-col gap-3">
                {QUESTS.filter((quest) => questsClaimed.includes(quest.id)).map((quest) => (
                  <QuestCard key={quest.id} quest={quest} stepIndex={0} completed claimed />
                ))}
                {GLOBAL_MISSIONS.filter((mission) => claimed.includes(mission.id)).map((mission) => (
                  <GlobalMissionCard
                    key={mission.id}
                    mission={mission}
                    accepted
                    completed
                    claimed
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <MascotCompanion />
    </div>
  )
}
