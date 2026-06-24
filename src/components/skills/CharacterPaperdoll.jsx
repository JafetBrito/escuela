import { useGameStore, PLAYER_CLASSES, OLIVER_CLASSES } from '../../stores/useGameStore'
import { useLevelStore, levelForXp } from '../../stores/useLevelStore'
import { useEquipmentStore } from '../../stores/useEquipmentStore'
import { EQUIPMENT_SLOTS, SLOT_META, getEquipmentForSlot, getAvailableEquipment, getEquipmentById } from '../../data/equipmentRegistry'
import { StatBar5 } from './CharacterTree'
import AvatarViewport from '../mascot/AvatarViewport'
import MascotViewport from '../mascot/MascotViewport'

const GOLD = '#c8a24a'

// A single equip slot box — drop target for drag-and-drop from the bag strip
// below, and a click target to unequip. Mirrors the boxy gold-bordered slot
// icons of a classic MMO character pane.
function SlotBox({ owner, slot, classId, level, equippedId, equip }) {
  const meta = SLOT_META[slot]
  const options = getEquipmentForSlot(owner, classId, level, slot)
  const equippedItem = options.find((it) => it.id === equippedId) ?? getEquipmentById(equippedId)

  function onDrop(e) {
    e.preventDefault()
    const itemId = e.dataTransfer.getData('text/plain')
    const item = getEquipmentById(itemId)
    if (item && item.slot === slot && item.owner === owner && level >= item.requiredLevel) {
      equip(owner, slot, itemId)
    }
  }

  return (
    <button
      type="button"
      onClick={() => equippedItem && equip(owner, slot, null)}
      onDragOver={(e) => e.preventDefault()}
      onDrop={onDrop}
      title={equippedItem ? `${equippedItem.name} — clic para quitar` : `${meta.label} (vacío) — arrastra un objeto aquí`}
      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md text-xl transition-all"
      style={{
        background: equippedItem ? 'rgba(200,162,74,0.16)' : 'rgba(0,0,0,0.35)',
        border: `2px solid ${equippedItem ? GOLD : 'rgba(200,162,74,0.35)'}`,
        boxShadow: equippedItem ? `0 0 8px ${GOLD}55` : 'inset 0 0 6px rgba(0,0,0,0.5)',
      }}
    >
      {equippedItem ? equippedItem.icon : <span className="text-[9px] opacity-40">{meta.icon}</span>}
    </button>
  )
}

// Draggable bag item — drop it on a SlotBox above to equip.
function BagItem({ item, isEquipped }) {
  return (
    <div
      draggable
      onDragStart={(e) => e.dataTransfer.setData('text/plain', item.id)}
      title={`${item.name} — ${SLOT_META[item.slot].label}\n${item.description}\n⚔️ Poder ${item.stats.power} · 🏃 Velocidad ${item.stats.speed} (próximamente activos)\narrastra a su slot para equipar`}
      className="flex h-11 w-11 shrink-0 cursor-grab items-center justify-center rounded-md text-lg active:cursor-grabbing"
      style={{
        background: isEquipped ? 'rgba(200,162,74,0.18)' : 'rgba(255,255,255,0.05)',
        border: `1px solid ${isEquipped ? GOLD : 'rgba(255,255,255,0.12)'}`,
      }}
    >
      {item.icon}
    </div>
  )
}

