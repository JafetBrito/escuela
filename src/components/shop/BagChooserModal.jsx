import { useState } from 'react'
import { useShopStore } from '../../stores/useShopStore'
import { useBagStore, MAX_BAG_SLOTS } from '../../stores/useBagStore'

const OWNERS = [
  { id: 'player', label: 'Avatar', icon: '⚔️' },
  { id: 'oliver', label: 'Mascota', icon: '🐾' },
]

// Preguntado al comprar (no hay owner en el flujo de la Tienda como sí lo
// hay en el comando /additem) — ver plan del sistema de bolsas VR.
export default function BagChooserModal({ item, onClose }) {
  const bags = useBagStore((s) => s.bags)
  const [error, setError] = useState('')

  const choose = (owner) => {
    const ok = useShopStore.getState().buyItem(item.id)
    if (!ok) { setError('❌ Sin monedas suficientes.'); return }
    useBagStore.getState().addItem(owner, item.id)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div className="w-full max-w-sm rounded-2xl border border-border bg-surface p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <span className="text-3xl">{item.icon}</span>
        <h2 className="mt-2 text-lg font-extrabold text-text">¿Para quién es «{item.name}»?</h2>
        <p className="mt-1 text-sm text-text-muted">Elige a qué bolsa se guarda.</p>

        <div className="mt-4 space-y-2">
          {OWNERS.map((o) => {
            const used = bags[o.id]?.length ?? 0
            const full = used >= MAX_BAG_SLOTS
            return (
              <button
                key={o.id}
                type="button"
                disabled={full}
                onClick={() => choose(o.id)}
                className="flex w-full items-center justify-between gap-3 rounded-xl border border-border bg-background/40 p-3 text-left transition hover:border-primary/40 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span className="flex items-center gap-2 text-sm font-bold text-text">
                  <span className="text-xl">{o.icon}</span> {o.label}
                </span>
                <span className={`text-xs font-semibold ${full ? 'text-danger' : 'text-text-muted'}`}>
                  {full ? 'Bolsa llena' : `${used}/${MAX_BAG_SLOTS} espacios`}
                </span>
              </button>
            )
          })}
        </div>

        {error && <p className="mt-3 text-xs font-semibold text-danger">{error}</p>}

        <button type="button" onClick={onClose} className="mt-4 w-full text-center text-xs text-text-muted hover:text-text">
          Cancelar
        </button>
      </div>
    </div>
  )
}
