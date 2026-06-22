import { create } from 'zustand'

// Equipped weapon per character — today only 'player' has a weapon slot.
// Diablo/WoW-style: swap freely between any weapon you meet the level/class
// requirement for (see weaponRegistry.js).
export const useWeaponStore = create((set) => ({
  equipped: { player: 'telefono_viejo' },

  equip: (owner, weaponId) =>
    set((s) => ({ equipped: { ...s.equipped, [owner]: weaponId } })),

  loadEquipped: (equipped) => set({ equipped: equipped ?? { player: 'telefono_viejo' } }),
}))
