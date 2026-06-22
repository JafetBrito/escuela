import { create } from 'zustand'

const DEFAULT_EQUIPPED = {
  player: { weapon: null, head: null, chest: null, hands: null, feet: null },
  oliver: { weapon: null, hat: null, accessory: null, backpack: null },
}

// Equipped items per character, per slot — Diablo/WoW-style: swap freely
// between any item you meet the level/class requirement for (see
// equipmentRegistry.js). 'player' = Avatar, 'oliver' = Mascota.
export const useEquipmentStore = create((set) => ({
  equipped: DEFAULT_EQUIPPED,

  equip: (owner, slot, itemId) =>
    set((s) => ({ equipped: { ...s.equipped, [owner]: { ...s.equipped[owner], [slot]: itemId } } })),

  unequip: (owner, slot) =>
    set((s) => ({ equipped: { ...s.equipped, [owner]: { ...s.equipped[owner], [slot]: null } } })),

  loadEquipped: (equipped) =>
    set({
      equipped: {
        player: { ...DEFAULT_EQUIPPED.player, ...equipped?.player },
        oliver: { ...DEFAULT_EQUIPPED.oliver, ...equipped?.oliver },
      },
    }),
}))
