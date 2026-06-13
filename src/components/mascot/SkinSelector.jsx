import { SKINS } from '../../data/skinsRegistry'
import { useMascotStore } from '../../stores/useMascotStore'
import { getMascotById } from '../../data/mascotRegistry'

export default function SkinSelector() {
  const selectedSkinId = useMascotStore((s) => s.selectedSkinId)
  const selectSkin = useMascotStore((s) => s.selectSkin)
  const selectedMascotId = useMascotStore((s) => s.selectedMascotId)
  const mascot = getMascotById(selectedMascotId)

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {SKINS.map((skin) => {
        const active = selectedSkinId === skin.id
        const swatchColor = skin.color ?? mascot.color
        return (
          <button
            key={skin.id}
            onClick={() => selectSkin(skin.id)}
            className={`flex flex-col items-center gap-2 rounded-xl border p-3 transition-colors ${
              active
                ? 'border-primary bg-primary/10'
                : 'border-border bg-background hover:border-primary/40'
            }`}
          >
            <div className="relative flex h-12 w-12 items-center justify-center rounded-full" style={{ backgroundColor: swatchColor }}>
              {skin.accessory && <span className="absolute -top-2 text-lg">{skin.accessory}</span>}
            </div>
            <span className={`text-xs font-semibold ${active ? 'text-primary' : 'text-text-muted'}`}>
              {skin.name}
            </span>
          </button>
        )
      })}
    </div>
  )
}
