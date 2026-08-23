/**
 * ============================================================================
 * 🎓 INTERFAZ DE APRENDIZAJE PRINCIPAL (LearningInterface.jsx)
 * ============================================================================
 *
 * Componente orquestador: ensambla el video, la lección en texto, la
 * actividad (quiz/terminal/juego), los recursos, los comentarios, el índice
 * de clases y la mascota 3D en una sola vista.
 *
 * El contenido de una clase se muestra EN PASOS horizontales (video → lección
 * → actividad → recursos), no todo apilado en una sola columna larga — se
 * armó así porque, con todo en scroll vertical, la gente veía el video y se
 * iba sin bajar a ver el resto. Ver LessonSteps.jsx.
 *
 * El índice de clases (antes una columna fija a la derecha, ocupando espacio
 * todo el tiempo) ahora es un panel deslizable — se abre con un botón, no
 * estorba por defecto.
 *
 * El módulo activo vive en la URL (/learn/:courseId/clase/:moduleId), no
 * solo en el store — cambiar de clase es una navegación real (se siente como
 * "avanzar"), con una animación de entrada (.module-enter, index.css).
 * ============================================================================
 */

import { useEffect, useRef, useState } from 'react'
import { useParams, Navigate, Link, useNavigate } from 'react-router-dom'
import { getCourseData, hasCourseData } from '../../data/courseRegistry'
import TopBar from './TopBar'
import ModuleList from './ModuleList'
import ModuleResources from './ModuleResources'
import CommentsPanel from './CommentsPanel'
import VideoPlayer from '../video/VideoPlayer'
import VerticalVideo from '../video/VerticalVideo'
import ModuleSlideshow from './ModuleSlideshow'
import ModuleAudioPlayer from './ModuleAudioPlayer'
import ModuleEmbed from './ModuleEmbed'
import TextLesson from './TextLesson'
import ModuleQuiz from './ModuleQuiz'
import GitTerminalSim from './GitTerminalSim'
import ApiTrackSelector from './ApiTrackSelector'
import TrackContent from './TrackContent'
import PhishingGame from './PhishingGame'
import LessonSteps from './LessonSteps'
import MascotCompanion from '../mascot/MascotCompanion'
import WelcomeModal from '../onboarding/WelcomeModal'
import AppTopBar from '../shared/AppTopBar'
import { useProgressStore, EMPTY_ARRAY } from '../../stores/useProgressStore'
import { useAuthStore } from '../../stores/useAuthStore'
import { useChatStore } from '../../stores/useChatStore'
import { useI18n } from '../../i18n'

// ── VR module launcher card ───────────────────────────────────────────────────
function VrModuleLauncher({ module: mod }) {
  const navigate = useNavigate()
  const { t } = useI18n()
  return (
    <div
      className="flex flex-col items-center justify-center gap-5 rounded-2xl p-8 text-center"
      style={{
        background: 'linear-gradient(160deg, #1a0f2e 0%, #0c0814 100%)',
        border: '1px solid rgba(124,58,237,0.4)',
        minHeight: '340px',
      }}
    >
      <div className="text-6xl">🏛️</div>
      <div>
        <p className="text-xl font-black text-white">{mod.vrWorldName ?? mod.title}</p>
        <p className="mt-1 text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>{mod.description}</p>
      </div>
      <button
        type="button"
        onClick={() => navigate(mod.vrRoute)}
        className="rounded-2xl px-8 py-3 text-base font-black transition-all hover:scale-105 active:scale-95"
        style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', color: '#fff', boxShadow: '0 0 20px rgba(124,58,237,0.4)' }}
      >
        {t('learning.enterVrWorld')}
      </button>
      <p className="text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>
        {t('learning.vrWillOpen')}
      </p>
    </div>
  )
}

