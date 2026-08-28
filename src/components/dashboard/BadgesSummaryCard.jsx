import { Link } from 'react-router-dom'
import { useI18n } from '../../i18n'

// Versión compacta de la cabecera de AchievementsPanel.jsx (mismo gradiente
// from-amber-400 to-primary) — no la lista completa de logros, para no
// duplicar /logros.
export default function BadgesSummaryCard({ unlockedCount, total }) {
  const { t } = useI18n()
  const pct = total > 0 ? Math.round((unlockedCount / total) * 100) : 0
  return (
    <div className="rounded-2xl border border-border bg-surface p-4">
      <div className="flex items-center justify-between text-sm">
        <p className="font-bold text-text">{t('dashboard.summary.myBadges')}</p>
        <p className="text-text-muted">{unlockedCount}/{total}</p>
      </div>
      <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-surface-hover">
        <div
          className="h-full rounded-full bg-gradient-to-r from-amber-400 to-primary transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <Link to="/logros" className="mt-3 inline-block text-xs font-semibold text-primary hover:underline">
        {t('dashboard.summary.seeAllBadges')}
      </Link>
    </div>
  )
}
