import { useState, useCallback } from 'react'

// ── Eval helper (no eval(), just a stack parser) ──────────────────────────────
function calc(expr) {
  try {
    // Replace display tokens with JS
    const js = expr
      .replace(/×/g, '*').replace(/÷/g, '/')
      .replace(/π/g, String(Math.PI))
      .replace(/e(?![0-9])/g, String(Math.E))
      .replace(/sin\(/g, 'Math.sin(').replace(/cos\(/g, 'Math.cos(')
      .replace(/tan\(/g, 'Math.tan(').replace(/log\(/g, 'Math.log10(')
      .replace(/ln\(/g, 'Math.log(').replace(/√\(/g, 'Math.sqrt(')
    // eslint-disable-next-line no-new-func
    const result = new Function(`"use strict"; return (${js})`)()
    if (!isFinite(result)) return 'Error'
    // Round to avoid floating-point garbage
    const rounded = parseFloat(result.toPrecision(12))
    return String(rounded)
  } catch {
    return 'Error'
  }
}

// ── Button layout ─────────────────────────────────────────────────────────────
const ROWS = [
  [
    { label: 'sin(',  cls: 'sci' }, { label: 'cos(',  cls: 'sci' }, { label: 'tan(',  cls: 'sci' }, { label: 'log(', cls: 'sci' },
  ],
  [
    { label: 'ln(',   cls: 'sci' }, { label: '√(',    cls: 'sci' }, { label: 'x²',   cls: 'sci' }, { label: 'xʸ',  cls: 'sci' },
  ],
  [
    { label: 'π',     cls: 'sci' }, { label: 'e',     cls: 'sci' }, { label: '(',     cls: 'sci' }, { label: ')',    cls: 'sci' },
  ],
  [
    { label: 'C',     cls: 'op'  }, { label: '⌫',    cls: 'op'  }, { label: '%',     cls: 'op'  }, { label: '÷',    cls: 'op'  },
  ],
  [
    { label: '7' },  { label: '8' },  { label: '9' },  { label: '×', cls: 'op' },
  ],
  [
    { label: '4' },  { label: '5' },  { label: '6' },  { label: '−', cls: 'op' },
  ],
  [
    { label: '1' },  { label: '2' },  { label: '3' },  { label: '+', cls: 'op' },
  ],
  [
    { label: '±',    cls: 'op'  }, { label: '0' }, { label: '.', cls: '' }, { label: '=', cls: 'eq', wide: false },
  ],
]

export default function Calculator({ compact = false }) {
  const [display, setDisplay] = useState('0')
  const [expr,    setExpr]    = useState('')
  const [justEvaled, setJustEvaled] = useState(false)

  const push = useCallback((label) => {
    if (label === 'C') {
      setDisplay('0'); setExpr(''); setJustEvaled(false); return
    }
    if (label === '⌫') {
      if (justEvaled) { setDisplay('0'); setExpr(''); setJustEvaled(false); return }
      const next = display.length > 1 ? display.slice(0, -1) : '0'
      setDisplay(next); setExpr(next === '0' ? '' : next); return
    }
    if (label === '=') {
      const result = calc(expr || display)
      setDisplay(result)
      setExpr(result === 'Error' ? '' : result)
      setJustEvaled(true)
      return
    }

    const isOp = ['+', '−', '×', '÷', '%', '(', ')'].includes(label)
    const isSci = ['sin(', 'cos(', 'tan(', 'log(', 'ln(', '√(', 'π', 'e'].includes(label)
    const isXY  = label === 'xʸ'
    const isX2  = label === 'x²'
    const isPM  = label === '±'

    let next = expr || (justEvaled ? display : display === '0' ? '' : display)

    if (isPM) {
      if (next.startsWith('-')) next = next.slice(1)
      else next = '-' + next
      setDisplay(next); setExpr(next); setJustEvaled(false); return
    }

    if (isX2) {
      next = next + '**2'
      setDisplay(next); setExpr(next); setJustEvaled(false); return
    }
    if (isXY) {
      next = next + '**'
      setDisplay(next); setExpr(next); setJustEvaled(false); return
    }

    if (isSci || isOp) {
      next = next + label
    } else {
      // digit or dot
      if (justEvaled && !isOp) next = label
      else next = (next === '' ? '' : next) + label
    }

    setDisplay(next)
    setExpr(next)
    setJustEvaled(false)
  }, [display, expr, justEvaled])

  const btnCls = (btn) => {
    const base = compact
      ? 'flex items-center justify-center rounded-lg text-xs font-bold transition active:scale-95 select-none cursor-pointer h-8'
      : 'flex items-center justify-center rounded-xl text-sm font-bold transition active:scale-95 select-none cursor-pointer h-11'
    if (btn.cls === 'eq')  return base + ' bg-primary text-background hover:opacity-90'
    if (btn.cls === 'op')  return base + ' bg-surface-hover text-amber-400 hover:bg-border'
    if (btn.cls === 'sci') return base + ' bg-surface text-cyan-400 hover:bg-surface-hover border border-border/40'
    return base + ' bg-surface text-text hover:bg-surface-hover'
  }

  return (
    <div className={`flex flex-col gap-${compact ? '1.5' : '2'} select-none`}>
      {/* Display */}
      <div className={`rounded-xl bg-[#0d1117] px-3 py-2 text-right font-mono ${compact ? 'text-lg' : 'text-2xl'} text-emerald-400 shadow-inner`}>
        <div className="min-h-[1.2em] overflow-hidden text-ellipsis whitespace-nowrap">
          {display}
        </div>
      </div>

      {/* Buttons */}
      <div className="grid grid-cols-4 gap-1.5">
        {ROWS.flat().map((btn, i) => (
          <button
            key={i}
            type="button"
            onClick={() => push(btn.label)}
            className={btnCls(btn)}
          >
            {btn.label}
          </button>
        ))}
      </div>
    </div>
  )
}
