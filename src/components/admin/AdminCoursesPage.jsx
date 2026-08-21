import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import AppTopBar from '../shared/AppTopBar'
import { useCourseContentStore } from '../../stores/useCourseContentStore'
import { useAuthStore } from '../../stores/useAuthStore'

// Mismo criterio que QUESTION_TYPES en AdminExamsPage.jsx — puramente de
// autoría, determina qué campos se muestran para el módulo. 'video' es el
// caso "sin type" de siempre (ver LearningInterface.jsx): guardarlo como
// string explícito no cambia nada, ninguna de las otras ramas del switch lo
// reclama, así que sigue cayendo en el reproductor de video por default.
const MODULE_TYPES = [
  { id: 'video', label: '🎬 Video' },
  { id: 'text', label: '📝 Texto' },
  { id: 'slideshow', label: '🖼️ Diapositivas' },
  { id: 'audio', label: '🎧 Audio' },
  { id: 'embed', label: '🔗 Embed' },
  { id: 'vr', label: '🕶️ Mundo VR' },
]

const emptyModule = (nextId) => ({
  id: nextId,
  order: nextId,
  type: 'text',
  title: '',
  description: '',
  content: '',
  videoId: '',
  images: [],
  audioSrc: '',
  embedHtml: '',
  vrRoute: '',
  vrWorldName: '',
  exercises: [],
  resources: [],
})

// El quiz es independiente del `type` del módulo (ModuleQuiz.jsx lo muestra
// sin importar si es video/texto/etc.) — mismo shape que ya consume
// ModuleQuiz.jsx: { question, options: string[], correctIndex }.
const emptyQuiz = () => ({ question: '', options: ['', ''], correctIndex: 0 })

const emptyCourse = (id) => ({
  id,
  title: '',
  description: '',
  ai_instructions: '',
  icon: '',
  color: '#a78bfa',
  category: '',
  subcategory: '',
  difficulty: '',
  locked: false,
  modules: [],
  translations: {},
})

