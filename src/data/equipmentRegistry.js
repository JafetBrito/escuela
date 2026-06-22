// Diablo/WoW-style equippable items, one per slot per owner. Both the Avatar
// (your player character) and your Mascota (Oliver) have their own slots —
// the mascota's set is intentionally smaller. Today every item is emoji-only
// (`modelUrl: null`); once 3D models exist, filling that field is the only
// change needed to render them in the VR world.
export const EQUIPMENT_SLOTS = {
  player: ['weapon', 'head', 'chest', 'hands', 'feet'],
  oliver: ['weapon', 'hat', 'accessory', 'backpack'],
}

export const SLOT_META = {
  weapon:    { label: 'Arma',      icon: '⚔️' },
  head:      { label: 'Cabeza',    icon: '🪖' },
  chest:     { label: 'Pecho',     icon: '👕' },
  hands:     { label: 'Guantes',   icon: '🧤' },
  feet:      { label: 'Botas',     icon: '👢' },
  hat:       { label: 'Gorro',     icon: '🧢' },
  accessory: { label: 'Accesorio', icon: '💍' },
  backpack:  { label: 'Mochila',   icon: '🎒' },
}

export const EQUIPMENT_REGISTRY = [
  // ── Avatar (player) — weapon: only the Hacker's Teléfono is wired to a
  // real VR action ('V' key) today; other classes get the slot anyway so
  // the system is ready to grow without re-plumbing.
  {
    id: 'telefono_viejo', name: 'Teléfono Viejo', icon: '📱',
    slot: 'weapon', owner: 'player', requiredClass: 'hacker', requiredLevel: 1,
    stats: { power: 1, speed: 2 }, modelUrl: null,
    description: 'Apenas enciende, pero corre lo justo para abrir una terminal remota.',
  },
  {
    id: 'telefono_flagship', name: 'Teléfono Flagship', icon: '📲',
    slot: 'weapon', owner: 'player', requiredClass: 'hacker', requiredLevel: 10,
    stats: { power: 3, speed: 4 }, modelUrl: null,
    description: 'Última generación. Acceso root instantáneo desde cualquier punto del campus.',
  },
  // ── Avatar — starter gear, open to every class.
  {
    id: 'gorra_estudiante', name: 'Gorra de Estudiante', icon: '🧢',
    slot: 'head', owner: 'player', requiredClass: null, requiredLevel: 1,
    stats: { power: 0, speed: 1 }, modelUrl: null,
    description: 'La gorra que usa todo el campus. Nada especial, pero es tuya.',
  },
  {
    id: 'chaqueta_campus', name: 'Chaqueta del Campus', icon: '🧥',
    slot: 'chest', owner: 'player', requiredClass: null, requiredLevel: 1,
    stats: { power: 1, speed: 0 }, modelUrl: null,
    description: 'Abrigo oficial de Oliver Academy.',
  },
  {
    id: 'guantes_basicos', name: 'Guantes Básicos', icon: '🧤',
    slot: 'hands', owner: 'player', requiredClass: null, requiredLevel: 1,
    stats: { power: 1, speed: 0 }, modelUrl: null,
    description: 'Mejor agarre para lo que sea que estés sosteniendo.',
  },
  {
    id: 'tenis_campus', name: 'Tenis de Campus', icon: '👟',
    slot: 'feet', owner: 'player', requiredClass: null, requiredLevel: 1,
    stats: { power: 0, speed: 1 }, modelUrl: null,
    description: 'Cómodos para correr entre clases.',
  },
  // ── Mascota (oliver) — starter gear.
  {
    id: 'garra_juguete', name: 'Garra de Juguete', icon: '🐾',
    slot: 'weapon', owner: 'oliver', requiredClass: null, requiredLevel: 1,
    stats: { power: 1, speed: 1 }, modelUrl: null,
    description: 'No hace daño real, pero se ve fiero.',
  },
  {
    id: 'gorro_tejido', name: 'Gorro Tejido', icon: '🧶',
    slot: 'hat', owner: 'oliver', requiredClass: null, requiredLevel: 1,
    stats: { power: 0, speed: 0 }, modelUrl: null,
    description: 'Tejido a mano. Le queda perfecto.',
  },
  {
    id: 'collar_cascabel', name: 'Collar de Cascabel', icon: '🔔',
    slot: 'accessory', owner: 'oliver', requiredClass: null, requiredLevel: 1,
    stats: { power: 0, speed: 1 }, modelUrl: null,
    description: 'Suena cada vez que se mueve.',
  },
  {
    id: 'mochila_mini', name: 'Mochila Mini', icon: '🎒',
    slot: 'backpack', owner: 'oliver', requiredClass: null, requiredLevel: 1,
    stats: { power: 1, speed: 0 }, modelUrl: null,
    description: 'Justo del tamaño de Oliver.',
  },
]

export function getEquipmentById(id) {
  return EQUIPMENT_REGISTRY.find((it) => it.id === id) ?? null
}

export function getEquipmentForSlot(owner, classId, level, slot) {
  return EQUIPMENT_REGISTRY.filter(
    (it) => it.owner === owner && it.slot === slot && (!it.requiredClass || it.requiredClass === classId),
  )
}

// All items unlocked for this owner at this class/level, across every slot —
// used by the HUD bags panel.
export function getAvailableEquipment(owner, classId, level) {
  return EQUIPMENT_REGISTRY.filter(
    (it) => it.owner === owner && (!it.requiredClass || it.requiredClass === classId) && level >= it.requiredLevel,
  )
}
