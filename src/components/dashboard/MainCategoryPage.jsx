import { useMemo } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import courses from '../../data/courses.json'
import { CATEGORY_META } from '../../data/categoryMeta'
import { MAIN_CATEGORIES, getMainCategory } from '../../data/categoryTaxonomy'
import { COURSES_DATA, hasCourseData } from '../../data/courseRegistry'
import { useAuthStore } from '../../stores/useAuthStore'
import { useProgressStore } from '../../stores/useProgressStore'
import { useI18n } from '../../i18n'
import { localizeCategoryName, localizeTopics } from '../../data/categoryTranslations'
import AppTopBar from '../shared/AppTopBar'
import { CourseCard } from './DashboardPage'

// Página de una de las 5 grandes áreas del conocimiento (+ Plataforma) —
// reemplaza el flujo anterior de "categoría → escuela con mascota y chat"
// por algo más directo: categoría → subcategorías → cursos, de un vistazo,
// sin distraer con un profesor 3D. /escuela-categoria/:id
export default function MainCategoryPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const hasAccessToCourse = useAuthStore((s) => s.hasAccessToCourse)
  const progress = useProgressStore((s) => s.progress)
  const { t, lang } = useI18n()

  const mainCategory = getMainCategory(id)
  const index = MAIN_CATEGORIES.findIndex((m) => m.id === id)
  const prevCategory = index > -1 ? MAIN_CATEGORIES[(index - 1 + MAIN_CATEGORIES.length) % MAIN_CATEGORIES.length] : null
  const nextCategory = index > -1 ? MAIN_CATEGORIES[(index + 1) % MAIN_CATEGORIES.length] : null

  const sections = useMemo(() => {
    if (!mainCategory) return []
    return mainCategory.subcategories.map((sub) => ({
      ...sub,
      courses: courses.filter((c) => sub.schoolCategories.includes(c.category ?? 'Otros')),
    }))
  }, [mainCategory])

  const progressByCourse = (courseId) => {
    if (!hasCourseData(courseId)) return null
    const total = COURSES_DATA[courseId].modules.length
    const done = (progress[courseId]?.moduleProgress ?? []).filter((p) => p.completed).length
    return Math.round((done / total) * 100)
  }

  const handleSelect = (course) => { if (!course.locked) navigate(`/learn/${course.id}`) }

  if (!mainCategory) {
    return (
      <div className="flex min-h-screen flex-col bg-background text-text">
        <AppTopBar />
        <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
          <p className="text-4xl">🏫</p>
          <p className="text-lg font-bold">{t('dashboard.school.categoryNotFound')}</p>
          <Link to="/dashboard?tab=escuelas" className="text-sm text-primary hover:underline">
            {t('dashboard.school.backToSchools')}
          </Link>
        </div>
      </div>
    )
  }

  const totalCourses = sections.reduce((n, s) => n + s.courses.length, 0)

  return (
    <div className="flex min-h-screen flex-col bg-background text-text">
      <AppTopBar />
      <main className="flex-1">
        <div className={`bg-gradient-to-r ${mainCategory.gradient} px-6 py-8`}>
          <Link to="/dashboard?tab=escuelas" className="text-sm font-semibold text-background/80 hover:text-background hover:underline">
            {t('dashboard.school.backToSchools')}
          </Link>
          <p className="mt-3 text-5xl drop-shadow-sm">{mainCategory.icon}</p>
          <h1 className="mt-2 text-2xl font-black text-background drop-shadow-sm">{localizeCategoryName(mainCategory.title, lang)}</h1>
          <p className="mt-1 text-sm text-background/80">{t('dashboard.school.coursesInSubcategories', { total: totalCourses, count: sections.length })}</p>

          <div className="mt-4 flex gap-2">
            <Link to={`/escuela-categoria/${prevCategory.id}`} className="flex items-center gap-1.5 rounded-lg bg-black/15 px-3 py-1.5 text-xs font-bold text-background hover:bg-black/25">
              ← {prevCategory.icon} {localizeCategoryName(prevCategory.title, lang)}
            </Link>
            <Link to={`/escuela-categoria/${nextCategory.id}`} className="flex items-center gap-1.5 rounded-lg bg-black/15 px-3 py-1.5 text-xs font-bold text-background hover:bg-black/25">
              {nextCategory.icon} {localizeCategoryName(nextCategory.title, lang)} →
            </Link>
          </div>
        </div>

        <div className="mx-auto max-w-4xl px-4 py-6">
          {sections.map((sub) => {
            const subAccent = CATEGORY_META[sub.schoolCategories[0]]?.accent ?? mainCategory.accent
            const subIcon = CATEGORY_META[sub.schoolCategories[0]]?.icon
            return (
              <section key={sub.name} className="mb-8 rounded-2xl border-l-4 pl-4" style={{ borderColor: subAccent }}>
                <h2 className="mb-3 flex items-center gap-1.5 text-sm font-bold uppercase tracking-wider" style={{ color: subAccent }}>
                  {subIcon && <span className="text-base normal-case">{subIcon}</span>} {localizeCategoryName(sub.name, lang)}
                </h2>

                {sub.courses.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-border bg-surface p-4">
                    <p className="text-sm font-semibold text-text">{t('languageAcademy.soon')}</p>
                    {sub.topics.length > 0 && (
                      <p className="mt-1 text-xs text-text-muted">{t('dashboard.school.willCover', { topics: localizeTopics(sub.topics, lang).join(', ') })}</p>
                    )}
                  </div>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {sub.courses.map((course) => (
                      <CourseCard
                        key={course.id}
                        course={course}
                        pct={progressByCourse(course.id)}
                        owned={hasAccessToCourse(course.id)}
                        accent={CATEGORY_META[course.category]?.accent ?? mainCategory.accent}
                        onClick={() => handleSelect(course)}
                      />
                    ))}
                  </div>
                )}
              </section>
            )
          })}
        </div>
      </main>
    </div>
  )
}
