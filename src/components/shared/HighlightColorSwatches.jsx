import { HIGHLIGHT_COLORS } from '../../utils/highlightTextAnchor'

// Fila de swatches de color para elegir con qué subrayar — usado tanto en el
// menú de selección (al crear un subrayado) como, potencialmente, en
// cualquier otro lugar que necesite el mismo picker.
export default function HighlightColorSwatches({ activeColor, onSelect, vertical = false }) {
  return (
    <div className={`flex items-center gap-1.5 ${vertical ? 'flex-wrap justify-center px-1 py-1' : 'px-1'}`}>
      {HIGHLIGHT_COLORS.map((c) => (
        <button
          key={c.id}
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => onSelect(c.id)}
          title={c.id}
          aria-label={c.id}
          className={`h-6 w-6 shrink-0 rounded-full border-2 transition-transform hover:scale-110 ${
            activeColor === c.id ? 'border-white' : 'border-white/30'
          }`}
          style={{ backgroundColor: c.hex }}
        />
      ))}
    </div>
  )
}
