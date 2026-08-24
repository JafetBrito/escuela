import { useAuthStore } from '../../stores/useAuthStore'
import { useGameStore, PLAYER_CLASSES, PLAYER_AVATARS } from '../../stores/useGameStore'
import { useLevelStore, levelProgress } from '../../stores/useLevelStore'
import { useI18n } from '../../i18n'

// Tarjeta de perfil compacta — icono + nombre + nivel + cursos inscritos.
// Segunda vuelta de este componente (ver project_dashboard_hero_redesign):
// la primera versión (roster de 2 tarjetas Jugador/Oliver, anillo grande)
// no se sintió como lo que pedía el usuario — mandó una referencia de un
// dashboard tipo Platzi (tarjeta de perfil chica + tarjeta de curso grande
// con anillo + tarjeta de puntos) y pidió adaptar ESO con datos reales, no
// una pantalla de selección de personaje RPG. Esta versión es
// deliberadamente simple: solo lo que cabe en una tarjeta de perfil
// pequeña, sin el roster de clases/HP/talentos (eso sigue disponible en
// /mascota y /arbol, no hace falta duplicarlo aquí).
export default function ProfileHeroCard({ enrolledCount }) {
  const { t } = useI18n()
  const profile = useAuthStore((s) => s.profile)
  const session = useAuthStore((s) => s.session)
  const player = useGameStore((s) => s.player)
  const xp = useLevelStore((s) => s.xp)
  const { level } = levelProgress(xp)

  const displayName = profile?.display_name || session?.user?.email?.split('@')[0] || t('dashboard.defaultStudent')
  const playerClass = player.class ? PLAYER_CLASSES[player.class] : null
  const playerAvatar = PLAYER_AVATARS.find((a) => a.id === player.avatarId) ?? PLAYER_AVATARS[0]
  const playerIcon = playerClass?.icon ?? playerAvatar?.icon ?? '🧑'

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-4">
      <div
        className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-2xl ring-2 ring-primary"
        style={{ background: playerClass ? `${playerClass.color}22` : 'var(--color-surface-hover)' }}
      >
        {playerIcon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-base font-black text-text">{displayName}</p>
        <p className="truncate text-xs text-text-muted">{playerClass?.name ?? t('dashboard.defaultStudent')}</p>
      </div>
      <div className="flex shrink-0 gap-2">
        <div className="flex flex-col items-center rounded-lg bg-surface-hover px-2.5 py-1.5">
          <span className="text-sm font-black text-primary">{level}</span>
          <span className="text-[9px] font-bold uppercase text-text-muted">{t('dashboard.hero.levelAbbr')}</span>
        </div>
        <div className="flex flex-col items-center rounded-lg bg-surface-hover px-2.5 py-1.5">
          <span className="text-sm font-black text-text">{enrolledCount}</span>
          <span className="text-[9px] font-bold uppercase text-text-muted">{t('dashboard.hero.coursesLabel')}</span>
        </div>
      </div>
    </div>
  )
}
