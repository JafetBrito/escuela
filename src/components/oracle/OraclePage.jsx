import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import AppTopBar from '../shared/AppTopBar'
import MascotCompanion from '../mascot/MascotCompanion'
import MascotViewport from '../mascot/MascotViewport'
import OracleGenerateForm from './OracleGenerateForm'
import OracleLoadingScreen from './OracleLoadingScreen'
import { useAuthStore } from '../../stores/useAuthStore'
import { useSettingsStore } from '../../stores/useSettingsStore'
import { supabase } from '../../services/supabase/client'
import {
  generateCourseOutline,
  generateLessonContent,
  enrichLessonWithMedia,
  assembleCourse,
  saveGeneratedCourse,
  requestCourseReview,
} from '../../services/ai/courseGenerator'

// "El Oráculo de Oliver" — el alumno llena un formulario (tema, dificultad,
// público, número de clases, idioma, si quiere misiones), su propia
// conexión de IA (Ajustes → Núcleo) planea un temario y escribe cada clase
// completa (contenido + quiz + intento de imagen/recurso reales de fuentes
// abiertas), y el resultado se guarda como un curso normal jugable en
// /learn/:id con el mismo motor que cualquier otro curso
// (LearningInterface.jsx). Ver src/services/ai/courseGenerator.js para el
// pipeline real; esta página solo orquesta los pasos y muestra progreso REAL
// (no una barra simulada — cada paso corresponde a una llamada async real en
// curso).
//
// Un curso puede además pedir revisión humana ("Mis Cursos IA" → Solicitar
// revisión); si un admin lo aprueba, aparece en la pestaña "Comunidad" —
// visible para todos, pero SOLO ahí, no en el catálogo general (courses.json
// sigue siendo un archivo estático, ver el plan de este feature para el
// porqué).

const STEP_LABELS = {
  outline: '🧠 Planeando tu curso…',
  saving: '💾 Guardando tu curso…',
}

const REVIEW_BADGES = {
  pending: { label: '⏳ En revisión', className: 'border-amber-500/30 bg-amber-500/10 text-amber-300' },
  approved: { label: '✅ Aprobado', className: 'border-green-500/30 bg-green-500/10 text-green-300' },
  rejected: { label: '❌ Rechazado', className: 'border-red-500/30 bg-red-500/10 text-red-300' },
}

function CourseCard({ course, footer }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-border bg-background p-4">
      <Link to={`/learn/${course.id}`} className="flex min-w-0 flex-1 items-start gap-3">
        <span className="text-3xl" style={{ color: course.color || undefined }}>
          {course.icon || '📘'}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-bold text-text">{course.title}</p>
          <p className="mt-0.5 line-clamp-2 text-xs text-text-muted">{course.description}</p>
        </div>
      </Link>
      {footer}
    </div>
  )
}

