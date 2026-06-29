import { formatCurrency } from '../../utils/currency'

// Same visual language as GlobalMissionCard, but for chained quests
// (questsRegistry.js): instead of one boolean check, shows which numbered
// step the player is on and that step's own prompt.
export default function QuestCard({
  quest,
  stepIndex,
  completed,
  claimed,
  missionState,
  onAccept,
  onClaim,
}) {
  const accepted = stepIndex != null
  const step = accepted ? quest.steps[stepIndex] : null
  const stepReady = step && (
    step.type === 'talk' || (step.type === 'condition' && step.check(missionState))
  )

  return (
    <div
      className={`rounded-lg border p-3 ${
        claimed
          ? 'border-primary/40 bg-primary/5'
          : completed
            ? 'border-primary/40 bg-primary/10'
            : 'border-border bg-background'
      }`}
    >
      <div className="flex items-start gap-2">
        <span className="text-lg">{claimed ? '✅' : quest.icon}</span>
        <div className="flex-1">
          <p className={`text-sm font-medium ${claimed ? 'text-primary' : 'text-text'}`}>
            {quest.title}
          </p>
          <p className="mt-0.5 text-xs text-text-muted">{quest.description}</p>
          {accepted && !completed && step && (
            <p className="mt-0.5 text-xs text-text-muted">
              Paso {stepIndex + 1}/{quest.steps.length}: {step.prompt}
            </p>
          )}
          {!claimed && (
            <p className="mt-0.5 text-xs text-text-muted">
              Recompensa: 🪙 {formatCurrency(quest.reward.coins)} · ⭐ {quest.reward.xp} XP
            </p>
          )}
        </div>

        <div className="shrink-0">
          {!accepted && !completed && onAccept && (
            <button
              onClick={() => onAccept(quest.id)}
              className="rounded-lg bg-primary px-3 py-1 text-xs font-semibold text-background transition-colors hover:bg-primary-hover"
            >
              📜 Aceptar
            </button>
          )}
          {accepted && !stepReady && (
            <span className="rounded-full border border-border bg-surface px-2 py-1 text-xs text-text-muted">
              🕓 En progreso
            </span>
          )}
          {accepted && stepReady && (
            <span className="rounded-full border border-primary/30 bg-primary/10 px-2 py-1 text-xs text-primary">
              Habla con el NPC del paso actual
            </span>
          )}
          {completed && !claimed && onClaim && (
            <button
              onClick={() => onClaim(quest.id)}
              className="rounded-lg bg-primary px-3 py-1 text-xs font-semibold text-background transition-colors hover:bg-primary-hover"
            >
              🎁 Reclamar
            </button>
          )}
          {claimed && (
            <span className="rounded-full border border-primary/30 bg-primary/10 px-2 py-1 text-xs text-primary">
              ✅ Completada
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
