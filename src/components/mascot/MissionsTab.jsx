import { getModuleMissions } from '../../data/missionsRegistry'
import { useProgressStore } from '../../stores/useProgressStore'
import { useGlobalMissionsStore } from '../../stores/useGlobalMissionsStore'
import { GLOBAL_MISSIONS } from '../../data/globalMissionsRegistry'
import { formatCurrency } from '../../utils/currency'
import ModuleQuiz from '../learning/ModuleQuiz'

export default function MissionsTab({ courseId, module, onGoToChat }) {
  const moduleMissions = useProgressStore((s) =>
    courseId && module ? s.progress[courseId]?.moduleMissions?.[module.id] ?? {} : {},
  )
  const accepted     = useGlobalMissionsStore((s) => s.accepted)
  const claimed      = useGlobalMissionsStore((s) => s.claimed)
  const acceptMission = useGlobalMissionsStore((s) => s.acceptMission)

  // Only show global missions that are accepted or not yet accepted (not already claimed/hidden)
  const visibleGlobal = GLOBAL_MISSIONS.filter((m) => !claimed.includes(m.id))

  return (
    <div className="flex flex-col gap-5">

      {/* ── Misiones del módulo actual ──────────────────────────────── */}
      {module ? (
        <section>
          <p className="mb-2 text-xs font-black uppercase tracking-widest text-text-muted">
            🎯 Misiones de "{module.title}"
          </p>
          {(() => {
            const missions = getModuleMissions(module)
            if (missions.length === 0)
              return <p className="text-sm text-text-muted">Esta clase no tiene misiones.</p>
            return missions.map((mission) => {
              const done = !!moduleMissions[mission.id]
              return (
                <div key={mission.id} className="mb-2 rounded-xl border border-border bg-background p-3">
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
          })()}
        </section>
      ) : (
        <p className="text-sm text-text-muted">Selecciona una clase para ver sus misiones del módulo.</p>
      )}

      <div className="border-t border-border" />

      {/* ── Misiones del mundo (globales) ───────────────────────────── */}
      <section>
        <p className="mb-2 text-xs font-black uppercase tracking-widest text-text-muted">
          🌍 Misiones del mundo
        </p>
        {visibleGlobal.length === 0 ? (
          <p className="text-sm text-text-muted">¡Completaste todas las misiones disponibles! 🏆</p>
        ) : (
          visibleGlobal.map((m) => {
            const isAccepted  = accepted.includes(m.id)
            const isDone      = claimed.includes(m.id)
            return (
              <div key={m.id} className="mb-2 rounded-xl border border-border bg-background p-3">
                <div className="flex items-start gap-2">
                  <span className="text-lg">{isDone ? '✅' : m.icon}</span>
                  <div className="flex-1">
                    <p className={`text-sm font-semibold ${isDone ? 'text-primary' : 'text-text'}`}>{m.title}</p>
                    <p className="text-xs text-text-muted mt-0.5">{m.description}</p>
                    <p className="text-xs text-text-muted mt-1">
                      🪙 {formatCurrency(m.reward)}
                      {m.xpReward ? ` · ✨ ${m.xpReward} XP` : ''}
                    </p>
                  </div>
                  {isDone ? (
                    <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">Hecho</span>
                  ) : isAccepted ? (
                    <span className="shrink-0 rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-400">En curso</span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => acceptMission(m.id)}
                      className="shrink-0 rounded-lg bg-primary px-2.5 py-1 text-[10px] font-bold text-background"
                    >
                      Aceptar
                    </button>
                  )}
                </div>
              </div>
            )
          })
        )}
      </section>
    </div>
  )
}
