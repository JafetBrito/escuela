import { useEffect, useState } from 'react'
import { supabase, isSupabaseConfigured } from '../../services/supabase/client'
import { useAuthStore } from '../../stores/useAuthStore'

export default function CommentsPanel({ courseId, moduleId, className = '' }) {
  const session = useAuthStore((s) => s.session)
  const profile = useAuthStore((s) => s.profile)
  const [comments, setComments] = useState([])
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const configured = isSupabaseConfigured()

  useEffect(() => {
    if (!configured) return
    let active = true

    const load = async () => {
      const { data, error: fetchError } = await supabase
        .from('course_comments')
        .select('id, author_name, content, created_at')
        .eq('course_id', courseId)
        .eq('module_id', moduleId)
        .order('created_at', { ascending: true })

      if (!active) return
      if (fetchError) {
        setError(fetchError.message)
        return
      }
      setComments(data ?? [])
    }

    load()
    return () => {
      active = false
    }
  }, [configured, courseId, moduleId])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!content.trim()) return
    setLoading(true)
    setError('')

    const authorName = profile?.display_name || session?.user?.email || 'Alumno'
    const { data, error: insertError } = await supabase
      .from('course_comments')
      .insert({
        course_id: courseId,
        module_id: moduleId,
        user_id: session.user.id,
        author_name: authorName,
        content: content.trim(),
      })
      .select('id, author_name, content, created_at')
      .single()

    setLoading(false)
    if (insertError) {
      setError(insertError.message)
      return
    }
    setComments((prev) => [...prev, data])
    setContent('')
  }

  return (
    <div className={`flex flex-col rounded-xl border border-border bg-surface p-4 ${className}`}>
      <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-text-muted">
        Comentarios de esta clase
      </p>

      {!configured ? (
        <p className="text-sm text-text-muted">Los comentarios estarán disponibles pronto.</p>
      ) : (
        <>
          <ul className="flex flex-col gap-3 text-sm">
            {comments.length ? (
              comments.map((comment) => (
                <li key={comment.id} className="rounded-lg border border-border bg-background p-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-text">{comment.author_name}</span>
                    <span className="text-xs text-text-muted">
                      {new Date(comment.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="mt-1 whitespace-pre-wrap text-text-muted">{comment.content}</p>
                </li>
              ))
            ) : (
              <li className="text-text-muted">Aún no hay comentarios. ¡Sé el primero!</li>
            )}
          </ul>

          {session ? (
            <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-2">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Escribe un comentario sobre esta clase…"
                rows={3}
                className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-text outline-none focus:border-primary"
              />
              {error && <p className="text-xs text-danger">{error}</p>}
              <button
                type="submit"
                disabled={loading || !content.trim()}
                className="self-start rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-background hover:bg-primary-hover disabled:opacity-60"
              >
                {loading ? 'Enviando…' : 'Comentar'}
              </button>
            </form>
          ) : (
            <p className="mt-4 text-sm text-text-muted">Inicia sesión para dejar un comentario.</p>
          )}
        </>
      )}
    </div>
  )
}
