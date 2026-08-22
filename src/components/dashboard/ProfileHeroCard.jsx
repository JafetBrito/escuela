import { Link } from 'react-router-dom'
import { useAuthStore } from '../../stores/useAuthStore'
import { useMascotStore } from '../../stores/useMascotStore'
import { useGameStore, OLIVER_CLASSES } from '../../stores/useGameStore'
import { useLevelStore, levelProgress } from '../../stores/useLevelStore'
import { useCurrencyStore } from '../../stores/useCurrencyStore'
import { MASCOTS } from '../../data/mascotRegistry'

// Lo primero que se ve al entrar al Dashboard — antes foto/nivel/nombre
// quedaban como texto plano enterrado bajo los banners de aviso, y no había
// ningún indicio de la mascota. Pedido explícito del dueño tras revisar
// móvil: "lo más importante" (foto, nivel, nombre, mascota) va primero.
// vrAllowed: perfiles niños/abuelos no tienen VR/mascota — se oculta esa
// franja para ellos, mismo criterio que el resto del Dashboard.
export default function ProfileHeroCard({ vrAllowed }) {
  const profile = useAuthStore((s) => s.profile)
  const session = useAuthStore((s) => s.session)
  const selectedMascotId = useMascotStore((s) => s.selectedMascotId)
  const oliver = useGameStore((s) => s.oliver)
  const xp = useLevelStore((s) => s.xp)
  const coins = useCurrencyStore((s) => s.coins)
  const { level, xpIntoLevel, xpForNextLevel } = levelProgress(xp)

  const displayName = profile?.display_name || session?.user?.email?.split('@')[0] || 'Estudiante'
  const mascot = MASCOTS.find((m) => m.id === selectedMascotId)
  const oliverClass = oliver.class ? OLIVER_CLASSES[oliver.class] : null
  const hpPct = oliver.hp?.max ? Math.round((oliver.hp.current / oliver.hp.max) * 100) : 0

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface">
      <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Foto + nombre + nivel */}
        <div className="flex items-center gap-3">
          <div
            className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full text-3xl ring-2 ring-primary"
            style={{ background: mascot ? `${mascot.color}22` : 'var(--color-surface-hover)' }}
          >
            {mascot?.icon ?? '👤'}
          </div>
          <div className="min-w-0">
            <p className="truncate text-lg font-black text-text">{displayName}</p>
            <div className="mt-1 flex items-center gap-2">
              <span className="shrink-0 rounded-full bg-primary/15 px-2 py-0.5 text-xs font-black text-primary">Nv. {level}</span>
              <span className="text-xs text-text-muted">{xpIntoLevel}/{xpForNextLevel} XP</span>
            </div>
            <div className="mt-1.5 h-1.5 w-32 rounded-full bg-surface-hover">
              <div className="h-1.5 rounded-full bg-primary transition-all" style={{ width: `${(xpIntoLevel / xpForNextLevel) * 100}%` }} />
            </div>
          </div>
        </div>

        {/* Monedas */}
        <div className="flex shrink-0 items-center gap-2 self-start rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 sm:self-auto">
          <span className="text-lg">🪙</span>
          <span className="text-sm font-black text-amber-400">{coins.toLocaleString()}</span>
        </div>
      </div>

      {/* Info de mascota */}
      {vrAllowed && (
        <Link
          to={oliverClass ? '/mascota' : '/vr-templo'}
          className="flex items-center gap-3 border-t border-border bg-background/40 px-4 py-3 transition-colors hover:bg-surface-hover"
        >
          {oliverClass ? (
            <>
              <span className="text-2xl">{oliverClass.icon}</span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-text">{oliverClass.name}</p>
                <div className="mt-1 flex items-center gap-2">
                  <div className="h-1.5 w-full max-w-[8rem] rounded-full bg-surface-hover">
                    <div className="h-1.5 rounded-full bg-red-500" style={{ width: `${hpPct}%` }} />
                  </div>
                  <span className="shrink-0 text-[10px] text-text-muted">{oliver.hp?.current ?? 0}/{oliver.hp?.max ?? 0} HP</span>
                </div>
              </div>
              <span className="shrink-0 text-xs text-text-muted">Ver →</span>
            </>
          ) : (
            <>
              <span className="text-2xl">🐾</span>
              <p className="flex-1 text-sm font-semibold text-text-muted">Aún no tienes una mascota — créala aquí</p>
              <span className="shrink-0 text-xs font-semibold text-primary">Crear →</span>
            </>
          )}
        </Link>
      )}
    </div>
  )
}
