import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminShell from './AdminShell'
import { useAuthStore } from '../../stores/useAuthStore'
import { useAdminUsersStore } from '../../stores/useAdminUsersStore'

const AGE_PROFILES = [
  { id: 'normal', label: 'Normal', icon: '🧑' },
  { id: 'kids', label: 'Niños', icon: '🧒' },
  { id: 'seniors', label: 'Abuelos', icon: '👴' },
]

const FILTERS = [
  { id: 'todos', label: 'Todos' },
  { id: 'normal', label: '🧑 Normal' },
  { id: 'kids', label: '🧒 Niños' },
  { id: 'seniors', label: '👴 Abuelos' },
]

// Fila de una cuenta pendiente de aprobación (profiles.account_status —
// hoy solo cuentas de niños creadas por un padre/tutor, ver
// migration_022.sql). El admin elige el perfil final y aprueba de un tiro.
function PendingRow({ student, onApprove }) {
  const [ageProfile, setAgeProfile] = useState('kids')
  const [busy, setBusy] = useState(false)

  const handleApprove = async () => {
    setBusy(true)
    await onApprove(student.id, ageProfile)
    setBusy(false)
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-amber-500/20 px-4 py-3 last:border-b-0">
      <div className="min-w-0">
        <p className="font-bold text-text">{student.display_name || student.email}</p>
        <p className="text-xs text-text-muted">{student.email}</p>
      </div>
      <div className="flex items-center gap-2">
        <select
          value={ageProfile}
          onChange={(e) => setAgeProfile(e.target.value)}
          className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm text-text outline-none focus:border-primary"
        >
          {AGE_PROFILES.map((p) => (
            <option key={p.id} value={p.id}>{p.icon} {p.label}</option>
          ))}
        </select>
        <button
          type="button"
          onClick={handleApprove}
          disabled={busy}
          className="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-bold text-white transition hover:bg-emerald-500 disabled:opacity-60"
        >
          {busy ? 'Aprobando…' : '✓ Aprobar'}
        </button>
      </div>
    </div>
  )
}

// Home del panel admin unificado — conteos de la escuela (incluyendo las
// "escuelas" de niños/abuelos, que son solo un filtro de profiles.age_profile,
// no tablas nuevas), aprobaciones pendientes, y el directorio de alumnos
// desde el que se llega al detalle de cada uno (/admin/alumnos/:id).
export default function AdminDashboardPage() {
  const navigate = useNavigate()
  const isAdmin = useAuthStore((s) => s.isAdmin)
  const students = useAdminUsersStore((s) => s.students)
  const loading = useAdminUsersStore((s) => s.loading)
  const fetchStudents = useAdminUsersStore((s) => s.fetchStudents)
  const approveStudent = useAdminUsersStore((s) => s.approveStudent)
  const [filter, setFilter] = useState('todos')
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (!isAdmin?.()) return
    fetchStudents()
  }, [fetchStudents, isAdmin])

  if (!isAdmin?.()) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-text-muted">
        Acceso restringido a administradores.
      </div>
    )
  }

  const pending = students.filter((s) => s.account_status === 'pending')

  const counts = useMemo(() => ({
    total: students.length,
    normal: students.filter((s) => (s.age_profile ?? 'normal') === 'normal').length,
    kids: students.filter((s) => s.age_profile === 'kids').length,
    seniors: students.filter((s) => s.age_profile === 'seniors').length,
  }), [students])

  const filtered = students.filter((s) => {
    if (filter !== 'todos' && (s.age_profile ?? 'normal') !== filter) return false
    if (!search.trim()) return true
    const q = search.trim().toLowerCase()
    return (s.display_name ?? '').toLowerCase().includes(q) || (s.email ?? '').toLowerCase().includes(q)
  })

  return (
    <AdminShell>
      <div className="space-y-6">
        <div className="overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-8 shadow-lg">
          <h1 className="text-3xl font-extrabold text-white drop-shadow-sm">🏫 Panel Admin</h1>
          <p className="mt-1 text-sm font-medium text-white/85">
            Todo lo de la escuela en un solo lugar — alumnos, tareas, proyectos, clases y más.
          </p>
        </div>

        {/* Tarjetas de conteo */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          <div className="rounded-2xl border border-border bg-surface p-4">
            <p className="text-2xl font-black text-text">{counts.total}</p>
            <p className="text-xs text-text-muted">Total alumnos</p>
          </div>
          <div className="rounded-2xl border border-border bg-surface p-4">
            <p className="text-2xl font-black text-text">🧑 {counts.normal}</p>
            <p className="text-xs text-text-muted">Normal</p>
          </div>
          <div className="rounded-2xl border border-border bg-surface p-4">
            <p className="text-2xl font-black text-text">🧒 {counts.kids}</p>
            <p className="text-xs text-text-muted">Niños</p>
          </div>
          <div className="rounded-2xl border border-border bg-surface p-4">
            <p className="text-2xl font-black text-text">👴 {counts.seniors}</p>
            <p className="text-xs text-text-muted">Abuelos</p>
          </div>
          <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4">
            <p className="text-2xl font-black text-amber-400">⏳ {pending.length}</p>
            <p className="text-xs text-text-muted">Pendientes</p>
          </div>
        </div>

        {/* Aprobaciones pendientes */}
        {pending.length > 0 && (
          <div className="overflow-hidden rounded-2xl border border-amber-500/30 bg-surface">
            <p className="border-b border-amber-500/20 bg-amber-500/5 px-4 py-3 text-sm font-bold text-amber-400">
              ⏳ Aprobaciones pendientes
            </p>
            {pending.map((st) => (
              <PendingRow key={st.id} student={st} onApprove={approveStudent} />
            ))}
          </div>
        )}

        {/* Directorio de alumnos */}
        <div className="rounded-2xl border border-border bg-surface">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-4">
            <div className="flex flex-wrap gap-1.5">
              {FILTERS.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFilter(f.id)}
                  className={`rounded-full px-3 py-1.5 text-xs font-bold transition-colors ${
                    filter === f.id ? 'bg-primary text-background' : 'bg-surface-hover text-text-muted hover:text-text'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nombre o correo…"
              className="w-full max-w-xs rounded-lg border border-border bg-background px-3 py-1.5 text-sm text-text outline-none focus:border-primary"
            />
          </div>
          {loading && <p className="p-4 text-sm text-text-muted">Cargando alumnos…</p>}
          {!loading && filtered.length === 0 && (
            <p className="p-4 text-sm text-text-muted">Ningún alumno coincide.</p>
          )}
          {filtered.map((st) => (
            <button
              key={st.id}
              type="button"
              onClick={() => navigate(`/admin/alumnos/${st.id}`)}
              className="flex w-full items-center justify-between gap-3 border-b border-border p-4 text-left transition-colors last:border-b-0 hover:bg-surface-hover"
            >
              <div className="min-w-0">
                <p className="font-bold text-text">{st.display_name || st.email}</p>
                <p className="text-xs text-text-muted">{st.email}</p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {st.account_status === 'pending' && (
                  <span className="rounded-full bg-amber-500/15 px-2.5 py-0.5 text-[11px] font-bold text-amber-400">⏳ Pendiente</span>
                )}
                <span className="rounded-full bg-surface-hover px-2.5 py-0.5 text-[11px] font-bold text-text-muted">
                  {AGE_PROFILES.find((p) => p.id === (st.age_profile ?? 'normal'))?.icon}{' '}
                  {AGE_PROFILES.find((p) => p.id === (st.age_profile ?? 'normal'))?.label}
                </span>
                <span className="text-text-muted">→</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </AdminShell>
  )
}
