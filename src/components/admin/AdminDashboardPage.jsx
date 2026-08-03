import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AdminShell from './AdminShell'
import { useAuthStore } from '../../stores/useAuthStore'
import { useAdminUsersStore } from '../../stores/useAdminUsersStore'
import { levelProgress } from '../../stores/useLevelStore'

const AGE_PROFILES = [
  { id: 'normal', label: 'Normal', icon: '🧑' },
  { id: 'kids', label: 'Niños', icon: '🧒' },
  { id: 'seniors', label: 'Abuelos', icon: '👴' },
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

// Fila del directorio — antes era un simple botón con nombre + badge de
// edad; el admin pidió más información visible (nivel/XP/oro) y poder
// actuar sin entrar al detalle: cambiar el perfil de edad de un tiro
// (ej. "pasar a alguien a la versión de adultos") y saltar directo a
// asignarle tarea/proyecto/clase — el perfil de edad ya NO es un filtro
// que organiza la lista, es solo un atributo editable por alumno.
function StudentRow({ student, onSetAgeProfile }) {
  const [savedFlash, setSavedFlash] = useState(false)
  const snapshot = student.snapshot ?? {}
  const { level, xpIntoLevel, xpForNextLevel } = levelProgress(snapshot.xp ?? 0)

  const handleAgeProfileChange = async (e) => {
    await onSetAgeProfile(student.id, e.target.value)
    setSavedFlash(true)
    setTimeout(() => setSavedFlash(false), 1200)
  }

  return (
    <div className="flex flex-col gap-3 border-b border-border p-4 last:border-b-0 sm:flex-row sm:items-center sm:justify-between">
      <Link to={`/admin/alumnos/${student.id}`} className="min-w-0 flex-1 hover:opacity-80">
        <div className="flex items-center gap-2">
          <p className="truncate font-bold text-text">{student.display_name || student.email}</p>
          {student.account_status === 'pending' && (
            <span className="shrink-0 rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold text-amber-400">⏳ Pendiente</span>
          )}
        </div>
        <p className="truncate text-xs text-text-muted">{student.email}</p>
        <p className="mt-1 text-xs text-text-muted">
          Nivel <span className="font-bold text-primary">{level}</span> · {xpIntoLevel}/{xpForNextLevel} XP · 🪙 {snapshot.coins ?? 0}
        </p>
      </Link>

      <div className="flex flex-wrap items-center gap-1.5">
        <select
          value={student.age_profile ?? 'normal'}
          onChange={handleAgeProfileChange}
          className="rounded-lg border border-border bg-background px-2 py-1.5 text-xs text-text outline-none focus:border-primary"
          title="Perfil de edad"
        >
          {AGE_PROFILES.map((p) => (
            <option key={p.id} value={p.id}>{p.icon} {p.label}</option>
          ))}
        </select>
        {savedFlash && <span className="text-xs font-bold text-emerald-400">✓</span>}
        <Link to={`/admin/tareas?student=${student.id}`} title="Asignar tarea"
          className="rounded-lg border border-border px-2 py-1.5 text-xs font-bold text-text-muted transition hover:border-primary/40 hover:text-text">
          📋
        </Link>
        <Link to={`/admin/proyectos?student=${student.id}`} title="Asignar proyecto"
          className="rounded-lg border border-border px-2 py-1.5 text-xs font-bold text-text-muted transition hover:border-primary/40 hover:text-text">
          📁
        </Link>
        <Link to={`/admin/clases?student=${student.id}`} title="Asignar clase"
          className="rounded-lg border border-border px-2 py-1.5 text-xs font-bold text-text-muted transition hover:border-primary/40 hover:text-text">
          🎓
        </Link>
        <Link to={`/admin/alumnos/${student.id}`} title="Ver detalle"
          className="rounded-lg bg-primary/10 px-2 py-1.5 text-xs font-bold text-primary transition hover:bg-primary/20">
          Ver →
        </Link>
      </div>
    </div>
  )
}

// Home del panel admin unificado — conteos de la escuela, aprobaciones
// pendientes, y el directorio de alumnos (ahora una lista única con más
// información y acciones en línea, sin agrupar/filtrar por perfil de edad
// — ese perfil sigue siendo editable por alumno, solo dejó de ser el eje
// organizador del directorio).
export default function AdminDashboardPage() {
  const navigate = useNavigate()
  const isAdmin = useAuthStore((s) => s.isAdmin)
  const students = useAdminUsersStore((s) => s.students)
  const loading = useAdminUsersStore((s) => s.loading)
  const fetchError = useAdminUsersStore((s) => s.error)
  const fetchStudents = useAdminUsersStore((s) => s.fetchStudents)
  const approveStudent = useAdminUsersStore((s) => s.approveStudent)
  const setAgeProfile = useAdminUsersStore((s) => s.setAgeProfile)
  const [search, setSearch] = useState('')

  // `useMemo` (y cualquier otro hook) tiene que ir ANTES del early return de
  // abajo — isAdmin() suele empezar en `false` en el primer render (el
  // profile del admin todavía no cargó) y pasar a `true` una vez que
  // useAuthStore hidrata, así que un hook declarado después del `if` se
  // salta en el primer render y aparece en el segundo: exactamente el
  // "change in the order of Hooks" que React detecta y that can crash.
  const counts = useMemo(() => ({
    total: students.length,
    normal: students.filter((s) => (s.age_profile ?? 'normal') === 'normal').length,
    kids: students.filter((s) => s.age_profile === 'kids').length,
    seniors: students.filter((s) => s.age_profile === 'seniors').length,
  }), [students])

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

  const filtered = students.filter((s) => {
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

        {/* Tarjetas de conteo — informativas, no filtran el directorio de abajo */}
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

        {fetchError && (
          <div className="rounded-2xl border border-danger/40 bg-danger/10 p-4">
            <p className="text-sm font-bold text-danger">❌ No se pudieron cargar los alumnos</p>
            <p className="mt-1 text-xs text-text-muted">{fetchError}</p>
            <p className="mt-1 text-xs text-text-muted">
              Esto suele pasar cuando falta correr alguna migración en Supabase (ej. migration_021.sql /
              migration_022.sql / migration_023.sql — columnas age_profile, account_status). Corre las que falten
              y recarga esta página.
            </p>
          </div>
        )}

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

        {/* Directorio de alumnos — lista única, sin clasificar por edad */}
        <div className="rounded-2xl border border-border bg-surface">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-4">
            <p className="text-sm font-bold text-text">👥 Alumnos ({filtered.length})</p>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nombre o correo…"
              className="w-full max-w-xs rounded-lg border border-border bg-background px-3 py-1.5 text-sm text-text outline-none focus:border-primary"
            />
          </div>
          {loading && <p className="p-4 text-sm text-text-muted">Cargando alumnos…</p>}
          {!loading && filtered.length === 0 && students.length === 0 && (
            <p className="p-4 text-sm text-text-muted">
              Todavía no hay ninguna cuenta con rol "student" registrada.
            </p>
          )}
          {!loading && filtered.length === 0 && students.length > 0 && (
            <p className="p-4 text-sm text-text-muted">Ningún alumno coincide con "{search}".</p>
          )}
          {filtered.map((st) => (
            <StudentRow key={st.id} student={st} onSetAgeProfile={setAgeProfile} />
          ))}
        </div>
      </div>
    </AdminShell>
  )
}
