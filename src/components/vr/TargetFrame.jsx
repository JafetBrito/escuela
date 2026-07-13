import { useTargetStore } from '../../stores/useTargetStore'
import { useMobStore } from '../../stores/useMobStore'
import { useVrPresenceStore } from '../../stores/useVrPresenceStore'
import { getMobType } from '../../data/mobRegistry'
import { getVrNpcById, OLIVER_NPC, EINSTEIN_NPC, JAFET_NPC } from '../../data/vrNpcRegistry'

const IDLE_NPCS = { [OLIVER_NPC.id]: OLIVER_NPC, [EINSTEIN_NPC.id]: EINSTEIN_NPC, [JAFET_NPC.id]: JAFET_NPC }

function ThinBar({ pct, color }) {
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-black/40">
      <div className="h-full rounded-full transition-all" style={{ width: `${pct * 100}%`, background: color }} />
    </div>
  )
}

// Marco de objetivo estilo WoW: clic en un NPC o monstruo lo "targetea" (ver
// useTargetStore + los onClick agregados en IdleNpc/VrNpc/MobMesh) y aquí se
// muestra su nombre + vida en vivo, justo debajo del retrato del jugador.
export default function TargetFrame() {
  const target = useTargetStore((s) => s.target)
  const clearTarget = useTargetStore((s) => s.clearTarget)
  const mobs = useMobStore((s) => s.mobs)
  const players = useVrPresenceStore((s) => s.players)

  if (!target) return null

  let name, icon, color, hp, maxHp, alive = true, subtitle
  if (target.kind === 'mob') {
    const mob = mobs.find((m) => m.id === target.id)
    if (!mob) { clearTarget(); return null }
    const type = getMobType(mob.typeId)
    name = type.name; icon = type.icon; color = type.color
    hp = mob.hp; maxHp = mob.maxHp; alive = mob.alive
    subtitle = `Nv. ${type.level}`
  } else if (target.kind === 'player') {
    const player = players[target.id]
    if (!player) { clearTarget(); return null }
    name = player.name || 'Viajero'; icon = '🧑‍🚀'; color = '#38bdf8'
    subtitle = 'Jugador'
  } else {
    const npc = IDLE_NPCS[target.id] ?? getVrNpcById(target.id)
    if (!npc) { clearTarget(); return null }
    name = npc.name; icon = npc.emoji ?? '🧑'; color = '#94a3b8'
    subtitle = 'NPC'
  }

  return (
    <div
      className="relative mt-1.5 flex flex-col gap-1 rounded-xl px-3 py-2 text-left"
      style={{
        background: 'linear-gradient(135deg, rgba(0,0,0,0.72), rgba(0,0,0,0.45))',
        backdropFilter: 'blur(10px)',
        border: `1px solid ${color}44`,
        boxShadow: `0 0 18px ${color}18`,
        minWidth: 170,
      }}
    >
      <button
        type="button"
        onClick={clearTarget}
        className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full border border-white/20 bg-black/70 text-[10px] text-white/70 hover:text-white"
        title="Quitar objetivo"
      >
        ✕
      </button>
      <div className="flex items-center gap-2">
        <div
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-base"
          style={{ background: `${color}22`, border: `2px solid ${color}`, boxShadow: `0 0 8px ${color}44` }}
        >
          {icon}
        </div>
        <div className="flex min-w-0 flex-col">
          <span className="truncate font-black text-white" style={{ fontSize: 11 }}>{name}</span>
          <span className="font-bold" style={{ fontSize: 9, color: `${color}` }}>
            {alive ? subtitle : 'Derrotado'}
          </span>
        </div>
      </div>
      {target.kind === 'mob' && <ThinBar pct={alive ? hp / maxHp : 0} color={alive ? '#ef4444' : '#4b5563'} />}
    </div>
  )
}