export default function LearningInterface() {
  // --- 1. LECTURA DE URL Y RUTAS ---
  const { courseId, moduleId } = useParams()
  const navigate = useNavigate()
  const { t, lang }  = useI18n()

  // --- 2. ESTADOS GLOBALES (Zustand) ---
  const hasAccessToCourse = useAuthStore((s) => s.hasAccessToCourse)
  const setSelectedModule = useProgressStore((s) => s.setSelectedModule)
  const moduleProgress = useProgressStore((s) => s.progress[courseId]?.moduleProgress ?? EMPTY_ARRAY)
  const isModuleUnlocked = useProgressStore((s) => s.isModuleUnlocked)
  const startNewChat = useChatStore((s) => s.startNewChat)

  // --- 3. REFERENCIAS Y ESTADO LOCAL ---
  const prevModuleIdRef = useRef(null)
  // Panel de clases: antes era una columna fija, ocupando espacio todo el
  // tiempo — ahora es un panel deslizable, CERRADO por defecto (móvil y
  // escritorio por igual) — pedido explícito: "que no necesariamente tenga
  // que estar todo el tiempo". Se abre con el botón 📚 cuando se necesita.
  const [moduleListOpen, setModuleListOpen] = useState(false)

  // --- 4. DERIVACIÓN DE DATOS (Obteniendo el curso actual) ---
  const courseData = hasCourseData(courseId) ? getCourseData(courseId, lang) : null

  const requestedId = Number(moduleId)
  const currentModule = courseData
    ? courseData.modules.find((m) => m.id === requestedId) ?? courseData.modules[0]
    : null

  useEffect(() => {
    if (courseId && currentModule) setSelectedModule(courseId, currentModule.id)
  }, [courseId, currentModule, setSelectedModule])

  // --- 5. LÓGICA DE NEGOCIO: GESTIÓN DEL CHAT 🧠 ---
  useEffect(() => {
    if (!courseData || !currentModule) return
    if (prevModuleIdRef.current === null) {
      prevModuleIdRef.current = currentModule.id
      return
    }
    if (prevModuleIdRef.current !== currentModule.id) {
      const prevModule = courseData.modules.find((m) => m.id === prevModuleIdRef.current)
      startNewChat(prevModule ? `${courseData.title} · ${prevModule.title}` : undefined)
      prevModuleIdRef.current = currentModule.id
    }
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [currentModule, courseData, startNewChat])

  // --- 6. PROTECCIÓN DE RUTAS ---
  if (!courseData) {
    return <Navigate to="/dashboard" replace />
  }
  if (!Number.isFinite(requestedId) || !isModuleUnlocked(courseId, requestedId)) {
    return <Navigate to={`/learn/${courseId}`} replace />
  }

  // --- 7. CÁLCULOS UI ---
  const progressPct = Math.round(
    (moduleProgress.filter((p) => p.completed).length / courseData.modules.length) * 100,
  )

  // --- 8. NAVEGACIÓN ENTRE CLASES ---
  const sortedModules = [...courseData.modules].sort((a, b) => a.order - b.order)
  const posInOrder = sortedModules.findIndex((m) => m.id === currentModule.id)
  const prevModule = posInOrder > 0 ? sortedModules[posInOrder - 1] : null
  const nextModuleCandidate = posInOrder >= 0 && posInOrder < sortedModules.length - 1 ? sortedModules[posInOrder + 1] : null
  const nextModule = nextModuleCandidate && isModuleUnlocked(courseId, nextModuleCandidate.id) ? nextModuleCandidate : null

  const goNext = () => {
    if (nextModule) navigate(`/learn/${courseId}/clase/${nextModule.id}`)
    else navigate(`/learn/${courseId}`)
  }

  // --- 9. PASOS DE LA CLASE (video → lección → actividad → recursos) ---
  // Solo se arma para módulos "normales" (video/texto) — vr/slideshow/audio/
  // embed son piezas autocontenidas, no tiene sentido meterlas en pasos.
  const isSteppable = currentModule.type === 'text' || currentModule.type === 'video'
  const hasVideo = Boolean(currentModule.videoId || currentModule.videoSrc)
  const hasActivity = Boolean(
    currentModule.quiz || currentModule.terminalSim || currentModule.trackSelector ||
    currentModule.trackContent || currentModule.phishingGame,
  )

  const steps = []
  if (isSteppable) {
    if (hasVideo) {
      steps.push({
        id: 'video', label: 'Video', icon: '🎬',
        render: () => (
          <>
            {/* Espacio fijo: antes el reproductor crecía o encogía con el
                ancho de la ventana/zoom sin ningún límite — ahora vive en un
                marco de tamaño definido (máx. 48rem, 16:9), centrado, en vez
                de estirarse a lo que sea que mida la columna. */}
            <div className="mx-auto hidden w-full max-w-3xl md:block">
              <VideoPlayer src={currentModule.videoSrc} videoId={currentModule.videoId} className="w-full" />
            </div>
            <div className="md:hidden">
              <VerticalVideo module={currentModule} />
            </div>
          </>
        ),
      })
    }
    if (currentModule.content) {
      steps.push({ id: 'leccion', label: 'Lección', icon: '📖', render: () => <TextLesson content={currentModule.content} className="w-full" /> })
    }
    if (hasActivity) {
      steps.push({
        id: 'actividad', label: 'Actividad', icon: '🧩',
        render: () => (
          <div className="flex flex-col gap-4">
            {currentModule.quiz && (
              <div className="rounded-2xl border border-border bg-surface p-4">
                <p className="mb-3 text-xs font-black uppercase tracking-widest text-text-muted">🧩 Quiz de esta clase</p>
                <ModuleQuiz courseId={courseId} module={currentModule} />
              </div>
            )}
            {currentModule.terminalSim && <GitTerminalSim courseId={courseId} module={currentModule} />}
            {currentModule.trackSelector && <ApiTrackSelector courseId={courseId} module={currentModule} />}
            {currentModule.trackContent && <TrackContent courseId={courseId} module={currentModule} />}
            {currentModule.phishingGame && <PhishingGame courseId={courseId} module={currentModule} />}
          </div>
        ),
      })
    }
    steps.push({
      id: 'extra', label: 'Recursos', icon: '📚',
      render: () => (
        <div className="flex flex-col gap-4">
          <ModuleResources module={currentModule} className="min-h-[120px]" />
          <CommentsPanel courseId={courseId} moduleId={currentModule.id} />
        </div>
      ),
    })
  }

  // --- 10. RENDERIZADO DEL LAYOUT ---
  return (
    <div className="flex min-h-screen flex-col bg-background text-text">
        <AppTopBar variant="course" backTo={`/learn/${courseId}`} backLabel={lang === 'es' ? '🗺️ Mapa del curso' : '🗺️ Course map'} />
        <TopBar
          courseTitle={courseData.title}
          moduleTitle={currentModule.title}
          progressPct={progressPct}
        />

        {!hasAccessToCourse(courseId) && (
          <Link
            to="/unlock"
            className="mx-4 mt-4 flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary/20"
          >
            {t('learning.paywallBanner')}
          </Link>
        )}

        <div className="relative flex-1 p-4 pb-24">
          {/* Botón para abrir el panel de clases — reemplaza la columna fija
              de siempre; el contenido ahora usa todo el ancho disponible. */}
          <div className="mx-auto mb-3 flex max-w-3xl items-center justify-between gap-2">
            {prevModule ? (
              <button
                type="button"
                onClick={() => navigate(`/learn/${courseId}/clase/${prevModule.id}`)}
                className="flex min-w-0 items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-semibold text-text-muted transition-colors hover:bg-surface-hover hover:text-text"
              >
                ← <span className="truncate">{prevModule.title}</span>
              </button>
            ) : <span />}
            <button
              type="button"
              onClick={() => setModuleListOpen(true)}
              className="flex shrink-0 items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-bold text-text transition-colors hover:border-primary/40"
            >
              📚 {t('learning.modules')}
            </button>
          </div>

          {/* COLUMNA DE CONTENIDO — centrada, ancho máximo definido (mismo
              criterio que el video: un marco consistente, no "lo que sea que
              mida la pantalla"). min-w-0 sigue evitando que un <pre>/tabla
              ancha infle el ancho en móvil. */}
          <div className="mx-auto flex min-w-0 max-w-3xl flex-col gap-4">
            {isSteppable ? (
              <LessonSteps
                key={currentModule.id}
                steps={steps}
                onFinish={goNext}
                onFinishLabel={nextModule ? `Siguiente clase: ${nextModule.title} →` : '🗺️ Volver al mapa'}
              />
            ) : (
              <div key={currentModule.id} className="module-enter flex flex-col gap-4">
                {currentModule.type === 'vr' ? (
                  <VrModuleLauncher module={currentModule} />
                ) : currentModule.type === 'slideshow' ? (
                  <ModuleSlideshow images={currentModule.images} className="w-full" />
                ) : currentModule.type === 'audio' ? (
                  <ModuleAudioPlayer src={currentModule.audioSrc} title={currentModule.title} className="w-full" />
                ) : currentModule.type === 'embed' ? (
                  <ModuleEmbed html={currentModule.embedHtml} className="w-full" />
                ) : null}

                {currentModule.quiz && (
                  <div className="rounded-2xl border border-border bg-surface p-4">
                    <p className="mb-3 text-xs font-black uppercase tracking-widest text-text-muted">🧩 Quiz de esta clase</p>
                    <ModuleQuiz courseId={courseId} module={currentModule} />
                  </div>
                )}
                <ModuleResources module={currentModule} className="min-h-[120px]" />
                <CommentsPanel courseId={courseId} moduleId={currentModule.id} />

                <div className="flex items-center justify-end">
                  <button
                    type="button"
                    onClick={goNext}
                    className="rounded-xl bg-primary px-5 py-2 text-sm font-bold text-background transition-transform hover:scale-105 active:scale-95"
                  >
                    {nextModule ? `Siguiente clase: ${nextModule.title} →` : '🗺️ Volver al mapa'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Panel deslizable del índice de clases — overlay, no empuja el
            contenido. Fondo oscuro capturando clics para cerrar. */}
        {moduleListOpen && (
          <div className="fixed inset-0 z-40 flex justify-end bg-black/50" onClick={() => setModuleListOpen(false)}>
            <div
              className="module-enter h-full w-[85vw] max-w-sm overflow-y-auto bg-background p-3 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-2 flex items-center justify-between px-1">
                <p className="text-sm font-bold text-text">{t('learning.modules')}</p>
                <button
                  type="button"
                  onClick={() => setModuleListOpen(false)}
                  className="flex h-7 w-7 items-center justify-center rounded-full text-text-muted hover:bg-surface-hover hover:text-text"
                  aria-label="Cerrar"
                >
                  ✕
                </button>
              </div>
              <ModuleList courseId={courseId} className="border-0 bg-transparent p-0" />
            </div>
          </div>
        )}

        <MascotCompanion courseId={courseId} module={currentModule} />
        <WelcomeModal courseId={courseId} />
    </div>
  )
}
