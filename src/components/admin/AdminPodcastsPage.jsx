import { useEffect, useState } from 'react'
import AppTopBar from '../shared/AppTopBar'
import { usePodcastsStore } from '../../stores/usePodcastsStore'
import { useAuthStore } from '../../stores/useAuthStore'
import { extractYouTubeId } from '../../utils/youtube'

export default function AdminPodcastsPage() {
  const isAdmin = useAuthStore((s) => s.isAdmin)
  const session = useAuthStore((s) => s.session)

  const podcasts = usePodcastsStore((s) => s.podcasts)
  const loading = usePodcastsStore((s) => s.loading)
  const fetchPodcasts = usePodcastsStore((s) => s.fetchPodcasts)
  const addPodcast = usePodcastsStore((s) => s.addPodcast)
  const deletePodcast = usePodcastsStore((s) => s.deletePodcast)

  const [form, setForm] = useState({ title: '', url: '', description: '' })
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => { if (isAdmin?.()) fetchPodcasts() }, [fetchPodcasts, isAdmin])

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

  const handleSubmit = async (e) => {
    e.preventDefault()
    const youtubeId = extractYouTubeId(form.url)
    if (!form.title.trim() || !youtubeId) {
      setMsg('❌ Título y un link/id válido de YouTube son obligatorios.')
      return
    }
    setBusy(true)
    const { error } = await addPodcast({
      title: form.title.trim(),
      description: form.description.trim(),
      youtubeId,
      createdBy: session?.user?.id,
    })
    setBusy(false)
    setMsg(error ? `❌ ${error.message}` : '✅ Podcast agregado.')
    if (!error) setForm({ title: '', url: '', description: '' })
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-text">
      <AppTopBar />
      <main className="flex-1 px-4 py-8 md:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="overflow-hidden rounded-2xl bg-gradient-to-r from-rose-600 to-orange-500 px-6 py-8 shadow-lg">
            <h1 className="text-3xl font-extrabold text-white">🎙️ Gestión de Podcasts</h1>
            <p className="mt-1 text-sm font-medium text-white/85">Agrega los episodios (YouTube) que verán los alumnos en /podcasts.</p>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-3 rounded-2xl border border-border bg-surface p-4">
            <h3 className="font-bold text-text">Nuevo episodio</h3>
            <div>
              <label className="text-[10px] font-bold uppercase text-text-muted">Título *</label>
              <input
                required
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                className="mt-0.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text outline-none focus:border-primary"
                placeholder="Ej: Episodio 1 — Cómo empezar con IA"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase text-text-muted">Link de YouTube *</label>
              <input
                required
                value={form.url}
                onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
                className="mt-0.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text outline-none focus:border-primary"
                placeholder="https://www.youtube.com/watch?v=..."
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase text-text-muted">Descripción</label>
              <textarea
                rows={2}
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                className="mt-0.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text outline-none focus:border-primary resize-none"
              />
            </div>
            <button type="submit" disabled={busy} className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-background disabled:opacity-50">
              {busy ? 'Agregando…' : '📤 Agregar episodio'}
            </button>
            {msg && <p className="text-xs text-text-muted">{msg}</p>}
          </form>

          <h2 className="mb-2 mt-6 text-xs font-black uppercase tracking-widest text-text-muted/60">
            Episodios publicados ({podcasts.length})
          </h2>
          {loading ? (
            <p className="py-8 text-center text-sm text-text-muted">Cargando…</p>
          ) : podcasts.length === 0 ? (
            <div className="rounded-2xl border border-border bg-surface py-10 text-center">
              <p className="text-text-muted text-sm">Sin episodios todavía.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {podcasts.map((p) => (
                <div key={p.id} className="flex items-center gap-3 rounded-xl border border-border bg-surface p-3">
                  <img
                    src={`https://i.ytimg.com/vi/${p.youtube_id}/default.jpg`}
                    alt=""
                    className="h-12 w-16 shrink-0 rounded-lg object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-bold text-text">{p.title}</p>
                    {p.description && <p className="truncate text-xs text-text-muted">{p.description}</p>}
                  </div>
                  <button
                    type="button"
                    onClick={() => deletePodcast(p.id)}
                    className="shrink-0 rounded-lg border border-danger/30 px-2.5 py-1.5 text-xs font-bold text-danger hover:bg-danger/10"
                  >
                    🗑️ Borrar
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
