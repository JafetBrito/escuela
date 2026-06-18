// Generic "MISIONES" template applied to every module. Every module gets the
// same three base mission types (quiz/chat/item), completed using the
// mascot AI (chat) and the player's objetos (items). Modules can override the
// label/hint of the chat and item missions via `module.missions`, and add
// extra "misiones divertidas" tied to their own content via
// `module.funMissions` (each can grant its own collectible "objeto").
export const MISSION_TYPES = {
  quiz: {
    icon: '🧩',
    label: 'Responde el reto de conocimiento de esta clase',
    reward: 3000,
    itemReward: {
      id: 'diploma-clase',
      name: 'Diploma de Clase',
      icon: '🎓',
      rarity: 'rare',
      description: 'Obtenido al superar el reto de conocimiento de una clase.',
    },
  },
  chat: {
    icon: '💬',
    label: 'Pregúntale algo a tu mascota sobre esta clase',
    reward: 1500,
    itemReward: {
      id: 'eco-conversacion',
      name: 'Eco de Conversación',
      icon: '💬',
      rarity: 'common',
      description: 'Obtenido al hablar con tu mascota sobre una clase.',
    },
  },
  item: {
    icon: '🎒',
    label: 'Activa un objeto de tu inventario',
    reward: 1500,
    itemReward: {
      id: 'chispa-objeto',
      name: 'Chispa de Objeto',
      icon: '✨',
      rarity: 'common',
      description: 'Obtenida al activar uno de tus objetos durante una clase.',
    },
  },
}

export function getModuleMissions(module) {
  const overrides = module?.missions ?? {}
  const missions = []

  if (module?.quiz) {
    missions.push({ id: 'quiz', type: 'quiz', ...MISSION_TYPES.quiz, ...(overrides.quiz ?? {}) })
  }
  if (!module?.noChat) {
    missions.push({ id: 'chat', type: 'chat', ...MISSION_TYPES.chat, ...(overrides.chat ?? {}) })
  }
  if (!module?.noItem) {
    missions.push({ id: 'item', type: 'item', ...MISSION_TYPES.item, ...(overrides.item ?? {}) })
  }

  for (const fun of module?.funMissions ?? []) {
    missions.push({
      id: fun.id,
      type: 'fun',
      icon: fun.icon ?? '🎯',
      label: fun.title,
      hint: fun.prompt,
      reward: fun.reward ?? 0,
      itemReward: fun.item,
    })
  }

  return missions
}
