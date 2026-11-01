import { tr } from '../../i18n'
import { qualityOf, classLabel, itemName, itemDescription, priceParts, CONTEXTS, SOURCE_TYPES, SLOT_LABEL } from '../../data/itemDb'

// Tooltip de objeto estilo WoW: nombre del color de su calidad, tipo, ranura, requisitos, estadísticas, descripción,
// "Uso", precio en oro/plata/cobre y dónde se usa. Sirve igual en la tienda, el inventario, el hub y la base de datos.
export function Money({ cobre }) {
  const { gold, silver, copper } = priceParts(cobre || 0)
  if (!cobre) return <span className="opacity-60">{tr('Gratis', 'Free')}</span>
  return <span>{gold > 0 && <b style={{ color: '#ffd24a' }}>{gold}🟡 </b>}{silver > 0 && <b style={{ color: '#d0d6dc' }}>{silver}⚪ </b>}{copper > 0 && <b style={{ color: '#d68a4a' }}>{copper}🟤</b>}</span>
}

const effectLine = (e) => {
  if (e.type === 'pet_need') return `${tr('Uso: restaura', 'Use: restores')} ${Object.entries(e).filter(([k]) => k !== 'type').map(([k, v]) => `${k} +${v}`).join(', ')}`
  if (e.type === 'unlock_mascot') return tr('Uso: desbloquea esta mascota 3D', 'Use: unlocks this 3D mascot')
  if (e.type === 'toggle_tool') return tr('Uso: activa / desactiva la herramienta', 'Use: toggles the tool')
  if (e.type === 'ai_prompt') return tr('Uso: cambia la personalidad de tu mascota IA', 'Use: changes your AI mascot personality')
  if (e.type === 'equip') return tr('Equipar', 'Equip')
  return e.type
}

export default function ItemTooltip({ item, className = '' }) {
  if (!item) return null
  const q = qualityOf(item)
  return (
    <div className={`w-72 rounded-lg border border-white/20 bg-[#0b0e14]/95 p-3 text-xs text-white shadow-2xl ${className}`}>
      <div className="flex items-start gap-2">
        <div className="text-3xl leading-none">{item.icon}</div>
        <div><div className="text-sm font-bold" style={{ color: q.color }}>{itemName(item)}</div><div className="opacity-60">{tr(...q.label)} · {classLabel(item)}</div></div>
      </div>
      <div className="mt-2 space-y-0.5">
        {item.slot && <div>{tr(...(SLOT_LABEL[item.slot] || [item.slot, item.slot]))}{item.owner && <span className="opacity-60"> · {item.owner === 'oliver' ? tr('Mascota', 'Mascot') : 'Avatar'}</span>}</div>}
        {item.bonding !== 'none' && <div className="opacity-70">{item.bonding === 'equip' ? tr('Se liga al equiparlo', 'Binds when equipped') : tr('Ligado a la cuenta', 'Account-bound')}</div>}
        {Object.entries(item.stats).filter(([, v]) => v).map(([k, v]) => <div key={k} style={{ color: '#1eff00' }}>+{v} {k}</div>)}
        {(item.requiredLevel > 1 || item.requiredClass) && <div className="opacity-70">{tr('Requiere', 'Requires')}{item.requiredLevel > 1 && ` ${tr('nivel', 'level')} ${item.requiredLevel}`}{item.requiredClass && ` · ${item.requiredClass}`}</div>}
        {item.effects.map((e, i) => <div key={i} style={{ color: '#1eff00' }}>{effectLine(e)}</div>)}
      </div>
      <p className="mt-2 italic leading-snug" style={{ color: '#ffd100' }}>“{itemDescription(item)}”</p>
      <div className="mt-2 flex items-center justify-between border-t border-white/10 pt-2">
        <span className="opacity-70">{tr('Precio', 'Price')}: <Money cobre={item.buyPrice} /></span>
        <span className="opacity-50">{item.contexts.map((c) => tr(...CONTEXTS[c])).join(' · ')}</span>
      </div>
      <div className="mt-1 opacity-40">ID {item.entry} · {item.key} · {item.source.map((s) => tr(...(SOURCE_TYPES[s.type] || [s.type, s.type]))).join(', ') || '—'}</div>
    </div>
  )
}
