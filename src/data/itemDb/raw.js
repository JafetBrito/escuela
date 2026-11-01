import { SHOP_ITEMS } from '../shopRegistry'
import { EQUIPMENT_REGISTRY } from '../equipmentRegistry'
import { ITEMS } from '../itemsRegistry'
import { PET_FOOD_ROWS } from './petFoods'

// Convierte los registros viejos (tienda, equipo, objetos de cuenta, comida de la mascota) al MISMO formato de
// objeto. Los registros viejos siguen siendo la fuente de edición por ahora; esta tabla es la vista única que usa
// el resto del juego y la base de datos (/db/items). `entry` (número estable) lo pone index.js desde ids.json.
const SHOP_CLASS = { mascotas: ['mascot', 'model'], cosmeticos: ['cosmetic', 'theme'], objetos: ['tool', 'utility'], prompts: ['prompt', 'persona'], llaves: ['key', 'course'] }
const VR_TOOLS = new Set(['linterna'])
const BOTH = new Set(['desert-theme'])

const base = (o) => ({
  name: '', description: '', icon: '❔', image: null, model: null, quality: 'common', bonding: 'none', slot: null, owner: null,
  requiredLevel: 1, requiredClass: null, stats: {}, effects: [], source: [], buyPrice: 0, sellPrice: 0,
  stackable: false, maxStack: 1, contexts: ['app'], flags: [], tags: [], i18n: {}, ...o,
})

export function rawItems() {
  const out = []
  for (const s of SHOP_ITEMS) {
    const [cls, sub] = SHOP_CLASS[s.category] || ['tool', 'utility']
    const effects = []
    if (typeof s.mascotId === 'number') effects.push({ type: 'unlock_mascot', mascotId: s.mascotId })
    if (s.kind === 'ai-prompt') effects.push({ type: 'ai_prompt', text: s.promptText })
    else if (s.kind) effects.push({ type: 'toggle_tool', tool: s.kind })
    const price = s.price ?? 0
    out.push(base({
      key: s.id, name: s.name, description: s.description, icon: s.icon, quality: s.rarity || 'common', class: cls, subclass: sub,
      model: typeof s.mascotId === 'number' ? { kind: 'mascot', ref: s.mascotId } : null, effects,
      buyPrice: price, sellPrice: Math.floor(price / 4),
      source: s.comingSoon ? [{ type: 'soon', note: `USD ${s.priceUSD}` }] : [{ type: 'vendor', npc: 'tienda', category: s.category }],
      contexts: VR_TOOLS.has(s.id) ? ['vr'] : BOTH.has(s.kind) ? ['app', 'vr'] : ['app'],
      flags: [...(s.interactive ? ['interactive'] : []), ...(s.comingSoon ? ['coming-soon'] : [])], tags: [s.category],
    }))
  }
  for (const e of EQUIPMENT_REGISTRY) {
    out.push(base({
      key: e.id, name: e.name, description: e.description, icon: e.icon, quality: 'common', class: 'equipment', subclass: ['weapon'].includes(e.slot) ? 'weapon' : e.slot === 'accessory' || e.slot === 'backpack' ? 'accessory' : 'armor',
      bonding: 'equip', slot: e.slot, owner: e.owner, requiredLevel: e.requiredLevel, requiredClass: e.requiredClass, stats: e.stats || {},
      model: e.modelUrl ? { kind: 'glb', ref: e.modelUrl } : null, effects: [{ type: 'equip', slot: e.slot, owner: e.owner }],
      source: [{ type: 'starter' }], contexts: ['vr', 'app'], tags: [e.owner],
    }))
  }
  for (const i of ITEMS) {
    out.push(base({
      key: i.id, name: i.name, description: i.description, icon: i.icon, quality: i.rarity, class: 'quest', subclass: 'trophy', bonding: 'pickup',
      source: [{ type: 'condition', note: 'unlockedFor(license)' }], contexts: ['app'], flags: ['account-bound'],
    }))
  }
  for (const f of PET_FOOD_ROWS) {
    out.push(base({
      key: f.key, name: f.name[0], description: f.description[0], icon: f.icon, quality: f.quality, class: 'consumable', subclass: 'food',
      effects: [{ type: 'pet_need', ...f.fx }], buyPrice: f.price, sellPrice: Math.floor(f.price / 4), stackable: true, maxStack: 20,
      source: [{ type: 'vendor', npc: 'hub', category: 'mascota' }], contexts: ['hub'], tags: ['mascota'],
      i18n: { en: { name: f.name[1], description: f.description[1] } },
    }))
  }
  return out
}
