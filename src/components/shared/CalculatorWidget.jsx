import { useItemEffectsStore } from '../../stores/useItemEffectsStore'
import Calculator from '../tools/Calculator'

export default function CalculatorWidget() {
  const toggle = useItemEffectsStore((s) => s.toggleItem)

  return (
    <div className="fixed bottom-24 right-4 z-50 w-64 rounded-2xl border border-border bg-surface shadow-2xl">
      <div className="flex items-center justify-between border-b border-border px-3 py-2">
        <span className="text-xs font-bold text-text-muted">🔢 Calculadora</span>
        <button
          type="button"
          onClick={() => toggle('calculadora')}
          className="rounded px-1.5 py-0.5 text-xs text-text-muted transition hover:bg-surface-hover hover:text-text"
        >
          ✕
        </button>
      </div>
      <div className="p-2">
        <Calculator compact />
      </div>
    </div>
  )
}
