import { create } from 'zustand'
import { supabase, isSupabaseConfigured } from '../../services/supabase/client'
import { WORLDS, MIN_QUESTIONS } from './racingData'

// Contenido editable de Oliver Racing (mundos → niveles → misiones y preguntas). Lo que viene de serie (racingData.js) es la SEMILLA; la tabla
// `racing_content` de Supabase (supabase/migration_085.sql, una fila por mundo) la PISA cuando un admin guarda desde el editor
// (/carrera/editor). Se guarda copia en localStorage para arrancar con lo editado sin esperar a la red. Mismo patrón que itemDb/remote.js.
const CACHE = 'racing_content_cache_v1'
export const useRacingContentStore = create(() => ({ version: 0, status: 'idle', error: null }))
const bump = (extra = {}) => useRacingContentStore.setState((s) => ({ version: s.version + 1, ...extra }))

const clone = (x) => JSON.parse(JSON.stringify(x))
const SEED = Object.fromEntries(Object.entries(WORLDS).map(([id, w]) => [id, clone(w.levels)])) // antes de aplicar nada remoto
export const seedLevels = (id) => clone(SEED[id] || [])

const str = (v) => (typeof v === 'string' ? v : '')
const arr = (v) => (Array.isArray(v) ? v : [])
const cleanI18n = (i18n) => (i18n && typeof i18n === 'object' ? clone(i18n) : undefined)

// Limpia y valida los niveles recibidos (de Supabase o de un archivo importado): descarta preguntas incompletas y normaliza los campos
export function sanitizeLevels(levels) {
  return arr(levels).map((lv, i) => ({
    id: str(lv.id) || `lv-${i + 1}`, name: str(lv.name) || `Nivel ${i + 1}`, blurb: str(lv.blurb),
    missions: arr(lv.missions).map((m) => ({
      name: str(m.name) || 'Misión', img: str(m.img) || '📖', deco: str(m.deco) || 'garden', topics: arr(m.topics).map(str).filter(Boolean),
      pal: { sky: '#bfe9ff', fog: '#dff3ff', ground: '#cfe9c8', ground2: '#b9dcb2', road: '#8f9ca6', accent: '#22c55e', ...(m.pal || {}) },
      intro: str(m.intro), story: arr(m.story).map(str), i18n: cleanI18n(m.i18n),
    })),
    questions: arr(lv.questions).filter((q) => str(q.q) && str(q.ok) && arr(q.bad).filter(Boolean).length >= 1).map((q) => ({
      t: str(q.t) || 'general', lvl: Math.max(0, Math.min(4, Number(q.lvl) || 0)), q: str(q.q), ok: str(q.ok), bad: arr(q.bad).map(str).filter(Boolean).slice(0, 2),
      fact: str(q.fact), img: str(q.img) || '💡', deep: typeof q.deep === 'string' ? q.deep.split('|').filter(Boolean) : arr(q.deep).map(str).filter(Boolean), i18n: cleanI18n(q.i18n),
    })),
  })).filter((lv) => lv.missions.length > 0)
}

export function applyRemoteWorld(id, data) {
  const levels = sanitizeLevels(data?.levels)
  if (WORLDS[id] && levels.length) WORLDS[id].levels = levels
}

try {
  const cached = JSON.parse(localStorage.getItem(CACHE) || 'null')
  if (Array.isArray(cached) && cached.length) { for (const r of cached) applyRemoteWorld(r.id, r.data); bump({ status: 'cached' }) }
} catch { /* sin caché: se usa la semilla */ }

export async function loadRemoteRacing() {
  if (!isSupabaseConfigured()) return
  useRacingContentStore.setState({ status: 'loading' })
  const { data, error } = await supabase.from('racing_content').select('id,data')
  if (error) { useRacingContentStore.setState({ status: 'error', error: error.message }); return } // p. ej. la migración 085 aún no se corrió
  for (const r of data || []) applyRemoteWorld(r.id, r.data)
  try { localStorage.setItem(CACHE, JSON.stringify(data || [])) } catch { /* cuota llena */ }
  bump({ status: 'ready', error: null })
}

// Solo admin (la política RLS lo exige): guarda los niveles del mundo y los aplica de inmediato
export async function saveWorldContent(id, levels) {
  const clean = sanitizeLevels(levels)
  const { error } = await supabase.from('racing_content').upsert({ id, data: { levels: clean } }, { onConflict: 'id' })
  if (error) throw new Error(error.message)
  applyRemoteWorld(id, { levels: clean }); bump()
  try { const rows = JSON.parse(localStorage.getItem(CACHE) || '[]').filter((r) => r.id !== id); rows.push({ id, data: { levels: clean } }); localStorage.setItem(CACHE, JSON.stringify(rows)) } catch { /* sin caché */ }
}
// Vuelve a la semilla del código: borra la fila de Supabase y restaura el contenido de serie
export async function resetWorldContent(id) {
  const { error } = await supabase.from('racing_content').delete().eq('id', id)
  if (error) throw new Error(error.message)
  WORLDS[id].levels = seedLevels(id); bump()
  try { localStorage.setItem(CACHE, JSON.stringify(JSON.parse(localStorage.getItem(CACHE) || '[]').filter((r) => r.id !== id))) } catch { /* sin caché */ }
}

// Informe de calidad de un nivel: cuántas preguntas, por dificultad, sin explicación detallada o sin traducir
export function levelReport(level) {
  const qs = level.questions, byLvl = [0, 1, 2, 3, 4].map((l) => qs.filter((q) => q.lvl === l).length)
  const missing = (lang) => qs.filter((q) => !q.i18n?.[lang]?.q).length
  return { total: qs.length, ok: qs.length >= MIN_QUESTIONS, byLvl, noDeep: qs.filter((q) => (q.deep || []).length < 2).length, noEn: missing('en'), noFr: missing('fr'), threeOpt: qs.filter((q) => q.bad.length >= 2).length, missions: level.missions.length }
}
