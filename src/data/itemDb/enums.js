// Base de datos de objetos (estilo item_template de WoW): vocabulario común. Todo objeto del juego —de la
// tienda, el equipo, la comida de la mascota, lo que sea— se describe con los MISMOS campos y estos MISMOS valores.

export const QUALITY = {
  common: { label: ['Común', 'Common'], color: '#9d9d9d', order: 0 },
  uncommon: { label: ['Poco común', 'Uncommon'], color: '#1eff00', order: 1 },
  rare: { label: ['Raro', 'Rare'], color: '#0070dd', order: 2 },
  epic: { label: ['Épico', 'Epic'], color: '#a335ee', order: 3 },
  legendary: { label: ['Legendario', 'Legendary'], color: '#ff8000', order: 4 },
}

// class/subclass: qué ES el objeto. El rango de `entry` sale de la clase (ver scripts/items/sync-ids.mjs).
export const ITEM_CLASS = {
  consumable: { label: ['Consumible', 'Consumable'], base: 1000, subclasses: ['food', 'potion', 'scroll'] },
  equipment: { label: ['Equipo', 'Equipment'], base: 2000, subclasses: ['weapon', 'armor', 'accessory', 'bag'] },
  cosmetic: { label: ['Cosmético', 'Cosmetic'], base: 3000, subclasses: ['theme', 'skin', 'pet-skin'] },
  mascot: { label: ['Mascota', 'Mascot'], base: 4000, subclasses: ['model'] },
  tool: { label: ['Herramienta', 'Tool'], base: 5000, subclasses: ['study', 'media', 'utility'] },
  prompt: { label: ['Personalidad de IA', 'AI personality'], base: 6000, subclasses: ['persona'] },
  key: { label: ['Llave', 'Key'], base: 7000, subclasses: ['course'] },
  quest: { label: ['Misión / trofeo', 'Quest / trophy'], base: 8000, subclasses: ['trophy'] },
}

// Dónde se puede usar: la app (web), el VR de escritorio o el Hub móvil. Un objeto puede servir en varios.
export const CONTEXTS = { app: ['Aplicación', 'App'], vr: ['Mundo VR', 'VR world'], hub: ['Hub móvil', 'Mobile hub'] }

export const SOURCE_TYPES = {
  vendor: ['Se compra', 'Vendor'],
  starter: ['Equipo inicial', 'Starter gear'],
  condition: ['Se otorga por condición', 'Granted by condition'],
  quest: ['Recompensa de misión', 'Quest reward'],
  loot: ['Botín', 'Loot'],
  admin: ['Solo GM', 'GM only'],
  soon: ['Próximamente', 'Coming soon'],
}

export const SLOT_LABEL = {
  weapon: ['Arma', 'Weapon'], head: ['Cabeza', 'Head'], chest: ['Pecho', 'Chest'], hands: ['Manos', 'Hands'], feet: ['Pies', 'Feet'],
  hat: ['Gorro', 'Hat'], accessory: ['Accesorio', 'Accessory'], backpack: ['Mochila', 'Backpack'],
}

// Moneda: 100 cobre = 1 plata, 100 plata = 1 oro (igual que useCurrencyStore).
export const priceParts = (cobre) => ({ gold: Math.floor(cobre / 10000), silver: Math.floor((cobre % 10000) / 100), copper: cobre % 100 })
