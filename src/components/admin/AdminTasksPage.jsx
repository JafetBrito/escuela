import { useEffect, useState } from 'react'
import AppTopBar from '../shared/AppTopBar'
import { useTasksStore } from '../../stores/useTasksStore'
import { useAuthStore } from '../../stores/useAuthStore'
import { TASK_TYPES, taskTypeOf } from '../../data/taskTypes'
import StudentCoursesPanel from './StudentCoursesPanel'

const SUBJECTS = ['Matemáticas', 'Física', 'Historia', 'Biología', 'Química', 'Filosofía',
  'Psicología', 'Programación', 'Inglés', 'Música', 'Arte', 'General']

const STATUS_SECTIONS = [
  { key: 'entregada', label: '📤 Por revisar', cls: 'text-blue-400 border-blue-500/20' },
  { key: 'pendiente', label: '⏳ Pendientes',   cls: 'text-amber-400 border-amber-500/20' },
  { key: 'revisada',  label: '✅ Calificadas',  cls: 'text-emerald-400 border-emerald-500/20' },
]

function GradeModal({ task, onClose, onSave }) {
  const [grade, setGrade] = useState(task.grade ?? '')
  const [gradeMax, setGradeMax] = useState(task.grade_max ?? 10)
  const [feedback, setFeedback] = useState(task.feedback ?? '')
  const [busy, setBusy] = useState(false)

  const handleSave = async () => {
    if (grade === '' || isNaN(Number(grade))) return
    setBusy(true)
    await onSave(task.id, { grade: Number(grade), grade_max: Number(gradeMax), feedback })
    setBusy(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-surface p-6 shadow-2xl">
        <h2 className="font-extrabold text-text">Calificar tarea</h2>
        <p className="mt-0.5 text-sm text-text-muted truncate">{task.title}</p>

        <div className="mt-4 space-y-3">
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="text-[10px] font-bold uppercase text-text-muted">Calificación</label>
              <input
                type="number"
                min={0}
                max={gradeMax}
                step={0.5}
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="mt-0.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text outline-none focus:border-primary"
              />
            </div>
            <div className="w-20">
              <label className="text-[10px] font-bold uppercase text-text-muted">De</label>
              <input
                type="number"
                min={1}
                value={gradeMax}
                onChange={(e) => setGradeMax(e.target.value)}
                className="mt-0.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text outline-none focus:border-primary"
              />
            </div>
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase text-text-muted">Comentarios (opcional)</label>
            <textarea
              rows={3}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Escribe retroalimentación para el alumno…"
              className="mt-0.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text outline-none focus:border-primary resize-none"
            />
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          <button type="button" onClick={onClose} className="flex-1 rounded-lg border border-border px-3 py-2 text-sm text-text-muted hover:text-text">
            Cancelar
          </button>
          <button type="button" onClick={handleSave} disabled={busy || grade === ''}
            className="flex-1 rounded-lg bg-primary px-3 py-2 text-sm font-bold text-background disabled:opacity-50">
            {busy ? 'Guardando…' : '💾 Guardar'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AdminTasksPage() {
  const isAdmin = useAuthStore((s) => s.isAdmin)
  const session = useAuthStore((s) => s.session)

  const students = useTasksStore((s) => s.students)
  const allTasks = useTasksStore((s) => s.allTasks)
  const adminLoading = useTasksStore((s) => s.adminLoading)
  const fetchStudents = useTasksStore((s) => s.fetchStudents)
  const fetchAllTasks = useTasksStore((s) => s.fetchAllTasks)
  const createTask = useTasksStore((s) => s.createTask)
  const gradeTask = useTasksStore((s) => s.gradeTask)
  const deleteTask = useTasksStore((s) => s.deleteTask)
  const openTask = useTasksStore((s) => s.openTask)

  const [selectedStudent, setSelectedStudent] = useState(null)
  const [grading, setGrading] = useState(null)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState({
    title: '', description: '', subject: '', due_date: '', type: 'tarea',
    // Solo se usan los campos relevantes al tipo elegido (ver buildDetails).
    time: '', duration_minutes: '', modality: 'Presencial', topics: '', deliverables: '',
  })
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    if (!isAdmin?.()) return
    fetchStudents()
    fetchAllTasks()
  }, [fetchStudents, fetchAllTasks, isAdmin])

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
    fetchAllTasks(student.id)
    setCreating(false)
    setMsg('')
  }

  // Cada tipo guarda solo los campos que le corresponden en `details` — la
  // tarea normal no lleva nada extra, el proyecto lleva sus entregables, el
  // examen lleva hora/duración/modalidad/temario.
  const buildDetails = () => {
    if (form.type === 'proyecto') {
      const deliverables = form.deliverables.split('\n').map((d) => d.trim()).filter(Boolean)
      return deliverables.length ? { deliverables } : {}
    }
    if (form.type === 'examen') {
      const details = {}
      if (form.time) details.time = form.time
      if (form.duration_minutes) details.duration_minutes = Number(form.duration_minutes)
      if (form.modality) details.modality = form.modality
      if (form.topics.trim()) details.topics = form.topics.trim()
      return details
    }
    return {}
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!selectedStudent || !form.title.trim()) return
    setBusy(true)
    const { error } = await createTask({
      student_id: selectedStudent.id,
      title: form.title.trim(),
      description: form.description.trim() || null,
      subject: form.subject || null,
      due_date: form.due_date || null,
      type: form.type,
      details: buildDetails(),
      assigned_by: session?.user?.id,
    })
    setBusy(false)
    if (error) {
      setMsg(`❌ ${error.message}`)
    } else {
      setMsg(`✅ ${taskTypeOf(form.type).label} creada.`)
      setForm({ title: '', description: '', subject: '', due_date: '', type: 'tarea', time: '', duration_minutes: '', modality: 'Presencial', topics: '', deliverables: '' })
      setCreating(false)
      fetchAllTasks(selectedStudent.id)
    }
  }

  const tasksForSelected = selectedStudent
    ? allTasks.filter((t) => t.student_id === selectedStudent.id)
    : allTasks

  return (
    <div className="flex min-h-screen flex-col bg-background text-text">
      <AppTopBar />

      <main className="flex-1 px-4 py-8 md:px-8">
        <div className="mx-auto max-w-5xl">

          <div className="overflow-hidden rounded-2xl bg-gradient-to-r from-rose-600 to-orange-500 px-6 py-8 shadow-lg">
            <h1 className="text-3xl font-extrabold text-white">📋 Gestión de Tareas</h1>
            <p className="mt-1 text-sm font-medium text-white/85">
              Asigna tareas y proyectos y exámenes a tus alumnos, revisa entregas y pon calificaciones.
            </p>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-3">
            {STATUS_SECTIONS.map((section) => (
              <div key={section.key} className={`rounded-xl border bg-surface px-4 py-2.5 text-center ${section.cls}`}>
                <p className="text-xl font-extrabold">{tasksForSelected.filter((t) => t.status === section.key).length}</p>
                <p className="text-[11px] font-semibold opacity-70">{section.label}</p>
              </div>
            ))}
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
                  onClick={() => { setSelectedStudent(null); fetchAllTasks() }}
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

              {/* Create task button */}
              {selectedStudent && !creating && (
                <button
                  type="button"
                  onClick={() => setCreating(true)}
                  className="mb-4 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-background hover:opacity-90"
                >
                  + Nueva tarea para {selectedStudent.display_name || selectedStudent.email}
                </button>
              )}

              {/* Create form */}
              {creating && selectedStudent && (
                <form onSubmit={handleCreate} className="mb-6 rounded-2xl border border-border bg-surface p-4 space-y-3">
                  <h3 className="font-bold text-text">Nueva tarea</h3>
                  <div>
                    <label className="text-[10px] font-bold uppercase text-text-muted">Título *</label>
                    <input
                      required
                      value={form.title}
                      onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                      className="mt-0.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text outline-none focus:border-primary"
                      placeholder="Ej: Ejercicios capítulo 3"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase text-text-muted">Descripción</label>
                    <textarea
                      rows={2}
                      value={form.description}
                      onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                      className="mt-0.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text outline-none focus:border-primary resize-none"
                      placeholder="Instrucciones, páginas del libro, etc."
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase text-text-muted">Tipo</label>
                    <div className="mt-1 flex gap-2">
                      {Object.entries(TASK_TYPES).map(([key, cfg]) => (
                        <button
                          key={key}
                          type="button"
                          onClick={() => setForm((f) => ({ ...f, type: key }))}
                          className="flex-1 rounded-lg border px-3 py-2 text-xs font-bold transition"
                          style={form.type === key
                            ? { background: `${cfg.color}20`, borderColor: cfg.color, color: cfg.color }
                            : { borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}
                        >
                          {cfg.icon} {cfg.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-bold uppercase text-text-muted">Materia</label>
                      <select
                        value={form.subject}
                        onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
                        className="mt-0.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text outline-none focus:border-primary"
                      >
                        <option value="">Sin materia</option>
                        {SUBJECTS.map((s) => <option key={s}>{s}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase text-text-muted">Fecha límite</label>
                      <input
                        type="date"
                        value={form.due_date}
                        onChange={(e) => setForm((f) => ({ ...f, due_date: e.target.value }))}
                        className="mt-0.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text outline-none focus:border-primary"
                      />
                    </div>
                  </div>

                  {/* Campos propios de cada tipo */}
                  {form.type === 'proyecto' && (
                    <div>
                      <label className="text-[10px] font-bold uppercase text-text-muted">Entregables (uno por línea)</label>
                      <textarea
                        rows={3}
                        value={form.deliverables}
                        onChange={(e) => setForm((f) => ({ ...f, deliverables: e.target.value }))}
                        className="mt-0.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text outline-none focus:border-primary resize-none"
                        placeholder={'Ej:\nInvestigación preliminar\nBorrador\nEntrega final'}
                      />
                    </div>
                  )}
                  {form.type === 'examen' && (
                    <div className="space-y-3 rounded-xl border border-red-500/20 bg-red-500/5 p-3">
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="text-[10px] font-bold uppercase text-text-muted">Hora</label>
                          <input
                            type="time"
                            value={form.time}
                            onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))}
                            className="mt-0.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text outline-none focus:border-primary"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold uppercase text-text-muted">Duración (min)</label>
                          <input
                            type="number"
                            min={1}
                            value={form.duration_minutes}
                            onChange={(e) => setForm((f) => ({ ...f, duration_minutes: e.target.value }))}
                            className="mt-0.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text outline-none focus:border-primary"
                            placeholder="60"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold uppercase text-text-muted">Modalidad</label>
                          <select
                            value={form.modality}
                            onChange={(e) => setForm((f) => ({ ...f, modality: e.target.value }))}
                            className="mt-0.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text outline-none focus:border-primary"
                          >
                            <option>Presencial</option>
                            <option>Virtual</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold uppercase text-text-muted">Temario</label>
                        <textarea
                          rows={2}
                          value={form.topics}
                          onChange={(e) => setForm((f) => ({ ...f, topics: e.target.value }))}
                          className="mt-0.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text outline-none focus:border-primary resize-none"
                          placeholder="Temas 1 a 4, ejercicios de la guía..."
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2 pt-1">
                    <button type="button" onClick={() => setCreating(false)} className="flex-1 rounded-lg border border-border px-3 py-2 text-sm text-text-muted hover:text-text">
                      Cancelar
                    </button>
                    <button type="submit" disabled={busy} className="flex-1 rounded-lg bg-primary px-3 py-2 text-sm font-bold text-background disabled:opacity-50">
                      {busy ? 'Creando…' : '📤 Asignar tarea'}
                    </button>
                  </div>
                  {msg && <p className="text-xs text-text-muted">{msg}</p>}
                </form>
              )}

              {/* Tasks list */}
              <h2 className="mb-2 text-xs font-black uppercase tracking-widest text-text-muted/60">
                Tareas {selectedStudent ? `de ${selectedStudent.display_name || selectedStudent.email}` : '(todos)'}
                {' '}({tasksForSelected.length})
              </h2>

              {adminLoading ? (
                <p className="py-8 text-center text-sm text-text-muted">Cargando…</p>
              ) : tasksForSelected.length === 0 ? (
                <div className="rounded-2xl border border-border bg-surface py-10 text-center">
                  <p className="text-text-muted text-sm">Sin tareas asignadas.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {STATUS_SECTIONS.map((section) => {
                    const items = tasksForSelected.filter((t) => t.status === section.key)
                    if (items.length === 0) return null
                    return (
                      <section key={section.key}>
                        <div className={`mb-2 flex items-center gap-2 border-b pb-1.5 ${section.cls}`}>
                          <h3 className="text-xs font-extrabold">{section.label}</h3>
                          <span className="text-[11px] font-bold opacity-60">{items.length}</span>
                        </div>
                        <div className="space-y-3">
                          {items.map((task) => {
                            const type = taskTypeOf(task.type)
                            return (
                              <div
                                key={task.id}
                                onClick={() => openTask(task.id)}
                                className="cursor-pointer overflow-hidden rounded-2xl border border-border bg-surface p-4 transition-colors hover:border-border/80"
                                style={{ borderLeft: `4px solid ${type.color}` }}
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <div className="flex-1 min-w-0">
                                    <div className="mb-1 flex flex-wrap items-center gap-1.5">
                                      <span
                                        className="rounded-full px-2 py-0.5 text-[10px] font-bold"
                                        style={{ background: `${type.color}18`, color: type.color, border: `1px solid ${type.color}30` }}
                                      >
                                        {type.icon} {type.label}
                                      </span>
                                      {task.subject && <span className="text-xs text-text-muted">{task.subject}</span>}
                                    </div>
                                    {!selectedStudent && task.profiles && (
                                      <p className="text-xs font-bold text-primary mb-0.5">
                                        {task.profiles.display_name || task.profiles.email}
                                      </p>
                                    )}
                                    <p className="font-bold text-text">{task.title}</p>
                                    {task.description && <p className="text-sm text-text-muted mt-0.5 line-clamp-2">{task.description}</p>}
                                    {task.due_date && (
                                      <p className="text-xs text-text-muted/60 mt-1">
                                        📅 {new Date(task.due_date + 'T12:00:00').toLocaleDateString('es-MX', { day:'numeric', month:'short', year:'numeric' })}
                                        {task.type === 'examen' && task.details?.time ? ` · 🕐 ${task.details.time}` : ''}
                                      </p>
                                    )}
                                    {task.type === 'examen' && (task.details?.duration_minutes || task.details?.modality) && (
                                      <p className="text-xs text-text-muted/60">
                                        {task.details?.duration_minutes ? `⏱️ ${task.details.duration_minutes} min` : ''}
                                        {task.details?.duration_minutes && task.details?.modality ? ' · ' : ''}
                                        {task.details?.modality ? `📍 ${task.details.modality}` : ''}
                                      </p>
                                    )}
                                    {task.type === 'proyecto' && task.details?.deliverables?.length > 0 && (
                                      <p className="text-xs text-text-muted/60">📦 {task.details.deliverables.length} entregable{task.details.deliverables.length === 1 ? '' : 's'}</p>
                                    )}
                                    {task.grade != null && (
                                      <p className="text-sm font-bold text-emerald-400 mt-1">
                                        Calificación: {task.grade}/{task.grade_max ?? 10}
                                      </p>
                                    )}
                                  </div>
                                  <div className="flex flex-col items-end gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                                    <div className="flex gap-1">
                                      {(task.status === 'entregada' || task.status === 'pendiente') && (
                                        <button
                                          type="button"
                                          onClick={() => setGrading(task)}
                                          className="rounded-lg border border-primary/40 px-2 py-1 text-xs font-semibold text-primary hover:bg-primary/10"
                                        >
                                          📝 Calificar
                                        </button>
                                      )}
                                      {task.status === 'revisada' && (
                                        <button
                                          type="button"
                                          onClick={() => setGrading(task)}
                                          className="rounded-lg border border-border px-2 py-1 text-xs text-text-muted hover:text-text"
                                        >
                                          ✏️
                                        </button>
                                      )}
                                      <button
                                        type="button"
                                        onClick={() => deleteTask(task.id)}
                                        className="rounded-lg border border-danger/30 px-2 py-1 text-xs text-danger hover:bg-danger/10"
                                      >
                                        🗑️
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </section>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {grading && (
        <GradeModal
          task={grading}
          onClose={() => setGrading(null)}
          onSave={gradeTask}
        />
      )}
    </div>
  )
}
