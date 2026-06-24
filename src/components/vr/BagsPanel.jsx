import { useState } from 'react'
import { useGameStore } from '../../stores/useGameStore'
import { useLevelStore, levelForXp } from '../../stores/useLevelStore'
import { useEquipmentStore } from '../../stores/useEquipmentStore'
import { getAvailableEquipment, SLOT_META } from '../../data/equipmentRegistry'

const OWNER_TABS = [
  { id: 'avatar', label: 'Avatar', icon: '⚔️', owner: 'player' },
  { id: 'mascota', label: 'Mascota', icon: '🐾', owner: 'oliver' },
]

// WoW-style bag grid — every item your class/level has unlocked, click to
// equip/unequip. Shared by the VR HUD's floating BagsPanel (below) and the
// "Bolsas" sub-tab inside the mascot menu (MascotCompanion.jsx) — same
// registry/store, so equipping from either place stays in sync.
export function EquipmentBagGrid({ owner }) {
  const classId = useGameStore((s) => s[owner].class)
  const level = useLevelStore((s) => levelForXp(s.xp))
  const equipped = useEquipmentStore((s) => s.equipped[owner])
  const equip = useEquipmentStore((s) => s.equip)

  // No blanket "select a class first" block here — starter gear (no
  // requiredClass) must still show up before the player has picked one;
  // getAvailableEquipment already filters out anything that DOES need a
  // class the player doesn't have.
  const items = getAvailableEquipment(owner, classId, level)

  if (items.length === 0) {
    return <p className="py-6 text-center text-xs text-text-muted">Sin objetos disponibles todavía.</p>
  }

  return (
    <div className="grid grid-cols-5 gap-2">
      {items.map((it) => {
        const isEquipped = equipped[it.slot] === it.id
        return (
          <button
            key={it.id}
            type="button"
            onClick={() => equip(owner, it.slot, isEquipped ? null : it.id)}
            title={`${it.name} — ${SLOT_META[it.slot].label}\n${it.description}\n⚔️ Poder ${it.stats.power} · 🏃 Velocidad ${it.stats.speed} (próximamente activos)`}
            className="flex aspect-square items-center justify-center rounded-lg border text-xl transition-all"
            style={{
              borderColor: isEquipped ? '#fbbf24' : 'var(--color-border)',
              background: isEquipped ? 'rgba(251,191,36,0.18)' : 'var(--color-surface)',
            }}
          >
            {it.icon}
          </button>
        )
      })}
    </div>
  )
}

// Small floating bag — opened from the VR HUD's 🎒 button. WoW-style: just a
// compact grid of item squares next to the world, not a full-screen modal —
// the rest of the HUD/world stays visible and usable while it's open. Equip
// here, then check the result in the Personaje tab of the Avatar/Mascota
// menu (MascotCompanion.jsx) or the HUD portrait card.
export default function BagsPanel({ onClose }) {
  const [tab, setTab] = useState('avatar')
  const owner = tab === 'avatar' ? 'player' : 'oliver'

  return (
    <div
      className="absolute right-2 top-16 z-30 w-64 overflow-hidden rounded-2xl shadow-2xl md:right-4 md:top-14"
      style={{
        background: 'linear-gradient(160deg, #1a1408 0%, #2a1a08 100%)',
        border: '1px solid rgba(251,191,36,0.2)',
        boxShadow: '0 0 40px rgba(251,191,36,0.15)',
      }}
    >
      <div
        className="flex items-center justify-between px-4 py-2.5"
        style={{ background: 'linear-gradient(90deg, rgba(251,191,36,0.18), rgba(124,58,237,0.12))', borderBottom: '1px solid rgba(255,255,255,0.07)' }}
      >
        <div className="flex items-center gap-2">
          <span className="text-xl">🎒</span>
          <p className="text-sm font-black text-white">Bolsas</p>
        </div>
        <button type="button" onClick={onClose} className="flex h-6 w-6 items-center justify-center rounded-full text-white/40 hover:bg-white/10 hover:text-white" aria-label="Cerrar">
          ✕
        </button>
      </div>

      <div className="flex gap-1 p-2.5 pb-0">
        {OWNER_TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl py-1.5 text-xs font-bold transition-all"
            style={tab === t.id
              ? { background: 'rgba(251,191,36,0.25)', color: '#fbbf24' }
              : { color: 'rgba(255,255,255,0.4)' }}
          >
            <span>{t.icon}</span>
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      <div className="p-3" style={{ colorScheme: 'dark' }}>
        <EquipmentBagGrid owner={owner} />
        <p className="mt-2 text-center text-[10px] text-white/25">Toca un objeto para equiparlo o quitarlo.</p>
        <p className="mt-1 text-center text-[9px] italic text-white/20">🔧 Próximamente: poder/velocidad afectarán tus estadísticas.</p>
      </div>
    </div>
  )
}
