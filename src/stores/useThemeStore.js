import { create } from 'zustand'

// Temas que el alumno puede elegir libremente desde Ajustes → Apariencia —
// separados del tema 'hacker' de admin (ThemeController.jsx lo aplica aparte,
// es exclusivo y no vive aquí). `dataTheme` es el valor que se escribe en
// document.documentElement.dataset.theme ('' = el oscuro por defecto, sin
// atributo). Antes 'Claro' y 'Desierto' solo se activaban comprando/activando
// un objeto en la Tienda — ahora son una preferencia de cuenta normal,
// sincronizada como useSettingsStore/useSeenStore vía profiles.snapshot (no
// necesita tabla ni columna propia).
export const THEMES = [
  { id: 'default', label: 'Oscuro (predeterminado)', icon: '🌙', dataTheme: '' },
  { id: 'light', label: 'Claro', icon: '☀️', dataTheme: 'light' },
  { id: 'desert', label: 'Reina Nefertiti (desierto)', icon: '👑', dataTheme: 'desert' },
]

export const useThemeStore = create((set) => ({
  theme: 'default',
  setTheme: (theme) => set({ theme: THEMES.some((t) => t.id === theme) ? theme : 'default' }),
  loadTheme: (theme) => set({ theme: THEMES.some((t) => t.id === theme) ? theme : 'default' }),
}))
