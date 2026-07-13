// Categorías del juego Mazmorra Matemática. Cada categoría (suma, resta...)
// tiene su propia lista de niveles ("pisos"), empezando en 2 por categoría —
// agregar un piso 3 más adelante es solo añadir un objeto al array `levels`
// de la categoría correspondiente, el motor del juego no cambia.
// ops: operadores disponibles en ese nivel ('+', '-', '×', '÷', 'frac', '%')
// min/max: rango de operandos (para ÷, son los factores; para 'frac', el
//          rango del denominador; no se usa para '%', ver pctValues)
// pctValues: valores de porcentaje posibles, solo para ops:['%']
// timeSecs: segundos por pregunta · starsAt: [correct] para 1/2/3 estrellas

export const MATH_CATEGORIES = [
  {
    id: 'suma',
    title: 'Suma',
    icon: '➕',
    color: '#22c55e',
    bg: '#052e16',
    levels: [
      {
        id: 'suma-1',
        title: 'Nivel 1: El Slime de Suma',
        enemy: { emoji: '🟢', name: 'Slime', color: '#22c55e', bg: '#052e16' },
        ops: ['+'], min: 1, max: 10, questions: 8, timeSecs: 12, starsAt: [5, 7, 8],
        coins: 80, xp: 15,
        fact: 'El signo + viene del latín "et" (y) — los escribas medievales lo fueron simplificando en su escritura a mano hasta dejarlo en una cruz.',
      },
      {
        id: 'suma-2',
        title: 'Nivel 2: El Slime Ancestral',
        enemy: { emoji: '🟩', name: 'Slime Ancestral', color: '#16a34a', bg: '#03210f' },
        ops: ['+'], min: 10, max: 60, questions: 10, timeSecs: 10, starsAt: [6, 8, 10],
        coins: 140, xp: 28,
        fact: 'Los romanos sumaban con un ábaco (un tablero con fichas) porque sus numerales (I, V, X, L, C...) eran muy difíciles de sumar en columnas.',
      },
    ],
  },
  {
    id: 'resta',
    title: 'Resta',
    icon: '➖',
    color: '#a78bfa',
    bg: '#1e1b4b',
    levels: [
      {
        id: 'resta-1',
        title: 'Nivel 1: El Murciélago Restón',
        enemy: { emoji: '🦇', name: 'Murciélago', color: '#a78bfa', bg: '#1e1b4b' },
        ops: ['-'], min: 2, max: 25, questions: 8, timeSecs: 12, starsAt: [5, 7, 8],
        coins: 100, xp: 20,
        fact: 'El signo − apareció junto al + en libros de comercio alemanes del siglo XV, para marcar cajas con menos peso del esperado.',
      },
      {
        id: 'resta-2',
        title: 'Nivel 2: El Murciélago Nocturno',
        enemy: { emoji: '🦉', name: 'Murciélago Nocturno', color: '#8b5cf6', bg: '#150f36' },
        ops: ['-'], min: 20, max: 99, questions: 10, timeSecs: 10, starsAt: [6, 8, 10],
        coins: 160, xp: 32,
        fact: 'Los números negativos tardaron siglos en ser aceptados — hasta el siglo XVII, muchos matemáticos europeos los llamaban "números absurdos".',
      },
    ],
  },
  {
    id: 'multiplicacion',
    title: 'Multiplicación',
    icon: '✖️',
    color: '#fb923c',
    bg: '#431407',
    levels: [
      {
        id: 'multiplicacion-1',
        title: 'Nivel 1: El Goblin Multiplicador',
        enemy: { emoji: '👺', name: 'Goblin', color: '#fb923c', bg: '#431407' },
        ops: ['×'], min: 1, max: 5, questions: 10, timeSecs: 10, starsAt: [6, 8, 10],
        coins: 130, xp: 25,
        fact: 'Los babilonios ya grababan tablas de multiplicar en tablillas de arcilla hace más de 4000 años.',
      },
      {
        id: 'multiplicacion-2',
        title: 'Nivel 2: El Dragón de las Tablas',
        enemy: { emoji: '🐉', name: 'Dragón', color: '#facc15', bg: '#1a1400' },
        ops: ['×'], min: 6, max: 12, questions: 10, timeSecs: 12, starsAt: [6, 8, 10],
        coins: 200, xp: 40,
        fact: 'Las tablas de multiplicar del 1 al 10 ya aparecen descritas en los "Elementos" de Euclides, uno de los libros de matemáticas más influyentes de la historia.',
      },
    ],
  },
  {
    id: 'division',
    title: 'División',
    icon: '➗',
    color: '#94a3b8',
    bg: '#0f172a',
    levels: [
      {
        id: 'division-1',
        title: 'Nivel 1: El Caballero Divisor',
        enemy: { emoji: '🗡️', name: 'Caballero Oscuro', color: '#94a3b8', bg: '#0f172a' },
        ops: ['÷'], min: 1, max: 12, questions: 10, timeSecs: 15, starsAt: [6, 8, 10],
        coins: 250, xp: 50,
        fact: 'El símbolo ÷ (el "obelus") se usó por primera vez para representar la división en 1659, en un libro del matemático suizo Johann Rahn.',
      },
      {
        id: 'division-2',
        title: 'Nivel 2: El Nigromante Divisor',
        enemy: { emoji: '☠️', name: 'Nigromante', color: '#64748b', bg: '#0b1220' },
        ops: ['÷'], min: 10, max: 20, questions: 10, timeSecs: 15, starsAt: [6, 8, 10],
        coins: 300, xp: 55,
        fact: 'La "división larga" que usas hoy se popularizó en Europa gracias a un método indio llamado "galera", porque el resultado en el papel parecía la forma de un barco.',
      },
    ],
  },
  {
    id: 'fracciones',
    title: 'Fracciones',
    icon: '🍞',
    color: '#c9a86a',
    bg: '#2a1f0d',
    levels: [
      {
        id: 'fracciones-1',
        title: 'Nivel 1: La Momia de las Fracciones',
        enemy: { emoji: '🧟', name: 'Momia', color: '#c9a86a', bg: '#2a1f0d' },
        ops: ['frac'], min: 4, max: 9, questions: 8, timeSecs: 16, starsAt: [5, 7, 8],
        coins: 220, xp: 45,
        fact: 'Los egipcios inventaron las fracciones para repartir el pan y la cerveza en partes exactamente iguales entre los trabajadores.',
      },
      {
        id: 'fracciones-2',
        title: 'Nivel 2: La Momia del Ojo de Horus',
        enemy: { emoji: '𓁹', name: 'Guardián del Ojo de Horus', color: '#d4a94e', bg: '#241a08' },
        ops: ['frac'], min: 8, max: 14, questions: 10, timeSecs: 18, starsAt: [6, 8, 10],
        coins: 280, xp: 55,
        fact: 'El "Ojo de Horus" egipcio representaba las fracciones 1/2, 1/4, 1/8, 1/16, 1/32 y 1/64 — cada parte del ojo era una fracción, usadas para medir grano.',
      },
    ],
  },
  {
    id: 'porcentajes',
    title: 'Porcentajes',
    icon: '%',
    color: '#e5c07b',
    bg: '#241c05',
    levels: [
      {
        id: 'porcentajes-1',
        title: 'Nivel 1: La Esfinge de los Porcentajes',
        enemy: { emoji: '🐈‍⬛', name: 'Esfinge', color: '#e5c07b', bg: '#241c05' },
        ops: ['%'], pctValues: [10, 20, 25, 50, 75], questions: 8, timeSecs: 12, starsAt: [5, 7, 8],
        coins: 240, xp: 50,
        fact: 'El símbolo % viene de una abreviatura italiana de "per cento" ("por ciento") usada desde el siglo XV en libros de comercio.',
      },
      {
        id: 'porcentajes-2',
        title: 'Nivel 2: La Esfinge Milenaria',
        enemy: { emoji: '🏜️', name: 'Esfinge Milenaria', color: '#d4a94e', bg: '#1c1503' },
        ops: ['%'], pctValues: [5, 15, 30, 40, 60, 90], questions: 10, timeSecs: 12, starsAt: [6, 8, 10],
        coins: 300, xp: 60,
        fact: 'Los porcentajes se volvieron populares con los bancos italianos del Renacimiento, que los usaban para calcular intereses y ganancias del comercio.',
      },
    ],
  },
  {
    id: 'mixto',
    title: 'Mixto',
    icon: '🔀',
    color: '#60a5fa',
    bg: '#0b1a33',
    levels: [
      {
        id: 'mixto-1',
        title: 'Nivel 1: El Titán de los Números',
        enemy: { emoji: '⚡', name: 'Titán', color: '#60a5fa', bg: '#0b1a33' },
        ops: ['+', '-', '×', '÷'], min: 10, max: 99, questions: 12, timeSecs: 10, starsAt: [7, 10, 12],
        coins: 280, xp: 60,
        fact: 'Los babilonios calculaban en base 60 (sexagesimal) — por eso una hora tiene 60 minutos y un círculo, 360°.',
      },
      {
        id: 'mixto-2',
        title: 'Nivel 2: El Archimago Infinito',
        enemy: { emoji: '🐲', name: 'Archimago', color: '#f472b6', bg: '#2b0a1f' },
        ops: ['+', '-', '×', '÷', 'frac', '%'], min: 5, max: 40, questions: 12, timeSecs: 12, starsAt: [7, 10, 12],
        coins: 350, xp: 80,
        fact: 'Antes de las calculadoras, se usaban ábacos y tablas de logaritmos para resolver cuentas grandes a mano.',
      },
    ],
  },
]

export function getCategoryById(id) {
  return MATH_CATEGORIES.find((c) => c.id === id)
}

// Devuelve las estrellas (0-3) ganadas dado el número de aciertos
export function calcStars(level, correct) {
  const [s1, s2, s3] = level.starsAt
  if (correct >= s3) return 3
  if (correct >= s2) return 2
  if (correct >= s1) return 1
  return 0
}
