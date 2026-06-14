import { Link } from 'react-router-dom'
import { MASCOTS } from '../../data/mascotRegistry'
import { useMascotStore } from '../../stores/useMascotStore'

// Lets the student switch between the 3D models that have a real `modelPath`
// (the primitive shapes from early prototyping are intentionally excluded)
// AND that the user has already unlocked. Locked models live in la Tienda.
export default function MascotSelector() {
  const selectedMascotId = useMascotStore((s) => s.selectedMascotId)
  const selectMascot = useMascotStore((s) => s.selectMascot)
  const unlockedMascots = useMascotStore((s) => s.unlockedMascots)
  const allModels = MASCOTS.filter((m) => m.modelPath)
  const models = allModels.filter((m) => unlockedMascots.includes(m.id))
  const lockedCount = allModels.length - models.length

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {models.map((mascot) => {
          const active = selectedMascotId === mascot.id
          return (
            <button
              key={mascot.id}
              onClick={() => selectMascot(mascot.id)}
              className={`flex flex-col items-center gap-2 rounded-xl border p-3 transition-colors ${
                active
                  ? 'border-primary bg-primary/10'
                  : 'border-border bg-background hover:border-primary/40'
              }`}
            >
              <div
                className="flex h-12 w-12 items-center justify-center rounded-full text-2xl"
                style={{ backgroundColor: `${mascot.color}33` }}
              >
                {mascot.icon ?? '✨'}
              </div>
              <span className={`text-xs font-semibold ${active ? 'text-primary' : 'text-text-muted'}`}>
                {mascot.name}
              </span>
            </button>
          )
        })}
      </div>

      {lockedCount > 0 && (
        <Link
          to="/tienda"
          className="flex items-center justify-between gap-2 rounded-xl border border-dashed border-border bg-background px-4 py-3 text-sm text-text-muted transition-colors hover:border-primary/40 hover:text-text"
        >
          <span>
            🔒 Hay {lockedCount} mascota{lockedCount > 1 ? 's' : ''} más esperándote en la Tienda.
          </span>
          <span className="font-semibold text-primary">Ir a la Tienda →</span>
        </Link>
      )}
    </div>
  )
}
