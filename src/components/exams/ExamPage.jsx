import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import AppTopBar from '../shared/AppTopBar'
import { useExamsStore } from '../../stores/useExamsStore'
import { useAuthStore } from '../../stores/useAuthStore'
import courses from '../../data/courses.json'

export default function ExamPage() {
  const { courseId } = useParams()
  const session = useAuthStore((s) => s.session)

  const exam        = useExamsStore((s) => s.exam)
  const eligibility  = useExamsStore((s) => s.eligibility)
  const attempts     = useExamsStore((s) => s.attempts)
  const graduation   = useExamsStore((s) => s.graduation)
  const fetchExam        = useExamsStore((s) => s.fetchExam)
  const fetchEligibility = useExamsStore((s) => s.fetchEligibility)
  const fetchAttempts    = useExamsStore((s) => s.fetchAttempts)
  const fetchGraduation  = useExamsStore((s) => s.fetchGraduation)
  const startAttempt     = useExamsStore((s) => s.startAttempt)
  const submitAttempt    = useExamsStore((s) => s.submitAttempt)

  const [loading, setLoading] = useState(true)
  const [phase, setPhase] = useState('idle') // idle | taking | result
  const [shown, setShown] = useState([])
  const [answers, setAnswers] = useState([])
  const [result, setResult] = useState(null)

  const courseMeta = courses.find((c) => c.id === courseId)

  useEffect(() => {
    let cancelled = false
    const studentId = session?.user?.id
    if (!studentId) return
    setLoading(true)
    Promise.all([
      fetchExam(courseId),
      fetchEligibility(courseId, studentId),
      fetchAttempts(courseId, studentId),
      fetchGraduation(courseId, studentId),
    ]).then(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [courseId, session?.user?.id, fetchExam, fetchEligibility, fetchAttempts, fetchGraduation])

  const handleStart = () => {
    const qs = startAttempt(exam)
    setShown(qs)
    setAnswers(new Array(qs.length).fill(null))
    setResult(null)
    setPhase('taking')
  }

  const handleSubmit = async () => {
    const { score, passed } = await submitAttempt({
      examId: exam.id, studentId: session.user.id, courseId, shownQuestions: shown, answers, passScore: exam.pass_score,
    })
    setResult({ score, passed })
    setPhase('result')
  }

  const allAnswered = answers.length > 0 && answers.every((a) => a !== null)

  return (
    <div className="flex min-h-screen flex-col bg-background text-text">
      <AppTopBar />
      <main className="flex-1 px-4 py-8 md:px-8">
        <div className="mx-auto max-w-2xl">
          <Link to="/examenes" className="text-sm text-text-muted hover:text-primary">← Todos los exámenes</Link>

          <div className="mt-3 overflow-hidden rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-6 py-8 shadow-lg">
            <h1 className="text-2xl font-extrabold text-white">{courseMeta?.icon ?? '📝'} {courseMeta?.title ?? courseId}</h1>
            <p className="mt-1 text-sm font-medium text-white/85">{exam?.title ?? 'Examen final'}</p>
          </div>

          {loading && <p className="mt-6 text-center text-sm text-text-muted">Cargando…</p>}

          {!loading && !exam && (
            <p className="mt-6 rounded-2xl border border-border bg-surface p-6 text-center text-sm text-text-muted">
              Este curso todavía no tiene un examen configurado.
            </p>
          )}

          {!loading && exam && graduation && phase === 'idle' && (
            <div className="mt-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-6 text-center">
              <p className="text-3xl">🎓</p>
              <p className="mt-1 font-bold text-emerald-400">¡Ya te graduaste de este curso!</p>
              <p className="text-xs text-text-muted">{new Date(graduation.graduated_at).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            </div>
          )}

          {!loading && exam && !graduation && eligibility && !eligibility.eligible && (
            <div className="mt-6 rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4">
              <p className="font-bold text-amber-400">🔒 Todavía no puedes presentar el examen</p>
              <p className="mt-1 text-sm text-text-muted">Te faltan {eligibility.total - eligibility.done} de {eligibility.total} tareas de este curso por calificar:</p>
              <ul className="mt-2 space-y-1">
                {eligibility.pending.map((t) => <li key={t.id} className="text-sm text-text">• {t.title} <span className="text-text-muted">({t.status})</span></li>)}
              </ul>
            </div>
          )}

          {!loading && exam && !graduation && eligibility?.eligible && phase === 'idle' && (
            <div className="mt-6 rounded-2xl border border-border bg-surface p-6 text-center">
              <p className="text-sm text-text-muted">✅ Ya puedes presentar el examen — {exam.questions_to_show} preguntas de opción múltiple, necesitas {exam.pass_score}% para aprobar.</p>
              {attempts.length > 0 && (
                <p className="mt-2 text-xs text-text-muted">Tu mejor intento: {Math.max(...attempts.map((a) => a.score))}%</p>
              )}
              <button type="button" onClick={handleStart} className="mt-4 rounded-lg bg-primary px-5 py-2.5 text-sm font-bold text-background hover:opacity-90">
                🚀 Comenzar examen
              </button>
            </div>
          )}

          {phase === 'taking' && (
            <div className="mt-6 space-y-3">
              {shown.map((q, qi) => (
                <div key={q.id} className="rounded-2xl border border-border bg-surface p-4">
                  <p className="font-semibold text-text">{qi + 1}. {q.question}</p>
                  <div className="mt-2 space-y-1.5">
                    {q.options.map((opt, oi) => (
                      <label key={oi} className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm cursor-pointer ${answers[qi] === oi ? 'border-primary bg-primary/10 text-primary' : 'border-border/60 text-text hover:bg-surface-hover'}`}>
                        <input type="radio" name={`q-${qi}`} checked={answers[qi] === oi}
                          onChange={() => setAnswers((a) => a.map((v, i) => i === qi ? oi : v))} />
                        {opt}
                      </label>
                    ))}
                  </div>
                </div>
              ))}
              <button type="button" onClick={handleSubmit} disabled={!allAnswered}
                className="w-full rounded-lg bg-primary px-5 py-3 text-sm font-bold text-background disabled:opacity-50">
                Entregar examen
              </button>
            </div>
          )}

          {phase === 'result' && result && (
            <div className={`mt-6 rounded-2xl border p-6 text-center ${result.passed ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-danger/30 bg-danger/5'}`}>
              <p className="text-3xl">{result.passed ? '🎉' : '😕'}</p>
              <p className={`mt-1 text-xl font-extrabold ${result.passed ? 'text-emerald-400' : 'text-danger'}`}>{result.score}%</p>
              <p className="text-sm text-text-muted">{result.passed ? '¡Aprobaste! Ya te graduaste de este curso.' : `Necesitabas ${exam.pass_score}% para aprobar.`}</p>
              {!result.passed && (
                <button type="button" onClick={handleStart} className="mt-4 rounded-lg border border-border px-4 py-2 text-sm font-bold text-text hover:bg-surface-hover">
                  Intentar de nuevo
                </button>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
