import { ITEM_RARITY } from './itemsRegistry'

// Generates a random flavor stat for items whose characteristics are rolled
// when the catalog is created (e.g. "Sabiduría +14"). Purely cosmetic.
function randomStat(label, min, max, suffix = '') {
  const value = Math.floor(Math.random() * (max - min + 1)) + min
  return { label, value: `+${value}${suffix}` }
}

// Cosmetic/temáticos objetos comprables con monedas en la Tienda. Precios en
// cobre, al estilo World of Warcraft: 100 cobre = 1 plata, 100 plata = 1 oro
// (10000 cobre = 1 oro).
export const SHOP_ITEMS = [
  {
    id: 'gafas-sol',
    name: 'Gafas de Sol',
    icon: '🕶️',
    rarity: 'common',
    price: 1200,
    description: 'Un accesorio cool para tu mascota. Puro estilo, sin función especial.',
  },
  {
    id: 'sombrero-mago',
    name: 'Sombrero de Mago',
    icon: '🧙',
    rarity: 'rare',
    price: 4800,
    description: 'Convierte a tu mascota en una sabia hechicera del conocimiento.',
  },
  {
    id: 'capa-heroe',
    name: 'Capa de Héroe',
    icon: '🦸',
    rarity: 'epic',
    price: 15000,
    description: 'Una capa legendaria para quienes nunca dejan una misión sin terminar.',
  },
  {
    id: 'corona-dorada',
    name: 'Corona Dorada',
    icon: '👑',
    rarity: 'legendary',
    price: 50000,
    description: 'El máximo trofeo de estatus en OLIVER SCHOOL.',
  },
  {
    id: 'anillo-sabiduria',
    name: 'Anillo de Sabiduría',
    icon: '💍',
    rarity: 'rare',
    price: 6000,
    description: 'Un anillo encantado que se siente distinto cada vez que se forja.',
    stats: randomStat('Sabiduría', 5, 25),
  },
  {
    id: 'bufanda-arcana',
    name: 'Bufanda Arcana',
    icon: '🧣',
    rarity: 'common',
    price: 1800,
    description: 'Tejida con hilos mágicos que cambian de potencia en cada lote.',
    stats: randomStat('Calidez', 1, 15),
  },
  {
    id: 'escudo-runico',
    name: 'Escudo Rúnico',
    icon: '🛡️',
    rarity: 'epic',
    price: 22000,
    description: 'Cada escudo sale de la forja con runas de defensa distintas.',
    stats: randomStat('Defensa', 10, 40),
  },
  {
    id: 'alas-fenix',
    name: 'Alas de Fénix',
    icon: '🪽',
    rarity: 'legendary',
    price: 65000,
    description: 'Alas ardientes con una intensidad que varía en cada renacimiento.',
    stats: randomStat('Velocidad', 15, 50),
  },
  {
    id: 'amuleto-fortuna',
    name: 'Amuleto de la Fortuna',
    icon: '🍀',
    rarity: 'rare',
    price: 7500,
    description: 'Un amuleto cuya suerte se determina en el momento de su creación.',
    stats: randomStat('Fortuna', 1, 30, '%'),
  },
  {
    id: 'libro',
    name: 'Libro de Conocimiento',
    icon: '📖',
    rarity: 'rare',
    price: 3000,
    description: 'Ábrelo para consultar información importante de OLIVER SCHOOL en cualquier momento.',
    interactive: true,
    kind: 'book-popup',
  },
  {
    id: 'tema-claro',
    name: 'Cristal de Luz',
    icon: '💎',
    rarity: 'epic',
    price: 18000,
    description: 'Activa un tema claro para toda la plataforma.',
    interactive: true,
    kind: 'light-theme',
  },
  {
    id: 'radio',
    name: 'Radio de OLIVER SCHOOL',
    icon: '📻',
    rarity: 'rare',
    price: 5000,
    description: 'Sintoniza la radio del programa mientras estudias.',
    interactive: true,
    kind: 'radio-player',
    audioSrc: '/audio/radio-oliver.mp3',
  },
]

export function getShopItemById(id) {
  return SHOP_ITEMS.find((i) => i.id === id)
}

export { ITEM_RARITY }
