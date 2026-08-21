/**
 * Blogs externos embebidos dentro de la escuela — mismo espíritu que
 * LIBRARY_BOOKS: puro dato, sin lógica. Para agregar una entrada nueva
 * basta con copiar un bloque y pegarlo al final del arreglo, no hace falta
 * tocar ningún componente.
 *
 * @typedef {Object} BlogPost
 * @property {string} id - kebab-case, único.
 * @property {string} title
 * @property {string} author
 * @property {string} source - Nombre del blog/sitio de origen.
 * @property {string} url - URL completa del post.
 * @property {string} description - Resumen corto (1-2 líneas).
 * @property {string} icon - Emoji representativo.
 * @property {string} color - Color de acento (hex).
 */

/** @type {BlogPost[]} */
export const BLOG_POSTS = [
  {
    id: 'guia-ia-2026',
    title: 'La Guía Definitiva para Aprender IA desde Cero en 2026',
    author: 'Jafet Brito',
    source: 'jafetbrito.blog',
    url: 'https://jafetbrito.blog/posts/ai_2026/',
    description: 'Ruta estructurada para aprender IA desde cero: fundamentos de machine learning, modelos de lenguaje, herramientas prácticas y una mentalidad de seguridad ("Zero Trust") frente a riesgos como el prompt injection y los deepfakes.',
    icon: '🤖',
    color: '#98ca3f',
  },
]

export function getBlogPostById(id) {
  return BLOG_POSTS.find((p) => p.id === id)
}
