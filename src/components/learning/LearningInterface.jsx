/**
 * ============================================================================
 * 🎓 INTERFAZ DE APRENDIZAJE PRINCIPAL (LearningInterface.jsx)
 * ============================================================================
 * 
 * Este archivo es una joya arquitectónica. A diferencia de los componentes anteriores que hacían una sola cosa 
 * (como la tienda o las notas), este archivo es un Componente Orquestador (Layout Component).
 *  Su trabajo no es hacer el trabajo pesado, sino coordinar a todos los demás componentes
 *  para que la experiencia de aprendizaje fluya sin problemas.

Aquí hay dos cosas críticas que suelen causar dolores de cabeza a los equipos de desarrollo y que documenté a fondo:

El patrón useRef para el Chat: La IA de tu mascota tiene "memoria a corto plazo" por cada clase.
 Si un estudiante pasa de la "Clase 1" a la "Clase 2", el código usa una referencia (prevModuleIdRef) para darse cuenta del cambio,
  archivar la conversación de la Clase 1 en el historial, y limpiar el cerebro de la mascota para la Clase 2.
   Esto evita que la mascota mezcle temas.

El "Responsive Design" Condicional: Tienes un reproductor de video para computadoras 
de escritorio (VideoPlayer) y uno completamente distinto para celulares (VerticalVideo).
 * 
 * 
 * Este es el "Escenario Principal" de la plataforma. Es el componente orquestador
 * que ensambla el video, la lista de módulos, los recursos, los comentarios y 
 * a la mascota 3D en una sola vista.
 * * 🏗️ RESPONSABILIDADES CLAVE:
 * 1. Enrutamiento y Seguridad: Verifica si el curso existe y si el usuario 
 * tiene acceso (modo Freemium vs Premium).
 * 2. Ciclo de vida del Chat: Reinicia el cerebro de la mascota al cambiar de clase.
 * 3. Renderizado Condicional (Responsive): Cambia el tipo de reproductor de 
 * video dependiendo de si es móvil o escritorio.
 * ============================================================================
 */

import { useEffect, useRef } from 'react'
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
import MascotCompanion from '../mascot/MascotCompanion'
import WelcomeModal from '../onboarding/WelcomeModal'
import AppTopBar from '../shared/AppTopBar'
import { useProgressStore, EMPTY_ARRAY } from '../../stores/useProgressStore'
import { useAuthStore } from '../../stores/useAuthStore'
import { useChatStore } from '../../stores/useChatStore'

// ── VR module launcher card ───────────────────────────────────────────────────
function VrModuleLauncher({ module: mod }) {
  const navigate = useNavigate()
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
        🌍 Entrar al Mundo VR
      </button>
      <p className="text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>
        Se abrirá la experiencia VR de esta clase
      </p>
    </div>
  )
}

