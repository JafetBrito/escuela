import { useEffect, useState } from 'react'
import AppTopBar from '../shared/AppTopBar'
import { useExamsStore } from '../../stores/useExamsStore'
import { useAuthStore } from '../../stores/useAuthStore'
import { LANGUAGE_NAMES } from '../../i18n'
import courses from '../../data/courses.json'

const emptyQuestion = () => ({ id: crypto.randomUUID(), question: '', options: ['', '', '', ''], correct: 0, image: '' })

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
    setQuestions((lang === 'es' ? exam?.questions : override?.questions)?.length ? (lang === 'es' ? exam.questions : override.questions) : [])
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

  const handleSave = async () => {
    setBusy(true)
    const cleanQuestions = questions.filter((q) => q.question.trim() && q.options.every((o) => o.trim()))
    const { error } = await saveExam(courseId, {
      lang,
      title: title.trim() || 'Examen final',
      pass_score: Number(passScore) || 70,
      questions_to_show: Number(questionsToShow) || 15,
      time_limit_minutes: Number(timeLimitMinutes) || 30,
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
              </div>

              <div className="rounded-2xl border border-border bg-surface p-4">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-xs font-bold uppercase tracking-wide text-text-muted">Banco de preguntas ({questions.length})</p>
                  <button type="button" onClick={addQuestion} className="rounded-lg bg-primary/20 px-3 py-1.5 text-xs font-bold text-primary">+ Nueva pregunta</button>
                </div>
                <div className="space-y-3">
                  {questions.map((q, qi) => (
                    <div key={q.id} className="rounded-xl border border-border/60 p-3">
                      <div className="flex items-start gap-2">
                        <span className="mt-2 text-xs font-bold text-text-muted">{qi + 1}.</span>
                        <textarea rows={2} value={q.question} onChange={(e) => updateQuestion(q.id, { question: e.target.value })}
                          placeholder="Escribe la pregunta…"
                          className="flex-1 resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm text-text outline-none focus:border-primary" />
                        <button type="button" onClick={() => removeQuestion(q.id)} className="mt-1 shrink-0 text-danger hover:opacity-70">🗑️</button>
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
                              className="flex-1 bg-transparent text-sm text-text outline-none" />
                          </label>
                        ))}
                      </div>
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
