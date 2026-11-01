import { useEffect, useMemo, useState } from 'react'
import { useI18n, tr } from '../../../i18n'
import { useVrCharacterStore } from '../../../stores/useVrCharacterStore'
import { getMap } from './campusMaps'
import { CAMPUS_S } from './campusWorld'
import { KINDS, DEPTS, FH } from './hospitalData'

// Capa didáctica del hospital (sobre el juego): dice DÓNDE estás y QUÉ PASA en ese lugar, deja saltar a
// cualquier área desde un directorio y, dentro de un ascensor, cambiar de piso. Todo sale del layout
// (rooms) y del catálogo médico (hospitalData), así que si mueves o renombras un cuarto en el editor, esto se actualiza solo.
const S = CAMPUS_S
const HIDE = new Set(['corridor', 'closet', 'stairs', 'elevator'])
const nameOf = (r) => r.name || tr(...KINDS[r.kind].name)
const teleport = (x, y, z) => useVrCharacterStore.getState().setTeleportTo({ x: x * S, y: y * S, z: z * S })
const DOOR_VEC = { S: [0, 1], N: [0, -1], E: [1, 0], W: [-1, 0] }

// Punto justo afuera de la puerta del cuarto (en el pasillo): ahí nunca hay muebles.
const outsideDoor = (r) => { const [dx, dz] = DOOR_VEC[(r.door || 'S')[0]] || [0, 1]; return [r.x + dx * (r.w / 2 + 1.6), r.z + dz * (r.d / 2 + 1.6)] }

export default function HospitalOverlay({ playerPositionRef }) {
  useI18n() // re-renderiza al cambiar de idioma
  const rooms = useMemo(() => getMap('hospital').data.items.filter((i) => i.type === 'room'), [])
  const [cur, setCur] = useState(null)
  const [dir, setDir] = useState(false)
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(() => new Set(['urg']))

  useEffect(() => {
    const id = setInterval(() => {
      const p = playerPositionRef.current
      if (!p) return
      const x = p.x / S, z = p.z / S, lv = Math.floor(p.y / S / FH + 0.02)
      const hit = rooms.find((r) => r.level <= lv && lv < r.level + (r.hh || 1) && Math.abs(x - r.x) <= r.w / 2 && Math.abs(z - r.z) <= r.d / 2)
      setCur((old) => (old?.id === hit?.id ? old : hit || null))
    }, 350)
    return () => clearInterval(id)
  }, [rooms, playerPositionRef])

  const byDept = useMemo(() => {
    const g = {}
    for (const r of rooms) { if (HIDE.has(r.kind) || (q && !nameOf(r).toLowerCase().includes(q.toLowerCase()))) continue; (g[KINDS[r.kind].dept] ||= []).push(r) }
    return g
  }, [rooms, q])

  const K = cur && KINDS[cur.kind], D = K && DEPTS[K.dept]
  return (
    <>
      {cur && K && cur.kind !== 'corridor' && (
        <div className="pointer-events-none absolute left-1/2 top-[44px] z-20 w-[min(92vw,420px)] -translate-x-1/2 overflow-hidden rounded-xl border border-white/10 bg-black/70 text-white shadow-xl backdrop-blur">
          <div className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold" style={{ background: D.color }}>
            <span>{tr(...D.name)}</span><span className="ml-auto opacity-80">{tr(`Nivel ${cur.level}`, `Level ${cur.level}`)}</span>
          </div>
          <div className="px-3 py-2">
            <div className="text-base font-bold leading-tight">{nameOf(cur)}</div>
            {cur.kind !== 'lobby' && <p className="mt-1 text-xs leading-snug text-white/80">{tr(...K.info)}</p>}
          </div>
          {cur.kind === 'elevator' && (
            <div className="pointer-events-auto flex flex-wrap gap-1.5 px-3 pb-2">
              {[0, 1, 2, 3, 4].map((n) => (
                <button key={n} className={`rounded-md px-2.5 py-1 text-xs font-bold ${n === cur.level ? 'bg-white/25' : 'bg-white/10 hover:bg-white/25'}`} onClick={() => teleport(cur.x, n * FH + 0.3, cur.z)}>{n === 0 ? 'PB' : n}</button>
              ))}
            </div>
          )}
        </div>
      )}
      <button className="absolute left-3 top-[126px] z-20 rounded-lg border border-white/15 bg-black/60 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur hover:bg-black/80" onClick={() => setDir(true)}>
        🏥 {tr('Directorio', 'Directory')}
      </button>
      {dir && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/60 p-3 backdrop-blur-sm" onClick={() => setDir(false)}>
          <div className="flex max-h-[88vh] w-[min(96vw,720px)] flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0f141b] text-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
              <b className="text-base">🏥 {tr('Directorio del hospital', 'Hospital directory')}</b>
              <input className="ml-auto w-44 rounded-md border border-white/15 bg-black/40 px-2 py-1 text-xs" placeholder={tr('Buscar área…', 'Search area…')} value={q} onChange={(e) => setQ(e.target.value)} />
              <button className="rounded-md bg-white/10 px-2 py-1 text-xs hover:bg-white/20" onClick={() => setDir(false)}>✕</button>
            </div>
            <p className="px-4 pt-2 text-xs text-white/60">{tr('Elige un área para ir directo a su puerta. Cada pasillo tiene líneas de color por departamento.', 'Pick an area to jump to its door. Each corridor has colour lines per department.')}</p>
            <div className="overflow-y-auto p-3">
              {Object.keys(DEPTS).filter((d) => byDept[d]).map((d) => (
                <div key={d} className="mb-2 overflow-hidden rounded-lg border border-white/10">
                  <button className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm font-semibold" style={{ background: `${DEPTS[d].color}33` }} onClick={() => setOpen((s) => { const n = new Set(s); n.has(d) ? n.delete(d) : n.add(d); return n })}>
                    <span className="h-3 w-3 rounded-full" style={{ background: DEPTS[d].color }} />{tr(...DEPTS[d].name)}<span className="ml-auto text-xs opacity-60">{byDept[d].length}</span>
                  </button>
                  {(open.has(d) || q) && (
                    <div className="grid grid-cols-1 gap-1 p-2 sm:grid-cols-2">
                      {byDept[d].map((r) => (
                        <button key={r.id} className="truncate rounded-md bg-white/5 px-2 py-1.5 text-left text-xs hover:bg-white/15" onClick={() => { const [ox, oz] = outsideDoor(r); teleport(ox, r.level * FH + 0.3, oz); setDir(false) }}>
                          {nameOf(r)} <span className="opacity-50">· {tr(`Nivel ${r.level}`, `L${r.level}`)}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