export default function LearningInterface() {
  // --- 1. LECTURA DE URL Y RUTAS ---
  const { courseId } = useParams()
  
  // --- 2. ESTADOS GLOBALES (Zustand) ---
  const hasAccessToCourse = useAuthStore((s) => s.hasAccessToCourse)
  const selectedModuleId = useProgressStore((s) => s.getSelectedModuleId(courseId))
  const moduleProgress = useProgressStore((s) => s.progress[courseId]?.moduleProgress ?? EMPTY_ARRAY)
  const startNewChat = useChatStore((s) => s.startNewChat)
  
  // --- 3. REFERENCIAS MUTABLES (Sin Re-renders) ---
  // Guardamos el ID de la clase anterior. Usamos useRef en lugar de useState 
  // porque NO queremos que la página parpadee o se vuelva a dibujar al actualizar este valor.
  const prevModuleIdRef = useRef(null)

  // --- 4. DERIVACIÓN DE DATOS (Obteniendo el curso actual) ---
  const courseData = hasCourseData(courseId) ? getCourseData(courseId) : null
  
  // Determinamos qué clase (módulo) está viendo el alumno ahora mismo.
  // Fallback: Si no hay un ID seleccionado guardado en su progreso, le mostramos la primera clase [0].
  const currentModule = courseData
    ? courseData.modules.find((m) => m.id === selectedModuleId) ?? courseData.modules[0]
    : null

  // --- 5. LÓGICA DE NEGOCIO: GESTIÓN DEL CHAT 🧠 ---
  /**
   * REGLA: Cada clase es una conversación fresca para la mascota.
   * Si el alumno cambia de módulo, debemos archivar la conversación anterior 
   * en el historial ("Chats") y empezar una nueva en blanco.
   */
  useEffect(() => {
    if (!courseData || !currentModule) return
    
    // Caso A: Es la primera vez que entra a la página. Solo guardamos la referencia.
    if (prevModuleIdRef.current === null) {
      prevModuleIdRef.current = currentModule.id
      return
    }
    
    // Caso B: El alumno hizo clic en otra clase.
    if (prevModuleIdRef.current !== currentModule.id) {
      // 1. Buscamos cómo se llamaba la clase anterior para usarla como título en el archivo de Chats.
      const prevModule = courseData.modules.find((m) => m.id === prevModuleIdRef.current)
      
      // 2. Le decimos al cerebro global de la IA que archive y reinicie.
      startNewChat(prevModule ? `${courseData.title} · ${prevModule.title}` : undefined)
      
      // 3. Actualizamos nuestra referencia para el próximo salto.
      prevModuleIdRef.current = currentModule.id
    }
  }, [currentModule, courseData, startNewChat])

  // --- 6. PROTECCIÓN DE RUTAS ---
  // Si el alumno escribe una URL inventada (ej: /curso/hakuna-matata), lo pateamos al Dashboard.
  if (!courseData) {
    return <Navigate to="/dashboard" replace />
  }

  // --- 7. CÁLCULOS UI ---
  // Fórmula de progreso: (Clases completadas / Total de clases) * 100.
  // Math.round evita que la barra de progreso muestre números feos como "33.3333%".
  const progressPct = Math.round(
    (moduleProgress.filter((p) => p.completed).length / courseData.modules.length) * 100,
  )

  // --- 8. RENDERIZADO DEL LAYOUT ---
  return (
    <div className="flex min-h-screen flex-col bg-background text-text">
        {/* 🟢 NAVEGACIÓN SUPERIOR */}
        <AppTopBar variant="course" />
        <TopBar
          courseTitle={courseData.title}
          moduleTitle={currentModule.title}
          progressPct={progressPct}
        />

        {/* 🟢 BANNER DE PAYWALL (Estrategia Freemium) */}
        {!hasAccessToCourse(courseId) && (
          <Link
            to="/unlock"
            className="mx-4 mt-4 flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary/20"
          >
            🔑 Estás viendo las primeras 2 clases gratis. Consigue tu llave para desbloquear el
            resto de este curso →
          </Link>
        )}

        {/* 🟢 GRILLA PRINCIPAL (Contenido a la izq, Lista de Clases a la der) */}
        <div className="grid flex-1 gap-4 p-4 pb-24 md:grid-cols-[1fr_260px]">
          
          {/* COLUMNA IZQUIERDA: Área de Aprendizaje */}
          <div className="flex flex-col gap-4">
            
            {/* 🎬 REPRODUCTOR / LAUNCHER */}
            {currentModule.type === 'vr' ? (
              <VrModuleLauncher module={currentModule} />
            ) : currentModule.type === 'slideshow' ? (
              <ModuleSlideshow images={currentModule.images} className="w-full" />
            ) : currentModule.type === 'audio' ? (
              <ModuleAudioPlayer src={currentModule.audioSrc} title={currentModule.title} className="w-full" />
            ) : currentModule.type === 'embed' ? (
              <ModuleEmbed html={currentModule.embedHtml} className="w-full" />
            ) : (
              <>
                {/* Escritorio: Oculto en móviles (hidden), visible en pantallas medianas o mayores (md:block) */}
                <div className="hidden md:block">
                  <VideoPlayer videoId={currentModule.videoId} className="w-full" />
                </div>
                {/* Móvil: Formato vertical estilo TikTok. Oculto en escritorio (md:hidden) */}
                <div className="md:hidden">
                  <VerticalVideo module={currentModule} />
                </div>
              </>
            )}

            {/* 📚 RECURSOS Y TAREAS */}
            <ModuleResources module={currentModule} className="min-h-[200px]" />
            
            {/* 💬 COMENTARIOS DE LA COMUNIDAD */}
            <CommentsPanel courseId={courseId} moduleId={currentModule.id} />
          </div>

          {/* COLUMNA DERECHA: Índice del Curso */}
          <ModuleList courseId={courseId} />
        </div>

        {/* 🟢 COMPONENTES FLOTANTES GLOBALES */}
        {/* La mascota acompaña al alumno e inyecta el contexto de la clase actual a su IA */}
        <MascotCompanion courseId={courseId} module={currentModule} />
        
        {/* Modal que saluda al alumno la primera vez que entra al curso */}
        <WelcomeModal courseId={courseId} />
    </div>
  )
}