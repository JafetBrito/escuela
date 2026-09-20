import { useEffect, useState } from 'react'
import { supabase } from '../../services/supabase/client'
import { useAuthStore } from '../../stores/useAuthStore'
import { useLiveClassStore, makeJitsiUrl } from '../../stores/useLiveClassStore'
import { getAcademy } from '../../data/academies'
import { ControlPanel } from '../admin/AdminLiveClassesPage'
import TeacherShell from './TeacherShell'

// Clases en vivo del profesor (/profesor/clases): las crea para los alumnos
// de SU academia (migration_077) y las conduce con el mismo panel de control
// que usa el admin (agenda, preguntas, recursos, chat…), sin recompensas.
// Dos modos: videollamada (Jitsi) o Salón VR (una sala compartida en /vr/sala).
const STATUS = {
  programada: { label: 'Programada', cls: 'bg-amber-500/20 text-amber-500' },
  en_vivo: { label: '🔴 En vivo', cls: 'bg-red-500/20 text-red-500' },
  finalizada: { label: 'Finalizada', cls: 'bg-emerald-500/20 text-emerald-500' },
}
const roomCode = () => Array.from(crypto.getRandomValues(new Uint8Array(8)), (b) => 'abcdefghijkmnpqrstuvwxyz23456789'[b % 32]).join('')
const today = () => new Date().toISOString().slice(0, 10)

export default function TeacherLiveClassesPage() {
  const isTeacher = useAuthStore((s) => s.isTeacher)
  const academy = getAcademy(useAuthStore((s) => s.profile?.academy_id))
  const classes = useLiveClassStore((s) => s.classes)
  const fetchClasses = useLiveClassStore((s) => s.fetchClasses)
  const startClass = useLiveClassStore((s) => s.startClass)
  const deleteClass = useLiveClassStore((s) => s.deleteClass)
  const closeClass = useLiveClassStore((s) => s.closeClass)
  const [openId, setOpenId] = useState(null)
  const [form, setForm] = useState({ title: '', description: '', mode: 'video', date: today(), time: '17:00' })
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => { if (isTeacher?.()) fetchClasses() }, [fetchClasses, isTeacher])

  if (!isTeacher?.()) return <TeacherShell />

  const create = async (e) => {
    e.preventDefault()
    setBusy(true)
    const meetUrl = form.mode === 'vr' ? `${window.location.origin}/vr/sala/${roomCode()}` : makeJitsiUrl(form.title)
    const { data, error } = await supabase.rpc('teacher_create_live_class', {
      p_title: form.title, p_description: form.description, p_meet_url: meetUrl, p_scheduled: new Date(`${form.date}T${form.time}`).toISOString(),
    })
    setBusy(false)
    if (error) { setMsg('❌ No se pudo crear. ¿Ya corriste migration_077.sql?'); return }
    if (!data?.ok) { setMsg(`❌ ${data?.message}`); return }
    setMsg('✅ Clase creada. Se avisó a los alumnos de tu academia.')
    setForm((f) => ({ ...f, title: '', description: '' }))
    fetchClasses()
  }

  const goLive = async (c) => {
    await startClass(c.id)
    setOpenId(c.id)
  }

  return (
    <TeacherShell>
      <div className="space-y-6">
        <div className="rounded-2xl bg-gradient-to-r from-amber-500 to-indigo-600 px-6 py-6 shadow-lg">
          <h1 className="text-2xl font-black text-white">🎥 Mis clases en vivo</h1>
          <p className="mt-1 text-sm font-medium text-white/90">{academy ? `Para los alumnos de ${academy.name}.` : 'Tu cuenta aún no pertenece a una academia.'}</p>
        </div>

        {msg && <p className="rounded-xl border border-border bg-surface px-4 py-2 text-sm">{msg}</p>}

        {openId ? (
          <ControlPanel classId={openId} students={[]} canReward={false} onClose={() => { closeClass(); setOpenId(null) }} />
        ) : (
          academy && (
            <div className="grid gap-6 xl:grid-cols-2">
              <form onSubmit={create} className="space-y-3 rounded-2xl border border-border bg-surface p-5">
                <p className="text-sm font-extrabold text-text">➕ Programar una clase</p>
                <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} maxLength={140} placeholder="Título de la clase" className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text outline-none focus:border-primary" />
                <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={3} placeholder="De qué trata (opcional)" className="w-full resize-y rounded-lg border border-border bg-background px-3 py-2 text-sm text-text outline-none focus:border-primary" />
                <div className="flex flex-wrap gap-2">
                  <input type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-text outline-none focus:border-primary" />
                  <input type="time" value={form.time} onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))} className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-text outline-none focus:border-primary" />
                </div>
                <div className="flex gap-2">
                  {[['video', '📹 Videollamada'], ['vr', '🕶️ Salón en VR']].map(([k, l]) => (
                    <button key={k} type="button" onClick={() => setForm((f) => ({ ...f, mode: k }))} className={`flex-1 rounded-lg border px-3 py-2 text-sm font-bold transition ${form.mode === k ? 'border-primary bg-primary/15 text-primary' : 'border-border text-text-muted hover:text-text'}`}>{l}</button>
                  ))}
                </div>
                <p className="text-[11px] text-text-muted">
                  {form.mode === 'vr' ? 'Se crea un salón de clases en VR (una sala compartida) donde tú y tus alumnos se reúnen y chatean. La pantalla muestra la transmisión en vivo si hay una activa.' : 'Se crea una sala de videollamada (Jitsi) y el Hub de la clase con agenda, preguntas y chat.'}
                </p>
                <button type="submit" disabled={busy || !form.title.trim()} className="rounded-lg bg-primary px-5 py-2 text-sm font-bold text-background hover:opacity-90 disabled:opacity-40">{busy ? 'Creando…' : 'Crear y avisar a mis alumnos'}</button>
              </form>

              <div className="space-y-2.5 rounded-2xl border border-border bg-surface p-5">
                <p className="text-sm font-extrabold text-text">Mis clases ({classes.length})</p>
                {classes.length === 0 && <p className="text-sm text-text-muted">Aún no has creado clases.</p>}
                {classes.map((c) => {
                  const meta = STATUS[c.status] ?? STATUS.programada
                  return (
                    <div key={c.id} className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-background p-3">
                      <button onClick={() => setOpenId(c.id)} className="min-w-0 flex-1 text-left">
                        <p className="truncate text-sm font-bold text-text">{c.title}</p>
                        <p className="text-[11px] text-text-muted">{c.meet_url?.includes('/vr/sala/') ? '🕶️ Salón VR' : '📹 Videollamada'} · {new Date(c.scheduled_at).toLocaleString('es-MX', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                      </button>
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${meta.cls}`}>{meta.label}</span>
                      {c.status === 'programada' && <button onClick={() => goLive(c)} className="rounded-lg bg-red-600 px-2.5 py-1 text-xs font-bold text-white hover:bg-red-500">▶ Iniciar</button>}
                      {c.meet_url?.includes('/vr/sala/') && c.status !== 'finalizada' && (
                        <a href={c.meet_url} className="rounded-lg border border-border px-2.5 py-1 text-xs font-bold text-text-muted hover:text-primary">Entrar</a>
                      )}
                      <button onClick={() => window.confirm('¿Borrar esta clase?') && deleteClass(c.id)} className="rounded-lg border border-danger/30 px-2 py-1 text-xs text-danger hover:bg-danger/10">🗑️</button>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        )}
      </div>
    </TeacherShell>
  )
}
