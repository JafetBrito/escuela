import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, TransformControls, Line } from '@react-three/drei'
import * as THREE from 'three'
import { Link } from 'react-router-dom'
import CampusScenery from './CampusScenery'
import { CAMPUS_S, itemY, setTerrainMode } from './campusWorld'
import { CATALOG } from './campusKit'
import { GLB_FILES } from './campusAssets'
import { MAPS } from './campusMaps'
import { KINDS, DEPTS, FH } from './hospitalData'
import { PRESETS } from '../lookdev/plazaWorld'
import { useAuthStore } from '../../../stores/useAuthStore'

// ─────────────────────────────────────────────────────────────────────────────
// Editor de mapas (/vr/editor?map=campus|hospital): colocas y mueves piezas con el mouse y el mapa se guarda
// como DATOS (src/data/<mapa>Layout.json), no como código. El juego lee ese mismo archivo, así que lo que
// dejas aquí es lo que se camina allá. En `npm run dev` "Guardar" escribe el archivo directo; en producción
// descarga el JSON. Cualquier herramienta externa (Blender, un script) puede generar o editar ese JSON — ver
// scripts/campus/LEEME.md — y los .glb de src/assets/campus/ salen en la paleta. "❓ Cómo funciona" da un recorrido.
// ─────────────────────────────────────────────────────────────────────────────

const S = CAMPUS_S
const rad = (d) => (d * Math.PI) / 180
const draftKey = (m) => `campus-layout-draft:${m}`
const uid = (type) => `${type[0]}${Date.now().toString(36)}${Math.floor(Math.random() * 1e3)}`
const serialize = (d) => { const { items, ...rest } = d; return `${JSON.stringify(rest).slice(0, -1)},"items":[\n${items.map((i) => JSON.stringify(i)).join(',\n')}\n]}` }
const loadDraft = (m) => { try { const j = JSON.parse(localStorage.getItem(draftKey(m))); return j?.items ? j : null } catch { return null } }
const kindLabel = (it) => (it.name || KINDS[it.kind]?.name?.[0] || it.kind)
const labelOf = (it) => it.type === 'zone' ? `Zona · ${it.name}` : `${CATALOG[it.type]?.label || (it.type === 'path' ? 'Camino' : it.type)}${it.type === 'room' ? ` · ${kindLabel(it)} · N${it.level}` : it.text ? ` · ${it.text}` : it.sign ? ` · ${it.sign}` : it.file ? ` · ${it.file}` : it.interior ? ` · ${it.interior}` : ''}`
const SIZES = { aula: [36, 14], lobby: [36, 22], cafeteria: [24, 14], lab: [24, 14], nicu: [24, 14], library: [36, 14], sim: [24, 14], anatomy: [24, 14], pacu: [24, 14], linac: [24, 14], dialysis: [24, 14], corridor: [40, 6], stairs: [6, 14], elevator: [4, 6], closet: [4, 8], research: [14, 14], ward: [12, 14] }

// ── dentro del Canvas ────────────────────────────────────────────────────────
function Rig({ controlsRef, followRef }) {
  const { camera } = useThree(), keys = useRef({})
  useEffect(() => {
    const typing = () => /INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName)
    const dn = (e) => { if (!typing() && !e.ctrlKey && !e.metaKey) keys.current[e.key.toLowerCase()] = true }
    const up = (e) => { keys.current[e.key.toLowerCase()] = false }
    window.addEventListener('keydown', dn); window.addEventListener('keyup', up)
    return () => { window.removeEventListener('keydown', dn); window.removeEventListener('keyup', up) }
  }, [])
  useFrame((_, dt) => {
    const c = controlsRef.current
    if (!c) return
    const k = keys.current, fwd = new THREE.Vector3(c.target.x - camera.position.x, 0, c.target.z - camera.position.z).normalize()
    const right = new THREE.Vector3(-fwd.z, 0, fwd.x), v = new THREE.Vector3(), dist = camera.position.distanceTo(c.target)
    if (k.w || k.arrowup) v.add(fwd); if (k.s || k.arrowdown) v.sub(fwd); if (k.d || k.arrowright) v.add(right); if (k.a || k.arrowleft) v.sub(right)
    if (v.lengthSq()) { v.normalize().multiplyScalar(dist * 0.9 * dt * (k.shift ? 3 : 1)); c.target.add(v); camera.position.add(v) }
    followRef.current.copy(c.target)
  })
  return null
}