export default function AdminCoursesPage() {
  const isAdmin = useAuthStore((s) => s.isAdmin)
  const catalog = useCourseContentStore((s) => s.catalog)
  const courses = useCourseContentStore((s) => s.courses)
  const saveCourse = useCourseContentStore((s) => s.saveCourse)

  const [courseId, setCourseId] = useState('')
  const [creatingId, setCreatingId] = useState('')
  const [form, setForm] = useState(null) // metadata sin `modules` — ver `modules` aparte
  const [modules, setModules] = useState([])
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    if (!courseId) { setForm(null); setModules([]); return }
    const course = courses[courseId] ?? emptyCourse(courseId)
    const { modules: courseModules, ...rest } = course
    setForm(rest)
    setModules(courseModules ?? [])
    setMsg('')
  }, [courseId, courses])

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

  const addModule = () => {
    const nextId = Math.max(-1, ...modules.map((m) => m.id)) + 1
    setModules((ms) => [...ms, emptyModule(nextId)])
  }
  const removeModule = (id) => setModules((ms) => ms.filter((m) => m.id !== id))
  const updateModule = (id, patch) => setModules((ms) => ms.map((m) => (m.id === id ? { ...m, ...patch } : m)))
  const updateQuiz = (m, patch) => updateModule(m.id, { quiz: { ...(m.quiz ?? emptyQuiz()), ...patch } })
  const addQuizOption = (m) => updateQuiz(m, { options: [...(m.quiz?.options ?? []), ''] })
  const setQuizOption = (m, i, value) => {
    const options = [...m.quiz.options]
    options[i] = value
    updateQuiz(m, { options })
  }
  const removeQuizOption = (m, i) => {
    const options = m.quiz.options.filter((_, idx) => idx !== i)
    let correctIndex = m.quiz.correctIndex
    if (i === correctIndex) correctIndex = 0
    else if (i < correctIndex) correctIndex -= 1
    updateQuiz(m, { options, correctIndex })
  }
  const moveModule = (index, dir) => setModules((ms) => {
    const target = index + dir
    if (target < 0 || target >= ms.length) return ms
    const next = [...ms]
    ;[next[index], next[target]] = [next[target], next[index]]
    return next
  })

  const handleCreate = () => {
    const id = creatingId.trim()
    if (!id) return
    setCreatingId('')
    setCourseId(id)
  }

  const handleSave = async () => {
    setBusy(true)
    // El orden de exhibición sigue el orden del array en pantalla — mover un
    // módulo arriba/abajo (moveModule) ya reordena el array, así que aquí
    // solo hace falta que `order` quede en sync con la posición final.
    const orderedModules = modules.map((m, i) => ({ ...m, order: i }))
    const { error } = await saveCourse({ ...form, id: courseId, modules: orderedModules })
    setBusy(false)
    setMsg(error ? `❌ ${error.message}` : `✅ Guardado (${orderedModules.length} módulos).`)
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-text">
      <AppTopBar />
      <main className="flex-1 px-4 py-8 md:px-8">
        <div className="mx-auto max-w-3xl">
          <Link to="/admin" className="mb-3 inline-block text-sm text-text-muted hover:text-primary">← Volver al Panel Admin</Link>
          <div className="overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-8 shadow-lg">
            <h1 className="text-3xl font-extrabold text-white">📚 Cursos</h1>
            <p className="mt-1 text-sm font-medium text-white/85">
              Edita un curso y sus módulos — los cambios se ven en /learn/&lt;curso&gt; al instante, sin deploy.
            </p>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-3 rounded-2xl border border-border bg-surface p-4 sm:grid-cols-[1fr_auto]">
            <div>
              <label className="text-[10px] font-bold uppercase text-text-muted">Curso</label>
              <select value={courseId} onChange={(e) => setCourseId(e.target.value)}
                className="mt-0.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text outline-none focus:border-primary">
                <option value="">Elige un curso…</option>
                {catalog.map((c) => <option key={c.id} value={c.id}>{c.icon} {c.title || c.id}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase text-text-muted">Curso nuevo (id)</label>
              <div className="mt-0.5 flex gap-1.5">
                <input value={creatingId} onChange={(e) => setCreatingId(e.target.value)} placeholder="course-049"
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
                  <label className="text-[10px] font-bold uppercase text-text-muted">Dificultad</label>
                  <select value={form.difficulty ?? ''} onChange={(e) => updateForm({ difficulty: e.target.value })}
                    className="mt-0.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text outline-none focus:border-primary">
                    <option value="">—</option>
                    <option value="principiante">Principiante</option>
                    <option value="intermedio">Intermedio</option>
                    <option value="avanzado">Avanzado</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-text-muted">Categoría</label>
                  <input value={form.category ?? ''} onChange={(e) => updateForm({ category: e.target.value })}
                    className="mt-0.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-text-muted">Subcategoría</label>
                  <input value={form.subcategory ?? ''} onChange={(e) => updateForm({ subcategory: e.target.value })}
                    className="mt-0.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text outline-none focus:border-primary" />
                </div>
                <label className="col-span-2 flex items-center gap-2 text-sm text-text sm:col-span-3">
                  <input type="checkbox" checked={Boolean(form.locked)} onChange={(e) => updateForm({ locked: e.target.checked })} />
                  🔒 Bloqueado (aparece como "Próximamente", sin contenido accesible)
                </label>
                <div className="col-span-2 sm:col-span-3">
                  <label className="text-[10px] font-bold uppercase text-text-muted">Instrucciones para la mascota IA (opcional)</label>
                  <textarea rows={3} value={form.ai_instructions ?? ''} onChange={(e) => updateForm({ ai_instructions: e.target.value })}
                    placeholder="Cómo debe responder Oliver cuando el alumno pregunte sobre este curso…"
                    className="mt-0.5 w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm text-text outline-none focus:border-primary" />
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-surface p-4">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-xs font-bold uppercase tracking-wide text-text-muted">Módulos ({modules.length})</p>
                  <button type="button" onClick={addModule} className="rounded-lg bg-primary/20 px-3 py-1.5 text-xs font-bold text-primary">+ Nuevo módulo</button>
                </div>
                <div className="space-y-3">
                  {modules.map((m, i) => (
                    <div key={m.id} className="rounded-xl border border-border/60 p-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-text-muted">{i + 1}.</span>
                        <select value={m.type ?? 'video'} onChange={(e) => updateModule(m.id, { type: e.target.value })}
                          className="rounded-lg border border-border bg-background px-2 py-1 text-xs font-semibold text-text outline-none focus:border-primary">
                          {MODULE_TYPES.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
                        </select>
                        <div className="flex-1" />
                        <button type="button" onClick={() => moveModule(i, -1)} disabled={i === 0}
                          className="text-text-muted hover:text-text disabled:opacity-30">▲</button>
                        <button type="button" onClick={() => moveModule(i, 1)} disabled={i === modules.length - 1}
                          className="text-text-muted hover:text-text disabled:opacity-30">▼</button>
                        <button type="button" onClick={() => removeModule(m.id)} className="shrink-0 text-danger hover:opacity-70">🗑️</button>
                      </div>

                      <div className="mt-2 grid grid-cols-1 gap-1.5 pl-5 sm:grid-cols-2">
                        <input value={m.title ?? ''} onChange={(e) => updateModule(m.id, { title: e.target.value })}
                          placeholder="Título del módulo"
                          className="rounded-lg border border-border bg-background px-2 py-1.5 text-sm text-text outline-none focus:border-primary" />
                        <input value={m.description ?? ''} onChange={(e) => updateModule(m.id, { description: e.target.value })}
                          placeholder="Descripción corta"
                          className="rounded-lg border border-border bg-background px-2 py-1.5 text-sm text-text outline-none focus:border-primary" />
                      </div>

                      <div className="mt-2 pl-5">
                        {m.type === 'text' && (
                          <textarea rows={6} value={m.content ?? ''} onChange={(e) => updateModule(m.id, { content: e.target.value })}
                            placeholder="HTML de la clase — <h2>, <p>, <ul>, <div class='tip'>…"
                            className="w-full resize-y rounded-lg border border-border bg-background px-3 py-2 font-mono text-xs text-text outline-none focus:border-primary" />
                        )}
                        {(!m.type || m.type === 'video') && (
                          <input value={m.videoId ?? ''} onChange={(e) => updateModule(m.id, { videoId: e.target.value })}
                            placeholder="ID de YouTube (ej. dQw4w9WgXcQ)"
                            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text outline-none focus:border-primary" />
                        )}
                        {m.type === 'slideshow' && (
                          <textarea rows={3} value={(m.images ?? []).join('\n')}
                            onChange={(e) => updateModule(m.id, { images: e.target.value.split('\n').filter(Boolean) })}
                            placeholder="Una URL de imagen por línea"
                            className="w-full resize-y rounded-lg border border-border bg-background px-3 py-2 text-xs text-text outline-none focus:border-primary" />
                        )}
                        {m.type === 'audio' && (
                          <input value={m.audioSrc ?? ''} onChange={(e) => updateModule(m.id, { audioSrc: e.target.value })}
                            placeholder="Ruta o URL del audio"
                            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text outline-none focus:border-primary" />
                        )}
                        {m.type === 'embed' && (
                          <textarea rows={4} value={m.embedHtml ?? ''} onChange={(e) => updateModule(m.id, { embedHtml: e.target.value })}
                            placeholder="HTML del embed (iframe, etc.)"
                            className="w-full resize-y rounded-lg border border-border bg-background px-3 py-2 font-mono text-xs text-text outline-none focus:border-primary" />
                        )}
                        {m.type === 'vr' && (
                          <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                            <input value={m.vrRoute ?? ''} onChange={(e) => updateModule(m.id, { vrRoute: e.target.value })}
                              placeholder="Ruta VR (ej. /vr)"
                              className="rounded-lg border border-border bg-background px-2 py-1.5 text-sm text-text outline-none focus:border-primary" />
                            <input value={m.vrWorldName ?? ''} onChange={(e) => updateModule(m.id, { vrWorldName: e.target.value })}
                              placeholder="Nombre del mundo (opcional)"
                              className="rounded-lg border border-border bg-background px-2 py-1.5 text-sm text-text outline-none focus:border-primary" />
                          </div>
                        )}
                      </div>

                      {/* Quiz — independiente del `type` de arriba, mismo criterio que
                          ModuleQuiz.jsx (lo muestra sin importar si el módulo es video/
                          texto/etc.). */}
                      <div className="mt-2.5 rounded-lg border border-border/60 bg-background/40 p-2.5 pl-5">
                        <label className="flex items-center gap-2 text-xs font-bold text-text-muted">
                          <input
                            type="checkbox"
                            checked={Boolean(m.quiz)}
                            onChange={(e) => updateModule(m.id, { quiz: e.target.checked ? emptyQuiz() : undefined })}
                          />
                          🧩 Quiz de esta clase
                        </label>

                        {m.quiz && (
                          <div className="mt-2 space-y-1.5">
                            <input
                              value={m.quiz.question ?? ''}
                              onChange={(e) => updateQuiz(m, { question: e.target.value })}
                              placeholder="Pregunta"
                              className="w-full rounded-lg border border-border bg-background px-2 py-1.5 text-sm text-text outline-none focus:border-primary"
                            />
                            <p className="text-[10px] text-text-muted">Marca la opción correcta:</p>
                            {(m.quiz.options ?? []).map((opt, i) => (
                              <div key={i} className="flex items-center gap-1.5">
                                <input
                                  type="radio"
                                  name={`correct-${m.id}`}
                                  checked={m.quiz.correctIndex === i}
                                  onChange={() => updateQuiz(m, { correctIndex: i })}
                                  className="shrink-0 accent-primary"
                                />
                                <input
                                  value={opt}
                                  onChange={(e) => setQuizOption(m, i, e.target.value)}
                                  placeholder={`Opción ${i + 1}`}
                                  className="flex-1 rounded-lg border border-border bg-background px-2 py-1 text-sm text-text outline-none focus:border-primary"
                                />
                                {m.quiz.options.length > 2 && (
                                  <button type="button" onClick={() => removeQuizOption(m, i)}
                                    className="shrink-0 text-text-muted hover:text-danger">✕</button>
                                )}
                              </div>
                            ))}
                            {(m.quiz.options ?? []).length < 5 && (
                              <button type="button" onClick={() => addQuizOption(m)}
                                className="text-xs font-semibold text-primary hover:underline">+ Agregar opción</button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {modules.length === 0 && <p className="text-sm text-text-muted">Sin módulos todavía.</p>}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button type="button" onClick={handleSave} disabled={busy}
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-background disabled:opacity-50">
                  {busy ? 'Guardando…' : '💾 Guardar curso'}
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
