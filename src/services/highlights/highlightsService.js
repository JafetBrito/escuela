import { supabase, isSupabaseConfigured } from '../supabase/client'

// CRUD directo contra la tabla `highlights` (migration_061.sql) — sin store
// de Zustand, mismo criterio que CommentsPanel.jsx: la tabla+RLS ya es la
// fuente de verdad, no hace falta duplicar el estado en un store aparte.
// Usado tanto por TextSelectionMenu.jsx (crear) como por TextLesson.jsx
// (leer/actualizar/borrar).

export async function fetchHighlights(courseId, moduleId) {
  if (!isSupabaseConfigured()) return []
  const { data, error } = await supabase
    .from('highlights')
    .select('id, color, quote, prefix, suffix, comment')
    .eq('course_id', courseId)
    .eq('module_id', String(moduleId))
  if (error) {
    console.error('[highlightsService] fetch failed:', error)
    return []
  }
  return data ?? []
}

export async function createHighlight({ courseId, moduleId, userId, color, quote, prefix, suffix }) {
  if (!isSupabaseConfigured()) return null
  const { data, error } = await supabase
    .from('highlights')
    .insert({
      course_id: courseId,
      module_id: String(moduleId),
      user_id: userId,
      color,
      quote,
      prefix,
      suffix,
    })
    .select('id, color, quote, prefix, suffix, comment')
    .single()
  if (error) {
    console.error('[highlightsService] create failed:', error)
    return null
  }
  return data
}

export async function updateHighlightComment(id, comment) {
  if (!isSupabaseConfigured()) return false
  const { error } = await supabase.from('highlights').update({ comment }).eq('id', id)
  if (error) console.error('[highlightsService] update comment failed:', error)
  return !error
}

export async function deleteHighlight(id) {
  if (!isSupabaseConfigured()) return false
  const { error } = await supabase.from('highlights').delete().eq('id', id)
  if (error) console.error('[highlightsService] delete failed:', error)
  return !error
}
