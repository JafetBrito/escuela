import { useNavigate } from 'react-router-dom'
import AppTopBar from '../shared/AppTopBar'
import AchievementsPanel from '../mascot/AchievementsPanel'
import { useAuthStore } from '../../stores/useAuthStore'
import { useMascotStore } from '../../stores/useMascotStore'
import { useCurrencyStore } from '../../stores/useCurrencyStore'
import { getMascotById } from '../../data/mascotRegistry'

export default function ProfilePage() {
  const navigate = useNavigate()
  const license = useAuthStore((s) => s.license)
  const lock = useAuthStore((s) => s.lock)
  const selectedMascotId = useMascotStore((s) => s.selectedMascotId)
  const coins = useCurrencyStore((s) => s.coins)
  const mascot = getMascotById(selectedMascotId)

  const accessLabel =
    license?.type === 'full'
      ? 'Completo (todos los cursos)'
      : `Un curso (${license?.courseId ?? '—'})`

  const handleLogout = () => {
    lock()
    navigate('/')
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-text">
      <AppTopBar />

      <main className="flex-1 px-4 py-8 md:px-8">
        <div className="mx-auto flex max-w-3xl flex-col gap-6">
          <div>
            <h1 className="text-2xl font-bold">Perfil</h1>
            <p className="mt-1 text-sm text-text-muted">
              Tu cuenta, tu mascota y los logros que has desbloqueado.
            </p>
          </div>

          <section className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-5">
            <p className="text-sm font-semibold uppercase tracking-wide text-text-muted">Cuenta</p>
            <div className="flex flex-wrap gap-x-8 gap-y-2 text-sm">
              <div>
                <p className="text-text-muted">Licencia</p>
                <p className="font-mono text-text">{license?.licenseId ?? '—'}</p>
              </div>
              <div>
                <p className="text-text-muted">Plan</p>
                <p className="text-text">{license?.role ?? 'estudiante'}</p>
              </div>
              <div>
                <p className="text-text-muted">Activado</p>
                <p className="text-text">
                  {license?.issuedAt ? new Date(license.issuedAt).toLocaleDateString() : '—'}
                </p>
              </div>
              <div>
                <p className="text-text-muted">Acceso a cursos</p>
                <p className="text-text">{accessLabel}</p>
              </div>
              <div>
                <p className="text-text-muted">Monedas</p>
                <p className="flex items-center gap-1 text-text">
                  <span>🪙</span>
                  {coins}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="mt-2 self-start rounded-lg border border-border px-4 py-2 text-sm font-semibold text-text-muted hover:border-danger hover:text-danger"
            >
              Cerrar sesión
            </button>
          </section>

          <section className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-5">
            <p className="text-sm font-semibold uppercase tracking-wide text-text-muted">
              Tu mascota
            </p>
            <p className="text-sm text-text">
              {mascot.name} te acompaña en cada clase y guarda tus avances.
            </p>
          </section>

          <section className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-5">
            <p className="text-sm font-semibold uppercase tracking-wide text-text-muted">Logros</p>
            <AchievementsPanel />
          </section>
        </div>
      </main>
    </div>
  )
}
