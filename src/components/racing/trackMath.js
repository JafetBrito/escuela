// Matemática pura de la pista (sin three, para poder usarla en el motor y probarla con node). La pista se describe con el RUMBO `yaw(s)`
// (hacia dónde mira el camino) y la altura `y(s)` según la distancia recorrida `s`; de ahí salen la posición (x, z) integrando el rumbo,
// así que la pista puede girar a izquierda y derecha de verdad (no solo avanzar recto). Hay varias PISTAS (`TRACKS`): se elige una con
// `setTrack(id)` antes de crear la carrera. `u` = posición lateral (+ = derecha). El vehículo gana velocidad cuesta abajo y la pierde cuesta arriba.
export const SLOPE = 0.07 // caída media de la pista clásica (m por m)
const dXc = (s) => (20 / 95) * Math.cos(s / 95) + (9 / 41) * Math.cos(s / 41 + 1.3)

// Cada pista: nombre, rumbo (rad; 0 = recto hacia -Z), altura y su derivada. Mantén el radio de curva por encima de ~350 m (rumbo'(s) < 0.003):
// el terreno se extiende 350 m a cada lado y se doblaría sobre sí mismo en curvas más cerradas.
export const TRACKS = {
  classic: {
    name: 'Clásica', blurb: 'Curvas suaves y subidas y bajadas', analytic: true, // la original: x(s) con z = -s
    x: (s) => 20 * Math.sin(s / 95) + 9 * Math.sin(s / 41 + 1.3), yaw: (s) => -Math.atan(dXc(s)),
    y: (s) => -s * SLOPE + 11 * Math.sin(s / 190) + 5 * Math.sin(s / 67 + 2), dy: (s) => -SLOPE + (11 / 190) * Math.cos(s / 190) + (5 / 67) * Math.cos(s / 67 + 2),
  },
  serpiente: {
    name: 'Serpiente', blurb: 'Curvas amplias a izquierda y derecha: la pista cambia de dirección',
    yaw: (s) => 1.3 * Math.sin(s / 560) + 0.12 * Math.sin(s / 150),
    y: (s) => -s * 0.05 + 9 * Math.sin(s / 210) + 4 * Math.sin(s / 77 + 1), dy: (s) => -0.05 + (9 / 210) * Math.cos(s / 210) + (4 / 77) * Math.cos(s / 77 + 1),
  },
  montana: {
    name: 'Montaña rusa', blurb: 'Subidas y bajadas enormes: ganas velocidad en cada caída',
    yaw: (s) => 0.55 * Math.sin(s / 700) + 0.12 * Math.sin(s / 210),
    y: (s) => -s * 0.04 + 34 * Math.sin(s / 330) + 8 * Math.sin(s / 95 + 2), dy: (s) => -0.04 + (34 / 330) * Math.cos(s / 330) + (8 / 95) * Math.cos(s / 95 + 2),
  },
  espiral: {
    name: 'Gran curva', blurb: 'Una curva larguísima hacia un lado y luego hacia el otro',
    yaw: (s) => 1.45 * Math.sin(s / 1700) + 0.1 * Math.sin(s / 260),
    y: (s) => -s * 0.06 + 6 * Math.sin(s / 140), dy: (s) => -0.06 + (6 / 140) * Math.cos(s / 140),
  },
}
export const TRACK_LIST = Object.keys(TRACKS)

const STEP = 2, S0 = -300, S1 = 22000
let cur = TRACKS.classic, curId = 'classic', tx = null, tz = null // tablas de la posición (se integra el rumbo cada 2 m)
export function setTrack(id) {
  if (!TRACKS[id]) id = 'classic'
  cur = TRACKS[id]; curId = id; tx = tz = null
  if (cur.analytic) return
  const n = Math.ceil((S1 - S0) / STEP) + 1
  tx = new Float64Array(n); tz = new Float64Array(n)
  for (let i = 1; i < n; i++) {
    const s = S0 + (i - 0.5) * STEP, yw = cur.yaw(s) // punto medio
    tx[i] = tx[i - 1] - Math.sin(yw) * STEP; tz[i] = tz[i - 1] - Math.cos(yw) * STEP
  }
  const k = Math.round(-S0 / STEP), x0 = tx[k], z0 = tz[k] // que en s = 0 la pista pase por el origen
  for (let i = 0; i < n; i++) { tx[i] -= x0; tz[i] -= z0 }
}
export const currentTrack = () => curId
const lerpT = (t, s) => { const f = Math.max(0, Math.min(t.length - 1.001, (s - S0) / STEP)), i = Math.floor(f); return t[i] + (t[i + 1] - t[i]) * (f - i) }

export const centerX = (s) => (tx ? lerpT(tx, s) : cur.x(s))
export const centerZ = (s) => (tz ? lerpT(tz, s) : -s)
export const centerY = (s) => cur.y(s)
// dy/ds: negativo = bajando, positivo = subiendo
export const slopeAt = (s) => cur.dy(s)
export const yawAt = (s) => cur.yaw(s) // giro sobre Y: el frente del modelo es -Z
export const pitchAt = (s) => Math.atan(slopeAt(s)) // cabeceo del vehículo siguiendo la pendiente

// Relieve del terreno junto a la pista: plano cerca del asfalto (|u| < 14) y con lomas cada vez más altas hacia los lados (0 en la pista).
const sm = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t) }
export const bumpAt = (s, u) => {
  const a = Math.abs(u), k = sm(14, 60, a)
  if (k <= 0) return 0
  return k * (5 + 4 * Math.sin(s / 71 + u * 0.031) + 3 * Math.sin(s / 29 - u * 0.047) + 2.5 * Math.sin(s / 143 + a * 0.02)) + sm(90, 300, a) * (a - 80) * 0.22
}

// Contorno de una pista vista desde arriba para dibujar su tarjeta en el menú: [{x, y}] (y crece hacia delante). No cambia la pista activa.
export function trackOutline(id, length = 14000, n = 80) {
  const t = TRACKS[id] || TRACKS.classic, pts = []
  if (t.analytic) { for (let i = 0; i <= n; i++) { const s = (length * i) / n; pts.push({ x: t.x(s), y: s }) } return pts }
  let x = 0, z = 0; const step = length / n / 4
  for (let i = 0; i <= n; i++) {
    pts.push({ x, y: -z })
    for (let k = 0; k < 4; k++) { const yw = t.yaw((i * 4 + k + 0.5) * step); x -= Math.sin(yw) * step; z -= Math.cos(yw) * step }
  }
  return pts
}
