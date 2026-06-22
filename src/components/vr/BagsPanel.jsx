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

  const items = getAvailableEquipment(owner, classId, level)

  if (!classId) {
    return <p className="py-6 text-center text-xs text-text-muted">Selecciona una clase para desbloquear objetos.</p>
  }
  if (items.length === 0) {
    return <p className="py-6 text-center text-xs text-text-muted">Sin objetos disponibles todavía.</p>
  }

  return (
    <div className="grid grid-cols-6 gap-2">
      {items.map((it) => {
        const isEquipped = equipped[it.slot] === it.id
        return (
          <button
            key={it.id}
            type="button"
            onClick={() => equip(owner, it.slot, isEquipped ? null : it.id)}
            title={`${it.name} — ${SLOT_META[it.slot].label}\n${it.description}`}
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

// Floating overlay version for the VR HUD's 🎒 button — same grid, own
// Avatar/Mascota toggle since there's no outer entity tab to drive it there.
export default function BagsPanel({ onClose }) {
  const [tab, setTab] = useState('avatar')
  const owner = tab === 'avatar' ? 'player' : 'oliver'

  return (
    <div
      className="absolute inset-0 z-40 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden"
        style={{
          background: 'linear-gradient(160deg, #1a1408 0%, #2a1a08 100%)',
          border: '1px solid rgba(251,191,36,0.2)',
          boxShadow: '0 0 40px rgba(251,191,36,0.15)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="flex items-center justify-between px-5 py-3"
          style={{ background: 'linear-gradient(90deg, rgba(251,191,36,0.18), rgba(124,58,237,0.12))', borderBottom: '1px solid rgba(255,255,255,0.07)' }}
        >
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎒</span>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-white/40">Oliver Academy</p>
              <p className="text-base font-black text-white">Bolsas</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="flex h-7 w-7 items-center justify-center rounded-full text-white/40 hover:bg-white/10 hover:text-white" aria-label="Cerrar">
            ✕
          </button>
        </div>

        <div className="flex gap-1 p-3 pb-0">
          {OWNER_TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-bold transition-all"
              style={tab === t.id
                ? { background: 'rgba(251,191,36,0.25)', color: '#fbbf24' }
                : { color: 'rgba(255,255,255,0.4)' }}
            >
              <span>{t.icon}</span>
              <span>{t.label}</span>
            </button>
          ))}
        </div>

        <div className="p-4" style={{ colorScheme: 'dark' }}>
          <EquipmentBagGrid owner={owner} />
          <p className="mt-3 text-center text-[10px] text-white/25">Toca un objeto para equiparlo o quitarlo.</p>
        </div>
      </div>
    </div>
  )
}
