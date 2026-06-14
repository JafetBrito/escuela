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
]

export function getUnlockedItems(license) {
  return ITEMS.filter((item) => item.unlockedFor(license))
}
