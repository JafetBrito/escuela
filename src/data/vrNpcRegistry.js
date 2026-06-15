// NPCs placed around the VR world. Each one hands out (and later checks /
// rewards) one of the catálogo fijo de misiones generales from
// globalMissionsRegistry.js, so walking up to an NPC in the 3D world is
// another way to accept/claim those same missions.
export const VR_NPCS = [
  {
    id: 'mago-misiones',
    emoji: '🧙',
    name: 'Maestro de Misiones',
    color: '#9b5a3a',
    position: [0, 0, -16],
    // Mascot model rendered for this NPC (see mascotRegistry.js ids).
    mascotId: 10,
    dialogue: '¡Saludos, viajero! Habla con tu mascota para empezar tu aventura.',
    missionId: 'habla-con-mascota',
  },
  {
    id: 'director',
    emoji: '📘',
    name: 'Director Académico',
    color: '#3f9e7a',
    position: [13.9, 0, -8],
    mascotId: 9,
    dialogue: 'Completa tu primera clase y vuelve a verme para tu recompensa.',
    missionId: 'completa-una-clase',
  },
  {
    id: 'explorador',
    emoji: '🎒',
    name: 'Explorador',
    color: '#caa46c',
    position: [13.9, 0, 8],
    mascotId: 11,
    dialogue: 'Activa un objeto de tu inventario para demostrar que estás listo.',
    missionId: 'activa-objeto',
  },
  {
    id: 'zafir',
    emoji: '🧞',
    name: 'Zafir',
    color: '#e8c477',
    position: [0, 0, 16],
    mascotId: 12,
    dialogue: '¡Bienvenido a mi rincón! Compra algo en la Tienda y vuelve por tu premio.',
    missionId: 'compra-tienda',
  },
  {
    id: 'bibliotecaria',
    emoji: '📚',
    name: 'Bibliotecaria',
    color: '#7d8597',
    position: [-13.9, 0, 8],
    mascotId: 13,
    dialogue: 'Abre un libro de la Librería y cuéntame qué aprendiste.',
    missionId: 'lee-libro',
  },
  {
    id: 'sastre',
    emoji: '🎨',
    name: 'Sastre Mágico',
    color: '#c2703d',
    position: [-13.9, 0, -8],
    mascotId: 8,
    dialogue: 'Cambia el aspecto de tu mascota y muéstramelo con orgullo.',
    missionId: 'cambia-apariencia',
  },
]

export function getVrNpcById(id) {
  return VR_NPCS.find((npc) => npc.id === id)
}
