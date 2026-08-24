import { Link } from 'react-router-dom'
import { useAuthStore } from '../../stores/useAuthStore'
import { useGameStore, PLAYER_CLASSES, PLAYER_AVATARS, OLIVER_CLASSES } from '../../stores/useGameStore'
import { useLevelStore, levelProgress } from '../../stores/useLevelStore'
import { useCurrencyStore } from '../../stores/useCurrencyStore'
import { useI18n } from '../../i18n'
import ProgressRing from '../shared/ProgressRing'

// Lo primero que se ve al entrar al Dashboard — pantalla de "personaje"
// estilo selección de personaje: quién eres (tú + Oliver), tu nivel (una
// sola vez, como anillo — es el mismo nivel compartido para los dos, ver
// project_dashboard_hero_redesign) y tus monedas. Antes solo mostraba el
// ícono cosmético de la mascota junto al nombre del jugador y nunca la
// clase/HP/talentos del propio jugador — ahora ambos tienen su tarjeta.
// vrAllowed: perfiles niños/abuelos no tienen acceso a /vr-templo (donde se
// elige clase), así que no tiene sentido mostrarles el roster de 2 tarjetas.
function CharacterCard({ icon, accent, name, roleOrCta, hpCurrent, hpMax, talentPoints, href }) {
  const hpPct = hpMax ? Math.round((hpCurrent / hpMax) * 100) : 0
  return (
    <Link
      to={href}
      className="flex items-center gap-3 rounded-xl border border-border bg-background/40 px-3 py-2.5 transition-colors hover:bg-surface-hover"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-xl"
        style={{ background: `${accent}22` }}>
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold text-text">{name}</p>
        <p className="truncate text-xs text-text-muted">{roleOrCta}</p>
        {hpMax > 0 && (
          <div className="mt-1 flex items-center gap-2">
            <div className="h-1.5 w-full max-w-[6rem] rounded-full bg-surface-hover">
              <div className="h-1.5 rounded-full bg-red-500" style={{ width: `${hpPct}%` }} />
            </div>
            <span className="shrink-0 text-[10px] text-text-muted">{hpCurrent}/{hpMax} HP</span>
          </div>
        )}
      </div>
      {talentPoints > 0 && (
        <span className="shrink-0 rounded-full border border-primary/30 bg-primary/15 px-2 py-0.5 text-[10px] font-bold text-primary">
          🌳 +{talentPoints}
        </span>
      )}
    </Link>
  )
}

export default function ProfileHeroCard({ vrAllowed }) {
  const { t } = useI18n()
  const profile = useAuthStore((s) => s.profile)
  const session = useAuthStore((s) => s.session)
  const player = useGameStore((s) => s.player)
  const oliver = useGameStore((s) => s.oliver)
  const xp = useLevelStore((s) => s.xp)
  const coins = useCurrencyStore((s) => s.coins)
  const { level, xpIntoLevel, xpForNextLevel, isMaxLevel } = levelProgress(xp)

  const displayName = profile?.display_name || session?.user?.email?.split('@')[0] || t('dashboard.defaultStudent')
  const playerClass = player.class ? PLAYER_CLASSES[player.class] : null
  const playerAvatar = PLAYER_AVATARS.find((a) => a.id === player.avatarId) ?? PLAYER_AVATARS[0]
  const playerIcon = playerClass?.icon ?? playerAvatar?.icon ?? '🧑'
  const oliverClass = oliver.class ? OLIVER_CLASSES[oliver.class] : null

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface">
      <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Foto + nombre + anillo de nivel (único — el mismo nivel aplica a
            personaje y mascota, no se duplica el anillo por tarjeta) */}
        <div className="flex items-center gap-3">
          <div
            className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full text-3xl ring-2 ring-primary"
            style={{ background: playerClass ? `${playerClass.color}22` : 'var(--color-surface-hover)' }}
          >
            {playerIcon}
          </div>
          <div className="min-w-0">
            <p className="truncate text-lg font-black text-text">{displayName}</p>
            <p className="text-xs text-text-muted">{isMaxLevel ? `${xpIntoLevel} XP` : `${xpIntoLevel}/${xpForNextLevel} XP`}</p>
          </div>
          <div className="flex shrink-0 flex-col items-center gap-0.5">
            <ProgressRing pct={isMaxLevel ? 100 : (xpIntoLevel / xpForNextLevel) * 100} accent="var(--color-primary)" size={56} stroke={5}>
              {isMaxLevel ? 'MAX' : level}
            </ProgressRing>
            <span className="text-[9px] font-bold uppercase tracking-wide text-text-muted">{t('dashboard.hero.levelAbbr')}</span>
          </div>
        </div>

        {/* Monedas */}
        <div className="flex shrink-0 items-center gap-2 self-start rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 sm:self-auto">
          <span className="text-lg">🪙</span>
          <span className="text-sm font-black text-amber-400">{coins.toLocaleString()}</span>
        </div>
      </div>

      {/* Roster: tú + Oliver — solo si el perfil tiene acceso a VR/clases
          (ahí es donde se eligen), igual que antes. */}
      {vrAllowed && (
        <div className="grid grid-cols-1 gap-2 border-t border-border p-3 sm:grid-cols-2">
          <CharacterCard
            icon={playerIcon}
            accent={playerClass?.color ?? playerAvatar?.color ?? 'var(--color-primary)'}
            name={t('dashboard.hero.playerLabel')}
            roleOrCta={playerClass ? `${playerClass.name} · ${playerClass.role}` : t('dashboard.hero.noClass')}
            hpCurrent={player.hp?.current ?? 0}
            hpMax={player.hp?.max ?? 0}
            talentPoints={player.talentPoints}
            href={playerClass ? '/arbol' : '/vr-templo'}
          />
          <CharacterCard
            icon={oliverClass?.icon ?? '🐾'}
            accent={oliverClass?.color ?? 'var(--color-primary)'}
            name={t('dashboard.hero.oliverLabel')}
            roleOrCta={oliverClass ? oliverClass.name : t('dashboard.hero.noMascot')}
            hpCurrent={oliver.hp?.current ?? 0}
            hpMax={oliver.hp?.max ?? 0}
            // Los puntos de talento de Oliver no se otorgan automáticamente
            // al subir de nivel (solo los del jugador, vía useLevelStore.addXp)
            // — se quedan en su valor inicial hasta que se gasten a mano.
            talentPoints={oliver.talentPoints}
            href={oliverClass ? '/mascota' : '/vr-templo'}
          />
        </div>
      )}
    </div>
  )
}
