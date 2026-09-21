// Traduce el CONTENIDO y la INTERFAZ de la plataforma (lecciones, glosario, juegos,
// tienda, misiones y también textos de componentes .jsx: src/data, stores, lib,
// services y components) del
// español a otro idioma usando la API de Claude, y guarda el resultado en
// src/data/i18n/<idioma>/<archivo>.json. El plugin de Vite y el runtime hacen el
// resto: en ese idioma el sitio muestra la traducción, sin tocar ningún archivo de datos.
//
// Requiere:  ANTHROPIC_API_KEY en el entorno (nunca se guarda ni se imprime).
//
//   node scripts/translate-data.mjs --status          # cuánto está traducido, por archivo
//   node scripts/translate-data.mjs --dry             # cuántas cadenas/caracteres faltan
//   node scripts/translate-data.mjs --limit 30        # prueba pequeña (traduce solo 30)
//   node scripts/translate-data.mjs                   # traduce todo lo que falte (se puede reanudar)
//   node scripts/translate-data.mjs --only courseMedicina --lang en
//
// Opciones: --lang en | --model claude-sonnet-5 | --concurrency 3 | --only <texto del nombre de archivo>
// Es incremental: lo ya traducido no se vuelve a pedir; puedes cortarlo y reanudarlo.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { basename, join } from 'node:path'
import { CONFIG, DICT_DIR, collectStrings, listDataFiles, hashText, loadDictionary } from './i18n-data/shared.mjs'

const args = process.argv.slice(2)
const opt = (name, def) => (args.includes(name) ? args[args.indexOf(name) + 1] : def)
const flag = (name) => args.includes(name)

const LANG = opt('--lang', 'en')
const MODEL = opt('--model', 'claude-sonnet-5')
const CONCURRENCY = Number(opt('--concurrency', 3))
const LIMIT = Number(opt('--limit', 0)) || Infinity
const ONLY = opt('--only', '')
const LANG_NAMES = { en: 'English', fr: 'French', it: 'Italian', de: 'German', pt: 'Portuguese' }
const BATCH_CHARS = 9000
const BATCH_ITEMS = 25

// ── 1. Reunir las cadenas por archivo ───────────────────────────────────────
const files = listDataFiles().filter((f) => !ONLY || f.includes(ONLY))
const dict = loadDictionary(LANG)
const byFile = new Map() // archivo → Map(hash → texto)
const seen = new Set()
for (const f of files) {
  let found
  try { found = collectStrings(readFileSync(f, 'utf8'), f) } catch (e) { console.warn(`  (se omite ${f}: no se pudo analizar — ${e.message.split('\n')[0]})`); continue }
  const m = new Map()
  for (const { value } of found) {
    const h = hashText(value)
    if (seen.has(h)) continue // ya asignada a otro archivo: se guarda una sola vez
    seen.add(h)
    m.set(h, value)
  }
  if (m.size) byFile.set(f, m)
}

const total = [...byFile.values()].reduce((n, m) => n + m.size, 0)
const pending = []
for (const [f, m] of byFile) for (const [h, text] of m) if (!(h in dict)) pending.push({ file: f, hash: h, text })
const chars = pending.reduce((n, p) => n + p.text.length, 0)

if (flag('--status')) {
  console.log(`\nIdioma: ${LANG} — ${total - pending.length} de ${total} cadenas traducidas (${total ? Math.round(((total - pending.length) / total) * 100) : 0} %)\n`)
  const rows = [...byFile].map(([f, m]) => { const done = [...m.keys()].filter((h) => h in dict).length; return [f, done, m.size] })
  rows.sort((a, b) => (b[2] - b[1]) - (a[2] - a[1]))
  for (const [f, d, n] of rows.slice(0, 40)) console.log(`${String(n - d).padStart(6)} pendientes  ${String(d).padStart(5)}/${String(n).padEnd(5)} ${f}`)
  process.exit(0)
}

console.log(`\n${total} cadenas en ${byFile.size} archivos · ${pending.length} pendientes en ${LANG_NAMES[LANG] ?? LANG} (${(chars / 1000).toFixed(0)}k caracteres ≈ ${Math.round(chars / 3.5 / 1000)}k tokens de entrada y otros tantos de salida)`)
if (flag('--dry') || pending.length === 0) process.exit(0)

