import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import AppTopBar from '../shared/AppTopBar'
import courses from '../../data/courses.json'
import { COURSES_DATA, hasCourseData } from '../../data/courseRegistry'
import { useProgressStore } from '../../stores/useProgressStore'
import { useAuthStore } from '../../stores/useAuthStore'

// Visual identity per category: gradient for the banner header + accent used
// for the roadmap line and step numbers.
const CATEGORY_META = {
  'Inteligencia Artificial': { icon: '🧠', gradient: 'from-[#98ca3f] to-[#34d399]', accent: '#98ca3f' },
  Productividad: { icon: '⚡', gradient: 'from-[#fbbf24] to-[#f97316]', accent: '#fbbf24' },
  Diseño: { icon: '🎨', gradient: 'from-[#f472b6] to-[#a78bfa]', accent: '#f472b6' },
  Idiomas: { icon: '🗣️', gradient: 'from-[#38bdf8] to-[#60a5fa]', accent: '#38bdf8' },
  Programación: { icon: '💻', gradient: 'from-[#fb923c] to-[#facc15]', accent: '#fb923c' },
  Pruebas: { icon: '🧪', gradient: 'from-[#2dd4bf] to-[#60a5fa]', accent: '#2dd4bf' },
  Otros: { icon: '📚', gradient: 'from-[#94a3b8] to-[#64748b]', accent: '#94a3b8' },
}

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

          {categories.map(([category, categoryCourses]) => {
            const meta = CATEGORY_META[category] ?? CATEGORY_META.Otros
            return (
              <section key={category} className="mt-10">
                <div
                  className={`flex items-center gap-4 rounded-2xl bg-gradient-to-r ${meta.gradient} px-5 py-4 shadow-lg`}
                >
                  <span className="text-4xl drop-shadow-sm">{meta.icon}</span>
                  <div>
                    <h2 className="text-xl font-extrabold tracking-tight text-background drop-shadow-sm">
                      {category}
                    </h2>
                    <p className="text-sm font-medium text-background/80">
                      {categoryCourses.length}{' '}
                      {categoryCourses.length === 1 ? 'curso' : 'cursos'} en esta ruta
                    </p>
                  </div>
                </div>

                <div className="relative mt-6 flex flex-col gap-6 pl-10 sm:pl-14">
                  <div
                    className="absolute bottom-4 left-[19px] top-4 w-0.5 sm:left-[27px]"
                    style={{ backgroundColor: `${meta.accent}40` }}
                    aria-hidden="true"
                  />
                  {categoryCourses.map((course, index) => {
                    const pct = progressByCourse(course.id)
                    const owned = hasAccessToCourse(course.id)
                    return (
                      <div key={course.id} className="relative">
                        <div
                          className="absolute -left-10 top-5 flex h-9 w-9 items-center justify-center rounded-full border-2 text-sm font-extrabold sm:-left-14 sm:h-11 sm:w-11"
                          style={{
                            borderColor: meta.accent,
                            backgroundColor: 'var(--color-background)',
                            color: meta.accent,
                          }}
                        >
                          {index + 1}
                        </div>
                        <button
                          onClick={() => handleSelect(course)}
                          disabled={course.locked}
                          className={`flex w-full flex-col gap-3 rounded-2xl border p-5 text-left transition-all ${
                            course.locked
                              ? 'cursor-default border-border bg-surface opacity-60'
                              : 'border-border bg-surface hover:-translate-y-0.5 hover:border-primary hover:shadow-xl'
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
                            {!course.locked && owned && pct === 100 && (
                              <span className="rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                                🏅 Completado
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
                                <div
                                  className="h-2 rounded-full"
                                  style={{ width: `${pct}%`, backgroundColor: meta.accent }}
                                />
                              </div>
                              <span className="text-xs text-text-muted">{pct}%</span>
                            </div>
                          )}

                          {!course.locked && (
                            <span
                              className="self-start rounded-lg px-4 py-2 text-sm font-semibold text-background"
                              style={{ backgroundColor: meta.accent }}
                            >
                              {owned ? (pct ? 'Continuar curso' : 'Empezar curso') : 'Obtener llave'}
                            </span>
                          )}
                        </button>
                      </div>
                    )
                  })}
                </div>
              </section>
            )
          })}
        </div>
      </main>
    </div>
  )
}
