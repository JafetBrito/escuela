import { create } from 'zustand'
import { supabase } from '../services/supabase/client'

// Same `platform_settings` table useHolidayStore.js already uses for global,
// admin-set values every student sees — this is what makes a season/weather
// choice "persistente": it survives the admin's own reload AND is there for
// players who join after the admin has logged off, not just live in-session
// (that part was already covered by applyRemoteState via VR presence).
async function persistWorldState(state) {
  if (!supabase) return
  await supabase.from('platform_settings').upsert({
    key: 'world_state',
    value: {
      mode: state.mode,
      manualBaseHour: state.manualBaseHour,
      manualBaseAtMs: state.manualBaseAtMs,
      season: state.season,
      weather: state.weather,
    },
    updated_at: new Date().toISOString(),
  })
}

// Hora real del sistema (no un timer de juego): por defecto sigue el reloj
// real minuto a minuto. Un admin puede forzar una hora puntual desde
// DevToolsPanel — desde ahí el reloj sigue avanzando normal (1 hora real =
// 1 hora de juego) a partir de la hora forzada, nunca se queda congelado.
export const useDayNightStore = create((set, get) => ({
  mode: 'real', // 'real' | 'manual'
  manualBaseHour: 12,
  manualBaseAtMs: Date.now(),

  // estaciones/clima: solo el dato + el control admin existen por ahora,
  // sin efectos visuales todavía (eso se conecta cuando se construya ese sistema)
  season: 'primavera',
  weather: 'despejado',

  getTimeOfDay() {
    const { mode, manualBaseHour, manualBaseAtMs } = get()
    if (mode === 'manual') {
      const elapsedHours = (Date.now() - manualBaseAtMs) / 3_600_000
      return (((manualBaseHour + elapsedHours) % 24) + 24) % 24
    }
    const now = new Date()
    return now.getHours() + now.getMinutes() / 60 + now.getSeconds() / 3600
  },

  // Load the last value an admin set, from Supabase — called once at app
  // start (see App.jsx, next to useHolidayStore's load()) so a fresh session
  // (admin or student) picks up the persisted season/weather/hour instead of
  // always resetting to spring/clear/real-time.
  load: async () => {
    if (!supabase) return
    const { data } = await supabase.from('platform_settings').select('value').eq('key', 'world_state').single()
    if (!data?.value) return
    const v = data.value
    set({
      mode: v.mode === 'manual' ? 'manual' : 'real',
      manualBaseHour: v.manualBaseHour ?? 12,
      manualBaseAtMs: v.manualBaseAtMs ?? Date.now(),
      season: v.season ?? 'primavera',
      weather: v.weather ?? 'despejado',
    })
  },

  setManualHour: (hour) => { set({ mode: 'manual', manualBaseHour: hour, manualBaseAtMs: Date.now() }); persistWorldState(get()) },
  useRealTime: () => { set({ mode: 'real' }); persistWorldState(get()) },
  setSeason: (season) => { set({ season }); persistWorldState(get()) },
  setWeather: (weather) => { set({ weather }); persistWorldState(get()) },

  // Applied by useVrMultiplayer when it sees an admin's tracked world-state
  // in VR presence — keeps every connected player's sky/weather in sync with
  // whatever the admin set, instead of each client only seeing their own.
  applyRemoteState: (state) => set({
    mode: state.mode === 'manual' ? 'manual' : 'real',
    manualBaseHour: state.manualBaseHour,
    manualBaseAtMs: state.manualBaseAtMs,
    season: state.season,
    weather: state.weather,
  }),
}))
