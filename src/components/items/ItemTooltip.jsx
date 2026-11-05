import { tr } from '../../i18n'
import { PLAYER_CLASSES } from '../../stores/useGameStore'
import { qualityOf, itemName, itemDescription, itemLevelOf, priceParts, CONTEXTS, SOURCE_TYPES, SLOT_LABEL, SUBCLASS_LABEL, BONDING_LABEL, STAT_LABEL, RESIST_LABEL, TRIGGER_LABEL } from '../../data/itemDb'

// Tooltip de objeto con la ESTRUCTURA de un MMO clásico (filas en este orden): nombre en el color de su calidad →
// nivel de objeto → ligadura → único → ranura | tipo → daño | velocidad → (DPS) → estadísticas → resistencias →
// durabilidad → requisitos → líneas verdes de efecto (Uso / Equipar / Probabilidad al golpear) → texto de ambientación
// → precio de venta (y de compra). Cada fila solo aparece si el objeto tiene ese dato, así que un consumible muestra
// pocas y un arma muestra todas. Sirve igual en la tienda, el inventario, el hub y la base de datos (`compact` quita el pie técnico).
const COIN = { g: ['#ffe27a', '#b8860b'], s: ['#f2f4f7', '#8d97a3'], c: ['#f0a867', '#8a4b1e'] }
const Coin = ({ k }) => <span className="ml-0.5 mr-1 inline-block h-2.5 w-2.5 rounded-full align-middle" style={{ background: `radial-gradient(circle at 35% 30%, ${COIN[k][0]}, ${COIN[k][1]})` }} />

export function Money({ cobre }) {
  const { gold, silver, copper } = priceParts(cobre || 0)
  if (!cobre) return <span className="opacity-60">{tr('Gratis', 'Free')}</span>
  return (
    <span className="whitespace-nowrap">
      {gold > 0 && <><b style={{ color: '#ffd24a' }}>{gold}</b><Coin k="g" /></>}
      {silver > 0 && <><b style={{ color: '#d0d6dc' }}>{silver}</b><Coin k="s" /></>}
      {copper > 0 && <><b style={{ color: '#d68a4a' }}>{copper}</b><Coin k="c" /></>}
    </span>
  )
}

const L = (pair, fallback) => (pair ? tr(...pair) : fallback)
const effectLine = (e) => {
  const pre = (t) => L(TRIGGER_LABEL[t], t)
  if (e.text) return `${pre(e.trigger || 'use')} ${tr(e.text, e.en || e.text)}`
  if (e.type === 'pet_need') return `${pre('use')} ${tr('restaura', 'restores')} ${Object.entries(e).filter(([k]) => k !== 'type').map(([k, v]) => `${k} +${v}`).join(', ')}`
  if (e.type === 'unlock_mascot') return `${pre('use')} ${tr('desbloquea esta mascota 3D', 'unlocks this 3D mascot')}`
  if (e.type === 'toggle_tool') return `${pre('use')} ${tr('activa / desactiva la herramienta', 'toggles the tool')}`
  if (e.type === 'ai_prompt') return `${pre('use')} ${tr('cambia la personalidad de tu mascota IA', 'changes your AI mascot personality')}`
  if (e.type === 'equip') return null // ya lo dice la fila de ranura
  return e.type
}
const Row = ({ left, right }) => <div className="flex justify-between gap-4"><span>{left}</span>{right != null && <span>{right}</span>}</div>

