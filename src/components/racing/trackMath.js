// Matemática pura de la pista (sin three, para poder usarla en el motor y probarla con node): línea central que serpentea y un
// perfil de altura con BAJADAS y SUBIDAS (la pendiente cambia de signo), así que el vehículo gana velocidad cuesta abajo y la
// pierde cuesta arriba. La pista corre hacia -Z; `s` = distancia a lo largo, `u` = posición lateral (+ = derecha).
export const SLOPE = 0.07 // caída media (m por m); las ondas la superan en las subidas
export const centerX = (s) => 20 * Math.sin(s / 95) + 9 * Math.sin(s / 41 + 1.3)
export const dX = (s) => (20 / 95) * Math.cos(s / 95) + (9 / 41) * Math.cos(s / 41 + 1.3)
export const centerY = (s) => -s * SLOPE + 11 * Math.sin(s / 190) + 5 * Math.sin(s / 67 + 2)
// dy/ds: negativo = bajando, positivo = subiendo
export const slopeAt = (s) => -SLOPE + (11 / 190) * Math.cos(s / 190) + (5 / 67) * Math.cos(s / 67 + 2)
export const yawAt = (s) => -Math.atan(dX(s)) // giro sobre Y: el frente del modelo es -Z
export const pitchAt = (s) => Math.atan(slopeAt(s)) // cabeceo del vehículo siguiendo la pendiente

// Relieve del terreno junto a la pista: plano cerca del asfalto (|u| < 14) y con lomas cada vez más altas hacia los lados (0 en la pista).
const sm = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t) }
export const bumpAt = (s, u) => {
  const a = Math.abs(u), k = sm(14, 60, a)
  if (k <= 0) return 0
  return k * (5 + 4 * Math.sin(s / 71 + u * 0.031) + 3 * Math.sin(s / 29 - u * 0.047) + 2.5 * Math.sin(s / 143 + a * 0.02)) + sm(90, 300, a) * (a - 80) * 0.22
}
