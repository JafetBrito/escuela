import { useEffect, useRef } from 'react'
import { useAuthStore } from '../../stores/useAuthStore'
import { useItemEffectsStore } from '../../stores/useItemEffectsStore'
import { useShopStore } from '../../stores/useShopStore'
import { getUnlockedItems, ITEM_RARITY } from '../../data/itemsRegistry'
import { SHOP_ITEMS } from '../../data/shopRegistry'

// Plays/pauses the radio's audio element to match the item's active state.
function RadioPlayer({ item, isActive }) {
  const audioRef = useRef(null)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    if (isActive) {
      audio.play().catch(() => {})
    } else {
      audio.pause()
    }
  }, [isActive])

  return (
    <audio ref={audioRef} src={item.audioSrc} loop className="mt-2 w-full" controls />
  )
}

export default function ItemsPanel({ className = '' }) {
  const license = useAuthStore((s) => s.license)
  const purchased = useShopStore((s) => s.purchased)
  const items = [
    ...getUnlockedItems(license),
    ...SHOP_ITEMS.filter((item) => item.interactive && purchased.includes(item.id)),
  ]
  const activeItems = useItemEffectsStore((s) => s.activeItems)
  const toggleItem = useItemEffectsStore((s) => s.toggleItem)

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      <p className="text-sm text-text-muted">
        Objetos que tu mascota lleva en su inventario. Los que tienen función se pueden activar y
        desactivar.
      </p>

      <div className="grid gap-3 sm:grid-cols-2">
        {items.map((item) => {
          const rarity = ITEM_RARITY[item.rarity] ?? ITEM_RARITY.common
          const isActive = !!activeItems[item.id]
          return (
            <div
              key={item.id}
              className="flex gap-3 rounded-xl border-2 bg-background p-3"
              style={{ borderColor: rarity.color }}
            >
              <div
                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg text-3xl"
                style={{ backgroundColor: `${rarity.color}22`, border: `1px solid ${rarity.color}` }}
              >
                {item.icon}
              </div>
              <div className="flex flex-1 flex-col gap-1">
                <p className="font-bold" style={{ color: rarity.color }}>
                  {item.name}
                </p>
                <p className="text-xs uppercase tracking-wide" style={{ color: rarity.color }}>
                  {rarity.label}
                </p>
                <p className="text-sm text-text-muted">{item.description}</p>
                {item.interactive && (
                  <button
                    onClick={() => toggleItem(item.id)}
                    className={`mt-1 self-start rounded-lg px-3 py-1 text-xs font-semibold transition-colors ${
                      isActive
                        ? 'bg-primary text-background hover:bg-primary-hover'
                        : 'border border-border text-text-muted hover:border-primary/40 hover:text-text'
                    }`}
                  >
                    {isActive ? '✓ Activado' : 'Activar'}
                  </button>
                )}
                {item.kind === 'radio-player' && <RadioPlayer item={item} isActive={isActive} />}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
