/**
 * ============================================================================
 * 🛒 PÁGINA DE LA TIENDA (ShopPage)
 * ============================================================================
 * Esta es la vista principal donde los estudiantes gastan sus 'coins'.
 * 
 * 🏗️ ARQUITECTURA Y ESTADO GLOBAL (Zustand):
 * Este componente no maneja estado local complejo, es un consumidor de:
 * - `useCurrencyStore`: Para leer el saldo actual (coins).
 * - `useShopStore`: Para leer el inventario comprado (`purchased`) y ejecutar la compra (`buyItem`).
 * 
 * 🧠 REGLAS DE NEGOCIO CLAVE:
 * 1. Consumibles vs Permanentes: Todo en esta tienda es de "compra única". 
 *    Una vez que un ID entra al array `purchased`, desaparece de esta vista.
 * 2. Monedas vs USD: Los objetos marcados como `comingSoon` (Próximamente) 
 *    muestran su valor en Dólares Reales (USD) a modo de 'teaser', el resto usa 
 *    la moneda virtual del juego.
 * ============================================================================
 */

import { useMemo } from 'react'
import AppTopBar from '../shared/AppTopBar'
import MascotCompanion from '../mascot/MascotCompanion'
import PageVideoModal from '../shared/PageVideoModal'
import NpcViewport from '../mascot/NpcViewport'
import NpcChatPanel from '../shared/NpcChatPanel'
import { SHOP_ITEMS, SHOP_CATEGORIES, ITEM_RARITY } from '../../data/shopRegistry'
import { useShopStore } from '../../stores/useShopStore'
import { useCurrencyStore } from '../../stores/useCurrencyStore'
import { formatCurrency } from '../../utils/currency'

// Define el orden estricto en el que se renderizan las categorías en la pantalla.
const CATEGORY_ORDER = Object.keys(SHOP_CATEGORIES)

// ID del modelo 3D que usará el NPC de la tienda (9 = Mago).
const MAGE_MASCOT_ID = 9

/**
 * 🤖 INSTRUCCIONES DEL SISTEMA PARA LA IA (System Prompts)
 * Estos textos se inyectan directamente en el NpcChatPanel para darle 
 * personalidad y contexto al personaje 3D con el que habla el alumno.
 */
const ZAFIR_PROMPT = `Eres Zafir, un comerciante mágico y carismático de la Tienda de OLIVER SCHOOL. Hablas en español, con un tono cálido, juguetón y un poco teatral, como un vendedor de bazar fantástico. Conoces el catálogo de la tienda (mascotas, cosméticos, objetos interactivos, personalidades de IA y llaves de cursos) y puedes recomendar objetos según lo que el estudiante diga que necesita, animándolo a ganar monedas completando misiones y clases. No inventes precios exactos si no los tienes; en ese caso invita al estudiante a revisar la tienda. Mantén tus respuestas breves (2-4 frases) y siempre en personaje.`

// ⚠️ DEUDA TÉCNICA: Este prompt pertenece al "Maestro de Misiones", pero no se 
// está utilizando en este componente. Considerar moverlo a su página correspondiente 
// (ej: MisionesPage o Dashboard) para evitar confusión.
const MAGE_PROMPT = `Eres el Maestro de Misiones, un sabio mago anciano que entrega misiones en OLIVER SCHOOL. Hablas en español con un tono místico, motivador y un poco solemne, como un mentor de RPG. Animas al estudiante a aceptar y completar misiones generales (hablar con su mascota, completar clases, usar objetos, comprar en la tienda, leer libros, cambiar su apariencia) para ganar monedas y experiencia. No inventes recompensas exactas si no las tienes; invita al estudiante a revisar el tablón de misiones. Mantén tus respuestas breves (2-4 frases) y siempre en personaje.`


