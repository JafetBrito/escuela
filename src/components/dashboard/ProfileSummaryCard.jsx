import ProgressRing from '../shared/ProgressRing'
import { useI18n } from '../../i18n'

// Resumen de perfil para el Dashboard — no hay matrícula ni foto de perfil
// reales en este proyecto (solo emoji de mascota), así que en vez de
// inventar esos datos se muestra lo que sí existe: nivel/XP y tipo de
// licencia. El anillo reutiliza ProgressRing (shared/), pensado justo para
// mostrar "Nv X" en el centro.
export default function ProfileSummaryCard({ displayName, role, mascotEmoji, level, xpIntoLevel, xpForNextLevel, isMaxLevel, licenseType }) {
  const { t } = useI18n()
  const pct = Math.round((xpIntoLevel / xpForNextLevel) * 100)
  const LICENSE_LABEL = { full: t('dashboard.summary.licenseFull'), single: t('dashboard.summary.licenseSingle') }
  return (
    <div className="rounded-2xl border border-border bg-surface p-4">
      <div className="flex items-center gap-3">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 border-primary bg-surface-hover text-2xl">
          {mascotEmoji}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-text">{displayName}</p>
          <p className="text-xs text-text-muted">{role === 'admin' ? t('dashboard.summary.roleAdmin') : t('dashboard.summary.roleStudent')}</p>
        </div>
        <ProgressRing pct={pct} accent="#7c3aed" size={56} stroke={5}>
          {t('dashboard.hero.levelAbbr')} {level}
        </ProgressRing>
      </div>
      <p className="mt-3 text-xs text-text-muted">
        {isMaxLevel ? t('dashboard.summary.maxLevelReached') : t('dashboard.summary.xpToLevelUp', { xp: xpForNextLevel - xpIntoLevel })}
      </p>
      {licenseType && (
        <span className="mt-2 inline-block rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-[10px] font-bold text-primary">
          🔑 {LICENSE_LABEL[licenseType] ?? t('dashboard.summary.noLicense')}
        </span>
      )}
    </div>
  )
}
