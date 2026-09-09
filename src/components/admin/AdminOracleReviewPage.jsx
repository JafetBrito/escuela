import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import AdminShell from './AdminShell'
import { useAuthStore } from '../../stores/useAuthStore'
import { useNotificationsStore } from '../../stores/useNotificationsStore'
import { supabase } from '../../services/supabase/client'

// Fila de un curso del Oráculo esperando revisión — el admin puede ver el
// curso completo (link directo a /learn/:id, cualquier admin ya puede leer
// cualquier curso) antes de aprobar o rechazar. review_status solo puede
// moverse a 'approved'/'rejected' por un admin (protect_course_review_
// columns_trigger, migration_060.sql) — reviewed_by/reviewed_at se rellenan
// solos ahí, no hace falta mandarlos desde aquí.
function PendingCourseRow({ course, onDecide }) {
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState('')

  const decide = async (decision) => {
    setBusy(decision)
    await onDecide(course, decision, note.trim())
    setBusy('')
  }

  return (
    <div className="flex flex-col gap-3 border-b border-border px-4 py-4 last:border-b-0">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <span className="text-2xl" style={{ color: course.color || undefined }}>{course.icon || '📘'}</span>
          <div className="min-w-0">
            <p className="font-bold text-text">{course.title}</p>
            <p className="mt-0.5 max-w-lg text-xs text-text-muted">{course.description}</p>
            <p className="mt-1 text-[10px] text-text-muted">
              {Array.isArray(course.modules) ? course.modules.length : '?'} clases · pedido el{' '}
              {new Date(course.created_at).toLocaleDateString('es-MX')}
            </p>
          </div>
        </div>
        <Link
          to={`/learn/${course.id}`}
          target="_blank"
          rel="noreferrer"
          className="shrink-0 rounded-lg border border-border px-3 py-1.5 text-xs font-bold text-text-muted hover:border-primary/40 hover:text-text"
        >
          👁️ Vista previa
        </Link>
      </div>

      <input
        type="text"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Nota opcional (visible al alumno, sobre todo si rechazas)"
        className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-text outline-none focus:border-primary"
      />

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => decide('approved')}
          disabled={!!busy}
          className="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-bold text-white transition hover:bg-emerald-500 disabled:opacity-60"
        >
          {busy === 'approved' ? 'Aprobando…' : '✓ Aprobar'}
        </button>
        <button
          type="button"
          onClick={() => decide('rejected')}
          disabled={!!busy}
          className="rounded-lg border border-red-500/40 px-3 py-1.5 text-sm font-bold text-red-300 transition hover:bg-red-500/10 disabled:opacity-60"
        >
          {busy === 'rejected' ? 'Rechazando…' : '✕ Rechazar'}
        </button>
      </div>
    </div>
  )
}

export default function AdminOracleReviewPage() {
  const isAdmin = useAuthStore((s) => s.isAdmin)
  const notifyCourseReviewDecision = useNotificationsStore((s) => s.notifyCourseReviewDecision)
  const [pending, setPending] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchPending = () => {
    supabase
      .from('courses')
      .select('id,title,description,icon,color,created_at,created_by,modules')
      .eq('ai_generated', true)
      .eq('review_status', 'pending')
      .order('created_at', { ascending: true })
      .then(({ data, error }) => {
        if (error) console.error('[AdminOracleReviewPage] fetch pending failed:', error)
        setPending(data ?? [])
        setLoading(false)
      })
  }

  useEffect(() => {
    if (!isAdmin?.()) return
    fetchPending()
  }, [isAdmin])

  if (!isAdmin?.()) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-text-muted">
        Acceso restringido a administradores.
      </div>
    )
  }

  const handleDecide = async (course, decision, note) => {
    const { error } = await supabase
      .from('courses')
      .update({ review_status: decision, review_note: note || null })
      .eq('id', course.id)
    if (error) {
      console.error('[AdminOracleReviewPage] decision failed:', error)
      return
    }
    setPending((prev) => prev.filter((c) => c.id !== course.id))
    await notifyCourseReviewDecision(course, decision, note)
  }

  return (
    <AdminShell>
      <div className="space-y-6">
        <div className="overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-8 shadow-lg">
          <h1 className="text-3xl font-extrabold text-white drop-shadow-sm">🔮 Revisión del Oráculo</h1>
          <p className="mt-1 text-sm font-medium text-white/85">
            Cursos generados por alumnos que piden ser compartidos en la pestaña Comunidad del Oráculo.
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-border bg-surface">
          {loading ? (
            <p className="px-4 py-6 text-sm text-text-muted">Cargando…</p>
          ) : pending.length === 0 ? (
            <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
              <span className="text-4xl">✅</span>
              <p className="font-bold text-text">No hay cursos pendientes de revisión</p>
            </div>
          ) : (
            pending.map((c) => <PendingCourseRow key={c.id} course={c} onDecide={handleDecide} />)
          )}
        </div>
      </div>
    </AdminShell>
  )
}
