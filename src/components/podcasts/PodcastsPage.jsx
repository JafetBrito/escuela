import { useEffect, useState } from 'react'
import AppTopBar from '../shared/AppTopBar'
import { usePodcastsStore } from '../../stores/usePodcastsStore'

// Playlist de podcasts (videos de YouTube) — clic en un episodio lo abre
// directamente en el reproductor principal. Mismo espíritu simple que el
// mini-player de Radio: un <iframe> embed, sin la API JS completa de
// YouTube (esa la usa VideoPlayer.jsx para el contenido de cursos, que sí
// necesita eventos/seguridad; aquí es solo una playlist pública).
export default function PodcastsPage() {
  const podcasts = usePodcastsStore((s) => s.podcasts)
  const loading = usePodcastsStore((s) => s.loading)
  const fetchPodcasts = usePodcastsStore((s) => s.fetchPodcasts)
  const [activeId, setActiveId] = useState(null)

  useEffect(() => {
    fetchPodcasts().then((data) => { if (data.length > 0) setActiveId(data[0].id) })
  }, [fetchPodcasts])

  const active = podcasts.find((p) => p.id === activeId)

  return (
    <div className="flex min-h-screen flex-col bg-background text-text">
      <AppTopBar />
      <main className="flex-1 px-4 py-8 md:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="overflow-hidden rounded-2xl bg-gradient-to-r from-rose-600 to-orange-500 px-6 py-8 shadow-lg">
            <h1 className="text-3xl font-extrabold text-white">🎙️ Podcasts</h1>
            <p className="mt-1 text-sm font-medium text-white/85">Episodios en video, directo desde YouTube.</p>
          </div>

          {loading && <p className="mt-6 text-center text-sm text-text-muted">Cargando…</p>}

          {!loading && podcasts.length === 0 && (
            <div className="mt-6 rounded-2xl border border-border bg-surface py-10 text-center">
              <p className="text-text-muted text-sm">Todavía no hay podcasts publicados.</p>
            </div>
          )}

          {!loading && podcasts.length > 0 && (
            <div className="mt-6 grid gap-4 md:grid-cols-[1fr_320px]">
              <div>
                {active && (
                  <div className="overflow-hidden rounded-2xl border border-border bg-black">
                    <div className="aspect-video w-full">
                      <iframe
                        key={active.id}
                        className="h-full w-full"
                        src={`https://www.youtube.com/embed/${active.youtube_id}?autoplay=1`}
                        title={active.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  </div>
                )}
                {active && (
                  <div className="mt-3">
                    <h2 className="font-bold text-text">{active.title}</h2>
                    {active.description && <p className="mt-1 text-sm text-text-muted">{active.description}</p>}
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <h2 className="mb-2 text-xs font-black uppercase tracking-widest text-text-muted/60">
                  Episodios ({podcasts.length})
                </h2>
                {podcasts.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setActiveId(p.id)}
                    className={`flex w-full items-center gap-2 rounded-xl border px-3 py-2 text-left text-sm transition ${
                      p.id === activeId ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-surface text-text hover:border-primary/40'
                    }`}
                  >
                    <span>{p.id === activeId ? '▶️' : '🎧'}</span>
                    <span className="truncate font-medium">{p.title}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
