import { useEffect, useState } from 'react'
import AppTopBar from '../shared/AppTopBar'
import MascotCompanion from '../mascot/MascotCompanion'
import { useAnnouncementsStore } from '../../stores/useAnnouncementsStore'
import { useAuthStore } from '../../stores/useAuthStore'

const CATEGORY_META = {
  general:       { label: 'General',       color: 'from-blue-600 to-blue-400',    icon: '📢' },
  actividad:     { label: 'Actividad',     color: 'from-purple-600 to-violet-400', icon: '🎭' },
  recordatorio:  { label: 'Recordatorio', color: 'from-amber-600 to-amber-400',   icon: '🔔' },
  evento:        { label: 'Evento',        color: 'from-rose-600 to-pink-400',     icon: '📅' },
}

const ICONS = ['📢', '📌', '🎉', '🔔', '📅', '🏆', '🧪', '🎭', '📚', '⚠️', '✨', '🌟']

function AdminCreatePanel({ onDone }) {
  const create = useAnnouncementsStore((s) => s.create)
  const session = useAuthStore((s) => s.session)
  const [form, setForm] = useState({ title: '', body: '', icon: '📢', category: 'general', pinned: false })
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title.trim()) return
    setBusy(true)
    const { error } = await create({ ...form, created_by: session?.user?.id })
    setBusy(false)
    if (error) { setMsg(`❌ ${error.message}`); return }
    setMsg('✅ Publicado.')
    setForm({ title: '', body: '', icon: '📢', category: 'general', pinned: false })
    onDone()
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-primary/30 bg-surface p-4 space-y-3">
      <h3 className="font-bold text-text">Nuevo anuncio</h3>

      <div className="flex gap-2">
        <div className="flex-1">
          <label className="text-[10px] font-bold uppercase text-text-muted">Título *</label>
          <input
            required
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            className="mt-0.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text outline-none focus:border-primary"
            placeholder="Título del anuncio"
          />
        </div>
        <div>
          <label className="text-[10px] font-bold uppercase text-text-muted">Ícono</label>
          <select
            value={form.icon}
            onChange={(e) => setForm((f) => ({ ...f, icon: e.target.value }))}
            className="mt-0.5 rounded-lg border border-border bg-background px-2 py-2 text-lg outline-none focus:border-primary"
          >
            {ICONS.map((i) => <option key={i} value={i}>{i}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className="text-[10px] font-bold uppercase text-text-muted">Mensaje</label>
        <textarea
          rows={3}
          value={form.body}
          onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
          className="mt-0.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text outline-none focus:border-primary resize-none"
          placeholder="Descripción del anuncio…"
        />
      </div>

      <div className="flex gap-3">
        <div className="flex-1">
          <label className="text-[10px] font-bold uppercase text-text-muted">Categoría</label>
          <select
            value={form.category}
            onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
            className="mt-0.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text outline-none focus:border-primary"
          >
            {Object.entries(CATEGORY_META).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
        </div>
        <div className="flex items-end pb-0.5">
          <label className="flex items-center gap-1.5 cursor-pointer text-sm text-text-muted">
            <input
              type="checkbox"
              checked={form.pinned}
              onChange={(e) => setForm((f) => ({ ...f, pinned: e.target.checked }))}
              className="accent-primary"
            />
            📌 Fijar
          </label>
        </div>
      </div>

      <div className="flex gap-2 pt-1">
        <button type="button" onClick={onDone} className="flex-1 rounded-lg border border-border px-3 py-2 text-sm text-text-muted hover:text-text">
          Cancelar
        </button>
        <button type="submit" disabled={busy} className="flex-1 rounded-lg bg-primary px-3 py-2 text-sm font-bold text-background disabled:opacity-50">
          {busy ? 'Publicando…' : '📤 Publicar'}
        </button>
      </div>
      {msg && <p className="text-xs text-text-muted">{msg}</p>}
    </form>
  )
}

function AnnouncementCard({ a, isAdmin, onDelete, onTogglePin }) {
  const cat = CATEGORY_META[a.category] ?? CATEGORY_META.general
  const date = new Date(a.created_at).toLocaleDateString('es-MX', { day:'numeric', month:'short', year:'numeric' })

  return (
    <div className={`relative overflow-hidden rounded-2xl border bg-surface p-4 ${a.pinned ? 'border-primary/40' : 'border-border'}`}>
      {a.pinned && (
        <span className="absolute right-3 top-3 text-xs text-primary/60">📌</span>
      )}
      <div className="flex items-start gap-3">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${cat.color} text-xl`}>
          {a.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] font-bold uppercase text-text-muted/60">{cat.label}</span>
            <span className="text-[10px] text-text-muted/40">•</span>
            <span className="text-[10px] text-text-muted/40">{date}</span>
          </div>
          <h3 className="mt-0.5 font-bold text-text">{a.title}</h3>
          {a.body && <p className="mt-1 text-sm text-text-muted">{a.body}</p>}
        </div>
      </div>
      {isAdmin && (
        <div className="mt-3 flex justify-end gap-2">
          <button
            type="button"
            onClick={() => onTogglePin(a.id, !a.pinned)}
            className="rounded-lg border border-border px-2 py-1 text-xs text-text-muted hover:text-text"
          >
            {a.pinned ? '📌 Desfijar' : '📌 Fijar'}
          </button>
          <button
            type="button"
            onClick={() => onDelete(a.id)}
            className="rounded-lg border border-danger/30 px-2 py-1 text-xs text-danger hover:bg-danger/10"
          >
            🗑️ Eliminar
          </button>
        </div>
      )}
    </div>
  )
}

export default function AnnouncementsPage() {
  const announcements = useAnnouncementsStore((s) => s.announcements)
  const loading = useAnnouncementsStore((s) => s.loading)
  const fetch = useAnnouncementsStore((s) => s.fetch)
  const deleteAnn = useAnnouncementsStore((s) => s.delete)
  const togglePin = useAnnouncementsStore((s) => s.togglePin)
  const isAdmin = useAuthStore((s) => s.isAdmin)

  const [creating, setCreating] = useState(false)
  const [filter, setFilter] = useState('all')

  useEffect(() => { fetch() }, [fetch])

  const filtered = filter === 'all' ? announcements : announcements.filter((a) => a.category === filter)

  return (
    <div className="flex min-h-screen flex-col bg-background text-text">
      <AppTopBar />

      <main className="flex-1 px-4 py-8 md:px-8">
        <div className="mx-auto max-w-3xl">

          {/* Header */}
          <div className="overflow-hidden rounded-2xl bg-gradient-to-r from-sky-600 to-blue-500 px-6 py-8 shadow-lg">
            <h1 className="text-3xl font-extrabold text-white drop-shadow-sm">📋 Tablón de Anuncios</h1>
            <p className="mt-1 text-sm font-medium text-white/85">
              Noticias, actividades y recordatorios importantes de Oliver Academy.
            </p>
          </div>

          {/* Admin create */}
          {isAdmin?.() && (
            <div className="mt-6">
              {creating ? (
                <AdminCreatePanel onDone={() => setCreating(false)} />
              ) : (
                <button
                  type="button"
                  onClick={() => setCreating(true)}
                  className="w-full rounded-2xl border border-dashed border-primary/40 px-4 py-3 text-sm font-semibold text-primary hover:bg-primary/5 transition"
                >
                  + Publicar nuevo anuncio
                </button>
              )}
            </div>
          )}

          {/* Category filter */}
          <div className="mt-6 flex flex-wrap gap-1.5">
            {[['all', 'Todos'], ...Object.entries(CATEGORY_META).map(([k, v]) => [k, v.label])].map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setFilter(key)}
                className={`rounded-lg px-3 py-1 text-xs font-bold transition ${filter === key ? 'bg-primary text-background' : 'bg-surface text-text-muted hover:bg-surface-hover border border-border'}`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* List */}
          <div className="mt-4 space-y-3">
            {loading ? (
              <p className="py-12 text-center text-sm text-text-muted">Cargando anuncios…</p>
            ) : filtered.length === 0 ? (
              <div className="rounded-2xl border border-border bg-surface py-12 text-center">
                <p className="text-3xl">📭</p>
                <p className="mt-2 text-sm text-text-muted">No hay anuncios en esta categoría.</p>
              </div>
            ) : (
              filtered.map((a) => (
                <AnnouncementCard
                  key={a.id}
                  a={a}
                  isAdmin={isAdmin?.()}
                  onDelete={deleteAnn}
                  onTogglePin={togglePin}
                />
              ))
            )}
          </div>
        </div>
      </main>

      <MascotCompanion />
    </div>
  )
}
