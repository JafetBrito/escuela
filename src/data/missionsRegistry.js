// Generic "MISIONES" template applied to every module. Building the general
// base now — every module gets the same three mission types, completed using
// the mascot AI (chat) and the player's objetos (items).
export const MISSION_TYPES = {
  quiz: {
    icon: '🧩',
    label: 'Responde el reto de conocimiento de esta clase',
    reward: 30,
  },
  chat: {
    icon: '💬',
    label: 'Pregúntale algo a tu mascota sobre esta clase',
    reward: 15,
  },
  item: {
    icon: '🎒',
    label: 'Activa un objeto de tu inventario',
    reward: 15,
  },
}

export function getModuleMissions(module) {
  const missions = []
  if (module?.quiz) {
    missions.push({ id: 'quiz', type: 'quiz', ...MISSION_TYPES.quiz })
  }
  missions.push({ id: 'chat', type: 'chat', ...MISSION_TYPES.chat })
  missions.push({ id: 'item', type: 'item', ...MISSION_TYPES.item })
  return missions
}
