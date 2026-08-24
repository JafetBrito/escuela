// Identidad visual por idioma para la portada de la Academia de Idiomas —
// separado de languageAcademyRegistry.js (que es lógica de qué se puede
// enseñar) porque esto es puramente estético.
//
// `flag`: bandera real solo para idiomas con un país/bandera clara asociada.
// `vibe`: un segundo emoji evocador de la cultura (comida, arte, símbolo
// conocido) — a propósito NO se inventó uno por cada lengua indígena, sería
// adivinar/reducir culturas que no conocemos a un solo emoji; para esas se
// usa 🪶 (la misma pluma que ya usaba el registro por categoría) en las dos
// posiciones, diferenciadas solo por color.
// `color`: acento hex para el borde/glow de la tarjeta.
export const LANGUAGE_VISUALS = {
  es: { flag: '🇪🇸', vibe: '💃', color: '#f59e0b' },
  en: { flag: '🇬🇧', vibe: '☕', color: '#3b82f6' },
  fr: { flag: '🇫🇷', vibe: '🥐', color: '#6366f1' },
  it: { flag: '🇮🇹', vibe: '🍝', color: '#22c55e' },
  zh: { flag: '🇨🇳', vibe: '🐉', color: '#ef4444' },
  ca: { flag: '🎨', vibe: '☀️', color: '#eab308' },
  de: { flag: '🇩🇪', vibe: '🍺', color: '#f59e0b' },
  ja: { flag: '🇯🇵', vibe: '🌸', color: '#ec4899' },
  hi: { flag: '🇮🇳', vibe: '🪷', color: '#f97316' },

  nah: { flag: '🪶', vibe: '🪶', color: '#a16207' },
  yua: { flag: '🪶', vibe: '🪶', color: '#0891b2' },
  tzh: { flag: '🪶', vibe: '🪶', color: '#16a34a' },
  tzo: { flag: '🪶', vibe: '🪶', color: '#9333ea' },
  mix: { flag: '🪶', vibe: '🪶', color: '#dc2626' },

  nv: { flag: '🪶', vibe: '🪶', color: '#b45309' },
  yup: { flag: '🪶', vibe: '🪶', color: '#0284c7' },
  dak: { flag: '🪶', vibe: '🪶', color: '#65a30d' },
  apa: { flag: '🪶', vibe: '🪶', color: '#c2410c' },
  kee: { flag: '🪶', vibe: '🪶', color: '#7c3aed' },

  cr: { flag: '🪶', vibe: '🪶', color: '#0d9488' },
  iu: { flag: '🪶', vibe: '🪶', color: '#0369a1' },
  oj: { flag: '🪶', vibe: '🪶', color: '#15803d' },
  ojc: { flag: '🪶', vibe: '🪶', color: '#a21caf' },
  den: { flag: '🪶', vibe: '🪶', color: '#b91c1c' },
}

export function getLanguageVisual(l2) {
  return LANGUAGE_VISUALS[l2] ?? { flag: '🗣️', vibe: '💬', color: '#6b7280' }
}
