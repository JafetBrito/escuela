// Catálogo fijo de misiones generales, no ligadas a un curso en particular.
// Se ofrecen en la página "Misiones" (estilo WoW, un NPC las entrega) y, una
// vez aceptadas, su progreso se ve en el panel de Misiones del menú del
// personaje. `check(state)` recibe el objeto devuelto por `useMissionState`.
export const GLOBAL_MISSIONS = [
  {
    id: 'habla-con-mascota',
    icon: '💬',
    title: 'Rompe el hielo',
    description: 'Habla con tu mascota al menos una vez.',
    reward: 1000,
    xpReward: 30,
    check: (state) => state.totalChatMessages > 0,
  },
  {
    id: 'completa-una-clase',
    icon: '📘',
    title: 'Primer paso',
    description: 'Completa tu primera clase de cualquier curso.',
    reward: 2000,
    xpReward: 50,
    check: (state) => state.completedModules > 0,
  },
  {
    id: 'activa-objeto',
    icon: '🎒',
    title: 'Usa tu equipo',
    description: 'Activa cualquier objeto interactivo de tu inventario.',
    reward: 1000,
    xpReward: 30,
    check: (state) => state.hasActiveItem,
  },
  {
    id: 'compra-tienda',
    icon: '🛒',
    title: 'De compras',
    description: 'Compra algo en la Tienda.',
    reward: 1500,
    xpReward: 40,
    check: (state) => state.purchasedCount > 0,
  },
  {
    id: 'lee-libro',
    icon: '📖',
    title: 'Ratón de biblioteca',
    description: 'Abre un libro desde la Biblioteca.',
    reward: 1500,
    xpReward: 40,
    check: (state) => state.booksOpened > 0,
  },
  {
    id: 'cambia-apariencia',
    icon: '🎨',
    title: 'Nuevo look',
    description: 'Cambia el atuendo de tu mascota.',
    reward: 1000,
    xpReward: 30,
    check: (state) => state.selectedSkinId !== 'default',
  },
]

export function getGlobalMissionById(id) {
  return GLOBAL_MISSIONS.find((m) => m.id === id)
}
