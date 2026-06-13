// RPG-style "Objetos": items the mascot carries that grant powers/access on
// the site (not just decorative). Generic and reusable across future
// courses — add new items here as new powers are introduced.
export const ITEM_RARITY = {
  common: { label: 'Común', color: '#9d9d9d' },
  rare: { label: 'Raro', color: '#0070dd' },
  epic: { label: 'Épico', color: '#a335ee' },
  legendary: { label: 'Legendario', color: '#ff8000' },
}

export const ITEMS = [
  {
    id: 'calavera-guldan',
    name: "Calavera de Gul'dan",
    icon: '💀',
    rarity: 'legendary',
    description: 'Por ser el amo del server, te da acceso ilimitado a toda la página.',
    unlockedFor: (license) => license?.role === 'admin',
  },
  {
    id: 'piedra-curiosidad',
    name: 'Piedra de la Curiosidad',
    icon: '🔮',
    rarity: 'common',
    description: 'Otorgada al iniciar tu primer curso. Mantiene viva tu racha de aprendizaje.',
    unlockedFor: () => true,
  },
  {
    id: 'lente-resumen',
    name: 'Lente de Resumen',
    icon: '🔍',
    rarity: 'rare',
    description:
      'Actívala y pídele a tu mascota un resumen exprés de la clase actual con un solo clic, directo en el chat.',
    unlockedFor: () => true,
    interactive: true,
    kind: 'summary-lens',
  },
  {
    id: 'caja-tdah',
    name: 'Caja del TDAH',
    icon: '🧩',
    rarity: 'epic',
    description:
      'Una pausa visual para recentrar tu atención. Actívala para abrir tu espacio de enfoque con tarjetas guía.',
    unlockedFor: () => true,
    interactive: true,
    kind: 'focus-box',
  },
  {
    id: 'reina-nefertiti',
    name: 'Reina Nefertiti',
    icon: '👑',
    rarity: 'epic',
    description:
      'Transforma la apariencia de toda la plataforma con una piel egipcia, dorada y con jeroglíficos.',
    unlockedFor: () => true,
    interactive: true,
    kind: 'desert-theme',
  },
  {
    id: 'camara',
    name: 'Cámara',
    icon: '📸',
    rarity: 'rare',
    description:
      'Actívala para tomar capturas de pantalla de tu progreso, etiquetarlas y guardarlas en tu galería.',
    unlockedFor: () => true,
    interactive: true,
    kind: 'camera',
  },
]

export function getUnlockedItems(license) {
  return ITEMS.filter((item) => item.unlockedFor(license))
}