export default function ShopPage() {
  // 💰 Conexión con los Stores Globales
  const coins = useCurrencyStore((s) => s.coins)
  const purchased = useShopStore((s) => s.purchased)
  const buyItem = useShopStore((s) => s.buyItem)

  /**
   * 🧹 FILTRO Y AGRUPACIÓN DE INVENTARIO (Memoizado por rendimiento)
   * Regla: Si el item.id está en el array `purchased`, se ignora (ya no se vende).
   * El resultado es un Array de Arrays ordenado: [['cosmeticos', [{item}]], ['prompts', [{item}]]]
   */
  const categories = useMemo(() => {
    const groups = new Map()
    for (const item of SHOP_ITEMS) {
      // Si ya lo compró, sáltalo. El usuario lo encontrará en su inventario/ajustes.
      if (purchased.includes(item.id)) continue
      
      const key = item.category ?? 'cosmeticos'
      if (!groups.has(key)) groups.set(key, [])
      groups.get(key).push(item)
    }
    
    // Convertimos el Map a Array y lo ordenamos según CATEGORY_ORDER
    return Array.from(groups.entries()).sort(
      (a, b) => CATEGORY_ORDER.indexOf(a[0]) - CATEGORY_ORDER.indexOf(b[0]),
    )
  }, [purchased]) // Solo se recalcula si el usuario compra algo nuevo.

  return (
    <div className="flex min-h-screen flex-col bg-background text-text">
      <AppTopBar />
      <PageVideoModal pageKey="tienda" />

      <main className="flex-1 px-4 py-8 md:px-8">
        <div className="mx-auto max-w-5xl">
          
          {/* HEADER DE LA PÁGINA */}
          <div className="overflow-hidden rounded-2xl bg-gradient-to-r from-amber-500 to-emerald-600 px-6 py-8 shadow-lg">
            <h1 className="text-3xl font-extrabold text-white drop-shadow-sm">🛒 Tienda</h1>
            <p className="mt-1 text-sm font-medium text-white/85">
              Gasta las monedas que ganas completando misiones en objetos para tu mascota.
            </p>
          </div>

          {/* SECCIÓN DEL NPC (Vendedor) */}
          <div className="mt-6 flex flex-col gap-4 overflow-hidden rounded-2xl border border-border bg-surface p-5 sm:flex-row sm:items-stretch">
            <NpcViewport
              mascotId={MAGE_MASCOT_ID}
              className="h-28 w-28 shrink-0 overflow-hidden rounded-xl bg-gradient-to-b from-emerald-500/10 to-transparent"
            />
            <div className="flex flex-1 flex-col justify-center gap-3">
              <div>
                <p className="font-bold text-text">Zafir, el comerciante mágico</p>
                <p className="text-sm text-text-muted">
                  "¡Bienvenido de nuevo! Tengo objetos nuevos recién forjados, cada uno con sus
                  propias características. Échales un vistazo, o pregúntame lo que quieras."
                </p>
              </div>
              <NpcChatPanel npcId="zafir" npcName="Zafir" npcPrompt={ZAFIR_PROMPT} />
            </div>
          </div>

          {/* EMPTY STATE: El usuario compró toda la tienda */}
          {categories.length === 0 && (
            <p className="mt-10 text-center text-sm text-text-muted">
              ¡Ya tienes todo lo que hay en la tienda! Vuelve pronto por más objetos.
            </p>
          )}

          {/* RENDERIZADO DEL CATÁLOGO POR CATEGORÍA */}
          {categories.map(([categoryId, items]) => {
            const meta = SHOP_CATEGORIES[categoryId] ?? SHOP_CATEGORIES.cosmeticos
            const isPrompts = categoryId === 'prompts'

            return (
              <section key={categoryId} className="mt-10">
                
                {/* Título de la Categoría */}
                <div className="mb-4 flex items-center gap-3">
                  <span className="text-2xl">{meta.icon}</span>
                  <h2 className="text-lg font-bold text-text">{meta.label}</h2>
                  {isPrompts && (
                    <span className="rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-xs text-primary">
                      Se activan desde Ajustes al comprarlas
                    </span>
                  )}
                </div>

                {/* Grid de Productos */}
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
                        {/* Etiqueta de Bloqueo Visual (Solo Prompts) */}
                        {isPrompts && (
                          <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-background/80 px-2 py-1 text-xs font-semibold text-text-muted backdrop-blur-sm">
                            🔒 Bloqueado
                          </div>
                        )}

                        {/* Icono y Rareza */}
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

                        {/* Detalles del Producto */}
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

                        {/* Pie: Precio y Botón de Compra */}
                        <div className="mt-auto flex items-center justify-between gap-2">
                          <span className="text-sm font-semibold text-text">
                            {item.comingSoon ? `$${item.priceUSD.toFixed(2)} USD` : formatCurrency(item.price)}
                          </span>
                          
                          {item.comingSoon ? (
                            <span className="rounded-lg bg-surface-hover px-4 py-2 text-sm font-semibold text-text-muted">
                              🔒 Próximamente
                            </span>
                          ) : (
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
                          )}
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

      {/* Mascota global que acompaña al usuario por toda la app */}
      <MascotCompanion />
    </div>
  )
}