import { marked } from 'marked'

// Único punto de renderizado de Markdown → HTML de toda la app (entregas de
// tareas, mini-lecciones embebidas del admin). El HTML resultante lo escriben
// admin/alumno de este mismo sistema (nunca terceros no confiables), mismo
// nivel de confianza que TextLesson.jsx.
export function renderMarkdown(text) {
  if (!text) return ''
  return marked.parse(text)
}
