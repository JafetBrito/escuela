// Anillo de progreso circular reutilizable — mismo dato que una barra lineal
// (pct 0-100), dibujado como stroke-dasharray sobre un <circle>. El centro
// muestra `children` si se pasa (ej. "Nv 12" en un anillo de nivel), o el
// porcentaje de siempre si no. Extraído de ProgressPage.jsx para reusarlo en
// el hero del Dashboard.
export default function ProgressRing({ pct, accent, size = 68, stroke = 7, children }) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const offset = c * (1 - Math.min(Math.max(pct, 0), 100) / 100)
  const center = size / 2
  return (
    <svg width={size} height={size} className="shrink-0">
      <circle cx={center} cy={center} r={r} fill="none" stroke="var(--color-border)" strokeWidth={stroke} />
      <circle
        cx={center} cy={center} r={r} fill="none" stroke={accent} strokeWidth={stroke}
        strokeDasharray={c} strokeDashoffset={offset} strokeLinecap="round"
        transform={`rotate(-90 ${center} ${center})`}
        style={{ transition: 'stroke-dashoffset .6s ease' }}
      />
      <text x={center} y={center} textAnchor="middle" dominantBaseline="central"
        className="fill-current text-text text-[13px] font-black">
        {children ?? `${pct}%`}
      </text>
    </svg>
  )
}
