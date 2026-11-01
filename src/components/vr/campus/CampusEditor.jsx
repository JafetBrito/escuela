import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, TransformControls, Line } from '@react-three/drei'
import * as THREE from 'three'
import { Link } from 'react-router-dom'
import CampusScenery from './CampusScenery'
import { CAMPUS_S, itemY } from './campusWorld'
import { CATALOG } from './campusKit'
import { GLB_FILES } from './campusAssets'
import { PRESETS } from '../lookdev/plazaWorld'
import baseLayout from '../../../data/campusLayout.json'
import { useAuthStore } from '../../../stores/useAuthStore'

// ─────────────────────────────────────────────────────────────────────────────
// Editor del campus (/vr/editor): colocas y mueves piezas con el mouse y el mapa se guarda como DATOS
// (src/data/campusLayout.json), no como código. El juego (/vr/campus) lee ese mismo archivo, así que lo
// que dejas aquí es lo que se camina allá. En `npm run dev` "Guardar" escribe el archivo directo; en
// producción descarga el JSON. Cualquier herramienta externa (Blender, un script) puede generar o editar
// ese JSON — ver scripts/campus/LEEME.md — y los .glb de src/assets/campus/ salen en la paleta.
// ─────────────────────────────────────────────────────────────────────────────

const S = CAMPUS_S
const rad = (d) => (d * Math.PI) / 180
const DRAFT = 'campus-layout-draft'
const uid = (type) => `${type[0]}${Date.now().toString(36)}${Math.floor(Math.random() * 1e3)}`
const serialize = (d) => `{"version":${d.version || 1},"spawn":${JSON.stringify(d.spawn)},"items":[\n${d.items.map((i) => JSON.stringify(i)).join(',\n')}\n]}`
const loadDraft = () => { try { const j = JSON.parse(localStorage.getItem(DRAFT)); return j?.items ? j : null } catch { return null } }
const labelOf = (it) => `${CATALOG[it.type]?.label || (it.type === 'path' ? 'Camino' : it.type)}${it.sign ? ` · ${it.sign}` : it.file ? ` · ${it.file}` : it.interior ? ` · ${it.interior}` : ''}`
const TYPE_FILTERS = [['building', 'Edificios'], ['', 'Todo'], ['path', 'Caminos'], ['pave', 'Pavimentos'], ['npc', 'NPC'], ['fence', 'Rejas'], ['tree', 'Árboles']]

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
    ref.current.position.set(item.x * S, itemY(item) * S, item.z * S)
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
  if (f.kind === 'sel') return <select className={cls} value={value ?? ''} onChange={(e) => onChange(e.target.value)}>{f.opts.map((o) => <option key={o} value={o}>{o}</option>)}</select>
  if (f.kind === 'bool') return <input type="checkbox" checked={!!value} onChange={(e) => onChange(e.target.checked)} />
  if (f.kind === 'text') return <input className={cls} value={value ?? ''} onChange={(e) => onChange(e.target.value)} />
  return <input className={cls} type="number" min={f.min} max={f.max} step={f.step} value={value ?? 0} onChange={(e) => onChange(parseFloat(e.target.value) || 0)} />
}

