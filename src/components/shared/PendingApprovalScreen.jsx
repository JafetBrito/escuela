import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../stores/useAuthStore'
import Logo from './Logo'

// Pantalla de bloqueo total mientras profiles.account_status === 'pending'
// (hoy solo pasa con cuentas de niños creadas por un padre/tutor — ver
// CreateAccountPage.jsx y migration_022.sql). Se muestra en vez de
// CUALQUIER ruta protegida (ver ProtectedRoute.jsx) hasta que un admin
// apruebe la cuenta desde /admin.
export default function PendingApprovalScreen() {
  const navigate = useNavigate()
  const signOut = useAuthStore((s) => s.signOut)

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-6 text-center text-text">
      <Logo />
      <p className="text-5xl">⏳</p>
      <h1 className="text-xl font-black">Tu cuenta está esperando aprobación</h1>
      <p className="max-w-sm text-sm text-text-muted">
        Un administrador todavía tiene que revisar y aprobar esta cuenta antes de que puedas entrar a la
        plataforma. Vuelve a intentarlo más tarde.
      </p>
      <button
        type="button"
        onClick={handleSignOut}
        className="mt-2 rounded-xl border border-border px-5 py-2.5 text-sm font-bold text-text-muted transition-colors hover:border-primary/40 hover:text-text"
      >
        Cerrar sesión
      </button>
    </div>
  )
}
