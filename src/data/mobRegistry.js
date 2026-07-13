// Monster types for the VR world's combat v1 (see useMobStore.js). Each type
// is themed around the platform's "código roto" motif rather than generic
// fantasy monsters, to match Oliver Academy's tone.
//
// `level` and `armor` feed the REAL combat formulas ported from
// world-of-claudecraft's src/sim/types.ts (armorReduction, mobXpValue) — see
// useMobStore.js. `loot` is their loot-table shape too: an array of
// independently-rolled entries, each either `{ type:'coins', min, max, chance }`
// or `{ type:'item', item, chance }` (chance is 0-1, rolled separately per
// entry — not "pick one", every entry can hit or miss on its own).
export const MOB_TYPES = {
  'bug-de-codigo': {
    id: 'bug-de-codigo',
    name: 'Bug de Código',
    icon: '🐛',
    color: '#ef4444',
    level: 1,
    armor: 20,
    maxHp: 60,
    loot: [
      { type: 'coins', min: 300, max: 600, chance: 1 },
      {
        type: 'item',
        chance: 0.35,
        item: {
          id: 'fragmento-codigo',
          name: 'Fragmento de Código',
          icon: '💾',
          rarity: 'common',
          description: 'Un trozo de código corrupto que dejó caer un Bug al ser derrotado.',
        },
      },
    ],
  },
}

export function getMobType(id) {
  return MOB_TYPES[id] ?? MOB_TYPES['bug-de-codigo']
}
