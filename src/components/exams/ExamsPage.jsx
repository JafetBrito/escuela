import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import AppTopBar from '../shared/AppTopBar'
import { supabase } from '../../services/supabase/client'
import { useAuthStore } from '../../stores/useAuthStore'
import { useI18n } from '../../i18n'
import { localizeExam } from '../../stores/useExamsStore'
import courses from '../../data/courses.json'

// Lista de cursos que tienen examen final configurado (ver AdminExamsPage) —
// cada uno enlaza a /examenes/:courseId para presentarlo. Solo trae
// course_exams + student_graduations propias, sin duplicar la lógica de
// elegibilidad (eso vive en ExamPage/useExamsStore, que sí necesita el
// detalle por tarea).
export default function ExamsPage() {
  const session = useAuthStore((s) => s.session)
  const { lang } = useI18n()
  const [exams, setExams] = useState([])
  const [graduations, setGraduations] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    Promise.all([
      supabase.from('course_exams').select('course_id, title, questions, translations'),
      supabase.from('student_graduations').select('course_id').eq('student_id', session?.user?.id),
    ]).then(([{ data: e }, { data: g }]) => {
      if (cancelled) return
      setExams(e ?? [])
      setGraduations((g ?? []).map((r) => r.course_id))
      setLoading(false)
    })
    return () => { cancelled = true }
  }, [session?.user?.id])

  return (
    <div className="flex min-h-screen flex-col bg-background text-text">
      <AppTopBar />
      <main className="flex-1 px-4 py-8 md:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="overflow-hidden rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-6 py-8 shadow-lg">
            <h1 className="text-3xl font-extrabold text-white">🎓 Exámenes de graduación</h1>
            <p className="mt-1 text-sm font-medium text-white/85">Aprueba el examen final de cada curso (y ten todas tus tareas calificadas) para graduarte.</p>
          </div>

          <div className="mt-6 space-y-3">
            {loading && <p className="text-center text-sm text-text-muted">Cargando…</p>}
            {!loading && exams.length === 0 && (
              <div className="rounded-2xl border border-border bg-surface py-10 text-center">
                <p className="text-text-muted text-sm">Todavía no hay exámenes configurados en ningún curso.</p>
              </div>
            )}
            {exams.map((raw) => {
              const e = localizeExam(raw, lang)
              const courseMeta = courses.find((c) => c.id === e.course_id)
              const graduated = graduations.includes(e.course_id)
              return (
                <Link key={e.course_id} to={`/examenes/${e.course_id}`}
                  className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-4 transition hover:border-primary/40">
                  <span className="text-3xl">{courseMeta?.icon ?? '📝'}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-text">{courseMeta?.title ?? e.course_id}</p>
                    <p className="text-xs text-text-muted">{e.title} · {(e.questions ?? []).length} preguntas en el banco</p>
                  </div>
                  {graduated
                    ? <span className="shrink-0 rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs font-bold text-emerald-400">🎓 Graduado</span>
                    : <span className="shrink-0 rounded-full bg-primary/15 px-2.5 py-1 text-xs font-bold text-primary">Ver examen →</span>}
                </Link>
              )
            })}
          </div>
        </div>
      </main>
    </div>
  )
}
