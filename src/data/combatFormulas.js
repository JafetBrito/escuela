// Combat formulas ported (not reinvented) from world-of-claudecraft's
// src/sim/types.ts — the real classic-WoW-style math their deterministic sim
// uses for armor mitigation, hit/miss/crit, and mob XP. We don't have their
// full stat sheet (weapon min/max, attack power, a dedicated crit stat), so
// each class's `stats.power` (already in useGameStore.js) stands in for
// attack power — but the FORMULAS themselves (not just numbers we invented)
// are theirs, verbatim where our simpler model has an equivalent input.

// Real classic WoW armor mitigation curve — src/sim/types.ts armorReduction.
export function armorReduction(armor, attackerLevel) {
  const a = Math.max(0, armor)
  return Math.min(0.75, a / (a + 85 * attackerLevel + 400))
}

// Per-swing miss chance by level difference — src/sim/types.ts meleeMissChance
// + its ABOVE_LEVEL_MISS_PCT table (attacking something above your level gets
// steeply harder to land: +1 lvl ~7.5% miss, +4 lvl ~85% miss).
const ABOVE_LEVEL_MISS_PCT = [0, 2.5, 14, 39, 80]
function aboveLevelMissPct(diff) {
  if (diff <= 0) return 0
  return diff < ABOVE_LEVEL_MISS_PCT.length ? ABOVE_LEVEL_MISS_PCT[diff] : 100
}
export function meleeMissChance(attackerLevel, targetLevel) {
  const diff = targetLevel - attackerLevel
  const miss = diff > 0 ? 5 + aboveLevelMissPct(diff) : 5 + diff * 0.2
  return Math.min(0.95, Math.max(0.005, miss / 100))
}

// Crit chance falls off against a higher-level target — src/sim/combat/auto_attack.ts
// meleeSwing (`attacker.critChance - max(0, target.level - attacker.level) * 0.002`).
// `baseCritChance` here stands in for their real `critChance` character stat.
export function critChance(baseCritChance, attackerLevel, targetLevel) {
  return Math.max(0.005, baseCritChance - Math.max(0, targetLevel - attackerLevel) * 0.002)
}

// Real vanilla mob XP curve — src/sim/types.ts mobXpValue + zeroDiff (a mob far
// enough below your level grants zero, "grey" in classic terms).
function zeroDiff(playerLevel) {
  if (playerLevel <= 7) return 5
  if (playerLevel <= 9) return 6
  if (playerLevel <= 15) return 7
  return 8
}
export function mobXpValue(mobLevel, playerLevel) {
  const base = 45 + 5 * mobLevel
  const diff = mobLevel - playerLevel
  if (diff >= 0) return Math.round(base * (1 + 0.05 * Math.min(diff, 4)))
  const zd = zeroDiff(playerLevel)
  if (-diff >= zd) return 0
  return Math.round(base * (1 - -diff / zd))
}
