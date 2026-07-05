import { useState } from 'react'
import AppTopBar from '../shared/AppTopBar'
import MascotCompanion from '../mascot/MascotCompanion'
import Calculator from './Calculator'

// ── Formula data ──────────────────────────────────────────────────────────────
const FORMULA_SECTIONS = [
  {
    id: 'matematicas', label: 'Matemáticas', icon: '📐', color: 'from-blue-600 to-blue-400',
    formulas: [
      { name: 'Fórmula cuadrática',       expr: 'x = (-b ± √(b²−4ac)) / 2a',            desc: 'Raíces de ax² + bx + c = 0' },
      { name: 'Teorema de Pitágoras',      expr: 'a² + b² = c²',                          desc: 'Relación entre lados de un triángulo rectángulo' },
      { name: 'Suma de serie aritmética',  expr: 'Sₙ = n(a₁ + aₙ) / 2',                  desc: 'Suma de n términos de una progresión aritmética' },
      { name: 'Suma de serie geométrica',  expr: 'Sₙ = a(1−rⁿ) / (1−r)',                 desc: 'Suma finita con razón r ≠ 1' },
      { name: 'Derivada de potencia',      expr: 'd/dx(xⁿ) = nxⁿ⁻¹',                     desc: 'Regla básica de derivación' },
      { name: 'Integral de potencia',      expr: '∫xⁿ dx = xⁿ⁺¹/(n+1) + C',              desc: 'Para n ≠ −1' },
      { name: 'Logaritmo — cambio de base',expr: 'log_b(x) = log(x) / log(b)',            desc: 'Conversión entre bases' },
      { name: 'Binomio de Newton',         expr: '(a+b)ⁿ = Σ C(n,k)·aⁿ⁻ᵏ·bᵏ',           desc: 'Expansión del binomio elevado a n' },
    ],
  },
  {
    id: 'geometria', label: 'Geometría', icon: '📏', color: 'from-purple-600 to-purple-400',
    formulas: [
      { name: 'Área del círculo',          expr: 'A = πr²',                               desc: 'r = radio' },
      { name: 'Perímetro del círculo',     expr: 'C = 2πr',                               desc: 'Circunferencia' },
      { name: 'Área del triángulo',        expr: 'A = (base × altura) / 2',               desc: 'Fórmula general' },
      { name: 'Volumen de esfera',         expr: 'V = (4/3)πr³',                          desc: 'r = radio' },
      { name: 'Volumen del cilindro',      expr: 'V = πr²h',                              desc: 'r = radio, h = altura' },
      { name: 'Área del trapecio',         expr: 'A = (b₁ + b₂) × h / 2',                desc: 'b₁, b₂ = bases paralelas' },
      { name: 'Ley del coseno',            expr: 'c² = a² + b² − 2ab·cos(C)',             desc: 'Triángulo con ángulo C opuesto a c' },
      { name: 'Ley del seno',             expr: 'a/sin(A) = b/sin(B) = c/sin(C)',         desc: 'Triángulo cualquiera' },
    ],
  },
  {
    id: 'fisica', label: 'Física', icon: '⚡', color: 'from-amber-600 to-amber-400',
    formulas: [
      { name: 'Velocidad media',           expr: 'v = Δx / Δt',                           desc: 'Distancia entre tiempo' },
      { name: 'Cinemática — velocidad',    expr: 'v = v₀ + at',                           desc: 'v₀=velocidad inicial, a=aceleración' },
      { name: 'Cinemática — posición',     expr: 'x = x₀ + v₀t + ½at²',                  desc: 'Movimiento uniformemente acelerado' },
      { name: 'Segunda ley de Newton',     expr: 'F = ma',                                desc: 'Fuerza = masa × aceleración' },
      { name: 'Ley de gravitación',        expr: 'F = G·m₁·m₂ / r²',                     desc: 'G = 6.674×10⁻¹¹ N·m²/kg²' },
      { name: 'Energía cinética',          expr: 'Ec = ½mv²',                             desc: 'm = masa, v = velocidad' },
      { name: 'Energía potencial',         expr: 'Ep = mgh',                              desc: 'g = 9.8 m/s², h = altura' },
      { name: 'Ley de Ohm',               expr: 'V = I × R',                             desc: 'Voltaje = Corriente × Resistencia' },
      { name: 'Potencia eléctrica',        expr: 'P = V × I = I²R = V²/R',               desc: 'Watts, Amperes, Ohms' },
      { name: 'Velocidad de la luz',       expr: 'c = 3×10⁸ m/s',                        desc: 'En el vacío' },
    ],
  },
  {
    id: 'quimica', label: 'Química', icon: '🧪', color: 'from-emerald-600 to-emerald-400',
    formulas: [
      { name: 'Número de moles',           expr: 'n = m / M',                             desc: 'm = masa (g), M = masa molar (g/mol)' },
      { name: 'Ley del gas ideal',         expr: 'PV = nRT',                              desc: 'R = 8.314 J/mol·K' },
      { name: 'Concentración molar',       expr: 'C = n / V',                             desc: 'mol/L (Molar)' },
      { name: 'pH',                        expr: 'pH = −log[H⁺]',                         desc: 'Medida de acidez' },
      { name: 'Constante de Avogadro',     expr: 'Nₐ = 6.022×10²³ mol⁻¹',                desc: 'Partículas por mol' },
      { name: 'Ecuación de Arrhenius',     expr: 'k = A·e^(−Eₐ/RT)',                      desc: 'Velocidad de reacción vs temperatura' },
    ],
  },
  {
    id: 'estadistica', label: 'Estadística', icon: '📊', color: 'from-rose-600 to-rose-400',
    formulas: [
      { name: 'Media aritmética',          expr: 'x̄ = (Σxᵢ) / n',                        desc: 'Promedio de n valores' },
      { name: 'Varianza',                  expr: 'σ² = Σ(xᵢ − x̄)² / n',                  desc: 'Dispersión de los datos' },
      { name: 'Desviación estándar',       expr: 'σ = √(Σ(xᵢ − x̄)² / n)',                desc: 'Raíz de la varianza' },
      { name: 'Probabilidad',             expr: 'P(A) = casos favorables / total',        desc: 'Eventos equiprobables' },
      { name: 'Combinatoria',              expr: 'C(n,k) = n! / (k!(n−k)!)',              desc: '"n choose k"' },
      { name: 'Permutaciones',             expr: 'P(n,k) = n! / (n−k)!',                  desc: 'Ordenaciones de k de n elementos' },
    ],
  },
]

