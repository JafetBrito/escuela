/**
 * ============================================================================
 * 🎨 IDENTIDAD VISUAL POR CATEGORÍA (CATEGORY_META)
 * ============================================================================
 * Diccionario central de estilos. Asegura que una categoría (ej: "Diseño")
 * se vea exactamente igual (mismo icono y colores) tanto en el Roadmap del 
 * Dashboard como en el catálogo de la Biblioteca.
 * * ⚠️ ADVERTENCIA CRÍTICA SOBRE TAILWIND CSS:
 * El campo `gradient` contiene clases de utilidad completas de Tailwind CSS 
 * (ej: 'from-[#98ca3f] to-[#34d399]'). 
 * * REGLA: Nunca concatenes estas clases dinámicamente en los componentes de UI. 
 * ❌ MAL: `class={"from-[" + colorA + "] to-[" + colorB + "]"}`
 * ✅ BIEN: `class={CATEGORY_META[categoria].gradient}`
 * * Si concatenas dinámicamente, el compilador de Tailwind no detectará las 
 * clases durante el 'build' y los colores desaparecerán en producción. 
 * Esta lista estática garantiza que Tailwind compile estos gradientes.
 * ============================================================================
 */

/**
 * Esquema de propiedades visuales para una categoría.
 * @typedef {Object} CategoryStyle
 * @property {string} icon - Emoji representativo para títulos o badges.
 * @property {string} gradient - Clases completas de Tailwind para fondos degradados (ej: 'from-colorA to-colorB').
 * @property {string} accent - Color HEX sólido para bordes, textos destacados o elementos sin fondo.
 */

/** * Diccionario que mapea el nombre exacto de la categoría (Key) con sus estilos (Value).
 * @type {Record<string, CategoryStyle>} 
 */
export const CATEGORY_META = {
  'Inteligencia Artificial': { icon: '🧠', gradient: 'from-[#98ca3f] to-[#34d399]', accent: '#98ca3f' },
  Productividad: { icon: '⚡', gradient: 'from-[#fbbf24] to-[#f97316]', accent: '#fbbf24' },
  Diseño: { icon: '🎨', gradient: 'from-[#f472b6] to-[#a78bfa]', accent: '#f472b6' },
  Idiomas: { icon: '🗣️', gradient: 'from-[#38bdf8] to-[#60a5fa]', accent: '#38bdf8' },
  Programación: { icon: '💻', gradient: 'from-[#fb923c] to-[#facc15]', accent: '#fb923c' },
  Guias: { icon: '❤️', gradient: 'from-[#fb923c] to-[#facc15]', accent: '#ad1111' },
  Filosofía: { icon: '🏛️', gradient: 'from-[#eab308] to-[#f97316]', accent: '#eab308' },
  Pruebas: { icon: '🧪', gradient: 'from-[#2dd4bf] to-[#60a5fa]', accent: '#2dd4bf' },
  Otros: { icon: '📚', gradient: 'from-[#94a3b8] to-[#64748b]', accent: '#94a3b8' },
}

/**
 * Recupera los estilos visuales de una categoría.
 * Sistema de seguridad: Si se pasa una categoría que no existe en el diccionario,
 * devolverá automáticamente los estilos neutrales de la categoría "Otros" para evitar
 * que la interfaz se rompa por falta de colores o iconos.
 * * @param {string} category - El nombre exacto de la categoría (ej: 'Productividad').
 * @returns {CategoryStyle} El objeto con las propiedades icon, gradient y accent.
 */
export function getCategoryMeta(category) {
  return CATEGORY_META[category] ?? CATEGORY_META.Otros
}