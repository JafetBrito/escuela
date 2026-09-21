// Utilidades compartidas por el plugin de Vite (vite-plugin.mjs) y el script de
// traducción (../translate-data.mjs): qué cadenas de un archivo de datos se
// traducen y cómo se identifican (hash del texto en español).
import { parseAst } from 'rollup/parseAst'
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs'
import { join, basename, sep } from 'node:path'

export const CONFIG = JSON.parse(readFileSync(new URL('./config.json', import.meta.url), 'utf8'))
export const DICT_DIR = 'src/data/i18n'

// Hash de 53 bits (cyrb53) en hex: identifica una cadena en español sin guardarla dos veces.
export function hashText(str, seed = 0) {
  let h1 = 0xdeadbeef ^ seed
  let h2 = 0x41c6ce57 ^ seed
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i)
    h1 = Math.imul(h1 ^ ch, 2654435761)
    h2 = Math.imul(h2 ^ ch, 1597334677)
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909)
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909)
  return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(16).padStart(14, '0')
}

const STOP = /\b(el|la|los|las|de|del|que|para|con|por|una|un|tu|tus|mi|mis|es|en|se|no|más|como|si|pero|todo|todos|esta|este|estos|ya|aquí|hay|sin|sus|al|lo|le|su)\b/i
const ACCENTS = /[áéíóúñ¿¡]/i

// ¿Esta cadena parece texto en español para personas (y no un id, ruta, clase CSS…)?
export function isTranslatable(text) {
  const t = text.trim()
  if (t.length < 6) return false
  if (/^(https?:|\/|#|\.|data:|[\w.:@/-]+$)/.test(t)) return false
  if (!/[A-Za-zÁÉÍÓÚáéíóúñÑ]{3}/.test(t)) return false
  const words = t.split(/\s+/).length
  if (words < CONFIG.minWords && !ACCENTS.test(t)) return false
  return ACCENTS.test(t) || STOP.test(t)
}

const EXCLUDE_RES = (CONFIG.excludePatterns ?? []).map((r) => new RegExp(r))
const excludedName = (name) => CONFIG.excludeFiles.includes(name) || EXCLUDE_RES.some((re) => re.test(name))

const COMPARE = new Set(['===', '!==', '==', '!='])
const deny = new Set(CONFIG.denyKeys)

// Devuelve [{ start, end, value }] con las cadenas traducibles de un módulo JS.
// Se saltan las que se usan como identificadores: claves de objeto, imports,
// comparaciones, `case`, y valores bajo claves de config.denyKeys.
export function collectStrings(code) {
  const ast = parseAst(code)
  const found = []
  const stack = []
  const visit = (node, parent) => {
    if (!node || typeof node.type !== 'string') return
    stack.push(node)
    let value = null
    if (node.type === 'Literal' && typeof node.value === 'string' && !node.regex) value = node.value
    else if (node.type === 'TemplateLiteral' && node.expressions.length === 0 && node.quasis.length === 1) value = node.quasis[0].value.cooked
    if (value != null && parent && isTranslatable(value) && !skipContext(node, parent)) {
      found.push({ start: node.start, end: node.end, value })
    }
    for (const k of Object.keys(node)) {
      if (k === 'type' || k === 'start' || k === 'end') continue
      const v = node[k]
      if (Array.isArray(v)) v.forEach((c) => c && typeof c === 'object' && visit(c, node))
      else if (v && typeof v === 'object' && typeof v.type === 'string') visit(v, node)
    }
    stack.pop()
  }
  const skipContext = (node, parent) => {
    if (parent.type === 'ImportDeclaration' || parent.type === 'ExportAllDeclaration' || parent.type === 'ImportExpression') return true
    if (parent.type === 'ExportNamedDeclaration' && parent.source === node) return true
    if (parent.type === 'Property' && parent.key === node && !parent.computed) return true
    if (parent.type === 'BinaryExpression' && COMPARE.has(parent.operator)) return true
    if (parent.type === 'SwitchCase' && parent.test === node) return true
    if (parent.type === 'MemberExpression' && parent.property === node && parent.computed) return true
    if (parent.type === 'TaggedTemplateExpression') return true
    if (parent.type === 'ExpressionStatement' && parent.directive) return true
    // valor (o elemento de un arreglo) bajo una clave prohibida: { category: 'Matemáticas' }
    for (let i = stack.length - 2; i >= 0; i--) {
      const a = stack[i]
      if (a.type === 'ArrayExpression') continue
      if (a.type === 'Property' && !a.computed && a.key && (a.key.name ?? a.key.value) && deny.has(a.key.name ?? a.key.value)) return true
      break
    }
    return false
  }
  visit(ast, null)
  return found
}

// Archivos que se procesan (rutas relativas a la raíz del proyecto, con /).
export function listDataFiles(root = '.') {
  const out = []
  const walk = (dir) => {
    for (const name of readdirSync(dir)) {
      const p = join(dir, name)
      if (statSync(p).isDirectory()) { if (!CONFIG.excludeDirs.includes(name)) walk(p) }
      else if (/\.(m?js)$/.test(name) && !excludedName(name)) out.push(p.split(sep).join('/'))
    }
  }
  for (const r of CONFIG.roots) if (existsSync(join(root, r))) walk(join(root, r))
  return out
}

export function isDataFile(id) {
  const p = id.split(sep).join('/').split('?')[0]
  const rel = p.includes('/src/') ? 'src/' + p.split('/src/').pop() : p
  if (!CONFIG.roots.some((r) => rel.startsWith(r + '/'))) return false
  if (!/\.(m?js)$/.test(rel)) return false
  const parts = rel.split('/')
  if (parts.some((d) => CONFIG.excludeDirs.includes(d))) return false
  return !excludedName(basename(rel))
}

// Diccionarios de un idioma: { [hash]: 'texto traducido' } fusionados desde src/data/i18n/<lang>/*.json.
export function loadDictionary(lang) {
  const dir = join(DICT_DIR, lang)
  const all = {}
  if (!existsSync(dir)) return all
  for (const f of readdirSync(dir)) if (f.endsWith('.json')) Object.assign(all, JSON.parse(readFileSync(join(dir, f), 'utf8')))
  return all
}

// Todos los hashes con traducción en CUALQUIER idioma (los que el plugin envuelve).
export function allTranslatedHashes() {
  const set = new Set()
  if (!existsSync(DICT_DIR)) return set
  for (const lang of readdirSync(DICT_DIR)) {
    const dir = join(DICT_DIR, lang)
    if (!statSync(dir).isDirectory()) continue
    for (const f of readdirSync(dir)) if (f.endsWith('.json')) for (const h of Object.keys(JSON.parse(readFileSync(join(dir, f), 'utf8')))) set.add(h)
  }
  return set
}
