import { create } from 'zustand'

// Whether the admin's own passive "hacker" theme (ThemeController.jsx) shows
// on this device. Personal preference, not shared with other admins — so
// plain localStorage is enough, unlike useHolidayStore's platform_settings
// (that one is a decoration every student sees, this one only the admin does).
const LS_KEY = 'admin-hacker-theme-enabled'

function loadInitial() {
  const raw = localStorage.getItem(LS_KEY)
  return raw === null ? true : raw === 'true'
}

export const useAdminThemeStore = create((set, get) => ({
  enabled: loadInitial(),
  toggle: () => {
    const next = !get().enabled
    set({ enabled: next })
    localStorage.setItem(LS_KEY, String(next))
  },
}))
