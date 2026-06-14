import MascotSelector from './MascotSelector'
import SkinSelector from './SkinSelector'
import { useSettingsStore } from '../../stores/useSettingsStore'
import { useMascotStore } from '../../stores/useMascotStore'
import { getMascotById } from '../../data/mascotRegistry'

export default function AppearancePanel() {
  const settingsMascotName = useSettingsStore((s) => s.mascotName)
  const selectedMascotId = useMascotStore((s) => s.selectedMascotId)
  const mascot = getMascotById(selectedMascotId)
  const displayName = settingsMascotName || mascot.name

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-text-muted">
          Modelo de tu mascota
        </p>
        <p className="mt-1 text-sm text-text-muted">Elige el personaje 3D que te acompañará.</p>
        <div className="mt-3">
          <MascotSelector />
        </div>
      </div>

      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-text-muted">
          Aspecto de tu mascota
        </p>
        <p className="mt-1 text-sm text-text-muted">
          Elige un atuendo para {displayName}. Esto solo cambia su apariencia, no su modelo.
        </p>
        <div className="mt-3">
          <SkinSelector />
        </div>
      </div>
    </div>
  )
}
