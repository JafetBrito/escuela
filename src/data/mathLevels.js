// Niveles del juego Mazmorra Matemática
// Cada nivel es un "piso" con un enemigo que lanza preguntas matemáticas.
// ops: operadores disponibles en ese nivel
// min/max: rango de operandos (para ÷, son los factores, la respuesta siempre es exacta)
// timeSecs: segundos por pregunta
// starsAt: [correct] necesarios para 1/2/3 estrellas

export const MATH_LEVELS = [
  {
    id: 1,
    floor: 'Piso 1',
    title: 'El Slime de Suma',
    enemy: { emoji: '🟢', name: 'Slime', color: '#22c55e', bg: '#052e16' },
    ops: ['+'],
    min: 1, max: 10,
    questions: 8,
    timeSecs: 12,
    starsAt: [5, 7, 8],
    coins: 80,  xp: 15,
  },
  {
    id: 2,
    floor: 'Piso 2',
    title: 'El Murciélago Restón',
    enemy: { emoji: '🦇', name: 'Murciélago', color: '#a78bfa', bg: '#1e1b4b' },
    ops: ['-'],
    min: 2, max: 25,
    questions: 8,
    timeSecs: 12,
    starsAt: [5, 7, 8],
    coins: 100, xp: 20,
  },
  {
    id: 3,
    floor: 'Piso 3',
    title: 'El Goblin Multiplicador',
    enemy: { emoji: '👺', name: 'Goblin', color: '#fb923c', bg: '#431407' },
    ops: ['×'],
    min: 1, max: 5,
    questions: 10,
    timeSecs: 10,
    starsAt: [6, 8, 10],
    coins: 130, xp: 25,
  },
  {
    id: 4,
    floor: 'Piso 4',
    title: 'El Troll Mezclado',
    enemy: { emoji: '🧌', name: 'Troll', color: '#ef4444', bg: '#1c0202' },
    ops: ['+', '-'],
    min: 5, max: 50,
    questions: 10,
    timeSecs: 10,
    starsAt: [6, 8, 10],
    coins: 160, xp: 30,
  },
  {
    id: 5,
    floor: 'Piso 5',
    title: 'El Dragón de las Tablas',
    enemy: { emoji: '🐉', name: 'Dragón', color: '#facc15', bg: '#1a1400' },
    ops: ['×'],
    min: 6, max: 12,
    questions: 10,
    timeSecs: 12,
    starsAt: [6, 8, 10],
    coins: 200, xp: 40,
  },
  {
    id: 6,
    floor: 'Piso 6',
    title: 'El Caballero Divisor',
    enemy: { emoji: '🗡️', name: 'Caballero Oscuro', color: '#94a3b8', bg: '#0f172a' },
    ops: ['÷'],
    min: 1, max: 12,
    questions: 10,
    timeSecs: 15,
    starsAt: [6, 8, 10],
    coins: 250, xp: 50,
  },
]

export function getLevelById(id) {
  return MATH_LEVELS.find((l) => l.id === id)
}

// Devuelve las estrellas (0-3) ganadas dado el número de aciertos
export function calcStars(level, correct) {
  const [s1, s2, s3] = level.starsAt
  if (correct >= s3) return 3
  if (correct >= s2) return 2
  if (correct >= s1) return 1
  return 0
}
