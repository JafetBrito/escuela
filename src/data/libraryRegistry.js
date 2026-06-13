// Catálogo de la Biblioteca. Cada libro es un archivo .epub colocado en
// public/epub/, organizado por la misma categoría usada en el Dashboard
// (ver src/data/categoryMeta.js). Para agregar un libro:
//   1. Copia el archivo .epub a public/epub/
//   2. Agrega una entrada aquí con su "file" apuntando a "/epub/tu-archivo.epub"
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
    file: null,
  },
  {
    id: 'ingles-basico',
    title: 'Vocabulario técnico en inglés',
    author: 'Oliver School',
    category: 'Idiomas',
    icon: '🗣️',
    color: '#38bdf8',
    description: 'Palabras y frases en inglés frecuentes en tecnología.',
    file: null,
  },
  {
    id: 'logica-de-programacion',
    title: 'Lógica de programación paso a paso',
    author: 'Oliver School',
    category: 'Programación',
    icon: '💻',
    color: '#fb923c',
    description: 'Introducción a resolver problemas pensando como programador.',
    file: null,
  },
]

export function getBookById(id) {
  return LIBRARY_BOOKS.find((b) => b.id === id)
}