// ── Unit converter ────────────────────────────────────────────────────────────
const CONVERTERS = {
  Longitud: {
    units: ['m', 'km', 'cm', 'mm', 'ft', 'in', 'mi'],
    toBase: { m:1, km:1000, cm:0.01, mm:0.001, ft:0.3048, in:0.0254, mi:1609.344 },
  },
  Masa: {
    units: ['kg', 'g', 'mg', 'lb', 'oz', 't'],
    toBase: { kg:1, g:0.001, mg:0.000001, lb:0.453592, oz:0.0283495, t:1000 },
  },
  Temperatura: { units: ['°C', '°F', 'K'], toBase: null }, // special
  Área: {
    units: ['m²', 'km²', 'cm²', 'ft²', 'acre', 'ha'],
    toBase: { 'm²':1, 'km²':1e6, 'cm²':0.0001, 'ft²':0.092903, acre:4046.86, ha:10000 },
  },
  Velocidad: {
    units: ['m/s', 'km/h', 'mph', 'nudo'],
    toBase: { 'm/s':1, 'km/h':1/3.6, mph:0.44704, nudo:0.514444 },
  },
}

function convertTemp(val, from, to) {
  let celsius
  if (from === '°C') celsius = val
  else if (from === '°F') celsius = (val - 32) * 5/9
  else celsius = val - 273.15
  if (to === '°C') return celsius
  if (to === '°F') return celsius * 9/5 + 32
  return celsius + 273.15
}

