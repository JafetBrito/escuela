import { create } from 'zustand'
import { getMobType } from '../data/mobRegistry'
import { armorReduction, meleeMissChance, critChance, mobXpValue } from '../data/combatFormulas'
import { useCurrencyStore } from './useCurrencyStore'
import { useCollectionStore } from './useCollectionStore'
import { useLevelStore } from './useLevelStore'

// Combat v1 — monstruos instanciados por jugador (cada quien ve/pelea los
// suyos, sin sincronizar por Supabase: decisión tomada con el usuario para
// evitar la complejidad de resolver "quién se queda con el loot" en un mundo
// compartido). El cliente resuelve el combate localmente; solo el resultado
// (monedas, objeto de colección) se persiste, vía los stores que ya existen.
export const ATTACK_RANGE = 2.5
const RESPAWN_MS = 8000
const ATTACK_COOLDOWN_MS = 500
const PROJECTILE_MS = 350
const LOOT_TOAST_MS = 4000

// Cerca del spawn de la Gran Aula ([0,0,-53]) y dentro del campo abierto donde
// ya viven los NPCs de misión (x entre -15/15, z entre -53/-34) — las
// coordenadas anteriores (x≈22-26) quedaban fuera del área jugable/visible,
// que era por lo que no se veían los monstruos.
const SPAWN_POINTS = [
  [6, 0, -48],
  [10, 0, -44],
  [4, 0, -40],
]

let nextMobN = SPAWN_POINTS.length
let nextEffectId = 0
let nextLootToastId = 0

function spawnMob(id, typeId, position) {
  const type = getMobType(typeId)
  return { id, typeId, position, hp: type.maxHp, maxHp: type.maxHp, alive: true, deadAt: null }
}

export const useMobStore = create((set, get) => ({
  mobs: SPAWN_POINTS.map((position, i) => spawnMob(`mob-${i}`, 'bug-de-codigo', position)),
  // Efectos visuales transitorios (proyectiles de habilidades a distancia).
  // Cada uno se autoelimina pasado PROJECTILE_MS — ver Projectile en MobField.jsx.
  effects: [],
  // Botín destacado de la última muerte — un aviso grande en el centro de la
  // pantalla (LootToast.jsx), no solo una línea perdida en el chat del mundo,
  // que era muy fácil de no ver.
  lootToasts: [],
  lastAttackAt: 0,

  pushLootToast: (toast) => {
    const id = nextLootToastId++
    set((state) => ({ lootToasts: [...state.lootToasts, { ...toast, id }] }))
    setTimeout(() => set((state) => ({ lootToasts: state.lootToasts.filter((t) => t.id !== id) })), LOOT_TOAST_MS)
  },

  // Coloca un monstruo nuevo (usado por el comando /npcadd del admin).
  spawnAt: (typeId, position) => {
    const id = `mob-gm-${nextMobN++}`
    set((state) => ({ mobs: [...state.mobs, spawnMob(id, typeId, position)] }))
    return id
  },

  fireEffect: (effect) => {
    const id = nextEffectId++
    set((state) => ({ effects: [...state.effects, { ...effect, id }] }))
    setTimeout(() => set((state) => ({ effects: state.effects.filter((e) => e.id !== id) })), PROJECTILE_MS)
  },

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

  // Golpea al monstruo vivo más cercano dentro de rango — usando las fórmulas
  // REALES portadas de world-of-claudecraft (combatFormulas.js): puede FALLAR
  // (meleeMissChance), puede ser CRÍTICO (critChance, x2 daño), y el daño final
  // se reduce por la armadura del monstruo con su fórmula real de mitigación
  // (armorReduction). Al matar, la XP también sale de su fórmula real
  // (mobXpValue) — antes esto solo daba monedas, nunca experiencia.
  //
  // Devuelve { ok:false, reason:'cooldown'|'no-target' } si no golpeó a nada —
  // el llamador (VRPage's handleUseSkill/onAttack) usa `reason` para avisarle
  // al jugador por qué no pasó nada, en vez de fallar en silencio (era el bug:
  // fuera de rango no hacía NADA, ni un mensaje). `range` por defecto es el de
  // golpe cuerpo a cuerpo — los hechizos a distancia pasan uno mayor (ver
  // VRPage.jsx). `vfx` (opcional) dispara un efecto visual: { color, ranged } —
  // si `ranged` es true, se ve un proyectil viajar del jugador al monstruo.
  attackNearest: (playerPos, playerLevel, baseDamage, baseCrit, vfx, range = ATTACK_RANGE) => {
    const now = Date.now()
    if (now - get().lastAttackAt < ATTACK_COOLDOWN_MS) return { ok: false, reason: 'cooldown' }

    const { mobs } = get()
    let closest = null
    let closestDist = range
    for (const m of mobs) {
      if (!m.alive) continue
      const dx = m.position[0] - playerPos.x
      const dz = m.position[2] - playerPos.z
      const dist = Math.hypot(dx, dz)
      if (dist <= closestDist) { closest = m; closestDist = dist }
    }
    if (!closest) return { ok: false, reason: 'no-target' }

    set({ lastAttackAt: now })
    const type = getMobType(closest.typeId)

    // 1) ¿Falla el golpe? (meleeMissChance real: sube mucho contra algo de
    // nivel más alto que tú, casi nunca falla contra algo muy por debajo).
    if (Math.random() < meleeMissChance(playerLevel, type.level)) {
      return { ok: true, killed: false, missed: true, mobName: type.name }
    }

    // 2) ¿Crítico? (critChance real: se reduce contra algo de nivel más alto).
    const crit = Math.random() < critChance(baseCrit, playerLevel, type.level)
    let dmg = crit ? baseDamage * 2 : baseDamage

    // 3) Mitigación por armadura del monstruo (fórmula real de WoW clásico).
    dmg = Math.max(1, Math.round(dmg * (1 - armorReduction(type.armor, playerLevel))))

    if (vfx) {
      get().fireEffect({
        color: vfx.color,
        ranged: !!vfx.ranged,
        from: [playerPos.x, 1, playerPos.z],
        to: [closest.position[0], 1, closest.position[2]],
      })
    }

    const newHp = Math.max(0, closest.hp - dmg)
    const killed = newHp <= 0

    set((state) => ({
      mobs: state.mobs.map((m) =>
        m.id === closest.id
          ? (killed ? { ...m, hp: 0, alive: false, deadAt: now } : { ...m, hp: newHp })
          : m,
      ),
    }))

    if (!killed) return { ok: true, killed: false, mobName: type.name, damage: dmg, crit, hp: newHp, maxHp: type.maxHp }

    const xp = mobXpValue(type.level, playerLevel)
    if (xp > 0) useLevelStore.getState().addXp(xp)

    // Tabla de loot real: cada entrada se tira INDEPENDIENTE (no "una sola
    // cosa al azar") — así una moneda garantizada y un objeto raro pueden caer
    // los dos en la misma muerte, o ninguno de los dos si la suerte no ayuda.
    let coins = 0
    let item = null
    for (const entry of type.loot) {
      if (Math.random() >= entry.chance) continue
      if (entry.type === 'coins') {
        coins += entry.min + Math.floor(Math.random() * (entry.max - entry.min + 1))
      } else if (entry.type === 'item') {
        item = entry.item
      }
    }
    if (coins > 0) useCurrencyStore.getState().earnCoins(coins)
    if (item) useCollectionStore.getState().addItem(item)
    get().pushLootToast({ mobName: type.name, mobIcon: type.icon, xp, coins, item })

    return { ok: true, killed: true, mobName: type.name, damage: dmg, crit, xp, coins, item }
  },
}))
