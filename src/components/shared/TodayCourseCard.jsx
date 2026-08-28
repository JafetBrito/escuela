import { Link } from 'react-router-dom'
import { COURSES_DATA } from '../../data/courseRegistry'
import { useI18n } from '../../i18n'
import { localizeCourseCatalog } from '../../data/courseCatalogTranslations'
import ProgressRing from './ProgressRing'

// Tarjeta "curso de hoy" — anillo de progreso + título + botón Continuar/
// Empezar. Extraída de ProgressPage.jsx para reusarla también en el hero
// del Dashboard (ver project_dashboard_hero_redesign, ronda 2).
export default function TodayCourseCard({ course: rawCourse, pct, meta }) {
  const { t, lang } = useI18n()
  const course = localizeCourseCatalog(rawCourse, lang)
  const totalModules = COURSES_DATA[course.id]?.modules.length ?? 0
  return (
    <Link to={`/learn/${course.id}`}
      className="flex items-center gap-4 rounded-2xl border border-border bg-surface p-4 transition hover:border-primary hover:-translate-y-0.5">
      <ProgressRing pct={pct} accent={meta.accent} />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold text-text line-clamp-1">{course.icon} {course.title}</p>
        <p className="text-xs text-text-muted">{totalModules} {totalModules === 1 ? t('dashboard.summary.classSingular') : t('dashboard.summary.classPlural')}</p>
      </div>
      <span className="shrink-0 rounded-lg px-3 py-1.5 text-xs font-bold text-background" style={{ background: meta.accent }}>
        {pct > 0 ? t('dashboard.continuar') : t('dashboard.empezar')}
      </span>
    </Link>
  )
}