export default function CampusEditor() {
  const isAdmin = useAuthStore((s) => s.profile?.role === 'admin')
  const [draft] = useState(loadDraft)
  const [st, setSt] = useState(() => ({ data: draft || baseLayout, past: [], future: [] }))
  const [sel, setSel] = useState(null)
  const [tool, setTool] = useState({ kind: 'select' }) // select | place(type, extra) | path(id)
  const [gizmo, setGizmo] = useState('translate')
  const [snap, setSnap] = useState(1)
  const [roofs, setRoofs] = useState(true)
  const [preset, setPreset] = useState('dia')
  const [filter, setFilter] = useState('building')
  const [query, setQuery] = useState('')
  const [msg, setMsg] = useState(draft ? 'Borrador sin guardar recuperado.' : '')
  const controlsRef = useRef(), followRef = useRef(new THREE.Vector3())
  const data = st.data
  const selItem = data.items.find((i) => i.id === sel)

  const commit = useCallback((fn) => setSt((s) => ({ data: fn(s.data), past: [...s.past.slice(-80), s.data], future: [] })), [])
  const undo = () => setSt((s) => (s.past.length ? { data: s.past[s.past.length - 1], past: s.past.slice(0, -1), future: [s.data, ...s.future] } : s))
  const redo = () => setSt((s) => (s.future.length ? { data: s.future[0], past: [...s.past, s.data], future: s.future.slice(1) } : s))
  const patch = useCallback((id, p) => commit((d) => ({ ...d, items: d.items.map((i) => (i.id === id ? { ...i, ...p } : i)) })), [commit])
  const remove = useCallback((id) => { commit((d) => ({ ...d, items: d.items.filter((i) => i.id !== id) })); setSel(null) }, [commit])
  const duplicate = useCallback((id) => {
    const src = data.items.find((i) => i.id === id)
    if (!src) return
    const copy = { ...src, id: uid(src.type), x: src.x + 4, z: src.z + 4, ...(src.pts ? { pts: src.pts.map(([x, z]) => [x + 4, z + 4]) } : {}) }
    commit((d) => ({ ...d, items: [...d.items, copy] })); setSel(copy.id)
  }, [commit, data.items])

  useEffect(() => { try { localStorage.setItem(DRAFT, JSON.stringify(data)) } catch { /* sin almacenamiento: solo no hay borrador */ } }, [data])

  const place = (x, z) => {
    if (tool.kind === 'path') { // añadir punto al camino en curso
      patch(tool.id, { pts: [...data.items.find((i) => i.id === tool.id).pts, [x, z]] }); return
    }
    if (tool.type === 'path') {
      const id = uid('path'); commit((d) => ({ ...d, items: [...d.items, { id, type: 'path', pts: [[x, z]], w: 5, mat: 'gravel' }] })); setSel(id); setTool({ kind: 'path', id }); return
    }
    const it = { id: uid(tool.type), type: tool.type, x, z, rot: 0, ...CATALOG[tool.type].defaults, ...(tool.extra || {}) }
    commit((d) => ({ ...d, items: [...d.items, it] })); setSel(it.id)
    if (!CATALOG[tool.type].instanced && tool.type !== 'pave') setTool({ kind: 'select' })
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

  const focus = (it) => {
    setSel(it.id); setTool({ kind: 'select' })
    const [x, z] = it.pts ? it.pts[0] : [it.x, it.z], c = controlsRef.current
    if (c) { const dx = x * S - c.target.x, dz = z * S - c.target.z; c.target.set(x * S, 0, z * S); c.object.position.add(new THREE.Vector3(dx, 0, dz)) }
  }
  const save = async () => {
    try {
      const r = await fetch('/__campus/save', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: serialize(data) })
      if (!r.ok) throw new Error()
      try { localStorage.removeItem(DRAFT) } catch { /* nada */ }
      setMsg('Guardado en src/data/campusLayout.json — haz commit para subirlo.'); return true
    } catch { exportJson(); setMsg('Sin servidor de desarrollo: se descargó el JSON. Cópialo a src/data/campusLayout.json.'); return false }
  }
  const exportJson = () => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([serialize(data)], { type: 'application/json' })); a.download = 'campusLayout.json'; a.click() }
  const importJson = (file) => file?.text().then((t) => { const j = JSON.parse(t); if (!Array.isArray(j.items)) throw new Error('no es un layout'); commit(() => ({ spawn: [0, 132], version: 1, ...j })); setMsg(`Importado: ${j.items.length} piezas.`) }).catch((e) => setMsg(`No se pudo importar: ${e.message}`))
  const playHere = async () => {
    const it = selItem, x = it ? (it.pts ? it.pts[0][0] : it.x) : followRef.current.x / S, z = it ? (it.pts ? it.pts[0][1] : it.z) : followRef.current.z / S
    await save(); window.open(`/vr/campus?spawn=${Math.round(x)},${Math.round(z + (it?.type === 'building' ? 6 : 0))}`, '_blank')
  }

  const list = useMemo(() => data.items.filter((i) => (!filter || i.type === filter) && (!query || labelOf(i).toLowerCase().includes(query.toLowerCase()))).slice(0, 150), [data.items, filter, query])
  const groups = useMemo(() => {
    const g = {}
    for (const [type, c] of Object.entries(CATALOG)) if (type !== 'glb') (g[c.group] ||= []).push([type, c.label])
    g['Suelo'] = [...(g['Suelo'] || []), ['path', 'Camino (dibujar)']]
    return g
  }, [])
  const fields = selItem && CATALOG[selItem.type]?.fields
  const btn = 'rounded border border-white/15 bg-white/5 px-2 py-1 text-xs text-white hover:bg-white/15'

  if (!import.meta.env.DEV && !isAdmin) return <div className="p-8 text-white">El editor del campus es solo para administradores.</div>

  return (
    <div className="fixed inset-0 flex flex-col bg-[#0d1117] text-white">
      <div className="flex flex-wrap items-center gap-2 border-b border-white/10 bg-black/40 px-3 py-2 text-xs">
        <Link to="/dashboard" className={btn}>← Salir</Link>
        <b className="mr-2">Editor del campus</b>
        <button className={btn} onClick={undo} disabled={!st.past.length}>↶ Deshacer</button>
        <button className={btn} onClick={redo} disabled={!st.future.length}>↷ Rehacer</button>
        <label className="flex items-center gap-1">Rejilla
          <select className={btn} value={snap} onChange={(e) => setSnap(+e.target.value)}>{[0, 0.5, 1, 2, 5].map((v) => <option key={v} value={v}>{v ? `${v} m` : 'libre'}</option>)}</select>
        </label>
        <label className="flex items-center gap-1"><input type="checkbox" checked={roofs} onChange={(e) => setRoofs(e.target.checked)} /> Techos</label>
        {Object.keys(PRESETS).map((k) => <button key={k} className={`${btn} ${preset === k ? '!bg-amber-500/40' : ''}`} onClick={() => setPreset(k)}>{PRESETS[k].icon}</button>)}
        <span className="mx-1 opacity-30">|</span>
        <button className={btn} onClick={save}>💾 Guardar</button>
        <button className={btn} onClick={exportJson}>⬇ JSON</button>
        <label className={`${btn} cursor-pointer`}>⬆ Importar<input type="file" accept=".json" hidden onChange={(e) => importJson(e.target.files[0])} /></label>
        <button className={btn} onClick={playHere}>▶ Probar aquí</button>
        {draft && <button className={btn} onClick={() => { try { localStorage.removeItem(DRAFT) } catch { /* nada */ } setSt({ data: baseLayout, past: [], future: [] }); setMsg('Borrador descartado.') }}>Descartar borrador</button>}
        <span className="ml-auto max-w-[40%] truncate text-amber-300">{msg}</span>
      </div>

      <div className="flex min-h-0 flex-1">
        <div className="flex w-64 shrink-0 flex-col gap-2 overflow-y-auto border-r border-white/10 bg-black/30 p-2 text-xs">
          <div className="flex gap-1">
            <button className={`${btn} flex-1 ${tool.kind === 'select' ? '!bg-amber-500/40' : ''}`} onClick={() => setTool({ kind: 'select' })}>Seleccionar</button>
            <button className={btn} onClick={() => setGizmo(gizmo === 'translate' ? 'rotate' : 'translate')}>{gizmo === 'translate' ? '✥ Mover (G)' : '⟳ Girar (R)'}</button>
          </div>
          <p className="opacity-60">Clic en una pieza = seleccionar. Teclas: WASD mueve la cámara · arrastrar = orbitar · clic derecho = desplazar · V duplica · Supr borra · Esc termina.</p>
          {Object.entries(groups).map(([g, arr]) => (
            <details key={g} open={g === 'Edificios'}>
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
            <select className={`${btn} flex-1`} value={filter} onChange={(e) => setFilter(e.target.value)}>{TYPE_FILTERS.map(([k, l]) => <option key={l} value={k}>{l}</option>)}</select>
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
              <CampusScenery data={data} p={PRESETS[preset]} followRef={followRef} editor showRoofs={roofs} selectedId={sel} onPick={(id) => { if (tool.kind === 'select' && id) { setSel(id) } }} />
            </Suspense>
            <Ground tool={tool} snap={snap} onPlace={place} onDeselect={() => setSel(null)} />
            {selItem && selItem.type === 'path' && <PathMarks item={selItem} />}
            {selItem && selItem.type !== 'path' && tool.kind === 'select' && <Gizmo item={selItem} mode={gizmo} onCommit={(p) => patch(selItem.id, snap ? { ...p, x: Math.round(p.x / snap) * snap, z: Math.round(p.z / snap) * snap } : p)} />}
            <OrbitControls ref={controlsRef} makeDefault enableDamping maxPolarAngle={Math.PI * 0.49} minDistance={4} maxDistance={700} />
            <Rig controlsRef={controlsRef} followRef={followRef} />
          </Canvas>
          {tool.kind !== 'select' && <div className="pointer-events-none absolute left-1/2 top-3 -translate-x-1/2 rounded bg-black/70 px-3 py-1 text-xs text-amber-300">{tool.kind === 'path' ? 'Camino: clic para añadir puntos · Esc/Enter para terminar' : `Colocar: ${CATALOG[tool.type]?.label || 'Camino'} — clic en el suelo · Esc cancela`}</div>}
        </div>

        <div className="w-64 shrink-0 overflow-y-auto border-l border-white/10 bg-black/30 p-2 text-xs">
          {!selItem && <p className="opacity-60">Nada seleccionado. Elige una pieza de la lista o haz clic sobre ella en el mapa.</p>}
          {selItem && (
            <div className="flex flex-col gap-2">
              <b>{labelOf(selItem)}</b>
              {selItem.type !== 'path' && (
                <div className="grid grid-cols-2 gap-1.5">
                  {[['x', 'X (m)'], ['z', 'Z (m)'], ['rot', 'Giro (°)'], ['y', 'Altura (m)']].map(([k, l]) => (
                    <label key={k} className="flex flex-col gap-0.5">{l}
                      <input className="rounded border border-white/15 bg-black/40 px-1.5 py-1" type="number" step={k === 'rot' ? 15 : 0.5}
                        value={selItem[k] ?? (k === 'y' ? '' : 0)} placeholder={k === 'y' ? 'auto' : ''}
                        onChange={(e) => patch(selItem.id, { [k]: e.target.value === '' ? undefined : parseFloat(e.target.value) || 0 })} />
                    </label>
                  ))}
                </div>
              )}
              {selItem.type === 'path' && (
                <>
                  <label className="flex flex-col gap-0.5">Ancho (m)<input className="rounded border border-white/15 bg-black/40 px-1.5 py-1" type="number" value={selItem.w} onChange={(e) => patch(selItem.id, { w: parseFloat(e.target.value) || 4 })} /></label>
                  <label className="flex flex-col gap-0.5">Material<select className="rounded border border-white/15 bg-black/40 px-1.5 py-1" value={selItem.mat} onChange={(e) => patch(selItem.id, { mat: e.target.value })}>{['gravel', 'brick', 'stone', 'asphalt', 'plank'].map((m) => <option key={m}>{m}</option>)}</select></label>
                  <button className={btn} onClick={() => setTool({ kind: 'path', id: selItem.id })}>+ Añadir puntos</button>
                  <button className={btn} onClick={() => selItem.pts.length > 2 && patch(selItem.id, { pts: selItem.pts.slice(0, -1) })}>− Quitar último punto</button>
                </>
              )}
              {fields?.map((f) => (
                <label key={f.k} className="flex flex-col gap-0.5">{f.label}
                  <FieldInput f={f} value={selItem[f.k] ?? CATALOG[selItem.type].defaults[f.k]} onChange={(v) => patch(selItem.id, { [f.k]: v })} />
                </label>
              ))}
              <div className="flex gap-1">
                <button className={btn} onClick={() => duplicate(selItem.id)}>Duplicar (V)</button>
                <button className={`${btn} !border-red-400/40 !text-red-300`} onClick={() => remove(selItem.id)}>Borrar</button>
              </div>
            </div>
          )}
          <hr className="my-3 border-white/10" />
          <b>Punto de aparición</b>
          <div className="mt-1 grid grid-cols-2 gap-1.5">
            {[0, 1].map((k) => <label key={k} className="flex flex-col gap-0.5">{k ? 'Z' : 'X'} (m)<input className="rounded border border-white/15 bg-black/40 px-1.5 py-1" type="number" value={data.spawn[k]} onChange={(e) => commit((d) => ({ ...d, spawn: d.spawn.map((v, i) => (i === k ? parseFloat(e.target.value) || 0 : v)) }))} /></label>)}
          </div>
          <p className="mt-3 opacity-50">{data.items.length} piezas · {data.items.filter((i) => i.type === 'building').length} edificios</p>
        </div>
      </div>
    </div>
  )
}
