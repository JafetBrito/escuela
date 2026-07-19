import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import AppTopBar from '../shared/AppTopBar'
import { useI18n, LANGUAGE_NAMES } from '../../i18n'
import { getTeachableLanguageGroups } from '../../data/languageAcademyRegistry'

// Academia de Idiomas — página propia de navbar (/academia-idiomas), separada
// de la Escuela de Idiomas (/escuela/idiomas, cursos fijos de courses.json).
// Muestra qué idiomas se pueden aprender desde el idioma actual del sitio
// (L1) — cambiar el idioma en el navbar cambia al instante qué se ofrece
// enseñar y desde qué idioma (ver languageAcademyRegistry.js).
export default function AcademiaIdiomasPage() {
  const navigate = useNavigate()
  const { t, lang } = useI18n()

  const languageGroups = useMemo(() => getTeachableLanguageGroups(lang, t), [lang, t])

  return (
    <div className="flex h-screen flex-col bg-background text-text">
      <AppTopBar />
      <div className="flex-1 overflow-y-auto">
        <div className="bg-gradient-to-r from-[#38bdf8] to-[#60a5fa] px-6 py-8">
          <p className="text-5xl drop-shadow-sm">🌍</p>
          <h1 className="mt-2 text-2xl font-black text-background drop-shadow-sm">{t('languageAcademy.title')}</h1>
          <p className="mt-1 text-sm text-background/85">{t('languageAcademy.subtitle', { l1: LANGUAGE_NAMES[lang] ?? lang })}</p>
        </div>

        <div className="mx-auto max-w-3xl px-4 py-8">
          <p className="mb-6 text-lg font-bold text-text">{t('languageAcademy.pickLanguage')}</p>
          <div className="space-y-6">
            {languageGroups.map((group) => (
              <div key={group.id}>
                <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-text-muted">{group.icon} {group.label}</h3>
                <div className="flex flex-wrap gap-2">
                  {group.languages.map((language) => (
                    <button
                      key={language.l2}
                      type="button"
                      onClick={() => navigate(`/academia-idiomas/${language.l2}`)}
                      className="rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-semibold text-text transition-all hover:-translate-y-0.5 hover:border-[#38bdf8] hover:shadow-md"
                    >
                      🗣️ {language.name}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
