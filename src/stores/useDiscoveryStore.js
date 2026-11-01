import { create } from 'zustand'
import { useLevelStore } from './useLevelStore'

// "Descubriste: X" al estilo WoW: la primera vez que entras a una zona de un mapa ganas XP. Lo descubierto se
// guarda en el snapshot de la cuenta (progressSnapshot → `discovery`). Clave = `${mapa}:${nombre}`.
export const useDiscoveryStore = create((set, get) => ({
  found: [],
  toast: null, // { name, xp, n } — lo muestra <ZoneToast>
  discover: (map, name, xp = 25) => {
    const key = `${map}:${name}`
    if (get().found.includes(key)) return false
    if (xp > 0) useLevelStore.getState().addXp(xp)
    set((s) => ({ found: [...s.found, key], toast: { name, xp, n: s.found.length + 1 } }))
    return true
  },
  clearToast: () => set({ toast: null }),
  loadDiscovery: (found) => set({ found: Array.isArray(found) ? found : [] }),
}))
