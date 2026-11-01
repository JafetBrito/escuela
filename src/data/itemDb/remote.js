import { create } from 'zustand'
import { supabase, isSupabaseConfigured } from '../../services/supabase/client'
import { applyRemoteRows, ITEM_DB, ITEM_CLASS } from './index'

// La tabla `item_templates` de Supabase (supabase/migration_084.sql) es la FUENTE DE EDICIÓN de los objetos: lo que un
// admin cambie allí pisa los valores locales (que quedan como semilla / respaldo si no hay red ni tabla). Se guarda una
// copia en localStorage para que la próxima visita ya arranque con los valores editados, sin esperar a la red.
const CACHE = 'item_templates_cache_v1'
export const useItemDbStore = create(() => ({ version: 0, status: 'idle', error: null })) // version sube cada vez que cambia la tabla
const bump = (extra = {}) => useItemDbStore.setState((s) => ({ version: s.version + 1, ...extra }))

try {
  const cached = JSON.parse(localStorage.getItem(CACHE) || 'null')
  if (Array.isArray(cached) && cached.length) { applyRemoteRows(cached); bump({ status: 'cached' }) }
} catch { /* sin caché: se usan los valores locales */ }

export async function loadRemoteItems() {
  if (!isSupabaseConfigured()) return
  useItemDbStore.setState({ status: 'loading' })
  const { data, error } = await supabase.from('item_templates').select('entry,key,data')
  if (error) { useItemDbStore.setState({ status: 'error', error: error.message }); return } // p. ej. la migración 084 aún no se corrió
  applyRemoteRows(data || [])
  try { localStorage.setItem(CACHE, JSON.stringify(data || [])) } catch { /* cuota llena: no pasa nada */ }
  bump({ status: 'ready', error: null })
}

// Solo admin (la política RLS lo exige). Guarda TODA la fila (no solo el cambio) para que la base sea autosuficiente.
export async function saveItem(item) {
  const { entry, key, ...data } = item
  const { error } = await supabase.from('item_templates').upsert({ entry, key, data }, { onConflict: 'entry' })
  if (error) throw new Error(error.message)
  applyRemoteRows([{ entry, key, data }])
  bump()
}

// Siguiente entry libre dentro del rango de la clase (consumible 1000+, equipo 2000+, ...).
export function nextEntry(cls) {
  const base = ITEM_CLASS[cls]?.base ?? 9000
  return Math.max(base, ...ITEM_DB.filter((i) => i.entry >= base && i.entry < base + 1000).map((i) => i.entry + 1))
}
