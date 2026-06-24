import { create } from 'zustand'

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

  setManualHour: (hour) => set({ mode: 'manual', manualBaseHour: hour, manualBaseAtMs: Date.now() }),
  useRealTime: () => set({ mode: 'real' }),
  setSeason: (season) => set({ season }),
  setWeather: (weather) => set({ weather }),
}))
