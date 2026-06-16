// Catálogo de la Biblioteca. Cada libro es un archivo .epub o .pdf colocado
// en public/epub/ o public/pdf/, organizado por la misma categoría usada en
// el Dashboard (ver src/data/categoryMeta.js). Para agregar un libro:
//   1. Copia el archivo a public/epub/ (.epub) o public/pdf/ (.pdf)
//   2. Agrega una entrada aquí con "file" apuntando a "/epub/tu-archivo.epub"
//      o "/pdf/tu-archivo.pdf", y "type: 'epub'" o "type: 'pdf'"
// Si "file" es null, el libro se muestra como "Próximamente".
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

export function getBookById(id) {
  return LIBRARY_BOOKS.find((b) => b.id === id)
}

// A book is purchasable once its file exists; "Próximamente" books (file:
// null) have no price and can't be bought yet.
export function isBookPurchasable(book) {
  return !!book.file && typeof book.price === 'number'
}
