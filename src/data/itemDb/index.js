import { rawItems } from './raw'
import ids from './ids.json'
import { QUALITY, ITEM_CLASS, priceParts } from './enums'
import { tr } from '../../i18n'

export { QUALITY, ITEM_CLASS, CONTEXTS, SOURCE_TYPES, SLOT_LABEL, SUBCLASS_LABEL, BONDING_LABEL, STAT_LABEL, RESIST_LABEL, TRIGGER_LABEL, priceParts } from './enums'

// ─────────────────────────────────────────────────────────────────────────────
// ITEM_DB: la tabla única de objetos (estilo item_template de WoW). Cada fila tiene un `entry` numérico
// estable (ids.json), un `key` legible (el id de siempre, así nada existente se rompe) y los mismos campos para
// todo: nombre, icono, modelo, clase, calidad, ranura, requisitos, estadísticas, efectos, cómo se consigue,
// precio, dónde se usa. Cualquier sistema (tienda, inventario, hub, VR, misiones) lee de aquí.
// Para agregar un objeto: ponlo en su registro (shopRegistry/equipmentRegistry/itemDb/petFoods...) y corre
// `node scripts/items/sync-ids.mjs` para darle su entry.
// ─────────────────────────────────────────────────────────────────────────────
export const ITEM_DB = rawItems().map((it) => ({ ...it, entry: ids[it.key] ?? -1 })).sort((a, b) => a.entry - b.entry)
const byEntry = new Map(ITEM_DB.map((i) => [i.entry, i]))
const byKey = new Map(ITEM_DB.map((i) => [i.key, i]))

const SHAPE = { description: '', icon: '❔', image: null, model: null, quality: 'common', bonding: 'none', slot: null, owner: null, requiredLevel: 1, requiredClass: null, stats: {}, effects: [], source: [], buyPrice: 0, sellPrice: 0, stackable: false, maxStack: 1, contexts: ['app'], flags: [], tags: [], i18n: {}, itemLevel: null, unique: false, durability: null, damage: null, resist: {} }

// Mezcla filas de la tabla item_templates de Supabase: una fila con un entry que ya existe PISA los valores locales;
// una con un entry nuevo agrega un objeto (creado por un admin). Se modifica ITEM_DB en sitio para que todos los
// módulos que ya importaron `ITEM_DB` / `getItem` vean el cambio.
export function applyRemoteRows(rows) {
  for (const { entry, key, data } of rows || []) {
    const cur = byEntry.get(entry)
    if (cur) Object.assign(cur, data, { entry, key: cur.key })
    else { const it = { ...SHAPE, name: key, ...data, key, entry }; ITEM_DB.push(it); byEntry.set(entry, it); byKey.set(key, it) }
  }
  ITEM_DB.sort((a, b) => a.entry - b.entry)
}

if (import.meta.env?.DEV) {
  const missing = ITEM_DB.filter((i) => i.entry < 0).map((i) => i.key)
  if (missing.length) console.warn('[itemDb] objetos sin entry (corre node scripts/items/sync-ids.mjs):', missing.join(', '))
  if (byEntry.size !== ITEM_DB.filter((i) => i.entry >= 0).length) console.warn('[itemDb] hay entries duplicados')
}

// `ref` puede ser el entry numérico o el key de siempre.
export const getItem = (ref) => (typeof ref === 'number' ? byEntry.get(ref) : byKey.get(ref) ?? byEntry.get(Number(ref))) ?? null

export const itemName = (it) => (tr('x', 'y') === 'y' && it.i18n?.en?.name) || it.name
export const itemDescription = (it) => (tr('x', 'y') === 'y' && it.i18n?.en?.description) || it.description
// Nivel de objeto: el que fijó un admin, o uno derivado (nivel requerido + 3 por cada escalón de calidad)
export const itemLevelOf = (it) => it.itemLevel ?? Math.max(1, (it.requiredLevel || 1) + (QUALITY[it.quality]?.order || 0) * 3)
export const qualityOf = (it) => QUALITY[it.quality] || QUALITY.common
export const classLabel = (it) => tr(...(ITEM_CLASS[it.class]?.label || [it.class, it.class]))

// Filtros: { q, class, subclass, quality, slot, context, source, owner }
export function searchItems(f = {}) {
  const q = (f.q || '').toLowerCase().trim()
  return ITEM_DB.filter((i) =>
    (!f.class || i.class === f.class) && (!f.subclass || i.subclass === f.subclass) && (!f.quality || i.quality === f.quality) &&
    (!f.slot || i.slot === f.slot) && (!f.owner || i.owner === f.owner) && (!f.context || i.contexts.includes(f.context)) &&
    (!f.source || i.source.some((s) => s.type === f.source)) &&
    (!q || String(i.entry).includes(q) || i.key.toLowerCase().includes(q) || i.name.toLowerCase().includes(q) || (i.i18n?.en?.name || '').toLowerCase().includes(q)),
  )
}

export const usableIn = (it, context) => it.contexts.includes(context)
export const effectsOf = (it, type) => it.effects.filter((e) => !type || e.type === type)
export const buyPriceParts = (it) => priceParts(it.buyPrice)
