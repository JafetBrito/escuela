import AppTopBar from '../shared/AppTopBar'
import { SHOP_ITEMS, ITEM_RARITY } from '../../data/shopRegistry'
import { useShopStore } from '../../stores/useShopStore'
import { useCurrencyStore } from '../../stores/useCurrencyStore'

export default function ShopPage() {
  const coins = useCurrencyStore((s) => s.coins)
  const purchased = useShopStore((s) => s.purchased)
  const buyItem = useShopStore((s) => s.buyItem)

  return (
    <div className="flex min-h-screen flex-col bg-background text-text">
      <AppTopBar />

      <main className="flex-1 px-4 py-8 md:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold">Tienda</h1>
              <p className="mt-1 text-sm text-text-muted">
                Gasta las monedas que ganas completando misiones en objetos cosméticos para tu mascota.
              </p>
            </div>
            <div className="flex items-center gap-1.5 rounded-full border border-border bg-surface px-4 py-2 text-base font-semibold text-text">
              <span>🪙</span>
              {coins}
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {SHOP_ITEMS.map((item) => {
              const owned = purchased.includes(item.id)
              const canAfford = coins >= item.price
              const rarity = ITEM_RARITY[item.rarity]

              return (
                <div
                  key={item.id}
                  className="flex flex-col gap-3 rounded-2xl border p-5"
                  style={{ borderColor: rarity?.color ?? 'var(--color-border)' }}
                >
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
                    <h2 className="text-lg font-bold text-text">{item.name}</h2>
                    <p className="mt-1 text-sm text-text-muted">{item.description}</p>
                  </div>

                  <div className="mt-auto flex items-center justify-between gap-2">
                    <span className="flex items-center gap-1 text-sm font-semibold text-text">
                      <span>🪙</span>
                      {item.price}
                    </span>
                    <button
                      onClick={() => buyItem(item.id)}
                      disabled={owned || !canAfford}
                      className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                        owned
                          ? 'cursor-default bg-surface-hover text-text-muted'
                          : canAfford
                            ? 'bg-primary text-background hover:bg-primary-hover'
                            : 'cursor-not-allowed bg-surface-hover text-text-muted'
                      }`}
                    >
                      {owned ? 'Adquirido ✓' : canAfford ? 'Comprar' : 'Sin monedas'}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </main>
    </div>
  )
}
