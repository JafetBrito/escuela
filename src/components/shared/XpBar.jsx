import { useLevelStore, levelProgress, MAX_LEVEL } from '../../stores/useLevelStore'

// Larger, more visible XP bar than LevelBadge — meant to sit right below the
// mascot's 3D model so progress feels front and center.
export default function XpBar({ className = '' }) {
  const xp = useLevelStore((s) => s.xp)
  const { level, xpIntoLevel, xpForNextLevel, isMaxLevel } = levelProgress(xp)

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <div className="flex items-center justify-between text-sm">
        <span className="flex items-center gap-1.5 font-bold text-text">
          <span>⭐</span>
          Nivel {level}
          {isMaxLevel && <span className="text-text-muted">(máximo)</span>}
        </span>
        <span className="text-xs text-text-muted">
          {isMaxLevel ? `${MAX_LEVEL} / ${MAX_LEVEL}` : `${xpIntoLevel} / ${xpForNextLevel} XP`}
        </span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-surface-hover">
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${isMaxLevel ? 100 : (xpIntoLevel / xpForNextLevel) * 100}%` }}
        />
      </div>
    </div>
  )
}
