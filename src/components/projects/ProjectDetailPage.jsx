import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import AppTopBar from '../shared/AppTopBar'
import ResourceGallery from '../shared/ResourceGallery'
import { useProjectsStore } from '../../stores/useProjectsStore'
import { useAuthStore } from '../../stores/useAuthStore'

const MOODS = ['😀', '🙂', '😐', '😕', '😣']
const rid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

function SectionCard({ icon, title, children }) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-4">
      <p className="mb-3 text-xs font-bold uppercase tracking-wide text-text-muted">{icon} {title}</p>
      {children}
    </div>
  )
}

export default function ProjectDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const session = useAuthStore((s) => s.session)
  const isAdmin = useAuthStore((s) => s.isAdmin)
  const fetchProject = useProjectsStore((s) => s.fetchProject)
  const updateProject = useProjectsStore((s) => s.updateProject)
  const deleteProject = useProjectsStore((s) => s.deleteProject)

  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState('en_progreso')
  const [notes, setNotes] = useState([])
  const [checklist, setChecklist] = useState([])
  const [resources, setResources] = useState([])
  const [ownerId, setOwnerId] = useState(null)

  const [newChecklistText, setNewChecklistText] = useState('')
  const [newResource, setNewResource] = useState({ label: '', url: '' })
  const [saving, setSaving] = useState(false)
  const [savedMsg, setSavedMsg] = useState('')

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    fetchProject(id).then(({ data }) => {
      if (cancelled) return
      if (!data) { setNotFound(true); setLoading(false); return }
      setTitle(data.title)
      setDescription(data.description ?? '')
      setStatus(data.status)
      setNotes(data.notes ?? [])
      setChecklist(data.checklist ?? [])
      setResources(data.resources ?? [])
      setOwnerId(data.student_id)
      setLoading(false)
    })
    return () => { cancelled = true }
  }, [id, fetchProject])

  const isViewerOwner = session?.user?.id === ownerId
  const viewingAsAdmin = isAdmin?.() && !isViewerOwner

  const handleSave = async () => {
    setSaving(true)
    const { error } = await updateProject(id, { title, description, status, notes, checklist, resources })
    setSaving(false)
    setSavedMsg(error ? `❌ ${error.message}` : '✅ Guardado')
    setTimeout(() => setSavedMsg(''), 2500)
  }

  const handleDelete = async () => {
    if (!window.confirm('¿Eliminar este proyecto? Esta acción no se puede deshacer.')) return
    await deleteProject(id)
    navigate('/proyectos')
  }

  // ── Notas ──────────────────────────────────────────────────────────────
  const addNote = () => setNotes((ns) => [...ns, { id: rid(), text: '', date: '', category: '', mood: '' }])
  const updateNote = (noteId, field, value) => setNotes((ns) => ns.map((n) => (n.id === noteId ? { ...n, [field]: value } : n)))
  const removeNote = (noteId) => setNotes((ns) => ns.filter((n) => n.id !== noteId))

  // ── Checklist ──────────────────────────────────────────────────────────
  const addChecklistItem = () => {
    if (!newChecklistText.trim()) return
    setChecklist((cs) => [...cs, { id: rid(), text: newChecklistText.trim(), done: false }])
    setNewChecklistText('')
  }
  const toggleChecklistItem = (itemId) => setChecklist((cs) => cs.map((c) => (c.id === itemId ? { ...c, done: !c.done } : c)))
  const removeChecklistItem = (itemId) => setChecklist((cs) => cs.filter((c) => c.id !== itemId))

  // ── Recursos ───────────────────────────────────────────────────────────
  const addResource = () => {
    if (!newResource.label.trim() || !newResource.url.trim()) return
    setResources((rs) => [...rs, { label: newResource.label.trim(), url: newResource.url.trim() }])
    setNewResource({ label: '', url: '' })
  }
  const removeResource = (idx) => setResources((rs) => rs.filter((_, i) => i !== idx))

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col bg-background text-text">
        <AppTopBar />
        <div className="flex flex-1 items-center justify-center text-text-muted">Cargando…</div>
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="flex min-h-screen flex-col bg-background text-text">
        <AppTopBar />
        <div className="flex flex-1 flex-col items-center justify-center gap-3 text-text-muted">
          <p>No encontramos este proyecto.</p>
          <Link to="/proyectos" className="text-primary hover:underline">← Mis Proyectos</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-text">
      <AppTopBar />

      <main className="flex-1 px-4 py-8 md:px-8">
        <div className="mx-auto max-w-3xl space-y-4">
          <Link to="/proyectos" className="inline-block text-sm text-text-muted hover:text-primary">← Mis Proyectos</Link>

          {viewingAsAdmin && (
            <div className="rounded-xl border border-primary/30 bg-primary/10 px-4 py-2 text-xs font-semibold text-primary">
              👁️ Estás viendo el proyecto de un alumno como administrador.
            </div>
          )}

          {/* Encabezado */}
          <div className="rounded-2xl border border-border bg-surface p-4 space-y-3">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Título del proyecto"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-lg font-bold text-text outline-none focus:border-primary"
            />
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descripción del proyecto…"
              className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm text-text outline-none focus:border-primary"
            />
            <div className="flex flex-wrap items-center gap-2">
              <label className="text-[10px] font-bold uppercase text-text-muted">Estado:</label>
              {[
                { key: 'en_progreso', label: '🟡 En progreso' },
                { key: 'completado', label: '✅ Completado' },
              ].map((s) => (
                <button
                  key={s.key}
                  type="button"
                  onClick={() => setStatus(s.key)}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-bold transition ${
                    status === s.key ? 'border-primary bg-primary/10 text-primary' : 'border-border text-text-muted hover:text-text'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Notas */}
          <SectionCard icon="🧠" title="Notas">
            <div className="space-y-2">
              {notes.map((n) => (
                <div key={n.id} className="grid grid-cols-1 gap-1.5 rounded-xl border border-border/60 p-2 sm:grid-cols-[1fr_110px_120px_60px_auto]">
                  <input
                    value={n.text}
                    onChange={(e) => updateNote(n.id, 'text', e.target.value)}
                    placeholder="Pensamiento / nota…"
                    className="rounded-lg border border-border bg-background px-2 py-1.5 text-sm text-text outline-none focus:border-primary"
                  />
                  <input
                    type="date"
                    value={n.date}
                    onChange={(e) => updateNote(n.id, 'date', e.target.value)}
                    className="rounded-lg border border-border bg-background px-2 py-1.5 text-sm text-text outline-none focus:border-primary"
                  />
                  <input
                    value={n.category}
                    onChange={(e) => updateNote(n.id, 'category', e.target.value)}
                    placeholder="Categoría"
                    className="rounded-lg border border-border bg-background px-2 py-1.5 text-sm text-text outline-none focus:border-primary"
                  />
                  <select
                    value={n.mood}
                    onChange={(e) => updateNote(n.id, 'mood', e.target.value)}
                    className="rounded-lg border border-border bg-background px-1 py-1.5 text-sm text-text outline-none focus:border-primary"
                  >
                    <option value="">—</option>
                    {MOODS.map((m) => <option key={m} value={m}>{m}</option>)}
                  </select>
                  <button type="button" onClick={() => removeNote(n.id)} className="rounded-lg border border-danger/30 px-2 text-xs text-danger hover:bg-danger/10">🗑️</button>
                </div>
              ))}
              {notes.length === 0 && <p className="text-xs text-text-muted">Sin notas todavía.</p>}
              <button type="button" onClick={addNote} className="rounded-lg border border-dashed border-border px-3 py-1.5 text-xs font-semibold text-text-muted hover:text-primary">
                + Agregar nota
              </button>
            </div>
          </SectionCard>

          {/* Checklist */}
          <SectionCard icon="✅" title="Checklist">
            <div className="space-y-1.5">
              {checklist.map((c) => (
                <div key={c.id} className="flex items-center gap-2 rounded-lg border border-border/60 px-3 py-2">
                  <input type="checkbox" checked={c.done} onChange={() => toggleChecklistItem(c.id)} className="accent-primary" />
                  <span className={`flex-1 text-sm ${c.done ? 'text-text-muted line-through' : 'text-text'}`}>{c.text}</span>
                  <button type="button" onClick={() => removeChecklistItem(c.id)} className="text-xs text-danger hover:opacity-70">🗑️</button>
                </div>
              ))}
              {checklist.length === 0 && <p className="text-xs text-text-muted">Sin pendientes todavía.</p>}
              <div className="flex gap-2 pt-1">
                <input
                  value={newChecklistText}
                  onChange={(e) => setNewChecklistText(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addChecklistItem() } }}
                  placeholder="Nuevo pendiente…"
                  className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-text outline-none focus:border-primary"
                />
                <button type="button" onClick={addChecklistItem} className="rounded-lg bg-primary px-3 py-2 text-sm font-bold text-background">+</button>
              </div>
            </div>
          </SectionCard>

          {/* Recursos */}
          <SectionCard icon="📎" title="Recursos">
            <div className="space-y-1.5">
              {resources.map((r, i) => (
                <div key={i} className="flex items-center gap-2 rounded-lg border border-border/60 px-3 py-2">
                  <span className="flex-1 truncate text-sm text-text">{r.label} <span className="text-text-muted">— {r.url}</span></span>
                  <button type="button" onClick={() => removeResource(i)} className="text-xs text-danger hover:opacity-70">🗑️</button>
                </div>
              ))}
              <div className="flex flex-col gap-1.5 pt-1 sm:flex-row">
                <input
                  value={newResource.label}
                  onChange={(e) => setNewResource((r) => ({ ...r, label: e.target.value }))}
                  placeholder="Título del recurso"
                  className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-text outline-none focus:border-primary"
                />
                <input
                  value={newResource.url}
                  onChange={(e) => setNewResource((r) => ({ ...r, url: e.target.value }))}
                  placeholder="https://…"
                  className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-text outline-none focus:border-primary"
                />
                <button type="button" onClick={addResource} className="shrink-0 rounded-lg bg-primary px-3 py-2 text-sm font-bold text-background">+ Agregar</button>
              </div>
            </div>

            {resources.length > 0 && (
              <div className="mt-4 border-t border-border/60 pt-3">
                <p className="mb-2 text-[10px] font-bold uppercase tracking-wide text-text-muted/70">Vista previa</p>
                <ResourceGallery resources={resources} />
              </div>
            )}
          </SectionCard>

          {/* Acciones */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-background disabled:opacity-50"
            >
              {saving ? 'Guardando…' : '💾 Guardar cambios'}
            </button>
            {savedMsg && <span className="text-xs text-text-muted">{savedMsg}</span>}
            <button
              type="button"
              onClick={handleDelete}
              className="ml-auto rounded-xl border border-danger/30 px-4 py-2.5 text-sm font-semibold text-danger hover:bg-danger/10"
            >
              🗑️ Eliminar proyecto
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
