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

// El botón "Ir a tu fiesta" hace una navegación dura (window.location.href,
// ver BirthdayModal.jsx) — un recargue completo borra cualquier estado en
// RAM, así que sin esto debugForceOpen se perdía justo antes de que
// /vr/cumpleanos pudiera leerlo, y el modo de prueba te regresaba al
// dashboard. sessionStorage sobrevive el recargue (se limpia solo al
// cerrar la pestaña), perfecto para un flag de "estoy probando esto ahora".
const DEBUG_FORCE_KEY = 'oliver_birthday_debug_force'

export const useBirthdayStore = create((set, get) => ({
  lastClaimedYear: null,

  // Abierto manualmente desde /cumpleanos (GmConsole) para probar el modal
  // sin esperar la fecha real — no toca lastClaimedYear ni el candado real.
  debugForceOpen: sessionStorage.getItem(DEBUG_FORCE_KEY) === '1',
  forceOpen: () => {
    sessionStorage.setItem(DEBUG_FORCE_KEY, '1')
    set({ debugForceOpen: true })
  },
  dismissForceOpen: () => {
    sessionStorage.removeItem(DEBUG_FORCE_KEY)
    set({ debugForceOpen: false })
  },

  canClaim: (birthdate) =>
    isBirthdayToday(birthdate) && get().lastClaimedYear !== new Date().getFullYear(),

  claim: () => {
    const year = new Date().getFullYear()
    sessionStorage.removeItem(DEBUG_FORCE_KEY)
    set({ lastClaimedYear: year, debugForceOpen: false })
    useCurrencyStore.getState().earnCoins(BIRTHDAY_REWARD.coins)
    useLevelStore.getState().addXp(BIRTHDAY_REWARD.xp)
    return { ...BIRTHDAY_REWARD }
  },

  // Called by progressSnapshot.applyProgressSnapshot
  loadBirthday: ({ lastClaimedYear } = {}) => set({ lastClaimedYear: lastClaimedYear ?? null }),
}))
