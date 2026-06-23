import CharacterPaperdoll from '../skills/CharacterPaperdoll'

// Floating overlay for the Avatar's character pane, opened by clicking the
// class/HP portrait card in the VR HUD (see VrHud.jsx's PortraitHud).
export default function CharacterPanel({ onClose }) {
  return (
    <div
      className="absolute inset-0 z-40 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div className="relative w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          onClick={onClose}
          className="absolute -right-2 -top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full border border-white/20 bg-black/70 text-white/60 hover:text-white"
          aria-label="Cerrar"
        >
          ✕
        </button>
        <CharacterPaperdoll owner="player" />
      </div>
    </div>
  )
}
