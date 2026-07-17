import courses from '../../data/courses.json'
import { COURSES_DATA, hasCourseData } from '../../data/courseRegistry'

// Panel de solo lectura: qué cursos tiene un alumno con progreso y en qué %.
// No existe una tabla de inscripción — se deriva de profiles.snapshot.progress
// (el mismo jsonb que ya se sincroniza vía buildProgressSnapshot), igual
// cálculo que progressByCourse en DashboardPage.jsx. Se usa en AdminTasksPage
// y AdminProjectsPage para que el admin vea de un vistazo qué toma cada alumno.
export default function StudentCoursesPanel({ student }) {
  const progress = student?.snapshot?.progress ?? {}

  const enrolled = Object.keys(progress)
    .filter((courseId) => hasCourseData(courseId))
    .map((courseId) => {
      const total = COURSES_DATA[courseId].modules.length
      const done = (progress[courseId]?.moduleProgress ?? []).filter((p) => p.completed).length
      const pct = total > 0 ? Math.round((done / total) * 100) : 0
      const meta = courses.find((c) => c.id === courseId)
      return { courseId, pct, title: meta?.title ?? courseId, icon: meta?.icon ?? '📚' }
    })
    .filter((c) => c.pct > 0 || progress[c.courseId]?.selectedModuleId)
    .sort((a, b) => b.pct - a.pct)

  return (
    <div className="rounded-xl border border-border bg-surface p-3">
      <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-text-muted/60">📚 Cursos con progreso</p>
      {enrolled.length === 0 ? (
        <p className="text-xs text-text-muted">Sin progreso registrado todavía.</p>
      ) : (
        <div className="space-y-1.5">
          {enrolled.map((c) => (
            <div key={c.courseId} className="flex items-center gap-2">
              <span className="text-sm">{c.icon}</span>
              <span className="flex-1 truncate text-xs font-medium text-text">{c.title}</span>
              <span className="text-[11px] font-bold text-text-muted">{c.pct}%</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
