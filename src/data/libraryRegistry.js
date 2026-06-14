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
    title: 'Guía rápida de Oliver School',
    author: 'Oliver School',
    category: 'Pruebas',
    icon: '📘',
    color: '#2dd4bf',
    description: 'Manual de bienvenida: cómo usar la plataforma, tu mascota y tus misiones.',
    type: 'html',
    file: 'inline',
    content: [
      {
        title: '¿Qué es OLIVER SCHOOL?',
        text: 'Una plataforma de cursos interactivos acompañada por una mascota virtual que te ayuda a aprender, te da misiones y te recompensa con monedas.',
      },
      {
        title: 'Monedas',
        text: 'Ganas oro, plata y cobre completando misiones (quizzes, chats y desbloqueando objetos). 100 cobre = 1 plata, 100 plata = 1 oro. Gástalas en la Tienda o en la Biblioteca.',
      },
      {
        title: 'Objetos',
        text: 'Algunos objetos son funcionales: actívalos desde "Objetos" en Mi mascota para desbloquear efectos como temas, cámara o un lector exprés de clases.',
      },
      {
        title: 'Biblioteca',
        text: 'Encuentra libros por categoría. Algunos están sellados hasta que los compras con tus monedas. Puedes abrirlos en este mismo pop-up desde la Biblioteca o desde "Libros" en el menú de tu mascota, sin salir de donde estés.',
      },
      {
        title: 'Aspecto',
        text: 'Desde la pestaña Aspecto puedes cambiar la ropa y los accesorios de tu mascota sin cambiar su modelo.',
      },
      {
        title: 'Ajustes',
        text: 'En Ajustes puedes configurar tu clave de Minimax, el modelo de IA y cómo se comporta tu mascota (tono y nivel de detalle).',
      },
    ],
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
    id: 'la-odisea',
    title: 'La Odisea',
    author: 'Homero',
    category: 'Idiomas',
    icon: '🗣️',
    color: '#38bdf8',
    description: 'Clásico de la literatura griega, traducido al español. Ideal para practicar lectura.',
    type: 'epub',
    file: '/epub/la-odisea.epub',
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
    title: 'Linux Bible (2026)',
    author: 'Christopher Negus',
    category: 'Programación',
    icon: '🐧',
    color: '#fb923c',
    description: 'Guía completa de Linux: terminal, administración de sistemas y más.',
    type: 'pdf',
    file: '/pdf/linux-bible-11-2026.pdf',
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
