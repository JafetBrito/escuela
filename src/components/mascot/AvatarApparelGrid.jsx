import { PLAYER_AVATARS } from '../../stores/useGameStore'

// Pure visual skin/look selection for the avatar. No class badges here —
// shared by MascotHomePage and the floating mascot menu (MascotCompanion).
export default function AvatarApparelGrid({ avatarId, onSelect }) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="text-xs font-black uppercase tracking-widest text-text-muted">Aspecto visual</p>
        <p className="mt-1 text-xs text-text-muted">
          Elige la apariencia de tu avatar en el mundo VR. Solo cambia lo visual, nunca tu clase.
        </p>
      </div>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
        {PLAYER_AVATARS.map((av) => {
          const isActive = av.id === avatarId
          return (
            <button
              key={av.id}
              type="button"
              onClick={() => onSelect(av.id)}
              className="group relative flex flex-col items-center gap-2 rounded-2xl border p-3 transition-all duration-200 hover:scale-105 hover:-translate-y-1 active:scale-95"
              style={{
                borderColor: isActive ? av.color : 'var(--color-border)',
                background: isActive
                  ? `linear-gradient(145deg, ${av.color}28, ${av.color}10)`
                  : 'var(--color-surface)',
                boxShadow: isActive
                  ? `0 0 20px ${av.color}44, 0 6px 16px ${av.color}22, inset 0 1px 0 rgba(255,255,255,0.08)`
                  : 'none',
              }}
            >
              <span
                className="flex h-12 w-12 items-center justify-center rounded-xl text-2xl transition-transform duration-200 group-hover:scale-110"
                style={{
                  background: isActive ? `${av.color}33` : `${av.color}14`,
                  border: `1px solid ${av.color}${isActive ? '66' : '33'}`,
                }}
              >
                {av.icon}
              </span>
              <span
                className="text-[10px] font-black"
                style={{ color: isActive ? av.color : 'var(--color-text-muted)' }}
              >
                {av.label}
              </span>
              {isActive && (
                <span
                  className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full text-[8px] font-black text-white"
                  style={{ background: av.color }}
                >✓</span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
