import AppTopBar from '../shared/AppTopBar'
import AchievementsPanel from '../mascot/AchievementsPanel'
import MascotCompanion from '../mascot/MascotCompanion'
import PageVideoModal from '../shared/PageVideoModal'
import { useI18n } from '../../i18n'

export default function AchievementsPage() {
  const { t } = useI18n()
  return (
    <div className="flex min-h-screen flex-col bg-background text-text">
      <AppTopBar />
      <PageVideoModal pageKey="logros" />

      <main className="flex-1 px-4 py-8 md:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="overflow-hidden rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 px-6 py-8 shadow-lg">
            <h1 className="text-3xl font-extrabold text-white drop-shadow-sm">{t('pages.achievements.title')}</h1>
            <p className="mt-1 text-sm font-medium text-white/85">
              {t('pages.achievements.subtitle')}
            </p>
          </div>

          <AchievementsPanel className="mt-6" />
        </div>
      </main>

      <MascotCompanion />
    </div>
  )
}
