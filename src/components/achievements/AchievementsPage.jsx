import AppTopBar from '../shared/AppTopBar'
import AchievementsPanel from '../mascot/AchievementsPanel'

export default function AchievementsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-text">
      <AppTopBar />

      <main className="flex-1 px-4 py-8 md:px-8">
        <div className="mx-auto max-w-2xl">
          <h1 className="text-2xl font-bold">Logros</h1>
          <p className="mt-1 text-sm text-text-muted">
            Medallas que tu mascota ha ganado al completar cada curso.
          </p>

          <AchievementsPanel className="mt-6" />
        </div>
      </main>
    </div>
  )
}
