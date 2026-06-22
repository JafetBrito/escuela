import { formatCurrency } from '../../utils/currency'

// Renders a single GLOBAL_MISSIONS entry with its current state — used in
// the /misiones NPC board.
export default function GlobalMissionCard({
  mission,
  accepted,
  completed,
  claimed,
  onAccept,
  onClaim,
  compact = false,
}) {
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
        <span className="text-lg">{claimed ? '✅' : mission.icon}</span>
        <div className="flex-1">
          <p className={`text-sm font-medium ${claimed ? 'text-primary' : 'text-text'}`}>
            {mission.title}
          </p>
          {!compact && <p className="mt-0.5 text-xs text-text-muted">{mission.description}</p>}
          {!claimed && (
            <p className="mt-0.5 text-xs text-text-muted">
              Recompensa: 🪙 {formatCurrency(mission.reward)} · ⭐ {mission.xpReward} XP
            </p>
          )}
        </div>

        <div className="shrink-0">
          {!accepted && onAccept && (
            <button
              onClick={() => onAccept(mission.id)}
              className="rounded-lg bg-primary px-3 py-1 text-xs font-semibold text-background transition-colors hover:bg-primary-hover"
            >
              📜 Aceptar
            </button>
          )}
          {accepted && !completed && (
            <span className="rounded-full border border-border bg-surface px-2 py-1 text-xs text-text-muted">
              🕓 En progreso
            </span>
          )}
          {accepted && completed && !claimed && onClaim && (
            <button
              onClick={() => onClaim(mission.id)}
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
