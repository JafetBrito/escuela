import { useEffect, useMemo, useRef, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import AppTopBar from '../shared/AppTopBar'
import { useExamsStore, localizeExam } from '../../stores/useExamsStore'
import { useAuthStore } from '../../stores/useAuthStore'
import { useI18n } from '../../i18n'
import courses from '../../data/courses.json'
import { buildDiplomaHtml, downloadDiploma } from '../../utils/diploma'

function formatTime(ms) {
  if (ms == null) return '--:--'
  const totalSec = Math.max(0, Math.floor(ms / 1000))
  const m = Math.floor(totalSec / 60)
  const s = totalSec % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

const RETRY_COOLDOWN_MS = 5 * 60 * 60 * 1000

function formatRemaining(ms) {
  const totalMin = Math.max(0, Math.ceil(ms / 60000))
  const h = Math.floor(totalMin / 60)
  const m = totalMin % 60
  return h > 0 ? `${h}h ${m}m` : `${m}m`
}

export default function ExamPage() {
  const { courseId } = useParams()
  const session = useAuthStore((s) => s.session)
  const profile = useAuthStore((s) => s.profile)
  const { lang } = useI18n()

  const rawExam     = useExamsStore((s) => s.exam)
  const exam        = useMemo(() => localizeExam(rawExam, lang), [rawExam, lang])
  const eligibility  = useExamsStore((s) => s.eligibility)
  const attempts     = useExamsStore((s) => s.attempts)
  const graduation   = useExamsStore((s) => s.graduation)
  const fetchExam        = useExamsStore((s) => s.fetchExam)
  const fetchEligibility = useExamsStore((s) => s.fetchEligibility)
  const fetchAttempts    = useExamsStore((s) => s.fetchAttempts)
  const fetchGraduation  = useExamsStore((s) => s.fetchGraduation)
  const startAttempt     = useExamsStore((s) => s.startAttempt)
  const submitAttempt    = useExamsStore((s) => s.submitAttempt)
  const maybeCertify     = useExamsStore((s) => s.maybeCertify)

  const [loading, setLoading] = useState(true)
  const [phase, setPhase] = useState('idle') // idle | taking | result
  const [shown, setShown] = useState([])
  const [answers, setAnswers] = useState([])
  const [result, setResult] = useState(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [deadline, setDeadline] = useState(null)
  const [remainingMs, setRemainingMs] = useState(null)
  const [now, setNow] = useState(Date.now())

  // Solo se usa para refrescar el mensaje de bloqueo de reintento (cada
  // minuto es más que suficiente, no hace falta la precisión del cronómetro
  // del examen en curso).
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 60 * 1000)
    return () => clearInterval(id)
  }, [])

  const lastAttempt = attempts[0]
  const retryUnlockAt = lastAttempt && !lastAttempt.passed ? new Date(lastAttempt.created_at).getTime() + RETRY_COOLDOWN_MS : null
  const inCooldown = !!retryUnlockAt && now < retryUnlockAt

  // El timer sigue corriendo en un intervalo aparte del ciclo de render — se
  // guardan refs de las respuestas/preguntas para que el auto-entrego al
  // agotarse el tiempo siempre lea el estado más reciente, no el que había
  // al momento de armar el intervalo.
  const answersRef = useRef(answers)
  useEffect(() => { answersRef.current = answers }, [answers])
  const shownRef = useRef(shown)
  useEffect(() => { shownRef.current = shown }, [shown])
  const autoSubmittedRef = useRef(false)

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
    ]).then(() => {
      if (cancelled) return
      setLoading(false)
      // Si ya había aprobado el examen y el profesor apenas calificó la
      // última tarea pendiente, esto lo certifica sin que tenga que reintentar.
      maybeCertify(courseId, studentId)
    })
    return () => { cancelled = true }
  }, [courseId, session?.user?.id, fetchExam, fetchEligibility, fetchAttempts, fetchGraduation, maybeCertify])

  const handleStart = () => {
    const qs = startAttempt(exam)
    setShown(qs)
    setAnswers(new Array(qs.length).fill(null))
    setResult(null)
    setCurrentIndex(0)
    autoSubmittedRef.current = false
    setDeadline(Date.now() + (exam.time_limit_minutes || 30) * 60 * 1000)
    setPhase('taking')
  }

  const handleSubmit = async () => {
    const { score, passed } = await submitAttempt({
      examId: exam.id, studentId: session.user.id, courseId, shownQuestions: shownRef.current, answers: answersRef.current, passScore: exam.pass_score,
    })
    setResult({ score, passed })
    setPhase('result')
  }

  // Cuenta regresiva independiente del render: si se acaba el tiempo,
  // entrega el examen automáticamente con lo que ya esté contestado
  // (las preguntas sin responder cuentan como incorrectas, igual que antes).
  useEffect(() => {
    if (phase !== 'taking' || !deadline) return
    const tick = () => {
      const remaining = deadline - Date.now()
      setRemainingMs(remaining)
      if (remaining <= 0 && !autoSubmittedRef.current) {
        autoSubmittedRef.current = true
        handleSubmit()
      }
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, deadline])

  const currentQuestion = shown[currentIndex]
  const isLastQuestion = currentIndex === shown.length - 1

  const handleDownloadDiploma = () => {
    const studentName = profile?.display_name || session?.user?.email?.split('@')[0] || 'Alumno'
    const html = buildDiplomaHtml({
      studentName,
      courseTitle: courseMeta?.title ?? courseId,
      date: graduation?.graduated_at ? new Date(graduation.graduated_at) : new Date(),
    })
    downloadDiploma(html, `diploma-${courseId}.html`)
  }

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
              <button type="button" onClick={handleDownloadDiploma} className="mt-4 rounded-lg bg-primary px-5 py-2.5 text-sm font-bold text-background hover:opacity-90">
                📜 Descargar diploma
              </button>
            </div>
          )}

          {!loading && exam && !graduation && eligibility && !eligibility.eligible && eligibility.total > 0 && (
            <div className="mt-6 rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4">
              <p className="font-bold text-amber-400">📋 Puedes presentar el examen ya mismo</p>
              <p className="mt-1 text-sm text-text-muted">Pero para certificarte (graduarte) también necesitas que tu profesor califique estas {eligibility.total - eligibility.done} tareas del curso:</p>
              <ul className="mt-2 space-y-1">
                {eligibility.pending.map((t) => <li key={t.id} className="text-sm text-text">• {t.title} <span className="text-text-muted">({t.status})</span></li>)}
              </ul>
            </div>
          )}

          {!loading && exam && !graduation && phase === 'idle' && (
            <div className="mt-6 rounded-2xl border border-border bg-surface p-6 text-center">
              <p className="text-sm text-text-muted">{exam.questions_to_show} preguntas de opción múltiple, una a la vez, necesitas {exam.pass_score}% para aprobar.</p>
              <p className="mt-1 text-sm font-bold text-amber-400">⏱️ Tienes {exam.time_limit_minutes || 30} minutos una vez que empieces — el examen se entrega solo si se acaba el tiempo.</p>
              {attempts.length > 0 && (
                <p className="mt-2 text-xs text-text-muted">Tu mejor intento: {Math.max(...attempts.map((a) => a.score))}%</p>
              )}
              {inCooldown ? (
                <p className="mt-4 text-sm font-bold text-danger">🔒 Reprobaste tu último intento — podrás volver a intentarlo en {formatRemaining(retryUnlockAt - now)}.</p>
              ) : (
                <button type="button" onClick={handleStart} className="mt-4 rounded-lg bg-primary px-5 py-2.5 text-sm font-bold text-background hover:opacity-90">
                  🚀 Comenzar examen
                </button>
              )}
            </div>
          )}

          {phase === 'taking' && currentQuestion && (
            <div className="mt-6">
              <div className="flex items-center justify-between text-sm">
                <span className="font-bold text-text-muted">Pregunta {currentIndex + 1} de {shown.length}</span>
                <span className={`font-mono font-bold ${remainingMs !== null && remainingMs < 2 * 60 * 1000 ? 'text-danger' : 'text-text-muted'}`}>
                  ⏱️ {formatTime(remainingMs)}
                </span>
              </div>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-border/40">
                <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${((currentIndex + 1) / shown.length) * 100}%` }} />
              </div>

              <div className="mt-4 rounded-2xl border border-border bg-surface p-6">
                {currentQuestion.type === 'codigo' ? (
                  <pre className="whitespace-pre-wrap rounded-xl bg-background p-3 font-mono text-sm text-text">{currentQuestion.question}</pre>
                ) : (
                  <p className="text-lg font-bold text-text">{currentQuestion.question}</p>
                )}
                {currentQuestion.image && (
                  <img src={currentQuestion.image} alt="" className="mt-3 max-h-64 w-full rounded-xl object-contain" />
                )}
                <div className="mt-4 space-y-2">
                  {currentQuestion.options.map((opt, oi) => (
                    <button
                      key={oi}
                      type="button"
                      onClick={() => setAnswers((a) => a.map((v, i) => i === currentIndex ? oi : v))}
                      className={`block w-full rounded-xl border px-4 py-3 text-left text-sm transition ${
                        answers[currentIndex] === oi ? 'border-primary bg-primary/10 font-semibold text-primary' : 'border-border/60 text-text hover:bg-surface-hover'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                {currentIndex > 0 && (
                  <button type="button" onClick={() => setCurrentIndex((i) => i - 1)}
                    className="rounded-lg border border-border px-4 py-2.5 text-sm font-bold text-text hover:bg-surface-hover">
                    ← Anterior
                  </button>
                )}
                <div className="flex-1" />
                {!isLastQuestion ? (
                  <button type="button" disabled={answers[currentIndex] === null} onClick={() => setCurrentIndex((i) => i + 1)}
                    className="rounded-lg bg-primary px-5 py-2.5 text-sm font-bold text-background disabled:opacity-50">
                    Siguiente →
                  </button>
                ) : (
                  <button type="button" disabled={answers[currentIndex] === null} onClick={handleSubmit}
                    className="rounded-lg bg-primary px-5 py-2.5 text-sm font-bold text-background disabled:opacity-50">
                    Entregar examen
                  </button>
                )}
              </div>
            </div>
          )}

          {phase === 'result' && result && (
            <div className={`mt-6 rounded-2xl border p-6 text-center ${result.passed ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-danger/30 bg-danger/5'}`}>
              <p className="text-3xl">{result.passed ? '🎉' : '😕'}</p>
              <p className={`mt-1 text-xl font-extrabold ${result.passed ? 'text-emerald-400' : 'text-danger'}`}>{result.score}%</p>
              {result.passed ? (
                graduation ? (
                  <div className="text-sm text-text-muted">
                    <p>¡Aprobaste! Ya estás certificado en este curso. 🎓</p>
                    <button type="button" onClick={handleDownloadDiploma} className="mt-4 rounded-lg bg-primary px-5 py-2.5 text-sm font-bold text-background hover:opacity-90">
                      📜 Descargar diploma
                    </button>
                  </div>
                ) : (
                  <div className="text-sm text-text-muted">
                    <p>¡Aprobaste el examen! Para certificarte todavía falta que califiquen estas tareas:</p>
                    <ul className="mt-2 space-y-1">
                      {(eligibility?.pending ?? []).map((t) => <li key={t.id} className="text-text">• {t.title}</li>)}
                    </ul>
                  </div>
                )
              ) : (
                <p className="text-sm text-text-muted">Necesitabas {exam.pass_score}% para aprobar.</p>
              )}
              {!result.passed && (
                inCooldown ? (
                  <p className="mt-4 text-sm font-bold text-danger">🔒 Podrás volver a intentarlo en {formatRemaining(retryUnlockAt - now)}.</p>
                ) : (
                  <button type="button" onClick={handleStart} className="mt-4 rounded-lg border border-border px-4 py-2 text-sm font-bold text-text hover:bg-surface-hover">
                    Intentar de nuevo
                  </button>
                )
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
