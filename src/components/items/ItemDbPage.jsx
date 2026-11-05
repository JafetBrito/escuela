import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import ItemTooltip, { Money } from './ItemTooltip'
import { useI18n, tr } from '../../i18n'
import { ITEM_DB, getItem, QUALITY, ITEM_CLASS, CONTEXTS, SOURCE_TYPES, SLOT_LABEL, BONDING_LABEL, STAT_LABEL, RESIST_LABEL, TRIGGER_LABEL, searchItems, qualityOf, classLabel, itemName } from '../../data/itemDb'
import { useItemDbStore, loadRemoteItems, saveItem, nextEntry } from '../../data/itemDb/remote'
import { useAuthStore } from '../../stores/useAuthStore'

// Base de datos de objetos (/db/items): como la base de datos de un MMO — todos los objetos con su ID, filtros por
// clase, calidad, uso y fuente, el tooltip y la fila cruda. Es la vista única que usarán la tienda, el inventario,
// el Hub y el VR. Solo lectura por ahora (se edita en los registros y se sincronizan los IDs con scripts/items/sync-ids.mjs).
const sel = 'rounded-md border border-white/15 bg-black/40 px-2 py-1.5 text-xs'

// Editor de un objeto (solo admin): guarda en Supabase (item_templates) y el cambio se ve en toda la app.
// Cada casilla corresponde a una fila del tooltip (nivel de objeto, ligadura, daño, estadísticas, resistencias, durabilidad, efecto...).
const STAT_KEYS = ['str', 'agi', 'sta', 'int', 'spi'], RESIST_KEYS = ['fire', 'nature', 'frost', 'arcane']
function ItemEditor({ item }) {
  const fx = (item.effects || []).find((e) => e.text)
  const [d, setD] = useState(() => ({
    name: item.name, description: item.description, icon: item.icon, quality: item.quality, buyPrice: item.buyPrice, sellPrice: item.sellPrice ?? Math.floor(item.buyPrice / 4),
    requiredLevel: item.requiredLevel, contexts: item.contexts, itemLevel: item.itemLevel ?? '', bonding: item.bonding || 'none', unique: !!item.unique, slot: item.slot || '',
    durability: item.durability ?? '', dmgMin: item.damage?.min ?? '', dmgMax: item.damage?.max ?? '', dmgSpeed: item.damage?.speed ?? '',
    stats: { ...item.stats }, resist: { ...item.resist }, fxTrigger: fx?.trigger || 'use', fxText: fx?.text || '',
  }))
  const [msg, setMsg] = useState('')
  const set = (k) => (e) => setD((s) => ({ ...s, [k]: e.target.type === 'number' ? (e.target.value === '' ? '' : Number(e.target.value)) : e.target.type === 'checkbox' ? e.target.checked : e.target.value }))
  const setIn = (grp, k) => (e) => setD((s) => ({ ...s, [grp]: { ...s[grp], [k]: Number(e.target.value) || 0 } }))
  const toggleCtx = (c) => setD((s) => ({ ...s, contexts: s.contexts.includes(c) ? s.contexts.filter((x) => x !== c) : [...s.contexts, c] }))
  const save = async () => {
    const num = (v) => (v === '' || v == null ? null : Number(v))
    const clean = (o) => Object.fromEntries(Object.entries(o).filter(([, v]) => v))
    const damage = num(d.dmgMin) != null && num(d.dmgMax) != null && num(d.dmgSpeed) > 0 ? { min: num(d.dmgMin), max: num(d.dmgMax), speed: num(d.dmgSpeed) } : null
    const effects = [...(item.effects || []).filter((e) => !e.text), ...(d.fxText.trim() ? [{ type: 'text', trigger: d.fxTrigger, text: d.fxText.trim() }] : [])]
    const { dmgMin, dmgMax, dmgSpeed, fxTrigger, fxText, ...rest } = d // eslint-disable-line no-unused-vars
    try {
      await saveItem({ ...item, ...rest, itemLevel: num(d.itemLevel), durability: num(d.durability), slot: d.slot || null, damage, stats: clean(d.stats), resist: clean(d.resist), effects, sellPrice: Number(d.sellPrice) || 0 })
      setMsg('✅ Guardado en Supabase')
    } catch (e) { setMsg(`❌ ${e.message} (¿corriste la migración 084 y eres admin?)`) }
  }
  const inp = `${sel} w-full`, lab = 'text-[10px] uppercase opacity-60'
  const N = (k, title, ph) => <input key={k} className={inp} type="number" min="0" value={d[k]} onChange={set(k)} title={title} placeholder={ph || title} />
  return (
    <div className="w-80 space-y-1.5 rounded-lg border border-amber-400/30 bg-amber-500/5 p-2 text-xs">
      <b className="text-amber-300">✏️ {tr('Editar', 'Edit')} · ID {item.entry}</b>
      <input className={inp} value={d.name} onChange={set('name')} placeholder="Nombre" />
      <textarea className={inp} rows={2} value={d.description} onChange={set('description')} placeholder="Texto de ambientación (amarillo)" />
      <div className="grid grid-cols-3 gap-1.5">
        <input className={inp} value={d.icon} onChange={set('icon')} title="Ícono" />
        {N('requiredLevel', 'Nivel requerido')}{N('itemLevel', 'Nivel de objeto (vacío = automático)', 'Nv. objeto')}
      </div>
      <div className="grid grid-cols-2 gap-1.5">
        <select className={inp} value={d.quality} onChange={set('quality')}>{Object.entries(QUALITY).map(([k, v]) => <option key={k} value={k}>{tr(...v.label)}</option>)}</select>
        <select className={inp} value={d.bonding} onChange={set('bonding')}><option value="none">{tr('Sin ligadura', 'No binding')}</option>{Object.entries(BONDING_LABEL).map(([k, v]) => <option key={k} value={k}>{tr(...v)}</option>)}</select>
        <select className={inp} value={d.slot} onChange={set('slot')}><option value="">{tr('Sin ranura', 'No slot')}</option>{Object.entries(SLOT_LABEL).map(([k, v]) => <option key={k} value={k}>{tr(...v)}</option>)}</select>
        <label className="flex items-center gap-1"><input type="checkbox" checked={d.unique} onChange={set('unique')} />{tr('Único', 'Unique')}</label>
      </div>
      <div className={lab}>{tr('Daño (mín · máx · velocidad) y durabilidad', 'Damage (min · max · speed) and durability')}</div>
      <div className="grid grid-cols-4 gap-1.5">{N('dmgMin', 'Daño mín', 'mín')}{N('dmgMax', 'Daño máx', 'máx')}<input className={inp} type="number" min="0" step="0.05" value={d.dmgSpeed} onChange={set('dmgSpeed')} placeholder="vel." title="Velocidad" />{N('durability', 'Durabilidad', 'dur.')}</div>
      <div className={lab}>{tr('Estadísticas', 'Stats')}</div>
      <div className="grid grid-cols-5 gap-1">{STAT_KEYS.map((k) => <input key={k} className={inp} type="number" value={d.stats[k] || ''} onChange={setIn('stats', k)} placeholder={tr(...STAT_LABEL[k]).slice(0, 4)} title={tr(...STAT_LABEL[k])} />)}</div>
      <div className={lab}>{tr('Resistencias', 'Resistances')}</div>
      <div className="grid grid-cols-4 gap-1">{RESIST_KEYS.map((k) => <input key={k} className={inp} type="number" value={d.resist[k] || ''} onChange={setIn('resist', k)} placeholder={tr(...RESIST_LABEL[k]).slice(0, 5)} title={tr(...RESIST_LABEL[k])} />)}</div>
      <div className={lab}>{tr('Línea verde de efecto', 'Green effect line')}</div>
      <div className="grid grid-cols-[auto_1fr] gap-1.5">
        <select className={sel} value={d.fxTrigger} onChange={set('fxTrigger')}>{Object.entries(TRIGGER_LABEL).map(([k, v]) => <option key={k} value={k}>{tr(...v)}</option>)}</select>
        <input className={inp} value={d.fxText} onChange={set('fxText')} placeholder={tr('Texto del efecto', 'Effect text')} />
      </div>
      <div className="grid grid-cols-2 gap-1.5">{N('buyPrice', 'Precio de compra (cobre)', 'compra (cobre)')}{N('sellPrice', 'Precio de venta (cobre)', 'venta (cobre)')}</div>
      <div className="flex gap-2">{Object.entries(CONTEXTS).map(([k, v]) => <label key={k} className="flex items-center gap-1"><input type="checkbox" checked={d.contexts.includes(k)} onChange={() => toggleCtx(k)} />{tr(...v)}</label>)}</div>
      <button className={`${sel} w-full !bg-amber-500/30`} onClick={save}>💾 {tr('Guardar en la base', 'Save to database')}</button>
      {msg && <p className="leading-snug">{msg}</p>}
    </div>
  )
}

