import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import AppTopBar from '../shared/AppTopBar'
import MascotCompanion from '../mascot/MascotCompanion'
import { useAuthStore } from '../../stores/useAuthStore'
import { useSettingsStore } from '../../stores/useSettingsStore'
import { supabase } from '../../services/supabase/client'
import {
  generateCourseOutline,
  generateLessonContent,
  assembleCourse,
  saveGeneratedCourse,
} from '../../services/ai/courseGenerator'

// "El Oráculo de Oliver" — el alumno escribe un tema, su propia conexión de
// IA (Ajustes → Núcleo) planea un temario y escribe cada clase completa
// (contenido + quiz), y el resultado se guarda como un curso normal jugable
// en /learn/:id con el mismo motor que cualquier otro curso
// (LearningInterface.jsx). Ver src/services/ai/courseGenerator.js para el
// pipeline real; esta página solo orquesta los pasos y muestra progreso REAL
// (no una barra simulada como VrLoadingScreen.jsx — cada paso corresponde a
// una llamada async real en curso).
//
// Estilo: calco del lenguaje visual "panel con gradiente + acento glow" ya
// establecido en DailyRewardsBoard.jsx/ClassPicker.jsx para VR, adaptado a
// página completa en vez de modal — se trata a propósito como la feature
// insignia de la app, no como un formulario plano.

const STEP_LABELS = {
  outline: '🧠 Planeando tu curso…',
  saving: '💾 Guardando tu curso…',
}

