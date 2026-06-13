import { useDevToolsGuard } from '../../services/security/devToolsGuard'
import { useScreenCaptureGuard } from '../../services/security/screenCaptureGuard'
import BlackoutOverlay from './BlackoutOverlay'

export default function SecurityWrapper({ children }) {
  const devToolsDetected = useDevToolsGuard()
  const isObscured = useScreenCaptureGuard()

  if (devToolsDetected) {
    return (
      <BlackoutOverlay
        title="Acceso bloqueado"
        message="Se detectaron herramientas de desarrollador. Cierra la consola y recarga la página para continuar con tu clase."
      />
    )
  }

  return (
    <div className="relative">
      {children}
      {isObscured && (
        <div className="fixed inset-0 z-[9999] bg-background" aria-hidden="true" />
      )}
    </div>
  )
}
