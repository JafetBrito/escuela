import AppTopBar from '../shared/AppTopBar'
import MascotCompanion from '../mascot/MascotCompanion'
import Inventory from '../inventory/Inventory'

export default function NotesPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-text">
      <AppTopBar />

      <main className="flex-1 px-4 py-8 md:px-8">
        <div className="mx-auto flex max-w-2xl flex-col gap-6">
          <div>
            <h1 className="text-2xl font-bold">📝 Notas</h1>
            <p className="mt-1 text-sm text-text-muted">
              Tus notas y enlaces guardados, generales y por clase.
            </p>
          </div>

          <Inventory />
        </div>
      </main>

      <MascotCompanion />
    </div>
  )
}
