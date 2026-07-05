// Renders a line of text that may contain ANSI escape codes as styled spans.
// Supports: bold (1), dim (2), colors (30-37 fg, 90-97 bright fg), reset (0).

const ANSI_REGEX = /\x1b\[([0-9;]*)m/g

const FG = {
  30: 'text-gray-500',   31: 'text-red-400',    32: 'text-emerald-400',
  33: 'text-yellow-400', 34: 'text-blue-400',   35: 'text-purple-400',
  36: 'text-cyan-400',   37: 'text-gray-200',
  90: 'text-gray-600',   91: 'text-red-300',    92: 'text-green-300',
  93: 'text-yellow-300', 94: 'text-blue-300',   95: 'text-pink-300',
  96: 'text-cyan-300',   97: 'text-white',
}

function parseAnsi(raw) {
  const segments = []
  let style = { bold: false, dim: false, color: '' }
  let last = 0
  let m

  const pushText = (text, s) => {
    if (!text) return
    const cls = [
      s.color,
      s.bold ? 'font-bold' : '',
      s.dim  ? 'opacity-50' : '',
    ].filter(Boolean).join(' ')
    segments.push({ text, cls })
  }

  ANSI_REGEX.lastIndex = 0
  while ((m = ANSI_REGEX.exec(raw)) !== null) {
    pushText(raw.slice(last, m.index), style)
    last = m.index + m[0].length
    const codes = m[1].split(';').map(Number)
    for (const code of codes) {
      if (code === 0)  { style = { bold: false, dim: false, color: '' } }
      else if (code === 1)  style = { ...style, bold: true  }
      else if (code === 2)  style = { ...style, dim: true   }
      else if (code === 22) style = { ...style, bold: false, dim: false }
      else if (FG[code])    style = { ...style, color: FG[code] }
    }
  }
  pushText(raw.slice(last), style)
  return segments
}

export default function TerminalOutput({ lines }) {
  return (
    <>
      {lines.map((line, i) => {
        const segments = parseAnsi(line)
        return (
          <div key={i} className="min-h-[1.2em] whitespace-pre-wrap break-all leading-5">
            {segments.map((seg, j) => (
              <span key={j} className={seg.cls || 'text-gray-200'}>{seg.text}</span>
            ))}
          </div>
        )
      })}
    </>
  )
}