export default function OraclePage() {
  const navigate = useNavigate()
  const session = useAuthStore((s) => s.session)
  const activeCredentialId = useSettingsStore((s) => s.activeCredentialId)

  const [tab, setTab] = useState('generar') // 'generar' | 'mis-cursos' | 'comunidad'
  const [status, setStatus] = useState('idle') // idle | outline | lessons | saving | done | error
  const [error, setError] = useState('')
  const [outline, setOutline] = useState(null)
  const [moduleIndex, setModuleIndex] = useState(0)
  const [savedCourseId, setSavedCourseId] = useState(null)
  const [formValues, setFormValues] = useState(null)

  const [myCourses, setMyCourses] = useState([])
  const [myCoursesLoading, setMyCoursesLoading] = useState(true)

  const [communityCourses, setCommunityCourses] = useState([])
  const [communityLoading, setCommunityLoading] = useState(true)
  const [authorNames, setAuthorNames] = useState({})

  const fetchMyCourses = () => {
    if (!session?.user?.id) return
    supabase
      .from('courses')
      .select('id,title,description,icon,color,created_at,review_status,review_note')
      .eq('created_by', session.user.id)
      .eq('ai_generated', true)
      .order('created_at', { ascending: false })
      .then(({ data, error: fetchError }) => {
        if (fetchError) console.error('[OraclePage] fetch mis-cursos-ia failed:', fetchError)
        setMyCourses(data ?? [])
        setMyCoursesLoading(false)
      })
  }

  useEffect(() => {
    fetchMyCourses()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.id])

  useEffect(() => {
    if (tab !== 'comunidad' || communityCourses.length > 0) return
    let cancelled = false
    supabase
      .from('courses')
      .select('id,title,description,icon,color,created_at,created_by')
      .eq('ai_generated', true)
      .eq('review_status', 'approved')
      .order('created_at', { ascending: false })
      .then(async ({ data, error: fetchError }) => {
        if (cancelled) return
        if (fetchError) console.error('[OraclePage] fetch comunidad failed:', fetchError)
        const courses = data ?? []
        setCommunityCourses(courses)
        setCommunityLoading(false)

        const authorIds = [...new Set(courses.map((c) => c.created_by).filter(Boolean))]
        if (authorIds.length === 0) return
        // Llamada separada y no bloqueante — si falla, la pestaña sigue
        // mostrando las tarjetas, solo sin el "por {nombre}" (mismo patrón
        // que CourseRoadmapPage.jsx usa para nombres de profesor).
        const { data: authors, error: authorsError } = await supabase.rpc('get_approved_course_authors', { author_ids: authorIds })
        if (authorsError) {
          console.error('[OraclePage] fetch author names failed:', authorsError)
          return
        }
        if (cancelled) return
        setAuthorNames(Object.fromEntries((authors ?? []).map((a) => [a.id, a.display_name])))
      })
    return () => {
      cancelled = true
    }
  }, [tab, communityCourses.length])

  const isBusy = status === 'outline' || status === 'lessons' || status === 'saving' || status === 'done'

  async function runGeneration(values) {
    setError('')
    setOutline(null)
    setModuleIndex(0)
    setFormValues(values)
    const { topic, difficulty, audience, moduleCount, language, includeMissions } = values

    try {
      setStatus('outline')
      const newOutline = await generateCourseOutline(topic, { difficulty, audience, moduleCount, language })
      setOutline(newOutline)

      setStatus('lessons')
      const lessons = []
      for (let i = 0; i < newOutline.modules.length; i++) {
        setModuleIndex(i)
        const mod = newOutline.modules[i]
        // Secuencial a propósito, no Promise.all: así el progreso mostrado es
        // real (no falso) y no se bombardea al proveedor con llamadas
        // concurrentes.
        const lesson = await generateLessonContent(topic, newOutline.title, mod.title, mod.description, { includeMissions, language })
        const enriched = await enrichLessonWithMedia(lesson, { language })
        lessons.push(enriched)
      }

      setStatus('saving')
      const course = assembleCourse({ outline: newOutline, lessons, userId: session.user.id, difficulty, includeMissions })
      const saved = await saveGeneratedCourse(course)

      setSavedCourseId(saved.id)
      setStatus('done')
    } catch (err) {
      console.error('[OraclePage] generation failed:', err)
      setError(err?.message || 'Algo salió mal generando tu curso. Intenta de nuevo.')
      setStatus('error')
    }
  }

  const handleContinue = () => {
    if (savedCourseId) navigate(`/learn/${savedCourseId}`)
  }

  const handleRequestReview = async (courseId) => {
    setMyCourses((prev) => prev.map((c) => (c.id === courseId ? { ...c, review_status: 'pending', review_note: null } : c)))
    try {
      await requestCourseReview(courseId)
    } catch (err) {
      console.error('[OraclePage] requestCourseReview failed:', err)
      fetchMyCourses() // revierte el optimista si de verdad falló
    }
  }

  const currentStepLabel =
    status === 'lessons'
      ? `✍️ Escribiendo clase ${moduleIndex + 1} de ${outline?.modules?.length ?? '?'}: ${outline?.modules?.[moduleIndex]?.title ?? ''}…`
      : STEP_LABELS[status]

  return (
    <div className="flex min-h-screen flex-col bg-background text-text">
      <AppTopBar />

      <main className="flex-1 px-4 py-8 sm:px-6">
        <div className="mx-auto max-w-3xl">
          {/* Hero — mascota 3D al centro, para que se sienta como consultar
              un oráculo de verdad y no un formulario plano cualquiera. */}
          <div
            className="relative mb-6 overflow-hidden rounded-2xl p-6 text-center sm:p-8"
            style={{
              background: 'linear-gradient(135deg, #1a0a30 0%, #0f1a2e 100%)',
              border: '1px solid rgba(152,202,63,0.25)',
              boxShadow: '0 0 50px rgba(124,58,237,0.25)',
            }}
          >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(152,202,63,0.25),transparent_55%)]" />
            <div className="relative">
              <MascotViewport className="mx-auto h-40 w-40 sm:h-52 sm:w-52" showEmotions />
              <p className="text-xs font-black uppercase tracking-[0.25em] text-white/40">Oliver Academy</p>
              <h1 className="mt-1 text-3xl font-black text-white sm:text-4xl">🔮 El Oráculo de Oliver</h1>
              <p className="mx-auto mt-2 max-w-xl text-sm text-white/60">
                Escribe cualquier tema y la IA arma un curso completo para ti: temario, clases con
                contenido real, imágenes y recursos de fuentes abiertas, y un quiz por clase — listo
                para jugar como cualquier otro curso.
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className="mb-5 flex gap-1.5 rounded-xl border border-border bg-surface p-1">
            <button
              type="button"
              onClick={() => setTab('generar')}
              className={`flex-1 rounded-lg px-3 py-2 text-sm font-bold transition-colors ${
                tab === 'generar' ? 'bg-primary text-background' : 'text-text-muted hover:text-text'
              }`}
            >
              ✨ Generar
            </button>
            <button
              type="button"
              onClick={() => setTab('mis-cursos')}
              className={`flex-1 rounded-lg px-3 py-2 text-sm font-bold transition-colors ${
                tab === 'mis-cursos' ? 'bg-primary text-background' : 'text-text-muted hover:text-text'
              }`}
            >
              📚 Mis Cursos {myCourses.length > 0 ? `(${myCourses.length})` : ''}
            </button>
            <button
              type="button"
              onClick={() => setTab('comunidad')}
              className={`flex-1 rounded-lg px-3 py-2 text-sm font-bold transition-colors ${
                tab === 'comunidad' ? 'bg-primary text-background' : 'text-text-muted hover:text-text'
              }`}
            >
              🌍 Comunidad
            </button>
          </div>

          {tab === 'generar' && (
            <div className="rounded-2xl border border-border bg-surface p-6">
              {status === 'idle' && (
                <OracleGenerateForm disabled={isBusy} activeCredentialId={activeCredentialId} onGenerate={runGeneration} />
              )}

              {isBusy && (
                <OracleLoadingScreen
                  status={status}
                  stepLabel={currentStepLabel}
                  moduleCount={formValues?.moduleCount ?? outline?.modules?.length ?? 0}
                  moduleIndex={moduleIndex}
                  onContinue={handleContinue}
                />
              )}

              {status === 'error' && (
                <div className="flex flex-col items-center gap-4 py-6 text-center">
                  <span className="text-5xl">⚠️</span>
                  <p className="text-lg font-bold text-text">No pudimos generar tu curso</p>
                  <p className="max-w-md text-sm text-text-muted">{error}</p>
                  <button
                    type="button"
                    onClick={() => setStatus('idle')}
                    className="mt-1 rounded-lg bg-primary px-6 py-2.5 text-sm font-black text-background hover:bg-primary-hover"
                  >
                    Reintentar
                  </button>
                </div>
              )}
            </div>
          )}

          {tab === 'mis-cursos' && (
            <div className="rounded-2xl border border-border bg-surface p-6">
              {myCoursesLoading ? (
                <p className="text-sm text-text-muted">Cargando tus cursos…</p>
              ) : myCourses.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-8 text-center">
                  <span className="text-4xl">📭</span>
                  <p className="font-bold text-text">Todavía no has generado ningún curso</p>
                  <p className="text-sm text-text-muted">
                    Ve a la pestaña "Generar" y escribe cualquier tema que quieras aprender.
                  </p>
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {myCourses.map((c) => {
                    const badge = REVIEW_BADGES[c.review_status]
                    const canRequestReview = !c.review_status || c.review_status === 'rejected'
                    return (
                      <CourseCard
                        key={c.id}
                        course={c}
                        footer={
                          <div className="flex shrink-0 flex-col items-end gap-1.5">
                            {badge && (
                              <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${badge.className}`}>
                                {badge.label}
                              </span>
                            )}
                            {c.review_status === 'rejected' && c.review_note && (
                              <p className="max-w-[8rem] text-right text-[10px] text-text-muted">{c.review_note}</p>
                            )}
                            {canRequestReview && (
                              <button
                                type="button"
                                onClick={() => handleRequestReview(c.id)}
                                className="rounded-lg border border-border px-2 py-1 text-[10px] font-semibold text-text-muted hover:border-primary/40 hover:text-text"
                              >
                                📮 Solicitar revisión
                              </button>
                            )}
                          </div>
                        }
                      />
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {tab === 'comunidad' && (
            <div className="rounded-2xl border border-border bg-surface p-6">
              <p className="mb-4 text-sm text-text-muted">
                Cursos generados por otros alumnos y aprobados por un admin — visibles aquí para todos.
              </p>
              {communityLoading ? (
                <p className="text-sm text-text-muted">Cargando…</p>
              ) : communityCourses.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-8 text-center">
                  <span className="text-4xl">🌍</span>
                  <p className="font-bold text-text">Todavía no hay cursos aprobados</p>
                  <p className="text-sm text-text-muted">Cuando un admin apruebe un curso compartido, aparecerá aquí.</p>
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {communityCourses.map((c) => (
                    <CourseCard
                      key={c.id}
                      course={c}
                      footer={
                        authorNames[c.created_by] ? (
                          <span className="shrink-0 self-end text-[10px] text-text-muted">por {authorNames[c.created_by]}</span>
                        ) : null
                      }
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <MascotCompanion />
    </div>
  )
}
