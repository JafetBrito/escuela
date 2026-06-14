import { useMemo } from 'react'
import AppTopBar from '../shared/AppTopBar'
import MascotCompanion from '../mascot/MascotCompanion'
import PageVideoModal from '../shared/PageVideoModal'
import NpcViewport from '../mascot/NpcViewport'
import { SHOP_ITEMS, SHOP_CATEGORIES, ITEM_RARITY } from '../../data/shopRegistry'
import { useShopStore } from '../../stores/useShopStore'
import { useCurrencyStore } from '../../stores/useCurrencyStore'
import { formatCurrency } from '../../utils/currency'

const CATEGORY_ORDER = Object.keys(SHOP_CATEGORIES)
const MAGE_MASCOT_ID = 9

export default function ShopPage() {
  const coins = useCurrencyStore((s) => s.coins)
  const purchased = useShopStore((s) => s.purchased)
  const buyItem = useShopStore((s) => s.buyItem)

  // Una vez comprado, el objeto deja de mostrarse en la tienda (sigue
  // disponible en "Objetos" / Ajustes según corresponda).
  const categories = useMemo(() => {
    const groups = new Map()
    for (const item of SHOP_ITEMS) {
      if (purchased.includes(item.id)) continue
      const key = item.category ?? 'cosmeticos'
      if (!groups.has(key)) groups.set(key, [])
      groups.get(key).push(item)
    }
    return Array.from(groups.entries()).sort(
      (a, b) => CATEGORY_ORDER.indexOf(a[0]) - CATEGORY_ORDER.indexOf(b[0]),
    )
  }, [purchased])

  return (
    <div className="flex min-h-screen flex-col bg-background text-text">
      <AppTopBar />
      <PageVideoModal pageKey="tienda" />

      <main className="flex-1 px-4 py-8 md:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="overflow-hidden rounded-2xl bg-gradient-to-r from-amber-500 to-emerald-600 px-6 py-8 shadow-lg">
            <h1 className="text-3xl font-extrabold text-white drop-shadow-sm">🛒 Tienda</h1>
            <p className="mt-1 text-sm font-medium text-white/85">
              Gasta las monedas que ganas completando misiones en objetos para tu mascota.
            </p>
          </div>

          <div className="mt-6 flex items-stretch gap-4 overflow-hidden rounded-2xl border border-border bg-surface p-5">
            <NpcViewport
              mascotId={MAGE_MASCOT_ID}
              className="h-28 w-28 shrink-0 overflow-hidden rounded-xl bg-gradient-to-b from-emerald-500/10 to-transparent"
            />
            <div className="flex flex-col justify-center">
              <p className="font-bold text-text">Zafir, el comerciante mágico</p>
              <p className="text-sm text-text-muted">
                "¡Bienvenido de nuevo! Tengo objetos nuevos recién forjados, cada uno con sus
                propias características. Échales un vistazo."
              </p>
            </div>
          </div>

          {categories.length === 0 && (
            <p className="mt-10 text-center text-sm text-text-muted">
              ¡Ya tienes todo lo que hay en la tienda! Vuelve pronto por más objetos.
            </p>
          )}

          {categories.map(([categoryId, items]) => {
            const meta = SHOP_CATEGORIES[categoryId] ?? SHOP_CATEGORIES.cosmeticos
            const isPrompts = categoryId === 'prompts'

            return (
              <section key={categoryId} className="mt-10">
                <div className="mb-4 flex items-center gap-3">
                  <span className="text-2xl">{meta.icon}</span>
                  <h2 className="text-lg font-bold text-text">{meta.label}</h2>
                  {isPrompts && (
                    <span className="rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-xs text-primary">
                      Se activan desde Ajustes al comprarlas
                    </span>
                  )}
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {items.map((item) => {
                    const canAfford = coins >= item.price
                    const rarity = ITEM_RARITY[item.rarity]

                    return (
                      <div
                        key={item.id}
                        className="relative flex flex-col gap-3 overflow-hidden rounded-2xl border p-5"
                        style={{ borderColor: rarity?.color ?? 'var(--color-border)' }}
                      >
                        {isPrompts && (
                          <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-background/80 px-2 py-1 text-xs font-semibold text-text-muted backdrop-blur-sm">
                            🔒 Bloqueado
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-surface-hover text-3xl">
                            {item.icon}
                          </div>
                          <span
                            className="rounded-full px-2.5 py-1 text-xs font-semibold"
                            style={{ color: rarity?.color, backgroundColor: `${rarity?.color}22` }}
                          >
                            {rarity?.label ?? item.rarity}
                          </span>
                        </div>

                        <div>
                          <h3 className="text-lg font-bold text-text">{item.name}</h3>
                          <p className="mt-1 text-sm text-text-muted">{item.description}</p>
                          {item.stats && (
                            <p className="mt-2 inline-block rounded-full bg-surface-hover px-2.5 py-1 text-xs font-semibold text-primary">
                              {item.stats.label} {item.stats.value}
                            </p>
                          )}
                          {isPrompts && (
                            <p className="mt-2 rounded-lg border border-dashed border-border bg-background/60 px-2.5 py-2 text-xs text-text-muted">
                              🔒 Las instrucciones de esta personalidad se revelan al comprarla.
                            </p>
                          )}
                        </div>

                        <div className="mt-auto flex items-center justify-between gap-2">
                          <span className="text-sm font-semibold text-text">
                            {formatCurrency(item.price)}
                          </span>
                          <button
                            onClick={() => buyItem(item.id)}
                            disabled={!canAfford}
                            className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                              canAfford
                                ? 'bg-primary text-background hover:bg-primary-hover'
                                : 'cursor-not-allowed bg-surface-hover text-text-muted'
                            }`}
                          >
                            {canAfford ? 'Comprar' : 'Sin monedas'}
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </section>
            )
          })}
        </div>
      </main>

      <MascotCompanion />
    </div>
  )
}
