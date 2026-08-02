/**
 * ============================================================================
 * 🗺️ ENRUTADOR PRINCIPAL Y CORAZÓN DE LA APP (App.jsx)
 * ============================================================================
 * Este archivo es una joya arquitectónica. No es solo un archivo de rutas, 
 * es el "Controlador de Tráfico" y el principal responsable del rendimiento 
 * inicial de la plataforma.
 * * 🏗️ PATRONES DE ARQUITECTURA APLICADOS AQUÍ:
 * 1. CODE SPLITTING (Carga Diferida): La técnica más importante del frontend.
 * 2. GLOBAL OVERLAYS: Componentes que "flotan" sobre toda la aplicación.
 * 3. ROUTE GUARDS: Protección centralizada de rutas.
 * ============================================================================
 */

import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LandingPage from './components/landing/LandingPage'
import CreateAccountPage from './components/checkout/CreateAccountPage'
import LoginPage from './components/auth/LoginPage'
import PortalPage from './components/portal/PortalPage'
import DashboardPage from './components/dashboard/DashboardPage'
import SchoolPage from './components/dashboard/SchoolPage'
import LanguageSyllabusPage from './components/dashboard/LanguageSyllabusPage'
import AcademiaIdiomasPage from './components/dashboard/AcademiaIdiomasPage'
import MainCategoryPage from './components/dashboard/MainCategoryPage'
import AcademiasPage from './components/dashboard/AcademiasPage'
import ShopPage from './components/shop/ShopPage'
import SettingsPage from './components/settings/SettingsPage'
import GamesPage from './components/games/GamesPage'
import GamePlayerPage from './components/games/GamePlayerPage'
import ChatsPage from './components/chats/ChatsPage'
import AchievementsPage from './components/achievements/AchievementsPage'
import ProtectedRoute from './components/shared/ProtectedRoute'
import AchievementWatcher from './components/achievements/AchievementWatcher'
import AchievementToast from './components/achievements/AchievementToast'
import LevelUpAnnouncer from './components/shared/LevelUpAnnouncer'
import TextSelectionMenu from './components/shared/TextSelectionMenu'
import DevToolsPanel from './components/shared/DevToolsPanel'
import AiCredentialsLoader from './components/shared/AiCredentialsLoader'
import { useLibraryStore } from './stores/useLibraryStore'
import { useSyncStatusStore } from './stores/useSyncStatusStore'
import { useHolidayStore } from './stores/useHolidayStore'
import { useDayNightStore } from './stores/useDayNightStore'
import { useEffect } from 'react'

/**
 * 📦 CODE SPLITTING (CARGA DIFERIDA)
 * ----------------------------------------------------------------------------
 * REGLA DE RENDIMIENTO: Nunca importes componentes pesados de forma normal 
 * si el usuario no los va a ver en los primeros 3 segundos de entrar a la app.
 * * - Three.js / React Three Fiber (Mascota, VR): Pesa muchísimo. Se carga solo si entran a /mascota o /vr.
 * - Epub.js (Lector de libros): Se carga solo si abren la biblioteca.
 * - LearningInterface: Contiene el reproductor de video pesado.
 * * Gracias a `lazy()`, el código de la Landing Page y el Login carga en milisegundos 
 * porque Webpack/Vite empaqueta estos archivos pesados en "chunks" separados.
 */
