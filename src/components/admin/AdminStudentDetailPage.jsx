import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import AdminShell from './AdminShell'
import StudentSummaryCard from './StudentSummaryCard'
import StudentCoursesPanel from './StudentCoursesPanel'
import { useAuthStore } from '../../stores/useAuthStore'
import { useAdminUsersStore } from '../../stores/useAdminUsersStore'

const AGE_PROFILES = [
  { id: 'normal', label: 'Normal', icon: '🧑' },
  { id: 'kids', label: 'Niños', icon: '🧒' },
  { id: 'seniors', label: 'Abuelos', icon: '👴' },
]

// Detalle de un alumno — todo lo que hoy vive repartido (progreso, perfil de
// edad, aprobación) en una sola tarjeta, más accesos directos para asignarle
// tarea/proyecto/clase en las páginas correspondientes (que preseleccionan
// a este alumno vía ?student=<id>, ver AdminTasksPage.jsx/etc.).
export default function AdminStudentDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isAdmin = useAuthStore((s) => s.isAdmin)
  const students = useAdminUsersStore((s) => s.students)
  const fetchStudents = useAdminUsersStore((s) => s.fetchStudents)
  const setAgeProfile = useAdminUsersStore((s) => s.setAgeProfile)
  const approveStudent = useAdminUsersStore((s) => s.approveStudent)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!isAdmin?.()) return
    if (students.length === 0) fetchStudents()
  }, [fetchStudents, isAdmin, students.length])

  if (!isAdmin?.()) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-text-muted">
        Acceso restringido a administradores.
      </div>
    )
  }

  const student = students.find((s) => s.id === id)

  const handleAgeProfileChange = async (ageProfile) => {
    const { error } = await setAgeProfile(id, ageProfile)
    if (!error) { setSaved(true); setTimeout(() => setSaved(false), 1500) }
  }

  const handleApprove = async (ageProfile) => {
    await approveStudent(id, ageProfile)
  }

  return (
    <AdminShell>
      <div className="space-y-4">
        <button onClick={() => navigate('/admin')} className="text-sm text-text-muted hover:text-primary">
          ← Volver al directorio
        </button>

        {!student ? (
          <p className="text-sm text-text-muted">Cargando alumno…</p>
        ) : (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-surface p-5">
              <div>
                <h1 className="text-xl font-black text-text">{student.display_name || student.email}</h1>
                <p className="text-sm text-text-muted">{student.email}</p>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={student.age_profile ?? 'normal'}
                  onChange={(e) => handleAgeProfileChange(e.target.value)}
                  className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm text-text outline-none focus:border-primary"
                >
                  {AGE_PROFILES.map((p) => (
                    <option key={p.id} value={p.id}>{p.icon} {p.label}</option>
                  ))}
                </select>
                {saved && <span className="text-xs font-bold text-emerald-400">✓ Guardado</span>}
              </div>
            </div>

            {student.account_status === 'pending' && (
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4">
                <p className="text-sm font-bold text-amber-400">⏳ Esta cuenta está esperando aprobación.</p>
                <button
                  type="button"
                  onClick={() => handleApprove(student.age_profile ?? 'kids')}
                  className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-emerald-500"
                >
                  ✓ Aprobar con perfil {AGE_PROFILES.find((p) => p.id === (student.age_profile ?? 'kids'))?.label}
                </button>
              </div>
            )}

            <StudentSummaryCard student={student} />
            <StudentCoursesPanel student={student} />

            <div className="flex flex-wrap gap-2">
              <Link
                to={`/admin/tareas?student=${student.id}`}
                className="rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-bold text-text transition hover:border-primary/40"
              >
                📋 Asignar tarea
              </Link>
              <Link
                to={`/admin/proyectos?student=${student.id}`}
                className="rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-bold text-text transition hover:border-primary/40"
              >
                📁 Asignar proyecto
              </Link>
              <Link
                to={`/admin/clases?student=${student.id}`}
                className="rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-bold text-text transition hover:border-primary/40"
              >
                🎓 Asignar clase
              </Link>
            </div>
          </>
        )}
      </div>
    </AdminShell>
  )
}
