// WoW-style economy: amounts are stored as a single integer in "cobre"
// (copper, the smallest unit). 100 cobre = 1 plata, 100 plata = 1 oro.
const COPPER_PER_SILVER = 100
const SILVER_PER_GOLD = 100
const COPPER_PER_GOLD = COPPER_PER_SILVER * SILVER_PER_GOLD

export function splitCurrency(copper = 0) {
  const total = Math.max(0, Math.floor(copper))
  const gold = Math.floor(total / COPPER_PER_GOLD)
  const silver = Math.floor((total % COPPER_PER_GOLD) / COPPER_PER_SILVER)
  const bronze = total % COPPER_PER_SILVER
  return { gold, silver, bronze }
}

export function formatCurrency(copper = 0) {
  const { gold, silver, bronze } = splitCurrency(copper)
  const parts = []
  if (gold > 0) parts.push(`${gold}🥇`)
  if (silver > 0 || gold > 0) parts.push(`${silver}🥈`)
  parts.push(`${bronze}🥉`)
  return parts.join(' ')
}
