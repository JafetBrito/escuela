import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../../stores/useAuthStore'
import { useGameStore } from '../../stores/useGameStore'
import { useSyncStatusStore } from '../../stores/useSyncStatusStore'
import GmConsole from './GmConsole'

const SYNC_LABEL = {
  idle: '⚪ Sin sincronizar aún',
  saving: '🟡 Guardando en la nube…',
  saved: '🟢 Sincronizado',
  error: '🔴 Error de sincronización',
}

// ponytail: flat link list, no route-scanning abstraction — add grouping/search if this grows past ~20 links.
const LINKS = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/tienda', label: 'Tienda' },
  { to: '/ajustes', label: 'Ajustes' },
  { to: '/logros', label: 'Logros' },
  { to: '/misiones', label: 'Misiones' },
  { to: '/notas', label: 'Notas' },
  { to: '/amigos', label: 'Amigos' },
  { to: '/chats', label: 'Chats' },
  { to: '/biblioteca', label: 'Biblioteca' },
  { to: '/arbol', label: 'Árbol de Habilidades (no-VR)' },
  { to: '/arena', label: 'Arena' },
  { to: '/vr', label: '🥽 VR: Campus' },
  { to: '/vr/room', label: '🥽 VR: Mi Room' },
  { to: '/vr/anfiteatro', label: '🥽 VR: Anfiteatro' },
  { to: '/vr/world-tree', label: '🥽 VR: Árbol del Mundo' },
  { to: '/vr/graffiti', label: '🥽 VR: Calle Graffiti (st.glb)' },
  { to: '/vr-arbol', label: '🥽 VR: VrArbol (standalone)' },
  { to: '/vr/cueva-platon', label: '🥽 VR: Cueva de Platón' },
  { to: '/admin-setup', label: '⚙️ Admin Setup' },
]

export default function DevToolsPanel() {
  const isAdmin = useAuthStore((s) => s.isAdmin)
  const [open, setOpen] = useState(false)
  const [consoleOpen, setConsoleOpen] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const syncStatus = useSyncStatusStore((s) => s.status)
  const lastSavedAt = useSyncStatusStore((s) => s.lastSavedAt)
  const lastError = useSyncStatusStore((s) => s.lastError)
  if (!isAdmin?.()) return null

  const handleForceSync = async () => {
    setSyncing(true)
    await useGameStore.getState().forceSyncToCloud()
    setSyncing(false)
  }

  return (
    <div className="fixed bottom-4 left-4 z-[999]">
      {open && (
        <div className="mb-2 max-h-[70vh] w-64 overflow-y-auto rounded-xl border border-border bg-surface/95 p-2 text-sm shadow-xl backdrop-blur">
          <div className="mb-2 rounded-lg border border-border/60 bg-surface-hover px-2 py-1.5">
            <p className="text-xs font-semibold text-text-muted">☁️ Sincronización</p>
            <p className="text-xs text-text">{SYNC_LABEL[syncStatus]}</p>
            {lastSavedAt && (
              <p className="text-[10px] text-text-muted">
                Último guardado: {new Date(lastSavedAt).toLocaleTimeString()}
              </p>
            )}
            {syncStatus === 'error' && lastError && (
              <p className="text-[10px] text-danger">{lastError}</p>
            )}
            <button
              type="button"
              onClick={handleForceSync}
              disabled={syncing}
              className="mt-1 w-full rounded-lg bg-primary px-2 py-1 text-xs font-semibold text-background disabled:opacity-50"
            >
              {syncing ? 'Guardando…' : '🔄 Forzar guardado en la nube'}
            </button>
            <button
              type="button"
              onClick={() => { setConsoleOpen((v) => !v); setOpen(false) }}
              className="mt-1 w-full rounded-lg border border-primary/40 px-2 py-1 text-xs font-semibold text-primary"
            >
              🖥️ Consola GM
            </button>
          </div>
          <p className="mb-2 px-1 text-xs font-semibold text-text-muted">🛠️ Dev — saltar a ruta</p>
          {LINKS.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setOpen(false)}
              className="block rounded-lg px-2 py-1.5 text-text hover:bg-primary/10"
            >
              {l.label}
            </Link>
          ))}
        </div>
      )}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface/95 text-lg shadow-xl backdrop-blur"
        aria-label="Dev tools"
        title="Dev tools (admin)"
      >
        🛠️
      </button>
      <GmConsole open={consoleOpen} onClose={() => setConsoleOpen(false)} />
    </div>
  )
}
