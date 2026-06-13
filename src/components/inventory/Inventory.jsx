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
      className="flex cursor-pointer items-start justify-between gap-2 rounded-lg border border-border bg-background p-2 text-sm hover:border-primary"
    >
      <div className="min-w-0">
        {item.type === 'link' && item.url && (
          <p className="truncate text-primary">{item.url}</p>
        )}
        {item.text && <p className="truncate text-text-muted">{item.text}</p>}
        {!item.text && !item.url && <p className="text-text-muted italic">(vacío)</p>}
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation()
          removeItem(item.id)
        }}
        className="shrink-0 text-text-muted hover:text-danger"
        aria-label="Eliminar"
      >
        ✕
      </button>
    </div>
  )

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      <p className="text-xs text-text-muted">
        Guarda aquí tus notas y links de interés. Tu mascota los recuerda y puede ayudarte a
        organizarlos durante el curso.
      </p>

      <form onSubmit={handleAdd} className="flex flex-col gap-2">
        <div className="flex gap-2">
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="rounded-lg border border-border bg-background px-2 py-1.5 text-sm text-text outline-none focus:border-primary"
          >
            <option value="note">Nota</option>
            <option value="link">Link</option>
          </select>
          {moduleId && (
            <select
              value={scope}
              onChange={(e) => setScope(e.target.value)}
              className="rounded-lg border border-border bg-background px-2 py-1.5 text-sm text-text outline-none focus:border-primary"
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
              className="flex-1 rounded-lg border border-border bg-background px-2 py-1.5 text-sm text-text outline-none focus:border-primary"
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
          className="self-start rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-background hover:bg-primary-hover"
        >
          Agregar
        </button>
      </form>

      {moduleId && (
        <div className="flex flex-col gap-2">
          <p className="text-sm font-semibold text-text">Notas de esta clase</p>
          {moduleItems.length === 0 ? (
            <p className="text-sm text-text-muted">Aún no tienes notas para esta clase.</p>
          ) : (
            <div className="flex flex-col gap-2">{moduleItems.map(renderItem)}</div>
          )}
        </div>
      )}

      <div className="flex flex-col gap-2">
        <p className="text-sm font-semibold text-text">{moduleId ? 'Notas generales' : 'Tu inventario'}</p>
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
