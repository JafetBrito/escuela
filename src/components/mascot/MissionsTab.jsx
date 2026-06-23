import { getModuleMissions } from '../../data/missionsRegistry'
import { useProgressStore } from '../../stores/useProgressStore'
import { formatCurrency } from '../../utils/currency'
import ModuleQuiz from '../learning/ModuleQuiz'

// Read-only list of the current module's missions (quiz/chat/item/fun) with
// done/pending state — referenced by ModuleResources ("tus misiones están
// en el menú de tu mascota") but, until now, never actually rendered there.
export default function MissionsTab({ courseId, module, onGoToChat }) {
  const moduleMissions = useProgressStore((s) =>
    courseId && module ? s.progress[courseId]?.moduleMissions[module.id] ?? {} : {},
  )

  if (!module) {
    return <p className="text-sm text-text-muted">Selecciona una clase para ver sus misiones.</p>
  }

  const missions = getModuleMissions(module)

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs font-bold uppercase tracking-widest text-text-muted">
        🎯 Misiones de "{module.title}"
      </p>

      {missions.length === 0 ? (
        <p className="text-sm text-text-muted">Esta clase no tiene misiones.</p>
      ) : (
        missions.map((mission) => {
          const done = !!moduleMissions[mission.id]
          return (
            <div key={mission.id} className="rounded-xl border border-border bg-background p-3">
              <div className="flex items-start gap-2">
                <span className="text-lg">{done ? '✅' : mission.icon}</span>
                <div className="flex-1">
                  <p className={`text-sm font-medium ${done ? 'text-primary' : 'text-text'}`}>{mission.label}</p>
                  {mission.hint && <p className="mt-0.5 text-xs text-text-muted">{mission.hint}</p>}
                  {!done && mission.reward > 0 && (
                    <p className="mt-1 text-xs text-text-muted">Recompensa: 🪙 {formatCurrency(mission.reward)}</p>
                  )}
                </div>
              </div>

              {!done && mission.type === 'quiz' && (
                <ModuleQuiz courseId={courseId} module={module} className="mt-3" />
              )}
              {!done && mission.type === 'chat' && onGoToChat && (
                <button
                  type="button"
                  onClick={onGoToChat}
                  className="mt-3 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-background hover:bg-primary-hover"
                >
                  Ir al Chat
                </button>
              )}
            </div>
          )
        })
      )}
    </div>
  )
}
