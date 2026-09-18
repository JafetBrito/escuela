import { create } from 'zustand'
import { useCurrencyStore } from './useCurrencyStore'
import { useLevelStore } from './useLevelStore'

// Regalo de cumpleaños: más grande que el máximo del ciclo semanal de daily
// rewards (día 7: 5000 monedas / 250 XP — ver dailyRewardsRegistry.js) para
// que se sienta especial, una vez al año.
const BIRTHDAY_REWARD = { coins: 10000, xp: 500 }

// `birthdate` viene de profiles.birthdate ('YYYY-MM-DD'). Compara solo
// mes/día — el año en la columna es el de nacimiento, no el de este chequeo.
export function isBirthdayToday(birthdate) {
  if (!birthdate) return false
  const b = new Date(birthdate)
  const t = new Date()
  return b.getUTCMonth() === t.getMonth() && b.getUTCDate() === t.getDate()
}

export const useBirthdayStore = create((set, get) => ({
  lastClaimedYear: null,

  // Abierto manualmente desde /cumpleanos (GmConsole) para probar el modal
  // sin esperar la fecha real — no toca lastClaimedYear ni el candado real.
  debugForceOpen: false,
  forceOpen: () => set({ debugForceOpen: true }),
  dismissForceOpen: () => set({ debugForceOpen: false }),

  canClaim: (birthdate) =>
    isBirthdayToday(birthdate) && get().lastClaimedYear !== new Date().getFullYear(),

  claim: () => {
    const year = new Date().getFullYear()
    set({ lastClaimedYear: year, debugForceOpen: false })
    useCurrencyStore.getState().earnCoins(BIRTHDAY_REWARD.coins)
    useLevelStore.getState().addXp(BIRTHDAY_REWARD.xp)
    return { ...BIRTHDAY_REWARD }
  },

  // Called by progressSnapshot.applyProgressSnapshot
  loadBirthday: ({ lastClaimedYear } = {}) => set({ lastClaimedYear: lastClaimedYear ?? null }),
}))
