import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AppTopBar from '../shared/AppTopBar'
import { useProjectsStore } from '../../stores/useProjectsStore'
import { useAuthStore } from '../../stores/useAuthStore'
import ProjectCard from './ProjectCard'

const TABS = [
  { key: 'todos', label: '📁 Todos' },
  { key: 'en_progreso', label: '🟡 En progreso' },
  { key: 'completado', label: '✅ Completados' },
]

function NewProjectModal({ onClose, onCreate }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [busy, setBusy] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!title.trim()) return
    setBusy(true)
    await onCreate({ title: title.trim(), description: description.trim() || null })
    setBusy(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm rounded-2xl border border-border bg-surface p-6 shadow-2xl">
        <h2 className="font-extrabold text-text">Nuevo proyecto</h2>
        <div className="mt-4 space-y-3">
          <div>
            <label className="text-[10px] font-bold uppercase text-text-muted">Título *</label>
            <input
              required
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Mi novela de ciencia ficción"
              className="mt-0.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase text-text-muted">Descripción</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="¿De qué trata este proyecto?"
              className="mt-0.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text outline-none focus:border-primary resize-none"
            />
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          <button type="button" onClick={onClose} className="flex-1 rounded-lg border border-border px-3 py-2 text-sm text-text-muted hover:text-text">
            Cancelar
          </button>
          <button type="submit" disabled={busy || !title.trim()} className="flex-1 rounded-lg bg-primary px-3 py-2 text-sm font-bold text-background disabled:opacity-50">
            {busy ? 'Creando…' : '+ Crear proyecto'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default function ProjectsPage() {
  const navigate = useNavigate()
  const session = useAuthStore((s) => s.session)
  const projects = useProjectsStore((s) => s.projects)
  const loading = useProjectsStore((s) => s.loading)
  const fetchMyProjects = useProjectsStore((s) => s.fetchMyProjects)
  const createProject = useProjectsStore((s) => s.createProject)

  const [tab, setTab] = useState('todos')
  const [creating, setCreating] = useState(false)

  useEffect(() => { fetchMyProjects() }, [fetchMyProjects])

  const filtered = tab === 'todos' ? projects : projects.filter((p) => p.status === tab)

  const handleCreate = async ({ title, description }) => {
    const { data } = await createProject({
      student_id: session?.user?.id,
      title,
      description,
      assigned_by: null,
    })
    setCreating(false)
    if (data) navigate(`/proyectos/${data.id}`)
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-text">
      <AppTopBar />

      <main className="flex-1 px-4 py-8 md:px-8">
        <div className="mx-auto max-w-5xl">

          <div className="flex flex-wrap items-center justify-between gap-3 overflow-hidden rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-6 py-8 shadow-lg">
            <div>
              <h1 className="text-3xl font-extrabold text-white">📁 Mis Proyectos</h1>
              <p className="mt-1 text-sm font-medium text-white/85">
                Organiza tus proyectos con notas, checklist y recursos — como una libreta de trabajo.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setCreating(true)}
              className="shrink-0 rounded-xl bg-white px-4 py-2 text-sm font-bold text-violet-700 hover:opacity-90"
            >
              + Nuevo proyecto
            </button>
          </div>

          <div className="mt-6 flex gap-1 rounded-xl border border-border bg-surface p-1">
            {TABS.map(({ key, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => setTab(key)}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-4 py-2 text-sm font-bold transition ${
                  tab === key ? 'bg-background text-text shadow-sm' : 'text-text-muted hover:text-text'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="mt-6">
            {loading ? (
              <p className="py-10 text-center text-sm text-text-muted">Cargando…</p>
            ) : filtered.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border p-10 text-center">
                <p className="text-3xl mb-2">📁</p>
                <p className="text-sm font-semibold text-text mb-1">Sin proyectos todavía</p>
                <p className="text-xs text-text-muted mb-4">Crea tu primer proyecto para empezar a organizarlo.</p>
                <button
                  type="button"
                  onClick={() => setCreating(true)}
                  className="rounded-xl bg-primary px-5 py-2 text-sm font-bold text-background"
                >
                  + Nuevo proyecto
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.map((p) => (
                  <ProjectCard key={p.id} project={p} onClick={() => navigate(`/proyectos/${p.id}`)} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {creating && <NewProjectModal onClose={() => setCreating(false)} onCreate={handleCreate} />}
    </div>
  )
}
