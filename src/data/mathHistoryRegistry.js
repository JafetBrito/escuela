// Registro de "eras" para el juego Historia de las Matemáticas — un mapa
// cronológico donde cada civilización desbloquea sus propias misiones.
// Solo Egipto tiene misiones jugables por ahora (v1); el resto queda
// visible en el mapa como "próximamente" para que se note el plan completo,
// y agregar una era nueva después es solo añadir un objeto aquí + sus
// misiones — no tocar el motor del juego (MathHistoryGame.jsx).
//
// Cada misión tiene un `lesson` (texto que se lee ANTES del reto, con TTS —
// ver speakLine en MathHistoryGame.jsx) para enseñar el concepto con calma
// antes de poner al jugador a resolverlo, en vez de lanzarlo directo al reto.

export const EGYPT_FRACTIONS = [
  { fraction: '3/4', correct: '1/2 + 1/4', options: ['1/2 + 1/4', '1/3 + 1/4', '1/2 + 1/3', '1/4 + 1/4'] },
  { fraction: '2/3', correct: '1/2 + 1/6', options: ['1/2 + 1/6', '1/3 + 1/3', '1/2 + 1/3', '1/4 + 1/6'] },
  { fraction: '5/6', correct: '1/2 + 1/3', options: ['1/2 + 1/3', '1/2 + 1/4', '1/3 + 1/3', '2/3 + 1/6'] },
  { fraction: '3/5', correct: '1/2 + 1/10', options: ['1/2 + 1/10', '1/3 + 1/5', '1/2 + 1/5', '1/3 + 1/10'] },
  { fraction: '5/8', correct: '1/2 + 1/8', options: ['1/2 + 1/8', '1/4 + 1/4', '1/2 + 1/4', '1/3 + 1/8'] },
  { fraction: '7/8', correct: '1/2 + 1/4 + 1/8', options: ['1/2 + 1/4 + 1/8', '1/2 + 1/8 + 1/8', '1/4 + 1/4 + 1/4', '1/2 + 1/3 + 1/8'] },
  { fraction: '2/5', correct: '1/3 + 1/15', options: ['1/3 + 1/15', '1/2 + 1/10', '1/4 + 1/5', '1/3 + 1/5'] },
  { fraction: '3/8', correct: '1/4 + 1/8', options: ['1/4 + 1/8', '1/2 + 1/8', '1/3 + 1/8', '1/4 + 1/4'] },
]

// Símbolos numéricos egipcios reales, aproximados con emoji para que se
// rendericen en cualquier dispositivo (los glifos jeroglíficos Unicode reales
// no tienen soporte de fuente confiable). El nombre real va en la leyenda.
export const EGYPT_NUMERALS = [
  { value: 1, symbol: '𓏺', name: 'Palito (trazo simple)' },
  { value: 10, symbol: '𓎆', name: 'Asa / hueso de talón' },
  { value: 100, symbol: '𓍢', name: 'Cuerda enrollada' },
]

function egyptianBreakdown(n) {
  const hundreds = Math.floor(n / 100)
  const tens = Math.floor((n % 100) / 10)
  const ones = n % 10
  return [
    ...Array(hundreds).fill(EGYPT_NUMERALS[2].symbol),
    ...Array(tens).fill(EGYPT_NUMERALS[1].symbol),
    ...Array(ones).fill(EGYPT_NUMERALS[0].symbol),
  ]
}

// `round` controla la dificultad: las primeras rondas solo usan 1 y 10 (números
// chicos, 2-30) para practicar el patrón antes de meter el símbolo de 100 —
// ir con calma en vez de arrancar directo con números de 3 cifras.
export function generateEgyptianNumeralProblem(round = 0) {
  const easy = round < 3
  const n = easy ? rand(2, 30) : rand(12, 299)
  const symbols = egyptianBreakdown(n)
  const opts = new Set([n])
  while (opts.size < 4) {
    const delta = rand(-10, 10)
    const w = n + (delta === 0 ? 5 : delta)
    if (w > 0) opts.add(w)
  }
  return { symbols, answer: n, options: [...opts].sort(() => Math.random() - 0.5) }
}

function rand(a, b) { return Math.floor(Math.random() * (b - a + 1)) + a }

