import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import AppTopBar from '../shared/AppTopBar'
import { useRoadmapContentStore } from '../../stores/useRoadmapContentStore'
import { useAuthStore } from '../../stores/useAuthStore'

const LINK_TYPES = [
  { id: '', label: 'Sin enlace' },
  { id: 'course', label: '📚 Curso (id)' },
  { id: 'tutorial', label: '🧭 Tutorial (id)' },
  { id: 'external', label: '🔗 URL externa' },
]

const emptyNode = (nextId) => ({ id: `node-${nextId}`, title: '', description: '', linkType: '', linkId: '', linkUrl: '' })

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

// Editor de road maps — calco de AdminTutorialsPage.jsx para la metadata,
// y del editor de módulos de AdminCoursesPage.jsx para la lista de nodos
// (+ Nuevo/mover/quitar), pero sin quiz — un nodo es título+descripción+
// enlace opcional (ver migration_064.sql).
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

  // Sin useEffect reactivo — el select y "+ Crear" sincronizan `form`/
  // `nodes` directo en su propio handler (evita "setState en efecto").
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
  const addNode = () => setNodes((ns) => [...ns, emptyNode(ns.length)])
  const removeNode = (id) => setNodes((ns) => ns.filter((n) => n.id !== id))
  const updateNode = (id, patch) => setNodes((ns) => ns.map((n) => (n.id === id ? { ...n, ...patch } : n)))
  const moveNode = (index, dir) => setNodes((ns) => {
    const target = index + dir
    if (target < 0 || target >= ns.length) return ns
    const next = [...ns]
    ;[next[index], next[target]] = [next[target], next[index]]
    return next
  })

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
    setMsg(error ? `❌ ${error.message}` : `✅ Guardado (${nodes.length} nodos).`)
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
              Edita un road map y sus nodos — se ve en /roadmap/&lt;id&gt; al instante, sin deploy.
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
                <input value={creatingId} onChange={(e) => setCreatingId(e.target.value)} placeholder="roadmap-python"
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
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-xs font-bold uppercase tracking-wide text-text-muted">Nodos ({nodes.length})</p>
                  <button type="button" onClick={addNode} className="rounded-lg bg-primary/20 px-3 py-1.5 text-xs font-bold text-primary">+ Nuevo nodo</button>
                </div>
                <div className="space-y-3">
                  {nodes.map((n, i) => (
                    <div key={n.id} className="rounded-xl border border-border/60 p-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-text-muted">{i + 1}.</span>
                        <div className="flex-1" />
                        <button type="button" onClick={() => moveNode(i, -1)} disabled={i === 0}
                          className="text-text-muted hover:text-text disabled:opacity-30">▲</button>
                        <button type="button" onClick={() => moveNode(i, 1)} disabled={i === nodes.length - 1}
                          className="text-text-muted hover:text-text disabled:opacity-30">▼</button>
                        <button type="button" onClick={() => removeNode(n.id)} className="shrink-0 text-danger hover:opacity-70">🗑️</button>
                      </div>

                      <div className="mt-2 grid grid-cols-1 gap-1.5 pl-5 sm:grid-cols-2">
                        <input value={n.title ?? ''} onChange={(e) => updateNode(n.id, { title: e.target.value })}
                          placeholder="Título del nodo"
                          className="rounded-lg border border-border bg-background px-2 py-1.5 text-sm text-text outline-none focus:border-primary" />
                        <input value={n.description ?? ''} onChange={(e) => updateNode(n.id, { description: e.target.value })}
                          placeholder="Descripción corta"
                          className="rounded-lg border border-border bg-background px-2 py-1.5 text-sm text-text outline-none focus:border-primary" />
                      </div>

                      <div className="mt-2 flex flex-col gap-1.5 pl-5 sm:flex-row">
                        <select value={n.linkType ?? ''} onChange={(e) => updateNode(n.id, { linkType: e.target.value })}
                          className="rounded-lg border border-border bg-background px-2 py-1.5 text-sm text-text outline-none focus:border-primary">
                          {LINK_TYPES.map((lt) => <option key={lt.id} value={lt.id}>{lt.label}</option>)}
                        </select>
                        {n.linkType === 'external' ? (
                          <input value={n.linkUrl ?? ''} onChange={(e) => updateNode(n.id, { linkUrl: e.target.value })}
                            placeholder="https://…"
                            className="flex-1 rounded-lg border border-border bg-background px-2 py-1.5 text-sm text-text outline-none focus:border-primary" />
                        ) : n.linkType && (
                          <input value={n.linkId ?? ''} onChange={(e) => updateNode(n.id, { linkId: e.target.value })}
                            placeholder={n.linkType === 'course' ? 'course-001' : 'tutorial-001'}
                            className="flex-1 rounded-lg border border-border bg-background px-2 py-1.5 text-sm text-text outline-none focus:border-primary" />
                        )}
                      </div>
                    </div>
                  ))}
                  {nodes.length === 0 && <p className="text-sm text-text-muted">Sin nodos todavía.</p>}
                </div>
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
