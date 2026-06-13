import { useState } from 'react'
import MascotViewport from './MascotViewport'
import ChatPanel from '../chat/ChatPanel'
import ItemsPanel from './ItemsPanel'
import MissionsPanel from './MissionsPanel'
import NotesPanel from './NotesPanel'
import GalleryPanel from './GalleryPanel'
import { useMascotStore } from '../../stores/useMascotStore'
import { getMascotById } from '../../data/mascotRegistry'

const MENU = [
  { id: 'chat', label: 'Chat', icon: '💬' },
  { id: 'missions', label: 'Misiones', icon: '🎯' },
  { id: 'items', label: 'Objetos', icon: '🎒' },
  { id: 'notes', label: 'Notas', icon: '📝' },
  { id: 'gallery', label: 'Galería', icon: '🖼️' },
]

// Floating "Clippy"-style companion: a small mascot bubble anchored to the
// corner, with a large popover menu (Chat / Misiones / Objetos / Notas / Galería).
export default function MascotCompanion({ courseId, module }) {
  const [open, setOpen] = useState(false)
  const [panel, setPanel] = useState('chat')
  const selectedMascotId = useMascotStore((s) => s.selectedMascotId)
  const mascot = getMascotById(selectedMascotId)

  return (
    <div className="fixed bottom-4 right-4 z-40 flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
      {open && (
        <div className="flex h-[80vh] w-[95vw] max-w-2xl flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <p className="text-base font-bold text-text">{mascot.name}</p>
            <button
              onClick={() => setOpen(false)}
              className="text-text-muted hover:text-text"
              aria-label="Cerrar"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-5 border-b border-border text-sm">
            {MENU.map((item) => (
              <button
                key={item.id}
                onClick={() => setPanel(item.id)}
                className={`flex flex-col items-center gap-1 px-2 py-3 font-medium transition-colors ${
                  panel === item.id
                    ? 'border-b-2 border-primary text-primary'
                    : 'text-text-muted hover:text-text'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {panel === 'chat' && (
              <ChatPanel courseId={courseId} module={module} className="h-full border-0" />
            )}
            {panel === 'missions' && module && (
              <MissionsPanel courseId={courseId} module={module} />
            )}
            {panel === 'items' && <ItemsPanel />}
            {panel === 'notes' && <NotesPanel courseId={courseId} module={module} />}
            {panel === 'gallery' && <GalleryPanel />}
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen((o) => !o)}
        className="h-20 w-20 overflow-hidden rounded-full border-2 border-primary bg-surface shadow-lg transition-transform hover:scale-105 sm:h-24 sm:w-24"
        aria-label="Abrir mascota"
      >
        <MascotViewport className="h-full w-full" />
      </button>
    </div>
  )
}
