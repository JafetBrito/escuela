import { useBagStore } from '../../stores/useBagStore'
import { useCollectionStore } from '../../stores/useCollectionStore'
import { useItemEffectsStore } from '../../stores/useItemEffectsStore'
import { getShopItemById } from '../../data/shopRegistry'
import { useI18n } from '../../i18n'

// Lista de OBJETOS del alumno (menú de curso). Reúne lo que el jugador posee:
//   - Objetos comprados en la Tienda, ubicados en la bolsa de Avatar/Mascota
//     (useBagStore → SHOP_ITEMS).
//   - Recompensas de colección ganadas en misiones (useCollectionStore).
// Cada objeto aparece completo en una fila (icono + nombre + descripción). Si
// es interactivo — su id coincide con una clave de useItemEffectsStore que
// algún componente consume (cámara, radio, temas, caja del TDAH…) — trae su
// botón Activar/Desactivar en la misma fila.
//
// `owner` es opcional: pásalo ('player'|'oliver') donde ya exista un
// selector Avatar/Mascota (dentro de VR) para filtrar a esa bolsa. Si se
// omite (uso fuera de VR, donde no hay ese selector) se muestra la unión de
// ambas bolsas — igual que el comportamiento de siempre.
const MAX_ITEMS = 60
const RARITY_COLOR = { common: '#9ca3af', rare: '#3b82f6', epic: '#a855f7', legendary: '#f59e0b' }

// Ids que DE VERDAD hacen algo al activarse (los lee GlobalItemEffects,
// ThemeController, NefertitiOverlay, ChatPanel…). No depende de la categoría
// de tienda: Reina Nefertiti es 'cosmeticos' pero sí se activa.
const ACTIVATABLE_IDS = new Set([
  'camara', 'radio', 'reina-nefertiti',
  'caja-tdah', 'libro', 'calculadora', 'linterna', 'lente-resumen',
])

export default function ObjetosBagPanel({ owner, onActivate }) {
  const { t } = useI18n()
  const bags = useBagStore((s) => s.bags)
  const collection = useCollectionStore((s) => s.items)
  const activeItems = useItemEffectsStore((s) => s.activeItems)
  const toggleItem = useItemEffectsStore((s) => s.toggleItem)

  // Sin `owner`: unión de ambas bolsas (vista de siempre, fuera de VR).
  // Con `owner`: solo lo que está en esa bolsa.
  const bagIds = owner
    ? (bags[owner] ?? [])
    : [...new Set([...(bags.player ?? []), ...(bags.oliver ?? [])])]
  const shopItems = bagIds.map(getShopItemById).filter(Boolean)
  const items = [...shopItems, ...collection].slice(0, MAX_ITEMS)

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-black uppercase tracking-widest text-text-muted">{t('pages.mascotHome.objetosHeader')}</p>
        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">{items.length}/{MAX_ITEMS}</span>
      </div>

      {items.length === 0 ? (
        <p className="py-6 text-center text-xs text-text-muted">
          {t('pages.mascotHome.objetosEmpty')}
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {items.map((it, i) => {
            const activatable = ACTIVATABLE_IDS.has(it.id)
            const active = !!activeItems[it.id]
            return (
              <li
                key={it.id ?? i}
                className="flex items-center gap-3 rounded-xl border bg-background p-2.5"
                style={{ borderColor: active ? '#22c55e' : 'var(--color-border)' }}
              >
                <span
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-2xl"
                  style={{
                    background: `${RARITY_COLOR[it.rarity] ?? '#9ca3af'}22`,
                    boxShadow: active ? '0 0 8px rgba(34,197,94,0.6)' : 'none',
                  }}
                >
                  {it.icon ?? '📦'}
                </span>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-black text-text">{it.name}</p>
                  {it.description && (
                    <p className="mt-0.5 line-clamp-2 text-[11px] leading-snug text-text-muted">{it.description}</p>
                  )}
                </div>

                {activatable ? (
                  <button
                    type="button"
                    onClick={() => {
                      const willActivate = !active
                      toggleItem(it.id)
                      // Al ACTIVAR cerramos el menú para que el efecto (cámara,
                      // radio, tema, caja del TDAH…) quede visible al frente.
                      if (willActivate) onActivate?.()
                    }}
                    className={`shrink-0 rounded-lg px-3 py-2 text-[11px] font-black transition-colors ${
                      active
                        ? 'bg-emerald-600 text-white hover:bg-emerald-500'
                        : 'bg-primary text-background hover:bg-primary-hover'
                    }`}
                  >
                    {active ? t('pages.mascotHome.itemDeactivate') : t('pages.mascotHome.itemActivate')}
                  </button>
                ) : (
                  <span className="shrink-0 rounded-lg border border-border px-2.5 py-1.5 text-[10px] font-bold text-text-muted">
                    {t('pages.mascotHome.collection')}
                  </span>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
