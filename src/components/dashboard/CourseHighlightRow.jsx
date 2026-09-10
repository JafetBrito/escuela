import { Link } from 'react-router-dom'
import { CATEGORY_META } from '../../data/categoryMeta'
import { localizeCourseCatalog } from '../../data/courseCatalogTranslations'
import { useI18n } from '../../i18n'

// Fila de tarjetas de curso grandes con badge de estado + ícono decorativo —
// calco de la fila "Your Courses" de la referencia (tarjetas grises con
// badge Active/Finished + ilustración), con datos reales: estado real
// (completado/en progreso/bloqueado/disponible) y el ícono propio de cada
// curso (courses.json ya trae `icon`/`color`), no una ilustración genérica.
const STATUS_META = {
  completed: { key: 'completed', pill: 'bg-emerald-500/90 text-white' },
  inProgress: { key: 'inProgress', pill: 'bg-primary text-background' },
  locked: { key: 'locked', pill: 'bg-surface-hover text-text-muted' },
  available: { key: 'available', pill: 'bg-amber-400/90 text-background' },
}

function courseStatus(course, pct) {
  if (course.locked) return 'locked'
  if (pct === 100) return 'completed'
  if (pct > 0) return 'inProgress'
  return 'available'
}

export default function CourseHighlightRow({ courseList, progressByCourse }) {
  const { t, lang } = useI18n()
  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-extrabold text-text">{t('dashboard.hero.yourCourses')}</p>
        <Link to="/academias" className="text-xs text-primary hover:underline">{t('dashboard.seeAllF')}</Link>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2">
        {courseList.map((raw) => {
          const course = localizeCourseCatalog(raw, lang)
          const pct = progressByCourse(course.id) ?? 0
          const status = courseStatus(course, pct)
          const meta = CATEGORY_META[course.category] ?? CATEGORY_META.Otros
          return (
            <Link
              key={course.id}
              to={course.locked ? '/academias' : `/learn/${course.id}`}
              className="relative flex w-52 shrink-0 flex-col justify-between overflow-hidden rounded-2xl border border-border bg-surface-hover p-4 transition hover:-translate-y-0.5 hover:border-primary/40"
              style={{ minHeight: 132 }}
            >
              <div className="flex items-center justify-between">
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${STATUS_META[status].pill}`}>
                  {t(`dashboard.hero.status.${STATUS_META[status].key}`)}
                </span>
                {course.locked && <span className="text-xs">🔒</span>}
              </div>
              <div>
                <p className="mt-3 line-clamp-2 text-sm font-bold text-text">{course.title}</p>
                <p className="mt-1 text-[11px] text-text-muted">{course.category}</p>
              </div>
              <span
                className="pointer-events-none absolute -bottom-3 -right-3 flex h-16 w-16 items-center justify-center rounded-full text-3xl opacity-90"
                style={{ background: `${meta.accent}22` }}
              >
                {course.icon}
              </span>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
