import { ITEM_RARITY } from './itemsRegistry'

// Generates a random flavor stat for items whose characteristics are rolled
// when the catalog is created (e.g. "Sabiduría +14"). Purely cosmetic.
function randomStat(label, min, max, suffix = '') {
  const value = Math.floor(Math.random() * (max - min + 1)) + min
  return { label, value: `+${value}${suffix}` }
}

// Cosmetic/temáticos objetos comprables con monedas en la Tienda. Precios en
// cobre, al estilo World of Warcraft: 100 cobre = 1 plata, 100 plata = 1 oro
// (10000 cobre = 1 oro).
// Categorías de la Tienda: agrupan las tarjetas en secciones (igual que la
// Biblioteca agrupa libros). "prompt" son personalidades de IA bloqueadas
// hasta que se compran; una vez compradas se pueden activar desde Ajustes.
export const SHOP_CATEGORIES = {
  cosmeticos: { label: 'Cosméticos', icon: '✨' },
  objetos: { label: 'Objetos interactivos', icon: '🧰' },
  prompts: { label: 'Personalidades de IA', icon: '🧠' },
}

export const SHOP_ITEMS = [
  {
    id: 'gafas-sol',
    name: 'Gafas de Sol',
    icon: '🕶️',
    rarity: 'common',
    category: 'cosmeticos',
    price: 1200,
    description: 'Un accesorio cool para tu mascota. Puro estilo, sin función especial.',
  },
  {
    id: 'sombrero-mago',
    name: 'Sombrero de Mago',
    icon: '🧙',
    rarity: 'rare',
    category: 'cosmeticos',
    price: 4800,
    description: 'Convierte a tu mascota en una sabia hechicera del conocimiento.',
  },
  {
    id: 'capa-heroe',
    name: 'Capa de Héroe',
    icon: '🦸',
    rarity: 'epic',
    category: 'cosmeticos',
    price: 15000,
    description: 'Una capa legendaria para quienes nunca dejan una misión sin terminar.',
  },
  {
    id: 'corona-dorada',
    name: 'Corona Dorada',
    icon: '👑',
    rarity: 'legendary',
    category: 'cosmeticos',
    price: 50000,
    description: 'El máximo trofeo de estatus en OLIVER SCHOOL.',
  },
  {
    id: 'anillo-sabiduria',
    name: 'Anillo de Sabiduría',
    icon: '💍',
    rarity: 'rare',
    category: 'cosmeticos',
    price: 6000,
    description: 'Un anillo encantado que se siente distinto cada vez que se forja.',
    stats: randomStat('Sabiduría', 5, 25),
  },
  {
    id: 'bufanda-arcana',
    name: 'Bufanda Arcana',
    icon: '🧣',
    rarity: 'common',
    category: 'cosmeticos',
    price: 1800,
    description: 'Tejida con hilos mágicos que cambian de potencia en cada lote.',
    stats: randomStat('Calidez', 1, 15),
  },
  {
    id: 'escudo-runico',
    name: 'Escudo Rúnico',
    icon: '🛡️',
    rarity: 'epic',
    category: 'cosmeticos',
    price: 22000,
    description: 'Cada escudo sale de la forja con runas de defensa distintas.',
    stats: randomStat('Defensa', 10, 40),
  },
  {
    id: 'alas-fenix',
    name: 'Alas de Fénix',
    icon: '🪽',
    rarity: 'legendary',
    category: 'cosmeticos',
    price: 65000,
    description: 'Alas ardientes con una intensidad que varía en cada renacimiento.',
    stats: randomStat('Velocidad', 15, 50),
  },
  {
    id: 'amuleto-fortuna',
    name: 'Amuleto de la Fortuna',
    icon: '🍀',
    rarity: 'rare',
    category: 'cosmeticos',
    price: 7500,
    description: 'Un amuleto cuya suerte se determina en el momento de su creación.',
    stats: randomStat('Fortuna', 1, 30, '%'),
  },
  {
    id: 'libro',
    name: 'Libro de Conocimiento',
    icon: '📖',
    rarity: 'rare',
    category: 'objetos',
    price: 3000,
    description: 'Ábrelo para consultar información importante de OLIVER SCHOOL en cualquier momento.',
    interactive: true,
    kind: 'book-popup',
  },
  {
    id: 'tema-claro',
    name: 'Cristal de Luz',
    icon: '💎',
    rarity: 'epic',
    category: 'objetos',
    price: 18000,
    description: 'Activa un tema claro para toda la plataforma.',
    interactive: true,
    kind: 'light-theme',
  },
  {
    id: 'radio',
    name: 'Radio de OLIVER SCHOOL',
    icon: '📻',
    rarity: 'rare',
    category: 'objetos',
    price: 5000,
    description: 'Sintoniza la radio del programa mientras estudias.',
    interactive: true,
    kind: 'radio-player',
    audioSrc: '/audio/radio-oliver.mp3',
  },
  {
    id: 'prompt-tutor-estricto',
    name: 'Personalidad: Tutor Estricto',
    icon: '📏',
    rarity: 'rare',
    category: 'prompts',
    price: 4000,
    description: 'Tu mascota deja de dar respuestas directas: te exige intentarlo primero y corrige con disciplina.',
    interactive: true,
    kind: 'ai-prompt',
    promptText: 'Eres un tutor estricto y exigente. Nunca dés la respuesta directa de un ejercicio o quiz a la primera: pide al estudiante que lo intente primero, señala con precisión sus errores y exige que corrija antes de avanzar. Mantén un tono firme pero respetuoso, nunca grosero.',
  },
  {
    id: 'prompt-coach-motivador',
    name: 'Personalidad: Coach Motivador',
    icon: '📣',
    rarity: 'rare',
    category: 'prompts',
    price: 4000,
    description: 'Tu mascota se vuelve un entrenador personal: celebra cada avance y te empuja a seguir.',
    interactive: true,
    kind: 'ai-prompt',
    promptText: 'Eres un coach motivador y enérgico. Celebra cada logro del estudiante, usa frases de ánimo y emojis con moderación, y siempre cierra tus respuestas invitándolo a dar el siguiente paso. Si el estudiante se equivoca, anímalo a intentarlo de nuevo en lugar de señalar el error de forma negativa.',
  },
  {
    id: 'prompt-modo-examen',
    name: 'Personalidad: Modo Examen',
    icon: '📝',
    rarity: 'epic',
    category: 'prompts',
    price: 9000,
    description: 'Tu mascota se comporta como un evaluador: hace preguntas de repaso y evalúa tus respuestas.',
    interactive: true,
    kind: 'ai-prompt',
    promptText: 'Te comportas como un evaluador en "modo examen". En vez de explicar temas directamente, haz preguntas cortas de repaso sobre el contenido del curso/clase actual, evalúa la respuesta del estudiante (correcto/incorrecto y por qué) y lleva un conteo informal de aciertos durante la conversación. Solo explica un tema a fondo si el estudiante lo pide explícitamente.',
  },
  {
    id: 'prompt-explicador-simple',
    name: 'Personalidad: Explicador Simple',
    icon: '🧸',
    rarity: 'common',
    category: 'prompts',
    price: 2500,
    description: 'Tu mascota explica todo como si fuera para principiantes totales, con analogías sencillas.',
    interactive: true,
    kind: 'ai-prompt',
    promptText: 'Explica absolutamente todo como si el estudiante nunca hubiera escuchado el tema antes. Usa analogías cotidianas y sencillas, evita jerga técnica (o explícala apenas la uses), y divide explicaciones largas en pasos numerados cortos.',
  },
]

export function getShopItemById(id) {
  return SHOP_ITEMS.find((i) => i.id === id)
}

export { ITEM_RARITY }
