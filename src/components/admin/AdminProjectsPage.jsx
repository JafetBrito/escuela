import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import AppTopBar from '../shared/AppTopBar'
import { useAdminUsersStore } from '../../stores/useAdminUsersStore'
import { useProjectsStore } from '../../stores/useProjectsStore'
import { useAuthStore } from '../../stores/useAuthStore'
import StudentCoursesPanel from './StudentCoursesPanel'
import ProjectCard from '../projects/ProjectCard'

export default function AdminProjectsPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const isAdmin = useAuthStore((s) => s.isAdmin)
  const session = useAuthStore((s) => s.session)

  const students = useAdminUsersStore((s) => s.students)
  const fetchStudents = useAdminUsersStore((s) => s.fetchStudents)

  const allProjects = useProjectsStore((s) => s.allProjects)
  const adminLoading = useProjectsStore((s) => s.adminLoading)
  const fetchAllProjects = useProjectsStore((s) => s.fetchAllProjects)
  const createProject = useProjectsStore((s) => s.createProject)

  const [selectedStudent, setSelectedStudent] = useState(null)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState({ title: '', description: '' })
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    if (!isAdmin?.()) return
    fetchStudents()
    fetchAllProjects()
  }, [fetchStudents, fetchAllProjects, isAdmin])

  // Deep-link desde /admin/alumnos/:id ("📁 Asignar proyecto") — preselecciona
  // al alumno una vez que la lista ya cargó. No llama a handleSelectStudent
  // (declarada más abajo) para no depender de su orden de declaración.
  useEffect(() => {
    if (!isAdmin?.()) return
    const studentId = searchParams.get('student')
    if (!studentId || selectedStudent) return
    const match = students.find((s) => s.id === studentId)
    if (!match) return
    setSelectedStudent(match)
    fetchAllProjects(match.id)
  }, [searchParams, students, selectedStudent, isAdmin, fetchAllProjects])

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

  const handleSelectStudent = (student) => {
    setSelectedStudent(student)
    fetchAllProjects(student.id)
    setCreating(false)
    setMsg('')
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!selectedStudent || !form.title.trim()) return
    setBusy(true)
    const { data, error } = await createProject({
      student_id: selectedStudent.id,
      title: form.title.trim(),
      description: form.description.trim() || null,
      assigned_by: session?.user?.id,
    })
    setBusy(false)
    if (error) {
      setMsg(`❌ ${error.message}`)
    } else {
      setMsg('✅ Proyecto creado.')
      setForm({ title: '', description: '' })
      setCreating(false)
      fetchAllProjects(selectedStudent.id)
      if (data) navigate(`/proyectos/${data.id}`)
    }
  }

  const projectsForSelected = selectedStudent
    ? allProjects.filter((p) => p.student_id === selectedStudent.id)
    : allProjects

  return (
    <div className="flex min-h-screen flex-col bg-background text-text">
      <AppTopBar />

      <main className="flex-1 px-4 py-8 md:px-8">
        <div className="mx-auto max-w-5xl">

          <div className="overflow-hidden rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-6 py-8 shadow-lg">
            <h1 className="text-3xl font-extrabold text-white">📁 Gestión de Proyectos</h1>
            <p className="mt-1 text-sm font-medium text-white/85">
              Asigna proyectos a tus alumnos y revisa cómo van organizando su trabajo.
            </p>
          </div>

          <div className="mt-6 grid gap-6 md:grid-cols-[220px_1fr]">

            {/* ── Student sidebar ── */}
            <div>
              <h2 className="mb-2 text-xs font-black uppercase tracking-widest text-text-muted/60">
                Alumnos ({students.length})
              </h2>
              <div className="space-y-1">
                <button
                  type="button"
                  onClick={() => { setSelectedStudent(null); fetchAllProjects() }}
                  className={`w-full rounded-xl px-3 py-2 text-left text-sm font-medium transition ${!selectedStudent ? 'bg-primary/10 text-primary' : 'text-text-muted hover:text-text'}`}
                >
                  Todos los alumnos
                </button>
                {students.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => handleSelectStudent(s)}
                    className={`w-full rounded-xl px-3 py-2 text-left text-sm font-medium transition ${selectedStudent?.id === s.id ? 'bg-primary/10 text-primary' : 'text-text-muted hover:text-text'}`}
                  >
                    <span className="block font-bold">{s.display_name || 'Sin nombre'}</span>
                    <span className="block truncate text-xs opacity-60">{s.email}</span>
                  </button>
                ))}
                {students.length === 0 && (
                  <p className="text-xs text-text-muted/60 px-2">No hay alumnos registrados.</p>
                )}
              </div>
            </div>

            {/* ── Main area ── */}
            <div>
              {selectedStudent && (
                <div className="mb-4">
                  <StudentCoursesPanel student={selectedStudent} />
                </div>
              )}

              {selectedStudent && !creating && (
                <button
                  type="button"
                  onClick={() => setCreating(true)}
                  className="mb-4 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-background hover:opacity-90"
                >
                  + Nuevo proyecto para {selectedStudent.display_name || selectedStudent.email}
                </button>
              )}

              {creating && selectedStudent && (
                <form onSubmit={handleCreate} className="mb-6 rounded-2xl border border-border bg-surface p-4 space-y-3">
                  <h3 className="font-bold text-text">Nuevo proyecto</h3>
                  <div>
                    <label className="text-[10px] font-bold uppercase text-text-muted">Título *</label>
                    <input
                      required
                      value={form.title}
                      onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                      className="mt-0.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text outline-none focus:border-primary"
                      placeholder="Ej: Investigación final de historia"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase text-text-muted">Descripción</label>
                    <textarea
                      rows={2}
                      value={form.description}
                      onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                      className="mt-0.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text outline-none focus:border-primary resize-none"
                      placeholder="Instrucciones generales del proyecto…"
                    />
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button type="button" onClick={() => setCreating(false)} className="flex-1 rounded-lg border border-border px-3 py-2 text-sm text-text-muted hover:text-text">
                      Cancelar
                    </button>
                    <button type="submit" disabled={busy} className="flex-1 rounded-lg bg-primary px-3 py-2 text-sm font-bold text-background disabled:opacity-50">
                      {busy ? 'Creando…' : '📤 Asignar proyecto'}
                    </button>
                  </div>
                  {msg && <p className="text-xs text-text-muted">{msg}</p>}
                </form>
              )}

              <h2 className="mb-2 text-xs font-black uppercase tracking-widest text-text-muted/60">
                Proyectos {selectedStudent ? `de ${selectedStudent.display_name || selectedStudent.email}` : '(todos)'}
                {' '}({projectsForSelected.length})
              </h2>

              {adminLoading ? (
                <p className="py-8 text-center text-sm text-text-muted">Cargando…</p>
              ) : projectsForSelected.length === 0 ? (
                <div className="rounded-2xl border border-border bg-surface py-10 text-center">
                  <p className="text-text-muted text-sm">Sin proyectos todavía.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {projectsForSelected.map((p) => (
                    <ProjectCard
                      key={p.id}
                      project={p}
                      showOwner={!selectedStudent}
                      onClick={() => navigate(`/proyectos/${p.id}`)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
