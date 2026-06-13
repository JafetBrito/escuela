import { useItemEffectsStore } from '../../stores/useItemEffectsStore'

// Floating decorative symbols + banner shown while "Reina Nefertiti" is
// active, on top of the desert theme swap from ThemeController.
const SYMBOLS = ['👑', '𓋹', '🏺', '𓆣', '𓅓', '🐫', '📜', '𓂀', '✨', '𓆓']

export default function NefertitiOverlay() {
  const active = useItemEffectsStore((s) => !!s.activeItems['reina-nefertiti'])

  if (!active) return null

  return (
    <div className="pointer-events-none fixed inset-0 z-30 overflow-hidden">
      {SYMBOLS.map((symbol, i) => (
        <span
          key={i}
          className="nefertiti-float absolute text-3xl opacity-25 sm:text-4xl"
          style={{
            left: `${(i * 9.7) % 100}%`,
            animationDelay: `${i * 1.4}s`,
            animationDuration: `${16 + (i % 5) * 3}s`,
          }}
        >
          {symbol}
        </span>
      ))}

      <div className="absolute left-1/2 top-3 -translate-x-1/2 rounded-full border border-primary/60 bg-background/80 px-4 py-1.5 text-xs font-semibold tracking-wide text-primary shadow-lg sm:text-sm">
        👑 Modo Reina Nefertiti activado 𓂀
      </div>
    </div>
  )
}
