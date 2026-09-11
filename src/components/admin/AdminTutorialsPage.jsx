import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import AppTopBar from '../shared/AppTopBar'
import { useTutorialContentStore } from '../../stores/useTutorialContentStore'
import { useAuthStore } from '../../stores/useAuthStore'

const emptyTutorial = (id) => ({
  id,
  title: '',
  description: '',
  icon: '',
  color: '#7c3aed',
  category: '',
  locked: false,
  content: '',
  resources: [],
})

// Editor de tutoriales — calco de AdminCoursesPage.jsx pero sin el bloque de
// módulos/quiz (un tutorial es una sola vista, ver migration_063.sql): el
// contenido es un único textarea de HTML, mismo control que ya usa un
// módulo type:'text' en AdminCoursesPage.
export default function AdminTutorialsPage() {
  const isAdmin = useAuthStore((s) => s.isAdmin)
  const catalog = useTutorialContentStore((s) => s.catalog)
  const tutorials = useTutorialContentStore((s) => s.tutorials)
  const loaded = useTutorialContentStore((s) => s.loaded)
  const fetchAll = useTutorialContentStore((s) => s.fetchAll)
  const saveTutorial = useTutorialContentStore((s) => s.saveTutorial)

  const [tutorialId, setTutorialId] = useState('')
  const [creatingId, setCreatingId] = useState('')
  const [form, setForm] = useState(null)
  const [resourcesText, setResourcesText] = useState('')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => { fetchAll() }, [fetchAll])

  // Sin useEffect reactivo a `tutorialId` — el select y "+ Crear" son los
  // únicos que cambian el tutorial activo, así que sincronizan `form`
  // directo en su propio handler (evita el patrón "setState en efecto").
  const selectTutorial = (id) => {
    setTutorialId(id)
    if (!id) { setForm(null); setResourcesText(''); return }
    const tutorial = tutorials[id] ?? emptyTutorial(id)
    setForm(tutorial)
    setResourcesText((tutorial.resources ?? []).map((r) => `${r.label || ''}|${r.url || ''}`).join('\n'))
    setMsg('')
  }

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

  const updateForm = (patch) => setForm((f) => ({ ...f, ...patch }))

  const handleCreate = () => {
    const id = creatingId.trim()
    if (!id) return
    setCreatingId('')
    selectTutorial(id)
  }

  const handleSave = async () => {
    setBusy(true)
    const resources = resourcesText
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const [label, url] = line.split('|')
        return { label: (label || '').trim(), url: (url ?? label ?? '').trim() }
      })
    const { error } = await saveTutorial({ ...form, id: tutorialId, resources })
    setBusy(false)
    setMsg(error ? `❌ ${error.message}` : '✅ Guardado.')
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-text">
      <AppTopBar />
      <main className="flex-1 px-4 py-8 md:px-8">
        <div className="mx-auto max-w-3xl">
          <Link to="/admin" className="mb-3 inline-block text-sm text-text-muted hover:text-primary">← Volver al Panel Admin</Link>
          <div className="overflow-hidden rounded-2xl bg-gradient-to-r from-violet-700 to-indigo-800 px-6 py-8 shadow-lg">
            <h1 className="text-3xl font-extrabold text-white">🧭 Tutoriales</h1>
            <p className="mt-1 text-sm font-medium text-white/85">
              Edita un tutorial — se ve en /tutorial/&lt;id&gt; al instante, sin deploy.
            </p>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-3 rounded-2xl border border-border bg-surface p-4 sm:grid-cols-[1fr_auto]">
            <div>
              <label className="text-[10px] font-bold uppercase text-text-muted">Tutorial</label>
              <select value={tutorialId} onChange={(e) => selectTutorial(e.target.value)} disabled={!loaded}
                className="mt-0.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text outline-none focus:border-primary">
                <option value="">Elige un tutorial…</option>
                {catalog.map((t) => <option key={t.id} value={t.id}>{t.icon} {t.title || t.id}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase text-text-muted">Tutorial nuevo (id)</label>
              <div className="mt-0.5 flex gap-1.5">
                <input value={creatingId} onChange={(e) => setCreatingId(e.target.value)} placeholder="tutorial-001"
                  className="w-32 rounded-lg border border-border bg-background px-3 py-2 text-sm text-text outline-none focus:border-primary" />
                <button type="button" onClick={handleCreate} disabled={!creatingId.trim()}
                  className="rounded-lg bg-primary/20 px-3 py-2 text-xs font-bold text-primary disabled:opacity-40">+ Crear</button>
              </div>
            </div>
          </div>

          {form && (
            <div className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-3 rounded-2xl border border-border bg-surface p-4 sm:grid-cols-3">
                <div className="col-span-2 sm:col-span-3">
                  <label className="text-[10px] font-bold uppercase text-text-muted">Título</label>
                  <input value={form.title ?? ''} onChange={(e) => updateForm({ title: e.target.value })}
                    className="mt-0.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text outline-none focus:border-primary" />
                </div>
                <div className="col-span-2 sm:col-span-3">
                  <label className="text-[10px] font-bold uppercase text-text-muted">Descripción</label>
                  <textarea rows={2} value={form.description ?? ''} onChange={(e) => updateForm({ description: e.target.value })}
                    className="mt-0.5 w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm text-text outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-text-muted">Icono (emoji)</label>
                  <input value={form.icon ?? ''} onChange={(e) => updateForm({ icon: e.target.value })}
                    className="mt-0.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-text-muted">Color</label>
                  <input value={form.color ?? ''} onChange={(e) => updateForm({ color: e.target.value })}
                    className="mt-0.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-text-muted">Categoría</label>
                  <input value={form.category ?? ''} onChange={(e) => updateForm({ category: e.target.value })}
                    className="mt-0.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text outline-none focus:border-primary" />
                </div>
                <label className="col-span-2 flex items-center gap-2 text-sm text-text sm:col-span-3">
                  <input type="checkbox" checked={Boolean(form.locked)} onChange={(e) => updateForm({ locked: e.target.checked })} />
                  🔒 Bloqueado (aparece como "Próximamente", sin contenido accesible)
                </label>
              </div>

              <div className="rounded-2xl border border-border bg-surface p-4">
                <label className="text-[10px] font-bold uppercase text-text-muted">Contenido (HTML)</label>
                <textarea rows={16} value={form.content ?? ''} onChange={(e) => updateForm({ content: e.target.value })}
                  placeholder="HTML del tutorial — <h2>, <p>, <ul>, <div class='tip'>…"
                  className="mt-0.5 w-full resize-y rounded-lg border border-border bg-background px-3 py-2 font-mono text-xs text-text outline-none focus:border-primary" />
              </div>

              <div className="rounded-2xl border border-border bg-surface p-4">
                <label className="text-[10px] font-bold uppercase text-text-muted">Recursos (opcional — un enlace por línea, "etiqueta|url")</label>
                <textarea rows={3} value={resourcesText} onChange={(e) => setResourcesText(e.target.value)}
                  placeholder={'Documentación oficial|https://…'}
                  className="mt-0.5 w-full resize-y rounded-lg border border-border bg-background px-3 py-2 text-xs text-text outline-none focus:border-primary" />
              </div>

              <div className="flex items-center gap-3">
                <button type="button" onClick={handleSave} disabled={busy}
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-background disabled:opacity-50">
                  {busy ? 'Guardando…' : '💾 Guardar tutorial'}
                </button>
                {msg && <p className="text-xs text-text-muted">{msg}</p>}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
