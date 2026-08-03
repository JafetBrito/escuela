import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import AppTopBar from '../shared/AppTopBar'
import { useExamsStore } from '../../stores/useExamsStore'
import { useAuthStore } from '../../stores/useAuthStore'
import { LANGUAGE_NAMES } from '../../i18n'
import courses from '../../data/courses.json'

// Tipo de pregunta — puramente de autoría/presentación, la calificación
// (submitAttempt en useExamsStore.js) sigue siendo siempre "el índice de
// options que coincide con correct", sin importar el tipo. 'codigo' solo
// cambia cómo se ve la pregunta (fuente monoespaciada, ver ExamPage.jsx),
// sigue siendo opción múltiple por debajo (ej. "¿qué imprime este código?").
const QUESTION_TYPES = [
  { id: 'opcion_multiple', label: '🔘 Opción múltiple' },
  { id: 'verdadero_falso', label: '✅ Verdadero o Falso' },
  { id: 'codigo', label: '💻 Código' },
]

const emptyQuestion = (type = 'opcion_multiple') => ({
  id: crypto.randomUUID(),
  type,
  question: '',
  options: type === 'verdadero_falso' ? ['Verdadero', 'Falso'] : ['', ''],
  correct: 0,
  image: '',
})

// Idiomas en los que se puede escribir el examen — 'es' es siempre la base
// (obligatoria); el resto son overrides opcionales guardados en
// course_exams.translations (ver useExamsStore.js). Agregar un idioma nuevo
// aquí = poder escribirlo para cualquier curso, no hace falta tocar nada más.
const EXAM_LANGS = ['es', 'en']

