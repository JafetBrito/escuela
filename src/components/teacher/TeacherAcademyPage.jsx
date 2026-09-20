import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../../services/supabase/client'
import { useAuthStore } from '../../stores/useAuthStore'
import { getAcademy } from '../../data/academies'
import TeacherShell from './TeacherShell'

// Mi academia (/profesor/academia): los alumnos inscritos en la academia del
// profesor, asignarles una tarea y calificar lo que entreguen (migration_076).
export default function TeacherAcademyPage() {
  const isTeacher = useAuthStore((s) => s.isTeacher)
  const academy = getAcademy(useAuthStore((s) => s.profile?.academy_id))
  const [roster, setRoster] = useState([])
  const [tasks, setTasks] = useState([])
  const [picked, setPicked] = useState({})
  const [form, setForm] = useState({ title: '', description: '', subject: '', due: '' })
  const [msg, setMsg] = useState('')
  const [grading, setGrading] = useState({}) // { [taskId]: { grade, feedback } }

  const load = useCallback(async () => {
    if (!supabase) return
    const [r, t] = await Promise.all([supabase.rpc('teacher_roster'), supabase.rpc('teacher_tasks')])
    setRoster(r.data ?? [])
    setTasks(t.data ?? [])
  }, [])

  useEffect(() => { load() }, [load])

  if (!isTeacher?.()) return <TeacherShell />

  const ids = Object.keys(picked).filter((id) => picked[id])
  const allSelected = roster.length > 0 && ids.length === roster.length

  const assign = async (e) => {
    e.preventDefault()
    const { data, error } = await supabase.rpc('teacher_assign_task', {
      p_students: ids, p_title: form.title, p_description: form.description, p_subject: form.subject || academy?.name || null, p_due: form.due || null,
    })
    setMsg(error ? '❌ No se pudo asignar. ¿Ya corriste migration_076.sql?' : (data?.ok ? `✅ ${data.message}` : `❌ ${data?.message}`))
    if (data?.ok) { setForm({ title: '', description: '', subject: '', due: '' }); setPicked({}); load() }
  }

  const grade = async (task) => {
    const g = grading[task.id]
    if (!g || g.grade === '' || g.grade == null) return
    const { data } = await supabase.rpc('teacher_grade_task', { p_task: task.id, p_grade: Number(g.grade), p_feedback: g.feedback ?? '' })
    setMsg(data?.ok ? '✅ Calificación enviada.' : `❌ ${data?.message ?? 'No se pudo calificar.'}`)
    if (data?.ok) load()
  }

  return (
    <TeacherShell>
      <div className="space-y-6">
        <div className="rounded-2xl bg-gradient-to-r from-amber-500 to-indigo-600 px-6 py-6 shadow-lg">
          <h1 className="text-2xl font-black text-white">{academy ? `${academy.emoji} ${academy.name}` : '🎓 Mi academia'}</h1>
          <p className="mt-1 text-sm font-medium text-white/90">Tus alumnos inscritos, sus tareas y calificaciones.</p>
        </div>

        {!academy && (
          <p className="rounded-2xl border border-dashed border-border p-6 text-sm text-text-muted">
            Tu cuenta todavía no pertenece a ninguna academia. Pídele a tu director que te sume desde su panel (/director).
          </p>
        )}

        {msg && <p className="rounded-xl border border-border bg-surface px-4 py-2 text-sm">{msg}</p>}

        {academy && (
          <div className="grid gap-6 xl:grid-cols-2">
            <form onSubmit={assign} className="space-y-3 rounded-2xl border border-border bg-surface p-5">
              <p className="text-sm font-extrabold text-text">📋 Asignar una tarea</p>
              <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} maxLength={140} placeholder="Título de la tarea" className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text outline-none focus:border-primary" />
              <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={4} placeholder="Instrucciones" className="w-full resize-y rounded-lg border border-border bg-background px-3 py-2 text-sm text-text outline-none focus:border-primary" />
              <div className="flex flex-wrap gap-2">
                <input value={form.subject} onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))} placeholder={`Materia (${academy.name})`} className="min-w-0 flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-text outline-none focus:border-primary" />
                <input type="date" value={form.due} onChange={(e) => setForm((f) => ({ ...f, due: e.target.value }))} className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-text outline-none focus:border-primary" />
              </div>

              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-text-muted">Alumnos inscritos ({roster.length})</p>
                  {roster.length > 0 && (
                    <button type="button" onClick={() => setPicked(allSelected ? {} : Object.fromEntries(roster.map((s) => [s.id, true])))} className="text-xs font-semibold text-primary hover:underline">
                      {allSelected ? 'Quitar todos' : 'Seleccionar todos'}
                    </button>
                  )}
                </div>
                {roster.length === 0 ? (
                  <p className="text-xs text-text-muted">Aún no hay alumnos inscritos. Se inscriben desde la página de la academia con el botón “Inscribirme”.</p>
                ) : (
                  <div className="flex max-h-48 flex-wrap gap-2 overflow-y-auto">
                    {roster.map((s) => (
                      <button key={s.id} type="button" onClick={() => setPicked((p) => ({ ...p, [s.id]: !p[s.id] }))}
                        className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${picked[s.id] ? 'border-primary bg-primary/15 text-primary' : 'border-border text-text-muted hover:text-text'}`}>
                        {picked[s.id] ? '✓ ' : ''}{s.name}<span className="font-mono opacity-60">#{s.tag}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button type="submit" disabled={!form.title.trim() || ids.length === 0} className="rounded-lg bg-primary px-5 py-2 text-sm font-bold text-background hover:opacity-90 disabled:opacity-40">
                Asignar a {ids.length} alumno(s)
              </button>
            </form>

            <div className="space-y-3 rounded-2xl border border-border bg-surface p-5">
              <p className="text-sm font-extrabold text-text">✅ Tareas asignadas ({tasks.length})</p>
              {tasks.length === 0 && <p className="text-sm text-text-muted">Aún no has asignado tareas.</p>}
              <ul className="max-h-[36rem] space-y-2.5 overflow-y-auto">
                {tasks.map((t) => (
                  <li key={t.id} className="rounded-xl border border-border bg-background p-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-bold text-text">{t.title}</p>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${t.status === 'revisada' ? 'bg-emerald-500/15 text-emerald-500' : t.status === 'entregada' ? 'bg-amber-500/15 text-amber-500' : 'bg-surface-hover text-text-muted'}`}>
                        {t.status === 'revisada' ? `Calificada ${t.grade}/${t.gradeMax}` : t.status === 'entregada' ? 'Entregada — por calificar' : 'Pendiente'}
                      </span>
                    </div>
                    <p className="text-[11px] text-text-muted">{t.student}{t.due ? ` · vence ${t.due}` : ''}</p>
                    {t.status !== 'revisada' && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        <input type="number" min="0" max={t.gradeMax ?? 10} step="0.1" placeholder={`0-${t.gradeMax ?? 10}`} value={grading[t.id]?.grade ?? ''}
                          onChange={(e) => setGrading((g) => ({ ...g, [t.id]: { ...g[t.id], grade: e.target.value } }))}
                          className="w-20 rounded-lg border border-border bg-surface px-2 py-1.5 text-sm text-text outline-none focus:border-primary" />
                        <input placeholder="Comentario (opcional)" value={grading[t.id]?.feedback ?? ''}
                          onChange={(e) => setGrading((g) => ({ ...g, [t.id]: { ...g[t.id], feedback: e.target.value } }))}
                          className="min-w-0 flex-1 rounded-lg border border-border bg-surface px-2 py-1.5 text-sm text-text outline-none focus:border-primary" />
                        <button type="button" onClick={() => grade(t)} className="rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-background">Calificar</button>
                      </div>
                    )}
                    {t.feedback && <p className="mt-1.5 text-xs text-text-muted">💬 {t.feedback}</p>}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </TeacherShell>
  )
}
