import { useI18n } from '../../i18n'

// Course card (compact) — usado también por MainCategoryPage.jsx y
// SchoolPage.jsx (`import { CourseCard } from './DashboardPage'`, que
// re-exporta este archivo). Extraído de DashboardPage.jsx sin cambios de
// comportamiento para que ese archivo se enfoque solo en la página.
export default function CourseCard({ course, pct, owned, accent, onClick }) {
  const { t } = useI18n()
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={course.locked}
      className={`group flex flex-col rounded-2xl border bg-surface text-left transition-all ${
        course.locked
          ? 'cursor-default border-border opacity-50'
          : 'border-border hover:-translate-y-0.5 hover:border-primary hover:shadow-lg'
      }`}
    >
      {/* Color bar */}
      <div className="h-1.5 w-full rounded-t-2xl" style={{ background: accent }} />
      <div className="flex flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl text-2xl flex-shrink-0"
            style={{ background: `${course.color}22`, border: `1px solid ${course.color}44` }}>
            {course.icon}
          </div>
          {course.locked && <span className="text-[10px] text-text-muted mt-0.5">🔒</span>}
          {!course.locked && !owned && <span className="text-[10px] text-primary mt-0.5 font-semibold">{t('dashboard.freeLabel')}</span>}
          {!course.locked && owned && pct === 100 && <span className="text-[10px] text-primary mt-0.5">🏅</span>}
        </div>
        <div>
          <p className="text-sm font-bold text-text leading-tight line-clamp-2">{course.title}</p>
          <p className="mt-0.5 text-xs text-text-muted line-clamp-2">{course.description}</p>
        </div>
        {pct !== null && owned && (
          <div className="flex items-center gap-2">
            <div className="h-1.5 flex-1 rounded-full bg-surface-hover">
              <div className="h-1.5 rounded-full transition-all" style={{ width: `${pct}%`, background: accent }} />
            </div>
            <span className="text-[10px] text-text-muted">{pct}%</span>
          </div>
        )}
        {!course.locked && (
          <span className="self-start rounded-lg px-3 py-1 text-xs font-semibold text-background transition-colors"
            style={{ background: accent }}>
            {owned ? (pct ? t('dashboard.continuar') : t('dashboard.empezar')) : t('dashboard.probarGratis')}
          </span>
        )}
      </div>
    </button>
  )
}