function UnitConverter() {
  const [cat, setCat]   = useState('Longitud')
  const [val, setVal]   = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo]     = useState('')

  const conv = CONVERTERS[cat]
  const fromUnit = from || conv.units[0]
  const toUnit   = to   || conv.units[1]

  const result = (() => {
    const n = parseFloat(val)
    if (isNaN(n)) return ''
    if (cat === 'Temperatura') return parseFloat(convertTemp(n, fromUnit, toUnit).toPrecision(8)).toString()
    const base = n * conv.toBase[fromUnit]
    return parseFloat((base / conv.toBase[toUnit]).toPrecision(8)).toString()
  })()

  return (
    <div className="space-y-3">
      {/* Category tabs */}
      <div className="flex flex-wrap gap-1.5">
        {Object.keys(CONVERTERS).map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => { setCat(c); setFrom(''); setTo(''); setVal('') }}
            className={`rounded-lg px-3 py-1 text-xs font-bold transition ${cat === c ? 'bg-primary text-background' : 'bg-surface text-text-muted hover:bg-surface-hover'}`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-bold uppercase text-text-muted/60">Valor</label>
          <input
            type="number"
            value={val}
            onChange={(e) => setVal(e.target.value)}
            placeholder="0"
            className="w-28 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text outline-none focus:border-primary"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-bold uppercase text-text-muted/60">De</label>
          <select value={fromUnit} onChange={(e) => setFrom(e.target.value)} className="rounded-lg border border-border bg-surface px-2 py-2 text-sm text-text">
            {conv.units.map((u) => <option key={u}>{u}</option>)}
          </select>
        </div>
        <span className="pb-2 text-xl text-text-muted">→</span>
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-bold uppercase text-text-muted/60">A</label>
          <select value={toUnit} onChange={(e) => setTo(e.target.value)} className="rounded-lg border border-border bg-surface px-2 py-2 text-sm text-text">
            {conv.units.map((u) => <option key={u}>{u}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1 pb-0.5">
          <label className="text-[10px] font-bold uppercase text-text-muted/60">Resultado</label>
          <div className="min-w-32 rounded-lg border border-primary/30 bg-primary/5 px-3 py-2 font-mono text-sm font-bold text-primary">
            {result || '—'} {toUnit}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function ToolsPage() {
  const [activeTab, setActiveTab] = useState('calculadora')
  const [openSection, setOpenSection] = useState(null)

  const TABS = [
    { id: 'calculadora', label: 'Calculadora', icon: '🔢' },
    { id: 'formulas',    label: 'Fórmulas',    icon: '📐' },
    { id: 'conversor',   label: 'Conversor',   icon: '↔️' },
  ]

  return (
    <div className="flex min-h-screen flex-col bg-background text-text">
      <AppTopBar />

      <main className="flex-1 px-4 py-8 md:px-8">
        <div className="mx-auto max-w-4xl">

          {/* Header */}
          <div className="overflow-hidden rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-500 px-6 py-8 shadow-lg">
            <h1 className="text-3xl font-extrabold text-white drop-shadow-sm">🔧 Herramientas</h1>
            <p className="mt-1 text-sm font-medium text-white/85">
              Calculadora científica, fórmulas de referencia y conversor de unidades — disponibles sin internet.
            </p>
          </div>

          {/* Tabs */}
          <div className="mt-6 flex gap-2 rounded-2xl border border-border bg-surface p-1.5">
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTab(t.id)}
                className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-all ${
                  activeTab === t.id ? 'bg-background text-text shadow-sm' : 'text-text-muted hover:text-text'
                }`}
              >
                <span>{t.icon}</span>
                <span className="hidden sm:inline">{t.label}</span>
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="mt-6">

            {/* ── Calculadora ── */}
            {activeTab === 'calculadora' && (
              <div className="mx-auto max-w-sm rounded-2xl border border-border bg-surface p-4">
                <Calculator />
                <p className="mt-3 text-center text-[10px] text-text-muted/50">
                  Calculadora científica — también disponible como objeto equipable desde la Tienda
                </p>
              </div>
            )}

            {/* ── Fórmulas ── */}
            {activeTab === 'formulas' && (
              <div className="space-y-3">
                {FORMULA_SECTIONS.map((section) => (
                  <div key={section.id} className="rounded-2xl border border-border bg-surface overflow-hidden">
                    {/* Section header */}
                    <button
                      type="button"
                      onClick={() => setOpenSection(openSection === section.id ? null : section.id)}
                      className={`flex w-full items-center justify-between gap-3 bg-gradient-to-r ${section.color} px-5 py-4`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{section.icon}</span>
                        <span className="font-extrabold text-white">{section.label}</span>
                        <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs font-bold text-white">
                          {section.formulas.length}
                        </span>
                      </div>
                      <span className="text-white">{openSection === section.id ? '▲' : '▼'}</span>
                    </button>

                    {/* Formulas grid */}
                    {openSection === section.id && (
                      <div className="grid gap-px bg-border sm:grid-cols-2">
                        {section.formulas.map((f, i) => (
                          <div key={i} className="bg-surface p-4">
                            <p className="text-xs font-bold text-text-muted">{f.name}</p>
                            <p className="mt-1 font-mono text-base font-bold text-primary">{f.expr}</p>
                            <p className="mt-0.5 text-xs text-text-muted/70">{f.desc}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* ── Conversor ── */}
            {activeTab === 'conversor' && (
              <div className="rounded-2xl border border-border bg-surface p-5">
                <h2 className="mb-4 text-sm font-black uppercase tracking-widest text-text-muted/60">Conversor de unidades</h2>
                <UnitConverter />
              </div>
            )}
          </div>
        </div>
      </main>

      <MascotCompanion />
    </div>
  )
}
