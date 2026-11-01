import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import ItemTooltip, { Money } from './ItemTooltip'
import { useI18n, tr } from '../../i18n'
import { ITEM_DB, QUALITY, ITEM_CLASS, CONTEXTS, SOURCE_TYPES, searchItems, qualityOf, classLabel, itemName } from '../../data/itemDb'

// Base de datos de objetos (/db/items): como la base de datos de un MMO — todos los objetos con su ID, filtros por
// clase, calidad, uso y fuente, el tooltip y la fila cruda. Es la vista única que usarán la tienda, el inventario,
// el Hub y el VR. Solo lectura por ahora (se edita en los registros y se sincronizan los IDs con scripts/items/sync-ids.mjs).
const sel = 'rounded-md border border-white/15 bg-black/40 px-2 py-1.5 text-xs'

export default function ItemDbPage() {
  useI18n()
  const [f, setF] = useState({ q: '', class: '', quality: '', context: '', source: '' })
  const [pick, setPick] = useState(null)
  const rows = useMemo(() => searchItems(f), [f])
  const item = rows.find((r) => r.entry === pick) || rows[0] || null
  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value }))
  const download = (name, text, type) => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([text], { type })); a.download = name; a.click() }
  const csv = () => ['entry,key,name,class,subclass,quality,slot,requiredLevel,buyPrice,contexts', ...rows.map((r) => [r.entry, r.key, JSON.stringify(r.name), r.class, r.subclass, r.quality, r.slot || '', r.requiredLevel, r.buyPrice, r.contexts.join('|')].join(','))].join('\n')

  return (
    <div className="min-h-screen bg-[#07070f] p-3 text-white sm:p-6">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-center gap-3">
          <Link to="/dashboard" className="rounded-full bg-white/10 px-3 py-1 text-xs">←</Link>
          <h1 className="text-lg font-extrabold">📚 {tr('Base de datos de objetos', 'Item database')}</h1>
          <span className="text-xs opacity-60">{rows.length} / {ITEM_DB.length}</span>
          <div className="ml-auto flex gap-2 text-xs">
            <button className={sel} onClick={() => download('items.json', JSON.stringify(rows, null, 1), 'application/json')}>⬇ JSON</button>
            <button className={sel} onClick={() => download('items.csv', csv(), 'text/csv')}>⬇ CSV</button>
          </div>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-5">
          <input className={`${sel} col-span-2 sm:col-span-1`} placeholder={tr('Buscar: nombre, ID o clave', 'Search: name, ID or key')} value={f.q} onChange={set('q')} />
          <select className={sel} value={f.class} onChange={set('class')}><option value="">{tr('Toda clase', 'Any class')}</option>{Object.entries(ITEM_CLASS).map(([k, v]) => <option key={k} value={k}>{tr(...v.label)}</option>)}</select>
          <select className={sel} value={f.quality} onChange={set('quality')}><option value="">{tr('Toda calidad', 'Any quality')}</option>{Object.entries(QUALITY).map(([k, v]) => <option key={k} value={k}>{tr(...v.label)}</option>)}</select>
          <select className={sel} value={f.context} onChange={set('context')}><option value="">{tr('Se usa en…', 'Used in…')}</option>{Object.entries(CONTEXTS).map(([k, v]) => <option key={k} value={k}>{tr(...v)}</option>)}</select>
          <select className={sel} value={f.source} onChange={set('source')}><option value="">{tr('Cualquier fuente', 'Any source')}</option>{Object.entries(SOURCE_TYPES).map(([k, v]) => <option key={k} value={k}>{tr(...v)}</option>)}</select>
        </div>

        <div className="mt-3 grid gap-3 lg:grid-cols-[1fr_auto]">
          <div className="max-h-[70vh] overflow-auto rounded-xl border border-white/10">
            <table className="w-full text-left text-xs">
              <thead className="sticky top-0 bg-[#10141c] text-[10px] uppercase tracking-wide opacity-70"><tr><th className="p-2">ID</th><th>{tr('Objeto', 'Item')}</th><th className="hidden sm:table-cell">{tr('Clase', 'Class')}</th><th className="hidden md:table-cell">{tr('Nv', 'Lv')}</th><th>{tr('Precio', 'Price')}</th><th className="hidden md:table-cell">{tr('Uso', 'Use')}</th></tr></thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.entry} onClick={() => setPick(r.entry)} className={`cursor-pointer border-t border-white/5 ${item?.entry === r.entry ? 'bg-white/10' : 'hover:bg-white/5'}`}>
                    <td className="p-2 font-mono opacity-60">{r.entry}</td>
                    <td><span className="mr-1.5 text-base">{r.icon}</span><b style={{ color: qualityOf(r).color }}>{itemName(r)}</b></td>
                    <td className="hidden opacity-70 sm:table-cell">{classLabel(r)} · {r.subclass}</td>
                    <td className="hidden md:table-cell">{r.requiredLevel}</td>
                    <td><Money cobre={r.buyPrice} /></td>
                    <td className="hidden opacity-60 md:table-cell">{r.contexts.join(', ')}</td>
                  </tr>
                ))}
                {!rows.length && <tr><td className="p-4 opacity-60" colSpan={6}>{tr('Sin resultados', 'No results')}</td></tr>}
              </tbody>
            </table>
          </div>
          {item && (
            <div className="space-y-3">
              <ItemTooltip item={item} />
              <pre className="max-h-64 w-72 overflow-auto rounded-lg border border-white/10 bg-black/40 p-2 text-[10px] leading-snug text-emerald-200">{JSON.stringify(item, null, 1)}</pre>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