export default function ItemTooltip({ item, className = '', header = '', compact = false }) {
  if (!item) return null
  const q = qualityOf(item), d = item.damage, dps = d && d.speed > 0 ? ((d.min + d.max) / 2 / d.speed).toFixed(1) : null
  const stats = Object.entries(item.stats || {}).filter(([, v]) => v), resist = Object.entries(item.resist || {}).filter(([, v]) => v)
  const effects = (item.effects || []).map(effectLine).filter(Boolean)
  const slotName = item.slot ? L(SLOT_LABEL[item.slot], item.slot) : null
  const typeName = item.subclass ? L(SUBCLASS_LABEL[item.subclass], item.subclass) : null
  const cls = item.requiredClass ? PLAYER_CLASSES[item.requiredClass]?.name || item.requiredClass : null
  const buyable = (item.source || []).some((s) => s.type === 'vendor') && item.buyPrice > 0
  return (
    <div className={`w-80 rounded border bg-[#0a1020]/95 p-3 text-[13px] leading-snug text-white shadow-2xl ${className}`} style={{ borderColor: '#8a90a6' }}>
      {header && <div className="mb-1 text-[11px] uppercase tracking-wide text-slate-400">{header}</div>}
      <div className="flex items-start gap-2">
        <span className="text-2xl leading-none">{item.icon}</span>
        <div className="min-w-0">
          <div className="text-[15px] font-bold" style={{ color: q.color }}>{itemName(item)}</div>
          <div style={{ color: '#ffd100' }}>{tr('Nivel de objeto', 'Item level')} {itemLevelOf(item)}</div>
        </div>
      </div>
      <div className="mt-1.5 space-y-0.5">
        {item.bonding && item.bonding !== 'none' && <div>{L(BONDING_LABEL[item.bonding], item.bonding)}</div>}
        {item.unique && <div>{tr('Único', 'Unique')}</div>}
        {(slotName || typeName) && <Row left={slotName || typeName} right={slotName && typeName !== slotName ? typeName : null} />}
        {d && <Row left={`${d.min} - ${d.max} ${tr('Daño', 'Damage')}`} right={`${tr('Velocidad', 'Speed')} ${Number(d.speed).toFixed(2)}`} />}
        {dps && <div>({dps} {tr('daño por segundo', 'damage per second')})</div>}
        {stats.map(([k, v]) => <div key={k}>{v > 0 ? '+' : ''}{v} {L(STAT_LABEL[k], k)}</div>)}
        {resist.map(([k, v]) => <div key={k}>+{v} {tr(`Resistencia: ${L(RESIST_LABEL[k], k)}`, `${L(RESIST_LABEL[k], k)} Resistance`)}</div>)}
        {item.durability > 0 && <div>{tr('Durabilidad', 'Durability')} {item.durability} / {item.durability}</div>}
        {item.requiredLevel > 1 && <div>{tr('Requiere nivel', 'Requires level')} {item.requiredLevel}</div>}
        {cls && <div>{tr('Requiere clase', 'Requires class')}: {cls}</div>}
        {item.stackable && item.maxStack > 1 && <div className="opacity-70">{tr('Se apila hasta', 'Stacks up to')} {item.maxStack}</div>}
      </div>
      {effects.length > 0 && <div className="mt-1.5 space-y-0.5" style={{ color: '#1eff00' }}>{effects.map((t, i) => <div key={i}>{t}</div>)}</div>}
      {itemDescription(item) && <p className="mt-1.5 italic" style={{ color: '#ffd100' }}>“{itemDescription(item)}”</p>}
      <div className="mt-1.5 space-y-0.5">
        {item.sellPrice > 0 && <div>{tr('Precio de venta', 'Sell price')}: <Money cobre={item.sellPrice} /></div>}
        {buyable && <div className="opacity-80">{tr('Precio de compra', 'Buy price')}: <Money cobre={item.buyPrice} /></div>}
      </div>
      {!compact && (
        <div className="mt-2 border-t border-white/10 pt-1.5 text-[11px] opacity-50">
          <div>{(item.contexts || []).map((c) => tr(...CONTEXTS[c])).join(' · ')}</div>
          <div>ID {item.entry} · {item.key} · {(item.source || []).map((s) => tr(...(SOURCE_TYPES[s.type] || [s.type, s.type]))).join(', ') || '—'}</div>
        </div>
      )}
    </div>
  )
}
