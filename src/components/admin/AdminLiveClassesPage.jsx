import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import AppTopBar from '../shared/AppTopBar'
import { useLiveClassStore, canJoinClass, makeJitsiUrl, classShortCode } from '../../stores/useLiveClassStore'
import { useAdminUsersStore } from '../../stores/useAdminUsersStore'
import { useAuthStore } from '../../stores/useAuthStore'
import HubContent from '../liveclass/HubContent'
import { GLOBAL_MISSIONS } from '../../data/globalMissionsRegistry'
import { COURSE_MISSIONS } from '../../data/courseMissionsRegistry'

// Misma lista plana que usa AdminTasksPage.jsx para "adjuntar misión" —
// una clase también puede enlazar una misión REAL del registro (no solo las
// entradas manuales de texto libre que ya vive en activeClass.missions).
const ALL_MISSIONS = [...GLOBAL_MISSIONS, ...Object.values(COURSE_MISSIONS).flat()]

const STATUS_META = {
  programada: { label: 'Programada', cls: 'bg-amber-500/20 text-amber-400' },
  en_vivo:    { label: '🔴 En vivo', cls: 'bg-red-500/20 text-red-400' },
  finalizada: { label: 'Finalizada', cls: 'bg-emerald-500/20 text-emerald-400' },
}

const TIME_SLOTS = ['16:00', '17:00', '18:00', '19:00', '20:00']

function todayISO(offsetDays = 0) {
  const d = new Date()
  d.setDate(d.getDate() + offsetDays)
  return d.toISOString().slice(0, 10)
}

function CreateForm({ students, onCreate, defaultStudentId = '' }) {
  const [open, setOpen] = useState(!!defaultStudentId)
  const [form, setForm] = useState({ title: '', description: '', studentId: defaultStudentId, date: todayISO(), time: '' })
  const [busy, setBusy] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title.trim() || !form.date || !form.time) return
    setBusy(true)
    await onCreate({
      title: form.title.trim(),
      description: form.description.trim() || null,
      student_id: form.studentId || null,
      meet_url: makeJitsiUrl(form.title.trim()),
      scheduled_at: new Date(`${form.date}T${form.time}`).toISOString(),
    })
    setBusy(false)
    setForm({ title: '', description: '', studentId: '', date: todayISO(), time: '' })
    setOpen(false)
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="mb-4 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-background hover:opacity-90">
        + Nueva clase
      </button>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="mb-6 space-y-3 rounded-2xl border border-border bg-surface p-4">
      <h3 className="font-bold text-text">Nueva clase en vivo</h3>
      <div>
        <label className="text-[10px] font-bold uppercase text-text-muted">Título *</label>
        <input required value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          className="mt-0.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text outline-none focus:border-primary"
          placeholder="Ej: Clase 3 — Componentes en React" />
      </div>
      <div>
        <label className="text-[10px] font-bold uppercase text-text-muted">Descripción</label>
        <textarea rows={2} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          className="mt-0.5 w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm text-text outline-none focus:border-primary" />
      </div>

      <div>
        <label className="text-[10px] font-bold uppercase text-text-muted">¿Para quién es esta clase? *</label>
        <select required value={form.studentId} onChange={(e) => setForm((f) => ({ ...f, studentId: e.target.value }))}
          className="mt-0.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text outline-none focus:border-primary">
          <option value="">Todos los alumnos</option>
          {students.map((s) => (
            <option key={s.id} value={s.id}>{s.display_name || s.email}</option>
          ))}
        </select>
        <p className="mt-1 text-[11px] text-text-muted">Si eliges un alumno, solo a él le llega la notificación y solo él ve esta clase.</p>
      </div>

      <div>
        <label className="text-[10px] font-bold uppercase text-text-muted">Fecha *</label>
        <div className="mt-0.5 flex gap-2">
          <button type="button" onClick={() => setForm((f) => ({ ...f, date: todayISO(0) }))}
            className={`rounded-lg border px-3 py-2 text-xs font-semibold ${form.date === todayISO(0) ? 'border-primary bg-primary/15 text-primary' : 'border-border text-text-muted hover:bg-surface-hover'}`}>Hoy</button>
          <button type="button" onClick={() => setForm((f) => ({ ...f, date: todayISO(1) }))}
            className={`rounded-lg border px-3 py-2 text-xs font-semibold ${form.date === todayISO(1) ? 'border-primary bg-primary/15 text-primary' : 'border-border text-text-muted hover:bg-surface-hover'}`}>Mañana</button>
          <input required type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
            className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-text outline-none focus:border-primary" />
        </div>
      </div>

      <div>
        <label className="text-[10px] font-bold uppercase text-text-muted">Hora *</label>
        <div className="mt-0.5 flex flex-wrap gap-2">
          {TIME_SLOTS.map((t) => (
            <button key={t} type="button" onClick={() => setForm((f) => ({ ...f, time: t }))}
              className={`rounded-lg border px-3 py-2 text-xs font-semibold ${form.time === t ? 'border-primary bg-primary/15 text-primary' : 'border-border text-text-muted hover:bg-surface-hover'}`}>{t}</button>
          ))}
          <input required type="time" value={form.time} onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-text outline-none focus:border-primary" />
        </div>
      </div>

      <p className="text-[11px] text-text-muted">🎥 El enlace de videollamada (Jitsi Meet, open source) se genera solo — no hay que pegar ningún link.</p>

      <div className="flex gap-2 pt-1">
        <button type="button" onClick={() => setOpen(false)} className="flex-1 rounded-lg border border-border px-3 py-2 text-sm text-text-muted hover:text-text">Cancelar</button>
        <button type="submit" disabled={busy} className="flex-1 rounded-lg bg-primary px-3 py-2 text-sm font-bold text-background disabled:opacity-50">
          {busy ? 'Creando…' : '📅 Programar clase'}
        </button>
      </div>
    </form>
  )
}