export const MATH_ERAS = [
  {
    id: 'egipto',
    name: 'Antiguo Egipto',
    years: '3000 a.C. — 300 a.C.',
    icon: '🏺',
    color: '#e0b64d',
    bg: '#2a1f05',
    unlocked: true,
    intro: [
      'Hace más de 5000 años, a orillas del río Nilo, los egipcios necesitaban contar cosechas, cobrar impuestos y construir las pirámides con una precisión asombrosa.',
      'Sabemos cómo pensaban gracias al Papiro de Rhind, un documento de hace 3600 años copiado por un escriba llamado Ahmes — es uno de los libros de matemáticas más antiguos que existen.',
      'Los egipcios inventaron su propio sistema de numerales — sin ceros ni columnas como el nuestro, pero capaz de representar cualquier cantidad repitiendo símbolos.',
      'También horneaban pan y fermentaban cerveza todos los días, y tenían que repartirlos en partes exactamente iguales entre los trabajadores. De ahí nació su forma tan particular de usar las fracciones.',
      'Prepárate para pensar como un escriba egipcio. Primero aprenderás cada idea con calma, y luego la pondrás a prueba.',
    ],
    missions: [
      {
        id: 'numerales',
        title: 'Numerales Jeroglíficos',
        icon: '𓏺',
        description: 'Aprende y luego lee cantidades escritas con símbolos egipcios reales.',
        lesson: [
          'Los egipcios no tenían el cero, ni columnas de unidades y decenas como nosotros. En su lugar, dibujaban un símbolo distinto para cada "escalón": uno para el 1, otro para el 10, y otro para el 100.',
          'Para escribir un número, simplemente dibujaban el símbolo las veces que hiciera falta. Por ejemplo, el 23 se escribía con dos símbolos de "10" y tres símbolos de "1".',
          'No importaba el orden en que los dibujaras — a diferencia de nuestro sistema, donde la posición de cada dígito cambia su valor, para los egipcios un símbolo siempre valía lo mismo, estuviera donde estuviera.',
          'Con este sistema tan simple construyeron las pirámides, cobraron impuestos y llevaron la contabilidad de todo un imperio, símbolo a símbolo. Ahora es tu turno de leerlos.',
        ],
      },
      {
        id: 'fracciones',
        title: 'Fracciones del Ojo de Horus',
        icon: '𓁹',
        description: 'Aprende y luego descompón fracciones como lo hacían los escribas del Nilo.',
        lesson: [
          'Los egipcios horneaban pan y fermentaban cerveza todos los días, y debían repartirlos en partes exactamente iguales entre los trabajadores de una obra o un templo.',
          'Para repartir con justicia, solo usaban "fracciones unitarias": fracciones con un 1 arriba, como 1/2, 1/3 o 1/4. Nunca escribían directamente algo como 3/4.',
          'Si querían repartir 3/4 de un pan, lo pensaban en dos pasos: primero la mitad del pan (1/2), y luego un cuarto más (1/4). Es decir: 3/4 = 1/2 + 1/4.',
          'Incluso tenían un símbolo sagrado para las fracciones más comunes: el Ojo de Horus. Cada parte del ojo representaba una fracción distinta — 1/2, 1/4, 1/8, 1/16, 1/32 y 1/64 — y se usaban para medir grano, aceite y otros ingredientes.',
          'Ahora practica tú: te daremos una fracción, y tendrás que encontrar en qué fracciones unitarias la habría partido un escriba egipcio.',
        ],
      },
    ],
    reward: { coins: 260, xp: 60 },
  },
  {
    id: 'mesopotamia',
    name: 'Mesopotamia',
    years: '2000 a.C. — 500 a.C.',
    icon: '📜',
    color: '#8fa6c9',
    bg: '#0e1b2a',
    unlocked: false,
  },
  {
    id: 'grecia',
    name: 'Antigua Grecia',
    years: '600 a.C. — 300 a.C.',
    icon: '🏛️',
    color: '#c9c9d4',
    bg: '#1a1a22',
    unlocked: false,
  },
  {
    id: 'india-arabe',
    name: 'India y el mundo árabe',
    years: '500 — 1200',
    icon: '☪️',
    color: '#7dd3b0',
    bg: '#062018',
    unlocked: false,
  },
  {
    id: 'renacimiento',
    name: 'Renacimiento europeo',
    years: '1400 — 1700',
    icon: '🎨',
    color: '#e07a5f',
    bg: '#2a0f08',
    unlocked: false,
  },
]

export function getEraById(id) {
  return MATH_ERAS.find((e) => e.id === id)
}
