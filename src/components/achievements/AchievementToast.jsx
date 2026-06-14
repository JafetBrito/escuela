import { useEffect } from 'react'
import { useAchievementsStore } from '../../stores/useAchievementsStore'
import { ACHIEVEMENT_CATEGORIES } from '../../data/achievementsRegistry'

const AUTO_DISMISS_MS = 5000

// Shows a stack of "logro desbloqueado" toasts (top-right) for newly
// unlocked achievements. Mounted once near the root of the app.
export default function AchievementToast() {
  const toastQueue = useAchievementsStore((s) => s.toastQueue)
  const dismissToast = useAchievementsStore((s) => s.dismissToast)

  useEffect(() => {
    if (toastQueue.length === 0) return
    const timer = setTimeout(dismissToast, AUTO_DISMISS_MS)
    return () => clearTimeout(timer)
  }, [toastQueue, dismissToast])

  if (toastQueue.length === 0) return null

  return (
    <div className="pointer-events-none fixed right-4 top-4 z-[100] flex flex-col gap-2">
      {toastQueue.map((achievement, idx) => {
        const isSecret = achievement.category === 'secretos'
        const meta = ACHIEVEMENT_CATEGORIES.find((c) => c.id === achievement.category)
        return (
          <div
            key={`${achievement.id}-${idx}`}
            className="pointer-events-auto flex w-72 animate-[slide-in_0.3s_ease-out] items-center gap-3 overflow-hidden rounded-xl border-2 border-primary bg-surface p-3 shadow-2xl"
            style={{ animation: 'achievement-pop 0.4s ease-out' }}
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-amber-600 text-2xl shadow-inner">
              {achievement.icon}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold uppercase tracking-wide text-amber-500">
                {isSecret ? '⚔️ Proeza de la fuerza desbloqueada' : '🏆 Logro desbloqueado'}
              </p>
              <p className="truncate text-sm font-bold text-text">{achievement.name}</p>
              <p className="truncate text-xs text-text-muted">{meta?.label}</p>
            </div>
          </div>
        )
      })}

      <style>{`
        @keyframes achievement-pop {
          0% { transform: translateX(120%) scale(0.9); opacity: 0; }
          60% { transform: translateX(-4%) scale(1.02); opacity: 1; }
          100% { transform: translateX(0) scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  )
}
