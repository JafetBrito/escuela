import { COURSES_DATA } from '../../data/courseRegistry'
import { ACHIEVEMENT_CATEGORIES, getAllAchievements } from '../../data/achievementsRegistry'
import { useAchievementsStore } from '../../stores/useAchievementsStore'

const COURSES = Object.values(COURSES_DATA)
const ALL_ACHIEVEMENTS = getAllAchievements(COURSES)

export default function AchievementsPanel({ className = '' }) {
  const unlocked = useAchievementsStore((s) => s.unlocked)
  const total = ALL_ACHIEVEMENTS.length
  const unlockedCount = unlocked.length

  return (
    <div className={`flex flex-col gap-6 ${className}`}>
      <div className="tech-panel rounded-2xl p-4">
        <div className="flex items-center justify-between text-sm">
          <p className="font-semibold text-text">Progreso total</p>
          <p className="text-text-muted">
            {unlockedCount}/{total}
          </p>
        </div>
        <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-surface-hover">
          <div
            className="h-full rounded-full bg-gradient-to-r from-amber-400 to-primary transition-all"
            style={{ width: `${total > 0 ? (unlockedCount / total) * 100 : 0}%` }}
          />
        </div>
      </div>

      {ACHIEVEMENT_CATEGORIES.map((cat) => {
        const items = ALL_ACHIEVEMENTS.filter((a) => a.category === cat.id)
        if (items.length === 0) return null
        const catUnlocked = items.filter((a) => unlocked.includes(a.id)).length

        return (
          <section key={cat.id} className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-sm font-bold text-text">
                <span className="text-lg">{cat.icon}</span>
                {cat.label}
                {cat.secret && (
                  <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-500">
                    Secretos
                  </span>
                )}
              </h3>
              <span className="text-xs text-text-muted">
                {catUnlocked}/{items.length}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {items.map((achievement) => {
                const done = unlocked.includes(achievement.id)
                const isHidden = achievement.secret && !done

                return (
                  <div
                    key={achievement.id}
                    className={`flex gap-3 rounded-xl border-2 p-3 transition-colors ${
                      done ? 'border-primary bg-primary/5' : 'border-border bg-background opacity-70'
                    }`}
                  >
                    <div
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-2xl ${
                        done ? 'bg-gradient-to-br from-yellow-400 to-amber-600 shadow-inner' : 'bg-surface-hover'
                      }`}
                    >
                      {isHidden ? '❓' : done ? achievement.icon : '🔒'}
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <p className={`text-sm font-bold ${done ? 'text-text' : 'text-text-muted'}`}>
                        {isHidden ? '???' : achievement.name}
                      </p>
                      <p className="text-xs text-text-muted">
                        {isHidden ? 'Logro secreto. Sigue explorando para descubrirlo.' : achievement.description}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        )
      })}
    </div>
  )
}
