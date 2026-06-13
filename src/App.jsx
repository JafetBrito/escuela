import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LandingPage from './components/landing/LandingPage'
import CreateAccountPage from './components/checkout/CreateAccountPage'
import PortalPage from './components/portal/PortalPage'
import DashboardPage from './components/dashboard/DashboardPage'
import ProfilePage from './components/profile/ProfilePage'
import ShopPage from './components/shop/ShopPage'
import ProtectedRoute from './components/shared/ProtectedRoute'

// Lazy-loaded: pulls in Three.js / React Three Fiber, kept out of the main
// bundle since most visitors never reach the learning interface or the
// mascot's home.
const LearningInterface = lazy(() => import('./components/learning/LearningInterface'))
const MascotHomePage = lazy(() => import('./components/mascot/MascotHomePage'))

function RouteFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background text-text-muted">
      Cargando…
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/crear-cuenta" element={<CreateAccountPage />} />
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
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
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
