import { useShopStore } from '../../stores/useShopStore'
import { useCollectionStore } from '../../stores/useCollectionStore'
import { getShopItemById } from '../../data/shopRegistry'

// Bolsa de OBJETOS del alumno (menú de curso), estilo WoW: cuadrícula de 60
// ranuras. Reúne TODO lo que el jugador posee y que antes no aparecía junto:
//   - Objetos comprados en la Tienda (useShopStore.purchased → SHOP_ITEMS).
//   - Recompensas de colección ganadas en misiones (useCollectionStore).
// (El equipo equipable vive aparte, en el menú global Avatar/Mascota.)
const MAX_SLOTS = 60
const RARITY_COLOR = { common: '#9ca3af', rare: '#3b82f6', epic: '#a855f7', legendary: '#f59e0b' }

export default function ObjetosBagPanel() {
  const purchased = useShopStore((s) => s.purchased)
  const collection = useCollectionStore((s) => s.items)

  // purchased puede incluir ids que no son SHOP_ITEMS (libros, llaves de curso):
  // getShopItemById los descarta (null) y filtramos, para no mostrar ranuras rotas.
  const shopItems = purchased.map(getShopItemById).filter(Boolean)
  const items = [...shopItems, ...collection].slice(0, MAX_SLOTS)

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
            return (
              <div
                key={it.id ?? i}
                title={`${it.name}${it.description ? `\n${it.description}` : ''}`}
                className="flex aspect-square items-center justify-center rounded-lg border text-lg"
                style={{ borderColor: RARITY_COLOR[it.rarity] ?? 'var(--color-border)', background: 'var(--color-surface)' }}
              >
                {it.icon ?? '📦'}
              </div>
            )
          })}
        </div>
      )}

      <p className="text-center text-[10px] text-text-muted">
        Objetos de la Tienda y recompensas de misiones. Límite: {MAX_SLOTS}.
      </p>
    </div>
  )
}
