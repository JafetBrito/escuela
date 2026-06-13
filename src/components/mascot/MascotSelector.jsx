import { MASCOTS } from '../../data/mascotRegistry'
import { useMascotStore } from '../../stores/useMascotStore'

// Lets the student switch between the 3D models that have a real `modelPath`
// (the primitive shapes from early prototyping are intentionally excluded).
export default function MascotSelector() {
  const selectedMascotId = useMascotStore((s) => s.selectedMascotId)
  const selectMascot = useMascotStore((s) => s.selectMascot)
  const models = MASCOTS.filter((m) => m.modelPath)

  return (
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
  )
}
