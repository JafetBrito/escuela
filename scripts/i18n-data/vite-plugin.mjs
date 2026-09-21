import MagicString from 'magic-string'
import { collectStrings, isDataFile, hashText, allTranslatedHashes } from './shared.mjs'

// Plugin de Vite: en los archivos de datos (src/data, stores, lib, services)
// envuelve cada cadena en español que YA tenga traducción en
// src/data/i18n/<idioma>/*.json como __t('<hash>', 'texto original').
// En español __t devuelve el original (costo ~cero); en otro idioma devuelve la
// traducción, que carga src/i18n/data-runtime.js antes de arrancar la app.
// Sin diccionarios el plugin no toca nada. Los diccionarios se leen al iniciar
// vite: tras traducir más contenido, reinicia `npm run dev` (el build siempre los lee).
const RUNTIME = '/src/i18n/data-runtime.js'

export default function i18nDataPlugin() {
  let hashes = null
  return {
    name: 'oliver-i18n-data',
    enforce: 'pre',
    transform(code, id) {
      if (!isDataFile(id)) return null
      hashes ??= allTranslatedHashes()
      if (hashes.size === 0) return null
      let found
      try { found = collectStrings(code) } catch { return null } // archivo con JSX u otra sintaxis: se deja igual
      const hits = found.filter((f) => hashes.has(hashText(f.value)))
      if (hits.length === 0) return null
      const s = new MagicString(code)
      for (const h of hits) {
        s.prependLeft(h.start, `__t(${JSON.stringify(hashText(h.value))}, `)
        s.appendRight(h.end, ')')
      }
      s.prepend(`import { __t } from ${JSON.stringify(RUNTIME)};\n`)
      return { code: s.toString(), map: s.generateMap({ hires: true }) }
    },
  }
}
