import { useLevelStore, levelProgress, MAX_LEVEL } from '../../stores/useLevelStore'

// Compact level/XP indicator: "⭐ Nivel X" with a progress bar to the next level.
export default function LevelBadge({ className = '' }) {
  const xp = useLevelStore((s) => s.xp)
  const { level, xpIntoLevel, xpForNextLevel, isMaxLevel } = levelProgress(xp)

  return (
    <div
      className={`flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 text-sm font-semibold text-text ${className}`}
      title={isMaxLevel ? `Nivel máximo (${MAX_LEVEL})` : `${xpIntoLevel} / ${xpForNextLevel} XP`}
    >
      <span>⭐</span>
      <span>Nivel {level}</span>
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-surface-hover">
        <div
          className="h-full rounded-full bg-primary"
          style={{ width: `${isMaxLevel ? 100 : (xpIntoLevel / xpForNextLevel) * 100}%` }}
        />
      </div>
    </div>
  )
}
