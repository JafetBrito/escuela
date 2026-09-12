import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import AppTopBar from '../shared/AppTopBar'
import { useRoadmapContentStore } from '../../stores/useRoadmapContentStore'
import { useAuthStore } from '../../stores/useAuthStore'

const LINK_TYPES = [
  { id: '', label: 'Sin curso/tutorial ligado' },
  { id: 'course', label: '📚 Curso (id)' },
  { id: 'tutorial', label: '🧭 Tutorial (id)' },
]

const newNodeId = () => `node-${Date.now().toString(36)}${Math.floor(Math.random() * 1000)}`
const emptyNode = () => ({ id: newNodeId(), title: '', intro: '', resources: [], linkType: '', linkId: '', children: [] })

const emptyRoadmap = (id) => ({
  id,
  title: '',
  description: '',
  icon: '',
  color: '#7c3aed',
  category: '',
  locked: false,
  nodes: [],
})

// ── Operaciones puras sobre el árbol de nodos (recursivo) — cada una busca
// por id en cualquier profundidad y devuelve un árbol nuevo, así el editor
// no necesita pasar índices/rutas hacia abajo, solo el id del nodo. ──
function updateNodeInTree(list, id, patch) {
  return list.map((n) => (
    n.id === id ? { ...n, ...patch }
      : n.children?.length ? { ...n, children: updateNodeInTree(n.children, id, patch) } : n
  ))
}
function removeNodeFromTree(list, id) {
  return list.filter((n) => n.id !== id)
    .map((n) => (n.children?.length ? { ...n, children: removeNodeFromTree(n.children, id) } : n))
}
function addChildInTree(list, parentId, child) {
  return list.map((n) => (
    n.id === parentId ? { ...n, children: [...(n.children ?? []), child] }
      : n.children?.length ? { ...n, children: addChildInTree(n.children, parentId, child) } : n
  ))
}
function moveNodeInTree(list, id, dir) {
  const idx = list.findIndex((n) => n.id === id)
  if (idx !== -1) {
    const target = idx + dir
    if (target < 0 || target >= list.length) return list
    const next = [...list]
    ;[next[idx], next[target]] = [next[target], next[idx]]
    return next
  }
  return list.map((n) => (n.children?.length ? { ...n, children: moveNodeInTree(n.children, id, dir) } : n))
}

function parseResources(text) {
  return text.split('\n').map((l) => l.trim()).filter(Boolean).map((line) => {
    const i = line.indexOf('|')
    return i === -1 ? { label: line, url: line } : { label: line.slice(0, i).trim(), url: line.slice(i + 1).trim() }
  })
}

// Un nodo del editor — recursivo (renderiza sus propios hijos indentados).
// Todas las operaciones (actualizar/quitar/mover/agregar hijo) suben hasta
// el árbol completo por id, ver las funciones puras de arriba.
function NodeEditor({ node, depth, index, siblingsCount, onUpdate, onRemove, onMove, onAddChild }) {
  return (
    <div style={{ marginLeft: depth > 0 ? 16 : 0 }} className={depth > 0 ? 'border-l border-border/60 pl-3' : ''}>
      <div className="mt-2 rounded-xl border border-border/60 p-3">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-bold text-text-muted">{depth > 0 ? '↳' : `${index + 1}.`}</span>
          <div className="flex-1" />
          <button type="button" onClick={() => onMove(node.id, -1)} disabled={index === 0}
            className="text-text-muted hover:text-text disabled:opacity-30">▲</button>
          <button type="button" onClick={() => onMove(node.id, 1)} disabled={index === siblingsCount - 1}
            className="text-text-muted hover:text-text disabled:opacity-30">▼</button>
          <button type="button" onClick={() => onRemove(node.id)} className="shrink-0 text-danger hover:opacity-70">🗑️</button>
        </div>

        <input value={node.title ?? ''} onChange={(e) => onUpdate(node.id, { title: e.target.value })}
          placeholder="Título del tema/subtema"
          className="mt-2 w-full rounded-lg border border-border bg-background px-2 py-1.5 text-sm font-semibold text-text outline-none focus:border-primary" />

        <textarea rows={2} value={node.intro ?? ''} onChange={(e) => onUpdate(node.id, { intro: e.target.value })}
          placeholder="Introducción corta (qué es, por qué importa) — se muestra al abrir este nodo"
          className="mt-1.5 w-full resize-y rounded-lg border border-border bg-background px-2 py-1.5 text-xs text-text outline-none focus:border-primary" />

        <textarea rows={2} value={(node.resources ?? []).map((r) => `${r.label}|${r.url}`).join('\n')}
          onChange={(e) => onUpdate(node.id, { resources: parseResources(e.target.value) })}
          placeholder={'Links de referencia — uno por línea, "etiqueta|url"\nQué es HTTP|https://developer.mozilla.org/es/docs/Web/HTTP/Overview'}
          className="mt-1.5 w-full resize-y rounded-lg border border-border bg-background px-2 py-1.5 text-xs text-text outline-none focus:border-primary" />

        <div className="mt-1.5 flex flex-col gap-1.5 sm:flex-row">
          <select value={node.linkType ?? ''} onChange={(e) => onUpdate(node.id, { linkType: e.target.value })}
            className="rounded-lg border border-border bg-background px-2 py-1.5 text-sm text-text outline-none focus:border-primary">
            {LINK_TYPES.map((lt) => <option key={lt.id} value={lt.id}>{lt.label}</option>)}
          </select>
          {node.linkType && (
            <input value={node.linkId ?? ''} onChange={(e) => onUpdate(node.id, { linkId: e.target.value })}
              placeholder={node.linkType === 'course' ? 'course-001' : 'tutorial-001'}
              className="flex-1 rounded-lg border border-border bg-background px-2 py-1.5 text-sm text-text outline-none focus:border-primary" />
          )}
        </div>

        <button type="button" onClick={() => onAddChild(node.id)}
          className="mt-2 text-xs font-semibold text-primary hover:underline">+ Subtema</button>
      </div>

      {(node.children ?? []).map((child, i) => (
        <NodeEditor key={child.id} node={child} depth={depth + 1} index={i} siblingsCount={node.children.length}
          onUpdate={onUpdate} onRemove={onRemove} onMove={onMove} onAddChild={onAddChild} />
      ))}
    </div>
  )
}

