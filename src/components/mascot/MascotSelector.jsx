import { MASCOTS } from '../../data/mascotRegistry'
import { useMascotStore } from '../../stores/useMascotStore'

export default function MascotSelector() {
  const selectedMascotId = useMascotStore((s) => s.selectedMascotId)
  const selectMascot = useMascotStore((s) => s.selectMascot)

  return (
    <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
      {MASCOTS.map((mascot) => (
        <button
          key={mascot.id}
          onClick={() => selectMascot(mascot.id)}
          title={mascot.name}
          className={`flex aspect-square items-center justify-center rounded-lg border text-xs font-semibold transition-colors ${
            selectedMascotId === mascot.id
              ? 'border-primary bg-primary/10 text-primary'
              : 'border-border bg-background text-text-muted hover:border-primary/40'
          }`}
          style={{ borderColor: selectedMascotId === mascot.id ? mascot.color : undefined }}
        >
          <span
            className="block h-4 w-4 rounded-full"
            style={{ backgroundColor: mascot.color }}
          />
        </button>
      ))}
    </div>
  )
}
