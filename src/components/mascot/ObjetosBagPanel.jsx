import { useState } from 'react'
import { useShopStore } from '../../stores/useShopStore'
import { useCollectionStore } from '../../stores/useCollectionStore'
import { useItemEffectsStore } from '../../stores/useItemEffectsStore'
import { getShopItemById } from '../../data/shopRegistry'

// Bolsa de OBJETOS del alumno (menú de curso), estilo WoW: cuadrícula de 60
// ranuras. Reúne lo que el jugador posee y que antes no aparecía junto:
//   - Objetos comprados en la Tienda (useShopStore.purchased → SHOP_ITEMS).
//   - Recompensas de colección ganadas en misiones (useCollectionStore).
// Clic en un objeto → muestra su ficha; si es interactivo (category 'objetos',
// p. ej. Radio, Cámara, Lente de Resumen) se puede ACTIVAR/DESACTIVAR — esos
// ids coinciden con las claves de useItemEffectsStore.activeItems.
const MAX_SLOTS = 60
const RARITY_COLOR = { common: '#9ca3af', rare: '#3b82f6', epic: '#a855f7', legendary: '#f59e0b' }

export default function ObjetosBagPanel({ onActivate }) {
  const purchased = useShopStore((s) => s.purchased)
  const collection = useCollectionStore((s) => s.items)
  const activeItems = useItemEffectsStore((s) => s.activeItems)
  const toggleItem = useItemEffectsStore((s) => s.toggleItem)

  const [selectedId, setSelectedId] = useState(null)

  // purchased puede incluir ids que no son SHOP_ITEMS (llaves de curso):
  // getShopItemById los descarta (null) y filtramos, para no mostrar ranuras rotas.
  const shopItems = purchased.map(getShopItemById).filter(Boolean)
  const items = [...shopItems, ...collection].slice(0, MAX_SLOTS)

  const selected = items.find((it) => it.id === selectedId) ?? null
  const isActivatable = selected?.category === 'objetos'
  const isActive = selected ? !!activeItems[selected.id] : false

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-black uppercase tracking-widest text-text-muted">🎒 Objetos</p>
        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">{items.length}/{MAX_SLOTS}</span>
      </div>

      {items.length === 0 ? (
        <p className="py-6 text-center text-xs text-text-muted">
          Vacío. Compra objetos en la Tienda o gánalos completando misiones — aparecerán aquí.
        </p>
      ) : (
        <div className="grid grid-cols-6 gap-1.5">
          {Array.from({ length: MAX_SLOTS }).map((_, i) => {
            const it = items[i]
            if (!it) {
              return <div key={`e${i}`} className="aspect-square rounded-lg border border-dashed border-border/40 bg-background/40" />
            }
            const active = !!activeItems[it.id]
            const isSel = selectedId === it.id
            return (
              <button
                key={it.id ?? i}
                type="button"
                onClick={() => setSelectedId(isSel ? null : it.id)}
                title={it.name}
                className="relative flex aspect-square items-center justify-center rounded-lg border text-lg transition-all hover:scale-105"
                style={{
                  borderColor: isSel ? '#fbbf24' : (RARITY_COLOR[it.rarity] ?? 'var(--color-border)'),
                  background: isSel ? 'rgba(251,191,36,0.15)' : 'var(--color-surface)',
                  boxShadow: active ? '0 0 8px rgba(34,197,94,0.6)' : 'none',
                }}
              >
                {it.icon ?? '📦'}
                {active && <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-surface" />}
              </button>
            )
          })}
        </div>
      )}

      {/* Ficha del objeto seleccionado + activar/desactivar */}
      {selected && (
        <div className="rounded-xl border border-border bg-background p-3">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-2xl"
              style={{ background: `${RARITY_COLOR[selected.rarity] ?? '#9ca3af'}22` }}>
              {selected.icon ?? '📦'}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-black text-text">{selected.name}</p>
              {selected.description && <p className="mt-0.5 text-[11px] leading-snug text-text-muted">{selected.description}</p>}
            </div>
          </div>
          {isActivatable ? (
            <button
              type="button"
              onClick={() => {
                const willActivate = !isActive
                toggleItem(selected.id)
                // Al ACTIVAR, cerramos el menú para que el efecto (cámara,
                // radio, tema, caja del TDAH…) quede visible al frente y no
                // tapado por este panel.
                if (willActivate) onActivate?.()
              }}
              className={`mt-3 w-full rounded-lg py-2 text-xs font-black transition-colors ${
                isActive ? 'bg-emerald-600 text-white hover:bg-emerald-500' : 'bg-primary text-background hover:bg-primary-hover'
              }`}
            >
              {isActive ? '✓ Activado — toca para desactivar' : '⚡ Activar objeto'}
            </button>
          ) : (
            <p className="mt-3 rounded-lg border border-border bg-surface px-3 py-1.5 text-center text-[11px] text-text-muted">
              Objeto de colección — no se activa.
            </p>
          )}
        </div>
      )}

      <p className="text-center text-[10px] text-text-muted">
        Toca un objeto para ver su ficha y activarlo. Límite: {MAX_SLOTS}.
      </p>
    </div>
  )
}
