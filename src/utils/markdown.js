import { marked } from 'marked'
import DOMPurify from 'dompurify'

// Único punto de renderizado de Markdown → HTML de toda la app (entregas de
// tareas, mini-lecciones embebidas del admin). Las entregas las escribe el
// ALUMNO y las lee el profesor/admin, así que el HTML se sanea (DOMPurify)
// antes de inyectarse: sin esto un <img onerror> en una entrega ejecutaría
// script en la sesión de quien la revisa.
export function renderMarkdown(text) {
  if (!text) return ''
  return DOMPurify.sanitize(marked.parse(text))
}
