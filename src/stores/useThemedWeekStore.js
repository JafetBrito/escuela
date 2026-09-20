import { create } from 'zustand'
import { supabase } from '../services/supabase/client'
import { THEMED_WEEKS, autoThemedWeek } from '../data/themedWeeks'

// override: 'auto' (semana ISO decide) | 'none' (apagado) | id de un tema.
// Se guarda en platform_settings (misma tabla que useHolidayStore) para que
// lo que activa un admin lo vea todo el mundo.
const KEY = 'themed_week'

export const useThemedWeekStore = create((set) => ({
  override: 'auto',

  load: async () => {
    if (!supabase) return
    const { data } = await supabase.from('platform_settings').select('value').eq('key', KEY).maybeSingle()
    if (typeof data?.value === 'string') set({ override: data.value })
  },

  setOverride: async (override) => {
    set({ override })
    if (!supabase) return
    await supabase.from('platform_settings').upsert({ key: KEY, value: override, updated_at: new Date().toISOString() })
  },
}))

export function resolveThemedWeek(override, date = new Date()) {
  if (override === 'none') return null
  if (override === 'auto') return autoThemedWeek(date)
  return THEMED_WEEKS.find((w) => w.id === override) ?? autoThemedWeek(date)
}
