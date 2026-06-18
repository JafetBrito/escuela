import { useState } from 'react'
import { useDailyRewardsStore } from '../../stores/useDailyRewardsStore'
import { DAILY_CYCLE, getTodayReward } from '../../data/dailyRewardsRegistry'
import { formatCurrency } from '../../utils/currency'

export default function DailyRewardsBoard({ onClose }) {
  const lastClaimDate = useDailyRewardsStore((s) => s.lastClaimDate)
  const streak = useDailyRewardsStore((s) => s.streak)
  const canClaim = useDailyRewardsStore((s) => s.canClaim)
  const claim = useDailyRewardsStore((s) => s.claim)
  const [claimed, setClaimed] = useState(null) // reward object after claiming

  const today = new Date().toISOString().slice(0, 10)
  const alreadyClaimed = lastClaimDate === today
  const currentDay = Math.max(1, streak)
  const todayReward = getTodayReward(currentDay)
  // Which cycle index is "current" (0-6)
  const activeDayIdx = alreadyClaimed ? ((currentDay - 1) % 7) : ((Math.max(0, currentDay) % 7))

  const handleClaim = () => {
    if (!canClaim()) return
    const result = claim()
    if (result) setClaimed(result)
  }

  return (
    <div
      className="absolute inset-0 z-40 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden"
        style={{
          background: 'linear-gradient(160deg, #0f1a2e 0%, #1a0a30 100%)',
          border: '1px solid rgba(255,215,0,0.15)',
          boxShadow: '0 0 40px rgba(124,58,237,0.3)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-3"
          style={{
            background: 'linear-gradient(90deg, rgba(124,58,237,0.3), rgba(59,130,246,0.2))',
            borderBottom: '1px solid rgba(255,255,255,0.07)',
          }}
        >
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎁</span>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-white/40">Campus VR</p>
              <p className="text-base font-black text-white">Recompensa Diaria</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-full text-white/40 hover:bg-white/10 hover:text-white"
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>

        {/* Claimed animation */}
        {claimed && (
          <div
            className="mx-5 mt-4 flex flex-col items-center rounded-xl py-4 text-center"
            style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.25)' }}
          >
            <span className="text-3xl">{claimed.icon}</span>
            <p className="mt-1 text-sm font-black text-green-400">¡Recompensa reclamada!</p>
            <p className="text-xs text-white/50">
              +{formatCurrency(claimed.coins)} · +{claimed.xp} XP · Racha: {claimed.streak} días
            </p>
          </div>
        )}

        {/* 7-day strip */}
        <div className="flex items-end justify-between gap-1 px-4 pt-4 pb-2">
          {DAILY_CYCLE.map((d, i) => {
            const isCurrent = i === activeDayIdx
            const isPast = alreadyClaimed ? i < activeDayIdx + 1 : i < activeDayIdx
            const isFuture = !isCurrent && !isPast

            return (
              <div
                key={d.day}
                className="flex flex-1 flex-col items-center gap-1"
              >
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-full text-lg transition-all"
                  style={{
                    background: isCurrent
                      ? 'linear-gradient(135deg, #7c3aed, #4f46e5)'
                      : isPast
                        ? 'rgba(34,197,94,0.2)'
                        : 'rgba(255,255,255,0.05)',
                    border: isCurrent
                      ? '2px solid #a78bfa'
                      : isPast
                        ? '1px solid rgba(34,197,94,0.4)'
                        : '1px solid rgba(255,255,255,0.08)',
                    boxShadow: isCurrent ? '0 0 12px rgba(124,58,237,0.5)' : 'none',
                    transform: isCurrent ? 'scale(1.1)' : 'scale(1)',
                    opacity: isFuture ? 0.45 : 1,
                  }}
                >
                  {isPast ? '✅' : d.icon}
                </div>
                <span
                  className="text-center leading-tight"
                  style={{ fontSize: 9, color: isCurrent ? '#a78bfa' : 'rgba(255,255,255,0.3)' }}
                >
                  {d.day === 7 ? '👑' : `D${d.day}`}
                </span>
              </div>
            )
          })}
        </div>

        {/* Streak label */}
        <p className="px-5 text-center text-xs text-white/30">
          {streak > 0
            ? `Racha actual: ${streak} ${streak === 1 ? 'día' : 'días'} seguidos`
            : 'Reclama hoy para empezar tu racha'}
        </p>

        {/* Today's reward */}
        <div
          className="mx-4 mt-3 flex items-center gap-3 rounded-xl px-4 py-3"
          style={{
            background: alreadyClaimed ? 'rgba(255,255,255,0.04)' : 'rgba(124,58,237,0.12)',
            border: alreadyClaimed ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(124,58,237,0.25)',
          }}
        >
          <span className="text-3xl">{todayReward.icon}</span>
          <div className="flex-1">
            <p className="text-sm font-bold text-white">{alreadyClaimed ? 'Reclamado hoy' : todayReward.label}</p>
            <p className="text-xs text-white/50">{todayReward.desc}</p>
            <p className="mt-0.5 text-xs font-bold" style={{ color: '#fbbf24' }}>
              {formatCurrency(todayReward.coins)} · +{todayReward.xp} XP
            </p>
          </div>
        </div>

        {/* Claim button */}
        <div className="px-4 pb-4 pt-3">
          <button
            type="button"
            onClick={handleClaim}
            disabled={alreadyClaimed || !!claimed}
            className="w-full rounded-xl py-3 text-sm font-black uppercase tracking-wider text-white shadow-lg transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              background: alreadyClaimed || claimed
                ? 'rgba(255,255,255,0.07)'
                : 'linear-gradient(90deg, #7c3aed, #4f46e5)',
              boxShadow: !alreadyClaimed && !claimed ? '0 4px 20px rgba(124,58,237,0.4)' : 'none',
            }}
          >
            {alreadyClaimed ? '✅ Ya reclamaste hoy' : claimed ? '✅ ¡Reclamado!' : '🎁 Reclamar recompensa'}
          </button>
          <p className="mt-2 text-center text-xs text-white/20">
            {alreadyClaimed ? 'Vuelve mañana para mantener tu racha.' : 'La recompensa se renueva cada día a medianoche.'}
          </p>
        </div>
      </div>
    </div>
  )
}
