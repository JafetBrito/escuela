import { useState } from 'react'
import { useInventoryStore } from '../../stores/useInventoryStore'
import NoteModal from '../inventory/NoteModal'

// Quick-access dropdown for the user's notes/links, available from the
// dashboard header so they don't need to open a course to check them.
export default function NotesPopover() {
  const items = useInventoryStore((s) => s.items)
  const [open, setOpen] = useState(false)
  const [activeItem, setActiveItem] = useState(null)

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium text-text-muted transition-colors hover:text-text"
      >
        <span>📝</span>
        Notas
        {items.length > 0 && (
          <span className="rounded-full bg-primary/10 px-1.5 text-xs text-primary">{items.length}</span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-50 mt-2 w-72 max-h-96 overflow-y-auto rounded-xl border border-border bg-surface p-2 shadow-xl">
            <p className="px-2 py-1 text-xs font-semibold uppercase tracking-wide text-text-muted">
              Tus notas y links
            </p>
            {items.length === 0 ? (
              <p className="px-2 py-3 text-sm text-text-muted">Aún no tienes notas guardadas.</p>
            ) : (
              <div className="flex flex-col gap-1">
                {items.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveItem(item)
                      setOpen(false)
                    }}
                    className="flex flex-col items-start gap-0.5 rounded-lg p-2 text-left text-sm hover:bg-surface-hover"
                  >
                    <span className="text-xs text-text-muted">
                      {item.type === 'link' ? '🔗 Link' : '📝 Nota'}
                      {item.moduleTitle ? ` · ${item.moduleTitle}` : ' · General'}
                    </span>
                    <span className="truncate text-text">
                      {item.url || item.text || '(vacío)'}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {activeItem && <NoteModal item={activeItem} onClose={() => setActiveItem(null)} />}
    </div>
  )
}
