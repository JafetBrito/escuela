import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import AppTopBar from '../shared/AppTopBar'
import { useTriviaStore } from '../../stores/useTriviaStore'
import { useAuthStore } from '../../stores/useAuthStore'
import { TRIVIA_CATEGORIES } from '../../data/triviaCategories'

const emptyQuestion = () => ({ id: crypto.randomUUID(), question: '', options: ['', '', '', ''], correct: 0, image: '' })

// Editor del banco de preguntas de trivia — calca AdminExamsPage.jsx, pero
// llaveado por categoría (trivia_questions.category) en vez de por curso, y
// sin la distinción de tipo de pregunta: trivia siempre es opción múltiple
// de 4, no hace falta esa dimensión extra.
export default function AdminTriviaPage() {
  const isAdmin = useAuthStore((s) => s.isAdmin)
  const session = useAuthStore((s) => s.session)
  const questionBank = useTriviaStore((s) => s.questionBank)
  const fetchQuestionBank = useTriviaStore((s) => s.fetchQuestionBank)
  const saveQuestionBank = useTriviaStore((s) => s.saveQuestionBank)

  const [category, setCategory] = useState('')
  const [questions, setQuestions] = useState([])
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    if (!category) return
    fetchQuestionBank(category)
  }, [category, fetchQuestionBank])

  useEffect(() => {
    if (!category) return
    setQuestions(questionBank?.questions ?? [])
    setMsg('')
  }, [questionBank, category])

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
    const { error } = await saveQuestionBank(category, cleanQuestions, session?.user?.id)
    setBusy(false)
    setMsg(error ? `❌ ${error.message}` : `✅ Guardado (${cleanQuestions.length} preguntas en el banco).`)
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-text">
      <AppTopBar />
      <main className="flex-1 px-4 py-8 md:px-8">
        <div className="mx-auto max-w-3xl">
          <Link to="/admin" className="mb-3 inline-block text-sm text-text-muted hover:text-primary">← Volver al Panel Admin</Link>
          <div className="overflow-hidden rounded-2xl bg-gradient-to-r from-fuchsia-600 to-rose-600 px-6 py-8 shadow-lg">
            <h1 className="text-3xl font-extrabold text-white">🎯 Trivia — banco de preguntas</h1>
            <p className="mt-1 text-sm font-medium text-white/85">
              Escribe las preguntas de opción múltiple por categoría — se sortean 10 al azar en cada partida.
            </p>
          </div>

          <div className="mt-6 rounded-2xl border border-border bg-surface p-4">
            <label className="text-[10px] font-bold uppercase text-text-muted">Categoría</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)}
              className="mt-0.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text outline-none focus:border-primary">
              <option value="">Elige una categoría…</option>
              {TRIVIA_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {category && (
            <div className="mt-4 space-y-4">
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
                        <div className="flex-1" />
                        <button type="button" onClick={() => removeQuestion(q.id)} className="shrink-0 text-danger hover:opacity-70">🗑️</button>
                      </div>
                      <div className="mt-2 pl-5">
                        <textarea rows={2} value={q.question} onChange={(e) => updateQuestion(q.id, { question: e.target.value })}
                          placeholder="Escribe la pregunta…"
                          className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm text-text outline-none focus:border-primary" />
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
                  {questions.length === 0 && <p className="text-sm text-text-muted">Sin preguntas todavía — agrega al menos 10 para que las partidas tengan variedad.</p>}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button type="button" onClick={handleSave} disabled={busy}
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-background disabled:opacity-50">
                  {busy ? 'Guardando…' : '💾 Guardar categoría'}
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
