import { useVrCharacterStore } from '../../stores/useVrCharacterStore'

// Overlay para cambiar entre Avatar ↔ Mascota y alternar seguir/quieto.
// Componente ÚNICO compartido por el MUNDO VR (VRPage) y el Templo tutorial
// (VrArbol) — mismo sistema en todos lados. Solo necesita `playerPositionRef`
// (para fijar la posición al dejar quieto a un personaje) y `hudVisible`.
export default function CharSwitcherHud({ playerPositionRef, hudVisible }) {
  const activeChar = useVrCharacterStore((s) => s.activeChar)
  const companionFollows = useVrCharacterStore((s) => s.companionFollows)
  const toggleChar = useVrCharacterStore((s) => s.toggleChar)
  const setCompanionFollows = useVrCharacterStore((s) => s.setCompanionFollows)
  const setParkedPosition = useVrCharacterStore((s) => s.setParkedPosition)

  if (!hudVisible) return null

  const handleSwitch = () => {
    // Al estar quieto, esto también intercambia cuál personaje se queda atrás y
    // teletransporta al que estás cambiando — ver toggleChar.
    toggleChar(playerPositionRef?.current)
  }

  const inactiveChar = activeChar === 'avatar' ? 'mascot' : 'avatar'

  const handleFollowToggle = () => {
    if (companionFollows) {
      setParkedPosition(inactiveChar, playerPositionRef?.current ?? null)
    } else {
      setParkedPosition(inactiveChar, null)
    }
    setCompanionFollows(!companionFollows)
  }

  const charLabel = activeChar === 'avatar' ? '🧑 Avatar' : '🐾 Mascota'
  const companionLabel = activeChar === 'avatar' ? 'Mascota' : 'Avatar'

  return (
    <div className="pointer-events-none absolute bottom-3 left-1/2 z-20 -translate-x-1/2">
      <div className="pointer-events-auto flex items-center gap-2 rounded-full bg-black/65 px-3 py-1.5 shadow-lg backdrop-blur">
        <span className="text-xs font-bold text-white/80">{charLabel}</span>
        <button
          type="button"
          onClick={handleSwitch}
          title="Cambiar personaje (⇄)"
          className="rounded-full bg-white/15 px-2.5 py-0.5 text-sm text-white transition-colors hover:bg-white/30 active:scale-95"
        >
          ⇄
        </button>
        <button
          type="button"
          onClick={handleFollowToggle}
          title={companionFollows ? `${companionLabel} te sigue — clic para dejar quieto` : `${companionLabel} quieto — clic para seguir`}
          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold text-white transition-colors active:scale-95 ${
            companionFollows ? 'bg-emerald-600/50 hover:bg-emerald-600/70' : 'bg-amber-600/50 hover:bg-amber-600/70'
          }`}
        >
          {companionFollows ? `${companionLabel} sigue 🐾` : `${companionLabel} quieto 📌`}
        </button>
      </div>
    </div>
  )
}
