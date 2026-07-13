import { create } from 'zustand'
import { getMobType } from '../data/mobRegistry'
import { useCurrencyStore } from './useCurrencyStore'
import { useCollectionStore } from './useCollectionStore'

// Combat v1 — monstruos instanciados por jugador (cada quien ve/pelea los
// suyos, sin sincronizar por Supabase: decisión tomada con el usuario para
// evitar la complejidad de resolver "quién se queda con el loot" en un mundo
// compartido). El cliente resuelve el combate localmente; solo el resultado
// (monedas, objeto de colección) se persiste, vía los stores que ya existen.
export const ATTACK_RANGE = 2.5
const RESPAWN_MS = 8000
const ATTACK_COOLDOWN_MS = 600

const SPAWN_POINTS = [
  [22, 0, -32],
  [26, 0, -26],
  [20, 0, -22],
]

function spawnMob(id, typeId, position) {
  const type = getMobType(typeId)
  return { id, typeId, position, hp: type.maxHp, maxHp: type.maxHp, alive: true, deadAt: null }
}

export const useMobStore = create((set, get) => ({
  mobs: SPAWN_POINTS.map((position, i) => spawnMob(`mob-${i}`, 'bug-de-codigo', position)),
  lastAttackAt: 0,

  // Llamado cada frame (o con cierta frecuencia) para revivir monstruos
  // muertos tras RESPAWN_MS, así el mismo spot sirve para practicar de nuevo.
  respawnCheck: () => {
    const now = Date.now()
    const { mobs } = get()
    if (!mobs.some((m) => !m.alive && now - m.deadAt > RESPAWN_MS)) return
    set((state) => ({
      mobs: state.mobs.map((m) =>
        !m.alive && now - m.deadAt > RESPAWN_MS ? spawnMob(m.id, m.typeId, m.position) : m,
      ),
    }))
  },

  // Golpea al monstruo vivo más cercano dentro de rango. Devuelve null si no
  // había ninguno a distancia o si el ataque está en cooldown.
  attackNearest: (playerPos, damage) => {
    const now = Date.now()
    if (now - get().lastAttackAt < ATTACK_COOLDOWN_MS) return null

    const { mobs } = get()
    let closest = null
    let closestDist = ATTACK_RANGE
    for (const m of mobs) {
      if (!m.alive) continue
      const dx = m.position[0] - playerPos.x
      const dz = m.position[2] - playerPos.z
      const dist = Math.hypot(dx, dz)
      if (dist <= closestDist) { closest = m; closestDist = dist }
    }
    if (!closest) return null

    set({ lastAttackAt: now })
    const type = getMobType(closest.typeId)
    const newHp = Math.max(0, closest.hp - damage)
    const killed = newHp <= 0

    set((state) => ({
      mobs: state.mobs.map((m) =>
        m.id === closest.id
          ? (killed ? { ...m, hp: 0, alive: false, deadAt: now } : { ...m, hp: newHp })
          : m,
      ),
    }))

    if (!killed) return { killed: false, mobName: type.name, damage, hp: newHp, maxHp: type.maxHp }

    const coins = type.lootCoinsMin + Math.floor(Math.random() * (type.lootCoinsMax - type.lootCoinsMin + 1))
    useCurrencyStore.getState().earnCoins(coins)
    let item = null
    if (Math.random() < type.lootItemChance) {
      item = type.lootItem
      useCollectionStore.getState().addItem(item)
    }
    return { killed: true, mobName: type.name, damage, coins, item }
  },
}))
