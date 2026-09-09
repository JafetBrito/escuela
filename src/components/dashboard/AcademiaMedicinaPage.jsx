import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AppTopBar from '../shared/AppTopBar'
import NpcChatPanel from '../shared/NpcChatPanel'
import SchoolTeacherViewport from '../mascot/SchoolTeacherViewport'
import courses from '../../data/courses.json'
import { CATEGORY_META } from '../../data/categoryMeta'
import { COURSES_DATA, hasCourseData } from '../../data/courseRegistry'
import { localizeCourseCatalog } from '../../data/courseCatalogTranslations'
import { localizeCategoryName } from '../../data/categoryTranslations'
import { useAuthStore } from '../../stores/useAuthStore'
import { useProgressStore } from '../../stores/useProgressStore'
import { useI18n } from '../../i18n'

// Academia de Medicina — página propia (/academia-medicina), mismo patrón que
// AcademiaIAPage.jsx: portada + catálogo filtrable por subcategoría (no hay
// niveles de dificultad marcados en estos cursos todavía, así que el filtro
// aquí es solo por ruta/subcategoría). La Escuela genérica sigue existiendo
// en /escuela/medicina para quien llegue por ahí.
function MedCourseCard({ course, pct, owned, onClick, t, lang }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={course.locked}
      className={`group flex flex-col overflow-hidden rounded-2xl border text-left transition-all ${
        course.locked
          ? 'cursor-default border-border/60 bg-surface/60 opacity-60'
          : 'border-border bg-surface hover:-translate-y-1 hover:border-primary/50 hover:shadow-xl'
      }`}
    >
      <div className="flex items-center justify-between border-b border-border/60 bg-emerald-500/10 px-4 py-2">
        <span className="text-[11px] font-bold uppercase tracking-wide text-emerald-400">
          {localizeCategoryName(course.subcategory ?? course.category, lang)}
        </span>
        {course.locked && <span className="text-[10px] font-bold text-text-muted">{t('pages.academiaMedicina.comingSoon')}</span>}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-center gap-3">
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-2xl"
            style={{ background: `${course.color}22`, border: `1px solid ${course.color}44` }}
          >
            {course.icon}
          </div>
          <p className="text-sm font-bold leading-tight text-text">{course.title}</p>
        </div>
        <p className="text-xs leading-snug text-text-muted line-clamp-3">{course.description}</p>
        {pct !== null && owned && (
          <div className="mt-1 flex items-center gap-2">
            <div className="h-1.5 flex-1 rounded-full bg-surface-hover">
              <div className="h-1.5 rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
            </div>
            <span className="text-[10px] text-text-muted">{pct}%</span>
          </div>
        )}
        {!course.locked && (
          <span className="mt-auto self-start rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-background transition group-hover:opacity-90">
            {owned ? (pct ? t('pages.academiaMedicina.continue') : t('pages.academiaMedicina.start')) : t('pages.academiaMedicina.tryFree')}
          </span>
        )}
      </div>
    </button>
  )
}

export default function AcademiaMedicinaPage() {
  const navigate = useNavigate()
  const hasAccessToCourse = useAuthStore((s) => s.hasAccessToCourse)
  const progress = useProgressStore((s) => s.progress)
  const meta = CATEGORY_META.Medicina
  const { t, lang } = useI18n()

  const [subcat, setSubcat] = useState('todas')

  const medCourses = useMemo(
    () => courses.filter((c) => c.category === 'Medicina').map((c) => localizeCourseCatalog(c, lang)),
    [lang],
  )
  const subcategories = useMemo(
    () => Array.from(new Set(medCourses.map((c) => c.subcategory).filter(Boolean))),
    [medCourses],
  )

  const filtered = medCourses.filter((c) => subcat === 'todas' || c.subcategory === subcat)

  const progressByCourse = (courseId) => {
    if (!hasCourseData(courseId)) return null
    const total = COURSES_DATA[courseId].modules.length
    const done = (progress[courseId]?.moduleProgress ?? []).filter((p) => p.completed).length
    return Math.round((done / total) * 100)
  }

  const handleSelect = (course) => { if (!course.locked) navigate(`/learn/${course.id}`) }

  return (
    <div className="flex min-h-screen flex-col bg-background text-text">
      <AppTopBar />
      <main className="flex-1">
        <div className={`relative overflow-hidden bg-gradient-to-br ${meta.gradient} px-6 py-14 text-center sm:py-20`}>
          <div
            className="pointer-events-none absolute inset-0 opacity-10"
            style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #000 1px, transparent 0)', backgroundSize: '24px 24px' }}
          />
          <div className="relative mx-auto max-w-2xl">
            <p className="text-5xl drop-shadow-sm">🩺</p>
            <h1 className="mt-3 text-3xl font-black text-background drop-shadow-sm sm:text-4xl">{t('pages.academiaMedicina.title')}</h1>
            <p className="mt-3 text-sm font-medium text-background/85 sm:text-base">
              {t('pages.academiaMedicina.subtitle')}
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
              <span className="rounded-full bg-background/20 px-3 py-1.5 text-xs font-bold text-background backdrop-blur-sm">
                {t('pages.academiaMedicina.coursesBadge', { count: medCourses.length })}
              </span>
              <span className="rounded-full bg-background/20 px-3 py-1.5 text-xs font-bold text-background backdrop-blur-sm">
                {t('pages.academiaMedicina.pathsBadge', { count: subcategories.length })}
              </span>
              <span className="rounded-full bg-background/20 px-3 py-1.5 text-xs font-bold text-background backdrop-blur-sm">
                {t('pages.academiaMedicina.instructorBadge', { name: meta.teacherName })}
              </span>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-5xl px-4 py-8">
          <div>
            <p className="mb-1.5 text-[10px] font-black uppercase tracking-widest text-text-muted/60">{t('pages.academiaMedicina.path')}</p>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => setSubcat('todas')}
                className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${
                  subcat === 'todas' ? 'bg-primary text-background' : 'border border-border text-text-muted hover:text-text'
                }`}
              >
                {t('pages.academiaMedicina.all', { count: medCourses.length })}
              </button>
              {subcategories.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSubcat(s)}
                  className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${
                    subcat === s ? 'bg-primary text-background' : 'border border-border text-text-muted hover:text-text'
                  }`}
                >
                  {localizeCategoryName(s, lang)} <span className="opacity-60">· {medCourses.filter((c) => c.subcategory === s).length}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((course) => (
              <MedCourseCard
                key={course.id}
                course={course}
                pct={progressByCourse(course.id)}
                owned={hasAccessToCourse(course.id)}
                onClick={() => handleSelect(course)}
                t={t}
                lang={lang}
              />
            ))}
            {filtered.length === 0 && (
              <p className="col-span-full py-10 text-center text-sm text-text-muted">{t('pages.academiaMedicina.noResults')}</p>
            )}
          </div>

          <div className="mt-10 overflow-hidden rounded-2xl border border-border bg-surface">
            <div className="flex flex-col sm:flex-row">
              <SchoolTeacherViewport mascotId={meta.teacherMascotId} className="h-56 shrink-0 sm:h-auto sm:w-64" />
              <div className="flex flex-1 flex-col gap-2 p-5">
                <p className="text-sm font-bold text-text">{t('pages.academiaMedicina.instructorTitle', { name: meta.teacherName })}</p>
                <p className="text-xs text-text-muted">
                  {t('pages.academiaMedicina.instructorHint')}
                </p>
                <NpcChatPanel npcId="academia-medicina" npcName={meta.teacherName} npcPrompt={meta.teacherPrompt} className="mt-2" />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
