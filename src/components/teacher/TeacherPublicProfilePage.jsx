import { useEffect } from 'react'
import { useParams, Link, Navigate } from 'react-router-dom'
import AppTopBar from '../shared/AppTopBar'
import { useTeacherStore } from '../../stores/useTeacherStore'

// Pública para cualquier alumno logueado (no solo el profesor o un admin) —
// habilitada por "profiles: anyone can view teacher profiles"
// (migration_048.sql). Sin TeacherShell: no es una página del PANEL de
// profesor, es la vitrina que ve un alumno al hacer clic en "Impartido por…"
// desde CourseRoadmapPage.jsx.
export default function TeacherPublicProfilePage() {
  const { id } = useParams()
  const publicProfile = useTeacherStore((s) => s.publicProfile)
  const publicCourses = useTeacherStore((s) => s.publicCourses)
  const fetchPublicTeacherProfile = useTeacherStore((s) => s.fetchPublicTeacherProfile)
  const fetchPublicTeacherCourses = useTeacherStore((s) => s.fetchPublicTeacherCourses)

  useEffect(() => {
    if (!id) return
    fetchPublicTeacherProfile(id)
    fetchPublicTeacherCourses(id)
  }, [id, fetchPublicTeacherProfile, fetchPublicTeacherCourses])

  if (!id) return <Navigate to="/dashboard" replace />

  return (
    <div className="flex min-h-screen flex-col bg-background text-text">
      <AppTopBar />
      <main className="flex-1 px-4 py-8 md:px-8">
        <div className="mx-auto max-w-2xl space-y-5">
          {!publicProfile ? (
            <p className="py-10 text-center text-sm text-text-muted">Cargando…</p>
          ) : (
            <>
              <div className="flex items-center gap-4 rounded-2xl border border-border bg-surface p-5">
                {publicProfile.avatar_url ? (
                  <img src={publicProfile.avatar_url} alt="" className="h-16 w-16 shrink-0 rounded-full object-cover" />
                ) : (
                  <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary/10 text-2xl">🧑‍🏫</span>
                )}
                <div className="min-w-0">
                  <h1 className="truncate text-xl font-black text-text">{publicProfile.display_name || 'Profesor'}</h1>
                  {publicProfile.teacher_bio && (
                    <p className="mt-1 whitespace-pre-wrap text-sm text-text-muted">{publicProfile.teacher_bio}</p>
                  )}
                </div>
              </div>

              <div>
                <h2 className="mb-2 text-xs font-black uppercase tracking-widest text-text-muted/60">
                  También imparte
                </h2>
                {publicCourses.length === 0 ? (
                  <p className="text-sm text-text-muted">Sin otros cursos asignados.</p>
                ) : (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {publicCourses.map((c) => (
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
            </>
          )}
        </div>
      </main>
    </div>
  )
}
