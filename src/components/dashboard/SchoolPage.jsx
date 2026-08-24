import { useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import courses from '../../data/courses.json'
import { CATEGORY_META, getCategoryBySlug } from '../../data/categoryMeta'
import { COURSES_DATA, hasCourseData } from '../../data/courseRegistry'
import { useAuthStore } from '../../stores/useAuthStore'
import { useProgressStore } from '../../stores/useProgressStore'
import AppTopBar from '../shared/AppTopBar'
import NpcChatPanel from '../shared/NpcChatPanel'
import SchoolTeacherViewport from '../mascot/SchoolTeacherViewport'
import { CourseCard } from './DashboardPage'

// Página dedicada por escuela (/escuela/:slug) — reemplaza la lista plana que
// vivía dentro de EscuelasTab. La mitad izquierda agrupa los cursos de la
// categoría por subcategoría (course.subcategory); la mitad derecha es el
// "profesor" 3D de la escuela + un chat para preguntarle sobre los cursos,
// inspirado en el catálogo de Platzi pero con un maestro en vez de un video.
//
// La Academia de Idiomas (aprende inglés/francés/etc. según el idioma del
// sitio) vive aparte, en su propia página de navbar (/academia-idiomas,
// AcademiaIdiomasPage.jsx) — no como pestaña aquí, para que sea claramente
// visible y no quede escondida dentro de la Escuela de Idiomas.
export default function SchoolPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const hasAccessToCourse = useAuthStore((s) => s.hasAccessToCourse)
  const progress = useProgressStore((s) => s.progress)

  const category = getCategoryBySlug(slug)
  const meta = CATEGORY_META[category] ?? CATEGORY_META.Otros

  const groups = useMemo(() => {
    if (!category) return []
    const list = courses.filter((c) => (c.category ?? 'Otros') === category)
    const bySub = new Map()
    for (const c of list) {
      const key = c.subcategory ?? null
      if (!bySub.has(key)) bySub.set(key, [])
      bySub.get(key).push(c)
    }
    return Array.from(bySub.entries())
  }, [category])

  const progressByCourse = (courseId) => {
    if (!hasCourseData(courseId)) return null
    const total = COURSES_DATA[courseId].modules.length
    const done = (progress[courseId]?.moduleProgress ?? []).filter((p) => p.completed).length
    return Math.round((done / total) * 100)
  }

  // gameRoute: cursos experimentales que ocurren dentro de un juego 2D en
  // vez del flujo normal de texto/video (ver course-phishing-2d) — navegan
  // directo a su propia página de juego, no a /learn/:id.
  const handleSelect = (course) => { if (!course.locked) navigate(course.gameRoute ?? `/learn/${course.id}`) }

  if (!category) {
    return (
      <div className="flex h-screen flex-col bg-background text-text">
        <AppTopBar />
        <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
          <p className="text-4xl">🏫</p>
          <p className="text-lg font-bold">Esta escuela no existe.</p>
          <button type="button" onClick={() => navigate('/dashboard')} className="text-sm text-primary hover:underline">
            ← Volver a Escuelas
          </button>
        </div>
      </div>
    )
  }

  return (
    // En móvil la página se deja crecer y scrollear de forma normal (una sola
    // barra de scroll) — el layout de dos paneles con altura fija (h-screen +
    // overflow-y-auto en cada mitad) solo aplica desde lg hacia arriba, porque
    // en pantallas chicas eso encogía la lista de cursos a menos de la mitad
    // de la pantalla con su propio scroll interno diminuto.
    <div className="flex min-h-screen flex-col bg-background text-text lg:h-screen">
      <AppTopBar />
      <div className="flex flex-1 flex-col lg:flex-row lg:overflow-hidden">
        {/* ── Mitad izquierda: cursos por subcategoría ─────────────────── */}
        <div className="flex-1 lg:overflow-y-auto">
          <div className={`bg-gradient-to-r ${meta.gradient} px-6 py-8`}>
            <p className="text-5xl drop-shadow-sm">{meta.icon}</p>
            <h1 className="mt-2 text-2xl font-black text-background drop-shadow-sm">Escuela de {category}</h1>
            <p className="mt-1 text-sm text-background/80">
              {groups.reduce((n, [, list]) => n + list.length, 0)} cursos disponibles
            </p>
          </div>

          <div className="mx-auto max-w-3xl px-4 py-6">
            {groups.map(([subcategory, list]) => (
              <section key={subcategory ?? 'general'} className="mb-8">
                {subcategory && (
                  <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-text-muted">{subcategory}</h2>
                )}
                <div className="grid gap-3 sm:grid-cols-2">
                  {list.map((course) => (
                    <CourseCard
                      key={course.id}
                      course={course}
                      pct={progressByCourse(course.id)}
                      owned={hasAccessToCourse(course.id)}
                      accent={meta.accent}
                      onClick={() => handleSelect(course)}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>

        {/* ── Mitad derecha: profesor 3D + chat ─────────────────────────── */}
        <div className="flex w-full flex-col border-t border-border lg:w-[420px] lg:overflow-y-auto lg:border-l lg:border-t-0">
          <SchoolTeacherViewport mascotId={meta.teacherMascotId} className="h-64 shrink-0 lg:h-80" />
          <div className="flex flex-1 flex-col gap-2 border-t border-border p-4">
            <p className="text-sm font-bold text-text">
              {meta.teacherName} · Profesor de {category}
            </p>
            <p className="text-xs text-text-muted">Pregúntale sobre los cursos de esta escuela, cuál te conviene empezar, o cualquier duda del tema.</p>
            <NpcChatPanel
              npcId={`escuela-${slug}`}
              npcName={meta.teacherName}
              npcPrompt={meta.teacherPrompt}
              className="mt-2"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
