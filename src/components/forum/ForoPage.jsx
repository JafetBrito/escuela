import { useEffect, useState } from 'react'
import AppTopBar from '../shared/AppTopBar'
import MascotCompanion from '../mascot/MascotCompanion'
import { useAuthStore } from '../../stores/useAuthStore'
import { supabase } from '../../services/supabase/client'
import { useI18n } from '../../i18n'

// Foro — MVP a propósito (pedido explícito del usuario): solo publicar y
// leer, sin respuestas/hilos/likes todavía. `forum_posts` (migration_043.sql)
// es una tabla plana, cualquier alumno autenticado lee y publica.
function timeAgo(iso) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000
  if (diff < 60) return 'hace un momento'
  if (diff < 3600) return `hace ${Math.floor(diff / 60)} min`
  if (diff < 86400) return `hace ${Math.floor(diff / 3600)} h`
  return new Date(iso).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })
}

export default function ForoPage() {
  const { t } = useI18n()
  const session = useAuthStore((s) => s.session)
  const profile = useAuthStore((s) => s.profile)

  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [posting, setPosting] = useState(false)
  const [error, setError] = useState('')

  const authorName = profile?.display_name || session?.user?.email?.split('@')[0] || 'Estudiante'

  const fetchPosts = async () => {
    setLoading(true)
    const { data } = await supabase.from('forum_posts').select('*').order('created_at', { ascending: false })
    setPosts(data ?? [])
    setLoading(false)
  }

  useEffect(() => { fetchPosts() }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!title.trim() || !body.trim()) return
    setPosting(true)
    setError('')
    const { error: err } = await supabase.from('forum_posts').insert({
      author_id: session.user.id,
      author_name: authorName,
      title: title.trim(),
      body: body.trim(),
    })
    setPosting(false)
    if (err) { setError('No se pudo publicar. Intenta de nuevo.'); return }
    setTitle(''); setBody('')
    fetchPosts()
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-text">
      <AppTopBar />

      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8 md:px-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">{t('pages.forum.title')}</h1>
          <p className="mt-1 text-sm text-text-muted">{t('pages.forum.subtitle')}</p>
        </div>

        <form onSubmit={handleSubmit} className="mb-6 flex flex-col gap-3 rounded-2xl border border-border bg-surface p-5">
          <p className="text-sm font-bold text-text">✍️ Nueva publicación</p>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Título…"
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-text outline-none focus:border-primary"
          />
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="¿Qué quieres compartir con el campus?"
            rows={3}
            className="resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm text-text outline-none focus:border-primary"
          />
          {error && <p className="text-xs text-danger">{error}</p>}
          <button
            type="submit"
            disabled={posting || !title.trim() || !body.trim()}
            className="self-end rounded-lg bg-primary px-5 py-2 text-sm font-bold text-background hover:bg-primary-hover disabled:opacity-50"
          >
            {posting ? 'Publicando…' : 'Publicar'}
          </button>
        </form>

        {loading ? (
          <p className="py-10 text-center text-sm text-text-muted">Cargando publicaciones…</p>
        ) : posts.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border py-14 text-center">
            <span className="text-4xl">🗣️</span>
            <p className="text-sm text-text-muted">Nadie ha publicado todavía — sé el primero.</p>
          </div>
        ) : (
          <ul className="flex flex-col gap-3">
            {posts.map((p) => (
              <li key={p.id} className="rounded-2xl border border-border bg-surface p-4">
                <div className="mb-1 flex items-center justify-between gap-2">
                  <span className="text-sm font-bold text-text">{p.author_name}</span>
                  <span className="shrink-0 text-[11px] text-text-muted">{timeAgo(p.created_at)}</span>
                </div>
                <p className="mb-1 font-bold text-text">{p.title}</p>
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-text-muted">{p.body}</p>
              </li>
            ))}
          </ul>
        )}
      </main>

      <MascotCompanion hideViewport />
    </div>
  )
}