const LearningInterface = lazy(() => import('./components/learning/LearningInterface'))
const MascotHomePage = lazy(() => import('./components/mascot/MascotHomePage'))
const LibraryPage = lazy(() => import('./components/library/LibraryPage'))
const EpubReaderPage = lazy(() => import('./components/library/EpubReaderPage'))
const VRPage = lazy(() => import('./components/vr/VRPage'))
const VrArbol      = lazy(() => import('./components/vr/VrArbol'))
const VrCueva      = lazy(() => import('./components/vr/VrCueva'))
const AdminSetupPage = lazy(() => import('./components/admin/AdminSetupPage'))
const FlipbookTestPage = lazy(() => import('./components/admin/FlipbookTestPage'))
const ArenaPage = lazy(() => import('./components/arena/ArenaPage'))
const BookReaderModal = lazy(() => import('./components/library/BookReaderModal'))
const MissionsBoardPage = lazy(() => import('./components/missions/MissionsBoardPage'))
const NotesPage = lazy(() => import('./components/notes/NotesPage'))
const FriendsPage = lazy(() => import('./components/friends/FriendsPage'))
const SkillTreePage = lazy(() => import('./components/skills/SkillTreePage'))
const MemeSharePage = lazy(() => import('./components/memes/MemeSharePage'))
const ToolsPage = lazy(() => import('./components/tools/ToolsPage'))
const TasksPage = lazy(() => import('./components/tasks/TasksPage'))
const TaskDetailPage = lazy(() => import('./components/tasks/TaskDetailPage'))
const AdminTasksPage = lazy(() => import('./components/admin/AdminTasksPage'))
const AdminAgeProfilesPage = lazy(() => import('./components/admin/AdminAgeProfilesPage'))
const AdminDashboardPage = lazy(() => import('./components/admin/AdminDashboardPage'))
const AdminStudentDetailPage = lazy(() => import('./components/admin/AdminStudentDetailPage'))
const AdminCommandsPage = lazy(() => import('./components/admin/AdminCommandsPage'))
const ProjectsPage = lazy(() => import('./components/projects/ProjectsPage'))
const ProjectDetailPage = lazy(() => import('./components/projects/ProjectDetailPage'))
const AdminProjectsPage = lazy(() => import('./components/admin/AdminProjectsPage'))
const AdminLiveClassesPage = lazy(() => import('./components/admin/AdminLiveClassesPage'))
const MyClassesPage = lazy(() => import('./components/liveclass/MyClassesPage'))
const ClassSummaryPage = lazy(() => import('./components/liveclass/ClassSummaryPage'))
const AdminExamsPage = lazy(() => import('./components/admin/AdminExamsPage'))
const ExamsPage = lazy(() => import('./components/exams/ExamsPage'))
const ExamPage = lazy(() => import('./components/exams/ExamPage'))
const PodcastsPage = lazy(() => import('./components/podcasts/PodcastsPage'))
const AdminPodcastsPage = lazy(() => import('./components/admin/AdminPodcastsPage'))
const SchedulePage = lazy(() => import('./components/liveclass/SchedulePage'))
const AvailableClassesPage = lazy(() => import('./components/liveclass/AvailableClassesPage'))
const OnlineClassPage = lazy(() => import('./components/onlineclass/OnlineClassPage'))
const AnnouncementsPage = lazy(() => import('./components/announcements/AnnouncementsPage'))
const World2dPage  = lazy(() => import('./components/world2d/World2dPage'))
const RolLobbyPage = lazy(() => import('./components/rol/RolLobbyPage'))
const RolGamePage  = lazy(() => import('./components/rol/RolGamePage'))
const GuiasPage    = lazy(() => import('./components/guides/GuiasPage'))
const IaToolsPage  = lazy(() => import('./components/ai/IaToolsPage'))
const GlossaryPage = lazy(() => import('./components/glossary/GlossaryPage'))
const SearchPage   = lazy(() => import('./components/search/SearchPage'))

/**
 * Componente de respaldo visual (Fallback) que se muestra DURANTE 
 * la descarga de los "chunks" pesados mencionados arriba.
 */
function RouteFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background text-text-muted">
      Cargando…
    </div>
  )
}

// Antes solo el admin veía si un guardado a la nube fallaba (DevToolsPanel).
// Para todos los demás un fallo de RLS/columna faltante era invisible: el
// progreso simplemente "no se guardaba" sin ninguna pista de por qué.
function SyncErrorBanner() {
  const status = useSyncStatusStore((s) => s.status)
  const lastError = useSyncStatusStore((s) => s.lastError)
  if (status !== 'error') return null
  return (
    <div className="fixed bottom-3 left-1/2 z-[999] -translate-x-1/2 rounded-lg border border-danger/40 bg-danger/15 px-3 py-1.5 text-xs text-danger shadow-lg">
      ⚠️ No se pudo guardar tu progreso en la nube{lastError ? `: ${lastError}` : ''}
    </div>
  )
}

