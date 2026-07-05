import { useEffect, useState } from 'react'
import AppTopBar from '../shared/AppTopBar'
import MascotCompanion from '../mascot/MascotCompanion'
import { useTasksStore } from '../../stores/useTasksStore'

const STATUS_META = {
  pendiente:  { label: 'Pendiente',  cls: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
  entregada:  { label: 'Entregada', cls: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  revisada:   { label: 'Revisada',  cls: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
}

const SUBJECT_COLORS = {
  Matemáticas: 'text-blue-400', Física: 'text-amber-400', Historia: 'text-orange-400',
  Biología: 'text-emerald-400', Química: 'text-purple-400', Filosofía: 'text-yellow-400',
  Psicología: 'text-pink-400', Programación: 'text-cyan-400', Inglés: 'text-indigo-400',
}

function gradeColor(grade, max) {
  const pct = grade / max
  if (pct >= 0.9) return 'text-emerald-400'
  if (pct >= 0.7) return 'text-amber-400'
  return 'text-red-400'
}

function TaskCard({ task, onSubmit }) {
  const [confirming, setConfirming] = useState(false)
  const [busy, setBusy] = useState(false)
  const meta = STATUS_META[task.status] ?? STATUS_META.pendiente
  const isOverdue = task.due_date && task.status === 'pendiente' && new Date(task.due_date) < new Date()

  const handleSubmit = async () => {
    setBusy(true)
    await onSubmit(task.id)
    setBusy(false)
    setConfirming(false)
  }

  return (
    <div className={`rounded-2xl border bg-surface p-4 transition ${isOverdue ? 'border-red-500/30' : 'border-border'}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            {task.subject && (
              <span className={`text-xs font-bold ${SUBJECT_COLORS[task.subject] ?? 'text-text-muted'}`}>
                {task.subject}
              </span>
            )}
            {isOverdue && (
              <span className="rounded-full border border-red-500/40 bg-red-500/10 px-2 py-0.5 text-[10px] font-bold text-red-400">
                Vencida
              </span>
            )}
          </div>
          <h3 className="mt-1 font-bold text-text">{task.title}</h3>
          {task.description && (
            <p className="mt-1 text-sm text-text-muted">{task.description}</p>
          )}
          {task.due_date && (
            <p className="mt-1.5 text-xs text-text-muted/60">
              📅 Entrega: {new Date(task.due_date + 'T12:00:00').toLocaleDateString('es-MX', { weekday:'short', day:'numeric', month:'short', year:'numeric' })}
            </p>
          )}
        </div>

        <div className="flex flex-col items-end gap-2 shrink-0">
          <span className={`rounded-full border px-2.5 py-0.5 text-xs font-bold ${meta.cls}`}>
            {meta.label}
          </span>
          {task.status === 'revisada' && task.grade != null && (
            <span className={`text-xl font-extrabold ${gradeColor(task.grade, task.grade_max ?? 10)}`}>
              {task.grade}/{task.grade_max ?? 10}
            </span>
          )}
        </div>
      </div>

      {/* Feedback from teacher */}
      {task.status === 'revisada' && task.feedback && (
        <div className="mt-3 rounded-xl border border-primary/20 bg-primary/5 px-3 py-2">
          <p className="text-[10px] font-bold uppercase text-primary/60">Comentarios del profesor</p>
          <p className="mt-0.5 text-sm text-text">{task.feedback}</p>
        </div>
      )}

      {/* Submit button */}
      {task.status === 'pendiente' && (
        <div className="mt-3 flex justify-end">
          {confirming ? (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setConfirming(false)}
                className="rounded-lg border border-border px-3 py-1.5 text-xs text-text-muted hover:text-text"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={handleSubmit}
                className="rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-background disabled:opacity-50"
              >
                {busy ? 'Enviando…' : '✅ Confirmar entrega'}
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirming(true)}
              className="rounded-lg border border-primary/40 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/10"
            >
              Marcar como entregada
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default function TasksPage() {
  const tasks = useTasksStore((s) => s.tasks)
  const loading = useTasksStore((s) => s.loading)
  const fetchMyTasks = useTasksStore((s) => s.fetchMyTasks)
  const submitTask = useTasksStore((s) => s.submitTask)

  const [filter, setFilter] = useState('all')

  useEffect(() => { fetchMyTasks() }, [fetchMyTasks])

  const filtered = filter === 'all' ? tasks : tasks.filter((t) => t.status === filter)

  const counts = {
    pendiente: tasks.filter((t) => t.status === 'pendiente').length,
    entregada: tasks.filter((t) => t.status === 'entregada').length,
    revisada:  tasks.filter((t) => t.status === 'revisada').length,
  }

  const avgGrade = (() => {
    const graded = tasks.filter((t) => t.grade != null)
    if (!graded.length) return null
    const avg = graded.reduce((sum, t) => sum + (t.grade / (t.grade_max ?? 10)) * 10, 0) / graded.length
    return avg.toFixed(1)
  })()

  return (
    <div className="flex min-h-screen flex-col bg-background text-text">
      <AppTopBar />

      <main className="flex-1 px-4 py-8 md:px-8">
        <div className="mx-auto max-w-3xl">

          {/* Header */}
          <div className="overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-500 px-6 py-8 shadow-lg">
            <h1 className="text-3xl font-extrabold text-white drop-shadow-sm">📋 Mis Tareas</h1>
            <p className="mt-1 text-sm font-medium text-white/85">
              Aquí aparecen todas las tareas que tu profesor te ha asignado.
            </p>
          </div>

          {/* Stats */}
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-2xl border border-border bg-surface p-4 text-center">
              <p className="text-2xl font-extrabold text-amber-400">{counts.pendiente}</p>
              <p className="text-xs text-text-muted">Pendientes</p>
            </div>
            <div className="rounded-2xl border border-border bg-surface p-4 text-center">
              <p className="text-2xl font-extrabold text-blue-400">{counts.entregada}</p>
              <p className="text-xs text-text-muted">Entregadas</p>
            </div>
            <div className="rounded-2xl border border-border bg-surface p-4 text-center">
              <p className="text-2xl font-extrabold text-emerald-400">{counts.revisada}</p>
              <p className="text-xs text-text-muted">Revisadas</p>
            </div>
            <div className="rounded-2xl border border-border bg-surface p-4 text-center">
              <p className={`text-2xl font-extrabold ${avgGrade ? gradeColor(parseFloat(avgGrade), 10) : 'text-text-muted'}`}>
                {avgGrade ?? '—'}
              </p>
              <p className="text-xs text-text-muted">Promedio</p>
            </div>
          </div>

          {/* Filter tabs */}
          <div className="mt-6 flex gap-1 rounded-xl border border-border bg-surface p-1">
            {[['all', 'Todas'], ['pendiente', 'Pendientes'], ['entregada', 'Entregadas'], ['revisada', 'Revisadas']].map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setFilter(key)}
                className={`flex-1 rounded-lg px-3 py-1.5 text-xs font-bold transition ${filter === key ? 'bg-background text-text shadow-sm' : 'text-text-muted hover:text-text'}`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Task list */}
          <div className="mt-4 space-y-3">
            {loading ? (
              <p className="py-12 text-center text-sm text-text-muted">Cargando tareas…</p>
            ) : filtered.length === 0 ? (
              <div className="rounded-2xl border border-border bg-surface py-12 text-center">
                <p className="text-3xl">✅</p>
                <p className="mt-2 text-sm text-text-muted">No hay tareas en esta categoría.</p>
              </div>
            ) : (
              filtered.map((task) => (
                <TaskCard key={task.id} task={task} onSubmit={submitTask} />
              ))
            )}
          </div>
        </div>
      </main>

      <MascotCompanion />
    </div>
  )
}