// Editor de road maps — árbol jerárquico expandible (no ruta lineal, ver
// project memory de esta sesión): cada nodo tiene título+introducción+
// links de referencia+enlace opcional a curso/tutorial real, y puede tener
// subtemas anidados sin límite de profundidad.
export default function AdminRoadmapsPage() {
  const isAdmin = useAuthStore((s) => s.isAdmin)
  const catalog = useRoadmapContentStore((s) => s.catalog)
  const roadmaps = useRoadmapContentStore((s) => s.roadmaps)
  const loaded = useRoadmapContentStore((s) => s.loaded)
  const fetchAll = useRoadmapContentStore((s) => s.fetchAll)
  const saveRoadmap = useRoadmapContentStore((s) => s.saveRoadmap)

  const [roadmapId, setRoadmapId] = useState('')
  const [creatingId, setCreatingId] = useState('')
  const [form, setForm] = useState(null) // metadata sin `nodes`
  const [nodes, setNodes] = useState([])
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => { fetchAll() }, [fetchAll])

  const selectRoadmap = (id) => {
    setRoadmapId(id)
    if (!id) { setForm(null); setNodes([]); return }
    const roadmap = roadmaps[id] ?? emptyRoadmap(id)
    const { nodes: roadmapNodes, ...rest } = roadmap
    setForm(rest)
    setNodes(roadmapNodes ?? [])
    setMsg('')
  }

  if (!isAdmin?.()) {
    return (
      <div className="flex min-h-screen flex-col bg-background text-text">
        <AppTopBar />
        <div className="flex flex-1 items-center justify-center">
          <p className="text-text-muted">Acceso restringido a administradores.</p>
        </div>
      </div>
    )
  }

  const updateForm = (patch) => setForm((f) => ({ ...f, ...patch }))
  const addTopNode = () => setNodes((ns) => [...ns, emptyNode()])
  const updateNode = (id, patch) => setNodes((ns) => updateNodeInTree(ns, id, patch))
  const removeNode = (id) => setNodes((ns) => removeNodeFromTree(ns, id))
  const moveNode = (id, dir) => setNodes((ns) => moveNodeInTree(ns, id, dir))
  const addChildNode = (parentId) => setNodes((ns) => addChildInTree(ns, parentId, emptyNode()))

  const handleCreate = () => {
    const id = creatingId.trim()
    if (!id) return
    setCreatingId('')
    selectRoadmap(id)
  }

  const handleSave = async () => {
    setBusy(true)
    const { error } = await saveRoadmap({ ...form, id: roadmapId, nodes })
    setBusy(false)
    setMsg(error ? `❌ ${error.message}` : '✅ Guardado.')
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-text">
      <AppTopBar />
      <main className="flex-1 px-4 py-8 md:px-8">
        <div className="mx-auto max-w-3xl">
          <Link to="/admin" className="mb-3 inline-block text-sm text-text-muted hover:text-primary">← Volver al Panel Admin</Link>
          <div className="overflow-hidden rounded-2xl bg-gradient-to-r from-sky-700 to-indigo-800 px-6 py-8 shadow-lg">
            <h1 className="text-3xl font-extrabold text-white">🗺️ Road Maps</h1>
            <p className="mt-1 text-sm font-medium text-white/85">
              Árbol de temas y subtemas — se ve en /roadmap/&lt;id&gt; al instante, sin deploy.
            </p>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-3 rounded-2xl border border-border bg-surface p-4 sm:grid-cols-[1fr_auto]">
            <div>
              <label className="text-[10px] font-bold uppercase text-text-muted">Road map</label>
              <select value={roadmapId} onChange={(e) => selectRoadmap(e.target.value)} disabled={!loaded}
                className="mt-0.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text outline-none focus:border-primary">
                <option value="">Elige un road map…</option>
                {catalog.map((r) => <option key={r.id} value={r.id}>{r.icon} {r.title || r.id}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase text-text-muted">Road map nuevo (id)</label>
              <div className="mt-0.5 flex gap-1.5">
                <input value={creatingId} onChange={(e) => setCreatingId(e.target.value)} placeholder="roadmap-frontend"
                  className="w-36 rounded-lg border border-border bg-background px-3 py-2 text-sm text-text outline-none focus:border-primary" />
                <button type="button" onClick={handleCreate} disabled={!creatingId.trim()}
                  className="rounded-lg bg-primary/20 px-3 py-2 text-xs font-bold text-primary disabled:opacity-40">+ Crear</button>
              </div>
            </div>
          </div>

          {form && (
            <div className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-3 rounded-2xl border border-border bg-surface p-4 sm:grid-cols-3">
                <div className="col-span-2 sm:col-span-3">
                  <label className="text-[10px] font-bold uppercase text-text-muted">Título</label>
                  <input value={form.title ?? ''} onChange={(e) => updateForm({ title: e.target.value })}
                    className="mt-0.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text outline-none focus:border-primary" />
                </div>
                <div className="col-span-2 sm:col-span-3">
                  <label className="text-[10px] font-bold uppercase text-text-muted">Descripción</label>
                  <textarea rows={2} value={form.description ?? ''} onChange={(e) => updateForm({ description: e.target.value })}
                    className="mt-0.5 w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm text-text outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-text-muted">Icono (emoji)</label>
                  <input value={form.icon ?? ''} onChange={(e) => updateForm({ icon: e.target.value })}
                    className="mt-0.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-text-muted">Color</label>
                  <input value={form.color ?? ''} onChange={(e) => updateForm({ color: e.target.value })}
                    className="mt-0.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-text-muted">Categoría</label>
                  <input value={form.category ?? ''} onChange={(e) => updateForm({ category: e.target.value })}
                    className="mt-0.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text outline-none focus:border-primary" />
                </div>
                <label className="col-span-2 flex items-center gap-2 text-sm text-text sm:col-span-3">
                  <input type="checkbox" checked={Boolean(form.locked)} onChange={(e) => updateForm({ locked: e.target.checked })} />
                  🔒 Bloqueado (aparece como "Próximamente", sin contenido accesible)
                </label>
              </div>

              <div className="rounded-2xl border border-border bg-surface p-4">
                <div className="mb-1 flex items-center justify-between">
                  <p className="text-xs font-bold uppercase tracking-wide text-text-muted">Temas y subtemas</p>
                  <button type="button" onClick={addTopNode} className="rounded-lg bg-primary/20 px-3 py-1.5 text-xs font-bold text-primary">+ Nuevo tema</button>
                </div>
                {nodes.length === 0 && <p className="mt-2 text-sm text-text-muted">Sin temas todavía.</p>}
                {nodes.map((n, i) => (
                  <NodeEditor key={n.id} node={n} depth={0} index={i} siblingsCount={nodes.length}
                    onUpdate={updateNode} onRemove={removeNode} onMove={moveNode} onAddChild={addChildNode} />
                ))}
              </div>

              <div className="flex items-center gap-3">
                <button type="button" onClick={handleSave} disabled={busy}
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-background disabled:opacity-50">
                  {busy ? 'Guardando…' : '💾 Guardar road map'}
                </button>
                {msg && <p className="text-xs text-text-muted">{msg}</p>}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