export default function App() {
  const openBookId = useLibraryStore((s) => s.openBookId)
  // Load holiday theme + world hour/season/weather from Supabase so both are
  // applied everywhere and survive the admin's own reload, not just the live
  // in-VR broadcast (see useDayNightStore.persistWorldState).
  useEffect(() => {
    useHolidayStore.getState().load()
    useDayNightStore.getState().load()
  }, [])

  return (
    <BrowserRouter>
      {/* 🌐 COMPONENTES GLOBALES (Fuera del sistema de Rutas)
        Al estar fuera de <Routes>, estos componentes NO se desmontan cuando 
        el usuario cambia de página. 
        - AchievementWatcher: Escucha los logros en segundo plano silenciosamente.
        - AchievementToast: Muestra las alertas pop-up de logros en cualquier pantalla.
      */}
      <AchievementWatcher />
      <AchievementToast />
      <LevelUpAnnouncer />
      <TextSelectionMenu />
      <DevToolsPanel />
      <AiCredentialsLoader />
      <SyncErrorBanner />

      {/* 📖 MODAL GLOBAL DEL LECTOR
        Si el usuario abre un libro (openBookId existe), el lector se superpone 
        en la pantalla sin cambiar la URL actual. Usa Suspense porque el lector 
        (BookReaderModal) está lazy-loaded.
      */}
      {openBookId && (
        <Suspense fallback={null}>
          <BookReaderModal />
        </Suspense>
      )}

      {/* 🛣️ SISTEMA DE RUTAS */}
      <Routes>
        {/* === RUTAS PÚBLICAS (No requieren sesión) === */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/crear-cuenta" element={<CreateAccountPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/unlock" element={<PortalPage />} />
        {/* Meme compartido — acceso público, sin login */}
        <Route path="/m/:memeId" element={
          <Suspense fallback={<RouteFallback />}>
            <MemeSharePage />
          </Suspense>
        } />

        <Route path="/admin-setup" element={
          <Suspense fallback={<RouteFallback />}>
            <AdminSetupPage />
          </Suspense>
        } />
        <Route path="/admin/flipbook-test" element={
          <Suspense fallback={<RouteFallback />}>
            <FlipbookTestPage />
          </Suspense>
        } />

        {/* === RUTAS PROTEGIDAS (Requieren sesión) === */}
        {/* NOTA DE ARQUITECTURA: <ProtectedRoute> es un "Route Guard".
          Su trabajo es verificar si hay una sesión activa. Si no la hay, 
          patea al usuario al /login ANTES de intentar renderizar la página interna,
          evitando que la app crashee por pedir datos de un usuario inexistente.
        */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/escuela/:slug"
          element={
            <ProtectedRoute>
              <SchoolPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/academia-idiomas"
          element={
            <ProtectedRoute>
              <AcademiaIdiomasPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/academia-idiomas/:l2"
          element={
            <ProtectedRoute>
              <LanguageSyllabusPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/escuela-categoria/:id"
          element={
            <ProtectedRoute>
              <MainCategoryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/academias"
          element={
            <ProtectedRoute>
              <AcademiasPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/mascota"
          element={
            <ProtectedRoute blockAgeProfiles={['kids', 'seniors']}>
              <Suspense fallback={<RouteFallback />}>
                <MascotHomePage />
              </Suspense>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/tienda"
          element={
            <ProtectedRoute>
              <ShopPage />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/ajustes"
          element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/amigos"
          element={
            <ProtectedRoute blockAgeProfiles={['kids']}>
              <Suspense fallback={<RouteFallback />}>
                <FriendsPage />
              </Suspense>
            </ProtectedRoute>
          }
        />

        <Route
          path="/chats"
          element={
            <ProtectedRoute blockAgeProfiles={['kids']}>
              <ChatsPage />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/biblioteca"
          element={
            <ProtectedRoute>
              <Suspense fallback={<RouteFallback />}>
                <LibraryPage />
              </Suspense>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/biblioteca/:bookId"
          element={
            <ProtectedRoute>
              <Suspense fallback={<RouteFallback />}>
                <EpubReaderPage />
              </Suspense>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/misiones"
          element={
            <ProtectedRoute blockAgeProfiles={['kids', 'seniors']}>
              <Suspense fallback={<RouteFallback />}>
                <MissionsBoardPage />
              </Suspense>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/notas"
          element={
            <ProtectedRoute>
              <Suspense fallback={<RouteFallback />}>
                <NotesPage />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/herramientas"
          element={
            <ProtectedRoute>
              <Suspense fallback={<RouteFallback />}>
                <ToolsPage />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/mis-tareas"
          element={
            <ProtectedRoute>
              <Suspense fallback={<RouteFallback />}>
                <TasksPage />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/mis-tareas/:id"
          element={
            <ProtectedRoute>
              <Suspense fallback={<RouteFallback />}>
                <TaskDetailPage />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/tareas"
          element={
            <ProtectedRoute>
              <Suspense fallback={<RouteFallback />}>
                <AdminTasksPage />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/perfiles-edad"
          element={
            <ProtectedRoute>
              <Suspense fallback={<RouteFallback />}>
                <AdminAgeProfilesPage />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <Suspense fallback={<RouteFallback />}>
                <AdminDashboardPage />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/alumnos/:id"
          element={
            <ProtectedRoute>
              <Suspense fallback={<RouteFallback />}>
                <AdminStudentDetailPage />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/comandos"
          element={
            <ProtectedRoute>
              <Suspense fallback={<RouteFallback />}>
                <AdminCommandsPage />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/proyectos"
          element={
            <ProtectedRoute>
              <Suspense fallback={<RouteFallback />}>
                <ProjectsPage />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/proyectos/:id"
          element={
            <ProtectedRoute>
              <Suspense fallback={<RouteFallback />}>
                <ProjectDetailPage />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/proyectos"
          element={
            <ProtectedRoute>
              <Suspense fallback={<RouteFallback />}>
                <AdminProjectsPage />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/clases"
          element={
            <ProtectedRoute>
              <Suspense fallback={<RouteFallback />}>
                <AdminLiveClassesPage />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/mis-clases"
          element={
            <ProtectedRoute>
              <Suspense fallback={<RouteFallback />}>
                <MyClassesPage />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/mis-clases/:classId"
          element={
            <ProtectedRoute>
              <Suspense fallback={<RouteFallback />}>
                <MyClassesPage />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/examenes"
          element={
            <ProtectedRoute>
              <Suspense fallback={<RouteFallback />}>
                <AdminExamsPage />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/examenes"
          element={
            <ProtectedRoute>
              <Suspense fallback={<RouteFallback />}>
                <ExamsPage />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/examenes/:courseId"
          element={
            <ProtectedRoute>
              <Suspense fallback={<RouteFallback />}>
                <ExamPage />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/podcasts"
          element={
            <ProtectedRoute>
              <Suspense fallback={<RouteFallback />}>
                <PodcastsPage />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/podcasts"
          element={
            <ProtectedRoute>
              <Suspense fallback={<RouteFallback />}>
                <AdminPodcastsPage />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/mis-clases/:classId/resumen"
          element={
            <ProtectedRoute>
              <Suspense fallback={<RouteFallback />}>
                <ClassSummaryPage />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/horario"
          element={
            <ProtectedRoute>
              <Suspense fallback={<RouteFallback />}>
                <SchedulePage />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/clases-disponibles"
          element={
            <ProtectedRoute>
              <Suspense fallback={<RouteFallback />}>
                <AvailableClassesPage />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/clase-online"
          element={
            <ProtectedRoute>
              <Suspense fallback={<RouteFallback />}>
                <OnlineClassPage />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/anuncios"
          element={
            <ProtectedRoute>
              <Suspense fallback={<RouteFallback />}>
                <AnnouncementsPage />
              </Suspense>
            </ProtectedRoute>
          }
        />

        <Route
          path="/arena"
          element={
            <ProtectedRoute blockAgeProfiles={['kids', 'seniors']}>
              <Suspense fallback={<RouteFallback />}>
                <ArenaPage />
              </Suspense>
            </ProtectedRoute>
          }
        />

        <Route
          path="/mundo"
          element={
            <ProtectedRoute blockAgeProfiles={['kids', 'seniors']}>
              <Suspense fallback={<RouteFallback />}>
                <World2dPage />
              </Suspense>
            </ProtectedRoute>
          }
        />

        <Route
          path="/rol"
          element={
            <ProtectedRoute blockAgeProfiles={['kids', 'seniors']}>
              <Suspense fallback={<RouteFallback />}>
                <RolLobbyPage />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/rol/:roomId"
          element={
            <ProtectedRoute blockAgeProfiles={['kids', 'seniors']}>
              <Suspense fallback={<RouteFallback />}>
                <RolGamePage />
              </Suspense>
            </ProtectedRoute>
          }
        />

        <Route
          path="/guias"
          element={
            <ProtectedRoute>
              <Suspense fallback={<RouteFallback />}>
                <GuiasPage />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/ia"
          element={
            <ProtectedRoute>
              <Suspense fallback={<RouteFallback />}>
                <IaToolsPage />
              </Suspense>
            </ProtectedRoute>
          }
        />

        {/* === RUTAS DE REALIDAD VIRTUAL (Heavy 3D Load) === */}
        <Route
          path="/vr-templo"
          element={
            <ProtectedRoute blockAgeProfiles={['kids', 'seniors']}>
              <Suspense fallback={<RouteFallback />}>
                <VrArbol />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/vr"
          element={
            <ProtectedRoute requireTutorial blockAgeProfiles={['kids', 'seniors']}>
              <Suspense fallback={<RouteFallback />}>
                <VRPage />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/vr/room"
          element={
            <ProtectedRoute requireTutorial blockAgeProfiles={['kids', 'seniors']}>
              <Suspense fallback={<RouteFallback />}>
                <VRPage roomMode />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/vr/anfiteatro"
          element={
            <ProtectedRoute requireTutorial blockAgeProfiles={['kids', 'seniors']}>
              <Suspense fallback={<RouteFallback />}>
                <VRPage anfiteatroMode />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/vr/graffiti"
          element={
            <ProtectedRoute requireTutorial blockAgeProfiles={['kids', 'seniors']}>
              <Suspense fallback={<RouteFallback />}>
                <VRPage graffitiMode />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/vr/pruebas"
          element={
            <ProtectedRoute requireTutorial blockAgeProfiles={['kids', 'seniors']}>
              <Suspense fallback={<RouteFallback />}>
                <VRPage testMode />
              </Suspense>
            </ProtectedRoute>
          }
        />

        <Route
          path="/vr/cueva-platon"
          element={
            <ProtectedRoute requireTutorial blockAgeProfiles={['kids', 'seniors']}>
              <Suspense fallback={<RouteFallback />}>
                <VrCueva />
              </Suspense>
            </ProtectedRoute>
          }
        />

        {/* === RUTAS DE JUEGOS Y APRENDIZAJE === */}
        <Route
          path="/games"
          element={
            <ProtectedRoute blockAgeProfiles={['seniors']}>
              <GamesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/games/:gameId"
          element={
            <ProtectedRoute blockAgeProfiles={['seniors']}>
              <GamePlayerPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/arbol"
          element={
            <ProtectedRoute blockAgeProfiles={['kids', 'seniors']}>
              <Suspense fallback={<RouteFallback />}>
                <SkillTreePage />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/logros"
          element={
            <ProtectedRoute>
              <AchievementsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/learn/:courseId"
          element={
            <ProtectedRoute>
              <Suspense fallback={<RouteFallback />}>
                <LearningInterface />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/cerebro"
          element={
            <ProtectedRoute>
              <Suspense fallback={<RouteFallback />}>
                <GlossaryPage />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/cerebro/:slug"
          element={
            <ProtectedRoute>
              <Suspense fallback={<RouteFallback />}>
                <GlossaryPage />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/buscar"
          element={
            <ProtectedRoute>
              <Suspense fallback={<RouteFallback />}>
                <SearchPage />
              </Suspense>
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}

