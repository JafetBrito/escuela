// Catálogo de misiones generales. Cada misión es puro dato: no contiene
// funciones, solo checkType + checkValue. Para añadir una misión nueva
// basta con agregar una entrada aquí (o una fila en la tabla DB futura)
// sin tocar ningún componente.
//
// Para agregar un TIPO DE CONDICIÓN nuevo: añadir un case en evaluateMission.
// Eso es todo el cambio de código que se necesita.
//
// Migración a Supabase: cuando esté listo, reemplazar GLOBAL_MISSIONS con
// un fetch desde la tabla `missions` (SELECT * FROM missions WHERE active = true).
// evaluateMission funciona igual sin importar el origen de los datos.

// ── Evaluador central ──────────────────────────────────────────────────────
// state = objeto de useMissionState(): totalChatMessages, completedModules,
//         hasActiveItem, purchasedCount, booksOpened, selectedSkinId,
//         level, friendsCount, courseProgress (progress completo por courseId).
export function evaluateMission(mission, state) {
  switch (mission.checkType) {
    case 'chat_count':
      return (state.totalChatMessages ?? 0) >= (mission.checkValue ?? 1)
    case 'completed_modules':
      return (state.completedModules ?? 0) >= (mission.checkValue ?? 1)
    case 'has_active_item':
      return Boolean(state.hasActiveItem)
    case 'purchased_count':
      return (state.purchasedCount ?? 0) >= (mission.checkValue ?? 1)
    case 'books_opened':
      return (state.booksOpened ?? 0) >= (mission.checkValue ?? 1)
    case 'skin_changed':
      return state.selectedSkinId !== 'default'
    case 'level':
      return (state.level ?? 0) >= (mission.checkValue ?? 1)
    case 'course_modules_completed': {
      const cp = state.courseProgress?.[mission.courseId]
      const done = cp?.moduleProgress?.filter((m) => m.completed).length ?? 0
      return done >= (mission.checkValue ?? 1)
    }
    default:
      return false
  }
}

// ── Misiones globales ──────────────────────────────────────────────────────
export const GLOBAL_MISSIONS = [
  {
    id: 'habla-con-mascota',
    icon: '💬',
    title: 'Rompe el hielo',
    description: 'Habla con tu mascota al menos una vez para activar su IA.',
    reward: 1000,
    xpReward: 30,
    npc: 'Oliver',
    npcIcon: '🐱',
    category: 'Social',
    checkType: 'chat_count',
    checkValue: 1,
  },
  {
    id: 'completa-una-clase',
    icon: '📘',
    title: 'Primer paso',
    description: 'Completa tu primera clase de cualquier curso disponible.',
    reward: 2000,
    xpReward: 50,
    npc: 'Maestro de Misiones',
    npcIcon: '🧙',
    category: 'Academia',
    checkType: 'completed_modules',
    checkValue: 1,
  },
  {
    id: 'activa-objeto',
    icon: '🎒',
    title: 'Usa tu equipo',
    description: 'Activa cualquier objeto interactivo de tu inventario.',
    reward: 1000,
    xpReward: 30,
    npc: 'Jafet',
    npcIcon: '🧑‍💻',
    category: 'Exploración',
    checkType: 'has_active_item',
  },
  {
    id: 'compra-tienda',
    icon: '🛒',
    title: 'De compras',
    description: 'Compra al menos un objeto en la Tienda del campus.',
    reward: 1500,
    xpReward: 40,
    npc: 'Maestro de Misiones',
    npcIcon: '🧙',
    category: 'Exploración',
    checkType: 'purchased_count',
    checkValue: 1,
  },
  {
    id: 'lee-libro',
    icon: '📖',
    title: 'Ratón de biblioteca',
    description: 'Abre un libro desde la Biblioteca del campus.',
    reward: 1500,
    xpReward: 40,
    npc: 'Oliver',
    npcIcon: '🐱',
    category: 'Academia',
    checkType: 'books_opened',
    checkValue: 1,
  },
  {
    id: 'cambia-apariencia',
    icon: '🎨',
    title: 'Nuevo look',
    description: 'Cambia el skin o atuendo de tu mascota Oliver.',
    reward: 1000,
    xpReward: 30,
    npc: 'Jafet',
    npcIcon: '🧑‍💻',
    category: 'Personalización',
    checkType: 'skin_changed',
  },
  {
    id: 'completa-cinco-clases',
    icon: '🏆',
    title: 'En racha',
    description: 'Completa 5 clases en cualquier combinación de cursos.',
    reward: 5000,
    xpReward: 120,
    npc: 'Maestro de Misiones',
    npcIcon: '🧙',
    category: 'Academia',
    checkType: 'completed_modules',
    checkValue: 5,
  },
  {
    id: 'sube-nivel-5',
    icon: '⭐',
    title: 'Aprendiz consolidado',
    description: 'Alcanza el nivel 5 de experiencia en la plataforma.',
    reward: 3000,
    xpReward: 0,
    npc: 'Oliver',
    npcIcon: '🐱',
    category: 'Progresión',
    checkType: 'level',
    checkValue: 5,
  },
]

export function getGlobalMissionById(id) {
  return GLOBAL_MISSIONS.find((m) => m.id === id)
}
