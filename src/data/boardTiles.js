// ── Board layout: 24 tiles in an oval ────────────────────────────────────────
export const TILE_COUNT = 24

export const TILE_POSITIONS = Array.from({ length: TILE_COUNT }, (_, i) => {
  const angle = (i / TILE_COUNT) * Math.PI * 2 - Math.PI / 2
  return [Math.cos(angle) * 4.5, 0, Math.sin(angle) * 3.1]
})

export const TILE_META = {
  start:    { label: '🏁', name: 'Inicio',    color: '#f59e0b', emissive: '#b45309' },
  safe:     { label: '⭐', name: 'Descanso',  color: '#22c55e', emissive: '#15803d' },
  question: { label: '❓', name: 'Pregunta',  color: '#3b82f6', emissive: '#1d4ed8' },
  reward:   { label: '🎁', name: 'Premio',    color: '#a855f7', emissive: '#7e22ce' },
  trap:     { label: '💀', name: 'Trampa',    color: '#ef4444', emissive: '#991b1b' },
  battle:   { label: '⚔️', name: 'Batalla',   color: '#f97316', emissive: '#c2410c' },
}

const SEQ = [
  'start', 'question', 'safe', 'question', 'reward', 'question',
  'trap', 'question', 'question', 'reward', 'question', 'battle',
  'safe', 'question', 'reward', 'question', 'trap', 'question',
  'battle', 'question', 'reward', 'question', 'safe', 'question',
]

export const TILES = SEQ.map((type, id) => ({ id, type, ...TILE_META[type] }))

// ── Questions ─────────────────────────────────────────────────────────────────
const QUESTIONS = [
  { q: '¿Qué significa HTML?', opts: ['HyperText Markup Language', 'High-Tech Modern Language', 'HyperText Machine Learning', 'Home Tool Markup Language'], a: 0 },
  { q: '¿Cuál es el lenguaje más usado para IA/ML?', opts: ['Java', 'C++', 'Python', 'Rust'], a: 2 },
  { q: '¿Qué es una API?', opts: ['Un tipo de virus', 'Interfaz de programación de aplicaciones', 'Un lenguaje de programación', 'Una base de datos'], a: 1 },
  { q: '¿Qué es Git?', opts: ['Un editor de código', 'Sistema de control de versiones', 'Un lenguaje de programación', 'Un framework web'], a: 1 },
  { q: '¿Qué significa CSS?', opts: ['Computer Style Sheets', 'Cascading Style Sheets', 'Creative Style System', 'Code Style Script'], a: 1 },
  { q: '¿Cuál es la función de un servidor web?', opts: ['Guardar música', 'Servir páginas y datos a clientes', 'Diseñar interfaces', 'Compilar código'], a: 1 },
  { q: '¿Qué es SQL?', opts: ['Super Quick Language', 'Structured Query Language', 'Simple Question Loop', 'System Queue Logic'], a: 1 },
  { q: '¿Qué hace el operador === en JavaScript?', opts: ['Asigna valor', 'Compara valor y tipo sin conversión', 'Suma tres valores', 'Compara solo valor'], a: 1 },
  { q: '¿Qué es un algoritmo?', opts: ['Una fórmula matemática', 'Pasos para resolver un problema', 'Un tipo de hardware', 'Un lenguaje de marcado'], a: 1 },
  { q: '¿Qué es React?', opts: ['Un juego de video', 'Librería JS para interfaces de usuario', 'Un sistema operativo', 'Un protocolo de red'], a: 1 },
  { q: '¿Cuál es la complejidad de buscar en un hash map?', opts: ['O(n)', 'O(log n)', 'O(1)', 'O(n²)'], a: 2 },
  { q: '¿Qué es la inteligencia artificial?', opts: ['Un robot físico', 'Simulación de inteligencia humana en máquinas', 'Solo un chatbot', 'Una red social'], a: 1 },
  { q: '¿Qué es un loop/bucle en programación?', opts: ['Una función matemática', 'Repetir código un número de veces', 'Un tipo de variable', 'Un error de código'], a: 1 },
  { q: '¿Para qué sirve npm?', opts: ['Editar imágenes', 'Gestionar paquetes de Node.js', 'Crear bases de datos', 'Configurar redes'], a: 1 },
  { q: '¿Qué es un componente en React?', opts: ['Una clase de Java', 'Pieza reutilizable de UI', 'Una función matemática', 'Un archivo de estilos'], a: 1 },
]

export function pickQuestion() {
  return QUESTIONS[Math.floor(Math.random() * QUESTIONS.length)]
}

const BATTLES = [
  { q: '¡Rapidez! ¿Cuánto es 15 × 8?', opts: ['110', '120', '125', '130'], a: 1 },
  { q: 'Si A > B y B > C, ¿quién es el menor?', opts: ['A', 'B', 'C', 'Son iguales'], a: 2 },
  { q: '¿Cuántas vocales tiene "programación"?', opts: ['4', '5', '6', '3'], a: 1 },
  { q: '¿Cuál es la raíz cuadrada de 144?', opts: ['10', '12', '14', '16'], a: 1 },
]

export function pickBattle() {
  return BATTLES[Math.floor(Math.random() * BATTLES.length)]
}
