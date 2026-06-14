import AppTopBar from '../shared/AppTopBar'
import MascotCompanion from '../mascot/MascotCompanion'
import GlobalMissionCard from './GlobalMissionCard'
import { GLOBAL_MISSIONS } from '../../data/globalMissionsRegistry'
import { useGlobalMissionsStore } from '../../stores/useGlobalMissionsStore'
import { useMissionState } from '../../stores/useMissionState'

export default function MissionsBoardPage() {
  const accepted = useGlobalMissionsStore((s) => s.accepted)
  const claimed = useGlobalMissionsStore((s) => s.claimed)
  const acceptMission = useGlobalMissionsStore((s) => s.acceptMission)
  const claimReward = useGlobalMissionsStore((s) => s.claimReward)
  const missionState = useMissionState()

  return (
    <div className="flex min-h-screen flex-col bg-background text-text">
      <AppTopBar />

      <main className="flex-1 px-4 py-8 md:px-8">
        <div className="mx-auto flex max-w-3xl flex-col gap-6">
          <div>
            <h1 className="text-2xl font-bold">📜 Misiones</h1>
            <p className="mt-1 text-sm text-text-muted">
              Acepta misiones generales y cúmplelas explorando la plataforma. Su progreso
              también aparece en el menú de tu mascota.
            </p>
          </div>

          <div className="flex items-start gap-3 rounded-2xl border border-border bg-surface p-4">
            <span className="text-4xl">🧙</span>
            <div className="rounded-xl border border-border bg-background px-4 py-3 text-sm text-text">
              ¡Bienvenido, aventurero! Estas son las misiones disponibles hoy. Acéptalas y
              cúmplelas para ganar monedas y experiencia. 🪙✨
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {GLOBAL_MISSIONS.map((mission) => {
              const isAccepted = accepted.includes(mission.id)
              const isClaimed = claimed.includes(mission.id)
              const isCompleted = mission.check(missionState)
              return (
                <GlobalMissionCard
                  key={mission.id}
                  mission={mission}
                  accepted={isAccepted}
                  completed={isCompleted}
                  claimed={isClaimed}
                  onAccept={acceptMission}
                  onClaim={claimReward}
                />
              )
            })}
          </div>
        </div>
      </main>

      <MascotCompanion />
    </div>
  )
}
