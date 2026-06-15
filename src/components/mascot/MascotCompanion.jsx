import MascotViewport from './MascotViewport'
import ChatTab from './ChatTab'
import ItemsPanel from './ItemsPanel'
import MissionsPanel from './MissionsPanel'
import NotesPanel from './NotesPanel'
import GalleryPanel from './GalleryPanel'
import BooksPanel from './BooksPanel'
import AppearancePanel from './AppearancePanel'
import LevelBadge from '../shared/LevelBadge'
import CurrencyBadge from '../shared/CurrencyBadge'
import { useMascotStore } from '../../stores/useMascotStore'
import { useMascotCompanionStore } from '../../stores/useMascotCompanionStore'
import { useSettingsStore } from '../../stores/useSettingsStore'
import { useCurrencyStore } from '../../stores/useCurrencyStore'
import { useShopStore } from '../../stores/useShopStore'
import { getMascotById } from '../../data/mascotRegistry'

const BASE_MENU = [
  { id: 'chat', label: 'Chat', icon: '💬' },
  { id: 'missions', label: 'Misiones', icon: '🎯' },
  { id: 'items', label: 'Objetos', icon: '🎒' },
  { id: 'books', label: 'Libros', icon: '📚' },
  { id: 'notes', label: 'Notas', icon: '📝' },
  { id: 'appearance', label: 'Aspecto', icon: '🎨' },
  { id: 'gallery', label: 'Galería', icon: '🖼️' },
]

// Floating "Clippy"-style companion: a small mascot bubble anchored to the
// corner, with a large popover menu (Chat / Misiones / Objetos / Libros /
// Notas / Aspecto / Galería).
export default function MascotCompanion({ courseId, module }) {
  const open = useMascotCompanionStore((s) => s.open)
  const setOpen = useMascotCompanionStore((s) => s.setOpen)
  const toggleOpen = useMascotCompanionStore((s) => s.toggleOpen)
  const panel = useMascotCompanionStore((s) => s.panel)
  const setPanel = useMascotCompanionStore((s) => s.setPanel)
  const selectedMascotId = useMascotStore((s) => s.selectedMascotId)
  const mascot = getMascotById(selectedMascotId)
  const settingsMascotName = useSettingsStore((s) => s.mascotName)
  const coins = useCurrencyStore((s) => s.coins)
  const hasCamera = useShopStore((s) => s.purchased.includes('camara'))

  const displayName = settingsMascotName || mascot.name
  const menu = hasCamera ? BASE_MENU : BASE_MENU.filter((item) => item.id !== 'gallery')

  return (
    <div className="fixed bottom-4 right-4 z-40 flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
      {open && (
        <div className="flex h-[80vh] w-[95vw] max-w-2xl flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl">
          <div className="flex flex-col gap-2 border-b border-border px-4 py-3">
            <div className="flex items-center justify-between">
              <p className="text-base font-bold text-text">{displayName}</p>
              <button
                onClick={() => setOpen(false)}
                className="text-text-muted hover:text-text"
                aria-label="Cerrar"
              >
                ✕
              </button>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <LevelBadge />
              <CurrencyBadge amount={coins} />
            </div>
          </div>

          <div
            className="grid border-b border-border text-sm"
            style={{ gridTemplateColumns: `repeat(${menu.length}, minmax(0, 1fr))` }}
          >
            {menu.map((item) => (
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
            {panel === 'chat' && <ChatTab courseId={courseId} module={module} className="h-full" />}
            {panel === 'missions' && <MissionsPanel courseId={courseId} module={module} />}
            {panel === 'items' && <ItemsPanel />}
            {panel === 'books' && <BooksPanel />}
            {panel === 'notes' && <NotesPanel courseId={courseId} module={module} />}
            {panel === 'appearance' && <AppearancePanel />}
            {panel === 'gallery' && <GalleryPanel />}
          </div>
        </div>
      )}

      <button
        onClick={toggleOpen}
        className="h-20 w-20 overflow-hidden rounded-full border-2 border-primary bg-surface shadow-lg transition-transform hover:scale-105 sm:h-24 sm:w-24"
        aria-label="Abrir mascota"
      >
        <MascotViewport className="h-full w-full" />
      </button>
    </div>
  )
}
