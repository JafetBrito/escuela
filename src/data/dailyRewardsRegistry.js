// ─── Daily Rewards Registry ───────────────────────────────────────────────
// 7-day rotating cycle. Streak resets if a day is missed.
// After day 7 the cycle repeats with increasing bonuses (streak keeps growing).
// To add bonus items later: extend each entry with an `items` array.
//
// How to update rewards:
//  - Change coin/xp values here to rebalance the economy
//  - The `day` field is cosmetic only — real streak is tracked in useDailyRewardsStore

export const DAILY_CYCLE = [
  { day: 1, label: 'Día 1',         icon: '🌟', coins: 500,   xp: 30,  desc: '¡Bienvenido de vuelta!' },
  { day: 2, label: 'Día 2',         icon: '⭐', coins: 750,   xp: 45,  desc: '¡Racha en marcha!' },
  { day: 3, label: 'Día 3',         icon: '✨', coins: 1000,  xp: 60,  desc: 'Tres días seguidos.' },
  { day: 4, label: 'Día 4',         icon: '💫', coins: 1500,  xp: 80,  desc: 'A la mitad de la semana.' },
  { day: 5, label: 'Día 5',         icon: '🔥', coins: 2000,  xp: 100, desc: '¡Cinco días! ¡Eres un crack!' },
  { day: 6, label: 'Día 6',         icon: '💎', coins: 3000,  xp: 150, desc: 'Casi completas la semana.' },
  { day: 7, label: '¡Semana completa!', icon: '👑', coins: 5000, xp: 250, desc: '¡7 días seguidos! Recompensa máxima.' },
]

// Returns the reward for the current streak position (0-indexed cycle)
export function getTodayReward(streak) {
  const idx = Math.max(0, (streak - 1) % DAILY_CYCLE.length)
  return DAILY_CYCLE[idx]
}

// The reward that would be earned on the NEXT claim (preview for UI)
export function getNextReward(streak) {
  const idx = streak % DAILY_CYCLE.length
  return DAILY_CYCLE[idx]
}
