import ids from './ids.json'

// Puente clave ↔ entry SIN dependencias (lo importan los stores y los registros viejos, así que no puede importar ITEM_DB).
// Las tiendas y bolsas guardan el `entry` numérico; las cuentas guardadas antes tienen claves de texto ('camara'): estas
// funciones las aceptan de las dos formas, así nada se pierde. Lo que no es un objeto del catálogo (libros...) queda igual.
const KEY = Object.fromEntries(Object.entries(ids).map(([k, e]) => [e, k]))
export const entryOf = (ref) => (typeof ref === 'number' ? ref : ids[ref] ?? ref)
export const keyOf = (ref) => (typeof ref === 'number' ? KEY[ref] ?? ref : ref)
export const normalizeList = (list) => [...new Set((list ?? []).map(entryOf))]
// ¿La lista (de entries o de claves viejas) contiene este objeto?
export const ownsItem = (list, ref) => list.includes(entryOf(ref)) || list.includes(keyOf(ref))
