// Generic "MISIONES" template applied to every module. Every module gets the
// same two base mission types (quiz/chat), completed via the reto de
// conocimiento and the mascot AI. Modules can override the label/hint of the
// chat mission via `module.missions`, and add extra "misiones divertidas"
// tied to their own content via `module.funMissions` (each can grant its own
// collectible "objeto").
//
// ponytail: there used to be a third default type, 'item' ("Activa un objeto
// de tu inventario") — it had no completion wiring anywhere (nothing ever
// marked it done), so it showed up as a permanently-stuck mission on every
// course. Removed globally instead of trying to patch it, since it was only
// ever meant for the old test course and added nothing elsewhere.
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
  terminal: {
    icon: '⌨️',
    label: 'Completa el ejercicio de terminal de esta clase',
    reward: 3000,
    itemReward: {
      id: 'diploma-clase',
      name: 'Diploma de Clase',
      icon: '🎓',
      rarity: 'rare',
      description: 'Obtenido al superar el reto de conocimiento de una clase.',
    },
  },
  phishing: {
    icon: '🎣',
    label: 'Descubre cuál correo NO es phishing',
    reward: 3000,
    itemReward: {
      id: 'diploma-clase',
      name: 'Diploma de Clase',
      icon: '🎓',
      rarity: 'rare',
      description: 'Obtenido al superar el reto de conocimiento de una clase.',
    },
  },
  hanzi: {
    icon: '✍️',
    label: 'Practica el trazo de los caracteres de esta clase',
    reward: 3000,
    itemReward: {
      id: 'diploma-clase',
      name: 'Diploma de Clase',
      icon: '🎓',
      rarity: 'rare',
      description: 'Obtenido al superar el reto de conocimiento de una clase.',
    },
  },
}

export function getModuleMissions(module) {
  const overrides = module?.missions ?? {}
  const missions = []

  if (module?.quiz) {
    missions.push({ id: 'quiz', type: 'quiz', ...MISSION_TYPES.quiz, ...(overrides.quiz ?? {}) })
  }
  if (module?.terminalSim) {
    missions.push({ id: 'terminal', type: 'terminal', ...MISSION_TYPES.terminal, ...(overrides.terminal ?? {}) })
  }
  if (module?.phishingGame) {
    missions.push({ id: 'phishing', type: 'phishing', ...MISSION_TYPES.phishing, ...(overrides.phishing ?? {}) })
  }
  if (module?.hanziPractice) {
    missions.push({ id: 'hanzi', type: 'hanzi', ...MISSION_TYPES.hanzi, ...(overrides.hanzi ?? {}) })
  }
  if (!module?.noChat) {
    missions.push({ id: 'chat', type: 'chat', ...MISSION_TYPES.chat, ...(overrides.chat ?? {}) })
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
