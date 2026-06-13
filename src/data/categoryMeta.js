// Visual identity per category, shared by the Dashboard roadmap and the
// Biblioteca so both use the same colors/icons for the same categories.
export const CATEGORY_META = {
  'Inteligencia Artificial': { icon: '🧠', gradient: 'from-[#98ca3f] to-[#34d399]', accent: '#98ca3f' },
  Productividad: { icon: '⚡', gradient: 'from-[#fbbf24] to-[#f97316]', accent: '#fbbf24' },
  Diseño: { icon: '🎨', gradient: 'from-[#f472b6] to-[#a78bfa]', accent: '#f472b6' },
  Idiomas: { icon: '🗣️', gradient: 'from-[#38bdf8] to-[#60a5fa]', accent: '#38bdf8' },
  Programación: { icon: '💻', gradient: 'from-[#fb923c] to-[#facc15]', accent: '#fb923c' },
  Pruebas: { icon: '🧪', gradient: 'from-[#2dd4bf] to-[#60a5fa]', accent: '#2dd4bf' },
  Otros: { icon: '📚', gradient: 'from-[#94a3b8] to-[#64748b]', accent: '#94a3b8' },
}

export function getCategoryMeta(category) {
  return CATEGORY_META[category] ?? CATEGORY_META.Otros
}
