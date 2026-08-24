import { useRef, useState } from 'react'
import { useTasksStore } from '../../stores/useTasksStore'
import { renderMarkdown } from '../../utils/markdown'

// Editor "redactar tarea" — alternativa a subir un .md ya hecho: escribes el
// título y el cuerpo aquí mismo, insertas imágenes/links con un par de
// clics, y al enviar se arma un .md real (mismo formato que el upload
// manual) y se sube por el mismo submitTaskFile de siempre — no hay un
// camino de entrega paralelo, solo una forma distinta de producir el
// archivo. Dos paneles lado a lado en escritorio (editor + vista previa en
// vivo); en móvil se apilan uno debajo del otro.
export default function TaskComposeModal({ task, studentId, onClose, onSubmit }) {
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [busy, setBusy] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [error, setError] = useState('')
  const textareaRef = useRef(null)
  const imageInputRef = useRef(null)

  const insertAtCursor = (before, after = '') => {
    const el = textareaRef.current
    if (!el) return
    const start = el.selectionStart
    const end = el.selectionEnd
    const selected = body.slice(start, end)
    const next = body.slice(0, start) + before + selected + after + body.slice(end)
    setBody(next)
    // Vuelve a poner el cursor justo después de lo insertado, en el próximo
    // tick (después de que React actualice el value del textarea).
    requestAnimationFrame(() => {
      el.focus()
      const cursor = start + before.length + selected.length + after.length
      el.setSelectionRange(cursor, cursor)
    })
  }

  const handleInsertLink = () => {
    const url = window.prompt('Enlace (URL):')
    if (!url) return
    const label = window.prompt('Texto del enlace (opcional):', url) || url
    insertAtCursor(`[${label}](${url})`)
  }

  const handleInsertImageFile = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setUploadingImage(true)
    setError('')
    const { url, error: upErr } = await useTasksStore.getState().uploadTaskImage(task.id, studentId, file)
    setUploadingImage(false)
    if (upErr) { setError(`❌ No se pudo subir la imagen: ${upErr.message}`); return }
    insertAtCursor(`\n![${file.name}](${url})\n`)
  }

  const handleSubmit = async () => {
    if (!body.trim()) { setError('Escribe algo antes de enviar.'); return }
    setBusy(true)
    setError('')
    const markdown = `# ${title.trim() || task.title}\n\n${body}`
    const file = new File([markdown], 'entrega.md', { type: 'text/markdown' })
    const { error: subErr } = await onSubmit(file)
    setBusy(false)
    if (subErr) { setError(`❌ ${subErr.message}`); return }
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/70 p-4">
      <div className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl">
        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-text-muted">✍️ Redactar tarea</p>
            <p className="truncate text-sm text-text-muted">{task.title}</p>
          </div>
          <button type="button" onClick={onClose} className="text-text-muted hover:text-text">✕</button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={`Título (opcional — por defecto usa "${task.title}")`}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-bold text-text outline-none focus:border-primary"
          />

          {/* Barra de herramientas — atajos de markdown en vez de un editor
              WYSIWYG completo: reutiliza el mismo renderMarkdown que ya usa
              el resto de la app (vista previa de entregas, lecciones,
              recursos), sin depender de una librería de edición nueva. */}
          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            <button type="button" onClick={() => insertAtCursor('**', '**')} title="Negrita" className="rounded-lg border border-border px-2.5 py-1.5 text-sm font-bold text-text hover:border-primary/50">B</button>
            <button type="button" onClick={() => insertAtCursor('*', '*')} title="Cursiva" className="rounded-lg border border-border px-2.5 py-1.5 text-sm italic text-text hover:border-primary/50">I</button>
            <button type="button" onClick={() => insertAtCursor('## ')} title="Encabezado" className="rounded-lg border border-border px-2.5 py-1.5 text-xs font-bold text-text hover:border-primary/50">H2</button>
            <button type="button" onClick={() => insertAtCursor('- ')} title="Lista" className="rounded-lg border border-border px-2.5 py-1.5 text-sm text-text hover:border-primary/50">• Lista</button>
            <span className="mx-1 h-5 w-px bg-border" />
            <button type="button" onClick={handleInsertLink} className="rounded-lg border border-border px-2.5 py-1.5 text-xs font-semibold text-primary hover:border-primary/50">🔗 Enlace</button>
            <button
              type="button"
              onClick={() => imageInputRef.current?.click()}
              disabled={uploadingImage}
              className="rounded-lg border border-border px-2.5 py-1.5 text-xs font-semibold text-primary hover:border-primary/50 disabled:opacity-50"
            >
              {uploadingImage ? 'Subiendo…' : '🖼️ Imagen'}
            </button>
            <input ref={imageInputRef} type="file" accept="image/*" onChange={handleInsertImageFile} className="hidden" />
          </div>

          {/* Editor + vista previa: lado a lado en escritorio, apilados en
              móvil — antes no existía este editor, así que no había nada que
              comparar, pero un textarea angosto de una sola columna en una
              pantalla ancha se ve igual de pobre que le pasaba al resto de
              la página en desktop. */}
          <div className="mt-3 grid gap-3 lg:grid-cols-2">
            <textarea
              ref={textareaRef}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Escribe tu entrega aquí — puedes usar Markdown, o simplemente escribir párrafos normales."
              rows={14}
              className="w-full resize-none rounded-xl border border-border bg-background px-4 py-3 font-mono text-sm text-text outline-none focus:border-primary"
            />
            <div className="min-h-[280px] overflow-y-auto rounded-xl border border-border bg-background px-4 py-3">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-wide text-text-muted/70">Vista previa</p>
              {body.trim() ? (
                <div
                  className="text-sm text-text
                    [&_h1]:text-lg [&_h1]:font-bold [&_h2]:text-base [&_h2]:font-bold [&_h1]:mb-2 [&_h2]:mb-2
                    [&_p]:mb-2 [&_ul]:mb-2 [&_ul]:ml-5 [&_ul]:list-disc [&_ol]:mb-2 [&_ol]:ml-5 [&_ol]:list-decimal
                    [&_img]:my-2 [&_img]:max-w-full [&_img]:rounded-lg [&_a]:text-primary [&_a]:underline"
                  dangerouslySetInnerHTML={{ __html: renderMarkdown(`# ${title.trim() || task.title}\n\n${body}`) }}
                />
              ) : (
                <p className="text-xs text-text-muted">Aquí verás cómo se ve tu entrega mientras escribes.</p>
              )}
            </div>
          </div>

          {error && <p className="mt-2 text-xs text-danger">{error}</p>}
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-border px-5 py-3">
          <button type="button" onClick={onClose} className="rounded-lg border border-border px-4 py-2 text-sm text-text-muted hover:text-text">
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={busy || !body.trim()}
            className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-bold text-white hover:opacity-90 disabled:opacity-50"
          >
            {busy ? 'Enviando…' : '📤 Enviar entrega'}
          </button>
        </div>
      </div>
    </div>
  )
}
