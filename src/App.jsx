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
import ShopPage from './components/shop/ShopPage'
import SettingsPage from './components/settings/SettingsPage'
import GamesPage from './components/games/GamesPage'
import GamePlayerPage from './components/games/GamePlayerPage'
import ChatsPage from './components/chats/ChatsPage'
import AchievementsPage from './components/achievements/AchievementsPage'
import ProtectedRoute from './components/shared/ProtectedRoute'
import AchievementWatcher from './components/achievements/AchievementWatcher'
import AchievementToast from './components/achievements/AchievementToast'
import PatchNotesModal from './components/shared/PatchNotesModal'
import DevToolsPanel from './components/shared/DevToolsPanel'
import { useLibraryStore } from './stores/useLibraryStore'

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

export default function App() {
  // Estado global para saber si el usuario abrió un libro desde cualquier parte de la app.
  const openBookId = useLibraryStore((s) => s.openBookId)

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
      <PatchNotesModal />
      <DevToolsPanel />
      
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
          path="/mascota"
          element={
            <ProtectedRoute>
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
            <ProtectedRoute>
              <Suspense fallback={<RouteFallback />}>
                <FriendsPage />
              </Suspense>
            </ProtectedRoute>
          }
        />

        <Route
          path="/chats"
          element={
            <ProtectedRoute>
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
            <ProtectedRoute>
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
          path="/arena"
          element={
            <ProtectedRoute>
              <Suspense fallback={<RouteFallback />}>
                <ArenaPage />
              </Suspense>
            </ProtectedRoute>
          }
        />

        {/* === RUTAS DE REALIDAD VIRTUAL (Heavy 3D Load) === */}
        <Route
          path="/vr-arbol"
          element={
            <ProtectedRoute>
              <Suspense fallback={<RouteFallback />}>
                <VrArbol />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/vr"
          element={
            <ProtectedRoute>
              <Suspense fallback={<RouteFallback />}>
                <VRPage />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/vr/room"
          element={
            <ProtectedRoute>
              <Suspense fallback={<RouteFallback />}>
                <VRPage roomMode />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/vr/anfiteatro"
          element={
            <ProtectedRoute>
              <Suspense fallback={<RouteFallback />}>
                <VRPage anfiteatroMode />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/vr/world-tree"
          element={
            <ProtectedRoute>
              <Suspense fallback={<RouteFallback />}>
                <VRPage worldTreeMode />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/vr/graffiti"
          element={
            <ProtectedRoute>
              <Suspense fallback={<RouteFallback />}>
                <VRPage graffitiMode />
              </Suspense>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/vr/cueva-platon"
          element={
            <ProtectedRoute>
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
            <ProtectedRoute>
              <GamesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/games/:gameId"
          element={
            <ProtectedRoute>
              <GamePlayerPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/arbol"
          element={
            <ProtectedRoute>
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
      </Routes>
    </BrowserRouter>
  )
}