// Invoca a un alumno en el momento — crea la clase, la marca en vivo y
// dispara la notificación de inmediato, sin pasar por fecha/hora. Para
// cuando el profesor quiere empezar a dar clase ya mismo.
function QuickStartForm({ students, onQuickStart }) {
  const [open, setOpen] = useState(false)
  const [studentId, setStudentId] = useState('')
  const [title, setTitle] = useState('')
  const [busy, setBusy] = useState(false)

  const handleStart = async () => {
    setBusy(true)
    await onQuickStart(studentId || null, title.trim() || 'Clase en vivo')
    setBusy(false)
    setOpen(false)
    setStudentId('')
    setTitle('')
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="mb-4 ml-2 rounded-xl border-2 border-red-500 bg-red-500/10 px-4 py-2 text-sm font-bold text-red-400 hover:bg-red-500/20">
        ⚡ Iniciar clase ahora
      </button>
    )
  }

  return (
    <div className="mb-6 space-y-3 rounded-2xl border border-red-500/30 bg-red-500/5 p-4">
      <h3 className="font-bold text-text">⚡ Iniciar clase ahora</h3>
      <p className="text-xs text-text-muted">Crea la clase, la marca en vivo y notifica al alumno de inmediato — sin programar nada. Se abre el panel de control con el link de Jitsi listo.</p>
      <div>
        <label className="text-[10px] font-bold uppercase text-text-muted">¿A quién invocas?</label>
        <select value={studentId} onChange={(e) => setStudentId(e.target.value)}
          className="mt-0.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text outline-none focus:border-primary">
          <option value="">Todos los alumnos</option>
          {students.map((s) => <option key={s.id} value={s.id}>{s.display_name || s.email}</option>)}
        </select>
      </div>
      <div>
        <label className="text-[10px] font-bold uppercase text-text-muted">Título (opcional)</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Clase en vivo"
          className="mt-0.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text outline-none focus:border-primary" />
      </div>
      <div className="flex gap-2 pt-1">
        <button type="button" onClick={() => setOpen(false)} className="flex-1 rounded-lg border border-border px-3 py-2 text-sm text-text-muted hover:text-text">Cancelar</button>
        <button type="button" onClick={handleStart} disabled={busy} className="flex-1 rounded-lg bg-red-500 px-3 py-2 text-sm font-bold text-white disabled:opacity-50">
          {busy ? 'Invocando…' : '🔴 Invocar y empezar'}
        </button>
      </div>
    </div>
  )
}

