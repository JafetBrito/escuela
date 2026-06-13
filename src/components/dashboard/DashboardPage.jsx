import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import AppTopBar from '../shared/AppTopBar'
import courses from '../../data/courses.json'
import { COURSES_DATA, hasCourseData } from '../../data/courseRegistry'
import { useProgressStore } from '../../stores/useProgressStore'
import { useAuthStore } from '../../stores/useAuthStore'

export default function DashboardPage() {
  const navigate = useNavigate()
  const progress = useProgressStore((s) => s.progress)
  const license = useAuthStore((s) => s.license)
  const hasAccessToCourse = useAuthStore((s) => s.hasAccessToCourse)

  const progressByCourse = (courseId) => {
    if (!hasCourseData(courseId)) return null
    const courseData = COURSES_DATA[courseId]
    const total = courseData.modules.length
    const moduleProgress = progress[courseId]?.moduleProgress ?? []
    const done = moduleProgress.filter((p) => p.completed).length
    return Math.round((done / total) * 100)
  }

  const categories = useMemo(() => {
    const groups = new Map()
    for (const course of courses) {
      const key = course.category ?? 'Otros'
      if (!groups.has(key)) groups.set(key, [])
      groups.get(key).push(course)
    }
    return Array.from(groups.entries())
  }, [])

  const handleSelect = (course) => {
    if (course.locked) return
    if (hasAccessToCourse(course.id)) {
      navigate(`/learn/${course.id}`)
    } else {
      navigate(`/crear-cuenta?course=${course.id}`)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-text">
      <AppTopBar />

      <main className="flex-1 px-4 py-8 md:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold">Hola{license?.role === 'admin' ? ', admin' : ''} 👋</h1>
              <p className="mt-1 text-sm text-text-muted">
                Continúa donde lo dejaste o explora los próximos cursos de oliver.escuela.
              </p>
            </div>
            {license?.type === 'full' && (
              <span className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                🔑 Llave completa · acceso a todos los cursos
              </span>
            )}
          </div>

          {categories.map(([category, categoryCourses]) => (
            <section key={category} className="mt-8">
              <h2 className="text-lg font-bold text-text">{category}</h2>
              <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {categoryCourses.map((course) => {
                  const pct = progressByCourse(course.id)
                  const owned = hasAccessToCourse(course.id)
                  return (
                    <button
                      key={course.id}
                      onClick={() => handleSelect(course)}
                      disabled={course.locked}
                      className={`flex flex-col gap-3 rounded-2xl border p-5 text-left transition-colors ${
                        course.locked
                          ? 'cursor-default border-border bg-surface opacity-60'
                          : 'border-border bg-surface hover:border-primary'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div
                          className="flex h-14 w-14 items-center justify-center rounded-xl text-3xl"
                          style={{ backgroundColor: `${course.color}22`, border: `1px solid ${course.color}` }}
                        >
                          {course.icon}
                        </div>
                        {course.locked && (
                          <span className="rounded-full border border-border px-2.5 py-1 text-xs text-text-muted">
                            🔒 Próximamente
                          </span>
                        )}
                        {!course.locked && !owned && (
                          <span className="rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-xs text-primary">
                            🔑 Comprar acceso
                          </span>
                        )}
                      </div>

                      <div>
                        <h3 className="text-lg font-bold text-text">{course.title}</h3>
                        <p className="mt-1 text-sm text-text-muted">{course.description}</p>
                      </div>

                      {pct !== null && owned && (
                        <div className="mt-2 flex items-center gap-3">
                          <div className="h-2 flex-1 rounded-full bg-surface-hover">
                            <div className="h-2 rounded-full bg-primary" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-xs text-text-muted">{pct}%</span>
                        </div>
                      )}

                      {!course.locked && (
                        <span className="self-start rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-background">
                          {owned ? (pct ? 'Continuar curso' : 'Empezar curso') : 'Obtener llave'}
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            </section>
          ))}
        </div>
      </main>
    </div>
  )
}
