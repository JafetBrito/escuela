// Traducciones del CONTENIDO (lecciones, preguntas, glosario, tienda…). El plugin
// de Vite (scripts/i18n-data/vite-plugin.mjs) envuelve las cadenas ya traducidas
// como __t(hash, español); aquí se resuelven. El diccionario del idioma se carga
// ANTES de que se evalúe cualquier módulo de datos (ver main.jsx).
let dict = {}

export const __t = (hash, es) => dict[hash] ?? es

export async function loadDataDictionary(lang) {
  if (lang === 'es') return
  // Un .json por archivo de origen y por idioma: src/data/i18n/<lang>/<archivo>.json
  const modules = import.meta.glob('../data/i18n/*/*.json')
  const wanted = Object.entries(modules).filter(([path]) => path.includes(`/i18n/${lang}/`))
  if (wanted.length === 0) return
  const parts = await Promise.all(wanted.map(([, load]) => load().then((m) => m.default)))
  dict = Object.assign({}, ...parts)
}
