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
import { useLibraryStore } from './stores/useLibraryStore'

// Lazy-loaded: pulls in Three.js / React Three Fiber, kept out of the main
// bundle since most visitors never reach the learning interface or the
// mascot's home.
const LearningInterface = lazy(() => import('./components/learning/LearningInterface'))
const MascotHomePage = lazy(() => import('./components/mascot/MascotHomePage'))
const LibraryPage = lazy(() => import('./components/library/LibraryPage'))
const EpubReaderPage = lazy(() => import('./components/library/EpubReaderPage'))
const VRPage = lazy(() => import('./components/vr/VRPage'))
const BookReaderModal = lazy(() => import('./components/library/BookReaderModal'))
const MissionsBoardPage = lazy(() => import('./components/missions/MissionsBoardPage'))
const NotesPage = lazy(() => import('./components/notes/NotesPage'))

function RouteFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background text-text-muted">
      Cargando…
    </div>
  )
}

export default function App() {
  const openBookId = useLibraryStore((s) => s.openBookId)

  return (
    <BrowserRouter>
      {openBookId && (
        <Suspense fallback={null}>
          <BookReaderModal />
        </Suspense>
      )}
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/crear-cuenta" element={<CreateAccountPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/unlock" element={<PortalPage />} />
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
