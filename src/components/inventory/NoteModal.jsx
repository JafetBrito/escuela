import { useState } from 'react'
import { useInventoryStore } from '../../stores/useInventoryStore'

// Popup for viewing/editing a single inventory item (note or link).
export default function NoteModal({ item, onClose }) {
  const updateItem = useInventoryStore((s) => s.updateItem)
  const removeItem = useInventoryStore((s) => s.removeItem)

  const [text, setText] = useState(item.text ?? '')
  const [url, setUrl] = useState(item.url ?? '')

  const handleSave = () => {
    updateItem(item.id, { text: text.trim(), ...(item.type === 'link' ? { url: url.trim() } : {}) })
    onClose()
  }

  const handleDelete = () => {
    removeItem(item.id)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="tech-panel flex w-full max-w-lg flex-col overflow-hidden">
        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <p className="tech-label text-sm">
            {item.type === 'link' ? '🔗 Link' : '📝 Nota'}
            {item.moduleTitle ? ` — ${item.moduleTitle}` : ' — General'}
          </p>
          <button onClick={onClose} className="text-text-muted hover:text-text" aria-label="Cerrar">
            ✕
          </button>
        </div>

        <div className="flex flex-col gap-3 p-5">
          {item.type === 'link' && (
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://…"
              className="tech-input rounded-lg border border-border bg-background px-3 py-2 text-sm text-text outline-none focus:border-primary"
            />
          )}
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Escribe tu nota…"
            className="h-40 resize-none rounded-lg border border-border bg-background p-3 text-sm text-text outline-none focus:border-primary"
          />
        </div>

        <div className="flex items-center justify-between border-t border-border px-5 py-3">
          <button onClick={handleDelete} className="text-sm text-text-muted hover:text-danger">
            Eliminar
          </button>
          <div className="flex gap-2">
            <button onClick={onClose} className="rounded-lg border border-border px-3 py-1.5 text-sm text-text">
              Cancelar
            </button>
            <button onClick={handleSave} className="rounded-lg bg-primary px-3 py-1.5 text-sm font-semibold text-background hover:bg-primary-hover">
              Guardar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
