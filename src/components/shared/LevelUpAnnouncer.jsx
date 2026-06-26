import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useLevelStore, levelProgress } from '../../stores/useLevelStore'

const AUTO_DISMISS_MS = 4200

// Small gold progress bar matching this banner's dark backdrop — not the
// shared <XpBar> (its theme classes assume a light site background, which
// would be unreadable against the gold-on-dark look here).
function GoldXpBar({ className = '' }) {
  const xp = useLevelStore((s) => s.xp)
  const { xpIntoLevel, xpForNextLevel, isMaxLevel } = levelProgress(xp)
  return (
    <div className={className}>
      {!isMaxLevel && (
        <p className="mb-1 text-center text-xs text-white/60">{xpIntoLevel} / {xpForNextLevel} XP</p>
      )}
      <div className="h-2 w-full overflow-hidden rounded-full bg-black/40">
        <div className="h-full rounded-full bg-[#ffae00]" style={{ width: `${isMaxLevel ? 100 : (xpIntoLevel / xpForNextLevel) * 100}%` }} />
      </div>
    </div>
  )
}

// Global "you leveled up" announcement — mounted once near the app root
// (App.jsx), reads useLevelStore.levelUpQueue (filled by addXp() for every
// XP grant call site, see useLevelStore.js). Two presentations of the same
// event, picked by route:
//   - In VR (/vr*): a full-screen WoW-style gold-burst takeover.
//   - Everywhere else ("la plataforma"): a lighter centered popup, so it
//     reads as "a notification where you are", not a screen takeover.
export default function LevelUpAnnouncer() {
  const queue = useLevelStore((s) => s.levelUpQueue)
  const dismiss = useLevelStore((s) => s.dismissLevelUpToast)
  const { pathname } = useLocation()
  const isVr = pathname.startsWith('/vr')

  useEffect(() => {
    if (queue.length === 0) return
    const timer = setTimeout(dismiss, AUTO_DISMISS_MS)
    return () => clearTimeout(timer)
  }, [queue, dismiss])

  if (queue.length === 0) return null
  const { level } = queue[0]

  if (isVr) {
    return (
      <div className="pointer-events-none fixed inset-0 z-[200] flex items-center justify-center">
        <div
          className="absolute inset-0"
          style={{ background: 'radial-gradient(circle, rgba(255,210,80,0.25) 0%, rgba(0,0,0,0) 65%)', animation: 'levelup-flash 0.6s ease-out' }}
        />
        <div className="flex flex-col items-center gap-3" style={{ animation: 'levelup-pop 0.5s cubic-bezier(0.34,1.56,0.64,1)' }}>
          <p
            className="text-5xl font-black uppercase tracking-widest"
            style={{ color: '#ffd866', textShadow: '0 0 20px #ffae00, 0 0 60px #ffae0088' }}
          >
            ¡Subiste de nivel!
          </p>
          <p className="text-7xl font-black" style={{ color: '#fff', textShadow: '0 0 30px #ffae00' }}>
            Nivel {level}
          </p>
          <GoldXpBar className="w-80" />
        </div>
        <style>{`
          @keyframes levelup-flash { 0% { opacity: 0; } 30% { opacity: 1; } 100% { opacity: 0.4; } }
          @keyframes levelup-pop { 0% { transform: scale(0.6); opacity: 0; } 60% { transform: scale(1.08); opacity: 1; } 100% { transform: scale(1); opacity: 1; } }
        `}</style>
      </div>
    )
  }

  return (
    <div className="pointer-events-none fixed inset-0 z-[200] flex items-center justify-center">
      <div
        className="pointer-events-auto flex w-72 flex-col items-center gap-2 rounded-2xl border-2 p-5 text-center shadow-2xl"
        style={{
          background: 'linear-gradient(160deg, #2a2010, #1a1408)',
          borderColor: '#ffae00',
          boxShadow: '0 0 40px #ffae0055',
          animation: 'levelup-pop 0.4s cubic-bezier(0.34,1.56,0.64,1)',
        }}
      >
        <span className="text-4xl">⭐</span>
        <p className="text-sm font-bold uppercase tracking-wide" style={{ color: '#ffd866' }}>¡Subiste de nivel!</p>
        <p className="text-3xl font-black text-white">Nivel {level}</p>
        <GoldXpBar className="mt-1 w-full" />
        <style>{`
          @keyframes levelup-pop { 0% { transform: scale(0.85); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
        `}</style>
      </div>
    </div>
  )
}
