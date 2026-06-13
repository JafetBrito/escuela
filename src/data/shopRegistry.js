import { ITEM_RARITY } from './itemsRegistry'

// Cosmetic/temáticos objetos comprables con monedas en la Tienda. Distintos
// de los objetos funcionales de itemsRegistry (esos se desbloquean por rol o
// progreso, no se compran).
export const SHOP_ITEMS = [
  {
    id: 'gafas-sol',
    name: 'Gafas de Sol',
    icon: '🕶️',
    rarity: 'common',
    price: 40,
    description: 'Un accesorio cool para tu mascota. Puro estilo, sin función especial.',
  },
  {
    id: 'sombrero-mago',
    name: 'Sombrero de Mago',
    icon: '🧙',
    rarity: 'rare',
    price: 90,
    description: 'Convierte a tu mascota en una sabia hechicera del conocimiento.',
  },
  {
    id: 'capa-heroe',
    name: 'Capa de Héroe',
    icon: '🦸',
    rarity: 'epic',
    price: 150,
    description: 'Una capa legendaria para quienes nunca dejan una misión sin terminar.',
  },
  {
    id: 'corona-dorada',
    name: 'Corona Dorada',
    icon: '👑',
    rarity: 'legendary',
    price: 250,
    description: 'El máximo trofeo de estatus en oliver.escuela.',
  },
]

export function getShopItemById(id) {
  return SHOP_ITEMS.find((i) => i.id === id)
}

export { ITEM_RARITY }
