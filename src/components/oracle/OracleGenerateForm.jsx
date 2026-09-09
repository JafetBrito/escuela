import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useI18n } from '../../i18n'
import { ORACLE_DIFFICULTIES, ORACLE_LANGUAGES, estimateGenerationCost } from '../../services/ai/courseGenerator'

const LOCALE_BY_LANG = { es: 'es-MX', en: 'en-US', fr: 'fr-FR' }

const MIN_MODULES = 3
const MAX_MODULES = 15

// Formulario previo a generar — antes esto era un único campo de texto
// ("¿qué quieres aprender?") y listo; ahora el alumno también elige
// dificultad/público/cuántas clases/idioma/si quiere misiones, y ve un
// estimado de cuántas llamadas a SU proveedor de IA le va a costar (BYOK —
// esta app no rastrea precios, así que el estimado es en llamadas/tokens,
// nunca en dinero, ver estimateGenerationCost en courseGenerator.js).
export default function OracleGenerateForm({ disabled, activeCredentialId, onGenerate }) {
  const { t, lang } = useI18n()
  const [topic, setTopic] = useState('')
  const [difficulty, setDifficulty] = useState('intermedio')
  const [audience, setAudience] = useState('')
  const [moduleCount, setModuleCount] = useState(6)
  const [language, setLanguage] = useState('es')
  const [includeMissions, setIncludeMissions] = useState(true)

  const estimate = estimateGenerationCost({ moduleCount, includeMissions })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!topic.trim() || disabled) return
    onGenerate({ topic: topic.trim(), difficulty, audience: audience.trim(), moduleCount, language, includeMissions })
  }

  return (
    <>
      {!activeCredentialId && (
        <div className="mb-5 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-200">
          {t('pages.oracle.form.noConnectionPrefix')}{' '}
          <Link to="/ajustes" className="font-bold underline">
            {t('pages.oracle.form.noConnectionLink')}
          </Link>{' '}
          {t('pages.oracle.form.noConnectionSuffix')}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-2">
          <span className="text-sm font-semibold text-text">{t('pages.oracle.form.topicLabel')}</span>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder={t('pages.oracle.form.topicPlaceholder')}
            className="rounded-lg border border-border bg-background px-4 py-3 text-text outline-none focus:border-primary"
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-2">
            <span className="text-sm font-semibold text-text">{t('pages.oracle.form.difficultyLabel')}</span>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="rounded-lg border border-border bg-background px-4 py-2.5 text-text outline-none focus:border-primary"
            >
              {ORACLE_DIFFICULTIES.map((d) => (
                <option key={d.id} value={d.id}>{t(`common.difficulty.${d.id}`)}</option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-sm font-semibold text-text">{t('pages.oracle.form.languageLabel')}</span>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="rounded-lg border border-border bg-background px-4 py-2.5 text-text outline-none focus:border-primary"
            >
              {ORACLE_LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>{l.label}</option>
              ))}
            </select>
          </label>
        </div>

        <label className="flex flex-col gap-2">
          <span className="text-sm font-semibold text-text">{t('pages.oracle.form.audienceLabel')}</span>
          <input
            type="text"
            value={audience}
            onChange={(e) => setAudience(e.target.value)}
            placeholder={t('pages.oracle.form.audiencePlaceholder')}
            className="rounded-lg border border-border bg-background px-4 py-2.5 text-text outline-none focus:border-primary"
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm font-semibold text-text">{t('pages.oracle.form.moduleCountLabel', { count: moduleCount })}</span>
          <input
            type="range"
            min={MIN_MODULES}
            max={MAX_MODULES}
            value={moduleCount}
            onChange={(e) => setModuleCount(Number(e.target.value))}
            className="w-full"
          />
        </label>

        <label className="flex items-center gap-3 rounded-lg border border-border bg-background px-4 py-3">
          <input
            type="checkbox"
            checked={includeMissions}
            onChange={(e) => setIncludeMissions(e.target.checked)}
          />
          <span className="text-sm text-text">
            {t('pages.oracle.form.missionsLabel')}
          </span>
        </label>

        <div className="rounded-lg border border-dashed border-border px-4 py-3 text-xs text-text-muted">
          <p>
            {t('pages.oracle.form.estimate', {
              best: estimate.aiCallsBest,
              worst: estimate.aiCallsWorst,
              tokens: estimate.estimatedOutputTokens.toLocaleString(LOCALE_BY_LANG[lang] ?? 'es-MX'),
            })}
          </p>
          <p className="mt-1">
            {t('pages.oracle.form.estimateNote')}
          </p>
        </div>

        <button
          type="submit"
          disabled={!topic.trim() || disabled || !activeCredentialId}
          className="rounded-lg bg-primary px-6 py-3 text-sm font-black text-background transition-opacity hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
        >
          {t('pages.oracle.form.submit')}
        </button>
      </form>
    </>
  )
}