export default function AdminExamsPage() {
  const isAdmin = useAuthStore((s) => s.isAdmin)
  const session = useAuthStore((s) => s.session)
  const exam = useExamsStore((s) => s.exam)
  const fetchExam = useExamsStore((s) => s.fetchExam)
  const saveExam = useExamsStore((s) => s.saveExam)

  const [courseId, setCourseId] = useState('')
  const [lang, setLang] = useState('es')
  const [title, setTitle] = useState('Examen final')
  const [passScore, setPassScore] = useState(70)
  const [questionsToShow, setQuestionsToShow] = useState(15)
  const [timeLimitMinutes, setTimeLimitMinutes] = useState(30)
  const [graduationXp, setGraduationXp] = useState(1000)
  const [graduationGold, setGraduationGold] = useState(20000)
  const [questions, setQuestions] = useState([])
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    if (!courseId) return
    setLang('es')
    fetchExam(courseId)
  }, [courseId, fetchExam])

  // pass_score/questions_to_show son propiedades del examen (no del idioma)
  // así que siempre reflejan el valor base, sin importar qué pestaña de
  // idioma esté abierta — solo title/questions cambian con `lang`.
  useEffect(() => {
    if (!courseId) return
    const override = lang === 'es' ? null : exam?.translations?.[lang]
    setTitle((lang === 'es' ? exam?.title : override?.title) ?? 'Examen final')
    setPassScore(exam?.pass_score ?? 70)
    setQuestionsToShow(exam?.questions_to_show ?? 15)
    setTimeLimitMinutes(exam?.time_limit_minutes ?? 30)
    setGraduationXp(exam?.graduation_xp ?? 1000)
    setGraduationGold(exam?.graduation_gold ?? 20000)
    const rawQuestions = (lang === 'es' ? exam?.questions : override?.questions)?.length
      ? (lang === 'es' ? exam.questions : override.questions)
      : []
    // Preguntas guardadas antes de que existiera `type` (opción múltiple de
    // 4 fijas) siguen abriendo bien — solo les falta la etiqueta del tipo.
    setQuestions(rawQuestions.map((q) => ({ type: 'opcion_multiple', ...q })))
    setMsg('')
  }, [exam, courseId, lang])

  if (!isAdmin?.()) {
    return (
      <div className="flex min-h-screen flex-col bg-background text-text">
        <AppTopBar />
        <div className="flex flex-1 items-center justify-center">
          <p className="text-text-muted">Acceso restringido a administradores.</p>
        </div>
      </div>
    )
  }

  const addQuestion = () => setQuestions((qs) => [...qs, emptyQuestion()])
  const removeQuestion = (id) => setQuestions((qs) => qs.filter((q) => q.id !== id))
  const updateQuestion = (id, patch) => setQuestions((qs) => qs.map((q) => q.id === id ? { ...q, ...patch } : q))
  const updateOption = (id, idx, value) => setQuestions((qs) => qs.map((q) => q.id === id ? { ...q, options: q.options.map((o, i) => i === idx ? value : o) } : q))

  // Cambiar el tipo reconstruye las opciones: Verdadero/Falso siempre son
  // esas 2 fijas; salir de V/F hacia otro tipo las deja vacías para
  // escribirlas de cero (no tendría sentido conservar "Verdadero"/"Falso"
  // como opciones de una pregunta de opción múltiple normal).
  const updateQuestionType = (id, type) => setQuestions((qs) => qs.map((q) => {
    if (q.id !== id) return q
    if (type === 'verdadero_falso') return { ...q, type, options: ['Verdadero', 'Falso'], correct: 0 }
    if (q.type === 'verdadero_falso') return { ...q, type, options: ['', ''], correct: 0 }
    return { ...q, type }
  }))

  const addOption = (id) => setQuestions((qs) => qs.map((q) =>
    q.id === id && q.options.length < 6 ? { ...q, options: [...q.options, ''] } : q,
  ))
  const removeOption = (id, idx) => setQuestions((qs) => qs.map((q) => {
    if (q.id !== id || q.options.length <= 2) return q
    const options = q.options.filter((_, i) => i !== idx)
    const correct = q.correct === idx ? 0 : q.correct > idx ? q.correct - 1 : q.correct
    return { ...q, options, correct }
  }))

  const handleSave = async () => {
    setBusy(true)
    const cleanQuestions = questions.filter((q) => q.question.trim() && q.options.every((o) => o.trim()))
    const { error } = await saveExam(courseId, {
      lang,
      title: title.trim() || 'Examen final',
      pass_score: Number(passScore) || 70,
      questions_to_show: Number(questionsToShow) || 15,
      time_limit_minutes: Number(timeLimitMinutes) || 30,
      graduation_xp: Number(graduationXp) || 0,
      graduation_gold: Number(graduationGold) || 0,
      questions: cleanQuestions,
      createdBy: session?.user?.id,
    })
    setBusy(false)
    setMsg(error ? `❌ ${error.message}` : `✅ Guardado (${cleanQuestions.length} preguntas en el banco).`)
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-text">
      <AppTopBar />
      <main className="flex-1 px-4 py-8 md:px-8">
        <div className="mx-auto max-w-3xl">
          <Link to="/admin" className="mb-3 inline-block text-sm text-text-muted hover:text-primary">← Volver al Panel Admin</Link>
          <div className="overflow-hidden rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-6 py-8 shadow-lg">
            <h1 className="text-3xl font-extrabold text-white">🎓 Exámenes de graduación</h1>
            <p className="mt-1 text-sm font-medium text-white/85">
              Escribe el banco de preguntas de opción múltiple para el examen final de cada curso — se sortean al azar en cada intento.
            </p>
          </div>

          <div className="mt-6 rounded-2xl border border-border bg-surface p-4">
            <label className="text-[10px] font-bold uppercase text-text-muted">Curso</label>
            <select value={courseId} onChange={(e) => setCourseId(e.target.value)}
              className="mt-0.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text outline-none focus:border-primary">
              <option value="">Elige un curso…</option>
              {courses.map((c) => <option key={c.id} value={c.id}>{c.icon} {c.title}</option>)}
            </select>
          </div>

          {courseId && (
            <div className="mt-4 space-y-4">
              <div className="flex gap-1 rounded-xl border border-border bg-surface p-1">
                {EXAM_LANGS.map((code) => (
                  <button key={code} type="button" onClick={() => setLang(code)}
                    className={`flex-1 rounded-lg px-3 py-1.5 text-sm font-semibold transition ${lang === code ? 'bg-primary text-background' : 'text-text-muted hover:bg-surface-hover'}`}>
                    {LANGUAGE_NAMES[code] ?? code}
                    {code !== 'es' && !exam?.translations?.[code] && <span className="ml-1 text-[10px] opacity-70">(sin traducir)</span>}
                  </button>
                ))}
              </div>
              {lang !== 'es' && (
                <p className="text-xs text-text-muted">Traduciendo desde el examen base (Español) — el puntaje para aprobar y las preguntas por intento son los mismos para todos los idiomas.</p>
              )}

              <div className="grid grid-cols-2 gap-3 rounded-2xl border border-border bg-surface p-4 sm:grid-cols-4">
                <div className="col-span-2 sm:col-span-1">
                  <label className="text-[10px] font-bold uppercase text-text-muted">Título</label>
                  <input value={title} onChange={(e) => setTitle(e.target.value)}
                    className="mt-0.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-text-muted">Puntaje para aprobar (%)</label>
                  <input type="number" min={1} max={100} value={passScore} disabled={lang !== 'es'} onChange={(e) => setPassScore(e.target.value)}
                    className="mt-0.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text outline-none focus:border-primary disabled:opacity-50" />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-text-muted">Preguntas por intento</label>
                  <input type="number" min={1} value={questionsToShow} disabled={lang !== 'es'} onChange={(e) => setQuestionsToShow(e.target.value)}
                    className="mt-0.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text outline-none focus:border-primary disabled:opacity-50" />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-text-muted">Límite de tiempo (min)</label>
                  <input type="number" min={1} value={timeLimitMinutes} disabled={lang !== 'es'} onChange={(e) => setTimeLimitMinutes(e.target.value)}
                    className="mt-0.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text outline-none focus:border-primary disabled:opacity-50" />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-text-muted">XP al graduarse</label>
                  <input type="number" min={0} value={graduationXp} disabled={lang !== 'es'} onChange={(e) => setGraduationXp(e.target.value)}
                    className="mt-0.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text outline-none focus:border-primary disabled:opacity-50" />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-text-muted">Oro al graduarse (cobre)</label>
                  <input type="number" min={0} value={graduationGold} disabled={lang !== 'es'} onChange={(e) => setGraduationGold(e.target.value)}
                    className="mt-0.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text outline-none focus:border-primary disabled:opacity-50" />
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-surface p-4">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-xs font-bold uppercase tracking-wide text-text-muted">Banco de preguntas ({questions.length})</p>
                  <button type="button" onClick={addQuestion} className="rounded-lg bg-primary/20 px-3 py-1.5 text-xs font-bold text-primary">+ Nueva pregunta</button>
                </div>
                <div className="space-y-3">
                  {questions.map((q, qi) => (
                    <div key={q.id} className="rounded-xl border border-border/60 p-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-text-muted">{qi + 1}.</span>
                        <select value={q.type ?? 'opcion_multiple'} onChange={(e) => updateQuestionType(q.id, e.target.value)}
                          className="rounded-lg border border-border bg-background px-2 py-1 text-xs font-semibold text-text outline-none focus:border-primary">
                          {QUESTION_TYPES.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
                        </select>
                        <div className="flex-1" />
                        <button type="button" onClick={() => removeQuestion(q.id)} className="shrink-0 text-danger hover:opacity-70">🗑️</button>
                      </div>
                      <div className="mt-2 flex items-start gap-2 pl-5">
                        <textarea rows={q.type === 'codigo' ? 4 : 2} value={q.question} onChange={(e) => updateQuestion(q.id, { question: e.target.value })}
                          placeholder={q.type === 'codigo' ? 'Pega el código y escribe la pregunta sobre él…' : 'Escribe la pregunta…'}
                          className={`flex-1 resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm text-text outline-none focus:border-primary ${q.type === 'codigo' ? 'font-mono whitespace-pre' : ''}`} />
                      </div>
                      <div className="mt-2 pl-5">
                        <input value={q.image ?? ''} onChange={(e) => updateQuestion(q.id, { image: e.target.value })}
                          placeholder="URL de imagen (opcional)"
                          className="w-full rounded-lg border border-border/60 bg-background px-2 py-1.5 text-xs text-text outline-none focus:border-primary" />
                        {q.image && <img src={q.image} alt="" className="mt-1.5 max-h-24 rounded-lg object-contain" />}
                      </div>
                      <div className="mt-2 grid grid-cols-1 gap-1.5 pl-5 sm:grid-cols-2">
                        {q.options.map((opt, oi) => (
                          <label key={oi} className="flex items-center gap-2 rounded-lg border border-border/60 px-2 py-1.5">
                            <input type="radio" name={`correct-${q.id}`} checked={q.correct === oi} onChange={() => updateQuestion(q.id, { correct: oi })} />
                            <input value={opt} onChange={(e) => updateOption(q.id, oi, e.target.value)}
                              placeholder={`Opción ${oi + 1}`}
                              disabled={q.type === 'verdadero_falso'}
                              className="flex-1 bg-transparent text-sm text-text outline-none disabled:opacity-70" />
                            {q.type !== 'verdadero_falso' && q.options.length > 2 && (
                              <button type="button" onClick={() => removeOption(q.id, oi)} className="shrink-0 text-xs text-text-muted hover:text-danger">✕</button>
                            )}
                          </label>
                        ))}
                      </div>
                      {q.type !== 'verdadero_falso' && q.options.length < 6 && (
                        <button type="button" onClick={() => addOption(q.id)} className="ml-5 mt-1.5 text-xs font-bold text-primary hover:opacity-80">
                          + Opción
                        </button>
                      )}
                    </div>
                  ))}
                  {questions.length === 0 && <p className="text-sm text-text-muted">Sin preguntas todavía — agrega al menos {questionsToShow} para que el examen tenga variedad.</p>}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button type="button" onClick={handleSave} disabled={busy}
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-background disabled:opacity-50">
                  {busy ? 'Guardando…' : '💾 Guardar examen'}
                </button>
                {msg && <p className="text-xs text-text-muted">{msg}</p>}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
