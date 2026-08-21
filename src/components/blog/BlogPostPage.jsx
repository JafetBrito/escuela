import { useParams, useNavigate, Link } from 'react-router-dom'
import MascotCompanion from '../mascot/MascotCompanion'
import { getBlogPostById } from '../../data/blogRegistry'

// Embebe el post externo en un <iframe> — jafetbrito.blog no manda
// X-Frame-Options ni frame-ancestors (verificado con curl -I antes de
// construir esto), así que sí se puede embeber de verdad, a diferencia de
// muchos blogs que lo bloquean. El link "abrir en pestaña nueva" queda de
// respaldo por si un post futuro sí lo bloquea.
export default function BlogPostPage() {
  const { postId } = useParams()
  const navigate = useNavigate()
  const post = getBlogPostById(postId)

  if (!post) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-background p-6 text-center text-text">
        <p className="text-4xl">📰</p>
        <p className="text-lg font-bold">Este post no está disponible.</p>
        <Link to="/blog" className="text-sm text-primary hover:underline">← Volver al Blog</Link>
      </div>
    )
  }

  return (
    <div className="flex h-screen flex-col bg-background text-text">
      <header className="flex items-center justify-between gap-3 border-b border-border bg-surface px-4 py-2.5">
        <button
          onClick={() => navigate('/blog')}
          className="flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-text-muted transition-colors hover:text-text"
        >
          ← Volver al Blog
        </button>
        <p className="truncate text-sm font-semibold text-text">{post.title}</p>
        <a
          href={post.url}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold text-primary hover:underline"
        >
          Abrir en pestaña nueva ↗
        </a>
      </header>

      <iframe src={post.url} title={post.title} className="flex-1 border-0 bg-white" />

      <MascotCompanion />
    </div>
  )
}
