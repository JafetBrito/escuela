// Auditoría de traducción: cuenta el texto en español que sigue escrito a mano
// dentro de src/ (fuera de t('clave')). Uso:  node scripts/i18n-audit.mjs [--top 30] [--files]
// Es una heurística (palabras españolas frecuentes + acentos/ñ/¿/¡ en literales
// y texto JSX), no un parser: sirve para medir el avance, no para exactitud.
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

const ROOT = 'src'
const SKIP_DIRS = new Set(['locales'])            // los diccionarios son la traducción misma
const SKIP_FILES = /(courses\.json|courseRegistry|Translations\.js|categoryTranslations)/
const SPANISH = /\b(el|la|los|las|de|del|que|para|con|por|una|un|tu|tus|mi|mis|es|en|se|no|más|como|si|pero|todo|todos|esta|este|estos|ya|aquí|hay|sin|sus|al)\b/i
const ACCENTS = /[áéíóúñ¿¡]/i

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name)
    if (statSync(p).isDirectory()) { if (!SKIP_DIRS.has(name)) walk(p, out) }
    else if (/\.(jsx?|tsx?)$/.test(name) && !SKIP_FILES.test(p)) out.push(p)
  }
  return out
}

// Extrae candidatos: literales entre comillas y texto entre > y < en JSX.
function candidates(line) {
  const res = []
  for (const m of line.matchAll(/(['"`])((?:\\.|(?!\1).){4,}?)\1/g)) res.push(m[2])
  for (const m of line.matchAll(/>([^<>{}=]{4,})</g)) res.push(m[1])
  return res
}

function isSpanish(text) {
  const t = text.trim()
  if (t.length < 4 || /^(https?:|\/|#|\.|[a-z0-9_.:-]+$|[A-Z_]+$)/.test(t)) return false
  if (/^[\w.]+\.[\w.]+$/.test(t)) return false // claves i18n 'a.b.c'
  const words = t.split(/\s+/)
  if (words.length < 2 && !ACCENTS.test(t)) return false
  return ACCENTS.test(t) || (words.length >= 2 && SPANISH.test(t))
}

const args = process.argv.slice(2)
const top = Number(args[args.indexOf('--top') + 1]) || 25
const rows = []
let total = 0
const dump = args.includes('--dump') ? args[args.indexOf('--dump') + 1] : null // muestra las cadenas de un archivo

for (const file of walk(ROOT)) {
  const lines = readFileSync(file, 'utf8').split('\n')
  let n = 0
  lines.forEach((line) => {
    const l = line.trim()
    if (l.startsWith('//') || l.startsWith('*') || l.startsWith('/*') || l.startsWith('{/*')) return
    const clean = line
      .replace(/\bt\(\s*['"`][^'"`]+['"`]/g, '')                                                            // t('clave')
      .replace(/\btr\(\s*(['"`])(?:\\.|(?!\1).)*\1\s*,\s*(['"`])(?:\\.|(?!\2).)*\2\s*\)/g, '')            // tr('es', 'en') ya traducido
    for (const c of candidates(clean)) if (isSpanish(c)) { n++; if (dump && file.split('\\').join('/').endsWith(dump)) console.log(JSON.stringify(c.trim())) }
  })
  if (n) { rows.push([relative('.', file), n]); total += n }
}

rows.sort((a, b) => b[1] - a[1])
console.log(`\nTexto en español sin traducir (aprox.): ${total} cadenas en ${rows.length} archivos\n`)
for (const [f, n] of rows.slice(0, top)) console.log(String(n).padStart(5), f)
if (args.includes('--files')) console.log('\n' + rows.map(([f, n]) => `${n}\t${f}`).join('\n'))
