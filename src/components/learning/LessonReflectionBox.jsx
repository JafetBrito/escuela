/**
 * ============================================================================
 * 💭 REFLEXIÓN DE CLASE (LessonReflectionBox.jsx)
 * ============================================================================
 *
 * Caja chica y opcional que vive junto al botón "Siguiente clase →" (ver
 * LearningInterface.jsx, en AMBAS ramas: la de módulos "steppable" y la de
 * vr/slideshow/audio/embed). Dos acciones independientes, ninguna obligatoria:
 *
 *   1. Enviar la reflexión al profesor del curso — solo si el curso tiene uno
 *      asignado (teacherId). Inserta en lesson_reflections (migration_048.sql)
 *      y notifica al profesor (migration_049.sql / notifyTeacherReflection).
 *   2. Guardarla en las notas propias del alumno — usa setModuleNote, que ya
 *      existe en useProgressStore.js y ya viaja en el snapshot de progreso
 *      hacia Supabase; no se inventa ningún mecanismo nuevo de notas.
 *
 * A propósito NO limpia el textarea después de enviar/guardar (para que el
 * alumno pueda hacer ambas cosas con el mismo texto) y a propósito NO exige
 * nada para dejar avanzar — "Siguiente clase" sigue funcionando exactamente
 * igual si esta caja nunca se toca.
 * ============================================================================
 */

import { useState } from 'react'
import { supabase } from '../../services/supabase/client'
import { useAuthStore } from '../../stores/useAuthStore'
import { useNotificationsStore } from '../../stores/useNotificationsStore'
import { useProgressStore } from '../../stores/useProgressStore'

export default function LessonReflectionBox({ courseId, moduleId, teacherId, teacherName }) {
  const [text, setText] = useState('')
  const [sentState, setSentState] = useState('idle') // idle | sending | sent | error
  const [savedState, setSavedState] = useState('idle') // idle | saved

  const hasText = text.trim().length > 0

  const handleSend = async () => {
    if (!hasText || sentState === 'sending') return
    const session = useAuthStore.getState().session
    const studentId = session?.user?.id
    if (!studentId) return
    setSentState('sending')
    const { data, error } = await supabase
      .from('lesson_reflections')
      .insert({
        student_id: studentId,
        course_id: courseId,
        module_id: String(moduleId),
        teacher_id: teacherId,
        content: text.trim(),
      })
      .select()
      .single()
    if (error || !data) {
      console.error('[LessonReflectionBox] insert falló:', error?.message)
      setSentState('error')
      return
    }
    const studentName = useAuthStore.getState().profile?.display_name
    useNotificationsStore.getState().notifyTeacherReflection(data, studentName)
    setSentState('sent')
  }

  const handleSave = () => {
    if (!hasText) return
    useProgressStore.getState().setModuleNote(courseId, moduleId, text.trim())
    setSavedState('saved')
  }

  return (
    <div className="rounded-2xl border border-border bg-surface p-4">
      <p className="mb-2 text-sm font-bold text-text">¿Qué te dejó esta clase?</p>
      <textarea
        value={text}
        onChange={(e) => {
          setText(e.target.value)
          if (sentState === 'sent' || sentState === 'error') setSentState('idle')
          if (savedState === 'saved') setSavedState('idle')
        }}
        placeholder="Una reflexión, una duda, algo que te hizo pensar…"
        rows={2}
        className="w-full resize-none rounded-xl border border-border bg-background px-3 py-2 text-sm text-text placeholder:text-text-muted/60 focus:border-primary/50 focus:outline-none"
      />
      <div className="mt-2 flex flex-wrap items-center gap-2">
        {teacherId && (
          <button
            type="button"
            onClick={handleSend}
            disabled={!hasText || sentState === 'sending'}
            className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-text transition-colors hover:border-primary/40 disabled:cursor-not-allowed disabled:opacity-40"
          >
            📩 Enviar a mi profesor{teacherName ? ` (${teacherName})` : ''}
          </button>
        )}
        <button
          type="button"
          onClick={handleSave}
          disabled={!hasText}
          className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-text transition-colors hover:border-primary/40 disabled:cursor-not-allowed disabled:opacity-40"
        >
          📝 Guardar en mis notas
        </button>
        {sentState === 'sent' && <span className="text-xs font-semibold text-emerald-500">✅ Enviado</span>}
        {sentState === 'error' && <span className="text-xs font-semibold text-danger">No se pudo enviar, intenta de nuevo</span>}
        {savedState === 'saved' && <span className="text-xs font-semibold text-emerald-500">✅ Guardado</span>}
      </div>
    </div>
  )
}