export default function OraclePage() {
  const navigate = useNavigate()
  const session = useAuthStore((s) => s.session)
  const activeCredentialId = useSettingsStore((s) => s.activeCredentialId)

  const [tab, setTab] = useState('generar') // 'generar' | 'mis-cursos'
  const [topic, setTopic] = useState('')
  const [status, setStatus] = useState('idle') // idle | outline | lessons | saving | error
  const [error, setError] = useState('')
  const [outline, setOutline] = useState(null)
  const [moduleIndex, setModuleIndex] = useState(0)

  const [myCourses, setMyCourses] = useState([])
  const [myCoursesLoading, setMyCoursesLoading] = useState(true)

  useEffect(() => {
    if (!session?.user?.id) return
    let cancelled = false
    // No hace falta setMyCoursesLoading(true) aquí — ya arranca en true (ver
    // useState de arriba) y este efecto solo corre una vez por sesión.
    supabase
      .from('courses')
      .select('id,title,description,icon,color,created_at')
      .eq('created_by', session.user.id)
      .eq('ai_generated', true)
      .order('created_at', { ascending: false })
      .then(({ data, error: fetchError }) => {
        if (cancelled) return
        if (fetchError) console.error('[OraclePage] fetch mis-cursos-ia failed:', fetchError)
        setMyCourses(data ?? [])
        setMyCoursesLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [session?.user?.id])

  const isBusy = status === 'outline' || status === 'lessons' || status === 'saving'

  async function runGeneration() {
    setError('')
    setOutline(null)
    setModuleIndex(0)

    try {
      setStatus('outline')
      const newOutline = await generateCourseOutline(topic.trim())
      setOutline(newOutline)

      setStatus('lessons')
      const lessons = []
      for (let i = 0; i < newOutline.modules.length; i++) {
        setModuleIndex(i)
        const mod = newOutline.modules[i]
        // Secuencial a propósito, no Promise.all: así el progreso mostrado es
        // real (no falso) y no se bombardea al proveedor con llamadas
        // concurrentes.
        const lesson = await generateLessonContent(topic.trim(), newOutline.title, mod.title, mod.description)
        lessons.push(lesson)
      }

      setStatus('saving')
      const course = assembleCourse({ outline: newOutline, lessons, userId: session.user.id })
      const saved = await saveGeneratedCourse(course)

      navigate(`/learn/${saved.id}`)
    } catch (err) {
      console.error('[OraclePage] generation failed:', err)
      setError(err?.message || 'Algo salió mal generando tu curso. Intenta de nuevo.')
      setStatus('error')
    }
  }

  const handleGenerate = (e) => {
    e.preventDefault()
    if (!topic.trim() || isBusy) return
    runGeneration()
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
          {/* Hero */}
          <div
            className="relative mb-6 overflow-hidden rounded-2xl p-6 sm:p-8"
            style={{
              background: 'linear-gradient(135deg, #1a0a30 0%, #0f1a2e 100%)',
              border: '1px solid rgba(152,202,63,0.25)',
              boxShadow: '0 0 50px rgba(124,58,237,0.25)',
            }}
          >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(152,202,63,0.25),transparent_55%)]" />
            <div className="relative">
              <p className="text-xs font-black uppercase tracking-[0.25em] text-white/40">Oliver Academy</p>
              <h1 className="mt-1 text-3xl font-black text-white sm:text-4xl">🔮 El Oráculo de Oliver</h1>
              <p className="mt-2 max-w-xl text-sm text-white/60">
                Escribe cualquier tema y la IA arma un curso completo para ti: temario, clases con
                contenido real y un quiz por clase — listo para jugar como cualquier otro curso.
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className="mb-5 flex gap-1.5 rounded-xl border border-border bg-surface p-1">
            <button
              type="button"
              onClick={() => setTab('generar')}
              className={`flex-1 rounded-lg px-4 py-2 text-sm font-bold transition-colors ${
                tab === 'generar' ? 'bg-primary text-background' : 'text-text-muted hover:text-text'
              }`}
            >
              ✨ Generar curso
            </button>
            <button
              type="button"
              onClick={() => setTab('mis-cursos')}
              className={`flex-1 rounded-lg px-4 py-2 text-sm font-bold transition-colors ${
                tab === 'mis-cursos' ? 'bg-primary text-background' : 'text-text-muted hover:text-text'
              }`}
            >
              📚 Mis Cursos IA {myCourses.length > 0 ? `(${myCourses.length})` : ''}
            </button>
          </div>

          {tab === 'generar' && (
            <div className="rounded-2xl border border-border bg-surface p-6">
              {!activeCredentialId && (
                <div className="mb-5 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-200">
                  No tienes una conexión de IA activa todavía. Ve a{' '}
                  <Link to="/ajustes" className="font-bold underline">
                    Ajustes → Núcleo
                  </Link>{' '}
                  para conectar una antes de generar tu curso.
                </div>
              )}

              {status === 'idle' && (
                <form onSubmit={handleGenerate} className="flex flex-col gap-4">
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
                  <button
                    type="submit"
                    disabled={!topic.trim() || !activeCredentialId}
                    className="rounded-lg bg-primary px-6 py-3 text-sm font-black text-background transition-opacity hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    ✨ Generar curso
                  </button>
                </form>
              )}

              {isBusy && (
                <div className="flex flex-col items-center gap-4 py-6 text-center">
                  <span className="animate-pulse text-5xl">🔮</span>
                  <p className="text-lg font-bold text-text">{currentStepLabel}</p>
                  <p className="text-sm text-text-muted">Esto puede tardar un poco — no cierres esta página.</p>
                  {status === 'lessons' && outline && (
                    <div className="flex items-center gap-1.5">
                      {outline.modules.map((_, i) => (
                        <span
                          key={i}
                          className={`h-1.5 w-6 rounded-full ${i <= moduleIndex ? 'bg-primary' : 'bg-surface-hover'}`}
                        />
                      ))}
                    </div>
                  )}
                </div>
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
                    Ve a la pestaña "Generar curso" y escribe cualquier tema que quieras aprender.
                  </p>
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {myCourses.map((c) => (
                    <Link
                      key={c.id}
                      to={`/learn/${c.id}`}
                      className="flex items-start gap-3 rounded-xl border border-border bg-background p-4 transition-colors hover:border-primary/50"
                    >
                      <span className="text-3xl" style={{ color: c.color || undefined }}>
                        {c.icon || '📘'}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate font-bold text-text">{c.title}</p>
                        <p className="mt-0.5 line-clamp-2 text-xs text-text-muted">{c.description}</p>
                      </div>
                    </Link>
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