// WoW-style character pane: equip slots flanking a 3D viewport, a stats
// panel, and a drag-to-equip bag strip — same for Avatar ('player') and
// Mascota ('oliver'), just with each owner's own (smaller) slot set.
export default function CharacterPaperdoll({ owner }) {
  const isPlayer = owner === 'player'
  const classId = useGameStore((s) => s[owner].class)
  const hp = useGameStore((s) => s[owner].hp)
  const energy = useGameStore((s) => (isPlayer ? s.player.energy : null))
  const xp = useLevelStore((s) => s.xp)
  const level = levelForXp(xp)
  const equipped = useEquipmentStore((s) => s.equipped[owner])
  const equip = useEquipmentStore((s) => s.equip)

  const clsDef = isPlayer ? PLAYER_CLASSES[classId] : OLIVER_CLASSES[classId]
  const slots = EQUIPMENT_SLOTS[owner].filter((s) => s !== 'weapon')
  const left = slots.filter((_, i) => i % 2 === 0)
  const right = slots.filter((_, i) => i % 2 === 1)
  const bagItems = classId ? getAvailableEquipment(owner, classId, level) : []
  const color = clsDef?.color ?? GOLD

  if (!classId) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-surface/40 p-10 text-center">
        <span className="text-5xl">{isPlayer ? '⚔️' : '🐾'}</span>
        <p className="font-bold text-text">{isPlayer ? 'Sin clase de personaje' : 'Sin clase de Oliver'}</p>
      </div>
    )
  }

  return (
    <div
      className="overflow-hidden rounded-2xl"
      style={{
        background: 'linear-gradient(160deg, #1a1610 0%, #2a2418 100%)',
        border: `1px solid ${GOLD}55`,
        boxShadow: `0 8px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.04)`,
      }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-3 px-4 py-2.5"
        style={{ background: 'linear-gradient(90deg, rgba(200,162,74,0.18), transparent)', borderBottom: `1px solid ${GOLD}33` }}
      >
        <span className="text-2xl">{clsDef.icon}</span>
        <div>
          <p className="text-sm font-black text-white">{clsDef.name}</p>
          <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: GOLD }}>Nivel {level}</p>
        </div>
      </div>

      {/* Slots — viewport — slots */}
      <div className="flex items-center justify-center gap-2 p-3">
        <div className="flex flex-col gap-2">
          {left.map((slot) => (
            <SlotBox key={slot} owner={owner} slot={slot} classId={classId} level={level} equippedId={equipped[slot]} equip={equip} />
          ))}
        </div>

        <div className="relative h-40 w-40 shrink-0 overflow-hidden rounded-xl" style={{ border: `1px solid ${GOLD}33`, background: 'radial-gradient(ellipse at 50% 90%, rgba(0,0,0,0.4), #07070f)' }}>
          {isPlayer ? <AvatarViewport className="h-full w-full" /> : <MascotViewport className="h-full w-full" />}
        </div>

        <div className="flex flex-col gap-2">
          {right.map((slot) => (
            <SlotBox key={slot} owner={owner} slot={slot} classId={classId} level={level} equippedId={equipped[slot]} equip={equip} />
          ))}
        </div>
      </div>

      {/* Weapon — prominent, centered */}
      <div className="flex items-center justify-center gap-2 pb-3">
        <SlotBox owner={owner} slot="weapon" classId={classId} level={level} equippedId={equipped.weapon} equip={equip} />
      </div>

      {/* Stats panel */}
      <div className="grid grid-cols-2 gap-2 border-t px-4 py-3" style={{ borderColor: `${GOLD}22` }}>
        <div className="flex items-center gap-2 rounded-lg px-2 py-1.5" style={{ background: 'rgba(0,0,0,0.3)' }}>
          <span className="text-xs">❤️</span>
          <span className="text-[10px] font-bold text-white/70">{hp.current}/{hp.max}</span>
        </div>
        {energy && (
          <div className="flex items-center gap-2 rounded-lg px-2 py-1.5" style={{ background: 'rgba(0,0,0,0.3)' }}>
            <span className="text-xs">⚡</span>
            <span className="text-[10px] font-bold text-white/70">{energy.current}/{energy.max}</span>
          </div>
        )}
        {Object.entries(clsDef.stats).map(([stat, val]) => (
          <div key={stat} className="col-span-2 flex items-center justify-between gap-2 rounded-lg px-2 py-1" style={{ background: 'rgba(0,0,0,0.2)' }}>
            <span className="text-[9px] font-bold uppercase tracking-wide text-white/40">{stat}</span>
            <StatBar5 val={val} color={color} />
          </div>
        ))}
      </div>

      {/* Every item already carries power/speed stats (see equipmentRegistry.js)
          — they just don't move the numbers above yet. Surfaced here so it's
          documented as a planned feature, not silently missing. */}
      <p className="px-4 pb-2 text-[9px] italic text-white/25">
        🔧 Próximamente: el poder y la velocidad de tu equipo modificarán estas estadísticas.
      </p>

      {/* Bag strip — drag onto a slot above to equip */}
      <div className="border-t px-4 py-3" style={{ borderColor: `${GOLD}22`, background: 'rgba(0,0,0,0.2)' }}>
        <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-white/40">🎒 Bolsas — arrastra para equipar</p>
        {bagItems.length === 0 ? (
          <p className="text-[10px] text-white/30">Sin objetos disponibles todavía.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {bagItems.map((item) => (
              <BagItem key={item.id} item={item} isEquipped={equipped[item.slot] === item.id} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
