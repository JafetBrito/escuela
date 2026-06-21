import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../../stores/useAuthStore'

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
  if (!isAdmin?.()) return null

  return (
    <div className="fixed bottom-4 left-4 z-[999]">
      {open && (
        <div className="mb-2 max-h-[70vh] w-64 overflow-y-auto rounded-xl border border-border bg-surface/95 p-2 text-sm shadow-xl backdrop-blur">
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
    </div>
  )
}
