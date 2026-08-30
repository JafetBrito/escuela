import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import AdminShell from './AdminShell'
import { useAuthStore } from '../../stores/useAuthStore'
import { useAdminUsersStore } from '../../stores/useAdminUsersStore'

// Promueve una cuenta existente a profesor. No hay flujo de invitación por
// correo (ver migration_048.sql) — la persona ya se tuvo que haber
// registrado normalmente como alumno antes de que el admin la busque aquí.
function PromoteForm({ onPromoted }) {
  const findProfileByEmail = useAdminUsersStore((s) => s.findProfileByEmail)
  const promoteToTeacher = useAdminUsersStore((s) => s.promoteToTeacher)
  const [email, setEmail] = useState('')
  const [found, setFound] = useState(null)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!email.trim()) return
    setBusy(true)
    setMsg('')
    setFound(null)
    const { data, error } = await findProfileByEmail(email)
    setBusy(false)
    if (error) { setMsg(`❌ ${error.message}`); return }
    if (!data) { setMsg('No existe ninguna cuenta con ese correo.'); return }
    if (data.role === 'teacher') { setMsg('Esa cuenta ya es profesor.'); return }
    if (data.role === 'admin') { setMsg('Esa cuenta ya es admin — no se puede volver profesor.'); return }
    setFound(data)
  }

  const handlePromote = async () => {
    if (!found) return
    setBusy(true)
    const { error } = await promoteToTeacher(found.id)
    setBusy(false)
    if (error) { setMsg(`❌ ${error.message}`); return }
    setMsg(`✅ ${found.display_name || found.email} ahora es profesor.`)
    setFound(null)
    setEmail('')
    onPromoted()
  }

  return (
    <form onSubmit={handleSearch} className="space-y-3 rounded-2xl border border-border bg-surface p-4">
      <p className="text-xs font-bold uppercase tracking-wide text-text-muted">Promover una cuenta a profesor</p>
      <div className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="correo@ejemplo.com"
          className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-text outline-none focus:border-primary"
        />
        <button type="submit" disabled={busy || !email.trim()} className="shrink-0 rounded-lg bg-primary/20 px-3 py-2 text-xs font-bold text-primary disabled:opacity-40">
          Buscar
        </button>
      </div>

      {found && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-border/60 px-3 py-2">
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-text">{found.display_name || 'Sin nombre'}</p>
            <p className="truncate text-xs text-text-muted">{found.email}</p>
          </div>
          <button
            type="button"
            onClick={handlePromote}
            disabled={busy}
            className="shrink-0 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-500 disabled:opacity-60"
          >
            ✓ Hacer profesor
          </button>
        </div>
      )}

      {msg && <p className="text-xs text-text-muted">{msg}</p>}
    </form>
  )
}

export default function AdminTeachersPage() {
  const isAdmin = useAuthStore((s) => s.isAdmin)
  const teachers = useAdminUsersStore((s) => s.teachers)
  const fetchTeachers = useAdminUsersStore((s) => s.fetchTeachers)
  const demoteToStudent = useAdminUsersStore((s) => s.demoteToStudent)

  useEffect(() => {
    if (!isAdmin?.()) return
    fetchTeachers()
  }, [isAdmin, fetchTeachers])

  if (!isAdmin?.()) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-text-muted">
        Acceso restringido a administradores.
      </div>
    )
  }

  const handleDemote = async (teacher) => {
    if (!window.confirm(`¿Quitarle el rol de profesor a ${teacher.display_name || teacher.email}?`)) return
    await demoteToStudent(teacher.id)
  }

  return (
    <AdminShell>
      <div className="space-y-4">
        <div className="overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 px-6 py-8 shadow-lg">
          <h1 className="text-3xl font-extrabold text-white">🧑‍🏫 Profesores</h1>
          <p className="mt-1 text-sm font-medium text-white/85">
            Promueve cuentas existentes a profesor y asígnales cursos desde /admin/cursos.
          </p>
        </div>

        <PromoteForm onPromoted={fetchTeachers} />

        <div>
          <h2 className="mb-2 text-xs font-black uppercase tracking-widest text-text-muted/60">
            Profesores ({teachers.length})
          </h2>
          {teachers.length === 0 ? (
            <p className="text-sm text-text-muted">Todavía no hay ningún profesor promovido.</p>
          ) : (
            <div className="space-y-2">
              {teachers.map((t) => (
                <div key={t.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-surface p-4">
                  <Link to={`/profesor/${t.id}`} className="min-w-0 hover:opacity-80">
                    <p className="truncate font-bold text-text">{t.display_name || t.email}</p>
                    <p className="truncate text-xs text-text-muted">{t.email}</p>
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleDemote(t)}
                    className="shrink-0 rounded-lg border border-danger/30 px-3 py-1.5 text-xs font-bold text-danger hover:bg-danger/10"
                  >
                    Quitar profesor
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminShell>
  )
}
