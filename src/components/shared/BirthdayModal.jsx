import { useState } from 'react'
import { useAuthStore } from '../../stores/useAuthStore'
import { useBirthdayStore, isBirthdayToday } from '../../stores/useBirthdayStore'

// Modal global "¡Feliz cumpleaños!" — visible cuando hoy coincide con
// profiles.birthdate y aún no se reclamó este año, o cuando el admin lo
// fuerza para probarlo con /cumpleanos (GmConsole) sin esperar la fecha
// real. Mismo criterio visual que UpdatingBanner en App.jsx.
export default function BirthdayModal() {
  const profile = useAuthStore((s) => s.profile)
  const lastClaimedYear = useBirthdayStore((s) => s.lastClaimedYear)
  const debugForceOpen = useBirthdayStore((s) => s.debugForceOpen)
  const [claimed, setClaimed] = useState(null)

  const realCanClaim = isBirthdayToday(profile?.birthdate) && lastClaimedYear !== new Date().getFullYear()
  if (!realCanClaim && !debugForceOpen) return null

  const displayName = profile?.display_name || 'estrella del campus'

  const handleClaim = () => {
    const reward = useBirthdayStore.getState().claim()
    setClaimed(reward)
  }

  const handleClose = () => {
    useBirthdayStore.getState().dismissForceOpen()
    setClaimed(null)
  }

  const handleGoToParty = () => {
    // OJO: nunca llamar aquí a handleClose()/dismissForceOpen() — borraría
    // el sessionStorage justo antes de navegar, y /vr/cumpleanos volvería a
    // rebotar al dashboard en modo de prueba (bug real, encontrado probando
    // esto en vivo). La navegación dura ya recarga la página entera, así
    // que no hace falta "cerrar" nada local aquí.
    window.location.href = '/vr/cumpleanos'
  }

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-sm rounded-2xl border border-primary/30 bg-surface p-6 text-center shadow-2xl">
        <p className="text-5xl">🎂</p>
        <p className="mt-2 text-2xl font-extrabold text-text">¡Feliz cumpleaños, {displayName}!</p>
        <p className="mt-1 text-sm text-text-muted">
          Todo el campus lo está celebrando hoy contigo. Aquí tienes tu regalo.
        </p>

        {debugForceOpen && !realCanClaim && (
          <p className="mt-3 rounded-lg bg-amber-500/10 px-3 py-1.5 text-xs text-amber-400">
            Modo de prueba (/cumpleanos) — hoy no es tu cumpleaños real.
          </p>
        )}

        {claimed ? (
          <div className="mt-4 rounded-xl border border-primary/30 bg-background p-4">
            <p className="text-sm font-semibold text-text">🎁 ¡Regalo reclamado!</p>
            <p className="mt-1 text-sm text-text-muted">
              +{claimed.coins.toLocaleString()} monedas · +{claimed.xp} XP
            </p>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleClaim}
            className="mt-4 w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-background hover:opacity-90"
          >
            🎁 Reclamar regalo
          </button>
        )}

        <button
          type="button"
          onClick={handleGoToParty}
          className="mt-2 w-full rounded-lg border border-border px-4 py-2.5 text-sm font-semibold text-text hover:border-primary"
        >
          🎉 Ir a tu fiesta →
        </button>

        <button
          type="button"
          onClick={handleClose}
          className="mt-3 text-xs text-text-muted hover:text-text"
        >
          Cerrar
        </button>
      </div>
    </div>
  )
}
