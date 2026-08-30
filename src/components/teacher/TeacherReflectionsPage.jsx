import { useEffect, useRef } from 'react'
import { useAuthStore } from '../../stores/useAuthStore'
import { useTeacherStore } from '../../stores/useTeacherStore'
import { getCourseData, hasCourseData } from '../../data/courseRegistry'
import TeacherShell from './TeacherShell'
import { supabase } from '../../services/supabase/client'

// Resuelve course_id -> título reutilizando courseRegistry.js (mismo patrón
// que AdminTasksPage.jsx usa para "linkedLesson") en vez de otra consulta —
// el catálogo completo ya está cargado en memoria desde que App.jsx llamó a
// useCourseContentStore.fetchAll() al arrancar.
function courseTitle(courseId) {
  if (!courseId || !hasCourseData(courseId)) return courseId
  return getCourseData(courseId)?.title ?? courseId
}

function ReflectionRow({ reflection }) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-4">
      <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-bold text-primary">
          {reflection.profiles?.display_name || reflection.profiles?.email || 'Alumno'}
        </p>
        <p className="text-xs text-text-muted/60">
          {new Date(reflection.created_at).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
      <p className="text-xs font-semibold text-text-muted">🎓 {courseTitle(reflection.course_id)}</p>
      <p className="mt-2 whitespace-pre-wrap text-sm text-text">{reflection.content}</p>
    </div>
  )
}

export default function TeacherReflectionsPage() {
  const session = useAuthStore((s) => s.session)
  const isTeacher = useAuthStore((s) => s.isTeacher)
  const myReflections = useTeacherStore((s) => s.myReflections)
  const fetchMyReflections = useTeacherStore((s) => s.fetchMyReflections)

  const teacherId = session?.user?.id
  const teacherIdRef = useRef(teacherId)
  useEffect(() => { teacherIdRef.current = teacherId }, [teacherId])

  useEffect(() => {
    if (!isTeacher?.() || !teacherId) return
    fetchMyReflections(teacherId)
  }, [isTeacher, teacherId, fetchMyReflections])

  // Reflexión nueva mientras el profesor tiene esta página abierta — mismo
  // patrón de canal Realtime que 'admin-tasks-live' en AdminTasksPage.jsx
  // (ver migration_048.sql, que agrega lesson_reflections a
  // supabase_realtime).
  useEffect(() => {
    if (!isTeacher?.()) return
    const channel = supabase
      .channel('teacher-reflections-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'lesson_reflections' }, () => {
        if (teacherIdRef.current) fetchMyReflections(teacherIdRef.current)
      })
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [isTeacher, fetchMyReflections])

  if (!isTeacher?.()) {
    return <TeacherShell />
  }

  return (
    <TeacherShell>
      <div className="space-y-4">
        <h1 className="text-xl font-black text-text">📥 Reflexiones de tus alumnos</h1>

        {myReflections.length === 0 ? (
          <div className="rounded-2xl border border-border bg-surface py-10 text-center">
            <p className="text-sm text-text-muted">Todo al día ✅ — todavía no te ha llegado ninguna reflexión.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {myReflections.map((r) => (
              <ReflectionRow key={r.id} reflection={r} />
            ))}
          </div>
        )}
      </div>
    </TeacherShell>
  )
}
