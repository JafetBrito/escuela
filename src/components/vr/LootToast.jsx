import { useMobStore } from '../../stores/useMobStore'
import { formatCurrency } from '../../utils/currency'

// Botín destacado: antes el resultado de matar un monstruo solo aparecía como
// una línea más en el chat del mundo, muy fácil de perder de vista. Esto se
// ve grande, en el centro, y se queda unos segundos — igual que una
// notificación de loot en un RPG de verdad.
export default function LootToast() {
  const toasts = useMobStore((s) => s.lootToasts)
  if (toasts.length === 0) return null

  return (
    <div className="pointer-events-none absolute left-1/2 top-24 z-30 flex -translate-x-1/2 flex-col items-center gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="flex items-center gap-3 rounded-2xl border border-amber-400/50 bg-black/80 px-5 py-3 shadow-2xl backdrop-blur-sm"
          style={{ boxShadow: '0 0 24px rgba(251,191,36,0.35)' }}
        >
          <span className="text-2xl">{t.mobIcon}</span>
          <div className="flex flex-col">
            <span className="text-xs font-bold uppercase tracking-widest text-amber-300">{t.mobName} derrotado</span>
            <div className="mt-0.5 flex flex-wrap items-center gap-3 text-sm font-black text-white">
              {t.coins > 0 && <span>+{formatCurrency(t.coins)}</span>}
              {t.xp > 0 && <span className="text-sky-300">+{t.xp} XP</span>}
              {t.item && <span className="text-emerald-300">{t.item.icon} {t.item.name}</span>}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
