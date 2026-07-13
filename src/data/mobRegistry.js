// Monster types for the VR world's combat v1 (see useMobStore.js). Each type
// is themed around the platform's "código roto" motif rather than generic
// fantasy monsters, to match Oliver Academy's tone.
export const MOB_TYPES = {
  'bug-de-codigo': {
    id: 'bug-de-codigo',
    name: 'Bug de Código',
    icon: '🐛',
    color: '#ef4444',
    maxHp: 60,
    lootCoinsMin: 300,
    lootCoinsMax: 600,
    lootItemChance: 0.35,
    lootItem: {
      id: 'fragmento-codigo',
      name: 'Fragmento de Código',
      icon: '💾',
      rarity: 'common',
      description: 'Un trozo de código corrupto que dejó caer un Bug al ser derrotado.',
    },
  },
}

export function getMobType(id) {
  return MOB_TYPES[id] ?? MOB_TYPES['bug-de-codigo']
}
