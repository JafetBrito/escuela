import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ORACLE_DIFFICULTIES, ORACLE_LANGUAGES, estimateGenerationCost } from '../../services/ai/courseGenerator'

const MIN_MODULES = 3
const MAX_MODULES = 15

// Formulario previo a generar — antes esto era un único campo de texto
// ("¿qué quieres aprender?") y listo; ahora el alumno también elige
// dificultad/público/cuántas clases/idioma/si quiere misiones, y ve un
// estimado de cuántas llamadas a SU proveedor de IA le va a costar (BYOK —
// esta app no rastrea precios, así que el estimado es en llamadas/tokens,
// nunca en dinero, ver estimateGenerationCost en courseGenerator.js).
export default function OracleGenerateForm({ disabled, activeCredentialId, onGenerate }) {
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
          No tienes una conexión de IA activa todavía. Ve a{' '}
          <Link to="/ajustes" className="font-bold underline">
            Ajustes → Núcleo
          </Link>{' '}
          para conectar una antes de generar tu curso.
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-2">
          <span className="text-sm font-semibold text-text">¿Qué quieres aprender?</span>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Ej. Fotografía de retrato, Historia del jazz, Python para principiantes…"
            className="rounded-lg border border-border bg-background px-4 py-3 text-text outline-none focus:border-primary"
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-2">
            <span className="text-sm font-semibold text-text">Dificultad</span>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="rounded-lg border border-border bg-background px-4 py-2.5 text-text outline-none focus:border-primary"
            >
              {ORACLE_DIFFICULTIES.map((d) => (
                <option key={d.id} value={d.id}>{d.label}</option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-sm font-semibold text-text">Idioma del curso</span>
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
          <span className="text-sm font-semibold text-text">Público (opcional)</span>
          <input
            type="text"
            value={audience}
            onChange={(e) => setAudience(e.target.value)}
            placeholder="Ej. adultos sin experiencia previa, niños de 10-12 años…"
            className="rounded-lg border border-border bg-background px-4 py-2.5 text-text outline-none focus:border-primary"
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm font-semibold text-text">Número de clases: {moduleCount}</span>
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
            Incluir misiones y ejercicios interactivos en cada clase
          </span>
        </label>

        <div className="rounded-lg border border-dashed border-border px-4 py-3 text-xs text-text-muted">
          <p>
            💰 Estimado: <strong className="text-text">{estimate.aiCallsBest}</strong> llamadas a tu proveedor
            de IA (hasta {estimate.aiCallsWorst} si algún paso necesita reintento) — hasta ~
            {estimate.estimatedOutputTokens.toLocaleString('es-MX')} tokens de salida en total.
          </p>
          <p className="mt-1">
            Como usas tu propia llave (BYOK), el costo real depende del precio por token de tu proveedor —
            aquí no lo rastreamos.
          </p>
        </div>

        <button
          type="submit"
          disabled={!topic.trim() || disabled || !activeCredentialId}
          className="rounded-lg bg-primary px-6 py-3 text-sm font-black text-background transition-opacity hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
        >
          ✨ Generar curso
        </button>
      </form>
    </>
  )
}