export default function ItemDbPage() {
  useI18n()
  useItemDbStore((s) => s.version) // se actualiza cuando llegan o se editan filas de Supabase
  const status = useItemDbStore((s) => s.status), dbError = useItemDbStore((s) => s.error)
  const isAdmin = useAuthStore((s) => s.profile?.role === 'admin') || import.meta.env.DEV
  useEffect(() => { loadRemoteItems() }, [])
  const [f, setF] = useState({ q: '', class: '', quality: '', context: '', source: '' })
  const [pick, setPick] = useState(null)
  const [cmp, setCmp] = useState(null) // objeto contra el que se compara (ctrl/shift + clic en otra fila)
  const rows = useMemo(() => searchItems(f), [f])
  const item = rows.find((r) => r.entry === pick) || rows[0] || null
  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value }))
  const create = async () => {
    const key = window.prompt(tr('Clave única del objeto (ej.: pocion-energia)', 'Unique item key (e.g. energy-potion)'))?.trim()
    if (!key) return
    const cls = window.prompt(tr(`Clase (${Object.keys(ITEM_CLASS).join(', ')})`, `Class (${Object.keys(ITEM_CLASS).join(', ')})`), 'consumable')?.trim()
    if (!ITEM_CLASS[cls]) return
    const entry = nextEntry(cls)
    try { await saveItem({ entry, key, name: key, description: '', icon: '❔', quality: 'common', class: cls, subclass: ITEM_CLASS[cls].subclasses[0], buyPrice: 0, sellPrice: 0, requiredLevel: 1, contexts: ['app'], source: [{ type: 'admin' }] }); setPick(entry) } catch (e) { window.alert(e.message) }
  }
  const download = (name, text, type) => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([text], { type })); a.download = name; a.click() }
  const csv = () => ['entry,key,name,class,subclass,quality,slot,requiredLevel,buyPrice,contexts', ...rows.map((r) => [r.entry, r.key, JSON.stringify(r.name), r.class, r.subclass, r.quality, r.slot || '', r.requiredLevel, r.buyPrice, r.contexts.join('|')].join(','))].join('\n')

  return (
    <div className="min-h-screen bg-[#07070f] p-3 text-white sm:p-6">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-center gap-3">
          <Link to="/dashboard" className="rounded-full bg-white/10 px-3 py-1 text-xs">←</Link>
          <h1 className="text-lg font-extrabold">📚 {tr('Base de datos de objetos', 'Item database')}</h1>
          <span className="text-xs opacity-60">{rows.length} / {ITEM_DB.length}</span>
          <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] opacity-70" title={dbError || ''}>{status === 'ready' ? '☁️ Supabase' : status === 'error' ? '⚠️ ' + tr('solo local (falta la migración 084)', 'local only (migration 084 missing)') : status === 'loading' ? '…' : '💾 local'}</span>
          <div className="ml-auto flex gap-2 text-xs">
            {isAdmin && <button className={sel} onClick={create}>＋ {tr('Nuevo', 'New')}</button>}
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
                  <tr key={r.entry} onClick={(e) => (e.ctrlKey || e.shiftKey ? setCmp(cmp === r.entry ? null : r.entry) : setPick(r.entry))} className={`cursor-pointer border-t border-white/5 ${item?.entry === r.entry ? 'bg-white/10' : 'hover:bg-white/5'}`}>
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
              <div className="flex flex-wrap items-start gap-2">
                <ItemTooltip item={item} />
                {cmp && getItem(cmp) && cmp !== item.entry && <ItemTooltip item={getItem(cmp)} header={tr('Comparando con', 'Comparing with')} compact />}
              </div>
              <p className="w-80 text-[10px] opacity-40">{tr('Ctrl/Shift + clic en otra fila para comparar', 'Ctrl/Shift + click another row to compare')}</p>
              {isAdmin && <ItemEditor key={item.entry} item={item} />}
              <pre className="max-h-64 w-72 overflow-auto rounded-lg border border-white/10 bg-black/40 p-2 text-[10px] leading-snug text-emerald-200">{JSON.stringify(item, null, 1)}</pre>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
