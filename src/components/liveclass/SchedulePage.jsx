import AppTopBar from '../shared/AppTopBar'
import MascotCompanion from '../mascot/MascotCompanion'
import WeeklyClassCalendar from './WeeklyClassCalendar'

export default function SchedulePage() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-text">
      <AppTopBar />

      <main className="flex-1 px-4 py-8 md:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 px-6 py-8 shadow-lg">
            <h1 className="text-3xl font-extrabold text-white">🗓️ Horario</h1>
            <p className="mt-1 text-sm font-medium text-white/85">Todas tus clases en vivo, semana por semana.</p>
          </div>

          <div className="mt-6">
            <WeeklyClassCalendar />
          </div>
        </div>
      </main>

      <MascotCompanion />
    </div>
  )
}
