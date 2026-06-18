import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getCourseData } from '../../data/courseRegistry'
import ModuleQuiz from '../learning/ModuleQuiz'
import ModuleCompleteModal from '../learning/ModuleCompleteModal'
import GlobalMissionCard from '../missions/GlobalMissionCard'
import { useProgressStore, EMPTY_OBJECT } from '../../stores/useProgressStore'
import { useItemEffectsStore } from '../../stores/useItemEffectsStore'
import { getModuleMissions } from '../../data/missionsRegistry'
import { GLOBAL_MISSIONS } from '../../data/globalMissionsRegistry'
import { useGlobalMissionsStore } from '../../stores/useGlobalMissionsStore'
import { useMissionState } from '../../stores/useMissionState'

// Compact list of accepted "misiones generales" (catálogo fijo, ver
// /misiones), shared by the course and no-course views.
function GlobalMissionsSection() {
  const accepted = useGlobalMissionsStore((s) => s.accepted)
  const claimed = useGlobalMissionsStore((s) => s.claimed)
  const claimReward = useGlobalMissionsStore((s) => s.claimReward)
  const missionState = useMissionState()

  const acceptedMissions = GLOBAL_MISSIONS.filter((m) => accepted.includes(m.id))
  const activeMissions = acceptedMissions.filter((m) => !claimed.includes(m.id))
  const doneMissions = acceptedMissions.filter((m) => claimed.includes(m.id))

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm font-semibold uppercase tracking-wide text-text-muted">
        🗒️ Misiones generales
      </p>
      {acceptedMissions.length === 0 ? (
        <p className="text-sm text-text-muted">
          Visita{' '}
          <Link to="/misiones" className="text-primary hover:underline">
            Misiones 📜
          </Link>{' '}
          en el menú para aceptar nuevas.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {activeMissions.map((mission) => (
            <GlobalMissionCard
              key={mission.id}
              mission={mission}
              accepted
              completed={mission.check(missionState)}
              claimed={false}
              onClaim={claimReward}
              compact
            />
          ))}
          {activeMissions.length === 0 && (
            <p className="text-sm text-text-muted">No tienes misiones generales pendientes.</p>
          )}
        </div>
      )}

      {doneMissions.length > 0 && (
        <div className="flex flex-col gap-3">
          <p className="mt-1 text-sm font-semibold uppercase tracking-wide text-text-muted">
            ✅ Misiones realizadas
          </p>
          <div className="flex flex-col gap-3">
            {doneMissions.map((mission) => (
              <GlobalMissionCard
                key={mission.id}
                mission={mission}
                accepted
                completed
                claimed
                compact
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function CodeMissionInput({ expectedCode, onSuccess }) {
  const [val, setVal] = useState('')
  const [err, setErr] = useState(false)
  const submit = () => {
    if (val.trim().toUpperCase() === expectedCode) { onSuccess() }
    else { setErr(true); setTimeout(() => setErr(false), 1500) }
  }
  return (
    <div className="flex items-center gap-2">
      <input
        value={val}
        onChange={e => { setVal(e.target.value); setErr(false) }}
        onKeyDown={e => e.key === 'Enter' && submit()}
        placeholder="Código secreto…"
        className={`rounded-lg border px-2 py-1 text-xs outline-none w-36 ${err ? 'border-red-400 bg-red-50' : 'border-border bg-background text-text'}`}
      />
      <button
        onClick={submit}
        className="rounded-lg border border-primary px-3 py-1 text-xs font-semibold text-primary hover:bg-primary/10"
      >
        Ingresar 🔑
      </button>
      {err && <span className="text-xs text-red-500">Código incorrecto</span>}
    </div>
  )
}

export default function MissionsPanel({ courseId, module, className = '' }) {
  if (!module) {
    return (
      <div className={`flex flex-col gap-3 ${className}`}>
        <GlobalMissionsSection />
      </div>
    )
  }

  return <ModuleMissionsPanel courseId={courseId} module={module} className={className} />
}

function ModuleMissionsPanel({ courseId, module, className = '' }) {
  const courseData = getCourseData(courseId)
  const moduleMissions = useProgressStore((s) => s.progress[courseId]?.moduleMissions ?? EMPTY_OBJECT)
  const completeMission = useProgressStore((s) => s.completeMission)
  const setSelectedModule = useProgressStore((s) => s.setSelectedModule)
  const isModuleUnlocked = useProgressStore((s) => s.isModuleUnlocked)
  const activeItems = useItemEffectsStore((s) => s.activeItems)

  const [showComplete, setShowComplete] = useState(false)

  const missions = getModuleMissions(module)
  const done = moduleMissions[module.id] ?? {}
  const allDone = missions.every((m) => done[m.id])
  const nextModule = courseData.modules.find((m) => m.order === module.order + 1)

  // "Activa un objeto de tu inventario" mission: complete as soon as any
  // interactive objeto is active while viewing this class.
  useEffect(() => {
    if (done.item) return
    if (Object.values(activeItems).some(Boolean)) {
      completeMission(courseId, module.id, 'item')
    }
  }, [activeItems, done.item, courseId, module.id, completeMission])

  useEffect(() => {
    setShowComplete(false)
  }, [module.id])

  const handleNext = () => {
    setShowComplete(true)
  }

  const handleContinue = () => {
    if (nextModule && isModuleUnlocked(courseId, nextModule.id)) {
      setSelectedModule(courseId, nextModule.id)
    }
    setShowComplete(false)
  }

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      <GlobalMissionsSection />

      <div className="mt-1 border-t border-border pt-3">
        <p className="text-sm text-text-muted">
          Completa estas misiones hablando con tu mascota y usando tus objetos para avanzar a la
          siguiente clase.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {missions.map((mission) => {
          const isDone = !!done[mission.id]
          return (
            <div
              key={mission.id}
              className={`rounded-lg border p-3 ${
                isDone ? 'border-primary/40 bg-primary/5' : 'border-border bg-background'
              }`}
            >
              <div className="flex items-start gap-2">
                <span className="text-lg">{isDone ? '✅' : mission.icon}</span>
                <div className="flex-1">
                  <p className={`text-sm font-medium ${isDone ? 'text-primary' : 'text-text'}`}>
                    {mission.label}
                  </p>
                  {!isDone && (mission.reward || mission.itemReward) && (
                    <p className="mt-0.5 text-xs text-text-muted">
                      Recompensa: {mission.reward ? `🪙 ${mission.reward}` : ''}
                      {mission.itemReward ? ` · ${mission.itemReward.icon} ${mission.itemReward.name}` : ''}
                    </p>
                  )}
                  {mission.type === 'quiz' && !isDone && (
                    <ModuleQuiz courseId={courseId} module={module} className="mt-2" />
                  )}
                  {mission.type === 'chat' && !isDone && (
                    <p className="mt-1 text-xs text-text-muted">
                      {mission.hint ?? 'Abre el Chat de tu mascota y envíale un mensaje.'}
                    </p>
                  )}
                  {mission.type === 'item' && !isDone && (
                    <p className="mt-1 text-xs text-text-muted">
                      {mission.hint ?? 'Abre Objetos y activa cualquiera con función.'}
                    </p>
                  )}
                  {mission.type === 'fun' && !isDone && (
                    <div className="mt-2 flex flex-col gap-2">
                      <p className="text-xs text-text-muted">{mission.hint}</p>
                      {mission.codeRequired ? (
                        <CodeMissionInput
                          expectedCode={mission.codeRequired}
                          onSuccess={() => completeMission(courseId, module.id, mission.id)}
                        />
                      ) : (
                        <button
                          onClick={() => completeMission(courseId, module.id, mission.id)}
                          className="self-start rounded-lg border border-primary px-3 py-1 text-xs font-semibold text-primary transition-colors hover:bg-primary/10"
                        >
                          Ya la cumplí ✅
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-2 flex items-center justify-between gap-3 border-t border-border pt-4">
        <p className="text-sm text-text-muted">
          {allDone ? '✓ Misiones completadas' : 'Completa las misiones para avanzar.'}
        </p>
        <button
          onClick={handleNext}
          disabled={!allDone}
          className="shrink-0 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-background hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
        >
          Siguiente clase
        </button>
      </div>

      {showComplete && (
        <ModuleCompleteModal
          completedModule={module}
          nextModule={nextModule}
          courseTitle={courseData.title}
          onContinue={handleContinue}
          onClose={() => setShowComplete(false)}
        />
      )}
    </div>
  )
}
