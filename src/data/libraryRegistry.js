/**
 * ============================================================================
 * 📚 CATÁLOGO PRINCIPAL DE LA BIBLIOTECA (LIBRARY_BOOKS)
 * ============================================================================
 * ¡ALTO AHÍ! Si vas a agregar un libro nuevo a la plataforma, lee esto primero.
 * Esta es la fuente de la verdad para todos los libros, PDFs y EPUBs de oliver.escuela.
 * 
 * 🛠️ GUÍA PASO A PASO PARA AGREGAR UN LIBRO:
 * 
 * PASO 1: Sube el archivo físico
 *   - Toma tu archivo `.epub` o `.pdf`.
 *   - Pégalo exactamente dentro de la carpeta `public/epub/` o `public/pdf/`.
 * 
 * PASO 2: Crea el registro aquí abajo
 *   - Copia uno de los bloques existentes y pégalo al final del arreglo.
 *   - Llena los datos. OJO con el campo `file`, aquí todos se equivocan:
 *     ✅ BIEN: file: '/epub/mi-libro.epub' (Astro quita el "public" en producción).
 *     ❌ MAL:  file: 'public/epub/mi-libro.epub' (Esto romperá la descarga).
 * 
 * PASO 3: Define el estado de venta del libro
 *   - ¿Es un "Próximamente"?: Pon `file: null`. No importa si tiene precio, la plataforma lo bloqueará.
 *   - ¿Es de paga?: Asegúrate de que `file` tenga la ruta correcta Y agrega `price: 30000` (valor numérico).
 *   - ¿Es gratis?: Simplemente omite el atributo `price` o asegúrate de que no exista.
 * ============================================================================
 */

/**
 * Definición del esquema de un Libro para que el editor te de autocompletado.
 * @typedef {Object} Book
 * @property {string} id - Identificador único en kebab-case (ej: 'guia-oliver-school').
 * @property {string} title - Título visible del libro.
 * @property {string} author - Autor del libro (ej: 'Oliver School' o 'Jafet Brito').
 * @property {string} category - Categoría exacta usada en el Dashboard (ver src/data/categoryMeta.js).
 * @property {string} icon - Emoji representativo para la UI.
 * @property {string} color - Código HEX para el color de fondo/acento de la tarjeta.
 * @property {string} description - Resumen corto (máximo 2 líneas recomendado).
 * @property {'epub'|'pdf'} type - Formato del archivo.
 * @property {string|null} file - Ruta al archivo empezando con / (ej: '/pdf/archivo.pdf'). Null = Próximamente.
 * @property {number} [price] - (Opcional) Precio en centavos o moneda base. Si no está, el libro no se vende.
 */

/** @type {Book[]} */
export const LIBRARY_BOOKS = [
  {
    id: 'guia-oliver-school',
    title: 'Guía de Oliver School',
    author: 'Oliver School',
    category: 'Guias',
    icon: '🐈',
    color: '#ff4111',
    description: 'Manual de bienvenida: cómo usar la plataforma, tu mascota y tus misiones.',
    type: 'epub',
    file: '/epub/guia-oliver-school-espanol.epub',
  },
  {
    id: 'guia-de-cyberseguridad-2026',
    title: 'Guía de Cyberseguridad 2026',
    author: 'Jafet Brito',
    category: 'Guias',
    icon: '❤️',
    color: '#06a013',
    description: 'La guia que necesitas para navegar seguro por internet',
    type: 'epub',
    file: null,
  },
  {
    id: 'notebooklm-basico',
    title: 'NotebookLM para principiantes',
    author: 'Oliver School',
    category: 'Inteligencia Artificial',
    icon: '🧠',
    color: '#98ca3f',
    description: 'Lecturas complementarias del curso de NotebookLM.',
    type: 'epub',
    file: null,
  },
  {
    id: 'prompts=principiantes',
    title: 'Prompts para principiantes',
    author: 'Jafet Brito',
    category: 'Inteligencia Artificial',
    icon: '🧠',
    color: '#98ca3f',
    description: 'El mejor libro para dominar prompt Engeneering',
    type: 'epub',
    file: null,
    price: 30000,
  },
  {
    id: 'habitos-de-estudio',
    title: 'Hábitos de estudio efectivos',
    author: 'Oliver School',
    category: 'Productividad',
    icon: '⚡',
    color: '#fbbf24',
    description: 'Técnicas para organizar tu tiempo y mantener la constancia.',
    type: 'epub',
    file: null,
  },
  {
    id: 'fundamentos-diseno',
    title: 'Fundamentos de diseño visual',
    author: 'Oliver School',
    category: 'Diseño',
    icon: '🎨',
    color: '#f472b6',
    description: 'Color, tipografía y composición explicados de forma simple.',
    type: 'epub',
    file: null,
  },
  {
    id: 'ingles-1',
    title: 'Ingles para principiantes',
    author: 'Jafet Brito',
    category: 'Idiomas',
    icon: '🗣️',
    color: '#38bdf8',
    description: 'Mis mas honestos consejos para que aprendas el idioma',
    type: 'epub',
    file: null,
    price: 2000,
  },
  {
    id: 'catalan-1',
    title: 'Catalan para principiantes',
    author: 'Jafet Brito',
    category: 'Idiomas',
    icon: '🗣️',
    color: '#38bdf8',
    description: 'Mis mas honestos consejos para que aprendas el idioma',
    type: 'epub',
    file: null,
    price: 2000,
  },
  {
    id: 'logica-de-programacion',
    title: 'Lógica de programación paso a paso',
    author: 'Oliver School',
    category: 'Programación',
    icon: '💻',
    color: '#fb923c',
    description: 'Introducción a resolver problemas pensando como programador.',
    type: 'epub',
    file: null,
  },
  {
    id: 'linux-bible',
    title: 'Linux meowster (2026)',
    author: 'Oliver The Hacker CAT',
    category: 'Programación',
    icon: '🐧',
    color: '#fb923c',
    description: 'Guía completa de Linux: terminal, administración de sistemas + maullido.',
    type: 'pdf',
    file: null,
    price: 8000,
  },
]

/**
 * Busca un libro específico dentro del catálogo.
 * 
 * @param {string} id - El identificador único del libro (ej: 'linux-bible').
 * @returns {Book | undefined} El objeto del libro encontrado o undefined si no existe.
 */
export function getBookById(id) {
  return LIBRARY_BOOKS.find((b) => b.id === id)
}

/**
 * Evalúa si un libro cumple con las reglas de negocio para poder ser comprado.
 * Regla: El archivo físico debe existir (file !== null) Y debe tener un precio asignado.
 * 
 * @param {Book} book - El objeto completo del libro a evaluar.
 * @returns {boolean} True si está listo para la venta, False si es "Próximamente" o no tiene precio.
 */
export function isBookPurchasable(book) {
  return !!book.file && typeof book.price === 'number'
}