function Gizmo({ item, mode, onCommit }) {
  const ref = useRef()
  useEffect(() => {
    ref.current.position.set(item.x * S, (itemY(item) + (item.level || 0) * FH) * S, item.z * S)
    ref.current.rotation.set(0, rad(item.rot || 0), 0)
  }, [item])
  return (
    <>
      <group ref={ref} />
      <TransformControls
        object={ref} mode={mode} size={0.9} showY={false} showX={mode === 'translate'} showZ={mode === 'translate'}
        onMouseUp={() => {
          const p = ref.current.position, deg = (((ref.current.rotation.y * 180) / Math.PI) % 360 + 360) % 360
          onCommit({ x: p.x / S, z: p.z / S, rot: Math.round(deg / 5) * 5 % 360 })
        }}
      />
    </>
  )
}

function Ground({ tool, snap, onPlace, onDeselect }) {
  const cursor = useRef()
  const sn = (v) => (snap ? Math.round(v / snap) * snap : Math.round(v * 10) / 10)
  return (
    <>
      <mesh rotation-x={-Math.PI / 2} position-y={0.05}
        onPointerMove={(e) => { if (cursor.current) cursor.current.position.set(e.point.x, 0.2, e.point.z) }}
        onClick={(e) => {
          if (e.delta > 4) return // arrastre de cámara, no clic
          const x = sn(e.point.x / S), z = sn(e.point.z / S)
          tool.kind === 'select' ? onDeselect() : onPlace(x, z)
        }}>
        <planeGeometry args={[2400, 2400]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
      {tool.kind !== 'select' && <mesh ref={cursor}><sphereGeometry args={[0.5, 12, 8]} /><meshBasicMaterial color="#ffd24a" /></mesh>}
    </>
  )
}

function PathMarks({ item }) {
  const pts = item.pts.map(([x, z]) => new THREE.Vector3(x * S, 0.3, z * S))
  return (
    <>
      {pts.length > 1 && <Line points={pts} color="#ffd24a" lineWidth={3} />}
      {pts.map((p, i) => <mesh key={i} position={p}><sphereGeometry args={[0.35, 8, 6]} /><meshBasicMaterial color={i === pts.length - 1 ? '#ff5ea8' : '#ffd24a'} /></mesh>)}
    </>
  )
}

// ── interfaz ─────────────────────────────────────────────────────────────────
function FieldInput({ f, value, onChange }) {
  const cls = 'w-full rounded border border-white/15 bg-black/40 px-1.5 py-1 text-xs text-white'
  if (f.kind === 'sel') return <select className={cls} value={value ?? ''} onChange={(e) => onChange(e.target.value)}>{f.opts.map((o) => <option key={o} value={o}>{KINDS[o] ? `${o} · ${KINDS[o].name[0]}` : o}</option>)}</select>
  if (f.kind === 'bool') return <input type="checkbox" checked={!!value} onChange={(e) => onChange(e.target.checked)} />
  if (f.kind === 'text') return <input className={cls} value={value ?? ''} onChange={(e) => onChange(e.target.value)} />
  return <input className={cls} type="number" min={f.min} max={f.max} step={f.step} value={value ?? ''} placeholder="—" onChange={(e) => onChange(e.target.value === '' ? undefined : parseFloat(e.target.value) || 0)} />
}

// Recorrido guiado: cada paso hace una edición real (en una copia: al cerrar, el mapa vuelve a como estaba).
function Tour({ steps, onClose }) {
  const [i, setI] = useState(0), [auto, setAuto] = useState(false)
  const step = steps[i]
  const ran = useRef(-1)
  useEffect(() => { if (ran.current !== i) { ran.current = i; step.run?.() } }, [i, step])
  useEffect(() => {
    if (!auto) return undefined
    if (i >= steps.length - 1) { const t = setTimeout(() => setAuto(false), 0); return () => clearTimeout(t) }
    const t = setTimeout(() => setI((n) => n + 1), 4200)
    return () => clearTimeout(t)
  }, [auto, i, steps.length])
  return (
    <div className="absolute bottom-4 left-1/2 z-30 w-[min(94%,560px)] -translate-x-1/2 rounded-xl border border-amber-400/40 bg-[#10151d]/95 p-4 text-sm text-white shadow-2xl backdrop-blur">
      <div className="mb-1 flex items-center gap-2 text-xs text-amber-300"><b>Paso {i + 1} de {steps.length}</b><span className="opacity-60">· los cambios del recorrido NO se guardan</span><button className="ml-auto rounded bg-white/10 px-2 py-0.5 hover:bg-white/20" onClick={onClose}>✕ Cerrar</button></div>
      <div className="text-base font-bold">{step.title}</div>
      <p className="mt-1 text-xs leading-relaxed text-white/80">{step.text}</p>
      <div className="mt-3 flex gap-2">
        <button className="rounded bg-white/10 px-3 py-1 text-xs hover:bg-white/20 disabled:opacity-30" disabled={i === 0} onClick={() => { setAuto(false); setI(i - 1) }}>← Anterior</button>
        <button className="rounded bg-amber-500/80 px-3 py-1 text-xs font-bold text-black hover:bg-amber-400 disabled:opacity-30" disabled={i === steps.length - 1} onClick={() => { setAuto(false); setI(i + 1) }}>Siguiente →</button>
        <button className={`ml-auto rounded px-3 py-1 text-xs ${auto ? 'bg-emerald-500/80 text-black' : 'bg-white/10 hover:bg-white/20'}`} onClick={() => setAuto(!auto)}>{auto ? '⏸ Pausar' : '▶ Reproducir solo'}</button>
      </div>
    </div>
  )
}

export default function CampusEditor() {
  const isAdmin = useAuthStore((s) => s.profile?.role === 'admin')
  const mapId = useMemo(() => { const m = new URLSearchParams(location.search).get('map'); return MAPS[m] ? m : 'campus' }, [])
  const map = MAPS[mapId], isHosp = mapId === 'hospital', isSanct = mapId === 'santuario'
  const [draft] = useState(() => loadDraft(mapId))
  const [st, setSt] = useState(() => { setTerrainMode((draft || map.data).terrain, draft || map.data); return { data: draft || map.data, past: [], future: [] } })
  const [sel, setSel] = useState(null)
  const [tool, setTool] = useState({ kind: 'select' })
  const [gizmo, setGizmo] = useState('translate')
  const [snap, setSnap] = useState(isHosp ? 2 : 1)
  const [roofs, setRoofs] = useState(true)
  const [grid, setGrid] = useState(false)
  const [preset, setPreset] = useState(map.data.preset || 'dia')
  const [levelView, setLevelView] = useState({ mode: 'all', n: 0 })
  const [filter, setFilter] = useState(isHosp ? 'room' : isSanct ? 'zone' : 'building')
  const [query, setQuery] = useState('')
  const [msg, setMsg] = useState(draft ? 'Borrador sin guardar recuperado.' : '')
  const [tour, setTour] = useState(false)
  const controlsRef = useRef(), followRef = useRef(new THREE.Vector3())
  const snapshot = useRef(null)
  const data = st.data
  const selItem = data.items.find((i) => i.id === sel)

  const commit = useCallback((fn) => setSt((s) => ({ data: fn(s.data), past: [...s.past.slice(-80), s.data], future: [] })), [])
  const undo = () => setSt((s) => (s.past.length ? { data: s.past[s.past.length - 1], past: s.past.slice(0, -1), future: [s.data, ...s.future] } : s))
  const redo = () => setSt((s) => (s.future.length ? { data: s.future[0], past: [...s.past, s.data], future: s.future.slice(1) } : s))
  const patch = useCallback((id, p) => commit((d) => ({ ...d, items: d.items.map((i) => (i.id === id ? { ...i, ...p } : i)) })), [commit])
  const remove = useCallback((id) => { commit((d) => ({ ...d, items: d.items.filter((i) => i.id !== id) })); setSel(null) }, [commit])
  const duplicate = useCallback((id, dLevel = 0) => {
    const src = data.items.find((i) => i.id === id)
    if (!src) return
    const off = dLevel ? 0 : 4
    const copy = { ...src, id: uid(src.type), x: src.x + off, z: src.z + off, ...(dLevel ? { level: (src.level || 0) + dLevel } : {}), ...(src.pts ? { pts: src.pts.map(([x, z]) => [x + off, z + off]) } : {}) }
    commit((d) => ({ ...d, items: [...d.items, copy] })); setSel(copy.id)
  }, [commit, data.items])

  useEffect(() => { if (!tour) try { localStorage.setItem(draftKey(mapId), JSON.stringify(data)) } catch { /* sin almacenamiento: solo no hay borrador */ } }, [data, mapId, tour])

  const place = (x, z) => {
    if (tool.kind === 'path') { patch(tool.id, { pts: [...data.items.find((i) => i.id === tool.id).pts, [x, z]] }); return }
    if (tool.type === 'path') {
      const id = uid('path'); commit((d) => ({ ...d, items: [...d.items, { id, type: 'path', pts: [[x, z]], w: 5, mat: 'gravel' }] })); setSel(id); setTool({ kind: 'path', id }); return
    }
    const lvl = levelView.mode === 'only' ? levelView.n : 0
    const it = { id: uid(tool.type), type: tool.type, x, z, rot: 0, ...CATALOG[tool.type].defaults, ...(tool.type === 'room' ? { level: lvl } : {}), ...(tool.extra || {}) }
    commit((d) => ({ ...d, items: [...d.items, it] })); setSel(it.id)
    if (!CATALOG[tool.type].instanced && tool.type !== 'pave' && tool.type !== 'room') setTool({ kind: 'select' })
  }

  useEffect(() => {
    const onKey = (e) => {
      if (/INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName)) return
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') { e.preventDefault(); undo() }
      else if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.shiftKey && e.key === 'Z'))) { e.preventDefault(); redo() }
      else if (e.key === 'Delete' || e.key === 'Backspace') sel && remove(sel)
      else if (e.key === 'Escape' || e.key === 'Enter') { if (tool.kind === 'path') setSel(tool.id); setTool({ kind: 'select' }) }
      else if (e.key === 'g') setGizmo('translate')
      else if (e.key === 'r') setGizmo('rotate')
      else if (e.key === 'v') sel && duplicate(sel)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const focus = useCallback((it) => {
    setSel(it.id); setTool({ kind: 'select' })
    const [x, z] = it.pts ? it.pts[0] : [it.x, it.z], c = controlsRef.current, y = (it.level || 0) * FH * S
    if (c) { const d = new THREE.Vector3(x * S - c.target.x, y - c.target.y, z * S - c.target.z); c.target.add(d); c.object.position.add(d) }
  }, [])
  const exportJson = () => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([serialize(data)], { type: 'application/json' })); a.download = map.file; a.click() }
  const save = async () => {
    try {
      const r = await fetch(`/__campus/save?file=${map.file}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: serialize(data) })
      if (!r.ok) throw new Error()
      try { localStorage.removeItem(draftKey(mapId)) } catch { /* nada */ }
      setMsg(`Guardado en src/data/${map.file} — haz commit para subirlo.`); return true
    } catch { exportJson(); setMsg(`Sin servidor de desarrollo: se descargó el JSON. Cópialo a src/data/${map.file}.`); return false }
  }
  const importJson = (file) => file?.text().then((t) => { const j = JSON.parse(t); if (!Array.isArray(j.items)) throw new Error('no es un layout'); commit(() => ({ spawn: [0, 132], version: 1, ...j })); setMsg(`Importado: ${j.items.length} piezas.`) }).catch((e) => setMsg(`No se pudo importar: ${e.message}`))
  const playHere = async () => {
    const it = selItem, x = it ? (it.pts ? it.pts[0][0] : it.x) : followRef.current.x / S, z = it ? (it.pts ? it.pts[0][1] : it.z) : followRef.current.z / S
    await save()
    const y = it?.level ? Math.round(it.level * FH + 0.6) : 0
    window.open(`${map.route}?spawn=${Math.round(x)},${Math.round(z + (it?.type === 'building' ? 6 : 0))}${y ? `,${y}` : ''}`, '_blank')
  }
  const openWindow = () => window.open(`/vr/editor?map=${mapId}`, `editor-${mapId}`, 'popup,width=1500,height=900')

  const startTour = () => { snapshot.current = st; setTour(true) }
  const closeTour = () => { if (snapshot.current) setSt(snapshot.current); snapshot.current = null; setTour(false); setSel(null); setRoofs(true); setLevelView({ mode: 'all', n: 0 }) }
  const tourSteps = useMemo(() => {
    const first = data.items.find((i) => i.type === (isHosp ? 'room' : 'building') && (isHosp ? i.kind === 'or' : i.interior === 'library')) || data.items.find((i) => i.type === (isHosp ? 'room' : 'building'))
    const id = first?.id
    return [
      { title: '1 · El mapa son DATOS', text: `Todo lo que ves (${data.items.length} piezas) sale de un archivo JSON: src/data/${map.file}. No hay que programar: cada edificio, árbol o cuarto es una línea con su posición, giro y parámetros. El juego (${map.route}) lee ese mismo archivo.`, run: () => { setSel(null); setTool({ kind: 'select' }) } },
      { title: '2 · Elige una pieza', text: 'Haz clic sobre cualquier pieza del mapa o búscala en la lista de la izquierda. Aquí se seleccionó una automáticamente: fíjate en el recuadro amarillo y en las flechas de mover.', run: () => first && focus(first) },
      { title: '3 · Cámbiala desde el panel', text: isHosp ? 'El panel derecho muestra sus parámetros: tipo de área, nombre, nivel, tamaño, puerta, ventanas. Ahora le cambiamos el tipo a "Resonancia magnética": el mobiliario y el letrero se rehacen solos.' : 'El panel derecho muestra sus parámetros: ancho, pisos, estilo, techo, interior, torre. Ahora le subimos los pisos y la pasamos a estilo neoclásico: el edificio se rehace solo, con interior y todo.', run: () => id && patch(id, isHosp ? { kind: 'mri', name: '' } : { floors: Math.min(4, (first.floors || 2) + 1), style: 'neo' }) },
      { title: '4 · Muévela y gírala', text: 'Arrastra las flechas para mover (tecla G) o el aro para girar (tecla R). La rejilla (arriba) hace que todo caiga en múltiplos exactos. Ahora la movimos 8 metros.', run: () => id && patch(id, { x: first.x + 8, rot: 90 }) },
      { title: '5 · Coloca piezas nuevas', text: 'En la paleta de la izquierda eliges una pieza y haces clic en el suelo. Aquí se agregó una fila de árboles y una banca. Esc termina; V duplica la pieza seleccionada.', run: () => commit((d) => ({ ...d, items: [...d.items, ...[0, 1, 2, 3].map((k) => ({ id: uid('tree'), type: 'tree', x: first.x - 10 + k * 5, z: first.z + 22, rot: k * 70, kind: ['maple', 'gold', 'elm', 'oak'][k], s: 1.2 })), { id: uid('bench'), type: 'bench', x: first.x, z: first.z + 18, rot: 0 }] })) },
      { title: '6 · Mira por dentro', text: isHosp ? '"Techos" y "Niveles" (arriba) te dejan abrir el edificio por capas: quita los techos o muestra solo el nivel 1 para ver los quirófanos desde arriba, como un corte de planos.' : '"Techos" (arriba) abre los edificios para ver el interior desde arriba. Los botones de sol/luna cambian la hora para revisar la iluminación.', run: () => { setRoofs(false); setPreset('atardecer'); if (isHosp) setLevelView({ mode: 'only', n: first?.level ?? 1 }) } },
      { title: '7 · Guarda y pruébalo', text: '💾 Guardar escribe el archivo (en desarrollo). ▶ Probar aquí abre el juego justo en la pieza seleccionada. ↶ Deshacer (Ctrl+Z) corrige cualquier error. Y con "🗗 Ventana aparte" abres este editor en otra ventana para tener juego y editor lado a lado.', run: () => { setRoofs(true); setLevelView({ mode: 'all', n: 0 }); setSel(null) } },
    ]
  }, [data.items, isHosp, map, focus, patch, commit])

  const list = useMemo(() => data.items.filter((i) => (!filter || i.type === filter) && (!query || labelOf(i).toLowerCase().includes(query.toLowerCase())) && (levelView.mode === 'all' || i.level == null || (levelView.mode === 'only' ? i.level === levelView.n : i.level <= levelView.n))).slice(0, 150), [data.items, filter, query, levelView])
  const groups = useMemo(() => {
    const g = {}
    for (const [type, c] of Object.entries(CATALOG)) {
      if (type === 'glb' || type === 'room' || (!isHosp && c.group === 'Hospital') || (isHosp && c.group === 'Edificios') || ({ Santuario: ['santuario', 'caverna'], Caverna: ['caverna'] }[c.group] || [mapId]).indexOf(mapId) < 0) continue
      ;(g[c.group] ||= []).push([type, c.label])
    }
    g['Suelo'] = [...(g['Suelo'] || []), ['path', 'Camino (dibujar)']]
    return g
  }, [isHosp, mapId])
  const fields = selItem && CATALOG[selItem.type]?.fields
  const btn = 'rounded border border-white/15 bg-white/5 px-2 py-1 text-xs text-white hover:bg-white/15'
  const placeRoom = (kind) => { const [w, d] = SIZES[kind] || [12, 14]; setTool({ kind: 'place', type: 'room', extra: { kind, w, d, name: '', door: kind === 'corridor' ? '' : 'S', walls: kind === 'corridor' ? '' : 'NSEW' } }) }

  if (!import.meta.env.DEV && !isAdmin) return <div className="p-8 text-white">El editor de mapas es solo para administradores.</div>

  return (
    <div className="fixed inset-0 flex flex-col bg-[#0d1117] text-white">
      <div className="flex flex-wrap items-center gap-2 border-b border-white/10 bg-black/40 px-3 py-2 text-xs">
        <Link to="/dashboard" className={btn}>← Salir</Link>
        <b className="mr-1">Editor de mapas</b>
        <select className={btn} value={mapId} onChange={(e) => { location.search = `?map=${e.target.value}` }}>{Object.values(MAPS).map((m) => <option key={m.id} value={m.id}>{m.label[0]}</option>)}</select>
        <button className={btn} onClick={undo} disabled={!st.past.length}>↶</button>
        <button className={btn} onClick={redo} disabled={!st.future.length}>↷</button>
        <label className="flex items-center gap-1">Rejilla
          <select className={btn} value={snap} onChange={(e) => setSnap(+e.target.value)}>{[0, 0.5, 1, 2, 5].map((v) => <option key={v} value={v}>{v ? `${v} m` : 'libre'}</option>)}</select>
        </label>
        <label className="flex items-center gap-1"><input type="checkbox" checked={grid} onChange={(e) => setGrid(e.target.checked)} /> Cuadrícula</label>
        <label className="flex items-center gap-1"><input type="checkbox" checked={roofs} onChange={(e) => setRoofs(e.target.checked)} /> Techos</label>
        {isHosp && (
          <label className="flex items-center gap-1">Niveles
            <select className={btn} value={`${levelView.mode}:${levelView.n}`} onChange={(e) => { const [mode, n] = e.target.value.split(':'); setLevelView({ mode, n: +n }) }}>
              <option value="all:0">Todos</option>
              {[0, 1, 2, 3, 4].map((n) => <option key={`o${n}`} value={`only:${n}`}>Solo nivel {n}</option>)}
              {[0, 1, 2, 3].map((n) => <option key={`u${n}`} value={`upTo:${n}`}>Hasta nivel {n}</option>)}
            </select>
          </label>
        )}
        {Object.keys(PRESETS).map((k) => <button key={k} className={`${btn} ${preset === k ? '!bg-amber-500/40' : ''}`} onClick={() => setPreset(k)}>{PRESETS[k].icon}</button>)}
        <span className="mx-1 opacity-30">|</span>
        <button className={btn} onClick={save}>💾 Guardar</button>
        <button className={btn} onClick={exportJson}>⬇ JSON</button>
        <label className={`${btn} cursor-pointer`}>⬆ Importar<input type="file" accept=".json" hidden onChange={(e) => importJson(e.target.files[0])} /></label>
        <button className={btn} onClick={playHere}>▶ Probar aquí</button>
        <button className={btn} onClick={openWindow}>🗗 Ventana aparte</button>
        <button className={`${btn} !border-amber-400/50 !bg-amber-500/20`} onClick={startTour}>❓ Cómo funciona</button>
        {draft && <button className={btn} onClick={() => { try { localStorage.removeItem(draftKey(mapId)) } catch { /* nada */ } setSt({ data: map.data, past: [], future: [] }); setMsg('Borrador descartado.') }}>Descartar borrador</button>}
        <span className="ml-auto max-w-[30%] truncate text-amber-300">{msg}</span>
      </div>

      <div className="flex min-h-0 flex-1">
        <div className="flex w-64 shrink-0 flex-col gap-2 overflow-y-auto border-r border-white/10 bg-black/30 p-2 text-xs">
          <div className="flex gap-1">
            <button className={`${btn} flex-1 ${tool.kind === 'select' ? '!bg-amber-500/40' : ''}`} onClick={() => setTool({ kind: 'select' })}>Seleccionar</button>
            <button className={btn} onClick={() => setGizmo(gizmo === 'translate' ? 'rotate' : 'translate')}>{gizmo === 'translate' ? '✥ Mover (G)' : '⟳ Girar (R)'}</button>
          </div>
          <p className="opacity-60">Clic en una pieza = seleccionar. WASD mueve la cámara · arrastrar = orbitar · clic derecho = desplazar · V duplica · Supr borra · Esc termina.</p>
          {isHosp && (
            <details open>
              <summary className="cursor-pointer font-semibold">Cuartos médicos</summary>
              {Object.entries(DEPTS).map(([d, D]) => (
                <details key={d} className="ml-1"><summary className="cursor-pointer" style={{ color: D.color }}>{D.name[0]}</summary>
                  <div className="mt-1 grid grid-cols-1 gap-1">
                    {Object.entries(KINDS).filter(([, K]) => K.dept === d).map(([kind, K]) => <button key={kind} className={`${btn} truncate text-left ${tool.extra?.kind === kind ? '!bg-amber-500/40' : ''}`} onClick={() => placeRoom(kind)}>{K.name[0]}</button>)}
                  </div>
                </details>
              ))}
            </details>
          )}
          {Object.entries(groups).map(([g, arr]) => (
            <details key={g} open={g === 'Edificios' || g === 'Hospital'}>
              <summary className="cursor-pointer font-semibold">{g}</summary>
              <div className="mt-1 grid grid-cols-2 gap-1">
                {arr.map(([type, label]) => <button key={type} className={`${btn} ${tool.type === type ? '!bg-amber-500/40' : ''}`} onClick={() => setTool({ kind: 'place', type })}>{label}</button>)}
              </div>
            </details>
          ))}
          <details>
            <summary className="cursor-pointer font-semibold">Mis modelos (.glb)</summary>
            {GLB_FILES.length ? <div className="mt-1 grid grid-cols-1 gap-1">{GLB_FILES.map((f) => <button key={f} className={btn} onClick={() => setTool({ kind: 'place', type: 'glb', extra: { file: f } })}>{f}</button>)}</div>
              : <p className="mt-1 opacity-60">Pon archivos .glb en src/assets/campus/ y aparecen aquí.</p>}
          </details>
          <hr className="border-white/10" />
          <div className="flex gap-1">
            <select className={`${btn} flex-1`} value={filter} onChange={(e) => setFilter(e.target.value)}>{[['room', 'Cuartos'], ['building', 'Edificios'], ['zone', 'Lugares'], ['altar', 'Altares'], ['', 'Todo'], ['sign', 'Letreros'], ['path', 'Caminos'], ['pave', 'Pavimentos'], ['npc', 'NPC'], ['fence', 'Rejas'], ['tree', 'Árboles']].map(([k, l]) => <option key={l} value={k}>{l}</option>)}</select>
            <input className="w-24 rounded border border-white/15 bg-black/40 px-1.5 text-xs" placeholder="buscar" value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
          <div className="flex flex-col gap-0.5">
            {list.map((i) => <button key={i.id} className={`truncate rounded px-1.5 py-0.5 text-left ${i.id === sel ? 'bg-amber-500/40' : 'hover:bg-white/10'}`} onClick={() => focus(i)}>{labelOf(i)} <span className="opacity-40">({Math.round(i.pts ? i.pts[0][0] : i.x)},{Math.round(i.pts ? i.pts[0][1] : i.z)})</span></button>)}
            {list.length === 150 && <p className="opacity-50">…afina el filtro para ver más</p>}
          </div>
        </div>

        <div className="relative min-w-0 flex-1">
          <Canvas shadows dpr={[1, 1.5]} camera={{ position: [0, 150, 190], fov: 50, near: 0.3, far: 2500 }}>
            <Suspense fallback={null}>
              <CampusScenery data={data} p={PRESETS[preset]} followRef={followRef} editor showRoofs={roofs} levelView={levelView} selectedId={sel} onPick={(id) => { if (tool.kind === 'select' && id) setSel(id) }} />
            </Suspense>
            {grid && <gridHelper args={[900 * S, 90, '#ffd24a', '#5b6573']} position={[0, 0.06, 150 * S]} />}
            <Ground tool={tool} snap={snap} onPlace={place} onDeselect={() => setSel(null)} />
            {selItem && selItem.type === 'path' && <PathMarks item={selItem} />}
            {selItem && selItem.type !== 'path' && tool.kind === 'select' && <Gizmo item={selItem} mode={gizmo} onCommit={(p) => patch(selItem.id, snap ? { ...p, x: Math.round(p.x / snap) * snap, z: Math.round(p.z / snap) * snap } : p)} />}
            <OrbitControls ref={controlsRef} makeDefault enableDamping maxPolarAngle={Math.PI * 0.49} minDistance={4} maxDistance={700} />
            <Rig controlsRef={controlsRef} followRef={followRef} />
          </Canvas>
          {tool.kind !== 'select' && <div className="pointer-events-none absolute left-1/2 top-3 -translate-x-1/2 rounded bg-black/70 px-3 py-1 text-xs text-amber-300">{tool.kind === 'path' ? 'Camino: clic para añadir puntos · Esc/Enter para terminar' : `Colocar: ${tool.extra?.kind ? KINDS[tool.extra.kind].name[0] : CATALOG[tool.type]?.label || 'Camino'} — clic en el suelo · Esc cancela`}</div>}
          {tour && <Tour steps={tourSteps} onClose={closeTour} />}
        </div>

        <div className="w-64 shrink-0 overflow-y-auto border-l border-white/10 bg-black/30 p-2 text-xs">
          {!selItem && <p className="opacity-60">Nada seleccionado. Elige una pieza de la lista o haz clic sobre ella en el mapa.</p>}
          {selItem && (
            <div className="flex flex-col gap-2">
              <b>{labelOf(selItem)}</b>
              {selItem.type !== 'path' && (
                <>
                  <div className="grid grid-cols-2 gap-1.5">
                    {[['x', 'X (m)'], ['z', 'Z (m)'], ['rot', 'Giro (°)'], ['y', 'Altura (m)']].map(([k, l]) => (
                      <label key={k} className="flex flex-col gap-0.5">{l}
                        <input className="rounded border border-white/15 bg-black/40 px-1.5 py-1" type="number" step={k === 'rot' ? 15 : 0.5}
                          value={selItem[k] ?? (k === 'y' ? '' : 0)} placeholder={k === 'y' ? 'auto' : ''}
                          onChange={(e) => patch(selItem.id, { [k]: e.target.value === '' ? undefined : parseFloat(e.target.value) || 0 })} />
                      </label>
                    ))}
                  </div>
                  <div className="flex gap-1">
                    <button className={btn} onClick={() => patch(selItem.id, { rot: (((selItem.rot || 0) - 90) % 360 + 360) % 360 })}>⟲ 90°</button>
                    <button className={btn} onClick={() => patch(selItem.id, { rot: ((selItem.rot || 0) + 90) % 360 })}>⟳ 90°</button>
                    {selItem.w && selItem.d && <span className="ml-auto self-center opacity-60">{selItem.w}×{selItem.d} m</span>}
                  </div>
                </>
              )}
              {selItem.type === 'path' && (
                <>
                  <label className="flex flex-col gap-0.5">Ancho (m)<input className="rounded border border-white/15 bg-black/40 px-1.5 py-1" type="number" value={selItem.w} onChange={(e) => patch(selItem.id, { w: parseFloat(e.target.value) || 4 })} /></label>
                  <label className="flex flex-col gap-0.5">Material<select className="rounded border border-white/15 bg-black/40 px-1.5 py-1" value={selItem.mat} onChange={(e) => patch(selItem.id, { mat: e.target.value })}>{['gravel', 'brick', 'stone', 'asphalt', 'plank'].map((m) => <option key={m}>{m}</option>)}</select></label>
                  <button className={btn} onClick={() => setTool({ kind: 'path', id: selItem.id })}>+ Añadir puntos</button>
                  <button className={btn} onClick={() => selItem.pts.length > 2 && patch(selItem.id, { pts: selItem.pts.slice(0, -1) })}>− Quitar último punto</button>
                </>
              )}
              {selItem.type === 'room' && KINDS[selItem.kind] && (
                <div className="rounded border border-white/10 p-2 leading-snug" style={{ borderColor: DEPTS[KINDS[selItem.kind].dept].color }}>
                  <b style={{ color: DEPTS[KINDS[selItem.kind].dept].color }}>{DEPTS[KINDS[selItem.kind].dept].name[0]}</b>
                  <p className="mt-1 opacity-70">{KINDS[selItem.kind].info[0]}</p>
                </div>
              )}
              {fields?.map((f) => (
                <label key={f.k} className="flex flex-col gap-0.5">{f.label}
                  <FieldInput f={f} value={selItem[f.k] ?? CATALOG[selItem.type].defaults[f.k]} onChange={(v) => patch(selItem.id, { [f.k]: v })} />
                </label>
              ))}
              <div className="flex flex-wrap gap-1">
                <button className={btn} onClick={() => duplicate(selItem.id)}>Duplicar (V)</button>
                {selItem.type === 'room' && <button className={btn} onClick={() => duplicate(selItem.id, 1)}>⬆ Copiar al nivel de arriba</button>}
                <button className={`${btn} !border-red-400/40 !text-red-300`} onClick={() => remove(selItem.id)}>Borrar</button>
              </div>
            </div>
          )}
          <hr className="my-3 border-white/10" />
          <b>Punto de aparición</b>
          <div className="mt-1 grid grid-cols-2 gap-1.5">
            {[0, 1].map((k) => <label key={k} className="flex flex-col gap-0.5">{k ? 'Z' : 'X'} (m)<input className="rounded border border-white/15 bg-black/40 px-1.5 py-1" type="number" value={data.spawn[k]} onChange={(e) => commit((d) => ({ ...d, spawn: d.spawn.map((v, i) => (i === k ? parseFloat(e.target.value) || 0 : v)) }))} /></label>)}
          </div>
          <p className="mt-3 opacity-50">{data.items.length} piezas{isHosp ? ` · ${data.items.filter((i) => i.type === 'room').length} cuartos` : ` · ${data.items.filter((i) => i.type === 'building').length} edificios`}</p>
        </div>
      </div>
    </div>
  )
}
