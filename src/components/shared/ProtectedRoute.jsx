import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../../stores/useAuthStore'
import GlobalItemEffects from './GlobalItemEffects'

export default function ProtectedRoute({ children }) {
  const isUnlocked = useAuthStore((s) => s.isUnlocked)

  if (!isUnlocked) {
    return <Navigate to="/unlock" replace />
  }

  return (
    <>
      {children}
      <GlobalItemEffects />
    </>
  )
}
