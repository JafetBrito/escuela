import ProgressRing from '../shared/ProgressRing'
import { useI18n } from '../../i18n'

// Sustituto honesto de "Working Hours" (gauge radial %) — reusa el dato real
// de nivel/XP (mismo que ProfileSummaryCard) pero como protagonista grande,
// como en la referencia, en vez de escondido en un anillo chico.
export default function LevelGaugeCard({ level, xpIntoLevel, xpForNextLevel, isMaxLevel }) {
  const { t } = useI18n()
  const pct = isMaxLevel ? 100 : Math.round((xpIntoLevel / xpForNextLevel) * 100)
  return (
    <div className="flex flex-col items-center rounded-2xl border border-border bg-surface p-4 text-center">
      <p className="self-start text-xs font-bold uppercase tracking-wide text-text-muted">{t('dashboard.hero.levelGaugeTitle')}</p>
      <div className="mt-2">
        <ProgressRing pct={pct} accent="#7c3aed" size={96} stroke={9}>
          {pct}%
        </ProgressRing>
      </div>
      <p className="mt-2 text-xs text-text-muted">
        {isMaxLevel ? t('dashboard.summary.maxLevelReached') : t('dashboard.hero.levelGaugeSub', { level })}
      </p>
    </div>
  )
}