const TABS = [
  { key: 'contenido', label: '📍 Contenido' },
  { key: 'recursos', label: '📎 Recursos' },
  { key: 'misiones', label: '🎯 Misiones' },
  { key: 'preguntas', label: '❓ Preguntas' },
  { key: 'preview', label: '👁️ Vista del alumno' },
]

// Panel de control de una clase abierta — aquí el profesor organiza todo en
// vivo mientras enseña desde otra pantalla/pestaña con Jitsi abierto.
function ControlPanel({ classId, students, onClose }) {
  const activeClass    = useLiveClassStore((s) => s.activeClass)
  const questions      = useLiveClassStore((s) => s.questions)
  const pings          = useLiveClassStore((s) => s.pings)
  const openClass      = useLiveClassStore((s) => s.openClass)
  const startClass     = useLiveClassStore((s) => s.startClass)
  const endClass       = useLiveClassStore((s) => s.endClass)
  const updateClass    = useLiveClassStore((s) => s.updateClass)
  const answerQuestion = useLiveClassStore((s) => s.answerQuestion)
  const uploadResource = useLiveClassStore((s) => s.uploadResource)
  const addMission     = useLiveClassStore((s) => s.addMission)
  const removeMission  = useLiveClassStore((s) => s.removeMission)
  const sendPing       = useLiveClassStore((s) => s.sendPing)

  const [tab, setTab] = useState('contenido')
  const [pingSent, setPingSent] = useState(false)
  const [topicDraft, setTopicDraft] = useState('')
  const [videoDraft, setVideoDraft] = useState('')
  const [agendaDraft, setAgendaDraft] = useState('')
  const [resourceLabel, setResourceLabel] = useState('')
  const [resourceUrl, setResourceUrl] = useState('')
  const [uploading, setUploading] = useState(false)
  const [missionTitle, setMissionTitle] = useState('')
  const [missionDesc, setMissionDesc] = useState('')
  const [linkedMissionId, setLinkedMissionId] = useState('')
  const [answerDrafts, setAnswerDrafts] = useState({})
  const [xpDraft, setXpDraft] = useState('')
  const [goldDraft, setGoldDraft] = useState('')

  useEffect(() => { openClass(classId) }, [classId, openClass])
  useEffect(() => { setTopicDraft(activeClass?.current_topic ?? '') }, [activeClass?.current_topic])
  useEffect(() => { setVideoDraft(activeClass?.demo_video_id ?? '') }, [activeClass?.demo_video_id])
  useEffect(() => { setLinkedMissionId(activeClass?.linked_mission?.missionId ?? '') }, [activeClass?.linked_mission])
  useEffect(() => { setXpDraft(String(activeClass?.xp_reward ?? 0)) }, [activeClass?.xp_reward])
  useEffect(() => { setGoldDraft(String(activeClass?.gold_reward ?? 0)) }, [activeClass?.gold_reward])

  if (!activeClass) return <p className="text-sm text-text-muted">Cargando…</p>
  const meta = STATUS_META[activeClass.status] ?? STATUS_META.programada
  const targetStudent = students.find((s) => s.id === activeClass.student_id)

  const setCurrentTopic = (label) => updateClass(classId, { current_topic: label })

  const addAgendaItem = () => {
    if (!agendaDraft.trim()) return
    updateClass(classId, { agenda: [...(activeClass.agenda ?? []), { label: agendaDraft.trim() }] })
    setAgendaDraft('')
  }

  const addResource = () => {
    if (!resourceLabel.trim() || !resourceUrl.trim()) return
    updateClass(classId, { resources: [...(activeClass.resources ?? []), { label: resourceLabel.trim(), url: resourceUrl.trim() }] })
    setResourceLabel('')
    setResourceUrl('')
  }

  const handleFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    await uploadResource(classId, file)
    setUploading(false)
    e.target.value = ''
  }

  const handleAddMission = () => {
    if (!missionTitle.trim()) return
    addMission(classId, { title: missionTitle.trim(), description: missionDesc.trim() || null })
    setMissionTitle('')
    setMissionDesc('')
  }

  const handleLinkMission = (missionId) => {
    setLinkedMissionId(missionId)
    if (!missionId) { updateClass(classId, { linked_mission: null }); return }
    const mission = ALL_MISSIONS.find((m) => m.id === missionId)
    if (mission) updateClass(classId, { linked_mission: { missionId: mission.id, title: mission.title, icon: mission.icon } })
  }

  const handleSaveReward = () => {
    updateClass(classId, { xp_reward: Number(xpDraft) || 0, gold_reward: Number(goldDraft) || 0 })
  }

  // Ping dirigido al alumno (no una respuesta a su mano/ping) — le suena y
  // se lo anuncia por voz en su Hub, útil para llamar su atención en vivo.
  const handleCallAttention = async () => {
    if (!activeClass.student_id) return
    await sendPing(classId, activeClass.student_id, 'atencion')
    setPingSent(true)
    setTimeout(() => setPingSent(false), 2000)
  }

  return (
    <div className="space-y-4">
      <button onClick={onClose} className="text-sm text-text-muted hover:text-primary">← Todas las clases</button>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-surface p-4">
        <div>
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${meta.cls}`}>{meta.label}</span>
          <h1 className="mt-1 text-xl font-extrabold text-text">{activeClass.title}</h1>
          <p className="text-xs text-text-muted">
            👤 {targetStudent ? (targetStudent.display_name || targetStudent.email) : 'Todos los alumnos'}
            {' · '}{new Date(activeClass.scheduled_at).toLocaleString('es-MX', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
            {' · '}🔗 código: <span className="font-mono font-bold text-primary">{classShortCode(activeClass.id)}</span>
          </p>
        </div>
        <div className="flex gap-2">
          {activeClass.student_id && (
            <button onClick={handleCallAttention} disabled={pingSent}
              className={`rounded-lg border px-4 py-2 text-sm font-bold transition ${pingSent ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400' : 'border-border text-text hover:bg-surface-hover'}`}>
              {pingSent ? '✅ Enviado' : '🔔 Llamar la atención'}
            </button>
          )}
          <a href={activeClass.meet_url} target="_blank" rel="noopener noreferrer"
            className="rounded-lg border border-border px-4 py-2 text-sm font-bold text-text hover:bg-surface-hover">🎥 Abrir Jitsi</a>
          {activeClass.status !== 'en_vivo' && activeClass.status !== 'finalizada' && (
            <button onClick={() => startClass(classId)} className="rounded-lg bg-red-500 px-4 py-2 text-sm font-bold text-white hover:opacity-90">🔴 Iniciar clase</button>
          )}
          {activeClass.status === 'en_vivo' && (
            <button onClick={() => endClass(classId)} className="rounded-lg border border-border px-4 py-2 text-sm font-bold text-text-muted hover:text-text">Finalizar clase</button>
          )}
        </div>
      </div>

      {pings.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-amber-500/30 bg-amber-500/5 px-4 py-2.5">
          <span className="text-xs font-bold uppercase tracking-wide text-amber-400">Actividad en vivo</span>
          {pings.slice(0, 6).map((p) => (
            <span key={p.id} className="rounded-full bg-amber-500/15 px-2.5 py-1 text-xs font-semibold text-amber-300">
              {p.kind === 'entro' ? `🚪 ${activeClass.student_name || 'Alumno'} entró` : p.kind === 'mano' ? '🖐️' : '👋'} hace {Math.max(0, Math.round((Date.now() - new Date(p.created_at)) / 1000))}s
            </span>
          ))}
        </div>
      )}

      <div className="flex gap-1 overflow-x-auto rounded-xl border border-border bg-surface p-1">
        {TABS.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-semibold ${tab === t.key ? 'bg-primary text-background' : 'text-text-muted hover:bg-surface-hover'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'contenido' && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-border bg-surface p-4">
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-text-muted">📍 Tema actual (se ve en el Hub del alumno)</p>
            <div className="flex gap-2">
              <input value={topicDraft} onChange={(e) => setTopicDraft(e.target.value)}
                className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-text outline-none focus:border-primary" />
              <button onClick={() => setCurrentTopic(topicDraft)} className="rounded-lg bg-primary px-3 py-2 text-sm font-bold text-background">Actualizar</button>
            </div>
          </div>

          <div className="rounded-2xl border border-dashed border-border bg-surface p-4">
            <p className="mb-1 text-xs font-bold uppercase tracking-wide text-text-muted">🧪 Video de prueba (opcional)</p>
            <p className="mb-2 text-[11px] text-text-muted">Si lo llenas, el alumno ve este video de YouTube en vez del link de Jitsi — sirve para probar todo el Hub sin necesitar a nadie más conectado.</p>
            <div className="flex gap-2">
              <input value={videoDraft} onChange={(e) => setVideoDraft(e.target.value)} placeholder="ID de YouTube, ej: aqz-KE-bpKQ"
                className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-text outline-none focus:border-primary" />
              <button onClick={() => updateClass(classId, { demo_video_id: videoDraft.trim() || null })} className="rounded-lg bg-primary px-3 py-2 text-sm font-bold text-background">Guardar</button>
            </div>
          </div>

          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4">
            <p className="mb-1 text-xs font-bold uppercase tracking-wide text-text-muted">🎁 Recompensa al finalizar la clase</p>
            <p className="mb-2 text-[11px] text-text-muted">Se entrega cuando le das "Finalizar clase" — a este alumno, o a todos los que hayan entrado si la clase es para "Todos los alumnos".</p>
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="text-[10px] font-bold uppercase text-text-muted">✨ XP</label>
                <input type="number" min={0} value={xpDraft} onChange={(e) => setXpDraft(e.target.value)}
                  className="mt-0.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text outline-none focus:border-primary" />
              </div>
              <div className="flex-1">
                <label className="text-[10px] font-bold uppercase text-text-muted">🪙 Monedas</label>
                <input type="number" min={0} value={goldDraft} onChange={(e) => setGoldDraft(e.target.value)}
                  className="mt-0.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text outline-none focus:border-primary" />
              </div>
              <button onClick={handleSaveReward} className="self-end rounded-lg bg-primary px-3 py-2 text-sm font-bold text-background">Guardar</button>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-surface p-4">
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-text-muted">Agenda</p>
            <ul className="mb-2 space-y-1">
              {(activeClass.agenda ?? []).map((item, i) => (
                <li key={i}>
                  <button onClick={() => setCurrentTopic(item.label)}
                    className={`w-full rounded-lg px-3 py-1.5 text-left text-sm ${item.label === activeClass.current_topic ? 'bg-primary/15 font-bold text-primary' : 'text-text-muted hover:bg-surface-hover'}`}>
                    {item.label === activeClass.current_topic ? '▶️' : '▫️'} {item.label}
                  </button>
                </li>
              ))}
            </ul>
            <div className="flex gap-2">
              <input value={agendaDraft} onChange={(e) => setAgendaDraft(e.target.value)} placeholder="Nuevo punto de agenda…"
                className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-text outline-none focus:border-primary" />
              <button onClick={addAgendaItem} className="rounded-lg border border-border px-3 py-2 text-sm font-semibold text-text hover:bg-surface-hover">+ Agregar</button>
            </div>
          </div>
        </div>
      )}

      {tab === 'recursos' && (
        <div className="rounded-2xl border border-border bg-surface p-4">
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-text-muted">Recursos (se empujan al instante)</p>
          <div className="mb-3 space-y-1">
            {(activeClass.resources ?? []).map((r, i) => (
              <p key={i} className="text-sm text-text-muted">{r.type === 'pdf' ? '📄' : '🔗'} {r.label}</p>
            ))}
            {(activeClass.resources ?? []).length === 0 && <p className="text-sm text-text-muted">Sin recursos todavía.</p>}
          </div>

          <label className="mb-3 flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-border px-3 py-3 text-sm font-semibold text-text hover:bg-surface-hover">
            {uploading ? 'Subiendo…' : '📄 Subir PDF'}
            <input type="file" accept="application/pdf" className="hidden" onChange={handleFile} disabled={uploading} />
          </label>

          <p className="mb-1 text-[10px] font-bold uppercase text-text-muted">o pegar un link</p>
          <div className="grid grid-cols-2 gap-2">
            <input value={resourceLabel} onChange={(e) => setResourceLabel(e.target.value)} placeholder="Nombre del recurso"
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-text outline-none focus:border-primary" />
            <input value={resourceUrl} onChange={(e) => setResourceUrl(e.target.value)} placeholder="URL"
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-text outline-none focus:border-primary" />
          </div>
          <button onClick={addResource} className="mt-2 rounded-lg border border-border px-3 py-2 text-sm font-semibold text-text hover:bg-surface-hover">+ Empujar recurso</button>
        </div>
      )}

      {tab === 'misiones' && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-border bg-surface p-4">
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-text-muted">📜 Misión del registro (real, con seguimiento)</p>
            <select value={linkedMissionId} onChange={(e) => handleLinkMission(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text outline-none focus:border-primary">
              <option value="">Sin misión adjunta</option>
              {ALL_MISSIONS.map((m) => <option key={m.id} value={m.id}>{m.icon} {m.title}</option>)}
            </select>
            <p className="mt-1 text-[11px] text-text-muted">A diferencia de las misiones manuales de abajo, esta enlaza a una misión real del sistema — el alumno ve un botón "Ver en Misiones →" en su Hub.</p>
          </div>
        <div className="rounded-2xl border border-border bg-surface p-4">
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-text-muted">Misiones de esta clase</p>
          <div className="mb-3 space-y-2">
            {(activeClass.missions ?? []).map((m, i) => (
              <div key={i} className="flex items-start justify-between gap-2 rounded-xl bg-surface-hover p-3">
                <div>
                  <p className="text-sm font-semibold text-text">🎯 {m.title}</p>
                  {m.description && <p className="text-xs text-text-muted">{m.description}</p>}
                </div>
                <button onClick={() => removeMission(classId, i)} className="shrink-0 text-xs text-danger hover:underline">Quitar</button>
              </div>
            ))}
            {(activeClass.missions ?? []).length === 0 && <p className="text-sm text-text-muted">Sin misiones todavía.</p>}
          </div>
          <div className="space-y-2">
            <input value={missionTitle} onChange={(e) => setMissionTitle(e.target.value)} placeholder="Título de la misión"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text outline-none focus:border-primary" />
            <textarea rows={2} value={missionDesc} onChange={(e) => setMissionDesc(e.target.value)} placeholder="Descripción (opcional)"
              className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm text-text outline-none focus:border-primary" />
            <button onClick={handleAddMission} className="rounded-lg border border-border px-3 py-2 text-sm font-semibold text-text hover:bg-surface-hover">+ Agregar misión</button>
          </div>
        </div>
        </div>
      )}

      {tab === 'preguntas' && (
        <div className="rounded-2xl border border-border bg-surface p-4">
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-text-muted">Preguntas en vivo ({questions.filter((q) => !q.answered).length} sin responder)</p>
          {questions.length === 0 && <p className="text-sm text-text-muted">Sin preguntas todavía.</p>}
          <div className="space-y-2">
            {questions.map((q) => (
              <div key={q.id} className="rounded-xl bg-surface-hover p-3">
                <p className="text-sm font-semibold text-text">❓ {q.question}</p>
                {q.answered ? (
                  <p className="mt-1 text-sm text-emerald-400">💬 {q.answer}</p>
                ) : (
                  <div className="mt-2 flex gap-2">
                    <input
                      value={answerDrafts[q.id] ?? ''}
                      onChange={(e) => setAnswerDrafts((d) => ({ ...d, [q.id]: e.target.value }))}
                      placeholder="Responder…"
                      className="flex-1 rounded-lg border border-border bg-background px-2 py-1.5 text-xs text-text outline-none focus:border-primary"
                    />
                    <button
                      onClick={() => answerQuestion(q.id, answerDrafts[q.id] ?? '')}
                      className="rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-background"
                    >
                      Enviar
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'preview' && (
        <div>
          <p className="mb-3 rounded-xl border border-dashed border-primary/30 bg-primary/5 px-3 py-2 text-xs text-text-muted">
            👁️ Esto es exactamente lo que ve el alumno en su Hub — incluyendo los botones de "levantar la mano" y preguntas, que aquí también funcionan de verdad.
          </p>
          <HubContent activeClass={activeClass} />
        </div>
      )}
    </div>
  )
}

export default function AdminLiveClassesPage() {
  const [searchParams] = useSearchParams()
  const deepLinkStudentId = searchParams.get('student') ?? ''
  const isAdmin       = useAuthStore((s) => s.isAdmin)
  const session       = useAuthStore((s) => s.session)
  const classes       = useLiveClassStore((s) => s.classes)
  const students      = useAdminUsersStore((s) => s.students)
  const fetchClasses  = useLiveClassStore((s) => s.fetchClasses)
  const fetchStudents = useAdminUsersStore((s) => s.fetchStudents)
  const createClass   = useLiveClassStore((s) => s.createClass)
  const startClass    = useLiveClassStore((s) => s.startClass)
  const deleteClass   = useLiveClassStore((s) => s.deleteClass)
  const closeClass    = useLiveClassStore((s) => s.closeClass)
  const [openId, setOpenId] = useState(null)

  useEffect(() => {
    if (!isAdmin?.()) return
    fetchClasses()
    fetchStudents()
  }, [fetchClasses, fetchStudents, isAdmin])

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

  const handleCreate = (payload) => createClass({ ...payload, created_by: session?.user?.id })

  const handleQuickStart = async (studentId, title) => {
    const { data } = await createClass({
      title,
      description: null,
      student_id: studentId,
      meet_url: makeJitsiUrl(title),
      scheduled_at: new Date().toISOString(),
      created_by: session?.user?.id,
    })
    if (data) {
      await startClass(data.id)
      setOpenId(data.id)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-text">
      <AppTopBar />
      <main className="flex-1 px-4 py-8 md:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 px-6 py-8 shadow-lg">
            <h1 className="text-3xl font-extrabold text-white">🎓 Mis Clases (Admin)</h1>
            <p className="mt-1 text-sm font-medium text-white/85">Programa clases en vivo y controla el Hub mientras enseñas por Jitsi Meet.</p>
          </div>

          <div className="mt-6">
            {openId ? (
              <ControlPanel classId={openId} students={students} onClose={() => { closeClass(); setOpenId(null) }} />
            ) : (
              <>
                <div className="flex flex-wrap items-start gap-2">
                  <CreateForm students={students} onCreate={handleCreate} defaultStudentId={deepLinkStudentId} />
                  <QuickStartForm students={students} onQuickStart={handleQuickStart} />
                </div>
                <div className="space-y-3">
                  {classes.map((c) => {
                    const meta = STATUS_META[c.status] ?? STATUS_META.programada
                    const target = students.find((s) => s.id === c.student_id)
                    return (
                      <div key={c.id} className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-4">
                        <button onClick={() => setOpenId(c.id)} className="min-w-0 flex-1 text-left">
                          <p className="font-bold text-text">{c.title}</p>
                          <p className="text-xs text-text-muted">
                            👤 {target ? (target.display_name || target.email) : 'Todos'}
                            {' · '}{new Date(c.scheduled_at).toLocaleString('es-MX', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                            {canJoinClass(c) && c.status !== 'en_vivo' && ' · 🟢 link ya desbloqueado'}
                          </p>
                        </button>
                        <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-bold ${meta.cls}`}>{meta.label}</span>
                        <button onClick={() => deleteClass(c.id)} className="shrink-0 rounded-lg border border-danger/30 px-2 py-1 text-xs text-danger hover:bg-danger/10">🗑️</button>
                      </div>
                    )
                  })}
                  {classes.length === 0 && <p className="py-8 text-center text-sm text-text-muted">Sin clases programadas todavía.</p>}
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
