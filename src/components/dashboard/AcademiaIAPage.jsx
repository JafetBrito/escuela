import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AppTopBar from '../shared/AppTopBar'
import NpcChatPanel from '../shared/NpcChatPanel'
import SchoolTeacherViewport from '../mascot/SchoolTeacherViewport'
import courses from '../../data/courses.json'
import { CATEGORY_META } from '../../data/categoryMeta'
import { COURSES_DATA, hasCourseData } from '../../data/courseRegistry'
import { useAuthStore } from '../../stores/useAuthStore'
import { useProgressStore } from '../../stores/useProgressStore'

const DIFFICULTY_ORDER = ['principiante', 'intermedio', 'avanzado']
const DIFFICULTY_META = {
  principiante: { label: 'Principiante', dot: 'bg-emerald-400', text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' },
  intermedio: { label: 'Intermedio', dot: 'bg-amber-400', text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
  avanzado: { label: 'Avanzado', dot: 'bg-rose-400', text: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/30' },
}

// Tarjeta estilo "sala" de plataformas como TryHackMe: franja de dificultad
// arriba (color + punto), luego icono/título/descripción y barra de progreso
// si el alumno ya tiene acceso — deliberadamente separada de CourseCard
// (DashboardPage.jsx), que no tiene concepto de dificultad y la comparten
// ~20 escuelas genéricas que no deben cambiar de aspecto por esto.
function AiCourseCard({ course, pct, owned, onClick }) {
  const diff = DIFFICULTY_META[course.difficulty] ?? DIFFICULTY_META.principiante
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={course.locked}
      className={`group flex flex-col overflow-hidden rounded-2xl border text-left transition-all ${
        course.locked
          ? 'cursor-default border-border/60 bg-surface/60 opacity-60'
          : 'border-border bg-surface hover:-translate-y-1 hover:border-primary/50 hover:shadow-xl'
      }`}
    >
      <div className={`flex items-center justify-between border-b px-4 py-2 ${diff.bg} ${diff.border}`}>
        <span className={`flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide ${diff.text}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${diff.dot}`} /> {diff.label}
        </span>
        {course.locked && <span className="text-[10px] font-bold text-text-muted">🔒 Próximamente</span>}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-center gap-3">
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-2xl"
            style={{ background: `${course.color}22`, border: `1px solid ${course.color}44` }}
          >
            {course.icon}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold leading-tight text-text">{course.title}</p>
            {course.subcategory && <p className="text-[11px] text-text-muted">{course.subcategory}</p>}
          </div>
        </div>
        <p className="text-xs leading-snug text-text-muted line-clamp-3">{course.description}</p>
        {pct !== null && owned && (
          <div className="mt-1 flex items-center gap-2">
            <div className="h-1.5 flex-1 rounded-full bg-surface-hover">
              <div className="h-1.5 rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
            </div>
            <span className="text-[10px] text-text-muted">{pct}%</span>
          </div>
        )}
        {!course.locked && (
          <span className="mt-auto self-start rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-background transition group-hover:opacity-90">
            {owned ? (pct ? 'Continuar →' : 'Empezar →') : 'Probar gratis →'}
          </span>
        )}
      </div>
    </button>
  )
}

// Academia de IA — página propia (/academia-ia), sacada de la Escuela
// genérica de Inteligencia Artificial (que sigue existiendo en /escuela/
// inteligencia-artificial, igual que Idiomas/Ciberseguridad conviven con su
// versión genérica). Catálogo estilo TryHackMe: portada de presentación +
// filtros combinables de dificultad/categoría, en vez de la lista plana por
// subcategoría de SchoolPage.jsx.
export default function AcademiaIAPage() {
  const navigate = useNavigate()
  const hasAccessToCourse = useAuthStore((s) => s.hasAccessToCourse)
  const progress = useProgressStore((s) => s.progress)
  const meta = CATEGORY_META['Inteligencia Artificial']

  const [difficulty, setDifficulty] = useState('todas')
  const [subcat, setSubcat] = useState('todas')

  const aiCourses = useMemo(() => courses.filter((c) => c.category === 'Inteligencia Artificial'), [])
  const subcategories = useMemo(
    () => Array.from(new Set(aiCourses.map((c) => c.subcategory).filter(Boolean))),
    [aiCourses],
  )
  const counts = useMemo(() => ({
    todas: aiCourses.length,
    ...Object.fromEntries(DIFFICULTY_ORDER.map((d) => [d, aiCourses.filter((c) => c.difficulty === d).length])),
  }), [aiCourses])

  const filtered = aiCourses.filter((c) =>
    (difficulty === 'todas' || c.difficulty === difficulty) &&
    (subcat === 'todas' || c.subcategory === subcat),
  )

  const progressByCourse = (courseId) => {
    if (!hasCourseData(courseId)) return null
    const total = COURSES_DATA[courseId].modules.length
    const done = (progress[courseId]?.moduleProgress ?? []).filter((p) => p.completed).length
    return Math.round((done / total) * 100)
  }

  const handleSelect = (course) => { if (!course.locked) navigate(`/learn/${course.id}`) }

  return (
    <div className="flex min-h-screen flex-col bg-background text-text">
      <AppTopBar />
      <main className="flex-1">
        {/* ── Portada ───────────────────────────────────────────── */}
        <div className={`relative overflow-hidden bg-gradient-to-br ${meta.gradient} px-6 py-14 text-center sm:py-20`}>
          <div
            className="pointer-events-none absolute inset-0 opacity-10"
            style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #000 1px, transparent 0)', backgroundSize: '24px 24px' }}
          />
          <div className="relative mx-auto max-w-2xl">
            <p className="text-5xl drop-shadow-sm">🧠</p>
            <h1 className="mt-3 text-3xl font-black text-background drop-shadow-sm sm:text-4xl">
              Academia de Inteligencia Artificial
            </h1>
            <p className="mt-3 text-sm font-medium text-background/85 sm:text-base">
              Domina las herramientas y técnicas de IA que están redefiniendo cómo aprendemos y trabajamos —
              de cero a experto, con Oliver como tu instructor.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
              <span className="rounded-full bg-background/20 px-3 py-1.5 text-xs font-bold text-background backdrop-blur-sm">
                📚 {aiCourses.length} cursos
              </span>
              <span className="rounded-full bg-background/20 px-3 py-1.5 text-xs font-bold text-background backdrop-blur-sm">
                🗂️ {subcategories.length} rutas
              </span>
              <span className="rounded-full bg-background/20 px-3 py-1.5 text-xs font-bold text-background backdrop-blur-sm">
                🐱 Oliver como instructor
              </span>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-5xl px-4 py-8">
          {/* ── Filtros ─────────────────────────────────────────── */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="mb-1.5 text-[10px] font-black uppercase tracking-widest text-text-muted/60">Nivel de dificultad</p>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => setDifficulty('todas')}
                  className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${
                    difficulty === 'todas' ? 'bg-primary text-background' : 'border border-border text-text-muted hover:text-text'
                  }`}
                >
                  Todos ({counts.todas})
                </button>
                {DIFFICULTY_ORDER.map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDifficulty(d)}
                    className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition ${
                      difficulty === d
                        ? `${DIFFICULTY_META[d].bg} ${DIFFICULTY_META[d].text} border ${DIFFICULTY_META[d].border}`
                        : 'border border-border text-text-muted hover:text-text'
                    }`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${DIFFICULTY_META[d].dot}`} /> {DIFFICULTY_META[d].label} ({counts[d] ?? 0})
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-1.5 text-[10px] font-black uppercase tracking-widest text-text-muted/60">Categoría</p>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => setSubcat('todas')}
                  className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${
                    subcat === 'todas' ? 'bg-primary text-background' : 'border border-border text-text-muted hover:text-text'
                  }`}
                >
                  Todas
                </button>
                {subcategories.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSubcat(s)}
                    className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${
                      subcat === s ? 'bg-primary text-background' : 'border border-border text-text-muted hover:text-text'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ── Catálogo ────────────────────────────────────────── */}
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((course) => (
              <AiCourseCard
                key={course.id}
                course={course}
                pct={progressByCourse(course.id)}
                owned={hasAccessToCourse(course.id)}
                onClick={() => handleSelect(course)}
              />
            ))}
            {filtered.length === 0 && (
              <p className="col-span-full py-10 text-center text-sm text-text-muted">Ningún curso coincide con estos filtros.</p>
            )}
          </div>

          {/* ── Instructor ──────────────────────────────────────── */}
          <div className="mt-10 overflow-hidden rounded-2xl border border-border bg-surface">
            <div className="flex flex-col sm:flex-row">
              <SchoolTeacherViewport mascotId={meta.teacherMascotId} className="h-56 shrink-0 sm:h-auto sm:w-64" />
              <div className="flex flex-1 flex-col gap-2 p-5">
                <p className="text-sm font-bold text-text">{meta.teacherName} · Instructor de Inteligencia Artificial</p>
                <p className="text-xs text-text-muted">
                  Pregúntale por dónde empezar, qué curso te conviene según tu experiencia, o cualquier duda sobre IA.
                </p>
                <NpcChatPanel npcId="academia-ia" npcName={meta.teacherName} npcPrompt={meta.teacherPrompt} className="mt-2" />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
