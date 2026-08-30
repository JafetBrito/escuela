import { useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../../stores/useAuthStore'
import { useTeacherStore } from '../../stores/useTeacherStore'
import TeacherShell from './TeacherShell'

// Tope de reflexiones recientes mostradas aquí antes de mandar al alumno a
// "ver todas" en /profesor/reflexiones — mismo criterio de REVIEW_QUEUE_CAP
// en AdminTasksPage.jsx, pero más chico porque esto es solo un resumen.
const RECENT_CAP = 5

export default function TeacherDashboardPage() {
  const session = useAuthStore((s) => s.session)
  const isTeacher = useAuthStore((s) => s.isTeacher)
  const myCourses = useTeacherStore((s) => s.myCourses)
  const myReflections = useTeacherStore((s) => s.myReflections)
  const fetchMyCourses = useTeacherStore((s) => s.fetchMyCourses)
  const fetchMyReflections = useTeacherStore((s) => s.fetchMyReflections)

  const teacherId = session?.user?.id

  useEffect(() => {
    if (!isTeacher?.() || !teacherId) return
    fetchMyCourses(teacherId)
    fetchMyReflections(teacherId)
  }, [isTeacher, teacherId, fetchMyCourses, fetchMyReflections])

  const recentReflections = useMemo(() => myReflections.slice(0, RECENT_CAP), [myReflections])

  if (!isTeacher?.()) {
    return <TeacherShell />
  }

  return (
    <TeacherShell>
      <div className="space-y-6">
        <div className="overflow-hidden rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-8 shadow-lg">
          <h1 className="text-3xl font-extrabold text-white">🧑‍🏫 Panel de Profesor</h1>
          <p className="mt-1 text-sm font-medium text-white/85">
            Tus cursos asignados y las reflexiones que te mandan tus alumnos.
          </p>
        </div>

        <div>
          <h2 className="mb-2 text-xs font-black uppercase tracking-widest text-text-muted/60">
            Tus cursos ({myCourses.length})
          </h2>
          {myCourses.length === 0 ? (
            <div className="rounded-2xl border border-border bg-surface py-8 text-center">
              <p className="text-sm text-text-muted">Todavía no tienes cursos asignados — pide a un admin que te asigne uno desde /admin/cursos.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
              {myCourses.map((c) => (
                <Link
                  key={c.id}
                  to={`/learn/${c.id}`}
                  className="rounded-2xl border border-border bg-surface p-4 transition-colors hover:border-primary/50"
                >
                  <span className="text-2xl">{c.icon}</span>
                  <p className="mt-1 font-bold text-text">{c.title}</p>
                  {c.description && <p className="line-clamp-2 text-xs text-text-muted">{c.description}</p>}
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-primary/30 bg-primary/5 p-4">
          <div className="mb-3 flex items-center justify-between gap-2">
            <h2 className="flex items-center gap-1.5 text-sm font-extrabold text-text">
              📥 Reflexiones recientes
              {myReflections.length > 0 && (
                <span className="rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-bold text-background">
                  {myReflections.length}
                </span>
              )}
            </h2>
            <Link to="/profesor/reflexiones" className="text-xs font-bold text-primary hover:underline">
              Ver bandeja completa →
            </Link>
          </div>

          {recentReflections.length === 0 ? (
            <p className="py-2 text-center text-sm text-text-muted">Todo al día ✅</p>
          ) : (
            <div className="space-y-2">
              {recentReflections.map((r) => (
                <div key={r.id} className="rounded-xl border border-border bg-surface p-3">
                  <p className="truncate text-xs font-bold text-primary">
                    {r.profiles?.display_name || r.profiles?.email || 'Alumno'}
                  </p>
                  <p className="line-clamp-2 text-sm text-text">{r.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </TeacherShell>
  )
}
