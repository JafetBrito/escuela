import { create } from 'zustand'
import { supabase } from '../services/supabase/client'

// Available holidays — add design/CSS later, infrastructure is wired now.
export const HOLIDAYS = {
  none:        { label: 'Sin tema',            icon: '—' },
  halloween:   { label: 'Halloween',           icon: '🎃' },
  dia_muertos: { label: 'Día de Muertos',      icon: '💀' },
  navidad:     { label: 'Navidad',             icon: '🎄' },
  ano_nuevo:   { label: 'Año Nuevo',           icon: '🎆' },
  reyes:       { label: 'Reyes Magos',         icon: '👑' },
  san_valentin:{ label: 'San Valentín',        icon: '💝' },
  primavera:   { label: 'Fiesta de Primavera', icon: '🌸' },
}

export const useHolidayStore = create((set, get) => ({
  activeHoliday: 'none',

  // Load from Supabase platform_settings on app start.
  load: async () => {
    const { data } = await supabase
      .from('platform_settings')
      .select('value')
      .eq('key', 'holiday_theme')
      .single()
    if (data?.value) {
      const holiday = typeof data.value === 'string' ? data.value : 'none'
      set({ activeHoliday: holiday })
      applyBodyClass(holiday)
    }
  },

  // Admin sets the holiday — writes to Supabase so all students see it on next load.
  set: async (holiday) => {
    set({ activeHoliday: holiday })
    applyBodyClass(holiday)
    await supabase
      .from('platform_settings')
      .upsert({ key: 'holiday_theme', value: JSON.stringify(holiday), updated_at: new Date().toISOString() })
  },
}))

function applyBodyClass(holiday) {
  const root = document.documentElement
  const classes = Object.keys(HOLIDAYS).filter((k) => k !== 'none')
  root.classList.remove(...classes.map((h) => `holiday-${h}`))
  if (holiday && holiday !== 'none') root.classList.add(`holiday-${holiday}`)
}
