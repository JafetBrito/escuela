import { useState } from 'react'
import { useInventoryStore } from '../../stores/useInventoryStore'
import NoteModal from './NoteModal'

export default function Inventory({ className = '', moduleId, moduleTitle }) {
  const items = useInventoryStore((s) => s.items)
  const addItem = useInventoryStore((s) => s.addItem)
  const removeItem = useInventoryStore((s) => s.removeItem)

  const [type, setType] = useState('note')
  const [scope, setScope] = useState(moduleId ? 'module' : 'general')
  const [text, setText] = useState('')
  const [url, setUrl] = useState('')
  const [activeItem, setActiveItem] = useState(null)

  const handleAdd = (e) => {
    e.preventDefault()
    if (type === 'note' && !text.trim()) return
    if (type === 'link' && !url.trim()) return

    addItem({
      type,
      text: text.trim(),
      ...(type === 'link' ? { url: url.trim() } : {}),
      ...(scope === 'module' && moduleId ? { moduleId, moduleTitle } : {}),
    })
    setText('')
    setUrl('')
  }

  const moduleItems = moduleId ? items.filter((i) => i.moduleId === moduleId) : []
  const generalItems = items.filter((i) => !i.moduleId)

  const renderItem = (item) => (
    <div
      key={item.id}
      onClick={() => setActiveItem(item)}
      className="tech-card flex cursor-pointer items-start justify-between gap-2 p-3 text-sm"
    >
      <div className="flex min-w-0 items-start gap-2">
        <span className="mt-0.5 text-base">{item.type === 'link' ? '🔗' : '📝'}</span>
        <div className="min-w-0">
          {item.type === 'link' && item.url && (
            <p className="truncate text-primary">{item.url}</p>
          )}
          {item.text && <p className="truncate text-text">{item.text}</p>}
          {!item.text && !item.url && <p className="text-text-muted italic">(vacío)</p>}
        </div>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation()
          removeItem(item.id)
        }}
        className="shrink-0 text-text-muted transition-colors hover:text-danger"
        aria-label="Eliminar"
      >
        ✕
      </button>
    </div>
  )

  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      <div className="tech-card p-4">
        <p className="tech-label mb-3">// Nueva entrada</p>
        <form onSubmit={handleAdd} className="flex flex-col gap-2">
          <div className="flex flex-wrap gap-2">
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="tech-input rounded-lg border border-border bg-background px-2 py-1.5 text-sm text-text outline-none focus:border-primary"
            >
              <option value="note">📝 Nota</option>
              <option value="link">🔗 Link</option>
            </select>
            {moduleId && (
              <select
                value={scope}
                onChange={(e) => setScope(e.target.value)}
                className="tech-input rounded-lg border border-border bg-background px-2 py-1.5 text-sm text-text outline-none focus:border-primary"
              >
                <option value="module">Esta clase</option>
                <option value="general">General</option>
              </select>
            )}
            {type === 'link' && (
              <input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://…"
                className="tech-input flex-1 rounded-lg border border-border bg-background px-2 py-1.5 text-sm text-text outline-none focus:border-primary"
              />
            )}
          </div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={type === 'note' ? 'Escribe tu nota…' : 'Descripción del link (opcional)'}
            className="h-20 resize-none rounded-lg border border-border bg-background p-2 text-sm text-text outline-none focus:border-primary"
          />
          <button
            type="submit"
            className="self-start rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-background transition-colors hover:bg-primary-hover"
          >
            + Agregar
          </button>
        </form>
      </div>

      {moduleId && (
        <div className="flex flex-col gap-2">
          <p className="tech-label">// Notas de esta clase</p>
          {moduleItems.length === 0 ? (
            <p className="text-sm text-text-muted">Aún no tienes notas para esta clase.</p>
          ) : (
            <div className="flex flex-col gap-2">{moduleItems.map(renderItem)}</div>
          )}
        </div>
      )}

      <div className="flex flex-col gap-2">
        <p className="tech-label">{moduleId ? '// Notas generales' : '// Tu inventario'}</p>
        {generalItems.length === 0 ? (
          <p className="text-sm text-text-muted">No hay notas generales por ahora.</p>
        ) : (
          <div className="flex flex-col gap-2">{generalItems.map(renderItem)}</div>
        )}
      </div>

      {activeItem && <NoteModal item={activeItem} onClose={() => setActiveItem(null)} />}
    </div>
  )
}
