import { useParams, useNavigate } from 'react-router-dom'
import AppTopBar from '../shared/AppTopBar'
import { useI18n } from '../../i18n'
import { getLanguageSyllabus } from '../../data/languageAcademyRegistry'

// Temario de un idioma objetivo (/academia-idiomas/:l2) — un roadmap vertical
// A1→C2 (marco CEFR), explicado desde el idioma actual del sitio. Solo
// información de niveles todavía, sin lecciones reales (ver
// languageAcademyRegistry.js) — cada nivel aparece "🔒 Próximamente".
export default function LanguageSyllabusPage() {
  const { l2 } = useParams()
  const navigate = useNavigate()
  const { t, lang } = useI18n()
  const syllabus = getLanguageSyllabus(lang, l2, t)

  return (
    <div className="flex h-screen flex-col bg-background text-text">
      <AppTopBar />
      <div className="flex-1 overflow-y-auto">
        <div className="bg-gradient-to-r from-[#38bdf8] to-[#60a5fa] px-6 py-8">
          <button type="button" onClick={() => navigate('/academia-idiomas')} className="text-sm font-semibold text-background/80 hover:text-background">
            {t('languageAcademy.backToLanguages')}
          </button>
          <h1 className="mt-2 text-2xl font-black text-background drop-shadow-sm md:text-3xl">
            {t('languageAcademy.courseTitle', { lang: syllabus.l2Name })}
          </h1>
          <p className="mt-1 max-w-xl text-sm text-background/85">
            {t('languageAcademy.courseDescription', { lang: syllabus.l2Name, l1: syllabus.l1Name })}
          </p>
        </div>

        <div className="mx-auto max-w-2xl px-4 py-10">
          <div className="relative space-y-5 border-l-2 border-border pl-7">
            {syllabus.levels.map((level, i) => (
              <div key={level.id} className="relative">
                <span className="absolute -left-[38px] flex h-7 w-7 items-center justify-center rounded-full border-2 border-[#38bdf8] bg-surface text-xs font-black text-[#38bdf8]">
                  {i + 1}
                </span>
                <div className="rounded-2xl border border-border bg-surface p-4 transition hover:border-[#38bdf8]/50">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-bold text-text">{level.title}</p>
                    <span className="shrink-0 rounded-full bg-surface-hover px-2.5 py-1 text-[10px] font-bold text-text-muted">
                      {t('languageAcademy.soon')}
                    </span>
                  </div>
                  <p className="mt-1.5 text-sm text-text-muted">{level.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
