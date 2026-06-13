import { splitCurrency } from '../../utils/currency'

// WoW-style gold/silver/copper display.
export default function CurrencyBadge({ amount = 0, className = '' }) {
  const { gold, silver, bronze } = splitCurrency(amount)

  return (
    <div
      className={`flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 text-sm font-semibold text-text ${className}`}
    >
      <span className="flex items-center gap-1" title="Oro">
        <span className="h-2.5 w-2.5 rounded-full bg-[#ffd700]" />
        {gold}
      </span>
      <span className="flex items-center gap-1" title="Plata">
        <span className="h-2.5 w-2.5 rounded-full bg-[#c0c0c0]" />
        {silver}
      </span>
      <span className="flex items-center gap-1" title="Cobre">
        <span className="h-2.5 w-2.5 rounded-full bg-[#b87333]" />
        {bronze}
      </span>
    </div>
  )
}