const KEY = process.env.ANTHROPIC_API_KEY
if (!KEY) { console.error('\nFalta ANTHROPIC_API_KEY en el entorno. Ejemplo (PowerShell):  $env:ANTHROPIC_API_KEY="sk-ant-…"; node scripts/translate-data.mjs'); process.exit(1) }

// ── 2. Traducir por lotes ───────────────────────────────────────────────────
const SYSTEM = `You are a professional translator for an educational platform (courses, quizzes, glossary, game text, shop items). Translate each Spanish string into natural, fluent ${LANG_NAMES[LANG] ?? LANG}.
Rules:
- Keep ALL HTML tags, attributes, entities, markdown, emoji, line breaks and {placeholders} exactly as they are; translate only the human-readable text between them.
- Do not translate code, code blocks, identifiers, URLs, file names or command-line syntax. Keep proper nouns (people, places, brands) unless they have a standard translation.
- Keep the tone (friendly, educational; second person "tú" becomes "you").
- Return ONLY a JSON array of strings, the same length and order as the input. No commentary, no code fences.`

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const tagCount = (s) => (s.match(/</g) ?? []).length

async function callClaude(items, attempt = 0) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'x-api-key': KEY, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
    body: JSON.stringify({ model: MODEL, max_tokens: 16000, system: SYSTEM, messages: [{ role: 'user', content: JSON.stringify(items) }] }),
  })
  if ((res.status === 429 || res.status >= 500) && attempt < 5) { await sleep(2000 * 2 ** attempt); return callClaude(items, attempt + 1) }
  if (!res.ok) throw new Error(`API ${res.status}: ${(await res.text()).slice(0, 200)}`)
  const data = await res.json()
  if (data.stop_reason === 'max_tokens') throw new Error('respuesta cortada (max_tokens)')
  const text = (data.content ?? []).map((c) => c.text ?? '').join('').trim().replace(/^```(?:json)?\s*|\s*```$/g, '')
  const out = JSON.parse(text)
  if (!Array.isArray(out) || out.length !== items.length || out.some((s) => typeof s !== 'string')) throw new Error('formato inesperado')
  return out
}

const dictPath = (f) => join(DICT_DIR, LANG, basename(f).replace(/\.(m?jsx?)$/, '.json'))
const cache = new Map() // ruta del .json → { p, data } (archivos con el mismo nombre comparten .json)
function store(file, hash, text) {
  const p = dictPath(file)
  if (!cache.has(p)) cache.set(p, { p, data: existsSync(p) ? JSON.parse(readFileSync(p, 'utf8')) : {} })
  const c = cache.get(p)
  c.data[hash] = text
  mkdirSync(join(DICT_DIR, LANG), { recursive: true })
  writeFileSync(c.p, JSON.stringify(c.data) + '\n')
}

// lotes: por caracteres y por cantidad; una cadena muy larga va sola
const queue = pending.slice(0, LIMIT)
const batches = []
let cur = [], curChars = 0
for (const item of queue) {
  if (cur.length && (curChars + item.text.length > BATCH_CHARS || cur.length >= BATCH_ITEMS)) { batches.push(cur); cur = []; curChars = 0 }
  cur.push(item); curChars += item.text.length
}
if (cur.length) batches.push(cur)

let done = 0, failed = 0
async function runBatch(batch) {
  try {
    const out = await callClaude(batch.map((b) => b.text))
    batch.forEach((b, i) => {
      if (tagCount(out[i]) !== tagCount(b.text)) { failed++; console.warn(`  ⚠ etiquetas HTML distintas, se omite: ${b.text.slice(0, 50).replace(/\n/g, ' ')}…`); return }
      store(b.file, b.hash, out[i]); done++
    })
  } catch (e) {
    if (batch.length > 1) { for (const b of batch) await runBatch([b]) } // reintenta uno por uno
    else { failed++; console.warn(`  ✗ ${e.message}: ${batch[0].text.slice(0, 50).replace(/\n/g, ' ')}…`) }
  }
  process.stdout.write(`\r  traducidas ${done}/${queue.length}  (fallidas ${failed})   `)
}

console.log(`Traduciendo ${queue.length} cadenas en ${batches.length} lotes con ${MODEL}…`)
let next = 0
await Promise.all(Array.from({ length: CONCURRENCY }, async () => { while (next < batches.length) await runBatch(batches[next++]) }))
console.log(`\n\nListo: ${done} traducidas, ${failed} omitidas. Archivos en ${DICT_DIR}/${LANG}/. Revisa el resultado, corre \`npm run build\` y prueba el sitio con ?lang=${LANG}.`)
